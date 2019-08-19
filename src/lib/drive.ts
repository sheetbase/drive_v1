import { AddonRoutesOptions, RoutingErrors, RouteRequest, RouteHandler } from '@sheetbase/server';
import { md5 } from '../md5/md5';

import {
  Options,
  Intergration,
  UploadResource,
  FileInfo,
  RenamePolicy,
  SharingConfig,
  SharingPreset,
  FileSharing,
  FileUpdateData,
} from './types';

export class DriveService {
  private options: Options;
  private errors: RoutingErrors = {
    'file/no-file': 'File not found (no VIEW permission or trashed).',
    'file/no-edit': 'No EDIT permission.',
    'file/invalid-upload-resource': 'Invalid upload resource.',
    'file/invalid-size': 'The file is too big.',
    'file/invalid-type': 'The file format is not supported.',
  };

  private req: RouteRequest = null;
  private auth: any = null;

  // for viewing the file only
  // PUBLIC: anyone
  // PRIVATE:
  // only me (the developer)
  // and the uploader (if users login with their Google email)
  private sharingPresets: {[preset: string]: SharingConfig} = {
    PUBLIC: { access: 'ANYONE_WITH_LINK', permission: 'VIEW' },
    PRIVATE: { access: 'PRIVATE', permission: 'VIEW' },
  };

  constructor(options: Options) {
    this.options = {
      maxSize: 10,
      urlBuilder: ['https://drive.google.com/uc?id='],
      ... options,
    };
  }

  setIntegration<K extends keyof Intergration, Value>(key: K, value: Value): DriveService {
    this.options[key] = value;
    return this;
  }

  setRequest(request: RouteRequest) {
    // req object
    this.req = request;
    // auth object
    const AuthToken = this.options.AuthToken;
    const idToken = !!request ? (
      request.query['idToken'] || request.body['idToken']
    ) : null;
    if (!!idToken && !!AuthToken) {
      this.auth = AuthToken.decodeIdToken(idToken);
    }
  }

  /**
   * routes
   */

  registerRoutes(options: AddonRoutesOptions): void {
    const {
      router,
      endpoint = 'storage',
      disabledRoutes = [
        'post:/' + endpoint,
        'put:/' + endpoint,
        'delete:/' + endpoint,
      ],
      middlewares = [(req, res, next) => next()] as RouteHandler[],
    } = options;

    // register errors & disabled routes
    router.setDisabled(disabledRoutes);
    router.setErrors(this.errors);

    // register request for security
    middlewares.push((req, res, next) => {
      this.setRequest(req);
      return next();
    });

    // get file information
    router.get('/' + endpoint, ... middlewares, (req, res) => {
      const { id } = req.query;
      let result: any;
      try {
        result = this.getFileInfoById(id);
      } catch (code) {
        return res.error(code);
      }
      return res.success(result);
    });

    // upload a file
    router.put('/' + endpoint, ... middlewares, (req, res) => {
      const {
        uploadResource,
        customFolder,
        renamePolicy,
        sharing,
      } = req.body;
      let result: any;
      try {
        result = this.uploadFile(uploadResource, customFolder, renamePolicy, sharing);
      } catch (code) {
        return res.error(code);
      }
      return res.success(this.getFileInfo(result));
    });

    // update a file
    router.post('/' + endpoint, ... middlewares, (req, res) => {
      const { id, data } = req.body;
      let result: any;
      try {
        result = this.updateFile(id, data);
      } catch (code) {
        return res.error(code);
      }
      return res.success(this.getFileInfo(result));
    });

    // delete a file
    router.delete('/' + endpoint, ... middlewares, (req, res) => {
      const { id } = req.body;
      try {
        this.removeFile(id);
      } catch (code) {
        return res.error(code);
      }
      return res.success({ done: true });
    });
  }

  /**
   * helpers
   */

  base64StringBreakdown(base64String: string) {
    const [ header, body ] = base64String.split(';base64,');
    const mimeType = header.replace('data:', '');
    if (!mimeType || !body) {
      throw new Error('Malform base64 data.');
    }
    return { mimeType, base64Body: body };
  }

  // check if the file is in the upload folder
  isFileAvailable(file: GoogleAppsScript.Drive.File): boolean {
    const parentIds: string[] = [];
    const parents = file.getParents();
    while (parents.hasNext()) {
      parentIds.push(parents.next().getId());
    }
    return (parentIds.indexOf(this.options.uploadFolder) > -1);
  }

  // check if the file is shared publicly
  isFileShared(file: GoogleAppsScript.Drive.File): boolean {
    const access = file.getSharingAccess();
    return (
      access === DriveApp.Access.ANYONE ||
      access === DriveApp.Access.ANYONE_WITH_LINK
    );
  }

  isValidFileType(mimeType: string) {
    const { allowTypes } = this.options;
    return !allowTypes || allowTypes.indexOf(mimeType) > -1;
  }

  isValidFileSize(sizeBytes: number) {
    const { maxSize } = this.options;
    const sizeMB = sizeBytes / 1000000;
    return !maxSize || maxSize === 0 || sizeMB <= maxSize;
  }

  getSharingPreset(preset: SharingPreset) {
    return this.sharingPresets[preset];
  }

  generateFileName(fileName: string, rename?: RenamePolicy) {
    const fileNameArr = fileName.split('.');
    // extract name & extension
    const ext = fileNameArr.pop();
    let name = fileNameArr.join('.');
    // rename
    if (!!rename) {
      if (rename === 'AUTO') {
        name = Utilities.getUuid();
      }
      if (rename === 'HASH') {
        name = md5(fileName);
      }
    }
    return name + '.' + ext;
  }

