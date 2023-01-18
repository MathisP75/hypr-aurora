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
exports.OCIExplorerTreeDataProvider = void 0;
const vscode = require("vscode");
class OCIExplorerTreeDataProvider {
    constructor(model) {
        this.model = model;
        this._varonDidChangeTreeData = new vscode.EventEmitter();
        this.nodes = new Map();
        this.onDidChangeTreeData = this._varonDidChangeTreeData.event;
        model.addModelChangedHandler((data) => {
            this.varonDidChangeTreeData.fire(data);
        });
    }
    get varonDidChangeTreeData() {
        return this._varonDidChangeTreeData;
    }
    set varonDidChangeTreeData(value) {
        this._varonDidChangeTreeData = value;
    }
    getTreeItem(element) {
        return element ? element.getTreeItem() : null;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            let children = yield this.model.getChildren(element);
            if (children) {
                children.forEach((child) => {
                    if (child) {
                        this.nodes.set(child.getNodeIdentifier, child);
                    }
                });
            }
            return Promise.resolve(children);
        });
    }
    getParent(element) {
        let result;
        if (element) {
            let treeNode = element;
            if (treeNode.parentPath) {
                let lastTokenStart = treeNode.parentPath.lastIndexOf("\\");
                let nodeIdentifer = treeNode.parentPath.substring(lastTokenStart + 1);
                if (this.nodes.has(nodeIdentifer)) {
                    result = this.nodes.get(nodeIdentifer);
                }
            }
        }
        return result;
    }
}
exports.OCIExplorerTreeDataProvider = OCIExplorerTreeDataProvider;
