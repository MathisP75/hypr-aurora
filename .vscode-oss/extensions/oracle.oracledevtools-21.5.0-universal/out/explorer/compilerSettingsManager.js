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
exports.CompilerSettingsManager = void 0;
const constants_1 = require("../constants/constants");
const userPreferenceManager_1 = require("../infrastructure/userPreferenceManager");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const setup_1 = require("../utilities/setup");
const logger = require("../infrastructure/logger");
const scriptExcutionCommandHandler_1 = require("../scriptExecution/scriptExcutionCommandHandler");
const localizedConstants_1 = require("./../constants/localizedConstants");
const utilities_1 = require("../explorer/utilities");
const helper = require("./../utilities/helper");
const fileLogger = logger.FileStreamLogger.Instance;
class CompilerSettingsManager {
    constructor(scriptExecuter) {
        this.scriptExecuter = scriptExecuter;
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getCompilerSettingsRequest, (message) => {
            this.handleGetCompilerSettingsRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.saveCompilerSettingsRequest, (message) => {
            this.handleSaveCompilerSettingsRequest(message);
        });
    }
    openCompilerSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
                args.uri = utilities_1.TreeViewConstants.compilerSettingsUri;
                args.executionId = (++this.scriptExecuter.scriptExecutionCount).toString();
                args.windowUri = constants_1.Constants.compilerSettingsWindowUri;
                args.uiMode = scriptExecutionModels_1.UIDisplayMode.CompilerSettings;
                args.windowTitle = localizedConstants_1.default.compilerSettingsUITitle;
                this.scriptExecuter.openCompilerSettingsPanel(args);
            }
            catch (err) {
                fileLogger.error(err);
            }
        });
    }
    handleSaveCompilerSettingsRequest(message) {
        return __awaiter(this, void 0, void 0, function* () {
            fileLogger.info('Recevied SaveCompilerSettingsRequest');
            const response = new scriptExecutionModels_1.SaveCompilerSettingsResponse();
            try {
                const compilerSettings = this.processCompilerFlagsToSave(message.compileConfig, message.compileDebugConfig);
                yield setup_1.Setup.getExtensionConfigSection().update(constants_1.Constants.compilerSettingsPropertyName, compilerSettings, true);
                userPreferenceManager_1.UserPreferenceManager.Instance.saveCompilerSettingsUserPreferences(message.configType);
                response.message = localizedConstants_1.default.compilerSettingsSavedMsg;
                response.success = true;
            }
            catch (error) {
                response.message = localizedConstants_1.default.compilerSettingSaveFailedMsg + error;
                response.success = false;
                fileLogger.error(error);
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveCompilerSettingsResponse, response);
        });
    }
    processCompilerFlagsToSave(compileFlags, compileDebugFlags) {
        let settingsObject = {};
        try {
            for (const [key, value] of Object.entries(compileFlags)) {
                settingsObject[constants_1.Constants.compileDotStr + key] = value;
            }
            for (const [key, value] of Object.entries(compileDebugFlags)) {
                settingsObject[constants_1.Constants.compileDebugDotStr + key] = value;
            }
        }
        catch (error) {
            fileLogger.error('Error in processCompilerFlagsToSave: ' + error);
        }
        return settingsObject;
    }
    handleGetCompilerSettingsRequest(message) {
        return __awaiter(this, void 0, void 0, function* () {
            fileLogger.info('Received GetCompilerSettingsRequest request');
            try {
                const config = setup_1.Setup.getExtensionConfigSection();
                const compilerFlags = config.get(constants_1.Constants.compilerSettingsPropertyName);
                const response = new scriptExecutionModels_1.GetCompilerSettingsResponse();
                response.compileConfig = CompilerSettingsManager.processCompilerFlagsFromSettings(compilerFlags, false);
                response.compileDebugConfig = CompilerSettingsManager.processCompilerFlagsFromSettings(compilerFlags, true);
                let userPref = userPreferenceManager_1.UserPreferenceManager.Instance.readUserPreferencesFromJsonFile();
                response.configType = userPref && userPref.compilerProperties ? userPref.compilerProperties.lastConfiguration : scriptExecutionModels_1.CompileConfig.Compile;
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getCompilerSettingsResponse, response);
            }
            catch (error) {
                fileLogger.error('Error in handleGetCompilerSettingsRequest');
                helper.logErroAfterValidating(error);
            }
        });
    }
    static processCompilerFlagsFromSettings(compileFlags, debug) {
        let processedFlags = {}, id;
        let configType = debug ? constants_1.Constants.compileDebugDotStr : constants_1.Constants.compileDotStr;
        try {
            this.compilerFlagsStrList.forEach(flag => {
                id = configType + flag;
                if (compileFlags[id] !== undefined)
                    processedFlags[flag] = compileFlags[id];
            });
        }
        catch (error) {
            fileLogger.error('Error in processCompilerFlagsFromSettings: ' + error);
        }
        return processedFlags;
    }
}
exports.CompilerSettingsManager = CompilerSettingsManager;
CompilerSettingsManager.compilerFlagsStrList = [
    "enableFlags",
    "optimizeLevel",
    "plscopeIdentifiers",
    "plscopeStatements",
    "allWarnings",
    "informationalWarnings",
    "performanceWarnings",
    "severeWarnings"
];
