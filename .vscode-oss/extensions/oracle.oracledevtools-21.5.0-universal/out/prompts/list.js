"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const prompt_1 = require("./prompt");
class ListPrompt extends prompt_1.default {
    constructor(question, ignoreFocusOut) {
        super(question, ignoreFocusOut);
    }
    render() {
        const choices = this.varQuestion.choices.reduce((result, choice) => {
            result[choice.name || choice] = choice.value || choice;
            return result;
        }, {});
        const options = this.quickPickDefaults;
        options.placeHolder = this.varQuestion.message;
        return vscode_1.window.showQuickPick(Object.keys(choices), options)
            .then((result) => {
            if (result === undefined) {
                throw new Error();
            }
            return choices[result];
        });
    }
}
exports.default = ListPrompt;
