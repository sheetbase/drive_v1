# Sheetbase Module: @sheetbase/drive-server

File management with Drive for Sheetbase backend app.

<!-- <content> -->

[![License][license_badge]][license_url] [![clasp][clasp_badge]][clasp_url] [![Support me on Patreon][patreon_badge]][patreon_url] [![PayPal][paypal_donate_badge]][paypal_donate_url] [![Ask me anything][ask_me_badge]][ask_me_url]

<!-- </content> -->

## Install

- Using npm: `npm install --save @sheetbase/drive-server`

- As a library: `1mbpy4unOm6RTKzU_awPJnt9mNncpFPXR9f3redN5YavB8PSYUDKe8Fo8`

  Set the _Indentifier_ to **Drive** and select the lastest version, [view code](https://script.google.com/d/1mbpy4unOm6RTKzU_awPJnt9mNncpFPXR9f3redN5YavB8PSYUDKe8Fo8/edit?usp=sharing).

## Scopes

`https://www.googleapis.com/auth/drive`

## Examples

```ts
function example1(): void {
  const FileManager = Drive.init(Sheetbase);

  // content folder
  // https://drive.google.com/drive/folders/1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY?usp=sharing
  Sheetbase.Config.set("contentFolder", "1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY");

  const text = FileManager.get("1nxDE5wsKAm7Tfc95QAOWlTaa5I9y8eFE"); // file.txt
  const image = FileManager.get("1rGI-wlNTDkgthzNfVZjKSzygjhD-WshV"); // image.jpg
  Logger.log(text);
  Logger.log(image);
}

function example2(): void {
  const FileManager = Drive.init(Sheetbase);

  // content folder
  // https://drive.google.com/drive/folders/1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY?usp=sharing
  Sheetbase.Config.set("contentFolder", "1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY");
  const result1 = FileManager.upload({
    name: "file.txt",
    mimeType: "text/plain",
    base64Content: "SGVsbG8sIHdvcmxkIQ=="
  });
  const result2 = FileManager.upload(
    {
      name: "file.txt",
      mimeType: "text/plain",
      base64Content: "SGVsbG8sIHdvcmxkIQ=="
    },
    "my_folder"
  );
  const result3 = FileManager.upload(
    {
      name: "file.txt",
      mimeType: "text/plain",
      base64Content: "SGVsbG8sIHdvcmxkIQ=="
    },
    null,
    "AUTO"
  );
  const result4 = FileManager.upload(
    {
      name: "file.txt",
      mimeType: "text/plain",
      base64Content: "SGVsbG8sIHdvcmxkIQ=="
    },
    null,
    "MD5"
  );
  Logger.log(result1);
  Logger.log(result2);
  Logger.log(result3);
  Logger.log(result4);
}
```

## Documentation

See the docs: https://sheetbase.github.io/module-drive-server

## API

An overview of the API, for detail please refer [the documentation](https://sheetbase.github.io/module-drive-server)

### Drive

```ts
export interface IModule {
  init(Sheetbase: ISheetbaseModule): IModule;
  registerRoutes(options?: IAddonRoutesOptions): void;
  get(fileId: string): IMethodGetResult;
  upload(
    fileResource: IFileResource,
    customFolder?: string,
    rename?: string
  ): IMethodUploadResult;
}
```

## License

**@sheetbase/drive-server** is released under the [MIT](https://github.com/sheetbase/module-drive-server/blob/master/LICENSE) license.

<!-- <footer> -->

[license_badge]: https://img.shields.io/github/license/mashape/apistatus.svg
[license_url]: https://github.com/sheetbase/module-drive-server/blob/master/LICENSE
[clasp_badge]: https://img.shields.io/badge/built%20with-clasp-4285f4.svg
[clasp_url]: https://github.com/google/clasp
[patreon_badge]: https://ionicabizau.github.io/badges/patreon.svg
[patreon_url]: https://www.patreon.com/lamnhan
[paypal_donate_badge]: https://ionicabizau.github.io/badges/paypal_donate.svg
[paypal_donate_url]: https://www.paypal.me/lamnhan
[ask_me_badge]: https://img.shields.io/badge/ask/me-anything-1abc9c.svg
[ask_me_url]: https://m.me/sheetbase

<!-- </footer> -->
