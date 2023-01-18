"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleNotificationTypes = exports.CodeObjectOutputEvent = exports.OracleRequestTypes = void 0;
const vscode_jsonrpc_1 = require("vscode-jsonrpc");
const scriptExecutionModels_1 = require("./scriptExecutionModels");
class OracleRequestTypes {
}
exports.OracleRequestTypes = OracleRequestTypes;
OracleRequestTypes.scriptExecute = new vscode_jsonrpc_1.RequestType("script/execute");
OracleRequestTypes.echo = new vscode_jsonrpc_1.RequestType("echo");
OracleRequestTypes.cancelScriptExecution = new vscode_jsonrpc_1.RequestType("script/executionCancel");
OracleRequestTypes.dataBatchRequest = new vscode_jsonrpc_1.RequestType("script/dataBatch");
OracleRequestTypes.messageAcknowledgementRequest = new vscode_jsonrpc_1.RequestType("script/acknowledgeMessage");
class CodeObjectOutputEvent {
}
exports.CodeObjectOutputEvent = CodeObjectOutputEvent;
CodeObjectOutputEvent.event = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.scriptCodeObjectOutput);
class OracleNotificationTypes {
}
exports.OracleNotificationTypes = OracleNotificationTypes;
OracleNotificationTypes.scriptExecutionStartedEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.scriptExecutionStarted);
OracleNotificationTypes.scriptExecutionFinishedEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.scriptExecutionFinished);
OracleNotificationTypes.loginScriptExecutionStartedEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.loginScriptExecutionStarted);
OracleNotificationTypes.loginScriptExecutionFinishedEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.loginScriptExecutionFinished);
OracleNotificationTypes.nestedScriptExecutionStartedEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.nestedScriptExecutionStarted);
OracleNotificationTypes.nestedScriptExecutionFinishedEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.nestedScriptExecutionFinished);
OracleNotificationTypes.scriptExecutionMessageEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.scriptExecutionMessage);
OracleNotificationTypes.scriptExecutionDataEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.scriptExecutionData);
OracleNotificationTypes.scriptExecutionDisposeEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.scriptExecutionDispose);
OracleNotificationTypes.scriptExecutionCancelEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.scriptExecutionCancelled);
OracleNotificationTypes.userInputRequiredEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.scriptUserInputRequired);
OracleNotificationTypes.scriptExecutionClearEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.scriptExecutionClear);
OracleNotificationTypes.scriptExecutionResetEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.scriptExecutionReset);
OracleNotificationTypes.scriptExecutionBatchedMessageEvent = new vscode_jsonrpc_1.NotificationType(scriptExecutionModels_1.OracleEventNames.scriptExecutionBatchedMessage);
