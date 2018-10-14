import { IRoutingErrors, IAddonRoutesOptions, IRouteHandler, IRouter, IRouteResponse } from '@sheetbase/core-server';
import { IModule, IFileResource } from './types/module';

export const ROUTING_ERRORS: IRoutingErrors = {
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

function routingError(res: IRouteResponse, code: string) {
    const error = ROUTING_ERRORS[code] || ROUTING_ERRORS['file/unknown'];
    const { status, message } = error;
    return res.error(code, message, status);
}

export function driveModuleRoutes(Drive: IModule, Router: IRouter, options: IAddonRoutesOptions): void {
    if (!Router) {
        throw new Error('No router, please check out for Sheetbase Router.');
    }
    const endpoint: string = options.endpoint || 'file';
    const middlewares: IRouteHandler[] = options.middlewares || ([
        (req, res, next) => next()
    ]);
    
    // get file information
    Router.get('/' + endpoint, ... middlewares, (req, res) => {
        let result: any = {};
        try {
            const fileId: string = req.query.fileId;
            result = Drive.get(fileId);
        } catch (code) {
            return routingError(res, code);
        }
        return res.success(result);
    });

    // upload a file
    Router.put('/' + endpoint, ... middlewares, (req, res) => {
        let result: any = {};
        try {
            const fileResource: IFileResource = req.body.fileResource;
            const customFolder: string = req.body.customFolder;
            const rename: string = req.body.rename;
            result = Drive.upload(fileResource, customFolder, rename);
        } catch (code) {
            return routingError(res, code);
        }
        return res.success(result);
    });

}
