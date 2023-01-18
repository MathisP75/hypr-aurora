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
exports.AppUtils = exports.ProceedOption = exports.Utils = exports.Operation = exports.extractDataSource = exports.IsWindowsOS = exports.logErroAfterValidating = exports.getBriefConnectionInformationForDisplay = exports.getDisplayConnectionInformation = exports.getPicklistDetails = exports.getConnectionDescForSelections = exports.getConnectionItemLabel = exports.getTooltipForConnection = exports.setConnectionPropertiesDefault = exports.Timer = exports.convertURIToString = exports.sleep = exports.truncateString = exports.convertToOracleCase = exports.stringFormatterCsharpStyle = exports.isNotEmpty = exports.connectionsAreSame = exports.profilesAreSame = exports.isEmpty = exports.convertDataSourceEnum = exports.getProfileTaskEnumFromString = exports.convertProfileTaskEnum = exports.convertAuthEnum = void 0;
const vscode_1 = require("vscode");
const vscode = require("vscode");
const connectionCommandsScenarioManager_1 = require("../connectionManagement/connectionCommandsScenarioManager");
const constants_1 = require("../constants/constants");
const logger_1 = require("../infrastructure/logger");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const connectionModels_1 = require("./../models/connectionModels");
const os = require("os");
const fs = require("fs");
const path = require("path");
const question_1 = require("../prompts/question");
const adapter_1 = require("../prompts/adapter");
const fileLogger = logger_1.FileStreamLogger.Instance;
function convertAuthEnum(value) {
    return scriptExecutionModels_1.ConnectionAuthenticationType[value];
}
exports.convertAuthEnum = convertAuthEnum;
function convertProfileTaskEnum(value) {
    return connectionCommandsScenarioManager_1.ManageProfileTask[value];
}
exports.convertProfileTaskEnum = convertProfileTaskEnum;
function getProfileTaskEnumFromString(value) {
    return connectionCommandsScenarioManager_1.ManageProfileTask[value];
}
exports.getProfileTaskEnumFromString = getProfileTaskEnumFromString;
function convertDataSourceEnum(value) {
    return connectionModels_1.ProviderDataSourceType[value];
}
exports.convertDataSourceEnum = convertDataSourceEnum;
function isEmpty(value) {
    return (!value || "" === value || value.length === 0);
}
exports.isEmpty = isEmpty;
function profilesAreSame(srcVSCodeProfile, tgtVSCodeProfile) {
    fileLogger.info("Checking if two profiles are same");
    let valtoReturn = false;
    if (srcVSCodeProfile === undefined || tgtVSCodeProfile === undefined) {
        valtoReturn = false;
    }
    else {
        if (srcVSCodeProfile.name || tgtVSCodeProfile.name) {
            valtoReturn = srcVSCodeProfile.name === tgtVSCodeProfile.name;
        }
        else {
            if (srcVSCodeProfile.connectionString || tgtVSCodeProfile.connectionString) {
                valtoReturn = srcVSCodeProfile.connectionString === tgtVSCodeProfile.connectionString;
            }
            else {
                valtoReturn = srcVSCodeProfile.dataSource === tgtVSCodeProfile.dataSource
                    && srcVSCodeProfile.authenticationType === tgtVSCodeProfile.authenticationType
                    && ((isEmpty(srcVSCodeProfile.userID)
                        && isEmpty(tgtVSCodeProfile.userID))
                        || srcVSCodeProfile.userID === tgtVSCodeProfile.userID);
            }
        }
    }
    return valtoReturn;
}
exports.profilesAreSame = profilesAreSame;
function connectionsAreSame(conn, expectedConn) {
    fileLogger.info("check if two connections are same");
    return (conn.connectionString || expectedConn.connectionString) ?
        conn.connectionString === expectedConn.connectionString :
        expectedConn.userID === conn.userID
            && expectedConn.dataSource === conn.dataSource
            && expectedConn.authenticationType === conn.authenticationType;
}
exports.connectionsAreSame = connectionsAreSame;
function isNotEmpty(str) {
    return (str && "" !== str);
}
exports.isNotEmpty = isNotEmpty;
function stringFormatterCsharpStyle(str, ...args) {
    let replacedStr = str;
    if (args.length > 0) {
        replacedStr = str.replace(/\{\s*([^}\s]+)\s*\}/g, (m, p1) => {
            if (typeof args[p1] !== "undefined") {
                return args[p1];
            }
            else {
                return m;
            }
        });
    }
    return replacedStr;
}
exports.stringFormatterCsharpStyle = stringFormatterCsharpStyle;
function convertToOracleCase(stringToConvert) {
    let encloseInQuotes = false;
    if (((typeof stringToConvert !== "undefined") &&
        (typeof stringToConvert.valueOf() === "string")) &&
        (stringToConvert.length > 0)) {
        if (stringToConvert.length > 2) {
            if (stringToConvert.startsWith('"') && stringToConvert.endsWith('"')) {
                encloseInQuotes = true;
            }
        }
        if (!encloseInQuotes) {
            return stringToConvert.toUpperCase();
        }
    }
    return stringToConvert;
}
exports.convertToOracleCase = convertToOracleCase;
function truncateString(stringToTruncate, numChars) {
    let retStr = "";
    if (stringToTruncate.length > numChars) {
        if (numChars > 3) {
            retStr = stringToTruncate.substring(0, numChars - 3) + "...";
        }
        else {
            retStr = stringToTruncate.substring(0, numChars);
        }
    }
    else {
        return retStr = stringToTruncate;
    }
    return retStr;
}
exports.truncateString = truncateString;
function sleep(msec) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, msec));
    });
}
exports.sleep = sleep;
function convertURIToString(uriToCovert) {
    return uriToCovert.toString();
}
exports.convertURIToString = convertURIToString;
class Timer {
    constructor() {
        this.start();
    }
    getDuration() {
        if (!this.varStartTime) {
            return -1;
        }
        else if (!this.varEndTime) {
            const endTime = process.hrtime(this.varStartTime);
            return endTime[0] * 1000 + endTime[1] / 1000000;
        }
        else {
            return this.varEndTime[0] * 1000 + this.varEndTime[1] / 1000000;
        }
    }
    start() {
        this.varStartTime = process.hrtime();
    }
    end() {
        if (!this.varEndTime) {
            this.varEndTime = process.hrtime(this.varStartTime);
        }
    }
}
exports.Timer = Timer;
function setConnectionPropertiesDefault(connProp) {
    if (!connProp.dataSource) {
        connProp.dataSource = "";
    }
    if (!connProp.userID) {
        connProp.userID = "";
    }
    if (!connProp.password) {
        connProp.password = undefined;
    }
    if (!connProp.proxyPassword) {
        connProp.proxyPassword = undefined;
    }
    return connProp;
}
exports.setConnectionPropertiesDefault = setConnectionPropertiesDefault;
function getTooltipForConnection(connProp) {
    return getDisplayConnectionInformation(connProp);
}
exports.getTooltipForConnection = getTooltipForConnection;
function getConnectionItemLabel(connProp) {
    if (connProp.name) {
        return connProp.name;
    }
    else {
        return connProp.connectionString ? connProp.connectionString : connProp.dataSource;
    }
}
exports.getConnectionItemLabel = getConnectionItemLabel;
function getConnectionDescForSelections(profileName, connProp) {
    const displayText = `[${getDisplayConnectionInformation(connProp)}]`;
    return displayText;
}
exports.getConnectionDescForSelections = getConnectionDescForSelections;
function getPicklistDetails(connCreds) {
    return undefined;
}
exports.getPicklistDetails = getPicklistDetails;
function getDisplayConnectionInformation(connProp) {
    let displayText;
    if (connProp.connectionString) {
        displayText = connProp.connectionString;
    }
    else {
        displayText = getBriefConnectionInformationForDisplay(connProp.userID, connProp.dataSource);
        if (displayText && connProp.dBAPrivilege) {
            displayText = displayText + ";" + " ";
            displayText = appendToDisplayString(displayText, "DBA Privilege", connProp.dBAPrivilege) + ";";
        }
    }
    return displayText;
}
exports.getDisplayConnectionInformation = getDisplayConnectionInformation;
function getBriefConnectionInformationForDisplay(userid, datasrc) {
    let displayText;
    if (userid) {
        displayText = `User Id = ${userid}`;
    }
    if (displayText && datasrc) {
        displayText = displayText + ";" + " ";
        displayText = appendToDisplayString(displayText, "Data Source", datasrc);
    }
    return displayText;
}
exports.getBriefConnectionInformationForDisplay = getBriefConnectionInformationForDisplay;
function appendToDisplayString(displayText, label, value) {
    if (isNotEmpty(value)) {
        displayText += `${label} = ${value}`;
    }
    return displayText;
}
function logErroAfterValidating(err) {
    if (err && err.message) {
        logger_1.FileStreamLogger.Instance.error(err.message);
    }
}
exports.logErroAfterValidating = logErroAfterValidating;
function IsWindowsOS() {
    return (process.platform === "win32");
}
exports.IsWindowsOS = IsWindowsOS;
function extractDataSource(datasrc, connectionString) {
    if (!datasrc) {
        datasrc = connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.extractKeyConnString(connectionString, constants_1.Constants.dataSrcKeyRegex);
    }
    if (datasrc) {
        const splitArr = datasrc.split("/");
        if (splitArr.length > 1) {
            datasrc = splitArr[splitArr.length - 1];
        }
    }
    return datasrc;
}
exports.extractDataSource = extractDataSource;
var Operation;
(function (Operation) {
    Operation[Operation["Insert"] = 0] = "Insert";
    Operation[Operation["Delete"] = 1] = "Delete";
    Operation[Operation["DeleteAll"] = 2] = "DeleteAll";
    Operation[Operation["Rename"] = 3] = "Rename";
    Operation[Operation["MoveUP"] = 4] = "MoveUP";
    Operation[Operation["MoveDown"] = 5] = "MoveDown";
})(Operation = exports.Operation || (exports.Operation = {}));
class Utils {
    static CreateIdBasedOnURI(uri, executionId) {
        return uri;
    }
    static CreateIdByURIandExecutionId(uri, executionId) {
        let uriCreated = uri;
        if (executionId) {
            uriCreated = `${uri}/${executionId}`;
        }
        return uriCreated;
    }
    static getExtension(format) {
        if (Utils.formatExtensionMapping.size === 0) {
            Utils.formatExtensionMapping.set(scriptExecutionModels_1.DataFormat.CSV, ["csv"]);
            Utils.formatExtensionMapping.set(scriptExecutionModels_1.DataFormat.JSON, ["json"]);
        }
        return Utils.formatExtensionMapping.get(format);
    }
    static toCodePointArray(str) {
        let result;
        if (str) {
            result = [];
            for (let index = 0; index < str.length; index++) {
                const element = str.codePointAt(index);
                result.push(element);
            }
        }
        return result;
    }
    static getExtensionDirectory() {
        let extnDirToReturn;
        try {
            logger_1.FileStreamLogger.Instance.info(`Creating extension Directory`);
            let homeDir = os.homedir();
            logger_1.FileStreamLogger.Instance.info(`homeDir is- ${homeDir}`);
            if (homeDir) {
                let extensionDir = path.join(homeDir, constants_1.Constants.oracle, constants_1.Constants.extensionDirectory);
                logger_1.FileStreamLogger.Instance.info(`extensionDir is- ${extensionDir}`);
                if (!fs.existsSync(extensionDir)) {
                    logger_1.FileStreamLogger.Instance.info(`Creating Extension Directory`);
                    fs.mkdirSync(extensionDir, { recursive: true });
                    logger_1.FileStreamLogger.Instance.info(`Extension Directory created`);
                }
                extnDirToReturn = extensionDir;
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on creating Extension Directory");
            logger_1.FileStreamLogger.Instance.error(error);
        }
        return extnDirToReturn;
    }
    static getWorkingDirectory() {
        let workDirToReturn;
        try {
            logger_1.FileStreamLogger.Instance.info(`Creating default Working Directory`);
            let extensionDir = Utils.getExtensionDirectory();
            logger_1.FileStreamLogger.Instance.info(`extensionDir is- ${extensionDir}`);
            if (extensionDir) {
                let workingDir = path.join(extensionDir, constants_1.Constants.sql);
                logger_1.FileStreamLogger.Instance.info(`workingDir is- ${workingDir}`);
                if (!fs.existsSync(workingDir)) {
                    logger_1.FileStreamLogger.Instance.info(`Creating Working Directory`);
                    fs.mkdirSync(workingDir, { recursive: true });
                    logger_1.FileStreamLogger.Instance.info(`Working Directory created`);
                }
                workDirToReturn = workingDir;
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on creating Working Directory");
            logger_1.FileStreamLogger.Instance.error(error);
        }
        return workDirToReturn;
    }
    static createNewSqlFile(workDirInConfig) {
        let newSqlFileCreated;
        try {
            let workingDir;
            if (workDirInConfig &&
                workDirInConfig !== constants_1.Constants.defaultValueMoniker) {
                workingDir = workDirInConfig;
                newSqlFileCreated = Utils.createSqlFile(workingDir);
            }
            if (!newSqlFileCreated) {
                workingDir = Utils.getWorkingDirectory();
                newSqlFileCreated = Utils.createSqlFile(workingDir);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on creating new SQL file");
            logger_1.FileStreamLogger.Instance.error(error);
        }
        return newSqlFileCreated;
    }
    static createSqlFile(workingDir) {
        logger_1.FileStreamLogger.Instance.info(`Creating sql file at- ${workingDir}`);
        let newSqlFileCreated;
        try {
            if (workingDir) {
                if (!fs.existsSync(workingDir)) {
                    fs.mkdirSync(workingDir, { recursive: true });
                }
                let newSqlFileName = constants_1.Constants.newSQLFileFormat + constants_1.Constants.sqlFileExtension;
                let newSqlFileWithPath = path.join(workingDir, newSqlFileName);
                let index = 1;
                while (fs.existsSync(newSqlFileWithPath)) {
                    newSqlFileName = constants_1.Constants.newSQLFileFormat + "_" + index++ + constants_1.Constants.sqlFileExtension;
                    newSqlFileWithPath = path.join(workingDir, newSqlFileName);
                }
                logger_1.FileStreamLogger.Instance.info(`Creating New SQL File with path- ${newSqlFileWithPath}`);
                fs.writeFileSync(newSqlFileWithPath, "");
                logger_1.FileStreamLogger.Instance.info(`Created New SQL File with path- ${newSqlFileWithPath}`);
                newSqlFileCreated = newSqlFileWithPath;
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on creating SQL file");
            logger_1.FileStreamLogger.Instance.error(error);
        }
        return newSqlFileCreated;
    }
    static promptForConfirmation(confirmMessage, vsCodeconnector, cancelOption = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let proceed = cancelOption ? ProceedOption.Cancel : false;
            const question = {
                type: cancelOption ? question_1.QuestionTypes.confirmWithCancel : question_1.QuestionTypes.confirm,
                name: confirmMessage,
                message: confirmMessage
            };
            try {
                let prompter = new adapter_1.default();
                const val = yield prompter.promptSingle(question);
                if (val !== undefined) {
                    proceed = val;
                }
            }
            catch (err) {
                AppUtils.ShowErrorAndLog(err, vsCodeconnector);
            }
            return proceed;
        });
    }
    static getServerInputArguments(servicePath, logFilename, dotnetRuntimePath) {
        logger_1.FileStreamLogger.Instance.info("getServerInputArguments - Start");
        let serverArgs = [];
        let serverCommand = servicePath;
        try {
            logger_1.FileStreamLogger.Instance.info("getServerInputArguments - dotnetRuntimePath: " + dotnetRuntimePath);
            logger_1.FileStreamLogger.Instance.info("getServerInputArguments - servicePath: " + servicePath);
            if (servicePath.endsWith(".dll")) {
                serverArgs = [servicePath];
                serverCommand = dotnetRuntimePath;
            }
            const config = vscode_1.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName);
            if (config) {
                const loggingSettings = config[constants_1.Constants.extensionConfigloggingSection];
                if (loggingSettings) {
                    serverArgs.push("-enableLogging");
                    if (loggingSettings[constants_1.Constants.enableLogging]) {
                        serverArgs.push(true);
                    }
                    else {
                        serverArgs.push(false);
                    }
                    serverArgs.push("-loglevel");
                    serverArgs.push(loggingSettings[constants_1.Constants.logLevel]);
                    const logFileName = path.join(logger_1.FileStreamLogger.extensionPath, `./${logFilename}.log`);
                    serverArgs.push("-LogFile");
                    serverArgs.push(logFileName);
                }
                const locale = vscode.env.language;
                serverArgs.push("-locale");
                serverArgs.push(locale);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("getServerInputArguments - Error on determining server arguments to use");
            logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("getServerInputArguments - End");
        return { serverCommand, serverArgs };
    }
}
exports.Utils = Utils;
Utils.formatExtensionMapping = new Map();
var ProceedOption;
(function (ProceedOption) {
    ProceedOption[ProceedOption["Yes"] = 0] = "Yes";
    ProceedOption[ProceedOption["No"] = 1] = "No";
    ProceedOption[ProceedOption["Cancel"] = 2] = "Cancel";
})(ProceedOption = exports.ProceedOption || (exports.ProceedOption = {}));
class AppUtils {
    static ShowErrorAndLog(error, vsCodeconnector) {
        if (error && error.message) {
            vsCodeconnector.showErrorMessage(error.message);
        }
        logErroAfterValidating(error);
    }
}
exports.AppUtils = AppUtils;
