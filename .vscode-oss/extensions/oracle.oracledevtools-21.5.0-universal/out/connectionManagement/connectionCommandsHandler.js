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
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const oracleVSCodeConnector_1 = require("../infrastructure/oracleVSCodeConnector");
const Interfaces = require("../models/connectionModels");
const helper = require("../utilities/helper");
const logger = require("./../infrastructure/logger");
const connectionCommandsScenarioManager_1 = require("./connectionCommandsScenarioManager");
const connectionScenarioManager_1 = require("./connectionScenarioManager");
const connectionSettingsHelper_1 = require("./connectionSettingsHelper");
const DocumentConnectionInformation_1 = require("./DocumentConnectionInformation");
const fileLogger = logger.FileStreamLogger.Instance;
const events_1 = require("events");
const ConnectionRequestNameSpc = require("../models/connectionRequest");
const LangService = require("../models/intellisenseRequests");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const scriptExcutionCommandHandler_1 = require("../scriptExecution/scriptExcutionCommandHandler");
const setup_1 = require("../utilities/setup");
const connectionSettingsManager_1 = require("./connectionSettingsManager");
const utilities_1 = require("../explorer/utilities");
const logger_1 = require("./../infrastructure/logger");
const helper_1 = require("../utilities/helper");
const saveQueryResultRequest_1 = require("../scriptExecution/saveQueryResultRequest");
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const vscode_1 = require("vscode");
const oracleCompletionItemProvider_1 = require("../infrastructure/oracleCompletionItemProvider");
const connectionNode_1 = require("../explorer/nodes/connectionNode");
const userPreferenceManager_1 = require("../infrastructure/userPreferenceManager");
const oracleEditorManager_1 = require("../infrastructure/oracleEditorManager");
const connectionRequest_1 = require("../models/connectionRequest");
const path = require("path");
const editorUtils_1 = require("../explorer/editors/editorUtils");
const defaultConnectionManager_1 = require("./defaultConnectionManager");
const childProcess = require("child_process");
const fs_1 = require("fs");
class ConnectionCommandsHandler {
    constructor(context, statusView, prompter, scriptExecutionCommandHandler, varClient, varVSCcodeConnector, varConnSettingStorageHlpr, connectionLogicMgr) {
        this.prompter = prompter;
        this.scriptExecutionCommandHandler = scriptExecutionCommandHandler;
        this.varClient = varClient;
        this.varVSCcodeConnector = varVSCcodeConnector;
        this.varConnSettingStorageHlpr = varConnSettingStorageHlpr;
        this.connectionLogicMgr = connectionLogicMgr;
        this.requestCount = 0;
        this.onConnectionCompleteEvent = new events_1.EventEmitter();
        this.CONNECTION_COMPLETE_EVENT = "connectionCompleteEvent";
        this.onLoginScriptCompleteEvent = new events_1.EventEmitter();
        this.LOGIN_SCRIPT_COMPLETE_EVENT = "loginScriptCompleteEvent";
        this.lastConnectionType = scriptExecutionModels_1.ConnectionType.DataSource;
        this.varContext = context;
        this.varStatusBarMgr = statusView;
        this.varPrompter = prompter;
        this.varURIToConnPropDictionary = {};
        if (!this.varClient) {
            this.varClient = oracleLanguageServerClient_1.OracleLanguageServerClient.instance;
        }
        if (!this.varVSCcodeConnector) {
            this.varVSCcodeConnector = new oracleVSCodeConnector_1.OracleVSCodeConnector();
        }
        if (!this.varConnSettingStorageHlpr) {
            this.varConnSettingStorageHlpr = new connectionSettingsHelper_1.ConnectionSettingsHelper(context);
        }
        if (!this.connectionLogicMgr) {
            this.connectionLogicMgr = new connectionScenarioManager_1.ConnectionScenarioManager(this, this.varConnSettingStorageHlpr, prompter, this.vscodeConnector, scriptExecutionCommandHandler);
        }
        if (this.varClient !== undefined) {
            this.varClient.onNotification(ConnectionRequestNameSpc.ConnectCompleteEventStronglyTyped.type, this.connectionCompleteEventHandler());
            this.varClient.onNotification(ConnectionRequestNameSpc.TnsUpdatedEventStronglyTyped.type, this.tnsUpdatedEventHandler());
            this.varClient.onNotification(ConnectionRequestNameSpc.dbConnectDisconnectEventStronglyTyped.type, this.dbConnectDisconnectEventHandler());
            this.varClient.onNotification(ConnectionRequestNameSpc.LoginScriptCompleteEventStronglyTyped.type, this.loginScriptCompleteEventHandler());
        }
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.saveProfileRequest, (message) => {
            this.handleSaveProfileRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.validationRequest, (message) => {
            this.handleValidationRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getProfileRequest, (message) => {
            this.handleGetProfileRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getConfigFileLocationsRequest, (message) => {
            this.handleGetTNSNamesLocationRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getTNSNamesRequest, (message) => {
            this.handleGetTNSNamesRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.validateProfileNameRequest, (message) => {
            this.handleValidateProfileNameRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.browseRequest, (message) => {
            this.handleBrowseRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getAllProfieNamesRequest, (message) => {
            this.handleGetAllProfieNamesRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.updateStatusBarEvent, (message) => {
            this.handleUpdateStatusBarEvent(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getSchemasRequest, (message) => {
            this.handleGetSchemasRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.browseLoginRequest, (message) => {
            this.handleBrowseLoginRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.connectionHelpRequest, (message) => {
            this.handleConnectionHelpRequest(message, this);
        });
    }
    handleValidationRequest(message, self) {
        let errorResponse = scriptExecutionModels_1.ValidationRequestParams.createResponse(message);
        try {
            logger.FileStreamLogger.Instance.info("handleValidationRequest" + scriptExecutionModels_1.ValidationRequestParams.displayString(message));
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(saveQueryResultRequest_1.ValidationRequest.type, message).then((response) => {
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.MessageName.validationResponse, response);
            }, (error) => {
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.MessageName.validationResponse, errorResponse);
            });
        }
        catch (error) {
            errorResponse.isValid = false;
            errorResponse.message = error.message;
            logger.FileStreamLogger.Instance.error("handleValidateProfileNameRequest " + errorResponse.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.MessageName.validationResponse, errorResponse);
        }
    }
    handleUpdateStatusBarEvent(message, self) {
        fileLogger.info("handleUpdateStatusBarEvent request");
        try {
            logger.FileStreamLogger.Instance.info("handleUpdateStatusBarEvent");
            self.StatusBarMgr.onActiveTextEditorChanged(undefined);
            oracleEditorManager_1.default.instance.handleExecutionStatusChangeInResultUI(message);
        }
        catch (err) {
            fileLogger.error(err);
        }
    }
    handleGetAllProfieNamesRequest(message, self) {
        try {
            let result = true;
            logger.FileStreamLogger.Instance.info("handleGetAllProfieNamesRequest" + scriptExecutionModels_1.GetAllProfieNamesRequest.displayString(message));
            const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager();
            const profiles = helperSettings.retrieveConnProfilesFromConfig();
            const profileNames = [];
            if (profiles && profiles.length > 0) {
                for (let i = 0; i < profiles.length; i++) {
                    profileNames.push(profiles[i].name);
                }
            }
            const response = scriptExecutionModels_1.GetAllProfieNamesResponse.create(message);
            response.profiles = profileNames;
            response.result = true;
            response.osUser = process.env.USERDOMAIN + "\\" + process.env.USERNAME;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getAllProfieNamesResponse, response);
        }
        catch (error) {
            const response = scriptExecutionModels_1.GetAllProfieNamesResponse.create(message);
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("handleGetAllProfieNamesRequest " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getAllProfieNamesResponse, response);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        }
    }
    handleBrowseRequest(message, self) {
        logger.FileStreamLogger.Instance.info("handleBrowseRequest" + scriptExecutionModels_1.BrowseRequest.displayString(message));
        const options = {};
        options.canSelectFiles = false;
        options.canSelectFolders = true;
        options.canSelectMany = false;
        let defaultPath = message.path;
        if (!defaultPath) {
            if (setup_1.ConfigManager.instance.tnsAdmin) {
                defaultPath = setup_1.ConfigManager.instance.tnsAdmin;
            }
        }
        options.defaultUri = vscode.Uri.file(defaultPath);
        options.openLabel = localizedConstants_1.default.selectFolder;
        vscode.window.showOpenDialog(options).then((uri) => {
            const response = scriptExecutionModels_1.BrowseResponse.create(message);
            response.result = true;
            if (uri && uri.length > 0) {
                response.path = uri[0].fsPath;
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.browseReponseForDownloadCredentialPage, response);
            logger_1.FileStreamLogger.Instance.info("Sent BrowseResponse successfully");
        }, (error) => {
            const response = scriptExecutionModels_1.BrowseResponse.create(message);
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("BrowseResponse " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.browseReponseForDownloadCredentialPage, response);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        });
    }
    handleBrowseLoginRequest(message, self) {
        logger.FileStreamLogger.Instance.info("handleBrowseLoginRequest" + scriptExecutionModels_1.BrowseRequest.displayString(message));
        const options = {};
        options.canSelectFiles = true;
        options.canSelectFolders = false;
        options.canSelectMany = false;
        let defaultPath = message.path;
        if (!defaultPath) {
            if (setup_1.ConfigManager.instance.loginScript) {
                defaultPath = setup_1.ConfigManager.instance.loginScript;
            }
            else {
                defaultPath = '';
            }
        }
        options.defaultUri = vscode.Uri.file(defaultPath);
        options.openLabel = localizedConstants_1.default.selectFile;
        vscode.window.showOpenDialog(options).then((uri) => {
            const response = scriptExecutionModels_1.BrowseResponse.create(message);
            response.result = true;
            if (uri && uri.length > 0) {
                response.path = uri[0].fsPath;
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.browseReponse, response);
            logger_1.FileStreamLogger.Instance.info("Sent BrowseResponse successfully");
        }, (error) => {
            const response = scriptExecutionModels_1.BrowseResponse.create(message);
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("BrowseResponse " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.browseReponse, response);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        });
    }
    handleConnectionHelpRequest(message, self) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.FileStreamLogger.Instance.info("processing handleConnectionHelpRequest");
            const response = new scriptExecutionModels_1.ConnectionHelpResponse();
            try {
                logger.FileStreamLogger.Instance.info("Launching ODTVSCode connection help page");
                const startCommand = (process.platform === constants_1.Constants.macOSprocessplatform ? constants_1.Constants.macOSOpenCommand :
                    process.platform === constants_1.Constants.windowsProcessPlatform ? constants_1.Constants.windowsOpenCommand : constants_1.Constants.linuxOpenCommand);
                logger_1.ChannelLogger.Instance.info(helper.stringFormatterCsharpStyle(localizedConstants_1.default.outwindowConnectionPageDialogue, constants_1.Constants.oracleConnectionHelpURL));
                yield childProcess.exec(`${startCommand} ${constants_1.Constants.oracleConnectionHelpURL}`);
                response.resultMsg = localizedConstants_1.default.launchedConnectionHelpPage;
                response.result = true;
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.connectionHelpResponse, response);
            }
            catch (error) {
                response.resultMsg = localizedConstants_1.default.failedToLaunchConnectionHelpPage + error;
                response.result = false;
                logger.FileStreamLogger.Instance.error(response.resultMsg);
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.connectionHelpResponse, response);
            }
        });
    }
    handleValidateProfileNameRequest(message, self) {
        try {
            let result = true;
            logger.FileStreamLogger.Instance.info("handleValidateProfileNameRequest" + scriptExecutionModels_1.ValidateProfileNameRequest.displayString(message));
            const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager();
            const profiles = helperSettings.retrieveConnProfilesFromConfig();
            if (profiles && profiles.length > 0) {
                for (let i = 0; i < profiles.length; i++) {
                    if (profiles[i].name === message.profileName) {
                        result = false;
                        break;
                    }
                }
            }
            const response = scriptExecutionModels_1.ValidateProfileNameResponse.create(message);
            response.result = result;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.validateProfileNameResponse, response);
        }
        catch (error) {
            const response = scriptExecutionModels_1.ValidateProfileNameResponse.create(message);
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("handleValidateProfileNameRequest " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.validateProfileNameResponse, response);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        }
    }
    handleGetTNSNamesRequest(message, self) {
        try {
            const tnslist = [];
            logger.FileStreamLogger.Instance.info("GetTNSNamesRequest" + scriptExecutionModels_1.GetTNSNamesRequest.displayString(message));
            const getDataSourceRequest = new ConnectionRequestNameSpc.GetDataSourcesRequestParameters();
            getDataSourceRequest.location = message.location;
            getDataSourceRequest.windowUri = message.windowUri;
            getDataSourceRequest.ownerUri = message.ownerUri;
            getDataSourceRequest.executionId = message.executionId;
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(ConnectionRequestNameSpc.GetDataSourcesRequest.type, getDataSourceRequest).
                then((lspResponse) => {
                if (lspResponse) {
                    for (const tns of lspResponse.dataSources) {
                        tnslist.push(tns);
                    }
                    const response = scriptExecutionModels_1.GetTNSNamesResponse.create(message);
                    response.tnsnames = tnslist;
                    response.result = true;
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getTNSNamesResponse, response);
                }
            }, (error) => {
                const response = scriptExecutionModels_1.GetTNSNamesResponse.create(message);
                response.result = false;
                response.message = error.message;
                logger.FileStreamLogger.Instance.error("handleGetTNSNamesRequest " + response.message);
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getTNSNamesResponse, response);
                helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
            });
        }
        catch (error) {
            const response = scriptExecutionModels_1.GetTNSNamesResponse.create(message);
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("handleGetTNSNamesRequest " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getTNSNamesResponse, response);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        }
    }
    handleGetTNSNamesLocationRequest(message, self) {
        try {
            logger.FileStreamLogger.Instance.info("handleGetTNSNamesLocationRequest" + scriptExecutionModels_1.GetConfigFileLocationsRequest.displayString(message));
            let config = setup_1.Setup.getExtensionConfigSection();
            const result = [];
            const currentTNSLocation = config.inspect(constants_1.Constants.configFileFolderPropertyName) ? config.get(constants_1.Constants.configFileFolderPropertyName) : undefined;
            const currentWalletLocation = config.inspect(constants_1.Constants.walletFileFolderPropertyName) ? config.get(constants_1.Constants.walletFileFolderPropertyName) : undefined;
            const response = scriptExecutionModels_1.GetConfigFileLocationsResponse.create(message);
            response.result = true;
            response.tnsLocation = currentTNSLocation;
            response.walletLocation = currentWalletLocation;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getConfigFileLocationsResponse, response);
            logger.FileStreamLogger.Instance.info("Send tns locations");
        }
        catch (error) {
            const response = scriptExecutionModels_1.GetConfigFileLocationsResponse.create(message);
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("handleGetProfileRequest " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getConfigFileLocationsResponse, response);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        }
    }
    handleGetProfileRequest(message, self) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = scriptExecutionModels_1.GetProfileResponse.create(message);
            try {
                this.validateGetProfileArgs(message);
                let connPropVsCode;
                logger.FileStreamLogger.Instance.info("handleGetProfileRequest" + message.profileName);
                const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager();
                const profiles = helperSettings.retrieveConnProfilesFromConfig();
                if (profiles && profiles.length > 0) {
                    for (let i = 0; i < profiles.length; i++) {
                        if (profiles[i].name === message.profileName) {
                            connPropVsCode = profiles[i];
                            break;
                        }
                    }
                }
                if (!connPropVsCode) {
                    throw Error(`${localizedConstants_1.default.profileWithProfileNameDoesNotExist}`);
                }
                else {
                    let profileUpgraded = false;
                    [connPropVsCode, profileUpgraded] = yield this.upgradeProfileIfNeeded(connPropVsCode);
                }
                response.profile = connPropVsCode;
                let connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionName(connPropVsCode.name);
                if (connNode) {
                    response.connectionUniqueId = connNode.connectionUniqueId;
                    response.defaultConnection = (connNode.connAssocType === connectionNode_1.ConnAssocType.Default);
                }
                response.result = true;
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getProfileResponse, response);
                logger.FileStreamLogger.Instance.info(`sent profile ${response.profile.name}`);
            }
            catch (error) {
                response.result = false;
                response.message = error.message;
                logger.FileStreamLogger.Instance.error("handleGetProfileRequest " + response.message);
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getProfileResponse, response);
                helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
            }
        });
    }
    handleGetSchemasRequest(message, self) {
        const response = scriptExecutionModels_1.GetSchemasResponse.create(message);
        try {
            const schemas = [];
            logger.FileStreamLogger.Instance.info("GetSchemasRequest" + scriptExecutionModels_1.GetSchemasRequest.displayString(message));
            const getSchemasRequest = new ConnectionRequestNameSpc.GetSchemasRequestParameters();
            this.inheritConfigFileLocations(message.profile);
            const connectionDetails = connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.createNameValueConnectionProperties(message.profile);
            getSchemasRequest.connectionAttributes = connectionDetails;
            getSchemasRequest.windowUri = message.windowUri;
            getSchemasRequest.ownerUri = message.ownerUri;
            getSchemasRequest.executionId = message.executionId;
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(ConnectionRequestNameSpc.GetSchemasRequest.type, getSchemasRequest).
                then((lspResponse) => {
                if (lspResponse) {
                    if (helper.isEmpty(lspResponse.errorMessage)) {
                        for (const schema of lspResponse.schemas) {
                            schemas.push(schema);
                        }
                        response.schemas = schemas;
                        response.userIdUsedToConnect = lspResponse.userIdUsedToConnect;
                        response.result = true;
                    }
                    else {
                        response.message = lspResponse.errorMessage;
                        response.result = false;
                        helper_1.AppUtils.ShowErrorAndLog({
                            "message": helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetSchemaInfo, response.message)
                        }, self.vscodeConnector);
                    }
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getSchemasResponse, response);
                }
            }, (error) => {
                response.result = false;
                response.message = error.message;
                logger.FileStreamLogger.Instance.error("handleGetSchemasRequest " + response.message);
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getSchemasResponse, response);
                helper_1.AppUtils.ShowErrorAndLog({
                    "message": helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetSchemaInfo, response.message)
                }, self.vscodeConnector);
            });
        }
        catch (error) {
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("handleGetSchemasRequest " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getSchemasResponse, response);
            helper_1.AppUtils.ShowErrorAndLog({
                "message": helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetSchemaInfo, response.message)
            }, self.vscodeConnector);
        }
    }
    validateGetProfileArgs(msg) {
        if (!msg.profileName) {
            throw Error(localizedConstants_1.default.profileNameCannotBeEmptyForGetProfileNameRequest);
        }
        else {
            return true;
        }
    }
    get vscodeConnector() {
        return this.varVSCcodeConnector;
    }
    get connectionUI() {
        return this.connectionLogicMgr;
    }
    get ConnectionRepository() {
        return this.varConnSettingStorageHlpr;
    }
    get LanguageServerClient() {
        return this.varClient;
    }
    get StatusBarMgr() {
        return this.varStatusBarMgr;
    }
    get connectionCount() { return Object.keys(this.varURIToConnPropDictionary).length; }
    handleSaveProfileRequest(message, self) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.FileStreamLogger.Instance.info("handleSaveProfileRequest " + scriptExecutionModels_1.SaveProfileRequest.displayString(message));
                let connNode;
                if (message.saveProfileType !== scriptExecutionModels_1.SaveProfileType.create) {
                    connNode = dataExplorerManager_1.DataExplorerManager.Instance.
                        getConnectionNodeFromConnectionUniqueId(message.connectionUniqueId);
                    if (!connNode) {
                        const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
                        response.result = false;
                        response.message = localizedConstants_1.default.connectionDoesnotExist;
                        logger.FileStreamLogger.Instance.error("handleSaveProfileRequest " + response.message);
                        self.vscodeConnector.showErrorMessage(response.message);
                        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveProfileResponse, response);
                        return;
                    }
                    if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.update &&
                        message.profile.name !== connNode.connectionProperties.name) {
                        logger.FileStreamLogger.Instance.info("Connection name is also changed, save type is RenameAndUpdate");
                        message.saveProfileType = scriptExecutionModels_1.SaveProfileType.renameAndUpdate;
                    }
                    else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.renameAndUpdate &&
                        message.profile.name === connNode.connectionProperties.name) {
                        logger.FileStreamLogger.Instance.info("Connection name is not changed, save type is Update");
                        message.saveProfileType = scriptExecutionModels_1.SaveProfileType.update;
                    }
                    else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.rename &&
                        message.profile.name === connNode.connectionProperties.name) {
                        logger.FileStreamLogger.Instance.info("Connection name is not changed, no rename or update needed");
                        const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
                        response.profile = connNode.connectionProperties;
                        response.result = true;
                        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveProfileResponse, response);
                        return;
                    }
                    else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.setDefConnection) {
                        logger.FileStreamLogger.Instance.info("Connection name is not changed, save type is set default connection");
                        message.saveProfileType = scriptExecutionModels_1.SaveProfileType.setDefConnection;
                    }
                    message.oldConnectionName = connNode.connectionProperties.name;
                }
                if (message.saveProfileType !== scriptExecutionModels_1.SaveProfileType.update && message.saveProfileType !== scriptExecutionModels_1.SaveProfileType.setDefConnection) {
                    let profileNameUnique = false;
                    if (message.profile) {
                        const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager();
                        if (!helper.isEmpty(message.profile.name)
                            && helperSettings.checkProfileNameForUniqueness(message.profile.name)) {
                            profileNameUnique = true;
                        }
                    }
                    if (!profileNameUnique) {
                        const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
                        response.result = false;
                        response.message = localizedConstants_1.default.profileNameNotUnique;
                        logger.FileStreamLogger.Instance.error("handleSaveProfileRequest " + response.message);
                        self.vscodeConnector.showErrorMessage(response.message);
                        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveProfileResponse, response);
                        return;
                    }
                }
                if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.update ||
                    message.saveProfileType === scriptExecutionModels_1.SaveProfileType.renameAndUpdate) {
                    let msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.closeDocsOnUpdateWarning, message.profile.name);
                    let proceed = yield helper.Utils.promptForConfirmation(msg, this.vscodeConnector);
                    if (proceed) {
                        yield this.handleSaveProfileRequestWithProgress(message, connNode, self);
                    }
                    else {
                        const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
                        response.result = false;
                        logger.FileStreamLogger.Instance.info("handleSaveProfileRequest - User canceled update");
                        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveProfileResponse, response);
                        return;
                    }
                }
                else {
                    yield this.handleSaveProfileRequestWithProgress(message, connNode, self);
                }
            }
            catch (error) {
                const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
                response.result = false;
                response.message = error.message ? error.message : error.errorMessage;
                logger.FileStreamLogger.Instance.error("handleSaveProfileRequest " + response.message);
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveProfileResponse, response);
                helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
            }
        });
    }
    handleSaveProfileRequestWithProgress(message, connectionNode, self) {
        return __awaiter(this, void 0, void 0, function* () {
            let progressTitle = "";
            switch (message.saveProfileType) {
                case scriptExecutionModels_1.SaveProfileType.create:
                    progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.creatingConnection, message.profile.name);
                    break;
                case scriptExecutionModels_1.SaveProfileType.rename:
                    progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.renamingConnection, message.oldConnectionName, message.profile.name);
                    break;
                case scriptExecutionModels_1.SaveProfileType.renameAndUpdate:
                    progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updatingAndRenamingConnection, message.oldConnectionName, message.profile.name);
                    break;
                case scriptExecutionModels_1.SaveProfileType.update:
                case scriptExecutionModels_1.SaveProfileType.setDefConnection:
                    progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updatingConnection, message.profile.name);
                    break;
            }
            vscode.window.withProgress({ location: vscode_1.ProgressLocation.Notification, title: progressTitle }, (progress, token) => {
                var p = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield this.handleSaveProfileRequestContinue(message, connectionNode, self);
                        if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.rename ||
                            message.saveProfileType === scriptExecutionModels_1.SaveProfileType.renameAndUpdate) {
                            yield defaultConnectionManager_1.DefaultConnectionManager.instance.connectionRenamed(message.oldConnectionName, message.profile.name);
                        }
                    }
                    catch (err) {
                        logger_1.FileStreamLogger.Instance.info("Error on updating connection- " + message.profile.name);
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
    handleSaveProfileRequestContinue(message, connectionNode, self) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
            try {
                if (message.setDefaultConnection || message.unsetDefaultConnection) {
                    let assocType = connectionNode_1.ConnAssocType.Default;
                    if (message.setDefaultConnection) {
                        assocType = connectionNode_1.ConnAssocType.Default;
                    }
                    else if (message.unsetDefaultConnection) {
                        assocType = connectionNode_1.ConnAssocType.NonDefault;
                    }
                    let connNode = undefined;
                    if (message.connectionUniqueId) {
                        connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueId(message.connectionUniqueId);
                    }
                    else {
                        connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionName(message.profile.name);
                    }
                    if (connNode) {
                        dataExplorerManager_1.DataExplorerManager.Instance.onSetUnsetDefaultConnection(connNode, assocType);
                    }
                    else {
                        defaultConnectionManager_1.DefaultConnectionManager.instance.updateDefaultConnection(message.profile.name);
                    }
                }
                if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.rename) {
                    response.profile = yield dataExplorerManager_1.DataExplorerManager.Instance.renameConnectionFromConnectionUI(message.oldConnectionName, message.profile.name);
                    response.result = (response.profile !== undefined);
                }
                else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.setDefConnection) {
                    response.result = true;
                    response.profile = message.profile;
                }
                else {
                    let ownerUri;
                    if (message.documentUri) {
                        ownerUri = message.documentUri;
                    }
                    if (helper.isEmpty(ownerUri)) {
                        if (message.ownerUri) {
                            ownerUri = message.ownerUri;
                        }
                        else {
                            ownerUri = `${utilities_1.TreeViewConstants.baseUri}${message.profile.name}`;
                        }
                    }
                    this.inheritConfigFileLocations(message.profile);
                    let associateToDoc = false;
                    let connSource = connectionRequest_1.ConnectionSource.ConnectionDialog;
                    if (message.documentUri) {
                        associateToDoc = true;
                        connSource = connectionRequest_1.ConnectionSource.Editor;
                    }
                    const connectResult = yield self.connect(ownerUri, message.profile, true, false, connSource, false);
                    if (connectResult) {
                        dataExplorerManager_1.DataExplorerManager.Instance.connectionToSelect = message.profile.name;
                        if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.renameAndUpdate ||
                            message.saveProfileType === scriptExecutionModels_1.SaveProfileType.update) {
                            dataExplorerManager_1.DataExplorerManager.Instance.updatingConnectionNodeInfo =
                                new dataExplorerManager_1.ConnectionNodeInfo(message.oldConnectionName, message.profile.name, connectionNode.connectionUniqueId);
                        }
                        const savedProfile = yield self.connectionLogicMgr.saveVsCodeProfile(message.profile, message.oldConnectionName);
                        if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.create) {
                            const savedConn = self.getSavedConnectionProperties(ownerUri);
                            let connectionString;
                            if (savedConn !== undefined) {
                                connectionString = savedConn.connectionString;
                            }
                            userPreferenceManager_1.UserPreferenceManager.Instance.saveConnectionUIUserPreferences(message.profile, connectionString);
                        }
                        if (!associateToDoc) {
                            yield self.doDisconnect(ownerUri, false);
                        }
                        response.result = true;
                        this.lastConnectionType = savedProfile.connectionType;
                        response.profile = savedProfile;
                        if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.create && message.documentUri) {
                            response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConnProfileCreatedAndConnected, message.profile.name);
                        }
                        else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.create) {
                            response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConnProfileCreated, message.profile.name);
                        }
                        else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.renameAndUpdate) {
                            response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.connectionUpdatedAndRenamed, message.oldConnectionName, message.profile.name);
                        }
                        else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.update) {
                            response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConnProfileUpdated, message.profile.name);
                        }
                        self.vscodeConnector.showInformationMessage(response.message);
                    }
                    else {
                        const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
                        response.result = false;
                        response.message = localizedConstants_1.default.couldNotconnectToServer;
                        logger.FileStreamLogger.Instance.error("handleSaveProfileRequest " + response.message);
                    }
                }
            }
            catch (error) {
                dataExplorerManager_1.DataExplorerManager.Instance.connectionToSelect = undefined;
                dataExplorerManager_1.DataExplorerManager.Instance.updatingConnectionNodeInfo = undefined;
                const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
                response.result = false;
                response.message = error.message ? error.message : error.errorMessage;
                logger.FileStreamLogger.Instance.error("handleSaveProfileRequest " + response.message);
                helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
            }
            finally {
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveProfileResponse, response);
            }
        });
    }
    connectFromExplorer(fileUri, connectionCreds) {
        return __awaiter(this, void 0, void 0, function* () {
            let valToreturn = false;
            try {
                const selectedItem = {
                    label: "testname",
                    connectionProperties: connectionCreds,
                    matchingEnumType: Interfaces.ConnectionAttributesSelection.SavedProfile,
                };
                var profileToreturn = yield this.connectionUI.shallAskForAnyMissingConnInfo(selectedItem.connectionProperties, true);
                if (!profileToreturn) {
                    throw new Error("User input not provided.");
                }
                let profileUpgraded = false;
                [profileToreturn, profileUpgraded] = yield this.upgradeProfileIfNeeded(profileToreturn);
                valToreturn = yield this.connect(fileUri, profileToreturn, false, false, connectionRequest_1.ConnectionSource.Explorer);
                if (valToreturn && profileUpgraded) {
                    try {
                        yield this.connectionLogicMgr.saveVsCodeProfile(profileToreturn, "");
                    }
                    catch (err) {
                        fileLogger.error("Error on saving profile.");
                        helper.logErroAfterValidating(err);
                    }
                }
            }
            catch (err) {
                throw err;
            }
            return valToreturn;
        });
    }
    connect(fileUri, connectionCreds, createProfile, showmessage, connSource, runLoginScript = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let myreject;
            let myresolve;
            const promiseToReturn = new Promise((resolve, reject) => { myreject = reject; myresolve = resolve; });
            let requestId = (++this.requestCount).toString();
            const connProperties = new DocumentConnectionInformation_1.DocumentConnectionInformation();
            connProperties.connectionAttributes = connectionCreds;
            connProperties.isConnecting = true;
            connProperties.createProfile = createProfile;
            connProperties.requestId = requestId;
            self.addConnectionToMap(fileUri, connProperties);
            if (self.StatusBarMgr) {
                self.StatusBarMgr.connectingToDB(fileUri, connectionCreds);
            }
            fileLogger.info(helper.stringFormatterCsharpStyle("Connecting to Oracle database for document."));
            connProperties.connectCompleteHandler = ((connectResult, error) => {
                if (error) {
                    myreject();
                }
                else {
                    myresolve(connectResult);
                    if (!runLoginScript)
                        return;
                    let loginScriptUri = connectionCreds.loginScript;
                    let globalLoginScriptUri = setup_1.ConfigManager.instance.loginScript;
                    if ((helper.isEmpty(loginScriptUri)) && (!helper.isEmpty(globalLoginScriptUri))) {
                        loginScriptUri = globalLoginScriptUri;
                    }
                    if (!helper.isEmpty(loginScriptUri)) {
                        if (!(0, fs_1.existsSync)(loginScriptUri)) {
                            logger_1.FileStreamLogger.Instance.error("Could not find login script " + loginScriptUri);
                            let notFoundMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.scriptNotFound, loginScriptUri);
                            logger_1.ChannelLogger.Instance.error(notFoundMsg);
                        }
                        else {
                            this.runLoginScript(fileUri, loginScriptUri, connectionCreds);
                            return;
                        }
                    }
                    if (connSource == connectionRequest_1.ConnectionSource.Explorer) {
                        const params = new ConnectionRequestNameSpc.LoginScriptCompleteEventParams();
                        params.ownerUri = fileUri;
                        params.connectionUri = fileUri;
                        params.currentSchema = helper.isEmpty(connectionCreds.currentSchema) ? connectionCreds.userID : connectionCreds.currentSchema;
                        params.connectionId = this.varURIToConnPropDictionary[fileUri].connectionId;
                        this.onLoginScriptCompleteEvent.emit(this.LOGIN_SCRIPT_COMPLETE_EVENT, params);
                    }
                    self.varClient.sendNotification(LangService.BuildIntelliSenseOnConnectNotification.event, {
                        ownerUri: fileUri,
                        connectionSource: connSource
                    });
                }
            });
            const connectionDetails = connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.createNameValueConnectionProperties(connectionCreds);
            const connRequestParameters = new ConnectionRequestNameSpc.ConnectRequestParameters();
            connRequestParameters.requestId = requestId;
            connRequestParameters.ownerUri = fileUri;
            connRequestParameters.connectionAttributes = connectionDetails;
            connRequestParameters.connectionSource = connSource;
            yield self.LanguageServerClient.sendRequest(ConnectionRequestNameSpc.ConnectRequestStronglyTyped.type, connRequestParameters).then((result) => {
                if (!result) {
                    myresolve(false);
                }
            }, (err) => {
                myreject(err);
            });
            return promiseToReturn;
        });
    }
    runLoginScript(ownerUri, loginScriptUri, connAttributes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!helper.isEmpty(loginScriptUri)) {
                try {
                    const executeQueryRequest = new scriptExecutionModels_1.ScriptExecuteParams();
                    executeQueryRequest.ownerUri = constants_1.Constants.loginScriptResultsWindowUri;
                    executeQueryRequest.executionMode = scriptExecutionModels_1.ExecutionMode.File;
                    executeQueryRequest.loginScript = true;
                    executeQueryRequest.loginScriptUri = loginScriptUri;
                    executeQueryRequest.connectionUri = ownerUri;
                    executeQueryRequest.connectionName = connAttributes.name;
                    this.scriptExecutionCommandHandler.startQueryExecution(executeQueryRequest, loginScriptUri, scriptExecutionModels_1.UIDisplayMode.ExecuteScript);
                }
                catch (err) {
                    helper.logErroAfterValidating(err);
                }
            }
        });
    }
    changeDatabaseConnectionForDoc(oldUri, newUri) {
        const self = this;
        const process = self.isConnectedToDB(oldUri) && !self.isConnectedToDB(newUri);
        if (process) {
            const connprop = self.getSavedConnectionProperties(oldUri).connectionAttributes;
            self.connect(newUri, connprop, false, false, connectionRequest_1.ConnectionSource.Editor).then((result) => {
                if (result) {
                    self.doDisconnect(oldUri, false);
                }
            });
        }
    }
    cancelConnectHandler() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            try {
                const result = yield self.connectionUI.aksToCancelConnection();
                if (result) {
                    yield self.processCancelConnect();
                    const uri = self.vscodeConnector.activeTextEditorUri;
                    if (uri) {
                        self.deleteConnectionFromMap(uri);
                    }
                }
            }
            catch (err) {
                helper.logErroAfterValidating(err);
            }
        });
    }
    clearMRUConnectionList() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let result = yield self.connectionLogicMgr.askToClearRecentConnectionsList();
            if (result) {
                yield self.ConnectionRepository.clearAllRecentlyUsedConnections();
                yield self.vscodeConnector.showInformationMessage(localizedConstants_1.default.msgClearedRecentList);
            }
        });
    }
    textDocumentOpenHandler(doc) {
        const self = this;
        const uri = helper.convertURIToString(doc.uri);
        if (doc.languageId === constants_1.Constants.oracleLanguageID
            && typeof (self.getSavedConnectionProperties(uri)) === "undefined") {
            let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(doc);
            if (!explorerFile) {
                self.StatusBarMgr.displayDefaults(uri);
            }
        }
    }
    addConnectionCompleteEventHandler(handler) {
        this.onConnectionCompleteEvent.on(this.CONNECTION_COMPLETE_EVENT, handler);
    }
    connectionCompleteEventHandler() {
        const self = this;
        return (response) => {
            const connOwnerURI = response.uri;
            const savedConn = self.getSavedConnectionProperties(connOwnerURI);
            if (savedConn !== undefined && savedConn.requestId === response.requestId) {
                fileLogger.info("Processing connection complete event");
                savedConn.isConnecting = false;
                const connectionProps = savedConn.connectionAttributes;
                let mruConnection = {};
                if (helper.isNotEmpty(response.connectionId)) {
                    savedConn.connectionId = response.connectionId;
                    savedConn.errorNumber = undefined;
                    savedConn.errorMessage = undefined;
                    savedConn.connectionSummary = response.connectionSummary;
                    savedConn.connectionString = response.connectionString;
                    fileLogger.info("Connected to Database for Document");
                    self.StatusBarMgr.displayConnectSuccess(connOwnerURI, savedConn.connectionAttributes, savedConn.connectionSummary);
                    self.varStatusBarMgr.displayLangServiceStatus(connOwnerURI, localizedConstants_1.default.updatingIntellisenseMessage);
                    mruConnection = savedConn.connectionAttributes;
                }
                else {
                    self.connectionErroredOut(connOwnerURI, savedConn, response);
                    mruConnection = undefined;
                }
                self.addConnectionToMRUList(savedConn, mruConnection);
            }
            else {
                fileLogger.info("Connection complete event does not need to be processed");
            }
        };
    }
    addLoginScriptCompleteEventHandler(handler) {
        this.onLoginScriptCompleteEvent.on(this.LOGIN_SCRIPT_COMPLETE_EVENT, handler);
    }
    loginScriptCompleteEventHandler() {
        return (response) => {
            this.onLoginScriptCompleteEvent.emit(this.LOGIN_SCRIPT_COMPLETE_EVENT, response);
        };
    }
    tnsUpdatedEventHandler() {
        const self = this;
        return (event) => {
            if (!event.updated) {
                self.vscodeConnector.showErrorMessage(localizedConstants_1.default.msgTnsAdminUpdateFailed);
            }
            self.StatusBarMgr.displayTnsAdmin(event.tnsAdmin);
        };
    }
    textDocumentCloseHandler(doc) {
        const self = this;
        const uri = helper.convertURIToString(doc.uri);
        if (uri in self.varURIToConnPropDictionary) {
            self.varURIToConnPropDictionary[uri].isDocumentOpen = false;
        }
        if (self.isConnectedToDB(uri)) {
            self.doDisconnect(uri, false);
        }
        defaultConnectionManager_1.DefaultConnectionManager.instance.removeFromUserDisconnectedFiles(uri);
        defaultConnectionManager_1.DefaultConnectionManager.instance.removeFromExcludedFilesForDefaultConnection(uri);
        defaultConnectionManager_1.DefaultConnectionManager.instance.removeFromDefaultConnectedFiles(uri);
    }
    disocnnectRequestHandler() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            try {
                const result = yield self.connectionLogicMgr.handleDisconnectChoice();
                if (result) {
                    return yield self.doDisconnect(self.vscodeConnector.activeTextEditorUri, true, true);
                }
                else {
                    return false;
                }
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                return false;
            }
        });
    }
    createProfileHandler() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            try {
                const profile = yield self.connectionUI.displayConnectionList(true, false, false);
                return (profile ? true : false);
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                return false;
            }
        });
    }
    showConnections() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            try {
                var conns = self.ConnectionRepository.getConnectionListForDropDown(true, true);
                if (conns.length == 0) {
                    self.vscodeConnector.showErrorMessage(localizedConstants_1.default.runQueryNoConnection);
                    return undefined;
                }
                const profile = yield self.connectionUI.displayConnectionList(false, true, false, true);
                return profile;
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                return undefined;
            }
        });
    }
    createNewConnectionExplorer() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            try {
                const profile = yield self.connectionUI.displayConnectionList(false, false, true);
                return (profile ? true : false);
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                return false;
            }
        });
    }
    removeProfileHandler(connProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            try {
                const retVal = yield self.connectionUI.removeProfile(connProfile);
                return retVal;
            }
            catch (err) {
                helper.AppUtils.ShowErrorAndLog(err, this.vscodeConnector);
                return false;
            }
        });
    }
    updateProfileHandler(connProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            try {
                const retVal = yield self.connectionUI.updateProfile(connProfile);
                return retVal;
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                return false;
            }
        });
    }
    languageAssociationHandler() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            const uri = self.varVSCcodeConnector.activeTextEditorUri;
            const lang = undefined;
            let langfeatureEnabled = undefined;
            if (uri && self.varVSCcodeConnector.isActiveOracleFile) {
                const lang = yield self.connectionLogicMgr.askLanguageChange();
                if (!lang) {
                    return undefined;
                }
                self.varClient.sendNotification(LangService.LanguageServiceChangedNotification.event, {
                    uri,
                    language: constants_1.Constants.oracleLanguageID,
                    langServiceChosen: lang,
                });
                self.StatusBarMgr.extensionChanged(uri, lang);
                switch (lang) {
                    case constants_1.Constants.extensionOwner:
                        langfeatureEnabled = true;
                        break;
                    case constants_1.Constants.noneOwner:
                        langfeatureEnabled = false;
                        break;
                    default:
                        langfeatureEnabled = undefined;
                        break;
                }
                return langfeatureEnabled;
            }
            else {
                self.varVSCcodeConnector.showWarningMessage(localizedConstants_1.default.msgFileAssociationMissing);
                return undefined;
            }
        });
    }
    newConnectionHandler(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let showList = true;
            if (!uri) {
                self.vscodeConnector.showWarningMessage(localizedConstants_1.default.msgFileAssociationMissing);
                showList = false;
            }
            else if (!self.vscodeConnector.isActiveOracleFile) {
                try {
                    showList = yield self.connectionUI.askForLanguageModeChange();
                    if (showList) {
                        if (!self.vscodeConnector.chkIfDocumentIsAssociatedWithOracle(uri)) {
                            showList = false;
                            self.vscodeConnector.showWarningMessage(localizedConstants_1.default.msgFileAssociationMissing);
                        }
                    }
                }
                catch (err) {
                    helper.logErroAfterValidating(err);
                    showList = false;
                }
            }
            if (showList) {
                const connProp = yield self.connectionUI.displayConnectionList(false, true, false);
                if (connProp) {
                    yield this.createConnectionFromConnProps(connProp, uri, false);
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
            return false;
        });
    }
    createConnectionFromConnProps(connProp, uri, promptMissingInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            fileLogger.info("Start creating a new database connection");
            let connPropVsCode = connProp;
            if (promptMissingInfo) {
                connPropVsCode = yield this.connectionLogicMgr.shallAskForAnyMissingConnInfo(connPropVsCode);
            }
            if (!connPropVsCode) {
                return;
            }
            let profileUpgraded = false;
            [connPropVsCode, profileUpgraded] = yield this.upgradeProfileIfNeeded(connPropVsCode);
            if (connPropVsCode !== undefined) {
                if (this.isConnectedToDB(uri)) {
                    fileLogger.info("Disconnect existing connection before creating new connection");
                    yield this.doDisconnect(uri, false);
                    fileLogger.info("Disconnected existing connection");
                }
                const resultOfConnect = yield this.connect(uri, connPropVsCode, false, true, connectionRequest_1.ConnectionSource.Editor);
                if (!resultOfConnect) {
                    if (!connProp.passwordSaved) {
                        connProp.password = undefined;
                        connProp.proxyPassword = undefined;
                    }
                }
                else if (profileUpgraded) {
                    try {
                        yield this.connectionLogicMgr.saveVsCodeProfile(connPropVsCode, "");
                    }
                    catch (err) {
                        fileLogger.error("Error on saving profile.");
                        helper.logErroAfterValidating(err);
                    }
                }
            }
            fileLogger.info("End creating a new database connection");
        });
    }
    upgradeProfileIfNeeded(connPropVsCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let upgraded = false;
            if (connPropVsCode && !connPropVsCode.tnsAdmin) {
                this.inheritConfigFileLocations(connPropVsCode);
                upgraded = true;
                if (connPropVsCode.connectionType == scriptExecutionModels_1.ConnectionType.DataSource) {
                    if (!connPropVsCode.dataSource) {
                        if (connPropVsCode.connectionString) {
                            connPropVsCode.connectionType = scriptExecutionModels_1.ConnectionType.ODPConnectionString;
                            connPropVsCode.dataSource = undefined;
                            connPropVsCode.userID = undefined;
                        }
                    }
                    else {
                        let ds = connPropVsCode.dataSource;
                        let dsparts = ds.match("^([^\:]+):([0-9]+)/(.*$)");
                        if (dsparts && dsparts.length !== 4) {
                            connPropVsCode.connectionType = scriptExecutionModels_1.ConnectionType.Advanced;
                        }
                        let tnsnameslist;
                        if (!dsparts) {
                            if (connPropVsCode.tnsAdmin) {
                                let tnslist = yield this.getTnsValues(connPropVsCode.tnsAdmin).catch((error) => {
                                    helper.logErroAfterValidating(error);
                                });
                                if (tnslist && tnslist.length > 0) {
                                    tnsnameslist = tnslist.map(function (value) {
                                        return value.toUpperCase();
                                    });
                                }
                            }
                            if (tnsnameslist && tnsnameslist.length > 0 && tnsnameslist.indexOf(connPropVsCode.dataSource.toUpperCase()) !== -1) {
                                connPropVsCode.connectionType = scriptExecutionModels_1.ConnectionType.TNS;
                            }
                            else {
                                connPropVsCode.connectionType = scriptExecutionModels_1.ConnectionType.Advanced;
                            }
                        }
                    }
                }
            }
            return [connPropVsCode, upgraded];
        });
    }
    getTnsValues(tnsLocation) {
        return new Promise((resolve, reject) => {
            fileLogger.info("Fetch TNS values. TNSAdmin: " + tnsLocation);
            let tnslist = [];
            const timer = setTimeout(() => {
                const err = new Error();
                reject(err);
            }, 8000);
            const getDataSourceRequest = new ConnectionRequestNameSpc.GetDataSourcesRequestParameters();
            getDataSourceRequest.location = tnsLocation;
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(ConnectionRequestNameSpc.GetDataSourcesRequest.type, getDataSourceRequest).
                then((response) => {
                clearTimeout(timer);
                if (response) {
                    for (const tns of response.dataSources) {
                        tnslist.push(tns);
                    }
                    fileLogger.info("TNS values fetched");
                }
                resolve(tnslist);
            }, (error) => {
                helper.logErroAfterValidating(error);
                clearTimeout(timer);
                reject(error);
            });
        });
    }
    inheritConfigFileLocations(connPropVsCode) {
        if (connPropVsCode) {
            if (!connPropVsCode.tnsAdmin) {
                connPropVsCode.tnsAdmin = setup_1.ConfigManager.instance.tnsAdmin;
            }
        }
    }
    isConnectedToDB(uri) {
        const self = this;
        let valToReturn = false;
        if (uri in self.varURIToConnPropDictionary) {
            valToReturn = true;
        }
        return valToReturn;
    }
    doDisconnect(uri, showmessage, userDisconnect = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let reqResult = false;
            if (self.isConnectedToDB(uri)) {
                self.deleteConnectionFromMap(uri);
                self.StatusBarMgr.displayNotConnected(uri);
                const disconnectParams = new ConnectionRequestNameSpc.DisconnectRequestParameters();
                disconnectParams.uri = uri;
                reqResult = yield self.LanguageServerClient.sendRequest(ConnectionRequestNameSpc.DisconnectRequestStronglyTyped.type, disconnectParams);
                if (reqResult) {
                    if (showmessage) {
                        self.vscodeConnector.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.disConnectedMessage, uri));
                    }
                    oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance.clearCacheForDocument(uri);
                    fileLogger.info("Disconnected from database for document");
                }
            }
            else if (self.isConnecting(uri)) {
                yield self.cancelConnectHandler();
                reqResult = true;
            }
            else {
                reqResult = true;
            }
            if (userDisconnect) {
                defaultConnectionManager_1.DefaultConnectionManager.instance.addToUserDisconnectedFiles(uri);
            }
            return reqResult;
        });
    }
    setClient(client) {
        this.varClient = client;
    }
    setStatusView(value) {
        this.varStatusBarMgr = value;
    }
    getConnectionCount() {
        return Object.keys(this.varURIToConnPropDictionary).length;
    }
    isConnecting(uri) {
        const self = this;
        let valtoReturn = false;
        if (uri in self.varURIToConnPropDictionary) {
            valtoReturn = self.varURIToConnPropDictionary[uri].isConnecting;
        }
        return valtoReturn;
    }
    addConnectionToMap(uri, connToAdd) {
        const self = this;
        self.varURIToConnPropDictionary[uri] = connToAdd;
    }
    deleteConnectionFromMap(uri) {
        const self = this;
        delete self.varURIToConnPropDictionary[uri];
    }
    getSavedConnectionProperties(uri) {
        const self = this;
        return self.varURIToConnPropDictionary[uri];
    }
    processCancelConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            const uri = self.vscodeConnector.activeTextEditorUri;
            if (uri) {
                const cancelrequestParams = new ConnectionRequestNameSpc.CancelConnectRequestParameters();
                cancelrequestParams.uri = uri;
                const result = yield self.LanguageServerClient.sendRequest(ConnectionRequestNameSpc.CancelConnectRequestStronglyTyped.type, cancelrequestParams);
                if (result) {
                    self.StatusBarMgr.displayNotConnected(uri);
                    self.vscodeConnector.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.disConnectedMessage, uri));
                }
            }
        });
    }
    connectionErroredOut(fileUri, connection, result) {
        const self = this;
        if (result.errorNumber && result.errorMessage) {
            connection.errorMessage = result.errorMessage;
            connection.errorNumber = result.errorNumber;
        }
        const datasrc = helper.extractDataSource(connection.connectionAttributes.dataSource, connection.connectionAttributes.connectionString);
        self.StatusBarMgr.displayConnectErrors(fileUri, connection.connectionAttributes, result);
        if (fileUri in self.varURIToConnPropDictionary &&
            self.varURIToConnPropDictionary[fileUri].isDocumentOpen) {
            const connectionProps = connection.connectionAttributes;
            const msgToShow = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConnectionError, connectionProps.name, result.errorMessage ? result.errorMessage : result.messages);
            self.vscodeConnector.showErrorMessage(msgToShow);
        }
    }
    addConnectionToMRUList(connection, connToAdd) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            if (connToAdd) {
                try {
                    yield self.varConnSettingStorageHlpr.addRecentlyUsedConnection(connToAdd);
                }
                catch (err) {
                    connection.connectCompleteHandler(false, err);
                }
                connection.connectCompleteHandler(true);
            }
            else {
                connection.connectCompleteHandler(false, connection);
            }
        });
    }
    getConnectionUIArguments(uri, associateFile, databaseInfo) {
        let args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
        var windowURI = constants_1.Constants.connectionWindowUri;
        var windowTitle = localizedConstants_1.default.connectionUITitle;
        if (databaseInfo != null) {
            args.adbDatabaseID = databaseInfo.databaseID;
            args.adbDisplayName = databaseInfo.dbDisplayName;
            args.adbName = databaseInfo.dbName;
            args.isDedicatedDb = databaseInfo.dedicatedDb;
            args.uiMode = databaseInfo.displayMode;
            args.profileName = databaseInfo.profileName;
            if (databaseInfo.displayMode == scriptExecutionModels_1.UIDisplayMode.DownloadCredentialsFile) {
                windowURI = constants_1.Constants.adbDownloadCredentialsWindowUri;
                windowTitle = localizedConstants_1.default.downloadCredentialsTitle;
            }
            windowTitle = `${windowTitle} : ${databaseInfo.dbDisplayName}`;
            const config = vscode.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName);
            if (config) {
                args.walletLocation = config.inspect(constants_1.Constants.walletFileFolderPropertyName) ? config.get(constants_1.Constants.walletFileFolderPropertyName) : undefined;
                if ((databaseInfo.displayMode == scriptExecutionModels_1.UIDisplayMode.AutonomousDatabaseConnectionManagement || scriptExecutionModels_1.UIDisplayMode.DownloadCredentialsFile)
                    && args.walletLocation && databaseInfo.dbName) {
                    args.walletLocation = path.join(args.walletLocation, databaseInfo.dbName);
                }
                args.tlsAuthType = databaseInfo.tlsAuthenticationType;
            }
        }
        else {
            args.uiMode = scriptExecutionModels_1.UIDisplayMode.ConnectionManagement;
            args.profileName = "newConnection";
        }
        args.uri = uri;
        args.executionId = (++this.scriptExecutionCommandHandler.scriptExecutionCount).toString();
        args.windowUri = windowURI;
        args.isCreate = true;
        args.windowTitle = windowTitle;
        if (associateFile) {
            args.documentUri = uri;
        }
        args.connectionType = this.lastConnectionType;
        return args;
    }
    openCreateProfileUI(uri, associateFile, databaseInfo = null) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.openProfileUI(this.getConnectionUIArguments(uri, associateFile, databaseInfo));
        });
    }
    openProfileUI(args) {
        const clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri);
        clients.forEach(client => {
            resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(client.ownerUri, client.executionId);
        });
        const existingConnectionWindow = clients && clients.length > 0 ? clients[0].panel : null;
        const existingPanel = existingConnectionWindow;
        this.scriptExecutionCommandHandler.openConnectionManagementPanel(args, existingPanel);
    }
    dbConnectDisconnectEventHandler() {
        const self = this;
        return (event) => {
            fileLogger.info("Handling dbConnectDisconnectEvent event from server.");
            if (event.connected) {
                const connProperties = new DocumentConnectionInformation_1.DocumentConnectionInformation();
                let connProps = new Interfaces.ConnectionPropertiesExtendedModel();
                connProps.name = event.userId + "@" + event.dataSource;
                connProps.userID = event.userId;
                connProps.dataSource = event.dataSource;
                connProps.dBAPrivilege = event.dbaPrivilege;
                connProperties.connectionAttributes = connProps;
                connProperties.connectionId = event.connectionId;
                this.addConnectionToMap(event.ownerUri, connProperties);
                self.StatusBarMgr.displayConnectSuccess(event.ownerUri, connProps, undefined);
            }
            else {
                if (!self.isConnecting(event.ownerUri)) {
                    self.deleteConnectionFromMap(event.ownerUri);
                    self.StatusBarMgr.displayNotConnected(event.ownerUri);
                    self.StatusBarMgr.displayLangServiceStatus(event.ownerUri, "");
                    if (event.showMessage) {
                        self.vscodeConnector.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.disConnectedMessage, event.ownerUri));
                    }
                    let connectionNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(event.ownerUri);
                    if (connectionNode) {
                        dataExplorerManager_1.DataExplorerManager.Instance.onConnectionDisconnect(connectionNode, true);
                    }
                }
                oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance.clearCacheForDocument(event.ownerUri);
                defaultConnectionManager_1.DefaultConnectionManager.instance.addToUserDisconnectedFiles(event.ownerUri);
            }
            fileLogger.info("Processed dbConnectDisconnectEvent event from server.");
        };
    }
}
exports.default = ConnectionCommandsHandler;
