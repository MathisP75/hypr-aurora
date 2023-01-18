'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_1 = require("vscode");
const extension_1 = require("./extension");
const color_util_1 = require("./lib/util/color-util");
const variables_manager_1 = require("./lib/variables/variables-manager");
const editor_manager_1 = require("./lib/editor-manager");
const mut_edited_line_1 = require("./lib/util/mut-edited-line");
const array_1 = require("./lib/util/array");
const tasks_runner_1 = require("./lib/tasks-runner");
// eslint-disable-next-line
// @ts-ignore
const taskRuner = new tasks_runner_1.default();
const clearDecoration = (decoration) => decoration.dispose();
function filterPositions(position, deco, diffLine) {
    if (position.updated === null) {
        deco.get(position.old).forEach(clearDecoration);
        return false;
    }
    if (position.updated === 0 && extension_1.extension.editor.document.lineCount === 1 && extension_1.extension.editor.document.lineAt(0).text === '') {
        deco.get(position.old).forEach(clearDecoration);
        return false;
    }
    if (Math.abs(position.old - position.updated) > Math.abs(diffLine)) {
        position.updated = position.old + diffLine;
    }
    return true;
}
function disposeDecorationsForEditedLines(editedLine, context) {
    editedLine.map(({ range }) => {
        const line = range.start.line;
        if (context.deco.has(line)) {
            context.deco.get(line).forEach(clearDecoration);
        }
    });
}
function updatePositionsDeletion(range, positions) {
    const rangeLength = range.end.line - range.start.line;
    positions.forEach(position => {
        if (position.updated === null) {
            return;
        }
        if (position.old > range.start.line && position.old <= range.end.line) {
            position.updated = null;
            return;
        }
        if (position.old >= range.end.line) {
            position.updated = position.updated - rangeLength;
        }
        if (position.updated < 0) {
            position.updated = 0;
        }
    });
    return positions;
}
function getRemovedLines(editedLine, positions) {
    editedLine.reverse();
    editedLine.forEach((line) => {
        for (let i = line.range.start.line; i <= line.range.end.line; i++) {
            // ?
            // for (let i = line.range.start.line; i <= context.editor.document.lineCount; i++) {
            variables_manager_1.default.deleteVariableInLine(extension_1.extension.editor.document.fileName, i);
        }
        positions = updatePositionsDeletion(line.range, positions);
    });
    return editedLine;
}
function getAddedLines(editedLine, positions) {
    editedLine = mut_edited_line_1.mutEditedLine(editedLine);
    editedLine.forEach((line) => {
        positions.forEach(position => {
            if (position.updated >= line.range.start.line) {
                position.updated = position.updated + 1;
            }
        });
    });
    return editedLine;
}
function getEditedLines(editedLine, context, diffLine) {
    let positions = Array
        .from(context.deco.keys())
        .map(position => ({
        old: position,
        updated: position
    }));
    if (diffLine < 0) {
        editedLine = getRemovedLines(editedLine, positions);
    }
    else {
        editedLine = getAddedLines(editedLine, positions);
    }
    positions = positions.filter(position => filterPositions(position, context.deco, diffLine));
    context.deco = positions.reduce((decorations, position) => {
        if (decorations.has(position.updated)) {
            const decos = decorations.get(position.updated).concat(context.deco.get(position.old));
            decos.forEach(deco => deco.generateRange(position.updated));
            return decorations.set(position.updated, decos);
        }
        const decos = context.deco.get(position.old);
        decos.forEach(deco => deco.generateRange(position.updated));
        return decorations.set(position.updated, context.deco.get(position.old));
    }, new Map());
    return editedLine;
}
function getDecorationsToColorize(colors, variables) {
    const decorations = extension_1.generateDecorations(colors, variables, new Map());
    function filterDuplicated(A, B) {
        return A.filter((decoration) => {
            const exist = B.findIndex((_) => {
                const position = decoration.currentRange.isEqual(_.currentRange);
                if (decoration.rgb === null && _.rgb !== null) {
                    return false;
                }
                const colors = array_1.equals(decoration.rgb, _.rgb);
                return position && colors;
            });
            return exist === -1;
        });
    }
    extension_1.extension.editor.visibleRanges.forEach(range => {
        let i = range.start.line;
        for (i; i <= range.end.line + 1; i++) {
            if (extension_1.extension.deco.has(i) === true && decorations.has(i) === true) {
                // compare and remove duplicate and remove deleted ones
                decorations.set(i, filterDuplicated(decorations.get(i), extension_1.extension.deco.get(i)));
            }
            if (extension_1.extension.deco.has(i) && !decorations.has(i)) {
                // dispose decorations
                extension_1.extension.deco.get(i).forEach(clearDecoration);
            }
        }
    });
    cleanDecorationMap(decorations);
    return decorations;
}
function getCurrentRangeText() {
    const text = extension_1.extension.editor.document.getText();
    const fileLines = color_util_1.default.textToFileLines(text);
    const lines = [];
    extension_1.extension.editor.visibleRanges.forEach((range) => {
        let i = range.start.line;
        for (i; i <= range.end.line + 1; i++) {
            if (fileLines[i] && fileLines[i].line !== null) {
                lines.push(fileLines[i]);
            }
        }
    });
    return lines;
}
// Need to regenerate  variables decorations when base as changed
function* handleVisibleRangeEvent() {
    // trigger on ctrl + z ????
    // yield new Promise(resolve => setTimeout(resolve, 50));
    const text = extension_1.extension.editor.document.getText();
    const fileLines = color_util_1.default.textToFileLines(text);
    const lines = getCurrentRangeText();
    yield variables_manager_1.default.findVariablesDeclarations(extension_1.extension.editor.document.fileName, fileLines);
    const variables = yield variables_manager_1.default.findVariables(extension_1.extension.editor.document.fileName, lines);
    const colors = yield color_util_1.default.findColors(lines);
    const decorations = getDecorationsToColorize(colors, variables);
    editor_manager_1.default.decorate(extension_1.extension.editor, decorations, extension_1.extension.currentSelection);
    extension_1.updateContextDecorations(decorations, extension_1.extension);
    extension_1.removeDuplicateDecorations(extension_1.extension);
}
function* updateDecorations() {
    yield new Promise(resolve => setTimeout(resolve, 50));
    const fileName = extension_1.extension.editor.document.fileName;
    const fileLines = color_util_1.default.textToFileLines(extension_1.extension.editor.document.getText());
    const lines = getCurrentRangeText();
    variables_manager_1.default.removeVariablesDeclarations(extension_1.extension.editor.document.fileName);
    cleanDecorationMap(extension_1.extension.deco);
    yield variables_manager_1.default.findVariablesDeclarations(fileName, fileLines);
    const variables = yield variables_manager_1.default.findVariables(fileName, lines);
    const colors = yield color_util_1.default.findColors(lines);
    const decorations = getDecorationsToColorize(colors, variables);
    // removeDuplicateDecorations(decorations);
    editor_manager_1.default.decorate(extension_1.extension.editor, decorations, extension_1.extension.currentSelection);
    extension_1.updateContextDecorations(decorations, extension_1.extension);
    extension_1.removeDuplicateDecorations(extension_1.extension);
}
// Return new map?
function cleanDecorationMap(decorations) {
    const it = decorations.entries();
    let tmp = it.next();
    while (!tmp.done) {
        const line = tmp.value[0];
        const deco = tmp.value[1];
        decorations.set(line, deco.filter(decoration => !decoration.disposed));
        tmp = it.next();
    }
}
function textDocumentUpdated(event) {
    if (event.contentChanges.length === 0) {
        return;
    }
    if (extension_1.extension.editor && event.document.fileName === extension_1.extension.editor.document.fileName) {
        extension_1.extension.editor = vscode_1.window.activeTextEditor;
        let editedLine = event.contentChanges.map(_ => _);
        const diffLine = extension_1.extension.editor.document.lineCount - extension_1.extension.nbLine;
        if (diffLine !== 0) {
            editedLine = getEditedLines(editedLine, extension_1.extension, diffLine);
            extension_1.extension.nbLine = extension_1.extension.editor.document.lineCount;
        }
        disposeDecorationsForEditedLines(editedLine, extension_1.extension);
        taskRuner.run(updateDecorations);
    }
}
function setupEventListeners(context) {
    // window.onDidChangeTextEditorSelection((event) => q.push((cb) => handleTextSelectionChange(event, cb)), null, context.subscriptions);
    vscode_1.workspace.onDidChangeTextDocument(textDocumentUpdated, null, context.subscriptions);
    vscode_1.window.onDidChangeTextEditorVisibleRanges(() => taskRuner.run(handleVisibleRangeEvent), null, context.subscriptions);
    // window.onDidChangeTextEditorVisibleRanges(handleVisibleRangeEvent, null, context.subscriptions);
}
exports.default = { setupEventListeners };
//# sourceMappingURL=listeners.js.map