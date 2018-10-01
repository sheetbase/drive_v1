# Sheetbase Module: drive-server

File management with Drive for Sheetbase backend app.

# Install

- NPM: ``$ npm install --save @sheetbase/drive-server``

- As library: ``1mbpy4unOm6RTKzU_awPJnt9mNncpFPXR9f3redN5YavB8PSYUDKe8Fo8`` (set Indentifier to **SheetbaseDrive**, [view code](https://script.google.com/d/1mbpy4unOm6RTKzU_awPJnt9mNncpFPXR9f3redN5YavB8PSYUDKe8Fo8/edit?usp=sharing))

## Usage

```ts
Sheetbase.Config.set('contentFolder', '1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY');

// get info
var text = SheetbaseDrive.get('1nxDE5wsKAm7Tfc95QAOWlTaa5I9y8eFE');
var image = SheetbaseDrive.get('1rGI-wlNTDkgthzNfVZjKSzygjhD-WshV');
Logger.log(text);
Logger.log(image);

// upload
var upload = SheetbaseDrive.upload({
	name: 'file.txt',
	mimeType: 'text/plain',
	base64String: 'SGVsbG8sIHdvcmxkIQ=='
});
Logger.log(upload);
```

## License

[MIT][license-url]

[license-url]: https://github.com/sheetbase/module-drive-server/blob/master/LICENSE