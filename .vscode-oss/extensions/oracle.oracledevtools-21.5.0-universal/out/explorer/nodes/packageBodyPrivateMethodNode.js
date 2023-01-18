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
exports.PackageBodyPrivateMethodNode = void 0;
const path = require("path");
const vscode_1 = require("vscode");
const databaseObjects_1 = require("../databaseObjects");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const iExplorerNode_1 = require("../iExplorerNode");
const treeNodeBase_1 = require("../treeNodeBase");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const constants_1 = require("../../constants/constants");
const logger_1 = require("../../infrastructure/logger");
const setup_1 = require("../../utilities/setup");
class PackageBodyPrivateMethodNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.packageBodyPrivateMethodStr, new treeNodeBase_1.Icon(), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
        this.canRefresh = false;
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const results = [];
                var ordinal = 0;
                const prtPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
                while (ordinal < this.packageBodyPrivateMethodObj.parsedParams.length) {
                    let paramNode = {
                        package: this.packageBodyPrivateMethodObj.parent,
                        name: this.packageBodyPrivateMethodObj.parsedParams[ordinal].name,
                        direction: this.packageBodyPrivateMethodObj.parsedParams[ordinal].direction,
                        dataType: this.packageBodyPrivateMethodObj.parsedParams[ordinal].dbDataType,
                        parent: this.packageBodyPrivateMethodObj.parent,
                        qualifiedName: this.packageBodyPrivateMethodObj.parsedParams[ordinal].name,
                        id: 0,
                        ordinal: ordinal,
                        precision: 0,
                        typeName: this.packageBodyPrivateMethodObj.parsedParams[ordinal].dbDataType,
                        length: 0,
                        dataTypeName: this.packageBodyPrivateMethodObj.parsedParams[ordinal].dbDataType,
                        dataTypeOwner: this.packageBodyPrivateMethodObj.schema,
                        scale: 0,
                        typeSubName: '',
                        plsType: '',
                        schema: this.packageBodyPrivateMethodObj.schema
                    };
                    ++ordinal;
                    results.push(utilities_1.ExplorerUtilities.GetChildObject(this.connectionURI, prtPath, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageStoredProcedureParameter, paramNode));
                }
                ;
                this.children = results;
                resolve(this.children);
            }));
        });
    }
    setExtendedProperties(dbo) {
        this.packageBodyPrivateMethodObj = dbo;
        super.setExtendedProperties(dbo);
        this.getChildren();
        this.toolTipMsg = utilities_1.ExplorerUtilities.getToolTipForMethod(this.packageBodyPrivateMethodObj.parsedParams, this.getNodeIdentifier, false);
    }
    getStatusToIcon(status) {
        if (!PackageBodyPrivateMethodNode.map && !PackageBodyPrivateMethodNode.lhcMap) {
            let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
            let pkgBodyPrivMethodNodeDarkIconPath = path.join(imagesPath, "dark", "private_procedure.svg");
            let pkgBodyPrivMethodNodeLightIconPath = path.join(imagesPath, "light", "private_procedure.svg");
            let pkgBodyPrivMethodNodeXDarkIconPath = path.join(imagesPath, "dark", "private_procedure_x.svg");
            let pkgBodyPrivMethodNodeXLightIconPath = path.join(imagesPath, "light", "private_procedure_x.svg");
            let pkgBodyPrivMethodNodeDbgDarkIconPath = path.join(imagesPath, "dark", "private_procedure_dbg.svg");
            let pkgBodyPrivMethodNodeDbgLightIconPath = path.join(imagesPath, "light", "private_procedure_dbg.svg");
            if (!PackageBodyPrivateMethodNode.map) {
                PackageBodyPrivateMethodNode.map = new Map();
                PackageBodyPrivateMethodNode.map.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                PackageBodyPrivateMethodNode.map.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(pkgBodyPrivMethodNodeDarkIconPath, pkgBodyPrivMethodNodeLightIconPath));
                PackageBodyPrivateMethodNode.map.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(pkgBodyPrivMethodNodeXDarkIconPath, pkgBodyPrivMethodNodeXLightIconPath));
                PackageBodyPrivateMethodNode.map.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(pkgBodyPrivMethodNodeDbgDarkIconPath, pkgBodyPrivMethodNodeDbgLightIconPath));
                PackageBodyPrivateMethodNode.map.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(pkgBodyPrivMethodNodeXDarkIconPath, pkgBodyPrivMethodNodeXLightIconPath));
            }
            if (!PackageBodyPrivateMethodNode.lhcMap) {
                PackageBodyPrivateMethodNode.lhcMap = new Map();
                PackageBodyPrivateMethodNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                PackageBodyPrivateMethodNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(pkgBodyPrivMethodNodeLightIconPath, pkgBodyPrivMethodNodeDarkIconPath));
                PackageBodyPrivateMethodNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(pkgBodyPrivMethodNodeXLightIconPath, pkgBodyPrivMethodNodeXDarkIconPath));
                PackageBodyPrivateMethodNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(pkgBodyPrivMethodNodeDbgLightIconPath, pkgBodyPrivMethodNodeDbgDarkIconPath));
                PackageBodyPrivateMethodNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(pkgBodyPrivMethodNodeXLightIconPath, pkgBodyPrivMethodNodeXDarkIconPath));
            }
        }
        if (setup_1.Setup.CurrentColorThemeKind > vscode_1.ColorThemeKind.HighContrast) {
            return PackageBodyPrivateMethodNode.lhcMap.get(status);
        }
        return PackageBodyPrivateMethodNode.map.get(status);
    }
    get getObjectStatus() {
        if (this.packageBodyPrivateMethodObj.status === "VALID") {
            if (this.packageBodyPrivateMethodObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.ValidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Valid;
            }
        }
        else if (this.packageBodyPrivateMethodObj.status === "INVALID") {
            if (this.packageBodyPrivateMethodObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Invalid;
            }
        }
        return databaseObjects_1.CodeObjectStatus.None;
    }
    get getIconPath() {
        if (!this.packageBodyPrivateMethodObj) {
            logger_1.FileStreamLogger.Instance.info("PackageBodyPrivateMethodNode.getIconPath: Missing PackageBody PrivateMethod Object");
            return undefined;
        }
        return this.getStatusToIcon(this.getObjectStatus);
    }
}
exports.PackageBodyPrivateMethodNode = PackageBodyPrivateMethodNode;
