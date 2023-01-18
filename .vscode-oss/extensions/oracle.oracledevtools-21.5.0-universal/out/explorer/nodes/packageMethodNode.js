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
exports.PackageMethodNode = void 0;
const path = require("path");
const vscode_1 = require("vscode");
const databaseObjects_1 = require("../databaseObjects");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const treeNodeBase_1 = require("../treeNodeBase");
const constants_1 = require("../../constants/constants");
const logger_1 = require("../../infrastructure/logger");
const setup_1 = require("../../utilities/setup");
class PackageMethodNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.packageMethodStr, new treeNodeBase_1.Icon(), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
        this.canRefresh = false;
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            let results = [];
            if (this.packageMethodObj && this.packageMethodObj.params) {
                const prtPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
                for (let i = 0; i < this.packageMethodObj.params.length; ++i) {
                    results.push(utilities_1.ExplorerUtilities.GetChildObject(this.connectionURI, prtPath, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageStoredProcedureParameter, this.packageMethodObj.params[i]));
                }
            }
            this.children = results;
            return results;
        });
    }
    setExtendedProperties(dbo) {
        this.packageMethodObj = dbo;
        super.setExtendedProperties(dbo);
    }
    getStatusToIcon(status) {
        let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
        if (!PackageMethodNode.pkgspecMethodIconmap && !PackageMethodNode.pkgspecMethodHclIconmap &&
            !PackageMethodNode.pkgbodyMethodIconmap && !PackageMethodNode.pkgbodyMethodHclIconmap) {
            let pkgSpecMethodNodeDarkIconPath = path.join(imagesPath, "dark", "packagespecification_procedure.svg");
            let pkgSpecMethodNodeLightIconPath = path.join(imagesPath, "light", "packagespecification_procedure.svg");
            let pkgSpecMethodNodeXDarkIconPath = path.join(imagesPath, "dark", "packagespecification_procedure_x.svg");
            let pkgSpecMethodNodeXLightIconPath = path.join(imagesPath, "light", "packagespecification_procedure_x.svg");
            let pkgSpecMethodNodeDbgDarkIconPath = path.join(imagesPath, "dark", "packagespecification_procedure_dbg.svg");
            let pkgSpecMethodNodeDbgLightIconPath = path.join(imagesPath, "light", "packagespecification_procedure_dbg.svg");
            let pkgBodyMethodNodeDarkIconPath = path.join(imagesPath, "dark", "procedure.svg");
            let pkgBodyMethodNodeLightIconPath = path.join(imagesPath, "light", "procedure.svg");
            let pkgBodyMethodNodeXDarkIconPath = path.join(imagesPath, "dark", "procedure_x.svg");
            let pkgBodyMethodNodeXLightIconPath = path.join(imagesPath, "light", "procedure_x.svg");
            let pkgBodyMethodNodeDbgDarkIconPath = path.join(imagesPath, "dark", "procedure_dbg.svg");
            let pkgBodyMethodNodeDbgLightIconPath = path.join(imagesPath, "light", "procedure_dbg.svg");
            if (!PackageMethodNode.pkgspecMethodIconmap) {
                PackageMethodNode.pkgspecMethodIconmap = new Map();
                PackageMethodNode.pkgspecMethodIconmap.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                PackageMethodNode.pkgspecMethodIconmap.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(pkgSpecMethodNodeDarkIconPath, pkgSpecMethodNodeLightIconPath));
                PackageMethodNode.pkgspecMethodIconmap.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(pkgSpecMethodNodeXDarkIconPath, pkgSpecMethodNodeXLightIconPath));
                PackageMethodNode.pkgspecMethodIconmap.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(pkgSpecMethodNodeDbgDarkIconPath, pkgSpecMethodNodeDbgLightIconPath));
                PackageMethodNode.pkgspecMethodIconmap.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(pkgSpecMethodNodeXDarkIconPath, pkgSpecMethodNodeXLightIconPath));
            }
            if (!PackageMethodNode.pkgspecMethodHclIconmap) {
                PackageMethodNode.pkgspecMethodHclIconmap = new Map();
                PackageMethodNode.pkgspecMethodHclIconmap.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                PackageMethodNode.pkgspecMethodHclIconmap.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(pkgSpecMethodNodeLightIconPath, pkgSpecMethodNodeDarkIconPath));
                PackageMethodNode.pkgspecMethodHclIconmap.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(pkgSpecMethodNodeXLightIconPath, pkgSpecMethodNodeXDarkIconPath));
                PackageMethodNode.pkgspecMethodHclIconmap.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(pkgSpecMethodNodeDbgLightIconPath, pkgSpecMethodNodeDbgDarkIconPath));
                PackageMethodNode.pkgspecMethodHclIconmap.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(pkgSpecMethodNodeXLightIconPath, pkgSpecMethodNodeXDarkIconPath));
            }
            if (!PackageMethodNode.pkgbodyMethodIconmap) {
                PackageMethodNode.pkgbodyMethodIconmap = new Map();
                PackageMethodNode.pkgbodyMethodIconmap.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                PackageMethodNode.pkgbodyMethodIconmap.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(pkgBodyMethodNodeDarkIconPath, pkgBodyMethodNodeLightIconPath));
                PackageMethodNode.pkgbodyMethodIconmap.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(pkgBodyMethodNodeXDarkIconPath, pkgBodyMethodNodeXLightIconPath));
                PackageMethodNode.pkgbodyMethodIconmap.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(pkgBodyMethodNodeDbgDarkIconPath, pkgBodyMethodNodeDbgLightIconPath));
                PackageMethodNode.pkgbodyMethodIconmap.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(pkgBodyMethodNodeXDarkIconPath, pkgBodyMethodNodeXLightIconPath));
            }
            if (!PackageMethodNode.pkgbodyMethodHclIconmap) {
                PackageMethodNode.pkgbodyMethodHclIconmap = new Map();
                PackageMethodNode.pkgbodyMethodHclIconmap.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                PackageMethodNode.pkgbodyMethodHclIconmap.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(pkgBodyMethodNodeLightIconPath, pkgBodyMethodNodeDarkIconPath));
                PackageMethodNode.pkgbodyMethodHclIconmap.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(pkgBodyMethodNodeXLightIconPath, pkgBodyMethodNodeXDarkIconPath));
                PackageMethodNode.pkgbodyMethodHclIconmap.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(pkgBodyMethodNodeDbgLightIconPath, pkgBodyMethodNodeDbgDarkIconPath));
                PackageMethodNode.pkgbodyMethodHclIconmap.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(pkgBodyMethodNodeXLightIconPath, pkgBodyMethodNodeXDarkIconPath));
            }
        }
        if (setup_1.Setup.CurrentColorThemeKind > vscode_1.ColorThemeKind.HighContrast) {
            return this.ddexObjectType == dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ?
                PackageMethodNode.pkgspecMethodHclIconmap.get(status) :
                PackageMethodNode.pkgbodyMethodHclIconmap.get(status);
        }
        return this.ddexObjectType == dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ?
            PackageMethodNode.pkgspecMethodIconmap.get(status) :
            PackageMethodNode.pkgbodyMethodIconmap.get(status);
    }
    get getObjectStatus() {
        if (this.packageMethodObj.status === "VALID") {
            if (this.packageMethodObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.ValidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Valid;
            }
        }
        else if (this.packageMethodObj.status === "INVALID") {
            if (this.packageMethodObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Invalid;
            }
        }
        return databaseObjects_1.CodeObjectStatus.None;
    }
    get getIconPath() {
        if (!this.packageMethodObj) {
            logger_1.FileStreamLogger.Instance.info("PackageMethodNode.getIconPath: Missing PackageMethod Object");
            return undefined;
        }
        return this.getStatusToIcon(this.getObjectStatus);
    }
}
exports.PackageMethodNode = PackageMethodNode;
