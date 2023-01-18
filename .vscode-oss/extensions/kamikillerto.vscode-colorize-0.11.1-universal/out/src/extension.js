'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanDecorationList = exports.removeDuplicateDecorations = exports.generateDecorations = exports.updateContextDecorations = exports.q = exports.extension = exports.config = exports.colorize = exports.ColorizeContext = exports.canColorize = exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_1 = require("vscode");
const color_util_1 = require("./lib/util/color-util");
const queue_1 = require("./lib/queue");
const variables_manager_1 = require("./lib/variables/variables-manager");
const cache_manager_1 = require("./lib/cache-manager");
const editor_manager_1 = require("./lib/editor-manager");
const globToRegexp = require("glob-to-regexp");
const colorize_config_1 = require("./lib/colorize-config");
const listeners_1 = require("./listeners");
let config = {
    languages: [],
    isHideCurrentLineDecorations: true,
    colorizedVariables: [],
    colorizedColors: [],
    filesToExcludes: [],
    filesToIncludes: [],
    inferedFilesToInclude: [],
    searchVariables: false,
    decorationFn: null
};
exports.config = config;
class ColorizeContext {
    constructor() {
        this.editor = null;
        this.nbLine = 0;
        this.deco = new Map();
        this.currentSelection = null;
        this.statusBar = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right);
    }
    updateStatusBar(activated) {
        // List of icons can be found here https://code.visualstudio.com/api/references/icons-in-labels
        const icon = activated
            ? '$(check)'
            : '$(circle-slash)';
        const color = activated
            ? undefined
            : new vscode_1.ThemeColor('errorForeground');
        const hoverMessage = activated
            ? 'Colorize is activated for this file'
            : 'Colorize is not activated for this file';
        this.statusBar.text = `${icon} Colorize`;
        this.statusBar.color = color;
        this.statusBar.tooltip = hoverMessage;
        this.statusBar.show();
    }
}
exports.ColorizeContext = ColorizeContext;
const q = new queue_1.default();
exports.q = q;
async function initDecorations(context) {
    if (!context.editor) {
        return;
    }
    const text = context.editor.document.getText();
    const fileLines = color_util_1.default.textToFileLines(text);
    const lines = context.editor.visibleRanges.reduce((acc, range) => {
        return [
            ...acc,
            ...fileLines.slice(range.start.line, range.end.line + 2)
        ];
    }, []);
    // removeDuplicateDecorations(context);
    await variables_manager_1.default.findVariablesDeclarations(context.editor.document.fileName, fileLines);
    const variables = await variables_manager_1.default.findVariables(context.editor.document.fileName, lines);
    const colors = await color_util_1.default.findColors(lines);
    generateDecorations(colors, variables, context.deco);
    return editor_manager_1.default.decorate(context.editor, context.deco, context.currentSelection);
}
function updateContextDecorations(decorations, context) {
    const it = decorations.entries();
    let tmp = it.next();
    while (!tmp.done) {
        const line = tmp.value[0];
        if (context.deco.has(line)) {
            context.deco.set(line, context.deco.get(line).concat(decorations.get(line)));
        }
        else {
            context.deco.set(line, decorations.get(line));
        }
        tmp = it.next();
    }
}
exports.updateContextDecorations = updateContextDecorations;
function removeDuplicateDecorations(context) {
    const it = context.deco.entries();
    const m = new Map();
    let tmp = it.next();
    while (!tmp.done) {
        const line = tmp.value[0];
        const decorations = tmp.value[1];
        let newDecorations = [];
        // TODO; use reduce?
        decorations.forEach((deco) => {
            deco.generateRange(line);
            const exist = newDecorations.findIndex((_) => deco.currentRange.isEqual(_.currentRange));
            if (exist !== -1) {
                newDecorations[exist].dispose();
                newDecorations = newDecorations.filter((_, i) => i !== exist);
            }
            newDecorations.push(deco);
        });
        m.set(line, newDecorations);
        tmp = it.next();
    }
    context.deco = m;
}
exports.removeDuplicateDecorations = removeDuplicateDecorations;
function updateDecorationMap(map, line, decoration) {
    if (map.has(line)) {
        map.set(line, map.get(line).concat([decoration]));
    }
    else {
        map.set(line, [decoration]);
    }
}
function generateDecorations(colors, variables, decorations) {
    colors.map(({ line, colors }) => colors.forEach((color) => {
        const decoration = color_util_1.default.generateDecoration(color, line, config.decorationFn);
        updateDecorationMap(decorations, line, decoration);
    }));
    variables.map(({ line, colors }) => colors.forEach((variable) => {
        const decoration = variables_manager_1.default.generateDecoration(variable, line, config.decorationFn);
        updateDecorationMap(decorations, line, decoration);
    }));
    return decorations;
}
exports.generateDecorations = generateDecorations;
/**
 * Check if COLORIZE support a language
 *
 * @param {string} languageId A valid languageId
 * @returns {boolean}
 */
function isLanguageSupported(languageId) {
    return config.languages.indexOf(languageId) !== -1;
}
/**
 * Check if the file is the `colorize.include` setting
 *
 * @param {string} fileName A valid filename (path to the file)
 * @returns {boolean}
 */
function isIncludedFile(fileName) {
    return config.filesToIncludes.find((globPattern) => globToRegexp(globPattern).test(fileName)) !== undefined;
}
/**
 * Check if a file can be colorized by COLORIZE
 *
 * @param {TextDocument} document The document to test
 * @returns {boolean}
 */
