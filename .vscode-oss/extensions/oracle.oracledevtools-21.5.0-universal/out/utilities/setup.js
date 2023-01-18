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
exports.ConfigManager = exports.Setup = void 0;
const fs = require("fs");
const os = require("os");
const path = require("path");
const process = require("process");
const util = require("util");
const vscode_1 = require("vscode");
const constants_1 = require("../constants/constants");
const logger_1 = require("../infrastructure/logger");
const helper_1 = require("./helper");
class Setup {
    static getDefaultValue() {
        const { targetDir, userHomeLocation } = Setup.GetSourceAndDestDir();
        return targetDir;
    }
    static setPlsqlDebuggerProgram(dotnetRuntimeMajorVersion, dotnetRuntimePath) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info(`Setting Dotnet Runtime Path For PL/SQL Debugger Program to ${dotnetRuntimePath}`);
            this.plsqlDotnetRuntimePath = dotnetRuntimePath;
            logger_1.FileStreamLogger.Instance.info(`Setting Dotnet Runtime MajorVersion for PL/SQL Debugger Program to ${dotnetRuntimeMajorVersion}`);
            switch (dotnetRuntimeMajorVersion) {
                case 3:
                    {
                        this.plsqlDebuggerProgram = constants_1.Constants.debugAdapter31DllName;
                        break;
                    }
                case 5:
                    {
                        this.plsqlDebuggerProgram = constants_1.Constants.debugAdapter50DllName;
                        break;
                    }
                case 6:
                    {
                        this.plsqlDebuggerProgram = constants_1.Constants.debugAdapter60DllName;
                        break;
                    }
                default:
                    break;
            }
            logger_1.FileStreamLogger.Instance.info(`PL/SQL Debugger program set to ${this.plsqlDebuggerProgram}`);
        });
    }
    static setDefaultLocationsForFiles(extensionPath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setDefaultLocationsForConfigFiles(extensionPath);
            this.setDefaultLocationForBookmarkDirectory();
            this.setDefaultLocationForDownloadsDirectory();
        });
    }
    static migrateConfigurationSettings(extensionPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.FileStreamLogger.Instance.info("In migrateConfigurationSettings...");
                const config = this.getExtensionConfigSection();
                const oldConfig = vscode_1.workspace.getConfiguration(constants_1.Constants.oldExtensionConfigSectionName);
                if (oldConfig !== undefined && oldConfig !== null &&
                    config !== undefined && config !== null) {
                    logger_1.FileStreamLogger.Instance.info("Starting migration of configuration settings to the new settings...");
                    if (oldConfig.has(constants_1.Constants.loggingEnablePropertyName)) {
                        let configurationEntries = oldConfig.inspect(constants_1.Constants.loggingEnablePropertyName);
                        if (configurationEntries.defaultValue !== undefined &&
                            configurationEntries.globalValue === undefined &&
                            configurationEntries.workspaceValue === undefined &&
                            configurationEntries.workspaceFolderValue === undefined) {
                            logger_1.FileStreamLogger.Instance.info("No migration required. Enable logging using default value in old configuration");
                        }
                        else {
                            logger_1.FileStreamLogger.Instance.info("Starting migration of enable logging from old configuration...");
                            logger_1.FileStreamLogger.Instance.info("Start updating enable logging in new configuration...");
                            yield config.update(constants_1.Constants.loggingEnablePropertyName, oldConfig.get(constants_1.Constants.loggingEnablePropertyName), true);
                            logger_1.FileStreamLogger.Instance.info("Done updating enable logging in new configuration");
                            logger_1.FileStreamLogger.Instance.info("Start removing enable logging from old configuration...");
                            yield oldConfig.update(constants_1.Constants.loggingEnablePropertyName, undefined, true);
                            logger_1.FileStreamLogger.Instance.info("Done removing enable logging from old configuration");
                            logger_1.FileStreamLogger.Instance.info("Done migration of enable logging from old configuration");
                        }
                    }
                    if (oldConfig.has(constants_1.Constants.loggingLevelPropertyName)) {
                        let configurationEntries = oldConfig.inspect(constants_1.Constants.loggingLevelPropertyName);
                        if (configurationEntries.defaultValue !== undefined &&
                            configurationEntries.globalValue === undefined &&
                            configurationEntries.workspaceValue === undefined &&
                            configurationEntries.workspaceFolderValue === undefined) {
                            logger_1.FileStreamLogger.Instance.info("No migration required. Logging level using default value in old configuration");
                        }
                        else {
                            logger_1.FileStreamLogger.Instance.info("Starting migration of logging level from old configuration...");
                            logger_1.FileStreamLogger.Instance.info("Start updating logging level in new configuration...");
                            yield config.update(constants_1.Constants.loggingLevelPropertyName, oldConfig.get(constants_1.Constants.loggingLevelPropertyName), true);
                            logger_1.FileStreamLogger.Instance.info("Done updating logging level in new configuration");
                            logger_1.FileStreamLogger.Instance.info("Start removing logging level from old configuration...");
                            yield oldConfig.update(constants_1.Constants.loggingLevelPropertyName, undefined, true);
                            logger_1.FileStreamLogger.Instance.info("Done removing logging level from old configuration");
                            logger_1.FileStreamLogger.Instance.info("Done migration of logging level from old configuration");
                        }
                    }
                    if (oldConfig.has(constants_1.Constants.intellisenseEnablePropertyName)) {
                        let configurationEntries = oldConfig.inspect(constants_1.Constants.intellisenseEnablePropertyName);
                        if (configurationEntries.defaultValue !== undefined &&
                            configurationEntries.globalValue === undefined &&
                            configurationEntries.workspaceValue === undefined &&
                            configurationEntries.workspaceFolderValue === undefined) {
                            logger_1.FileStreamLogger.Instance.info("No migration required. Enable intellisense using default value in old configuration");
                        }
                        else {
                            logger_1.FileStreamLogger.Instance.info("Starting migration of enable intellisense from old configuration...");
                            logger_1.FileStreamLogger.Instance.info("Start updating enable intellisense in new configuration...");
                            yield config.update(constants_1.Constants.intellisenseEnablePropertyName, oldConfig.get(constants_1.Constants.intellisenseEnablePropertyName), true);
                            logger_1.FileStreamLogger.Instance.info("Done updating enable intellisense in new configuration");
                            logger_1.FileStreamLogger.Instance.info("Start removing enable intellisense from old configuration...");
                            yield oldConfig.update(constants_1.Constants.intellisenseEnablePropertyName, undefined, true);
                            logger_1.FileStreamLogger.Instance.info("Done removing enable intellisense from old configuration");
                            logger_1.FileStreamLogger.Instance.info("Done migration of enable intellisense from old configuration");
                        }
                    }
                    if (oldConfig.has(constants_1.Constants.oldDataBatchSizePropertyName)) {
                        let configurationEntries = oldConfig.inspect(constants_1.Constants.oldDataBatchSizePropertyName);
                        if (configurationEntries.defaultValue !== undefined &&
                            configurationEntries.globalValue === undefined &&
                            configurationEntries.workspaceValue === undefined &&
                            configurationEntries.workspaceFolderValue === undefined) {
                            logger_1.FileStreamLogger.Instance.info("No migration required. Query dataBatchSize using default value in old configuration");
                        }
                        else {
                            logger_1.FileStreamLogger.Instance.info("Starting migration of query dataBatchSize from old configuration...");
                            logger_1.FileStreamLogger.Instance.info("Start updating query resultset pageSize in new configuration...");
                            yield config.update(constants_1.Constants.resultSetPageSizePropertyName, oldConfig.get(constants_1.Constants.oldDataBatchSizePropertyName), true);
                            logger_1.FileStreamLogger.Instance.info("Done updating query resultset pageSize in new configuration");
                            logger_1.FileStreamLogger.Instance.info("Start removing query dataBatchSize from old configuration...");
                            yield oldConfig.update(constants_1.Constants.oldDataBatchSizePropertyName, undefined, true);
                            logger_1.FileStreamLogger.Instance.info("Done removing query dataBatchSize from old configuration");
                            logger_1.FileStreamLogger.Instance.info("Done migration of query dataBatchSize from old configuration");
                        }
                    }
                    if (oldConfig.has(constants_1.Constants.oldConfigFilesLocationPropertyName)) {
                        let configurationEntries = oldConfig.inspect(constants_1.Constants.oldConfigFilesLocationPropertyName);
                        if (configurationEntries.defaultValue !== undefined &&
                            configurationEntries.globalValue === undefined &&
                            configurationEntries.workspaceValue === undefined &&
                            configurationEntries.workspaceFolderValue === undefined) {
                            logger_1.FileStreamLogger.Instance.info("No migration required. Connection config files location using default value in old configuration");
                        }
                        else {
                            logger_1.FileStreamLogger.Instance.info("Starting migration of connection config files location from old configuration...");
                            logger_1.FileStreamLogger.Instance.info("Start updating connection config files folder in new configuration...");
                            yield config.update(constants_1.Constants.configFileFolderPropertyName, oldConfig.get(constants_1.Constants.oldConfigFilesLocationPropertyName), true);
                            logger_1.FileStreamLogger.Instance.info("Done updating connection config files folder in new configuration");
                            logger_1.FileStreamLogger.Instance.info("Start removing network config files location from old configuration...");
                            yield oldConfig.update(constants_1.Constants.oldConfigFilesLocationPropertyName, undefined, true);
                            logger_1.FileStreamLogger.Instance.info("Done removing network config files location from old configuration");
                            logger_1.FileStreamLogger.Instance.info("Done migration of connection config files location from old configuration");
                        }
                    }
                    if (oldConfig.has(constants_1.Constants.oldWalletFileLocationPropertyName)) {
                        let configurationEntries = oldConfig.inspect(constants_1.Constants.oldWalletFileLocationPropertyName);
                        if (configurationEntries.defaultValue !== undefined &&
                            configurationEntries.globalValue === undefined &&
                            configurationEntries.workspaceValue === undefined &&
                            configurationEntries.workspaceFolderValue === undefined) {
                            logger_1.FileStreamLogger.Instance.info("No migration required. Connection wallet files location using default value in old configuration");
                        }
                        else {
                            logger_1.FileStreamLogger.Instance.info("Starting migration of connection wallet file location from old configuration...");
                            logger_1.FileStreamLogger.Instance.info("Start updating connection wallet file folder in new configuration...");
                            yield config.update(constants_1.Constants.walletFileFolderPropertyName, oldConfig.get(constants_1.Constants.oldWalletFileLocationPropertyName), true);
                            logger_1.FileStreamLogger.Instance.info("Done updating connection wallet file folder in new configuration");
                            logger_1.FileStreamLogger.Instance.info("Start removing network wallet file location from old configuration...");
                            yield oldConfig.update(constants_1.Constants.oldWalletFileLocationPropertyName, undefined, true);
                            logger_1.FileStreamLogger.Instance.info("Start removing network wallet file location from old configuration");
                            logger_1.FileStreamLogger.Instance.info("Done migration of connection wallet file location from old configuration");
                        }
                    }
                    if (oldConfig.has(constants_1.Constants.maxRecentlyUsedConnsPropertyName)) {
                        let configurationEntries = oldConfig.inspect(constants_1.Constants.maxRecentlyUsedConnsPropertyName);
                        if (configurationEntries.defaultValue !== undefined &&
                            configurationEntries.globalValue === undefined &&
                            configurationEntries.workspaceValue === undefined &&
                            configurationEntries.workspaceFolderValue === undefined) {
                            logger_1.FileStreamLogger.Instance.info("No migration required. Max recently used connections count using default value in old configuration");
                        }
                        else {
                            logger_1.FileStreamLogger.Instance.info("Starting migration of max recently used connections count from old configuration...");
                            logger_1.FileStreamLogger.Instance.info("Start updating max recently used connection in new configuration...");
                            yield config.update(constants_1.Constants.maxRecentlyUsedConnsPropertyName, oldConfig.get(constants_1.Constants.maxRecentlyUsedConnsPropertyName), true);
                            logger_1.FileStreamLogger.Instance.info("Done updating max recently used connection in new configuration");
                            logger_1.FileStreamLogger.Instance.info("Start removing max recently used connection from old configuration...");
                            yield oldConfig.update(constants_1.Constants.maxRecentlyUsedConnsPropertyName, undefined, true);
                            logger_1.FileStreamLogger.Instance.info("Start removing max recently used connection from old configuration");
                            logger_1.FileStreamLogger.Instance.info("Done migration of max recently used connections count from old configuration");
                        }
                    }
                    if (oldConfig.has(constants_1.Constants.oldOracleConnectionSettingsPropertyName)) {
                        let configurationEntries = oldConfig.inspect(constants_1.Constants.oldOracleConnectionSettingsPropertyName);
                        if (configurationEntries.defaultValue !== undefined &&
                            configurationEntries.globalValue === undefined &&
                            configurationEntries.workspaceValue === undefined &&
                            configurationEntries.workspaceFolderValue === undefined) {
                            logger_1.FileStreamLogger.Instance.info("No migration required. Connection settings using default value in old configuration");
                        }
                        else {
                            logger_1.FileStreamLogger.Instance.info("Starting migration of connection settings from old configuration...");
                            logger_1.FileStreamLogger.Instance.info("Start updating oracle explorer connections in new configuration...");
                            yield config.update(constants_1.Constants.connectionSettingsPropertyName, oldConfig.get(constants_1.Constants.oldOracleConnectionSettingsPropertyName), true);
                            logger_1.FileStreamLogger.Instance.info("Done updating oracle explorer connections in new configuration");
                            logger_1.FileStreamLogger.Instance.info("Start removing oracle explorer connections from old configuration...");
                            yield oldConfig.update(constants_1.Constants.oldOracleConnectionSettingsPropertyName, undefined, true);
                            logger_1.FileStreamLogger.Instance.info("Done removing oracle explorer connections from old configuration");
                            logger_1.FileStreamLogger.Instance.info("Done migration of connection settings from old configuration");
                        }
                    }
                    logger_1.FileStreamLogger.Instance.info("Done Migration of configuration settings to the new settings");
                }
                else {
                    logger_1.FileStreamLogger.Instance.info("No settings to migrate");
                }
                logger_1.FileStreamLogger.Instance.info("Done migrateConfigurationSettings");
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.warn(error);
            }
            finally {
                logger_1.FileStreamLogger.Instance.info("Exiting migrateConfigurationSettings");
            }
        });
    }
    static migrateStorageValues(extContext) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.FileStreamLogger.Instance.info("Start - MigrateStorageValues.");
                let connProps = extContext.globalState.get(constants_1.Constants.recentUsedConnections);
                if (connProps) {
                    logger_1.FileStreamLogger.Instance.info("Starting migration of recent connections.");
                    extContext.globalState.update(constants_1.Constants.recentUsedConnections, undefined);
                    logger_1.FileStreamLogger.Instance.info("Removed old storage for recent connections.");
                    if (connProps.length > 0) {
                        let connNames = connProps.map(connProp => connProp.name);
                        if (connNames) {
                            connNames.filter(connName => connName);
                        }
                        logger_1.FileStreamLogger.Instance.info("Updating new storage for recent connections.");
                        extContext.globalState.update(constants_1.Constants.recentlyUsedOracleConnections, connNames);
                        logger_1.FileStreamLogger.Instance.info("Done migration of recent connections.");
                    }
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.warn(error);
            }
            finally {
                logger_1.FileStreamLogger.Instance.info("End - MigrateStorageValues.");
            }
        });
    }
    static setDefaultLocationsForConfigFiles(extensionPath) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("Starting setDefaultLocationsForFiles...");
            if (Setup.isConfigUpdateRequired()) {
                const { targetDir, userHomeLocation } = Setup.GetSourceAndDestDir();
                if (userHomeLocation) {
                    yield Setup.CreateDirectory(targetDir, userHomeLocation);
                    logger_1.FileStreamLogger.Instance.info("Created Directories.");
                    Setup.updateConfigFileLocation(targetDir);
                    ConfigManager.initialize(extensionPath);
                    logger_1.FileStreamLogger.Instance.info("Done setDefaultLocationsForFiles.");
                }
                else {
                    logger_1.FileStreamLogger.Instance.warn(`Invalid User home value ${userHomeLocation}`);
                }
            }
        });
    }
    static getExtensionConfigSection() {
        return vscode_1.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName);
    }
    static setDefaultLocationForBookmarkDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("Start - setDefaultLocationForBookmarkDirectory");
            try {
                const config = this.getExtensionConfigSection();
                if (config !== null && config !== undefined) {
                    const bookMarkDirectoryDefault = Setup.isDefault(config.get(constants_1.Constants.bookMarkFileFolderPropertyName));
                    if (bookMarkDirectoryDefault) {
                        let bookMarkDir = helper_1.Utils.getExtensionDirectory();
                        if (bookMarkDir) {
                            logger_1.FileStreamLogger.Instance.info(`Setting config value of property ${constants_1.Constants.bookMarkFileFolderPropertyName} to value ${bookMarkDir}`);
                            config.update(constants_1.Constants.bookMarkFileFolderPropertyName, bookMarkDir, true);
                            logger_1.FileStreamLogger.Instance.info("Configuration updated successfully");
                        }
                    }
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.info("Error on updating BookmarkDirectory in configuration");
                logger_1.FileStreamLogger.Instance.error(error);
            }
            logger_1.FileStreamLogger.Instance.info("End - setDefaultLocationForBookmarkDirectory");
        });
    }
    static setDefaultLocationForDownloadsDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("Start - setDefaultLocationForDownloadsDirectory");
            try {
                const config = this.getExtensionConfigSection();
                if (config !== null && config !== undefined) {
                    const downloadsDirectoryDefault = Setup.isDefault(config.get(constants_1.Constants.downloadsFolderPropertyName));
                    if (downloadsDirectoryDefault) {
                        const { targetDir, userHomeLocation } = Setup.GetSourceAndDestDir();
                        if (userHomeLocation) {
                            let downloadsDir = path.join(userHomeLocation, constants_1.Constants.downloadsFolder);
                            logger_1.FileStreamLogger.Instance.info(`Setting config value of property ${constants_1.Constants.downloadsFolderPropertyName} to value ${downloadsDir}`);
                            config.update(constants_1.Constants.downloadsFolderPropertyName, downloadsDir, true);
                            logger_1.FileStreamLogger.Instance.info("Configuration updated successfully for downloads directory");
                        }
                    }
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.info("Error on updating Downloads Directory in configuration");
                logger_1.FileStreamLogger.Instance.error(error);
            }
            logger_1.FileStreamLogger.Instance.info("End - setDefaultLocationForDownloadsDirectory");
        });
    }
    static isConfigUpdateRequired() {
        let result = false;
        logger_1.FileStreamLogger.Instance.info(constants_1.Constants.configFileFolderPropertyName);
        logger_1.FileStreamLogger.Instance.info(constants_1.Constants.walletFileFolderPropertyName);
        const config = this.getExtensionConfigSection();
        if (config) {
            const configFileLocationDefault = Setup.isDefault(config.get(constants_1.Constants.configFileFolderPropertyName));
            const walletFileLocationDefault = Setup.isDefault(config.get(constants_1.Constants.walletFileFolderPropertyName));
            if (configFileLocationDefault || walletFileLocationDefault) {
                logger_1.FileStreamLogger.Instance.info(`configFileLocationDefault ${configFileLocationDefault} walletFileLocationDefault ${walletFileLocationDefault}`);
                result = true;
            }
        }
        logger_1.FileStreamLogger.Instance.info(`isConfigUpdateRequired ${result}`);
        return result;
    }
    static isDefault(value) {
        let result;
        if (value === constants_1.Constants.defaultValueMoniker) {
            result = true;
        }
        else {
            result = false;
        }
        return result;
    }
    static updateConfigFileLocation(location) {
        try {
            const config = this.getExtensionConfigSection();
            if (config) {
                if (config.get(constants_1.Constants.configFileFolderPropertyName) === constants_1.Constants.defaultValueMoniker) {
                    logger_1.FileStreamLogger.Instance.info(`Set config file  path of property ${constants_1.Constants.configFileFolderPropertyName} to value ${location}`);
                    config.update(constants_1.Constants.configFileFolderPropertyName, location, true);
                }
                if (config.get(constants_1.Constants.walletFileFolderPropertyName) === constants_1.Constants.defaultValueMoniker) {
                    logger_1.FileStreamLogger.Instance.info(`Set config file  path of property ${constants_1.Constants.walletFileFolderPropertyName} to value ${location}`);
                    config.update(constants_1.Constants.walletFileFolderPropertyName, location, true);
                }
            }
            else {
                logger_1.FileStreamLogger.Instance.info(`Error on updating configuration-could not fetch config section for ${constants_1.Constants.extensionConfigSectionName}`);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("Error on updating configuration");
            logger_1.FileStreamLogger.Instance.error(error);
        }
    }
    static getShowMissingDotnetCoreRuntimeDialog(context) {
        let retval = true;
        let filePath = "";
        try {
            filePath = path.join(context.extensionPath, constants_1.Constants.dotnetConfigDontShowDialogFilename);
            if (fs.existsSync(filePath)) {
                retval = false;
            }
            logger_1.FileStreamLogger.Instance.info(filePath + " file exists status: " + retval);
        }
        catch (fileError) {
            logger_1.FileStreamLogger.Instance.error("Error checking existence of " + filePath + ": " + fileError);
        }
        logger_1.FileStreamLogger.Instance.info("getShowMissingDotnetCoreRuntimeDialog returning: " + retval);
        return retval;
    }
    static updateShowMissingDotnetCoreRuntimeDialog(context, flag) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!flag) {
                return;
            }
            const filename = constants_1.Constants.dotnetConfigDontShowDialogFilename;
            let filePath = "";
            try {
                const promisifiedWriteFile = util.promisify(fs.writeFile);
                filePath = path.join(context.extensionPath, filename);
                logger_1.FileStreamLogger.Instance.info(`Creating file ${filePath}`);
                promisifiedWriteFile(filePath, "").then(() => {
                    logger_1.FileStreamLogger.Instance.info("Success");
                }).catch((error) => {
                    logger_1.FileStreamLogger.Instance.error("Failed with error: " + error);
                });
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Error on creating file " + filePath);
                logger_1.FileStreamLogger.Instance.error(error);
            }
        });
    }
    static CreateDirectory(targetDir, beginingOfPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const promisifiedExists = util.promisify(fs.exists);
            const existDir = yield promisifiedExists(targetDir);
            if (!existDir) {
                const promisifiedMkdir = util.promisify(fs.mkdir);
                const pathPortions = [constants_1.Constants.oracle, constants_1.Constants.network, constants_1.Constants.admin];
                let currentPath = beginingOfPath;
                for (let index = 0; index < pathPortions.length; index++) {
                    const part = pathPortions[index];
                    currentPath = path.join(currentPath, part);
                    const exist = yield promisifiedExists(currentPath);
                    if (!exist) {
                        yield promisifiedMkdir(currentPath);
                        logger_1.FileStreamLogger.Instance.info(`Created=${currentPath}`);
                    }
                }
            }
        });
    }
    static GetSourceAndDestDir() {
        const platformType = os.type();
        const isWindows = platformType === "Windows_NT";
        logger_1.FileStreamLogger.Instance.info(`Platformtype=${platformType}`);
        let userHomeLocation = "";
        if (isWindows) {
            const userProfile = process.env[constants_1.Constants.userProfile];
            logger_1.FileStreamLogger.Instance.info(`userProfile=${userProfile}`);
            userHomeLocation = userProfile;
        }
        else {
            const homeDir = os.homedir();
            logger_1.FileStreamLogger.Instance.info(`homeDir=${homeDir}`);
            userHomeLocation = homeDir;
        }
        const targetDir = path.join(userHomeLocation, constants_1.Constants.networkAdminPathPortion);
        logger_1.FileStreamLogger.Instance.info(`TargetDir=${targetDir}`);
        return { targetDir, userHomeLocation };
    }
    static GetLocalIPAddresses() {
        var ipV4Addresses = [];
        var ipV6Addresses = [];
        try {
            var interfaces = os.networkInterfaces();
            for (var k in interfaces) {
                for (var k2 in interfaces[k]) {
                    var address = interfaces[k][k2];
                    if (!address.internal) {
                        if (address.family == "IPv4") {
                            ipV4Addresses.push(address.address);
                        }
                        else {
                            ipV6Addresses.push(address.address);
                        }
                    }
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("Error on getting local IP Addresses");
            logger_1.FileStreamLogger.Instance.error(error);
        }
        return ipV4Addresses.concat(ipV6Addresses);
    }
}
exports.Setup = Setup;
Setup.plsqlDebuggerProgram = "";
Setup.plsqlDotnetRuntimePath = "";
Setup.CurrentColorThemeKind = vscode_1.ColorThemeKind.Light;
class ConfigManager {
    get extensionPath() {
        return this.extensionPathField;
    }
    set extensionPath(v) {
        this.extensionPathField = v;
    }
    static get instance() {
        return ConfigManager.instanceField;
    }
    static set instance(v) {
        ConfigManager.instanceField = v;
    }
    static registerConfigChangeHandler() {
        vscode_1.workspace.onDidChangeConfiguration((param) => { ConfigManager.onConfigurationChanged(param); });
    }
    static onConfigurationChanged(param) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.FileStreamLogger.Instance.info("Processing onConfigurationChanged...");
                logger_1.FileStreamLogger.Instance.info("Migrating Configuration..");
                Setup.migrateConfigurationSettings(ConfigManager.instance.extensionPath);
                yield Setup.setDefaultLocationsForFiles(ConfigManager.instance.extensionPath);
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.warn(error);
            }
        });
    }
    static initialize(extensionPath) {
        if (!ConfigManager.instanceField) {
            ConfigManager.instanceField = new ConfigManager();
            ConfigManager.instance.extensionPath = extensionPath;
            ConfigManager.registerConfigChangeHandler();
        }
    }
    get tnsAdmin() {
        let result;
        const config = Setup.getExtensionConfigSection();
        if (config) {
            result = config.get(constants_1.Constants.configFileFolderPropertyName);
            if (Setup.isDefault(result)) {
                result = Setup.getDefaultValue();
            }
        }
        return result;
    }
    get walletLocation() {
        let result;
        const config = Setup.getExtensionConfigSection();
        if (config) {
            result = config.get(constants_1.Constants.walletFileFolderPropertyName);
            if (Setup.isDefault(result)) {
                result = Setup.getDefaultValue();
            }
        }
        return result;
    }
    get loginScript() {
        let result;
        const config = Setup.getExtensionConfigSection();
        if (config) {
            result = config.get(constants_1.Constants.loginScriptPropertyName);
        }
        return result;
    }
}
exports.ConfigManager = ConfigManager;
