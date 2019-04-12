import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { sheetbase } from '@sheetbase/server';

import { drive } from '../src/public_api';

const Sheetbase = sheetbase();
const Drive = drive({ contentFolder: '1PZm1HEpCNUV3gR5DVq1PuULLs_dnvhdY' });

/**
 * faked globals
 */
const g: any = global;

const DriveFolderIterator = () => ({
    hasNext: () => true,
    next: () => DriveFolder(),
});

const DriveFolder = () => ({
    getId: () => 'folder-id-xxx',
    getFoldersByName: () => DriveFolderIterator(),
    createFolder: () => DriveFolder(),
    createFile: () => DriveFile(),
});

const DriveFile = () => ({
    getId: () => 'file-id-xxx',
    getName: () => 'File 1',
    getMimeType: () => 'text/plain',
    getDescription: () => 'My file 1 ...',
    getSize: () => 12345,
    getUrl: () => 'https://drive.google.com/storage-id-xxx',
    getSharingAccess: () => 'ANYONE',
    getParents: () => DriveFolderIterator(),
    setSharing: () => null,
});

g.DriveApp = {
    Access: {
        ANYONE: 'ANYONE',
        ANYONE_WITH_LINK: 'ANYONE_WITH_LINK',
    },
    Permission: {
        VIEW: 'VIEW',
    },
    getFileById: (id) => DriveFile(),
    getFolderById: (id) => DriveFolder(),
};

g.Utilities = {
    getUuid: () => 'xxxx-xxxxxx-xxxx-xxxx',
    newBlob: () => null,
    base64Decode: () => null,
};

/**
 * helpers
 */
let routerRecorder = {};
const router = Sheetbase.Router;
router.get = (endpoint, ... handlers) => {
    routerRecorder[`GET:${endpoint}`] = handlers;
};
router.post = (endpoint, ... handlers) => {
    routerRecorder[`POST:${endpoint}`] = handlers;
};
router.put = (endpoint, ... handlers) => {
    routerRecorder[`PUT:${endpoint}`] = handlers;
};

/**
 * test start
 */

describe('Drive module test', () => {

    it('Drive service should be created', () => {
        expect(!!Drive).to.equal(true);
    });

});

describe('Options test', () => {

    it('should have default values', () => {
        // @ts-ignore
        const options = Drive.options;
        expect(options.urlPrefix).to.equal('https://drive.google.com/uc?id=');
        expect(options.urlSuffix).to.equal('&export=download');
    });

    it('should set options', () => {
        const Drive = drive({
            contentFolder: 'xxx',
            urlPrefix: 'prefix',
            urlSuffix: 'suffix',
        });
        // @ts-ignore
        const options = Drive.options;
        expect(options.contentFolder).to.equal('xxx');
        expect(options.urlPrefix).to.equal('prefix');
        expect(options.urlSuffix).to.equal('suffix');
    });

});

describe('Routes test', () => {

    beforeEach(() => {
        routerRecorder = {}; // reset recorder
    });

    it('#registerRoutes should throw error (no router)', () => {
        expect(
            Drive.registerRoutes.bind(Drive, { router: null }),
        ).to.throw();
    });

    it('#registerRoutes should have default disable routes', () => {
        Drive.registerRoutes({ router });
        const disabledRoutes = Sheetbase.Option.getDisabledRoutes();
        expect(disabledRoutes).to.eql(['post:/storage', 'put:/storage']);
    });

    it('#registerRoutes should disable route GET /storage (also override default)', () => {
        Drive.registerRoutes({
            router, disabledRoutes: ['get:/storage'],
        });
        const disabledRoutes = Sheetbase.Option.getDisabledRoutes();
        expect(disabledRoutes.indexOf('get:/storage') > -1).to.equal(true);
    });

    it('#registerRoutes should register all routes', () => {
        Drive.registerRoutes({ router });
        expect(routerRecorder).to.have.property('GET:/storage');
        expect(routerRecorder).to.have.property('POST:/storage');
        expect(routerRecorder).to.have.property('PUT:/storage');
    });

    it('#registerRoutes should use different endpoint', () => {
        Drive.registerRoutes({
            router, endpoint: 'file',
        });
        expect(routerRecorder).to.not.have.property('GET:/storage');
        expect(routerRecorder).to.have.property('GET:/file');
    });

    it('#registerRoutes should have proper middlewares', () => {
        Drive.registerRoutes({
            router,
        });
        const handlers = routerRecorder['GET:/storage'];
        const [ middleware, handler ] = handlers;
        expect(handlers.length).to.equal(2);
        expect(middleware instanceof Function).to.equal(true);
        expect(handler instanceof Function).to.equal(true);
    });

    it('#registerRoutes should have proper middlewares (custom)', () => {
        Drive.registerRoutes({
            router,
            middlewares: [
                (req, res, next) => next(),
                (req, res, next) => next(),
            ],
        });
        const handlers = routerRecorder['GET:/storage'];
        expect(handlers.length).to.equal(3);
    });

});

describe('Helper methods test', () => {

    it('#getFolderByName');

    it('#hasPermission');

    it('#base64Breakdown should throw error, malform', () => {
        expect(
            Drive.base64Breakdown.bind(Drive, 'xxx'),
        ).to.throw('Malform base64 data.');
    });

    it('#base64Breakdown should work', () => {
        const result = Drive.base64Breakdown('data:abc;base64,xxx');
        expect(result).to.eql({
            mimeType: 'abc',
            base64Content: 'xxx',
        });
    });

});

describe('Methods test', () => {
    const hasPermissionStub = sinon.stub(Drive, 'hasPermission');

    afterEach(() => {
        hasPermissionStub.restore();
    });

    it('#get should throw error (no id)', () => {
        expect(
            Drive.get.bind(Drive, null),
        ).to.throw('file/no-id');
    });

    it('#get should throw error (no permission)');

    it('#get should work');

    it('#upload should throw error (no fileResource)', () => {
        expect(
            Drive.upload.bind(Drive, null),
        ).to.throw('file/invalid-file-resource');
    });

    it('#upload should throw error (invalid fileResource type)', () => {
        expect(
            Drive.upload.bind(Drive, 'a string'),
        ).to.throw('file/invalid-file-resource');
    });

    it('#upload should throw error (missing fileResource props)', () => {
        expect(
            Drive.upload.bind(Drive, {}),
        ).to.throw('file/invalid-file-resource');
    });

    it('#upload should throw error (missing fileResource.base64Content)', () => {
        expect(
            Drive.upload.bind(Drive, {
                mimeType: 'type1',
                name: 'file1',
            }),
        ).to.throw('file/invalid-file-resource');
    });

    it('#upload should throw error (missing fileResource.mimeType)', () => {
        expect(
            Drive.upload.bind(Drive, {
                base64Content: 'xxx',
                name: 'file1',
            }),
        ).to.throw('file/invalid-file-resource');
    });

    it('#upload should throw error (missing fileResource.name)', () => {
        expect(
            Drive.upload.bind(Drive, {
                base64Content: 'xxx',
                mimeType: 'type1',
            }),
        ).to.throw('file/invalid-file-resource');
    });

});