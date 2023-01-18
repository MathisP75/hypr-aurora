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
exports.HoverDataProvider = exports.oracleHoverProvider = void 0;
const vscode_1 = require("vscode");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
const oracleCompletionItemProvider_1 = require("./oracleCompletionItemProvider");
const logger = require("./../infrastructure/logger");
const helper = require("./../utilities/helper");
const oracleSignatureHelpProvider_1 = require("./oracleSignatureHelpProvider");
const localizedConstants_1 = require("../constants/localizedConstants");
const iLanguageTokenHandler_1 = require("./iLanguageTokenHandler");
const constants_1 = require("../constants/constants");
const oracleLanguageFeaturesHelper_1 = require("./oracleLanguageFeaturesHelper");
const oracleAutoCompletionHelper_1 = require("./oracleAutoCompletionHelper");
const intellisenseModels_1 = require("../models/intellisenseModels");
const fileLogger = logger.FileStreamLogger.Instance;
class oracleHoverProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        fileLogger.info("Initializing oracleHoverProvider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        fileLogger.info("oracleHoverProvider initialized.");
    }
    provideHover(document, position, token) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var hoverDataProvider = new HoverDataProvider(this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager);
            yield hoverDataProvider.handleLanguageFeatureRequest(document, position).
                then(data => {
                resolve(data);
            }).catch(() => {
                reject();
            });
        }));
    }
}
exports.oracleHoverProvider = oracleHoverProvider;
class HoverDataProvider extends oracleSignatureHelpProvider_1.oracleAutoCompletionDataProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager) {
        super(vscodeConnector, connectionCommandHandler, dataExplorerManager);
        this.casing = this.oracleIntelliSenseDataMgr.getCaseSettings();
    }
    handleLanguageFeatureRequest(document, position) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let documentToken = new iLanguageTokenHandler_1.DocumentToken();
            try {
                if (this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                    let request = new intellisenseRequests_1.StatementContextRequestParams();
                    request.fileUri = document.uri.toString();
                    request.line = position.line;
                    request.column = position.character;
                    request.providerType = intellisenseRequests_1.IntelliSenseProviderType.Hover;
                    yield this.languageServerClient.sendRequest(intellisenseRequests_1.StatementContextRequest.type, request).then((response) => __awaiter(this, void 0, void 0, function* () {
                        if (!response.tokenInfo) {
                            reject();
                            return;
                        }
                        documentToken.aliasInfo = response.tokenInfo.aliasInfo;
                        let docAndUserID = this.getConnecteduserAndDocID(document);
                        documentToken.documentId = docAndUserID[0];
                        documentToken.connectedSchema = docAndUserID[1];
                        let results = null;
                        documentToken.tokenInfo = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getTokenCountAndTokenInfo(response.tokenInfo);
                        documentToken.tokenPosition = new oracleCompletionItemProvider_1.TokenPositionHelper(documentToken.tokenInfo, position, document, response.scopeItems);
                        if (!response.isIdentifier && !response.tokenInfo.parameterToken) {
                            if (documentToken.tokenInfo.count == 1)
                                results = this.checkStaticSQLFunctions(documentToken.tokenInfo.dbFormattedToken1, documentToken.tokenPosition);
                            if (results !== null)
                                resolve(results);
                            else
                                reject();
                            return;
                        }
                        if (response.scopeItems && response.scopeItems.matchFound && response.scopeItems.matchedObjects.length > 0) {
                            if (response.scopeItems.matchedObjects[0].parsedObjectType === oracleLanguageFeaturesHelper_1.ParsedObjectType.CodeBlockItem)
                                results = this.getHoverForLocalItem(response.scopeItems.matchedObjects, response.scopeItems.parentName);
                            else
                                results = yield this.getHoverForAlias(response.scopeItems, documentToken.connectedSchema, documentToken.documentId);
                        }
                        if (results === null && documentToken.tokenInfo.count == 1) {
                            results = this.checkStaticSQLFunctions(documentToken.tokenInfo.dbFormattedToken1, documentToken.tokenPosition);
                        }
                        if (results !== null) {
                            resolve(results);
                            return;
                        }
                        if (documentToken.connectedSchema != null && documentToken.connectedSchema.length > 0) {
                            if (this.oracleIntelliSenseDataMgr.intelliSenseData.has(documentToken.documentId)) {
                                switch (documentToken.tokenInfo.count) {
                                    case 1:
                                        results = yield this.handleOnePartIdentifierResolution(documentToken);
                                        break;
                                    case 2:
                                        results = yield this.handleTwoPartIdentifierResolution(documentToken);
                                        break;
                                    case 3:
                                        results = yield this.handleThreePartIdentifierResolution(documentToken);
                                        break;
                                }
                            }
                        }
                        if (results == null) {
                            if (documentToken.tokenInfo.count === 2 && documentToken.aliasInfo)
                                results = yield this.processAliasInfoForTwoTokens(documentToken);
                        }
                        if (results !== null)
                            resolve(results);
                    }), error => {
                        helper.logErroAfterValidating(error);
                        reject();
                    });
                }
                reject();
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                reject();
            }
        }));
    }
    getFinalHover(value) {
        if (value && value.markedDownString)
            return new vscode_1.Hover(value.markedDownString);
        return null;
    }
    getHoverForLocalItem(matchedObjects, parentName) {
        let localObject = matchedObjects[0];
        let type = `(${localObject.objectTypeStr})`;
        let hoverString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(type);
        let objectName = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(localObject.name, this.casing.objectNameCase);
        try {
            switch (localObject.objectType) {
                case intellisenseModels_1.LocalSymbolType.Procedure:
                case intellisenseModels_1.LocalSymbolType.Function:
                    let methodParamLists = [], pList;
                    matchedObjects.forEach(matchedMethod => {
                        pList = oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getOracleParamListFromMethodParams(matchedMethod.methodParams, this.casing);
                        if (pList)
                            methodParamLists.push(pList);
                    });
                    if (methodParamLists && methodParamLists.length > 0)
                        hoverString = this.addMethodDetailsWithParams(hoverString, objectName, methodParamLists, null, null);
                    else
                        hoverString.appendNameValueString(localizedConstants_1.default.name, `${objectName}()`);
                    break;
                case intellisenseModels_1.LocalSymbolType.Parameter:
                    objectName += ' ' + (localObject.direction ? oracleLanguageFeaturesHelper_1.CasingHelper.setCase(localObject.direction, this.casing.keywordCase) : '') + ' ' +
                        (localObject.dataType ? oracleLanguageFeaturesHelper_1.CasingHelper.getObjNameStr(localObject.dataType, this.casing.keywordCase) : '');
                    hoverString.appendNameValueString(localizedConstants_1.default.name, objectName);
                    if (parentName) {
                        hoverString.appendNameValueString(localizedConstants_1.default.methodStr, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(parentName, this.casing.objectNameCase));
                    }
                    break;
                case intellisenseModels_1.LocalSymbolType.Variable:
                case intellisenseModels_1.LocalSymbolType.Constant:
                    hoverString.appendNameValueString(localizedConstants_1.default.name, objectName);
                    if (localObject.dataType)
                        hoverString.appendNameValueString(localizedConstants_1.default.dataType, oracleLanguageFeaturesHelper_1.CasingHelper.getObjNameStr(localObject.dataType, this.casing.keywordCase));
                    if (localObject.direction)
                        hoverString.appendNameValueString(localizedConstants_1.default.direction, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(localObject.direction, this.casing.keywordCase));
                    break;
                default:
                    hoverString.appendNameValueString(localizedConstants_1.default.name, objectName);
                    break;
            }
        }
        catch (err) {
            fileLogger.error(err);
            return null;
        }
        return this.getFinalHover(hoverString);
    }
    getHoverForAlias(scopeItems, connectedSchema, documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (scopeItems.matchedObjects.length > 0) {
                let item = scopeItems.matchedObjects[0];
                let type, parentNameLabel;
                if (item.objectType === intellisenseModels_1.LocalSymbolType.TableAlias) {
                    type = item.isExpression ? localizedConstants_1.default.subqueryAlias : localizedConstants_1.default.tableAlias;
                    parentNameLabel = item.isExpression ? localizedConstants_1.default.tableExpression : localizedConstants_1.default.tableName;
                }
                else if (item.objectType === intellisenseModels_1.LocalSymbolType.ColumnAlias) {
                    type = localizedConstants_1.default.columnAlias;
                    parentNameLabel = item.isExpression ? localizedConstants_1.default.columnExpression : localizedConstants_1.default.columnName;
                }
                else
                    return null;
                let casing = this.oracleIntelliSenseDataMgr.getCaseSettings();
                let aliasedSymbol = item.isExpression ? item.aliasedSymbol : oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.aliasedSymbol, casing.objectNameCase);
                if (!item.isExpression && connectedSchema != null && connectedSchema.length > 0) {
                    let completionList = new Array();
                    if (item.objectType === intellisenseModels_1.LocalSymbolType.TableAlias) {
                        let allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentId).AllObjectList;
                        if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                            let documentToken = new iLanguageTokenHandler_1.DocumentToken();
                            documentToken.tokenInfo.dbFormattedToken1 = item.dbFormattedAliasedSymbol;
                            documentToken.connectedSchema = connectedSchema;
                            documentToken.documentId = documentId;
                            documentToken.tokenInfo.dbFormattedToken1 = item.dbFormattedAliasedSymbol;
                            completionList = yield allobjectList.GetObjectsFromOneToken(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Hover, []);
                        }
                        if (completionList.length > 0) {
                            let tableItem = completionList[0];
                            tableItem.updateCasing(intellisenseRequests_1.IntelliSenseProviderType.Hover);
                            if ((tableItem.objectType == intellisenseRequests_1.SchemaObjectType.Table || tableItem.objectType == intellisenseRequests_1.SchemaObjectType.View)) {
                                if (!tableItem.subObjects) {
                                    let schemaToUse = tableItem.owner ? tableItem.owner : connectedSchema;
                                    tableItem = yield oracleCompletionItemProvider_1.OracleAutoCompletionDatabaseClient.FetchObjectInfo(completionList[0], completionList[0].name, null, schemaToUse, completionList[0].objectType, documentId);
                                    if (tableItem === null)
                                        tableItem = completionList[0];
                                }
                                if (tableItem.objectType == intellisenseRequests_1.SchemaObjectType.View) {
                                    type = localizedConstants_1.default.viewAlias;
                                    parentNameLabel = localizedConstants_1.default.viewName;
                                }
                                let hoverString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(type);
                                hoverString.appendNameValueString(localizedConstants_1.default.alias, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.alias, casing.objectNameCase));
                                hoverString.appendNameValueString(parentNameLabel, aliasedSymbol);
                                let tableDetails = this.addTableDetails(hoverString, tableItem, connectedSchema);
                                if (tableDetails !== null)
                                    return this.getFinalHover(tableDetails);
                            }
                        }
                    }
                    else {
                        let columnList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentId).AllTableColumns;
                        if (columnList.ColumnList.IntelliSenseDict.size > 0) {
                            let documentToken = new iLanguageTokenHandler_1.DocumentToken();
                            documentToken.tokenInfo.dbFormattedToken1 = item.dbFormattedAliasedSymbol;
                            completionList = columnList.GetObjectsFromOneToken(documentToken, 1, new Array(), intellisenseRequests_1.IntelliSenseProviderType.Hover);
                        }
                        if (completionList.length > 0) {
                            completionList[0].updateCasing(intellisenseRequests_1.IntelliSenseProviderType.Hover);
                            if (!completionList[0].owner)
                                completionList[0].owner = connectedSchema;
                            let hoverString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(type);
                            hoverString.appendNameValueString(localizedConstants_1.default.alias, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.alias, casing.objectNameCase));
                            hoverString.appendNameValueString(parentNameLabel, aliasedSymbol);
                            let columnDetails = this.addColumnDetails(hoverString, completionList[0], scopeItems.tables, connectedSchema, completionList[0].caseSettings);
                            if (columnDetails !== null) {
                                return this.getFinalHover(columnDetails);
                            }
                        }
                    }
                }
                let hoverString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(type);
                hoverString.appendNameValueString(localizedConstants_1.default.alias, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.alias, casing.objectNameCase));
                hoverString.appendNameValueString(parentNameLabel, aliasedSymbol);
                return this.getFinalHover(hoverString);
            }
            return null;
        });
    }
    getHoverForStaticObject(item) {
        let hoverData;
        let casing = this.oracleIntelliSenseDataMgr.getCaseSettings().objectNameCase;
        switch (item.parsedObjectType) {
            case oracleLanguageFeaturesHelper_1.ParsedObjectType.Column:
                let column = item;
                hoverData = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(`(${localizedConstants_1.default.column})`);
                hoverData.appendNameValueString(localizedConstants_1.default.name, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(column.name, casing));
                return this.getFinalHover(hoverData);
            case oracleLanguageFeaturesHelper_1.ParsedObjectType.Table:
                let table = item;
                if (table.name) {
                    hoverData = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(`(${localizedConstants_1.default.table})`);
                    hoverData.appendNameValueString(localizedConstants_1.default.name, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(table.name, casing));
                    return this.getFinalHover(hoverData);
                }
                break;
        }
        return null;
    }
    checkStaticSQLFunctions(token, tokenPostion) {
        let completionList = new Array();
        var sqlFunctions = oracleCompletionItemProvider_1.OracleStaticSQLFunction.getStaticSQLFunctionCompletionList(this.oracleIntelliSenseDataMgr.getCaseSettings().objectNameCase);
        if (sqlFunctions.has(token)) {
            let item = sqlFunctions.get(token);
            item.updateCasing(intellisenseRequests_1.IntelliSenseProviderType.Hover);
            item.objectType = intellisenseRequests_1.SchemaObjectType.StaticSQLFunction;
            completionList.push(item);
        }
        if (completionList.length > 0) {
            return this.getHoverData(completionList[0], tokenPostion, null);
        }
        return null;
    }
    handleOnePartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let completionList = new Array();
            let allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                completionList = yield allobjectList.GetObjectsFromOneToken(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Hover, []);
            }
            if (completionList.length > 0) {
                if ((completionList[0].objectType == intellisenseRequests_1.SchemaObjectType.Table || completionList[0].objectType == intellisenseRequests_1.SchemaObjectType.View
                    || completionList[0].objectType == intellisenseRequests_1.SchemaObjectType.Synonym || completionList[0].objectType == intellisenseRequests_1.SchemaObjectType.PublicSynonym)
                    && !completionList[0].subObjects) {
                    let fetchedItem = yield oracleCompletionItemProvider_1.OracleAutoCompletionDatabaseClient.FetchObjectInfo(completionList[0], completionList[0].name, null, documentToken.connectedSchema, completionList[0].objectType, documentToken.documentId);
                    if (fetchedItem != null)
                        completionList[0] = fetchedItem;
                }
                return this.getHoverData(completionList[0], documentToken.tokenPosition, documentToken.connectedSchema);
            }
            let columnList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllTableColumns;
            if (columnList.ColumnList.IntelliSenseDict.size > 0) {
                completionList = columnList.GetObjectsFromOneToken(documentToken, 1, new Array(), intellisenseRequests_1.IntelliSenseProviderType.Hover);
            }
            if (completionList.length > 0) {
                return this.getHoverData(completionList[0], documentToken.tokenPosition, documentToken.connectedSchema);
            }
            let publicSynonyms = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).PublicSynonyms;
            if (publicSynonyms != null && publicSynonyms.PublicSynonym.IntelliSenseDict.size > 0) {
                completionList = yield publicSynonyms.GetObjectsFromOneToken(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Hover);
            }
            if (completionList.length > 0) {
                return this.getHoverData(completionList[0], documentToken.tokenPosition, documentToken.connectedSchema);
            }
            return null;
        });
    }
    handleTwoPartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let completionList = null;
            let result = yield this.processAliasInfoForTwoTokens(documentToken);
            if (result)
                return result;
            let allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                completionList = yield allobjectList.GetObjectsFromTwoTokens(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Hover);
            }
            if (completionList != null && completionList.length > 0) {
                if ((completionList[0].objectType == intellisenseRequests_1.SchemaObjectType.Table || completionList[0].objectType == intellisenseRequests_1.SchemaObjectType.View)
                    && !completionList[0].subObjects) {
                    let schemaToUse = completionList[0].owner ? completionList[0].owner : documentToken.connectedSchema;
                    let fetchedItem = yield oracleCompletionItemProvider_1.OracleAutoCompletionDatabaseClient.FetchObjectInfo(completionList[0], completionList[0].name, null, schemaToUse, completionList[0].objectType, documentToken.documentId);
                    if (fetchedItem != null)
                        completionList[0] = fetchedItem;
                }
                return this.getHoverData(completionList[0], documentToken.tokenPosition, documentToken.connectedSchema);
            }
            let publicSynonyms = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).PublicSynonyms;
            if (publicSynonyms != null && publicSynonyms.PublicSynonym.IntelliSenseDict.size > 0) {
                if (documentToken.tokenInfo.dbFormattedToken2 === 'PUBLIC')
                    documentToken.tokenInfo.dbFormattedToken2 = documentToken.tokenInfo.dbFormattedToken1;
                completionList = yield publicSynonyms.GetObjectsFromTwoToken(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Hover);
            }
            if (completionList != null && completionList.length > 0) {
                return this.getHoverData(completionList[0], documentToken.tokenPosition, documentToken.connectedSchema);
            }
            return null;
        });
    }
    processAliasInfoForTwoTokens(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (documentToken.aliasInfo) {
                let aliasedTable = oracleAutoCompletionHelper_1.ProcessOracleStatement.getMatchedAliasObject(documentToken.tokenInfo.dbFormattedToken2, documentToken.aliasInfo.tableAliases);
                if (aliasedTable) {
                    if (aliasedTable.dbFormatedName) {
                        documentToken.tokenInfo.dbFormattedToken2 = aliasedTable.dbFormatedName;
                        if (aliasedTable.dbFormatedSchema)
                            documentToken.connectedSchema = aliasedTable.dbFormatedSchema;
                    }
                    else {
                        documentToken.tokenPosition.scopeItems.tables = documentToken.tokenPosition.scopeItems.tables ?
                            documentToken.tokenPosition.scopeItems.tables.concat(oracleAutoCompletionHelper_1.ProcessOracleStatement.getTableListFromTableExpressionDetail(aliasedTable.tableReferenceExpressionDetail))
                            : oracleAutoCompletionHelper_1.ProcessOracleStatement.getTableListFromTableExpressionDetail(aliasedTable.tableReferenceExpressionDetail);
                        let aliasedItem = oracleAutoCompletionHelper_1.ProcessOracleStatement.getMatchedAliasObject(documentToken.tokenInfo.dbFormattedToken1, aliasedTable.tableReferenceExpressionDetail);
                        if (aliasedItem) {
                            let parsedAlias = new oracleLanguageFeaturesHelper_1.ParsedAlias();
                            parsedAlias.populate(aliasedItem, documentToken.tokenInfo.dbFormattedToken1);
                            documentToken.tokenPosition.scopeItems.matchedObjects = [parsedAlias];
                            return yield this.getHoverForAlias(documentToken.tokenPosition.scopeItems, documentToken.connectedSchema, documentToken.documentId);
                        }
                        if (documentToken.connectedSchema) {
                            documentToken.tokenInfo.token2 = documentToken.tokenInfo.dbFormattedToken2 = null;
                            return yield this.handleOnePartIdentifierResolution(documentToken);
                        }
                    }
                }
            }
            return null;
        });
    }
    handleThreePartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let completionList = null;
            var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
            if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                completionList = yield allobjectList.GetObjectsFromThreeTokens(documentToken, 1, intellisenseRequests_1.IntelliSenseProviderType.Hover);
                if (completionList != null && completionList.length > 0) {
                    return this.getHoverData(completionList[0], documentToken.tokenPosition, null);
                }
            }
            return null;
        });
    }
    getHoverData(item, tokenPosition, connectedSchema) {
        if (!oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.validateMatchedItem(item.objectType, tokenPosition.scopeItems.matchedObjects[0]))
            return this.getHoverForStaticObject(tokenPosition.scopeItems.matchedObjects[0]);
        if (tokenPosition.tokenInfo.parameterToken)
            return this.getHoverForFormalParameter(item, tokenPosition.tokenInfo.paramList, tokenPosition.tokenInfo.parameterToken, connectedSchema);
        if (item.hoverData === null)
            return this.populateHoverData(item, tokenPosition, connectedSchema);
        else
            return this.getFinalHover(item.hoverData);
    }
    populateHoverData(item, tokenPosition, connectedSchema) {
        let dataType;
        if (item.detail == undefined)
            item.detail = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.GetSchemaObjectTypeDisplayName(item.objectType);
        dataType = `(${item.detail}) `;
        let hoverData = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(dataType);
        let objectType = item.objectType;
        if (item.objectType == intellisenseRequests_1.SchemaObjectType.Synonym || item.objectType == intellisenseRequests_1.SchemaObjectType.PublicSynonym) {
            if (item.subObjects && item.subObjects.length > 0 && item.subObjects[0].objectType == intellisenseRequests_1.SchemaObjectType.TableColumn)
                objectType = intellisenseRequests_1.SchemaObjectType.Table;
            else if (item.methodArgumentList)
                objectType = intellisenseRequests_1.SchemaObjectType.Function;
        }
        switch (objectType) {
            case intellisenseRequests_1.SchemaObjectType.Schema:
                item.displayName = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.name, this.oracleIntelliSenseDataMgr.getCaseSettings().objectNameCase);
                hoverData.appendNameValueString(localizedConstants_1.default.name, item.displayName);
                break;
            case intellisenseRequests_1.SchemaObjectType.View:
            case intellisenseRequests_1.SchemaObjectType.Table:
                hoverData.appendNameValueString(localizedConstants_1.default.name, item.displayName);
                item.hoverData = hoverData = this.addTableDetails(hoverData, item, connectedSchema);
                break;
            case intellisenseRequests_1.SchemaObjectType.StoredProcedure:
            case intellisenseRequests_1.SchemaObjectType.Function:
                hoverData = item.hoverData = this.addMethodDetails(hoverData, item, tokenPosition.tokenInfo.paramList, connectedSchema);
                break;
            case intellisenseRequests_1.SchemaObjectType.PackageMethod:
            case intellisenseRequests_1.SchemaObjectType.StaticSQLFunction:
                hoverData = this.addMethodDetails(hoverData, item, tokenPosition.tokenInfo.paramList, connectedSchema);
                break;
            case intellisenseRequests_1.SchemaObjectType.TableColumn:
                hoverData.appendNameValueString(localizedConstants_1.default.name, item.displayName);
                hoverData = this.addColumnDetails(hoverData, item, tokenPosition.scopeItems ? tokenPosition.scopeItems.tables : null, connectedSchema, item.caseSettings);
                break;
            default:
                hoverData.appendNameValueString(localizedConstants_1.default.name, item.displayName);
                if (item.objectType == intellisenseRequests_1.SchemaObjectType.ObjectAttribute && item.parentName.length > 0)
                    hoverData.appendNameValueString(localizedConstants_1.default.sequenceName, item.parentName);
                if (item.owner && item.owner !== connectedSchema)
                    hoverData.appendNameValueString(localizedConstants_1.default.schema, item.displayOwner);
                item.hoverData = hoverData;
                break;
        }
        return this.getFinalHover(hoverData);
    }
    addMethodDetails(hoverData, item, tokenParamList, connectedSchema) {
        let matchedParamList = this.getMatchedParametersLists(item, tokenParamList);
        if (matchedParamList && matchedParamList.length > 0) {
            return this.addMethodDetailsWithParams(hoverData, item.displayName, matchedParamList, item.parentName, item.displayOwner, connectedSchema);
        }
        hoverData.appendNameValueString(localizedConstants_1.default.name, `${item.displayName}()`);
        if (item.parentName)
            hoverData.appendNameValueString(localizedConstants_1.default.packageName, item.parentName);
        if (item.owner && item.owner !== connectedSchema)
            hoverData.appendNameValueString(localizedConstants_1.default.schema, item.displayOwner);
        return hoverData;
    }
    addMethodDetailsWithParams(hoverData, methodName, matchedParamList, parentName, owner, connectedSchema = null) {
        let signature = `${methodName}`;
        if (matchedParamList.length === 1) {
            let prefix = (matchedParamList[0].isFunction ?
                matchedParamList[0].parameters.length === 1 : matchedParamList[0].parameters.length === 0) ? ``
                : constants_1.Constants.newLineTab;
            signature += prefix + this.getMethodSignature(matchedParamList[0].parameters, matchedParamList[0].isFunction, this.casing.keywordCase);
            hoverData.appendNameValueString(localizedConstants_1.default.name, signature);
        }
        else {
            signature += constants_1.Constants.newLineTab +
                `${this.getMethodSignature(matchedParamList[0].parameters, matchedParamList[0].isFunction, this.casing.keywordCase)}\r\n`;
            for (let i = 1; i < matchedParamList.length; ++i) {
                signature += `\t | ${this.getMethodSignature(matchedParamList[i].parameters, matchedParamList[i].isFunction, this.casing.keywordCase)}\r\n`;
            }
            hoverData.appendNameValueString(localizedConstants_1.default.name, signature.trimEnd());
        }
        if (parentName)
            hoverData.appendNameValueString(localizedConstants_1.default.packageName, parentName);
        if (owner && oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(owner) !== connectedSchema)
            hoverData.appendNameValueString(localizedConstants_1.default.schema, owner);
        return hoverData;
    }
    getMatchedParametersLists(item, tokenParams) {
        let matchedList = [], unmatchedList = [];
        if (item.methodArgumentList) {
            let sortedList = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.sortListOnParameterCount(item.methodArgumentList);
            if (sortedList.length > 0) {
                let paramList;
                for (let idx = 0; idx < sortedList.length; idx++) {
                    paramList = sortedList[idx][1];
                    let isFunction = paramList && paramList.length > 0 &&
                        (paramList[0].direction === 'return' || paramList[0].direction === 'RETURN');
                    if (oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.validateParsedParams(tokenParams, paramList, isFunction)) {
                        matchedList.push(new intellisenseModels_1.OracleParameterList(isFunction, paramList));
                    }
                    else
                        unmatchedList.push(new intellisenseModels_1.OracleParameterList(isFunction, paramList));
                }
                if (matchedList.length == 0)
                    matchedList = unmatchedList;
            }
        }
        return matchedList;
    }
    getHoverForFormalParameter(item, tokenParams, parameterToken, connectedSchema) {
        let paramsOfMatchedMethods = this.getMatchedParametersLists(item, tokenParams);
        if (paramsOfMatchedMethods && paramsOfMatchedMethods.length > 0) {
            let matchedParams = new Map(), i;
            paramsOfMatchedMethods.forEach(paramList => {
                for (i = paramList.isFunction ? 1 : 0; i < paramList.parameters.length; ++i) {
                    if (oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(paramList.parameters[i].name) === parameterToken)
                        matchedParams.set(this.getParameterString(paramList.parameters[i]), null);
                }
            });
            if (matchedParams.size > 0) {
                let hoverString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(localizedConstants_1.default.parameter);
                let iterator = matchedParams.keys();
                let objectName = iterator.next().value;
                if (matchedParams.size > 1)
                    for (i = 1; i < matchedParams.size; ++i) {
                        objectName +=
                            `\n    | ${iterator.next().value}`;
                    }
                hoverString.appendNameValueString(localizedConstants_1.default.name, objectName);
                hoverString.appendNameValueString(localizedConstants_1.default.methodStr, item.displayName);
                if (item.parentName && item.objectType === intellisenseRequests_1.SchemaObjectType.PackageMethod)
                    hoverString.appendNameValueString(localizedConstants_1.default.packageName, item.parentName);
                if (item.owner && item.owner !== connectedSchema)
                    hoverString.appendNameValueString(localizedConstants_1.default.schema, item.displayOwner);
                return this.getFinalHover(hoverString);
            }
        }
        return null;
    }
    getMethodSignature(params, isFunction, keywordCasing) {
        let signature = `(`;
        let pId = isFunction ? 1 : 0;
        if (pId < params.length)
            signature += params[pId].optional === constants_1.Constants.optionalParamTrue ?
                `[${this.getParameterString(params[pId])}]` :
                this.getParameterString(params[pId]);
        for (++pId; pId < params.length; ++pId) {
            signature += params[pId].optional === constants_1.Constants.optionalParamTrue ?
                ` [,${constants_1.Constants.newLineTab}${this.getParameterString(params[pId])}]` :
                `,${constants_1.Constants.newLineTab}${this.getParameterString(params[pId])}`;
        }
        signature += `) `;
        if (isFunction)
            signature += keywordCasing === intellisenseModels_1.Casing.Uppercase ? `RETURNS ${params[0].dataType}` : `returns ${params[0].dataType}`;
        return signature;
    }
    getParameterString(param) {
        let paramStr = param.name;
        if (param.direction)
            paramStr += ` ${param.direction}`;
        if (param.dataType)
            paramStr += ` ${param.dataType}`;
        return paramStr.trim();
    }
    addColumnDetails(hoverString, columnItem, tablesInScope, connectedSchema, caseSettings) {
        if (columnItem.columnData && columnItem.columnData.tables && columnItem.columnData.tables.size > 0) {
            if (tablesInScope) {
                let tName, sName, tabData, dType;
                for (let i = 0; i < tablesInScope.length; ++i) {
                    if (columnItem.columnData.tables.has(tablesInScope[i].dbFormatedName)) {
                        tabData = columnItem.columnData.tables.get(tablesInScope[i].dbFormatedName);
                        if (tablesInScope[i].dbFormatedSchema) {
                            if (tablesInScope[i].dbFormatedSchema !== tabData['schema'])
                                return hoverString;
                        }
                        else if (tabData['schema'] !== connectedSchema)
                            return hoverString;
                        sName = tabData['schema'];
                        dType = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(tabData['dataType'], caseSettings.keywordCase) +
                            (tabData['nullable'] ?
                                " " + oracleLanguageFeaturesHelper_1.CasingHelper.setCase(tabData['nullable'], caseSettings.keywordCase) : '');
                        hoverString.appendNameValueString(localizedConstants_1.default.dataType, dType);
                        tName = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(tablesInScope[i].name, columnItem.caseSettings.objectNameCase);
                        hoverString.appendNameValueString(localizedConstants_1.default.table_view, tName);
                        if (sName && sName !== connectedSchema) {
                            sName = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(sName, columnItem.caseSettings.objectNameCase);
                            hoverString.appendNameValueString(localizedConstants_1.default.schema, sName);
                        }
                        return hoverString;
                    }
                }
                ;
            }
        }
        else {
            if (columnItem.dataType) {
                let dType = columnItem.dataType + (columnItem.nullable ? ' ' + columnItem.nullable : '');
                hoverString.appendNameValueString(localizedConstants_1.default.dataType, dType);
            }
            if (columnItem.parentName)
                hoverString.appendNameValueString(localizedConstants_1.default.table_view, columnItem.parentName);
            if (columnItem.owner && columnItem.owner !== connectedSchema)
                hoverString.appendNameValueString(localizedConstants_1.default.schema, columnItem.displayOwner);
            return hoverString;
        }
        return null;
    }
    addTableDetails(hoverString, tableItem, connectedSchema) {
        if (tableItem.owner && tableItem.owner !== connectedSchema)
            hoverString.appendNameValueString(localizedConstants_1.default.schema, tableItem.displayOwner);
        if (tableItem.subObjects != null && tableItem.subObjects.length > 0) {
            let columnData = '';
            tableItem.subObjects.forEach(column => {
                column.updateCasing(intellisenseRequests_1.IntelliSenseProviderType.Hover);
                columnData += constants_1.Constants.newLineTab + column.displayName + ' ' + column.dataType
                    + (column.nullable ? ' ' + column.nullable : '');
            });
            hoverString.appendNameValueString(localizedConstants_1.default.columns, columnData);
        }
        return hoverString;
    }
}
exports.HoverDataProvider = HoverDataProvider;
