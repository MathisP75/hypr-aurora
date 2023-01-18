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
exports.OracleStaticSQLFunction = exports.OracleKeyWordList = exports.oracleCompletionitemProvider = exports.oracleCompletionItemDataProvider = exports.oracleIntelliSenseInfo = exports.IntelliSenseDataDictionary = exports.oracleDocumentIntelliSenseManager = exports.TokenInfo = exports.TokenPositionHelper = exports.scopeType = exports.OracleAutoCompletionUtils = exports.OracleCompletionItem = exports.OracleAutoCompletionDatabaseClient = exports.OraclePublicSynonyms = exports.OracleAllTableColumns = exports.OracleAllObjects = void 0;
const vscode = require("vscode");
const oracleLanguageServerClient_1 = require("./oracleLanguageServerClient");
const LangService = require("../models/intellisenseRequests");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
const localizedConstants_1 = require("../constants/localizedConstants");
const helper = require("./../utilities/helper");
const logger = require("./../infrastructure/logger");
const constants_1 = require("../constants/constants");
const oracleSignatureHelpProvider_1 = require("./oracleSignatureHelpProvider");
const logger_1 = require("./../infrastructure/logger");
const vscode_1 = require("vscode");
const iLanguageTokenHandler_1 = require("./iLanguageTokenHandler");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const oracleAutoCompletionHelper_1 = require("./oracleAutoCompletionHelper");
const oracleLanguageFeaturesHelper_1 = require("./oracleLanguageFeaturesHelper");
const intellisenseModels_1 = require("../models/intellisenseModels");
const fileLogger = logger.FileStreamLogger.Instance;
const caseMap = {
    'Uppercase': intellisenseModels_1.Casing.Uppercase,
    'Lowercase': intellisenseModels_1.Casing.Lowercase,
    'None': intellisenseModels_1.Casing.None
};
class OracleAllObjects {
    constructor() {
        this.processOracleStatement = null;
        this.SchemaList = new Map();
    }
    ClearList() {
        this.SchemaList.clear();
    }
    getMatchingObjectsFromDictionary(documentToken, itemHasContext, objectList, maximumObjectstoDisplay, providerType, objectsToExclude) {
        return __awaiter(this, void 0, void 0, function* () {
            var objectNameList = new Array();
            var synonymNameList = new Array();
            var SynonymToResolve = new Array();
            var matchedObjectList = new Array();
            var matchingObjectKeys = new Array();
            var completionItem = null;
            var processingSynonymsFromSignatureprovider = false;
            if (objectList != null) {
                if (providerType == intellisenseRequests_1.IntelliSenseProviderType.AutoComplete) {
                    matchingObjectKeys = objectList.GetMatchingObjectKeys(documentToken.tokenInfo.dbFormattedToken1, maximumObjectstoDisplay, itemHasContext);
                }
                else {
                    if (objectList.has(documentToken.tokenInfo.dbFormattedToken1)) {
                        completionItem = objectList.get(documentToken.tokenInfo.dbFormattedToken1);
                        matchingObjectKeys.push(completionItem.name);
                        if (completionItem.objectType == intellisenseRequests_1.SchemaObjectType.PublicSynonym || completionItem.objectType == intellisenseRequests_1.SchemaObjectType.Synonym) {
                            if ((completionItem.parentObjectType === null || completionItem.parentObjectType === undefined) && completionItem.tableName) {
                                let response = yield OracleAutoCompletionDatabaseClient.FetchParentType(documentToken, completionItem.tableOwner, completionItem.objectType, [completionItem.tableName]);
                                if (response != null && response.length > 0) {
                                    completionItem.parentObjectType = response[0].objectType;
                                }
                            }
                            completionItem = yield OracleAutoCompletionDatabaseClient.FetchObjectInfo(completionItem, completionItem.name, null, documentToken.connectedSchema, completionItem.objectType, documentToken.documentId);
                            if (completionItem != null) {
                                matchedObjectList = completionItem.GetCompletionItemsFromSubObjectList(documentToken.tokenInfo.dbFormattedToken1, documentToken.tokenPosition, maximumObjectstoDisplay, providerType);
                            }
                            processingSynonymsFromSignatureprovider = providerType === intellisenseRequests_1.IntelliSenseProviderType.Signature;
                        }
                    }
                }
                if (processingSynonymsFromSignatureprovider != true) {
                    if (matchingObjectKeys.length > 0) {
                        matchingObjectKeys.forEach(key => {
                            completionItem = objectList.get(key);
                            let includeObject = true;
                            for (var idx = 0; idx < objectsToExclude.length; idx++) {
                                if (objectsToExclude[idx].owner == completionItem.owner && objectsToExclude[idx].name == completionItem.name) {
                                    includeObject = false;
                                    break;
                                }
                            }
                            if (includeObject) {
                                matchedObjectList.push(completionItem);
                                completionItem.setSortText();
                                if (objectList.allObjectsFetched()) {
                                    if ((documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.select_list || documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.select_term)
                                        && (completionItem.objectType == intellisenseRequests_1.SchemaObjectType.Table || completionItem.objectType == intellisenseRequests_1.SchemaObjectType.View)) {
                                        let prefix = null;
                                        if (documentToken.tokenInfo.count == 2) {
                                            prefix = documentToken.tokenInfo.token2;
                                        }
                                        else if (documentToken.tokenInfo.count == 3) {
                                            prefix = `${documentToken.tokenInfo.token3}.${documentToken.tokenInfo.token2}`;
                                        }
                                        let allColumnItem = completionItem.getDuplicateAllColumnItem(completionItem.sortText, documentToken, true, prefix);
                                        if (allColumnItem != null) {
                                            matchedObjectList.push(allColumnItem);
                                        }
                                    }
                                }
                                if ((completionItem.objectType == intellisenseRequests_1.SchemaObjectType.StoredProcedure || completionItem.objectType == intellisenseRequests_1.SchemaObjectType.Function) && completionItem.methodArgumentList == null) {
                                    objectNameList.push(completionItem.name);
                                }
                                if (completionItem.objectType == intellisenseRequests_1.SchemaObjectType.Synonym && completionItem.methodArgumentList == null && completionItem.subObjects == null) {
                                    if (completionItem.tableName && completionItem.owner != completionItem.tableOwner) {
                                        SynonymToResolve.push(completionItem);
                                    }
                                    else if (completionItem.tableName && objectList.has(completionItem.tableName)) {
                                        let parent = objectList.get(completionItem.tableName);
                                        if (parent.objectType === intellisenseRequests_1.SchemaObjectType.StoredProcedure || parent.objectType === intellisenseRequests_1.SchemaObjectType.Function) {
                                            if (parent.methodArgumentList == null) {
                                                objectNameList.push(parent.name);
                                                synonymNameList.push(completionItem.name);
                                            }
                                            else {
                                                completionItem.methodArgumentList = parent.methodArgumentList;
                                            }
                                        }
                                        else if (parent.objectType == intellisenseRequests_1.SchemaObjectType.View || parent.objectType == intellisenseRequests_1.SchemaObjectType.Table) {
                                            completionItem.subObjects = parent.subObjects;
                                        }
                                    }
                                }
                            }
                        });
                        yield this.fetchObjectsDetails(objectNameList, documentToken.documentId, objectList, intellisenseRequests_1.SchemaObjectType.StoredProcedure, documentToken.connectedSchema);
                        this.AddObjectDetails(synonymNameList, objectList);
                        this.fetchObjectsFromAnotherSchema(SynonymToResolve, documentToken.documentId, documentToken.connectedSchema);
                    }
                }
                if (providerType === intellisenseRequests_1.IntelliSenseProviderType.AutoComplete)
                    matchedObjectList.forEach(element => {
                        element.populateItemInfo(documentToken.tokenPosition);
                    });
                else
                    matchedObjectList.forEach(element => {
                        element.updateCasing(providerType);
                    });
            }
            return matchedObjectList;
        });
    }
    fetchObjectsFromAnotherSchema(SynonymList, documentID, connectedSchema) {
        return __awaiter(this, void 0, void 0, function* () {
            let ownerDict = new IntelliSenseDataDictionary();
            SynonymList.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                if (item.parentObjectType && item.parentObjectType === intellisenseRequests_1.SchemaObjectType.Package)
                    return;
                if (!ownerDict.has(item.tableOwner)) {
                    ownerDict.set(item.tableOwner, new Array());
                    ownerDict.IntelliSenseDictKeys.push(item.tableOwner);
                }
                let row1 = ownerDict.get(item.tableOwner);
                row1.push(item);
            }));
            ownerDict.IntelliSenseDictKeys.forEach((key) => __awaiter(this, void 0, void 0, function* () {
                this.fetchObjectTypeFromAnotherSchema(documentID, connectedSchema, key, ownerDict);
            }));
        });
    }
    fetchObjectTypeFromAnotherSchema(documentID, connectedSchema, schema, ownerDict) {
        return __awaiter(this, void 0, void 0, function* () {
            let synonymList = ownerDict.get(schema);
            let objectNameList = new Array();
            let synonymNameList = new Array();
            let otherOwnerList = new Array();
            let isSynonymFetch = false;
            let isTableFetch = false;
            if (this.SchemaList.has(schema)) {
                var otherSchema = this.SchemaList.get(schema);
                if (otherSchema) {
                    let currentSchemaObjects = this.SchemaList.get(connectedSchema);
                    synonymList.forEach((child) => {
                        if (otherSchema.has(child.tableName)) {
                            let parent = otherSchema.get(child.tableName);
                            if (parent !== null) {
                                child.parentObjectType = parent.objectType;
                                if (parent.objectType === intellisenseRequests_1.SchemaObjectType.Synonym) {
                                    if (parent.tableName) {
                                        child.tableName = parent.tableName;
                                        child.tableOwner = parent.tableOwner;
                                        child.parentObjectType = parent.parentObjectType;
                                        if (parent.tableOwner != parent.owner) {
                                            if (!ownerDict.has(child.tableOwner)) {
                                                ownerDict.set(child.tableOwner, new Array());
                                                ownerDict.IntelliSenseDictKeys.push(child.tableOwner);
                                                otherOwnerList.push(parent.tableOwner);
                                            }
                                            let row1 = ownerDict.get(child.tableOwner);
                                            row1.push(child);
                                            return;
                                        }
                                        else
                                            parent = otherSchema.get(child.tableName);
                                    }
                                    else
                                        isSynonymFetch = true;
                                }
                                if (parent.objectType === intellisenseRequests_1.SchemaObjectType.Function
                                    || parent.objectType === intellisenseRequests_1.SchemaObjectType.StoredProcedure) {
                                    if (parent.methodArgumentList) {
                                        child.methodArgumentList = parent.methodArgumentList;
                                    }
                                    else {
                                        objectNameList.push(parent.name);
                                        synonymNameList.push(child.name);
                                    }
                                }
                                else if (parent.objectType === intellisenseRequests_1.SchemaObjectType.View ||
                                    parent.objectType === intellisenseRequests_1.SchemaObjectType.Table) {
                                    if (parent.subObjects) {
                                        child.subObjects = parent.subObjects;
                                    }
                                    else
                                        isTableFetch = true;
                                }
                                else if (parent.objectType === intellisenseRequests_1.SchemaObjectType.Package) {
                                    child.subObjects = parent.subObjects;
                                }
                            }
                        }
                    });
                    yield this.fetchObjectsDetails(objectNameList, documentID, otherSchema, intellisenseRequests_1.SchemaObjectType.StoredProcedure, schema);
                    if (!otherSchema.specificTypeFetched(intellisenseRequests_1.SchemaObjectType.Table) && isTableFetch) {
                        OracleAutoCompletionDatabaseClient.FetchAllSameSchemaObject(schema, intellisenseRequests_1.SchemaObjectType.Table, documentID);
                    }
                    if (!otherSchema.specificTypeFetched(intellisenseRequests_1.SchemaObjectType.Synonym) && isSynonymFetch) {
                        OracleAutoCompletionDatabaseClient.FetchAllSameSchemaObject(schema, intellisenseRequests_1.SchemaObjectType.Synonym, documentID);
                    }
                    synonymNameList.forEach((synonym) => {
                        if (currentSchemaObjects.has(synonym)) {
                            let obj = currentSchemaObjects.get(synonym);
                            if (obj.tableName && otherSchema.has(obj.tableName)) {
                                let parent = otherSchema.get(obj.tableName);
                                obj.methodArgumentList = parent.methodArgumentList;
                            }
                        }
                    });
                }
                else
                    OracleAutoCompletionDatabaseClient.FetchAllSameSchemaObject(schema, intellisenseRequests_1.SchemaObjectType.Undefined, documentID);
                otherOwnerList.forEach((owner) => __awaiter(this, void 0, void 0, function* () {
                    if (this.SchemaList.has(owner)) {
                        var otherSchema = this.SchemaList.get(owner);
                        if (otherSchema != null) {
                            OracleAutoCompletionDatabaseClient.FetchAllSameSchemaObject(owner, intellisenseRequests_1.SchemaObjectType.Undefined, documentID);
                        }
                    }
                }));
            }
        });
    }
    AddObjectDetails(synonymNameList, objectList) {
        synonymNameList.forEach((synonym) => {
            if (objectList.has(synonym)) {
                let obj = objectList.get(synonym);
                if (obj.tableName && objectList.has(obj.tableName)) {
                    let parent = objectList.get(obj.tableName);
                    obj.methodArgumentList = parent.methodArgumentList;
                }
            }
        });
    }
    fetchObjectsDetails(objectNameList, documentID, objectList, objectType, schema) {
        return __awaiter(this, void 0, void 0, function* () {
            let completionItem = null;
            if (objectNameList.length > 0) {
                let objects = yield OracleAutoCompletionDatabaseClient.FetchMultipleobjects(documentID, schema, objectType, objectNameList);
                if (objects != null && objects.length > 0) {
                    objects.forEach(item => {
                        completionItem = objectList.get(item.name);
                        if (completionItem != null) {
                            completionItem.methodArgumentList = item.methodArgumentList;
                            completionItem.subObjects = item.subObjects;
                        }
                    });
                }
            }
        });
    }
    GetObjectsFromOneToken(documentToken, maximumObjectstoDisplay, providerType, objectsToExclude) {
        return __awaiter(this, void 0, void 0, function* () {
            var objectList = null;
            var matchedObjectList = new Array();
            if (providerType == intellisenseRequests_1.IntelliSenseProviderType.Hover && this.SchemaList.has(documentToken.tokenInfo.dbFormattedToken1)) {
                let schemaCompletionItem = new OracleCompletionItem();
                schemaCompletionItem.name = documentToken.tokenInfo.dbFormattedToken1;
                schemaCompletionItem.objectType = intellisenseRequests_1.SchemaObjectType.Schema;
                return [schemaCompletionItem];
            }
            if (this.SchemaList.has(documentToken.connectedSchema)) {
                objectList = this.SchemaList.get(documentToken.connectedSchema);
                if (objectList == null) {
                    yield OracleAutoCompletionDatabaseClient.FetchObjectInfo(null, null, null, documentToken.connectedSchema, intellisenseRequests_1.SchemaObjectType.Schema, documentToken.documentId);
                    objectList = this.SchemaList.get(documentToken.connectedSchema);
                }
                matchedObjectList = yield this.getMatchingObjectsFromDictionary(documentToken, false, objectList, maximumObjectstoDisplay, providerType, objectsToExclude);
            }
            return matchedObjectList;
        });
    }
    GetObjectsFromTwoTokens(documentToken, maximumObjectstoDisplay, providerType) {
        return __awaiter(this, void 0, void 0, function* () {
            var completionItems = new Array();
            var oracleCompletionItem = null;
            var objectList = null;
            if (this.SchemaList.has(documentToken.connectedSchema)) {
                objectList = this.SchemaList.get(documentToken.connectedSchema);
                if (objectList != null && objectList.has(documentToken.tokenInfo.dbFormattedToken2)) {
                    oracleCompletionItem = objectList.get(documentToken.tokenInfo.dbFormattedToken2);
                }
                else if (this.SchemaList.has(documentToken.tokenInfo.dbFormattedToken2) && this.SchemaList.get(documentToken.tokenInfo.dbFormattedToken2) == null) {
                    yield OracleAutoCompletionDatabaseClient.FetchObjectInfo(null, null, null, documentToken.tokenInfo.dbFormattedToken2, intellisenseRequests_1.SchemaObjectType.Schema, documentToken.documentId);
                }
            }
            if (oracleCompletionItem != null) {
                let object = yield OracleAutoCompletionDatabaseClient.FetchObjectInfo(oracleCompletionItem, oracleCompletionItem.name, null, documentToken.connectedSchema, oracleCompletionItem.objectType, documentToken.documentId);
                if (object != null) {
                    completionItems = object.GetCompletionItemsFromSubObjectList(documentToken.tokenInfo.dbFormattedToken1, documentToken.tokenPosition, maximumObjectstoDisplay, providerType);
                }
                if (completionItems.length == 0 && providerType === intellisenseRequests_1.IntelliSenseProviderType.Definition &&
                    oracleCompletionItem.objectType === intellisenseRequests_1.SchemaObjectType.Package) {
                    completionItems.push(oracleCompletionItem.createDummyPackageMember(documentToken.tokenInfo.dbFormattedToken1));
                }
            }
            else {
                if (this.SchemaList.has(documentToken.tokenInfo.dbFormattedToken2)) {
                    objectList = this.SchemaList.get(documentToken.tokenInfo.dbFormattedToken2);
                    completionItems = yield this.getMatchingObjectsFromDictionary(documentToken, true, objectList, maximumObjectstoDisplay, providerType, []);
                }
            }
            return completionItems;
        });
    }
    GetObjectsFromThreeTokens(documentToken, maximumObjectstoDisplay, providerType) {
        return __awaiter(this, void 0, void 0, function* () {
            var completionItems = new Array();
            var objectList = null;
            if (this.SchemaList.has(documentToken.tokenInfo.dbFormattedToken3)) {
                if (this.SchemaList.get(documentToken.tokenInfo.dbFormattedToken3) == null) {
                    yield OracleAutoCompletionDatabaseClient.FetchObjectInfo(null, null, null, documentToken.tokenInfo.dbFormattedToken3, intellisenseRequests_1.SchemaObjectType.Schema, documentToken.documentId);
                }
                objectList = this.SchemaList.get(documentToken.tokenInfo.dbFormattedToken3);
                if (objectList != null && objectList.has(documentToken.tokenInfo.dbFormattedToken2)) {
                    var oracleCompletionItem = objectList.get(documentToken.tokenInfo.dbFormattedToken2);
                    let object = yield OracleAutoCompletionDatabaseClient.FetchObjectInfo(oracleCompletionItem, oracleCompletionItem.name, null, documentToken.tokenInfo.dbFormattedToken3, oracleCompletionItem.objectType, documentToken.documentId);
                    if (object != null) {
                        completionItems = object.GetCompletionItemsFromSubObjectList(documentToken.tokenInfo.dbFormattedToken1, documentToken.tokenPosition, maximumObjectstoDisplay, providerType);
                    }
                    if (completionItems.length == 0 && providerType === intellisenseRequests_1.IntelliSenseProviderType.Definition &&
                        oracleCompletionItem.objectType === intellisenseRequests_1.SchemaObjectType.Package) {
                        completionItems.push(oracleCompletionItem.createDummyPackageMember(documentToken.tokenInfo.dbFormattedToken1));
                    }
                }
            }
            return completionItems;
        });
    }
    getAllObjectsForSchema(schema) {
        return this.SchemaList.has(schema) ? this.SchemaList.get(schema) : null;
    }
    updateAllobjectsFetched(schema, fetchedStatus) {
        let objectList = this.getAllObjectsForSchema(schema);
        if (objectList != null) {
            objectList.updateAllobjectsFetchedStatus(fetchedStatus);
        }
    }
    specificTypeObjectsFetched(objectType, schema) {
        let objectList = this.getAllObjectsForSchema(schema);
        return objectList != null ? objectList.specificTypeFetched(objectType) : false;
    }
    updateSpecificTypeobjectsFetched(objectType, schema, fetchedStatus) {
        let objectList = this.getAllObjectsForSchema(schema);
        if (objectList != null) {
            objectList.updateSpecificTypeObjectFetched(objectType, fetchedStatus);
        }
    }
    allObjectsFetched(schema) {
        let objectList = this.getAllObjectsForSchema(schema);
        return objectList != null ? objectList.allObjectsFetched() : false;
    }
    sortAllobjects(schema) {
        let objectList = this.getAllObjectsForSchema(schema);
        if (objectList != null) {
            objectList.IntelliSenseDictKeys = objectList.IntelliSenseDictKeys.sort((a, b) => { return OracleAutoCompletionUtils.compareString(a, b); });
        }
    }
    addAllObjectsToCache(connectedUser, allObjectsData) {
        allObjectsData.forEach(allObjectData => {
            let objectList = null;
            if (this.SchemaList.has(allObjectData.owner)) {
                objectList = this.SchemaList.get(allObjectData.owner);
                if (objectList == null) {
                    objectList = new IntelliSenseDataDictionary();
                    this.SchemaList.set(allObjectData.owner, objectList);
                }
            }
            else {
                objectList = new IntelliSenseDataDictionary();
                this.SchemaList.set(allObjectData.owner, objectList);
            }
            if (objectList != null && !objectList.has(allObjectData.name)) {
                let item = new OracleCompletionItem();
                item.name = allObjectData.name;
                item.owner = allObjectData.owner;
                item.objectType = allObjectData.type;
                item.subObjects = null;
                item.quoteNeeded = allObjectData.quoteNeeded;
                objectList.set(allObjectData.name, item);
                objectList.IntelliSenseDictKeys.push(allObjectData.name);
            }
        });
    }
    getObjectFromAllObjectsCache(schema, name, needClonedObject, fetchSchema, documentID) {
        return __awaiter(this, void 0, void 0, function* () {
            let objectList = this.getAllObjectsForSchema(schema);
            if (objectList == null && fetchSchema) {
                yield OracleAutoCompletionDatabaseClient.FetchObjectInfo(null, null, null, schema, intellisenseRequests_1.SchemaObjectType.Schema, documentID);
                objectList = this.getAllObjectsForSchema(schema);
            }
            let oracleCompletionItem = null;
            if (objectList != null) {
                oracleCompletionItem = objectList.has(name) ? objectList.get(name) : null;
                oracleCompletionItem === null || oracleCompletionItem === void 0 ? void 0 : oracleCompletionItem.populateItemInfo(null);
                oracleCompletionItem = needClonedObject ? oracleCompletionItem === null || oracleCompletionItem === void 0 ? void 0 : oracleCompletionItem.getClonedItem() : null;
            }
            return oracleCompletionItem;
        });
    }
    addColumnCompletionItem(columnCompletionItem) {
        var objectList;
        if (this.SchemaList.has(columnCompletionItem.owner)) {
            objectList = this.SchemaList.get(columnCompletionItem.owner);
            if (objectList != null && objectList.has(columnCompletionItem.parentName)) {
                let tableCompletionItem = objectList.get(columnCompletionItem.parentName);
                tableCompletionItem.addCompletionItem(columnCompletionItem);
            }
        }
    }
}
exports.OracleAllObjects = OracleAllObjects;
class OracleAllTableColumns {
    constructor() {
        this.ColumnList = new IntelliSenseDataDictionary();
    }
    ClearList() {
        this.ColumnList.ClearList();
    }
    getColumnDetail(items, objNameCase = intellisenseModels_1.Casing.None) {
        var list = '', modifiedKey;
        var index = 0;
        for (const [key, value] of items) {
            if (list.length > 128) {
                list = `${list.substr(0, 127)}...`;
                break;
            }
            else {
                if (index > 0) {
                    list = list.concat(",");
                }
                if (key) {
                    if (key.toLowerCase() == key)
                        modifiedKey = key;
                    else
                        modifiedKey = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(key, objNameCase);
                    list = list.concat(modifiedKey);
                }
            }
            index++;
        }
        return list;
    }
    GetObjectsFromOneToken(documentToken, maximumObjectstoDisplay, columnsToExclude, providerType) {
        var completionItems = new Array();
        var matchingObjectKeys = providerType == intellisenseRequests_1.IntelliSenseProviderType.Hover ?
            this.ColumnList.has(documentToken.tokenInfo.dbFormattedToken1) ? [documentToken.tokenInfo.dbFormattedToken1] : [] :
            this.ColumnList.GetMatchingObjectKeys(documentToken.tokenInfo.dbFormattedToken1, maximumObjectstoDisplay);
        if (matchingObjectKeys.length > 0) {
            for (var idx = 0; idx < matchingObjectKeys.length; idx++) {
                if (columnsToExclude.indexOf(matchingObjectKeys[idx]) < 0) {
                    let columnItem = this.getColumnCompletionItem(matchingObjectKeys[idx], this.ColumnList.get(matchingObjectKeys[idx]), documentToken.connectedSchema, providerType);
                    columnItem.setSortText();
                    completionItems.push(columnItem);
                }
            }
        }
        return completionItems;
    }
    getColumnCompletionItem(columnName, columnData, connectedSchema, providerType) {
        let completionItem = new OracleCompletionItem();
        completionItem.name = columnName;
        completionItem.detail = localizedConstants_1.default.column;
        completionItem.completionItemKind = vscode.CompletionItemKind.Struct;
        completionItem.quoteNeeded = columnData.quoteNeeded;
        completionItem.objectType = intellisenseRequests_1.SchemaObjectType.TableColumn;
        completionItem.owner = connectedSchema;
        if (providerType === intellisenseRequests_1.IntelliSenseProviderType.Hover) {
            completionItem.columnData = columnData;
            completionItem.updateCasing(providerType);
        }
        else if (columnData.columnDocumentation == undefined) {
            let markDownString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString();
            markDownString.appendNameValueString(localizedConstants_1.default.schemas, `${this.getColumnDetail(columnData.schemas)}`);
            markDownString.appendNameValueString(localizedConstants_1.default.tables, `${this.getColumnDetail(columnData.tables)}`);
            completionItem.documentation = markDownString;
        }
        return completionItem;
    }
    getTables(columnName) {
        let tables = new Array();
        let columnData = null;
        if (this.ColumnList.has(columnName)) {
            columnData = this.ColumnList.get(columnName);
            for (const [key, value] of columnData.tables) {
                tables.push(key);
            }
        }
        return tables;
    }
}
exports.OracleAllTableColumns = OracleAllTableColumns;
class OraclePublicSynonyms {
    constructor() {
        this.PublicSynonym = new IntelliSenseDataDictionary();
    }
    ClearList() {
        this.PublicSynonym.ClearList();
    }
    GetObjectsFromOneToken(documentToken, maximumObjectstoDisplay, providerType) {
        return __awaiter(this, void 0, void 0, function* () {
            var matchedObjectList = new Array();
            var completionItem = null;
            var matchingObjectKeys = [];
            if (providerType !== intellisenseRequests_1.IntelliSenseProviderType.AutoComplete) {
                if (this.PublicSynonym.has(documentToken.tokenInfo.dbFormattedToken1)) {
                    completionItem = this.PublicSynonym.get(documentToken.tokenInfo.dbFormattedToken1);
                    if (completionItem.parentObjectType === null || completionItem.parentObjectType === undefined) {
                        let response = yield OracleAutoCompletionDatabaseClient.FetchParentType(documentToken, completionItem.tableOwner, completionItem.objectType, [completionItem.tableName]);
                        if (response != null && response.length > 0) {
                            completionItem.parentObjectType = response[0].objectType;
                        }
                    }
                    completionItem = yield OracleAutoCompletionDatabaseClient.FetchObjectInfo(completionItem, completionItem.name, null, null, completionItem.objectType, documentToken.documentId);
                    if (completionItem != null) {
                        matchedObjectList = completionItem.GetCompletionItemsFromSubObjectList(documentToken.tokenInfo.dbFormattedToken1, documentToken.tokenPosition, maximumObjectstoDisplay, providerType);
                    }
                    matchingObjectKeys = [documentToken.tokenInfo.dbFormattedToken1];
                }
            }
            else
                matchingObjectKeys = this.PublicSynonym.GetMatchingObjectKeys(documentToken.tokenInfo.dbFormattedToken1, maximumObjectstoDisplay);
            if (matchingObjectKeys.length > 0) {
                matchingObjectKeys.forEach(key => {
                    completionItem = this.PublicSynonym.get(key);
                    completionItem.populateItemInfo(documentToken.tokenPosition);
                    matchedObjectList.push(completionItem);
                });
            }
            return matchedObjectList;
        });
    }
    GetObjectsFromTwoToken(documentToken, maximumObjectstoDisplay, providerType) {
        return __awaiter(this, void 0, void 0, function* () {
            var matchedObjectList = new Array();
            var oracleCompletionItem = null;
            if (this.PublicSynonym.has(documentToken.tokenInfo.dbFormattedToken2)) {
                oracleCompletionItem = this.PublicSynonym.get(documentToken.tokenInfo.dbFormattedToken2);
                if ((oracleCompletionItem.parentObjectType === null || oracleCompletionItem.parentObjectType === undefined)
                    && oracleCompletionItem.tableName) {
                    let response = yield OracleAutoCompletionDatabaseClient.FetchParentType(documentToken, oracleCompletionItem.tableOwner, oracleCompletionItem.objectType, [oracleCompletionItem.tableName]);
                    if (response != null && response.length > 0) {
                        oracleCompletionItem.parentObjectType = response[0].objectType;
                    }
                }
                oracleCompletionItem = yield OracleAutoCompletionDatabaseClient.FetchObjectInfo(oracleCompletionItem, oracleCompletionItem.name, null, documentToken.connectedSchema, oracleCompletionItem.objectType, documentToken.documentId);
                if (oracleCompletionItem != null) {
                    matchedObjectList = oracleCompletionItem.GetCompletionItemsFromSubObjectList(documentToken.tokenInfo.dbFormattedToken1, documentToken.tokenPosition, maximumObjectstoDisplay, providerType);
                    if (matchedObjectList.length == 0 && providerType === intellisenseRequests_1.IntelliSenseProviderType.Definition &&
                        oracleCompletionItem.objectType === intellisenseRequests_1.SchemaObjectType.Package) {
                        matchedObjectList.push(oracleCompletionItem.createDummyPackageMember(documentToken.tokenInfo.dbFormattedToken2));
                    }
                }
            }
            return matchedObjectList;
        });
    }
}
exports.OraclePublicSynonyms = OraclePublicSynonyms;
class OracleAutoCompletionDatabaseClient {
    constructor() {
    }
    static getOracleCompletionItemFromObject(object) {
        var item = new OracleCompletionItem();
        item.name = object.name;
        item.owner = object.owner;
        item.parentName = object.parentName;
        item.objectType = object.objectType;
        item.dataType = object.dataType;
        item.nullable = object.nullable;
        item.subObjects = object.subObjects;
        item.methodArgumentList = object.methodArgumentList;
        item.detail = object.detail;
        item.quoteNeeded = object.quoteNeeded;
        return item;
    }
    static getOracleCompletionItemFromObjectList(objectList) {
        var itemList = new Array();
        var item = null;
        objectList.forEach(element => {
            item = OracleAutoCompletionDatabaseClient.getOracleCompletionItemFromObject(element);
            itemList.push(item);
        });
        return itemList;
    }
    static FetchObjectFromStaticStore(item) {
        if (item.subObjects == null) {
            var completionItem1 = new OracleCompletionItem();
            var completionItem2 = new OracleCompletionItem();
            completionItem1.name = 'CURRVAL';
            completionItem1.objectType = intellisenseRequests_1.SchemaObjectType.ObjectAttribute;
            completionItem1.owner = item.owner;
            completionItem1.parentName = item.quoteNeeded ? `"${item.name}"` : item.name;
            completionItem2.name = 'NEXTVAL';
            completionItem2.objectType = intellisenseRequests_1.SchemaObjectType.ObjectAttribute;
            completionItem2.owner = item.owner;
            completionItem2.parentName = item.quoteNeeded ? `"${item.name}"` : item.name;
            item.subObjects = new Array();
            item.subObjects.push(completionItem1);
            item.subObjects.push(completionItem2);
        }
        return item;
    }
    static FetchObjectInfo(item, objectName, chileObjectName, schemaName, objectType, documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            let retCompletionItem = item;
            var fetchfromDB = false;
            var populateMethodList = false;
            var fetchSchema = false;
            switch (objectType) {
                case intellisenseRequests_1.SchemaObjectType.Sequence:
                    fetchfromDB = false;
                    retCompletionItem = OracleAutoCompletionDatabaseClient.FetchObjectFromStaticStore(item);
                    break;
                case intellisenseRequests_1.SchemaObjectType.Schema:
                    fetchSchema = true;
                    break;
                case intellisenseRequests_1.SchemaObjectType.PackageMethod:
                case intellisenseRequests_1.SchemaObjectType.StoredProcedure:
                case intellisenseRequests_1.SchemaObjectType.Function:
                    if (!item.methodArgumentList) {
                        fetchfromDB = true;
                        populateMethodList = true;
                    }
                    break;
                case intellisenseRequests_1.SchemaObjectType.Synonym:
                case intellisenseRequests_1.SchemaObjectType.PublicSynonym:
                    if (!item.methodArgumentList && !item.subObjects) {
                        fetchfromDB = true;
                        populateMethodList = false;
                    }
                    break;
                default:
                    if (!item.subObjects) {
                        fetchfromDB = true;
                        populateMethodList = false;
                    }
                    break;
            }
            if (fetchSchema) {
                yield OracleAutoCompletionDatabaseClient.languageServerClient.sendRequest(LangService.IntelliSenseFetchObjectsForSchema.type, new intellisenseRequests_1.FetchSubObjectRequestRequestParameter(null, null, schemaName, objectType, documentId, 0)).
                    then(objects => {
                }, error => {
                    var errorMsg = `error while fetching data for schema ${schemaName} , docURI ${documentId}`;
                    OracleAutoCompletionUtils.LogErrorWithMessage(errorMsg, error);
                });
            }
            else if (fetchfromDB) {
                let schemaToUse = schemaName;
                if (item.tableName && item.parentObjectType !== null && item.parentObjectType !== undefined &&
                    (item.objectType === intellisenseRequests_1.SchemaObjectType.PublicSynonym || item.objectType === intellisenseRequests_1.SchemaObjectType.Synonym)) {
                    schemaToUse = item.tableOwner;
                    objectName = item.tableName;
                    objectType = item.parentObjectType;
                }
                const config = vscode.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName);
                if (config && config.has(constants_1.Constants.synonymDepth)) {
                    let synonymDepth = config.get(constants_1.Constants.synonymDepth);
                    yield OracleAutoCompletionDatabaseClient.languageServerClient.sendRequest(intellisenseRequests_1.IntelliSenseFetchSubObjectRequest.type, new intellisenseRequests_1.FetchSubObjectRequestRequestParameter(objectName, chileObjectName, schemaToUse, objectType, documentId, synonymDepth)).
                        then(objects => {
                        if (objects != null) {
                            let fetchingDataForSynonym = (item.objectType === intellisenseRequests_1.SchemaObjectType.Synonym || item.objectType === intellisenseRequests_1.SchemaObjectType.PublicSynonym);
                            let positiveResponseAndDataToProcess = objects && objects.length == 1 && objects[0] && objects[0].methodArgumentList && intellisenseRequests_1.SchemaObjectType.PackageMethod != objects[0].objectType;
                            if (!populateMethodList && fetchingDataForSynonym && positiveResponseAndDataToProcess) {
                                populateMethodList = true;
                            }
                            if (populateMethodList) {
                                item.methodArgumentList = objects[0].methodArgumentList;
                            }
                            else {
                                item.subObjects = OracleAutoCompletionDatabaseClient.getOracleCompletionItemFromObjectList(objects);
                            }
                            retCompletionItem = item;
                        }
                        else {
                            var errorMsg = `null object received from server for object ${objectName} , schema ${schemaToUse} , 
                            objectType ${OracleAutoCompletionUtils.GetSchemaObjectTypeDisplayName(objectType)} , docURI ${documentId}`;
                            OracleAutoCompletionUtils.LogErrorWithMessage(errorMsg, null);
                            retCompletionItem = null;
                        }
                    }, error => {
                        OracleAutoCompletionUtils.LogObjectFetchError(objectName, chileObjectName, schemaToUse, objectType, documentId, error);
                        retCompletionItem = null;
                    });
                }
            }
            return retCompletionItem;
        });
    }
    static FetchAllSameSchemaObject(schema, objectType, documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield OracleAutoCompletionDatabaseClient.languageServerClient.sendRequest(intellisenseRequests_1.IntelliSenseFetchSameSchemaObjects.request, new intellisenseRequests_1.FetchSubObjectRequestRequestParameter(null, null, schema, objectType, documentId, 0)).
                then(objects => {
            }, error => {
                var errorMsg = `error while fetching data for schema ${schema} , docURI ${documentId}`;
                OracleAutoCompletionUtils.LogErrorWithMessage(errorMsg, error);
            });
        });
    }
    static FetchParentType(documentToken, key, ObjectType, item) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield OracleAutoCompletionDatabaseClient.languageServerClient.sendRequest(intellisenseRequests_1.IntelliSenseFetchParentTypeForObjects.type, new intellisenseRequests_1.FetchMultipleObjectsRequestParameter(documentToken.documentId, key, ObjectType, item));
                return response;
            }
            catch (e) {
                helper.logErroAfterValidating(e);
                return new Array();
            }
        });
    }
    static FetchMultipleobjects(documentID, connectedSchema, objectType, objectNameList) {
        return __awaiter(this, void 0, void 0, function* () {
            let objects = null;
            var message = null;
            try {
                yield OracleAutoCompletionDatabaseClient.languageServerClient.sendRequest(intellisenseRequests_1.IntelliSenseFetchMultipleObjectsRequest.type, new intellisenseRequests_1.FetchMultipleObjectsRequestParameter(documentID, connectedSchema, objectType, objectNameList)).
                    then(data => {
                    if (data != null && data != undefined) {
                        objects = OracleAutoCompletionDatabaseClient.getOracleCompletionItemFromObjectList(data);
                    }
                }, error => {
                    objects = null;
                    message = `Error while fetching data for type ${OracleAutoCompletionUtils.GetSchemaObjectTypeDisplayName(objectType)} 
                                  docId : ${documentID} Schema ${connectedSchema}`;
                    OracleAutoCompletionUtils.LogErrorWithMessage(message, error);
                    helper.logErroAfterValidating(error);
                });
            }
            catch (error) {
                message = `Error while fetching data for type ${OracleAutoCompletionUtils.GetSchemaObjectTypeDisplayName(objectType)} 
            docId : ${documentID} Schema ${connectedSchema}`;
                helper.logErroAfterValidating(error);
            }
            return objects;
        });
    }
}
exports.OracleAutoCompletionDatabaseClient = OracleAutoCompletionDatabaseClient;
OracleAutoCompletionDatabaseClient.languageServerClient = oracleLanguageServerClient_1.OracleLanguageServerClient.instance;
class OracleCompletionItem {
    constructor() {
        this.caseSettings = null;
        this.detail = null;
        this.completionItemKind = vscode_1.CompletionItemKind.Property;
        this.insertText = null;
        this.documentation = null;
        this.hoverData = null;
        this.canPushItem = true;
        this.aliasName = null;
        this.aliasDisplayName = null;
        this.aliasedItemName = null;
        this.aliasedItemDisplayName = null;
        this.aliasedExpressionDisplayName = null;
        this.subObjects = null;
        this.methodArgumentList = null;
        this.quoteNeeded = false;
    }
    setTableName(connectedSchema) {
        if (this.name && this.owner && this.owner != connectedSchema) {
            let schema = this.owner;
            let name = this.name;
            if (!oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(this.owner)) {
                schema = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(this.owner, oracleDocumentIntelliSenseManager.instance.getCaseSettings().objectNameCase);
            }
            if (this.quoteNeeded && !oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(this.name)) {
                name = `"${this.name}"`;
            }
            this.schemaQualifiedName = `${schema}.${name}`;
        }
    }
    setSortText() {
        let sortText = "U";
        switch (this.objectType) {
            case intellisenseRequests_1.SchemaObjectType.Asteric:
                sortText = "D";
                break;
            case intellisenseRequests_1.SchemaObjectType.TableViewSubqueryAllColumn:
                sortText = "E";
                break;
            case intellisenseRequests_1.SchemaObjectType.TableColumn:
                sortText = "F";
                break;
            case intellisenseRequests_1.SchemaObjectType.Table:
                sortText = "G";
                break;
            case intellisenseRequests_1.SchemaObjectType.View:
                sortText = "H";
                break;
            case intellisenseRequests_1.SchemaObjectType.StaticSQLFunction:
            case intellisenseRequests_1.SchemaObjectType.Function:
                sortText = "I";
                break;
        }
        this.sortText = sortText;
    }
    GetCompletionItemsFromSubObjectList(token2, tokenPostion, maximumObjectstoDisplay, providerType) {
        var completionItems = new Array();
        var partialMatch = providerType == intellisenseRequests_1.IntelliSenseProviderType.AutoComplete;
        var element = null;
        var items = this.subObjects;
        if (items != null) {
            for (var idx = 0; idx < items.length; idx++) {
                element = items[idx];
                if (this.quoteNeeded)
                    element.parentName = `"${this.name}"`;
                if (partialMatch) {
                    if (token2 != null && !(element.name.includes(token2))) {
                        continue;
                    }
                    if (element.objectType == intellisenseRequests_1.SchemaObjectType.PackageMethod) {
                        var completionList = element.getCompletionItemFromMethodArgumentList(tokenPostion, false);
                        completionList.forEach(item => {
                            completionItems.push(item);
                        });
                    }
                    else {
                        element.populateItemInfo(tokenPostion);
                        completionItems.push(element);
                    }
                }
                else {
                    if (token2 != null && (element.name == token2)) {
                        element.updateCasing(providerType);
                        completionItems.push(element);
                        break;
                    }
                }
                if (completionItems.length == maximumObjectstoDisplay) {
                    break;
                }
            }
        }
        else {
            if (this.methodArgumentList != null && Object.keys(this.methodArgumentList).length > 0) {
                this.updateCasing(providerType);
                completionItems.push(this);
            }
        }
        return completionItems;
    }
    updateCasing(providerType) {
        let newSetting = oracleDocumentIntelliSenseManager.instance.getCaseSettings();
        let updateName = false, updateKeyword = false;
        if (this.caseSettings === null) {
            updateName = updateKeyword = true;
        }
        else {
            updateKeyword = this.caseSettings.keywordCase !== newSetting.keywordCase;
            updateName = this.caseSettings.objectNameCase !== newSetting.objectNameCase;
        }
        if (updateName) {
            this.displayName = this.quoteNeeded && this.objectType != intellisenseRequests_1.SchemaObjectType.TableViewSubqueryAllColumn ? `"${this.name}"` :
                oracleLanguageFeaturesHelper_1.CasingHelper.setCase(this.name, newSetting.objectNameCase);
            this.displayOwner = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(this.owner, newSetting.objectNameCase);
            this.parentName = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(this.parentName, newSetting.objectNameCase);
        }
        if (this.dataType)
            this.dataType = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(this.dataType, newSetting.keywordCase);
        if (this.nullable)
            this.nullable = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(this.nullable, newSetting.keywordCase);
        if (updateKeyword || updateName) {
            this.caseSettings = newSetting;
            if (this.objectType !== intellisenseRequests_1.SchemaObjectType.TableColumn)
                this.documentation = null;
            this.hoverData = null;
            this.caseSettings = newSetting;
            if (providerType !== intellisenseRequests_1.IntelliSenseProviderType.AutoComplete) {
                if (this.methodArgumentList) {
                    let sortedList = OracleAutoCompletionUtils.sortListOnParameterCount(this.methodArgumentList);
                    let parameters;
                    if (sortedList && sortedList.length > 0)
                        sortedList.forEach(keyValItem => {
                            parameters = keyValItem[1];
                            OracleAutoCompletionUtils.setMethodArgumentCasing(parameters, newSetting);
                        });
                }
            }
        }
    }
    populateItemDetailAndDocumentation() {
        let detail = this.detail;
        let documentation = this.documentation;
        let markDownString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString();
        switch (this.objectType) {
            case intellisenseRequests_1.SchemaObjectType.Table:
                detail = localizedConstants_1.default.tableAliasForDetail;
                markDownString.appendNameValueString(localizedConstants_1.default.alias, this.aliasDisplayName);
                markDownString.appendNameValueString(localizedConstants_1.default.tableName, this.aliasedItemDisplayName);
                markDownString.appendNameValueString(localizedConstants_1.default.schema, this.displayOwner);
                documentation = markDownString;
                break;
            case intellisenseRequests_1.SchemaObjectType.View:
                detail = localizedConstants_1.default.viewAliasForDetail;
                markDownString.appendNameValueString(localizedConstants_1.default.alias, this.aliasDisplayName);
                markDownString.appendNameValueString(localizedConstants_1.default.viewName, this.aliasedItemDisplayName);
                markDownString.appendNameValueString(localizedConstants_1.default.schema, this.displayOwner);
                documentation = markDownString;
                break;
            case intellisenseRequests_1.SchemaObjectType.SubqueryAlias:
                detail = localizedConstants_1.default.subqueryAliasForDetail;
                markDownString.appendNameValueString(localizedConstants_1.default.alias, this.aliasDisplayName);
                markDownString.appendNameValueString(localizedConstants_1.default.tableExpression, this.aliasedItemDisplayName);
                documentation = markDownString;
                break;
            case intellisenseRequests_1.SchemaObjectType.SubqueryTableColumn:
                detail = localizedConstants_1.default.column;
                markDownString.appendNameValueString(localizedConstants_1.default.tableExpression, this.aliasedExpressionDisplayName);
                documentation = markDownString;
                break;
            case intellisenseRequests_1.SchemaObjectType.SubqueryTableColumnAlias:
                detail = localizedConstants_1.default.columnAliasForDetail;
                markDownString.appendNameValueString(localizedConstants_1.default.alias, this.aliasDisplayName);
                markDownString.appendNameValueString(localizedConstants_1.default.column, this.aliasedItemDisplayName);
                markDownString.appendNameValueString(localizedConstants_1.default.tableExpression, this.aliasedExpressionDisplayName);
                documentation = markDownString;
                break;
        }
        this.detail = detail;
        this.documentation = documentation;
    }
    populateItemInfo(tokenPostion) {
        let codeObject = false;
        this.updateCasing(intellisenseRequests_1.IntelliSenseProviderType.AutoComplete);
        switch (this.objectType) {
            case intellisenseRequests_1.SchemaObjectType.StoredProcedure:
            case intellisenseRequests_1.SchemaObjectType.Function:
            case intellisenseRequests_1.SchemaObjectType.PackageMethod:
            case intellisenseRequests_1.SchemaObjectType.StaticSQLFunction:
                codeObject = true;
                var sortedList = OracleAutoCompletionUtils.sortListOnParameterCount(this.methodArgumentList);
                var parameters = sortedList.length > 0 ? sortedList[0][1] : null;
                OracleAutoCompletionUtils.setMethodArgumentCasing(parameters, this.caseSettings);
                this.populateMethodDetailAndDocumentation(parameters, this.caseSettings.keywordCase);
                this.insertText = this.getTextToInsert(parameters, tokenPostion, false, this.caseSettings.objectNameCase);
                this.completionItemKind = vscode_1.CompletionItemKind.Method;
                break;
            case intellisenseRequests_1.SchemaObjectType.TableColumn:
            case intellisenseRequests_1.SchemaObjectType.Asteric:
            case intellisenseRequests_1.SchemaObjectType.SubqueryTableColumn:
            case intellisenseRequests_1.SchemaObjectType.SubqueryTableColumnAlias:
            case intellisenseRequests_1.SchemaObjectType.TableViewSubqueryAllColumn:
                this.completionItemKind = vscode_1.CompletionItemKind.Struct;
                break;
            case intellisenseRequests_1.SchemaObjectType.View:
                this.completionItemKind = vscode_1.CompletionItemKind.Enum;
                break;
            case intellisenseRequests_1.SchemaObjectType.Table:
            case intellisenseRequests_1.SchemaObjectType.SubqueryAlias:
                this.completionItemKind = vscode_1.CompletionItemKind.Constant;
                break;
            case intellisenseRequests_1.SchemaObjectType.PublicSynonym:
            case intellisenseRequests_1.SchemaObjectType.Synonym:
                this.completionItemKind = vscode_1.CompletionItemKind.Reference;
                if (this.methodArgumentList == null) {
                    break;
                }
                var sortedList = OracleAutoCompletionUtils.sortListOnParameterCount(this.methodArgumentList);
                var parameters = sortedList.length > 0 ? sortedList[0][1] : null;
                OracleAutoCompletionUtils.setMethodArgumentCasing(parameters, this.caseSettings);
                this.populateMethodDetailAndDocumentation(parameters, this.caseSettings.keywordCase);
                this.insertText = this.getTextToInsert(parameters, tokenPostion, false, this.caseSettings.objectNameCase);
                break;
            case intellisenseRequests_1.SchemaObjectType.Package:
                this.completionItemKind = vscode_1.CompletionItemKind.Class;
                break;
            case intellisenseRequests_1.SchemaObjectType.ObjectAttribute:
                this.completionItemKind = vscode_1.CompletionItemKind.Value;
                break;
            default:
                this.detail = this.getItemDetail();
                break;
        }
        if (!codeObject) {
            if (this.detail == null) {
                this.detail = this.getItemDetail();
            }
            if (this.documentation == null) {
                let markDownString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString();
                markDownString.appendNameValueString(localizedConstants_1.default.name, this.displayName);
                if (this.objectType == intellisenseRequests_1.SchemaObjectType.TableColumn && this.parentName.length > 0) {
                    markDownString.appendNameValueString(localizedConstants_1.default.table_view, this.parentName);
                }
                if (this.objectType == intellisenseRequests_1.SchemaObjectType.ObjectAttribute && this.parentName.length > 0) {
                    markDownString.appendNameValueString(localizedConstants_1.default.sequenceName, this.parentName);
                }
                markDownString.appendNameValueString(localizedConstants_1.default.schema, this.displayOwner);
                this.documentation = markDownString;
            }
        }
    }
    getItemDetail() {
        return `${OracleAutoCompletionUtils.GetSchemaObjectTypeDisplayName(this.objectType)}`;
    }
    getTextToInsert(parameters, tokenPostion, forStaticFunction, objNameCase) {
        var methodName = this.quoteNeeded ? `"${this.name}"` : this.displayName;
        if (parameters == null) {
            return new vscode.SnippetString(`${methodName}()`);
        }
        let parameterList = new Array();
        let formattedString = null;
        let placeHolder = objNameCase == intellisenseModels_1.Casing.Uppercase ? 'P_' : 'p_';
        if (forStaticFunction) {
            for (var paramIdx = 0; paramIdx < parameters.length; paramIdx++) {
                let nameInfo = '';
                if (parameters[paramIdx].direction != "RETURN" && parameters[paramIdx].direction != "return") {
                    if (parameters[paramIdx].name != "") {
                        nameInfo = parameters[paramIdx].name;
                    }
                    if (parameters[paramIdx].dataType != "") {
                        nameInfo = (nameInfo == '') ? parameters[paramIdx].dataType : nameInfo + ` ${parameters[paramIdx].dataType}`;
                    }
                    parameterList.push(nameInfo);
                }
            }
            var identetaion = tokenPostion != null && tokenPostion.position != null ? tokenPostion.getStartingPositionForNewLine(methodName) : 0;
            let space = " ";
            parameterList.forEach((paramterInfo, index) => {
                if (formattedString != null) {
                    formattedString += `\${${index + 1}:${placeHolder}} /*${paramterInfo.trim()}*/`;
                }
                else {
                    formattedString = `\${${index + 1}:${placeHolder}} /*${paramterInfo.trim()}*/`;
                }
                if (index < parameterList.length - 1 && parameterList.length > 1) {
                    formattedString += `,\r\n${space.repeat(identetaion)}`;
                }
            });
        }
        else {
            for (var paramIdx = 0; paramIdx < parameters.length; paramIdx++) {
                if (parameters[paramIdx].direction != "RETURN" && parameters[paramIdx].direction != "return") {
                    parameterList.push(OracleAutoCompletionUtils.getFormattedParamter(parameters[paramIdx].name, parameters[paramIdx].direction, parameters[paramIdx].dataType));
                }
            }
            var identetaion = tokenPostion != null ? tokenPostion.getStartingPositionForNewLine(methodName) : 0;
            let space = " ";
            parameterList.forEach((type, index) => {
                const [argName, argType] = type.split("=>");
                if (formattedString != null) {
                    formattedString += `${argName} => \${${index + 1}:${placeHolder}} /*${argType.trim()}*/`;
                }
                else {
                    formattedString = `${argName} => \${${index + 1}:${placeHolder}} /*${argType.trim()}*/`;
                }
                if (index < parameterList.length - 1 && parameterList.length > 1) {
                    formattedString += `,\r\n${space.repeat(identetaion)}`;
                }
            });
        }
        let finalStringToInsert = formattedString == null ? `${methodName}()` : `${methodName}(${formattedString})`;
        return new vscode.SnippetString(finalStringToInsert).appendTabstop(0);
    }
    getCompletionItemFromMethodArgumentList(tokenPostion, forStaticFunction) {
        let completionItems = new Array();
        var sortedList = OracleAutoCompletionUtils.sortListOnParameterCount(this.methodArgumentList);
        for (var idx = 0; idx < sortedList.length; idx++) {
            var paramObjectList = sortedList[idx][1];
            var caseSettings = oracleDocumentIntelliSenseManager.instance.getCaseSettings();
            OracleAutoCompletionUtils.setMethodArgumentCasing(paramObjectList, caseSettings);
            var completionItem = new OracleCompletionItem();
            completionItem.name = this.name;
            completionItem.objectType = this.objectType;
            completionItem.parentName = this.parentName;
            completionItem.owner = this.owner;
            completionItem.quoteNeeded = this.quoteNeeded;
            completionItem.completionItemKind = vscode.CompletionItemKind.Method;
            completionItem.methodArgumentList = this.methodArgumentList;
            completionItem.updateCasing(intellisenseRequests_1.IntelliSenseProviderType.AutoComplete);
            completionItem.populateMethodDetailAndDocumentation(paramObjectList, caseSettings.keywordCase);
            completionItem.insertText = completionItem.getTextToInsert(paramObjectList, tokenPostion, forStaticFunction, caseSettings.objectNameCase);
            completionItems.push(completionItem);
        }
        return completionItems;
    }
    populateMethodDetailAndDocumentation(paramObjectList, keywordCase) {
        var signature = '';
        if (paramObjectList == null) {
            signature = this.quoteNeeded ? `"${this.name}"()` : `${this.displayName}()`;
        }
        else {
            var { label, isFunction } = OracleAutoCompletionUtils.getMethodSignatureLabel(paramObjectList, this.quoteNeeded ? `"${this.name}"` : this.displayName, null, keywordCase);
            signature = label;
        }
        if (this.detail == null) {
            this.detail = isFunction ? localizedConstants_1.default.function : localizedConstants_1.default.procedure;
            if (this.objectType === intellisenseRequests_1.SchemaObjectType.Synonym)
                this.detail = localizedConstants_1.default.synonym;
            else if (this.objectType === intellisenseRequests_1.SchemaObjectType.PublicSynonym)
                this.detail = localizedConstants_1.default.publicSynonym;
        }
        let markDownString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString();
        markDownString.appendNameValueString(localizedConstants_1.default.name, this.displayName);
        if (this.objectType == intellisenseRequests_1.SchemaObjectType.PackageMethod) {
            markDownString.appendNameValueString(localizedConstants_1.default.packageName, this.parentName);
        }
        if (this.owner != undefined) {
            markDownString.appendNameValueString(localizedConstants_1.default.schema, this.displayOwner);
        }
        markDownString.appendNameValueString(null, signature);
        this.documentation = markDownString;
    }
    createDummyPackageMember(name) {
        let packageMember = new OracleCompletionItem();
        packageMember.name = name;
        packageMember.owner = this.owner;
        packageMember.parentName = this.quoteNeeded ? `"${this.name}"` : this.name;
        packageMember.objectType = intellisenseRequests_1.SchemaObjectType.PackageMember;
        return packageMember;
    }
    getAstericOracleCompletionItem() {
        this.insertText = new vscode.SnippetString('*');
        this.name = "*";
        this.objectType = intellisenseRequests_1.SchemaObjectType.Asteric;
        this.completionItemKind = vscode.CompletionItemKind.Struct;
        this.detail = localizedConstants_1.default.allColumns;
        this.setSortText();
        return this;
    }
    getAllColumnDisplayName(tableOrAliasName, prependTableorAliasName, nameSeparator) {
        let displayName = prependTableorAliasName ? `${tableOrAliasName}${nameSeparator}(${localizedConstants_1.default.allColumns})` : `(${localizedConstants_1.default.allColumns})`;
        displayName = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(displayName, oracleDocumentIntelliSenseManager.instance.getCaseSettings().objectNameCase);
        return displayName;
    }
    getALLColumnsForTableOrView(allColumnsList, tableOrAliasName, prependNameToAllColsDisplayName, prependNametoColumns, prependNameToFirstColumn, nameSeparator) {
        let commaSeparatedList = OracleAutoCompletionUtils.getCommaSeparatedList(allColumnsList, tableOrAliasName, prependNameToFirstColumn, prependNametoColumns);
        this.name = this.getAllColumnDisplayName(tableOrAliasName, prependNameToAllColsDisplayName, nameSeparator);
        this.insertText = new vscode.SnippetString(commaSeparatedList);
        this.detail = localizedConstants_1.default.allColumns;
        this.objectType = intellisenseRequests_1.SchemaObjectType.TableViewSubqueryAllColumn;
        this.completionItemKind = vscode.CompletionItemKind.Struct;
        this.setSortText();
        return this;
    }
    addCompletionItem(completionItem) {
        if (this.subObjects == null) {
            this.subObjects = new Array();
        }
        if (this.canPushItem) {
            this.subObjects.push(completionItem);
        }
    }
    getClonedItem() {
        let completionItem = new OracleCompletionItem();
        completionItem.owner = this.owner;
        completionItem.displayOwner = this.displayOwner;
        completionItem.name = this.name;
        completionItem.displayName = this.displayName;
        completionItem.caseSettings = this.caseSettings;
        completionItem.parentName = this.parentName;
        completionItem.objectType = this.objectType;
        completionItem.dataType = this.dataType;
        completionItem.subObjects = this.subObjects;
        completionItem.methodArgumentList = this.methodArgumentList;
        completionItem.detail = this.detail;
        completionItem.tableName = this.tableName;
        completionItem.tableOwner = this.tableOwner;
        completionItem.quoteNeeded = this.quoteNeeded;
        completionItem.completionItemKind = this.completionItemKind;
        completionItem.insertText = this.insertText;
        completionItem.documentation = this.documentation;
        completionItem.sortText = this.sortText;
        completionItem.hoverData = this.hoverData;
        completionItem.columnData = this.columnData;
        completionItem.aliasName = this.aliasName;
        completionItem.aliasDisplayName = this.aliasDisplayName;
        completionItem.aliasedItemName = this.aliasedItemName;
        completionItem.aliasedItemDisplayName = this.aliasedItemDisplayName;
        completionItem.aliasedExpressionDisplayName = this.aliasedExpressionDisplayName;
        completionItem.filterText = this.filterText;
        completionItem.schemaQualifiedName = this.schemaQualifiedName;
        return completionItem;
    }
    getDuplicateAllColumnItem(sortText, documentToken, donotPrependAliasToFirstColumn = true, prefixForSecondColsOnwards = null) {
        let oracleCompletionItem = null;
        oracleCompletionItem = this.getClonedItem();
        let aliasName = null;
        let prependPrefixToColumns = false;
        let separator = " ";
        let name = null;
        let prependPrefixToFirstColumn = false;
        if (prefixForSecondColsOnwards) {
            aliasName = prefixForSecondColsOnwards;
            prependPrefixToColumns = true;
            separator = " ";
            name = oracleCompletionItem.displayName ? oracleCompletionItem.displayName : oracleCompletionItem.name;
            prependPrefixToFirstColumn = false;
        }
        else {
            aliasName = this.aliasDisplayName;
            prependPrefixToColumns = aliasName ? true : false;
            separator = aliasName ? "." : " ";
            name = aliasName ? aliasName : oracleCompletionItem.displayName ? oracleCompletionItem.displayName : oracleCompletionItem.name;
            prependPrefixToFirstColumn = !donotPrependAliasToFirstColumn ? false : prependPrefixToColumns;
        }
        if (oracleCompletionItem.quoteNeeded) {
            oracleCompletionItem.filterText = oracleCompletionItem.name;
            if (!oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(name)) {
                name = `"${name}"`;
            }
        }
        let allColsSuffix = `${separator}(${oracleLanguageFeaturesHelper_1.CasingHelper.setCase(localizedConstants_1.default.allColumns, oracleDocumentIntelliSenseManager.instance.getCaseSettings().objectNameCase)})`;
        let formattedName = `${name}${allColsSuffix}`;
        oracleCompletionItem.schemaQualifiedName = oracleCompletionItem.schemaQualifiedName ?
            `${oracleCompletionItem.schemaQualifiedName}${allColsSuffix}` : oracleCompletionItem.schemaQualifiedName;
        oracleCompletionItem.displayName = formattedName;
        oracleCompletionItem.name = formattedName;
        oracleCompletionItem.sortText = sortText;
        oracleCompletionItem.detail = localizedConstants_1.default.allColumns;
        oracleCompletionItem.completionItemKind = vscode.CompletionItemKind.Struct;
        oracleCompletionItem.documentation = null;
        oracleCompletionItem.objectType = intellisenseRequests_1.SchemaObjectType.TableViewSubqueryAllColumn;
        if (this.subObjects != null) {
            let objects = OracleAutoCompletionUtils.getArrayListFromCompletionList(this.subObjects, documentToken, oracleCompletionItem.quoteNeeded);
            oracleCompletionItem.insertText = new vscode.SnippetString(OracleAutoCompletionUtils.getCommaSeparatedList(objects, aliasName, prependPrefixToFirstColumn, prependPrefixToColumns));
        }
        return oracleCompletionItem;
    }
}
exports.OracleCompletionItem = OracleCompletionItem;
class OracleAutoCompletionUtils {
    static getFormattedParamter(name, direction, type) {
        return `${name} => ${direction} ${type}`;
    }
    static getParameterReturnType(type) {
        return ` => ${type} `;
    }
    static setMethodArgumentCasing(argumentList, caseSettings) {
        if (argumentList === undefined || argumentList === null)
            return;
        argumentList.forEach(param => {
            param.name = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(param.name, caseSettings.objectNameCase);
            param.dataType = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(param.dataType, caseSettings.keywordCase);
            param.direction = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(param.direction, caseSettings.keywordCase);
        });
    }
    static getMethodSignatureLabel(paramObjectList, methodName, parameterInformationList, keywordCase) {
        var retDetail = null;
        var isFunction = false;
        var argumentList = '';
        var argCounter = 0;
        var optionalParameter = false;
        var showEnclosingParenthesis = true;
        for (var paramIdx = 0; paramIdx < paramObjectList.length; paramIdx++) {
            if (paramObjectList[paramIdx].direction != "RETURN" && paramObjectList[paramIdx].direction != "return") {
                var paraminfo;
                optionalParameter = false;
                if (paramObjectList[paramIdx].hasOwnProperty('optional') &&
                    paramObjectList[paramIdx]['optional'] === constants_1.Constants.optionalParamTrue) {
                    optionalParameter = true;
                }
                if (argCounter > 0 && !optionalParameter) {
                    argumentList = argumentList.concat(', ');
                }
                if (paramObjectList[paramIdx].hasOwnProperty('name') &&
                    paramObjectList[paramIdx].name && paramObjectList[paramIdx].name.length > 0) {
                    paraminfo = paramObjectList[paramIdx].name + ' ';
                }
                if (paramObjectList[paramIdx].hasOwnProperty('direction') &&
                    paramObjectList[paramIdx].direction && paramObjectList[paramIdx].direction.length > 0) {
                    if (paraminfo != undefined) {
                        paraminfo = `${paraminfo}${paramObjectList[paramIdx].direction} `;
                    }
                    else {
                        paraminfo = `${paramObjectList[paramIdx].direction} `;
                    }
                }
                if (paramObjectList[paramIdx].hasOwnProperty('dataType') && paramObjectList[paramIdx].dataType.length > 0) {
                    if (paraminfo != undefined) {
                        paraminfo = `${paraminfo}${paramObjectList[paramIdx].dataType}`;
                    }
                    else {
                        paraminfo = `${paramObjectList[paramIdx].dataType} `;
                    }
                    paraminfo = paraminfo.trimEnd();
                }
                if (optionalParameter) {
                    paraminfo = argCounter === 0 ? `[${paraminfo}]` : ` [, ${paraminfo}]`;
                }
                argCounter++;
                argumentList = argumentList.concat(paraminfo);
                if (parameterInformationList != null) {
                    parameterInformationList.push(new vscode.ParameterInformation(paraminfo));
                }
            }
            else {
                var returns = keywordCase == intellisenseModels_1.Casing.Uppercase ? 'RETURNS' : 'returns';
                retDetail = `${returns} ${paramObjectList[paramIdx].dataType}`;
                if (paramObjectList[paramIdx].hasOwnProperty('hideparenthesis')) {
                    showEnclosingParenthesis = false;
                }
            }
        }
        if (showEnclosingParenthesis) {
            argumentList = `(${argumentList})`;
        }
        var sigStr = `${methodName}${argumentList}`;
        if (retDetail != null) {
            sigStr = `${sigStr} ${retDetail}`;
            isFunction = true;
        }
        return { label: sigStr, isFunction: isFunction };
    }
    static sortListOnParameterCount(argumentList) {
        var sortable = [];
        for (var key in argumentList)
            sortable.push([key, argumentList[key]]);
        sortable.sort(function (a, b) {
            var x = a[1].length;
            var y = b[1].length;
            return x < y ? -1 : x > y ? 1 : 0;
        });
        return sortable;
    }
    static GetSchemaObjectTypeDisplayName(objectType) {
        var objectDisplayName = '';
        if (OracleAutoCompletionUtils.objectTypeVsString.size == 0) {
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.Table, localizedConstants_1.default.table);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.View, localizedConstants_1.default.view);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.StoredProcedure, localizedConstants_1.default.procedure);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.Function, localizedConstants_1.default.function);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.StaticSQLFunction, localizedConstants_1.default.function);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.Package, localizedConstants_1.default.package);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.Synonym, localizedConstants_1.default.synonym);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.PackageMethod, localizedConstants_1.default.packageMethod);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.TableColumn, localizedConstants_1.default.column);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.Sequence, localizedConstants_1.default.sequence);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.ObjectAttribute, localizedConstants_1.default.sequenceValue);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.PublicSynonym, localizedConstants_1.default.publicSynonym);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.Schema, localizedConstants_1.default.schemaUppr);
        }
        if (OracleAutoCompletionUtils.objectTypeVsString.has(objectType)) {
            objectDisplayName = OracleAutoCompletionUtils.objectTypeVsString.get(objectType);
        }
        else {
            objectDisplayName = objectType ? objectType.toString() : objectDisplayName;
        }
        return objectDisplayName;
    }
    static LogObjectFetchError(objectName, chileObjectName, schemaToUse, objectType, documentId, error) {
        var errorMsg = '';
        if (objectName != null && objectName != undefined) {
            errorMsg += "Object Name : " + objectName;
        }
        if (chileObjectName != null && chileObjectName != undefined) {
            errorMsg += " Child Object Name : " + chileObjectName;
        }
        if (objectType != null && objectType != undefined) {
            errorMsg += " objectType : " + OracleAutoCompletionUtils.GetSchemaObjectTypeDisplayName(objectType);
        }
        if (schemaToUse != null && schemaToUse != undefined) {
            errorMsg += " Schema  : " + schemaToUse;
        }
        if (documentId != null && documentId != undefined) {
            errorMsg += " Doc URI : " + documentId;
        }
        if (error && error.message) {
            errorMsg += " Error : " + error.message;
        }
        logger_1.FileStreamLogger.Instance.error(errorMsg);
    }
    static LogErrorWithMessage(message, error) {
        var errorMsg = message;
        if (error && error.message) {
            errorMsg += error.message;
        }
        logger_1.FileStreamLogger.Instance.error(errorMsg);
    }
    static compareString(s1, s2) {
        s1 = s1.toLocaleLowerCase();
        s2 = s2.toLocaleLowerCase();
        return s1 < s2 ? -1 : (s1 > s2 ? 1 : 0);
    }
    static LogError(tokeninfo, error) {
        var errorMsg = '';
        if (tokeninfo != undefined) {
            errorMsg = "Error for Token : " + tokeninfo.getToken();
        }
        if (error && error.message) {
            errorMsg += error.message;
        }
        logger_1.FileStreamLogger.Instance.error(errorMsg);
    }
    static getTokenCountAndTokenInfo(tokenResponse, isTokenSpaceKey = false) {
        var tokenInfo = new TokenInfo();
        if (tokenResponse != null && tokenResponse != undefined) {
            tokenInfo.commaCount = tokenResponse.commaCount;
            tokenInfo.paramList = tokenResponse.paramList;
            tokenInfo.tokenTerminator = tokenResponse.tokenTerminator;
            tokenInfo.ctrlSpaceKeyPressed = tokenResponse.ctrlSpaceKeyPressed;
            tokenInfo.stmtContext = tokenResponse.stmtContext;
            tokenInfo.stmtSubType = tokenResponse.stmtSubType;
            tokenInfo.stmtType = tokenResponse.stmtType;
            tokenInfo.parameterToken = tokenResponse.parameterToken;
            if (tokenResponse.token3 != null && tokenResponse.token2 != null &&
                ((tokenResponse.token1 == null && tokenResponse.tokenTerminator == intellisenseRequests_1.TokenTerminator.EndWithDOT) || (tokenResponse.token1 != null && tokenResponse.tokenTerminator != intellisenseRequests_1.TokenTerminator.EndWithDOT))) {
                tokenInfo.count = 3;
                tokenInfo.token1 = tokenResponse.token1;
                tokenInfo.token2 = tokenResponse.token2;
                tokenInfo.token3 = tokenResponse.token3;
                tokenInfo.dbFormattedToken1 = tokenResponse.dbFormattedToken1;
                tokenInfo.dbFormattedToken2 = tokenResponse.dbFormattedToken2;
                tokenInfo.dbFormattedToken3 = tokenResponse.dbFormattedToken3;
            }
            else if (tokenResponse.token2 != null && tokenResponse.token1 == null &&
                ((tokenResponse.token3 == null && tokenResponse.tokenTerminator == intellisenseRequests_1.TokenTerminator.EndWithDOT) ||
                    (tokenResponse.token3 != null && tokenResponse.tokenTerminator != intellisenseRequests_1.TokenTerminator.EndWithDOT))) {
                tokenInfo.count = 2;
                if (tokenResponse.tokenTerminator == intellisenseRequests_1.TokenTerminator.EndWithDOT) {
                    tokenInfo.token2 = tokenResponse.token2;
                    tokenInfo.token1 = null;
                    tokenInfo.dbFormattedToken2 = tokenResponse.dbFormattedToken2;
                    tokenInfo.dbFormattedToken1 = null;
                }
                else {
                    tokenInfo.token2 = tokenResponse.token3;
                    tokenInfo.token1 = tokenResponse.token2;
                    tokenInfo.dbFormattedToken2 = tokenResponse.dbFormattedToken3;
                    tokenInfo.dbFormattedToken1 = tokenResponse.dbFormattedToken2;
                }
            }
            else if ((tokenResponse.token2 != null && tokenResponse.token3 == null && tokenResponse.token1 == null && tokenResponse.tokenTerminator != intellisenseRequests_1.TokenTerminator.EndWithDOT)
                || isTokenSpaceKey
                || (tokenResponse.ctrlSpaceKeyPressed && tokenResponse.token3 == null && tokenResponse.token2 == null && tokenResponse.token1 == null)) {
                tokenInfo.count = 1;
                tokenInfo.token1 = tokenResponse.token2;
                tokenInfo.dbFormattedToken1 = tokenResponse.dbFormattedToken2;
            }
            else if (tokenResponse.token2 == null && tokenResponse.token3 == null && tokenResponse.token1 == null
                && (tokenResponse.tokenTerminator == intellisenseRequests_1.TokenTerminator.EndForSignatureProvider || tokenResponse.tokenTerminator == intellisenseRequests_1.TokenTerminator.EndWithDOT)) {
                tokenInfo.count = 0;
            }
            else
                tokenInfo.count = 0;
        }
        return tokenInfo;
    }
    static getSelection(position) {
        return {
            startLine: position.line,
            startColumn: position.character,
            endLine: position.line,
            endColumn: position.character,
        };
    }
    static getTokenSortText(token, scope) {
        let sortText = null;
        if (this.spaceKeySortTextDict == null) {
            this.spaceKeySortTextDict.set("*", " ");
            this.spaceKeySortTextDict.set("ALL_COLUMNS", "!");
            this.spaceKeySortTextDict.set("ALIAS", '"');
            this.spaceKeySortTextDict.set("TABLE_IN_SCOPE", "#");
            this.spaceKeySortTextDict.set("TABLE", "$");
            this.spaceKeySortTextDict.set("VIEW", "$");
        }
        switch (scope) {
            case scopeType.spaceKey:
                if (this.spaceKeySortTextDict.has(token)) {
                    sortText = this.spaceKeySortTextDict.get(token);
                }
                break;
            case scopeType.fromClause:
                break;
            case scopeType.whereClause:
                break;
            case scopeType.orderByClause:
                break;
        }
        return sortText;
    }
    static getCommaSeparatedList(allColumnsList, tableOrAliasName, prependNameforFirstColumn, prependNametoColumns) {
        let commaSeparatedColumns = "";
        let prefixName = tableOrAliasName != null && prependNametoColumns;
        let caseSetting = oracleDocumentIntelliSenseManager.instance.getCaseSettings();
        let firstColumn = true;
        let tempName = "";
        allColumnsList.forEach(item => {
            tempName = item;
            if (firstColumn) {
                tempName = prependNameforFirstColumn ? `${tableOrAliasName}.${tempName}` : tempName;
                commaSeparatedColumns = tempName;
                firstColumn = false;
            }
            else {
                tempName = prefixName ? `${tableOrAliasName}.${tempName}` : tempName;
                commaSeparatedColumns = commaSeparatedColumns + ', ' + tempName;
            }
        });
        return commaSeparatedColumns;
    }
    static getArrayListFromCompletionList(completionList, documentToken, quoteParentObject) {
        let nameList = new Array();
        let caseSetting = oracleDocumentIntelliSenseManager.instance.getCaseSettings();
        completionList.forEach(item => {
            let name = null;
            if (item.aliasDisplayName) {
                name = item.aliasDisplayName;
            }
            else {
                name = item.quoteNeeded ? `"${item.name}"` : oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.name, caseSetting.objectNameCase);
                if (documentToken && item.parentName
                    && (documentToken.connectedSchema != item.owner
                        || (documentToken.tokenInfo.count == 2 && documentToken.tokenInfo.dbFormattedToken2 == documentToken.connectedSchema))) {
                    item.parentName = quoteParentObject && !oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(item.parentName) ? `"${item.parentName}"` : oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.parentName, caseSetting.objectNameCase);
                    name = `${item.parentName}.${name}`;
                }
            }
            nameList.push(name);
        });
        return nameList;
    }
    static getVSCodeCompletionItem(oracleCompletionItem, sortText = "U", ignoreCaseSetting = false) {
        var _a;
        let vsCodeItem = null;
        let objNameCase = oracleDocumentIntelliSenseManager.instance.intelliSenseObjectNameCase;
        if (sortText == null || sortText == undefined) {
            sortText = "U";
        }
        if (oracleCompletionItem.quoteNeeded != undefined && oracleCompletionItem.quoteNeeded) {
            if (oracleCompletionItem.schemaQualifiedName) {
                vsCodeItem = new vscode.CompletionItem(`${oracleCompletionItem.schemaQualifiedName}`);
                vsCodeItem.filterText = oracleCompletionItem.filterText ? oracleCompletionItem.filterText : oracleCompletionItem.name;
            }
            else if (oracleCompletionItem.objectType == intellisenseRequests_1.SchemaObjectType.TableViewSubqueryAllColumn) {
                vsCodeItem = new vscode.CompletionItem(oracleCompletionItem.name);
                vsCodeItem.filterText = oracleCompletionItem.filterText;
            }
            else {
                vsCodeItem = new vscode.CompletionItem(`"${oracleCompletionItem.name}"`);
                vsCodeItem.filterText = oracleCompletionItem.name;
            }
            vsCodeItem.sortText = oracleCompletionItem.sortText ? oracleCompletionItem.sortText : sortText;
        }
        else {
            let name = oracleCompletionItem.schemaQualifiedName ? oracleCompletionItem.schemaQualifiedName : oracleCompletionItem.name;
            vsCodeItem = new vscode.CompletionItem(ignoreCaseSetting ? name : oracleLanguageFeaturesHelper_1.CasingHelper.setCase(name, objNameCase));
            vsCodeItem.sortText = oracleCompletionItem.sortText != null ? oracleCompletionItem.sortText : sortText;
        }
        vsCodeItem.documentation = (_a = oracleCompletionItem.documentation) === null || _a === void 0 ? void 0 : _a.markedDownString;
        vsCodeItem.detail = oracleCompletionItem.detail;
        vsCodeItem.kind = oracleCompletionItem.completionItemKind;
        if (oracleCompletionItem.insertText != null) {
            vsCodeItem.insertText = oracleCompletionItem.insertText;
        }
        else {
            vsCodeItem.insertText = vsCodeItem.label;
        }
        return vsCodeItem.label ? vsCodeItem : null;
    }
    static getVscodeListFromCompletionList(completionList, sortText = null, ignoreCaseSetting = false) {
        var vsCodeList = new vscode.CompletionList();
        completionList.forEach(element => {
            let item = this.getVSCodeCompletionItem(element, sortText, ignoreCaseSetting);
            if (item)
                vsCodeList.items.push(item);
        });
        return vsCodeList;
    }
    static itemExists(item, list) {
        let exists = false;
        for (let idx = 0; idx < list.items.length; idx++) {
            if (list.items[idx].label == item) {
                exists = true;
                break;
            }
        }
        return exists;
    }
    static getOracleCompletionItem(objectType, colItem) {
        let item = new OracleCompletionItem();
        item.name = colItem.name;
        item.dataType = colItem.dataType;
        item.nullable = colItem.nullable;
        item.owner = colItem.owner;
        item.parentName = colItem.tableName;
        item.quoteNeeded = colItem.quoteNeeded;
        item.objectType = objectType;
        return item;
    }
    static getAllObjectsData(allColoumnsData) {
        let allObjectsData = new intellisenseRequests_1.AllObjectsData();
        allObjectsData.name = allColoumnsData.tableName;
        allObjectsData.owner = allColoumnsData.owner;
        allObjectsData.quoteNeeded = allColoumnsData.quoteNeeded;
        allObjectsData.type = intellisenseRequests_1.SchemaObjectType.Undefined;
        return allObjectsData;
    }
    static getArrayListFromVSCodeCompletionList(completionList) {
        let nameList = new Array();
        let caseSetting = oracleDocumentIntelliSenseManager.instance.getCaseSettings();
        completionList.items.forEach(item => {
            nameList.push(oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.label, caseSetting.objectNameCase));
        });
        return nameList;
    }
}
exports.OracleAutoCompletionUtils = OracleAutoCompletionUtils;
OracleAutoCompletionUtils.objectTypeVsString = new Map();
OracleAutoCompletionUtils.MaximumItemstoDisplay = 3500;
OracleAutoCompletionUtils.MaximumItemstoDisplayForStaticData = 500;
OracleAutoCompletionUtils.MaximumObjectstoDisplay = 5000;
OracleAutoCompletionUtils.fileLogger = logger.FileStreamLogger.Instance;
OracleAutoCompletionUtils.connectedSchemaSortText = "0";
OracleAutoCompletionUtils.spaceKeySortTextDict = null;
OracleAutoCompletionUtils.fromClauseSortTextDict = null;
OracleAutoCompletionUtils.whereClauseSortTextDict = null;
OracleAutoCompletionUtils.orderByClauseSortTextDict = null;
var scopeType;
(function (scopeType) {
    scopeType[scopeType["spaceKey"] = 1] = "spaceKey";
    scopeType[scopeType["fromClause"] = 2] = "fromClause";
    scopeType[scopeType["whereClause"] = 3] = "whereClause";
    scopeType[scopeType["orderByClause"] = 4] = "orderByClause";
})(scopeType = exports.scopeType || (exports.scopeType = {}));
class TokenPositionHelper {
    constructor(tokenInfo, position, document, scopeItems = null) {
        this.tokenInfo = tokenInfo;
        this.position = position;
        this.document = document;
        this.scopeItems = scopeItems;
    }
    getFirstNonWhitespaceCharacterIndex() {
        return this.document.lineAt(this.position).firstNonWhitespaceCharacterIndex;
    }
    getStartingPositionForNewLine(token) {
        var offset = 0;
        var userEnteredtokenLength = 0;
        if (this.tokenInfo != null) {
            userEnteredtokenLength = this.tokenInfo.token1 != null ? this.tokenInfo.token1.length : 0;
        }
        offset = token != null ? (token.length - userEnteredtokenLength) : userEnteredtokenLength;
        var position = (this.position.character - this.getFirstNonWhitespaceCharacterIndex()) + offset + 1;
        return (position > 0 ? position : 0);
    }
}
exports.TokenPositionHelper = TokenPositionHelper;
class TokenInfo {
    constructor() {
        this.token3 = null;
        this.token2 = null;
        this.token1 = null;
        this.dbFormattedToken3 = null;
        this.dbFormattedToken2 = null;
        this.dbFormattedToken1 = null;
        this.tokenTerminator = intellisenseRequests_1.TokenTerminator.None;
        this.commaCount = 0;
        this.count = 0;
        this.aliasInfo = new oracleLanguageFeaturesHelper_1.AliasInfo();
        this.stmtSubType = oracleAutoCompletionHelper_1.OracleSQLPlusStmtSubType.G_S_UNKNOWN;
        this.ctrlSpaceKeyPressed = false;
        this.stmtContext = oracleAutoCompletionHelper_1.StatementContext.unknown;
        this.stmtType = oracleAutoCompletionHelper_1.OracleSQLPlusStmtType.G_C_UNKNOWN;
    }
    getToken() {
        var tokenText = undefined;
        switch (this.count) {
            case 1:
                tokenText = this.token1;
                break;
            case 2:
                tokenText = (this.token1 != null) ? `${this.token2}.${this.token1}` : `${this.token2}.`;
                break;
            case 3:
                tokenText = (this.token1 != null) ? `${this.token3}.${this.token2}.${this.token1}` : `${this.token3}.${this.token2}.`;
                break;
            default:
                break;
        }
        return tokenText;
    }
}
exports.TokenInfo = TokenInfo;
class oracleDocumentIntelliSenseManager {
    constructor() {
        this.intelliSenseEnableForOracleVSCode = true;
        this.intelliSenseKeywordCase = intellisenseModels_1.Casing.Uppercase;
        this.intelliSenseObjectNameCase = intellisenseModels_1.Casing.Uppercase;
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(LangService.IntelliSenseAllObjectsDataNotification.event, this.OnIntelliSenseAllObjectsData());
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(LangService.IntelliSensePublicSynonymsDataNotification.event, this.OnIntelliSensePublicSynonymsData());
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(LangService.IntelliSenseColumnsDataNotification.event, this.OnIntelliSenseAllColumnsData());
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(LangService.IntelliSenseSchemaListDataNotification.event, this.OnIntelliSenseSchemaListData());
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(LangService.IntelliSenseSynonymsDataNotification.event, this.OnIntelliSenseSynonymsData());
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(LangService.IntelliSenseAllSameSchemaObjectsDataNotification.event, this.OnIntelliSenseAllSameSchemaObjectsData());
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(LangService.IntelliSenseReadyNotification.event, this.intellisenseServiceReadyEventHandler());
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(LangService.ClearIntelliSenseNotification.event, this.OnClearIntelliSenseCache());
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(LangService.rebuildIntelliSenseOnReconnectEvent.event, this.onRebuildIntelliSenseOnReconnect());
        this.intelliSenseData = new Map();
        vscode.workspace.onDidChangeConfiguration((param) => { this.onConfigurationChanged(param); });
        this.setIntelliSenseGlobalSetting();
    }
    setStatusBarManager(statusbarMgr) {
        this.statusBarManager = statusbarMgr;
    }
    updateStatusBarManager(fileUri, msg) {
        this.statusBarManager.displayLangServiceStatus(fileUri, helper.stringFormatterCsharpStyle(localizedConstants_1.default.updatingIntellisenseObjectMessage, msg));
    }
    static get instance() {
        if (oracleDocumentIntelliSenseManager.varInstance == undefined) {
            var tempInstance = new oracleDocumentIntelliSenseManager();
            oracleDocumentIntelliSenseManager.varInstance = tempInstance;
        }
        return oracleDocumentIntelliSenseManager.varInstance;
    }
    getCaseSettings() {
        return new intellisenseModels_1.CaseSettings(this.intelliSenseKeywordCase, this.intelliSenseObjectNameCase);
    }
    getIntelliSenseObjectforDocument(uri) {
        var intelliSenseData = null;
        if (this.intelliSenseData.has(uri)) {
            intelliSenseData = this.intelliSenseData.get(uri);
        }
        else {
            intelliSenseData = new oracleIntelliSenseInfo();
        }
        return intelliSenseData;
    }
    cacheIntelliSenseAllObjectsData(event) {
        try {
            var connectedOrOtherUser = '';
            if (this.intelliSenseData != null) {
                var data = this.getIntelliSenseObjectforDocument(event.ownerUri);
                connectedOrOtherUser = data.ConnectedUser === event.schema ? "connected" : "other";
                fileLogger.info(`all_objects data received for user: ${connectedOrOtherUser}`);
                this.updateStatusBarManager(event.ownerUri, `${event.schema}`);
                data.AllObjectList.addAllObjectsToCache(data.ConnectedUser === event.schema, event.objectList);
                data.AllObjectList.sortAllobjects(event.schema);
                this.intelliSenseData.set(event.ownerUri, data);
                fileLogger.info(`processed all_objects data received for user: ${connectedOrOtherUser}`);
            }
        }
        catch (error) {
            fileLogger.error(`cacheIntelliSenseAllObjectsData(): error: ${this.getErrorMessage(error)}`);
        }
    }
    cacheIntelliSenseAllSameSchemaObjectsData(event) {
        try {
            var connectedOrOtherUser = '';
            if (this.intelliSenseData != null) {
                var data = this.getIntelliSenseObjectforDocument(event.ownerUri);
                connectedOrOtherUser = data.ConnectedUser === event.schema ? "connected" : "other";
                fileLogger.info(`all_objects data received for user: ${connectedOrOtherUser}`);
                this.updateStatusBarManager(event.ownerUri, `${event.schema}`);
                data.AllObjectList.addAllObjectsToCache(data.ConnectedUser === event.schema, event.objectList);
                data.AllObjectList.sortAllobjects(event.schema);
                this.intelliSenseData.set(event.ownerUri, data);
                this.updateSynonymsOfCurrentSchema(data.AllObjectList, event.ownerUri, data.ConnectedUser, event.schema);
                fileLogger.info(`processed all_objects data received for user: ${connectedOrOtherUser}`);
            }
        }
        catch (error) {
            fileLogger.error(`cacheIntelliSenseAllObjectsData(): error: ${this.getErrorMessage(error)}`);
        }
    }
    updateSynonymsOfCurrentSchema(AllObjectList, documentID, currentSchema, otherSchema) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentSchemObjects = AllObjectList.SchemaList.get(currentSchema);
            let filterSynonym = [];
            if (currentSchemObjects) {
                currentSchemObjects.IntelliSenseDictKeys.forEach((key) => {
                    let item = currentSchemObjects.get(key);
                    if (item.objectType === intellisenseRequests_1.SchemaObjectType.Synonym &&
                        item.tableOwner && item.tableOwner === otherSchema)
                        filterSynonym.push(item);
                });
                AllObjectList.fetchObjectsFromAnotherSchema(filterSynonym, documentID, currentSchema);
            }
        });
    }
    cacheIntelliSenseSynonymsData(event) {
        try {
            var connectedOrOtherUser = '';
            if (this.intelliSenseData != null) {
                var data = this.getIntelliSenseObjectforDocument(event.ownerUri);
                this.updateStatusBarManager(event.ownerUri, `${event.schema}`);
                connectedOrOtherUser = data.ConnectedUser === event.schema ? "connected" : "other";
                fileLogger.info(`all synonym data received for user: ${connectedOrOtherUser}`);
                this.AddSynonymParentOwnerName(data.AllObjectList, event.schema, event.ownerUri, event.publicSynonymList);
                data.AllObjectList.updateSpecificTypeobjectsFetched(intellisenseRequests_1.SchemaObjectType.Synonym, event.schema, true);
                if (data.ConnectedUser === event.schema)
                    this.AddPublicSynonymParentOwnerName(data.AllObjectList, event.schema, event.ownerUri, data.PublicSynonyms);
                fileLogger.info(`processed all_objects data received for user: ${connectedOrOtherUser}`);
            }
        }
        catch (error) {
            fileLogger.error(`cacheIntelliSenseSynonymsData(): error: ${this.getErrorMessage(error)}`);
        }
    }
    AddSynonymParentOwnerName(AllObjectList, schemaName, ownerURI, synonymList) {
        let objectList = AllObjectList.SchemaList.get(schemaName);
        synonymList.forEach((item) => {
            if (objectList.has(item.name)) {
                let obj = objectList.get(item.name);
                obj.tableName = item.tableName;
                obj.tableOwner = item.tableOwner;
            }
        });
        synonymList.forEach((item) => {
            if (objectList.has(item.name)) {
                let obj = objectList.get(item.name);
                this.resolveRootParentNameForSynonym(objectList, obj);
            }
        });
    }
    resolveRootParentNameForSynonym(AllObjectList, item) {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                if (item.tableName) {
                    if (AllObjectList.has(item.tableName)) {
                        let parent = AllObjectList.get(item.tableName);
                        if (parent.name === parent.tableName) {
                            item.tableName = parent.tableName;
                            item.tableOwner = parent.tableOwner;
                            break;
                        }
                        else if (parent.objectType === intellisenseRequests_1.SchemaObjectType.Synonym) {
                            item.tableName = parent.tableName;
                            item.tableOwner = parent.tableOwner;
                        }
                        else if (parent.objectType === intellisenseRequests_1.SchemaObjectType.PublicSynonym) {
                            item.tableName = parent.tableName;
                            item.tableOwner = parent.tableOwner;
                            break;
                        }
                        else {
                            item.parentObjectType = parent.objectType;
                            break;
                        }
                    }
                    else
                        break;
                }
                else
                    break;
            }
        });
    }
    AddPublicSynonymParentOwnerName(AllObjectList, schemaName, ownerURI, synonymList) {
        let objectList = AllObjectList.SchemaList.get(schemaName);
        let publicSynonymList = synonymList.PublicSynonym;
        publicSynonymList.IntelliSenseDictKeys
            .forEach((synonyms) => {
            if (publicSynonymList.has(synonyms)) {
                let item = publicSynonymList.get(synonyms);
                this.resolveRootParentNameForPublicSynonym(publicSynonymList, item, objectList);
            }
        });
    }
    resolveRootParentNameForPublicSynonym(synonymList, item, AllObjectList) {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                if (item.tableName) {
                    if (synonymList.has(item.tableName) || AllObjectList.has(item.tableName)) {
                        let parent = null;
                        if (synonymList.has(item.tableName)) {
                            parent = synonymList.get(item.tableName);
                        }
                        else {
                            parent = AllObjectList.get(item.tableName);
                        }
                        if (parent.name === parent.tableName) {
                            item.tableName = parent.tableName;
                            item.tableOwner = parent.tableOwner;
                            break;
                        }
                        else if (parent.objectType === intellisenseRequests_1.SchemaObjectType.Synonym) {
                            item.tableName = parent.tableName;
                            item.tableOwner = parent.tableOwner;
                            if (parent.subObjects != null) {
                                item.subObjects = parent.subObjects;
                                break;
                            }
                        }
                        else if (parent.objectType === intellisenseRequests_1.SchemaObjectType.PublicSynonym) {
                            item.tableName = parent.tableName;
                            item.tableOwner = parent.tableOwner;
                        }
                        else {
                            item.parentObjectType = parent.objectType;
                            item.subObjects = parent.subObjects;
                            break;
                        }
                    }
                    else
                        break;
                }
                else
                    break;
            }
        });
    }
    cacheIntelliSenseColumnsData(event) {
        try {
            var connectedOrOtherUser = '';
            if (this.intelliSenseData != null) {
                var cachedIntelliSenseData = this.getIntelliSenseObjectforDocument(event.ownerUri);
                connectedOrOtherUser = event.connUser ? "connected" : "other";
                fileLogger.info(`all_tab_columns received for user: ${connectedOrOtherUser}`);
                var cachedColumnList = cachedIntelliSenseData.AllTableColumns.ColumnList;
                this.updateStatusBarManager(event.ownerUri, `${event.schema}`);
                event.columnList.forEach(element => {
                    var colInfo = null;
                    if (cachedColumnList.has(element.name)) {
                        colInfo = cachedColumnList.get(element.name);
                    }
                    else {
                        cachedColumnList.set(element.name, new intellisenseRequests_1.ColumnData());
                        cachedColumnList.IntelliSenseDictKeys.push(element.name);
                    }
                    colInfo = cachedColumnList.get(element.name);
                    colInfo.quoteNeeded = element.quoteNeeded;
                    if (!colInfo.tables.has(element.tableName)) {
                        colInfo.tables.set(element.tableName, { dataType: element.dataType, schema: element.owner, nullable: element.nullable });
                    }
                    if (!colInfo.schemas.has(element.owner)) {
                        colInfo.schemas.set(element.owner, undefined);
                    }
                    cachedIntelliSenseData.AllObjectList.addColumnCompletionItem(OracleAutoCompletionUtils.getOracleCompletionItem(intellisenseRequests_1.SchemaObjectType.TableColumn, element));
                });
                cachedIntelliSenseData.AllObjectList.updateSpecificTypeobjectsFetched(intellisenseRequests_1.SchemaObjectType.Table, event.schema, true);
                cachedColumnList.IntelliSenseDictKeys = cachedColumnList.IntelliSenseDictKeys.sort((a, b) => { return OracleAutoCompletionUtils.compareString(a, b); });
                ;
                this.intelliSenseData.set(event.ownerUri, cachedIntelliSenseData);
                fileLogger.info(`processed all_tab_columns received for user: ${connectedOrOtherUser}`);
            }
        }
        catch (error) {
            fileLogger.error(`cacheIntelliSenseColumnsData(): error: ${this.getErrorMessage(error)}`);
        }
    }
    cacheIntelliSensePublicSynonymsData(event) {
        try {
            var connectedOrOtherUser = '';
            if (this.intelliSenseData != null) {
                var cachedIntelliSenseData = this.getIntelliSenseObjectforDocument(event.ownerUri);
                connectedOrOtherUser = cachedIntelliSenseData.ConnectedUser === event.schema ? "connected" : "other";
                fileLogger.info(`public synoyms received for user: ${connectedOrOtherUser}`);
                var cachedPublicSynonymList = cachedIntelliSenseData.PublicSynonyms.PublicSynonym;
                var item = null;
                this.updateStatusBarManager(event.ownerUri, `${event.schema}`);
                event.publicSynonymList.forEach(element => {
                    if (!element.name.startsWith("javax/") && !element.name.startsWith("com/sun/")
                        && !element.name.startsWith("HTTPClient/") && !element.name.startsWith("org/")
                        && !element.name.startsWith("oracle/")) {
                        item = new OracleCompletionItem();
                        item.name = element.name;
                        item.objectType = intellisenseRequests_1.SchemaObjectType.PublicSynonym;
                        item.owner = this.intelliSenseObjectNameCase == intellisenseModels_1.Casing.Uppercase ? 'PUBLIC' : 'public';
                        item.tableName = element.tableName;
                        item.tableOwner = element.tableOwner;
                        item.quoteNeeded = element.quoteNeeded;
                        cachedPublicSynonymList.IntelliSenseDictKeys.push(element.name);
                        cachedPublicSynonymList.IntelliSenseDict.set(element.name, item);
                    }
                });
                cachedPublicSynonymList.IntelliSenseDictKeys.sort((a, b) => { return OracleAutoCompletionUtils.compareString(a, b); });
                this.intelliSenseData.set(event.ownerUri, cachedIntelliSenseData);
                fileLogger.info(`processed public synonyms received for user: ${connectedOrOtherUser}`);
            }
        }
        catch (error) {
            fileLogger.error(`cacheIntelliSensePublicSynonymsData(): error: ${this.getErrorMessage(error)}`);
        }
    }
    onConfigurationChanged(param) {
        this.setIntelliSenseGlobalSetting();
    }
    setIntelliSenseGlobalSetting() {
        try {
            const config = vscode.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName);
            if (config) {
                const intelliSenseSettings = config[constants_1.Constants.intellisense];
                this.intelliSenseEnableForOracleVSCode = intelliSenseSettings[constants_1.Constants.enableIntelliSense];
                let newKeywordCase = caseMap[config.get(constants_1.Constants.intellisenseKeywordCasingPropertyName)];
                if (this.intelliSenseKeywordCase != newKeywordCase) {
                    this.intelliSenseKeywordCase = newKeywordCase;
                    OracleKeyWordList.clearOracleKeywordList();
                    OracleStaticSQLFunction.clearStaticSQLCompletionList();
                }
                let newObjectNameCase = caseMap[config.get(constants_1.Constants.intellisenseObjectNameCasingPropertyName)];
                if (this.intelliSenseObjectNameCase != newObjectNameCase) {
                    this.intelliSenseObjectNameCase = newObjectNameCase;
                    OracleStaticSQLFunction.clearStaticSQLCompletionList();
                }
            }
        }
        catch (error) {
            fileLogger.error(`setIntelliSenseGlobalSetting(): error: ${this.getErrorMessage(error)}`);
        }
    }
    OnIntelliSenseAllObjectsData() {
        return (event) => {
            this.cacheIntelliSenseAllObjectsData(event);
        };
    }
    OnIntelliSenseAllColumnsData() {
        return (event) => {
            this.cacheIntelliSenseColumnsData(event);
        };
    }
    OnIntelliSenseSchemaListData() {
        return (event) => {
            try {
                fileLogger.info(`schemalist data received.`);
                if (this.intelliSenseData != null) {
                    var data = this.getIntelliSenseObjectforDocument(event.ownerUri);
                    var accessibleSchemaList = event.schemaList;
                    var schemaVsObjectList = data.AllObjectList.SchemaList;
                    this.updateStatusBarManager(event.ownerUri, `${event.schema}`);
                    accessibleSchemaList.forEach(schema => {
                        if (!schemaVsObjectList.has(schema)) {
                            schemaVsObjectList.set(schema, null);
                        }
                    });
                    data.ConnectedUser = event.schema;
                    this.intelliSenseData.set(event.ownerUri, data);
                    fileLogger.info(`processed schemalist data received.`);
                }
            }
            catch (error) {
                fileLogger.error(`OnIntelliSenseSchemaListData(): error: ${this.getErrorMessage(error)}`);
            }
        };
    }
    OnIntelliSenseAllSameSchemaObjectsData() {
        return (event) => {
            this.cacheIntelliSenseAllSameSchemaObjectsData(event);
        };
    }
    intellisenseServiceReadyEventHandler() {
        return (event) => {
            try {
                this.statusBarManager.displayLangServiceStatus(event.uri, "");
                var data = this.getIntelliSenseObjectforDocument(event.uri);
                data.AllObjectList.updateAllobjectsFetched(event.schema, true);
                fileLogger.info("IntelliSense completed for document.");
            }
            catch (error) {
                fileLogger.error(`intellisenseServiceReadyEventHandler(): error: ${this.getErrorMessage(error)}`);
            }
        };
    }
    OnIntelliSensePublicSynonymsData() {
        return (event) => {
            this.cacheIntelliSensePublicSynonymsData(event);
        };
    }
    OnIntelliSenseSynonymsData() {
        return (event) => {
            this.cacheIntelliSenseSynonymsData(event);
        };
    }
    OnClearIntelliSenseCache() {
        return (event) => {
            this.clearCacheForDocument(event.uri);
        };
    }
    getErrorMessage(error) {
        var msg = "";
        if (error && error.message) {
            msg = error.message;
        }
        return msg;
    }
    clearCacheForDocument(connectionURI) {
        try {
            if (this.intelliSenseData.has(connectionURI)) {
                var intelliSenseInfo = this.intelliSenseData.get(connectionURI);
                intelliSenseInfo.ClearList();
                this.intelliSenseData.delete(connectionURI);
                fileLogger.info(`Cache cleared for document.`);
            }
        }
        catch (error) {
            fileLogger.error(`clearCacheForDocument(): error: ${this.getErrorMessage(error)}`);
        }
    }
    updateLanguageFeatureForDocument(docID, enable) {
        if (this.intelliSenseData.has(docID)) {
            var data = this.intelliSenseData.get(docID);
            data.IntellisenseEnable = enable;
            if (enable) {
                fileLogger.info(`intellisense enabled for document.`);
            }
            else {
                fileLogger.info(`intellisense disabled for document.`);
            }
        }
    }
    isLanguageFeaturenableForDocument(docID) {
        try {
            var enable = true;
            if (this.intelliSenseData.has(docID)) {
                var data = this.intelliSenseData.get(docID);
                enable = data.IntellisenseEnable;
            }
        }
        catch (error) {
            fileLogger.error(`isLanguageFeaturenableForDocument(): error: ${this.getErrorMessage(error)}`);
        }
        return enable;
    }
    onRebuildIntelliSenseOnReconnect() {
        return (event) => {
            this.statusBarManager.displayLangServiceStatus(event.ownerUri, localizedConstants_1.default.updatingIntellisenseMessage);
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendNotification(intellisenseRequests_1.RebuildIntelliSenseNotification.event, { uri: event.ownerUri });
        };
    }
}
exports.oracleDocumentIntelliSenseManager = oracleDocumentIntelliSenseManager;
oracleDocumentIntelliSenseManager.varInstance = undefined;
class IntelliSenseDataDictionary {
    constructor() {
        this.fetchedAllObjects = false;
        this.fetchedTableColumns = false;
        this.fetchedAllSynonyms = false;
        this.IntelliSenseDictKeys = new Array();
        this.IntelliSenseDict = new Map();
    }
    ClearList() {
        this.IntelliSenseDict.clear();
        this.fetchedAllObjects = false;
        this.fetchedTableColumns = false;
        this.fetchedAllSynonyms = false;
    }
    updateAllobjectsFetchedStatus(fetched) {
        this.fetchedAllObjects = fetched;
    }
    allObjectsFetched() {
        return this.fetchedAllObjects;
    }
    updateSpecificTypeObjectFetched(objectType, fetched) {
        switch (objectType) {
            case intellisenseRequests_1.SchemaObjectType.Table:
                this.fetchedTableColumns = fetched;
                break;
            case intellisenseRequests_1.SchemaObjectType.Synonym:
                this.fetchedAllSynonyms = fetched;
                break;
        }
    }
    specificTypeFetched(objectType) {
        switch (objectType) {
            case intellisenseRequests_1.SchemaObjectType.Table: return this.fetchedTableColumns;
            case intellisenseRequests_1.SchemaObjectType.Synonym: return this.fetchedAllSynonyms;
            default: return false;
        }
    }
    GetFirstItemUsingBinarySearch(itemToFind) {
        var item = null;
        var idx = this.BinarySearch(0, this.IntelliSenseDictKeys.length - 1, itemToFind);
        if (idx >= 0) {
            item = this.IntelliSenseDictKeys[idx];
        }
        return item;
    }
    get(key) {
        return this.IntelliSenseDict.get(key);
    }
    set(key, columnData) {
        this.IntelliSenseDict.set(key, columnData);
    }
    has(key) {
        return this.IntelliSenseDict.has(key);
    }
    BinarySearch(l, r, item) {
        if (r >= l) {
            let mid = Math.floor(l + (r - l) / 2);
            if (this.IntelliSenseDictKeys[mid].toLocaleLowerCase().startsWith(item.toLocaleLowerCase()))
                return mid;
            if (this.IntelliSenseDictKeys[mid].toLocaleLowerCase() > item.toLocaleLowerCase())
                return this.BinarySearch(l, mid - 1, item);
            return this.BinarySearch(mid + 1, r, item);
        }
        return -1;
    }
    GetMatchingObjectKeys(item, maximumObjectstoDisplay, itemHasContext = false) {
        var matchingObjectList = new Array();
        var count = 0;
        var numberOfObjects = this.IntelliSenseDictKeys.length;
        if ((item == undefined || item == null)) {
            if (itemHasContext || numberOfObjects < OracleAutoCompletionUtils.MaximumItemstoDisplay) {
                count = numberOfObjects;
            }
            else {
                count = OracleAutoCompletionUtils.MaximumItemstoDisplay;
            }
            for (let index = 0; index < count; index++) {
                matchingObjectList.push(this.IntelliSenseDictKeys[index]);
            }
        }
        else {
            for (let index = 0; index < this.IntelliSenseDictKeys.length; index++) {
                if (this.IntelliSenseDictKeys[index].toLocaleLowerCase().includes(item.toLocaleLowerCase())) {
                    matchingObjectList.push(this.IntelliSenseDictKeys[index]);
                    if (matchingObjectList.length == maximumObjectstoDisplay) {
                        break;
                    }
                }
            }
        }
        return matchingObjectList;
    }
}
exports.IntelliSenseDataDictionary = IntelliSenseDataDictionary;
class oracleIntelliSenseInfo {
    constructor() {
        this.AllObjectList = new OracleAllObjects();
        this.PublicSynonyms = new OraclePublicSynonyms();
        this.AllTableColumns = new OracleAllTableColumns();
        this.IntellisenseEnable = true;
        this.buildingIntelliSense = false;
    }
    ClearList() {
        this.AllObjectList.ClearList();
        this.PublicSynonyms.ClearList();
        this.AllTableColumns.ClearList();
    }
}
exports.oracleIntelliSenseInfo = oracleIntelliSenseInfo;
class oracleCompletionItemDataProvider extends oracleSignatureHelpProvider_1.oracleAutoCompletionDataProvider {
    getCombinedlistFromThreeList(vsCodeConnectedObjectList, vsCodeColumnList, vsCodeSynonymList) {
        var vsCodeCompletionList = this.getCombinedList(vsCodeConnectedObjectList, vsCodeColumnList);
        vsCodeCompletionList = this.getCombinedList(vsCodeCompletionList, vsCodeSynonymList);
        return vsCodeCompletionList;
    }
    getCombinedList(vsCodeConnectedObjectList, vsCodeColumnList) {
        var vsCodeCompletionList = vsCodeConnectedObjectList;
        vsCodeColumnList.items.forEach(codeitem => {
            vsCodeConnectedObjectList.items.push(codeitem);
        });
        return vsCodeCompletionList;
    }
    handleThreePartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            var vsCodeList = new vscode.CompletionList();
            if (this.oracleIntelliSenseDataMgr.intelliSenseData.has(documentToken.documentId)) {
                let completionList = null;
                var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
                if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                    completionList = yield allobjectList.GetObjectsFromThreeTokens(documentToken, OracleAutoCompletionUtils.MaximumObjectstoDisplay, intellisenseRequests_1.IntelliSenseProviderType.AutoComplete);
                    if ((documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.select_list || documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.select_term)
                        && completionList && completionList.length > 0 && completionList[0].objectType == intellisenseRequests_1.SchemaObjectType.TableColumn) {
                        yield this.addAstericAndAllColumnCompletionItem(completionList, documentToken);
                    }
                    vsCodeList = OracleAutoCompletionUtils.getVscodeListFromCompletionList(completionList);
                }
            }
            return vsCodeList;
        });
    }
    getMatchingStaticKeywordList(vsCodeList, documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            this.addStaticSQLFunctions(vsCodeList, documentToken);
            yield this.addKeywords(vsCodeList, documentToken);
        });
    }
    handleOnePartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            var vsCodeList = new vscode.CompletionList();
            if (documentToken.connectedSchema != null) {
                var vsCodeObjectList = new vscode.CompletionList();
                var vsCodeSynonymList = new vscode.CompletionList();
                let completionList = new Array();
                let publicSynonymCompletionList = new Array();
                let tableColsCompletionList = new Array();
                let vsCodeAliasCompletionListToDisplay = this.processOracleStatement.getObjectsFromStatement();
                let [tablesToExclude, colsToExclude] = this.processOracleStatement.getObjectsToExcludeFromStatement();
                var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
                allobjectList.processOracleStatement = this.processOracleStatement;
                var numberofObjectsRemaining = OracleAutoCompletionUtils.MaximumObjectstoDisplay;
                if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                    completionList = yield allobjectList.GetObjectsFromOneToken(documentToken, numberofObjectsRemaining, intellisenseRequests_1.IntelliSenseProviderType.AutoComplete, tablesToExclude);
                    vsCodeObjectList = OracleAutoCompletionUtils.getVscodeListFromCompletionList(completionList);
                }
                numberofObjectsRemaining = OracleAutoCompletionUtils.MaximumObjectstoDisplay - completionList.length;
                var publicSynonyms = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).PublicSynonyms;
                if (numberofObjectsRemaining > 0 && publicSynonyms != null && publicSynonyms.PublicSynonym.IntelliSenseDict.size > 0) {
                    publicSynonymCompletionList = yield publicSynonyms.GetObjectsFromOneToken(documentToken, numberofObjectsRemaining, intellisenseRequests_1.IntelliSenseProviderType.AutoComplete);
                    vsCodeSynonymList = OracleAutoCompletionUtils.getVscodeListFromCompletionList(publicSynonymCompletionList);
                }
                numberofObjectsRemaining = numberofObjectsRemaining - publicSynonymCompletionList.length;
                var vsCodeColumnList = new vscode.CompletionList();
                if (documentToken.tokenInfo.stmtContext != oracleAutoCompletionHelper_1.StatementContext.from_clause) {
                    var columnList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllTableColumns;
                    if (numberofObjectsRemaining > 0 && columnList.ColumnList.IntelliSenseDict.size > 0) {
                        tableColsCompletionList = columnList.GetObjectsFromOneToken(documentToken, numberofObjectsRemaining, colsToExclude, intellisenseRequests_1.IntelliSenseProviderType.AutoComplete);
                        vsCodeColumnList = OracleAutoCompletionUtils.getVscodeListFromCompletionList(tableColsCompletionList);
                    }
                }
                vsCodeObjectList = this.getCombinedlistFromThreeList(vsCodeObjectList, vsCodeSynonymList, vsCodeColumnList);
                numberofObjectsRemaining = numberofObjectsRemaining - tableColsCompletionList.length;
                if (numberofObjectsRemaining > 0 && documentToken.tokenInfo.stmtContext !== oracleAutoCompletionHelper_1.StatementContext.unknown) {
                    yield this.getMatchingStaticKeywordList(vsCodeObjectList, documentToken);
                }
                if (vsCodeAliasCompletionListToDisplay) {
                    vsCodeAliasCompletionListToDisplay.items.forEach(item => vsCodeObjectList.items.push(item));
                }
                let arr = [];
                switch (documentToken.tokenInfo.stmtContext) {
                    case oracleAutoCompletionHelper_1.StatementContext.unknown:
                        arr = ['SELECT', 'DROP', 'UPDATE', 'DELETE', 'INSERT'];
                        yield this.getMatchingStaticKeywordList(vsCodeList, documentToken);
                        yield this.updateKeywordOnCertainContext(vsCodeList, arr, 1);
                        vsCodeList = this.getCombinedList(vsCodeList, vsCodeObjectList);
                        break;
                    case oracleAutoCompletionHelper_1.StatementContext.select_term:
                        arr = ['FROM', 'INTO', 'AS', 'AT', 'MULTISET', 'BULK'];
                        if (!this.processOracleStatement.checkEmptySelectList())
                            yield this.updateKeywordOnCertainContext(vsCodeObjectList, arr, numberofObjectsRemaining);
                        vsCodeList = this.getCombinedList(vsCodeList, vsCodeObjectList);
                        break;
                    case oracleAutoCompletionHelper_1.StatementContext.insert_into_clause:
                        arr = ['INTO', 'ALL', 'FIRST', 'WHEN'];
                        yield this.updateKeywordOnCertainContext(vsCodeObjectList, arr, numberofObjectsRemaining);
                        vsCodeList = this.getCombinedList(vsCodeList, vsCodeObjectList);
                        break;
                    default: vsCodeList = vsCodeObjectList;
                }
            }
            else {
                yield this.getMatchingStaticKeywordList(vsCodeList, documentToken);
            }
            return vsCodeList;
        });
    }
    handleTwoPartIdentifierResolution(documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            var vsCodeList = new vscode.CompletionList();
            if (this.oracleIntelliSenseDataMgr.intelliSenseData.has(documentToken.documentId)) {
                let completionList = null;
                let vsCodeCompletionListFromSubquery = this.processOracleStatement.getObjectsFromSubqueryAlias(documentToken.tokenInfo.dbFormattedToken2);
                if (vsCodeCompletionListFromSubquery) {
                    return vsCodeCompletionListFromSubquery;
                }
                let actualObjectsNames = this.processOracleStatement.getObjectNameFromAliases(documentToken.tokenInfo.dbFormattedToken2, documentToken.tokenInfo.dbFormattedToken1);
                if (actualObjectsNames[2]) {
                    documentToken.tokenAlias = actualObjectsNames[2];
                    documentToken.tokenInfo.dbFormattedToken2 = actualObjectsNames[1];
                    if (actualObjectsNames[0]) {
                        documentToken.connectedSchema = actualObjectsNames[0];
                    }
                }
                var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
                if (allobjectList != null && allobjectList.SchemaList.size > 0) {
                    completionList = yield allobjectList.GetObjectsFromTwoTokens(documentToken, OracleAutoCompletionUtils.MaximumObjectstoDisplay, intellisenseRequests_1.IntelliSenseProviderType.AutoComplete);
                }
                if ((completionList == null) || (completionList != null && completionList.length == 0)) {
                    var publicSynonyms = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).PublicSynonyms;
                    if (publicSynonyms != null && publicSynonyms.PublicSynonym.IntelliSenseDict.size > 0) {
                        completionList = yield publicSynonyms.GetObjectsFromTwoToken(documentToken, OracleAutoCompletionUtils.MaximumObjectstoDisplay, intellisenseRequests_1.IntelliSenseProviderType.AutoComplete);
                    }
                }
                if ((documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.select_list || documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.select_term)
                    && completionList && completionList.length > 0 && completionList[0].objectType == intellisenseRequests_1.SchemaObjectType.TableColumn) {
                    yield this.addAstericAndAllColumnCompletionItem(completionList, documentToken);
                }
                vsCodeList = OracleAutoCompletionUtils.getVscodeListFromCompletionList(completionList);
            }
            return vsCodeList;
        });
    }
    updateKeywordOnCertainContext(vsCodeList, arr, numOfItemRemaining) {
        return __awaiter(this, void 0, void 0, function* () {
            if (numOfItemRemaining > 0) {
                let caseArr = arr.map((label) => oracleLanguageFeaturesHelper_1.CasingHelper.setCase(label, this.oracleIntelliSenseDataMgr.intelliSenseObjectNameCase));
                vsCodeList.items.forEach(item => {
                    if (caseArr.find(label => label === item.label))
                        item.sortText = "1";
                });
            }
            else {
                yield arr.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    let object = yield this.getSpecificKeyword(item);
                    if (object) {
                        vsCodeList.items.push(object);
                    }
                }));
            }
        });
    }
    addAstericAndAllColumnCompletionItem(completionList, documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let columnList = OracleAutoCompletionUtils.getArrayListFromCompletionList(completionList, null, false);
            let schemaFromToken = null;
            let token = null;
            if (documentToken.tokenInfo.count == 2) {
                schemaFromToken = documentToken.tokenInfo.dbFormattedToken1;
            }
            else if (documentToken.tokenInfo.count == 3) {
                schemaFromToken = documentToken.tokenInfo.dbFormattedToken3;
            }
            token = documentToken.tokenInfo.dbFormattedToken2;
            let schema = schemaFromToken ? schemaFromToken : documentToken.connectedSchema;
            var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(documentToken.documentId).AllObjectList;
            let tablecompletionItem = yield allobjectList.getObjectFromAllObjectsCache(schema, token, true, true, documentToken.documentId);
            if (!oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(schema)) {
                schema = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(documentToken.tokenInfo.dbFormattedToken3, oracleDocumentIntelliSenseManager.instance.getCaseSettings().objectNameCase);
            }
            let prefix = null;
            if (documentToken.tokenAlias) {
                prefix = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(documentToken.tokenAlias, oracleDocumentIntelliSenseManager.instance.getCaseSettings().objectNameCase);
            }
            else {
                prefix = tablecompletionItem && tablecompletionItem.quoteNeeded
                    ? `"${token}"` : oracleLanguageFeaturesHelper_1.CasingHelper.setCase(token, oracleDocumentIntelliSenseManager.instance.getCaseSettings().objectNameCase);
                if (documentToken.tokenInfo.count == 3) {
                    prefix = `${schema}.${prefix}`;
                }
            }
            completionList.push(new OracleCompletionItem().getALLColumnsForTableOrView(columnList, prefix, false, true, false, " "));
            completionList.push(new OracleCompletionItem().getAstericOracleCompletionItem());
        });
    }
    addStaticSQLFunctions(vsCodeCompletionList, documentToken) {
        var sqlFunctions = OracleStaticSQLFunction.getStaticSQLFunctionCompletionList(this.oracleIntelliSenseDataMgr.intelliSenseObjectNameCase);
        var completionItems = new Array();
        var vsCodeList = null;
        try {
            for (const [key, completionItem] of sqlFunctions) {
                if (documentToken.tokenInfo.dbFormattedToken1 != null && !key.includes(documentToken.tokenInfo.dbFormattedToken1))
                    continue;
                var completionList = completionItem.getCompletionItemFromMethodArgumentList(documentToken.tokenPosition, true);
                completionItem.objectType = intellisenseRequests_1.SchemaObjectType.StaticSQLFunction;
                completionList.forEach(item => {
                    if (documentToken.staticFunctionSortText != null) {
                        item.sortText = documentToken.staticFunctionSortText;
                    }
                    else {
                        item.setSortText();
                    }
                    completionItems.push(item);
                });
                vsCodeList = OracleAutoCompletionUtils.getVscodeListFromCompletionList(completionList);
                for (var idx = 0; idx < vsCodeList.items.length; idx++) {
                    vsCodeCompletionList.items.push(vsCodeList.items[idx]);
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("error in reading static functions.");
            helper.logErroAfterValidating(error);
        }
    }
    addKeywords(vsCodeCompletionList, documentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.handleKeywordRequest();
            var oracleKeyWordList = OracleKeyWordList.getOracleKeywordList(this.oracleIntelliSenseDataMgr.intelliSenseKeywordCase, OracleKeyWordList.staticKeywordListfromAPI);
            for (const [key, oracleKeywordItem] of oracleKeyWordList) {
                if (documentToken.tokenInfo.dbFormattedToken1 != null && !key.includes(documentToken.tokenInfo.dbFormattedToken1)
                    || (documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.from_clause
                        && (oracleKeywordItem.completionItemKind == vscode_1.CompletionItemKind.Value || oracleKeywordItem.completionItemKind == vscode_1.CompletionItemKind.Variable))) {
                    continue;
                }
                oracleKeywordItem.detail = oracleKeywordItem.detail + " ";
                oracleKeywordItem.setSortText();
                let item = OracleAutoCompletionUtils.getVSCodeCompletionItem(oracleKeywordItem, "U", true);
                if (item)
                    vsCodeCompletionList.items.push(item);
            }
        });
    }
    getSpecificKeyword(keyword) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.handleKeywordRequest();
            let vsCodeItem = null;
            var oracleKeyWordList = OracleKeyWordList.getOracleKeywordList(this.oracleIntelliSenseDataMgr.intelliSenseKeywordCase, OracleKeyWordList.staticKeywordListfromAPI);
            let item = oracleKeyWordList.get(keyword);
            if (item) {
                item.detail = item.detail + " ";
                item.setSortText();
                vsCodeItem = OracleAutoCompletionUtils.getVSCodeCompletionItem(item, "U", true);
                if (vsCodeItem)
                    vsCodeItem.sortText = "1";
            }
            return vsCodeItem;
        });
    }
    handleKeywordRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            if (OracleKeyWordList.staticKeywordListfromAPI.length == 0) {
                const fileName = "./oracleStaticSQLFunctions";
                var sqlFunctions;
                try {
                    sqlFunctions = require(fileName);
                    let functionList = Object.keys(sqlFunctions);
                    OracleKeyWordList.staticKeywordListfromAPI = yield this.languageServerClient.sendRequest(intellisenseRequests_1.KeywordsRequest.Request, new intellisenseRequests_1.KeywordRequestParam(functionList));
                }
                catch (e) {
                    logger_1.FileStreamLogger.Instance.error("error in reading static keywords.");
                    helper.logErroAfterValidating(e);
                }
            }
        });
    }
    handleLanguageFeatureRequest(document, position, token, context) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let documentToken = new iLanguageTokenHandler_1.DocumentToken();
                try {
                    var tokenPostion = new TokenPositionHelper(null, position, document);
                    if (this.oracleIntelliSenseDataMgr.intelliSenseEnableForOracleVSCode && this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                        var docAndUserID = this.getConnecteduserAndDocID(document);
                        var documentId = docAndUserID[0];
                        var connectedUser = docAndUserID[1];
                        var fileURI = docAndUserID[2];
                        const executeQueryRequest = new scriptExecutionModels_1.ScriptExecuteParams();
                        executeQueryRequest.ownerUri = this.vscodeConnector.activeTextEditorUri;
                        executeQueryRequest.selection = OracleAutoCompletionUtils.getSelection(position);
                        documentToken.isTokenSpaceKey = (context != null && context.triggerCharacter != null && context.triggerCharacter == ' ') ? true : false;
                        documentToken.connectedSchema = connectedUser;
                        documentToken.tokenPosition = tokenPostion;
                        documentToken.documentId = documentId;
                        yield this.languageServerClient.sendRequest(intellisenseRequests_1.IntelliSenseTokenRequest.type, new intellisenseRequests_1.TokenRequestParameter(position.line, position.character, fileURI, intellisenseRequests_1.TokenSource.AutoComplete, executeQueryRequest, documentToken.isTokenSpaceKey))
                            .then((result) => __awaiter(this, void 0, void 0, function* () {
                            var tokenResponse = result;
                            documentToken.aliasInfo = tokenResponse.aliasInfo;
                            documentToken.tokenInfo = OracleAutoCompletionUtils.getTokenCountAndTokenInfo(tokenResponse, documentToken.isTokenSpaceKey);
                            this.processOracleStatement = new oracleAutoCompletionHelper_1.ProcessOracleStatement(this.oracleIntelliSenseDataMgr, documentToken);
                            if (documentToken.connectedSchema != null) {
                                yield this.processOracleStatement.populuateObjectsInStatement();
                            }
                            documentToken.staticFunctionSortText = documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.having_clause ? "1" : null;
                            var objectList = null;
                            switch (documentToken.tokenInfo.count) {
                                case 1:
                                    {
                                        objectList = yield this.handleOnePartIdentifierResolution(documentToken);
                                    }
                                    break;
                                case 2:
                                    {
                                        objectList = yield this.handleTwoPartIdentifierResolution(documentToken);
                                    }
                                    break;
                                case 3:
                                    {
                                        objectList = yield this.handleThreePartIdentifierResolution(documentToken);
                                    }
                                    break;
                                default:
                                    objectList = new vscode.CompletionList();
                                    break;
                            }
                            let text = documentToken.isTokenSpaceKey ? "objects for space key" : "objects";
                            let databaseObject = documentToken.connectedSchema == null ? "static" : "database";
                            fileLogger.info(`sending: ${databaseObject} ${text} count : ${objectList.items.length}`);
                            objectList.isIncomplete = objectList.items.length >= OracleAutoCompletionUtils.MaximumObjectstoDisplay
                                ? true : false;
                            resolve(objectList);
                        }), (error) => {
                            helper.logErroAfterValidating(error);
                            resolve(new vscode.CompletionList());
                        });
                    }
                    else {
                        if (this.oracleIntelliSenseDataMgr.intelliSenseEnableForOracleVSCode) {
                            fileLogger.info(`intellisense is disabled for oracle VS Code. tried for doc ${this.vscodeConnector.activeTextEditorUri}`);
                        }
                        else if (this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                            fileLogger.info(`intellisense is disabled for doc : ${this.vscodeConnector.activeTextEditorUri}`);
                        }
                        fileLogger.info(`sending no objects`);
                        resolve(new vscode.CompletionList());
                    }
                }
                catch (error) {
                    OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, error);
                    resolve(new vscode.CompletionList());
                }
            }));
        });
    }
}
exports.oracleCompletionItemDataProvider = oracleCompletionItemDataProvider;
class oracleCompletionitemProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, signatureHelpProvider) {
        this.items = new Array();
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        fileLogger.info("Initializing oracleCompletionItem Provider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.getKeywordList();
        fileLogger.info("oracleCompletionItem Provider initialized.");
    }
    getKeywordList() {
        return __awaiter(this, void 0, void 0, function* () {
            var completionItemDataProvider = new oracleCompletionItemDataProvider(this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager);
            completionItemDataProvider.handleKeywordRequest();
        });
    }
    provideCompletionItems(document, position, token, context) {
        var completionItemDataProvider = new oracleCompletionItemDataProvider(this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager);
        return completionItemDataProvider.handleLanguageFeatureRequest(document, position, token, context);
    }
    resolveCompletionItem(item, token) {
        return null;
    }
}
exports.oracleCompletionitemProvider = oracleCompletionitemProvider;
class OracleKeyWordList {
    static GetItemDetail(command) {
        var detail = command.name;
        let completionKind = vscode.CompletionItemKind.Keyword;
        let space = " ";
        switch (command.type) {
            case "command":
                detail = `${localizedConstants_1.default.command}`;
                completionKind = vscode.CompletionItemKind.Text;
                break;
            case "value":
                detail = `${localizedConstants_1.default.value}`;
                completionKind = vscode.CompletionItemKind.Value;
                break;
            case "variable":
                detail = `${localizedConstants_1.default.variable}`;
                completionKind = vscode.CompletionItemKind.Variable;
                break;
            case "keyword":
                detail = `${localizedConstants_1.default.keyword}`;
                break;
            default:
                break;
        }
        return { detail, completionKind };
    }
    static PrepareOracleKeywordList(keywordCasing, keywords) {
        if (this.staticOracleKeywordList.size == 0) {
            var itemInfo;
            try {
                keywords.forEach(keyword => {
                    var item = new OracleCompletionItem();
                    item.name = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(keyword.name, keywordCasing);
                    itemInfo = this.GetItemDetail(keyword);
                    item.detail = itemInfo.detail;
                    item.completionItemKind = itemInfo.completionKind;
                    item.insertText = (keyword.name != undefined) ?
                        new vscode.SnippetString(oracleLanguageFeaturesHelper_1.CasingHelper.setCase(keyword.name, keywordCasing))
                        : null;
                    if (!this.staticOracleKeywordList.has(keyword.name))
                        this.staticOracleKeywordList.set(keyword.name, item);
                });
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Could not find file having keyword List");
                helper.logErroAfterValidating(error);
            }
        }
        return OracleKeyWordList.staticOracleKeywordList;
    }
    static getOracleKeywordList(keywordCasing, keywords) {
        return this.PrepareOracleKeywordList(keywordCasing, keywords);
    }
    static clearOracleKeywordList() {
        if (this.staticKeywordListfromAPI.length > 0)
            this.staticKeywordListfromAPI = [];
        if (this.staticOracleKeywordList.size > 0)
            this.staticOracleKeywordList.clear();
    }
}
exports.OracleKeyWordList = OracleKeyWordList;
OracleKeyWordList.staticKeywordListfromAPI = [];
OracleKeyWordList.staticOracleKeywordList = new Map();
class OracleStaticSQLFunction {
    static prepareStaticSQLFunctionList(objectNameCasing) {
        if (this.staticSQLCompletionList.size == 0) {
            const fileName = "./oracleStaticSQLFunctions";
            var sqlFunctions;
            try {
                sqlFunctions = require(fileName);
                let functionList = Object.keys(sqlFunctions);
                for (var key in functionList) {
                    var funcName = functionList[key];
                    var argumentList = sqlFunctions[funcName];
                    if (argumentList != undefined) {
                        var item = new OracleCompletionItem();
                        item.name = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(funcName, objectNameCasing);
                        item.objectType = intellisenseRequests_1.SchemaObjectType.Function;
                        item.methodArgumentList = argumentList;
                        if (!this.staticSQLCompletionList.has(funcName))
                            this.staticSQLCompletionList.set(funcName, item);
                    }
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Could not find file having static SQL functions");
                helper.logErroAfterValidating(error);
            }
        }
    }
    static getStaticSQLFunctionCompletionList(objectNameCasing) {
        this.prepareStaticSQLFunctionList(objectNameCasing);
        return this.staticSQLCompletionList;
    }
    static clearStaticSQLCompletionList() {
        if (this.staticSQLCompletionList.size > 0)
            this.staticSQLCompletionList.clear();
    }
}
exports.OracleStaticSQLFunction = OracleStaticSQLFunction;
OracleStaticSQLFunction.staticSQLCompletionList = new Map();
