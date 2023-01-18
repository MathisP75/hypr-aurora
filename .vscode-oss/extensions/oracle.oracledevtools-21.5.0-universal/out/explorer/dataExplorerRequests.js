"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlsqlValidateSettingsRequest = exports.CompileCodeObjectResponse = exports.CompileFlags = exports.CompileCodeObjectRequestParams = exports.CompileCodeObjectRequest = exports.PlsqlDebugResponse = exports.PlsqlDebugRequestParams = exports.PlsqlDebugRequest = exports.DebugType = exports.DataExplorerGenerateStatementType = exports.DataExplorerGenerateStatementMessageType = exports.DataExplorerGenerateStatementResponse = exports.DataExplorerGenerateStatementParams = exports.DataExplorerGenerateStatementRequest = exports.DataExplorerDescribeObjectMessageType = exports.DataExplorerDescribeObjectResponse = exports.DataExplorerDescribeObjectParams = exports.DataExplorerDesribeObjectRequest = exports.Status = exports.DBObjectBasicProps = exports.DataExplorerShowObjectDataRequest = exports.DataExplorerBasicObjectPropertiesParams = exports.DataExplorerFetchBasicObjectPropertiesParams = exports.DataExplorerFetchBasicObjectPropertiesResponse = exports.DataExplorerFetchBasicObjectPropertiesRequest = exports.RunCodeObjectMessageType = exports.RunCodeObjectResponse = exports.RunCodeObjectRequestParams = exports.RunCodeObjectRequestStronglyTyped = exports.DataExplorerEditorOpenedEventStronglyTyped = exports.DataExplorerEditorOpenedEventParams = exports.DataExplorerIntializedEventStronglyTyped = exports.DataExplorerIntializedEventParams = exports.DataExplorerSaveToDatabaseMessageType = exports.DataExplorerSaveToDatabaseResponse = exports.DataExplorerSaveToDatabaseRequestParams = exports.DataExplorerSaveToDatabaseRequestStronglyTyped = exports.DataExplorerFetchSourceResponse = exports.DataExplorerFetchSourceRequestParams = exports.DataExplorerFetchSourceRequestStronglyTyped = exports.OracleDDEXRestriction = exports.OracleDDEXRestrictionType = exports.OracleDDEXObjectTypes = exports.DataExplorerFetchMessageType = exports.DbObject = exports.DatabaseObjectJson = exports.DataExplorerGetObjectsResponse = exports.DataExplorerGetObjectsMessageType = exports.DataExplorerGetObjectsRequestParams = exports.DataExplorerGetObjectsRequestStronglyTyped = void 0;
exports.DataExplorerGetMethodParamsRequestStronglyTyped = exports.DataExplorerGetMethodParamsResponse = exports.DataExplorerGetMethodParamsRequest = exports.PlsqlVerifyIPAddressResponse = exports.PlsqlVerifyIPAddressRequestParams = exports.PlsqlVerifyIPAddressRequest = exports.GetIPAddressesResponse = exports.GetIPAddressesRequestParameters = exports.GetIPAddressesRequest = exports.PlsqlValidateSettingsMessageType = exports.PlsqlValidateSettingsResponse = exports.PlsqlValidateSettingsRequestParams = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
const constants_1 = require("../constants/constants");
class DataExplorerGetObjectsRequestStronglyTyped {
}
exports.DataExplorerGetObjectsRequestStronglyTyped = DataExplorerGetObjectsRequestStronglyTyped;
DataExplorerGetObjectsRequestStronglyTyped.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dataExplorerGetObjectsRequest);
class DataExplorerGetObjectsRequestParams {
}
exports.DataExplorerGetObjectsRequestParams = DataExplorerGetObjectsRequestParams;
var DataExplorerGetObjectsMessageType;
(function (DataExplorerGetObjectsMessageType) {
    DataExplorerGetObjectsMessageType[DataExplorerGetObjectsMessageType["Data"] = 0] = "Data";
    DataExplorerGetObjectsMessageType[DataExplorerGetObjectsMessageType["Error"] = 1] = "Error";
})(DataExplorerGetObjectsMessageType = exports.DataExplorerGetObjectsMessageType || (exports.DataExplorerGetObjectsMessageType = {}));
class DataExplorerGetObjectsResponse {
}
exports.DataExplorerGetObjectsResponse = DataExplorerGetObjectsResponse;
class DatabaseObjectJson {
}
exports.DatabaseObjectJson = DatabaseObjectJson;
class DbObject extends DatabaseObjectJson {
}
exports.DbObject = DbObject;
var DataExplorerFetchMessageType;
(function (DataExplorerFetchMessageType) {
    DataExplorerFetchMessageType[DataExplorerFetchMessageType["Data"] = 0] = "Data";
    DataExplorerFetchMessageType[DataExplorerFetchMessageType["Error"] = 1] = "Error";
})(DataExplorerFetchMessageType = exports.DataExplorerFetchMessageType || (exports.DataExplorerFetchMessageType = {}));
var OracleDDEXObjectTypes;
(function (OracleDDEXObjectTypes) {
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Database"] = 0] = "OraDDEX_Database";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Connection"] = 1] = "OraDDEX_Connection";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_User"] = 2] = "OraDDEX_User";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Role"] = 3] = "OraDDEX_Role";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Schema"] = 4] = "OraDDEX_Schema";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Table"] = 5] = "OraDDEX_Table";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_RelationalTable"] = 6] = "OraDDEX_RelationalTable";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_XMLTable"] = 7] = "OraDDEX_XMLTable";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_ObjectTable"] = 8] = "OraDDEX_ObjectTable";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_View"] = 9] = "OraDDEX_View";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_RelationalView"] = 10] = "OraDDEX_RelationalView";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_XMLView"] = 11] = "OraDDEX_XMLView";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_ObjectView"] = 12] = "OraDDEX_ObjectView";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Procedure"] = 13] = "OraDDEX_Procedure";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_PackageProcedure"] = 14] = "OraDDEX_PackageProcedure";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Function"] = 15] = "OraDDEX_Function";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_PackageFunction"] = 16] = "OraDDEX_PackageFunction";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_StoredProcedureParameter"] = 17] = "OraDDEX_StoredProcedureParameter";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_FunctionParameter"] = 18] = "OraDDEX_FunctionParameter";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_PackageStoredProcedureParameter"] = 19] = "OraDDEX_PackageStoredProcedureParameter";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Package"] = 20] = "OraDDEX_Package";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_PackageBody"] = 21] = "OraDDEX_PackageBody";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_TableColumn"] = 22] = "OraDDEX_TableColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_ViewColumn"] = 23] = "OraDDEX_ViewColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_IndexColumn"] = 24] = "OraDDEX_IndexColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_TriggerColumn"] = 25] = "OraDDEX_TriggerColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_TableTriggerMain"] = 26] = "OraDDEX_TableTriggerMain";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_ViewTriggerMain"] = 27] = "OraDDEX_ViewTriggerMain";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_DatabaseTriggerMain"] = 28] = "OraDDEX_DatabaseTriggerMain";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_SchemaTriggerMain"] = 29] = "OraDDEX_SchemaTriggerMain";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Constraint"] = 30] = "OraDDEX_Constraint";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Synonym"] = 31] = "OraDDEX_Synonym";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Sequence"] = 32] = "OraDDEX_Sequence";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_XMLSchema"] = 33] = "OraDDEX_XMLSchema";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Assembly"] = 34] = "OraDDEX_Assembly";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_JavaClass"] = 35] = "OraDDEX_JavaClass";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_UserDataType"] = 36] = "OraDDEX_UserDataType";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_UDTAttribute"] = 37] = "OraDDEX_UDTAttribute";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_UDTMethod"] = 38] = "OraDDEX_UDTMethod";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_UDTMethodParameter"] = 39] = "OraDDEX_UDTMethodParameter";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_UDTMethodResult"] = 40] = "OraDDEX_UDTMethodResult";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_PackageMethod"] = 41] = "OraDDEX_PackageMethod";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_UDTTypeBody"] = 42] = "OraDDEX_UDTTypeBody";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Queue"] = 43] = "OraDDEX_Queue";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_QueueTable"] = 44] = "OraDDEX_QueueTable";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_QueuePropagation"] = 45] = "OraDDEX_QueuePropagation";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_QueueSubscriber"] = 46] = "OraDDEX_QueueSubscriber";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_ADDMTask"] = 47] = "OraDDEX_ADDMTask";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_SQLTuningAdvisorTask"] = 48] = "OraDDEX_SQLTuningAdvisorTask";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_AdvisorTaskExecution"] = 49] = "OraDDEX_AdvisorTaskExecution";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_AWRSnapshot"] = 50] = "OraDDEX_AWRSnapshot";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_StoredProcedureColumn"] = 51] = "OraDDEX_StoredProcedureColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_PackageStoredProcedureColumn"] = 52] = "OraDDEX_PackageStoredProcedureColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_PluggableDB"] = 53] = "OraDDEX_PluggableDB";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_MaterializedView"] = 54] = "OraDDEX_MaterializedView";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_RelationalTableIndexColumn"] = 55] = "OraDDEX_RelationalTableIndexColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_RelationalTableConstraintColumn"] = 56] = "OraDDEX_RelationalTableConstraintColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_RelationalTableIndex"] = 57] = "OraDDEX_RelationalTableIndex";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_RelationalTableTrigger"] = 58] = "OraDDEX_RelationalTableTrigger";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_RelationalTableConstraint"] = 59] = "OraDDEX_RelationalTableConstraint";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_RelationalTableColumn"] = 60] = "OraDDEX_RelationalTableColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_XMLTableIndexColumn"] = 61] = "OraDDEX_XMLTableIndexColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_XMLTableConstraintColumn"] = 62] = "OraDDEX_XMLTableConstraintColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_XMLTableIndex"] = 63] = "OraDDEX_XMLTableIndex";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_XMLTableTrigger"] = 64] = "OraDDEX_XMLTableTrigger";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_XMLTableConstraint"] = 65] = "OraDDEX_XMLTableConstraint";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_XMLTableColumn"] = 66] = "OraDDEX_XMLTableColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_ObjectTableIndexColumn"] = 67] = "OraDDEX_ObjectTableIndexColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_ObjectTableConstraintColumn"] = 68] = "OraDDEX_ObjectTableConstraintColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_ObjectTableIndex"] = 69] = "OraDDEX_ObjectTableIndex";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_ObjectTableTrigger"] = 70] = "OraDDEX_ObjectTableTrigger";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_ObjectTableConstraint"] = 71] = "OraDDEX_ObjectTableConstraint";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_ObjectTableColumn"] = 72] = "OraDDEX_ObjectTableColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_RelationalViewTrigger"] = 73] = "OraDDEX_RelationalViewTrigger";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_RelationalViewColumn"] = 74] = "OraDDEX_RelationalViewColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_XMLViewTrigger"] = 75] = "OraDDEX_XMLViewTrigger";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_XMLViewColumn"] = 76] = "OraDDEX_XMLViewColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_ObjectViewTrigger"] = 77] = "OraDDEX_ObjectViewTrigger";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_ObjectViewColumn"] = 78] = "OraDDEX_ObjectViewColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_MaterializedViewTrigger"] = 79] = "OraDDEX_MaterializedViewTrigger";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_MaterializedViewColumn"] = 80] = "OraDDEX_MaterializedViewColumn";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_IndexMain"] = 81] = "OraDDEX_IndexMain";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_PackageBodyPrivateMethod"] = 82] = "OraDDEX_PackageBodyPrivateMethod";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_PackageBodyMethod"] = 83] = "OraDDEX_PackageBodyMethod";
    OracleDDEXObjectTypes[OracleDDEXObjectTypes["OraDDEX_Trigger"] = 84] = "OraDDEX_Trigger";
})(OracleDDEXObjectTypes = exports.OracleDDEXObjectTypes || (exports.OracleDDEXObjectTypes = {}));
var OracleDDEXRestrictionType;
(function (OracleDDEXRestrictionType) {
    OracleDDEXRestrictionType[OracleDDEXRestrictionType["OraDDEXRestriction_OwnerName"] = 0] = "OraDDEXRestriction_OwnerName";
    OracleDDEXRestrictionType[OracleDDEXRestrictionType["OraDDEXRestriction_ObjectName"] = 1] = "OraDDEXRestriction_ObjectName";
    OracleDDEXRestrictionType[OracleDDEXRestrictionType["OraDDEXRestriction_ObjectId"] = 2] = "OraDDEXRestriction_ObjectId";
    OracleDDEXRestrictionType[OracleDDEXRestrictionType["OraDDEXRestriction_ParentObjectName"] = 3] = "OraDDEXRestriction_ParentObjectName";
    OracleDDEXRestrictionType[OracleDDEXRestrictionType["OraDDEXRestriction_DefinerObjectName"] = 4] = "OraDDEXRestriction_DefinerObjectName";
    OracleDDEXRestrictionType[OracleDDEXRestrictionType["OraDDEXRestriction_DefinerObjectId"] = 5] = "OraDDEXRestriction_DefinerObjectId";
    OracleDDEXRestrictionType[OracleDDEXRestrictionType["OraDDEXRestriction_IncludeSchemas"] = 6] = "OraDDEXRestriction_IncludeSchemas";
    OracleDDEXRestrictionType[OracleDDEXRestrictionType["OraDDEXRestriction_ExcludeSchemas"] = 7] = "OraDDEXRestriction_ExcludeSchemas";
    OracleDDEXRestrictionType[OracleDDEXRestrictionType["OraDDEXRestriction_ConstraintType"] = 8] = "OraDDEXRestriction_ConstraintType";
    OracleDDEXRestrictionType[OracleDDEXRestrictionType["OraDDEXRestriction_StartIndex"] = 9] = "OraDDEXRestriction_StartIndex";
    OracleDDEXRestrictionType[OracleDDEXRestrictionType["OraDDEXRestriction_EndIndex"] = 10] = "OraDDEXRestriction_EndIndex";
    OracleDDEXRestrictionType[OracleDDEXRestrictionType["OraDDEXRestriction_CategoryFilter"] = 11] = "OraDDEXRestriction_CategoryFilter";
    OracleDDEXRestrictionType[OracleDDEXRestrictionType["OraDDEXRestriction_ObjectOwnerSchema"] = 12] = "OraDDEXRestriction_ObjectOwnerSchema";
})(OracleDDEXRestrictionType = exports.OracleDDEXRestrictionType || (exports.OracleDDEXRestrictionType = {}));
class OracleDDEXRestriction {
    constructor(type, restriction) {
        this.type = type;
        this.restriction = restriction;
    }
}
exports.OracleDDEXRestriction = OracleDDEXRestriction;
class DataExplorerFetchSourceRequestStronglyTyped {
}
exports.DataExplorerFetchSourceRequestStronglyTyped = DataExplorerFetchSourceRequestStronglyTyped;
DataExplorerFetchSourceRequestStronglyTyped.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dataExplorerFetchSourceObjectsRequest);
class DataExplorerFetchSourceRequestParams {
}
exports.DataExplorerFetchSourceRequestParams = DataExplorerFetchSourceRequestParams;
class DataExplorerFetchSourceResponse {
}
exports.DataExplorerFetchSourceResponse = DataExplorerFetchSourceResponse;
class DataExplorerSaveToDatabaseRequestStronglyTyped {
}
exports.DataExplorerSaveToDatabaseRequestStronglyTyped = DataExplorerSaveToDatabaseRequestStronglyTyped;
DataExplorerSaveToDatabaseRequestStronglyTyped.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dataExplorerSaveToDatabaseRequest);
class DataExplorerSaveToDatabaseRequestParams {
}
exports.DataExplorerSaveToDatabaseRequestParams = DataExplorerSaveToDatabaseRequestParams;
class DataExplorerSaveToDatabaseResponse {
}
exports.DataExplorerSaveToDatabaseResponse = DataExplorerSaveToDatabaseResponse;
var DataExplorerSaveToDatabaseMessageType;
(function (DataExplorerSaveToDatabaseMessageType) {
    DataExplorerSaveToDatabaseMessageType[DataExplorerSaveToDatabaseMessageType["Success"] = 0] = "Success";
    DataExplorerSaveToDatabaseMessageType[DataExplorerSaveToDatabaseMessageType["Error"] = 1] = "Error";
    DataExplorerSaveToDatabaseMessageType[DataExplorerSaveToDatabaseMessageType["CompileWarning"] = 2] = "CompileWarning";
    DataExplorerSaveToDatabaseMessageType[DataExplorerSaveToDatabaseMessageType["CompileError"] = 3] = "CompileError";
    DataExplorerSaveToDatabaseMessageType[DataExplorerSaveToDatabaseMessageType["WarningModifiedInDatabase"] = 4] = "WarningModifiedInDatabase";
    DataExplorerSaveToDatabaseMessageType[DataExplorerSaveToDatabaseMessageType["ObjectDoesNotExistInDatabase"] = 5] = "ObjectDoesNotExistInDatabase";
})(DataExplorerSaveToDatabaseMessageType = exports.DataExplorerSaveToDatabaseMessageType || (exports.DataExplorerSaveToDatabaseMessageType = {}));
class DataExplorerIntializedEventParams {
}
exports.DataExplorerIntializedEventParams = DataExplorerIntializedEventParams;
class DataExplorerIntializedEventStronglyTyped {
}
exports.DataExplorerIntializedEventStronglyTyped = DataExplorerIntializedEventStronglyTyped;
DataExplorerIntializedEventStronglyTyped.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.dataExplorerIntializedEventName);
class DataExplorerEditorOpenedEventParams {
}
exports.DataExplorerEditorOpenedEventParams = DataExplorerEditorOpenedEventParams;
class DataExplorerEditorOpenedEventStronglyTyped {
}
exports.DataExplorerEditorOpenedEventStronglyTyped = DataExplorerEditorOpenedEventStronglyTyped;
DataExplorerEditorOpenedEventStronglyTyped.event = new vscode_languageclient_1.NotificationType(constants_1.Constants.dataExplorerEditorOpenedEventName);
class RunCodeObjectRequestStronglyTyped {
}
exports.RunCodeObjectRequestStronglyTyped = RunCodeObjectRequestStronglyTyped;
RunCodeObjectRequestStronglyTyped.type = new vscode_languageclient_1.RequestType(constants_1.Constants.runCodeObjectRequest);
class RunCodeObjectRequestParams {
    static displayString(self) {
        return `UserInputRequiredEvent Uri = ${self.ownerUri} ExecutionId = ${self.executionId}`;
    }
}
exports.RunCodeObjectRequestParams = RunCodeObjectRequestParams;
class RunCodeObjectResponse {
}
exports.RunCodeObjectResponse = RunCodeObjectResponse;
var RunCodeObjectMessageType;
(function (RunCodeObjectMessageType) {
    RunCodeObjectMessageType[RunCodeObjectMessageType["Success"] = 0] = "Success";
    RunCodeObjectMessageType[RunCodeObjectMessageType["Error"] = 1] = "Error";
})(RunCodeObjectMessageType = exports.RunCodeObjectMessageType || (exports.RunCodeObjectMessageType = {}));
class DataExplorerFetchBasicObjectPropertiesRequest {
}
exports.DataExplorerFetchBasicObjectPropertiesRequest = DataExplorerFetchBasicObjectPropertiesRequest;
DataExplorerFetchBasicObjectPropertiesRequest.type = new vscode_languageclient_1.RequestType("dataExplorer/fetchBasicObjectProperties");
class DataExplorerFetchBasicObjectPropertiesResponse {
}
exports.DataExplorerFetchBasicObjectPropertiesResponse = DataExplorerFetchBasicObjectPropertiesResponse;
class DataExplorerFetchBasicObjectPropertiesParams {
}
exports.DataExplorerFetchBasicObjectPropertiesParams = DataExplorerFetchBasicObjectPropertiesParams;
class DataExplorerBasicObjectPropertiesParams {
    constructor() {
        this.showDataFetchSize = 0;
    }
    static displayString(self) {
        return `Show Data Uri = ${self.ownerUri} ExecutionId = ${self.executionId}`;
    }
}
exports.DataExplorerBasicObjectPropertiesParams = DataExplorerBasicObjectPropertiesParams;
class DataExplorerShowObjectDataRequest {
}
exports.DataExplorerShowObjectDataRequest = DataExplorerShowObjectDataRequest;
DataExplorerShowObjectDataRequest.type = new vscode_languageclient_1.RequestType("dataExplorer/showObjectData");
class DBObjectBasicProps {
    constructor() {
        this.objectExists = false;
        this.status = Status.Invalid;
        this.compiledWithDebug = false;
    }
}
exports.DBObjectBasicProps = DBObjectBasicProps;
var Status;
(function (Status) {
    Status[Status["Valid"] = 0] = "Valid";
    Status[Status["Invalid"] = 1] = "Invalid";
})(Status = exports.Status || (exports.Status = {}));
class DataExplorerDesribeObjectRequest {
}
exports.DataExplorerDesribeObjectRequest = DataExplorerDesribeObjectRequest;
DataExplorerDesribeObjectRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dataExplorerDescribeObjectRequest);
class DataExplorerDescribeObjectParams {
}
exports.DataExplorerDescribeObjectParams = DataExplorerDescribeObjectParams;
class DataExplorerDescribeObjectResponse {
}
exports.DataExplorerDescribeObjectResponse = DataExplorerDescribeObjectResponse;
var DataExplorerDescribeObjectMessageType;
(function (DataExplorerDescribeObjectMessageType) {
    DataExplorerDescribeObjectMessageType[DataExplorerDescribeObjectMessageType["Data"] = 0] = "Data";
    DataExplorerDescribeObjectMessageType[DataExplorerDescribeObjectMessageType["Error"] = 1] = "Error";
})(DataExplorerDescribeObjectMessageType = exports.DataExplorerDescribeObjectMessageType || (exports.DataExplorerDescribeObjectMessageType = {}));
class DataExplorerGenerateStatementRequest {
}
exports.DataExplorerGenerateStatementRequest = DataExplorerGenerateStatementRequest;
DataExplorerGenerateStatementRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dataExplorerGenerateStatement);
class DataExplorerGenerateStatementParams {
}
exports.DataExplorerGenerateStatementParams = DataExplorerGenerateStatementParams;
class DataExplorerGenerateStatementResponse {
}
exports.DataExplorerGenerateStatementResponse = DataExplorerGenerateStatementResponse;
var DataExplorerGenerateStatementMessageType;
(function (DataExplorerGenerateStatementMessageType) {
    DataExplorerGenerateStatementMessageType[DataExplorerGenerateStatementMessageType["Data"] = 0] = "Data";
    DataExplorerGenerateStatementMessageType[DataExplorerGenerateStatementMessageType["Error"] = 1] = "Error";
})(DataExplorerGenerateStatementMessageType = exports.DataExplorerGenerateStatementMessageType || (exports.DataExplorerGenerateStatementMessageType = {}));
var DataExplorerGenerateStatementType;
(function (DataExplorerGenerateStatementType) {
    DataExplorerGenerateStatementType[DataExplorerGenerateStatementType["Insert"] = 0] = "Insert";
    DataExplorerGenerateStatementType[DataExplorerGenerateStatementType["Select"] = 1] = "Select";
    DataExplorerGenerateStatementType[DataExplorerGenerateStatementType["Delete"] = 2] = "Delete";
    DataExplorerGenerateStatementType[DataExplorerGenerateStatementType["Create"] = 3] = "Create";
})(DataExplorerGenerateStatementType = exports.DataExplorerGenerateStatementType || (exports.DataExplorerGenerateStatementType = {}));
var DebugType;
(function (DebugType) {
    DebugType[DebugType["StepInto"] = 0] = "StepInto";
    DebugType[DebugType["RunDebug"] = 1] = "RunDebug";
    DebugType[DebugType["Application"] = 2] = "Application";
    DebugType[DebugType["ExternalApplication"] = 3] = "ExternalApplication";
})(DebugType = exports.DebugType || (exports.DebugType = {}));
class PlsqlDebugRequest {
}
exports.PlsqlDebugRequest = PlsqlDebugRequest;
PlsqlDebugRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.plsqlDebugRequest);
class PlsqlDebugRequestParams {
}
exports.PlsqlDebugRequestParams = PlsqlDebugRequestParams;
class PlsqlDebugResponse {
}
exports.PlsqlDebugResponse = PlsqlDebugResponse;
class CompileCodeObjectRequest {
}
exports.CompileCodeObjectRequest = CompileCodeObjectRequest;
CompileCodeObjectRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dataExplorerCompileObjectRequest);
class CompileCodeObjectRequestParams {
    static displayString(self) {
        return `CompileCodeObject Node = ${self.schemaName}.${self.objectName} type = ${self.objectType}`;
    }
}
exports.CompileCodeObjectRequestParams = CompileCodeObjectRequestParams;
class CompileFlags {
    constructor() {
        this.optimizeLevel = -1;
    }
}
exports.CompileFlags = CompileFlags;
class CompileCodeObjectResponse {
}
exports.CompileCodeObjectResponse = CompileCodeObjectResponse;
class PlsqlValidateSettingsRequest {
}
exports.PlsqlValidateSettingsRequest = PlsqlValidateSettingsRequest;
PlsqlValidateSettingsRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.plsqlDebugValidateSettingsRequest);
class PlsqlValidateSettingsRequestParams {
}
exports.PlsqlValidateSettingsRequestParams = PlsqlValidateSettingsRequestParams;
class PlsqlValidateSettingsResponse {
}
exports.PlsqlValidateSettingsResponse = PlsqlValidateSettingsResponse;
var PlsqlValidateSettingsMessageType;
(function (PlsqlValidateSettingsMessageType) {
    PlsqlValidateSettingsMessageType[PlsqlValidateSettingsMessageType["Success"] = 0] = "Success";
    PlsqlValidateSettingsMessageType[PlsqlValidateSettingsMessageType["Error"] = 1] = "Error";
})(PlsqlValidateSettingsMessageType = exports.PlsqlValidateSettingsMessageType || (exports.PlsqlValidateSettingsMessageType = {}));
class GetIPAddressesRequest {
}
exports.GetIPAddressesRequest = GetIPAddressesRequest;
GetIPAddressesRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.getIPAddressesRequest);
class GetIPAddressesRequestParameters {
}
exports.GetIPAddressesRequestParameters = GetIPAddressesRequestParameters;
class GetIPAddressesResponse {
}
exports.GetIPAddressesResponse = GetIPAddressesResponse;
class PlsqlVerifyIPAddressRequest {
}
exports.PlsqlVerifyIPAddressRequest = PlsqlVerifyIPAddressRequest;
PlsqlVerifyIPAddressRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.plsqlDebugVerfiyIPAddressRequest);
class PlsqlVerifyIPAddressRequestParams {
}
exports.PlsqlVerifyIPAddressRequestParams = PlsqlVerifyIPAddressRequestParams;
class PlsqlVerifyIPAddressResponse {
}
exports.PlsqlVerifyIPAddressResponse = PlsqlVerifyIPAddressResponse;
class DataExplorerGetMethodParamsRequest {
}
exports.DataExplorerGetMethodParamsRequest = DataExplorerGetMethodParamsRequest;
class DataExplorerGetMethodParamsResponse {
}
exports.DataExplorerGetMethodParamsResponse = DataExplorerGetMethodParamsResponse;
class DataExplorerGetMethodParamsRequestStronglyTyped {
}
exports.DataExplorerGetMethodParamsRequestStronglyTyped = DataExplorerGetMethodParamsRequestStronglyTyped;
DataExplorerGetMethodParamsRequestStronglyTyped.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dataExplorerGetMethodParamsRequest);
