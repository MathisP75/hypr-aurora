"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestsManager = void 0;
const vscode = require("vscode");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const constants_1 = require("../constants/constants");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const question_1 = require("../prompts/question");
const helper = require("./../utilities/helper");
const fs = require("fs");
const util_1 = require("util");
class TestsManager {
    constructor() {
        vscode.commands.registerCommand("extension.testwebview", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Get WebView Items invoked");
                var uiData = yield this.printObjects(data, constants_1.Constants.getTestObjects);
                return new Promise((resolve) => {
                    resolve(uiData);
                });
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand("extension.setwebview", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Set WebView Items invoked");
                this.setAndSubmitWebView(data, constants_1.Constants.setTestObjects);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand("extension.testwebviewhtml", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Test Webview Html invoked");
                var uiData = yield this.printObjects(data, constants_1.Constants.getTestHtml);
                return new Promise((resolve) => {
                    resolve(uiData);
                });
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand("extension.setdatagrid", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Set Data Grid invoked");
                this.setAndSubmitWebView(data, constants_1.Constants.setDataGrid);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
    }
    init(prompter, vsCodeConnector, logger, storagePath) {
        this.prompter = prompter;
        this.vsCodeConnector = vsCodeConnector;
        this.fileLogger = logger;
        this.shouldEnableTestMode(storagePath);
    }
    shouldEnableTestMode(storagePath) {
        if (fs.existsSync(storagePath + '\\' + 'testconfig.json')) {
            vscode.commands.executeCommand("setContext", "testEnvironment", true);
        }
    }
    printObjects(data, cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            var args = data;
            var uiData = '';
            const clients = resultsDataServer_1.ResultDataServer.instanceSingle.getCurrentClientsInfo();
            let currentPanel = null;
            let currentView = null;
            if (clients && clients.length > 0) {
                clients.forEach((entry) => {
                    if ((0, util_1.isNullOrUndefined)(currentPanel) &&
                        (!(0, util_1.isNullOrUndefined)(entry)) && (!(0, util_1.isNullOrUndefined)(entry.panel)) &&
                        entry.panel.active && entry.panel.visible) {
                        currentPanel = entry.panel;
                        this.fileLogger.info("Returning webviewpanel with uniqueid: " + entry.uniqueId);
                    }
                });
            }
            if (!(0, util_1.isNullOrUndefined)(currentPanel)) {
                if (currentPanel.viewType === "DescribeResults") {
                    let startIndex = currentPanel.webview.html.indexOf("<div id=\"customResultContainer\"");
                    let endIndex = currentPanel.webview.html.indexOf("</body>", startIndex);
                    let describeHTML = currentPanel.webview.html.substring(startIndex, endIndex);
                    this.vsCodeConnector.showInformationMessage(describeHTML);
                    uiData = describeHTML;
                }
                else {
                    const questions = [];
                    questions.push({
                        type: question_1.QuestionTypes.input,
                        name: constants_1.Constants.testInput,
                        message: constants_1.Constants.testInput,
                        shouldPrompt: () => true,
                        onAnswered: (value) => {
                            args = value;
                        }
                    });
                    if (args == undefined) {
                        yield this.prompter.prompt(questions, true);
                    }
                    if (args != undefined) {
                        currentPanel.webview.postMessage({ command: cmd, args: args });
                        currentPanel.webview.onDidReceiveMessage(message => {
                            if (message.type == scriptExecutionModels_1.MessageName.testCommandResponse)
                                switch (message.data.command) {
                                    case constants_1.Constants.showTestData:
                                        if (!data) {
                                            this.vsCodeConnector.showInformationMessage(message.data.html);
                                        }
                                        uiData = message.data.html;
                                }
                        });
                    }
                }
            }
            else if (currentView !== null && currentView !== undefined) {
                const questions = [];
                questions.push({
                    type: question_1.QuestionTypes.input,
                    name: constants_1.Constants.testInput,
                    message: constants_1.Constants.testInput,
                    shouldPrompt: () => true,
                    onAnswered: (value) => {
                        args = value;
                    }
                });
                if (args == undefined) {
                    yield this.prompter.prompt(questions, true);
                }
                if (args != undefined) {
                    currentView.webview.postMessage({ command: cmd, args: args });
                    currentView.webview.onDidReceiveMessage(message => {
                        if (message.type == scriptExecutionModels_1.MessageName.testCommandResponse)
                            switch (message.data.command) {
                                case constants_1.Constants.showTestData:
                                    if (!data) {
                                        this.vsCodeConnector.showInformationMessage(message.data.html);
                                    }
                                    uiData = message.data.html;
                            }
                    });
                }
            }
            yield helper.sleep(2000);
            return uiData;
        });
    }
    setAndSubmitWebView(data, cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            var args = data;
            const questions = [];
            questions.push({
                type: question_1.QuestionTypes.input,
                name: constants_1.Constants.testInput,
                message: constants_1.Constants.testInput,
                shouldPrompt: () => true,
                onAnswered: (value) => {
                    args = value;
                }
            });
            if (!args) {
                yield this.prompter.prompt(questions, true);
            }
            if (args) {
                const clients = resultsDataServer_1.ResultDataServer.instanceSingle.getCurrentClientsInfo();
                let activeWindow = null;
                let activeView = null;
                if (clients && clients.length > 0) {
                    clients.forEach((entry) => {
                        if ((0, util_1.isNullOrUndefined)(activeWindow) &&
                            (!(0, util_1.isNullOrUndefined)(entry)) && (!(0, util_1.isNullOrUndefined)(entry.panel)) &&
                            entry.panel.active && entry.panel.visible) {
                            activeWindow = entry.panel;
                            this.fileLogger.info("Returning webviewpanel with uniqueid: " + entry.uniqueId);
                        }
                    });
                }
                if (activeWindow != null) {
                    activeWindow.webview.postMessage({ command: cmd, args: args });
                }
                else if (activeView != null) {
                    activeView.webview.postMessage({ command: cmd, args: args });
                }
            }
        });
    }
}
exports.TestsManager = TestsManager;
