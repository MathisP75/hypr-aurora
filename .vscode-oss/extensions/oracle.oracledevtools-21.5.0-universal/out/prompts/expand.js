"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const prompt_1 = require("./prompt");
class ExpandPrompt extends prompt_1.default {
    constructor(question, ignoreFocusOut) {
        super(question, ignoreFocusOut);
    }
    render() {
        let returnValue;
        if (this.varQuestion.choices[0].label) {
            returnValue = this.displayQuickPickItems(this.varQuestion.choices);
        }
        else {
            returnValue = this.displayNameValuePair(this.varQuestion.choices);
        }
        return returnValue;
    }
    displayNameValuePair(choices) {
        const convertedChoices = this.varQuestion.choices.reduce((result, choice) => {
            result[choice.name] = choice.value;
            return result;
        }, {});
        const options = this.quickPickDefaults;
        options.placeHolder = this.varQuestion.message;
        return vscode.window.showQuickPick(Object.keys(convertedChoices), options)
            .then((result) => {
            if (result === undefined) {
                throw new Error();
            }
            const thenableReturn = convertedChoices[result] || false;
            return this.validateAndPrompt(thenableReturn);
        });
    }
    displayQuickPickItems(avlblChoices) {
        const options = this.quickPickDefaults;
        options.placeHolder = this.varQuestion.message;
        return vscode.window.showQuickPick(avlblChoices, options)
            .then((result) => {
            if (result === undefined) {
                throw new Error();
            }
            return this.validateAndPrompt(result || false);
        });
    }
    validateAndPrompt(value) {
        if (!this.validate(value)) {
            return this.render();
        }
        return value;
    }
    validate(value) {
        const validationError = this.varQuestion.validate ? this.varQuestion.validate(value || "") : undefined;
        if (validationError) {
            this.varQuestion.message = `${prompt_1.symbols.warning} ${validationError}`;
            return false;
        }
        return true;
    }
}
exports.default = ExpandPrompt;
