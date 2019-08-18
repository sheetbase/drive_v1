export interface Options {
  // the upload folder id
  uploadFolder: string;
  // nest in year & month folder
  nested?: boolean;
  // customize the response url
  urlPrefix?: string;
  urlSuffix?: string;
}

export interface UploadResource {
  name: string;
  base64Data: string;
  size?: number;
}

export interface FileInfo {
  id: string;
  name: string;
  mimeType: string;
  description: string;
  size: number;
  link: string;
  url: string;
}

export type RenamePolicy = 'AUTO' | 'HASH';

export type SharingMode = 'PUBLIC' | 'PRIVATE';

export interface SharingConfig {
  access?: string;
  permission?: string;
}
