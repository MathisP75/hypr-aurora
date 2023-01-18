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
exports.FormatterSettingsManager = void 0;
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const setup_1 = require("../utilities/setup");
const logger = require("../infrastructure/logger");
const scriptExcutionCommandHandler_1 = require("../scriptExecution/scriptExcutionCommandHandler");
const localizedConstants_1 = require("./../constants/localizedConstants");
const utilities_1 = require("../explorer/utilities");
const helper = require("./../utilities/helper");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const formattingModels_1 = require("../models/formattingModels");
const intellisenseModels_1 = require("../models/intellisenseModels");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const fs = require("fs");
const fileLogger = logger.FileStreamLogger.Instance;
class FormatterSettingsManager {
    constructor(scriptExecuter) {
        this.scriptExecuter = scriptExecuter;
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getFormatterSettingsRequest, (message) => {
            this.handleGetFormatterSettingsRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.saveFormatterSettingsRequest, (message) => {
            this.handleSaveFormatterSettingsRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.formatPreviewTextRequest, (message) => {
            this.handleFormatPreviewTextRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.exportFormatSettingsRequest, (message) => {
            this.handleExportSettingsRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.importFormatSettingsRequest, (message) => {
            this.handleImportSettingsRequest(message);
        });
    }
    openFormatterSettings(toolbar) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
                args.uri = utilities_1.TreeViewConstants.formatterSettingsUri;
                args.executionId = (++this.scriptExecuter.scriptExecutionCount).toString();
                args.windowUri = constants_1.Constants.formatterSettingsWindowUri;
                args.uiMode = scriptExecutionModels_1.UIDisplayMode.formatterSettings;
                args.windowTitle = localizedConstants_1.default.formatterSettingsUITitle;
                this.scriptExecuter.openFormatterSettingsPanel(args, toolbar);
            }
            catch (err) {
                fileLogger.error(err);
            }
        });
    }
    handleExportSettingsRequest(message) {
        return __awaiter(this, void 0, void 0, function* () {
            fileLogger.info('Received ExportFormatSettingsRequest');
            const response = new scriptExecutionModels_1.ExportFormatSettingsResponse();
            response.result = false;
            try {
                if (message && message.formatConfig) {
                    const formatSettings = this.processFormatterConfigToSave(message.formatConfig);
                    response.result = yield this.exportSettings(formatSettings);
                }
            }
            catch (error) {
                fileLogger.error(error);
            }
            response.resultMsg = response.result ? localizedConstants_1.default.exportFormatSettingsSuccessMsg
                : localizedConstants_1.default.exportFormatSettingsFailedMsg;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.exportFormatSettingsResponse, response);
        });
    }
    handleImportSettingsRequest(message) {
        return __awaiter(this, void 0, void 0, function* () {
            fileLogger.info('Received ImportFormatSettingsRequest');
            const response = new scriptExecutionModels_1.ImportFormatSettingsResponse();
            response.formatConfig = null;
            try {
                if (message) {
                    [response.formatConfig, response.resultMsg] = yield this.importSettings();
                }
            }
            catch (error) {
                fileLogger.error(error);
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.importFormatSettingsResponse, response);
        });
    }
    exportSettings(formatConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                fileLogger.info("Exporting formatter settings file.");
                try {
                    if (formatConfig) {
                        let fileContents = {};
                        fileContents[`${constants_1.Constants.extensionConfigSectionName}.${constants_1.Constants.formatterSettingsPropertyName}`] = formatConfig;
                        const fileText = JSON.stringify(fileContents, null, 4);
                        const options = {};
                        options.saveLabel = localizedConstants_1.default.export;
                        options.title = localizedConstants_1.default.exportFormatterSettings;
                        options.filters = { 'JSON': ['json'] };
                        options.defaultUri = vscode.Uri.file("oracle-formatter-settings");
                        let fileToSave = yield vscode.window.showSaveDialog(options);
                        if (fileToSave && fileToSave.fsPath) {
                            fs.writeFileSync(fileToSave.fsPath, fileText);
                            let document = yield vscode.workspace.openTextDocument(fileToSave);
                            yield vscode.window.showTextDocument(document, { preview: false });
                            resolve(true);
                            return;
                        }
                    }
                }
                catch (error) {
                    fileLogger.error(error);
                }
                resolve(false);
            }));
        });
    }
    importSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                fileLogger.info("Importing formatter settings file");
                try {
                    const options = {};
                    options.title = localizedConstants_1.default.importFormatterSettings;
                    options.openLabel = localizedConstants_1.default.import;
                    options.canSelectMany = false;
                    options.canSelectFolders = false;
                    options.canSelectFiles = true;
                    options.filters = { 'JSON': ['json'] };
                    let fileToImport = yield vscode.window.showOpenDialog(options);
                    if (fileToImport && fileToImport.length > 0) {
                        let buffer = fs.readFileSync(fileToImport[0].fsPath);
                        const propertyName = `${constants_1.Constants.extensionConfigSectionName}.${constants_1.Constants.formatterSettingsPropertyName}`;
                        if (buffer) {
                            let settingsString = buffer.toString();
                            let formatSettings = JSON.parse(settingsString);
                            if (formatSettings && formatSettings[propertyName] !== undefined) {
                                const result = FormatterSettingsManager.procesFormatterConfigFromSettings(formatSettings[propertyName]);
                                resolve([result, localizedConstants_1.default.importFormatSuccessful]);
                                return;
                            }
                        }
                        resolve([null, helper.stringFormatterCsharpStyle(localizedConstants_1.default.importFormatFailed, propertyName)]);
                        return;
                    }
                }
                catch (error) {
                    fileLogger.error(error);
                }
                resolve([null, null]);
            }));
        });
    }
    handleFormatPreviewTextRequest(message) {
        return __awaiter(this, void 0, void 0, function* () {
            fileLogger.info('Received FormatPreviewTextRequest');
            try {
                if (message.formatConfig) {
                    const editorConfig = vscode.workspace.getConfiguration("editor");
                    message.formatConfig.tabSize = editorConfig.get("tabSize");
                    message.formatConfig.insertSpaces = editorConfig.get("insertSpaces");
                    if (message.formatConfig.keywordCasing === intellisenseModels_1.Casing.SameAsIntellisense) {
                        const config = setup_1.Setup.getExtensionConfigSection();
                        message.formatConfig.keywordCasing = FormatterSettingsManager.getConfigValues(config.get(constants_1.Constants.intellisenseKeywordCasingPropertyName));
                    }
                    if (message.formatConfig.identifierCasing === intellisenseModels_1.Casing.SameAsIntellisense) {
                        const config = setup_1.Setup.getExtensionConfigSection();
                        message.formatConfig.identifierCasing = FormatterSettingsManager.getConfigValues(config.get(constants_1.Constants.intellisenseObjectNameCasingPropertyName));
                    }
                }
                let requestParams = new formattingModels_1.FormatTextRequestParam("", message.formatConfig, formattingModels_1.FormatType.FormatString);
                requestParams.text = message.text;
                requestParams.selection = {
                    startLine: 0,
                    startColumn: 0,
                    endLine: 0,
                    endColumn: 0
                };
                let response = yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(formattingModels_1.FormatTextRequest.type, requestParams);
                if (response.formattedText) {
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.formatPreviewTextResponse, new scriptExecutionModels_1.FormatPreviewTextResponse(response.formattedText));
                    return;
                }
            }
            catch (error) {
                fileLogger.error(error);
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.formatPreviewTextResponse, new scriptExecutionModels_1.FormatPreviewTextResponse(""));
        });
    }
    handleSaveFormatterSettingsRequest(message) {
        return __awaiter(this, void 0, void 0, function* () {
            fileLogger.info('Received SaveFormatterSettingsRequest');
            const response = new scriptExecutionModels_1.SaveFormatterSettingsResponse();
            try {
                const formatSettings = this.processFormatterConfigToSave(message.formatConfig);
                yield setup_1.Setup.getExtensionConfigSection().update(constants_1.Constants.formatterSettingsPropertyName, formatSettings, true);
                response.message = localizedConstants_1.default.formatterSettingsSavedMsg;
                response.success = true;
            }
            catch (error) {
                response.message = localizedConstants_1.default.formatterSettingSaveFailedMsg + error;
                response.success = false;
                fileLogger.error(error);
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveFormatterSettingsResponse, response);
        });
    }
    processFormatterConfigToSave(formatConfig) {
        let settingsObject = {};
        try {
            if (formatConfig.identifierCasing != undefined)
                settingsObject[constants_1.Constants.identifierCasing] = this.getCasingTypeString(formatConfig.identifierCasing);
            if (formatConfig.keywordCasing != undefined)
                settingsObject[constants_1.Constants.keywordCasing] = this.getCasingTypeString(formatConfig.keywordCasing);
            if (formatConfig.singleLineComments != undefined)
                settingsObject[constants_1.Constants.singleLinedComments] = this.getLineCommentTypeString(formatConfig.singleLineComments);
            if (formatConfig.lineBrkBtwnStmts != undefined)
                settingsObject[constants_1.Constants.lineBrkBtwnStmts] = formatConfig.lineBrkBtwnStmts == 2 ? constants_1.Constants.doubleBreak : constants_1.Constants.singlebreak;
            if (formatConfig.lineBreakOnComma != undefined)
                settingsObject[constants_1.Constants.lineBreakOnComma] = this.getLineBreakTypeString(formatConfig.lineBreakOnComma);
            if (formatConfig.lineBreakOnConcat != undefined)
                settingsObject[constants_1.Constants.lineBreakOnConcat] = this.getLineBreakTypeString(formatConfig.lineBreakOnConcat);
            if (formatConfig.lineBreakOnBooleanConn != undefined)
                settingsObject[constants_1.Constants.lineBreakOnBoolConn] = this.getLineBreakTypeString(formatConfig.lineBreakOnBooleanConn);
            if (formatConfig.lineBreakOnANSIJoins != undefined)
                settingsObject[constants_1.Constants.lineBreakOnAnsiJoins] = formatConfig.lineBreakOnANSIJoins;
            if (formatConfig.lineBreakBeforeLineComments != undefined)
                settingsObject[constants_1.Constants.lineBreakBeforeLineComments] = formatConfig.lineBreakBeforeLineComments;
            if (formatConfig.lineBreakAfterSelectFromWhere != undefined)
                settingsObject[constants_1.Constants.lineBreakAfterSelectFromWhere] = formatConfig.lineBreakAfterSelectFromWhere;
            if (formatConfig.lineBreakForIfCaseWhile != undefined)
                settingsObject[constants_1.Constants.lineBreakOnIfCase] = this.getIfCaseWhileFormatTypeString(formatConfig.lineBreakForIfCaseWhile);
            if (formatConfig.wsAroundOperators != undefined)
                settingsObject[constants_1.Constants.wsOnOperators] = this.getWhitespaceTypeString(formatConfig.wsAroundOperators);
            if (formatConfig.wsAfterCommas != undefined)
                settingsObject[constants_1.Constants.wsOnComma] = (formatConfig.wsAfterCommas);
            if (formatConfig.wsAroundParenthesis != undefined)
                settingsObject[constants_1.Constants.wsOnParenthesis] = this.getWhitespaceTypeString(formatConfig.wsAroundParenthesis);
        }
        catch (error) {
            fileLogger.error('Error in processFormatterConfigToSave: ' + error);
        }
        return settingsObject;
    }
    handleGetFormatterSettingsRequest(message) {
        return __awaiter(this, void 0, void 0, function* () {
            fileLogger.info('Received GetCompilerSettingsRequest request');
            const response = new scriptExecutionModels_1.GetFormatterSettingsResponse();
            try {
                const config = setup_1.Setup.getExtensionConfigSection();
                const formatConfig = config.get(constants_1.Constants.formatterSettingsPropertyName);
                response.formatConfig = FormatterSettingsManager.procesFormatterConfigFromSettings(formatConfig);
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getFormatterSettingsResponse, response);
            }
            catch (error) {
                fileLogger.error('Error in handleGetCompilerSettingsRequest');
                helper.logErroAfterValidating(error);
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getFormatterSettingsResponse, response);
            }
        });
    }
    static getFormatterSettings() {
        const config = setup_1.Setup.getExtensionConfigSection();
        const formatConfigObject = config.get(constants_1.Constants.formatterSettingsPropertyName);
        let formatConfig = FormatterSettingsManager.procesFormatterConfigFromSettings(formatConfigObject, config);
        if (formatConfig.identifierCasing === intellisenseModels_1.Casing.SameAsIntellisense) {
            const intellisenseIdentiferCasing = config.get(constants_1.Constants.intellisenseObjectNameCasingPropertyName);
            formatConfig.identifierCasing = intellisenseIdentiferCasing ? this.getConfigValues(intellisenseIdentiferCasing) : intellisenseModels_1.Casing.Uppercase;
        }
        if (formatConfig.keywordCasing === intellisenseModels_1.Casing.SameAsIntellisense) {
            const intellisenseKeywordCasing = config.get(constants_1.Constants.intellisenseKeywordCasingPropertyName);
            formatConfig.keywordCasing = intellisenseKeywordCasing ? this.getConfigValues(intellisenseKeywordCasing) : intellisenseModels_1.Casing.Uppercase;
        }
        return formatConfig;
    }
    static procesFormatterConfigFromSettings(settingsObject, config = null) {
        let formatOptions = new formattingModels_1.FormatOptions();
        try {
            formatOptions.identifierCasing = this.validateEnumProperty(settingsObject[constants_1.Constants.identifierCasing], formatOptions.identifierCasing, constants_1.Constants.intellisenseObjectNameCasingPropertyName, config);
            formatOptions.keywordCasing = this.validateEnumProperty(settingsObject[constants_1.Constants.keywordCasing], formatOptions.keywordCasing, constants_1.Constants.intellisenseKeywordCasingPropertyName, config);
            formatOptions.singleLineComments = this.validateEnumProperty(settingsObject[constants_1.Constants.singleLinedComments], formatOptions.singleLineComments, constants_1.Constants.singleLinedComments);
            formatOptions.lineBrkBtwnStmts = this.validateEnumProperty(settingsObject[constants_1.Constants.lineBrkBtwnStmts], formatOptions.lineBrkBtwnStmts);
            formatOptions.lineBreakOnComma = this.validateEnumProperty(settingsObject[constants_1.Constants.lineBreakOnComma], formatOptions.lineBreakOnComma);
            formatOptions.lineBreakOnConcat = this.validateEnumProperty(settingsObject[constants_1.Constants.lineBreakOnConcat], formatOptions.lineBreakOnConcat);
            formatOptions.lineBreakOnBooleanConn = this.validateEnumProperty(settingsObject[constants_1.Constants.lineBreakOnBoolConn], formatOptions.lineBreakOnBooleanConn);
            formatOptions.lineBreakOnANSIJoins = this.validateBooleanProperty(settingsObject[constants_1.Constants.lineBreakOnAnsiJoins], formatOptions.lineBreakOnANSIJoins);
            formatOptions.lineBreakBeforeLineComments = this.validateBooleanProperty(settingsObject[constants_1.Constants.lineBreakBeforeLineComments], formatOptions.lineBreakBeforeLineComments);
            formatOptions.lineBreakAfterSelectFromWhere = this.validateBooleanProperty(settingsObject[constants_1.Constants.lineBreakAfterSelectFromWhere], formatOptions.lineBreakAfterSelectFromWhere);
            formatOptions.lineBreakForIfCaseWhile = this.validateEnumProperty(settingsObject[constants_1.Constants.lineBreakOnIfCase], formatOptions.lineBreakForIfCaseWhile);
            formatOptions.wsAroundOperators = this.validateEnumProperty(settingsObject[constants_1.Constants.wsOnOperators], formatOptions.wsAroundOperators);
            formatOptions.wsAfterCommas = this.validateBooleanProperty(settingsObject[constants_1.Constants.wsOnComma], formatOptions.wsAfterCommas);
            formatOptions.wsAroundParenthesis = this.validateEnumProperty(settingsObject[constants_1.Constants.wsOnParenthesis], formatOptions.wsAroundParenthesis);
        }
        catch (error) {
            fileLogger.error('Error in procesFormatterConfigFromSettings: ' + error);
        }
        return formatOptions;
    }
    static validateEnumProperty(settingsProperty, defaultValue, configPropertyName = null, config = null) {
        let enumValue = -1;
        if (settingsProperty !== undefined)
            enumValue = this.getConfigValues(settingsProperty, config, configPropertyName);
        return (enumValue >= 0) ? enumValue : defaultValue;
    }
    static validateBooleanProperty(settingsProperty, defaultValue) {
        if (settingsProperty !== undefined && (settingsProperty === true || settingsProperty === false))
            return settingsProperty;
        return defaultValue;
    }
    static getConfigValues(value, config = null, propertyName = null) {
        switch (value) {
            case constants_1.Constants.upperCase: return intellisenseModels_1.Casing.Uppercase;
            case constants_1.Constants.lowerCase: return intellisenseModels_1.Casing.Lowercase;
            case constants_1.Constants.noChange: return intellisenseModels_1.Casing.None;
            case constants_1.Constants.sameAsIntellisense:
                if (config && propertyName) {
                    return this.getConfigValues(config.get(propertyName));
                }
                else
                    return intellisenseModels_1.Casing.SameAsIntellisense;
                break;
            case constants_1.Constants.doubleBreak: return 2;
            case constants_1.Constants.singlebreak: return 1;
            case constants_1.Constants.after: return formattingModels_1.LineBreakPosition.After;
            case constants_1.Constants.before: return formattingModels_1.LineBreakPosition.Before;
            case constants_1.Constants.noBreak: return formattingModels_1.LineBreakPosition.NoBreak;
            case constants_1.Constants.indentedActionsInlinedConditions: return formattingModels_1.IfCaseWhileFormatType.IndentedActionInlinedCondition;
            case constants_1.Constants.terse: return formattingModels_1.IfCaseWhileFormatType.Terse;
            case constants_1.Constants.lineBreakAfterConditionsAndActions: return formattingModels_1.IfCaseWhileFormatType.LineBreaksAfterConditionAndAction;
            case constants_1.Constants.indentedConditionsAndActions: return formattingModels_1.IfCaseWhileFormatType.IndentedConditionAndAction;
            case constants_1.Constants.keepUnchanged: return propertyName == constants_1.Constants.singleLinedComments ?
                formattingModels_1.SingleLineCommentFormatType.KeepUnchanged
                : formattingModels_1.WhiteSpaceSetting.Default;
            case constants_1.Constants.wrapMultiline: return formattingModels_1.SingleLineCommentFormatType.WrapMultiline;
            case constants_1.Constants.wrapSingleLine: return formattingModels_1.SingleLineCommentFormatType.WrapSingleline;
            case constants_1.Constants.noSpace: return formattingModels_1.WhiteSpaceSetting.NoSpace;
            case constants_1.Constants.addSpace: return formattingModels_1.WhiteSpaceSetting.AddSpace;
            case constants_1.Constants.inside: return formattingModels_1.WhiteSpaceSetting.InsideBrackets;
            case constants_1.Constants.outside: return formattingModels_1.WhiteSpaceSetting.OutsideBrackets;
        }
        return -1;
    }
    getCasingTypeString(casing) {
        switch (casing) {
            case intellisenseModels_1.Casing.Uppercase: return constants_1.Constants.upperCase;
            case intellisenseModels_1.Casing.Lowercase: return constants_1.Constants.lowerCase;
            case intellisenseModels_1.Casing.None: return constants_1.Constants.noChange;
            case intellisenseModels_1.Casing.SameAsIntellisense: return constants_1.Constants.sameAsIntellisense;
        }
        return undefined;
    }
    getLineCommentTypeString(commentType) {
        switch (commentType) {
            case formattingModels_1.SingleLineCommentFormatType.KeepUnchanged: return constants_1.Constants.keepUnchanged;
            case formattingModels_1.SingleLineCommentFormatType.WrapMultiline: return constants_1.Constants.wrapMultiline;
            case formattingModels_1.SingleLineCommentFormatType.WrapSingleline: return constants_1.Constants.wrapSingleLine;
        }
        return undefined;
    }
    getLineBreakTypeString(type) {
        switch (type) {
            case formattingModels_1.LineBreakPosition.After: return constants_1.Constants.after;
            case formattingModels_1.LineBreakPosition.Before: return constants_1.Constants.before;
            case formattingModels_1.LineBreakPosition.NoBreak: return constants_1.Constants.noBreak;
        }
        return undefined;
    }
    getIfCaseWhileFormatTypeString(type) {
        switch (type) {
            case formattingModels_1.IfCaseWhileFormatType.IndentedActionInlinedCondition: return constants_1.Constants.indentedActionsInlinedConditions;
            case formattingModels_1.IfCaseWhileFormatType.IndentedConditionAndAction: return constants_1.Constants.indentedConditionsAndActions;
            case formattingModels_1.IfCaseWhileFormatType.LineBreaksAfterConditionAndAction: return constants_1.Constants.lineBreakAfterConditionsAndActions;
            case formattingModels_1.IfCaseWhileFormatType.Terse: return constants_1.Constants.terse;
        }
        return undefined;
    }
    getWhitespaceTypeString(type) {
        switch (type) {
            case formattingModels_1.WhiteSpaceSetting.AddSpace: return constants_1.Constants.addSpace;
            case formattingModels_1.WhiteSpaceSetting.Default: return constants_1.Constants.keepUnchanged;
            case formattingModels_1.WhiteSpaceSetting.InsideBrackets: return constants_1.Constants.inside;
            case formattingModels_1.WhiteSpaceSetting.OutsideBrackets: return constants_1.Constants.outside;
            case formattingModels_1.WhiteSpaceSetting.NoSpace: return constants_1.Constants.noSpace;
        }
        return undefined;
    }
}
exports.FormatterSettingsManager = FormatterSettingsManager;
