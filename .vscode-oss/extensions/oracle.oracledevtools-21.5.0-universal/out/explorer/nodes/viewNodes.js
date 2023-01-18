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
exports.MaterializedViewNode = exports.XMLViewNode = exports.ObjectViewNode = exports.RelationalViewNode = void 0;
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const vscode_1 = require("vscode");
class RelationalViewNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.relationalViewStr, new vscode_1.ThemeIcon('symbol-enum', new vscode_1.ThemeColor('icon.foreground')), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            let nodes = [];
            let restrictions = [];
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.viewObj.schema));
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_DefinerObjectName, this.viewObj.name));
            let columnNodes = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalViewColumn, restrictions);
            nodes.push(...columnNodes);
            return nodes;
        });
    }
    setExtendedProperties(dbo) {
        this.viewObj = dbo;
        super.setExtendedProperties(dbo);
    }
}
exports.RelationalViewNode = RelationalViewNode;
class ObjectViewNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.objectViewStr, new vscode_1.ThemeIcon('symbol-enum', new vscode_1.ThemeColor('icon.foreground')), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            let nodes = [];
            let restrictions = [];
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.viewObj.schema));
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_DefinerObjectName, this.viewObj.name));
            let columnNodes = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectViewColumn, restrictions);
            nodes.push(...columnNodes);
            return nodes;
        });
    }
    setExtendedProperties(dbo) {
        this.viewObj = dbo;
        super.setExtendedProperties(dbo);
    }
}
exports.ObjectViewNode = ObjectViewNode;
class XMLViewNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.xmlViewStr, new vscode_1.ThemeIcon('symbol-enum', new vscode_1.ThemeColor('icon.foreground')), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            let nodes = [];
            let restrictions = [];
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.viewObj.schema));
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_DefinerObjectName, this.viewObj.name));
            let columnNodes = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLViewColumn, restrictions);
            nodes.push(...columnNodes);
            return nodes;
        });
    }
    setExtendedProperties(dbo) {
        this.viewObj = dbo;
        super.setExtendedProperties(dbo);
    }
}
exports.XMLViewNode = XMLViewNode;
class MaterializedViewNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.materializedViewCaptionStr, new vscode_1.ThemeIcon('symbol-enum', new vscode_1.ThemeColor('icon.foreground')), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            let nodes = [];
            let restrictions = [];
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.viewObj.schema));
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_DefinerObjectName, this.viewObj.name));
            let columnNodes = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedViewColumn, restrictions);
            nodes.push(...columnNodes);
            return nodes;
        });
    }
    setExtendedProperties(dbo) {
        this.viewObj = dbo;
        super.setExtendedProperties(dbo);
    }
}
exports.MaterializedViewNode = MaterializedViewNode;