  buildFileUrl(id: string) {
    const { urlBuilder } = this.options;
    const builder = (urlBuilder instanceof Array) ?
      (id: string) => (urlBuilder[0] + id +  (urlBuilder[1] || '')) : urlBuilder;
    return builder(id);
  }

  getFileInfo(file: GoogleAppsScript.Drive.File): FileInfo {
    const fileId = file.getId();
    const name = file.getName();
    const mimeType = file.getMimeType();
    const description = file.getDescription();
    const size = file.getSize();
    const link = file.getUrl();
    const url = this.buildFileUrl(fileId);
    return {
      id: fileId,
      name,
      mimeType,
      description,
      size,
      link,
      url,
      downloadUrl: url + '&export=download',
    };
  }

  getUploadFolder() {
    const { uploadFolder } = this.options;
    return  DriveApp.getFolderById(uploadFolder);
  }

  getOrCreateFolderByName(
    name: string,
    parentFolder?: GoogleAppsScript.Drive.Folder,
  ) {
    let folder = parentFolder || this.getUploadFolder();
    // get all children
    const childFolders = folder.getFoldersByName(name);
    // return the first or create new one
    if(!childFolders.hasNext()) {
      folder = folder.createFolder(name);
    } else {
      folder = childFolders.next();
    }
    return folder;
  }

  createFolderByYearAndMonth(parentFolder?: GoogleAppsScript.Drive.Folder) {
    const date = new Date();
    const yearStr = '' + date.getFullYear();
    let monthStr: any = date.getMonth() + 1;
      monthStr = '' + (monthStr < 10 ? '0' + monthStr : monthStr);
    const folder = this.getOrCreateFolderByName(yearStr, parentFolder);
    return this.getOrCreateFolderByName(monthStr, folder);
  }

  createFileFromBase64Body(
    parentFolder: GoogleAppsScript.Drive.Folder,
    fileName: string,
    mimeType: string,
    base64Body: string,
  ) {
    const data = Utilities.base64Decode(base64Body, Utilities.Charset.UTF_8);
    const blob = Utilities.newBlob(data, mimeType, fileName);
    return parentFolder.createFile(blob);
  }

  setFileSharing(
    file: GoogleAppsScript.Drive.File,
    sharing: FileSharing = 'PRIVATE',
  ) {
    const { access, permission } = (typeof sharing === 'string') ? this.getSharingPreset(sharing) : sharing;
    return file.setSharing(
      DriveApp.Access[access.toUpperCase()],
      DriveApp.Permission[permission.toUpperCase()],
    );
  }

  setEditPermissionForUser(
    file: GoogleAppsScript.Drive.File,
    auth: { uid?: string, email?: string },
  ) {
    if (!!auth && !!auth.email) {
      file.addEditors([ auth.email ]);
    }
    return file;
  }

  /**
   * security checker
   */

  hasViewPermission(file: GoogleAppsScript.Drive.File) {
    return (
      this.isFileShared(file) || // shared publicly
      this.hasEditPermission(file) // for logged in user
    );
  }

  hasEditPermission(file: GoogleAppsScript.Drive.File) {
    const { email } = this.auth || {} as { email?: string };
    return (
      !!email &&
      file.getAccess(email) === DriveApp.Permission.EDIT
    );
  }

  /**
   * main
   */

  getFileById(id: string) {
    const file = DriveApp.getFileById(id);
    if (
      file.isTrashed() || // file in the trash
      !this.hasViewPermission(file) // no view permission
    ) {
      throw new Error('file/no-file');
    }
    return file;
  }

  getFileInfoById(id: string) {
    return this.getFileInfo(
      this.getFileById(id),
    );
  }

  uploadFile(
    uploadResource: UploadResource,
    customFolder?: string,
    renamePolicy?: RenamePolicy,
    sharing: FileSharing = 'PRIVATE',
  ) {
    // check input data
    if (
      !uploadResource ||
      !uploadResource.base64Data ||
      !uploadResource.name
    ) {
      throw new Error('file/invalid-upload-resource');
    }

    // retrieve data
    const { name, base64Data } = uploadResource;
    const { mimeType, base64Body } = this.base64StringBreakdown(base64Data);

    // check input file
    if (!this.isValidFileType(mimeType)) {
      throw new Error('file/invalid-type');
    }
    if (!this.isValidFileSize(base64Body.replace(/\=/g, '').length * 0.75)) {
      throw new Error('file/invalid-size');
    }

    // get the upload folder
    let folder = this.getUploadFolder();
    if (customFolder) {
      folder = this.getOrCreateFolderByName(customFolder, folder);
    } else if (!!this.options.nested) {
      folder = this.createFolderByYearAndMonth(folder);
    }

    // save the file
    const fileName = this.generateFileName(name, renamePolicy);
    const file = this.createFileFromBase64Body(folder, fileName, mimeType, base64Body);
    // set sharing
    this.setFileSharing(file, sharing);
    // set edit security
    this.setEditPermissionForUser(file, this.auth);

    // return
    return file;
  }

  updateFile(id: string, data: FileUpdateData = {}) {
    let file = this.getFileById(id);
    if (!this.hasEditPermission(file)) {
      throw new Error('file/no-edit');
    }
    // update data
    const { name, description, sharing, content } = data;
    if (!!name) {
      file.setName(name);
    }
    if (!!description) {
      file.setDescription(description);
    }
    if (!!sharing) {
      file = this.setFileSharing(file, sharing);
    }
    if (!!content) {
      file.setContent(content);
    }
    return file;
  }

  removeFile(id: string) {
    const file = this.getFileById(id);
    if (!this.hasEditPermission(file)) {
      throw new Error('file/no-edit');
    }
    return file.setTrashed(true);
  }

}
