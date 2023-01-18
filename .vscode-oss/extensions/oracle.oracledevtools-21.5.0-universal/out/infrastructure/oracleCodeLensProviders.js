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
exports.oracleCodeLensDataProvider = exports.oracleCodeLensReferenceProvider = void 0;
const localizedConstants_1 = require("../constants/localizedConstants");
const vscode_1 = require("vscode");
const oracleGotoProviders_1 = require("./oracleGotoProviders");
const DocumentConnectionInformation_1 = require("../connectionManagement/DocumentConnectionInformation");
const codeNavigationRequests_1 = require("../models/codeNavigationRequests");
const oracleSignatureHelpProvider_1 = require("./oracleSignatureHelpProvider");
const editorUtils_1 = require("../explorer/editors/editorUtils");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
const oracleCompletionItemProvider_1 = require("./oracleCompletionItemProvider");
const iLanguageTokenHandler_1 = require("./iLanguageTokenHandler");
class ReferenceLens extends vscode_1.CodeLens {
    constructor(doc, location, range) {
        super(range);
        this.document = doc;
        this.location = location;
    }
}
class LensToken {
    constructor(range, item) {
        this.range = range;
        this.item = item;
    }
}
class oracleCodeLensReferenceProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        this._onDidChangeCodeLenses = new vscode_1.EventEmitter();
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        this.codeEditorProvider = undefined;
        this.onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;
        DocumentConnectionInformation_1.fileLogger.info("Codelens: Initializing oracleCodelensProvider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.codeEditorProvider = codeEditorProvider;
        DocumentConnectionInformation_1.fileLogger.info("Codelens: oracleCodelensProvider initialized.");
    }
    provideCodeLenses(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            var codeLensDataProvider = new oracleCodeLensDataProvider(this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager, this.codeEditorProvider);
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let codeLens = [];
                let values = editorUtils_1.editorUtils.isExplorerFile(document);
                if (!values.explorerFile) {
                    DocumentConnectionInformation_1.fileLogger.error(localizedConstants_1.default.notExplorerFile);
                    reject(localizedConstants_1.default.notExplorerFile);
                    return;
                }
                try {
                    DocumentConnectionInformation_1.fileLogger.info("Codelens: Sending codelens reference request");
                    yield codeLensDataProvider.handleTokenRequest(document, token).then((response) => __awaiter(this, void 0, void 0, function* () {
                        if (response != null && response.length > 0) {
                            Promise.all(response.map((symbol) => __awaiter(this, void 0, void 0, function* () {
                                try {
                                    if (symbol.item.objectType === intellisenseRequests_1.SchemaObjectType.Trigger) {
                                        let lens = new ReferenceLens(document, [], symbol.range);
                                        codeLens.push(lens);
                                    }
                                    else {
                                        let location = yield codeLensDataProvider.handleLocationRequest(document, symbol, token);
                                        let lens = new ReferenceLens(document, location, symbol.range);
                                        codeLens.push(lens);
                                    }
                                }
                                catch (e) {
                                    DocumentConnectionInformation_1.fileLogger.error(e);
                                }
                            }))).then(() => {
                                DocumentConnectionInformation_1.fileLogger.info("Codelens: resolving lens");
                                resolve(codeLens);
                            }).catch((e) => {
                                DocumentConnectionInformation_1.fileLogger.error(e);
                                reject(e);
                                return;
                            });
                        }
                        else {
                            DocumentConnectionInformation_1.fileLogger.error(localizedConstants_1.default.locationNotFound);
                            reject(localizedConstants_1.default.locationNotFound);
                            return;
                        }
                    }));
                }
                catch (e) {
                    DocumentConnectionInformation_1.fileLogger.error(e);
                    reject(e);
                    return;
                }
            }));
        });
    }
    resolveCodeLens(codeLens, token) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let lens = codeLens;
                let length = (lens.location && lens.location.length) ? lens.location.length : 0;
                let title = length > 1 ? `${length} References` : `${length} Reference`;
                lens.command = {
                    title: title,
                    tooltip: "References",
                    command: length > 0 ? "editor.action.showReferences" : "",
                    arguments: [lens.document.uri, lens.range.start, lens.location]
                };
                resolve(lens);
            }
            catch (e) {
                DocumentConnectionInformation_1.fileLogger.error(e);
                reject(e);
                return;
            }
        }));
    }
}
exports.oracleCodeLensReferenceProvider = oracleCodeLensReferenceProvider;
class oracleCodeLensDataProvider extends oracleSignatureHelpProvider_1.oracleAutoCompletionDataProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        super(vscodeConnector, connectionCommandHandler, dataExplorerManager);
        this.codeEditorProvider = undefined;
        this.codeEditorProvider = codeEditorProvider;
    }
    handleTokenRequest(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let request = new codeNavigationRequests_1.CodeTokenRequestParam();
                let params = editorUtils_1.editorUtils.getQueryParameters(document.uri);
                if (params) {
                    request.ownerUri = Boolean(document.uri.query) ? params.connectionUri : document.uri.toString();
                    request.command = document.getText();
                    try {
                        yield this.languageServerClient.sendRequest(codeNavigationRequests_1.CodeTokenRequest.Request, request).then((response) => {
                            let tokenList = [];
                            if (response != null && response.length > 0) {
                                response.forEach((item) => {
                                    if (item) {
                                        let start = new vscode_1.Position(item.line, item.begin);
                                        let end = new vscode_1.Position(item.line, item.end);
                                        let completionItem = new oracleCompletionItemProvider_1.OracleCompletionItem();
                                        completionItem.name = params.objectname;
                                        completionItem.objectType = item.objectType;
                                        completionItem.owner = params.schemaname;
                                        tokenList.push(new LensToken(new vscode_1.Range(start, end), completionItem));
                                    }
                                });
                                resolve(tokenList);
                            }
                            else {
                                reject('Not a valid script');
                                return;
                            }
                        });
                    }
                    catch (e) {
                        DocumentConnectionInformation_1.fileLogger.error(e);
                        reject('Not a valid object');
                        return;
                    }
                }
                else
                    reject();
            }));
        });
    }
    handleLocationRequest(document, symbol, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let locationProvider = new oracleGotoProviders_1.LocationProvider(this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager, this.codeEditorProvider);
                let locationList = [];
                try {
                    if (locationProvider.isValidObjectForReference(symbol.item)) {
                        let docAndUserID = this.getConnecteduserAndDocID(document);
                        let documentToken = new iLanguageTokenHandler_1.DocumentToken();
                        documentToken.tokenPosition = new oracleCompletionItemProvider_1.TokenPositionHelper(null, symbol.range.start, document);
                        documentToken.documentId = docAndUserID[0];
                        documentToken.connectedSchema = docAndUserID[1];
                        locationList = yield locationProvider.getReferenceDetails(documentToken, document.uri, symbol.item);
                        resolve(locationList);
                    }
                }
                catch (e) {
                    DocumentConnectionInformation_1.fileLogger.error(e);
                    reject(e);
                    return;
                }
            }));
        });
    }
}
exports.oracleCodeLensDataProvider = oracleCodeLensDataProvider;
