"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FSDirectory = exports.FSFile = exports.editorProvider = void 0;
const vscode = require("vscode");
const utilities_1 = require("../utilities");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const editorUtils_1 = require("./editorUtils");
const localizedConstants_1 = require("../../constants/localizedConstants");
const logger_1 = require("../../infrastructure/logger");
const helper = require("../../utilities/helper");
const extension_1 = require("../../extension");
const connectionNode_1 = require("../nodes/connectionNode");
const oracleLanguageServerClient_1 = require("../../infrastructure/oracleLanguageServerClient");
const path = require("path");
class editorProvider {
    constructor(vsCodeConnector, dataExpManger) {
        this.vsCodeConnector = vsCodeConnector;
        this.dataExpManger = dataExpManger;
        this.openfiles = new Map();
        this._emitter = new vscode.EventEmitter();
        this._bufferedEvents = [];
        this.currentReadingUri = undefined;
        this.currentReadingPromise = undefined;
        this.lastOpenedUri = undefined;
        this.lastSessionFSFile = new FSFile(undefined, undefined);
        this.onDidChangeFile = this._emitter.event;
    }
    watch(uri, options) {
        return new vscode.Disposable(() => { });
    }
    stat(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (this.currentReadingUri && this.currentReadingUri.toString() === uri.toString()) {
                    yield this.currentReadingPromise;
                }
                let file = this.openfiles.get(uri.toString());
                if (file) {
                    resolve(file);
                }
                else if (uri.path && !uri.path.endsWith('.plsql')) {
                    resolve(new FSDirectory(""));
                }
                else {
                    let params = editorUtils_1.editorUtils.getQueryParameters(uri);
                    if (params) {
                        let systemManager = (0, extension_1.getSystemManager)();
                        if (systemManager.sessionId !== params.sessionId) {
                            resolve(this.lastSessionFSFile);
                            return;
                        }
                    }
                    reject(vscode.FileSystemError.FileNotFound(uri));
                }
            }));
        });
    }
    readDirectory(uri) {
        const result = [];
        return result;
    }
    createDirectory(uri) {
        this.handleNotImplementedError(uri, "createDirectory");
    }
    readFile(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentReadingUri = uri;
            this.lastOpenedUri = uri.toString();
            this.currentReadingPromise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let file = this.openfiles.get(uri.toString());
                    let fileData = undefined;
                    if (file) {
                        fileData = file.data;
                    }
                    logger_1.FileStreamLogger.Instance.info("Start - FileSystemProvider.readFile");
                    if (file && file.validated && fileData) {
                        file.validated = false;
                        resolve(fileData);
                        return;
                    }
                    let params = editorUtils_1.editorUtils.getQueryParameters(uri);
                    if (!params) {
                        logger_1.FileStreamLogger.Instance.error("Error on reading file, Not able to parse query parameters");
                        if (fileData) {
                            resolve(fileData);
                        }
                        else {
                            reject(vscode.FileSystemError.FileNotFound(uri.fsPath));
                        }
                        return;
                    }
                    let systemManager = (0, extension_1.getSystemManager)();
                    if (systemManager.sessionId !== params.sessionId) {
                        logger_1.FileStreamLogger.Instance.info("ReadFile - File form a previous session");
                        let filename = uri.fsPath;
                        try {
                            let basename = path.basename(uri.fsPath);
                            if (basename) {
                                filename = basename;
                            }
                        }
                        catch (err) {
                            logger_1.FileStreamLogger.Instance.error("Error on getting filname from filepath.");
                            helper.logErroAfterValidating(err);
                        }
                        let errText = helper.stringFormatterCsharpStyle(localizedConstants_1.default.fileFromLastSessionReadError, filename, params.objectname, editorUtils_1.editorUtils.getObjectTypeFromDdexType(params.ddexObjectType), params.connectionname);
                        resolve(Buffer.from(errText));
                        return;
                    }
                    let connectionNode = this.dataExpManger.getConnectionNode(params.connectionUri);
                    if (!connectionNode || connectionNode.status !== connectionNode_1.ConnectionStatus.Connected) {
                        if (fileData) {
                            resolve(fileData);
                        }
                        else {
                            reject(vscode.FileSystemError.FileNotFound(uri.fsPath));
                        }
                        return;
                    }
                    const [sourceText, createdDateTime, modifiedDateTime, requestResponse, connOpen] = yield utilities_1.ExplorerUtilities.getCodeObjectSource(params.connectionUri, params.ddexObjectType, params.objectname, params.schemaname, false);
                    if (requestResponse.messageType === dataExplorerRequests_1.DataExplorerFetchMessageType.Error) {
                        if (!connOpen && connectionNode) {
                            logger_1.FileStreamLogger.Instance.error("Connection disconnected error on reading file");
                            this.dataExpManger.onConnectionDisconnect(connectionNode, true);
                        }
                        else {
                            logger_1.FileStreamLogger.Instance.error("Error on fetching source : " + requestResponse.message);
                            this.vsCodeConnector.showErrorMessage(requestResponse.message);
                        }
                        if (fileData) {
                            resolve(fileData);
                        }
                        else {
                            reject(vscode.FileSystemError.FileNotFound(uri.fsPath));
                        }
                        return;
                    }
                    else if (!sourceText || !modifiedDateTime || !createdDateTime) {
                        logger_1.FileStreamLogger.Instance.error("Invalid object error on reading file");
                        if (file) {
                            this.delete(uri, { recursive: true });
                        }
                        else {
                            this.vsCodeConnector.showErrorMessage(localizedConstants_1.default.invalidObjectMessage);
                        }
                        if (fileData) {
                            resolve(fileData);
                        }
                        else {
                            reject(vscode.FileSystemError.FileNotFound(uri.fsPath));
                        }
                        return;
                    }
                    else {
                        file = this.prepareFile(file, params.connectionUri, uri, createdDateTime, modifiedDateTime, sourceText);
                        resolve(file.data);
                        return;
                    }
                }
                catch (error) {
                    logger_1.FileStreamLogger.Instance.error("Error on finding if file opened from OE.");
                    helper.logErroAfterValidating(error);
                    reject(vscode.FileSystemError.FileNotFound(uri));
                }
                finally {
                    logger_1.FileStreamLogger.Instance.info("End - FileSystemProvider.readFile");
                    this.currentReadingUri = undefined;
                }
            }));
            return this.currentReadingPromise;
        });
    }
    prepareFile(file, connectionUri, uri, createdDateTime, modifiedDateTime, sourceText, validated = false, saveFile = true) {
        let updateFileStat = false;
        if (!file) {
            file = new FSFile("", connectionUri);
            updateFileStat = true;
        }
        else {
            let editorDoc = editorUtils_1.editorUtils.getEditorDocumentFromUri(uri);
            if (!editorDoc || !editorDoc.isDirty) {
                updateFileStat = true;
            }
        }
        if (updateFileStat) {
            file.ctime = new Date(createdDateTime).getTime();
            file.mtime = new Date(modifiedDateTime).getTime();
            file.lastDdlTime = modifiedDateTime;
        }
        file.data = Buffer.from(sourceText);
        file.size = file.data ? file.data.byteLength : 0;
        file.validated = validated;
        file.saveFile = saveFile;
        this.openfiles.set(uri.toString(), file);
        return file;
    }
    writeFile(uri, content, options) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.FileStreamLogger.Instance.info("Start - FileSystemProvider.writeFile");
                let file = this.openfiles.get(uri.toString());
                if (file) {
                    if (!file.saveFile) {
                        resolve();
                        return;
                    }
                    file.errorOnSave = true;
                }
                let params = editorUtils_1.editorUtils.getQueryParameters(uri);
                if (params) {
                    let systemManager = (0, extension_1.getSystemManager)();
                    if (systemManager.sessionId !== params.sessionId) {
                        logger_1.FileStreamLogger.Instance.info("WriteFile - File is form a previous session of vscode");
                        let errMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.fileFromLastSessionWriteError, uri.fsPath);
                        this.vsCodeConnector.showErrorMessage(errMsg);
                        resolve();
                        return;
                    }
                    let connectionNode = this.dataExpManger.getConnectionNode(params.connectionUri);
                    if (!connectionNode || connectionNode.status !== connectionNode_1.ConnectionStatus.Connected) {
                        reject(new vscode.FileSystemError(localizedConstants_1.default.notConnectedToDatabase));
                        return;
                    }
                }
                if (!this.openfiles.get(uri.toString())) {
                    logger_1.FileStreamLogger.Instance.error("Error on writing file, this object does not exist in our cache");
                    reject(new vscode.FileSystemError(localizedConstants_1.default.cannotCreateNewObjectsFromExplorerFiles));
                    return;
                }
                if (!params) {
                    logger_1.FileStreamLogger.Instance.error("Error on writing file, Not able to parse query parameters");
                    reject(vscode.FileSystemError.FileNotFound(uri.fsPath));
                    return;
                }
                if (!file) {
                    logger_1.FileStreamLogger.Instance.error("Error on writing file, file not found in cache");
                    reject(vscode.FileSystemError.FileNotFound(uri.fsPath));
                    return;
                }
                let checkObjectState = !file.overwriteOnSave;
                let [response, connOpen] = yield utilities_1.ExplorerUtilities.saveToDatabase(uri.toString(), params.connectionUri, params.ddexObjectType, params.objectname, params.schemaname, checkObjectState, file.lastDdlTime, file.compileDebugOnSave);
                if (!connOpen) {
                    logger_1.FileStreamLogger.Instance.error("Error on writing file, connection disconnected");
                    let connectionNode = this.dataExpManger.getConnectionNode(params.connectionUri);
                    if (connectionNode) {
                        this.dataExpManger.onConnectionDisconnect(connectionNode, true);
                    }
                    logger_1.ChannelLogger.Instance.error(response.message);
                    reject(new vscode.FileSystemError(response.message));
                    return;
                }
                if (response.messageType === dataExplorerRequests_1.DataExplorerSaveToDatabaseMessageType.WarningModifiedInDatabase ||
                    response.messageType === dataExplorerRequests_1.DataExplorerSaveToDatabaseMessageType.ObjectDoesNotExistInDatabase) {
                    let errorMsg = "";
                    if (response.messageType === dataExplorerRequests_1.DataExplorerSaveToDatabaseMessageType.WarningModifiedInDatabase) {
                        errorMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.modifiedInDatabaseMsg, editorUtils_1.editorUtils.getObjectTypeFromDdexType(params.ddexObjectType), params.objectname);
                    }
                    else {
                        errorMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.deletedInDatabaseMsg, editorUtils_1.editorUtils.getObjectTypeFromDdexType(params.ddexObjectType), params.objectname);
                    }
                    logger_1.FileStreamLogger.Instance.info("Prompt to overwrite changes in db");
                    let proceed = yield helper.Utils.promptForConfirmation(errorMsg, this.vsCodeConnector);
                    if (!proceed) {
                        logger_1.FileStreamLogger.Instance.info("User selected NO to overwrite changes in database. Cancelled save of file");
                        reject(helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgOverwriteCanceledbyUser, editorUtils_1.editorUtils.getObjectTypeFromDdexType(params.ddexObjectType), params.objectname));
                        return;
                    }
                    [response, connOpen] = yield utilities_1.ExplorerUtilities.saveToDatabase(uri.toString(), params.connectionUri, params.ddexObjectType, params.objectname, params.schemaname, false, file.lastDdlTime, file.compileDebugOnSave);
                    if (!connOpen) {
                        logger_1.FileStreamLogger.Instance.error("Error on writing file, connection is disconnected");
                        let connectionNode = this.dataExpManger.getConnectionNode(params.connectionUri);
                        if (connectionNode) {
                            this.dataExpManger.onConnectionDisconnect(connectionNode, true);
                        }
                        logger_1.ChannelLogger.Instance.error(response.message);
                        reject(new vscode.FileSystemError(response.message));
                        return;
                    }
                }
                let treeNode = this.dataExpManger.getOENodeFromEditorUri(uri);
                if (treeNode) {
                    yield this.dataExpManger.refreshNode(treeNode);
                }
                const objectStr = utilities_1.TreeViewConstants.baseUri + uri.fsPath.slice(1).replace(/\\/g, "/");
                const header = helper.stringFormatterCsharpStyle(localizedConstants_1.default.saveToDatabaseAlertMsg, objectStr, response.message);
                const footer = localizedConstants_1.default.doneFooterMsg;
                const alertMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.saveToDatabaseAlertMsg, objectStr, response.message.split("\n")[0]);
                const channelMsg = header + "\n";
                let compileErrorOnSave = false;
                logger_1.ChannelLogger.Instance.show();
                switch (response.messageType) {
                    case dataExplorerRequests_1.DataExplorerSaveToDatabaseMessageType.Success: {
                        logger_1.ChannelLogger.Instance.info(channelMsg);
                        break;
                    }
                    case dataExplorerRequests_1.DataExplorerSaveToDatabaseMessageType.CompileWarning: {
                        logger_1.ChannelLogger.Instance.warn(channelMsg);
                        break;
                    }
                    case dataExplorerRequests_1.DataExplorerSaveToDatabaseMessageType.CompileError: {
                        logger_1.FileStreamLogger.Instance.error("WriteFile - Compile error on writing file");
                        logger_1.ChannelLogger.Instance.error(channelMsg);
                        compileErrorOnSave = true;
                        break;
                    }
                    case dataExplorerRequests_1.DataExplorerSaveToDatabaseMessageType.Error: {
                        logger_1.FileStreamLogger.Instance.error("WriteFile - Error on writing file");
                        logger_1.ChannelLogger.Instance.error(channelMsg);
                        return;
                    }
                }
                file.ctime = new Date(response.createdDateTime).getTime();
                file.mtime = new Date(response.modifiedDateTime).getTime();
                file.lastDdlTime = response.modifiedDateTime;
                file.errorOnSave = compileErrorOnSave;
                file.data = content;
                file.size = file.data ? file.data.byteLength : 0;
                this.fireFileEvent({ type: vscode.FileChangeType.Changed, uri });
                resolve();
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Error on finding if file opened from OE.");
                helper.logErroAfterValidating(error);
                reject(vscode.FileSystemError.FileNotFound(uri));
            }
            finally {
                logger_1.FileStreamLogger.Instance.info("End - FileSystemProvider.writeFile");
            }
        }));
    }
    delete(uri, options) {
        if (this.openfiles.has(uri.toString())) {
            this.openfiles.delete(uri.toString());
            this.fireFileEvent({ type: vscode.FileChangeType.Deleted, uri });
        }
    }
    rename(oldUri, newUri, options) {
        try {
            let file = this.openfiles.get(oldUri.toString());
            if (file) {
                this.openfiles.delete(oldUri.toString());
                this.openfiles.set(newUri.toString(), file);
                this.fireFileEvent({ type: vscode.FileChangeType.Deleted, uri: oldUri }, { type: vscode.FileChangeType.Created, uri: newUri });
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on rename of document.");
            helper.logErroAfterValidating(error);
        }
    }
    copy(source, destination, options) {
        this.handleNotImplementedError(source, "copy");
    }
    handleNotImplementedError(uri, methodName) {
        let errorMsg = "FileSystemProvider- Not implemented method called - " + methodName;
        logger_1.FileStreamLogger.Instance.error(errorMsg);
    }
    fireFileEvent(...events) {
        this._bufferedEvents.push(...events);
        if (this._fireSoonHandle) {
            clearTimeout(this._fireSoonHandle);
        }
        this._fireSoonHandle = setTimeout(() => {
            this._emitter.fire(this._bufferedEvents);
            this._bufferedEvents.length = 0;
        }, 5);
    }
    onEditorOpened(editorDoc, systemManager) {
        let uriString = editorDoc.uri.toString();
        if (this.openfiles.has(uriString)) {
            let connectionUri = this.openfiles.get(uriString).connectionUri;
            let connectionNode = this.dataExpManger.getConnectionNode(connectionUri);
            let values = editorUtils_1.editorUtils.isExplorerFile(editorDoc);
            if (values.executableFile) {
                systemManager.connectionController.createConnectionFromConnProps(connectionNode.connectionProperties, uriString, true);
            }
            else
                systemManager.statusController.displayConnectionProperties(uriString, connectionNode.connectionProperties, utilities_1.TreeViewConstants.baseUri);
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendNotification(dataExplorerRequests_1.DataExplorerEditorOpenedEventStronglyTyped.event, ({
                ownerUri: connectionUri,
                fileUri: uriString,
            }));
        }
    }
    onEditorClosed(editorUri) {
        this.delete(editorUri, { recursive: true });
    }
    onConnectionsRefreshed(currentConnsUri) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let editorUriDeleted = [];
                this.openfiles.forEach((value, key) => {
                    if (!currentConnsUri.includes(value.connectionUri) && !editorUriDeleted.includes(key)) {
                        editorUriDeleted.push(key);
                    }
                });
                for (let editorUri of editorUriDeleted) {
                    this.delete(vscode.Uri.parse(editorUri), { recursive: true });
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Error on updating on refreshing connections");
                logger_1.FileStreamLogger.Instance.error(error);
            }
        });
    }
}
exports.editorProvider = editorProvider;
class FSFile {
    constructor(name, connUri) {
        this.errorOnSave = false;
        this.overwriteOnSave = false;
        this.compileDebugOnSave = false;
        this.validated = false;
        this.saveFile = true;
        this.type = vscode.FileType.File;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
        this.name = name;
        this.lastDdlTime = "";
        this.connectionUri = connUri;
    }
}
exports.FSFile = FSFile;
class FSDirectory extends FSFile {
    constructor(name) {
        super(name, undefined);
        this.type = vscode.FileType.Directory;
    }
}
exports.FSDirectory = FSDirectory;
