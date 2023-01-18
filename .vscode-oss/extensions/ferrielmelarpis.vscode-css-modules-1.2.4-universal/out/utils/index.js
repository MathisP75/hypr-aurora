"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashesCamelCase = exports.getAllClassNames = exports.getCurrentLine = void 0;
const fse = require("fs-extra");
const _ = require("lodash");
function getCurrentLine(document, position) {
    return document.getText(document.lineAt(position).range);
}
exports.getCurrentLine = getCurrentLine;
function getAllClassNames(filePath, keyword) {
    const content = fse.readFileSync(filePath, { encoding: "utf8" });
    const lines = content.match(/.*[,{]/g);
    if (lines === null) {
        return [];
    }
    const classNames = lines.join(" ").match(/\.[_A-Za-z0-9-]+/g);
    if (classNames === null) {
        return [];
    }
    const uniqNames = _.uniq(classNames).map((item) => item.slice(1));
    return keyword !== ""
        ? uniqNames.filter((item) => item.indexOf(keyword) !== -1)
        : uniqNames;
}
exports.getAllClassNames = getAllClassNames;
// from css-loader's implementation
// source: https://github.com/webpack-contrib/css-loader/blob/22f6621a175e858bb604f5ea19f9860982305f16/lib/compile-exports.js
function dashesCamelCase(str) {
    return str.replace(/-(\w)/g, function (match, firstLetter) {
        return firstLetter.toUpperCase();
    });
}
exports.dashesCamelCase = dashesCamelCase;
//# sourceMappingURL=index.js.map