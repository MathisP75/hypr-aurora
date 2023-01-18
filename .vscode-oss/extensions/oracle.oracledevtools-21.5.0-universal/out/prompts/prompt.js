"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.symbols = void 0;
const constants_1 = require("../constants/constants");
class Prompt {
    constructor(question, ignoreFocusOut) {
        this.varQuestion = question;
        this.varIgnoreFocusOut = ignoreFocusOut ? ignoreFocusOut : false;
    }
    get quickPickDefaults() {
        return {
            ignoreFocusOut: this.varIgnoreFocusOut,
        };
    }
    get inputBoxDefaults() {
        return {
            ignoreFocusOut: this.varIgnoreFocusOut,
        };
    }
}
exports.default = Prompt;
class symbols {
}
exports.symbols = symbols;
(() => {
    if (process.platform === constants_1.Constants.windowsProcessPlatform) {
        symbols.warning = '‼';
        symbols.tick = '√';
        symbols.radioOn = '(*)';
        symbols.radioOff = '( )';
    }
    else {
        symbols.warning = '⚠';
        symbols.tick = '✔';
        symbols.radioOn = '◉';
        symbols.radioOff = '◯';
    }
})();
