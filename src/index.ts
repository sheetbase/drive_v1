import { IModule, IOptions } from '../index';
import { Drive } from './drive';

export declare const DriveModule: {(options: IOptions): IModule}; 

declare const options: IOptions;
export const moduleExports: IModule = new Drive(options);