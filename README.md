# Sheetbase Module: @sheetbase/drive-server

File management with Drive for Sheetbase backend app.

<!-- <block:header> -->

[![Build Status](https://travis-ci.com/sheetbase/drive-server.svg?branch=master)](https://travis-ci.com/sheetbase/drive-server) [![Coverage Status](https://coveralls.io/repos/github/sheetbase/drive-server/badge.svg?branch=master)](https://coveralls.io/github/sheetbase/drive-server?branch=master) [![NPM](https://img.shields.io/npm/v/@sheetbase/drive-server.svg)](https://www.npmjs.com/package/@sheetbase/drive-server) [![License][license_badge]][license_url] [![clasp][clasp_badge]][clasp_url] [![Support me on Patreon][patreon_badge]][patreon_url] [![PayPal][paypal_donate_badge]][paypal_donate_url] [![Ask me anything][ask_me_badge]][ask_me_url]

<!-- </block:header> -->

## Install

Using npm: `npm install --save @sheetbase/drive-server`

```ts
import * as Drive from "@sheetbase/drive-server";
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

- Docs homepage: https://sheetbase.github.io/drive-server

- API reference: https://sheetbase.github.io/drive-server/api

### Examples

```ts
import { drive } from "./public_api";

// content folder: https://drive.google.com/drive/folders/1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY?usp=sharing
const contentFolder = "1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY";

function load_() {
  return drive({ contentFolder });
}

export function example1(): void {
  const Drive = load_();

  const text = Drive.get("1nxDE5wsKAm7Tfc95QAOWlTaa5I9y8eFE"); // file.txt
  const image = Drive.get("1rGI-wlNTDkgthzNfVZjKSzygjhD-WshV"); // image.jpg
  Logger.log(text);
  Logger.log(image);
}

export function example2(): void {
  const Drive = load_();

  const result1 = Drive.upload({
    name: "file.txt",
    mimeType: "text/plain",
    base64Content: "SGVsbG8sIHdvcmxkIQ=="
  });
  const result2 = Drive.upload(
    {
      name: "file.txt",
      mimeType: "text/plain",
      base64Content: "SGVsbG8sIHdvcmxkIQ=="
    },
    "my_folder"
  );
  const result3 = Drive.upload(
    {
      name: "file.txt",
      mimeType: "text/plain",
      base64Content: "SGVsbG8sIHdvcmxkIQ=="
    },
    null,
    "AUTO"
  );
  const result4 = Drive.upload(
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

export { contentFolder };
```

## License

**@sheetbase/drive-server** is released under the [MIT](https://github.com/sheetbase/drive-server/blob/master/LICENSE) license.

<!-- <block:footer> -->

[license_badge]: https://img.shields.io/github/license/mashape/apistatus.svg
[license_url]: https://github.com/sheetbase/drive-server/blob/master/LICENSE
[clasp_badge]: https://img.shields.io/badge/built%20with-clasp-4285f4.svg
[clasp_url]: https://github.com/google/clasp
[patreon_badge]: https://lamnhan.github.io/assets/images/badges/patreon.svg
[patreon_url]: https://www.patreon.com/lamnhan
[paypal_donate_badge]: https://lamnhan.github.io/assets/images/badges/paypal_donate.svg
[paypal_donate_url]: https://www.paypal.me/lamnhan
[ask_me_badge]: https://img.shields.io/badge/ask/me-anything-1abc9c.svg
[ask_me_url]: https://m.me/sheetbase

<!-- </block:footer> -->
