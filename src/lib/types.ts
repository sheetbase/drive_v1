export interface Options extends Intergration {
  // the upload folder id
  uploadFolder: string;
  // limits
  allowTypes?: string[]; // mimetype list
  maxSize?: number; // MB = 1,000,000 bytes
  // structured by: <year>/<month>
  nested?: boolean;
  // customize the response url
  urlBuilder?: string[] | {(id: string): string};
}

export interface Intergration {
  AuthToken?: any;
}

export interface UploadFile {
  name: string;
  base64Value: string;
}

export interface UploadResource {
  file: UploadFile;
  folder?: string;
  rename?: RenamePolicy;
  share?: FileSharing;
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