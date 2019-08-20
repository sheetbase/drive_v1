# Sheetbase Module: @sheetbase/drive

File management with Drive for Sheetbase backend app.

<!-- <block:header> -->

[![Build Status](https://travis-ci.com/sheetbase/drive.svg?branch=master)](https://travis-ci.com/sheetbase/drive) [![Coverage Status](https://coveralls.io/repos/github/sheetbase/drive/badge.svg?branch=master)](https://coveralls.io/github/sheetbase/drive?branch=master) [![NPM](https://img.shields.io/npm/v/@sheetbase/drive.svg)](https://www.npmjs.com/package/@sheetbase/drive) [![License][license_badge]][license_url] [![clasp][clasp_badge]][clasp_url] [![Support me on Patreon][patreon_badge]][patreon_url] [![PayPal][paypal_donate_badge]][paypal_donate_url] [![Ask me anything][ask_me_badge]][ask_me_url]

<!-- </block:header> -->

## Install

Using npm: `npm install --save @sheetbase/drive`

```ts
import * as Drive from "@sheetbase/drive";
```

As a library: `1mbpy4unOm6RTKzU_awPJnt9mNncpFPXR9f3redN5YavB8PSYUDKe8Fo8`

Set the _Indentifier_ to **DriveModule** and select the lastest version, [view code](https://script.google.com/d/1mbpy4unOm6RTKzU_awPJnt9mNncpFPXR9f3redN5YavB8PSYUDKe8Fo8/edit?usp=sharing).

```ts
declare const DriveModule: { Drive: any };
const Drive = DriveModule.Drive;
```

## Scopes

`https://www.googleapis.com/auth/drive`

## Usage

- Docs homepage: https://sheetbase.github.io/drive

- API reference: https://sheetbase.github.io/drive/api

<!-- <block:body> -->

## Getting started

Install: `npm install --save @sheetbase/drive`

Usage:

```ts
import { drive } from "@sheetbase/drive";

const Drive = drive({
  uploadFolder: "1Abc..."
  /* configs */
});

const file = Drive.uploadFile({
  name: "file.txt",
  base64Value: "data:text/plain;base64,Abc=="
});
```

## Configs

Drive module configurations.

```ts
export interface Options extends Intergration {
  // the upload folder id
  uploadFolder: string;
  // limits
  allowTypes?: string[]; // mimetype list
  maxSize?: number; // MB = 1,000,000 bytes
  // structured by: <year>/<month>
  nested?: boolean;
  // customize the response url
  urlBuilder?: string[] | { (id: string): string };
}

export interface Intergration {
  AuthToken?: any;
}
```

### `uploadFolder` (required)

- Type: `string`
- Default: **REQUIRED**

The **Upload** folder id.

### `urlBuilder`

- Type: `string[]` or `Function`
- Default: `['https://drive.google.com/uc?id=']`

Customize the file url.

### `nested`

- Type: `boolean`
- Default: `undefined`

Put upload file in Wordpress-like upload structure `<year>/<month>`.

### `allowTypes`

- Type: `string[]`
- Default: `undefined`

Use this if you want to accept certain types of file. Since the file is stored in Google Drive, there is no need to worry about script execution security. But uploader can upload any malicious file, these files may harm downloader devices.

### `maxSize`

- Type: `number`
- Default: `10`

Upload file size limit in MB.

## Drive

Interface for file management in Drive.

- `setIntegration`: Integrate with other services
- `getFileById`: Get a file
- `getFileInfoById`: Get a file information
- `uploadFile`: Upload a file
- `uploadFiles`: Upload multiple files
- `updateFile`: Update a file
- `removeFile`: Delete a file

Drive service detail:

```ts
class DriveService {
  setIntegration<K extends keyof Intergration, Value>(
    key: K,
    value: Value
  ): DriveService;
  registerRoutes(options: AddonRoutesOptions): void;
  base64Parser(
    base64Value: string
  ): {
    mimeType: string;
    size: number;
    base64Body: string;
  };
  isFileAvailable(file: GoogleAppsScript.Drive.File): boolean;
  isFileShared(file: GoogleAppsScript.Drive.File): boolean;
  isValidFileType(mimeType: string): boolean;
  isValidFileSize(sizeBytes: number): boolean;
  getSharingPreset(preset: SharingPreset): SharingConfig;
  generateFileName(fileName: string, rename?: RenamePolicy): string;
  buildFileUrl(id: string): string;
  getFileInfo(file: GoogleAppsScript.Drive.File): FileInfo;
  getFilesInfo(files: GoogleAppsScript.Drive.File[]): FileInfo[];
  getUploadFolder(): GoogleAppsScript.Drive.Folder;
  getOrCreateFolderByName(
    name: string,
    parentFolder?: GoogleAppsScript.Drive.Folder
  ): GoogleAppsScript.Drive.Folder;
  createFolderByYearAndMonth(
    parentFolder?: GoogleAppsScript.Drive.Folder
  ): GoogleAppsScript.Drive.Folder;
  createFileFromBase64Body(
    parentFolder: GoogleAppsScript.Drive.Folder,
    fileName: string,
    mimeType: string,
    base64Body: string
  ): GoogleAppsScript.Drive.File;
  setFileSharing(
    file: GoogleAppsScript.Drive.File,
    sharing?: FileSharing
  ): GoogleAppsScript.Drive.File;
  setEditPermissionForUser(
    file: GoogleAppsScript.Drive.File,
    auth: {
      uid?: string;
      email?: string;
    }
  ): GoogleAppsScript.Drive.File;
  hasViewPermission(file: GoogleAppsScript.Drive.File): boolean;
  hasEditPermission(file: GoogleAppsScript.Drive.File): boolean;
  getFileById(id: string): GoogleAppsScript.Drive.File;
  getFileInfoById(id: string): FileInfo;
  uploadFile(
    fileData: UploadFile,
    customFolder?: string,
    renamePolicy?: RenamePolicy,
    sharing?: FileSharing
  ): GoogleAppsScript.Drive.File;
  uploadFiles(uploadResources: UploadResource[]): GoogleAppsScript.Drive.File[];
  updateFile(id: string, data?: FileUpdateData): GoogleAppsScript.Drive.File;
  removeFile(id: string): GoogleAppsScript.Drive.File;
}
```

## Routes

To add routes to your app, see options [AddonRoutesOptions](https://github.com/sheetbase/server/blob/99f4574df858c6153c25bb183360722b17215bd7/src/lib/types.ts#L71):

```ts
Drive.registerRoutes(options?: AddonRoutesOptions);
```

### Default disabled

Disabled routes by default, to enable set `{ disabledRoutes: [] }` in `registerRoutes()`:

```ts
[
  "put:/storage" // upload files
  "post:/storage" // update a file
  "delete:/storage" // delete a file
];
```

### Endpoints

#### GET `/storage`

Get a file info. Route query:

- `id`: The file id

#### PUT `/storage`

Upload a file or multiple files. Route body:

- `file`: Single file upload data, ([`UploadFile`](https://github.com/sheetbase/drive/blob/6269d439aba3e3d49edc2be27b51e27b9a5cc998/src/lib/types.ts#L17))
- `folder`: Custom folder (for single file)
- `rename`: Naming policy (for single file)
- `share`: Sharing option (for single file)
- `files`: Multiple files upload data, ([`UploadResource[]`](https://github.com/sheetbase/drive/blob/6269d439aba3e3d49edc2be27b51e27b9a5cc998/src/lib/types.ts#L22))

Upload a file.

```ts
{
  file: {
    name: 'file.txt',
    base64Value: '...'
  }
}
```

Upload to a custom folder.

```ts
{
  file: {/* ... */},
  folder: 'My folder'
}
```

Rename upload file.

```ts
{
  file: {/* ... */},
  rename: 'AUTO', // AUTO | HASH
}
```

Custom file sharing.

```ts
{
  file: {/* ... */},
  share: 'PUBLIC' // PRIVATE (default) | PUBLIC | { access: '', permission: '' }
}
```

Upload multiple files.

```ts
{
  files: [
    {
      file: {
        name: "file.txt",
        base64Value: "..."
      }
    },
    {
      file: {
        name: "files.txt",
        base64Value: "..."
      }
    }
  ];
}
```

#### POST `/storage`

Update a file information or sharing. Route body:

- `id`: The file id
- `data`: Update data

```ts
// Update data
{
  name: '...', // change the file name
  description: '...', // change the file description
  content: '...', // change the file content
  sharing: '...', // change the file sharing
}
```

#### DELETE `/storage`

Trash a file. Route body:

- `id`: The file id

<!-- </block:body> -->

## License

**@sheetbase/drive** is released under the [MIT](https://github.com/sheetbase/drive/blob/master/LICENSE) license.

<!-- <block:footer> -->

[license_badge]: https://img.shields.io/github/license/mashape/apistatus.svg
[license_url]: https://github.com/sheetbase/drive/blob/master/LICENSE
[clasp_badge]: https://img.shields.io/badge/built%20with-clasp-4285f4.svg
[clasp_url]: https://github.com/google/clasp
[patreon_badge]: https://lamnhan.github.io/assets/images/badges/patreon.svg
[patreon_url]: https://www.patreon.com/lamnhan
[paypal_donate_badge]: https://lamnhan.github.io/assets/images/badges/paypal_donate.svg
[paypal_donate_url]: https://www.paypal.me/lamnhan
[ask_me_badge]: https://img.shields.io/badge/ask/me-anything-1abc9c.svg
[ask_me_url]: https://m.me/sheetbase

<!-- </block:footer> -->
