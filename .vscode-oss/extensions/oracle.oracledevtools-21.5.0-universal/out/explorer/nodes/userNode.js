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
exports.userNode = void 0;
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const tableCategoryNode_1 = require("./tableCategoryNode");
const viewCategoryNode_1 = require("./viewCategoryNode");
const procedureCategoryNode_1 = require("./procedureCategoryNode");
const functionCategoryNode_1 = require("./functionCategoryNode");
const packageCategoryNode_1 = require("./packageCategoryNode");
const triggerCategoryNode_1 = require("./triggerCategoryNode");
const synonymCategoryNode_1 = require("./synonymCategoryNode");
const sequenceCategoryNode_1 = require("./sequenceCategoryNode");
const vscode_1 = require("vscode");
class userNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.userStr, new vscode_1.ThemeIcon('account'), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (!this.children) {
                    resolve(this.getSubChildren());
                }
                else {
                    resolve(this.children);
                }
            });
        });
    }
    setExtendedProperties(dbo) {
        super.setExtendedProperties(dbo);
        this.schemaName = this.objectName;
    }
    getSubChildren() {
        if (!this.children) {
            const arrtoRet = [];
            const prtPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
            let catNode;
            catNode = new tableCategoryNode_1.TableCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
            arrtoRet.push(catNode);
            catNode = new viewCategoryNode_1.ViewCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
            arrtoRet.push(catNode);
            catNode = new procedureCategoryNode_1.ProcedureCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
            arrtoRet.push(catNode);
            catNode = new functionCategoryNode_1.FunctionCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
            arrtoRet.push(catNode);
            catNode = new packageCategoryNode_1.PackageCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
            arrtoRet.push(catNode);
            catNode = new triggerCategoryNode_1.TriggerCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
            arrtoRet.push(catNode);
            catNode = new synonymCategoryNode_1.SynonymCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
            arrtoRet.push(catNode);
            catNode = new sequenceCategoryNode_1.SequenceCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
            arrtoRet.push(catNode);
            this.children = arrtoRet;
        }
        return this.children;
    }
}
exports.userNode = userNode;
