import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { drive, DriveService } from '../src/public_api';

let Drive: DriveService;

let getUploadFolderStub: sinon.SinonStub;
let getOrCreateFolderByNameStub: sinon.SinonStub;

function before() {

  // mocked DriveApp
  global['DriveApp'] = {
    Access: {
      ANYONE: 'ANYONE',
      ANYONE_WITH_LINK: 'ANYONE_WITH_LINK',
      PRIVATE: 'PRIVATE',
    },
    Permission: {
      VIEW: 'VIEW',
      NONE: 'NONE',
    },
  };

  // moacked Utilities
  global['Utilities'] = {
    Charset: {
      UTF_8: 'UTF_8',
    },
    getUuid: () => 'xxxx-xxxxxx-xxxx-xxxx',
  };

  // drive instance
  Drive = drive({ uploadFolder: 'xxx' });

  // build stubs
  getUploadFolderStub = sinon.stub(Drive, 'getUploadFolder');
  getOrCreateFolderByNameStub = sinon.stub(Drive, 'getOrCreateFolderByName');

}

function after() {
  getUploadFolderStub.restore();
  getOrCreateFolderByNameStub.restore();
}

/**
 * test start
 */

describe('Drive test', () => {

  beforeEach(before);
  afterEach(after);

  it('Drive service should be created', () => {
    expect(!!Drive).to.equal(true);
  });

});

