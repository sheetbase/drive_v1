import { Options } from './types';
import { DriveService } from './drive';

export function drive(options: Options): DriveService {
    return new DriveService(options);
}