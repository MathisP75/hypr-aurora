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
exports.packageMethodParameterNode = void 0;
const helper = require("../../utilities/helper");
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const vscode_1 = require("vscode");
class packageMethodParameterNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.packageMethodParameterStr, new vscode_1.ThemeIcon('symbol-parameter'), iExplorerNode_1.ExplorerNodeType.Leaf, schemaName, objectName);
        this.canRefresh = false;
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    setExtendedProperties(dbo) {
        this.packageMethodPrameterObj = dbo;
        super.setExtendedProperties(dbo);
        if (this.packageMethodPrameterObj.direction === utilities_1.TreeViewConstants.parameterDirectionOUT && this.packageMethodPrameterObj.ordinal == 0) {
            this.nodeID = helper.stringFormatterCsharpStyle(utilities_1.TreeViewConstants.returnValueCaptionStr, this.databaseObject['dataType']);
            this.databaseObject['isReturnValue'] = true;
        }
        else {
            this.nodeID = this.getNodeIdentifier + ': ' + this.databaseObject['dataType'];
            this.toolTipMsg = this.databaseObject['name'] + ' ' + this.databaseObject['direction'] + ' ' + this.databaseObject['dataType'];
        }
    }
}
exports.packageMethodParameterNode = packageMethodParameterNode;
