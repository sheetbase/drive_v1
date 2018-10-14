var exports = exports || {};
var module = module || { exports: exports };
/**
 * Sheetbase module
 * Name: @sheetbase/drive-server
 * Export name: Drive
 * Description: File management with Drive for Sheetbase backend app.
 * Version: 0.0.3
 * Author: Sheetbase
 * Homepage: https://sheetbase.net
 * License: MIT
 * Repo: https://github.com/sheetbase/module-drive-server.git
 */

function DriveModule(options) {
    // import { IAddonRoutesOptions } from '@sheetbase/core-server';
    // import { Md5 } from '@sheetbase/md5-server';
    // import { IFileResource, IMethodGetResult, IMethodUploadResult, IOptions } from '../index';
    // import { driveModuleRoutes } from './routes';
    var Drive = /** @class */ (function () {
        function Drive(options) {
            this._options = {
                contentFolder: null
            };
            this.init(options);
        }
        Drive.prototype.init = function (options) {
            this._options = options;
            return this;
        };
        Drive.prototype.registerRoutes = function (options) {
            driveModuleRoutes(this, this._options.router, options);
        };
        Drive.prototype.get = function (fileId) {
            var contentFolderId = this._options.contentFolder;
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
            var contentFolderId = this._options.contentFolder;
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
    // import { IRoutingErrors, IAddonRoutesOptions, IRouteHandler, IRouter, IRouteResponse } from '@sheetbase/core-server';
    // import { IModule, IFileResource } from './types/module';
    var ROUTING_ERRORS = {
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
    function routingError(res, code) {
        var error = ROUTING_ERRORS[code] || ROUTING_ERRORS['file/unknown'];
        var status = error.status, message = error.message;
        return res.error(code, message, status);
    }
    function driveModuleRoutes(Drive, Router, options) {
        if (!Router) {
            throw new Error('No router, please check out for Sheetbase Router.');
        }
        var endpoint = options.endpoint || 'file';
        var middlewares = options.middlewares || ([
            function (req, res, next) { return next(); }
        ]);
        // get file information
        Router.get.apply(Router, ['/' + endpoint].concat(middlewares, [function (req, res) {
                var result = {};
                try {
                    var fileId = req.query.fileId;
                    result = Drive.get(fileId);
                }
                catch (code) {
                    return routingError(res, code);
                }
                return res.success(result);
            }]));
        // upload a file
        Router.put.apply(Router, ['/' + endpoint].concat(middlewares, [function (req, res) {
                var result = {};
                try {
                    var fileResource = req.body.fileResource;
                    var customFolder = req.body.customFolder;
                    var rename = req.body.rename;
                    result = Drive.upload(fileResource, customFolder, rename);
                }
                catch (code) {
                    return routingError(res, code);
                }
                return res.success(result);
            }]));
    }
    var moduleExports = new Drive(options);
    return moduleExports || {};
}
exports.DriveModule = DriveModule;
// add 'Drive' to the global namespace
(function (process) {
    process['Drive'] = DriveModule();
})(this);
