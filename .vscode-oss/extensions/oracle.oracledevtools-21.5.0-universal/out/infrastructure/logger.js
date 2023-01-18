"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoggingConfig = exports.ChannelLogger = exports.FileStreamLogger = void 0;
const newLocal = require("console");
const fs = require("fs");
const { Console } = newLocal;
const path = require("path");
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
class Common {
    static isString(val) {
        if (typeof val === "string" || val instanceof String) {
            return true;
        }
        else {
            return false;
        }
    }
}
class FileStreamLogger {
    constructor(enabled, fileName, pMinLogLevel) {
        this.logger = undefined;
        this.minLogLevel = scriptExecutionModels_1.LogLevel.Information;
        this.enabled = enabled;
        this.fileName = fileName;
        this.minLogLevel = scriptExecutionModels_1.LogLevel[pMinLogLevel];
        this.filePathChanged(this.fileName);
    }
    static get extensionPath() {
        return FileStreamLogger.varExtensionPath;
    }
    static set extensionPath(value) {
        FileStreamLogger.varExtensionPath = value;
        FileStreamLogger.onConfigurationChanged(null);
    }
    get fileName() {
        return this.varFileName;
    }
    set fileName(value) {
        this.varFileName = value;
        if (this.varFileName) {
            this.filePathChanged(this.varFileName);
        }
    }
    static get Instance() {
        if (!FileStreamLogger.varInstance) {
            const { enable, fileName, loglevel } = getLoggingConfig();
            FileStreamLogger.varInstance = new FileStreamLogger(enable, fileName, loglevel.toString());
            vscode.workspace.onDidChangeConfiguration((param) => { FileStreamLogger.onConfigurationChanged(param); });
        }
        return FileStreamLogger.varInstance;
    }
    get currentLogLevel() {
        return this.minLogLevel;
    }
    static onConfigurationChanged(param) {
        const { enable, fileName, loglevel } = getLoggingConfig();
        if (!enable) {
            FileStreamLogger.Instance.info("Logging is disabled.");
        }
        FileStreamLogger.Instance.setProperties(enable, fileName, loglevel.toString());
        if (enable) {
            FileStreamLogger.Instance.info("Logging is enabled.");
        }
    }
    log(logData) {
        const msg = `${scriptExecutionModels_1.LogSource[logData.source]}:${logData.data}`;
        switch (logData.level) {
            case scriptExecutionModels_1.LogLevel.Information:
                FileStreamLogger.Instance.info(msg);
                break;
            case scriptExecutionModels_1.LogLevel.Error:
                FileStreamLogger.Instance.error(msg);
                break;
            case scriptExecutionModels_1.LogLevel.Warning:
                FileStreamLogger.Instance.warn(msg);
                break;
            default:
                break;
        }
    }
    setProperties(enable, fileName, loglevel) {
        const self = this;
        self.enabled = enable;
        self.fileName = fileName;
        self.minLogLevel = scriptExecutionModels_1.LogLevel[loglevel];
    }
    info(message) {
        const self = this;
        const method = self.logger ? self.logger.info : undefined;
        const msgLogLevel = scriptExecutionModels_1.LogLevel.Information;
        self.debug(method, message, msgLogLevel);
    }
    warn(message) {
        const self = this;
        const method = self.logger ? self.logger.warn : undefined;
        const msgLogLevel = scriptExecutionModels_1.LogLevel.Warning;
        self.debug(method, message, msgLogLevel);
    }
    error(message) {
        const self = this;
        const method = self.logger ? self.logger.error : undefined;
        const msgLogLevel = scriptExecutionModels_1.LogLevel.Error;
        self.debug(method, message, msgLogLevel);
    }
    debug(method, message, msgLogLevel) {
        const self = this;
        if (self.enabled && self.minLogLevel <= msgLogLevel) {
            if (!Common.isString(message)) {
                message = JSON.stringify(message);
            }
            const now = new Date();
            const formattedMessage = `${scriptExecutionModels_1.LogLevel[msgLogLevel]}:${now.toLocaleString()}:${now.getMilliseconds()}:${message}`;
            if (method) {
                method(formattedMessage);
            }
        }
    }
    filePathChanged(fileName) {
        const self = this;
        if (FileStreamLogger.extensionPath) {
            let logFilePath = `./${fileName}.log`;
            logFilePath = path.join(FileStreamLogger.extensionPath, `./${fileName}.log`);
            const output = fs.createWriteStream(logFilePath, { flags: "a+" });
            self.logger = new Console(output);
        }
    }
}
exports.FileStreamLogger = FileStreamLogger;
class ChannelLogger {
    constructor(enabled, pMinLogLevel) {
        this.enabled = enabled;
        this.minLogLevel = scriptExecutionModels_1.LogLevel.Information;
        this.enabled = enabled;
        this.minLogLevel = scriptExecutionModels_1.LogLevel[pMinLogLevel];
        this.channelLogger = vscode.window.createOutputChannel(constants_1.Constants.outputChannelName);
    }
    static get Instance() {
        if (!ChannelLogger.varInstance) {
            const { enable, fileName, loglevel } = getLoggingConfig();
            ChannelLogger.varInstance = new ChannelLogger(enable, loglevel.toString());
            vscode.workspace.onDidChangeConfiguration((param) => { ChannelLogger.onConfigurationChanged(param); });
        }
        return ChannelLogger.varInstance;
    }
    static onConfigurationChanged(param) {
        const { enable, fileName, loglevel } = getLoggingConfig();
        ChannelLogger.Instance.setProperties(enable, loglevel.toString());
    }
    get currentLogLevel() {
        return this.minLogLevel;
    }
    show() {
        this.channelLogger.show();
    }
    clear() {
        this.channelLogger.clear();
    }
    appendLine(line) {
        this.channelLogger.appendLine(line);
    }
    setProperties(enable, loglevel) {
        this.enabled = enable;
        this.minLogLevel = scriptExecutionModels_1.LogLevel[loglevel];
    }
    info(message) {
        const msgLogLevel = scriptExecutionModels_1.LogLevel.Information;
        this.debug(message, msgLogLevel);
    }
    warn(message) {
        const msgLogLevel = scriptExecutionModels_1.LogLevel.Warning;
        this.debug(message, msgLogLevel);
    }
    error(message) {
        const msgLogLevel = scriptExecutionModels_1.LogLevel.Error;
        this.debug(message, msgLogLevel);
    }
    log(message) {
        const msgLogLevel = scriptExecutionModels_1.LogLevel.None;
        this.debug(message, msgLogLevel);
    }
    debug(message, msgLogLevel) {
        if (!Common.isString(message)) {
            message = JSON.stringify(message);
        }
        const now = new Date();
        const formattedMessage = (msgLogLevel == scriptExecutionModels_1.LogLevel.None) ? message : `${scriptExecutionModels_1.LogLevel[msgLogLevel]}:${now.toLocaleString()}:${message}`;
        this.channelLogger.appendLine(formattedMessage);
    }
}
exports.ChannelLogger = ChannelLogger;
function getLoggingConfig() {
    let enable = true;
    let loglevel = scriptExecutionModels_1.LogLevel.Information;
    const fileName = constants_1.Constants.defaultClientLogFileName;
    let isEnableSet = false;
    let isLogLevelSet = false;
    let config = vscode.workspace.getConfiguration(constants_1.Constants.oldExtensionConfigSectionName);
    if (config !== undefined && config !== null) {
        if (config.has(constants_1.Constants.loggingEnablePropertyName)) {
            let configurationEntries = config.inspect(constants_1.Constants.loggingEnablePropertyName);
            if (configurationEntries.defaultValue !== undefined &&
                configurationEntries.globalValue === undefined &&
                configurationEntries.workspaceValue === undefined &&
                configurationEntries.workspaceFolderValue === undefined) {
                isEnableSet = false;
            }
            else {
                enable = config.get(constants_1.Constants.loggingEnablePropertyName);
                isEnableSet = true;
            }
        }
        if (config.has(constants_1.Constants.loggingLevelPropertyName)) {
            let configurationEntries = config.inspect(constants_1.Constants.loggingLevelPropertyName);
            if (configurationEntries.defaultValue !== undefined &&
                configurationEntries.globalValue === undefined &&
                configurationEntries.workspaceValue === undefined &&
                configurationEntries.workspaceFolderValue === undefined) {
                isLogLevelSet = false;
            }
            else {
                loglevel = config.get(constants_1.Constants.loggingLevelPropertyName);
                isLogLevelSet = true;
            }
        }
    }
    if (isEnableSet === false || isLogLevelSet === false) {
        config = vscode.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName);
        if (config !== null && config !== undefined) {
            if (isEnableSet === false) {
                enable = config.get(constants_1.Constants.loggingEnablePropertyName);
                isEnableSet = true;
            }
            if (isLogLevelSet == false) {
                loglevel = config.get(constants_1.Constants.loggingLevelPropertyName);
                isLogLevelSet = true;
            }
        }
    }
    return { enable, fileName, loglevel };
}
exports.getLoggingConfig = getLoggingConfig;
