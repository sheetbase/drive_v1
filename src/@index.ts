/**
 * 
 * Name: @sheetbase/drive-server
 * Description: File management with Drive for Sheetbase backend app.
 * Version: 0.0.1
 * Author: Sheetbase
 * Homepage: https://sheetbase.net
 * License: MIT
 * Repo: https://github.com/sheetbase/module-drive-server.git
 *
 */

import { IDriveModule } from './types/module';
import { ISheetbaseModule } from '@sheetbase/core-server';

declare const Sheetbase: ISheetbaseModule;
declare const driveModuleExports: {(): IDriveModule};
const sheetbaseDrive = driveModuleExports();
const SheetbaseDrive = sheetbaseDrive;
const SHEETBASE_DRIVE = sheetbaseDrive;

for (const prop of Object.keys({... sheetbaseDrive, ... Object.getPrototypeOf(sheetbaseDrive)})) {
	this[prop] = sheetbaseDrive[prop];
}

export { sheetbaseDrive, SheetbaseDrive, SHEETBASE_DRIVE };

export function sheetbase_drive_example1(): void {
    Sheetbase.Config.set('contentFolder', '1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY');
    // file.txt
    const text = SheetbaseDrive.get('1nxDE5wsKAm7Tfc95QAOWlTaa5I9y8eFE');
    // image.jpg
    const image = SheetbaseDrive.get('1rGI-wlNTDkgthzNfVZjKSzygjhD-WshV');
    Logger.log(text);
    Logger.log(image);
}


export function sheetbase_drive_example2(): void {
    Sheetbase.Config.set('contentFolder', '1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY');
    const result1 = SheetbaseDrive.upload({
        name: 'file.txt',
        mimeType: 'text/plain',
        base64String: 'SGVsbG8sIHdvcmxkIQ=='
    });
    const result2 = SheetbaseDrive.upload({
        name: 'file.txt',
        mimeType: 'text/plain',
        base64String: 'SGVsbG8sIHdvcmxkIQ=='
    }, 'my_folder');
    const result3 = SheetbaseDrive.upload({
        name: 'file.txt',
        mimeType: 'text/plain',
        base64String: 'SGVsbG8sIHdvcmxkIQ=='
    }, null, 'AUTO');
    const result4 = SheetbaseDrive.upload({
        name: 'file.txt',
        mimeType: 'text/plain',
        base64String: 'SGVsbG8sIHdvcmxkIQ=='
    }, null, 'MD5');
    Logger.log(result1);
    Logger.log(result2);
    Logger.log(result3);
    Logger.log(result4);
}