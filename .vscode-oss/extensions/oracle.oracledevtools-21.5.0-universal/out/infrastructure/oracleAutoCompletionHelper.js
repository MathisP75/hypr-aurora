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
exports.OracleSQLPlusStmtType = exports.StatementContext = exports.OracleSQLPlusStmtSubType = exports.ProcessOracleStatement = exports.OraclePLSQLStatement = exports.OracleInsertStatement = exports.OracleSelectStatement = exports.OracleDMLStatement = exports.OracleStatement = exports.SmartAutoCompletionItemType = void 0;
const oracleCompletionItemProvider_1 = require("./oracleCompletionItemProvider");
const vscode = require("vscode");
const oracleLanguageFeaturesHelper_1 = require("./oracleLanguageFeaturesHelper");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
var SmartAutoCompletionItemType;
(function (SmartAutoCompletionItemType) {
    SmartAutoCompletionItemType[SmartAutoCompletionItemType["TABLE"] = 1] = "TABLE";
    SmartAutoCompletionItemType[SmartAutoCompletionItemType["COLUMN"] = 2] = "COLUMN";
    SmartAutoCompletionItemType[SmartAutoCompletionItemType["TABLE_ALIAS"] = 3] = "TABLE_ALIAS";
    SmartAutoCompletionItemType[SmartAutoCompletionItemType["COLUMN_ALIAS"] = 4] = "COLUMN_ALIAS";
    SmartAutoCompletionItemType[SmartAutoCompletionItemType["SUBQUERY_ALIAS"] = 5] = "SUBQUERY_ALIAS";
    SmartAutoCompletionItemType[SmartAutoCompletionItemType["UNKNOWN"] = 6] = "UNKNOWN";
})(SmartAutoCompletionItemType = exports.SmartAutoCompletionItemType || (exports.SmartAutoCompletionItemType = {}));
class OracleStatement {
    constructor(oracleIntelliSenseDataMgr, documentToken) {
        this.oracleIntelliSenseDataMgr = oracleIntelliSenseDataMgr;
        this.documentToken = documentToken;
        this.tablesInStatement = new Array();
        this.tablesAndViewAliases = new Array();
        this.tableColumns = new Array();
        this.subQueryTables = new Array();
        this.tableAliasColumns = new Array();
        this.subQueryAliasColumns = new Array();
        this.selectListColumns = new Array();
        this.allColumnsTableItems = new Array();
        this.sameTableColumns = new Array();
        this.tablesInFromClauseExcludingTablesInStatement = new Array();
    }
    populuateObjectsInStatement() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    getObjectsToExcludeFromStatement() {
        return [[], []];
    }
    checkEmptySelectList() {
        return true;
    }
    getObjectsFromStatement() {
        return new vscode.CompletionList();
    }
    getObjectsFromSubqueryAlias(aliasName) {
        return null;
    }
}
exports.OracleStatement = OracleStatement;
class OracleDMLStatement extends OracleStatement {
}
exports.OracleDMLStatement = OracleDMLStatement;
class OracleSelectStatement extends OracleDMLStatement {
    constructor() {
        super(...arguments);
        this.columnSortText = null;
        this.aliasSortText = null;
        this.tableAllColumnsSortText = null;
        this.tableorViewSortText = null;
        this.astericSortText = null;
        this.tablesHavingAllcolsInSelListSortText = null;
    }
    populateSortText() {
        switch (this.documentToken.tokenInfo.stmtContext) {
            case StatementContext.where_clause:
            case StatementContext.group_by_clause:
            case StatementContext.order_by_clause:
            case StatementContext.for_update_clause:
                this.columnSortText = "3";
                this.aliasSortText = "4";
                this.tableAllColumnsSortText = "5";
                this.tableorViewSortText = "6";
                break;
            case StatementContext.from_clause:
                this.tablesHavingAllcolsInSelListSortText = "1";
                this.aliasSortText = "3";
                this.tableorViewSortText = "4";
                break;
            case StatementContext.select_list:
            case StatementContext.select_term:
                this.astericSortText = "2";
                this.tableAllColumnsSortText = "3";
                this.aliasSortText = "4";
                this.tableorViewSortText = "5";
                this.columnSortText = "6";
                break;
            case StatementContext.unknown:
                this.tableAllColumnsSortText = "3";
                this.aliasSortText = "4";
                this.tableorViewSortText = "5";
                this.columnSortText = "6";
            default:
                break;
        }
    }
    PepareRankTables(column, tables, tablesVsColumnCount) {
        tables.forEach(table => {
            if (table.subObjects != null) {
                for (let idx = 0; idx < table.subObjects.length; idx++) {
                    if (table.subObjects[idx].name == column.name && table.subObjects[idx].owner == column.owner) {
                        let itemFound = false;
                        for (let [key, value] of tablesVsColumnCount) {
                            if (key.name == table.name && key.owner == table.owner) {
                                value.push(column.name);
                                itemFound = true;
                                break;
                            }
                        }
                        if (!itemFound) {
                            tablesVsColumnCount.set(table, [column.name]);
                        }
                        break;
                    }
                }
            }
        });
    }
    updateSortText(table, tables) {
        let tableItem = tables.find(item => table.name == item.name && table.owner == item.owner);
        if (tableItem != null) {
            tableItem.sortText = this.tablesHavingAllcolsInSelListSortText;
        }
    }
    RankAndUpdateSortTextForTablesInFromClause() {
        let tablesVsColumns = new Map();
        this.selectListColumns.forEach(column => {
            this.PepareRankTables(column, this.tablesInStatement, tablesVsColumns);
            this.PepareRankTables(column, this.tablesInFromClauseExcludingTablesInStatement, tablesVsColumns);
        });
        let maxvalue = -1;
        for (let [key, value] of tablesVsColumns) {
            if (value.length > maxvalue) {
                maxvalue = value.length;
            }
        }
        if (this.selectListColumns.length == maxvalue) {
            let tableswithsAllColumns = [];
            for (let [key, value] of tablesVsColumns) {
                if (value.length == maxvalue) {
                    tableswithsAllColumns.push(key);
                }
            }
            tableswithsAllColumns.forEach(table => {
                this.updateSortText(table, this.tablesInStatement);
                this.updateSortText(table, this.tablesInFromClauseExcludingTablesInStatement);
            });
        }
    }
    populateDatabaseColumnsFromSelectList() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.documentToken.aliasInfo && this.documentToken.aliasInfo.columnAliases) {
                var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(this.documentToken.documentId).AllObjectList;
                let oracleCompletionItem = null;
                for (let idx = 0; idx < this.documentToken.aliasInfo.columnAliases.length; idx++) {
                    let columnAlias = this.documentToken.aliasInfo.columnAliases[idx];
                    let schemaName = null;
                    let dbFormattedSchemaName = null;
                    let parsedColumn = null;
                    if (columnAlias.parsedObject && columnAlias.parsedObject.parsedObjectType == oracleLanguageFeaturesHelper_1.ParsedObjectType.Column) {
                        parsedColumn = columnAlias.parsedObject;
                        schemaName = parsedColumn.schema == null ? this.documentToken.connectedSchema : parsedColumn.schema;
                        dbFormattedSchemaName = parsedColumn.dbFormatedSchema == null ? this.documentToken.connectedSchema : parsedColumn.dbFormatedSchema;
                        if (parsedColumn.dbFormatedTable && dbFormattedSchemaName) {
                            oracleCompletionItem = yield allobjectList.getObjectFromAllObjectsCache(dbFormattedSchemaName, parsedColumn.dbFormatedTable, true, true, this.documentToken.documentId);
                            if (oracleCompletionItem) {
                                if (oracleCompletionItem.subObjects) {
                                    for (let idx = 0; idx < oracleCompletionItem.subObjects.length; idx++) {
                                        let columnItem = oracleCompletionItem.subObjects[idx];
                                        if (columnItem.name == parsedColumn.dbFormatedName) {
                                            let item = this.getColumnCompletionItemfromColumnCache(columnItem.name, columnItem.owner);
                                            if (item) {
                                                item.aliasName = columnAlias.alias;
                                                item.sortText = this.columnSortText;
                                                this.selectListColumns.push(item);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            let item = this.getColumnCompletionItemfromColumnCache(parsedColumn.dbFormatedName, dbFormattedSchemaName);
                            if (item) {
                                item.aliasName = columnAlias.alias;
                                item.sortText = this.columnSortText;
                                this.selectListColumns.push(item);
                            }
                        }
                    }
                }
            }
        });
    }
    populateAllColumnsTableItem() {
        if (this.documentToken.tokenInfo.stmtContext == StatementContext.select_list
            || this.documentToken.tokenInfo.stmtContext == StatementContext.select_term
            || this.documentToken.tokenInfo.stmtContext == StatementContext.for_update_clause) {
            this.tablesInStatement.forEach(table => {
                this.allColumnsTableItems.push(table.getDuplicateAllColumnItem(this.tableAllColumnsSortText, this.documentToken));
            });
            this.tablesInFromClauseExcludingTablesInStatement.forEach(table => {
                this.allColumnsTableItems.push(table.getDuplicateAllColumnItem(this.tableAllColumnsSortText, this.documentToken));
            });
            this.tablesAndViewAliases.forEach(table => {
                this.allColumnsTableItems.push(table.getDuplicateAllColumnItem(this.tableAllColumnsSortText, this.documentToken));
            });
            this.subQueryTables.forEach(table => {
                if (table.name != null) {
                    let allColumnItem = table.getDuplicateAllColumnItem(this.tableAllColumnsSortText, this.documentToken);
                    if (allColumnItem.subObjects && allColumnItem.subObjects.length > 0)
                        this.allColumnsTableItems.push(allColumnItem);
                }
            });
        }
    }
    getObjectsFromSubqueryAlias(aliasName) {
        let subQueryTablesList = null;
        let subqueryTable = null;
        let item = null;
        for (let idx = 0; idx < this.subQueryTables.length; idx++) {
            if (this.subQueryTables[idx].aliasName == aliasName) {
                let subQueryTablesCompletionList = new Array();
                subqueryTable = this.subQueryTables[idx];
                item = new oracleCompletionItemProvider_1.OracleCompletionItem().getAstericOracleCompletionItem();
                item.sortText = this.astericSortText;
                subQueryTablesCompletionList.push(item);
                let columnList = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getArrayListFromCompletionList(subqueryTable.subObjects, null, false);
                let name = this.subQueryTables[idx].displayName ? this.subQueryTables[idx].displayName : aliasName;
                let prefix = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(name, oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance.getCaseSettings().objectNameCase);
                item = new oracleCompletionItemProvider_1.OracleCompletionItem().getALLColumnsForTableOrView(columnList, prefix, false, true, false, " ");
                if (columnList && columnList.length > 0)
                    subQueryTablesCompletionList.push(item);
                subqueryTable.subObjects.forEach(column => {
                    column.name = column.aliasName ? column.aliasName : column.name;
                    subQueryTablesCompletionList.push(column.getClonedItem());
                });
                subQueryTablesList = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getVscodeListFromCompletionList(subQueryTablesCompletionList);
                break;
            }
        }
        return subQueryTablesList;
    }
    populateTables() {
        return __awaiter(this, void 0, void 0, function* () {
            var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(this.documentToken.documentId).AllObjectList;
            let oracleCompletionItem = null;
            if (this.documentToken.aliasInfo && this.documentToken.aliasInfo.tableAliases) {
                for (let idx = 0; idx < this.documentToken.aliasInfo.tableAliases.length; idx++) {
                    let tableAlias = this.documentToken.aliasInfo.tableAliases[idx];
                    if (tableAlias.alias == null && tableAlias.parsedObject && tableAlias.parsedObject.parsedObjectType == oracleLanguageFeaturesHelper_1.ParsedObjectType.Table) {
                        let parsedTable = tableAlias.parsedObject;
                        let dbFormattedSchemaName = parsedTable.dbFormatedSchema == null ? this.documentToken.connectedSchema : parsedTable.dbFormatedSchema;
                        let dbFormattedTableName = parsedTable.dbFormatedName;
                        oracleCompletionItem = yield allobjectList.getObjectFromAllObjectsCache(dbFormattedSchemaName, dbFormattedTableName, true, true, this.documentToken.documentId);
                        if (oracleCompletionItem) {
                            oracleCompletionItem.setTableName(this.documentToken.connectedSchema);
                            oracleCompletionItem.sortText = this.tableorViewSortText;
                            this.tablesInStatement.push(oracleCompletionItem);
                        }
                    }
                }
            }
            if (this.documentToken.tokenInfo.stmtContext == StatementContext.from_clause) {
                let tables = null;
                let columns = this.oracleIntelliSenseDataMgr.intelliSenseData.get(this.documentToken.documentId).AllTableColumns;
                for (let idx = 0; idx < this.selectListColumns.length; idx++) {
                    tables = columns.getTables(this.selectListColumns[idx].name);
                    let owner = this.selectListColumns[idx].owner && this.selectListColumns[idx].owner != this.documentToken.connectedSchema
                        ? this.selectListColumns[idx].owner : this.documentToken.connectedSchema;
                    for (let tableIdx = 0; tableIdx < tables.length; tableIdx++) {
                        oracleCompletionItem = yield allobjectList.getObjectFromAllObjectsCache(owner, tables[tableIdx], true, true, this.documentToken.documentId);
                        if (oracleCompletionItem) {
                            oracleCompletionItem.setTableName(this.documentToken.connectedSchema);
                            if (!this.tablesInStatement.find(table => table.name == oracleCompletionItem.name)
                                && !this.tablesInFromClauseExcludingTablesInStatement.find(fromCluaseTable => fromCluaseTable.name == oracleCompletionItem.name)) {
                                oracleCompletionItem.sortText = this.tableorViewSortText;
                                this.tablesInFromClauseExcludingTablesInStatement.push(oracleCompletionItem);
                            }
                        }
                    }
                }
            }
        });
    }
    populateTableAliases() {
        return __awaiter(this, void 0, void 0, function* () {
            var allobjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(this.documentToken.documentId).AllObjectList;
            let oracleCompletionItem = null;
            let caseSetting = oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance.getCaseSettings();
            if (this.documentToken.aliasInfo && this.documentToken.aliasInfo.tableAliases) {
                for (let idx = 0; idx < this.documentToken.aliasInfo.tableAliases.length; idx++) {
                    let tableAlias = this.documentToken.aliasInfo.tableAliases[idx];
                    if (tableAlias.alias != null && tableAlias.parsedObject && tableAlias.parsedObject.parsedObjectType == oracleLanguageFeaturesHelper_1.ParsedObjectType.Table) {
                        let parsedTable = tableAlias.parsedObject;
                        let schemaName = parsedTable.schema == null ? this.documentToken.connectedSchema : parsedTable.schema;
                        let dbFormattedSchemaName = parsedTable.dbFormatedSchema == null ? this.documentToken.connectedSchema : parsedTable.dbFormatedSchema;
                        let dbFormattedTableName = parsedTable.dbFormatedName;
                        oracleCompletionItem = yield allobjectList.getObjectFromAllObjectsCache(dbFormattedSchemaName, dbFormattedTableName, true, true, this.documentToken.documentId);
                        if (oracleCompletionItem) {
                            oracleCompletionItem.quoteNeeded = oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(tableAlias.alias);
                            oracleCompletionItem.aliasName = oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(tableAlias.alias);
                            oracleCompletionItem.aliasDisplayName = OracleSelectStatement.getFormattedName(tableAlias.alias, caseSetting);
                            oracleCompletionItem.aliasedItemName = oracleCompletionItem.name;
                            oracleCompletionItem.aliasedItemDisplayName = oracleCompletionItem.displayName;
                            oracleCompletionItem.name = oracleCompletionItem.aliasName;
                            oracleCompletionItem.sortText = this.aliasSortText;
                            oracleCompletionItem.populateItemDetailAndDocumentation();
                            this.tablesAndViewAliases.push(oracleCompletionItem);
                        }
                    }
                }
            }
        });
    }
    static getFormattedName(name, caseSetting) {
        let formattedName = name;
        if (!oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(name)) {
            formattedName = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(name, caseSetting.objectNameCase);
        }
        return formattedName;
    }
    populateSubQueryExpression() {
        if (this.documentToken.aliasInfo && this.documentToken.aliasInfo.tableAliases) {
            let caseSetting = oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance.getCaseSettings();
            let objectOwner = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(this.documentToken.connectedSchema, caseSetting.objectNameCase);
            for (let idx = 0; idx < this.documentToken.aliasInfo.tableAliases.length; idx++) {
                let tableAlias = this.documentToken.aliasInfo.tableAliases[idx];
                if (tableAlias.parsedObject && tableAlias.parsedObject.parsedObjectType == oracleLanguageFeaturesHelper_1.ParsedObjectType.Table) {
                    let parsedTable = tableAlias.parsedObject;
                    if (parsedTable.tableReferenceExpression && parsedTable.tableReferenceExpressionDetail) {
                        let oracleTableCompletionItem = new oracleCompletionItemProvider_1.OracleCompletionItem();
                        oracleTableCompletionItem.name = tableAlias.alias != null ? tableAlias.alias : parsedTable.name;
                        let subqueryAliasName = null;
                        if (oracleTableCompletionItem.name != null) {
                            oracleTableCompletionItem.quoteNeeded = oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(oracleTableCompletionItem.name);
                            subqueryAliasName = OracleSelectStatement.getFormattedName(oracleTableCompletionItem.name, caseSetting);
                            oracleTableCompletionItem.name = oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(oracleTableCompletionItem.name);
                        }
                        oracleTableCompletionItem.aliasName = oracleTableCompletionItem.name;
                        oracleTableCompletionItem.aliasDisplayName = subqueryAliasName;
                        oracleTableCompletionItem.owner = objectOwner;
                        oracleTableCompletionItem.displayOwner = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(objectOwner, caseSetting.objectNameCase);
                        oracleTableCompletionItem.displayName = subqueryAliasName;
                        oracleTableCompletionItem.sortText = this.tableorViewSortText;
                        oracleTableCompletionItem.objectType = intellisenseRequests_1.SchemaObjectType.SubqueryAlias;
                        oracleTableCompletionItem.aliasedItemName = parsedTable.tableReferenceExpression;
                        oracleTableCompletionItem.completionItemKind = vscode.CompletionItemKind.Constant;
                        let expressionDisplayName = parsedTable.tableReferenceExpression;
                        oracleTableCompletionItem.aliasedItemDisplayName = expressionDisplayName;
                        oracleTableCompletionItem.subObjects = [];
                        if (oracleTableCompletionItem.name != null) {
                            oracleTableCompletionItem.populateItemDetailAndDocumentation();
                        }
                        parsedTable.tableReferenceExpressionDetail.forEach(expressionAlias => {
                            if (expressionAlias.parsedObject.parsedObjectType == oracleLanguageFeaturesHelper_1.ParsedObjectType.Column) {
                                let column = expressionAlias.parsedObject;
                                let name = null;
                                let displayName = null;
                                let aliasName = null;
                                let aliasDisplayName = null;
                                let aliasedItemName = null;
                                let aliasedItemNameDisplayName = null;
                                let objectType = intellisenseRequests_1.SchemaObjectType.SubqueryTableColumn;
                                let quoteNeeded = false;
                                let dbName = null;
                                dbName = oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(column.name);
                                quoteNeeded = column.name ? oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(column.name) : false;
                                if (column && column.name === "*") {
                                    return;
                                }
                                if (expressionAlias.alias) {
                                    aliasName = expressionAlias.alias;
                                    aliasDisplayName = OracleSelectStatement.getFormattedName(aliasName, caseSetting);
                                    aliasedItemName = dbName;
                                    aliasedItemNameDisplayName = OracleSelectStatement.getFormattedName(column.name, caseSetting);
                                    name = dbName;
                                    displayName = OracleSelectStatement.getFormattedName(column.name, caseSetting);
                                    objectType = intellisenseRequests_1.SchemaObjectType.SubqueryTableColumnAlias;
                                }
                                else if (column && column.name) {
                                    name = dbName;
                                    displayName = OracleSelectStatement.getFormattedName(column.name, caseSetting);
                                    objectType = intellisenseRequests_1.SchemaObjectType.SubqueryTableColumn;
                                }
                                if ((name && name != "???") || (aliasName && aliasName != "???")) {
                                    let columnCompletionItem = new oracleCompletionItemProvider_1.OracleCompletionItem();
                                    columnCompletionItem.name = name;
                                    columnCompletionItem.quoteNeeded = quoteNeeded;
                                    columnCompletionItem.displayName = displayName;
                                    columnCompletionItem.aliasName = aliasName;
                                    columnCompletionItem.aliasDisplayName = aliasDisplayName;
                                    columnCompletionItem.owner = objectOwner;
                                    columnCompletionItem.aliasedItemName = aliasedItemName;
                                    columnCompletionItem.aliasedItemDisplayName = aliasedItemNameDisplayName;
                                    columnCompletionItem.aliasedExpressionDisplayName = expressionDisplayName;
                                    columnCompletionItem.completionItemKind = vscode.CompletionItemKind.Struct;
                                    columnCompletionItem.objectType = objectType;
                                    columnCompletionItem.populateItemDetailAndDocumentation();
                                    oracleTableCompletionItem.subObjects.push(columnCompletionItem);
                                }
                            }
                        });
                        this.subQueryTables.push(oracleTableCompletionItem);
                    }
                }
            }
        }
    }
    getColumnCompletionItemfromColumnCache(columnNane, owner) {
        let item = null;
        var allTableColumns = this.oracleIntelliSenseDataMgr.intelliSenseData.get(this.documentToken.documentId).AllTableColumns;
        if (allTableColumns.ColumnList.has(columnNane)) {
            let columnData = null;
            columnData = allTableColumns.ColumnList.get(columnNane);
            item = allTableColumns.getColumnCompletionItem(columnNane, columnData, owner, intellisenseRequests_1.IntelliSenseProviderType.AutoComplete);
            item.sortText = this.columnSortText;
        }
        return item;
    }
    populateTableColumnsCollection(tables) {
        let item = null;
        tables.forEach(table => {
            table.subObjects.forEach(column => {
                item = this.getColumnCompletionItemfromColumnCache(column.name, column.owner);
                if (item) {
                    if (!this.tableColumns.find(column => column.name == item.name)) {
                        this.tableColumns.push(item);
                    }
                }
            });
        });
    }
    getAliasQualifiedColumnName(alias, columnItem) {
        let aliasName = alias.aliasName;
        let columnName = columnItem.aliasName ? columnItem.aliasName : columnItem.name;
        if (aliasName) {
            if (alias.quoteNeeded) {
                if (!oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(aliasName)) {
                    aliasName = `"${aliasName}"`;
                }
            }
            else {
                aliasName = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(aliasName, oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance.getCaseSettings().objectNameCase);
            }
        }
        if (columnItem.quoteNeeded) {
            if (!oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(columnName)) {
                columnName = `"${columnName}"`;
            }
            columnName = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(columnName, oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance.getCaseSettings().objectNameCase);
            ;
        }
        return aliasName ? `${aliasName}.${columnName}` : columnName;
    }
    populateColumnsFromTablesAndTableAliases() {
        let item = null;
        switch (this.documentToken.tokenInfo.stmtContext) {
            case StatementContext.select_list:
            case StatementContext.select_term:
            case StatementContext.where_clause:
            case StatementContext.order_by_clause:
            case StatementContext.group_by_clause:
            case StatementContext.for_update_clause:
                this.populateTableColumnsCollection(this.tablesInStatement);
                this.populateTableColumnsCollection(this.tablesInFromClauseExcludingTablesInStatement);
                this.tablesAndViewAliases.forEach(table => {
                    table.subObjects.forEach(column => {
                        item = this.getColumnCompletionItemfromColumnCache(column.name, column.owner);
                        if (item) {
                            item.schemaQualifiedName = this.getAliasQualifiedColumnName(table, item);
                            item.quoteNeeded = true;
                            this.tableAliasColumns.push(item);
                        }
                    });
                });
                this.subQueryTables.forEach(table => {
                    table.subObjects.forEach(column => {
                        item = column.getClonedItem();
                        if (item) {
                            item.schemaQualifiedName = this.getAliasQualifiedColumnName(table, item);
                            item.quoteNeeded = true;
                            item.sortText = this.columnSortText;
                            if (!this.tableAliasColumns.find(column => column.name == item.name)) {
                                this.tableAliasColumns.push(item);
                            }
                        }
                    });
                });
                break;
        }
        if ((this.documentToken.tokenInfo.dbFormattedToken1 == null || this.documentToken.tokenInfo.ctrlSpaceKeyPressed)
            && (this.documentToken.tokenInfo.stmtSubType == OracleSQLPlusStmtSubType.G_S_SELECT
                || this.documentToken.tokenInfo.stmtType == OracleSQLPlusStmtType.G_C_PLSQL)
            && (this.documentToken.tokenInfo.stmtContext == StatementContext.select_list || this.documentToken.tokenInfo.stmtContext === StatementContext.select_term)) {
            item = new oracleCompletionItemProvider_1.OracleCompletionItem().getAstericOracleCompletionItem();
            item.sortText = this.astericSortText;
            this.tableAliasColumns.push(item);
        }
    }
    populateSameTableColumns() {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.documentToken.tokenInfo.stmtContext) {
                case StatementContext.select_list:
                case StatementContext.select_term:
                    if (this.tableColumns.length > 0 || this.tableAliasColumns.length > 1)
                        break;
                    let allTableColumns = this.oracleIntelliSenseDataMgr.intelliSenseData.get(this.documentToken.documentId).AllTableColumns;
                    let allObjectList = this.oracleIntelliSenseDataMgr.intelliSenseData.get(this.documentToken.documentId).AllObjectList;
                    yield this.documentToken.aliasInfo.columnAliases.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                        let parsedColumn = obj.parsedObject;
                        if (parsedColumn && allTableColumns.ColumnList.has(parsedColumn.dbFormatedName)) {
                            let columnData = null;
                            columnData = allTableColumns.ColumnList.get(parsedColumn.dbFormatedName);
                            if (columnData) {
                                for (const [key, value] of columnData.tables.entries()) {
                                    let oracleCompletionItem = yield allObjectList.getObjectFromAllObjectsCache(value.schema, key, true, true, this.documentToken.documentId);
                                    if (oracleCompletionItem) {
                                        oracleCompletionItem.subObjects.forEach((column) => __awaiter(this, void 0, void 0, function* () {
                                            let col = this.getColumnCompletionItemfromColumnCache(column.name, column.owner);
                                            if (col && !this.sameTableColumns.find(item => column.name == item.name)) {
                                                this.sameTableColumns.push(col);
                                            }
                                        }));
                                    }
                                }
                            }
                        }
                    }));
                    if (this.sameTableColumns.length > 0) {
                        this.tableAliasColumns = this.tableAliasColumns.filter(i => i.name != '*');
                    }
                    break;
            }
        });
    }
    changeSortOrder(arr, colName) {
        arr.forEach((col) => {
            if (colName && col.name === colName.toUpperCase()) {
                let sortOrder = Number(col.sortText);
                col.sortText = (sortOrder + 1).toString();
            }
        });
    }
    getObjectsToExcludeFromStatement() {
        let tablesToExclude = [];
        let columnssToExclude = [];
        this.tablesInStatement.forEach(table => {
            tablesToExclude.push(table);
        });
        this.tablesInFromClauseExcludingTablesInStatement.forEach(table => {
            tablesToExclude.push(table);
        });
        this.tablesAndViewAliases.forEach(table => {
            if (!tablesToExclude.find(table => table.name == table.owner)) {
                tablesToExclude.push(table);
            }
        });
        this.tableColumns.forEach(tableColumn => {
            columnssToExclude.push(tableColumn.name);
        });
        this.tableAliasColumns.forEach(aliasColumn => {
            columnssToExclude.push(aliasColumn.name);
        });
        this.sameTableColumns.forEach(columns => {
            columnssToExclude.push(columns.name);
        });
        return [tablesToExclude, columnssToExclude];
    }
    checkEmptySelectList() {
        let flag = true;
        for (let obj of this.documentToken.aliasInfo.columnAliases) {
            let parsedColumn = obj.parsedObject;
            if (parsedColumn) {
                flag = false;
                ;
                break;
            }
        }
        return flag;
    }
    populuateObjectsInStatement() {
        return __awaiter(this, void 0, void 0, function* () {
            this.populateSortText();
            yield this.populateDatabaseColumnsFromSelectList();
            yield this.populateTables();
            yield this.populateTableAliases();
            this.populateSubQueryExpression();
            this.populateAllColumnsTableItem();
            this.populateColumnsFromTablesAndTableAliases();
            yield this.populateSameTableColumns();
            if (this.documentToken.tokenInfo.stmtContext == StatementContext.select_list
                || this.documentToken.tokenInfo.stmtContext == StatementContext.select_term)
                this.columnOrdering();
            if (this.documentToken.tokenInfo.stmtContext == StatementContext.from_clause) {
                this.RankAndUpdateSortTextForTablesInFromClause();
            }
        });
    }
    columnOrdering() {
        this.documentToken.aliasInfo.columnAliases.forEach(obj => {
            let parsedColumn = obj.parsedObject;
            if (parsedColumn) {
                this.changeSortOrder(this.sameTableColumns, parsedColumn.name);
                this.changeSortOrder(this.tableColumns, parsedColumn.name);
                this.changeSortOrder(this.tableAliasColumns, parsedColumn.name);
            }
        });
    }
    getObjectsFromStatement() {
        let allObjectsInStatement = new vscode.CompletionList();
        let tables = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getVscodeListFromCompletionList(this.tablesInStatement);
        let tablesInFromClauseUsingSelectList = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getVscodeListFromCompletionList(this.tablesInFromClauseExcludingTablesInStatement);
        let tableAliases = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getVscodeListFromCompletionList(this.tablesAndViewAliases);
        let subQueryTables = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getVscodeListFromCompletionList(this.subQueryTables);
        let tableColumns = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getVscodeListFromCompletionList(this.tableColumns);
        let tableAliasColumns = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getVscodeListFromCompletionList(this.tableAliasColumns);
        let allColumnsTableItems = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getVscodeListFromCompletionList(this.allColumnsTableItems);
        let sameTableColumns = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getVscodeListFromCompletionList(this.sameTableColumns);
        tables.items.forEach(item => allObjectsInStatement.items.push(item));
        tablesInFromClauseUsingSelectList.items.forEach(item => allObjectsInStatement.items.push(item));
        tableAliases.items.forEach(item => allObjectsInStatement.items.push(item));
        subQueryTables.items.forEach(item => allObjectsInStatement.items.push(item));
        tableColumns.items.forEach(item => allObjectsInStatement.items.push(item));
        tableAliasColumns.items.forEach(item => allObjectsInStatement.items.push(item));
        sameTableColumns.items.forEach(item => allObjectsInStatement.items.push(item));
        allColumnsTableItems.items.forEach(item => allObjectsInStatement.items.push(item));
        return allObjectsInStatement;
    }
}
exports.OracleSelectStatement = OracleSelectStatement;
class OracleInsertStatement extends OracleDMLStatement {
    populuateObjectsInStatement() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.OracleInsertStatement = OracleInsertStatement;
class OraclePLSQLStatement {
}
exports.OraclePLSQLStatement = OraclePLSQLStatement;
class ProcessOracleStatement {
    constructor(oracleIntelliSenseDataMgr, documentToken) {
        this.oracleIntelliSenseDataMgr = oracleIntelliSenseDataMgr;
        this.documentToken = documentToken;
        this.statement = null;
    }
    createOracleStatement() {
        switch (this.documentToken.tokenInfo.stmtSubType) {
            case OracleSQLPlusStmtSubType.G_S_SELECT:
                this.statement = new OracleSelectStatement(this.oracleIntelliSenseDataMgr, this.documentToken);
                break;
            case OracleSQLPlusStmtSubType.G_S_INSERT:
                this.statement = new OracleInsertStatement(this.oracleIntelliSenseDataMgr, this.documentToken);
                break;
        }
        if (!this.statement && this.documentToken.tokenInfo.stmtType == OracleSQLPlusStmtType.G_C_PLSQL) {
            switch (this.documentToken.tokenInfo.stmtContext) {
                case StatementContext.where_clause:
                case StatementContext.group_by_clause:
                case StatementContext.order_by_clause:
                case StatementContext.for_update_clause:
                case StatementContext.from_clause:
                case StatementContext.select_list:
                case StatementContext.select_term:
                case StatementContext.select:
                case StatementContext.select_clause:
                    this.statement = new OracleSelectStatement(this.oracleIntelliSenseDataMgr, this.documentToken);
                    break;
            }
        }
    }
    populuateObjectsInStatement() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.createOracleStatement();
            yield ((_a = this.statement) === null || _a === void 0 ? void 0 : _a.populuateObjectsInStatement());
        });
    }
    getObjectsFromStatement() {
        return this.statement ? this.statement.getObjectsFromStatement() : new vscode.CompletionList();
    }
    getObjectsToExcludeFromStatement() {
        return this.statement ? this.statement.getObjectsToExcludeFromStatement() : [new Array(), new Array()];
    }
    checkEmptySelectList() {
        return this.statement ? this.statement.checkEmptySelectList() : false;
    }
    getObjectsFromSubqueryAlias(aliasName) {
        return this.statement ? this.statement.getObjectsFromSubqueryAlias(aliasName) : null;
    }
    getObjectNameFromAliases(token2, token1) {
        let actualtoken2 = token2;
        let actualtoken1 = token1;
        let foundAlias = "";
        if (this.documentToken.aliasInfo && this.documentToken.aliasInfo.tableAliases) {
            let parsedObject = ProcessOracleStatement.getMatchedAlias(token2, this.documentToken.aliasInfo.tableAliases);
            if (parsedObject) {
                let parsedTable = parsedObject.parsedObject;
                if (parsedTable) {
                    actualtoken2 = parsedTable.dbFormatedName;
                    actualtoken1 = parsedTable.dbFormatedSchema;
                    if (parsedObject.dbFormatedAlias)
                        foundAlias = oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(parsedObject.alias) ? parsedObject.alias :
                            oracleLanguageFeaturesHelper_1.CasingHelper.setCase(parsedObject.dbFormatedAlias, oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance.getCaseSettings().objectNameCase);
                }
            }
        }
        return [actualtoken1, actualtoken2, foundAlias];
    }
    static getMatchedAlias(token, aliasList) {
        if (aliasList) {
            for (let index = 0; index < aliasList.length; index++) {
                const element = aliasList[index];
                if (element.dbFormatedAlias === token) {
                    return element;
                }
            }
        }
        return null;
    }
    static getMatchedAliasObject(token, aliasList) {
        if (aliasList) {
            for (let index = 0; index < aliasList.length; index++) {
                const element = aliasList[index];
                if (element.dbFormatedAlias === token) {
                    return element.parsedObject;
                }
            }
        }
        return null;
    }
    static getTableListFromTableExpressionDetail(aliasesInExpr) {
        let tableList = [];
        if (aliasesInExpr && aliasesInExpr.length > 0) {
            aliasesInExpr.forEach(item => {
                if (item.parsedObject.parsedObjectType === oracleLanguageFeaturesHelper_1.ParsedObjectType.Table)
                    tableList.push(item.parsedObject);
            });
        }
        return tableList;
    }
}
exports.ProcessOracleStatement = ProcessOracleStatement;
var OracleSQLPlusStmtSubType;
(function (OracleSQLPlusStmtSubType) {
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_UNKNOWN"] = 0] = "G_S_UNKNOWN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ACCEPT"] = 1] = "G_S_ACCEPT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ALTER"] = 2] = "G_S_ALTER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ANALYZE"] = 3] = "G_S_ANALYZE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_APPEND"] = 4] = "G_S_APPEND";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ARCHIVE"] = 5] = "G_S_ARCHIVE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ASSOCIATE"] = 6] = "G_S_ASSOCIATE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_AT"] = 7] = "G_S_AT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ATNESTED"] = 8] = "G_S_ATNESTED";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ATTRIBUTE"] = 9] = "G_S_ATTRIBUTE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_AUDIT"] = 10] = "G_S_AUDIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BEGIN"] = 11] = "G_S_BEGIN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BLOCKTERMINATOR"] = 12] = "G_S_BLOCKTERMINATOR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BREAK"] = 13] = "G_S_BREAK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BTITLE"] = 14] = "G_S_BTITLE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CALL"] = 15] = "G_S_CALL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CHANGE"] = 16] = "G_S_CHANGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CLEAR"] = 17] = "G_S_CLEAR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COLUMN"] = 18] = "G_S_COLUMN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COMMENT_SQL"] = 19] = "G_S_COMMENT_SQL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COMMIT"] = 20] = "G_S_COMMIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COMMENT_PLUS"] = 21] = "G_S_COMMENT_PLUS";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COMPUTE"] = 22] = "G_S_COMPUTE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CONNECT"] = 23] = "G_S_CONNECT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COPY"] = 24] = "G_S_COPY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DECLARE"] = 25] = "G_S_DECLARE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DEFINE"] = 26] = "G_S_DEFINE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DEL_PLUS"] = 27] = "G_S_DEL_PLUS";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DELETE"] = 28] = "G_S_DELETE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DESCRIBE"] = 29] = "G_S_DESCRIBE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DISASSOCIATE"] = 30] = "G_S_DISASSOCIATE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DISCONNECT"] = 31] = "G_S_DISCONNECT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DROP"] = 32] = "G_S_DROP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_EDIT"] = 33] = "G_S_EDIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_EXECUTE"] = 34] = "G_S_EXECUTE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_EXPAND"] = 35] = "G_S_EXPAND";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_EXIT"] = 36] = "G_S_EXIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_EXPLAIN"] = 37] = "G_S_EXPLAIN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_FLASHBACK"] = 38] = "G_S_FLASHBACK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_GET"] = 39] = "G_S_GET";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_GRANT"] = 40] = "G_S_GRANT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_HOST"] = 41] = "G_S_HOST";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_HOSTALIAS"] = 42] = "G_S_HOSTALIAS";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_HELP"] = 43] = "G_S_HELP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_INPUT"] = 44] = "G_S_INPUT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_INSERT"] = 45] = "G_S_INSERT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_LIST"] = 46] = "G_S_LIST";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_LOCK"] = 47] = "G_S_LOCK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_MERGE"] = 48] = "G_S_MERGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_NEWPAGE"] = 49] = "G_S_NEWPAGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_NOAUDIT"] = 50] = "G_S_NOAUDIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ORADEBUG"] = 51] = "G_S_ORADEBUG";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_PWORD"] = 52] = "G_S_PWORD";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_PLSQLLABEL"] = 53] = "G_S_PLSQLLABEL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_PAUSE"] = 54] = "G_S_PAUSE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_PRINT"] = 55] = "G_S_PRINT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_PROMPT"] = 56] = "G_S_PROMPT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_PURGE"] = 57] = "G_S_PURGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_QUIT"] = 58] = "G_S_QUIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_RENAME"] = 59] = "G_S_RENAME";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_RECOVER"] = 60] = "G_S_RECOVER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_REPFOOTER"] = 61] = "G_S_REPFOOTER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_REPHEADER"] = 62] = "G_S_REPHEADER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_REVOKE"] = 63] = "G_S_REVOKE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ROLLBACK_PLUS"] = 64] = "G_S_ROLLBACK_PLUS";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ROLLBACK_SQL"] = 65] = "G_S_ROLLBACK_SQL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_RUN"] = 66] = "G_S_RUN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SAVE"] = 67] = "G_S_SAVE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SAVEPOINT"] = 68] = "G_S_SAVEPOINT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SELECT"] = 69] = "G_S_SELECT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SHOW"] = 70] = "G_S_SHOW";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SHUTDOWN"] = 71] = "G_S_SHUTDOWN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SLASH"] = 72] = "G_S_SLASH";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SPOOL"] = 73] = "G_S_SPOOL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SQLPLUSPREFIX"] = 74] = "G_S_SQLPLUSPREFIX";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SQLTERMINATOR"] = 75] = "G_S_SQLTERMINATOR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_START"] = 76] = "G_S_START";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_STARTUP"] = 77] = "G_S_STARTUP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_STORE"] = 78] = "G_S_STORE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_TIMING"] = 79] = "G_S_TIMING";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_TRUNCATE"] = 80] = "G_S_TRUNCATE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_TTITLE"] = 81] = "G_S_TTITLE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_UNDEFINE"] = 82] = "G_S_UNDEFINE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_UPDATE"] = 83] = "G_S_UPDATE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_VALIDATE"] = 84] = "G_S_VALIDATE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_VARIABLE"] = 85] = "G_S_VARIABLE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_WHENEVER"] = 86] = "G_S_WHENEVER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_WITH"] = 87] = "G_S_WITH";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET"] = 88] = "G_S_SET";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_XQUERY"] = 89] = "G_S_XQUERY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SETLOGLEVEL"] = 90] = "G_S_SETLOGLEVEL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_LOADQUERYFILE"] = 91] = "G_S_LOADQUERYFILE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ARRAYSIZE"] = 92] = "G_S_SET_ARRAYSIZE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_APPINFO"] = 93] = "G_S_SET_APPINFO";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_AUTOCOMMIT"] = 94] = "G_S_SET_AUTOCOMMIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_AUTOPRINT"] = 95] = "G_S_SET_AUTOPRINT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_AUTOTRACE"] = 96] = "G_S_SET_AUTOTRACE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_COPYCOMMIT"] = 97] = "G_S_SET_COPYCOMMIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ESCAPE"] = 98] = "G_S_SET_ESCAPE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_FEEDBACK"] = 99] = "G_S_SET_FEEDBACK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_OWA"] = 100] = "G_S_SET_OWA";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_GETPAGE"] = 101] = "G_S_SET_GETPAGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SERVEROUTPUT"] = 102] = "G_S_SET_SERVEROUTPUT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SPOOL"] = 103] = "G_S_SET_SPOOL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TERM"] = 104] = "G_S_SET_TERM";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TIMING"] = 105] = "G_S_SET_TIMING";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_VERIFY"] = 106] = "G_S_SET_VERIFY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_XQUERY"] = 107] = "G_S_SET_XQUERY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_CONSTRAINT"] = 108] = "G_S_SET_CONSTRAINT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ROLE"] = 109] = "G_S_SET_ROLE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TRANSACTION"] = 110] = "G_S_SET_TRANSACTION";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_PAUSE"] = 111] = "G_S_SET_PAUSE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ECHO"] = 112] = "G_S_SET_ECHO";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_DEFINE"] = 113] = "G_S_SET_DEFINE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SCAN"] = 114] = "G_S_SET_SCAN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_NULL"] = 115] = "G_S_SET_NULL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_UNKNOWN"] = 116] = "G_S_SET_UNKNOWN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_PAGESIZE"] = 117] = "G_S_SET_PAGESIZE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_LINESIZE"] = 118] = "G_S_SET_LINESIZE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_LONG"] = 119] = "G_S_SET_LONG";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_COLSEP"] = 120] = "G_S_SET_COLSEP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_HEADING"] = 121] = "G_S_SET_HEADING";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_HEADINGSEP"] = 122] = "G_S_SET_HEADINGSEP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_WRAP"] = 123] = "G_S_SET_WRAP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_NUMBERWIDTH"] = 124] = "G_S_SET_NUMBERWIDTH";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_NUMBERFORMAT"] = 125] = "G_S_SET_NUMBERFORMAT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_PACKAGE_HEADER"] = 126] = "G_S_CREATE_PACKAGE_HEADER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_PACKAGE_BODY"] = 127] = "G_S_CREATE_PACKAGE_BODY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_PROCEDURE"] = 128] = "G_S_CREATE_PROCEDURE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_TRIGGER"] = 129] = "G_S_CREATE_TRIGGER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_FUNCTION"] = 130] = "G_S_CREATE_FUNCTION";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_TYPE"] = 131] = "G_S_CREATE_TYPE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_LIBRARY"] = 132] = "G_S_CREATE_LIBRARY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_JAVA"] = 133] = "G_S_CREATE_JAVA";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_TABLE"] = 134] = "G_S_CREATE_TABLE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_DATABASE"] = 135] = "G_S_CREATE_DATABASE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_CONN"] = 136] = "G_S_CREATE_CONN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_UNKNOWN"] = 137] = "G_S_CREATE_UNKNOWN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_FORALLEVENTS_STMTSUBTYPE"] = 138] = "G_S_FORALLEVENTS_STMTSUBTYPE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_FORALLSTMTS_STMTSUBTYPE"] = 139] = "G_S_FORALLSTMTS_STMTSUBTYPE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BEFOREAFTER_SCRIPT"] = 140] = "G_S_BEFOREAFTER_SCRIPT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_WORKSHEETNAME"] = 141] = "G_S_SET_WORKSHEETNAME";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BRIDGE"] = 142] = "G_S_BRIDGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_EXITC"] = 143] = "G_S_SET_EXITC";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TIME"] = 144] = "G_S_SET_TIME";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_LOBOFFSET"] = 145] = "G_S_SET_LOBOFFSET";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLPROMPT"] = 146] = "G_S_SET_SQLPROMPT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_RECSEPCHAR"] = 147] = "G_S_SET_RECSEPCHAR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_RECSEP"] = 148] = "G_S_SET_RECSEP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_XQUERY_BASEURI"] = 149] = "G_S_SET_XQUERY_BASEURI";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_XQUERY_ORDERING"] = 150] = "G_S_SET_XQUERY_ORDERING";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_XQUERY_NODE"] = 151] = "G_S_SET_XQUERY_NODE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_XQUERY_CONTEXT"] = 152] = "G_S_SET_XQUERY_CONTEXT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_COPYTYPECHECK"] = 153] = "G_S_SET_COPYTYPECHECK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLCASE"] = 154] = "G_S_SET_SQLCASE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SUFFIX"] = 155] = "G_S_SET_SUFFIX";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ESCCHAR"] = 156] = "G_S_SET_ESCCHAR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLBLANKLINES"] = 157] = "G_S_SET_SQLBLANKLINES";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLTERMINATOR"] = 158] = "G_S_SET_SQLTERMINATOR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SHOWMODE"] = 159] = "G_S_SET_SHOWMODE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_FLAGGER"] = 160] = "G_S_SET_FLAGGER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_COLINVISIBLE"] = 161] = "G_S_SET_COLINVISIBLE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_XMLOPTIMIZATIONCHECK"] = 162] = "G_S_SET_XMLOPTIMIZATIONCHECK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_BLOCKTERMINATOR"] = 163] = "G_S_SET_BLOCKTERMINATOR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_CONCAT"] = 164] = "G_S_SET_CONCAT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ERRORLOGGING"] = 165] = "G_S_SET_ERRORLOGGING";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_DESCRIBE"] = 166] = "G_S_SET_DESCRIBE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLNUMBER"] = 167] = "G_S_SET_SQLNUMBER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_MARKUP"] = 168] = "G_S_SET_MARKUP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TRIMS"] = 169] = "G_S_SET_TRIMS";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TRIM"] = 170] = "G_S_SET_TRIM";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLCONTINUE"] = 171] = "G_S_SET_SQLCONTINUE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_UNDERLINE"] = 172] = "G_S_SET_UNDERLINE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_INSTANCE"] = 173] = "G_S_SET_INSTANCE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_LONGCHUNKSIZE"] = 174] = "G_S_SET_LONGCHUNKSIZE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLPLUSCOMPATIBILITY"] = 175] = "G_S_SET_SQLPLUSCOMPATIBILITY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SQLTERMINATOR_CHAR"] = 176] = "G_S_SQLTERMINATOR_CHAR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BLOCKTERMINATOR_CHAR"] = 177] = "G_S_BLOCKTERMINATOR_CHAR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_NEWPAGE"] = 178] = "G_S_SET_NEWPAGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_EMBEDDED"] = 179] = "G_S_SET_EMBEDDED";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLPREFIX"] = 180] = "G_S_SET_SQLPREFIX";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_CMDSEP"] = 181] = "G_S_SET_CMDSEP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COMPOUND_STATEMENT"] = 182] = "G_S_COMPOUND_STATEMENT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_DATABASE_LINK"] = 183] = "G_S_CREATE_DATABASE_LINK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_HISTORY"] = 184] = "G_S_HISTORY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_AUTORECOVERY"] = 185] = "G_S_SET_AUTORECOVERY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_COLJSON"] = 186] = "G_S_SET_COLJSON";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_COMPATIBILITY"] = 187] = "G_S_SET_COMPATIBILITY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_EDITFILE"] = 188] = "G_S_SET_EDITFILE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_FULLCOLNAME"] = 189] = "G_S_SET_FULLCOLNAME";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_FLUSH"] = 190] = "G_S_SET_FLUSH";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_HISTORY"] = 191] = "G_S_SET_HISTORY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_LOBPREFETCH"] = 192] = "G_S_SET_LOBPREFETCH";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_LOGSOURCE"] = 193] = "G_S_SET_LOGSOURCE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ROWPREFETCH"] = 194] = "G_S_SET_ROWPREFETCH";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ROWLIMIT"] = 195] = "G_S_SET_ROWLIMIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SECUREDCOL"] = 196] = "G_S_SET_SECUREDCOL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SHIFTINOUT"] = 197] = "G_S_SET_SHIFTINOUT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_STATEMENTCACHE"] = 198] = "G_S_SET_STATEMENTCACHE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TAB"] = 199] = "G_S_SET_TAB";
})(OracleSQLPlusStmtSubType = exports.OracleSQLPlusStmtSubType || (exports.OracleSQLPlusStmtSubType = {}));
var StatementContext;
(function (StatementContext) {
    StatementContext[StatementContext["select_term"] = 0] = "select_term";
    StatementContext[StatementContext["select_list"] = 1] = "select_list";
    StatementContext[StatementContext["into_list"] = 2] = "into_list";
    StatementContext[StatementContext["select_clause"] = 3] = "select_clause";
    StatementContext[StatementContext["from_clause"] = 4] = "from_clause";
    StatementContext[StatementContext["where_clause"] = 5] = "where_clause";
    StatementContext[StatementContext["order_by_clause"] = 6] = "order_by_clause";
    StatementContext[StatementContext["group_by_clause"] = 7] = "group_by_clause";
    StatementContext[StatementContext["having_clause"] = 8] = "having_clause";
    StatementContext[StatementContext["for_update_clause"] = 9] = "for_update_clause";
    StatementContext[StatementContext["select"] = 10] = "select";
    StatementContext[StatementContext["insert_into_clause"] = 11] = "insert_into_clause";
    StatementContext[StatementContext["values_clause"] = 12] = "values_clause";
    StatementContext[StatementContext["returning_clause"] = 13] = "returning_clause";
    StatementContext[StatementContext["error_logging_clause"] = 14] = "error_logging_clause";
    StatementContext[StatementContext["conditional_insert_clause"] = 15] = "conditional_insert_clause";
    StatementContext[StatementContext["aliased_dml_table_expression_clause"] = 16] = "aliased_dml_table_expression_clause";
    StatementContext[StatementContext["dml_table_expression_clause"] = 17] = "dml_table_expression_clause";
    StatementContext[StatementContext["hint"] = 18] = "hint";
    StatementContext[StatementContext["insert"] = 19] = "insert";
    StatementContext[StatementContext["single_table_insert"] = 20] = "single_table_insert";
    StatementContext[StatementContext["multi_table_insert"] = 21] = "multi_table_insert";
    StatementContext[StatementContext["subquery"] = 22] = "subquery";
    StatementContext[StatementContext["update_set_clause"] = 23] = "update_set_clause";
    StatementContext[StatementContext["update"] = 24] = "update";
    StatementContext[StatementContext["unknown"] = -1] = "unknown";
})(StatementContext = exports.StatementContext || (exports.StatementContext = {}));
var OracleSQLPlusStmtType;
(function (OracleSQLPlusStmtType) {
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_UNKNOWN"] = 1] = "G_C_UNKNOWN";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_SQL"] = 2] = "G_C_SQL";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_PLSQL"] = 3] = "G_C_PLSQL";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_SQLPLUS"] = 4] = "G_C_SQLPLUS";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_COMMENT"] = 5] = "G_C_COMMENT";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_EMPTYLINE"] = 6] = "G_C_EMPTYLINE";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_MULTILINECOMMENT"] = 7] = "G_C_MULTILINECOMMENT";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_OLDCOMMENT"] = 8] = "G_C_OLDCOMMENT";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_USERDEFINED"] = 9] = "G_C_USERDEFINED";
})(OracleSQLPlusStmtType = exports.OracleSQLPlusStmtType || (exports.OracleSQLPlusStmtType = {}));
