"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const CompletionProvider_1 = require("./CompletionProvider");
const DefinitionProvider_1 = require("./DefinitionProvider");
const options_1 = require("./options");
function activate(context) {
    const mode = [
        { language: "typescriptreact", scheme: "file" },
        { language: "javascriptreact", scheme: "file" },
        { language: "javascript", scheme: "file" },
    ];
    const options = options_1.readOptions();
    context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider(mode, new CompletionProvider_1.CSSModuleCompletionProvider(options), "."));
    context.subscriptions.push(vscode_1.languages.registerDefinitionProvider(mode, new DefinitionProvider_1.CSSModuleDefinitionProvider(options)));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map