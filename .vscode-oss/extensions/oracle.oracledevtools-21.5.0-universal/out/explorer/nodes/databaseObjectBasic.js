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
exports.CategoryNodeBase = exports.DatabaseObjectBasic = void 0;
const iExplorerNode_1 = require("../iExplorerNode");
const treeNodeBase_1 = require("../treeNodeBase");
const vscode_1 = require("vscode");
class DatabaseObjectBasic extends treeNodeBase_1.TreeNodeBase {
    constructor(connURI = "", parentPath = "", contextValue = "", imagePath = undefined, expNodeType = iExplorerNode_1.ExplorerNodeType.Leaf, schemaName, objectName = "") {
        super(connURI, parentPath, schemaName + "." + objectName, expNodeType, contextValue, imagePath, schemaName);
        this.objectName = objectName;
        this.isDatabaseObject = true;
    }
    populate(databaseObject) {
        this.setExtendedProperties(databaseObject);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    setExtendedProperties(dbo) {
        this.databaseObject = dbo;
        this.schemaName = this.databaseObject.schema;
        this.objectName = this.databaseObject.name;
        this.nodeID = this.objectName;
    }
    get ddexObjectType() {
        return this.ddexType;
    }
    set ddexObjectType(type) {
        this.ddexType = type;
    }
    toString() {
        return this.schemaName + "." + this.objectName + "." + this.ddexObjectType;
    }
}
exports.DatabaseObjectBasic = DatabaseObjectBasic;
class CategoryNodeBase extends treeNodeBase_1.TreeNodeBase {
    constructor(connURI, parentPath, nodeID, context, schemaName) {
        super(connURI, parentPath, nodeID, iExplorerNode_1.ExplorerNodeType.Category, context, new vscode_1.ThemeIcon('file-directory'), schemaName);
    }
}
exports.CategoryNodeBase = CategoryNodeBase;
