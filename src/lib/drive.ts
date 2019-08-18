import { AddonRoutesOptions, RoutingErrors, RouteRequest, RouteHandler } from '@sheetbase/server';
import md5 from 'blueimp-md5/js/md5.min';

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
  private auth: { uid?: string, email?: string } = null;

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
      maxSize: 100,
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

  private base64StringBreakdown(base64String: string) {
    const [ mimeType, base64Content ] = base64String
      .replace('data:', '').split(';base64,');
    if (!mimeType || !base64Content) {
      throw new Error('Malform base64 data.');
    }
    return { mimeType, base64Content };
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
    return !allowTypes || allowTypes[mimeType] > -1;
  }

  isValidFileSize(sizeBytes: number) {
    const { maxSize } = this.options;
    const sizeMB = sizeBytes / 1048576;
    return !maxSize || sizeMB <= maxSize;
  }

  getUploadFolder() {
    const { uploadFolder } = this.options;
    return  DriveApp.getFolderById(uploadFolder);
  }

  getFileName(fileName: string, rename?: RenamePolicy) {
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

  getSharingPreset(preset: SharingPreset) {
    return this.sharingPresets[preset];
  }

  getFileInfo(file: GoogleAppsScript.Drive.File): FileInfo {
    let { urlBuilder } = this.options;
    urlBuilder = (urlBuilder instanceof Array) ?
      (id: string) => (urlBuilder[0] + id +  urlBuilder[1]) : urlBuilder;
    const fileId = file.getId();
    const name = file.getName();
    const mimeType = file.getMimeType();
    const description = file.getDescription();
    const size = file.getSize();
    const link = file.getUrl();
    const url = urlBuilder(fileId);
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

  getFolderByName(
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

  createFolderByYearAndMonth(
    parentFolder: GoogleAppsScript.Drive.Folder,
  ) {
    const date = new Date();
    const year = '' + date.getFullYear();
    let month: any = date.getMonth() + 1;
      month = '' + (month < 10 ? '0' + month : month);
    const folder = this.getFolderByName(year, parentFolder);
    return this.getFolderByName(month, folder);
  }

  createFileFromBase64Content(
    parentFolder: GoogleAppsScript.Drive.Folder,
    fileName: string,
    mimeType: string,
    base64Content: string,
  ) {
    const data = Utilities.base64Decode(base64Content, Utilities.Charset.UTF_8);
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

  setEditForAuthUser(file: GoogleAppsScript.Drive.File) {
    const { uid, email } = this.auth;
    return file.addEditors([ email, uid + '@sheetbase.app' ]);
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
    return (
      !!this.auth &&
      (
        file.getAccess(this.auth.email) === GoogleAppsScript.Drive.Permission.EDIT ||
        file.getAccess(this.auth.uid + '@sheetbase.app') === GoogleAppsScript.Drive.Permission.EDIT
      )
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

    // data
    const { name, base64Data } = uploadResource;
    const { mimeType, base64Content } = this.base64StringBreakdown(base64Data);

    // check input file
    if (!this.isValidFileType(mimeType)) {
      throw new Error('file/invalid-type');
    }
    if (!this.isValidFileSize(base64Content.replace(/\=/g, '').length * 0.75)) {
      throw new Error('file/invalid-size');
    }

    // get the upload folder
    let folder = this.getUploadFolder();
    if (customFolder) {
      folder = this.getFolderByName(customFolder, folder);
    } else if (!!this.options.nested) {
      folder = this.createFolderByYearAndMonth(folder);
    }

    // save the file
    const fileName = this.getFileName(name, renamePolicy);
    const file = this.createFileFromBase64Content(folder, fileName, mimeType, base64Content);
    // set sharing
    this.setFileSharing(file, sharing);
    // set edit security
    if (!!this.auth) {
      this.setEditForAuthUser(file);
    }

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
