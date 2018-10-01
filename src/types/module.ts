import { IAddonRoutesOptions } from '@sheetbase/core-server';
import { IUploadFileResource, IDriveMethodGetResult, IDriveMethodUploadResult } from './misc';

export interface IDriveModule {
    registerRoutes: {(options?: IAddonRoutesOptions): void};
    get: {(fileId: string): IDriveMethodGetResult};
    upload: {(file: IUploadFileResource, customFolderName?: string, customName?: string): IDriveMethodUploadResult};
}