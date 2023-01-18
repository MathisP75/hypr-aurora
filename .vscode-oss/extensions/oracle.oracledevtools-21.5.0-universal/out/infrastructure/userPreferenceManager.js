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
exports.UserPreferenceManager = void 0;
const path = require("path");
const fs = require("fs");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const constants_1 = require("../constants/constants");
const helper = require("../utilities/helper");
const logger_1 = require("./logger");
const helper_1 = require("../utilities/helper");
class UserPreferenceManager {
    constructor() {
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getUserPreferencesRequest, (message) => {
            this.handleGetUserPreferencesRequest(message);
        });
    }
    static CreateInstance() {
        if (UserPreferenceManager.instance === undefined) {
            UserPreferenceManager.instance = new UserPreferenceManager();
        }
        return UserPreferenceManager.instance;
    }
    static get Instance() {
        return UserPreferenceManager.instance;
    }
    init() {
        try {
            logger_1.FileStreamLogger.Instance.info(`Initializing UserPreferenceManager`);
            let extensionDir = helper_1.Utils.getExtensionDirectory();
            logger_1.FileStreamLogger.Instance.info(`extensionDir is- ${extensionDir}`);
            if (extensionDir) {
                if (!fs.existsSync(extensionDir)) {
                    fs.mkdirSync(extensionDir, { recursive: true });
                }
                let preferenceFile = path.join(extensionDir, constants_1.Constants.preferencesFile);
                if (!fs.existsSync(preferenceFile)) {
                    fs.writeFileSync(preferenceFile, "");
                }
                this.preferencesFile = preferenceFile;
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.error(`Error on Initializing UserPreferenceManager`);
            helper.logErroAfterValidating(err);
        }
    }
    handleGetUserPreferencesRequest(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = scriptExecutionModels_1.GetUserPreferencesResponse.create(message);
            response.userPreferences = this.readUserPreferencesFromJsonFile();
            response.result = (response.userPreferences !== undefined);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getUserPreferencesRequest, response);
        });
    }
    readUserPreferencesFromJsonFile() {
        let userPrefs = new scriptExecutionModels_1.UserPreferences();
        try {
            if (this.preferencesFile && fs.existsSync(this.preferencesFile)) {
                let fileContent = fs.readFileSync(this.preferencesFile, "utf8");
                if (fileContent) {
                    userPrefs = JSON.parse(fileContent);
                    logger_1.FileStreamLogger.Instance.info(`Read userPreferences from json file`);
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error(`Error on reading userPreferences from json file`);
            helper.logErroAfterValidating(error);
        }
        return userPrefs;
    }
    saveUserPreferencesToJsonFile(userPrefs) {
        try {
            if (this.preferencesFile && fs.existsSync(this.preferencesFile)) {
                let fileContent = JSON.stringify(userPrefs);
                fs.writeFileSync(this.preferencesFile, fileContent);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error(`Error on writing userPreferences to json file`);
            helper.logErroAfterValidating(error);
        }
        return userPrefs;
    }
    saveConnectionUIUserPreferences(profile, connectionString) {
        let userPrefs = this.readUserPreferencesFromJsonFile();
        if (!userPrefs) {
            userPrefs = new scriptExecutionModels_1.UserPreferences();
        }
        if (profile) {
            userPrefs.connectionProperties.connectionType = profile.connectionType;
            switch (profile.connectionType) {
                case scriptExecutionModels_1.ConnectionType.DataSource:
                    userPrefs.connectionProperties.databaseHostName = profile.databaseHostName;
                    userPrefs.connectionProperties.databasePortNumber = profile.databasePortNumber;
                    userPrefs.connectionProperties.databaseServiceName = profile.databaseServiceName;
                    break;
                case scriptExecutionModels_1.ConnectionType.TNS:
                    userPrefs.connectionProperties.tnsAdminLocation = profile.tnsAdmin;
                    userPrefs.connectionProperties.tnsAlias = profile.dataSource;
                    if (profile.walletLocation) {
                        userPrefs.connectionProperties.useWalletFile = true;
                        userPrefs.connectionProperties.walletFileLocation = profile.walletLocation;
                    }
                    else {
                        userPrefs.connectionProperties.useWalletFile = false;
                        userPrefs.connectionProperties.walletFileLocation = undefined;
                    }
                    break;
                case scriptExecutionModels_1.ConnectionType.Advanced:
                    userPrefs.connectionProperties.advancedConnectionString = profile.dataSource;
                    break;
                case scriptExecutionModels_1.ConnectionType.ODPConnectionString:
                    if (connectionString) {
                        userPrefs.connectionProperties.odpnetConnectionString = connectionString;
                    }
                    break;
            }
            this.saveUserPreferencesToJsonFile(userPrefs);
        }
    }
    saveResultsWindowUserPreferences(saveFormat) {
        let userPrefs = this.readUserPreferencesFromJsonFile();
        if (!userPrefs) {
            userPrefs = new scriptExecutionModels_1.UserPreferences();
        }
        if (saveFormat) {
            userPrefs.resultsWindowProperties.saveFormat = saveFormat;
            this.saveUserPreferencesToJsonFile(userPrefs);
        }
    }
    saveCompilerSettingsUserPreferences(lastConfig) {
        let userPrefs = this.readUserPreferencesFromJsonFile();
        if (!userPrefs) {
            userPrefs = new scriptExecutionModels_1.UserPreferences();
        }
        if (!userPrefs.compilerProperties)
            userPrefs.compilerProperties = new scriptExecutionModels_1.CompilerProperties();
        userPrefs.compilerProperties.lastConfiguration = lastConfig;
        this.saveUserPreferencesToJsonFile(userPrefs);
    }
}
exports.UserPreferenceManager = UserPreferenceManager;