function canColorize(document) {
    return isLanguageSupported(document.languageId) || isIncludedFile(document.fileName);
}
exports.canColorize = canColorize;
function handleTextSelectionChange(event, cb) {
    if (!config.isHideCurrentLineDecorations || event.textEditor !== extension.editor) {
        return cb();
    }
    if (extension.currentSelection.length !== 0) {
        extension.currentSelection.forEach(line => {
            const decorations = extension.deco.get(line);
            if (decorations !== undefined) {
                editor_manager_1.default.decorateOneLine(extension.editor, decorations, line);
            }
        });
    }
    extension.currentSelection = [];
    event.selections.forEach((selection) => {
        const decorations = extension.deco.get(selection.active.line);
        if (decorations) {
            decorations.forEach(_ => _.hide());
        }
    });
    extension.currentSelection = event.selections.map((selection) => selection.active.line);
    return cb();
}
function handleCloseOpen(document) {
    q.push((cb) => {
        if (extension.editor && extension.editor.document.fileName === document.fileName) {
            cache_manager_1.default.saveDecorations(document, extension.deco);
            return cb();
        }
        return cb();
    });
}
async function colorize(editor, cb) {
    extension.editor = null;
    extension.deco = new Map();
    if (!editor || !canColorize(editor.document)) {
        extension.updateStatusBar(false);
        return cb();
    }
    extension.updateStatusBar(true);
    extension.editor = editor;
    extension.currentSelection = editor.selections.map((selection) => selection.active.line);
    const deco = cache_manager_1.default.getCachedDecorations(editor.document);
    if (deco) {
        extension.deco = deco;
        extension.nbLine = editor.document.lineCount;
        editor_manager_1.default.decorate(extension.editor, extension.deco, extension.currentSelection);
    }
    else {
        extension.nbLine = editor.document.lineCount;
        try {
            await initDecorations(extension);
        }
        finally {
            cache_manager_1.default.saveDecorations(extension.editor.document, extension.deco);
        }
    }
    return cb();
}
exports.colorize = colorize;
function handleChangeActiveTextEditor(editor) {
    if (extension.editor !== undefined && extension.editor !== null) {
        extension.deco.forEach(decorations => decorations.forEach(deco => deco.hide()));
        cache_manager_1.default.saveDecorations(extension.editor.document, extension.deco);
    }
    getVisibleFileEditors().filter(e => e !== editor).forEach(e => {
        q.push(cb => colorize(e, cb));
    });
    q.push(cb => colorize(editor, cb));
}
function cleanDecorationList(context, cb) {
    const it = context.deco.entries();
    let tmp = it.next();
    while (!tmp.done) {
        const line = tmp.value[0];
        const decorations = tmp.value[1];
        context.deco.set(line, decorations.filter(decoration => !decoration.disposed));
        tmp = it.next();
    }
    return cb();
}
exports.cleanDecorationList = cleanDecorationList;
function clearCache() {
    extension.deco.clear();
    extension.deco = new Map();
    cache_manager_1.default.clearCache();
}
function handleConfigurationChanged() {
    const newConfig = colorize_config_1.getColorizeConfig();
    clearCache();
    // delete current decorations then regenerate decorations
    color_util_1.default.setupColorsExtractors(newConfig.colorizedColors);
    q.push(async (cb) => {
        // remove event listeners?
        variables_manager_1.default.setupVariablesExtractors(newConfig.colorizedVariables);
        if (newConfig.searchVariables) {
            await variables_manager_1.default.getWorkspaceVariables(newConfig.filesToIncludes.concat(newConfig.inferedFilesToInclude), newConfig.filesToExcludes); // 👍
        }
        return cb();
    });
    exports.config = config = newConfig;
    colorizeVisibleTextEditors();
}
function initEventListeners(context) {
    vscode_1.window.onDidChangeTextEditorSelection((event) => q.push((cb) => handleTextSelectionChange(event, cb)), null, context.subscriptions);
    vscode_1.workspace.onDidCloseTextDocument(handleCloseOpen, null, context.subscriptions);
    vscode_1.workspace.onDidSaveTextDocument(handleCloseOpen, null, context.subscriptions);
    vscode_1.window.onDidChangeActiveTextEditor(handleChangeActiveTextEditor, null, context.subscriptions);
    vscode_1.workspace.onDidChangeConfiguration(handleConfigurationChanged, null, context.subscriptions); // Does not update when local config file is edited manualy ><
    listeners_1.default.setupEventListeners(context);
}
function getVisibleFileEditors() {
    return vscode_1.window.visibleTextEditors.filter(editor => editor.document.uri.scheme === 'file');
}
function colorizeVisibleTextEditors() {
    extension.nbLine = 65;
    getVisibleFileEditors().forEach(editor => {
        q.push(cb => colorize(editor, cb));
    });
}
let extension;
exports.extension = extension;
function activate(context) {
    exports.extension = extension = new ColorizeContext();
    exports.config = config = colorize_config_1.getColorizeConfig();
    color_util_1.default.setupColorsExtractors(config.colorizedColors);
    variables_manager_1.default.setupVariablesExtractors(config.colorizedVariables);
    q.push(async (cb) => {
        try {
            if (config.searchVariables) {
                await variables_manager_1.default.getWorkspaceVariables(config.filesToIncludes.concat(config.inferedFilesToInclude), config.filesToExcludes); // 👍
            }
            initEventListeners(context);
        }
        catch (error) {
            // do something
        }
        return cb();
    });
    colorizeVisibleTextEditors();
    return extension;
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    extension.nbLine = null;
    extension.editor = null;
    extension.deco.clear();
    extension.deco = null;
    cache_manager_1.default.clearCache();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map