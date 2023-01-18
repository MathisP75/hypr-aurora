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
exports.DatabaseTriggerNode = exports.SchemaTriggerNode = exports.ViewTriggerNode = exports.TableTriggerNode = exports.TriggerNodeBase = void 0;
const path = require("path");
const vscode_1 = require("vscode");
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const databaseObjects_1 = require("../databaseObjects");
const treeNodeBase_1 = require("../treeNodeBase");
const constants_1 = require("../../constants/constants");
const logger_1 = require("../../infrastructure/logger");
const setup_1 = require("../../utilities/setup");
class TriggerNodeBase extends databaseObjectBasic_1.DatabaseObjectBasic {
    get getObjectStatus() {
        if (this.triggerObj.status === "ENABLED" || this.triggerObj.status === "VALID") {
            if (this.triggerObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.ValidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Valid;
            }
        }
        else if (this.triggerObj.status === "DISABLED" || this.triggerObj.status === "INVALID") {
            if (this.triggerObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Invalid;
            }
        }
        return databaseObjects_1.CodeObjectStatus.None;
    }
}
exports.TriggerNodeBase = TriggerNodeBase;
class TableTriggerNode extends TriggerNodeBase {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.triggerStr, new treeNodeBase_1.Icon(), iExplorerNode_1.ExplorerNodeType.Leaf, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    setExtendedProperties(dbo) {
        this.triggerObj = dbo;
        super.setExtendedProperties(dbo);
    }
    getStatusToIcon(status) {
        if (!TableTriggerNode.map && !TableTriggerNode.lhcMap) {
            let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
            let tabTrigNodeDarkIconPath = path.join(imagesPath, "dark", "trigger.svg");
            let tabTrigNodeLightIconPath = path.join(imagesPath, "light", "trigger.svg");
            let tabTrigNodeXDarkIconPath = path.join(imagesPath, "dark", "trigger_x.svg");
            let tabTrigNodeXLightIconPath = path.join(imagesPath, "light", "trigger_x.svg");
            let tabTrigNodeDbgDarkIconPath = path.join(imagesPath, "dark", "trigger_dbg.svg");
            let tabTrigNodeDbgLightIconPath = path.join(imagesPath, "light", "trigger_dbg.svg");
            if (!TableTriggerNode.map) {
                TableTriggerNode.map = new Map();
                TableTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                TableTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(tabTrigNodeDarkIconPath, tabTrigNodeLightIconPath));
                TableTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(tabTrigNodeXDarkIconPath, tabTrigNodeXLightIconPath));
                TableTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(tabTrigNodeDbgDarkIconPath, tabTrigNodeDbgLightIconPath));
                TableTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(tabTrigNodeXDarkIconPath, tabTrigNodeXLightIconPath));
            }
            if (!TableTriggerNode.lhcMap) {
                TableTriggerNode.lhcMap = new Map();
                TableTriggerNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                TableTriggerNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(tabTrigNodeLightIconPath, tabTrigNodeDarkIconPath));
                TableTriggerNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(tabTrigNodeXLightIconPath, tabTrigNodeXDarkIconPath));
                TableTriggerNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(tabTrigNodeDbgLightIconPath, tabTrigNodeDbgDarkIconPath));
                TableTriggerNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(tabTrigNodeXLightIconPath, tabTrigNodeXDarkIconPath));
            }
        }
        if (setup_1.Setup.CurrentColorThemeKind > vscode_1.ColorThemeKind.HighContrast) {
            return TableTriggerNode.lhcMap.get(status);
        }
        return TableTriggerNode.map.get(status);
    }
    get getIconPath() {
        if (!this.triggerObj) {
            logger_1.FileStreamLogger.Instance.info("TableTriggerNode.getIconPath: Missing TableTrigger Object");
            return undefined;
        }
        return this.getStatusToIcon(this.getObjectStatus);
    }
}
exports.TableTriggerNode = TableTriggerNode;
class ViewTriggerNode extends TriggerNodeBase {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.triggerStr, new treeNodeBase_1.Icon(), iExplorerNode_1.ExplorerNodeType.Leaf, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    setExtendedProperties(dbo) {
        this.triggerObj = dbo;
        super.setExtendedProperties(dbo);
    }
    getStatusToIcon(status) {
        if (!ViewTriggerNode.map) {
            ViewTriggerNode.map = new Map();
            let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
            ViewTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.None, undefined);
            ViewTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(path.join(imagesPath, "dark", "trigger.svg"), path.join(imagesPath, "light", "trigger.svg")));
            ViewTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(path.join(imagesPath, "dark", "trigger_x.svg"), path.join(imagesPath, "light", "trigger_x.svg")));
            ViewTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(path.join(imagesPath, "dark", "trigger_dbg.svg"), path.join(imagesPath, "light", "trigger_dbg.svg")));
            ViewTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(path.join(imagesPath, "dark", "trigger_x.svg"), path.join(imagesPath, "light", "trigger_x.svg")));
        }
        return ViewTriggerNode.map.get(status);
    }
    get getIconPath() {
        if (!this.triggerObj) {
            logger_1.FileStreamLogger.Instance.info("ViewTriggerNode.getIconPath: Missing ViewTrigger Object");
            return undefined;
        }
        return this.getStatusToIcon(this.getObjectStatus);
    }
}
exports.ViewTriggerNode = ViewTriggerNode;
class SchemaTriggerNode extends TriggerNodeBase {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.triggerStr, new treeNodeBase_1.Icon(), iExplorerNode_1.ExplorerNodeType.Leaf, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    setExtendedProperties(dbo) {
        this.triggerObj = dbo;
        super.setExtendedProperties(dbo);
    }
    getStatusToIcon(status) {
        if (!SchemaTriggerNode.map) {
            SchemaTriggerNode.map = new Map();
            let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
            SchemaTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.None, undefined);
            SchemaTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(path.join(imagesPath, "dark", "trigger.svg"), path.join(imagesPath, "light", "trigger.svg")));
            SchemaTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(path.join(imagesPath, "dark", "trigger_x.svg"), path.join(imagesPath, "light", "trigger_x.svg")));
            SchemaTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(path.join(imagesPath, "dark", "trigger_dbg.svg"), path.join(imagesPath, "light", "trigger_dbg.svg")));
            SchemaTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(path.join(imagesPath, "dark", "trigger_x.svg"), path.join(imagesPath, "light", "trigger_x.svg")));
        }
        return SchemaTriggerNode.map.get(status);
    }
    get getIconPath() {
        if (!this.triggerObj) {
            logger_1.FileStreamLogger.Instance.info("SchemaTriggerNode.getIconPath: Missing SchemaTrigger Object");
            return undefined;
        }
        return this.getStatusToIcon(this.getObjectStatus);
    }
}
exports.SchemaTriggerNode = SchemaTriggerNode;
class DatabaseTriggerNode extends TriggerNodeBase {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.triggerStr, new treeNodeBase_1.Icon(), iExplorerNode_1.ExplorerNodeType.Leaf, schemaName, objectName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    setExtendedProperties(dbo) {
        this.triggerObj = dbo;
        super.setExtendedProperties(dbo);
    }
    getStatusToIcon(status) {
        if (!DatabaseTriggerNode.map) {
            DatabaseTriggerNode.map = new Map();
            let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
            DatabaseTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.None, undefined);
            DatabaseTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(path.join(imagesPath, "dark", "trigger.svg"), path.join(imagesPath, "light", "trigger.svg")));
            DatabaseTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(path.join(imagesPath, "dark", "trigger_x.svg"), path.join(imagesPath, "light", "trigger_x.svg")));
            DatabaseTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(path.join(imagesPath, "dark", "trigger_dbg.svg"), path.join(imagesPath, "light", "trigger_dbg.svg")));
            DatabaseTriggerNode.map.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(path.join(imagesPath, "dark", "trigger_x.svg"), path.join(imagesPath, "light", "trigger_x.svg")));
        }
        return DatabaseTriggerNode.map.get(status);
    }
    get getIconPath() {
        if (!this.triggerObj) {
            logger_1.FileStreamLogger.Instance.info("DatabaseTriggerNode.getIconPath: Missing DatabaseTrigger Object");
            return undefined;
        }
        return this.getStatusToIcon(this.getObjectStatus);
    }
}
exports.DatabaseTriggerNode = DatabaseTriggerNode;
