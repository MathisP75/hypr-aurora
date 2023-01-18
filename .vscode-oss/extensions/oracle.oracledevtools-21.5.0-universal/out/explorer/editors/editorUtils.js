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
exports.UriQueryParameters = exports.editorUtils = void 0;
const vscode = require("vscode");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const connectionNode_1 = require("../nodes/connectionNode");
const utilities_1 = require("../utilities");
const extension_1 = require("../../extension");
const logger_1 = require("../../infrastructure/logger");
const constants_1 = require("../../constants/constants");
const localizedConstants_1 = require("../../constants/localizedConstants");
const setup_1 = require("../../utilities/setup");
const fs = require("fs");
const helper = require("../../utilities/helper");
const path = require("path");
const defaultConnectionManager_1 = require("../../connectionManagement/defaultConnectionManager");
class editorUtils {
    static refreshEditorContents() {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand('workbench.action.files.revert');
        });
    }
    static openEditor(editorUri, connectionNode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let systemManager = (0, extension_1.getSystemManager)();
                systemManager.codeEditorProvider.lastOpenedUri = undefined;
                let document = yield vscode.workspace.openTextDocument(editorUri);
                yield vscode.window.showTextDocument(document, { preview: false });
                if (!systemManager.codeEditorProvider.lastOpenedUri ||
                    systemManager.codeEditorProvider.lastOpenedUri !== document.uri.toString()) {
                    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document &&
                        !vscode.window.activeTextEditor.document.isDirty &&
                        vscode.window.activeTextEditor.document.uri &&
                        vscode.window.activeTextEditor.document.uri.toString() === document.uri.toString()) {
                        editorUtils.refreshEditorContents();
                    }
                }
                systemManager.codeEditorProvider.lastOpenedUri = undefined;
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Error on opening editor for code object");
                helper.logErroAfterValidating(error);
            }
        });
    }
    static getQueryParameters(uri) {
        let params = null;
        let uriQuery = "";
        try {
            if (uri) {
                uriQuery = uri.query;
                let fragment = uri.fragment;
                if (fragment && fragment.length > 0) {
                    fragment = "#" + fragment;
                    if (uriQuery && uriQuery.length > 0) {
                        uriQuery = uriQuery + fragment;
                    }
                    else {
                        uriQuery = fragment;
                    }
                }
                params = this.getQueryParams(uriQuery);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on extracting query parameters from uri query");
            helper.logErroAfterValidating(error);
        }
        return params;
    }
    static getQueryParams(uriQuery) {
        let params = null;
        if (uriQuery) {
            var regex = new RegExp("sessionId=(?<sessionId>.*)&connectionUri=(?<connectionUri>.*)&schemaname=(?<schemaname>.*)&objectname=(?<objectname>.*)&objectType=(?<ddexObjectType>.*)&connectionname=(?<connectionname>.*)");
            let result = regex.exec(uriQuery);
            if (result) {
                const groups = result.groups;
                if (groups && groups.connectionUri && groups.ddexObjectType && groups.schemaname && groups.objectname && groups.connectionname) {
                    let ddexType = dataExplorerRequests_1.OracleDDEXObjectTypes[Number(groups.ddexObjectType)];
                    let ddexObjType = dataExplorerRequests_1.OracleDDEXObjectTypes[ddexType];
                    params = new UriQueryParameters(groups.sessionId, groups.connectionUri, ddexObjType, groups.schemaname, groups.objectname, groups.connectionname);
                }
            }
        }
        return params;
    }
    static verifyConnectedToDatabase(uri, dataExpManger, vsCodeConnector) {
        let connectedToDB = false;
        if (uri) {
            let params = editorUtils.getQueryParameters(uri);
            if (params) {
                let connectionNode = dataExpManger.getConnectionNode(params.connectionUri);
                if (connectionNode && connectionNode.status === connectionNode_1.ConnectionStatus.Connected) {
                    connectedToDB = true;
                }
                else {
                    let filename = path.parse(uri.fsPath).base;
                    vsCodeConnector.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.fileNotConnectedToDatabase, filename));
                }
            }
        }
        return connectedToDB;
    }
    static downloadEditorScript(uri, dataExpManger, vsCodeConnector, connectionCommandsHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.FileStreamLogger.Instance.info("Start - EditorUtils.downloadEditorScript");
                if (!editorUtils.verifyConnectedToDatabase(uri, dataExpManger, vsCodeConnector)) {
                    logger_1.FileStreamLogger.Instance.info("File not connected to database.");
                    return;
                }
                let params = editorUtils.getQueryParameters(uri);
                if (params) {
                    const [sourceText, createdDateTime, modifiedDateTime, requestResponse, connOpen] = yield utilities_1.ExplorerUtilities.getCodeObjectSource(params.connectionUri, params.ddexObjectType, params.objectname, params.schemaname, true);
                    logger_1.FileStreamLogger.Instance.info("Source text fetched from server.");
                    if (requestResponse.messageType === dataExplorerRequests_1.DataExplorerFetchMessageType.Error) {
                        let connectionNode = dataExpManger.getConnectionNode(params.connectionUri);
                        if (!connOpen && connectionNode) {
                            logger_1.FileStreamLogger.Instance.info("Connection is disconnected.");
                            dataExpManger.onConnectionDisconnect(connectionNode, true);
                        }
                        else {
                            logger_1.FileStreamLogger.Instance.error("Error on fetching source text from server.");
                            logger_1.FileStreamLogger.Instance.error(requestResponse.message);
                            vsCodeConnector.showErrorMessage(requestResponse.message);
                        }
                    }
                    else if (!sourceText || !modifiedDateTime || !createdDateTime) {
                        vsCodeConnector.showErrorMessage(localizedConstants_1.default.invalidObjectMessage);
                    }
                    else {
                        try {
                            logger_1.FileStreamLogger.Instance.info("Finding download location and creating file with source text.");
                            let downloadsDir = undefined;
                            const config = setup_1.Setup.getExtensionConfigSection();
                            if (config) {
                                let downloadLocation = config.get(constants_1.Constants.downloadsLocationWorkspacePropertyName);
                                if (downloadLocation === constants_1.Constants.downloadsLocationCurrentWorkspaceValue) {
                                    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0] &&
                                        vscode.workspace.workspaceFolders[0].uri && vscode.workspace.workspaceFolders[0].uri.fsPath) {
                                        downloadsDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
                                    }
                                }
                                else {
                                    let tempDir = config.get(constants_1.Constants.downloadsFolderPropertyName);
                                    if (tempDir) {
                                        if (!fs.existsSync(tempDir) && path.isAbsolute(tempDir)) {
                                            try {
                                                logger_1.FileStreamLogger.Instance.info("Download directory does not exist. Creating download directory.");
                                                tempDir = fs.mkdirSync(tempDir, { recursive: true });
                                            }
                                            catch (err) {
                                                logger_1.FileStreamLogger.Instance.error("Error on creating download directory.");
                                                helper.logErroAfterValidating(err);
                                            }
                                        }
                                        downloadsDir = tempDir;
                                    }
                                }
                                let defaultPath = editorUtils.getFilename(downloadsDir, params.objectname);
                                let saveOptions = {};
                                saveOptions.defaultUri = vscode.Uri.file(defaultPath);
                                saveOptions.title = localizedConstants_1.default.download;
                                saveOptions.saveLabel = localizedConstants_1.default.download;
                                let fileToSave = yield vscode.window.showSaveDialog(saveOptions);
                                if (fileToSave && fileToSave.fsPath) {
                                    fs.writeFileSync(fileToSave.fsPath, sourceText);
                                    defaultConnectionManager_1.DefaultConnectionManager.instance.addToExcludedFilesForDefaultConnection(fileToSave.toString());
                                    let document = yield vscode.workspace.openTextDocument(fileToSave);
                                    yield vscode.window.showTextDocument(document, { preview: false });
                                    let connNode = dataExpManger.getConnectionNode(params.connectionUri);
                                    connectionCommandsHandler.createConnectionFromConnProps(connNode.connectionProperties, document.uri.toString(), true);
                                }
                            }
                        }
                        catch (error) {
                            logger_1.FileStreamLogger.Instance.error("Error on downloading source text for code object");
                            helper.logErroAfterValidating(error);
                        }
                    }
                }
            }
            catch (err) {
                logger_1.FileStreamLogger.Instance.error("Error on downloading script for code object");
            }
            finally {
                logger_1.FileStreamLogger.Instance.info("End - EditorUtils.downloadEditorScript");
            }
        });
    }
    static removeInvalidCharsFromFilename(filename) {
        return filename.replace(/[/\\?%*:|"<>#]/g, "_");
    }
    static getFilename(fileDir, objectName) {
        let filename = "";
        try {
            if (objectName) {
                let tmpFileName = objectName;
                tmpFileName = editorUtils.removeInvalidCharsFromFilename(tmpFileName);
                if (tmpFileName) {
                    tmpFileName = tmpFileName + ".plsql";
                }
                if (fileDir) {
                    tmpFileName = path.join(fileDir, tmpFileName);
                }
                if (tmpFileName) {
                    filename = tmpFileName;
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on generating default filename to download source text.");
            helper.logErroAfterValidating(error);
        }
        return filename;
    }
    static getCodeEditorUri(treeNode, ddexObjectType, dataExpManger) {
        let editorUri = null;
        try {
            if (treeNode) {
                let connectionNode = dataExpManger.getConnectionNode(treeNode.connectionURI);
                let connectionName = connectionNode.connectionProperties.name;
                let dbObjectTye = editorUtils.getObjectTypeFromDdexType(ddexObjectType);
                editorUri = this.getEditorUri(constants_1.Constants.oracleScheme, connectionName, dbObjectTye, treeNode.schemaName, treeNode.objectName, treeNode.connectionURI, ddexObjectType);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on creating URI for editor.");
            helper.logErroAfterValidating(error);
        }
        return editorUri;
    }
    static getEditorUri(docScheme, connectionName, dbObjectTye, schemaName, objectName, connectionURI, ddexObjectType) {
        let tmpConnectionName = this.removeInvalidCharsFromFilename(connectionName);
        let tmpDbObjectTye = this.removeInvalidCharsFromFilename(dbObjectTye);
        let tmpSchemaName = this.removeInvalidCharsFromFilename(schemaName);
        let tmpObjectName = this.removeInvalidCharsFromFilename(objectName);
        let extension = ddexObjectType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Table ||
            ddexObjectType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_View || ddexObjectType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedView ?
            'sql' : 'plsql';
        let uriQuery = editorUtils.getUriQueryString(connectionName, schemaName, objectName, connectionURI, ddexObjectType);
        let file = `${docScheme}:///${tmpConnectionName}/${tmpDbObjectTye}/${tmpSchemaName}/${tmpObjectName}.${extension}?${uriQuery}`;
        let fileUri = vscode.Uri.parse(file);
        return fileUri;
    }
    static getUriQueryString(connectionName, schemaName, objectName, connectionURI, ddexObjectType) {
        let sessionId = (0, extension_1.getSystemManager)().sessionId.toString();
        let uriQuery = `sessionId=${sessionId}&connectionUri=${connectionURI}&schemaname=${schemaName}&objectname=${objectName}&objectType=${ddexObjectType}&connectionname=${connectionName}`;
        return uriQuery;
    }
    static getEditorDocument(treeDNode, ddexObjectType, dataExpManager) {
        let editorDoc = undefined;
        try {
            let editorUri = editorUtils.getCodeEditorUri(treeDNode, ddexObjectType, dataExpManager);
            if (editorUri) {
                editorDoc = vscode.workspace.textDocuments.find((doc) => doc.uri.toString() === editorUri.toString());
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on getting document for editor.");
            helper.logErroAfterValidating(error);
        }
        return editorDoc;
    }
    static isExplorerFile(document) {
        let explorerFile = false;
        let runnableFile = false;
        let executableFile = true;
        try {
            if (document && document.uri && document.uri.scheme && document.uri.scheme === constants_1.Constants.oracleScheme) {
                explorerFile = true;
                let params = editorUtils.getQueryParameters(document.uri);
                if (params) {
                    switch (params.ddexObjectType) {
                        case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Procedure:
                        case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Function:
                            runnableFile = true;
                            executableFile = false;
                            break;
                        case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Table:
                        case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_View:
                        case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedView:
                            break;
                        default:
                            executableFile = false;
                            break;
                    }
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on finding if file opened from OE.");
            helper.logErroAfterValidating(error);
        }
        return { explorerFile, runnableFile, executableFile };
    }
    static updateModifiedTime(editorUri, modifiedTime) {
        let openFile = (0, extension_1.getSystemManager)().codeEditorProvider.openfiles.get(editorUri);
        if (openFile) {
            openFile.lastDdlTime = modifiedTime;
            openFile.mtime = new Date(modifiedTime).getTime();
        }
    }
    static getEditorDocumentFromUri(editorUri) {
        let editorDoc = undefined;
        try {
            if (editorUri) {
                editorDoc = vscode.workspace.textDocuments.find((doc) => doc.uri.toString() === editorUri.toString());
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on getting editor document for URI.");
            helper.logErroAfterValidating(error);
        }
        return editorDoc;
    }
    static updateExplorerFileOnConnectionRename(newConnNode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const systemManager = (0, extension_1.getSystemManager)();
                let openUris = Array.from(systemManager.codeEditorProvider.openfiles.keys());
                for (const uri of openUris) {
                    let editorUri = vscode.Uri.parse(uri);
                    if (editorUri && editorUri.query) {
                        let params = editorUtils.getQueryParameters(editorUri);
                        if (params && params.connectionUri && params.connectionUri === newConnNode.connectionURI) {
                            let edit = new vscode.WorkspaceEdit();
                            let oldUri = vscode.Uri.parse(uri);
                            let newUri = editorUtils.getEditorUri(constants_1.Constants.oracleScheme, newConnNode.connectionProperties.name, editorUtils.getObjectTypeFromDdexType(params.ddexObjectType), params.schemaname, params.objectname, params.connectionUri, params.ddexObjectType);
                            yield edit.renameFile(oldUri, newUri);
                            yield vscode.workspace.applyEdit(edit);
                            systemManager.statusController.displayConnectionProperties(newUri.toString(), newConnNode.connectionProperties, utilities_1.TreeViewConstants.baseUri);
                        }
                    }
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.info("Error on updating explorer files on renaming connection");
                helper.logErroAfterValidating(error);
            }
        });
    }
    static getObjectTypeFromDdexType(ddexType) {
        let objectType = utilities_1.TreeViewConstants.packageStr;
        switch (ddexType) {
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Procedure:
                objectType = utilities_1.TreeViewConstants.procedureStr;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Function:
                objectType = utilities_1.TreeViewConstants.functionStr;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package:
                objectType = utilities_1.TreeViewConstants.packageStr;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody:
                objectType = utilities_1.TreeViewConstants.packageBodyStr;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableTrigger:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableTrigger:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableTrigger:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalViewTrigger:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectViewTrigger:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLViewTrigger:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_TableTriggerMain:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ViewTriggerMain:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_SchemaTriggerMain:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_DatabaseTriggerMain:
                objectType = utilities_1.TreeViewConstants.triggerStr;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Table:
                objectType = utilities_1.TreeViewConstants.tableStr;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_View:
                objectType = utilities_1.TreeViewConstants.viewStr;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedView:
                objectType = utilities_1.TreeViewConstants.materializedViewStr;
                break;
        }
        return objectType;
    }
    static hasErrorsOnSave(editorUri) {
        let hasErrors = false;
        try {
            const systemManager = (0, extension_1.getSystemManager)();
            let file = systemManager.codeEditorProvider.openfiles.get(editorUri.toString());
            hasErrors = file && file.errorOnSave;
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("Error on checking if there were compile errors on last save");
            helper.logErroAfterValidating(error);
        }
        return hasErrors;
    }
}
exports.editorUtils = editorUtils;
class UriQueryParameters {
    constructor(sessionId, connectionUri, ddexObjectType, schemaname, objectname, connectionname) {
        this.sessionId = sessionId;
        this.connectionUri = connectionUri;
        this.ddexObjectType = ddexObjectType;
        this.schemaname = schemaname;
        this.objectname = objectname;
        this.connectionname = connectionname;
    }
}
exports.UriQueryParameters = UriQueryParameters;
