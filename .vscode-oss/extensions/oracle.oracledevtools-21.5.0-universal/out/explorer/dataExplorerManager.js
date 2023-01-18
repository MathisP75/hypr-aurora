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
exports.ConnectionNodeInfo = exports.ObjectNodeProperties = exports.DataExplorerManager = void 0;
const fs = require("fs");
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const helper = require("../utilities/helper");
const extension_1 = require("./../extension");
const logger_1 = require("./../infrastructure/logger");
const dataExplorerModel_1 = require("./dataExplorerModel");
const dataExplorerRequests_1 = require("./dataExplorerRequests");
const dataExplorerTreeDataProvider_1 = require("./dataExplorerTreeDataProvider");
const connectionNode_1 = require("./nodes/connectionNode");
const utilities_1 = require("./utilities");
const connectionSettingsManager_1 = require("../connectionManagement/connectionSettingsManager");
const path = require("path");
const vscode_1 = require("vscode");
const codeNavigationRequests_1 = require("../models/codeNavigationRequests");
const editorUtils_1 = require("./editors/editorUtils");
const question_1 = require("../prompts/question");
const adapter_1 = require("../prompts/adapter");
const setup_1 = require("../utilities/setup");
const DocumentConnectionInformation_1 = require("../connectionManagement/DocumentConnectionInformation");
const compilerSettingsManager_1 = require("./compilerSettingsManager");
const intellisenseModels_1 = require("../models/intellisenseModels");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const defaultConnectionManager_1 = require("../connectionManagement/defaultConnectionManager");
class DataExplorerManager {
    constructor(vsCodeConnector, connectionCommandsHandler, context, scriptExecutor) {
        this.baseUri = utilities_1.TreeViewConstants.baseUri;
        this.vscodeConnector = undefined;
        this.describePanels = {};
        this.genStmtResponseCnt = 0;
        this.connectionCommandsHandler = connectionCommandsHandler;
        this.extensionContext = context;
        this.dataExpModel = new dataExplorerModel_1.DataExplorerModel(this.baseUri, vsCodeConnector, connectionCommandsHandler, this);
        const treeDataProvider = new dataExplorerTreeDataProvider_1.DataExplorerTreeDataProvider(this.dataExpModel);
        utilities_1.ExplorerUtilities.registerRefreshMethod(treeDataProvider);
        this.dataExpTreeView = vscode.window.createTreeView(utilities_1.TreeViewConstants.explorerViewName, { treeDataProvider });
        this.vscodeConnector = vsCodeConnector;
        this.scriptExecutor = scriptExecutor;
        this.treeDataProvider = treeDataProvider;
        this.generateStmtQueue = new Map();
        vscode.commands.registerCommand("oracleDBObjectExplorer.refreshAll", () => {
            try {
                this.dataExpModel.reloadAll(true);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
            }
        });
        vscode.commands.registerCommand("oracleDBObjectExplorer.editScript", (treeNode) => __awaiter(this, void 0, void 0, function* () {
            if (treeNode) {
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(treeNode, treeNode.ddexObjectType, this);
                let connectionNode = this.getConnectionNode(treeNode.connectionURI);
                yield editorUtils_1.editorUtils.openEditor(editorUri, connectionNode);
            }
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.downloadScript", (treeNode) => __awaiter(this, void 0, void 0, function* () {
            if (treeNode) {
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(treeNode, treeNode.ddexObjectType, this);
                yield editorUtils_1.editorUtils.downloadEditorScript(editorUri, this, this.vscodeConnector, this.connectionCommandsHandler);
            }
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.downloadPackageSpec", (treeNode) => __awaiter(this, void 0, void 0, function* () {
            if (treeNode) {
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(treeNode, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package, this);
                yield editorUtils_1.editorUtils.downloadEditorScript(editorUri, this, this.vscodeConnector, this.connectionCommandsHandler);
            }
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.downloadPackageBody", (treeNode) => __awaiter(this, void 0, void 0, function* () {
            if (treeNode) {
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(treeNode, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody, this);
                yield editorUtils_1.editorUtils.downloadEditorScript(editorUri, this, this.vscodeConnector, this.connectionCommandsHandler);
            }
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.saveToDatabase", () => __awaiter(this, void 0, void 0, function* () {
            yield this.onSaveToDatabase();
        }));
        vscode.commands.registerCommand(constants_1.Constants.cmdRunCodeObjectFromFile, () => __awaiter(this, void 0, void 0, function* () {
            yield this.onRunCodeObjectFromfile();
        }));
        vscode.commands.registerCommand(constants_1.Constants.cmdCompileObjectFromFile, () => __awaiter(this, void 0, void 0, function* () {
            yield this.onCompileObjectFromFile(false);
        }));
        vscode.commands.registerCommand(constants_1.Constants.cmdCompileDebugObjectFromFile, () => __awaiter(this, void 0, void 0, function* () {
            yield this.onCompileObjectFromFile(true);
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.runCodeObject", (treeNode) => __awaiter(this, void 0, void 0, function* () {
            if (treeNode) {
                let connectionNode = this.getConnectionNode(treeNode.connectionURI);
                let objectProperties = new ObjectNodeProperties(treeNode, connectionNode);
                let editorDoc = editorUtils_1.editorUtils.getEditorDocument(treeNode, treeNode.ddexObjectType, this);
                let [canRunCodeObject, saved] = yield this.confirmToSaveBeforeRun(editorDoc, false);
                if (canRunCodeObject) {
                    yield utilities_1.ExplorerUtilities.runCodeObjectFromOENode(objectProperties, scriptExecutor, this, false, undefined, undefined, undefined);
                }
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerCompileObjectCommand, (treeNode) => __awaiter(this, void 0, void 0, function* () {
            if (treeNode) {
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(treeNode, treeNode.ddexObjectType, this);
                let editorDoc = editorUtils_1.editorUtils.getEditorDocumentFromUri(editorUri);
                yield this.compileObject(editorUri, editorDoc, false);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerCompileDebugObjectCommand, (treeNode) => __awaiter(this, void 0, void 0, function* () {
            if (treeNode) {
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(treeNode, treeNode.ddexObjectType, this);
                let editorDoc = editorUtils_1.editorUtils.getEditorDocumentFromUri(editorUri);
                yield this.compileObject(editorUri, editorDoc, true);
            }
        }));
        this.dataExpModel.addConnectionsRefreshedHandler(() => __awaiter(this, void 0, void 0, function* () {
            yield this.onConnectionsRefreshed();
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.editPackageSpec", (treeNode) => __awaiter(this, void 0, void 0, function* () {
            if (treeNode) {
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(treeNode, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package, this);
                let connectionNode = this.getConnectionNode(treeNode.connectionURI);
                yield editorUtils_1.editorUtils.openEditor(editorUri, connectionNode);
            }
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.editPackageBody", (treeNode) => __awaiter(this, void 0, void 0, function* () {
            if (treeNode) {
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(treeNode, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody, this);
                let connectionNode = this.getConnectionNode(treeNode.connectionURI);
                yield editorUtils_1.editorUtils.openEditor(editorUri, connectionNode);
            }
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.editPackageMethod", (treeNode) => __awaiter(this, void 0, void 0, function* () {
            let parent = treeDataProvider.getParent(treeNode);
            if (parent) {
                yield this.onEditPackageMethod(parent, treeNode);
            }
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.showData", (treeNode) => __awaiter(this, void 0, void 0, function* () {
            if (treeNode) {
                let connectionNode = this.getConnectionNode(treeNode.connectionURI);
                let objectProperties = new ObjectNodeProperties(treeNode, connectionNode);
                let parent = treeDataProvider.getParent(treeNode);
                yield this.onShowData(objectProperties, scriptExecutor, treeNode, parent);
            }
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.refresh", (node) => __awaiter(this, void 0, void 0, function* () {
            yield this.refreshNode(node);
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.connectMenu", (connNode) => __awaiter(this, void 0, void 0, function* () {
            yield this.onConnectionConnect(connNode);
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.disconnectMenu", (connNode) => __awaiter(this, void 0, void 0, function* () {
            yield this.onConnectionDisconnect(connNode, false);
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.explorerNodeSelected", (connNode) => __awaiter(this, void 0, void 0, function* () {
            if (connNode &&
                connNode.status !== connectionNode_1.ConnectionStatus.Connected &&
                connNode.status !== connectionNode_1.ConnectionStatus.Connecting) {
                yield this.onConnectionConnect(connNode);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerConnectionRename, (connectionNode) => __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.FileStreamLogger.Instance.info("Rename Connection handler invoked");
                yield this.renameConnection(connectionNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerDescribeObjectCommand, (treeNode) => __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("Describe object handler invoked");
            if (treeNode) {
                let connectionNode = this.getConnectionNode(treeNode.connectionURI);
                let objectProperties = new ObjectNodeProperties(treeNode, connectionNode);
                yield this.onDesribeObject(objectProperties);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerGenerateInsertCommand, (treeNode) => __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("Generate Insert statement handler invoked");
            yield this.onGenerateStatement(treeNode, dataExplorerRequests_1.DataExplorerGenerateStatementType.Insert);
        }));
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerGenerateSelectCommand, (treeNode) => __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("Generate Select statement handler invoked");
            yield this.onGenerateStatement(treeNode, dataExplorerRequests_1.DataExplorerGenerateStatementType.Select);
        }));
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerGenerateDeleteCommand, (treeNode) => __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("Generate Delete statement handler invoked");
            yield this.onGenerateStatement(treeNode, dataExplorerRequests_1.DataExplorerGenerateStatementType.Delete);
        }));
        vscode.commands.registerCommand(constants_1.Constants.dataExplorergenerateCreateCommand, (treeNode) => __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("Generate Create statement command invoked");
            if (treeNode) {
                switch (treeNode.ddexObjectType) {
                    case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTable:
                    case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTable:
                    case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTable:
                        treeNode.ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Table;
                        break;
                    case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLView:
                    case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectView:
                    case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalView:
                        treeNode.ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_View;
                        break;
                    case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Synonym:
                        treeNode.ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Synonym;
                        break;
                }
                yield this.onGenerateStatement(treeNode, dataExplorerRequests_1.DataExplorerGenerateStatementType.Create);
            }
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.setDefaultConnection", (connNode) => __awaiter(this, void 0, void 0, function* () {
            yield this.onSetUnsetDefaultConnection(connNode, connectionNode_1.ConnAssocType.Default);
        }));
        vscode.commands.registerCommand("oracleDBObjectExplorer.unsetDefaultConnection", (connNode) => __awaiter(this, void 0, void 0, function* () {
            yield this.onSetUnsetDefaultConnection(connNode, connectionNode_1.ConnAssocType.NonDefault);
        }));
        vscode.window.onDidChangeActiveColorTheme((theme) => __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info(`Color Theme Kind changed to ${theme.kind}`);
            setup_1.Setup.CurrentColorThemeKind = theme.kind;
            this.dataExpModel.raiseModelChangedEvent();
        }));
    }
    static CreateInstance(vsCodeConnector, connectionCommandsHandler, context, scriptExecutor) {
        try {
            if (DataExplorerManager.instance === undefined) {
                DataExplorerManager.instance = new DataExplorerManager(vsCodeConnector, connectionCommandsHandler, context, scriptExecutor);
            }
            return DataExplorerManager.instance;
        }
        catch (err) {
            helper.logErroAfterValidating(new Error(err));
        }
    }
    static get Instance() {
        return DataExplorerManager.instance;
    }
    onSetUnsetDefaultConnection(connNode, connAssocType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (connNode.connAssocType !== connAssocType) {
                    if (connAssocType === connectionNode_1.ConnAssocType.Default) {
                        let defaultConn = defaultConnectionManager_1.DefaultConnectionManager.instance.getDefaultConnection();
                        if (defaultConn) {
                            let currentDefaultConnNode = this.getConnectionNodeFromConnectionName(defaultConn);
                            if (currentDefaultConnNode) {
                                currentDefaultConnNode.connAssocType = connectionNode_1.ConnAssocType.NonDefault;
                                currentDefaultConnNode.setNodeIdentifier = utilities_1.ExplorerUtilities.getConnectionNodeID(currentDefaultConnNode.nodeLabel, currentDefaultConnNode.connectionId, currentDefaultConnNode.status, currentDefaultConnNode.status, currentDefaultConnNode.getNodeIdentifier, connNode.connAssocType);
                            }
                        }
                    }
                    connNode.connAssocType = connAssocType;
                    connNode.setNodeIdentifier = utilities_1.ExplorerUtilities.getConnectionNodeID(connNode.nodeLabel, connNode.connectionId, connNode.status, connNode.status, connNode.getNodeIdentifier, connNode.connAssocType);
                    this.dataExpModel.raiseModelChangedEvent();
                    this.dataExpTreeView.reveal(connNode, { select: true, focus: true });
                    if (connAssocType === connectionNode_1.ConnAssocType.Default) {
                        defaultConnectionManager_1.DefaultConnectionManager.instance.updateDefaultConnection(connNode.connectionProperties.name);
                        if (this.vscodeConnector.isActiveOracleFile) {
                            defaultConnectionManager_1.DefaultConnectionManager.instance.associateDefaultConnectionToFile(this.vscodeConnector.activeTextEditor.document, connNode.connectionProperties.name);
                        }
                    }
                    else {
                        let defaultConn = defaultConnectionManager_1.DefaultConnectionManager.instance.getDefaultConnection();
                        if (defaultConn && defaultConn === connNode.connectionProperties.name) {
                            defaultConnectionManager_1.DefaultConnectionManager.instance.updateDefaultConnection("");
                        }
                    }
                }
            }
            catch (err) {
                logger_1.FileStreamLogger.Instance.info("Error on setting or unsetting default connection");
                helper.logErroAfterValidating(err);
            }
        });
    }
    refreshNode(node) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (node) {
                    let oenode = node;
                    while (oenode && !oenode.canRefresh) {
                        oenode = oenode.parent;
                    }
                    if (!oenode) {
                        return;
                    }
                    let treeNode = oenode;
                    let isDatabaseObject = oenode["isDatabaseObject"] === true;
                    if (isDatabaseObject) {
                        let connectionNode = this.getConnectionNode(treeNode.connectionURI);
                        let objectProperties = new ObjectNodeProperties(oenode, connectionNode);
                        let [response, connOpen] = yield utilities_1.ExplorerUtilities.getBasicPropertiesFromDB(objectProperties);
                        if (!connOpen) {
                            let connectionNode = this.getConnectionNode(oenode.connectionURI);
                            if (connectionNode) {
                                this.onConnectionDisconnect(connectionNode, true);
                            }
                            return;
                        }
                        if (response && response.object && response.object.objectExists) {
                            let codeobj = treeNode.databaseObject;
                            if (codeobj && codeobj.isCompiledWithDebug !== undefined) {
                                codeobj.status = (response.object.status === dataExplorerRequests_1.Status.Valid) ? "VALID" : "INVALID";
                                codeobj.isCompiledWithDebug = response.object.compiledWithDebug;
                            }
                            treeNode.reset();
                            treeNode.toolTipMsg = utilities_1.ExplorerUtilities.getNodeToolTip(treeNode);
                            utilities_1.ExplorerUtilities.refreshNode(oenode);
                        }
                        else {
                            let parent = treeNode.parent;
                            if (parent) {
                                parent.removeChild(treeNode);
                                utilities_1.ExplorerUtilities.refreshNode(parent);
                            }
                        }
                    }
                    else {
                        treeNode.reset();
                        utilities_1.ExplorerUtilities.refreshNode(treeNode);
                    }
                }
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
            }
        });
    }
    onEditPackageMethod(parent, treeNode) {
        return __awaiter(this, void 0, void 0, function* () {
            let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(parent, parent.ddexObjectType, this);
            let connectionNode = this.getConnectionNode(parent.connectionURI);
            yield editorUtils_1.editorUtils.openEditor(editorUri, connectionNode);
            logger_1.FileStreamLogger.Instance.info("Editor opened for package method...");
            if (!treeNode.children)
                treeNode.getChildren();
            let dbMethodParameters = treeNode.children;
            var documentSymbolList = yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(codeNavigationRequests_1.SymbolInformationRequest.type, new codeNavigationRequests_1.SymbolInformationParam(this.vscodeConnector.activeTextEditorUri));
            var foundMethod = false;
            for (var i = 1; i < documentSymbolList.length && !foundMethod; ++i)
                switch (documentSymbolList[i].localObjectType) {
                    case intellisenseModels_1.LocalSymbolType.Procedure:
                    case intellisenseModels_1.LocalSymbolType.Function:
                        if (treeNode.getNodeIdentifier == documentSymbolList[i].objectName)
                            foundMethod = this.areParamatersEqual(dbMethodParameters, documentSymbolList[i].symbolParams);
                        break;
                }
            if (!foundMethod) {
                var startPos = new vscode_1.Position(0, 0);
                this.vscodeConnector.activeTextEditor.selection = new vscode.Selection(startPos, startPos);
                const methodNotFound = helper.stringFormatterCsharpStyle(localizedConstants_1.default.packageMethodNotFound, treeNode.getNodeIdentifier);
                this.vscodeConnector.showErrorMessage(methodNotFound);
                logger_1.FileStreamLogger.Instance.info(methodNotFound);
            }
            else {
                var newPosition = new vscode_1.Position(documentSymbolList[i - 1].startLine, 0);
                var range = new vscode.Range(newPosition, newPosition);
                this.vscodeConnector.activeTextEditor.revealRange(range, 2);
                var newSelection = new vscode.Selection(newPosition, newPosition);
                this.vscodeConnector.activeTextEditor.selection = newSelection;
                logger_1.FileStreamLogger.Instance.info("Package method " + treeNode.getNodeIdentifier + " found successfully");
            }
        });
    }
    confirmToSaveBeforeRun(document, compileDebug) {
        return __awaiter(this, void 0, void 0, function* () {
            let proceed = true;
            let saved = false;
            try {
                if (document) {
                    yield vscode.window.showTextDocument(document, { preview: false });
                    let file = (0, extension_1.getSystemManager)().codeEditorProvider.openfiles.get(document.uri.toString());
                    if (document.isDirty && !document.isClosed && document.uri && document.uri.fsPath) {
                        let promptMessage = undefined;
                        let filename = path.parse(document.uri.fsPath).base;
                        let params = editorUtils_1.editorUtils.getQueryParameters(document.uri);
                        if (params) {
                            let [response, connOpen] = yield utilities_1.ExplorerUtilities.getObjectBasicPropertiesFromDB(params.connectionUri, params.ddexObjectType, params.objectname, params.schemaname, undefined);
                            if (file) {
                                let mtime = new Date(response.object.modifiedDateTime).getTime();
                                if (mtime > file.mtime) {
                                    promptMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.modifiedInDatabaseMsg, editorUtils_1.editorUtils.getObjectTypeFromDdexType(params.ddexObjectType), params.objectname);
                                }
                            }
                        }
                        if (!promptMessage) {
                            promptMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.saveUnsavedChanges, filename);
                        }
                        const question = {
                            type: question_1.QuestionTypes.confirm,
                            name: promptMessage,
                            message: promptMessage
                        };
                        let prompter = new adapter_1.default();
                        let confirmed = yield prompter.promptSingle(question);
                        if (confirmed) {
                            file.overwriteOnSave = true;
                            file.compileDebugOnSave = true;
                            proceed = yield document.save();
                            file.compileDebugOnSave = false;
                            saved = true;
                            file.overwriteOnSave = false;
                            proceed = proceed && !editorUtils_1.editorUtils.hasErrorsOnSave(document.uri);
                        }
                        else if (confirmed === undefined || confirmed === null) {
                            proceed = false;
                        }
                    }
                    else {
                        editorUtils_1.editorUtils.refreshEditorContents();
                    }
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.info("Error on saving unsaved changes in editor before Run");
                helper.logErroAfterValidating(error);
            }
            return [proceed, saved];
        });
    }
    confirmCompiledWithDebug(editorUri) {
        return __awaiter(this, void 0, void 0, function* () {
            let proceed = false;
            logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Start");
            try {
                let params = editorUtils_1.editorUtils.getQueryParameters(editorUri);
                let [response, connOpen] = yield utilities_1.ExplorerUtilities.getObjectBasicPropertiesFromDB(params.connectionUri, params.ddexObjectType, params.objectname, params.schemaname, undefined);
                if (response.object.status === dataExplorerRequests_1.Status.Valid) {
                    if (!response.object.compiledWithDebug) {
                        let promptMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.compileDebug, params.schemaname, params.objectname);
                        const question = { type: question_1.QuestionTypes.confirm, name: promptMessage, message: promptMessage };
                        let prompter = new adapter_1.default();
                        logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Object is not compiled with debug, prompting to compile with debug");
                        let confirmed = yield prompter.promptSingle(question);
                        if (confirmed) {
                            logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Confirmed to compile with debug");
                            let editorDoc = editorUtils_1.editorUtils.getEditorDocumentFromUri(editorUri);
                            yield this.compileObject(editorUri, editorDoc, true);
                            let [response, connOpen] = yield utilities_1.ExplorerUtilities.getObjectBasicPropertiesFromDB(params.connectionUri, params.ddexObjectType, params.objectname, params.schemaname, undefined);
                            if (response.object.status === dataExplorerRequests_1.Status.Valid) {
                                proceed = true;
                            }
                            else {
                                logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Object is not valid");
                                this.vscodeConnector.showErrorMessage(localizedConstants_1.default.invalidObjectMessage);
                                proceed = false;
                            }
                        }
                        else if (confirmed === undefined || confirmed === null) {
                            logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - cancelled compile with debug prompt");
                            proceed = false;
                        }
                        else {
                            logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Confirmed not compile with debug");
                            proceed = true;
                        }
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Object is compiled with debug");
                        proceed = true;
                    }
                }
                else {
                    logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Object is not valid");
                    this.vscodeConnector.showErrorMessage(localizedConstants_1.default.invalidObjectMessage);
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug- Error on confirming the object is compiled with debug.");
                helper.logErroAfterValidating(error);
            }
            logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - End");
            return proceed;
        });
    }
    areParamatersEqual(dbMethodParameters, parsedParameters) {
        let db_param_isNull = dbMethodParameters == null || dbMethodParameters.length == 0;
        let parsed_param_isNull = parsedParameters == null || parsedParameters.length == 0;
        if (db_param_isNull || parsed_param_isNull)
            return parsed_param_isNull && db_param_isNull;
        if (dbMethodParameters.length != parsedParameters.length)
            return false;
        for (var symbol_i = 0; symbol_i < dbMethodParameters.length; ++symbol_i)
            if (parsedParameters[symbol_i].name != dbMethodParameters[symbol_i].databaseObject['name'])
                return false;
            else if (parsedParameters[symbol_i].dbDataType.toUpperCase() != dbMethodParameters[symbol_i].databaseObject['dataTypeName']
                && !parsedParameters[symbol_i].derivedDataType)
                return false;
        return true;
    }
    onConnectionConnect(connNode, isGotoProvider = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let connName = connNode.connectionProperties.name;
            let progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.connectingConnection, connName);
            yield vscode.window.withProgress({ location: vscode_1.ProgressLocation.Notification, title: progressTitle }, (progress, token) => {
                var p = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield this.onConnectionConnectContinue(connNode, isGotoProvider);
                    }
                    catch (err) {
                        logger_1.FileStreamLogger.Instance.info("Error on connecting connection- " + connName);
                        helper.logErroAfterValidating(err);
                    }
                    finally {
                        resolve();
                    }
                }));
                return p;
            });
        });
    }
    onConnectionConnectContinue(connNode, isGotoProvider = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (connNode && connNode.status != connectionNode_1.ConnectionStatus.Connected) {
                    if (connNode.status === connectionNode_1.ConnectionStatus.Connecting) {
                        this.vscodeConnector.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgAlreadyConnecting, connNode.connectionProperties.name));
                    }
                    let oldConnStatus = connNode.status;
                    yield this.connectionCommandsHandler.doDisconnect(connNode.connectionURI, false);
                    connNode.children = undefined;
                    let connected = yield connNode.connectToDatabase();
                    if (connected) {
                        connNode.setExpand(vscode_1.TreeItemCollapsibleState.Expanded);
                        connNode.status = connectionNode_1.ConnectionStatus.Connected;
                    }
                    else {
                        connNode.setExpand(vscode_1.TreeItemCollapsibleState.Collapsed);
                        connNode.children = undefined;
                        connNode.status = connectionNode_1.ConnectionStatus.Errored;
                    }
                    connNode.setNodeIdentifier = utilities_1.ExplorerUtilities.getConnectionNodeID(connNode.nodeLabel, connNode.connectionId, connNode.status, oldConnStatus, connNode.getNodeIdentifier, connNode.connAssocType);
                    this.dataExpModel.raiseModelChangedEvent();
                    if (!isGotoProvider)
                        this.dataExpTreeView.reveal(connNode, { select: true, focus: true });
                }
            }
            catch (error) {
                connNode.status = connectionNode_1.ConnectionStatus.Disconnected;
                helper.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
            }
        });
    }
    selectNode(node) {
        this.dataExpTreeView.reveal(node, { select: true, focus: true });
    }
    onConnectionDisconnect(connNode, showMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (connNode.status === connectionNode_1.ConnectionStatus.Disconnected) {
                return;
            }
            let connName = connNode.connectionProperties.name;
            let progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.disconnectingConnection, connName);
            yield vscode.window.withProgress({ location: vscode_1.ProgressLocation.Notification, title: progressTitle }, (progress, token) => {
                var p = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield this.onConnectionDisconnectContinue(connNode, showMessage);
                    }
                    catch (err) {
                        logger_1.FileStreamLogger.Instance.info("Error on disconnecting connection- " + connName);
                        helper.logErroAfterValidating(err);
                    }
                    finally {
                        resolve();
                    }
                }));
                return p;
            });
        });
    }
    onConnectionDisconnectContinue(connNode, showMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (connNode) {
                    let oldConnStatus = connNode.status;
                    yield this.connectionCommandsHandler.doDisconnect(connNode.connectionURI, false);
                    connNode.setExpand(vscode_1.TreeItemCollapsibleState.Collapsed);
                    connNode.children = undefined;
                    connNode.status = connectionNode_1.ConnectionStatus.Disconnected;
                    connNode.setNodeIdentifier = utilities_1.ExplorerUtilities.getConnectionNodeID(connNode.nodeLabel, connNode.connectionId, connNode.status, oldConnStatus, connNode.getNodeIdentifier, connNode.connAssocType);
                    if (!connNode.connectionProperties.passwordSaved) {
                        connNode.connectionProperties.password = undefined;
                        connNode.connectionProperties.proxyPassword = undefined;
                    }
                    this.dataExpModel.raiseModelChangedEvent();
                    yield this.dataExpTreeView.reveal(connNode, { select: true, focus: true });
                    if (showMessage) {
                        let errorMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.disconnectedConnection, connNode.connectionProperties.name);
                        helper.AppUtils.ShowErrorAndLog(new Error(errorMsg), this.vscodeConnector);
                    }
                }
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
            }
        });
    }
    renameConnection(connNode) {
        return __awaiter(this, void 0, void 0, function* () {
            let oldConnName = connNode.connectionProperties.name;
            vscode.window.showInputBox({
                placeHolder: localizedConstants_1.default.bookmarkRename, value: oldConnName,
                validateInput: (newname) => {
                    if (newname && newname.trim().length > 0) {
                        return undefined;
                    }
                    else {
                        return localizedConstants_1.default.connectionNameNotValid;
                    }
                }
            })
                .then((newConnName) => __awaiter(this, void 0, void 0, function* () {
                if (newConnName) {
                    newConnName = newConnName.trim();
                    if (helper.isNotEmpty(newConnName) && newConnName !== oldConnName) {
                        let progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.renamingConnection, oldConnName, newConnName);
                        vscode.window.withProgress({ location: vscode_1.ProgressLocation.Notification, title: progressTitle }, (progress, token) => {
                            var p = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                                try {
                                    yield this.renameConnectionContinue(connNode, oldConnName, newConnName, false);
                                }
                                catch (err) {
                                    logger_1.FileStreamLogger.Instance.info("Error on renaming connection- " + oldConnName + " to " + newConnName);
                                    helper.logErroAfterValidating(err);
                                }
                                finally {
                                    resolve();
                                }
                            }));
                            return p;
                        });
                    }
                }
            }));
        });
    }
    renameConnectionFromConnectionUI(oldConnName, newConnName) {
        return __awaiter(this, void 0, void 0, function* () {
            let profileToReturn = undefined;
            const connectionNodes = this.dataExpModel.rootNodes;
            if (connectionNodes) {
                const oldConnNode = connectionNodes.find((node) => node.connectionProperties.name === oldConnName);
                if (oldConnNode) {
                    profileToReturn = yield this.renameConnectionContinue(oldConnNode, oldConnName, newConnName, true);
                }
            }
            return profileToReturn;
        });
    }
    renameConnectionContinue(connNode, oldConnName, newConnName, fromConnectionUI) {
        return __awaiter(this, void 0, void 0, function* () {
            let profileToReturn = undefined;
            try {
                const connectionSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager();
                if (!connectionSettings.checkProfileNameForUniqueness(newConnName)) {
                    this.vscodeConnector.showErrorMessage(localizedConstants_1.default.profileNameNotUnique);
                    return;
                }
                let newprofile = Object.assign({}, connNode.connectionProperties);
                newprofile.name = newConnName;
                this.renamedConnectionNodeInfo = new ConnectionNodeInfo(oldConnName, newConnName, connNode.connectionUniqueId);
                this.connectionToSelect = newConnName;
                yield this.connectionCommandsHandler.connectionLogicMgr.saveVsCodeProfile(newprofile, oldConnName);
                let message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.connectionRenamed, oldConnName, newConnName);
                this.vscodeConnector.showInformationMessage(message);
                this.connectionCommandsHandler.connectionLogicMgr.renameRecentlyUsedConnection(oldConnName, newConnName);
                yield defaultConnectionManager_1.DefaultConnectionManager.instance.connectionRenamed(oldConnName, newConnName);
                profileToReturn = newprofile;
            }
            catch (err) {
                this.renamedConnectionNodeInfo = undefined;
                this.connectionToSelect = undefined;
                helper.AppUtils.ShowErrorAndLog(err, this.vscodeConnector);
            }
            return profileToReturn;
        });
    }
    init() {
        try {
            let storageDir = "";
            try {
                const extensionContextExt = this.extensionContext;
                if (extensionContextExt && extensionContextExt.globalStoragePath) {
                    storageDir = extensionContextExt.globalStoragePath;
                    logger_1.FileStreamLogger.Instance.info("GlobalStoragePath is not empty-" + extensionContextExt.globalStoragePath);
                }
                else {
                    storageDir = this.extensionContext.extensionPath;
                    logger_1.FileStreamLogger.Instance.info("GlobalStoragePath is empty, ExtensionPath is-" + this.extensionContext.extensionPath);
                }
                logger_1.FileStreamLogger.Instance.info("Extension storage directory is- " + storageDir);
            }
            catch (err) {
                logger_1.FileStreamLogger.Instance.info("Error on getting storage directory. Setting storage directory to ExtensionPath- " +
                    this.extensionContext.extensionPath);
                storageDir = this.extensionContext.extensionPath;
                helper.logErroAfterValidating(err);
            }
            if (!fs.existsSync(storageDir)) {
                logger_1.FileStreamLogger.Instance.info("Creating  storage directory- " + storageDir);
                fs.mkdirSync(storageDir);
                logger_1.FileStreamLogger.Instance.info("Done creating  storage directory- " + storageDir);
            }
            this.fileStorageRootDirectory = storageDir + "/" + constants_1.Constants.tempDirectory;
            logger_1.FileStreamLogger.Instance.info("File storage root directory is- " + this.fileStorageRootDirectory);
            if (!fs.existsSync(this.fileStorageRootDirectory)) {
                logger_1.FileStreamLogger.Instance.info("Creating  storage root directory- " + this.fileStorageRootDirectory);
                fs.mkdirSync(this.fileStorageRootDirectory);
                logger_1.FileStreamLogger.Instance.info("Done creating  storage root directory- " + this.fileStorageRootDirectory);
            }
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendNotification(dataExplorerRequests_1.DataExplorerIntializedEventStronglyTyped.event, ({
                StorageDirectory: this.fileStorageRootDirectory,
            }));
        }
        catch (err) {
            helper.logErroAfterValidating(err);
        }
    }
    onShowData(objectProperties, scriptExecutor, treeNode, parent) {
        return __awaiter(this, void 0, void 0, function* () {
            yield utilities_1.ExplorerUtilities.onShowData(objectProperties, scriptExecutor, treeNode, parent);
        });
    }
    deleteFileStorage() {
        if (this.fileStorageDirectory !== undefined) {
            try {
                logger_1.FileStreamLogger.Instance.info("Deleting storage folder- " + this.fileStorageDirectory);
                this.deleteFolderRecursive(this.fileStorageDirectory);
                logger_1.FileStreamLogger.Instance.info("Done deleting storage folder- " + this.fileStorageDirectory);
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Error on deleting storage folder" + this.fileStorageDirectory);
                logger_1.FileStreamLogger.Instance.error(error.message);
            }
        }
    }
    deleteFolderRecursive(path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach((file) => {
                const curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    this.deleteFolderRecursive(curPath);
                }
                else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }
    onSaveToDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document &&
                    vscode.window.activeTextEditor.document.uri && !this.vscodeConnector.isActiveDocumentEmpty()) {
                    const systemManager = (0, extension_1.getSystemManager)();
                    let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(vscode.window.activeTextEditor.document);
                    if (explorerFile) {
                        yield vscode.window.activeTextEditor.document.save();
                    }
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Error on saving to database");
                helper.logErroAfterValidating(error);
            }
        });
    }
    onRunCodeObjectFromfile() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const systemManager = (0, extension_1.getSystemManager)();
                if (systemManager.isExtensionInitialized() && systemManager.documentIsOpenAndOracle()) {
                    if (this.vscodeConnector.isActiveDocumentEmpty()) {
                        return;
                    }
                    if (this.vscodeConnector.activeTextEditor && this.vscodeConnector.activeTextEditor.document &&
                        this.vscodeConnector.activeTextEditor.document.uri) {
                        let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(vscode.window.activeTextEditor.document);
                        if (runnableFile) {
                            if (editorUtils_1.editorUtils.verifyConnectedToDatabase(this.vscodeConnector.activeTextEditor.document.uri, this, this.vscodeConnector)) {
                                let [canRunCodeObject, saved] = yield this.confirmToSaveBeforeRun(vscode.window.activeTextEditor.document, false);
                                if (canRunCodeObject) {
                                    yield utilities_1.ExplorerUtilities.runCodeObjectFromFile(this.vscodeConnector.activeTextEditor.document.uri, this.scriptExecutor, this, false, undefined, undefined, undefined);
                                }
                            }
                        }
                    }
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Error on running code object from file");
                helper.logErroAfterValidating(error);
            }
        });
    }
    onConnectionsRefreshed() {
        return __awaiter(this, void 0, void 0, function* () {
            let currentConnsUri = this.dataExpModel.rootNodes.map(node => node.connectionURI);
            (0, extension_1.getSystemManager)().codeEditorProvider.onConnectionsRefreshed(currentConnsUri);
        });
    }
    getParentNode(treeNode) {
        let parentNode = this.treeDataProvider.getParent(treeNode);
        return parentNode;
    }
    getConnectionNode(connectionUri) {
        let connectionNode = undefined;
        if (this.dataExpModel.rootNodes !== undefined) {
            connectionNode = this.dataExpModel.rootNodes.
                find((node) => node.connectionURI === connectionUri);
        }
        return connectionNode;
    }
    getConnectionNodeFromConnectionName(connectionName) {
        let connectionNode = undefined;
        if (this.dataExpModel.rootNodes !== undefined) {
            connectionNode = this.dataExpModel.rootNodes.
                find((node) => node.connectionProperties.name === connectionName);
        }
        return connectionNode;
    }
    getConnectionNodeFromConnectionUniqueId(connectionUniqueId) {
        let connectionNode = undefined;
        if (this.dataExpModel.rootNodes !== undefined) {
            connectionNode = this.dataExpModel.rootNodes.
                find((node) => node.connectionUniqueId === connectionUniqueId);
        }
        return connectionNode;
    }
    getConnectionNodes() {
        return this.dataExpModel.rootNodes;
    }
    onDesribeObject(objectProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let requestParams = new dataExplorerRequests_1.DataExplorerDescribeObjectParams();
                requestParams.connectionUri = objectProperties.connectionUri;
                requestParams.objectType = objectProperties.ddexType;
                requestParams.objectName = objectProperties.objectName;
                requestParams.schemaName = objectProperties.schemaName;
                let response = yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerDesribeObjectRequest.type, requestParams);
                if (response) {
                    if (response.messageType === dataExplorerRequests_1.DataExplorerDescribeObjectMessageType.Data) {
                        let panelUri = `${objectProperties.connectionUri}/${objectProperties.ddexType}/${objectProperties.schemaName}.${objectProperties.objectName}`;
                        let describePanel = this.describePanels[panelUri];
                        if (!describePanel) {
                            describePanel = vscode.window.createWebviewPanel("DescribeResults", `Describe: ${objectProperties.objectName}`, vscode.ViewColumn.Active, { enableScripts: true, retainContextWhenHidden: true });
                            describePanel.onDidDispose(() => {
                                delete this.describePanels[panelUri];
                                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(panelUri);
                            }, null, null);
                            resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(describePanel, panelUri, null);
                            this.describePanels[panelUri] = describePanel;
                        }
                        describePanel.webview.html = this.getHtmlForWebview(response.message);
                        describePanel.reveal(describePanel.viewColumn, false);
                    }
                    else {
                        this.vscodeConnector.showErrorMessage(response.message);
                    }
                }
                logger_1.FileStreamLogger.Instance.info("Opened webview with describe result");
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Error on opening webview for describe result");
                logger_1.FileStreamLogger.Instance.error(error.message);
            }
        });
    }
    getHtmlForWebview(bodyHtml) {
        const cssPath = vscode.Uri.file(path.join(this.extensionContext.extensionPath, 'out', 'ui', 'css', "app.css"));
        const cssUri = cssPath.with({ scheme: 'vscode-resource' });
        let html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">  
        <link rel="stylesheet" type="text/css" href="${cssUri}">
    </head>
    <body>
    <div id="customResultContainer" class="viewBody">
    ${bodyHtml}
    </div>
    </body>
    </html>`;
        return html;
    }
    onGenerateStatement(treeNode, stmtType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (treeNode) {
                let connectionNode = this.getConnectionNode(treeNode.connectionURI);
                let objectProperties = new ObjectNodeProperties(treeNode, connectionNode);
                yield this.generateStatement(objectProperties, stmtType, connectionNode.connectionProperties);
            }
        });
    }
    generateStatement(objectProperties, stmtType, connectionProps) {
        return __awaiter(this, void 0, void 0, function* () {
            let uniqueId = utilities_1.ExplorerUtilities.getObjectUri(objectProperties);
            if (this.generateStmtQueue.has(uniqueId)) {
                return;
            }
            yield vscode.window.withProgress({ location: { viewId: constants_1.Constants.dbExplorerViewName } }, () => {
                var p = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        defaultConnectionManager_1.DefaultConnectionManager.instance.associateDefaultConn = false;
                        this.generateStmtQueue.set(uniqueId, null);
                        let requestParams = new dataExplorerRequests_1.DataExplorerGenerateStatementParams();
                        requestParams.connectionUri = objectProperties.connectionUri;
                        requestParams.objectType = objectProperties.ddexType;
                        requestParams.objectName = objectProperties.objectName;
                        requestParams.schemaName = objectProperties.schemaName;
                        requestParams.statementType = stmtType;
                        let response = yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerGenerateStatementRequest.type, requestParams);
                        if (response) {
                            if (response.messageType === dataExplorerRequests_1.DataExplorerGenerateStatementMessageType.Data) {
                                this.generateStmtQueue.set(uniqueId, response.message);
                                this.genStmtResponseCnt++;
                                if (this.generateStmtQueue.keys().next().value === uniqueId ||
                                    this.genStmtResponseCnt === this.generateStmtQueue.size) {
                                    let editor = this.vscodeConnector.activeTextEditor;
                                    if (!editor || !editor.document || editor.document.languageId !== constants_1.Constants.oracleLanguageID ||
                                        editorUtils_1.editorUtils.isExplorerFile(editor.document).explorerFile) {
                                        let document = yield vscode.workspace.openTextDocument({ language: constants_1.Constants.oracleLanguageID, content: "" });
                                        editor = yield vscode.window.showTextDocument(document, vscode.ViewColumn.Active, false);
                                        this.connectionCommandsHandler.createConnectionFromConnProps(connectionProps, document.uri.toString(), true);
                                    }
                                    else if (!this.connectionCommandsHandler.isConnectedToDB(editor.document.uri.toString())) {
                                        this.connectionCommandsHandler.createConnectionFromConnProps(connectionProps, editor.document.uri.toString(), true);
                                    }
                                    if (editor) {
                                        let selection, pos, statement;
                                        let genStmtReqList = [...this.generateStmtQueue.keys()];
                                        for (let i = 0; i < genStmtReqList.length; ++i) {
                                            statement = this.generateStmtQueue.get(genStmtReqList[i]);
                                            if (statement) {
                                                selection = editor.selection;
                                                pos = new vscode.Position(selection.end.line, selection.end.character);
                                                statement = `${statement}\n`;
                                                if (selection.end.character > 0) {
                                                    statement = `\n${statement}`;
                                                }
                                                let success = yield editor.edit((editbuilder) => {
                                                    editbuilder.insert(pos, statement);
                                                });
                                                if (success) {
                                                    vscode.commands.executeCommand(constants_1.Constants.focusCurrentEditor);
                                                    this.vscodeConnector.activeTextEditor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
                                                }
                                                if (this.generateStmtQueue.delete(genStmtReqList[i]))
                                                    this.genStmtResponseCnt--;
                                            }
                                            else
                                                break;
                                        }
                                    }
                                }
                            }
                            else {
                                this.vscodeConnector.showErrorMessage(response.message);
                                if (this.generateStmtQueue.delete(uniqueId))
                                    this.genStmtResponseCnt--;
                            }
                        }
                        logger_1.FileStreamLogger.Instance.info("Opened editor with generated statement");
                    }
                    catch (error) {
                        logger_1.FileStreamLogger.Instance.error("Error on opening editor for generate statement");
                        logger_1.FileStreamLogger.Instance.error(error.message);
                        if (this.generateStmtQueue.delete(uniqueId))
                            this.genStmtResponseCnt--;
                    }
                    finally {
                        defaultConnectionManager_1.DefaultConnectionManager.instance.associateDefaultConn = true;
                        resolve();
                    }
                }));
                return p;
            });
        });
    }
    prepareForCompile(editorUri, editorDoc, isPackageBody = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let isReadyForCompile = true;
                try {
                    let params = editorUtils_1.editorUtils.getQueryParameters(editorUri);
                    if (params) {
                        let [response] = yield utilities_1.ExplorerUtilities.getObjectBasicPropertiesFromDB(params.connectionUri, params.ddexObjectType, params.objectname, params.schemaname, undefined);
                        if (response && response.object && response.object.objectExists) {
                            if (editorDoc) {
                                let editorProvider = (0, extension_1.getSystemManager)().codeEditorProvider;
                                let openFile = editorProvider.openfiles.get(editorDoc.uri.toString());
                                if (openFile) {
                                    yield vscode.window.showTextDocument(editorDoc, { preview: false });
                                    let mtime = new Date(response.object.modifiedDateTime).getTime();
                                    if (mtime > openFile.mtime) {
                                        let errorMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.modifiedInDatabaseMsg, editorUtils_1.editorUtils.getObjectTypeFromDdexType(params.ddexObjectType), params.objectname);
                                        let proceed = yield helper.Utils.promptForConfirmation(errorMsg, this.vscodeConnector, true);
                                        if (proceed == helper.ProceedOption.Cancel) {
                                            logger_1.FileStreamLogger.Instance.info("Cancelled compile of file: " + editorDoc.uri.toString());
                                            resolve(false);
                                            return;
                                        }
                                        else if (proceed == helper.ProceedOption.No) {
                                            editorUtils_1.editorUtils.refreshEditorContents();
                                            resolve(true);
                                            return;
                                        }
                                    }
                                    try {
                                        openFile.overwriteOnSave = true;
                                        yield editorProvider.writeFile(editorDoc.uri, Buffer.from(editorDoc.getText()), null);
                                        editorUtils_1.editorUtils.refreshEditorContents();
                                        isReadyForCompile = !editorUtils_1.editorUtils.hasErrorsOnSave(editorDoc.uri);
                                    }
                                    catch (e) {
                                        isReadyForCompile = false;
                                        logger_1.FileStreamLogger.Instance.error('Failed to save file: ' + e);
                                    }
                                    finally {
                                        openFile.overwriteOnSave = false;
                                    }
                                }
                            }
                        }
                        else if (!isPackageBody) {
                            this.vscodeConnector.showErrorMessage(localizedConstants_1.default.invalidObjectMessage);
                            logger_1.FileStreamLogger.Instance.info(localizedConstants_1.default.invalidObjectMessage);
                            isReadyForCompile = false;
                        }
                    }
                }
                catch (err) {
                    DocumentConnectionInformation_1.fileLogger.log(err);
                    isReadyForCompile = false;
                }
                resolve(isReadyForCompile);
            }));
        });
    }
    onCompileObjectFromFile(debug) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const systemManager = (0, extension_1.getSystemManager)();
                if (systemManager.isExtensionInitialized() && systemManager.documentIsOpenAndOracle()) {
                    if (this.vscodeConnector.isActiveDocumentEmpty()) {
                        return;
                    }
                    if (this.vscodeConnector.activeTextEditor && this.vscodeConnector.activeTextEditor.document &&
                        this.vscodeConnector.activeTextEditor.document.uri) {
                        let activeDoc = this.vscodeConnector.activeTextEditor.document;
                        let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(this.vscodeConnector.activeTextEditor.document);
                        if (explorerFile) {
                            if (editorUtils_1.editorUtils.verifyConnectedToDatabase(activeDoc.uri, this, this.vscodeConnector)) {
                                yield this.compileObject(activeDoc.uri, activeDoc, debug);
                            }
                        }
                    }
                }
            }
            catch (err) {
                logger_1.FileStreamLogger.Instance.error("Error on compiling code object from file");
                helper.logErroAfterValidating(err);
            }
        });
    }
    compileObject(editorUri, editorDoc, debug) {
        return __awaiter(this, void 0, void 0, function* () {
            let canCompileCodeObject = yield this.prepareForCompile(editorUri, editorDoc);
            if (canCompileCodeObject) {
                let params = editorUtils_1.editorUtils.getQueryParameters(editorUri);
                if (params) {
                    try {
                        let connectionNode = this.getConnectionNode(params.connectionUri);
                        if (params.ddexObjectType == dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package) {
                            let dbObjectTye = editorUtils_1.editorUtils.getObjectTypeFromDdexType(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody);
                            var bodyFileUri = editorUtils_1.editorUtils.getEditorUri(constants_1.Constants.oracleScheme, connectionNode.connectionProperties.name, dbObjectTye, params.schemaname, params.objectname, params.connectionUri, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody);
                            var bodyEditorDoc = editorUtils_1.editorUtils.getEditorDocumentFromUri(bodyFileUri);
                            canCompileCodeObject = yield this.prepareForCompile(bodyFileUri, bodyEditorDoc, true);
                        }
                        if (canCompileCodeObject) {
                            const requestParams = new dataExplorerRequests_1.CompileCodeObjectRequestParams();
                            requestParams.debug = debug;
                            requestParams.fileUri = editorUri.toString();
                            requestParams.bodyFileUri = bodyFileUri ? bodyFileUri.toString() : null;
                            requestParams.connectionUri = params.connectionUri;
                            requestParams.objectName = params.objectname;
                            requestParams.objectType = params.ddexObjectType;
                            requestParams.schemaName = params.schemaname;
                            const extensionConfig = setup_1.Setup.getExtensionConfigSection();
                            let compileSettings = extensionConfig.get(constants_1.Constants.compilerSettingsPropertyName);
                            const compilerFlags = compilerSettingsManager_1.CompilerSettingsManager.
                                processCompilerFlagsFromSettings(compileSettings, requestParams.debug);
                            if (compilerFlags.enableFlags)
                                requestParams.parameters = compilerFlags;
                            var [connOpen, timeModifiedInDB] = yield utilities_1.ExplorerUtilities.compileCodeObject(requestParams);
                            if (!connOpen && connectionNode) {
                                this.onConnectionDisconnect(connectionNode, true);
                            }
                            else if (timeModifiedInDB) {
                                if (editorDoc)
                                    editorUtils_1.editorUtils.updateModifiedTime(editorDoc.uri.toString(), timeModifiedInDB);
                                if (bodyEditorDoc)
                                    editorUtils_1.editorUtils.updateModifiedTime(bodyEditorDoc.uri.toString(), timeModifiedInDB);
                            }
                            let treeNode = this.getOENodeFromEditorUri(editorUri);
                            if (treeNode) {
                                yield this.refreshNode(treeNode);
                            }
                        }
                    }
                    catch (err) {
                        logger_1.FileStreamLogger.Instance.error("Error on compiling code object");
                        logger_1.FileStreamLogger.Instance.error(err.message);
                    }
                }
            }
        });
    }
    getOENodeFromEditorUri(editorUri) {
        let oeNode = null;
        try {
            let params = editorUtils_1.editorUtils.getQueryParameters(editorUri);
            if (!params) {
                return oeNode;
            }
            let connNode = null;
            if (this.dataExpModel.rootNodes) {
                connNode = this.dataExpModel.rootNodes.
                    find((node) => node.connectionURI === params.connectionUri);
            }
            if (!connNode) {
                return oeNode;
            }
            let nodePath = [];
            switch (params.ddexObjectType) {
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Procedure:
                    nodePath = [utilities_1.TreeViewConstants.proceduresStr, params.objectname];
                    break;
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Function:
                    nodePath = [utilities_1.TreeViewConstants.functionsStr, params.objectname];
                    break;
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package:
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody:
                    nodePath = [utilities_1.TreeViewConstants.packagesStr, params.objectname];
                    break;
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_TableTriggerMain:
                    nodePath = [utilities_1.TreeViewConstants.triggersStr, utilities_1.TreeViewConstants.tableTriggersStr, params.objectname];
                    break;
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ViewTriggerMain:
                    nodePath = [utilities_1.TreeViewConstants.triggersStr, utilities_1.TreeViewConstants.viewTriggersStr, params.objectname];
                    break;
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_DatabaseTriggerMain:
                    nodePath = [utilities_1.TreeViewConstants.triggersStr, utilities_1.TreeViewConstants.databaseTriggersStr, params.objectname];
                    break;
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_SchemaTriggerMain:
                    nodePath = [utilities_1.TreeViewConstants.triggersStr, utilities_1.TreeViewConstants.schemaTriggersStr, params.objectname];
                    break;
            }
            if (nodePath) {
                if (params.schemaname !== connNode.schemaName) {
                    nodePath.unshift(params.schemaname);
                    nodePath.unshift(utilities_1.TreeViewConstants.usersStr);
                }
                oeNode = this.findNode(connNode, nodePath);
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.error("Error on finding  code object");
            helper.logErroAfterValidating(err);
        }
        return oeNode;
    }
    findNode(connNode, nodePath) {
        let parentNode = connNode;
        for (let i = 0; i < nodePath.length; i++) {
            if (parentNode && parentNode.children) {
                parentNode = parentNode.children.find((node) => node.getNodeIdentifier === nodePath[i]);
            }
            else {
                parentNode = null;
            }
            if (!parentNode) {
                break;
            }
        }
        return parentNode;
    }
    updateExplorerDefaultConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            let defaultConn = defaultConnectionManager_1.DefaultConnectionManager.instance.getDefaultConnection();
            let modelChanged = false;
            this.dataExpModel.rootNodes.forEach((connNode) => {
                if (defaultConn === connNode.connectionProperties.name) {
                    if (connNode.connAssocType !== connectionNode_1.ConnAssocType.Default) {
                        connNode.connAssocType = connectionNode_1.ConnAssocType.Default;
                        modelChanged = true;
                    }
                }
                else if (connNode.connAssocType === connectionNode_1.ConnAssocType.Default) {
                    connNode.connAssocType = connectionNode_1.ConnAssocType.NonDefault;
                    modelChanged = true;
                }
            });
            if (modelChanged) {
                this.dataExpModel.raiseModelChangedEvent();
            }
        });
    }
}
exports.DataExplorerManager = DataExplorerManager;
class ObjectNodeProperties {
    constructor(treeNode, connectionNode, modifiedTimeInDB = undefined, fileModifiedTime = undefined, isDirty = false, objectDdexType = undefined) {
        this.objectName = treeNode.objectName;
        this.schemaName = treeNode.schemaName;
        if (objectDdexType) {
            this.ddexType = objectDdexType;
        }
        else {
            this.ddexType = treeNode.ddexObjectType;
        }
        this.isDirty = isDirty;
        this.fileModifiedTime = fileModifiedTime;
        this.modifiedTimeInDB = modifiedTimeInDB;
        this.connectionUri = treeNode.connectionURI;
        this.dbObject = treeNode.databaseObject;
        if (connectionNode) {
            this.connectionName = connectionNode.connectionProperties.name;
            this.connectionSchemaName = connectionNode.schemaName;
        }
    }
    getObjectDisplayName() {
        let displayName;
        if (this.connectionName) {
            displayName = utilities_1.TreeViewConstants.baseUri + this.connectionName + "/" + this.schemaName + "/" + this.objectName;
        }
        else {
            displayName = this.connectionUri + "/" + this.schemaName + "/" + this.objectName;
        }
        return displayName;
    }
}
exports.ObjectNodeProperties = ObjectNodeProperties;
class ConnectionNodeInfo {
    constructor(oldConnectionName, newConnectionName, connectionUniqueId) {
        this.oldConnectionName = oldConnectionName;
        this.newConnectionName = newConnectionName;
        this.connectionUniqueId = connectionUniqueId;
    }
}
exports.ConnectionNodeInfo = ConnectionNodeInfo;
