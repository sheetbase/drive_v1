import { IModule } from './types/module';
import { IModule as ISheetbaseModule } from '@sheetbase/core-server';

var proccess = proccess || this;

declare const Sheetbase: ISheetbaseModule;

declare const DriveModule: {(): IModule};
const Drive: IModule = proccess['Drive'] || DriveModule();

export function example1(): void {
    const FileManager = Drive.init(Sheetbase);

    // content folder
    // https://drive.google.com/drive/folders/1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY?usp=sharing
    Sheetbase.Config.set('contentFolder', '1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY');

    const text = FileManager.get('1nxDE5wsKAm7Tfc95QAOWlTaa5I9y8eFE'); // file.txt
    const image = FileManager.get('1rGI-wlNTDkgthzNfVZjKSzygjhD-WshV'); // image.jpg
    Logger.log(text);
    Logger.log(image);
}

export function example2(): void {
    const FileManager = Drive.init(Sheetbase);
    
    // content folder
    // https://drive.google.com/drive/folders/1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY?usp=sharing
    Sheetbase.Config.set('contentFolder', '1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY');
    const result1 = FileManager.upload({
        name: 'file.txt',
        mimeType: 'text/plain',
        base64Content: 'SGVsbG8sIHdvcmxkIQ=='
    });
    const result2 = FileManager.upload({
        name: 'file.txt',
        mimeType: 'text/plain',
        base64Content: 'SGVsbG8sIHdvcmxkIQ=='
    }, 'my_folder');
    const result3 = FileManager.upload({
        name: 'file.txt',
        mimeType: 'text/plain',
        base64Content: 'SGVsbG8sIHdvcmxkIQ=='
    }, null, 'AUTO');
    const result4 = FileManager.upload({
        name: 'file.txt',
        mimeType: 'text/plain',
        base64Content: 'SGVsbG8sIHdvcmxkIQ=='
    }, null, 'MD5');
    Logger.log(result1);
    Logger.log(result2);
    Logger.log(result3);
    Logger.log(result4);
}