export interface Options extends Intergration {
  // the upload folder id
  uploadFolder: string;
  // nest in year & month folder
  nested?: boolean;
  // limits
  allowTypes?: string[]; // mimetype list
  maxSize?: number; // MB
  // customize the response url
  urlBuilder?: string[] | {(id: string): string};
}

export interface Intergration {
  AuthToken?: any;
}

export interface UploadResource {
  name: string;
  base64Data: string;
}

export interface FileInfo {
  id: string;
  name: string;
  mimeType: string;
  description: string;
  size: number;
  link: string;
  url: string;
  downloadUrl: string;
}

export type RenamePolicy = 'AUTO' | 'HASH';

export type FileSharing = SharingPreset | SharingConfig;
export type SharingPreset = 'PUBLIC' | 'PRIVATE';
export interface SharingConfig {
  access?: string;
  permission?: string;
}

export interface FileUpdateData {
  name?: string;
  description?: string;
  sharing?: FileSharing;
  content?: string; // text file only
}