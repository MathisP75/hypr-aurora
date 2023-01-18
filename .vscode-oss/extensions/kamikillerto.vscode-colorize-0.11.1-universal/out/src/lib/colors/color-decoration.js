"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class ColorDecoration {
    constructor(color, line, decorationFn) {
        /**
         * Keep track of the TextEditorDecorationType status
         *
         * @type {boolean}
         * @public
         * @memberOf ColorDecoration
         */
        this.disposed = false;
        this.hidden = false;
        this.color = color;
        this.decorationFn = decorationFn;
        this.generateRange(line);
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
        return this.color.rgb;
    }
    /**
     * Dispose the TextEditorDecorationType
     * (destroy the colored background)
     *
     * @public
     * @memberOf ColorDecoration
     */
    dispose() {
        try {
            this._decoration.dispose();
            this.disposed = true;
        }
        catch (error) {
            // do something
        }
    }
    /**
     * Hide the TextEditorDecorationType.
     *
     * @public
     * @memberOf ColorDecoration
     */
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
        const range = new vscode_1.Range(new vscode_1.Position(line, this.color.positionInText), new vscode_1.Position(line, this.color.positionInText + this.color.value.length));
        this.currentRange = range;
        return range;
    }
    shouldGenerateDecoration() {
        if (this.disposed === true /* || this.hidden === true */) {
            return false;
        }
        return this._decoration === null || this._decoration === undefined || this.hidden;
    }
    _generateDecorator() {
        this._decoration = this.decorationFn(this.color);
    }
}
exports.default = ColorDecoration;
//# sourceMappingURL=color-decoration.js.map