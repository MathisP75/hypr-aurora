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
exports.TableCategoryNode = void 0;
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const objectTableCategoryNode_1 = require("./objectTableCategoryNode");
const relationalTableCategoryNode_1 = require("./relationalTableCategoryNode");
const xmlTableCategoryNode_1 = require("./xmlTableCategoryNode");
class TableCategoryNode extends databaseObjectBasic_1.CategoryNodeBase {
    constructor(connURI, parentPath, schemaName) {
        super(connURI, parentPath, utilities_1.TreeViewConstants.tablesStr, utilities_1.TreeViewConstants.tablesStr, schemaName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getSubChildren();
        });
    }
    getSubChildren() {
        if (!this.children) {
            const arrtoRet = [];
            const prtPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
            let catNode;
            catNode = new relationalTableCategoryNode_1.RelationalTableCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
            arrtoRet.push(catNode);
            catNode = new objectTableCategoryNode_1.ObjectTableCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
            arrtoRet.push(catNode);
            catNode = new xmlTableCategoryNode_1.XMLTableCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
            arrtoRet.push(catNode);
            this.children = arrtoRet;
        }
        return this.children;
    }
}
exports.TableCategoryNode = TableCategoryNode;
