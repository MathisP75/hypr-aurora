"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatementContextRequest = exports.StatementContextResponse = exports.StatementContextRequestParams = exports.rebuildIntelliSenseOnReconnectEventParams = exports.rebuildIntelliSenseOnReconnectEvent = exports.LanguageServiceChangedNotification = exports.DidChangeLangServiceParameters = exports.IntelliSensePublicSynonymsDataEventParams = exports.AllObjectsData = exports.SynonymData = exports.AllColumnData = exports.IntelliSenseSchemaListEventParams = exports.IntelliSenseColumnsDataEventParams = exports.IntelliSenseAllObjectsDataEventParams = exports.IntelliSenseDataEventParams = exports.IntelliSenseAllSameSchemaObjectsDataNotification = exports.IntelliSensePublicSynonymsDataNotification = exports.IntelliSenseSynonymsDataNotification = exports.IntelliSenseColumnsDataNotification = exports.IntelliSenseSchemaListDataNotification = exports.IntelliSenseAllObjectsDataNotification = exports.IntelliSenseReadyParams = exports.IntelliSenseReadyNotification = exports.ClearIntelliSenseParameters = exports.RebuildIntelliSenseParameters = exports.ClearIntelliSenseNotification = exports.RebuildIntelliSenseNotification = exports.BuildIntelliSenseOnConnectParameters = exports.BuildIntelliSenseOnConnectNotification = exports.IntelliSenseFetchPublicSynonymSubObjectRequest = exports.IntelliSenseFetchParentTypeForObjects = exports.IntelliSenseFetchSubObjectRequest = exports.IntelliSenseFetchSameSchemaObjects = exports.IntelliSenseFetchObjectsForSchema = exports.IntelliSenseFetchMultipleObjectsRequest = exports.FetchMultipleObjectsRequestParameter = exports.FetchSubObjectRequestRequestParameter = exports.IntelliSenseTokenRequest = exports.MethodParameterTokenRequest = exports.TokenRequestParameter = exports.ColumnData = exports.TokenTerminator = exports.TokenSource = exports.OracleSubObjectInfo = exports.OracleArgumentCompletionItem = exports.OracleSynonymCompletionItem = exports.Direction = exports.OracleParameter = exports.SchemaObjectType = exports.IntelliSenseProviderType = void 0;
exports.KeywordsRequest = exports.KeywordResponseParam = exports.KeywordRequestParam = exports.DependencyReferenceRequest = exports.DependencyReferenceResponseParams = exports.DependencyReferenceRequestParams = exports.Dependencies = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
const constants_1 = require("../constants/constants");
const oracleCompletionItemProvider_1 = require("../infrastructure/oracleCompletionItemProvider");
var IntelliSenseProviderType;
(function (IntelliSenseProviderType) {
    IntelliSenseProviderType[IntelliSenseProviderType["Undefined"] = 0] = "Undefined";
    IntelliSenseProviderType[IntelliSenseProviderType["AutoComplete"] = 1] = "AutoComplete";
    IntelliSenseProviderType[IntelliSenseProviderType["Signature"] = 2] = "Signature";
    IntelliSenseProviderType[IntelliSenseProviderType["Hover"] = 3] = "Hover";
    IntelliSenseProviderType[IntelliSenseProviderType["Definition"] = 4] = "Definition";
    IntelliSenseProviderType[IntelliSenseProviderType["Implementation"] = 5] = "Implementation";
    IntelliSenseProviderType[IntelliSenseProviderType["TypeDefinition"] = 6] = "TypeDefinition";
    IntelliSenseProviderType[IntelliSenseProviderType["References"] = 7] = "References";
})(IntelliSenseProviderType = exports.IntelliSenseProviderType || (exports.IntelliSenseProviderType = {}));
var SchemaObjectType;
(function (SchemaObjectType) {
    SchemaObjectType[SchemaObjectType["Undefined"] = -1] = "Undefined";
    SchemaObjectType[SchemaObjectType["StoredProcedure"] = 0] = "StoredProcedure";
    SchemaObjectType[SchemaObjectType["Function"] = 1] = "Function";
    SchemaObjectType[SchemaObjectType["Table"] = 2] = "Table";
    SchemaObjectType[SchemaObjectType["View"] = 3] = "View";
    SchemaObjectType[SchemaObjectType["Package"] = 4] = "Package";
    SchemaObjectType[SchemaObjectType["PackageBody"] = 5] = "PackageBody";
    SchemaObjectType[SchemaObjectType["Sequence"] = 6] = "Sequence";
    SchemaObjectType[SchemaObjectType["Synonym"] = 7] = "Synonym";
    SchemaObjectType[SchemaObjectType["JavaClass"] = 8] = "JavaClass";
    SchemaObjectType[SchemaObjectType["ObjectType"] = 9] = "ObjectType";
    SchemaObjectType[SchemaObjectType["ObjectTypeBody"] = 10] = "ObjectTypeBody";
    SchemaObjectType[SchemaObjectType["CollectionType"] = 11] = "CollectionType";
    SchemaObjectType[SchemaObjectType["XmlSchema"] = 12] = "XmlSchema";
    SchemaObjectType[SchemaObjectType["DatabaseLink"] = 13] = "DatabaseLink";
    SchemaObjectType[SchemaObjectType["Queue"] = 14] = "Queue";
    SchemaObjectType[SchemaObjectType["QueueTable"] = 15] = "QueueTable";
    SchemaObjectType[SchemaObjectType["Transformation"] = 16] = "Transformation";
    SchemaObjectType[SchemaObjectType["Trigger"] = 17] = "Trigger";
    SchemaObjectType[SchemaObjectType["Assembly"] = 18] = "Assembly";
    SchemaObjectType[SchemaObjectType["ADDMTask"] = 19] = "ADDMTask";
    SchemaObjectType[SchemaObjectType["SQLTuningAdvisorTask"] = 20] = "SQLTuningAdvisorTask";
    SchemaObjectType[SchemaObjectType["MaterializedView"] = 21] = "MaterializedView";
    SchemaObjectType[SchemaObjectType["RelationalTable"] = 22] = "RelationalTable";
    SchemaObjectType[SchemaObjectType["XMLTable"] = 23] = "XMLTable";
    SchemaObjectType[SchemaObjectType["ObjectTable"] = 24] = "ObjectTable";
    SchemaObjectType[SchemaObjectType["RelationalView"] = 25] = "RelationalView";
    SchemaObjectType[SchemaObjectType["XMLView"] = 26] = "XMLView";
    SchemaObjectType[SchemaObjectType["ObjectView"] = 27] = "ObjectView";
    SchemaObjectType[SchemaObjectType["JavaSource"] = 28] = "JavaSource";
    SchemaObjectType[SchemaObjectType["JavaResource"] = 29] = "JavaResource";
    SchemaObjectType[SchemaObjectType["DatabaseTrigger"] = 30] = "DatabaseTrigger";
    SchemaObjectType[SchemaObjectType["TableTrigger"] = 31] = "TableTrigger";
    SchemaObjectType[SchemaObjectType["ViewTrigger"] = 32] = "ViewTrigger";
    SchemaObjectType[SchemaObjectType["SchemaTrigger"] = 33] = "SchemaTrigger";
    SchemaObjectType[SchemaObjectType["TableConstraint"] = 34] = "TableConstraint";
    SchemaObjectType[SchemaObjectType["TableIndex"] = 35] = "TableIndex";
    SchemaObjectType[SchemaObjectType["TableColumn"] = 36] = "TableColumn";
    SchemaObjectType[SchemaObjectType["PackageMethod"] = 37] = "PackageMethod";
    SchemaObjectType[SchemaObjectType["ObjectAttribute"] = 38] = "ObjectAttribute";
    SchemaObjectType[SchemaObjectType["ObjectMethod"] = 39] = "ObjectMethod";
    SchemaObjectType[SchemaObjectType["PublicSynonym"] = 40] = "PublicSynonym";
    SchemaObjectType[SchemaObjectType["Schema"] = 41] = "Schema";
    SchemaObjectType[SchemaObjectType["PackageMember"] = 42] = "PackageMember";
    SchemaObjectType[SchemaObjectType["StaticSQLFunction"] = 43] = "StaticSQLFunction";
    SchemaObjectType[SchemaObjectType["TableViewAlias"] = 44] = "TableViewAlias";
    SchemaObjectType[SchemaObjectType["Asteric"] = 45] = "Asteric";
    SchemaObjectType[SchemaObjectType["TableViewSubqueryAllColumn"] = 46] = "TableViewSubqueryAllColumn";
    SchemaObjectType[SchemaObjectType["SubqueryAlias"] = 47] = "SubqueryAlias";
    SchemaObjectType[SchemaObjectType["SubqueryTableColumn"] = 48] = "SubqueryTableColumn";
    SchemaObjectType[SchemaObjectType["SubqueryTableColumnAlias"] = 49] = "SubqueryTableColumnAlias";
})(SchemaObjectType = exports.SchemaObjectType || (exports.SchemaObjectType = {}));
class OracleParameter {
}
exports.OracleParameter = OracleParameter;
var Direction;
(function (Direction) {
    Direction[Direction["None"] = 1] = "None";
    Direction[Direction["IN"] = 2] = "IN";
    Direction[Direction["INOUT"] = 3] = "INOUT";
    Direction[Direction["OUT"] = 4] = "OUT";
})(Direction = exports.Direction || (exports.Direction = {}));
class OracleSynonymCompletionItem {
}
exports.OracleSynonymCompletionItem = OracleSynonymCompletionItem;
class OracleArgumentCompletionItem extends oracleCompletionItemProvider_1.OracleCompletionItem {
    constructor() {
        super();
    }
}
exports.OracleArgumentCompletionItem = OracleArgumentCompletionItem;
class OracleSubObjectInfo {
}
exports.OracleSubObjectInfo = OracleSubObjectInfo;
var TokenSource;
(function (TokenSource) {
    TokenSource[TokenSource["None"] = 1] = "None";
    TokenSource[TokenSource["AutoComplete"] = 2] = "AutoComplete";
    TokenSource[TokenSource["MethodParameter"] = 3] = "MethodParameter";
})(TokenSource = exports.TokenSource || (exports.TokenSource = {}));
var TokenTerminator;
(function (TokenTerminator) {
    TokenTerminator[TokenTerminator["None"] = 1] = "None";
    TokenTerminator[TokenTerminator["EndWithDOT"] = 2] = "EndWithDOT";
    TokenTerminator[TokenTerminator["EndForSignatureProvider"] = 3] = "EndForSignatureProvider";
    TokenTerminator[TokenTerminator["NewLine"] = 4] = "NewLine";
})(TokenTerminator = exports.TokenTerminator || (exports.TokenTerminator = {}));
class ColumnData {
    constructor() {
        this.tables = new Map();
        this.schemas = new Map();
        this.columnDocumentation = undefined;
        this.quoteNeeded = false;
    }
}
exports.ColumnData = ColumnData;
class TokenRequestParameter {
    constructor(line, column, uri, tokenSource, executeQueryRequest, tokenSpaceKey) {
        this.Line = line;
        this.Column = column;
        this.URI = uri;
        this.Source = tokenSource;
        this.ScriptExecuteParams = executeQueryRequest;
        this.IsTokenSpaceKey = tokenSpaceKey;
    }
}
exports.TokenRequestParameter = TokenRequestParameter;
class MethodParameterTokenRequest {
}
exports.MethodParameterTokenRequest = MethodParameterTokenRequest;
MethodParameterTokenRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.MethodParameterTokenRequest);
class IntelliSenseTokenRequest {
}
exports.IntelliSenseTokenRequest = IntelliSenseTokenRequest;
IntelliSenseTokenRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.intelliSenseTokensRequest);
class FetchSubObjectRequestRequestParameter {
    constructor(objectName, childObjectName, schemaName, objectType, uri, synonymDepth = 0) {
        this.objectName = objectName;
        this.schemaName = schemaName;
        this.objectType = objectType;
        this.childObjectName = childObjectName;
        this.uri = uri;
        this.synonymDepth = synonymDepth;
    }
}
exports.FetchSubObjectRequestRequestParameter = FetchSubObjectRequestRequestParameter;
class FetchMultipleObjectsRequestParameter {
    constructor(uri, schemaName, objectType, objectList, depth = 0) {
        this.URI = uri;
        this.objectType = objectType;
        this.schema = schemaName;
        this.objectNameList = objectList;
        this.parentObject = null;
        this.depth = depth;
    }
}
exports.FetchMultipleObjectsRequestParameter = FetchMultipleObjectsRequestParameter;
class IntelliSenseFetchMultipleObjectsRequest {
}
exports.IntelliSenseFetchMultipleObjectsRequest = IntelliSenseFetchMultipleObjectsRequest;
IntelliSenseFetchMultipleObjectsRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.intelliSenseFetchMultipleObjects);
class IntelliSenseFetchObjectsForSchema {
}
exports.IntelliSenseFetchObjectsForSchema = IntelliSenseFetchObjectsForSchema;
IntelliSenseFetchObjectsForSchema.type = new vscode_languageclient_1.RequestType(constants_1.Constants.intelliSenseFetchObjectsForSchema);
class IntelliSenseFetchSameSchemaObjects {
}
exports.IntelliSenseFetchSameSchemaObjects = IntelliSenseFetchSameSchemaObjects;
IntelliSenseFetchSameSchemaObjects.request = new vscode_languageclient_1.RequestType(constants_1.Constants.intelliSenseFetchSameSchemaObjects);
class IntelliSenseFetchSubObjectRequest {
}
exports.IntelliSenseFetchSubObjectRequest = IntelliSenseFetchSubObjectRequest;
IntelliSenseFetchSubObjectRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.intelliSenseFetchSubObjects);
class IntelliSenseFetchParentTypeForObjects {
}
exports.IntelliSenseFetchParentTypeForObjects = IntelliSenseFetchParentTypeForObjects;
IntelliSenseFetchParentTypeForObjects.type = new vscode_languageclient_1.RequestType(constants_1.Constants.fetchParentTypeForObjects);
class IntelliSenseFetchPublicSynonymSubObjectRequest {
}
exports.IntelliSenseFetchPublicSynonymSubObjectRequest = IntelliSenseFetchPublicSynonymSubObjectRequest;
IntelliSenseFetchPublicSynonymSubObjectRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.intelliSenseFetchSynonymSubObjects);
class BuildIntelliSenseOnConnectNotification {
}
exports.BuildIntelliSenseOnConnectNotification = BuildIntelliSenseOnConnectNotification;
BuildIntelliSenseOnConnectNotification.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.intelliSenseBuildOnConnect);
class BuildIntelliSenseOnConnectParameters {
}
exports.BuildIntelliSenseOnConnectParameters = BuildIntelliSenseOnConnectParameters;
class RebuildIntelliSenseNotification {
}
exports.RebuildIntelliSenseNotification = RebuildIntelliSenseNotification;
RebuildIntelliSenseNotification.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.intelliSenseRebuildIntelliSense);
class ClearIntelliSenseNotification {
}
exports.ClearIntelliSenseNotification = ClearIntelliSenseNotification;
ClearIntelliSenseNotification.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.intelliSenseClearCache);
class RebuildIntelliSenseParameters {
}
exports.RebuildIntelliSenseParameters = RebuildIntelliSenseParameters;
class ClearIntelliSenseParameters {
}
exports.ClearIntelliSenseParameters = ClearIntelliSenseParameters;
class IntelliSenseReadyNotification {
}
exports.IntelliSenseReadyNotification = IntelliSenseReadyNotification;
IntelliSenseReadyNotification.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.intelliSenseReady);
class IntelliSenseReadyParams {
}
exports.IntelliSenseReadyParams = IntelliSenseReadyParams;
class IntelliSenseAllObjectsDataNotification {
}
exports.IntelliSenseAllObjectsDataNotification = IntelliSenseAllObjectsDataNotification;
IntelliSenseAllObjectsDataNotification.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.intelliSenseAllObjectsData);
class IntelliSenseSchemaListDataNotification {
}
exports.IntelliSenseSchemaListDataNotification = IntelliSenseSchemaListDataNotification;
IntelliSenseSchemaListDataNotification.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.intelliSenseSchemaList);
class IntelliSenseColumnsDataNotification {
}
exports.IntelliSenseColumnsDataNotification = IntelliSenseColumnsDataNotification;
IntelliSenseColumnsDataNotification.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.intelliSenseColumnData);
class IntelliSenseSynonymsDataNotification {
}
exports.IntelliSenseSynonymsDataNotification = IntelliSenseSynonymsDataNotification;
IntelliSenseSynonymsDataNotification.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.intelliSenseSynonymData);
class IntelliSensePublicSynonymsDataNotification {
}
exports.IntelliSensePublicSynonymsDataNotification = IntelliSensePublicSynonymsDataNotification;
IntelliSensePublicSynonymsDataNotification.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.intelliSensePublicSynonymData);
class IntelliSenseAllSameSchemaObjectsDataNotification {
}
exports.IntelliSenseAllSameSchemaObjectsDataNotification = IntelliSenseAllSameSchemaObjectsDataNotification;
IntelliSenseAllSameSchemaObjectsDataNotification.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.intelliSenseAllSameSchemaObjectsData);
class IntelliSenseDataEventParams {
}
exports.IntelliSenseDataEventParams = IntelliSenseDataEventParams;
class IntelliSenseAllObjectsDataEventParams {
}
exports.IntelliSenseAllObjectsDataEventParams = IntelliSenseAllObjectsDataEventParams;
class IntelliSenseColumnsDataEventParams {
}
exports.IntelliSenseColumnsDataEventParams = IntelliSenseColumnsDataEventParams;
class IntelliSenseSchemaListEventParams {
}
exports.IntelliSenseSchemaListEventParams = IntelliSenseSchemaListEventParams;
class AllColumnData {
}
exports.AllColumnData = AllColumnData;
class SynonymData {
}
exports.SynonymData = SynonymData;
class AllObjectsData {
}
exports.AllObjectsData = AllObjectsData;
class IntelliSensePublicSynonymsDataEventParams {
}
exports.IntelliSensePublicSynonymsDataEventParams = IntelliSensePublicSynonymsDataEventParams;
class DidChangeLangServiceParameters {
}
exports.DidChangeLangServiceParameters = DidChangeLangServiceParameters;
class LanguageServiceChangedNotification {
}
exports.LanguageServiceChangedNotification = LanguageServiceChangedNotification;
LanguageServiceChangedNotification.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.connectionLanguageServicechanged);
class rebuildIntelliSenseOnReconnectEvent {
}
exports.rebuildIntelliSenseOnReconnectEvent = rebuildIntelliSenseOnReconnectEvent;
rebuildIntelliSenseOnReconnectEvent.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.intelliSenseRebuildOnReconnect);
class rebuildIntelliSenseOnReconnectEventParams {
}
exports.rebuildIntelliSenseOnReconnectEventParams = rebuildIntelliSenseOnReconnectEventParams;
class StatementContextRequestParams {
}
exports.StatementContextRequestParams = StatementContextRequestParams;
class StatementContextResponse {
}
exports.StatementContextResponse = StatementContextResponse;
class StatementContextRequest {
}
exports.StatementContextRequest = StatementContextRequest;
StatementContextRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.intellisenseStatementContextRequest);
var Dependencies;
(function (Dependencies) {
    Dependencies[Dependencies["DependsON"] = 1] = "DependsON";
    Dependencies[Dependencies["ReferencedBy"] = 2] = "ReferencedBy";
    Dependencies[Dependencies["Both"] = 3] = "Both";
})(Dependencies = exports.Dependencies || (exports.Dependencies = {}));
class DependencyReferenceRequestParams {
}
exports.DependencyReferenceRequestParams = DependencyReferenceRequestParams;
class DependencyReferenceResponseParams {
}
exports.DependencyReferenceResponseParams = DependencyReferenceResponseParams;
class DependencyReferenceRequest {
}
exports.DependencyReferenceRequest = DependencyReferenceRequest;
DependencyReferenceRequest.Request = new vscode_languageclient_1.RequestType(constants_1.Constants.dependencyReferenceRequest);
class KeywordRequestParam {
    constructor(functions) {
        this.functions = functions;
    }
}
exports.KeywordRequestParam = KeywordRequestParam;
class KeywordResponseParam {
}
exports.KeywordResponseParam = KeywordResponseParam;
class KeywordsRequest {
}
exports.KeywordsRequest = KeywordsRequest;
KeywordsRequest.Request = new vscode_languageclient_1.RequestType(constants_1.Constants.intellisenseKeywordRequest);
