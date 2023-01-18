"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_util_1 = require("../util/color-util");
const extractor_mixin_1 = require("../extractor-mixin");
class VariablesExtractor extends extractor_mixin_1.Extractor {
    async extractVariables(fileName, fileLines) {
        const colors = await Promise.all(this.enabledStrategies
            .map(strategy => strategy
            .extractVariables(fileName, fileLines)));
        return color_util_1.flattenLineExtractionsFlatten(colors); // should regroup per lines?
    }
    deleteVariableInLine(fileName, line) {
        this.enabledStrategies.forEach(strategy => strategy.deleteVariable(fileName, line));
    }
    async extractDeclarations(fileName, fileLines) {
        return Promise.all(this.enabledStrategies.map(strategy => strategy.extractDeclarations(fileName, fileLines)));
    }
    getVariablesCount() {
        return this.enabledStrategies.reduce((cv, strategy) => cv + strategy.variablesCount(), 0);
    }
    findVariable(variable) {
        return this.get(variable.type).getVariableValue(variable);
    }
    removeVariablesDeclarations(fileName) {
        this.enabledStrategies.forEach(strategy => strategy.deleteVariable(fileName));
    }
}
const instance = new VariablesExtractor();
exports.default = instance;
// WARNINGS/Questions
//  allow space between var name and ':' ?
// css
//
// is --bar--foo valid?
// Less
//
// This is valid
// @fnord:  "I am fnord.";
// @var:    "fnord";
// content: @@var;
// give => content: "I am fnord.";
// ?? reserved css "at-rules" ??
// should be excluded or not ? (less/linter should generate an error)
// @charset
// @import
// @namespace
// @media
// @supports
// @document
// @page
// @font-face
// @keyframes
// @viewport
// @counter-style
// @font-feature-values
// @swash
// @ornaments
// @annotation
// @stylistic
// @styleset
// @character-variant)
// stylus
//
// valid
//
// var= #111;
// --a= #fff
// -a=#fff
// _a= #fff
// $a= #fff
//
// not valid
//
// 1a= #fff
// in sass order matter
//
// ```css
// $t: #fff
// $a: $t
// $t: #ccc
//
// p
//   color: $a
// ```
// here p.color === #fff
// in less order does not matter
//
// ```css
// @t: #fff
// @a: $t
// @t: #ccc
//
// p
//   color: @a
// ```
// here p.color === #ccc
// What about stylus, postcss ???
// should i always use the latest declaration in file?
// vcode-colorize only colorize (does not validate code ¯\_(ツ)_/¯)
//# sourceMappingURL=variables-extractor.js.map