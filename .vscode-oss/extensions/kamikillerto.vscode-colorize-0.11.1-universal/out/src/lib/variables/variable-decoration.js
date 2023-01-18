"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const variables_manager_1 = require("./variables-manager");
class VariableDecoration {
    constructor(variable, line, decorationFn) {
        /**
         * Keep track of the TextEditorDecorationType status
         *
         * @type {boolean}
         * @public
         * @memberOf ColorDecoration
         */
        this.disposed = false;
        this.hidden = false;
        this.variable = variable;
        this.decorationFn = decorationFn;
        if (this.variable.color) {
            this.generateRange(line);
        }
        else {
            this.currentRange = new vscode_1.Range(new vscode_1.Position(line, 0), new vscode_1.Position(line, 0));
        }
    }
    /**
     * The TextEditorDecorationType associated to the color
     *
     * @type {TextEditorDecorationType}
     * @memberOf ColorDecoration
     */
    get decoration() {
        this._generateDecorator();
        return this._decoration;
    }
    set decoration(deco) {
        this._decoration = deco;
    }
    get rgb() {
        return this.variable.color.rgb;
    }
    /**
     * Disposed the TextEditorDecorationType
     * (destroy the colored background)
     *
     * @public
     * @memberOf ColorDecoration
     */
    dispose() {
        try {
            this._decoration.dispose();
            this.variable.color.rgb = null;
        }
        catch (error) {
            // do something
        }
        this.disposed = true;
    }
    hide() {
        if (this._decoration) {
            this._decoration.dispose();
        }
        this.hidden = true;
    }
    /**
     * Generate the decoration Range (start and end position in line)
     *
     * @param {number} line
     * @returns {Range}
     *
     * @memberOf ColorDecoration
     */
    generateRange(line) {
        const range = new vscode_1.Range(new vscode_1.Position(line, this.variable.color.positionInText), new vscode_1.Position(line, this.variable.color.positionInText + this.variable.color.value.length));
        this.currentRange = range;
        return range;
    }
    shouldGenerateDecoration() {
        const color = variables_manager_1.default.findVariable(this.variable);
        if (this.disposed === true || color === null) {
            return false;
        }
        return (this._decoration === null || this._decoration === undefined || this.hidden);
    }
    _generateDecorator() {
        const color = variables_manager_1.default.findVariable(this.variable);
        if (color && this.variable.color !== color) {
            this.variable.color = color;
        }
        if (this.variable.color && this.variable.color.rgb) {
            this._decoration = this.decorationFn(this.variable.color);
        }
    }
}
exports.default = VariableDecoration;
//# sourceMappingURL=variable-decoration.js.map