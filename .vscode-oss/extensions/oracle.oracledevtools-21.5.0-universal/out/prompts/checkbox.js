"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const prompt_1 = require("./prompt");
class CheckboxPrompt extends prompt_1.default {
    constructor(question, ignoreFocusOut) {
        super(question, ignoreFocusOut);
    }
    render() {
        const choices = this.varQuestion.choices.reduce((result, choice) => {
            const choiceName = choice.name || choice;
            result[`${choice.checked === true ? prompt_1.symbols.radioOn : prompt_1.symbols.radioOff} ${choiceName}`] = choice;
            return result;
        }, {});
        const options = this.quickPickDefaults;
        options.placeHolder = this.varQuestion.message;
        const quickPickOptions = Object.keys(choices);
        quickPickOptions.push(prompt_1.symbols.tick);
        return vscode_1.window.showQuickPick(quickPickOptions, options)
            .then((result) => {
            if (result === undefined) {
                throw new Error();
            }
            if (result !== prompt_1.symbols.tick) {
                choices[result].checked = !choices[result].checked;
                return this.render();
            }
            return this.varQuestion.choices.reduce((newResult, choice) => {
                if (choice.checked === true) {
                    newResult.push(choice.value);
                }
                return newResult;
            }, []);
        });
    }
}
exports.default = CheckboxPrompt;
