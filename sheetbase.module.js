var exports = exports || {};
var module = module || { exports: exports };
/**
 * Sheetbase module
 * Name: @sheetbase/drive-server
 * Export name: Drive
 * Description: File management with Drive for Sheetbase backend app.
 * Version: 0.0.2
 * Author: Sheetbase
 * Homepage: https://sheetbase.net
 * License: MIT
 * Repo: https://github.com/sheetbase/module-drive-server.git
 */

function DriveModule() {
    // import { IModule as ISheetbaseModule, IAddonRoutesOptions } from '@sheetbase/core-server';
    var Drive = /** @class */ (function () {
        function Drive() {
        }
        Drive.prototype.init = function (Sheetbase) {
            this._Sheetbase = Sheetbase;
            return this;
        };
        Drive.prototype.registerRoutes = function (options) {
            if (options === void 0) { options = null; }
            driveModuleRoutes(this._Sheetbase, this, options);
        };
        Drive.prototype.get = function (fileId) {
            var contentFolderId = this._Sheetbase.Config.get('contentFolder');
            if (!fileId) {
                throw new Error('file/missing');
            }
            try {
                if (!contentFolderId) {
                    throw new Error(null);
                }
                DriveApp.getFolderById(contentFolderId);
            }
            catch (error) {
                throw new Error('file/not-supported');
            }
            // get the file
            var file = DriveApp.getFileById(fileId);
            // only allow file in the content folder
            var folders = file.getParents();
            var folderIds = [];
            while (folders.hasNext()) {
                folderIds.push(folders.next().getId());
            }
            if (folderIds.indexOf(contentFolderId) < 0) {
                throw new Error('Not allowed!');
            }
            // return
            var id = file.getId();
            var name = file.getName();
            var mimeType = file.getMimeType();
            var description = file.getDescription();
            var size = file.getSize();
            var link = file.getUrl();
            return {
                id: id, name: name, mimeType: mimeType, description: description, size: size, link: link,
                url: 'https://drive.google.com/uc?id=' + id + '&export=download'
            };
        };
        Drive.prototype.upload = function (fileResource, customFolder, rename) {
            if (customFolder === void 0) { customFolder = null; }
            if (rename === void 0) { rename = null; }
            var contentFolderId = this._Sheetbase.Config.get('contentFolder');
            var folder;
            if (!fileResource) {
                throw new Error('file/missing');
            }
            if (!(fileResource instanceof Object) ||
                !fileResource.name || !fileResource.mimeType || !fileResource.base64Content) {
                throw new Error('file/invalid');
            }
            try {
                if (!contentFolderId) {
                    throw new Error(null);
                }
                folder = DriveApp.getFolderById(contentFolderId);
            }
            catch (error) {
                throw new Error('file/not-supported');
            }
            // get uploads folder
            folder = this._getFolderByName(folder, 'uploads');
            // custom folder
            if (customFolder) {
                folder = this._getFolderByName(folder, customFolder);
            }
            else {
                var date = new Date();
                var year = '' + date.getFullYear();
                var month = date.getMonth() + 1;
                month = '' + (month < 10 ? '0' + month : month);
                folder = this._getFolderByName(folder, year);
                folder = this._getFolderByName(folder, month);
            }
            var fileName = fileResource.name;
            var fileExt = fileName.split('.').pop();
            if (rename) {
                fileName = rename.indexOf(fileExt) > -1 ? rename : rename + '.' + fileExt;
            }
            if (rename === 'MD5') {
                fileName = Md5.md5(fileName) + '.' + fileExt;
            }
            if (rename === 'AUTO') {
                fileName = Utilities.getUuid() + '.' + fileExt;
            }
            var newFile = folder.createFile(Utilities.newBlob(Utilities.base64Decode(fileResource.base64Content, Utilities.Charset.UTF_8), fileResource.mimeType, fileName)).setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
            var id = newFile.getId();
            var name = newFile.getName();
            var mimeType = newFile.getMimeType();
            var description = newFile.getDescription();
            var size = newFile.getSize();
            var link = newFile.getUrl();
            return {
                id: id, name: name, mimeType: mimeType, description: description, size: size, link: link,
                url: 'https://drive.google.com/uc?id=' + id + '&export=download'
            };
        };
        Drive.prototype._getFolderByName = function (parentFolder, folderName) {
            var folder = parentFolder;
            var childFolders = folder.getFoldersByName(folderName);
            if (!childFolders.hasNext()) {
                folder = folder.createFolder(folderName);
            }
            else {
                folder = childFolders.next();
            }
            return folder;
        };
        return Drive;
    }());
    // import { IModule as ISheetbaseModule, IRoutingErrors, IAddonRoutesOptions, IHttpHandler } from '@sheetbase/core-server';
    // import { IModule, IFileResource } from './types/module';
    var DRIVE_ROUTING_ERRORS = {
        'file/unknown': {
            status: 400, message: 'Unknown errors.'
        },
        'file/missing': {
            status: 400, message: 'Missing inputs.'
        },
        'file/not-supported': {
            status: 400, message: 'Not supported.'
        },
        'file/invalid': {
            status: 400, message: 'File data must contains name, mimeType and base64String.'
        }
    };
    function driveModuleRoutes(Sheetbase, Drive, options) {
        var _a, _b;
        var customName = options.customName || 'file';
        var middlewares = options.middlewares || ([
            function (req, res, next) { return next(); }
        ]);
        // get file information
        (_a = Sheetbase.Router).get.apply(_a, ['/' + customName].concat(middlewares, [function (req, res) {
                var fileId = req.queries['fileId'];
                var result;
                try {
                    result = Drive.get(fileId);
                }
                catch (code) {
                    var _a = DRIVE_ROUTING_ERRORS[code], status = _a.status, message = _a.message;
                    return res.error(code, message, status);
                }
                return res.success(result);
            }]));
        // upload a file
        (_b = Sheetbase.Router).put.apply(_b, ['/' + customName].concat(middlewares, [function (req, res) {
                var fileResource = req.body.fileResource;
                var customFolder = req.body.customFolder;
                var rename = req.body.rename;
                var result;
                try {
                    result = Drive.upload(fileResource, customFolder, rename);
                }
                catch (code) {
                    var _a = DRIVE_ROUTING_ERRORS[code], status = _a.status, message = _a.message;
                    return res.error(code, message, status);
                }
                return res.success(result);
            }]));
    }
    // import { IModule } from './types/module';
    // import { Drive } from './drive';
    var moduleExports = new Drive();
    return moduleExports || {};
}
exports.DriveModule = DriveModule;
// add to the global namespace
var proccess = proccess || this;
proccess['Drive'] = DriveModule();