describe('DriveService', () => {

  beforeEach(before);
  afterEach(after);

  it('should have default values', () => {
    // @ts-ignore
    const options = Drive.options;
    expect(options.maxSize).to.equal(10);
    expect(options.urlBuilder).to.eql(['https://drive.google.com/uc?id=']);
  });

  it('should set option', () => {
    const Drive = drive({
      uploadFolder: 'xxx-2',
      maxSize: 100,
      urlBuilder: id => `url:${id}`,
      allowTypes: ['text/plain'],
      nested: true,
    });
    // @ts-ignore
    const options = Drive.options;
    expect(options.uploadFolder).to.equal('xxx-2');
    expect(options.maxSize).to.equal(100);
    expect(options.urlBuilder instanceof Function).to.equal(true);
    expect(options.allowTypes).to.eql(['text/plain']);
    expect(options.nested).to.equal(true);
  });

  it('#setIntegration', () => {
    Drive.setIntegration('AuthToken', 'xxx');
    // @ts-ignore
    expect(Drive.options.AuthToken).equal('xxx');
  });

  it('#setRequest (empty)', () => {
    Drive.setRequest({ query: {}, body: {}, data: {} });
    // @ts-ignore
    expect(Drive.req).to.eql({ query: {}, body: {}, data: {} });
  });

  it('#setRequest (with idToken, no AuthToken)', () => {
    Drive.setRequest({ query: { idToken: 'xxx' } });
    // @ts-ignore
    expect(Drive.auth).to.equal(null);
  });

  it('#setRequest (with idToken, has AuthToken)', () => {
    // mock options Auth token
    // @ts-ignore
    Drive.options['AuthToken'] = {
      decodeIdToken: () => ({ uid: 'xxx' }),
    };

    Drive.setRequest({ query: { idToken: 'xxx' } });
    // @ts-ignore
    expect(Drive.auth).to.eql({ uid: 'xxx' });
  });

  it('#base64StringBreakdown should throw error, malform', () => {
    expect(
      Drive.base64StringBreakdown.bind(Drive, 'xxx'),
    ).to.throw('Malform base64 data.');
  });

  it('#base64StringBreakdown', () => {
    const result = Drive.base64StringBreakdown('data:abc;base64,xxx=');
    expect(result).to.eql({
      mimeType: 'abc',
      base64Body: 'xxx=',
    });
  });

  it('#isFileAvailable (not)', () => {
    const parents = ['abc', '123']; // no 'xxx'
    const result = Drive.isFileAvailable({
      getParents: () => ({
        hasNext: () => !!parents.length,
        next: () => {
          const id = parents.shift();
          return {
            getId: () => id,
          };
        },
      }),
    } as any);
    expect(result).to.equal(false);
  });

  it('#isFileAvailable', () => {
    const parents = ['abc', 'xxx'];
    const result = Drive.isFileAvailable({
      getParents: () => ({
        hasNext: () => !!parents.length,
        next: () => {
          const id = parents.shift();
          return {
            getId: () => id,
          };
        },
      }),
    } as any);
    expect(result).to.equal(true);
  });

  it('#isFileShared (not)', () => {
    const result = Drive.isFileShared({
      getSharingAccess: () => 'NONE',
    } as any);
    expect(result).to.equal(false);
  });

  it('#isFileShared', () => {
    const result1 = Drive.isFileShared({
      getSharingAccess: () => 'ANYONE',
    } as any);
    const result2 = Drive.isFileShared({
      getSharingAccess: () => 'ANYONE_WITH_LINK',
    } as any);
    expect(result1).to.equal(true);
    expect(result2).to.equal(true);
  });

  it('#isValidFileType (no allowTypes, all allowed)', () => {
    const result = Drive.isValidFileType('any');
    expect(result).to.equal(true);
  });

  it('#isValidFileType (has allowTypes, not allowed)', () => {
    const Drive = drive({
      uploadFolder: 'xxx',
      allowTypes: ['text/plain'],
    });
    const result = Drive.isValidFileType('text/rich');
    expect(result).to.equal(false);
  });

  it('#isValidFileType (has allowTypes, allowed)', () => {
    const Drive = drive({
      uploadFolder: 'xxx',
      allowTypes: ['text/rich'],
    });
    const result = Drive.isValidFileType('text/rich');
    expect(result).to.equal(true);
  });

  it('#isValidFileSize (no maxSize or 0, all allowed)', () => {
    const Drive1 = drive({
      uploadFolder: 'xxx',
      maxSize: null,
    });
    const Drive2 = drive({
      uploadFolder: 'xxx',
      maxSize: 0,
    });
    const result1 = Drive1.isValidFileSize(100000000); // 100MB
    const result2 = Drive2.isValidFileSize(100000000); // 100MB
    expect(result1).to.equal(true, 'not setted');
    expect(result2).to.equal(true, '=== 0');
  });

  it('#isValidFileSize (has maxSize, not allowed)', () => {
    const result = Drive.isValidFileSize(11000000); // 1MB
    expect(result).to.equal(false);
  });

  it('#isValidFileSize (has maxSize, allowed)', () => {
    const result = Drive.isValidFileSize(10000000); // 10MB
    expect(result).to.equal(true);
  });

  it('#getSharingPreset', () => {
    const result1 = Drive.getSharingPreset('PUBLIC');
    const result2 = Drive.getSharingPreset('PRIVATE');
    expect(result1).to.eql({ access: 'ANYONE_WITH_LINK', permission: 'VIEW' });
    expect(result2).to.eql({ access: 'PRIVATE', permission: 'VIEW' });
  });

  it('#generateFileName', () => {
    const fileName = 'file.txt';
    const result1 = Drive.generateFileName(fileName);
    const result2 = Drive.generateFileName(fileName, 'AUTO');
    const result3 = Drive.generateFileName(fileName, 'HASH');
    expect(result1).to.equal(fileName);
    expect(result2).to.equal('xxxx-xxxxxx-xxxx-xxxx.txt');
    expect(result3).to.equal('3d8e577bddb17db339eae0b3d9bcf180.txt'); // md5('file.txt')
  });

  it('#buildFileUrl (default)', () => {
    const result = Drive.buildFileUrl('xxx');
    expect(result).to.equal('https://drive.google.com/uc?id=xxx');
  });

  it('#buildFileUrl (custom)', () => {
    const Drive1 = drive({
      uploadFolder: 'xxx',
      urlBuilder: ['url:', ':surfix'],
    });
    const Drive2 = drive({
      uploadFolder: 'xxx',
      urlBuilder: id => id,
    });
    const result1 = Drive1.buildFileUrl('xxx');
    const result2 = Drive2.buildFileUrl('xxx');
    expect(result1).to.equal('url:xxx:surfix');
    expect(result2).to.equal('xxx');
  });

  it('#getFileInfo', () => {
    const result = Drive.getFileInfo({
      getId: () => 'file-xxx',
      getName: () => 'The file',
      getMimeType: () => 'text/plain',
      getDescription: () => 'The file description.',
      getSize: () => 12345,
      getUrl: () => 'url',
    } as any);
    expect(result).to.eql({
      id: 'file-xxx',
      name: 'The file',
      mimeType: 'text/plain',
      description: 'The file description.',
      size: 12345,
      link: 'url',
      url: 'https://drive.google.com/uc?id=file-xxx',
      downloadUrl: 'https://drive.google.com/uc?id=file-xxx&export=download',
    });
  });

  it('#getUploadFolder', () => {
    getUploadFolderStub.restore();

    global['DriveApp'] = {
      getFolderById: (id: string) => id,
    };
    const result = Drive.getUploadFolder();
    expect(result).to.equal('xxx');
  });

  it('#getOrCreateFolderByName (no provided parent - use the upload folder, not exists)', () => {
    getOrCreateFolderByNameStub.restore();

    getUploadFolderStub.returns({
      getFoldersByName: () => ({
        hasNext: () => false,
      }),
      createFolder: (name: string) => name,
    } as any);

    const result = Drive.getOrCreateFolderByName('xxx2');
    expect(result).to.equal('xxx2');
  });

  it('#getOrCreateFolderByName (no provided parent - use the upload folder, exists)', () => {
    getOrCreateFolderByNameStub.restore();

    getUploadFolderStub.returns({
      getFoldersByName: () => ({
        hasNext: () => true,
        next: () => 'xxx2', // return existing folder
      }),
    } as any);

    const result = Drive.getOrCreateFolderByName('xxx');
    expect(result).to.equal('xxx2');
  });

  it('#getOrCreateFolderByName (has parent)', () => {
    getOrCreateFolderByNameStub.restore();

    const result = Drive.getOrCreateFolderByName('xxx', {
      getFoldersByName: () => ({
        hasNext: () => true,
        next: () => 'xxx2', // return existing folder
      }),
    } as any);
    expect(result).to.equal('xxx2');
  });

  it('#createFolderByYearAndMonth', () => {
    let yearFolderInput: any;
    let monthFolderInput: any;
    getOrCreateFolderByNameStub.onFirstCall().callsFake(
      (name: string, folder?: any) => yearFolderInput = { name, folder },
    );
    getOrCreateFolderByNameStub.onSecondCall().callsFake(
      (name: string, folder?: any) => monthFolderInput = { name, folder },
    );

    const date = new Date();
    const yearStr = '' + date.getFullYear();
    let monthStr: any = date.getMonth() + 1;
      monthStr = '' + (monthStr < 10 ? '0' + monthStr : monthStr);

    const result = Drive.createFolderByYearAndMonth();
    expect(yearFolderInput).to.eql({ name: yearStr, folder: undefined });
    expect(monthFolderInput).to.eql({
      name: monthStr,
      folder: { name: yearStr, folder: undefined },
    });
  });

  it('#createFileFromBase64Body', () => {
    global['Utilities'].base64Decode = (base64Body, charset) => ({ base64Body, charset });
    global['Utilities'].newBlob = (data, mimeType, fileName) => ({ data, mimeType, fileName });

    const result = Drive.createFileFromBase64Body(
      { createFile: input => input } as any,
      'file.txt',
      'text/plain',
      'Abc=',
    );
    expect(result).to.eql({
      data: {
        base64Body: 'Abc=',
        charset: 'UTF_8',
      },
      fileName: 'file.txt',
      mimeType: 'text/plain',
    });
  });

  it('#setFileSharing (use preset, default)', () => {
    const result = Drive.setFileSharing({
      setSharing: (access, permission) => ({ access, permission }),
    } as any);
    expect(result).to.eql({ access: 'PRIVATE', permission: 'VIEW' });
  });

  it('#setFileSharing (use preset)', () => {
    const result = Drive.setFileSharing(
      { setSharing: (access, permission) => ({ access, permission }) } as any,
      'PUBLIC',
    );
    expect(result).to.eql({ access: 'ANYONE_WITH_LINK', permission: 'VIEW' });
  });

  it('#setFileSharing (custom)', () => {
    const result = Drive.setFileSharing(
      { setSharing: (access, permission) => ({ access, permission }) } as any,
      {
        access: 'ANYONE',
        permission: 'NONE',
      },
    );
    expect(result).to.eql({ access: 'ANYONE', permission: 'NONE' });
  });

  it('#setEditPermissionForUser (no auth)', () => {
    const file: any = {
      editors: null,
      addEditors: emails => file.editors = emails,
    };
    const result = Drive.setEditPermissionForUser(file, null);
    expect(result['editors']).to.equal(null);
  });

  it('#setEditPermissionForUser (auth, no email)', () => {
    const file: any = {
      editors: null,
      addEditors: emails => file.editors = emails,
    };
    const result = Drive.setEditPermissionForUser(file, { uid: 'xxx' }); // no email
    expect(result['editors']).to.equal(null);
  });

  it('#setEditPermissionForUser', () => {
    const file: any = {
      editors: null,
      addEditors: emails => file.editors = emails,
    };
    const result = Drive.setEditPermissionForUser(file, {
      uid: 'xxx',
      email: 'xxx@gmail.com',
    });
    expect(result['editors']).to.eql([
      'xxx@gmail.com',
    ]);
  });

});

