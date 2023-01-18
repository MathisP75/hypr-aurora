"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptExecutionManager = void 0;
const events_1 = require("events");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const scriptExecutionRequests_1 = require("../models/scriptExecutionRequests");
const logger_1 = require("./../infrastructure/logger");
const oracleLanguageServerClient_1 = require("./../infrastructure/oracleLanguageServerClient");
const helper_1 = require("../utilities/helper");
class ScriptExecutionManager {
    constructor(scriptPath, scriptEventManager, executionId) {
        this.scriptPath = scriptPath;
        this.scriptEventManager = scriptEventManager;
        this.executionId = executionId;
        this.executionStatus = scriptExecutionModels_1.ExecutionStatus.NotStarted;
        this.OwnerUri = scriptPath;
        this.eventEmitter = new events_1.EventEmitter();
        this.languageClient = oracleLanguageServerClient_1.OracleLanguageServerClient.instance;
        this.scriptEventManager.registerRunner(this, scriptPath, executionId);
    }
    on(eventName, handler) {
        this.eventEmitter.on(eventName, handler);
    }
    get uniqueId() {
        return helper_1.Utils.CreateIdBasedOnURI(this.OwnerUri, this.executionId);
    }
    onThemeChanged(event) {
        this.eventEmitter.emit(scriptExecutionModels_1.MessageName.themeChanged, event);
    }
    onODTConfigChanged(event) {
        this.eventEmitter.emit(scriptExecutionModels_1.MessageName.odtConfigChanged, event);
    }
    executionFinished(event) {
        this.executionStatus = scriptExecutionModels_1.ExecutionStatus.Finished;
        this.eventEmitter.emit(scriptExecutionModels_1.OracleEventNames.scriptExecutionFinished, event);
    }
    executionStarted(event) {
        this.executionStatus = scriptExecutionModels_1.ExecutionStatus.Started;
        this.eventEmitter.emit(scriptExecutionModels_1.OracleEventNames.scriptExecutionStarted, event);
    }
    loginScriptExecutionStarted(event) {
        this.eventEmitter.emit(scriptExecutionModels_1.OracleEventNames.loginScriptExecutionStarted, event);
    }
    loginScriptExecutionFinished(event) {
        this.eventEmitter.emit(scriptExecutionModels_1.OracleEventNames.loginScriptExecutionFinished, event);
    }
    nestedScriptExecutionStarted(event) {
        this.eventEmitter.emit(scriptExecutionModels_1.OracleEventNames.nestedScriptExecutionStarted, event);
    }
    nestedScriptExecutionFinished(event) {
        this.eventEmitter.emit(scriptExecutionModels_1.OracleEventNames.nestedScriptExecutionFinished, event);
    }
    executeScript(type, params) {
        logger_1.FileStreamLogger.Instance.info("Sending script execution request to server");
        return this.languageClient.sendRequest(type, params);
    }
    cancelExecution(requestParam) {
        return this.languageClient.sendRequest(scriptExecutionRequests_1.OracleRequestTypes.cancelScriptExecution, requestParam);
    }
    onDataEvent(event) {
        this.eventEmitter.emit(scriptExecutionModels_1.OracleEventNames.scriptExecutionData, event);
    }
    oScriptExecutionCancelled(event) {
        this.executionStatus = scriptExecutionModels_1.ExecutionStatus.Finished;
        this.eventEmitter.emit(scriptExecutionModels_1.OracleEventNames.scriptExecutionCancelled, event);
    }
    onSaveQueryResultFinishedEvent(event) {
        this.eventEmitter.emit(scriptExecutionModels_1.OracleEventNames.saveQueryResultFinishedEvent, event);
    }
    onUserInputRequested(event) {
        this.eventEmitter.emit(scriptExecutionModels_1.OracleEventNames.scriptUserInputRequired, event);
    }
    onCodeObjectOuputEvent(event) {
        this.eventEmitter.emit(scriptExecutionModels_1.OracleEventNames.scriptCodeObjectOutput, event);
    }
}
exports.ScriptExecutionManager = ScriptExecutionManager;
