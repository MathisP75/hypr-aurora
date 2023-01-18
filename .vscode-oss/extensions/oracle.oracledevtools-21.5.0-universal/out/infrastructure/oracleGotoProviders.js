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
exports.oracleReferenceProvider = exports.TypeLocationProvider = exports.LocationProvider = exports.oracleTypeDefinitionProvider = exports.oracleImplementationProvider = exports.oracleDefinitionProvider = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
const oracleCompletionItemProvider_1 = require("./oracleCompletionItemProvider");
const oracleSignatureHelpProvider_1 = require("./oracleSignatureHelpProvider");
const helper = require("./../utilities/helper");
const logger = require("./../infrastructure/logger");
const iLanguageTokenHandler_1 = require("./iLanguageTokenHandler");
const editorUtils_1 = require("../explorer/editors/editorUtils");
const constants_1 = require("../constants/constants");
const dataExplorerRequests_1 = require("../explorer/dataExplorerRequests");
const utilities_1 = require("../explorer/utilities");
const connectionNode_1 = require("../explorer/nodes/connectionNode");
const localizedConstants_1 = require("../constants/localizedConstants");
const codeNavigationRequests_1 = require("../models/codeNavigationRequests");
const oracleLanguageFeaturesHelper_1 = require("./oracleLanguageFeaturesHelper");
const intellisenseModels_1 = require("../models/intellisenseModels");
const fileLogger = logger.FileStreamLogger.Instance;
class oracleDefinitionProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        this.codeEditorProvider = undefined;
        fileLogger.info("Initializing oracleDefinitionProvider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.codeEditorProvider = codeEditorProvider;
        fileLogger.info("oracleDefinitionProvider initialized.");
    }
    provideDefinition(document, position, token) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let locationProvider = new LocationProvider(this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager, this.codeEditorProvider);
            yield locationProvider.handleLanguageFeatureRequest(document, position, token, intellisenseRequests_1.IntelliSenseProviderType.Definition).
                then(data => {
                if (data)
                    resolve(data);
                else
                    reject();
            }).catch(error => {
                helper.logErroAfterValidating(error);
                reject();
            });
        }));
    }
}
exports.oracleDefinitionProvider = oracleDefinitionProvider;
class oracleImplementationProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        this.codeEditorProvider = undefined;
        fileLogger.info("Initializing oracleImplementationProvider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.codeEditorProvider = codeEditorProvider;
        fileLogger.info("oracleImplementationProvider initialized.");
    }
    provideImplementation(document, position, token) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let locationProvider = new LocationProvider(this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager, this.codeEditorProvider);
            yield locationProvider.handleLanguageFeatureRequest(document, position, token, intellisenseRequests_1.IntelliSenseProviderType.Implementation).
                then(data => {
                if (data)
                    resolve(data);
                else
                    reject();
            }).catch(error => {
                fileLogger.error(error);
                reject();
            });
        }));
    }
}
exports.oracleImplementationProvider = oracleImplementationProvider;
class oracleTypeDefinitionProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        this.codeEditorProvider = undefined;
        fileLogger.info("Initializing oracleTypeDefinitionProvider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.codeEditorProvider = codeEditorProvider;
        fileLogger.info("oracleTypeDefinitionProvider initialized.");
    }
    provideTypeDefinition(document, position, token) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let locationProvider = new TypeLocationProvider(this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager, this.codeEditorProvider);
            yield locationProvider.handleLanguageFeatureRequest(document, position, token, intellisenseRequests_1.IntelliSenseProviderType.TypeDefinition).
                then(data => {
                if (data)
                    resolve(data);
                else
                    reject();
            }).catch(error => {
                fileLogger.error(error);
                reject();
            });
        }));
    }
}
exports.oracleTypeDefinitionProvider = oracleTypeDefinitionProvider;
class LocationProvider extends oracleSignatureHelpProvider_1.oracleAutoCompletionDataProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        super(vscodeConnector, connectionCommandHandler, dataExplorerManager);
        this.codeEditorProvider = codeEditorProvider;
    }
    handleLanguageFeatureRequest(document, position, token, context) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let documentToken = new iLanguageTokenHandler_1.DocumentToken();
                try {
                    this.locationContext = context;
                    documentToken.tokenPosition = new oracleCompletionItemProvider_1.TokenPositionHelper(null, position, document);
                    if (this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                        let docAndUserID = this.getConnecteduserAndDocID(document);
                        documentToken.documentId = docAndUserID[0];
                        documentToken.connectedSchema = docAndUserID[1];
                        let request = new intellisenseRequests_1.StatementContextRequestParams();
                        request.fileUri = document.uri.toString();
                        request.line = position.line;
                        let currentSelection = vscode.window.activeTextEditor.selection;
                        if (!currentSelection.start.isEqual(currentSelection.end) &&
                            currentSelection.end.isEqual(position))
                            request.column = position.character - 1;
                        else
                            request.column = position.character;
                        request.providerType = this.locationContext;
                        fileLogger.info("Sending StatementContextRequest");
                        yield this.languageServerClient.sendRequest(intellisenseRequests_1.StatementContextRequest.type, request).then((response) => __awaiter(this, void 0, void 0, function* () {
                            if (!response.isIdentifier) {
                                reject("Token is not an identifier");
                                return;
                            }
                            let location = null;
                            fileLogger.info("Received StatementContextResponse for token");
                            if (response.scopeItems && response.scopeItems.matchFound && response.scopeItems.matchedObjects.length > 0) {
                                if (response.scopeItems.matchedObjects[0].parsedObjectType === oracleLanguageFeaturesHelper_1.ParsedObjectType.CodeBlockItem) {
                                    let selection, range;
                                    let locations = [];
                                    response.scopeItems.matchedObjects.forEach(item => {
                                        selection = item.range;
                                        if (selection.endLine >= document.lineCount)
                                            selection.endLine = document.lineCount - 1;
                                        range = new vscode_1.Range(new vscode_1.Position(selection.startLine, selection.startColumn), new vscode_1.Position(selection.endLine, document.lineAt(selection.endLine).range.end.character));
                                        if (range.contains(position))
                                            locations.push(new vscode_1.Location(document.uri, new vscode_1.Position(selection.startLine, selection.startColumn)));
                                        else
                                            locations.push(new vscode_1.Location(document.uri, range));
                                    });
                                    if (locations.length > 0)
                                        resolve(locations);
                                    else
                                        reject();
                                    return;
                                }
                                else {
                                    if (response.scopeItems.matchedObjects[0].isExpression) {
                                        reject();
                                        return;
                                    }
                                    else {
                                        response.tokenInfo.token2 = response.scopeItems.matchedObjects[0].aliasedSymbol;
                                        response.tokenInfo.dbFormattedToken2 = response.scopeItems.matchedObjects[0].dbFormattedAliasedSymbol;
                                    }
                                }
                            }
                            if (documentToken.connectedSchema != null && documentToken.connectedSchema.length > 0) {
                                if (this.oracleIntelliSenseDataMgr.intelliSenseData.has(documentToken.documentId)) {
                                    documentToken.tokenInfo = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getTokenCountAndTokenInfo(response.tokenInfo);
                                    documentToken.tokenPosition.tokenInfo = documentToken.tokenInfo;
                                    documentToken.tokenPosition.scopeItems = response.scopeItems;
                                    switch (documentToken.tokenInfo.count) {
                                        case 1:
                                            location = yield this.handleOnePartIdentifierResolution(documentToken);
                                            break;
                                        case 2:
                                            location = yield this.handleTwoPartIdentifierResolution(documentToken);
                                            break;
                                        case 3:
                                            location = yield this.handleThreePartIdentifierResolution(documentToken);
                                            break;
                                    }
                                }
                            }
                            if (location !== null) {
                                resolve(location);
                                return;
                            }
                        }), error => {
                            helper.logErroAfterValidating(error);
                            reject(error);
                        });
                    }
                    reject("Location not found");
                }
                catch (err) {
                    oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, err);
                    reject(err);
                }
            }));
        });
    }
    handleOnePartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let completionList = new Array();
            let allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                completionList = yield allobjectList.GetObjectsFromOneToken(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Definition, []);
            }
            if (completionList.length > 0) {
                return yield this.getObjectLocation(completionList[0], documentToken);
            }
            let publicSynonyms = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).PublicSynonyms;
            if (publicSynonyms != null && publicSynonyms.PublicSynonym.IntelliSenseDict.size > 0) {
                completionList = yield publicSynonyms.GetObjectsFromOneToken(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Definition);
            }
            if (completionList.length > 0) {
                return yield this.getObjectLocation(completionList[0], documentToken);
            }
            if (documentToken.tokenPosition.scopeItems && documentToken.tokenPosition.scopeItems.parentName) {
                if (documentToken.tokenPosition.scopeItems.schemaName) {
                    return yield this.handleThreePartIdentifierResolution(documentToken);
                }
                else {
                    return yield this.handleTwoPartIdentifierResolution(documentToken);
                }
            }
            return null;
        });
    }
    handleTwoPartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let completionList = null;
            let allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                completionList = yield allobjectList.GetObjectsFromTwoTokens(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Definition);
            }
            if (completionList != null && completionList.length > 0) {
                return yield this.getObjectLocation(completionList[0], documentToken);
            }
            let publicSynonyms = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).PublicSynonyms;
            if (publicSynonyms != null && publicSynonyms.PublicSynonym.IntelliSenseDict.size > 0) {
                completionList = yield publicSynonyms.GetObjectsFromTwoToken(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Definition);
            }
            if (completionList != null && completionList.length > 0) {
                return yield this.getObjectLocation(completionList[0], documentToken);
            }
            return null;
        });
    }
    handleThreePartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let completionList = null;
            var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                completionList = yield allobjectList.GetObjectsFromThreeTokens(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Definition);
                if (completionList != null && completionList.length > 0) {
                    return yield this.getObjectLocation(completionList[0], documentToken);
                }
            }
            return null;
        });
    }
    getObjectLocation(item, documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                fileLogger.info("Getting object location");
                try {
                    let docConnectionInfo = this.connectionCommandHandler.getSavedConnectionProperties(documentToken.documentId);
                    let connectionName = docConnectionInfo.connectionAttributes.name;
                    let connectionNode = this.dataExplorerManager.getConnectionNodeFromConnectionName(connectionName);
                    let location = null, getSource = true, saveFile = true;
                    let objectUri = null, sourceText, createdDateTime, modifiedDateTime;
                    if (docConnectionInfo) {
                        let ddexObjectType;
                        switch (item.objectType) {
                            case intellisenseRequests_1.SchemaObjectType.Table:
                                ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Table;
                                saveFile = false;
                                break;
                            case intellisenseRequests_1.SchemaObjectType.MaterializedView:
                                ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedView;
                                saveFile = false;
                                break;
                            case intellisenseRequests_1.SchemaObjectType.View:
                                ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_View;
                                saveFile = false;
                                break;
                            case intellisenseRequests_1.SchemaObjectType.Function:
                                ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Function;
                                break;
                            case intellisenseRequests_1.SchemaObjectType.StoredProcedure:
                                ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Procedure;
                                break;
                            case intellisenseRequests_1.SchemaObjectType.Package:
                                ddexObjectType = (this.locationContext === intellisenseRequests_1.IntelliSenseProviderType.Definition
                                    || this.locationContext === intellisenseRequests_1.IntelliSenseProviderType.References) ?
                                    dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package :
                                    dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody;
                                break;
                            case intellisenseRequests_1.SchemaObjectType.PackageBody:
                                ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody;
                                break;
                            case intellisenseRequests_1.SchemaObjectType.PackageMethod:
                                ddexObjectType = (this.locationContext === intellisenseRequests_1.IntelliSenseProviderType.Definition) ?
                                    dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package :
                                    dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody;
                                let objectName = oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(item.parentName);
                                [objectUri, ddexObjectType, createdDateTime, modifiedDateTime, sourceText] = yield this.getObjectSource(connectionNode, objectName, item.owner, ddexObjectType);
                                if (objectUri) {
                                    location = yield this.getLocationForPackageMethod(item, connectionNode, objectUri, ddexObjectType, documentToken.tokenPosition);
                                    if (location == null && ddexObjectType == dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody) {
                                        ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package;
                                        [objectUri, ddexObjectType, createdDateTime, modifiedDateTime, sourceText] =
                                            yield this.getObjectSource(connectionNode, objectName, item.owner, ddexObjectType);
                                        if (objectUri)
                                            location = yield this.getLocationForPackageMethod(item, connectionNode, objectUri, ddexObjectType, documentToken.tokenPosition);
                                    }
                                }
                                getSource = false;
                                break;
                            case intellisenseRequests_1.SchemaObjectType.PackageMember:
                                ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package;
                                let pkgName = oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(item.parentName);
                                [objectUri, ddexObjectType, createdDateTime, modifiedDateTime, sourceText] = yield this.getObjectSource(connectionNode, pkgName, item.owner, ddexObjectType);
                                if (objectUri) {
                                    location = yield this.getLocationForPackageMember(item, connectionNode, objectUri, documentToken.tokenPosition.tokenInfo.paramList);
                                }
                                getSource = false;
                                break;
                            case intellisenseRequests_1.SchemaObjectType.Synonym:
                                ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Synonym;
                                saveFile = false;
                                break;
                            case intellisenseRequests_1.SchemaObjectType.Trigger:
                                ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Trigger;
                                saveFile = false;
                                break;
                            default:
                                reject("Not a valid/supported object");
                                return;
                        }
                        if (getSource) {
                            [objectUri, ddexObjectType, createdDateTime, modifiedDateTime, sourceText] = yield this.getObjectSource(connectionNode, item.name, item.owner, ddexObjectType);
                            if (objectUri && createdDateTime)
                                location = new vscode_1.Location(objectUri, new vscode_1.Position(0, 0));
                        }
                        if (location !== null && sourceText) {
                            let file = this.codeEditorProvider.openfiles.get(objectUri.toString());
                            this.codeEditorProvider.prepareFile(file, connectionNode.connectionURI, objectUri, createdDateTime, modifiedDateTime, sourceText, true, saveFile);
                            resolve(location);
                            return;
                        }
                    }
                }
                catch (error) {
                    reject(error);
                }
                reject('Location not found');
            }));
        });
    }
    getObjectSource(connectionNode, objectName, owner, ddexObjectType) {
        return __awaiter(this, void 0, void 0, function* () {
            let objectUri = null;
            fileLogger.info("Getting object uri");
            try {
                if (connectionNode && connectionNode.status !== connectionNode_1.ConnectionStatus.Connected &&
                    connectionNode.status !== connectionNode_1.ConnectionStatus.Connecting) {
                    yield this.dataExplorerManager.onConnectionConnect(connectionNode, true);
                }
                if (connectionNode && connectionNode.status !== connectionNode_1.ConnectionStatus.Connected) {
                    return null;
                }
                const [sourceText, createdDateTime, modifiedDateTime, requestResponse, connOpen] = yield utilities_1.ExplorerUtilities.getCodeObjectSource(connectionNode.connectionURI, ddexObjectType, objectName, owner, false);
                if (!connOpen && connectionNode && connectionNode.status !== connectionNode_1.ConnectionStatus.Connected) {
                    fileLogger.error(localizedConstants_1.default.notConnectedToDatabase);
                    return null;
                }
                if (requestResponse.messageType === dataExplorerRequests_1.DataExplorerFetchMessageType.Error || !sourceText) {
                    if (ddexObjectType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody) {
                        return yield this.getObjectSource(connectionNode, objectName, owner, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package);
                    }
                    else {
                        fileLogger.error(localizedConstants_1.default.invalidObjectMessage);
                        return null;
                    }
                }
                let dbObjectTye = editorUtils_1.editorUtils.getObjectTypeFromDdexType(ddexObjectType);
                objectUri = editorUtils_1.editorUtils.getEditorUri(constants_1.Constants.oracleScheme, connectionNode.connectionProperties.name, dbObjectTye, owner, objectName, connectionNode.connectionURI, ddexObjectType);
                return [objectUri, ddexObjectType, createdDateTime, modifiedDateTime, sourceText];
            }
            catch (err) {
                fileLogger.error(err);
            }
            return null;
        });
    }
    getLocationForPackageMember(item, connectionNode, objectUri, tokenParams) {
        return __awaiter(this, void 0, void 0, function* () {
            let requestParams = new codeNavigationRequests_1.CodeObjectSymbolsRequestParam();
            requestParams.connectedSchema = connectionNode.schemaName;
            requestParams.objectName = oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(item.parentName);
            requestParams.objectSchema = item.owner;
            requestParams.objectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package;
            requestParams.ownerUri = connectionNode.connectionURI;
            let locationList = [];
            try {
                let symbolList = yield this.languageServerClient.sendRequest(codeNavigationRequests_1.CodeObjectSymbolsRequest.type, requestParams);
                if (symbolList && symbolList.length > 1) {
                    let foundMember = false;
                    for (let i = 1; i < symbolList.length; ++i) {
                        switch (symbolList[i].localObjectType) {
                            case intellisenseModels_1.LocalSymbolType.Type:
                            case intellisenseModels_1.LocalSymbolType.Subtype:
                            case intellisenseModels_1.LocalSymbolType.Cursor:
                            case intellisenseModels_1.LocalSymbolType.Constant:
                            case intellisenseModels_1.LocalSymbolType.Variable:
                                if (symbolList[i].objectName === item.name)
                                    foundMember = true;
                                break;
                            case intellisenseModels_1.LocalSymbolType.Function:
                            case intellisenseModels_1.LocalSymbolType.Procedure:
                                if (symbolList[i].objectName === item.name) {
                                    if (oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.validateParsedParams(tokenParams, symbolList[i].symbolParams, symbolList[i].localObjectType === intellisenseModels_1.LocalSymbolType.Function))
                                        break;
                                    locationList.push(new vscode_1.Location(objectUri, new vscode_1.Range(new vscode_1.Position(symbolList[i].startLine, 0), new vscode_1.Position(symbolList[i].endLine, 0))));
                                }
                                break;
                        }
                        if (foundMember) {
                            locationList.push(new vscode_1.Location(objectUri, new vscode_1.Range(new vscode_1.Position(symbolList[i].startLine, 0), new vscode_1.Position(symbolList[i].endLine + 1, 0))));
                            break;
                        }
                    }
                }
            }
            catch (err) {
                fileLogger.error(err);
            }
            return locationList.length > 0 ? locationList : null;
        });
    }
    getLocationForPackageMethod(item, connectionNode, objectUri, ddexObjectType, tokenPostion) {
        return __awaiter(this, void 0, void 0, function* () {
            let requestParams = new codeNavigationRequests_1.CodeObjectSymbolsRequestParam();
            requestParams.connectedSchema = connectionNode.schemaName;
            requestParams.objectName = oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(item.parentName);
            requestParams.objectSchema = item.owner;
            requestParams.objectType = ddexObjectType;
            requestParams.ownerUri = connectionNode.connectionURI;
            try {
                let symbolList = yield this.languageServerClient.sendRequest(codeNavigationRequests_1.CodeObjectSymbolsRequest.type, requestParams);
                let sortedList = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.sortListOnParameterCount(item.methodArgumentList);
                let paramObjectList;
                let matchedList = [], unmatchedList = [];
                let paramCount = 0;
                if (sortedList.length === 1)
                    matchedList.push(sortedList[0][1]);
                else
                    for (let idx = 0; idx < sortedList.length; idx++) {
                        paramObjectList = sortedList[idx][1];
                        let isFunction = paramObjectList && paramObjectList.length > 0 &&
                            (paramObjectList[0].direction === 'return' || paramObjectList[0].direction === 'RETURN');
                        paramCount = isFunction ? paramObjectList.length - 1 : paramObjectList.length;
                        if (oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.validateParsedParams(tokenPostion.tokenInfo.paramList, paramObjectList, isFunction)) {
                            matchedList.push(paramObjectList);
                        }
                        else
                            unmatchedList.push(paramObjectList);
                    }
                matchedList = matchedList.length > 0 ? matchedList : unmatchedList;
                let locationList = [];
                if (symbolList && symbolList.length > 1) {
                    let foundMethod = false;
                    for (let i = 1; i < symbolList.length; ++i) {
                        switch (symbolList[i].localObjectType) {
                            case intellisenseModels_1.LocalSymbolType.Procedure:
                            case intellisenseModels_1.LocalSymbolType.Function:
                                if (item.name === symbolList[i].objectName && symbolList[i].symbolParams)
                                    foundMethod = this.areParamsEqual(matchedList, symbolList[i].symbolParams);
                                break;
                        }
                        if (foundMethod) {
                            locationList.push(new vscode_1.Location(objectUri, new vscode_1.Range(new vscode_1.Position(symbolList[i].startLine, 0), new vscode_1.Position(symbolList[i].endLine + 1, 0))));
                            foundMethod = false;
                        }
                    }
                }
                return locationList.length > 0 ? locationList : null;
            }
            catch (err) {
                fileLogger.log(err);
                return null;
            }
        });
    }
    areParamsEqual(matchedParamList, symbolparams) {
        let paramObjectList, foundMethod = false, paramName;
        try {
            if (matchedParamList.length === 0 && symbolparams.length === 0)
                return true;
            for (let idx = 0; idx < matchedParamList.length && !foundMethod; idx++) {
                paramObjectList = matchedParamList[idx];
                if (paramObjectList.length !== symbolparams.length)
                    continue;
                foundMethod = true;
                for (let i = 0; i < symbolparams.length && foundMethod; ++i) {
                    paramName = oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(paramObjectList[i].name);
                    if (paramObjectList[i].direction.toUpperCase() !== 'RETURN' && paramName !== symbolparams[i].name)
                        foundMethod = false;
                }
            }
        }
        catch (err) {
            fileLogger.error(err);
        }
        return foundMethod;
    }
    handleReferenceRequest(document, position, token, context) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let documentToken = new iLanguageTokenHandler_1.DocumentToken();
                try {
                    this.locationContext = context;
                    documentToken.tokenPosition = new oracleCompletionItemProvider_1.TokenPositionHelper(null, position, document);
                    if (this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                        let docAndUserID = this.getConnecteduserAndDocID(document);
                        documentToken.documentId = docAndUserID[0];
                        documentToken.connectedSchema = docAndUserID[1];
                        let request = new intellisenseRequests_1.StatementContextRequestParams();
                        request.fileUri = document.uri.toString();
                        request.line = position.line;
                        let currentSelection = vscode.window.activeTextEditor.selection;
                        if (!currentSelection.start.isEqual(currentSelection.end) &&
                            currentSelection.end.isEqual(position))
                            request.column = position.character - 1;
                        else
                            request.column = position.character;
                        request.providerType = this.locationContext;
                        fileLogger.info("Sending StatementContextRequest");
                        let locationList = [];
                        let completionList = null;
                        yield this.languageServerClient.sendRequest(intellisenseRequests_1.StatementContextRequest.type, request).then((response) => __awaiter(this, void 0, void 0, function* () {
                            if (documentToken.connectedSchema != null && documentToken.connectedSchema.length > 0) {
                                if (this.oracleIntelliSenseDataMgr.intelliSenseData.has(documentToken.documentId)) {
                                    var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
                                    documentToken.tokenInfo = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getTokenCountAndTokenInfo(response.tokenInfo);
                                    documentToken.tokenPosition.tokenInfo = documentToken.tokenInfo;
                                    documentToken.tokenPosition.scopeItems = response.scopeItems;
                                    switch (documentToken.tokenInfo.count) {
                                        case 1:
                                            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                                                completionList = yield allobjectList.GetObjectsFromOneToken(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.References, []);
                                            }
                                            break;
                                        case 2:
                                            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                                                completionList = yield allobjectList.GetObjectsFromTwoTokens(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.References);
                                            }
                                            break;
                                        case 3:
                                            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                                                completionList = yield allobjectList.GetObjectsFromThreeTokens(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.References);
                                            }
                                            break;
                                    }
                                    if (completionList === null || completionList.length === 0) {
                                        let publicSynonyms = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).PublicSynonyms;
                                        if (publicSynonyms) {
                                            switch (documentToken.tokenInfo.count) {
                                                case 2:
                                                    if (documentToken.tokenInfo.dbFormattedToken2 === 'PUBLIC')
                                                        documentToken.tokenInfo.dbFormattedToken2 = documentToken.tokenInfo.dbFormattedToken1;
                                                    else
                                                        break;
                                                case 1:
                                                    completionList = yield publicSynonyms.GetObjectsFromOneToken(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.References);
                                                    break;
                                            }
                                        }
                                    }
                                    if (completionList !== null && completionList.length > 0) {
                                        if (this.isValidObjectForReference(completionList[0])) {
                                            fileLogger.info("Sending List of References");
                                            locationList = yield this.getReferenceDetails(documentToken, document.uri, completionList[0]);
                                            resolve(locationList);
                                        }
                                        else if (completionList[0].objectType == intellisenseRequests_1.SchemaObjectType.PackageMethod) {
                                            fileLogger.info("Getting object location");
                                            yield this.getObjectLocation(completionList[0], documentToken).then((response) => {
                                                resolve(response);
                                            }).catch((e) => {
                                                oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, e);
                                                reject(e);
                                                return;
                                            });
                                        }
                                        else {
                                            oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, localizedConstants_1.default.invalidObjectMessage);
                                            reject(localizedConstants_1.default.invalidObjectMessage);
                                            return;
                                        }
                                    }
                                    else {
                                        oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, localizedConstants_1.default.objectNotFound);
                                        reject(localizedConstants_1.default.objectNotFound);
                                        return;
                                    }
                                }
                            }
                            else {
                                fileLogger.error(localizedConstants_1.default.notConnectedToDatabase);
                                reject(localizedConstants_1.default.notConnectedToDatabase);
                                return;
                            }
                        }));
                    }
                    else {
                        fileLogger.error(localizedConstants_1.default.locationNotFound);
                        reject(localizedConstants_1.default.locationNotFound);
                        return;
                    }
                }
                catch (err) {
                    oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, err);
                    reject(err);
                }
            }));
        });
    }
    getAllLocations(referenceList, documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let locationList = [];
                yield Promise.all(referenceList.map((item) => __awaiter(this, void 0, void 0, function* () {
                    var newItem = new oracleCompletionItemProvider_1.OracleCompletionItem();
                    newItem.objectType = item.objectType;
                    newItem.name = item.objectName;
                    newItem.owner = item.ownerName;
                    fileLogger.info("Getting object location");
                    try {
                        let loc = yield this.getObjectLocation(newItem, documentToken);
                        if (loc instanceof vscode_1.Location == true)
                            locationList.push(loc);
                        else
                            locationList.push(...loc);
                    }
                    catch (e) {
                        oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, e);
                    }
                }))).then(() => {
                    resolve(locationList);
                }).catch((e) => {
                    oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, e);
                    reject(e);
                });
            }));
        });
    }
    getReferenceDetails(document, uri, objectDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let request = new intellisenseRequests_1.DependencyReferenceRequestParams();
                let params = editorUtils_1.editorUtils.getQueryParameters(uri);
                request.fileUri = Boolean(uri.query) ? params.connectionUri : uri.toString();
                request.dependencyType = intellisenseRequests_1.Dependencies.ReferencedBy;
                request.objectName = objectDetails.name;
                request.objectType = objectDetails.objectType == intellisenseRequests_1.SchemaObjectType.PublicSynonym ? intellisenseRequests_1.SchemaObjectType.Synonym : objectDetails.objectType;
                request.ownerName = objectDetails.owner;
                let locationList = [];
                try {
                    let referenceList = yield this.languageServerClient.sendRequest(intellisenseRequests_1.DependencyReferenceRequest.Request, request);
                    if (referenceList != null && referenceList.length > 0) {
                        let docConnectionInfo = this.connectionCommandHandler.getSavedConnectionProperties(document.documentId);
                        let connectionName = docConnectionInfo.connectionAttributes.name;
                        let connectionNode = this.dataExplorerManager.getConnectionNodeFromConnectionName(connectionName);
                        if (connectionNode && connectionNode.status !== connectionNode_1.ConnectionStatus.Connected &&
                            connectionNode.status !== connectionNode_1.ConnectionStatus.Connecting) {
                            yield this.dataExplorerManager.onConnectionConnect(connectionNode, true).then(() => __awaiter(this, void 0, void 0, function* () {
                                locationList = yield this.getAllLocations(referenceList, document);
                                resolve(locationList);
                            })).catch((e) => {
                                reject(e);
                                return;
                            });
                        }
                        else {
                            locationList = yield this.getAllLocations(referenceList, document);
                            resolve(locationList);
                        }
                    }
                    else {
                        resolve(locationList);
                        return;
                    }
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    }
    isValidObjectForReference(objectDetails) {
        switch (objectDetails.objectType) {
            case intellisenseRequests_1.SchemaObjectType.Table:
            case intellisenseRequests_1.SchemaObjectType.View:
            case intellisenseRequests_1.SchemaObjectType.Trigger:
            case intellisenseRequests_1.SchemaObjectType.Function:
            case intellisenseRequests_1.SchemaObjectType.StoredProcedure:
            case intellisenseRequests_1.SchemaObjectType.Package:
            case intellisenseRequests_1.SchemaObjectType.PackageBody:
            case intellisenseRequests_1.SchemaObjectType.Synonym:
            case intellisenseRequests_1.SchemaObjectType.PublicSynonym: return true;
            default: return false;
        }
    }
}
exports.LocationProvider = LocationProvider;
class TypeLocationProvider extends LocationProvider {
    handleLanguageFeatureRequest(document, position, token, context) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let documentToken = new iLanguageTokenHandler_1.DocumentToken();
                try {
                    this.locationContext = context;
                    documentToken.tokenPosition = new oracleCompletionItemProvider_1.TokenPositionHelper(null, position, document);
                    if (this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                        let docAndUserID = this.getConnecteduserAndDocID(document);
                        documentToken.documentId = docAndUserID[0];
                        documentToken.connectedSchema = docAndUserID[1];
                        let request = new intellisenseRequests_1.StatementContextRequestParams();
                        request.fileUri = document.uri.toString();
                        request.line = position.line;
                        request.column = position.character;
                        request.providerType = this.locationContext;
                        fileLogger.info("Sending StatementContextRequest");
                        yield this.languageServerClient.sendRequest(intellisenseRequests_1.StatementContextRequest.type, request).then((response) => __awaiter(this, void 0, void 0, function* () {
                            if (!response.isIdentifier) {
                                reject("Token is not an identifier");
                                return;
                            }
                            fileLogger.info("Received StatementContextResponse for token");
                            this.matchedLocations = [];
                            if (response.scopeItems && response.scopeItems.matchFound && response.scopeItems.matchedObjects
                                && response.scopeItems.matchedObjects[0].parsedObjectType === oracleLanguageFeaturesHelper_1.ParsedObjectType.CodeBlockItem) {
                                let selection, range;
                                response.scopeItems.matchedObjects.forEach(item => {
                                    selection = item.range;
                                    if (selection.endLine >= document.lineCount)
                                        selection.endLine = document.lineCount - 1;
                                    range = new vscode_1.Range(new vscode_1.Position(selection.startLine, selection.startColumn), new vscode_1.Position(selection.endLine, document.lineAt(selection.endLine).range.end.character));
                                    if (range.contains(position))
                                        this.matchedLocations.push(new vscode_1.Location(document.uri, new vscode_1.Position(selection.startLine, selection.startColumn)));
                                    else
                                        this.matchedLocations.push(new vscode_1.Location(document.uri, range));
                                });
                            }
                            let location = null;
                            if (response.scopeItems.matchedTokens && response.scopeItems.matchedTokens.length > 0 &&
                                documentToken.connectedSchema != null && documentToken.connectedSchema.length > 0 &&
                                this.oracleIntelliSenseDataMgr.intelliSenseData.has(documentToken.documentId)) {
                                for (let i = 0; i < response.scopeItems.matchedTokens.length; ++i) {
                                    documentToken.tokenInfo = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getTokenCountAndTokenInfo(response.scopeItems.matchedTokens[i]);
                                    documentToken.tokenPosition.tokenInfo = documentToken.tokenInfo;
                                    documentToken.tokenPosition.scopeItems = response.scopeItems;
                                    switch (documentToken.tokenInfo.count) {
                                        case 1:
                                            location = (yield this.handleOnePartIdentifierResolution(documentToken));
                                            break;
                                        case 2:
                                            location = yield this.handleTwoPartIdentifierResolution(documentToken);
                                            break;
                                        case 3:
                                            location = yield this.handleThreePartIdentifierResolution(documentToken);
                                            break;
                                    }
                                    if (location !== null) {
                                        if (typeof location === typeof vscode_1.Location)
                                            this.matchedLocations.push(location);
                                        else
                                            this.matchedLocations.push(...location);
                                    }
                                }
                            }
                            if (this.matchedLocations.length > 0) {
                                if (this.matchedLocations.length === 1)
                                    resolve(this.matchedLocations[0]);
                                else
                                    resolve(this.matchedLocations);
                                return;
                            }
                        }), error => {
                            helper.logErroAfterValidating(error);
                            reject(error);
                        });
                    }
                    reject(localizedConstants_1.default.locationNotFound);
                }
                catch (err) {
                    oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, err);
                    reject(err);
                }
            }));
        });
    }
    handleOnePartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (documentToken.tokenPosition.scopeItems && documentToken.tokenPosition.scopeItems.parentName) {
                documentToken.tokenInfo.dbFormattedToken2 = documentToken.tokenInfo.token2 = documentToken.tokenPosition.scopeItems.parentName;
                if (documentToken.tokenPosition.scopeItems.schemaName) {
                    documentToken.tokenInfo.dbFormattedToken3 = documentToken.tokenInfo.token3 = documentToken.tokenPosition.scopeItems.schemaName;
                    return yield this.handleThreePartIdentifierResolution(documentToken);
                }
                else {
                    return yield this.handleTwoPartIdentifierResolution(documentToken);
                }
            }
            return null;
        });
    }
    handleTwoPartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let completionList = null;
            let allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                completionList = yield allobjectList.GetObjectsFromTwoTokens(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Definition);
            }
            if (completionList != null && completionList.length > 0 && completionList[0].objectType === intellisenseRequests_1.SchemaObjectType.PackageMember) {
                return yield this.getObjectLocation(completionList[0], documentToken);
            }
            return null;
        });
    }
    handleThreePartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let completionList = null;
            var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                completionList = yield allobjectList.GetObjectsFromThreeTokens(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Definition);
                if (completionList != null && completionList.length > 0 && completionList[0].objectType === intellisenseRequests_1.SchemaObjectType.PackageMember) {
                    return yield this.getObjectLocation(completionList[0], documentToken);
                }
            }
            return null;
        });
    }
}
exports.TypeLocationProvider = TypeLocationProvider;
class oracleReferenceProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        this.codeEditorProvider = undefined;
        fileLogger.info("Initializing oracleReferenceProvider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.codeEditorProvider = codeEditorProvider;
        fileLogger.info("oracleReferenceProvider initialized.");
    }
    provideReferences(document, position, context, token) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let locationProvider = new LocationProvider(this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager, this.codeEditorProvider);
                try {
                    fileLogger.info("Sending reference request");
                    var objectList = yield locationProvider.handleReferenceRequest(document, position, token, intellisenseRequests_1.IntelliSenseProviderType.References);
                    resolve(objectList);
                }
                catch (e) {
                    fileLogger.error(e);
                    reject(e);
                    return;
                }
            }));
        });
    }
}
exports.oracleReferenceProvider = oracleReferenceProvider;
