export interface Options {
    contentFolder: string;
    urlPrefix?: string;
    urlSuffix?: string;
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
