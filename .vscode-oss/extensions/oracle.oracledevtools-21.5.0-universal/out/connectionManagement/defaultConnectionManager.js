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
exports.DefaultConnectionManager = void 0;
const vscode = require("vscode");
const helper = require("../utilities/helper");
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const constants_1 = require("../constants/constants");
const setup_1 = require("../utilities/setup");
const logger_1 = require("../infrastructure/logger");
const editorUtils_1 = require("../explorer/editors/editorUtils");
const vscode_1 = require("vscode");
class DefaultConnectionManager {
    constructor(dataExpManager, vscodeConnector, statusController, connectionCommandHandler) {
        this.excludedFilesForDefaultConnection = [];
        this.userDisconnectedFiles = [];
        this.defaultConnectedFiles = [];
        this.vscodeConnector = undefined;
        this.associateDefaultConn = true;
        this.dataExpManager = dataExpManager;
        this.vscodeConnector = vscodeConnector;
        this.statusController = statusController;
        this.connectionCommandHandler = connectionCommandHandler;
    }
    static CreateInstance(dataExpManager, vscodeConnector, statusController, connectionCommandHandler) {
        try {
            if (!DefaultConnectionManager.varInstance) {
                DefaultConnectionManager.varInstance = new DefaultConnectionManager(dataExpManager, vscodeConnector, statusController, connectionCommandHandler);
            }
            return DefaultConnectionManager.instance;
        }
        catch (err) {
            helper.logErroAfterValidating(err);
        }
    }
    static get instance() {
        return DefaultConnectionManager.varInstance;
    }
    addToUserDisconnectedFiles(fileUri) {
        this.userDisconnectedFiles.push(fileUri);
    }
    removeFromUserDisconnectedFiles(fileUri) {
        const index = this.userDisconnectedFiles.indexOf(fileUri);
        if (index > -1) {
            this.userDisconnectedFiles.splice(index, 1);
        }
    }
    addToExcludedFilesForDefaultConnection(fileUri) {
        this.excludedFilesForDefaultConnection.push(fileUri);
    }
    removeFromExcludedFilesForDefaultConnection(fileUri) {
        const index = this.excludedFilesForDefaultConnection.indexOf(fileUri);
        if (index > -1) {
            this.excludedFilesForDefaultConnection.splice(index, 1);
        }
    }
    removeFromDefaultConnectedFiles(fileUri) {
        const index = this.defaultConnectedFiles.indexOf(fileUri);
        if (index > -1) {
            this.defaultConnectedFiles.splice(index, 1);
        }
    }
    associateDefaultConnectionToFile(document, connName = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("Associate default connection to file - Start");
            try {
                this.dataExpManager.updateExplorerDefaultConnection();
                if (document && document.uri && document.languageId === constants_1.Constants.oracleLanguageID &&
                    this.vscodeConnector.isActiveOracleFile) {
                    let fileUri = document.uri.toString();
                    let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(document);
                    if (this.associateDefaultConn
                        && !explorerFile
                        && !this.connectionCommandHandler.isConnectedToDB(fileUri)
                        && this.excludedFilesForDefaultConnection.indexOf(fileUri) < 0
                        && this.userDisconnectedFiles.indexOf(fileUri) < 0
                        && this.defaultConnectedFiles.indexOf(fileUri) < 0) {
                        let defaultConn = connName;
                        if (!defaultConn) {
                            defaultConn = this.getDefaultConnection();
                        }
                        if (defaultConn) {
                            let defaultConnNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionName(defaultConn);
                            if (defaultConnNode) {
                                logger_1.FileStreamLogger.Instance.info("Creating default connection for file.");
                                this.defaultConnectedFiles.push(fileUri);
                                this.connectionCommandHandler.createConnectionFromConnProps(defaultConnNode.connectionProperties, fileUri, true);
                            }
                        }
                    }
                }
            }
            catch (err) {
                logger_1.FileStreamLogger.Instance.info("Error on associating default connection to file");
                helper.logErroAfterValidating(err);
            }
            logger_1.FileStreamLogger.Instance.info("Associate default connection to file - End");
        });
    }
    connectionDeleted(connName) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("Update default connection on delete of Connection - Start.");
            try {
                const config = setup_1.Setup.getExtensionConfigSection();
                let defaultConn = this.getDefaultConnection();
                if (defaultConn && defaultConn === connName) {
                    this.updateDefaultConnection("");
                }
            }
            catch (err) {
                logger_1.FileStreamLogger.Instance.info("Error on updating default connection settings when connection is deleted");
                helper.logErroAfterValidating(err);
            }
            logger_1.FileStreamLogger.Instance.info("Update default connection on delete of Connection - End.");
        });
    }
    connectionRenamed(oldConnName, newConnName) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("Update default connection on rename of Connection - Start.");
            try {
                const config = setup_1.Setup.getExtensionConfigSection();
                let defaultConn = this.getDefaultConnection();
                if (defaultConn && oldConnName === defaultConn) {
                    this.updateDefaultConnection(newConnName);
                }
            }
            catch (err) {
                logger_1.FileStreamLogger.Instance.info("Error on updating default connection settings when connection is renamed");
                helper.logErroAfterValidating(err);
            }
            logger_1.FileStreamLogger.Instance.info("Update default connection on rename of Connection - End.");
        });
    }
    getDefaultConnection() {
        logger_1.FileStreamLogger.Instance.info("Get default connection - Start.");
        let defaultConn = "";
        try {
            let uri = undefined;
            let config = undefined;
            if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document
                && vscode.window.activeTextEditor.document.uri
                && vscode.window.activeTextEditor.document.languageId === constants_1.Constants.oracleLanguageID
                && this.vscodeConnector.isActiveOracleFile) {
                uri = vscode.window.activeTextEditor.document.uri;
            }
            if (uri) {
                logger_1.FileStreamLogger.Instance.info("Getting default connection specifying ConfigurationScope.");
                config = vscode.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName, uri);
            }
            else {
                logger_1.FileStreamLogger.Instance.info("Getting default connection without specifying ConfigurationScope.");
                config = vscode.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName);
            }
            defaultConn = config.get(constants_1.Constants.defaultConnectionSettingsPropertyName);
            if (!defaultConn && config && config.has(constants_1.Constants.defaultConnectionSettingsPropertyName)) {
                let configurationEntries = config.inspect(constants_1.Constants.defaultConnectionSettingsPropertyName);
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.info("Error on getting default connection settings");
            helper.logErroAfterValidating(err);
        }
        logger_1.FileStreamLogger.Instance.info("Get default connection - End.");
        return defaultConn;
    }
    updateDefaultConnection(defaultConn) {
        try {
            logger_1.FileStreamLogger.Instance.info("Updating default connection settings- Start");
            let uri = undefined;
            let config = undefined;
            if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document
                && vscode.window.activeTextEditor.document.uri
                && vscode.window.activeTextEditor.document.languageId === constants_1.Constants.oracleLanguageID
                && this.vscodeConnector.isActiveOracleFile) {
                uri = vscode.window.activeTextEditor.document.uri;
            }
            if (uri) {
                config = vscode.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName, uri);
            }
            else {
                config = vscode.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName);
            }
            if (config.has(constants_1.Constants.defaultConnectionSettingsPropertyName)) {
                let configurationEntries = config.inspect(constants_1.Constants.defaultConnectionSettingsPropertyName);
                let configTarget = vscode_1.ConfigurationTarget.Global;
                if (configurationEntries.workspaceFolderValue !== undefined) {
                    configTarget = vscode_1.ConfigurationTarget.WorkspaceFolder;
                    logger_1.FileStreamLogger.Instance.info("Updating default connection settings- WorkspaceFolder");
                }
                else if (configurationEntries.workspaceValue !== undefined) {
                    configTarget = vscode_1.ConfigurationTarget.Workspace;
                    logger_1.FileStreamLogger.Instance.info("Updating default connection settings- Workspace");
                }
                else {
                    configTarget = vscode_1.ConfigurationTarget.Global;
                    logger_1.FileStreamLogger.Instance.info("Updating default connection settings- Global");
                }
                config.update(constants_1.Constants.defaultConnectionSettingsPropertyName, defaultConn, configTarget);
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.info("Error on updating default connection settings");
            helper.logErroAfterValidating(err);
        }
        logger_1.FileStreamLogger.Instance.info("Updating default connection settings- End");
    }
}
exports.DefaultConnectionManager = DefaultConnectionManager;
