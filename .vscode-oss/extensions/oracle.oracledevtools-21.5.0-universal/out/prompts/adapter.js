"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodeUtil = require("util");
const vscode_1 = require("vscode");
const logger_1 = require("../infrastructure/logger");
const factory_1 = require("./factory");
class CodeAdapter {
    constructor() {
        this.outBuffer = "";
        this.messageLevelFormatters = {};
    }
    log(message) {
        let line = "";
        if (message && typeof (message.level) === "string") {
            let formatter = this.formatMessage;
            if (this.messageLevelFormatters[message.level]) {
                formatter = this.messageLevelFormatters[message.level];
            }
            line = formatter(message);
        }
        else {
            line = nodeUtil.format(arguments);
        }
        this.outBuffer += `${line}\n`;
        logger_1.ChannelLogger.Instance.appendLine(line);
        logger_1.FileStreamLogger.Instance.info(line);
    }
    clearLog() {
        return;
    }
    showLog() {
        return;
    }
    promptSingle(question, ignoreFocusOut) {
        const questions = [question];
        const managementOperationPromise = new Promise((resolve, reject) => {
            let result;
            this.prompt(questions, ignoreFocusOut).then((answers) => {
                if (answers) {
                    result = answers[question.name];
                }
                resolve(result);
            }).catch((err) => {
                reject(err);
            });
        });
        return managementOperationPromise;
    }
    prompt(questions, ignoreFocusOut) {
        logger_1.FileStreamLogger.Instance.info("Creating prompts to accept user input");
        const answers = {};
        const promptResult = questions.reduce((promise, question) => {
            this.fixQuestion(question);
            return promise.then(() => {
                return factory_1.default.createPrompt(question, ignoreFocusOut);
            }).then((prompt) => {
                if (!question.shouldPrompt || question.shouldPrompt(answers) === true) {
                    return prompt.render().then((result) => {
                        answers[question.name] = result;
                        if (question.onAnswered) {
                            question.onAnswered(result);
                        }
                        return answers;
                    });
                }
                return answers;
            });
        }, Promise.resolve());
        return promptResult.catch((err) => {
            if (err instanceof Error || err instanceof TypeError) {
                return undefined;
            }
            logger_1.FileStreamLogger.Instance.error("User work flow errored out.");
            vscode_1.window.showErrorMessage(err.message);
        });
    }
    promptCallback(questions, callback) {
        this.prompt(questions).then((answers) => {
            if (callback) {
                callback(answers);
            }
        });
    }
    formatMessage(message) {
        const prefix = `${message.level}: (${message.id}) `;
        return `${prefix}${message.message}`;
    }
    fixQuestion(question) {
        if (question.type === "checkbox" && Array.isArray(question.choices)) {
            question.choices = question.choices.map((item) => {
                if (typeof (item) === "string") {
                    return { checked: false, name: item, value: item };
                }
                else {
                    return item;
                }
            });
        }
    }
}
exports.default = CodeAdapter;
