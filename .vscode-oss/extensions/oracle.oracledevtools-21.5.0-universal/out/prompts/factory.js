"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkbox_1 = require("./checkbox");
const confirm_1 = require("./confirm");
const expand_1 = require("./expand");
const input_1 = require("./input");
const list_1 = require("./list");
const cred_1 = require("./cred");
class PromptFactory {
    static createPrompt(question, ignoreFocusOut) {
        switch (question.type || "input") {
            case "string":
            case "input":
                return new input_1.default(question, ignoreFocusOut);
            case "password":
                return new cred_1.default(question, ignoreFocusOut);
            case "list":
                return new list_1.default(question, ignoreFocusOut);
            case "confirm":
            case "confirmWithCancel":
                return new confirm_1.default(question, ignoreFocusOut);
            case "checkbox":
                return new checkbox_1.default(question, ignoreFocusOut);
            case "expand":
                return new expand_1.default(question, ignoreFocusOut);
            default:
                throw new Error(`Could not find a prompt for question type ${question.type}`);
        }
    }
}
exports.default = PromptFactory;
