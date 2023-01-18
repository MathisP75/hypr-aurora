"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliasedItem = exports.ParsedObjectType = exports.ParsedLocalObject = exports.ParsedAlias = exports.ParsedTable = exports.ParsedColumn = exports.ParsedObjectBase = exports.AliasInfo = exports.CasingHelper = exports.oracleMarkDownString = exports.oracleLanguageFeaturesHelper = void 0;
const constants_1 = require("../constants/constants");
const intellisenseModels_1 = require("../models/intellisenseModels");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
const DocumentConnectionInformation_1 = require("../connectionManagement/DocumentConnectionInformation");
const vscode = require("vscode");
class oracleLanguageFeaturesHelper {
    static validateMatchedItem(objectType, parsedItem) {
        if (parsedItem)
            switch (parsedItem.parsedObjectType) {
                case ParsedObjectType.Column: return objectType === intellisenseRequests_1.SchemaObjectType.TableColumn ||
                    objectType === intellisenseRequests_1.SchemaObjectType.StaticSQLFunction;
                case ParsedObjectType.Table:
                    return objectType === intellisenseRequests_1.SchemaObjectType.Table ||
                        objectType === intellisenseRequests_1.SchemaObjectType.View ||
                        objectType === intellisenseRequests_1.SchemaObjectType.Synonym ||
                        objectType === intellisenseRequests_1.SchemaObjectType.PublicSynonym;
            }
        return true;
    }
    static getDBName(name) {
        if (name === undefined || name === null)
            return null;
        if (!CasingHelper.isQuoted(name))
            return name.toUpperCase();
        return name.substring(1, name.length - 1);
    }
    static isParamMandatory(param) {
        if (param)
            return param.optional == constants_1.Constants.optionalParamFalse;
        return false;
    }
    static getMandatoryParamCount(params, isFunction) {
        let paramCount = 0;
        if (params)
            params.forEach(param => {
                if (this.isParamMandatory(param))
                    ++paramCount;
            });
        return isFunction ? paramCount - 1 : paramCount;
    }
    static getOracleParamListFromMethodParams(methodParams, casing) {
        if (methodParams && methodParams.length > 0) {
            let oracleParams = [], isFunction, newParam = new intellisenseRequests_1.OracleParameter();
            if (methodParams[0].name === constants_1.Constants.methodParamReturnStr) {
                newParam.direction = casing.keywordCase === intellisenseModels_1.Casing.Uppercase ? "RETURN" : "return";
                newParam.name = '';
                isFunction = true;
            }
            else {
                newParam.direction = CasingHelper.setCase(methodParams[0].direction, casing.keywordCase);
                newParam.name = CasingHelper.setCase(methodParams[0].name, casing.objectNameCase);
                isFunction = false;
            }
            newParam.dataType = CasingHelper.getObjNameStr(methodParams[0].dataType, casing.keywordCase);
            oracleParams.push(newParam);
            for (let i = 1; i < methodParams.length; ++i) {
                newParam = new intellisenseRequests_1.OracleParameter();
                newParam.name = CasingHelper.setCase(methodParams[i].name, casing.objectNameCase);
                newParam.direction = CasingHelper.setCase(methodParams[i].direction, casing.keywordCase);
                newParam.dataType = CasingHelper.getObjNameStr(methodParams[i].dataType, casing.keywordCase);
                oracleParams.push(newParam);
            }
            return new intellisenseModels_1.OracleParameterList(isFunction, oracleParams);
        }
        return null;
    }
    static validateParsedParams(tokenParams, methodParams, isFunction) {
        try {
            if (tokenParams === null)
                return methodParams === null || methodParams.length === 0;
            let maxParams = isFunction ? methodParams.length - 1 : methodParams.length;
            let minParams = oracleLanguageFeaturesHelper.getMandatoryParamCount(methodParams, isFunction);
            let paramMap = {};
            let mandatoryParamCount = 0, valParamCount = 0;
            methodParams.forEach(dbParam => {
                if (dbParam.name !== '')
                    paramMap[this.getDBName(dbParam.name)] = this.isParamMandatory(dbParam);
            });
            if (tokenParams.length < minParams || tokenParams.length > maxParams)
                return false;
            for (let i = 0; i < tokenParams.length; ++i) {
                if (tokenParams[i] !== '' && paramMap[tokenParams[i]] === undefined)
                    return false;
                if (paramMap[tokenParams[i]])
                    mandatoryParamCount++;
                if (tokenParams[i] == '')
                    valParamCount++;
            }
            if (mandatoryParamCount != minParams && valParamCount == 0)
                return false;
        }
        catch (e) {
            DocumentConnectionInformation_1.fileLogger.error(e);
        }
        return true;
    }
}
exports.oracleLanguageFeaturesHelper = oracleLanguageFeaturesHelper;
class oracleMarkDownString {
    constructor(value) {
        this.markedDownString = new vscode.MarkdownString();
        if (value) {
            this.markedDownString.appendCodeblock(value, constants_1.Constants.oracleLanguageID);
        }
    }
    appendNameValueString(name, value) {
        this.markedDownString.appendCodeblock(name == null ? `${value}` : `${name}: ${value}`, constants_1.Constants.oracleLanguageID);
    }
}
exports.oracleMarkDownString = oracleMarkDownString;
class CasingHelper {
    static setCase(name, caseToSet) {
        if (name === undefined || name === null || this.isQuoted(name))
            return name;
        if (caseToSet == intellisenseModels_1.Casing.Uppercase)
            return name.toUpperCase();
        if (caseToSet == intellisenseModels_1.Casing.Lowercase)
            return name.toLowerCase();
        return name;
    }
    static isQuoted(name) {
        name = name.trim();
        if (name.length > 1 &&
            ((name.startsWith("'") && name.endsWith("'")) ||
                (name.startsWith("\"") && name.endsWith("\""))))
            return true;
        return false;
    }
    static getObjNameStr(dbObjectName, casing) {
        if (dbObjectName.nameTokens && dbObjectName.nameTokens.length > 0)
            return this.convertNameList(dbObjectName.nameTokens, casing, 0);
        else
            return '';
    }
    static convertNameList(nameList, casing, index) {
        try {
            if (index < nameList.length)
                return this.setCase(nameList[index], casing) + this.convertNameList(nameList, casing, index + 1);
            else
                return '';
        }
        catch (err) {
            return '';
        }
    }
    static getParamStr(param, casing) {
        return this.setCase(param.name, casing.objectNameCase) + ' ' +
            (param.direction ? this.setCase(param.direction, casing.keywordCase) : '') + ' ' +
            this.getObjNameStr(param.dataType, casing.keywordCase);
    }
}
exports.CasingHelper = CasingHelper;
class AliasInfo {
    AliasInfo() {
        this.columnAliases = new Array();
        this.tableAliases = new Array();
    }
}
exports.AliasInfo = AliasInfo;
class ParsedObjectBase {
    constructor() {
        this.parsedObjectType = ParsedObjectType.Unknown;
    }
}
exports.ParsedObjectBase = ParsedObjectBase;
class ParsedColumn extends ParsedObjectBase {
    constructor() {
        super(...arguments);
        this.parsedObjectType = ParsedObjectType.Column;
    }
}
exports.ParsedColumn = ParsedColumn;
class ParsedTable extends ParsedObjectBase {
    constructor() {
        super(...arguments);
        this.parsedObjectType = ParsedObjectType.Table;
    }
}
exports.ParsedTable = ParsedTable;
class ParsedAlias extends ParsedObjectBase {
    populate(aliasedItem, alias) {
        this.parsedObjectType = aliasedItem.parsedObjectType;
        this.alias = alias;
        if (aliasedItem.parsedObjectType === ParsedObjectType.Table) {
            let parsedTable = aliasedItem;
            this.objectType = intellisenseModels_1.LocalSymbolType.TableAlias;
            if (parsedTable.name) {
                this.aliasedSymbol = parsedTable.name;
                this.dbFormattedAliasedSymbol = parsedTable.dbFormatedName;
                this.isExpression = false;
            }
            else {
                this.aliasedSymbol = parsedTable.tableReferenceExpression;
                this.dbFormattedAliasedSymbol = parsedTable.tableReferenceExpression;
                this.isExpression = true;
            }
        }
        else {
            let parsedColumn = aliasedItem;
            this.objectType = intellisenseModels_1.LocalSymbolType.ColumnAlias;
            if (parsedColumn.name) {
                this.aliasedSymbol = parsedColumn.name;
                this.dbFormattedAliasedSymbol = parsedColumn.dbFormatedName;
                this.isExpression = false;
            }
            else {
                this.aliasedSymbol = parsedColumn.columnExpression;
                this.dbFormattedAliasedSymbol = parsedColumn.columnExpression;
                this.isExpression = true;
            }
        }
    }
}
exports.ParsedAlias = ParsedAlias;
class ParsedLocalObject extends ParsedObjectBase {
}
exports.ParsedLocalObject = ParsedLocalObject;
var ParsedObjectType;
(function (ParsedObjectType) {
    ParsedObjectType[ParsedObjectType["Column"] = 0] = "Column";
    ParsedObjectType[ParsedObjectType["Table"] = 1] = "Table";
    ParsedObjectType[ParsedObjectType["CodeBlockItem"] = 2] = "CodeBlockItem";
    ParsedObjectType[ParsedObjectType["Unknown"] = 3] = "Unknown";
})(ParsedObjectType = exports.ParsedObjectType || (exports.ParsedObjectType = {}));
class AliasedItem {
    constructor() {
        this.alias = null;
        this.dbFormatedAlias = null;
        this.parsedObject = null;
    }
}
exports.AliasedItem = AliasedItem;
