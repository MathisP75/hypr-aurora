"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumeUserInputRequest = exports.SaveQueryResultCancelRequest = exports.SaveQueryResultFinishedEvent = exports.ValidationRequest = exports.SaveQueryResultRequest = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
class SaveQueryResultRequest {
}
exports.SaveQueryResultRequest = SaveQueryResultRequest;
SaveQueryResultRequest.type = new vscode_languageclient_1.RequestType("script/saveQueryResult");
class ValidationRequest {
}
exports.ValidationRequest = ValidationRequest;
ValidationRequest.type = new vscode_languageclient_1.RequestType("script/validationRequest");
class SaveQueryResultFinishedEvent {
}
exports.SaveQueryResultFinishedEvent = SaveQueryResultFinishedEvent;
SaveQueryResultFinishedEvent.event = new vscode_languageclient_1.NotificationType("script/saveQueryResultFinished");
class SaveQueryResultCancelRequest {
}
exports.SaveQueryResultCancelRequest = SaveQueryResultCancelRequest;
SaveQueryResultCancelRequest.type = new vscode_languageclient_1.RequestType("script/saveQueryResultCancel");
class ConsumeUserInputRequest {
}
exports.ConsumeUserInputRequest = ConsumeUserInputRequest;
ConsumeUserInputRequest.type = new vscode_languageclient_1.RequestType("script/consumeUserInput");
