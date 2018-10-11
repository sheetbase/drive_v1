import { IModule as ISheetbaseModule, IAddonRoutesOptions } from '@sheetbase/core-server';

export interface IModule {
    init(Sheetbase: ISheetbaseModule): IModule;
    registerRoutes(options?: IAddonRoutesOptions): void;
    get(fileId: string): IMethodGetResult;
    upload(fileResource: IFileResource, customFolder?: string, rename?: string): IMethodUploadResult;
}

export interface IFileResource {
    name: string;
    mimeType: string;
    base64Content: string;
}

export interface IMethodGetResult {
    id: string;
    name: string;
    mimeType: string;
    description: string;
    size: number;
    link: string;
    url: string;
}

export interface IMethodUploadResult extends IMethodGetResult {}