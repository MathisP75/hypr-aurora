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
exports.PackageNode = void 0;
const path = require("path");
const vscode_1 = require("vscode");
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const databaseObjects_1 = require("../databaseObjects");
const treeNodeBase_1 = require("../treeNodeBase");
const constants_1 = require("../../constants/constants");
const logger_1 = require("../../infrastructure/logger");
const setup_1 = require("../../utilities/setup");
class PackageNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.packageStr, new treeNodeBase_1.Icon(), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            let nodes = [];
            let restrictions = [];
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.packageObj.schema));
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_ObjectName, this.packageObj.name));
            let bodyNodes = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody, restrictions);
            nodes.push(...bodyNodes);
            restrictions = [];
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.packageObj.schema));
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_ParentObjectName, this.packageObj.name));
            let methodNodes = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod, restrictions);
            methodNodes.forEach(methodNode => {
                methodNode.databaseObject['status'] = this.databaseObject['status'];
                methodNode.databaseObject['isCompiledWithDebug'] = this.databaseObject['isCompiledWithDebug'];
            });
            nodes.push(...methodNodes);
            return nodes;
        });
    }
    setExtendedProperties(dbo) {
        this.packageObj = dbo;
        super.setExtendedProperties(dbo);
    }
    getStatusToIcon(status) {
        if (!PackageNode.map && !PackageNode.lhcMap) {
            let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
            let packageDarkIconPath = path.join(imagesPath, "dark", "package.svg");
            let packageXDarkIconPath = path.join(imagesPath, "dark", "package_x.svg");
            let packageDbgDarkIconPath = path.join(imagesPath, "dark", "package_dbg.svg");
            let packageLightIconPath = path.join(imagesPath, "light", "package.svg");
            let packageXLightIconPath = path.join(imagesPath, "light", "package_x.svg");
            let packageDbgLightIconPath = path.join(imagesPath, "light", "package_dbg.svg");
            if (!PackageNode.map) {
                PackageNode.map = new Map();
                PackageNode.map.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                PackageNode.map.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(packageDarkIconPath, packageLightIconPath));
                PackageNode.map.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(packageXDarkIconPath, packageXLightIconPath));
                PackageNode.map.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(packageDbgDarkIconPath, packageDbgLightIconPath));
                PackageNode.map.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(packageXDarkIconPath, packageXLightIconPath));
            }
            if (!PackageNode.lhcMap) {
                PackageNode.lhcMap = new Map();
                PackageNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                PackageNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(packageLightIconPath, packageDarkIconPath));
                PackageNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(packageXLightIconPath, packageXDarkIconPath));
                PackageNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(packageDbgLightIconPath, packageDbgDarkIconPath));
                PackageNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(packageXLightIconPath, packageXDarkIconPath));
            }
        }
        if (setup_1.Setup.CurrentColorThemeKind > vscode_1.ColorThemeKind.HighContrast) {
            return PackageNode.lhcMap.get(status);
        }
        return PackageNode.map.get(status);
    }
    get getObjectStatus() {
        if (this.packageObj.status === "VALID") {
            if (this.packageObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.ValidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Valid;
            }
        }
        else if (this.packageObj.status === "INVALID") {
            if (this.packageObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Invalid;
            }
        }
        return databaseObjects_1.CodeObjectStatus.None;
    }
    get getIconPath() {
        if (!this.packageObj) {
            logger_1.FileStreamLogger.Instance.info("PackageNode.getIconPath: Missing Package Object");
            return undefined;
        }
        return this.getStatusToIcon(this.getObjectStatus);
    }
}
exports.PackageNode = PackageNode;
