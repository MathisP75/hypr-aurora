"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const localizedConstants_1 = require("../constants/localizedConstants");
class ToolBarManager {
    constructor(dataDontext, vscodeconnector, resultDataServer) {
        this.dataDontext = dataDontext;
        this.vscodeconnector = vscodeconnector;
        this.resultDataServer = resultDataServer;
        this.contextCancelVisibility = "oracleToolbar.cancelVisibility";
        this.contextCancelDisabledVisibility = "oracleToolbar.cancelDisabledVisibility";
        this.contextClearVisibility = "oracleToolbar.clearVisibility";
        this.contextClearDisabledVisibility = "oracleToolbar.clearDisabledVisibility";
        this.contextViewCancelVisibility = "oracleViewToolbar.cancelVisibility";
        this.contextViewCancelDisabledVisibility = "oracleViewToolbar.cancelDisabledVisibility";
        this.contextViewClearVisibility = "oracleViewToolbar.clearVisibility";
        this.contextViewClearDisabledVisibility = "oracleViewToolbar.clearDisabledVisibility";
        this.handleExecutionStatusChangeInResultUI = (message) => {
            if (message && message.toolbarOptions) {
                let windowActiveAndVisible = false;
                let viewActive = false;
                let resultClients = this.resultDataServer.getClientInfo(message.ownerUri, message.executionId);
                if (resultClients && resultClients.length > 0) {
                    let clientInfo;
                    for (let i = 0; i < resultClients.length; i++) {
                        clientInfo = resultClients[i];
                        if (clientInfo && clientInfo.panel) {
                            windowActiveAndVisible = clientInfo.panel.active && clientInfo.panel.visible;
                            break;
                        }
                    }
                }
                if (windowActiveAndVisible) {
                    logger_1.FileStreamLogger.Instance.info("handleExecutionStatusChangeInResultUI - Updating Toolbar visibility for UI");
                    this.dataContext = message;
                    this.setCancelVisibility(message.toolbarOptions.cancelVisible);
                    this.setClearVisibility(message.toolbarOptions.clearVisible);
                    this.setCancelEnabled(message.toolbarOptions.cancelEnabled);
                    this.setClearEnabled(message.toolbarOptions.clearEnabled);
                }
                else if (viewActive) {
                    logger_1.FileStreamLogger.Instance.info("handleExecutionStatusChangeInResultUI - Updating View Toolbar visibility for UI");
                    this.resultContext = message;
                    this.setViewCancelVisibility(message.toolbarOptions.cancelVisible);
                    this.setViewClearVisibility(message.toolbarOptions.clearVisible);
                    this.setViewCancelEnabled(message.toolbarOptions.cancelEnabled);
                    this.setViewClearEnabled(message.toolbarOptions.clearEnabled);
                }
                else {
                    logger_1.FileStreamLogger.Instance.info("handleExecutionStatusChangeInResultUI - Not updating Toolbar visibility for UI");
                }
            }
            else {
                logger_1.FileStreamLogger.Instance.info("handleExecutionStatusChangeInResultUI - Hiding all Toolbar buttons.");
                this.dataContext = undefined;
                this.setScriptExecutionToolBarVisibility(false);
            }
        };
        vscodeconnector.registerCommand(ToolBarManager.oracleToolbarCancelCommand, () => {
            this.handleToolbarCancelCommand(this.dataContext);
        }, this);
        vscodeconnector.registerCommand(ToolBarManager.oracleToolbarClearCommand, () => {
            this.handleToolbarClearCommand(this.dataContext);
        }, this);
        vscodeconnector.registerCommand(ToolBarManager.oracleToolbarDisabledCancelCommand, () => {
            this.vscodeconnector.showNotification(localizedConstants_1.default.nothingToCancel);
        }, this);
        vscodeconnector.registerCommand(ToolBarManager.oracleToolbarDisabledClearCommand, () => {
            this.vscodeconnector.showNotification(localizedConstants_1.default.nothingToClear);
        }, this);
        vscodeconnector.registerCommand(ToolBarManager.oracleToolbarFormatCommand, () => {
            let selection = this.vscodeconnector.getActiveDocumentSelection();
            if (selection.startLine === selection.endLine && selection.startColumn === selection.endColumn)
                vscodeconnector.executeCommand("editor.action.formatDocument");
            else
                vscodeconnector.executeCommand("editor.action.formatSelection");
        }, this);
        vscodeconnector.registerCommand(ToolBarManager.oracleViewToolbarCancelCommand, () => {
            this.handleToolbarCancelCommand(this.resultContext);
        }, this);
        vscodeconnector.registerCommand(ToolBarManager.oracleViewToolbarClearCommand, () => {
            this.handleToolbarClearCommand(this.resultContext);
        }, this);
        vscodeconnector.registerCommand(ToolBarManager.oracleViewToolbarDisabledCancelCommand, () => {
            this.vscodeconnector.showNotification(localizedConstants_1.default.nothingToCancel);
        }, this);
        vscodeconnector.registerCommand(ToolBarManager.oracleViewToolbarDisabledClearCommand, () => {
            this.vscodeconnector.showNotification(localizedConstants_1.default.nothingToClear);
        }, this);
    }
    setScriptExecutionToolBarVisibility(display) {
        ToolBarManager.instance.setCancelVisibility(display);
        ToolBarManager.instance.setClearVisibility(display);
    }
    handleToolbarClearCommand(args) {
        try {
            logger_1.FileStreamLogger.Instance.info("Clear from toolbar is called.");
            this.raiseEvent(args, scriptExecutionModels_1.MessageName.toolbarClearClicked);
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("handleToolbarClearCommand cold not notifiy handlers");
            logger_1.FileStreamLogger.Instance.error(error);
        }
    }
    raiseEvent(args, commandName) {
        logger_1.FileStreamLogger.Instance.info("raiseEvent: windowUri: " + args.windowUri);
        logger_1.FileStreamLogger.Instance.info("raiseEvent: ownerUri: " + args.ownerUri);
        logger_1.FileStreamLogger.Instance.info("raiseEvent: executionId: " + args.executionId);
        const clearParams = new scriptExecutionModels_1.ToolbarEvent();
        clearParams.ownerUri = args.ownerUri;
        clearParams.executionId = args.executionId;
        clearParams.windowUri = args.windowUri;
        clearParams.commandName = commandName;
        this.resultDataServer.postToClients(args.ownerUri, args.executionId, scriptExecutionModels_1.MessageName.toolbarEvent, clearParams);
    }
    handleToolbarCancelCommand(args) {
        try {
            logger_1.FileStreamLogger.Instance.info("Cancel from toolbar is called.");
            this.raiseEvent(args, scriptExecutionModels_1.MessageName.toolbarCancelClicked);
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("Could not handleToolbarCancelCommand");
            logger_1.FileStreamLogger.Instance.error(error);
        }
    }
    static get instance() {
        return ToolBarManager._instance;
    }
    static initialize(context, vscodeconnector, resultDataServer) {
        ToolBarManager._instance = new ToolBarManager(context, vscodeconnector, resultDataServer);
    }
    setCancelVisibility(display) {
        this.vscodeconnector.setContext(this.contextCancelVisibility, display);
        this.vscodeconnector.setContext(this.contextCancelDisabledVisibility, display);
    }
    setClearVisibility(display) {
        this.vscodeconnector.setContext(this.contextClearVisibility, display);
        this.vscodeconnector.setContext(this.contextClearDisabledVisibility, display);
    }
    setCancelEnabled(enable) {
        if (enable) {
            this.vscodeconnector.setContext(this.contextCancelVisibility, true);
            this.vscodeconnector.setContext(this.contextCancelDisabledVisibility, false);
        }
        else {
            this.vscodeconnector.setContext(this.contextCancelVisibility, false);
            this.vscodeconnector.setContext(this.contextCancelDisabledVisibility, true);
        }
    }
    setClearEnabled(enable) {
        if (enable) {
            this.vscodeconnector.setContext(this.contextClearVisibility, true);
            this.vscodeconnector.setContext(this.contextClearDisabledVisibility, false);
        }
        else {
            this.vscodeconnector.setContext(this.contextClearVisibility, false);
            this.vscodeconnector.setContext(this.contextClearDisabledVisibility, true);
        }
    }
    setViewCancelVisibility(display) {
        this.vscodeconnector.setContext(this.contextViewCancelVisibility, display);
        this.vscodeconnector.setContext(this.contextViewCancelDisabledVisibility, display);
    }
    setViewClearVisibility(display) {
        this.vscodeconnector.setContext(this.contextViewClearVisibility, display);
        this.vscodeconnector.setContext(this.contextViewClearDisabledVisibility, display);
    }
    setViewCancelEnabled(enable) {
        if (enable) {
            this.vscodeconnector.setContext(this.contextViewCancelVisibility, true);
            this.vscodeconnector.setContext(this.contextViewCancelDisabledVisibility, false);
        }
        else {
            this.vscodeconnector.setContext(this.contextViewCancelVisibility, false);
            this.vscodeconnector.setContext(this.contextViewCancelDisabledVisibility, true);
        }
    }
    setViewClearEnabled(enable) {
        if (enable) {
            this.vscodeconnector.setContext(this.contextViewClearVisibility, true);
            this.vscodeconnector.setContext(this.contextViewClearDisabledVisibility, false);
        }
        else {
            this.vscodeconnector.setContext(this.contextViewClearVisibility, false);
            this.vscodeconnector.setContext(this.contextViewClearDisabledVisibility, true);
        }
    }
}
ToolBarManager.oracleToolbarCancelCommand = "extension.oracleToolbarCancelCommand";
ToolBarManager.oracleToolbarClearCommand = "extension.oracleToolbarClearCommand";
ToolBarManager.oracleToolbarDisabledCancelCommand = "extension.oracleToolbarDisabledCancelCommand";
ToolBarManager.oracleToolbarDisabledClearCommand = "extension.oracleToolbarDisabledClearCommand";
ToolBarManager.oracleViewToolbarCancelCommand = "oracleLoginSQLResultsView.oracleViewToolbarCancelCommand";
ToolBarManager.oracleViewToolbarClearCommand = "oracleLoginSQLResultsView.oracleViewToolbarClearCommand";
ToolBarManager.oracleViewToolbarDisabledCancelCommand = "oracleLoginSQLResultsView.oracleViewToolbarDisabledCancelCommand";
ToolBarManager.oracleViewToolbarDisabledClearCommand = "oracleLoginSQLResultsView.oracleViewToolbarDisabledClearCommand";
ToolBarManager.oracleToolbarFormatCommand = "extension.formatText";
exports.default = ToolBarManager;
