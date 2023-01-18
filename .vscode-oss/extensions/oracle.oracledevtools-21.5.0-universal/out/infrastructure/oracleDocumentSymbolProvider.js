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
exports.oracleDocumentSymbolProvider = void 0;
const vscode_1 = require("vscode");
const codeNavigationRequests_1 = require("../models/codeNavigationRequests");
const oracleLanguageServerClient_1 = require("./oracleLanguageServerClient");
const logger = require("./../infrastructure/logger");
const vscode_languageclient_1 = require("vscode-languageclient");
const helper = require("./../utilities/helper");
const fileLogger = logger.FileStreamLogger.Instance;
class oracleDocumentSymbolProvider {
    constructor() {
        this.languageServerClient = oracleLanguageServerClient_1.OracleLanguageServerClient.instance;
    }
    provideDocumentSymbols(document, token) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                fileLogger.info(`Sending request for document symbol information`);
                yield this.languageServerClient.sendRequest(codeNavigationRequests_1.SymbolInformationRequest.type, new codeNavigationRequests_1.SymbolInformationParam(document.uri.toString()))
                    .then((result) => __awaiter(this, void 0, void 0, function* () {
                    fileLogger.info(`Symbol information data received`);
                    let symbolInformation = [];
                    result.map(symbol => {
                        if (symbol.endLine >= document.lineCount)
                            symbol.endLine = document.lineCount - 1;
                        let loc = new vscode_1.Location(document.uri, new vscode_1.Range(new vscode_1.Position(symbol.startLine, 0), new vscode_1.Position(symbol.endLine, document.lineAt(symbol.endLine).range.end.character)));
                        symbolInformation.push(new vscode_1.SymbolInformation(symbol.displayName, symbolKind[symbol.objectTypeName] - 1, symbol.displayName, loc));
                    });
                    fileLogger.info(`Processed symbol information data`);
                    resolve(symbolInformation);
                }), error => {
                    resolve(null);
                    helper.logErroAfterValidating(error);
                });
            }
            catch (error) {
                helper.logErroAfterValidating(error);
            }
        }));
    }
}
exports.oracleDocumentSymbolProvider = oracleDocumentSymbolProvider;
const symbolKind = {
    'VARIABLE': vscode_languageclient_1.SymbolKind.Variable,
    'SELECT': vscode_languageclient_1.SymbolKind.Object,
    'ANONYMOUS BLOCK': vscode_languageclient_1.SymbolKind.Method,
    'CURSOR': vscode_languageclient_1.SymbolKind.Variable,
    'SUBTYPE': vscode_languageclient_1.SymbolKind.Variable,
    'EXCEPTION': vscode_languageclient_1.SymbolKind.Variable,
    'PRAGMA': vscode_languageclient_1.SymbolKind.Variable,
    'LANGUAGE': vscode_languageclient_1.SymbolKind.Object,
    'EXTERNAL': vscode_languageclient_1.SymbolKind.Object,
    'CONSTANT': vscode_languageclient_1.SymbolKind.Variable,
    'PACKAGE METHOD': vscode_languageclient_1.SymbolKind.Interface,
    'CLUSTER': vscode_languageclient_1.SymbolKind.Object,
    'CONTEXT': vscode_languageclient_1.SymbolKind.Object,
    'CONTROLFILE': vscode_languageclient_1.SymbolKind.File,
    'DATABASE': vscode_languageclient_1.SymbolKind.Object,
    'DATABASE LINK': vscode_languageclient_1.SymbolKind.Object,
    'DIMENSION': vscode_languageclient_1.SymbolKind.Object,
    'DIRECTORY': vscode_languageclient_1.SymbolKind.Object,
    'DISKGROUP': vscode_languageclient_1.SymbolKind.Object,
    'FUNCTION': vscode_languageclient_1.SymbolKind.Method,
    'INDEX': vscode_languageclient_1.SymbolKind.Object,
    'INDEXTYPE': vscode_languageclient_1.SymbolKind.Object,
    'JAVA': vscode_languageclient_1.SymbolKind.Object,
    'LIBRARY': vscode_languageclient_1.SymbolKind.Object,
    'MATERIALIZED VIEW LOG': vscode_languageclient_1.SymbolKind.Object,
    'MATERIALIZED VIEW': vscode_languageclient_1.SymbolKind.Enum,
    'OPERATOR': vscode_languageclient_1.SymbolKind.Operator,
    'OUTLINE': vscode_languageclient_1.SymbolKind.Object,
    'PACKAGE BODY': vscode_languageclient_1.SymbolKind.Class,
    'PACKAGE': vscode_languageclient_1.SymbolKind.Class,
    'PFILE': vscode_languageclient_1.SymbolKind.File,
    'PROCEDURE': vscode_languageclient_1.SymbolKind.Method,
    'PROFILE': vscode_languageclient_1.SymbolKind.Object,
    'RESTORE POINT': vscode_languageclient_1.SymbolKind.Object,
    'ROLE': vscode_languageclient_1.SymbolKind.Object,
    'ROLLBACK SEGMENT': vscode_languageclient_1.SymbolKind.Object,
    'SCHEMA': vscode_languageclient_1.SymbolKind.Object,
    'SEQUENCE': vscode_languageclient_1.SymbolKind.Property,
    'SPFILE': vscode_languageclient_1.SymbolKind.File,
    'SYNONYM': vscode_languageclient_1.SymbolKind.String,
    'TABLESPACE': vscode_languageclient_1.SymbolKind.Object,
    'TABLE': vscode_languageclient_1.SymbolKind.Constant,
    'TRIGGER': vscode_languageclient_1.SymbolKind.Event,
    'TYPE BODY': vscode_languageclient_1.SymbolKind.Class,
    'TYPE': vscode_languageclient_1.SymbolKind.Class,
    'USER': vscode_languageclient_1.SymbolKind.Object,
    'VIEW': vscode_languageclient_1.SymbolKind.Enum
};