describe('Drive routes', () => {

  const routerRecorder = {};
  const Router = {
    get: (endpoint, ...handlers) => {
      routerRecorder['GET:' + endpoint] = handlers;
    },
    post: (endpoint, ...handlers) => {
      routerRecorder['POST:' + endpoint] = handlers;
    },
    setDisabled: () => true,
    setErrors: () => true,
  };

  // prepare
  before();

  // register routes
  // Drive.registerRoutes({
  //   router: Router as any,
  // });

  // it('register routes', () => {
  //   expect(Object.keys(routerRecorder)).to.eql([
  //     'GET:/storage',
  //     'PUT:/storage',
  //     'POST:/storage',
  //     'DELETE:/storage',
  //   ]);
  //   expect(routerRecorder['GET:/storage'].length).to.equal(3);
  //   expect(routerRecorder['PUT:/storage'].length).to.equal(3);
  //   expect(routerRecorder['POST:/storage'].length).to.equal(3);
  //   expect(routerRecorder['DELETE:/storage'].length).to.equal(3);
  // });

});

// describe('Routes test', () => {

//     beforeEach(() => {
//         routerRecorder = {}; // reset recorder
//     });

//     it('#registerRoutes should throw error (no router)', () => {
//         expect(
//             Drive.registerRoutes.bind(Drive, { router: null }),
//         ).to.throw();
//     });

