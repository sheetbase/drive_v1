import { ISheetbaseModule, IAddonRoutesOptions } from '@sheetbase/core-server';
import { IDriveModule } from './module';

export interface IDriveModuleRoutes {
    (
        Sheetbase: ISheetbaseModule,
        SheetbaseDrive: IDriveModule,
        options?: IAddonRoutesOptions
    ): void
}

export interface IUploadFileResource {
    name: string;
    mimeType: string;
    base64String: string;
}

export interface IDriveMethodGetResult {
    id: string;
    name: string;
    mimeType: string;
    description: string;
    size: number;
    link: string;
    url: string;
}

export interface IDriveMethodUploadResult
        extends IDriveMethodGetResult {}