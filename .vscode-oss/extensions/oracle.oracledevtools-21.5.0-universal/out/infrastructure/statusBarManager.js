"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBarManager = void 0;
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const helper_1 = require("../utilities/helper");
const helper = require("../utilities/helper");
const helper_2 = require("../utilities/helper");
const logger_1 = require("./logger");
const oracleVSCodeConnector_1 = require("./oracleVSCodeConnector");
const fileLogger = logger_1.FileStreamLogger.Instance;
class StatusInfo {
    constructor() {
        this.isDisposed = false;
        this.langNameDisplay = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 90);
        this.connectionStatusDisplay = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 88);
        this.scriptExecutionStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 87);
        this.languageServiceStatusDisplay = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 89);
        this.tnsAdminDisplay = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 80);
    }
    dispose() {
        if (!this.isDisposed) {
            fileLogger.info("Disposing Status Bar");
            this.scriptExecutionStatus.dispose();
            this.langNameDisplay.dispose();
            this.connectionStatusDisplay.dispose();
            this.languageServiceStatusDisplay.dispose();
            this.tnsAdminDisplay.dispose();
            clearInterval(this.progressTimerId);
            this.isDisposed = true;
        }
    }
    HideAllItems() {
        fileLogger.info("Hide All items of Status Bar");
        const self = this;
        self.connectionStatusDisplay.hide();
        self.langNameDisplay.hide();
        self.languageServiceStatusDisplay.hide();
        self.scriptExecutionStatus.hide();
        self.tnsAdminDisplay.hide();
    }
}
class StatusBarManager {
    constructor(vscodeIntegrator) {
        this.vscodeIntegrator = vscodeIntegrator;
        this.tnsAdminText = "";
        this.tnsAdminTooltip = "";
        if (!this.vscodeIntegrator) {
            this.vscodeIntegrator = new oracleVSCodeConnector_1.OracleVSCodeConnector();
        }
        const self = this;
        this.statusList = new Map();
    }
    displayCancellingExecution(uri) {
        const statusBar = this.getStatusBarForDoc(uri);
        if (statusBar) {
            statusBar.scriptExecutionStatus.text =
                localizedConstants_1.default.cancellingScriptExecution;
            statusBar.scriptExecutionStatus.tooltip =
                localizedConstants_1.default.cancellingScriptExecution;
            this.showAllItemsOfAStatusBar(uri);
        }
    }
    displayCancelledScriptExecution(uri) {
        const bar = this.getStatusBarForDoc(uri);
        if (bar) {
            bar.scriptExecutionStatus.text =
                localizedConstants_1.default.canceledScriptExecution;
            bar.scriptExecutionStatus.tooltip =
                localizedConstants_1.default.canceledScriptExecution;
            this.showAllItemsOfAStatusBar(uri);
        }
    }
    displayExecutionFinished(uri) {
        const bar = this.getStatusBarForDoc(uri);
        if (bar) {
            bar.scriptExecutionStatus.text =
                localizedConstants_1.default.executionFinishedMessage;
            bar.scriptExecutionStatus.tooltip =
                localizedConstants_1.default.executionFinishedMessage;
            this.showAllItemsOfAStatusBar(uri);
        }
    }
    displayExecutionStarted(uri) {
        const bar = this.getStatusBarForDoc(uri);
        if (bar) {
            bar.scriptExecutionStatus.text = localizedConstants_1.default.executingMessage;
            bar.scriptExecutionStatus.tooltip = localizedConstants_1.default.executingMessage;
            this.showAllItemsOfAStatusBar(uri);
        }
    }
    dispose() {
        fileLogger.info("Disposing All Status Bars");
        this.statusList.forEach((value, key) => {
            if (value) {
                value.dispose();
            }
        });
        this.statusList.clear();
    }
    displayConnectSuccess(uri, connAttributes, summaryInfo) {
        const bar = this.getStatusBarForDoc(uri);
        if (bar) {
            bar.connectionStatusDisplay.command = constants_1.Constants.cmdConnectCommandName;
            let connAttributesVsCode = connAttributes;
            let displayText = "";
            if (connAttributesVsCode) {
                displayText = connAttributesVsCode.name;
            }
            else if (summaryInfo) {
                displayText = helper.getBriefConnectionInformationForDisplay(summaryInfo.userID, summaryInfo.dataSource);
            }
            if (displayText &&
                displayText.length > (constants_1.Constants.maxLengthOfStatusBarString - constants_1.Constants.remainingStringDisplay.length)) {
                displayText =
                    displayText.substr(0, constants_1.Constants.maxLengthOfStatusBarString - constants_1.Constants.remainingStringDisplay.length);
                displayText += constants_1.Constants.remainingStringDisplay;
            }
            bar.connectionStatusDisplay.text = displayText;
            bar.connectionStatusDisplay.tooltip = (0, helper_1.getTooltipForConnection)(connAttributes);
            this.showStatusBar(uri, bar.connectionStatusDisplay);
        }
    }
    isUriValid(uri) {
        let parsedUri = vscode.Uri.parse(uri);
        return parsedUri.scheme == "file" || parsedUri.scheme == "untitled"
            || parsedUri.scheme == constants_1.Constants.oracleScheme;
    }
    displayConnectErrors(fileUri, connAttrs, response) {
        const bar = this.getStatusBarForDoc(fileUri);
        if (bar) {
            bar.connectionStatusDisplay.command = constants_1.Constants.cmdConnectCommandName;
            bar.connectionStatusDisplay.text = localizedConstants_1.default.errorInConnection;
            let { text, tooltip } = this.prepareTNSAdminTextandTooltip(connAttrs.tnsAdmin);
            bar.tnsAdminDisplay.text = text;
            bar.tnsAdminDisplay.tooltip = tooltip;
            let connName = connAttrs.dataSource;
            let connAttrsVsCode = connAttrs;
            if (connAttrsVsCode) {
                connName = connAttrsVsCode.name;
            }
            if (response.errorNumber &&
                response.errorMessage &&
                (0, helper_2.isNotEmpty)(response.errorMessage)) {
                bar.connectionStatusDisplay.tooltip =
                    localizedConstants_1.default.errorConnectingTo +
                        connName +
                        constants_1.Constants.newline +
                        localizedConstants_1.default.connectErrorMessage +
                        response.errorMessage;
            }
            else {
                bar.connectionStatusDisplay.tooltip =
                    localizedConstants_1.default.errorConnectingTo +
                        connName +
                        constants_1.Constants.newline +
                        localizedConstants_1.default.connectErrorMessage +
                        response.messages;
            }
            this.showStatusBar(fileUri, bar.connectionStatusDisplay);
        }
    }
    extensionChanged(fileUri, extensionName) {
        this.displayLanguageName(fileUri, extensionName);
    }
    connectingToDB(fileUri, connAttrs) {
        const bar = this.getStatusBarForDoc(fileUri);
        if (bar) {
            bar.connectionStatusDisplay.text = localizedConstants_1.default.connecting;
            bar.connectionStatusDisplay.command = constants_1.Constants.cmdDisconnectCommandName;
            let { text, tooltip } = this.prepareTNSAdminTextandTooltip(connAttrs.tnsAdmin);
            bar.tnsAdminDisplay.text = text;
            bar.tnsAdminDisplay.tooltip = tooltip;
            bar.connectionStatusDisplay.tooltip =
                localizedConstants_1.default.connectingTo + (0, helper_1.getTooltipForConnection)(connAttrs);
            this.showStatusBar(fileUri, bar.connectionStatusDisplay);
            this.displayProgress(fileUri, localizedConstants_1.default.connecting, bar.connectionStatusDisplay);
        }
    }
    displayNotConnected(uri) {
        const bar = this.getStatusBarForDoc(uri);
        if (bar) {
            bar.connectionStatusDisplay.text = localizedConstants_1.default.disConnected;
            bar.connectionStatusDisplay.tooltip =
                localizedConstants_1.default.disConnectedToolTip;
            bar.connectionStatusDisplay.command = constants_1.Constants.cmdConnectCommandName;
            this.showStatusBar(uri, bar.connectionStatusDisplay);
        }
    }
    displayConnectionProperties(uri, connAttributesVsCode, baseUri) {
        const bar = this.getStatusBarForDoc(uri);
        if (bar) {
            bar.connectionStatusDisplay.command = null;
            let displayText = baseUri + connAttributesVsCode.name;
            if (displayText.length > (constants_1.Constants.maxLengthOfStatusBarString - constants_1.Constants.remainingStringDisplay.length)) {
                displayText =
                    displayText.substr(0, constants_1.Constants.maxLengthOfStatusBarString - constants_1.Constants.remainingStringDisplay.length);
                displayText += constants_1.Constants.remainingStringDisplay;
            }
            bar.connectionStatusDisplay.text = displayText;
            bar.connectionStatusDisplay.tooltip = (0, helper_1.getTooltipForConnection)(connAttributesVsCode);
            this.showStatusBar(uri, bar.connectionStatusDisplay);
            let { text, tooltip } = this.prepareTNSAdminTextandTooltip(connAttributesVsCode.tnsAdmin);
            bar.tnsAdminDisplay.text = text;
            bar.tnsAdminDisplay.tooltip = tooltip;
            this.showStatusBar(uri, bar.connectionStatusDisplay);
        }
    }
    displayDefaults(uri) {
        const bar = this.getStatusBarForDoc(uri);
        if (bar) {
            this.setDefaultValues(uri, bar);
        }
    }
    setDefaultValues(uri, bar) {
        if (bar) {
            this.displayNotConnected(uri);
            this.displayLangServiceStatus(uri, "");
            this.displayLanguageName(uri, constants_1.Constants.extensionOwner);
            this.displayDefaultTnsAdmin(uri, bar);
        }
    }
    displayLangServiceStatus(uri, message) {
        const bar = this.getStatusBarForDoc(uri);
        if (bar) {
            bar.languageServiceStatusDisplay.text = message;
            this.showStatusBar(uri, bar.languageServiceStatusDisplay);
        }
    }
    displayDefaultTnsAdmin(uri, bar) {
        if (bar != null) {
            bar.tnsAdminDisplay.text = this.tnsAdminText;
            bar.tnsAdminDisplay.tooltip = this.tnsAdminTooltip;
        }
    }
    displayLanguageName(fileUri, extensionName) {
        const bar = this.getStatusBarForDoc(fileUri);
        if (bar) {
            bar.langNameDisplay.text = extensionName;
            bar.langNameDisplay.command =
                constants_1.Constants.cmdEnableDisableOracleLanguageServices;
            this.showStatusBar(fileUri, bar.langNameDisplay);
        }
    }
    displayTnsAdmin(tnsadmin) {
        if (typeof tnsadmin !== "undefined" && tnsadmin) {
            this.tnsAdminTooltip = localizedConstants_1.default.strTnsAdmin + ": " + tnsadmin;
            this.tnsAdminText = helper.truncateString(this.tnsAdminTooltip, 30);
        }
        else {
            this.tnsAdminTooltip = localizedConstants_1.default.strTnsAdmin + ":";
            this.tnsAdminText = this.tnsAdminTooltip;
        }
        const openfile = this.vscodeIntegrator.activeTextEditorUri;
        if (openfile) {
            const create = this.vscodeIntegrator.activeTextEditor.document.languageId === constants_1.Constants.oracleLanguageID;
            const bar = this.getStatusBarForDoc(openfile, create);
            if (bar) {
                this.displayDefaultTnsAdmin(openfile, bar);
            }
        }
    }
    prepareTNSAdminTextandTooltip(tnsadmin) {
        let text;
        let tooltip;
        if (typeof tnsadmin !== "undefined" && tnsadmin) {
            tooltip = localizedConstants_1.default.strTnsAdmin + ": " + tnsadmin;
            text = helper.truncateString(tooltip, 30);
        }
        else {
            tooltip = localizedConstants_1.default.strTnsAdmin + ":";
            text = tooltip;
        }
        return { text, tooltip };
    }
    deleteStatusBars(uri) {
        fileLogger.info("Delete all Status Bars for the given document");
        const bar = this.statusList.get(uri);
        if (bar) {
            bar.dispose();
            this.statusList.delete(uri);
        }
    }
    getStatusBarForDoc(uri, create = true) {
        if (!this.isUriValid(uri)) {
            return;
        }
        let createdNew = false;
        if (!this.statusList.has(uri) && create) {
            this.statusList.set(uri, new StatusInfo());
            createdNew = true;
        }
        const statusBar = this.statusList.get(uri);
        if (statusBar && statusBar.progressTimerId) {
            clearInterval(statusBar.progressTimerId);
        }
        if (statusBar && createdNew) {
            this.setDefaultValues(uri, statusBar);
        }
        return statusBar;
    }
    showAllItemsOfAStatusBar(fileUri) {
        const bar = this.getStatusBarForDoc(fileUri);
        fileLogger.info("Show all items of a Status Bar for " + fileUri);
        if (bar) {
            this.showStatusBar(fileUri, bar.connectionStatusDisplay);
            this.showStatusBar(fileUri, bar.langNameDisplay);
            this.showStatusBar(fileUri, bar.languageServiceStatusDisplay);
            this.showStatusBar(fileUri, bar.scriptExecutionStatus);
            this.displayDefaultTnsAdmin(fileUri, bar);
        }
    }
    onActiveTextEditorChanged(textEditor) {
        if (textEditor && textEditor.document && textEditor.document.uri
            && textEditor.document.uri.scheme == constants_1.Constants.outputScheme)
            return;
        if (this.lastShownStatusBar) {
            if (textEditor || !this.vscodeIntegrator.isActiveOracleFile) {
                this.lastShownStatusBar.HideAllItems();
            }
        }
        if (textEditor && textEditor.document && textEditor.document.uri &&
            constants_1.Constants.oracleLanguageID === textEditor.document.languageId) {
            let uri = helper.convertURIToString(textEditor.document.uri);
            if (uri) {
                let bar = this.getStatusBarForDoc(uri);
                if (bar) {
                    this.showStatusBar(uri, bar.connectionStatusDisplay);
                    this.showStatusBar(uri, bar.langNameDisplay);
                    this.showStatusBar(uri, bar.languageServiceStatusDisplay);
                    this.displayDefaultTnsAdmin(uri, bar);
                }
            }
        }
    }
    showStatusBar(uri, itemToShow) {
        const openfile = this.vscodeIntegrator.activeTextEditorUri;
        if (uri && openfile === uri) {
            itemToShow.show();
            if (this.statusList.has(uri)) {
                this.lastShownStatusBar = this.statusList.get(uri);
            }
        }
        else {
            itemToShow.hide();
        }
    }
    onTextEditorClosed(doc) {
        const uri = helper.convertURIToString(doc.uri);
        fileLogger.info("Document is closing removing status bars for the document");
        this.deleteStatusBars(uri);
    }
    displayProgress(fileUri, status, statusBarItem) {
        const self = this;
        let i = 0;
        const progressIndicator = ["/", "|", "\\", "-", "//"];
        const bar = this.getStatusBarForDoc(fileUri);
        bar.progressTimerId = setInterval(() => {
            i++;
            if (i > 4) {
                i = 0;
            }
            const progressTick = progressIndicator[i];
            statusBarItem.text = status + " " + progressTick;
            self.showStatusBar(fileUri, statusBarItem);
        }, 300);
    }
}
exports.StatusBarManager = StatusBarManager;
class StatusChangedEvent {
}
var EventSource;
(function (EventSource) {
    EventSource[EventSource["None"] = -1] = "None";
    EventSource[EventSource["Script"] = 1] = "Script";
    EventSource[EventSource["Connection"] = 2] = "Connection";
    EventSource[EventSource["QueryExecution"] = 3] = "QueryExecution";
})(EventSource || (EventSource = {}));
