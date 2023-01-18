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
exports.RootWebPageArguments = exports.ScriptExecutionCommandHandler = void 0;
const fs_1 = require("fs");
const path = require("path");
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const dataExplorerRequests_1 = require("../explorer/dataExplorerRequests");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const scriptExecutionRequests_1 = require("../models/scriptExecutionRequests");
const helper_1 = require("../utilities/helper");
const localizedConstants_1 = require("./../constants/localizedConstants");
const logger_1 = require("./../infrastructure/logger");
const resultsDataServer_1 = require("./resultsDataServer");
const saveQueryResultRequest_1 = require("./saveQueryResultRequest");
const scriptExecutionEventsHandler_1 = require("./scriptExecutionEventsHandler");
const queryHistoryRequests_1 = require("../explorer/queryHistoryRequests");
const queryBookmarkRequest_1 = require("../explorer/queryBookmarkRequest");
const utilities_1 = require("../explorer/utilities");
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const userPreferenceManager_1 = require("../infrastructure/userPreferenceManager");
const oracleEditorManager_1 = require("../infrastructure/oracleEditorManager");
const setup_1 = require("../utilities/setup");
const fileLogger = logger_1.FileStreamLogger.Instance;
class ScriptExecutionCommandHandler {
    constructor(scriptEventManager, vscodeConnector, customServer, statusbarManager) {
        this.scriptEventManager = scriptEventManager;
        this.vscodeConnector = vscodeConnector;
        this.customServer = customServer;
        this.statusbarManager = statusbarManager;
        this.varScriptExecutionCount = 0;
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.getDataBatch, (message) => {
            this.dataBatchRequestHandler(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.cancelQuery, (message) => {
            this.cancelQuery(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.saveAllRequest, (message) => {
            this.handleSaveAllRequestMessage(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.OracleEventNames.scriptSaveQueryResultCancelRequest, (message) => {
            this.handleCancelSaveAllRequestMessage(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.consumeUserInputRequest, (message) => {
            this.handleConsumeUserInputRequestMessage(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.clearRequest, (message) => {
            this.handleClearRequest(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.updateToolbarEvent, (message) => {
            this.handleUpdateToolbarEventRequest(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.acknowledgeMessageRequest, (message) => {
            this.handleAcknowledgeMessageRequest(message);
        });
    }
    handleAcknowledgeMessageRequest(message) {
        fileLogger.info("handleAcknowledgeMessageRequest request" + scriptExecutionModels_1.ScriptExecutionAcknowledgeMessageRequestParams.displayString(message));
        this.scriptEventManager.processAcknowledgementFromUi(message);
    }
    handleUpdateToolbarEventRequest(message) {
        fileLogger.info("handleUpdateToolbarEventRequest request");
        try {
            logger_1.FileStreamLogger.Instance.info("handleUpdateToolbarEventRequest");
            oracleEditorManager_1.default.instance.handleExecutionStatusChangeInResultUI(message);
        }
        catch (err) {
            fileLogger.error(err);
        }
        fileLogger.info("handleUpdateToolbarEventRequest  fullfilled.");
    }
    handleClearRequest(message) {
        try {
            let data = message;
            let scriptUri = data.ownerUri;
            let currentExecutionId = data.executionId;
            let clearCurrentExecution = false;
            let managers = scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance.getExecutionManagersForUri(scriptUri);
            for (let index = 0; index < managers.length; index++) {
                if (managers[index].executionId == data.executionId &&
                    managers[index].executionStatus == scriptExecutionModels_1.ExecutionStatus.Finished) {
                    clearCurrentExecution = true;
                }
            }
            for (let index = 0; index < data.previousExecutionList.length; index++) {
                const executionId = data.previousExecutionList[index];
                if (executionId.toString() != currentExecutionId) {
                    scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance.unRegisterRunner(scriptUri, executionId);
                }
                else if (clearCurrentExecution) {
                    scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance.unRegisterRunner(scriptUri, executionId);
                }
            }
            this.scriptEventManager.sendQueryExecutionClearEventToServer(data);
        }
        catch (error) {
            helper_1.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
        }
    }
    get scriptExecutionCount() {
        return this.varScriptExecutionCount;
    }
    set scriptExecutionCount(value) {
        this.varScriptExecutionCount = value;
    }
    cancelAllScriptExecution(scriptPath) {
        const runningScripts = this.customServer.getExecutionInfo(scriptPath);
        runningScripts.forEach((clientInfo) => {
            const cancelParams = new scriptExecutionModels_1.CancelScriptExecutionParams();
            cancelParams.executionId = clientInfo.executionId;
            cancelParams.ownerUri = clientInfo.ownerUri;
            this.cancelQuery(cancelParams);
        });
    }
    handleCancelSaveAllRequestMessage(message) {
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(saveQueryResultRequest_1.SaveQueryResultCancelRequest.type, message).then(() => {
            logger_1.FileStreamLogger.Instance.info("Save cancel request accepted .");
        }, (error) => {
            logger_1.FileStreamLogger.Instance.error(`Failed to save data ${message.ownerUri}/${message.executionId}`);
            const errorResponse = new scriptExecutionModels_1.SaveQueryResultFinishedEventParams();
            errorResponse.ownerUri = message.ownerUri;
            errorResponse.queryId = message.queryId;
            errorResponse.messageType = scriptExecutionModels_1.SaveQueryResultMessageType.Error;
            errorResponse.message = error;
            this.customServer.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.OracleEventNames.saveQueryResultFinishedEvent, errorResponse);
        });
        logger_1.FileStreamLogger.Instance.info("sent cancel save request request sccessfully sent");
    }
    handleSaveAllRequestMessage(message) {
        if (!message.saveDataToFile) {
            this.saveQueryResultRequest(message);
            return;
        }
        const options = {};
        options.filters = {};
        options.filters[scriptExecutionModels_1.DataFormat[message.fileFormat]] = helper_1.Utils.getExtension(message.fileFormat);
        vscode.window.showSaveDialog(options).then((response) => {
            if (response) {
                message.fileName = response.fsPath;
                this.saveQueryResultRequest(message);
            }
            else {
                logger_1.FileStreamLogger.Instance.info("User cancelled save dialog all errored");
                const errorResponse = new scriptExecutionModels_1.SaveQueryResultFinishedEventParams();
                errorResponse.ownerUri = message.ownerUri;
                errorResponse.queryId = message.queryId;
                errorResponse.queryResultId = message.queryResultId;
                errorResponse.messageType = scriptExecutionModels_1.SaveQueryResultMessageType.UserCancel;
                this.customServer.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.OracleEventNames.saveQueryResultFinishedEvent, errorResponse);
            }
        }, (error) => {
            logger_1.FileStreamLogger.Instance.error(`Failed to save data ${message.ownerUri}`);
            const errorResponse = new scriptExecutionModels_1.SaveQueryResultFinishedEventParams();
            errorResponse.ownerUri = message.ownerUri;
            errorResponse.queryId = message.queryId;
            errorResponse.queryResultId = message.queryResultId;
            errorResponse.messageType = scriptExecutionModels_1.SaveQueryResultMessageType.Error;
            errorResponse.message = error;
            this.customServer.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.OracleEventNames.saveQueryResultFinishedEvent, errorResponse);
        });
    }
    saveQueryResultRequest(message) {
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(saveQueryResultRequest_1.SaveQueryResultRequest.type, message).then((result) => {
            this.customServer.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.MessageName.saveAllResponse, result);
            userPreferenceManager_1.UserPreferenceManager.Instance.saveResultsWindowUserPreferences(message.fileFormat);
            logger_1.FileStreamLogger.Instance.info("Save request sccessfully sent");
        }, (error) => {
            logger_1.FileStreamLogger.Instance.error(`Failed to save data ${message.ownerUri}`);
            const errorResponse = new scriptExecutionModels_1.SaveQueryResultFinishedEventParams();
            errorResponse.ownerUri = message.ownerUri;
            errorResponse.queryId = message.queryId;
            errorResponse.queryResultId = message.queryResultId;
            errorResponse.messageType = scriptExecutionModels_1.SaveQueryResultMessageType.Error;
            errorResponse.message = error;
            errorResponse.saveDataToFile = message.saveDataToFile;
            this.customServer.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.OracleEventNames.saveQueryResultFinishedEvent, errorResponse);
        });
    }
    cancelQuery(message) {
        fileLogger.info("Handle cancel query request");
        try {
            const args = message;
            if (ScriptExecutionCommandHandler.validateCancelRequestParams(args)) {
                scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance
                    .cancelQuery(args)
                    .then(() => {
                    fileLogger.info("Cancel query request successfully made.");
                })
                    .catch((err) => {
                    fileLogger.error(err);
                });
            }
        }
        catch (err) {
            fileLogger.error(err);
        }
    }
    startQueryExecution(args, fileName, uiMode) {
        fileLogger.info("Query execution is starting for " +
            scriptExecutionModels_1.ScriptExecuteParams.displayString(args) +
            "file:" +
            fileName);
        const self = this;
        fileLogger.info("Script execution Params " + args.ownerUri);
        args.executionId = (++this.scriptExecutionCount).toString();
        let windowTitle = path.basename(fileName);
        windowTitle = `Results: ${windowTitle}`;
        const { isRunning, existingPanel } = this.preProcessScriptExecution(args);
        if (!isRunning || args.loginScript) {
            this.scriptEventManager
                .executeScript(scriptExecutionRequests_1.OracleRequestTypes.scriptExecute, args)
                .then(() => {
                fileLogger.info("Query execution started.Received response from server.");
                let inputArgs = new RootWebPageArguments();
                inputArgs.uri = args.ownerUri;
                inputArgs.executionId = args.executionId;
                inputArgs.windowUri = args.ownerUri;
                inputArgs.uiMode = uiMode;
                if (args.loginScript) {
                    const existingView = this.preProcessLoginScriptExecution(args);
                    this.handleSuccessfullyQueuedLoginScriptExecution(args, self, existingView, uiMode, inputArgs);
                }
                else {
                    this.handleSuccessfullyQueuedScriptExecution(windowTitle, args, self, existingPanel, uiMode, inputArgs);
                }
            }, (err) => {
                this.handleFailureToQueueScriptExecution(err, args, self, existingPanel);
            });
        }
    }
    preProcessScriptExecution(args) {
        let existingPanel;
        const isRunning = this.isRunning(args.ownerUri);
        if (isRunning && !(args.loginScript)) {
            this.vscodeConnector.showInformationMessage(localizedConstants_1.default.scriptIsAlreadyExecutingOrCancelRunningExecution);
        }
        else if (args.loginScript) {
            existingPanel = undefined;
        }
        else {
            const clientList = this.customServer.getClientInfo(args.ownerUri, undefined);
            if (clientList && clientList.length > 0) {
                existingPanel = clientList[0].panel;
            }
            else {
                existingPanel = this.customServer.getFromDetachedPanels(args.ownerUri);
            }
            this.scriptEventManager.unRegisterRunner(args.ownerUri);
            if (!existingPanel) {
                this.closeResultWindow(args.ownerUri);
                this.customServer.unRegisterClient(args.ownerUri);
            }
        }
        return { isRunning, existingPanel };
    }
    preProcessLoginScriptExecution(args) {
        let existingView = false;
        const clientList = this.customServer.getClientInfo(args.ownerUri, undefined);
        if (clientList && clientList.length > 0) {
            existingView = true;
        }
        this.scriptEventManager.unRegisterRunner(args.ownerUri);
        if (!existingView) {
            this.customServer.unRegisterClient(args.ownerUri);
        }
        return existingView;
    }
    startShowDataExecution(args, operationUri) {
        fileLogger.info("Show Data execution is starting for " +
            dataExplorerRequests_1.DataExplorerBasicObjectPropertiesParams.displayString(args) +
            "file:" +
            operationUri);
        const self = this;
        fileLogger.info(`"Show Data execution Params uri  ${args.ownerUri} executionId ${args.executionId}`);
        args.executionId = (++this.scriptExecutionCount).toString();
        let windowTitle = operationUri;
        windowTitle = `Data > ${windowTitle}>${args.schemaName}.${args.objectName}`;
        const { isRunning, existingPanel } = this.preProcessScriptExecution(args);
        if (!isRunning) {
            this.scriptEventManager
                .showObjectData(dataExplorerRequests_1.DataExplorerShowObjectDataRequest.type, args)
                .then(() => {
                let inputArgs = new RootWebPageArguments();
                inputArgs.uri = args.ownerUri;
                inputArgs.executionId = args.executionId;
                inputArgs.windowUri = args.ownerUri;
                inputArgs.uiMode = scriptExecutionModels_1.UIDisplayMode.ShowData;
                this.handleSuccessfullyQueuedScriptExecution(windowTitle, args, self, existingPanel, scriptExecutionModels_1.UIDisplayMode.ShowData, inputArgs);
            }, (error) => {
                this.handleFailureToQueueScriptExecution(error, args, self, existingPanel);
                if (error.code === utilities_1.DataExplorerExceptionCodes.Error_NotConnectedToOracle) {
                    let connectionNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(args.connectionUri);
                    if (connectionNode) {
                        dataExplorerManager_1.DataExplorerManager.Instance.onConnectionDisconnect(connectionNode, true);
                    }
                }
            });
            fileLogger.info("Show Data Query executionstarted");
        }
    }
    startHistObjectExecution(args) {
        const self = this;
        fileLogger.info(`Script execution Params uri  ${args.ownerUri} executionId ${args.executionId}`);
        args.executionId = (++this.scriptExecutionCount).toString();
        let windowTitle = localizedConstants_1.default.history;
        windowTitle = `Run > ${windowTitle}`;
        const { isRunning, existingPanel } = this.preProcessScriptExecution(args);
        if (!isRunning) {
            this.scriptEventManager
                .runHistObject(queryHistoryRequests_1.QueryHistoryRunObjectRequest.type, args)
                .then(() => {
                let inputArgs = new RootWebPageArguments();
                inputArgs.uri = args.ownerUri;
                inputArgs.executionId = args.executionId;
                inputArgs.windowUri = args.ownerUri;
                inputArgs.uiMode = scriptExecutionModels_1.UIDisplayMode.RunCodeObject;
                this.handleSuccessfullyQueuedScriptExecution(windowTitle, args, self, existingPanel, scriptExecutionModels_1.UIDisplayMode.RunCodeObject, inputArgs);
            }, (err) => {
                this.handleFailureToQueueScriptExecution(err, args, self, existingPanel);
            });
            fileLogger.info("Query execution started");
        }
    }
    startBookmarkObjectExecution(args) {
        const self = this;
        fileLogger.info(`Script execution Params uri  ${args.ownerUri} executionId ${args.executionId}`);
        args.executionId = (++this.scriptExecutionCount).toString();
        let windowTitle = localizedConstants_1.default.bookmark;
        windowTitle = `Run : ${args.bookMarkFolderName}.${args.bookMarkItemName}`;
        const { isRunning, existingPanel } = this.preProcessScriptExecution(args);
        if (!isRunning) {
            this.scriptEventManager
                .runBookmarkObject(queryBookmarkRequest_1.RunBookmarkRequest.type, args)
                .then(() => {
                let inputArgs = new RootWebPageArguments();
                inputArgs.uri = args.ownerUri;
                inputArgs.executionId = args.executionId;
                inputArgs.windowUri = args.ownerUri;
                inputArgs.uiMode = scriptExecutionModels_1.UIDisplayMode.RunCodeObject;
                this.handleSuccessfullyQueuedScriptExecution(windowTitle, args, self, existingPanel, scriptExecutionModels_1.UIDisplayMode.RunCodeObject, inputArgs);
            }, (err) => {
                this.handleFailureToQueueScriptExecution(err, args, self, existingPanel);
            });
            fileLogger.info("Query execution started");
        }
    }
    startCodeExecution(args, operationUri, connectionName) {
        fileLogger.info("Query execution is starting for " +
            dataExplorerRequests_1.RunCodeObjectRequestParams.displayString(args) +
            "file:" +
            operationUri);
        const self = this;
        fileLogger.info(`Script execution Params uri  ${args.ownerUri} executionId ${args.executionId}`);
        args.executionId = (++this.scriptExecutionCount).toString();
        let windowTitle = operationUri;
        windowTitle = `Run > ${windowTitle}`;
        const objectnameforTitle = this.getObjectNameForTitle(args);
        if ((objectnameforTitle && this.getObjectNameForTitle.length > 0)) {
            windowTitle = `${windowTitle}>${objectnameforTitle}`;
        }
        const { isRunning, existingPanel } = this.preProcessScriptExecution(args);
        if (!isRunning) {
            this.scriptEventManager
                .runCodeObject(dataExplorerRequests_1.RunCodeObjectRequestStronglyTyped.type, args)
                .then((values) => {
                let inputArgs = new RootWebPageArguments();
                inputArgs.uri = args.ownerUri;
                inputArgs.executionId = args.executionId;
                inputArgs.windowUri = args.ownerUri;
                inputArgs.uiMode = scriptExecutionModels_1.UIDisplayMode.RunCodeObject;
                inputArgs.connectionName = connectionName;
                this.handleSuccessfullyQueuedScriptExecution(windowTitle, args, self, existingPanel, scriptExecutionModels_1.UIDisplayMode.RunCodeObject, inputArgs);
            }, (err) => {
                this.handleFailureToQueueScriptExecution(err, args, self, existingPanel);
            });
            fileLogger.info("Query execution started");
        }
    }
    isRunning(scriptUri) {
        fileLogger.info("Check if query execution is in progress for " + scriptUri);
        return this.scriptEventManager.isRunning(scriptUri);
    }
    cancelScriptExecution(cancelParams) {
        return __awaiter(this, void 0, void 0, function* () {
            fileLogger.info("Cancel query execution for " + cancelParams.ownerUri);
            const result = yield this.scriptEventManager.cancelQuery(cancelParams);
            if (result && result !== true) {
                this.vscodeConnector.showInformationMessage(localizedConstants_1.default.couldNotCancelScriptExecution);
            }
            return result;
        });
    }
    openResultsWindow(scriptUri, windowTitle, executionId, existingPanel, uiMode, inputArgs) {
        fileLogger.info("Open Results window for script uri");
        return new Promise((resolve, reject) => {
            try {
                this.openPanel(windowTitle, scriptUri, executionId, existingPanel, uiMode, inputArgs);
                resolve();
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.log(error);
                reject();
            }
        });
    }
    openResultsView(scriptUri, executionId, existingView, uiMode, inputArgs) {
        fileLogger.info("Open Results window for script uri");
        return new Promise((resolve, reject) => {
            try {
                this.openView(scriptUri, executionId, existingView, uiMode, inputArgs);
                resolve();
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.log(error);
                reject();
            }
        });
    }
    static generateHtml(vscodeConnector, params) {
        const onDiskPath = vscode.Uri.file(constants_1.Constants.websiteOutPath);
        const baseURI = onDiskPath.with({ scheme: "vscode-resource" });
        params.baseDirectory = baseURI;
        params.locale = vscodeConnector.language;
        const workbench = vscodeConnector.getConfiguration("workbench");
        const theme = workbench.colorTheme;
        if (theme.toUpperCase().indexOf("DARK") > -1) {
            params.customTheme = "dark";
            params.themeName = "black";
        }
        else {
            params.customTheme = "light";
            params.themeName = "white";
        }
        params.themeFilePath = `css/${params.themeName}/0.0.1/web/${params.themeName}.css`;
        if (!(0, fs_1.existsSync)(path.join(constants_1.Constants.websiteOutPath, params.themeFilePath))) {
            params.themeFilePath = `css/${params.themeName}/0.0.1/web/${params.themeName}.min.css`;
            params.useMinified = true;
        }
        const content = (0, fs_1.readFileSync)(constants_1.Constants.indexHtmlOutPath, "utf8");
        const data = ScriptExecutionCommandHandler.fillTemplate(content, params);
        return data;
    }
    static fillTemplate(templateString, templateVars) {
        return new Function("return `" + templateString + "`;").call(templateVars);
    }
    handleSuccessfullyQueuedScriptExecution(windowTitle, args, self, existingPanel, uiMode, inputArgs) {
        this.openResultsWindow(args.ownerUri, windowTitle, args.executionId, existingPanel, uiMode, inputArgs).then(() => {
            fileLogger.info("Preview open success.");
            this.customServer.removeFromDetachedPanels(args.ownerUri);
        }, (error) => {
            logger_1.FileStreamLogger.Instance.log(error);
            const cancelParams = new scriptExecutionModels_1.CancelScriptExecutionParams();
            cancelParams.executionId = args.executionId;
            cancelParams.ownerUri = args.ownerUri;
            this.cancelScriptExecution(cancelParams).then(() => {
                fileLogger.info("Canceled running script on window close");
            }, (error) => {
                logger_1.FileStreamLogger.Instance.log(error);
                fileLogger.error("Could not Cancel running script on window close " +
                    args.ownerUri);
            });
            this.vscodeConnector.showErrorMessage(localizedConstants_1.default.unableToOpenResultUI);
            this.scriptEventManager.unRegisterRunner(args.ownerUri, args.executionId);
            self.customServer.unRegisterClient(args.ownerUri, args.executionId);
        });
    }
    handleSuccessfullyQueuedLoginScriptExecution(args, self, existingView, uiMode, inputArgs) {
        this.openResultsView(args.ownerUri, args.executionId, existingView, uiMode, inputArgs).then(() => {
            fileLogger.info("Preview open success.");
        }, (error) => {
            logger_1.FileStreamLogger.Instance.log(error);
            const cancelParams = new scriptExecutionModels_1.CancelScriptExecutionParams();
            cancelParams.executionId = args.executionId;
            cancelParams.ownerUri = args.ownerUri;
            this.cancelScriptExecution(cancelParams).then(() => {
                fileLogger.info("Canceled running script on window close");
            }, (error) => {
                logger_1.FileStreamLogger.Instance.log(error);
                fileLogger.error("Could not Cancel running script on window close " +
                    args.ownerUri);
            });
            this.vscodeConnector.showErrorMessage(localizedConstants_1.default.unableToOpenResultUI);
            this.scriptEventManager.unRegisterRunner(args.ownerUri, args.executionId);
            self.customServer.unRegisterClient(args.ownerUri, args.executionId);
        });
    }
    getObjectNameForTitle(requestParams) {
        let valToReturn = "";
        if (requestParams.parentName && requestParams.parentName.length > 0) {
            valToReturn = (0, helper_1.stringFormatterCsharpStyle)("{0}.{1}.{2}", requestParams.schemaName, requestParams.parentName, requestParams.objectName);
        }
        else {
            valToReturn = (0, helper_1.stringFormatterCsharpStyle)("{0}.{1}", requestParams.schemaName, requestParams.objectName);
        }
        return valToReturn;
    }
    handleFailureToQueueScriptExecution(err, args, self, existingPanel) {
        this.vscodeConnector.showErrorMessage(err.message);
        this.scriptEventManager.unRegisterRunner(args.ownerUri, args.executionId);
        self.customServer.unRegisterClient(args.ownerUri, args.executionId);
        if (existingPanel) {
            self.customServer.addToDetachedPanels(args.ownerUri, existingPanel);
        }
    }
    dataBatchRequestHandler(message) {
        fileLogger.info("Handle data batch request");
        try {
            fileLogger.info(scriptExecutionModels_1.ScriptExecutionDataBatchRequest.displayString(message));
            const args = message;
            if (ScriptExecutionCommandHandler.validateBatchRequestParams(args)) {
                scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance
                    .getDataBatch(args)
                    .then(() => {
                    fileLogger.info("Data batch request successfully made.");
                })
                    .catch((err) => {
                    fileLogger.error(err);
                });
            }
        }
        catch (err) {
            fileLogger.error(err);
        }
    }
    openView(scriptUri, executionId, existingView, uiMode, inputArgs) {
        resultsDataServer_1.ResultDataServer.instanceSingle.registerLoginScriptClient(scriptUri, executionId);
    }
    openPanel(windowTitle, scriptUri, executionId, existingPanel, uiMode, inputArgs) {
        let panel = existingPanel;
        let reuseExistingWindow = existingPanel ? true : false;
        if (!existingPanel) {
            panel = vscode.window.createWebviewPanel("OraclePLSResults", windowTitle, vscode.ViewColumn.Active, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
        }
        let resetWindowState = existingPanel && (uiMode ==
            scriptExecutionModels_1.UIDisplayMode.ConnectionManagement ||
            uiMode == scriptExecutionModels_1.UIDisplayMode.RunCodeObject ||
            uiMode == scriptExecutionModels_1.UIDisplayMode.ShowData);
        if (!existingPanel || resetWindowState) {
            panel.title = windowTitle;
            let args;
            if (inputArgs) {
                args = inputArgs;
            }
            else {
                args = new RootWebPageArguments();
            }
            args.uri = scriptUri;
            args.executionId = executionId;
            args.windowUri = scriptUri;
            args.uiMode = uiMode;
            args.dataBatchSize = setup_1.Setup.getExtensionConfigSection().get(constants_1.Constants.resultSetPageSizePropertyName);
            panel.webview.html = ScriptExecutionCommandHandler.generateHtml(this.vscodeConnector, args);
            panel.onDidDispose(() => {
                this.closeResultWindow(scriptUri);
            }, undefined, this.vscodeConnector.ExtensionContext.subscriptions);
            panel.onDidChangeViewState((e) => {
                if (e && e.webviewPanel) {
                    if (e.webviewPanel.active && e.webviewPanel.visible) {
                        this.statusbarManager.onActiveTextEditorChanged(undefined);
                        if (uiMode == scriptExecutionModels_1.UIDisplayMode.ExecuteScript ||
                            uiMode == scriptExecutionModels_1.UIDisplayMode.ExecuteSQLStatement) {
                            fileLogger.info("Sending Update toolbar event to ScriptResultsModule");
                            let updateParams = new scriptExecutionModels_1.ToolbarEvent();
                            updateParams.ownerUri = scriptUri;
                            updateParams.executionId = executionId;
                            updateParams.windowUri = scriptUri;
                            updateParams.commandName = scriptExecutionModels_1.MessageName.toolbarUpdateEvent;
                            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(scriptUri, executionId, scriptExecutionModels_1.MessageName.toolbarEvent, updateParams);
                        }
                        else {
                            fileLogger.info("Hide toolbar for Webview");
                            oracleEditorManager_1.default.instance.handleExecutionStatusChangeInResultUI(null);
                        }
                    }
                    else {
                        fileLogger.info("Window is either not active or visible");
                        if (this.vscodeConnector.activeTextEditor) {
                            oracleEditorManager_1.default.instance.handleExecutionStatusChangeInResultUI(null);
                        }
                    }
                }
            });
            if (resetWindowState) {
                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(scriptUri);
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, scriptUri, executionId);
            if (!existingPanel) {
                let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(scriptUri, executionId);
                if (clients) {
                    clients.forEach(client => {
                        resultsDataServer_1.ResultDataServer.instanceSingle.AssociateJavaScriptEventWithWindow(panel, client);
                    });
                }
            }
        }
        if (existingPanel && !resetWindowState) {
            resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, scriptUri, executionId);
            if (uiMode == scriptExecutionModels_1.UIDisplayMode.ExecuteSQLStatement ||
                uiMode == scriptExecutionModels_1.UIDisplayMode.ExecuteScript) {
                let config = this.vscodeConnector.getConfiguration(constants_1.Constants.extensionConfigSectionName);
                let clearWindow = false;
                if (config !== null && config !== undefined) {
                    clearWindow = config.get(constants_1.Constants.clearResultsWindowPropertyName);
                }
                if (clearWindow) {
                    const clearParams = new scriptExecutionModels_1.ToolbarEvent();
                    clearParams.ownerUri = scriptUri;
                    clearParams.executionId = executionId;
                    clearParams.windowUri = scriptUri;
                    clearParams.commandName = scriptExecutionModels_1.MessageName.toolbarClearClicked;
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(scriptUri, executionId, scriptExecutionModels_1.MessageName.toolbarEvent, clearParams);
                }
            }
            let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(scriptUri, executionId);
            if (clients) {
                clients.forEach(client => {
                    let readyEvent = new scriptExecutionModels_1.ReceiverReadyEvent();
                    readyEvent.ownerUri = scriptUri;
                    readyEvent.executionId = executionId;
                    resultsDataServer_1.ResultDataServer.instanceSingle.handleReadyRequest(readyEvent);
                });
            }
        }
        panel.reveal(panel.viewColumn, false);
    }
    openConnectionManagementPanel(args, existingPanel) {
        let panel = existingPanel;
        if (!panel) {
            panel = vscode.window.createWebviewPanel("OracleConnectionManagement", args.windowTitle, vscode.ViewColumn.Active, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
        }
        panel.title = args.windowTitle;
        panel.webview.html = ScriptExecutionCommandHandler.generateHtml(this.vscodeConnector, args);
        panel.onDidDispose(() => {
            resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(args.windowUri);
        }, undefined, this.vscodeConnector.ExtensionContext.subscriptions);
        panel.onDidChangeViewState((e) => {
            if (e && e.webviewPanel) {
                if (e.webviewPanel.active && e.webviewPanel.visible) {
                    fileLogger.info("Connection page is active and visible");
                    this.statusbarManager.onActiveTextEditorChanged(undefined);
                    oracleEditorManager_1.default.instance.handleExecutionStatusChangeInResultUI(null);
                }
            }
        });
        panel.reveal(panel.viewColumn, false);
        if (existingPanel) {
            resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(args.windowUri);
        }
        resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, args.windowUri, args.executionId);
        if (!existingPanel) {
            let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri, args.executionId);
            if (clients) {
                clients.forEach(client => {
                    resultsDataServer_1.ResultDataServer.instanceSingle.AssociateJavaScriptEventWithWindow(panel, client);
                });
            }
        }
    }
    openFormatterSettingsPanel(args, toolbar) {
        const clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri);
        const clientInfo = clients && clients.length > 0 ? clients[0] : null;
        let panel = clientInfo ? clientInfo.panel : null;
        if (!panel) {
            panel = vscode.window.createWebviewPanel("OracleFormatterSettings", args.windowTitle, toolbar ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            panel.webview.html = ScriptExecutionCommandHandler.generateHtml(this.vscodeConnector, args);
            panel.onDidDispose(() => {
                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(args.windowUri);
            }, undefined, this.vscodeConnector.ExtensionContext.subscriptions);
            panel.onDidChangeViewState((e) => {
                if (e && e.webviewPanel) {
                    if (e.webviewPanel.active && e.webviewPanel.visible) {
                        fileLogger.info("Formatter settings page is active and visible");
                        this.statusbarManager.onActiveTextEditorChanged(undefined);
                    }
                }
            });
            resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, args.windowUri, args.executionId);
            let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri, args.executionId);
            if (clients) {
                clients.forEach(client => {
                    resultsDataServer_1.ResultDataServer.instanceSingle.AssociateJavaScriptEventWithWindow(panel, client);
                });
            }
        }
        panel.reveal(panel.viewColumn, false);
    }
    openCompilerSettingsPanel(args) {
        const clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri);
        const clientInfo = clients && clients.length > 0 ? clients[0] : null;
        let panel = clientInfo ? clientInfo.panel : null;
        if (!panel) {
            panel = vscode.window.createWebviewPanel("OracleCompilerSettings", args.windowTitle, vscode.ViewColumn.Active, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            panel.webview.html = ScriptExecutionCommandHandler.generateHtml(this.vscodeConnector, args);
            panel.onDidDispose(() => {
                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(args.windowUri);
            }, undefined, this.vscodeConnector.ExtensionContext.subscriptions);
            panel.onDidChangeViewState((e) => {
                if (e && e.webviewPanel) {
                    if (e.webviewPanel.active && e.webviewPanel.visible) {
                        fileLogger.info("Compiler settings page is active and visible");
                        this.statusbarManager.onActiveTextEditorChanged(undefined);
                    }
                }
            });
            resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, args.windowUri, args.executionId);
            let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri, args.executionId);
            if (clients) {
                clients.forEach(client => {
                    resultsDataServer_1.ResultDataServer.instanceSingle.AssociateJavaScriptEventWithWindow(panel, client);
                });
            }
        }
        panel.reveal(panel.viewColumn, false);
    }
    closeResultWindow(scriptUri) {
        fileLogger.info("Closing query results window for script");
        const clientInfos = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(scriptUri);
        for (let index = 0; index < clientInfos.length; index++) {
            const clientInfo = clientInfos[index];
            if (clientInfo) {
                const params = new scriptExecutionModels_1.ScriptExecutionDisposeEventParams();
                params.ownerUri = clientInfo.ownerUri;
                params.executionId = clientInfo.executionId;
                this.scriptEventManager.sendQueryExecutionDisposeEventToServer(params);
                scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance.unRegisterRunner(clientInfo.ownerUri, clientInfo.executionId);
                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(clientInfo.ownerUri, clientInfo.executionId);
                fileLogger.info("Closed query results window for script");
            }
        }
    }
    resetScriptExecution(scriptUri) {
        const params = new scriptExecutionModels_1.ScriptExecutionResetEventParams();
        params.ownerUri = scriptUri;
        this.scriptEventManager.sendQueryExecutionResetEventToServer(params);
    }
    handleConsumeUserInputRequestMessage(message) {
        logger_1.FileStreamLogger.Instance.info("User input received in extension " + scriptExecutionModels_1.UserInputParams.displayString(message));
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(saveQueryResultRequest_1.ConsumeUserInputRequest.type, message).then((response) => {
            logger_1.FileStreamLogger.Instance.info("User input received in successfully");
        }, (error) => {
            logger_1.FileStreamLogger.Instance.warn("User input not accepted .");
        });
    }
}
exports.ScriptExecutionCommandHandler = ScriptExecutionCommandHandler;
ScriptExecutionCommandHandler.validateBatchRequestParams = (args) => {
    if (args.ownerUri && args.batchId && args.queryId && args.executionId && args.queryResultId) {
        return true;
    }
    else {
        return false;
    }
};
ScriptExecutionCommandHandler.validateCancelRequestParams = (args) => {
    if (args.ownerUri) {
        return true;
    }
    else {
        return false;
    }
};
class RootWebPageArguments {
    get windowTitle() {
        return this.varWindowTitle;
    }
    set windowTitle(value) {
        this.varWindowTitle = value;
    }
    get baseDirectory() {
        return this.varBaseDirectory;
    }
    set baseDirectory(value) {
        this.varBaseDirectory = value;
    }
    get locale() {
        return this.varLocale;
    }
    set locale(value) {
        this.varLocale = value;
    }
    get uri() {
        return this.varURI;
    }
    set uri(value) {
        this.varURI = value;
    }
    get baseTheme() {
        return this.varBaseTheme;
    }
    set baseTheme(value) {
        this.varBaseTheme = value;
    }
    get customTheme() {
        return this.varCustomTheme;
    }
    set customTheme(value) {
        this.varCustomTheme = value;
    }
    get executionId() {
        return this.executionIdField;
    }
    set executionId(v) {
        this.executionIdField = v;
    }
    get uiMode() {
        return this.varUIDisplayMode;
    }
    set uiMode(v) {
        this.varUIDisplayMode = v;
    }
    get isCreate() {
        return this.varIsCreate;
    }
    set isCreate(value) {
        this.varIsCreate = value;
    }
    get profileName() {
        return this.varProfileName;
    }
    set profileName(value) {
        this.varProfileName = value;
    }
    get regionName() {
        return this.varRegionName;
    }
    set regionName(value) {
        this.varRegionName = value;
    }
    get windowUri() {
        return this.varWindowUri;
    }
    set windowUri(value) {
        this.varWindowUri = value;
    }
    get adbDisplayName() {
        return this.varadbDisplayName;
    }
    set adbDisplayName(value) {
        this.varadbDisplayName = value;
    }
    get compartmentName() {
        return this.varcompartmentName;
    }
    set compartmentName(value) {
        this.varcompartmentName = value;
    }
    get compartmentFullPath() {
        return this.varcompartmentFullPath;
    }
    set compartmentFullPath(value) {
        this.varcompartmentFullPath = value;
    }
    get adbWorkLoadType() {
        return this.varadbWorkLoadType;
    }
    set adbWorkLoadType(value) {
        this.varadbWorkLoadType = value;
    }
    get adbName() {
        return this.varadbName;
    }
    set adbName(value) {
        this.varadbName = value;
    }
    get adbDatabaseID() {
        return this.varadbDatabaseID;
    }
    set adbDatabaseID(value) {
        this.varadbDatabaseID = value;
    }
    get walletLocation() {
        return this.varwalletLocation;
    }
    set walletLocation(value) {
        this.varwalletLocation = value;
    }
    get documentUri() {
        return this.varDocumentUri;
    }
    set documentUri(v) {
        this.varDocumentUri = v;
    }
    get connectionName() {
        return this._connectionName;
    }
    set connectionName(v) {
        this._connectionName = v;
    }
    get isDedicatedDb() {
        return this.varIsDedicatedDb;
    }
    set isDedicatedDb(value) {
        this.varIsDedicatedDb = value;
    }
    get tlsAuthType() {
        return this.vartlsAuthType;
    }
    set tlsAuthType(value) {
        this.vartlsAuthType = value;
    }
}
exports.RootWebPageArguments = RootWebPageArguments;
