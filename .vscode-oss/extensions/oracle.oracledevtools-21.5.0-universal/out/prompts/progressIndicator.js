"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class ProgressIndicator {
    constructor() {
        this.varTasks = [];
        this.varProgressText = ["|", "/", "-", "\\", "|", "/", "-", "\\"];
        this.varProgressCounter = 0;
        this.varStatusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
    }
    beginTask(task) {
        this.varTasks.push(task);
        this.displayProgressIndicator();
    }
    endTask(task) {
        if (this.varTasks.length > 0) {
            this.varTasks.pop();
        }
        this.setMessage();
    }
    setMessage() {
        if (this.varTasks.length === 0) {
            this.varStatusBarItem.text = "";
            this.hideProgressIndicator();
            return;
        }
        this.varStatusBarItem.text = this.varTasks[this.varTasks.length - 1];
        this.varStatusBarItem.show();
    }
    displayProgressIndicator() {
        this.setMessage();
        this.hideProgressIndicator();
        this.varInterval = setInterval(() => this.onDisplayProgressIndicator(), 100);
    }
    hideProgressIndicator() {
        if (this.varInterval) {
            clearInterval(this.varInterval);
            this.varInterval = undefined;
        }
        this.varProgressCounter = 0;
    }
    onDisplayProgressIndicator() {
        if (this.varTasks.length === 0) {
            return;
        }
        const txt = this.varProgressText[this.varProgressCounter];
        this.varStatusBarItem.text = this.varTasks[this.varTasks.length - 1] + " " + txt;
        this.varProgressCounter++;
        if (this.varProgressCounter >= this.varProgressText.length - 1) {
            this.varProgressCounter = 0;
        }
    }
}
exports.default = ProgressIndicator;
