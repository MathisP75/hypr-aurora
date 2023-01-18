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
exports.DatabaseTriggerCategoryNode = exports.SchemaTriggerCategoryNode = exports.ViewTriggerCategoryNode = exports.TableTriggerCategoryNode = void 0;
const utilities_1 = require("../utilities");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
class TableTriggerCategoryNode extends databaseObjectBasic_1.CategoryNodeBase {
    constructor(connURI, parentPath, schemaName) {
        super(connURI, parentPath, utilities_1.TreeViewConstants.tableTriggersStr, utilities_1.TreeViewConstants.tableTriggersStr, schemaName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!this.children) {
                        let restrictions = [];
                        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_IncludeSchemas, [this.schemaName]));
                        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_ExcludeSchemas, []));
                        this.children = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_TableTriggerMain, restrictions);
                    }
                    return resolve(this.children);
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
}
exports.TableTriggerCategoryNode = TableTriggerCategoryNode;
class ViewTriggerCategoryNode extends databaseObjectBasic_1.CategoryNodeBase {
    constructor(connURI, parentPath, schemaName) {
        super(connURI, parentPath, utilities_1.TreeViewConstants.viewTriggersStr, utilities_1.TreeViewConstants.viewTriggersStr, schemaName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!this.children) {
                        let restrictions = [];
                        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_IncludeSchemas, [this.schemaName]));
                        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_ExcludeSchemas, []));
                        this.children = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ViewTriggerMain, restrictions);
                    }
                    return resolve(this.children);
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
}
exports.ViewTriggerCategoryNode = ViewTriggerCategoryNode;
class SchemaTriggerCategoryNode extends databaseObjectBasic_1.CategoryNodeBase {
    constructor(connURI, parentPath, schemaName) {
        super(connURI, parentPath, utilities_1.TreeViewConstants.schemaTriggersStr, utilities_1.TreeViewConstants.schemaTriggersStr, schemaName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!this.children) {
                        let restrictions = [];
                        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_IncludeSchemas, [this.schemaName]));
                        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_ExcludeSchemas, []));
                        this.children = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_SchemaTriggerMain, restrictions);
                    }
                    return resolve(this.children);
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
}
exports.SchemaTriggerCategoryNode = SchemaTriggerCategoryNode;
class DatabaseTriggerCategoryNode extends databaseObjectBasic_1.CategoryNodeBase {
    constructor(connURI, parentPath, schemaName) {
        super(connURI, parentPath, utilities_1.TreeViewConstants.databaseTriggersStr, utilities_1.TreeViewConstants.databaseTriggersStr, schemaName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!this.children) {
                        let restrictions = [];
                        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_IncludeSchemas, [this.schemaName]));
                        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_ExcludeSchemas, []));
                        this.children = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_DatabaseTriggerMain, restrictions);
                    }
                    return resolve(this.children);
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
}
exports.DatabaseTriggerCategoryNode = DatabaseTriggerCategoryNode;
