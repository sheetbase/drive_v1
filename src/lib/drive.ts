import { AddonRoutesOptions, RoutingErrors, RouteRequest, RouteHandler } from '@sheetbase/server';
import md5 from 'blueimp-md5/js/md5.min';

import {
  Options,
  Intergration,
  UploadResource,
  FileInfo,
  RenamePolicy,
  SharingConfig,
  SharingMode,
} from './types';

export class DriveService {
  private options: Options;
  private errors: RoutingErrors = {
    'file/not-found': 'File not found.',
    'file/invalid-upload-resource': 'Invalid upload resource.',
    'file/invalid-size': 'The file is too big.',
    'file/invalid-type': 'The file format is not supported.',
  };

  private req: RouteRequest = null;
  private auth: any = null;

  private sharingModes: {[name: string]: SharingConfig} = {
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

  private base64StringBreakdown(base64String: string) {
    const [ mimeType, base64Content ] = base64String
      .replace('data:', '').split(';base64,');
    if (!mimeType || !base64Content) {
      throw new Error('Malform base64 data.');
    }
    return { mimeType, base64Content };
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

  registerRoutes(options: AddonRoutesOptions): void {
    const {
      router,
      endpoint = 'storage',
      disabledRoutes = [
        'post:/' + endpoint,
        'put:/' + endpoint,
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
      let result: any = {};
      try {
        result = this.uploadFile(uploadResource, customFolder, renamePolicy, sharing);
      } catch (code) {
        return res.error(code);
      }
      return res.success(result);
    });

    // update a file props

    // delete a file
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

  // check if the file is public
  isFilePublic(file: GoogleAppsScript.Drive.File): boolean {
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

  getSharingConfig(mode: SharingMode) {
    return this.sharingModes[mode];
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

  /**
   * main
   */

  getFileById(id: string) {
    const file = !!id ? DriveApp.getFileById(id) : null;
    return (
      !!file &&
      (
        this.isFileAvailable(file) &&
        this.isFilePublic(file)
      )
    ) ? file : null;
  }

  getFileInfoById(id: string) {
    const file = this.getFileById(id);
    if (!file) {
      throw new Error('file/not-found');
    }
    return this.getFileInfo(file);
  }

  uploadFile(
    uploadResource: UploadResource,
    customFolder?: string,
    renamePolicy?: RenamePolicy,
    sharing: SharingMode | SharingConfig = 'PRIVATE',
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
    const fileName = this.getFileName(name, renamePolicy);
    let folder = this.getUploadFolder();
    if (customFolder) {
      folder = this.getFolderByName(customFolder, folder);
    } else if (!!this.options.nested) {
      const date = new Date();
      const year = '' + date.getFullYear();
      let month: any = date.getMonth() + 1;
        month = '' + (month < 10 ? '0' + month : month);
      folder = this.getFolderByName(year, folder);
      folder = this.getFolderByName(month, folder);
    }

    // save the file
    const data = Utilities.base64Decode(base64Content, Utilities.Charset.UTF_8);
    const blob = Utilities.newBlob(data, mimeType, fileName);
    const file = folder.createFile(blob);

    // set sharing
    const { access, permission } = (typeof sharing === 'string') ? this.getSharingConfig(sharing) : sharing;
    file.setSharing(
      DriveApp.Access[access.toUpperCase()],
      DriveApp.Permission[permission.toUpperCase()],
    );

    // response
    return file;
  }

}
