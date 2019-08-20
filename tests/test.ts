import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { drive, DriveService } from '../src/public_api';

let Drive: DriveService;

let isFileSharedStub: sinon.SinonStub;
let isValidFileTypeStub: sinon.SinonStub;
let isValidFileSizeStub: sinon.SinonStub;
let generateFileNameStub: sinon.SinonStub;
let getFileInfoStub: sinon.SinonStub;
let getFilesInfoStub: sinon.SinonStub;
let createFileFromBase64BodyStub: sinon.SinonStub;
let getUploadFolderStub: sinon.SinonStub;
let getOrCreateFolderByNameStub: sinon.SinonStub;
let createFolderByYearAndMonthStub: sinon.SinonStub;
let setFileSharingStub: sinon.SinonStub;
let setEditPermissionForUserStub: sinon.SinonStub;
let hasViewPermissionStub: sinon.SinonStub;
let hasEditPermissionStub: sinon.SinonStub;
let getFileByIdStub: sinon.SinonStub;
let getFileInfoByIdStub: sinon.SinonStub;
let uploadFileStub: sinon.SinonStub;
let uploadFilesStub: sinon.SinonStub;
let updateFileStub: sinon.SinonStub;
let removeFileStub: sinon.SinonStub;

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
      EDIT: 'EDIT',
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
  isFileSharedStub = sinon.stub(Drive, 'isFileShared');
  isValidFileTypeStub = sinon.stub(Drive, 'isValidFileType');
  isValidFileSizeStub = sinon.stub(Drive, 'isValidFileSize');
  generateFileNameStub = sinon.stub(Drive, 'generateFileName');
  getFileInfoStub = sinon.stub(Drive, 'getFileInfo');
  getFilesInfoStub = sinon.stub(Drive, 'getFilesInfo');
  createFileFromBase64BodyStub = sinon.stub(Drive, 'createFileFromBase64Body');
  getUploadFolderStub = sinon.stub(Drive, 'getUploadFolder');
  getOrCreateFolderByNameStub = sinon.stub(Drive, 'getOrCreateFolderByName');
  createFolderByYearAndMonthStub = sinon.stub(Drive, 'createFolderByYearAndMonth');
  setFileSharingStub = sinon.stub(Drive, 'setFileSharing');
  setEditPermissionForUserStub = sinon.stub(Drive, 'setEditPermissionForUser');
  hasViewPermissionStub = sinon.stub(Drive, 'hasViewPermission');
  hasEditPermissionStub = sinon.stub(Drive, 'hasEditPermission');
  getFileByIdStub = sinon.stub(Drive, 'getFileById');
  getFileInfoByIdStub = sinon.stub(Drive, 'getFileInfoById');
  uploadFileStub = sinon.stub(Drive, 'uploadFile');
  uploadFilesStub = sinon.stub(Drive, 'uploadFiles');
  updateFileStub = sinon.stub(Drive, 'updateFile');
  removeFileStub = sinon.stub(Drive, 'removeFile');

}

function after() {
  isFileSharedStub.restore();
  isValidFileTypeStub.restore();
  isValidFileSizeStub.restore();
  generateFileNameStub.restore();
  getFileInfoStub.restore();
  getFilesInfoStub.restore();
  createFileFromBase64BodyStub.restore();
  getUploadFolderStub.restore();
  getOrCreateFolderByNameStub.restore();
  createFolderByYearAndMonthStub.restore();
  setFileSharingStub.restore();
  setEditPermissionForUserStub.restore();
  hasViewPermissionStub.restore();
  hasEditPermissionStub.restore();
  getFileByIdStub.restore();
  getFileInfoByIdStub.restore();
  uploadFileStub.restore();
  uploadFilesStub.restore();
  updateFileStub.restore();
  removeFileStub.restore();
}

/**
 * test start
 */

describe('DriveService (instance)', () => {

  beforeEach(before);
  afterEach(after);

  it('Drive service should be created', () => {
    expect(!!Drive).to.equal(true);
  });

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

});

