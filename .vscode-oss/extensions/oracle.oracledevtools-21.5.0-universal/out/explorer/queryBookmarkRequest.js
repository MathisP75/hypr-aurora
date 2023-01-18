"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunBookmarkRequest = exports.RunBookmarkQueryParams = exports.BookmarkQueryResponse = exports.QueryBookmarkRequest = exports.detectConnectAsStartSQLRequest = exports.detectConnectAsStartSQLResponse = exports.detectConnectAsStartSQLParams = exports.BookmarkQueryParams = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
class BookmarkQueryParams {
    constructor(selection, ownerUri) {
        this.selection = selection;
        this.ownerUri = ownerUri;
    }
}
exports.BookmarkQueryParams = BookmarkQueryParams;
class detectConnectAsStartSQLParams {
    constructor(sql, uri) {
        this.script = sql;
        this.ownerUri = uri;
    }
}
exports.detectConnectAsStartSQLParams = detectConnectAsStartSQLParams;
class detectConnectAsStartSQLResponse {
    constructor(connectFirstSQL) {
        this.connectFirstSQL = connectFirstSQL;
    }
}
exports.detectConnectAsStartSQLResponse = detectConnectAsStartSQLResponse;
class detectConnectAsStartSQLRequest {
}
exports.detectConnectAsStartSQLRequest = detectConnectAsStartSQLRequest;
detectConnectAsStartSQLRequest.type = new vscode_languageclient_1.RequestType("queryBookmarkManager/bookmarkQueryConnectFirstSQL");
class QueryBookmarkRequest {
}
exports.QueryBookmarkRequest = QueryBookmarkRequest;
QueryBookmarkRequest.type = new vscode_languageclient_1.RequestType("queryBookmarkManager/bookmarkQuery");
class BookmarkQueryResponse {
}
exports.BookmarkQueryResponse = BookmarkQueryResponse;
class RunBookmarkQueryParams {
    constructor(sqlQuery, ownerUri, connectFirstSQL, bookMarkFolderName, bookMarkItemName) {
        this.sqlQuery = sqlQuery;
        this.ownerUri = ownerUri;
        this.executeWithoutConnection = connectFirstSQL;
        this.bookMarkItemName = bookMarkItemName;
        this.bookMarkFolderName = bookMarkFolderName;
    }
}
exports.RunBookmarkQueryParams = RunBookmarkQueryParams;
class RunBookmarkRequest {
}
exports.RunBookmarkRequest = RunBookmarkRequest;
RunBookmarkRequest.type = new vscode_languageclient_1.RequestType("queryBookmarkManager/runBookmarkQuery");
