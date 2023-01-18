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
exports.oracleTypeFormattingProvider = exports.oracleRangeFormattingProvider = exports.oracleDocumentFormattingProvider = exports.oracleFormattingProvider = void 0;
const vscode_1 = require("vscode");
const DocumentConnectionInformation_1 = require("../connectionManagement/DocumentConnectionInformation");
const formatterSettingsManager_1 = require("../explorer/formatterSettingsManager");
const formattingModels_1 = require("../models/formattingModels");
const oracleLanguageServerClient_1 = require("./oracleLanguageServerClient");
class oracleFormattingProvider {
    populateFormatOptions(options) {
        this.formatConfiguration = formatterSettingsManager_1.FormatterSettingsManager.getFormatterSettings();
        if (this.formatConfiguration == null)
            this.formatConfiguration = new formattingModels_1.FormatOptions();
        this.formatConfiguration.insertSpaces = options.insertSpaces;
        this.formatConfiguration.tabSize = options.tabSize;
    }
}
exports.oracleFormattingProvider = oracleFormattingProvider;
class oracleDocumentFormattingProvider extends oracleFormattingProvider {
    provideDocumentFormattingEdits(document, options, token) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.populateFormatOptions(options);
            let requestParams = new formattingModels_1.FormatTextRequestParam(document.uri.toString(), this.formatConfiguration, formattingModels_1.FormatType.FormatDocument);
            requestParams.selection = {
                startLine: 0,
                startColumn: 0,
                endLine: document.lineCount - 1,
                endColumn: document.lineAt(document.lineCount - 1).range.end.character
            };
            DocumentConnectionInformation_1.fileLogger.info("Sending format document request");
            yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(formattingModels_1.FormatTextRequest.type, requestParams)
                .then(result => {
                if (result) {
                    if (result.formattedText) {
                        let textRange = new vscode_1.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end);
                        resolve([new vscode_1.TextEdit(textRange, result.formattedText)]);
                    }
                    else
                        reject();
                    DocumentConnectionInformation_1.fileLogger.info(result.resultMessage);
                    return;
                }
            }, error => {
                DocumentConnectionInformation_1.fileLogger.error(error);
                reject();
            });
            reject();
        }));
    }
}
exports.oracleDocumentFormattingProvider = oracleDocumentFormattingProvider;
class oracleRangeFormattingProvider extends oracleFormattingProvider {
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.populateFormatOptions(options);
            let requestParams = new formattingModels_1.FormatTextRequestParam(document.uri.toString(), this.formatConfiguration, formattingModels_1.FormatType.FormatRange);
            requestParams.text = document.getText(range);
            requestParams.selection = {
                startLine: 0,
                startColumn: 0,
                endLine: document.lineCount - 1,
                endColumn: document.lineAt(document.lineCount - 1).range.end.character
            };
            DocumentConnectionInformation_1.fileLogger.info("Sending Format selection request");
            yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(formattingModels_1.FormatTextRequest.type, requestParams)
                .then(result => {
                if (result) {
                    if (result.formattedText)
                        resolve([new vscode_1.TextEdit(range, result.formattedText)]);
                    else
                        reject();
                    DocumentConnectionInformation_1.fileLogger.info(result.resultMessage);
                }
            }, error => {
                DocumentConnectionInformation_1.fileLogger.error(error);
                reject();
            });
            reject();
        }));
    }
}
exports.oracleRangeFormattingProvider = oracleRangeFormattingProvider;
class oracleTypeFormattingProvider extends oracleFormattingProvider {
    provideOnTypeFormattingEdits(document, position, ch, options, token) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.populateFormatOptions(options);
            let requestParams = new formattingModels_1.FormatTextRequestParam(document.uri.toString(), this.formatConfiguration, formattingModels_1.FormatType.FormatOnType);
            requestParams.selection = {
                startLine: position.line, startColumn: position.character - 1,
                endLine: position.line, endColumn: position.character - 1
            };
            requestParams.triggerChar = ch;
            DocumentConnectionInformation_1.fileLogger.info("Sending Format on Type request");
            yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(formattingModels_1.FormatTextRequest.type, requestParams)
                .then(result => {
                if (result) {
                    if (result.formattedText && result.replacementRange) {
                        let start = new vscode_1.Position(result.replacementRange.startLine, result.replacementRange.startColumn);
                        let end = new vscode_1.Position(result.replacementRange.endLine, result.replacementRange.endColumn);
                        let textRange = new vscode_1.Range(start, end);
                        resolve([new vscode_1.TextEdit(textRange, result.formattedText)]);
                    }
                    else
                        reject();
                    DocumentConnectionInformation_1.fileLogger.info(result.resultMessage);
                    return;
                }
            }, error => {
                DocumentConnectionInformation_1.fileLogger.error(error);
                reject();
            });
            reject();
        }));
    }
}
exports.oracleTypeFormattingProvider = oracleTypeFormattingProvider;
