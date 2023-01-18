"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryHistoryRunObjectRequest = exports.RunHistoryObjectParams = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
class RunHistoryObjectParams {
    constructor(sqlQuery, ownerUri) {
        this.sqlQuery = sqlQuery;
        this.ownerUri = ownerUri;
    }
}
exports.RunHistoryObjectParams = RunHistoryObjectParams;
class QueryHistoryRunObjectRequest {
}
exports.QueryHistoryRunObjectRequest = QueryHistoryRunObjectRequest;
QueryHistoryRunObjectRequest.type = new vscode_languageclient_1.RequestType("queryHistoryManager/runHistoryObject");
