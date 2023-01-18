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
exports.ViewCategoryNode = void 0;
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const materializedViewCategoryNode_1 = require("./materializedViewCategoryNode");
const objectViewCategoryNode_1 = require("./objectViewCategoryNode");
const relationalViewCategoryNode_1 = require("./relationalViewCategoryNode");
const xmlViewCategoryNode_1 = require("./xmlViewCategoryNode");
class ViewCategoryNode extends databaseObjectBasic_1.CategoryNodeBase {
    constructor(connURI, parentPath, schemaName) {
        super(connURI, parentPath, utilities_1.TreeViewConstants.viewsStr, utilities_1.TreeViewConstants.viewsStr, schemaName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.children) {
                const arrtoRet = [];
                const prtPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
                let catNode;
                catNode = new relationalViewCategoryNode_1.RelationalViewCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
                catNode = new objectViewCategoryNode_1.ObjectViewCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
                catNode = new xmlViewCategoryNode_1.XMLViewCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
                catNode = new materializedViewCategoryNode_1.MaterializedViewCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
                this.children = arrtoRet;
            }
            return this.children;
        });
    }
}
exports.ViewCategoryNode = ViewCategoryNode;
