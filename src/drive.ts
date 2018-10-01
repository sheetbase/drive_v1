import { ISheetbaseModule, IAddonRoutesOptions } from '@sheetbase/core-server';
import { IDriveModule } from './types/module';
import { IDriveModuleRoutes, IUploadFileResource, IDriveMethodGetResult, IDriveMethodUploadResult } from './types/misc';

declare const Sheetbase: ISheetbaseModule;
declare const Jsrsasign;

declare const driveModuleRoutes: IDriveModuleRoutes;

export function driveModuleExports(): IDriveModule {

    class SheetbaseDrive {

        constructor() {}

        registerRoutes(options: IAddonRoutesOptions = null) {
            driveModuleRoutes(Sheetbase, this, options);
        }

        get(fileId: string): IDriveMethodGetResult {
            const contentFolderId: string = Sheetbase.Config.get('contentFolder');
            
            if (!fileId) {
                throw new Error('file/no-id');
            }
            
            if (!contentFolderId) { throw new Error('file/not-supported'); }
            try {
                DriveApp.getFolderById(contentFolderId);
            } catch(error) {
                throw new Error('file/not-supported');
            }
    
            const file = DriveApp.getFileById(fileId);
            const id = file.getId();
            const name = file.getName();
            const mimeType = file.getMimeType();
            const description = file.getDescription();
            const size = file.getSize();
            const link = file.getUrl();
            return {
                id, name, mimeType, description, size, link,
                url: 'https://drive.google.com/uc?id='+ id +'&export=download'
            };
        }
    
        upload(fileResource: IUploadFileResource, customFolderName: string = null, customName: string = null): IDriveMethodUploadResult {
            const contentFolderId: string = Sheetbase.Config.get('contentFolder');
            let folder: GoogleAppsScript.Drive.Folder;

            if (!fileResource) {
                throw new Error('file/no-id');
            }
    
            if (
                !(fileResource instanceof Object) ||
                !fileResource.name || !fileResource.mimeType || !fileResource.base64String
            ) {
                throw new Error('file/invalid');
            }
    
            if (!contentFolderId) { throw new Error('file/not-supported'); }
            try {
                folder = DriveApp.getFolderById(contentFolderId);
            } catch(error) {
                throw new Error('file/not-supported');
            }
            
            // get uploads folder
            folder = this.getFolderByName(folder, 'uploads');
    
            // custom folder
            if (customFolderName) {
                folder = this.getFolderByName(folder, customFolderName);
            } else {
                let date = new Date();
                let year = '' + date.getFullYear();
                let month: any = date.getMonth() + 1;
                    month = '' + (month < 10 ? '0' + month: month);
    
                folder = this.getFolderByName(folder, year);
                folder = this.getFolderByName(folder, month);
            }
    
            let fileName = fileResource.name;
            if (customName) fileName = customName;
            if (fileName === 'MD5') {
                fileName = Jsrsasign.KJUR.crypto.Util.md5(fileResource.name);
            }
            if (fileName === 'AUTO') {
                fileName = Utilities.getUuid();
            }
            
            let newFile = folder.createFile(
                <any> Utilities.newBlob(
                    Utilities.base64Decode(fileResource.base64String, Utilities.Charset.UTF_8),
                    fileResource.mimeType,
                    fileName
                )
            ).setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
            const id = newFile.getId();
            const name = newFile.getName();
            const mimeType = newFile.getMimeType();
            const description = newFile.getDescription();
            const size = newFile.getSize();
            const link = newFile.getUrl();

            return {
                id, name, mimeType, description, size, link,
                url: 'https://drive.google.com/uc?id='+ id +'&export=download'
            };            
        }
    
        private getFolderByName(parentFolder: GoogleAppsScript.Drive.Folder, folderName: string) {
            let folder = parentFolder;
            let childFolders = folder.getFoldersByName(folderName);
            if(!childFolders.hasNext()) {
                folder = folder.createFolder(folderName);
            } else {
                folder = childFolders.next();
            }
            return folder;
        }

        
    }

    return new SheetbaseDrive();
}