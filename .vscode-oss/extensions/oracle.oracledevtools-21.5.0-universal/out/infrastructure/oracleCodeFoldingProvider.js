"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oracleCodeFoldingProvider = void 0;
const DocumentConnectionInformation_1 = require("../connectionManagement/DocumentConnectionInformation");
const codeNavigationRequests_1 = require("../models/codeNavigationRequests");
const oracleLanguageServerClient_1 = require("./oracleLanguageServerClient");
class oracleCodeFoldingProvider {
    provideFoldingRanges(document, context, token) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let requestParams = new codeNavigationRequests_1.CodeFoldingRequestParams(document.uri.toString());
            DocumentConnectionInformation_1.fileLogger.info("Sending code folding request");
            yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(codeNavigationRequests_1.CodeFoldingRequest.type, requestParams)
                .then(result => {
                if (result && result.foldingRanges && result.foldingRanges.length > 0) {
                    resolve(result.foldingRanges);
                }
            }, error => {
                DocumentConnectionInformation_1.fileLogger.error(error);
                reject();
            });
        }));
    }
}
exports.oracleCodeFoldingProvider = oracleCodeFoldingProvider;
