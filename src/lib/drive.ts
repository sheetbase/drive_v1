import { AddonRoutesOptions, RoutingErrors } from '@sheetbase/core-server';
import md5 from 'blueimp-md5/js/md5.min';

import { FileResource, ResultGet, ResultUpload, Options } from './types';

export class DriveService {
    private options: Options;
    private errors: RoutingErrors = {
        'file/no-id': 'No id.',
        'file/invalid-file-resource': 'No fileResource or invalid format.',
    };

    constructor(options: Options) {
        this.options = {
            urlPrefix: 'https://drive.google.com/uc?id=',
            urlSuffix: '&export=download',
            ... options,
        };
    }

    registerRoutes(options: AddonRoutesOptions): void {
        const {
            router,
            endpoint = 'storage',
            disabledRoutes = [
                'post:/' + endpoint,
                'put:/' + endpoint,
            ],
            middlewares = [(req, res, next) => next()],
        } = options;

        // register errors & disabled routes
        router.setDisabled(disabledRoutes);
        router.setErrors(this.errors);

        // get file information
        router.get('/' + endpoint, ... middlewares, (req, res) => {
            const id: string = req.query.id;
            let result: any;
            try {
                result = this.get(id);
            } catch (code) {
                return res.error(code);
            }
            return res.success(result);
        });

        // upload a file
        const uploader = (req, res) => {
            const fileResource: FileResource = req.body.fileResource;
            const customFolder: string = req.body.customFolder;
            const rename: string = req.body.rename;
            let result: any = {};
            try {
                result = this.upload(fileResource, customFolder, rename);
            } catch (code) {
                return res.error(code);
            }
            return res.success(result);
        };
        router.post('/' + endpoint, ... middlewares, uploader);
        router.put('/' + endpoint, ... middlewares, uploader);
    }

    get(id: string): ResultGet {
        if (!id) {
            throw new Error('file/no-id');
        }

        const { urlPrefix, urlSuffix } = this.options;

        // get the file
        const file = DriveApp.getFileById(id);

        // check permission
        if (!this.hasPermission(file)) {
            throw new Error('file/not-allowed');
        }

        // response
        const fileId = file.getId();
        const name = file.getName();
        const mimeType = file.getMimeType();
        const description = file.getDescription();
        const size = file.getSize();
        const link = file.getUrl();
        return {
            id: fileId, name, mimeType, description, size, link,
            url: urlPrefix + id +  urlSuffix,
        };
    }

    upload(
        fileResource: FileResource,
        customFolder?: string,
        rename?: string,
        sharing: { access?: string; permission?: string; } = {},
    ): ResultUpload {
        if (
            !fileResource ||
            !(fileResource instanceof Object) ||
            !fileResource.base64Data ||
            !fileResource.size ||
            !fileResource.name
        ) {
            throw new Error('file/invalid-file-resource');
        }

        const { contentFolder: contentFolderId } = this.options;
        const { access, permission } = sharing;

        // get the content & uploads folder
        let folder =  DriveApp.getFolderById(contentFolderId);
        folder = this.getFolderByName(folder, 'uploads');

        // custom folder
        if (customFolder) {
            folder = this.getFolderByName(folder, customFolder);
        } else {
            const date = new Date();
            const year = '' + date.getFullYear();
            let month: any = date.getMonth() + 1;
                month = '' + (month < 10 ? '0' + month : month);

            folder = this.getFolderByName(folder, year);
            folder = this.getFolderByName(folder, month);
        }

        let fileName = fileResource.name;
        const fileExt: string = fileName.split('.').pop();
        // check if new name includes the extension
        if (rename) {
            fileName = (rename.indexOf(fileExt) > -1) ? rename : rename + '.' + fileExt;
        }
        if (rename === 'MD5') {
            fileName = md5(fileName) + '.' + fileExt;
        }
        if (rename === 'AUTO') {
            fileName = Utilities.getUuid() + '.' + fileExt;
        }

        // mimeType and base64Content
        const { mimeType: fileMimeType, base64Content } = this.base64Breakdown(fileResource.base64Data);

        // save the file
        const newFile = folder.createFile(
            Utilities.newBlob(
                Utilities.base64Decode(
                    base64Content,
                    Utilities.Charset.UTF_8,
                ),
                fileMimeType,
                fileName,
            ) as any,
        );
        // set sharing
        newFile.setSharing(
            DriveApp.Access[(access || 'ANYONE_WITH_LINK').toUpperCase()],
            DriveApp.Permission[(permission || 'VIEW').toUpperCase()],
        );

        // response
        const id = newFile.getId();
        const name = newFile.getName();
        const mimeType = newFile.getMimeType();
        const description = newFile.getDescription();
        const size = newFile.getSize();
        const link = newFile.getUrl();
        return {
            id, name, mimeType, description, size, link,
            url: this.options.urlPrefix + id + this.options.urlSuffix,
        };
    }

    getFolderByName(
        parentFolder: GoogleAppsScript.Drive.Folder,
        folderName: string,
    ) {
        let folder = parentFolder;
        const childFolders = folder.getFoldersByName(folderName);
        if(!childFolders.hasNext()) {
            folder = folder.createFolder(folderName);
        } else {
            folder = childFolders.next();
        }
        return folder;
    }

    hasPermission(file: GoogleAppsScript.Drive.File): boolean {
        // check sharing
        const access = file.getSharingAccess();
        if (
            access !== DriveApp.Access.ANYONE &&
            access !== DriveApp.Access.ANYONE_WITH_LINK
        ) {
            return false;
        }
        // is in the cotent folder
        const { contentFolder: contentFolderId } = this.options;
        const folders = file.getParents();
        const folderIds: string[] = [];
        while (folders.hasNext()) {
            folderIds.push(folders.next().getId());
        }
        if (folderIds.indexOf(contentFolderId) < 0) {
            return false;
        }

        return true;
    }

    base64Breakdown(base64Data: string) {
        const [ mimeTypeData, base64Content ] = base64Data.split(';base64,');
        if (!mimeTypeData || !base64Content) {
            throw new Error('Malform base64 data.');
        }
        return {
            mimeType: mimeTypeData.replace('data:', ''),
            base64Content,
        };
    }

}
