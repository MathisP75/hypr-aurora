"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readOptions = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
function readOptions() {
    const configuration = vscode_1.workspace.getConfiguration(constants_1.EXT_NAME);
    const camelCase = configuration.get("camelCase", false);
    const pathAlias = configuration.get("pathAlias", {});
    return {
        camelCase,
        pathAlias,
    };
}
exports.readOptions = readOptions;
//# sourceMappingURL=options.js.map