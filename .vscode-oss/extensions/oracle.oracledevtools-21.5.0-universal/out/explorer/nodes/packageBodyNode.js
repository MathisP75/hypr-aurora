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
exports.PackageBodyNode = void 0;
const path = require("path");
const vscode_1 = require("vscode");
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const databaseObjects_1 = require("../databaseObjects");
const dataExplorerManager_1 = require("../dataExplorerManager");
const treeNodeBase_1 = require("../treeNodeBase");
const constants_1 = require("../../constants/constants");
const logger_1 = require("../../infrastructure/logger");
const setup_1 = require("../../utilities/setup");
class PackageBodyNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.packageBodyStr, new treeNodeBase_1.Icon(), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            let nodes = [];
            let restrictions = [];
            restrictions = [];
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.packageBodyObj.schema));
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_ParentObjectName, this.packageBodyObj.name));
            let specMethodNodes = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod, restrictions);
            let methodNodes = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyPrivateMethod, restrictions);
            let bodyMethodToIndexMap = {};
            let index = 0;
            let bodyMethodNodes = methodNodes;
            bodyMethodNodes.forEach(method => {
                if (bodyMethodToIndexMap[method.getNodeIdentifier] === undefined)
                    bodyMethodToIndexMap[method.getNodeIdentifier] = [index++];
                else
                    bodyMethodToIndexMap[method.getNodeIdentifier].push(index++);
                method.databaseObject['isSpecMethod'] = false;
                method.databaseObject['status'] = this.databaseObject['status'];
                method.databaseObject['isCompiledWithDebug'] = this.databaseObject['isCompiledWithDebug'];
            });
            specMethodNodes.forEach(specMethod => {
                if (bodyMethodToIndexMap[specMethod.objectName] !== undefined) {
                    var methodIndexList = bodyMethodToIndexMap[specMethod.objectName];
                    var i = 0;
                    while (i < methodIndexList.length) {
                        if (!specMethod.children)
                            specMethod.getChildren();
                        if (dataExplorerManager_1.DataExplorerManager.Instance.areParamatersEqual(specMethod.children, bodyMethodNodes[methodIndexList[i++]].databaseObject['parsedParams'])) {
                            specMethod.databaseObject['status'] = this.databaseObject['status'];
                            specMethod.databaseObject['isCompiledWithDebug'] = this.databaseObject['isCompiledWithDebug'];
                            nodes.push(specMethod);
                            bodyMethodNodes[methodIndexList[i - 1]].databaseObject['isSpecMethod'] = true;
                            break;
                        }
                    }
                }
            });
            for (var i = 0; i < bodyMethodNodes.length; ++i)
                if (!bodyMethodNodes[i].databaseObject['isSpecMethod'])
                    nodes.push(bodyMethodNodes[i]);
            return nodes;
        });
    }
    setExtendedProperties(dbo) {
        this.packageBodyObj = dbo;
        super.setExtendedProperties(dbo);
        this.nodeLabel = utilities_1.TreeViewConstants.packageBodyCaptionStr;
        this.nodeID = this.packageBodyObj.name + utilities_1.TreeViewConstants.packageBodyCaptionStr;
        this.toolTipMsg = utilities_1.TreeViewConstants.packageBodyCaptionStr + ': ' + this.packageBodyObj.name;
    }
    getStatusToIcon(status) {
        if (!PackageBodyNode.map && !PackageBodyNode.lhcMap) {
            let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
            let pkgBodyNodeDarkIconPath = path.join(imagesPath, "dark", "package.svg");
            let pkgBodyNodeLightIconPath = path.join(imagesPath, "light", "package.svg");
            let pkgBodyNodeXDarkIconPath = path.join(imagesPath, "dark", "package_x.svg");
            let pkgBodyNodeXLightIconPath = path.join(imagesPath, "light", "package_x.svg");
            let pkgBodyNodeDbgDarkIconPath = path.join(imagesPath, "dark", "package_dbg.svg");
            let pkgBodyNodeDbgLightIconPath = path.join(imagesPath, "light", "package_dbg.svg");
            if (!PackageBodyNode.map) {
                PackageBodyNode.map = new Map();
                PackageBodyNode.map.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                PackageBodyNode.map.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(pkgBodyNodeDarkIconPath, pkgBodyNodeLightIconPath));
                PackageBodyNode.map.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(pkgBodyNodeXDarkIconPath, pkgBodyNodeXLightIconPath));
                PackageBodyNode.map.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(pkgBodyNodeDbgDarkIconPath, pkgBodyNodeDbgLightIconPath));
                PackageBodyNode.map.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(pkgBodyNodeXDarkIconPath, pkgBodyNodeXLightIconPath));
            }
            if (!PackageBodyNode.lhcMap) {
                PackageBodyNode.lhcMap = new Map();
                PackageBodyNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                PackageBodyNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(pkgBodyNodeLightIconPath, pkgBodyNodeDarkIconPath));
                PackageBodyNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(pkgBodyNodeXLightIconPath, pkgBodyNodeXDarkIconPath));
                PackageBodyNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(pkgBodyNodeDbgLightIconPath, pkgBodyNodeDbgDarkIconPath));
                PackageBodyNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(pkgBodyNodeXLightIconPath, pkgBodyNodeXDarkIconPath));
            }
        }
        if (setup_1.Setup.CurrentColorThemeKind > vscode_1.ColorThemeKind.HighContrast) {
            return PackageBodyNode.lhcMap.get(status);
        }
        return PackageBodyNode.map.get(status);
    }
    get getObjectStatus() {
        if (this.packageBodyObj.status === "VALID") {
            if (this.packageBodyObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.ValidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Valid;
            }
        }
        else if (this.packageBodyObj.status === "INVALID") {
            if (this.packageBodyObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Invalid;
            }
        }
        return databaseObjects_1.CodeObjectStatus.None;
    }
    get getIconPath() {
        if (!this.packageBodyObj) {
            logger_1.FileStreamLogger.Instance.info("PackageBodyNode.getIconPath: Missing PackageBody Object");
            return undefined;
        }
        return this.getStatusToIcon(this.getObjectStatus);
    }
}
exports.PackageBodyNode = PackageBodyNode;
