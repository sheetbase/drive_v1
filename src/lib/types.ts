export interface Options {
    contentFolder: string;
    urlPrefix?: string;
    urlSuffix?: string;
}

export interface FileResource {
    name: string;
    base64Data: string;
    size?: number;
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
