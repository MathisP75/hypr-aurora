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
exports.replaceWorkspaceFolder = exports.filterWorkspaceFolderAlias = exports.valueContainsWorkspaceFolder = exports.replaceWorkspaceFolderWithRootPath = exports.findImportPath = exports.resolveImportPath = exports.resolveAliasPath = exports.genImportRegExp = void 0;
const path = require("path");
const fse = require("fs-extra");
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
function genImportRegExp(key) {
    const file = "(.+\\.\\S{1,2}ss)";
    const fromOrRequire = "(?:from\\s+|=\\s+require(?:<any>)?\\()";
    const requireEndOptional = "\\)?";
    const pattern = `${key}\\s+${fromOrRequire}["']${file}["']${requireEndOptional}`;
    return new RegExp(pattern);
}
exports.genImportRegExp = genImportRegExp;
function resolveAliasPath(moduleName, aliasPrefix, aliasPath) {
    const replacedModuleName = moduleName.replace(aliasPrefix + "/", "");
    return path.resolve(aliasPath, replacedModuleName);
}
exports.resolveAliasPath = resolveAliasPath;
function resolveImportPath(moduleName, currentDirPath, pathAlias) {
    return __awaiter(this, void 0, void 0, function* () {
        const realPath = path.resolve(currentDirPath, moduleName);
        if (yield fse.pathExists(realPath)) {
            return realPath;
        }
        const aliasPrefix = Object.keys(pathAlias).find((prefix) => moduleName.startsWith(prefix));
        if (aliasPrefix) {
            const aliasPath = pathAlias[aliasPrefix];
            return resolveAliasPath(moduleName, aliasPrefix, aliasPath);
        }
        return "";
    });
}
exports.resolveImportPath = resolveImportPath;
function findImportPath(text, key, parentPath, pathAlias) {
    return __awaiter(this, void 0, void 0, function* () {
        const re = genImportRegExp(key);
        const results = re.exec(text);
        if (!!results && results.length > 0) {
            return resolveImportPath(results[1], parentPath, pathAlias);
        }
        else {
            return "";
        }
    });
}
exports.findImportPath = findImportPath;
function replaceWorkspaceFolderWithRootPath(pathAlias, rootPath) {
    const newAlias = {};
    for (const key in pathAlias) {
        newAlias[key] = pathAlias[key].replace(constants_1.WORKSPACE_FOLDER_VARIABLE, rootPath);
    }
    return newAlias;
}
exports.replaceWorkspaceFolderWithRootPath = replaceWorkspaceFolderWithRootPath;
function valueContainsWorkspaceFolder(value) {
    return value.indexOf(constants_1.WORKSPACE_FOLDER_VARIABLE) >= 0;
}
exports.valueContainsWorkspaceFolder = valueContainsWorkspaceFolder;
function filterWorkspaceFolderAlias(pathAlias) {
    const newAlias = {};
    for (const key in pathAlias) {
        if (!valueContainsWorkspaceFolder(pathAlias[key])) {
            newAlias[key] = pathAlias[key];
        }
    }
    return newAlias;
}
exports.filterWorkspaceFolderAlias = filterWorkspaceFolderAlias;
function replaceWorkspaceFolder(pathAlias, doc) {
    const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(doc.uri);
    if (workspaceFolder) {
        return replaceWorkspaceFolderWithRootPath(pathAlias, workspaceFolder.uri.path);
    }
    else {
        return filterWorkspaceFolderAlias(pathAlias);
    }
}
exports.replaceWorkspaceFolder = replaceWorkspaceFolder;
//# sourceMappingURL=path.js.map