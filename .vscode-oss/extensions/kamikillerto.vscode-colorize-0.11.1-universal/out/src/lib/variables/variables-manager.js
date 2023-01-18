"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const variable_decoration_1 = require("./variable-decoration");
const variables_extractor_1 = require("./variables-extractor");
require("./strategies/css-strategy");
require("./strategies/less-strategy");
require("./strategies/sass-strategy");
require("./strategies/stylus-strategy");
const fs = require("fs");
const vscode_1 = require("vscode");
class VariablesManager {
    constructor() {
        this.statusBar = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right);
    }
    async getWorkspaceVariables(includePattern = [], excludePattern = []) {
        this.statusBar.show();
        this.statusBar.text = 'Colorize: $(loading~spin) Searching for color variables...';
        try {
            const INCLUDE_PATTERN = `{${includePattern.join(',')}}`;
            const EXCLUDE_PATTERN = `{${excludePattern.join(',')}}`;
            const files = await vscode_1.workspace.findFiles(INCLUDE_PATTERN, EXCLUDE_PATTERN);
            await Promise.all(this.extractFilesVariable(files));
            const variablesCount = variables_extractor_1.default.getVariablesCount();
            this.statusBar.text = `Colorize: ${variablesCount} variables`;
        }
        catch (error) {
            this.statusBar.color = new vscode_1.ThemeColor('errorForeground');
            this.statusBar.text = 'Colorize: $(circle-slash) Variables extraction fail';
        }
        return;
    }
    textToDocumentLine(text) {
        return text.split(/\n/)
            .map((text, index) => Object({
            'text': text,
            'line': index
        }));
    }
    extractFilesVariable(files) {
        return files.map(async (file) => {
            const text = fs.readFileSync(file.fsPath, 'utf8');
            const content = this.textToDocumentLine(text);
            return variables_extractor_1.default.extractDeclarations(file.fsPath, content);
        });
    }
    findVariablesDeclarations(fileName, fileLines) {
        return variables_extractor_1.default.extractDeclarations(fileName, fileLines);
    }
    findVariables(fileName, fileLines) {
        return variables_extractor_1.default.extractVariables(fileName, fileLines);
    }
    findVariable(variable) {
        return variables_extractor_1.default.findVariable(variable);
    }
    generateDecoration(variable, line, decorationFn) {
        return new variable_decoration_1.default(variable, line, decorationFn);
    }
    setupVariablesExtractors(extractors) {
        variables_extractor_1.default.enableStrategies(extractors);
    }
    deleteVariableInLine(fileName, line) {
        variables_extractor_1.default.deleteVariableInLine(fileName, line);
    }
    removeVariablesDeclarations(fileName) {
        variables_extractor_1.default.removeVariablesDeclarations(fileName);
    }
}
const instance = new VariablesManager();
exports.default = instance;
//# sourceMappingURL=variables-manager.js.map