import { IRouter } from '@sheetbase/core-server';

export interface IOptions {
    contentFolder: string;
    router?: IRouter | any;
}