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
  /* configs */
});
```

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
