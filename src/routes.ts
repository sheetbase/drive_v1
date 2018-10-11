import { IModule as ISheetbaseModule, IRoutingErrors, IAddonRoutesOptions, IHttpHandler } from '@sheetbase/core-server';
import { IModule, IFileResource } from './types/module';

export const DRIVE_ROUTING_ERRORS: IRoutingErrors = {
    'file/unknown': {
        status: 400, message: 'Unknown errors.',
    },
    'file/missing': {
        status: 400, message: 'Missing inputs.',
    },
    'file/not-supported': {
        status: 400, message: 'Not supported.',
    },
    'file/invalid': {
        status: 400, message: 'File data must contains name, mimeType and base64String.',
    }
};

export function driveModuleRoutes(
    Sheetbase: ISheetbaseModule,
    Drive: IModule,
    options: IAddonRoutesOptions 
): void {
    const customName: string = options.customName || 'file';
    const middlewares: IHttpHandler[] = options.middlewares || ([
        (req, res, next) => next()
    ]);
    
    // get file information
    Sheetbase.Router.get('/' + customName, ... middlewares, (req, res) => {
        const fileId: string = req.queries['fileId'];
        let result: any;
        try {
            result = Drive.get(fileId);
        } catch (code) {
            const { status, message } = DRIVE_ROUTING_ERRORS[code];
            return res.error(code, message, status);
        }
        return res.success(result);
    });

    // upload a file
    Sheetbase.Router.put('/' + customName, ... middlewares, (req, res) => {
        const fileResource: IFileResource = req.body.fileResource;
        const customFolder: string = req.body.customFolder;
        const rename: string = req.body.rename;
        let result: any;
        try {
            result = Drive.upload(fileResource, customFolder, rename);
        } catch (code) {
            const { status, message } = DRIVE_ROUTING_ERRORS[code];
            return res.error(code, message, status);
        }
        return res.success(result);
    });

}