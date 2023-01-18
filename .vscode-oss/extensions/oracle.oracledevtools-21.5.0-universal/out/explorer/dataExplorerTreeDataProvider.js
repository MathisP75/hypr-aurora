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
exports.DataExplorerTreeDataProvider = void 0;
const vscode = require("vscode");
const logger_1 = require("../infrastructure/logger");
const helper = require("../utilities/helper");
class DataExplorerTreeDataProvider {
    constructor(model) {
        this.model = model;
        this._varonDidChangeTreeData = new vscode.EventEmitter();
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
    refresh(element) {
        this.varonDidChangeTreeData.fire(element);
    }
    getTreeItem(element) {
        return element ? element.getTreeItem() : null;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            let children = yield this.model.getChildren(element);
            if (children) {
                children.forEach((child) => {
                    child.parent = element;
                });
            }
            return Promise.resolve(children);
        });
    }
    getParent(element) {
        let parentNode = undefined;
        try {
            if (element) {
                let treeNode = element;
                if (treeNode) {
                    parentNode = treeNode.parent;
                }
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.error("Error on finding parent node");
            helper.logErroAfterValidating(err);
        }
        return parentNode;
    }
}
exports.DataExplorerTreeDataProvider = DataExplorerTreeDataProvider;
