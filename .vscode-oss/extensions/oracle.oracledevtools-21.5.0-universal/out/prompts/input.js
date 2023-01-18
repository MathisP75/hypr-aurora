"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const prompt_1 = require("./prompt");
class InputPrompt extends prompt_1.default {
    constructor(question, ignoreFocusOut) {
        super(question, ignoreFocusOut);
        this.varOptions = this.inputBoxDefaults;
        this.varOptions.prompt = this.varQuestion.message;
    }
    render() {
        let placeHolder = this.varQuestion.default ? this.varQuestion.default : this.varQuestion.placeHolder;
        if (this.varQuestion.default instanceof Error) {
            placeHolder = this.varQuestion.default.message;
            this.varQuestion.default = undefined;
        }
        if (this.varQuestion.value != undefined) {
            this.varOptions.value = this.varQuestion.value;
        }
        this.varOptions.placeHolder = placeHolder;
        if (this.varOptions.password === true) {
            return vscode_1.window.showInputBox(this.varOptions)
                .then(([...result]) => {
                if (result === undefined) {
                    throw new Error();
                }
                const validateError = this.varQuestion.validate ? this.varQuestion.validate(result || "") : undefined;
                if (validateError) {
                    this.varQuestion.default = new Error(`${prompt_1.symbols.warning} ${validateError}`);
                    return this.render();
                }
                let value = [];
                if (result) {
                    for (let index = 0; index < result.length; index++) {
                        const element = result[index].codePointAt(0);
                        result[index] = '';
                        value.push(element);
                    }
                }
                return value;
            });
        }
        else {
            return vscode_1.window.showInputBox(this.varOptions)
                .then((result) => {
                if (result === undefined) {
                    throw new Error();
                }
                if (result === "") {
                    result = this.varQuestion.default || "";
                }
                const validateError = this.varQuestion.validate ? this.varQuestion.validate(result || "") : undefined;
                if (validateError) {
                    this.varQuestion.default = new Error(`${prompt_1.symbols.warning} ${validateError}`);
                    return this.render();
                }
                return result;
            });
        }
    }
}
exports.default = InputPrompt;
