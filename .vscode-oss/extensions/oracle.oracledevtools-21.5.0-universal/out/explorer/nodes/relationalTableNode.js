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
exports.XMLTableNode = exports.ObjectTableNode = exports.RelationalTableNode = void 0;
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const tableConstraintCategoryNode_1 = require("./tableConstraintCategoryNode");
const tableIndexCategoryNode_1 = require("./tableIndexCategoryNode");
const vscode_1 = require("vscode");
class RelationalTableNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.relationalTableStr, new vscode_1.ThemeIcon('symbol-constant'), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            let nodes = [];
            let restrictions = [];
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.tableObj.schema));
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_DefinerObjectName, this.tableObj.name));
            let columnNodes = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableColumn, restrictions);
            nodes.push(...columnNodes);
            const parentPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
            let constraintsNode = new tableConstraintCategoryNode_1.TableConstraintCategoryNode(this.getConnectionURI, parentPath, this.tableObj.schema, this.tableObj.name, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableConstraint, this.schemaName);
            nodes.push(constraintsNode);
            let indexesNode = new tableIndexCategoryNode_1.TableIndexCategoryNode(this.getConnectionURI, parentPath, this.tableObj.schema, this.tableObj.name, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableIndex, this.schemaName);
            nodes.push(indexesNode);
            return nodes;
        });
    }
    setExtendedProperties(dbo) {
        this.tableObj = dbo;
        super.setExtendedProperties(dbo);
    }
}
exports.RelationalTableNode = RelationalTableNode;
class ObjectTableNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.objectTableStr, new vscode_1.ThemeIcon('symbol-constant'), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            let nodes = [];
            let restrictions = [];
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.tableObj.schema));
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_DefinerObjectName, this.tableObj.name));
            let columnNodes = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableColumn, restrictions);
            nodes.push(...columnNodes);
            const parentPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
            let constraintsNode = new tableConstraintCategoryNode_1.TableConstraintCategoryNode(this.getConnectionURI, parentPath, this.tableObj.schema, this.tableObj.name, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableConstraint, this.schemaName);
            nodes.push(constraintsNode);
            let indexesNode = new tableIndexCategoryNode_1.TableIndexCategoryNode(this.getConnectionURI, parentPath, this.tableObj.schema, this.tableObj.name, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableIndex, this.schemaName);
            nodes.push(indexesNode);
            return nodes;
        });
    }
    setExtendedProperties(dbo) {
        this.tableObj = dbo;
        super.setExtendedProperties(dbo);
    }
}
exports.ObjectTableNode = ObjectTableNode;
class XMLTableNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.xmlTableStr, new vscode_1.ThemeIcon('symbol-constant'), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            let nodes = [];
            let restrictions = [];
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.tableObj.schema));
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_DefinerObjectName, this.tableObj.name));
            let columnNodes = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableColumn, restrictions);
            nodes.push(...columnNodes);
            const parentPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
            let constraintsNode = new tableConstraintCategoryNode_1.TableConstraintCategoryNode(this.getConnectionURI, parentPath, this.tableObj.schema, this.tableObj.name, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableConstraint, this.schemaName);
            nodes.push(constraintsNode);
            let indexesNode = new tableIndexCategoryNode_1.TableIndexCategoryNode(this.getConnectionURI, parentPath, this.tableObj.schema, this.tableObj.name, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableIndex, this.schemaName);
            nodes.push(indexesNode);
            return nodes;
        });
    }
    setExtendedProperties(dbo) {
        this.tableObj = dbo;
        super.setExtendedProperties(dbo);
    }
}
exports.XMLTableNode = XMLTableNode;