//     it('#registerRoutes should have default disable routes', () => {
//         Drive.registerRoutes({ router });
//         const disabledRoutes = Sheetbase.Option.getDisabledRoutes();
//         expect(disabledRoutes).to.eql(['post:/storage', 'put:/storage']);
//     });

//     it('#registerRoutes should disable route GET /storage (also override default)', () => {
//         Drive.registerRoutes({
//             router, disabledRoutes: ['get:/storage'],
//         });
//         const disabledRoutes = Sheetbase.Option.getDisabledRoutes();
//         expect(disabledRoutes.indexOf('get:/storage') > -1).to.equal(true);
//     });

//     it('#registerRoutes should register all routes', () => {
//         Drive.registerRoutes({ router });
//         expect(routerRecorder).to.have.property('GET:/storage');
//         expect(routerRecorder).to.have.property('POST:/storage');
//         expect(routerRecorder).to.have.property('PUT:/storage');
//     });

//     it('#registerRoutes should use different endpoint', () => {
//         Drive.registerRoutes({
//             router, endpoint: 'file',
//         });
//         expect(routerRecorder).to.not.have.property('GET:/storage');
//         expect(routerRecorder).to.have.property('GET:/file');
//     });

//     it('#registerRoutes should have proper middlewares', () => {
//         Drive.registerRoutes({
//             router,
//         });
//         const handlers = routerRecorder['GET:/storage'];
//         const [ middleware, handler ] = handlers;
//         expect(handlers.length).to.equal(2);
//         expect(middleware instanceof Function).to.equal(true);
//         expect(handler instanceof Function).to.equal(true);
//     });

//     it('#registerRoutes should have proper middlewares (custom)', () => {
//         Drive.registerRoutes({
//             router,
//             middlewares: [
//                 (req, res, next) => next(),
//                 (req, res, next) => next(),
//             ],
//         });
//         const handlers = routerRecorder['GET:/storage'];
//         expect(handlers.length).to.equal(3);
//     });

// });

// describe('Methods test', () => {
//     const hasPermissionStub = sinon.stub(Drive, 'hasPermission');

//     afterEach(() => {
//         hasPermissionStub.restore();
//     });

//     it('#get should throw error (no id)', () => {
//         expect(
//             Drive.get.bind(Drive, null),
//         ).to.throw('file/no-id');
//     });

//     it('#get should throw error (no permission)');

//     it('#get should work');

//     it('#upload should throw error (no fileResource)', () => {
//         expect(
//             Drive.upload.bind(Drive, null),
//         ).to.throw('file/invalid-file-resource');
//     });

//     it('#upload should throw error (invalid fileResource type)', () => {
//         expect(
//             Drive.upload.bind(Drive, 'a string'),
//         ).to.throw('file/invalid-file-resource');
//     });

//     it('#upload should throw error (missing fileResource props)', () => {
//         expect(
//             Drive.upload.bind(Drive, {}),
//         ).to.throw('file/invalid-file-resource');
//     });

//     it('#upload should throw error (missing fileResource.base64Content)', () => {
//         expect(
//             Drive.upload.bind(Drive, {
//                 mimeType: 'type1',
//                 name: 'file1',
//             }),
//         ).to.throw('file/invalid-file-resource');
//     });

//     it('#upload should throw error (missing fileResource.mimeType)', () => {
//         expect(
//             Drive.upload.bind(Drive, {
//                 base64Content: 'xxx',
//                 name: 'file1',
//             }),
//         ).to.throw('file/invalid-file-resource');
//     });

//     it('#upload should throw error (missing fileResource.name)', () => {
//         expect(
//             Drive.upload.bind(Drive, {
//                 base64Content: 'xxx',
//                 mimeType: 'type1',
//             }),
//         ).to.throw('file/invalid-file-resource');
//     });

// });