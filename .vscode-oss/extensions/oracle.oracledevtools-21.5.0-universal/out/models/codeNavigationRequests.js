"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeFoldingRequest = exports.CodeFoldingResponse = exports.CodeFoldingRequestParams = exports.CodeTokenRequest = exports.CodeTokenResponse = exports.CodeTokenRequestParam = exports.CodeObjectSymbolsRequest = exports.CodeObjectSymbolsRequestParam = exports.SymbolInformationRequest = exports.SymbolInformationResponse = exports.SymbolInformationParam = void 0;
const vscode_jsonrpc_1 = require("vscode-jsonrpc");
const constants_1 = require("../constants/constants");
class SymbolInformationParam {
    constructor(ownerUri) {
        this.ownerUri = ownerUri;
    }
}
exports.SymbolInformationParam = SymbolInformationParam;
class SymbolInformationResponse {
}
exports.SymbolInformationResponse = SymbolInformationResponse;
class SymbolInformationRequest {
}
exports.SymbolInformationRequest = SymbolInformationRequest;
SymbolInformationRequest.type = new vscode_jsonrpc_1.RequestType(constants_1.Constants.symbolInformationRequest);
class CodeObjectSymbolsRequestParam {
}
exports.CodeObjectSymbolsRequestParam = CodeObjectSymbolsRequestParam;
class CodeObjectSymbolsRequest {
}
exports.CodeObjectSymbolsRequest = CodeObjectSymbolsRequest;
CodeObjectSymbolsRequest.type = new vscode_jsonrpc_1.RequestType(constants_1.Constants.codeObjectSymbolInformationRequest);
class CodeTokenRequestParam {
}
exports.CodeTokenRequestParam = CodeTokenRequestParam;
class CodeTokenResponse {
}
exports.CodeTokenResponse = CodeTokenResponse;
class CodeTokenRequest {
}
exports.CodeTokenRequest = CodeTokenRequest;
CodeTokenRequest.Request = new vscode_jsonrpc_1.RequestType(constants_1.Constants.codeTokenInformationRequest);
class CodeFoldingRequestParams {
    constructor(uri) {
        this.documentUri = uri;
    }
}
exports.CodeFoldingRequestParams = CodeFoldingRequestParams;
class CodeFoldingResponse {
}
exports.CodeFoldingResponse = CodeFoldingResponse;
class CodeFoldingRequest {
}
exports.CodeFoldingRequest = CodeFoldingRequest;
CodeFoldingRequest.type = new vscode_jsonrpc_1.RequestType(constants_1.Constants.codeFoldingRequest);
