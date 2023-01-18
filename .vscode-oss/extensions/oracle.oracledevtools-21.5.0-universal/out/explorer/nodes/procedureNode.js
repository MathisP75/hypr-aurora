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
exports.ProcedureNode = void 0;
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
class ProcedureNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.procedureStr, new treeNodeBase_1.Icon(), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            let results = [];
            if (this.procedureObj && this.procedureObj.params) {
                const prtPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
                for (let i = 0; i < this.procedureObj.params.length; ++i) {
                    results.push(utilities_1.ExplorerUtilities.GetChildObject(this.connectionURI, prtPath, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageStoredProcedureParameter, this.procedureObj.params[i]));
                }
            }
            this.children = results;
            return results;
        });
    }
    setExtendedProperties(dbo) {
        this.procedureObj = dbo;
        super.setExtendedProperties(dbo);
    }
    getStatusToIcon(codeObjStatus) {
        logger_1.FileStreamLogger.Instance.info("ProcedureNode.getStatusToIcon: Procedure Object Status: " + codeObjStatus);
        if (!ProcedureNode.map && !ProcedureNode.lhcMap) {
            let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
            let procNodeDarkIconPath = path.join(imagesPath, "dark", "procedure.svg");
            let procNodeLightIconPath = path.join(imagesPath, "light", "procedure.svg");
            let procNodeXDarkIconPath = path.join(imagesPath, "dark", "procedure_x.svg");
            let procNodeXLightIconPath = path.join(imagesPath, "light", "procedure_x.svg");
            let procNodeDbgDarkIconPath = path.join(imagesPath, "dark", "procedure_dbg.svg");
            let procNodeDbgLightIconPath = path.join(imagesPath, "light", "procedure_dbg.svg");
            if (!ProcedureNode.map) {
                ProcedureNode.map = new Map();
                ProcedureNode.map.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                ProcedureNode.map.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(procNodeDarkIconPath, procNodeLightIconPath));
                ProcedureNode.map.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(procNodeXDarkIconPath, procNodeXLightIconPath));
                ProcedureNode.map.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(procNodeDbgDarkIconPath, procNodeDbgLightIconPath));
                ProcedureNode.map.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(procNodeXDarkIconPath, procNodeXLightIconPath));
            }
            if (!ProcedureNode.lhcMap) {
                ProcedureNode.lhcMap = new Map();
                ProcedureNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                ProcedureNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(procNodeLightIconPath, procNodeDarkIconPath));
                ProcedureNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(procNodeXLightIconPath, procNodeXDarkIconPath));
                ProcedureNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(procNodeDbgLightIconPath, procNodeDbgDarkIconPath));
                ProcedureNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(procNodeXLightIconPath, procNodeXDarkIconPath));
            }
        }
        if (setup_1.Setup.CurrentColorThemeKind > vscode_1.ColorThemeKind.HighContrast) {
            return ProcedureNode.lhcMap.get(codeObjStatus);
        }
        return ProcedureNode.map.get(codeObjStatus);
    }
    get getObjectStatus() {
        if (this.procedureObj.status === "VALID") {
            if (this.procedureObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.ValidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Valid;
            }
        }
        else if (this.procedureObj.status === "INVALID") {
            if (this.procedureObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Invalid;
            }
        }
        return databaseObjects_1.CodeObjectStatus.None;
    }
    get getIconPath() {
        if (!this.procedureObj) {
            logger_1.FileStreamLogger.Instance.info("ProcedureNode.getIconPath: Missing Procedure Object");
            return undefined;
        }
        return this.getStatusToIcon(this.getObjectStatus);
    }
}
exports.ProcedureNode = ProcedureNode;
