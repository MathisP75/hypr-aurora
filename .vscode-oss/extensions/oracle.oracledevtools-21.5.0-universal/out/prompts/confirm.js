"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const LocalizedConstants = require("../constants/localizedConstants");
const helper_1 = require("../utilities/helper");
const prompt_1 = require("./prompt");
class ConfirmPrompt extends prompt_1.default {
    constructor(question, ignoreFocusOut) {
        super(question, ignoreFocusOut);
        this.confirmWithCancel = question.type == 'confirmWithCancel';
    }
    render() {
        const choices = {};
        if (this.confirmWithCancel) {
            choices[LocalizedConstants.default.messageYes] = helper_1.ProceedOption.Yes;
            choices[LocalizedConstants.default.messageNo] = helper_1.ProceedOption.No;
            choices[LocalizedConstants.default.messageCancel] = helper_1.ProceedOption.Cancel;
        }
        else {
            choices[LocalizedConstants.default.messageYes] = true;
            choices[LocalizedConstants.default.messageNo] = false;
        }
        const options = this.quickPickDefaults;
        options.placeHolder = this.varQuestion.message;
        return vscode_1.window.showQuickPick(Object.keys(choices), options)
            .then((result) => {
            if (result === undefined) {
                throw new Error();
            }
            if (this.confirmWithCancel)
                return choices[result];
            else
                return choices[result] || false;
        });
    }
}
exports.default = ConfirmPrompt;