describe('DriveService (helpers)', () => {

  beforeEach(before);
  afterEach(after);

  it('#base64Parser should throw error, malform', () => {
    expect(
      Drive.base64Parser.bind(Drive, 'xxx'),
    ).to.throw('Malform base64 data.');
  });

  it('#base64Parser', () => {
    const result = Drive.base64Parser('data:xxx;base64,Abc=');
    expect(result).to.eql({
      mimeType: 'xxx',
      size: 2.25,
      base64Body: 'Abc=',
    });
  });

  it('#isFileInsideUploadFolder (not)', () => {
    const parents = ['abc', '123']; // no 'xxx'
    const result = Drive.isFileInsideUploadFolder({
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

  it('#isFileInsideUploadFolder', () => {
    const parents = ['abc', 'xxx'];
    const result = Drive.isFileInsideUploadFolder({
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
    isFileSharedStub.restore();

    const result = Drive.isFileShared({
      getSharingAccess: () => 'NONE',
    } as any);
    expect(result).to.equal(false);
  });

  it('#isFileShared', () => {
    isFileSharedStub.restore();

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
    isValidFileTypeStub.restore();

    const result = Drive.isValidFileType('any');
    expect(result).to.equal(true);
  });

  it('#isValidFileType (has allowTypes, not allowed)', () => {
    isValidFileTypeStub.restore();

    const Drive = drive({
      uploadFolder: 'xxx',
      allowTypes: ['text/plain'],
    });
    const result = Drive.isValidFileType('text/rich');
    expect(result).to.equal(false);
  });

  it('#isValidFileType (has allowTypes, allowed)', () => {
    isValidFileTypeStub.restore();

    const Drive = drive({
      uploadFolder: 'xxx',
      allowTypes: ['text/rich'],
    });
    const result = Drive.isValidFileType('text/rich');
    expect(result).to.equal(true);
  });

  it('#isValidFileSize (no maxSize or 0, all allowed)', () => {
    isValidFileSizeStub.restore();

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
    isValidFileSizeStub.restore();

    const result = Drive.isValidFileSize(11000000); // 1MB
    expect(result).to.equal(false);
  });

  it('#isValidFileSize (has maxSize, allowed)', () => {
    isValidFileSizeStub.restore();

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
    generateFileNameStub.restore();

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
    getFileInfoStub.restore();

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

  it('#getFilesInfo', () => {
    getFilesInfoStub.restore();

    getFileInfoStub.returns('xxx');
    const result = Drive.getFilesInfo([ null, null, null]);
    expect(result).to.eql([ 'xxx', 'xxx', 'xxx' ]);
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
    createFolderByYearAndMonthStub.restore();

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
    createFileFromBase64BodyStub.restore();

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
    setFileSharingStub.restore();

    const result = Drive.setFileSharing({
      setSharing: (access, permission) => ({ access, permission }),
    } as any);
    expect(result).to.eql({ access: 'PRIVATE', permission: 'VIEW' });
  });

  it('#setFileSharing (use preset)', () => {
    setFileSharingStub.restore();

    const result = Drive.setFileSharing(
      { setSharing: (access, permission) => ({ access, permission }) } as any,
      'PUBLIC',
    );
    expect(result).to.eql({ access: 'ANYONE_WITH_LINK', permission: 'VIEW' });
  });

  it('#setFileSharing (custom)', () => {
    setFileSharingStub.restore();

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
    setEditPermissionForUserStub.restore();

    const file: any = {
      editors: null,
      addEditors: emails => file.editors = emails,
    };
    const result = Drive.setEditPermissionForUser(file, null);
    expect(result['editors']).to.equal(null);
  });

  it('#setEditPermissionForUser (auth, no email)', () => {
    setEditPermissionForUserStub.restore();

    const file: any = {
      editors: null,
      addEditors: emails => file.editors = emails,
    };
    const result = Drive.setEditPermissionForUser(file, { uid: 'xxx' }); // no email
    expect(result['editors']).to.equal(null);
  });

  it('#setEditPermissionForUser', () => {
    setEditPermissionForUserStub.restore();

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

describe('DriveService (security)', () => {

  beforeEach(before);
  afterEach(after);

  it('#hasEditPermission (no auth)', () => {
    hasEditPermissionStub.restore();

    const result = Drive.hasEditPermission({
      getAccess: email => 'EDIT',
    } as any);
    expect(result).to.equal(false);
  });

  it('#hasEditPermission (no email)', () => {
    hasEditPermissionStub.restore();

    // @ts-ignore
    Drive.auth = { uid: 'xxx' };
    const result = Drive.hasEditPermission({
      getAccess: email => 'EDIT',
    } as any);
    expect(result).to.equal(false);
  });

  it('#hasEditPermission (no permission)', () => {
    hasEditPermissionStub.restore();

    // @ts-ignore
    Drive.auth = { uid: 'xxx', email: 'xxx@gmail.com' };
    const result = Drive.hasEditPermission({
      getAccess: email => 'VIEW',
    } as any);
    expect(result).to.equal(false);
  });

  it('#hasEditPermission (has permission)', () => {
    hasEditPermissionStub.restore();

    // @ts-ignore
    Drive.auth = { uid: 'xxx', email: 'xxx@gmail.com' };
    const result = Drive.hasEditPermission({
      getAccess: email => 'EDIT',
    } as any);
    expect(result).to.equal(true);
  });

  it('#hasViewPermission (no permission)', () => {
    hasViewPermissionStub.restore();

    isFileSharedStub.returns(false);
    hasEditPermissionStub.returns(false);

    const result = Drive.hasViewPermission(null);
    expect(result).to.equal(false);
  });

  it('#hasViewPermission (public)', () => {
    hasViewPermissionStub.restore();

    isFileSharedStub.returns(true);
    hasEditPermissionStub.returns(false);

    const result = Drive.hasViewPermission(null);
    expect(result).to.equal(true);
  });

  it('#hasViewPermission (has edit permission)', () => {
    hasViewPermissionStub.restore();

    isFileSharedStub.returns(false);
    hasEditPermissionStub.returns(true);

    const result = Drive.hasViewPermission(null);
    expect(result).to.equal(true);
  });

});

describe('DriveService (main)', () => {

  beforeEach(before);
  afterEach(after);

  it('#getFileById (item in trash)', () => {
    getFileByIdStub.restore();

    hasViewPermissionStub.returns(true);
    global['DriveApp'].getFileById = () => ({
      isTrashed: () => true,
    });
    expect(
      Drive.getFileById.bind(Drive, 'xxx'),
    ).to.throws('file/no-file');
  });

  it('#getFileById (no view permission)', () => {
    getFileByIdStub.restore();

    hasViewPermissionStub.returns(false);
    global['DriveApp'].getFileById = () => ({
      isTrashed: () => false,
    });
    expect(
      Drive.getFileById.bind(Drive, 'xxx'),
    ).to.throws('file/no-file');
  });

  it('#getFileById', () => {
    getFileByIdStub.restore();

    hasViewPermissionStub.returns(true);
    global['DriveApp'].getFileById = id => ({
      isTrashed: () => false,
      id,
    });
    const result = Drive.getFileById('xxx');
    expect(result['id']).to.equal('xxx');
  });

  it('#getFileInfoById', () => {
    getFileInfoByIdStub.restore();

    getFileInfoStub.returns(true as any);
    const result = Drive.getFileInfoById('xxx');
    expect(result).to.equal(true);
  });

  it('#uploadFile (invalid upload)', () => {
    uploadFileStub.restore();

    expect(
      Drive.uploadFile.bind(Drive, null),
    ).to.throws('file/invalid-upload', 'no resource');
    expect(
      Drive.uploadFile.bind(Drive, { name: 'file.txt' }),
    ).to.throws('file/invalid-upload', 'no base64String');
    expect(
      Drive.uploadFile.bind(Drive, { base64Value: 'data:text/plain;base64,Abc=' }),
    ).to.throws('file/invalid-upload', 'no name');
  });

  it('#uploadFile (invalid type & size)', () => {
    uploadFileStub.restore();

    const upload = {
      name: 'file.txt',
      base64Value: 'data:text/plain;base64,Abc=',
    };
    isValidFileTypeStub.onFirstCall().returns(false);
    isValidFileTypeStub.onSecondCall().returns(true);
    isValidFileSizeStub.returns(false);
    expect(
      Drive.uploadFile.bind(Drive, upload),
    ).to.throws('file/invalid-type');
    expect(
      Drive.uploadFile.bind(Drive, upload),
    ).to.throws('file/invalid-size');
  });

  it('#uploadFile (with no custom + no nested)', () => {
    uploadFileStub.restore();
    isValidFileTypeStub.restore();
    isValidFileSizeStub.restore();

    // args recorder
    let folder: any = null;
    let getOrCreateFolderByNameArgs: any = null; // custom folder
    let generateFileNameArgs: any = null; // file name
    let createFileFromBase64BodyArgs: any = null; // create the file
    let createFolderByYearAndMonthArgs: any = null; // nested
    let setFileSharingArgs: any = null;
    let setEditPermissionForUserArgs: any = null;
    // stubs
    getUploadFolderStub.callsFake(() => folder = {});
    getOrCreateFolderByNameStub.callsFake(
      (... args) => getOrCreateFolderByNameArgs = args,
    );
    createFolderByYearAndMonthStub.callsFake(
      (... args) => createFolderByYearAndMonthArgs = args,
    );
    generateFileNameStub.callsFake(
      (... args) => {
        generateFileNameArgs = args;
        return args[0]; // input name
      },
    );
    createFileFromBase64BodyStub.callsFake(
      (... args) => {
        createFileFromBase64BodyArgs = args;
        return true;
      },
    );
    setFileSharingStub.callsFake(
      (... args) => setFileSharingArgs = args,
    );
    setEditPermissionForUserStub.callsFake(
      (... args) => setEditPermissionForUserArgs = args,
    );

    const result = Drive.uploadFile(
      {
        name: 'file.txt',
        base64Value: 'data:text/plain;base64,Abc=',
      },
    );
    expect(folder).eql({});
    expect(getOrCreateFolderByNameArgs).equal(null, 'no custom folder'); // never
    expect(createFolderByYearAndMonthArgs).equal(null, 'no nested'); // never
    expect(generateFileNameArgs).eql([ 'file.txt', undefined ]);
    expect(createFileFromBase64BodyArgs).eql([ {}, 'file.txt', 'text/plain', 'Abc=' ]);
    expect(setFileSharingArgs).eql([ true, 'PRIVATE' ]); // file = result from createFileFromBase64Body
    expect(setEditPermissionForUserArgs).eql([ true, null ]);
  });

  it('#uploadFile (test parent folder, has custom)', () => {
    uploadFileStub.restore();
    isValidFileTypeStub.restore();
    isValidFileSizeStub.restore();

    // args recorder
    let getOrCreateFolderByNameArgs: any = null; // custom folder
    let createFolderByYearAndMonthArgs: any = null; // nested
    // stubs
    getUploadFolderStub.returns({});
    getOrCreateFolderByNameStub.callsFake(
      (... args) => getOrCreateFolderByNameArgs = args,
    );
    createFolderByYearAndMonthStub.callsFake(
      (... args) => createFolderByYearAndMonthArgs = args,
    );
    generateFileNameStub.returns(true);
    createFileFromBase64BodyStub.returns(true);
    setFileSharingStub.returns(true);
    setEditPermissionForUserStub.returns(true);

    const result = Drive.uploadFile(
      {
        name: 'file.txt',
        base64Value: 'data:text/plain;base64,Abc=',
      },
      'xxx',
    );
    expect(getOrCreateFolderByNameArgs).eql([ 'xxx', {} ]);
    expect(createFolderByYearAndMonthArgs).equal(null); // never
  });

  it('#uploadFile (test parent folder, nested)', () => {
    uploadFileStub.restore();
    isValidFileTypeStub.restore();
    isValidFileSizeStub.restore();

    // args recorder
    let getOrCreateFolderByNameArgs: any = null; // custom folder
    let createFolderByYearAndMonthArgs: any = null; // nested
    // stubs
    getUploadFolderStub.returns({});
    getOrCreateFolderByNameStub.callsFake(
      (... args) => getOrCreateFolderByNameArgs = args,
    );
    createFolderByYearAndMonthStub.callsFake(
      (... args) => createFolderByYearAndMonthArgs = args,
    );
    generateFileNameStub.returns(true);
    createFileFromBase64BodyStub.returns(true);
    setFileSharingStub.returns(true);
    setEditPermissionForUserStub.returns(true);

    // @ts-ignore
    Drive.options.nested = true;
    const result = Drive.uploadFile(
      {
        name: 'file.txt',
        base64Value: 'data:text/plain;base64,Abc=',
      },
    );
    expect(getOrCreateFolderByNameArgs).equal(null); // never
    expect(createFolderByYearAndMonthArgs).eql([ {} ]);
  });

  it('#uploadFiles', () => {
    uploadFilesStub.restore();

    uploadFileStub.returns('xxx');

    const result = Drive.uploadFiles([
      { file: null },
      { file: null },
      { file: null },
    ]);
    expect(result).to.eql([ 'xxx', 'xxx', 'xxx' ]);
  });

  it('#updateFile (no edit permission)', () => {
    updateFileStub.restore();

    getFileByIdStub.returns({});
    hasEditPermissionStub.returns(false);
    expect(
      Drive.updateFile.bind(Drive, 'xxx'),
    ).to.throws('file/no-edit');
  });

  it('#updateFile', () => {
    updateFileStub.restore();

    const file = {
      name: null,
      description: null,
      sharing: null,
      content: null,
      setName: name => file.name = name,
      setDescription: description => file.description = description,
      setContent: content => file.content = content,
    };
    setFileSharingStub.callsFake((f, sharing) => {
      file.sharing = sharing;
      return file;
    });
    getFileByIdStub.returns(file);
    hasEditPermissionStub.returns(true);
    const result = Drive.updateFile('xxx', {
      name: 'New name',
      description: 'New description.',
      sharing: 'PRIVATE',
      content: 'New content.',
    });
    expect(result['name']).to.equal('New name');
    expect(result['description']).to.equal('New description.');
    expect(result['sharing']).to.equal('PRIVATE');
    expect(result['content']).to.equal('New content.');
  });

  it('#removeFile (no edit permission)', () => {
    removeFileStub.restore();

    getFileByIdStub.returns({});
    hasEditPermissionStub.returns(false);
    expect(
      Drive.removeFile.bind(Drive, 'xxx'),
    ).to.throws('file/no-edit');
  });

  it('#removeFile', () => {
    removeFileStub.restore();

    getFileByIdStub.returns({
      setTrashed: () => true,
    });
    hasEditPermissionStub.returns(true);
    const result = Drive.removeFile('xxx');
    expect(result).to.equal(true);
  });

});

describe('Drive routes', () => {

  const routerRecorder = {};
  const Router = {
    get: (endpoint, ...handlers) => routerRecorder['GET:' + endpoint] = handlers,
    put: (endpoint, ...handlers) => routerRecorder['PUT:' + endpoint] = handlers,
    post: (endpoint, ...handlers) => routerRecorder['POST:' + endpoint] = handlers,
    delete: (endpoint, ...handlers) => routerRecorder['DELETE:' + endpoint] = handlers,
    setDisabled: () => true,
    setErrors: () => true,
  };

  // prepare
  before();
  getFileInfoByIdStub.callsFake(id => id);
  getFileInfoStub.returns('xxx');
  getFilesInfoStub.returns([ 'xxx' ]);
  uploadFileStub.returns({} as any);
  uploadFilesStub.returns([] as any);

  // register routes
  Drive.registerRoutes({
    router: Router as any,
  });

  it('register routes', () => {
    expect(Object.keys(routerRecorder)).to.eql([
      'GET:/storage',
      'PUT:/storage',
      'POST:/storage',
      'DELETE:/storage',
    ]);
    expect(routerRecorder['GET:/storage'].length).to.equal(3);
    expect(routerRecorder['PUT:/storage'].length).to.equal(3);
    expect(routerRecorder['POST:/storage'].length).to.equal(3);
    expect(routerRecorder['DELETE:/storage'].length).to.equal(3);
  });

  it('GET /storage', () => {
    const handler = routerRecorder['GET:/storage'].pop();
    const result = handler({
      query: { id: 'xxx' },
    }, {
      success: data => data,
    });
    expect(result).to.equal('xxx');
  });

  it('PUT /storage', () => {
    const handler = routerRecorder['PUT:/storage'][
      routerRecorder['PUT:/storage'].length - 1
    ];
    const result = handler({
      body: { file: {} },
    }, {
      success: data => data,
    });
    expect(result).to.equal('xxx');
  });

  it('PUT /storage (multiple)', () => {
    const handler = routerRecorder['PUT:/storage'][
      routerRecorder['PUT:/storage'].length - 1
    ];
    const result = handler({
      body: { files: [] },
    }, {
      success: data => data,
    });
    expect(result).to.eql([ 'xxx' ]);
  });

  it('POST /storage', () => {
    const handler = routerRecorder['POST:/storage'].pop();
    const result = handler({
      body: { id: 'xxx', data: null },
    }, {
      success: data => data,
    });
    expect(result).to.eql({ done: true });
  });

  it('DELETE /storage', () => {
    const handler = routerRecorder['DELETE:/storage'].pop();
    const result = handler({
      body: { id: 'xxx' },
    }, {
      success: data => data,
    });
    expect(result).to.eql({ done: true });
  });

});
