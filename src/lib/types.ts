import { RouterService } from '@sheetbase/core-server';

export interface Options {
    contentFolder: string;
    router?: RouterService | any;
    disabledRoutes?: string | string[];
}

export interface FileResource {
    name: string;
    mimeType: string;
    base64Content: string;
}

export interface ResultGet {
    id: string;
    name: string;
    mimeType: string;
    description: string;
    size: number;
    link: string;
    url: string;
}

export interface ResultUpload extends ResultGet {}
