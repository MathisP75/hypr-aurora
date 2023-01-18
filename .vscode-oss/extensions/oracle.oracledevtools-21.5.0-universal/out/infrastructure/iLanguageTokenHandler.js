"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatementScopeItems = exports.DocumentToken = void 0;
const oracleCompletionItemProvider_1 = require("./oracleCompletionItemProvider");
const oracleLanguageFeaturesHelper_1 = require("./oracleLanguageFeaturesHelper");
class DocumentToken {
    constructor() {
        this.document = null;
        this.position = null;
        this.cancellationToken = null;
        this.documentId = null;
        this.context = null;
        this.tokenPosition = null;
        this.tokenInfo = new oracleCompletionItemProvider_1.TokenInfo();
        this.aliasInfo = new oracleLanguageFeaturesHelper_1.AliasInfo();
        this.commaCount = 0;
        this.isTokenSpaceKey = false;
        this.staticFunctionSortText = null;
        this.tokenAlias = null;
    }
}
exports.DocumentToken = DocumentToken;
class StatementScopeItems {
}
exports.StatementScopeItems = StatementScopeItems;
