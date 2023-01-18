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
exports.OracleVSCodeConnector = void 0;
const vscode_1 = require("vscode");
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const localizedConstants_2 = require("../constants/localizedConstants");
const helper = require("./../utilities/helper");
const logger_1 = require("./logger");
const fileLogger = logger_1.FileStreamLogger.Instance;
class OracleVSCodeConnector {
    constructor(varContext) {
        this.varContext = varContext;
    }
    get onDidChangeConfiguration() {
        return vscode.workspace.onDidChangeConfiguration;
    }
    get language() {
        return vscode.env.language;
    }
    get isActiveOracleFile() {
        fileLogger.info("Checking if the active text editor is associated with Oracle extension");
        let isOracleFile = false;
        const activeEditor = this.activeTextEditor;
        if (activeEditor) {
            if (activeEditor.document.languageId === constants_1.Constants.oracleLanguageID) {
                isOracleFile = true;
            }
        }
        return isOracleFile;
    }
    get ExtensionContext() {
        return this.varContext;
    }
    get onDidChangeActiveTextEditor() {
        return vscode.window.onDidChangeActiveTextEditor;
    }
    get onWillSaveTextDocument() {
        return vscode.workspace.onWillSaveTextDocument;
    }
    get onDidCloseTextDocument() {
        return vscode.workspace.onDidCloseTextDocument;
    }
    get onDidChangeVisibleTextEditors() {
        return vscode.window.onDidChangeVisibleTextEditors;
    }
    get onDidChangeTextDocument() {
        return vscode.workspace.onDidChangeTextDocument;
    }
    get activeTextEditorUri() {
        if (typeof vscode.window.activeTextEditor !== "undefined" &&
            typeof vscode.window.activeTextEditor.document !== "undefined") {
            return helper.convertURIToString(vscode.window.activeTextEditor.document.uri);
        }
        return undefined;
    }
    get onDidOpenTextDocument() {
        return vscode.workspace.onDidOpenTextDocument;
    }
    get onDidSaveTextDocument() {
        return vscode.workspace.onDidSaveTextDocument;
    }
    get visibleEditors() {
        return vscode.window.visibleTextEditors;
    }
    get activeTextEditor() {
        return vscode.window.activeTextEditor;
    }
    findTextEditor(scriptPathWithProtocol) {
        return this.visibleEditors.find((visibleEditor) => helper.convertURIToString(visibleEditor.document.uri) === scriptPathWithProtocol);
    }
    closeDocument(scriptPathWithProtocol) {
        const editor = this.visibleEditors.find((visibleEditor) => helper.convertURIToString(visibleEditor.document.uri) === scriptPathWithProtocol);
        fileLogger.info("Closing Document " + editor.document.uri);
        if (editor) {
            editor.hide();
        }
        fileLogger.info("Closed Document " + editor.document.uri);
    }
    getActiveDocumentSelectedText() {
        var selectedText = "";
        if (vscode.window && vscode.window.activeTextEditor && vscode.window.activeTextEditor.document)
            selectedText = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);
        return selectedText;
    }
    getActiveDocumentSelection() {
        let selection;
        const startLine = vscode.window.activeTextEditor.selection.start.line;
        const startColumn = vscode.window.activeTextEditor.selection.start.character;
        const endLine = vscode.window.activeTextEditor.selection.end.line;
        const endColumn = vscode.window.activeTextEditor.selection.end.character;
        selection = {
            startLine,
            startColumn,
            endLine,
            endColumn,
        };
        return selection;
    }
    getConfiguration(extensionName, resource) {
        fileLogger.info("Getting configuration from workspace");
        if (typeof resource === "string") {
            try {
                resource = this.parseUri(resource);
            }
            catch (e) {
                resource = undefined;
            }
        }
        return vscode.workspace.getConfiguration(extensionName, resource);
    }
    registerCommand(command, handler, thisArg) {
        const disposable = vscode.commands.registerCommand(command, handler, thisArg);
        this.varContext.subscriptions.push(disposable);
    }
    registerCommandWithParam(command, handler, thisArg) {
        const disposable = vscode.commands.registerCommand(command, handler, thisArg);
        this.varContext.subscriptions.push(disposable);
    }
    registerTextDocumentContentProvider(providerName, provider) {
        const disposable = vscode.workspace.registerTextDocumentContentProvider(providerName, provider);
        this.varContext.subscriptions.push(disposable);
    }
    showErrorMessage(msg, ...items) {
        let msgToShow = msg;
        let msgToLog = msg;
        if (localizedConstants_1.default.hasOwnProperty(msg) && localizedConstants_1.default[msg]) {
            msgToShow = localizedConstants_1.default[msg];
            if (localizedConstants_2.englishConstants.hasOwnProperty(msg) && localizedConstants_2.englishConstants[msg]) {
                msgToLog = localizedConstants_2.englishConstants[msg];
            }
        }
        fileLogger.error(msgToLog);
        return vscode.window.showErrorMessage(msgToShow, ...items);
    }
    executeCommand(command, ...rest) {
        fileLogger.info("executing a vscode command " + command);
        return vscode.commands.executeCommand(command, ...rest);
    }
    openTextDocument(uri) {
        return vscode.workspace.openTextDocument(uri);
    }
    openOracleUntitiledDocument(content = "") {
        return vscode.workspace.openTextDocument({ language: constants_1.Constants.oracleLanguageID, content });
    }
    range(start, end) {
        return new vscode.Range(start, end);
    }
    position(line, character) {
        return new vscode.Position(line, character);
    }
    selection(start, end) {
        return new vscode.Selection(start, end);
    }
    showInformationMessage(message, ...items) {
        return vscode.window.showInformationMessage(message, ...items);
    }
    showQuickPick(items, options) {
        return vscode.window.showQuickPick(items, options);
    }
    showSaveDialog(options) {
        return vscode.window.showSaveDialog(options);
    }
    showTextDocument(document, column, preserveFocus) {
        return vscode.window.showTextDocument(document, { viewColumn: column, preserveFocus, preview: false });
    }
    showWarningMessage(msg) {
        let msgToShow = msg;
        let msgToLog = msg;
        if (localizedConstants_1.default.hasOwnProperty(msg) && localizedConstants_1.default[msg]) {
            msgToShow = localizedConstants_1.default[msg];
            if (localizedConstants_2.englishConstants.hasOwnProperty(msg) && localizedConstants_2.englishConstants[msg]) {
                msgToLog = localizedConstants_2.englishConstants[msg];
            }
        }
        fileLogger.warn(msgToLog);
        return vscode.window.showWarningMessage(msgToShow);
    }
    uriFile(path) {
        return vscode.Uri.file(path);
    }
    uriParse(value) {
        return vscode.Uri.parse(value);
    }
    parseUri(uri) {
        return vscode.Uri.parse(uri);
    }
    chkIfDocumentIsAssociatedWithOracle(uri) {
        const docArray = vscode.workspace.textDocuments.filter((doc) => doc.uri.toString() === uri);
        if (docArray.length === 1) {
            return docArray[0].languageId === constants_1.Constants.oracleLanguageID;
        }
        else {
            return false;
        }
    }
    isActiveDocumentEmpty() {
        return (this.activeTextEditor.document.getText().length < 1);
    }
    showNotification(message, timeout = 2000) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.window.withProgress({ location: vscode_1.ProgressLocation.Notification, title: message }, (progress) => {
                progress.report({ increment: 0 });
                var p = new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, timeout);
                });
                return p;
            });
        });
    }
    setContext(context, contextValue) {
        vscode.commands.executeCommand("setContext", context, contextValue);
    }
}
exports.OracleVSCodeConnector = OracleVSCodeConnector;
