"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const input_1 = require("./input");
class PasswordPrompt extends input_1.default {
    constructor(question, ignoreFocusOut) {
        super(question, ignoreFocusOut);
        this.varOptions.password = true;
    }
}
exports.default = PasswordPrompt;
