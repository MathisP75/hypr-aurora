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
exports.oracleSignatureHelpProvider = exports.oracleSignatureHelpDataProvider = exports.oracleAutoCompletionDataProvider = void 0;
const vscode = require("vscode");
const oracleLanguageServerClient_1 = require("./oracleLanguageServerClient");
const LangService = require("../models/intellisenseRequests");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
const helper = require("./../utilities/helper");
const logger = require("./../infrastructure/logger");
const oracleCompletionItemProvider_1 = require("./oracleCompletionItemProvider");
const editorUtils_1 = require("../explorer/editors/editorUtils");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const iLanguageTokenHandler_1 = require("./iLanguageTokenHandler");
const fileLogger = logger.FileStreamLogger.Instance;
class oracleAutoCompletionDataProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        this.oracleIntelliSenseDataMgr = null;
        this.languageServerClient = undefined;
        this.processOracleStatement = null;
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.oracleIntelliSenseDataMgr = oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance;
        this.languageServerClient = oracleLanguageServerClient_1.OracleLanguageServerClient.instance;
    }
    getConnecteduserAndDocID(document) {
        var documentId = null;
        var connectedUser = null;
        var fileURI = null;
        var connectedtoDatabase = null;
        let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(document);
        if (explorerFile) {
            let params = editorUtils_1.editorUtils.getQueryParameters(document.uri);
            if (params) {
                documentId = params.connectionUri;
                connectedUser = params.schemaname;
            }
            connectedtoDatabase = 'Y';
        }
        else {
            documentId = this.vscodeConnector.activeTextEditorUri;
            var documentConnectionInfo = this.connectionCommandHandler.getSavedConnectionProperties(documentId);
            if (documentConnectionInfo != undefined) {
                if (this.oracleIntelliSenseDataMgr.intelliSenseData.has(documentId)) {
                    var intelliSenseInfo = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentId);
                    connectedUser = intelliSenseInfo.ConnectedUser;
                }
                connectedtoDatabase = 'Y';
            }
            else {
                connectedtoDatabase = 'N';
            }
        }
        fileURI = this.vscodeConnector.activeTextEditorUri;
        return [documentId, connectedUser, fileURI, connectedtoDatabase];
    }
}
exports.oracleAutoCompletionDataProvider = oracleAutoCompletionDataProvider;
class oracleSignatureHelpDataProvider extends oracleAutoCompletionDataProvider {
    handleThreePartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            var signatureHelp = null;
            let completionList = null;
            var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                completionList = yield allobjectList.GetObjectsFromThreeTokens(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Signature);
                if (completionList != null && completionList.length > 0) {
                    signatureHelp = this.GetVSCodeSignatureList(completionList[0], documentToken.tokenInfo.commaCount, documentToken.context);
                }
            }
            return signatureHelp;
        });
    }
    handleTwoPartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let signatureHelp = null;
            let completionList = null;
            var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                completionList = yield allobjectList.GetObjectsFromTwoTokens(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Signature);
            }
            if (completionList != null && completionList.length == 0) {
                var publicSynonyms = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).PublicSynonyms;
                if (publicSynonyms != null && publicSynonyms.PublicSynonym.IntelliSenseDict.size > 0) {
                    completionList = yield publicSynonyms.GetObjectsFromTwoToken(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Signature);
                }
            }
            if (completionList != null && completionList.length > 0) {
                signatureHelp = this.GetVSCodeSignatureList(completionList[0], documentToken.tokenInfo.commaCount, documentToken.context);
            }
            return signatureHelp;
        });
    }
    handleOnePartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            var signatureHelp = null;
            let completionList = new Array();
            var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                completionList = yield allobjectList.GetObjectsFromOneToken(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Signature, []);
            }
            if (completionList.length == 0) {
                var publicSynonyms = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).PublicSynonyms;
                if (publicSynonyms != null && publicSynonyms.PublicSynonym.IntelliSenseDict.size > 0) {
                    completionList = yield publicSynonyms.GetObjectsFromOneToken(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Signature);
                }
            }
            if (completionList.length == 0) {
                var sqlFunctions = oracleCompletionItemProvider_1.OracleStaticSQLFunction.getStaticSQLFunctionCompletionList(this.oracleIntelliSenseDataMgr.intelliSenseObjectNameCase);
                if (sqlFunctions.has(documentToken.tokenInfo.dbFormattedToken1)) {
                    completionList.push(sqlFunctions.get(documentToken.tokenInfo.dbFormattedToken1));
                }
            }
            if (completionList.length > 0) {
                signatureHelp = this.GetVSCodeSignatureList(completionList[0], documentToken.tokenInfo.commaCount, documentToken.context);
            }
            return signatureHelp;
        });
    }
    getMethodtoSelect(sortedList, activeSignatureHelp, commaCount) {
        var idx = 0;
        var activeSignature = 0;
        if (activeSignatureHelp == null || activeSignatureHelp == undefined) {
            idx = 0;
        }
        else {
            activeSignature = activeSignatureHelp.activeSignature;
            if (activeSignature > sortedList.length - 1) {
                idx = 0;
            }
            else {
                idx = activeSignature;
            }
        }
        var methodtoSelect = idx;
        var found = false;
        for (; idx < sortedList.length; idx++) {
            if (sortedList[idx].parameters.length - 1 >= commaCount) {
                methodtoSelect = idx;
                found = true;
                break;
            }
        }
        if (!found) {
            if (activeSignature > sortedList.length - 1) {
                methodtoSelect = sortedList.length - 1;
            }
        }
        return methodtoSelect;
    }
    GetVSCodeSignatureList(completionItem, commaCount, context) {
        var signatureHelp = new vscode.SignatureHelp();
        if (completionItem.methodArgumentList != null) {
            var sortedList = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.sortListOnParameterCount(completionItem.methodArgumentList);
            for (var idx = 0; idx < sortedList.length; idx++) {
                var paramObjectList = sortedList[idx][1];
                const sigInfo = new vscode.SignatureInformation('');
                var parameterInformationList = new Array();
                var { label, isFunction } = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getMethodSignatureLabel(paramObjectList, completionItem.name, parameterInformationList, this.oracleIntelliSenseDataMgr.intelliSenseKeywordCase);
                sigInfo.label = label;
                sigInfo.parameters = parameterInformationList;
                signatureHelp.signatures.push(sigInfo);
            }
            if (signatureHelp != null && signatureHelp.activeParameter != null) {
                signatureHelp.activeParameter = commaCount;
            }
            signatureHelp.activeSignature = this.getMethodtoSelect(signatureHelp.signatures, context.activeSignatureHelp, commaCount);
            return signatureHelp;
        }
        return signatureHelp;
    }
    handleLanguageFeatureRequest(document, position, token, context) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let documentToken = new iLanguageTokenHandler_1.DocumentToken();
            try {
                if (this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                    var docAndUserID = this.getConnecteduserAndDocID(document);
                    documentToken.documentId = docAndUserID[0];
                    documentToken.connectedSchema = docAndUserID[1];
                    documentToken.context = context;
                    var fileURI = docAndUserID[2];
                    if (documentToken.connectedSchema != null && documentToken.connectedSchema.length > 0) {
                        const executeQueryRequest = new scriptExecutionModels_1.ScriptExecuteParams();
                        executeQueryRequest.ownerUri = this.vscodeConnector.activeTextEditorUri;
                        executeQueryRequest.selection = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getSelection(position);
                        yield this.languageServerClient.sendRequest(intellisenseRequests_1.IntelliSenseTokenRequest.type, new intellisenseRequests_1.TokenRequestParameter(position.line, position.character, fileURI, LangService.TokenSource.MethodParameter, executeQueryRequest, false)).
                            then((result) => __awaiter(this, void 0, void 0, function* () {
                            documentToken.tokenInfo = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getTokenCountAndTokenInfo(result);
                            var results;
                            if (this.oracleIntelliSenseDataMgr.intelliSenseData.has(documentToken.documentId)) {
                                switch (documentToken.tokenInfo.count) {
                                    case 1:
                                        {
                                            results = yield this.handleOnePartIdentifierResolution(documentToken);
                                        }
                                        break;
                                    case 2:
                                        {
                                            results = yield this.handleTwoPartIdentifierResolution(documentToken);
                                        }
                                        break;
                                    case 3:
                                        {
                                            results = yield this.handleThreePartIdentifierResolution(documentToken);
                                        }
                                        break;
                                    default:
                                        if (documentToken.tokenInfo.tokenTerminator == intellisenseRequests_1.TokenTerminator.EndForSignatureProvider) {
                                            results = null;
                                        }
                                        else if (documentToken.tokenInfo.tokenTerminator == intellisenseRequests_1.TokenTerminator.NewLine && context != null && context != undefined) {
                                            results = context.activeSignatureHelp;
                                        }
                                        break;
                                }
                                resolve(results);
                            }
                        }), error => {
                            helper.logErroAfterValidating(error);
                            resolve(null);
                        });
                    }
                }
            }
            catch (error) {
                oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, error);
                resolve(null);
            }
        }));
    }
}
exports.oracleSignatureHelpDataProvider = oracleSignatureHelpDataProvider;
class oracleSignatureHelpProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        fileLogger.info("Initializing oracleSignatureHelpProvider ");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
    }
    provideSignatureHelp(document, position, token, context) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var signatureHelp = new oracleSignatureHelpDataProvider(this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager);
            yield signatureHelp.handleLanguageFeatureRequest(document, position, token, context).
                then(data => {
                resolve(data);
            }).catch(error => {
                helper.logErroAfterValidating(error);
                resolve(null);
            });
        }));
    }
}
exports.oracleSignatureHelpProvider = oracleSignatureHelpProvider;
