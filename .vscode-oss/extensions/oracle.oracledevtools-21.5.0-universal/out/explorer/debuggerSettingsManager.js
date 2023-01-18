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
exports.debuggerSettingsManager = void 0;
const constants_1 = require("../constants/constants");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const setup_1 = require("../utilities/setup");
const logger = require("../infrastructure/logger");
const localizedConstants_1 = require("./../constants/localizedConstants");
const helper = require("./../utilities/helper");
const dataExplorerRequests_1 = require("./dataExplorerRequests");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const fileLogger = logger.FileStreamLogger.Instance;
class debuggerSettingsManager {
    constructor() {
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getDebuggerSettingsRequest, (message) => {
            this.handleGetDebuggerSettingsRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.saveDebuggerSettingsRequest, (message) => {
            this.handleSaveDebuggerSettingsRequest(message);
        });
    }
    handleSaveDebuggerSettingsRequest(message) {
        return __awaiter(this, void 0, void 0, function* () {
            fileLogger.info('Recevied SaveDebuggerSettingsRequest');
            const response = new scriptExecutionModels_1.SaveDebuggerSettingsResponse();
            response.saved = false;
            try {
                let requestParams = new dataExplorerRequests_1.PlsqlValidateSettingsRequestParams();
                requestParams.startPort = message.debugSettings.startPort;
                requestParams.endPort = message.debugSettings.endPort;
                requestParams.hostIp = message.debugSettings.ipAddress;
                let validateResponse = yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance.
                    sendRequest(dataExplorerRequests_1.PlsqlValidateSettingsRequest.type, requestParams);
                if (validateResponse.messageType === dataExplorerRequests_1.PlsqlValidateSettingsMessageType.Success) {
                    response.debugSettings = message.debugSettings;
                    let settingsObject = {};
                    settingsObject[constants_1.Constants.settingsIPAddressPropertyName] = message.debugSettings.ipAddress;
                    settingsObject[constants_1.Constants.settingsStartPortPropertyName] = message.debugSettings.startPort;
                    settingsObject[constants_1.Constants.settingsEndPortPropertyName] = message.debugSettings.endPort;
                    yield setup_1.Setup.getExtensionConfigSection().update(constants_1.Constants.debuggerSettingsPropertyName, settingsObject, true);
                    response.message = localizedConstants_1.default.debuggerSettingsSavedMsg;
                    response.saved = true;
                }
                else {
                    response.message = validateResponse.message;
                }
            }
            catch (error) {
                response.message = localizedConstants_1.default.debuggerSettingSaveFailedMsg + error;
                fileLogger.info('Error on processing SaveDebuggerSettingsRequest');
                fileLogger.error(error);
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveDebuggerSettingsResponse, response);
            fileLogger.info('SaveDebuggerSettingsRequest processed');
        });
    }
    handleGetDebuggerSettingsRequest(message) {
        return __awaiter(this, void 0, void 0, function* () {
            fileLogger.info('Received GetDebuggerSettingsRequest request');
            try {
                const config = setup_1.Setup.getExtensionConfigSection();
                const debuggerSettings = config.get(constants_1.Constants.debuggerSettingsPropertyName);
                const response = new scriptExecutionModels_1.GetDebuggerSettingsResponse();
                let [debugSettings, ipAddresses] = yield debuggerSettingsManager.getDebugSettings();
                response.ipAddresses = ipAddresses;
                response.debugSettings = debugSettings;
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getDebuggerSettingsResponse, response);
            }
            catch (error) {
                fileLogger.error('Error in processing GetDebuggerSettingsRequests');
                helper.logErroAfterValidating(error);
            }
            fileLogger.info('GetDebuggerSettingsRequest processed');
        });
    }
    static getLocalIPAddresses() {
        return __awaiter(this, void 0, void 0, function* () {
            fileLogger.info('getLocalIPAddresses - Start');
            let hostIPs = [];
            try {
                let requestParams = new dataExplorerRequests_1.GetIPAddressesRequestParameters();
                let response = yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance.
                    sendRequest(dataExplorerRequests_1.GetIPAddressesRequest.type, requestParams);
                hostIPs = response.ipAddresses;
            }
            catch (error) {
                fileLogger.error('Error in getting IP Addresses');
                helper.logErroAfterValidating(error);
            }
            fileLogger.info('getLocalIPAddresses - End');
            return hostIPs;
        });
    }
    static getDebugSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            let settings = new DebugSettings();
            try {
                const config = setup_1.Setup.getExtensionConfigSection();
                const debuggerSettings = config.get(constants_1.Constants.debuggerSettingsPropertyName);
                if (debuggerSettings) {
                    settings.ipAddress = debuggerSettings[constants_1.Constants.settingsIPAddressPropertyName];
                    settings.startPort = debuggerSettings[constants_1.Constants.settingsStartPortPropertyName];
                    settings.endPort = debuggerSettings[constants_1.Constants.settingsEndPortPropertyName];
                }
            }
            catch (error) {
                fileLogger.error('Error in reading debugger settings from configuration.');
                helper.logErroAfterValidating(error);
            }
            let ipAddresses = yield debuggerSettingsManager.getLocalIPAddresses();
            if (!settings.ipAddress) {
                if (ipAddresses && ipAddresses.length > 0) {
                    settings.ipAddress = ipAddresses[0];
                }
            }
            if (!settings.startPort) {
                settings.startPort = 65000;
            }
            if (!settings.endPort) {
                settings.endPort = 65535;
            }
            return [settings, ipAddresses];
        });
    }
}
exports.debuggerSettingsManager = debuggerSettingsManager;
class DebugSettings {
}
