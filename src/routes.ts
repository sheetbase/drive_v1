import { ISheetbaseModule, IRoutingErrors, IAddonRoutesOptions, IHttpHandler } from '@sheetbase/core-server';
import { IDriveModule } from './types/module';
import { IUploadFileResource } from './types/misc';

export const DRIVE_ROUTING_ERRORS: IRoutingErrors = {
    'file/unknown': {
        status: 400, message: 'Unknown errors.',
    },
    'file/no-id': {
        status: 400, message: 'No id.',
    },
    'file/not-supported': {
        status: 400, message: 'Not supported.',
    },
    'file/invalid': {
        status: 400, message: 'File data must contains name, mimeType and base64String.',
    }
};

export function gmailModuleRoutes(
    Sheetbase: ISheetbaseModule,
    SheetbaseDrive: IDriveModule,
    options: IAddonRoutesOptions 
): void {
    const customName: string = options.customName || 'file';
    const middlewares: IHttpHandler[] = options.middlewares || ([
        (req, res, next) => next()
    ]);

    
    Sheetbase.Router.get('/' + customName, ... middlewares, (req, res) => {
        const fileId: string = req.queries.id;
        let result: any;
        try {
            result = SheetbaseDrive.get(fileId);
        } catch (code) {
            const { status, message } = DRIVE_ROUTING_ERRORS[code];
            return res.error(code, message, status);
        }
        return res.success(result);
    });

    Sheetbase.Router.post('/' + customName, ... middlewares, (req, res) => {
        const fileResource: IUploadFileResource = req.body.file;
        const customFolder: string = req.body.folder;
        const customName: string = req.body.name;
        let result: any;
        try {
            result = SheetbaseDrive.upload(fileResource, customFolder, customName);
        } catch (code) {
            const { status, message } = DRIVE_ROUTING_ERRORS[code];
            return res.error(code, message, status);
        }
        return res.success(result);
    });

}