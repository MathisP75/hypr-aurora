"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Icon = exports.TreeNodeBase = void 0;
const vscode = require("vscode");
const iExplorerNode_1 = require("./iExplorerNode");
class TreeNodeBase {
    constructor(connectionURI, parentPath, nodeID, nodeType, contextValue, iconPath, schemaName, nodeLabel = "") {
        this.connectionURI = connectionURI;
        this.parentPath = parentPath;
        this.nodeID = nodeID;
        this.nodeType = nodeType;
        this.contextValue = contextValue;
        this.iconPath = iconPath;
        this.schemaName = schemaName;
        this.nodeLabel = nodeLabel;
        this.canRefresh = true;
        this.toolTipMsg = "";
    }
    removeChild(treeNode) {
        let index = this.childrenField.indexOf(treeNode);
        if (index > -1) {
            this.childrenField.splice(index, 1);
        }
    }
    get getNodeType() {
        return this.nodeType;
    }
    reset() {
        this.childrenField = undefined;
    }
    get getIconPath() {
        if (this.iconPath)
            if ((this.iconPath instanceof Icon && this.iconPath.light && this.iconPath.dark) ||
                (this.iconPath instanceof vscode.ThemeIcon))
                return this.iconPath;
        return undefined;
    }
    get getContextValue() {
        return this.contextValue;
    }
    get getNodeIdentifier() {
        return this.nodeID;
    }
    set setNodeIdentifier(nodeId) {
        this.nodeID = nodeId;
    }
    get getParentPath() {
        return this.parentPath;
    }
    get getConnectionURI() {
        return this.connectionURI;
    }
    get children() {
        return this.childrenField;
    }
    set children(value) {
        this.childrenField = value;
    }
    getTreeItem() {
        const treeItemObject = {};
        treeItemObject.label = this.nodeLabel == "" ? this.getNodeIdentifier : this.nodeLabel;
        ;
        treeItemObject.collapsibleState = this.getExpansionState();
        treeItemObject.contextValue = this.getContextValue;
        treeItemObject.iconPath = this.getIconPath;
        treeItemObject.command = this.getCommandObject();
        treeItemObject.tooltip = this.toolTipMsg == "" ? this.getNodeIdentifier : this.toolTipMsg;
        return treeItemObject;
    }
    getChildren() {
        return null;
    }
    getResourceURI() {
        return this.resourceURI;
    }
    getCommandObject() {
        return undefined;
    }
    getExpansionState() {
        return this.getNodeType == iExplorerNode_1.ExplorerNodeType.Category ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
    }
}
exports.TreeNodeBase = TreeNodeBase;
class Icon {
    constructor(dark = "", light = "") {
        this.dark = dark;
        this.light = light;
    }
}
exports.Icon = Icon;
