"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Direction = exports.InputVariable = exports.OperationName = exports.UserInputParams = exports.DataFormat = exports.SaveQueryResultMessageType = exports.ConsumeUserInputResponseMessageType = exports.ConsumeUserInputResponse = exports.SaveQueryResultCancelResponse = exports.SaveQueryResultCancelRequestParams = exports.SaveQueryResultFinishedEventParams = exports.OracleError = exports.SaveQueryResultResponse = exports.SaveType = exports.SaveQueryResultRequestParams = exports.LogMessage = exports.ODTConfigurationChangedEvent = exports.LogSource = exports.LogLevel = exports.QueryTpe = exports.ScriptExecutionCancelledEventParams = exports.LocalizedResourceRequest = exports.ScriptExecutionResetEventParams = exports.ScriptExecutionDisposeEventParams = exports.ScriptExecutionDataBatchResponse = exports.ScriptExecutionDataBatchRequest = exports.MessageBase = exports.Routes = exports.NestedScriptExecutionFinishedEventParams = exports.NestedScriptExecutionStartedEventParams = exports.LoginScriptExecutionFinishedEventParams = exports.LoginScriptExecutionStartedEventParams = exports.ScriptExecutionFinishedEvent = exports.ScriptExecutionStartedEvent = exports.QueryData = exports.ReceiverReadyEvent = exports.ThemeChangedEvent = exports.ScriptExecutionDataEvent = exports.ScriptExecutionBatchedMessageEventParams = exports.ScriptExecutionMessageType = exports.ScriptExecutionMessageEvent = exports.ExecutionMode = exports.ScriptExecuteResult = exports.ScriptExecuteParams = exports.EchoRequest = exports.ColumnInfo = exports.CancelScriptExecutionResult = exports.CancelScriptExecutionParams = exports.MessageName = exports.OracleEventNames = void 0;
exports.SaveDebuggerSettingsRequest = exports.GetDebuggerSettingsResponse = exports.GetDebuggerSettingsRequest = exports.CompileConfig = exports.SaveCompilerSettingsResponse = exports.SaveCompilerSettingsRequest = exports.GetCompilerSettingsResponse = exports.GetCompilerSettingsRequest = exports.ScriptExecutionAcknowledgeMessageRequestParams = exports.ScriptExecutionAcknowledgeMessageResponse = exports.ToolbarEvent = exports.ExecutionStatus = exports.ResourceIdentifier = exports.ScriptExecutionClearEventParams = exports.TestCommandResponse = exports.ValidationRequestResponse = exports.ValidationRequestParams = exports.ConnectionType = exports.ConnectionAuthenticationType = exports.ToolbarOptions = exports.UpdateToolbarEvent = exports.UpdateStatusBarEvent = exports.ResultsWindowProperties = exports.ConnectionProperties = exports.CompilerProperties = exports.BookmarkProperties = exports.UserPreferences = exports.GetUserPreferencesResponse = exports.GetUserPreferencesRequest = exports.GetSchemasResponse = exports.GetSchemasRequest = exports.SaveProfileResponse = exports.SaveProfileType = exports.SaveProfileRequest = exports.ValidateProfileNameResponse = exports.ValidateProfileNameRequest = exports.GetConfigFileLocationsResponse = exports.GetAllProfieNamesResponse = exports.GetAllProfieNamesRequest = exports.BrowseResponse = exports.BrowseRequest = exports.GetTNSNamesResponse = exports.GetTNSNamesRequest = exports.GetConfigFileLocationsRequest = exports.GetProfileResponse = exports.GetProfileRequest = exports.OutputTarget = exports.QueryType = exports.UIDisplayMode = exports.DataSourceType = void 0;
exports.ImportFormatSettingsResponse = exports.ImportFormatSettingsRequest = exports.ExportFormatSettingsResponse = exports.ExportFormatSettingsRequest = exports.ConnectionHelpResponse = exports.ConnectionHelpRequest = exports.FormatPreviewTextResponse = exports.FormatPreviewTextRequest = exports.GetFormatterSettingsResponse = exports.GetFormatterSettingsRequest = exports.SaveFormatterSettingsResponse = exports.SaveFormatterSettingsRequest = exports.DebugSettings = exports.SaveDebuggerSettingsResponse = void 0;
class OracleEventNames {
}
exports.OracleEventNames = OracleEventNames;
OracleEventNames.scriptExecutionStarted = "script/executionStarted";
OracleEventNames.scriptExecutionFinished = "script/executionFinished";
OracleEventNames.loginScriptExecutionStarted = "loginScript/executionStarted";
OracleEventNames.loginScriptExecutionFinished = "loginScript/executionFinished";
OracleEventNames.nestedScriptExecutionStarted = "nestedScript/executionStarted";
OracleEventNames.nestedScriptExecutionFinished = "nestedScript/executionFinished";
OracleEventNames.scriptExecutionMessage = "script/executionMessage";
OracleEventNames.scriptExecutionData = "script/executionData";
OracleEventNames.scriptExecutionDispose = "script/executionDispose";
OracleEventNames.scriptExecutionClear = "script/executionClear";
OracleEventNames.scriptExecutionCancelled = "script/executionCancelled";
OracleEventNames.saveQueryResultFinishedEvent = "script/saveQueryResultFinished";
OracleEventNames.scriptSaveQueryResultCancelRequest = "script/saveQueryResultCancel";
OracleEventNames.scriptUserInputRequired = "script/userinputRequired";
OracleEventNames.scriptCodeObjectOutput = "script/codeObjectOutput";
OracleEventNames.scriptExecutionReset = "script/executionReset";
OracleEventNames.scriptExecutionBatchedMessage = "script/executionBatchedMessage";
class MessageName {
}
exports.MessageName = MessageName;
MessageName.themeChanged = "ThemeChanged";
MessageName.receiverReady = "ReceiverReady";
MessageName.getLocaleResources = "GetLocaleResources";
MessageName.getDataBatch = "GetDataBatch";
MessageName.saveCSVData = "SaveCSVData";
MessageName.cancelQuery = "CancelQuery";
MessageName.logData = "LogData";
MessageName.odtConfigChanged = "ODTConfigChanged";
MessageName.saveAllRequest = "SaveAllRequestMessage";
MessageName.saveAllResponse = "SaveAllResponseMessage";
MessageName.consumeUserInputRequest = "script/consumeUserInputRequest";
MessageName.getConfigCSVOptionsRequest = "resultSet/getConfigCSVOptionsRequest";
MessageName.getConfigCSVOptionsResponse = "resultSet/getConfigCSVOptionsResponse";
MessageName.saveProfileRequest = "connection/saveProfileRequest";
MessageName.saveProfileResponse = "connection/saveProfileResponse";
MessageName.validateProfileNameResponse = "connection/validateProfileNameResponse";
MessageName.validateProfileNameRequest = "connection/validateProfileNameRequest";
MessageName.getConfigFileLocationsResponse = "connection/getConfigFileLocationsResponse";
MessageName.getConfigFileLocationsRequest = "connection/getConfigFileLocationsRequest";
MessageName.getProfileResponse = "connection/getProfileResponse";
MessageName.getProfileRequest = "connection/getProfileRequest";
MessageName.getTNSNamesRequest = "connection/getTNSNamesRequest";
MessageName.getTNSNamesResponse = "connection/getTNSNamesResponse";
MessageName.getAllProfieNamesRequest = "connection/getAllProfieNamesRequest";
MessageName.getAllProfieNamesResponse = "connection/getAllProfieNamesResponse";
MessageName.connectionHelpRequest = "connection/helpRequest";
MessageName.connectionHelpResponse = "connection/helpResponse";
MessageName.browseRequest = "util/browseRequest";
MessageName.browseReponse = "util/browseReponse";
MessageName.browseReponseForDownloadCredentialPage = "util/browseReponseForDownloadCredentialPage";
MessageName.updateStatusBarEvent = "util/updateStatusBarEvent";
MessageName.updateToolbarEvent = "util/updateToolbarEvent";
MessageName.getSchemasRequest = "connection/getSchemasRequest";
MessageName.getSchemasResponse = "connection/getSchemasResponse";
MessageName.clearRequest = "script/clearRequest";
MessageName.browseLoginRequest = "util/browseLoginRequest";
MessageName.validationRequest = "script/validationRequest";
MessageName.validationResponse = "script/validationResponse";
MessageName.testCommandResponse = "testCommandresponse";
MessageName.getUserPreferencesRequest = "connection/getUserPreferencesRequest";
MessageName.toolbarClearClicked = "toolbar/clearClicked";
MessageName.toolbarCancelClicked = "toolbar/cancelClicked";
MessageName.toolbarUpdateEvent = "toolbar/updateToolbar";
MessageName.toolbarEvent = "toolbarEvent";
MessageName.acknowledgeMessageRequest = "script/acknowledgeMessageRequest";
MessageName.acknowledgeMessageResponse = "script/acknowledgeMessageResponse";
MessageName.ociCompartmentRequestMessage = "oci/compartmentRequestMessage";
MessageName.ociCompartmentResponseMessage = "oci/compartmentResponseMessage";
MessageName.ociRegionResponseMessage = "oci/regionResponseMessage";
MessageName.ociRegionRequestMessage = "oci/regionRequestMessage";
MessageName.ociUpdateRegionRequestMessage = "oci/updateRegionRequestMessage";
MessageName.ociUpdateCompartmentAndRegionMessage = "oci/updateOCICompartmentAndRegionMessage";
MessageName.ociUpdateCompartmentAndRegionResponse = "oci/updateOCICompartmentAndRegionResponse";
MessageName.ociUpdateOCITreeExplorerMessage = "oci/updateOCITreeExplorerMessage";
MessageName.ociUpdateAdminstratorPswd = "oci/UpdateAdminstratorPswdMessage";
MessageName.adbChangePswdResponse = "oci/adbChangePswdResponse";
MessageName.adbDownloadWalletFileRequestMessage = "oci/downloadWalletFileRequestMessage";
MessageName.adbDownloadWalletFileResponseMessage = "oci/downloadWalletFileResponseMessage";
MessageName.adbReplaceWalletFileRequestMessage = "oci/replaceWalletFileRequestMessage";
MessageName.initializeCreateNewAutonomousDBPageRequestMessage = "oci/initializeCreateNewAutonomousDBPageRequestMessage";
MessageName.initializeCreateNewAutonomousDBPageResponseMessage = "oci/initializeCreateNewAutonomousDBPageResponseMessage";
MessageName.autonomousContainerDBRequestMessage = "oci/autonomousContainerDBRequestMessage";
MessageName.autonomousContainerDBResponseMessage = "oci/autonomousContainerDBResponseMessage";
MessageName.createNewAutonomousDBResponseMessage = "oci/createNewAutonomousDBResponseMessage";
MessageName.ociCreateNewADWDBRequestMessage = "oci/createNewADWDBRequestMessage";
MessageName.ociCreateNewADWDBResponseMessage = "oci/createNewADWDBResponseMessage";
MessageName.ociCreateNewJSONDBRequestMessage = "oci/createNewJSONDBRequestMessage";
MessageName.ociCreateNewJSONDBResponseMessage = "oci/createNewJSONDBResponseMessage";
MessageName.ociCreateNewATPDBRequestMessage = "oci/createNewATPDBRequestMessage";
MessageName.ociCreateNewATPDBResponseMessage = "oci/createNewATPDBResponseMessage";
MessageName.updateAutonomousDBNameRequestMessage = "oci/updateAutonomousDBNameRequestMessage";
MessageName.ociLaunchChangeadminPswdDialogRequestMessage = "oci/launchChangeadminPasswordDialogRequestMessage";
MessageName.ociLaunchChangeadminPswdDialogResponseMessage = "oci/launchChangeadminPasswordDialogResponseMessage";
MessageName.adbDownloadWalletFilePathRequestMessage = "oci/downloadWalletFilePathRequestMessage";
MessageName.adbDownloadWalletFilePathResponseMessage = "oci/downloadWalletFilePathResponseMessage";
MessageName.usedADBNamesUpdatedMessage = "oci/usedADBNamesUpdatedMessage";
MessageName.getCompilerSettingsRequest = "getCompilerSettingsRequest";
MessageName.getCompilerSettingsResponse = "getCompilerSettingsResponse";
MessageName.saveCompilerSettingsRequest = "saveCompilerSettingsRequest";
MessageName.saveCompilerSettingsResponse = "saveCompilerSettingsResponse";
MessageName.getDebuggerSettingsRequest = "getDebuggerSettingsRequest";
MessageName.getDebuggerSettingsResponse = "getDebuggerSettingsResponse";
MessageName.saveDebuggerSettingsRequest = "saveDebuggerSettingsRequest";
MessageName.saveDebuggerSettingsResponse = "saveDebuggerSettingsResponse";
MessageName.getFormatterSettingsRequest = "getFormatterSettingsRequest";
MessageName.getFormatterSettingsResponse = "getFormatterSettingsResponse";
MessageName.saveFormatterSettingsRequest = "saveFormatterSettingsRequest";
MessageName.saveFormatterSettingsResponse = "saveFormatterSettingsResponse";
MessageName.formatPreviewTextRequest = "formatPreviewTextRequest";
MessageName.formatPreviewTextResponse = "formatPreviewtTextResponse";
MessageName.importFormatSettingsRequest = "importFormatSettingsRequest";
MessageName.exportFormatSettingsRequest = "exportFormatSettingsRequest";
MessageName.importFormatSettingsResponse = "importFormatSettingsResponse";
MessageName.exportFormatSettingsResponse = "exportFormatSettingsResponse";
MessageName.ociGetConnectionstringsResponseMessage = "oci/GetConnectionstringsResponseMessage";
MessageName.ociGetConnectionstringsRequestMessage = "oci/GetConnectionstringsRequestMessage";
MessageName.ociGetPublicIPAddressRequesttMessage = "oci/GetPublicIPAddressRequesttMessage";
MessageName.ociGetPublicIPAddressResponseMessage = "oci/GetPublicIPAddressResponseMessage";
MessageName.ociUpdateNetworkAccessTypeRequetMessage = "oci/ociUpdateNetworkAccessTypeRequestMessage";
MessageName.ociUpdateNetworkAccessTypeResponseMessage = "oci/ociUpdateNetworkAccessTypeResponseMessage";
MessageName.initializeNetworkAccessTypeRequestMessage = "oci/initializeNetworkAccessTypeRequestMessage";
MessageName.initializeNetworkAccessTypeResponseMessage = "oci/initializeNetworkAccessTypeResponseMessage";
MessageName.ociVCNListRequestMessage = "oci/VCNListRequestMessage";
MessageName.ociVCNListResponseMessage = "oci/VCNListResponseMessage";
MessageName.ociEditMutualAuthenticationRequestMessage = "oci/EditMutualAuthenticationRequestMessage";
MessageName.ociEditMutualAuthenticationResponseMessage = "oci/EditMutualAuthenticationResponseMessage";
MessageName.initializeMutualAuthenticationTypeRequestMessage = "oci/initializeMutualAuthenticationTypeRequestMessage";
MessageName.initializeMutualAuthenticationTypeResponseMessage = "oci/initializeMutualAuthenticationTypeResponseMessage";
class CancelScriptExecutionParams {
    static displayString(self) {
        return `Uri = ${self.ownerUri};ExecutionId = ${self.executionId};`;
    }
}
exports.CancelScriptExecutionParams = CancelScriptExecutionParams;
class CancelScriptExecutionResult {
}
exports.CancelScriptExecutionResult = CancelScriptExecutionResult;
class ColumnInfo {
    constructor(ordinal, name) {
        this.ordinal = ordinal;
        this.name = name;
        this.templateField = "cellTemplate";
        this.headerTemplateField = "headerTemplate";
        this.columnNameInternalField = `${this.name}:${this.ordinal}`;
        this.headerText = name;
    }
    get readOnly() {
        if (this.className && this.className.search("oj-read-only") > -1) {
            return true;
        }
        else {
            return false;
        }
    }
    set readOnly(v) {
        if (v) {
            this.className = "oj-read-only";
        }
        else {
            this.className = "";
        }
    }
    get className() {
        return this.classNameField;
    }
    set className(v) {
        this.classNameField = v;
    }
    get columnNameInternal() {
        return this.columnNameInternalField;
    }
    set columnNameInternal(v) {
        this.columnNameInternalField = v;
    }
    get headerText() {
        return this.headerTextField;
    }
    set headerText(val) {
        this.headerTextField = val;
    }
    get template() {
        return this.templateField;
    }
    set template(v) {
        this.templateField = v;
    }
    get headerTemplate() {
        return this.headerTemplateField;
    }
    set headerTemplate(v) {
        this.headerTemplateField = v;
    }
    get field() {
        return this.columnNameInternalField;
    }
}
exports.ColumnInfo = ColumnInfo;
ColumnInfo.selectedColumnName = "select";
ColumnInfo.rowNumColumnName = "RowNum";
class EchoRequest {
}
exports.EchoRequest = EchoRequest;
class ScriptExecuteParams {
    static displayString(self) {
        return `Uri = ${self.ownerUri};executionMode = ${self.executionMode};ExecutionId= ${self.executionId}`;
    }
}
exports.ScriptExecuteParams = ScriptExecuteParams;
class ScriptExecuteResult {
}
exports.ScriptExecuteResult = ScriptExecuteResult;
var ExecutionMode;
(function (ExecutionMode) {
    ExecutionMode[ExecutionMode["None"] = 0] = "None";
    ExecutionMode[ExecutionMode["File"] = 1] = "File";
    ExecutionMode[ExecutionMode["Selection"] = 2] = "Selection";
})(ExecutionMode = exports.ExecutionMode || (exports.ExecutionMode = {}));
class ScriptExecutionMessageEvent {
    static displayString(self) {
        return `Uri = ${self.ownerUri};QueryId = ${self.queryId};messageType= ${self.messageType} MessageId=${self.messageId}`;
    }
}
exports.ScriptExecutionMessageEvent = ScriptExecutionMessageEvent;
var ScriptExecutionMessageType;
(function (ScriptExecutionMessageType) {
    ScriptExecutionMessageType[ScriptExecutionMessageType["Message"] = 0] = "Message";
    ScriptExecutionMessageType[ScriptExecutionMessageType["Error"] = 1] = "Error";
    ScriptExecutionMessageType[ScriptExecutionMessageType["Warning"] = 2] = "Warning";
    ScriptExecutionMessageType[ScriptExecutionMessageType["Cancel"] = 3] = "Cancel";
})(ScriptExecutionMessageType = exports.ScriptExecutionMessageType || (exports.ScriptExecutionMessageType = {}));
class ScriptExecutionBatchedMessageEventParams {
    static displayString(self) {
        const count = self.messageList ? self.messageList.length : "";
        return `Uri = ${self.ownerUri};QueryId = ${self.executionId};messageType=BatchOf${count} MessageId=${self.messageId}`;
    }
}
exports.ScriptExecutionBatchedMessageEventParams = ScriptExecutionBatchedMessageEventParams;
class ScriptExecutionDataEvent {
    static displayString(self) {
        return `Uri = ${self.ownerUri};QueryId = ${self.queryId};QueryResultId = ${self.queryResultId}`;
    }
}
exports.ScriptExecutionDataEvent = ScriptExecutionDataEvent;
class ThemeChangedEvent {
    static displayString(self) {
        return `Uri = ${self.ownerUri};ThemeName = ${self.themeName}`;
    }
}
exports.ThemeChangedEvent = ThemeChangedEvent;
class ReceiverReadyEvent {
}
exports.ReceiverReadyEvent = ReceiverReadyEvent;
class QueryData {
    static displayString(self) {
        return `QueryId= ${self.queryId};HasMoreRows= ${self.hasMoreRows};BatchId = ${self.batchId}`;
    }
}
exports.QueryData = QueryData;
class ScriptExecutionStartedEvent {
    static displayString(self) {
        return `Uri = ${self.ownerUri}`;
    }
}
exports.ScriptExecutionStartedEvent = ScriptExecutionStartedEvent;
class ScriptExecutionFinishedEvent {
    static displayString(self) {
        return `Uri = ${self.ownerUri};executionSummary = ${self.executionSummary}`;
    }
}
exports.ScriptExecutionFinishedEvent = ScriptExecutionFinishedEvent;
class LoginScriptExecutionStartedEventParams {
}
exports.LoginScriptExecutionStartedEventParams = LoginScriptExecutionStartedEventParams;
class LoginScriptExecutionFinishedEventParams {
}
exports.LoginScriptExecutionFinishedEventParams = LoginScriptExecutionFinishedEventParams;
class NestedScriptExecutionStartedEventParams {
}
exports.NestedScriptExecutionStartedEventParams = NestedScriptExecutionStartedEventParams;
class NestedScriptExecutionFinishedEventParams {
}
exports.NestedScriptExecutionFinishedEventParams = NestedScriptExecutionFinishedEventParams;
class Routes {
}
exports.Routes = Routes;
Routes.root = "/";
class MessageBase {
}
exports.MessageBase = MessageBase;
class ScriptExecutionDataBatchRequest {
    static displayString(self) {
        return `Uri = ${self.ownerUri};QueryId = ${self.queryId};QueryResultId = ${self.queryResultId};BatchId = ${self.batchId};ExecutionId = ${self.executionId}`;
    }
}
exports.ScriptExecutionDataBatchRequest = ScriptExecutionDataBatchRequest;
class ScriptExecutionDataBatchResponse {
}
exports.ScriptExecutionDataBatchResponse = ScriptExecutionDataBatchResponse;
class ScriptExecutionDisposeEventParams {
    static displayString(self) {
        return `Uri = ${self.ownerUri}`;
    }
}
exports.ScriptExecutionDisposeEventParams = ScriptExecutionDisposeEventParams;
class ScriptExecutionResetEventParams {
}
exports.ScriptExecutionResetEventParams = ScriptExecutionResetEventParams;
class LocalizedResourceRequest {
}
exports.LocalizedResourceRequest = LocalizedResourceRequest;
class ScriptExecutionCancelledEventParams {
    static displayString(self) {
        return `Uri = ${self.ownerUri};ExecutionId = ${self.executionId}`;
    }
}
exports.ScriptExecutionCancelledEventParams = ScriptExecutionCancelledEventParams;
var QueryTpe;
(function (QueryTpe) {
    QueryTpe[QueryTpe["None"] = 1] = "None";
    QueryTpe[QueryTpe["SqlQuery"] = 2] = "SqlQuery";
    QueryTpe[QueryTpe["Describe"] = 3] = "Describe";
})(QueryTpe = exports.QueryTpe || (exports.QueryTpe = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["None"] = 0] = "None";
    LogLevel[LogLevel["Information"] = 1] = "Information";
    LogLevel[LogLevel["Warning"] = 2] = "Warning";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var LogSource;
(function (LogSource) {
    LogSource[LogSource["None"] = 0] = "None";
    LogSource[LogSource["Extension"] = 1] = "Extension";
    LogSource[LogSource["ResultWindow"] = 2] = "ResultWindow";
})(LogSource = exports.LogSource || (exports.LogSource = {}));
class ODTConfigurationChangedEvent {
    static displayString(self) {
        return `Uri = ${self.ownerUri};Configuration Changed ! ${self.logLevel}  ${self.loggingEnabled}`;
    }
}
exports.ODTConfigurationChangedEvent = ODTConfigurationChangedEvent;
class LogMessage {
    constructor() {
        this.source = LogSource.ResultWindow;
    }
}
exports.LogMessage = LogMessage;
class SaveQueryResultRequestParams {
    static displayString(self) {
        return `Uri = ${self.ownerUri};ExecutionId = ${self.executionId}`;
    }
}
exports.SaveQueryResultRequestParams = SaveQueryResultRequestParams;
var SaveType;
(function (SaveType) {
    SaveType[SaveType["None"] = 0] = "None";
    SaveType[SaveType["All"] = 1] = "All";
    SaveType[SaveType["Range"] = 2] = "Range";
    SaveType[SaveType["Indexes"] = 3] = "Indexes";
})(SaveType = exports.SaveType || (exports.SaveType = {}));
class SaveQueryResultResponse {
}
exports.SaveQueryResultResponse = SaveQueryResultResponse;
class OracleError {
}
exports.OracleError = OracleError;
class SaveQueryResultFinishedEventParams {
    constructor() {
        this.saveDataToFile = true;
    }
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId}`;
    }
}
exports.SaveQueryResultFinishedEventParams = SaveQueryResultFinishedEventParams;
class SaveQueryResultCancelRequestParams {
    static displayString(self) {
        return `Uri = ${self.ownerUri};ExecutionId = ${self.executionId}`;
    }
}
exports.SaveQueryResultCancelRequestParams = SaveQueryResultCancelRequestParams;
class SaveQueryResultCancelResponse {
}
exports.SaveQueryResultCancelResponse = SaveQueryResultCancelResponse;
class ConsumeUserInputResponse {
}
exports.ConsumeUserInputResponse = ConsumeUserInputResponse;
var ConsumeUserInputResponseMessageType;
(function (ConsumeUserInputResponseMessageType) {
    ConsumeUserInputResponseMessageType[ConsumeUserInputResponseMessageType["Success"] = 1] = "Success";
    ConsumeUserInputResponseMessageType[ConsumeUserInputResponseMessageType["Error"] = 0] = "Error";
})(ConsumeUserInputResponseMessageType = exports.ConsumeUserInputResponseMessageType || (exports.ConsumeUserInputResponseMessageType = {}));
var SaveQueryResultMessageType;
(function (SaveQueryResultMessageType) {
    SaveQueryResultMessageType[SaveQueryResultMessageType["Message"] = 0] = "Message";
    SaveQueryResultMessageType[SaveQueryResultMessageType["Error"] = 1] = "Error";
    SaveQueryResultMessageType[SaveQueryResultMessageType["UserCancel"] = 2] = "UserCancel";
})(SaveQueryResultMessageType = exports.SaveQueryResultMessageType || (exports.SaveQueryResultMessageType = {}));
var DataFormat;
(function (DataFormat) {
    DataFormat[DataFormat["None"] = 0] = "None";
    DataFormat[DataFormat["CSV"] = 1] = "CSV";
    DataFormat[DataFormat["JSON"] = 2] = "JSON";
})(DataFormat = exports.DataFormat || (exports.DataFormat = {}));
class UserInputParams {
    static displayString(self) {
        return `UserInputParams Uri = ${self.ownerUri}`;
    }
}
exports.UserInputParams = UserInputParams;
var OperationName;
(function (OperationName) {
    OperationName[OperationName["None"] = 0] = "None";
    OperationName[OperationName["RunCodeObject"] = 1] = "RunCodeObject";
    OperationName[OperationName["BindVariableInput"] = 2] = "BindVariableInput";
    OperationName[OperationName["SubstituionVariableInput"] = 3] = "SubstituionVariableInput";
    OperationName[OperationName["Password"] = 4] = "Password";
    OperationName[OperationName["UserName"] = 5] = "UserName";
    OperationName[OperationName["UnsupportedCommandPrompt"] = 6] = "UnsupportedCommandPrompt";
    OperationName[OperationName["PromptConnectionReconnect"] = 7] = "PromptConnectionReconnect";
})(OperationName = exports.OperationName || (exports.OperationName = {}));
class InputVariable {
}
exports.InputVariable = InputVariable;
class Direction {
}
exports.Direction = Direction;
Direction.None = "NONE";
Direction.IN = "IN";
Direction.OUT = "OUT";
Direction.IN_OUT = "IN/OUT";
Direction.RETURN_VALUE = "RETURN VALUE";
var DataSourceType;
(function (DataSourceType) {
    DataSourceType[DataSourceType["None"] = 0] = "None";
    DataSourceType[DataSourceType["Message"] = 1] = "Message";
    DataSourceType[DataSourceType["QueryResult"] = 2] = "QueryResult";
    DataSourceType[DataSourceType["CodeObjectOutput"] = 3] = "CodeObjectOutput";
})(DataSourceType = exports.DataSourceType || (exports.DataSourceType = {}));
var UIDisplayMode;
(function (UIDisplayMode) {
    UIDisplayMode[UIDisplayMode["None"] = 0] = "None";
    UIDisplayMode[UIDisplayMode["ExecuteScript"] = 1] = "ExecuteScript";
    UIDisplayMode[UIDisplayMode["ShowData"] = 2] = "ShowData";
    UIDisplayMode[UIDisplayMode["RunCodeObject"] = 3] = "RunCodeObject";
    UIDisplayMode[UIDisplayMode["ExecuteSQLStatement"] = 4] = "ExecuteSQLStatement";
    UIDisplayMode[UIDisplayMode["ConnectionManagement"] = 5] = "ConnectionManagement";
    UIDisplayMode[UIDisplayMode["OCICompartment"] = 6] = "OCICompartment";
    UIDisplayMode[UIDisplayMode["AutonomousDatabaseConnectionManagement"] = 7] = "AutonomousDatabaseConnectionManagement";
    UIDisplayMode[UIDisplayMode["DownloadCredentialsFile"] = 8] = "DownloadCredentialsFile";
    UIDisplayMode[UIDisplayMode["CreateAutonomousDatabase"] = 9] = "CreateAutonomousDatabase";
    UIDisplayMode[UIDisplayMode["OCIRegion"] = 10] = "OCIRegion";
    UIDisplayMode[UIDisplayMode["ChangeADBPassword"] = 11] = "ChangeADBPassword";
    UIDisplayMode[UIDisplayMode["CompilerSettings"] = 12] = "CompilerSettings";
    UIDisplayMode[UIDisplayMode["getADBConnectionStrings"] = 13] = "getADBConnectionStrings";
    UIDisplayMode[UIDisplayMode["updateNetworkAccessUI"] = 14] = "updateNetworkAccessUI";
    UIDisplayMode[UIDisplayMode["formatterSettings"] = 15] = "formatterSettings";
    UIDisplayMode[UIDisplayMode["editMutualAuthentication"] = 16] = "editMutualAuthentication";
    UIDisplayMode[UIDisplayMode["configureWalletlessConnectivityAndNetworkAccess"] = 17] = "configureWalletlessConnectivityAndNetworkAccess";
})(UIDisplayMode = exports.UIDisplayMode || (exports.UIDisplayMode = {}));
var QueryType;
(function (QueryType) {
    QueryType[QueryType["Select"] = 0] = "Select";
    QueryType[QueryType["Insert"] = 1] = "Insert";
    QueryType[QueryType["Update"] = 2] = "Update";
    QueryType[QueryType["Delete"] = 3] = "Delete";
    QueryType[QueryType["At"] = 4] = "At";
    QueryType[QueryType["PlsqlBlock"] = 5] = "PlsqlBlock";
    QueryType[QueryType["AnonymousPlSqlBlock"] = 6] = "AnonymousPlSqlBlock";
    QueryType[QueryType["Comment"] = 7] = "Comment";
    QueryType[QueryType["Desc"] = 8] = "Desc";
    QueryType[QueryType["Other"] = 9] = "Other";
    QueryType[QueryType["RunCodeObject"] = 10] = "RunCodeObject";
    QueryType[QueryType["ShowData"] = 11] = "ShowData";
    QueryType[QueryType["None"] = 100000] = "None";
})(QueryType = exports.QueryType || (exports.QueryType = {}));
var OutputTarget;
(function (OutputTarget) {
    OutputTarget[OutputTarget["None"] = 0] = "None";
    OutputTarget[OutputTarget["FullScreen"] = 1] = "FullScreen";
    OutputTarget[OutputTarget["OutputPane"] = 2] = "OutputPane";
})(OutputTarget = exports.OutputTarget || (exports.OutputTarget = {}));
class GetProfileRequest {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetProfileRequest = GetProfileRequest;
class GetProfileResponse {
    static create(message) {
        const response = new GetProfileResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetProfileResponse = GetProfileResponse;
class GetConfigFileLocationsRequest {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetConfigFileLocationsRequest = GetConfigFileLocationsRequest;
class GetTNSNamesRequest {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetTNSNamesRequest = GetTNSNamesRequest;
class GetTNSNamesResponse {
    static create(message) {
        const response = new GetTNSNamesResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetTNSNamesResponse = GetTNSNamesResponse;
class BrowseRequest {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.BrowseRequest = BrowseRequest;
class BrowseResponse {
    static create(message) {
        const response = new BrowseResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.BrowseResponse = BrowseResponse;
class GetAllProfieNamesRequest {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetAllProfieNamesRequest = GetAllProfieNamesRequest;
class GetAllProfieNamesResponse {
    static create(message) {
        const response = new GetAllProfieNamesResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetAllProfieNamesResponse = GetAllProfieNamesResponse;
class GetConfigFileLocationsResponse {
    static create(message) {
        const response = new GetConfigFileLocationsResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetConfigFileLocationsResponse = GetConfigFileLocationsResponse;
class ValidateProfileNameRequest {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.ValidateProfileNameRequest = ValidateProfileNameRequest;
class ValidateProfileNameResponse {
    static create(message) {
        const response = new ValidateProfileNameResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.ValidateProfileNameResponse = ValidateProfileNameResponse;
class SaveProfileRequest {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.SaveProfileRequest = SaveProfileRequest;
var SaveProfileType;
(function (SaveProfileType) {
    SaveProfileType[SaveProfileType["create"] = 1] = "create";
    SaveProfileType[SaveProfileType["rename"] = 2] = "rename";
    SaveProfileType[SaveProfileType["update"] = 3] = "update";
    SaveProfileType[SaveProfileType["renameAndUpdate"] = 4] = "renameAndUpdate";
    SaveProfileType[SaveProfileType["setDefConnection"] = 5] = "setDefConnection";
})(SaveProfileType = exports.SaveProfileType || (exports.SaveProfileType = {}));
class SaveProfileResponse {
    static create(message) {
        const response = new SaveProfileResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
}
exports.SaveProfileResponse = SaveProfileResponse;
class GetSchemasRequest {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetSchemasRequest = GetSchemasRequest;
class GetSchemasResponse {
    static create(message) {
        const response = new GetSchemasResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetSchemasResponse = GetSchemasResponse;
class GetUserPreferencesRequest {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetUserPreferencesRequest = GetUserPreferencesRequest;
class GetUserPreferencesResponse {
    static create(message) {
        const response = new GetUserPreferencesResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetUserPreferencesResponse = GetUserPreferencesResponse;
class UserPreferences {
    constructor(connectionProperties, resultsWindowProperties, bookmarkProperties, compilerProperties) {
        this.connectionProperties = connectionProperties;
        this.resultsWindowProperties = resultsWindowProperties;
        this.bookmarkProperties = bookmarkProperties;
        this.compilerProperties = compilerProperties;
        if (!this.connectionProperties) {
            this.connectionProperties = new ConnectionProperties();
        }
        if (!this.resultsWindowProperties) {
            this.resultsWindowProperties = new ResultsWindowProperties();
        }
        if (!this.bookmarkProperties) {
            this.bookmarkProperties = new BookmarkProperties();
        }
        if (!this.compilerProperties)
            this.compilerProperties = new CompilerProperties();
    }
}
exports.UserPreferences = UserPreferences;
class BookmarkProperties {
    constructor() {
        this.lastFolder = undefined;
    }
}
exports.BookmarkProperties = BookmarkProperties;
class CompilerProperties {
    constructor(lastConfiguration) {
        this.lastConfiguration = lastConfiguration;
    }
}
exports.CompilerProperties = CompilerProperties;
class ConnectionProperties {
    constructor(connectionType, tnsAdminLocation, tnsAlias, useWalletFile, walletFileLocation, databaseHostName, databasePortNumber, databaseServiceName, advancedConnectionString, odpnetConnectionString, loginScript) {
        this.connectionType = connectionType;
        this.tnsAdminLocation = tnsAdminLocation;
        this.tnsAlias = tnsAlias;
        this.useWalletFile = useWalletFile;
        this.walletFileLocation = walletFileLocation;
        this.databaseHostName = databaseHostName;
        this.databasePortNumber = databasePortNumber;
        this.databaseServiceName = databaseServiceName;
        this.advancedConnectionString = advancedConnectionString;
        this.odpnetConnectionString = odpnetConnectionString;
        this.loginScript = loginScript;
    }
}
exports.ConnectionProperties = ConnectionProperties;
class ResultsWindowProperties {
    constructor(saveFormat) {
        this.saveFormat = saveFormat;
    }
}
exports.ResultsWindowProperties = ResultsWindowProperties;
class UpdateStatusBarEvent {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.UpdateStatusBarEvent = UpdateStatusBarEvent;
class UpdateToolbarEvent {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.UpdateToolbarEvent = UpdateToolbarEvent;
class ToolbarOptions {
}
exports.ToolbarOptions = ToolbarOptions;
var ConnectionAuthenticationType;
(function (ConnectionAuthenticationType) {
    ConnectionAuthenticationType[ConnectionAuthenticationType["Admin"] = 1] = "Admin";
    ConnectionAuthenticationType[ConnectionAuthenticationType["NonAdmin"] = 2] = "NonAdmin";
})(ConnectionAuthenticationType = exports.ConnectionAuthenticationType || (exports.ConnectionAuthenticationType = {}));
var ConnectionType;
(function (ConnectionType) {
    ConnectionType[ConnectionType["TNS"] = 1] = "TNS";
    ConnectionType[ConnectionType["DataSource"] = 2] = "DataSource";
    ConnectionType[ConnectionType["Advanced"] = 3] = "Advanced";
    ConnectionType[ConnectionType["ODPConnectionString"] = 4] = "ODPConnectionString";
})(ConnectionType = exports.ConnectionType || (exports.ConnectionType = {}));
class ValidationRequestParams {
    static createResponse(message) {
        const newObject = new ValidationRequestResponse();
        newObject.ownerUri = message.ownerUri;
        newObject.executionId = message.executionId;
        newObject.variable = message.variable;
        return newObject;
    }
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId}`;
    }
}
exports.ValidationRequestParams = ValidationRequestParams;
class ValidationRequestResponse {
}
exports.ValidationRequestResponse = ValidationRequestResponse;
class TestCommandResponse {
    constructor(command, html) {
        this.command = command;
        this.html = html;
    }
}
exports.TestCommandResponse = TestCommandResponse;
class ScriptExecutionClearEventParams {
    constructor() {
        this.previousExecutionList = [];
    }
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId}`;
    }
}
exports.ScriptExecutionClearEventParams = ScriptExecutionClearEventParams;
class ResourceIdentifier {
}
exports.ResourceIdentifier = ResourceIdentifier;
var ExecutionStatus;
(function (ExecutionStatus) {
    ExecutionStatus[ExecutionStatus["NotStarted"] = 0] = "NotStarted";
    ExecutionStatus[ExecutionStatus["Started"] = 1] = "Started";
    ExecutionStatus[ExecutionStatus["Finished"] = 2] = "Finished";
})(ExecutionStatus = exports.ExecutionStatus || (exports.ExecutionStatus = {}));
class ToolbarEvent {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.ToolbarEvent = ToolbarEvent;
class ScriptExecutionAcknowledgeMessageResponse {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} messageId=${self.messageId}`;
    }
}
exports.ScriptExecutionAcknowledgeMessageResponse = ScriptExecutionAcknowledgeMessageResponse;
class ScriptExecutionAcknowledgeMessageRequestParams {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} messageId=${self.messageId}`;
    }
}
exports.ScriptExecutionAcknowledgeMessageRequestParams = ScriptExecutionAcknowledgeMessageRequestParams;
class GetCompilerSettingsRequest {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetCompilerSettingsRequest = GetCompilerSettingsRequest;
class GetCompilerSettingsResponse {
}
exports.GetCompilerSettingsResponse = GetCompilerSettingsResponse;
class SaveCompilerSettingsRequest {
}
exports.SaveCompilerSettingsRequest = SaveCompilerSettingsRequest;
class SaveCompilerSettingsResponse {
}
exports.SaveCompilerSettingsResponse = SaveCompilerSettingsResponse;
var CompileConfig;
(function (CompileConfig) {
    CompileConfig[CompileConfig["Compile"] = 0] = "Compile";
    CompileConfig[CompileConfig["CompileDebug"] = 1] = "CompileDebug";
    CompileConfig[CompileConfig["AllConfigurations"] = 2] = "AllConfigurations";
})(CompileConfig = exports.CompileConfig || (exports.CompileConfig = {}));
class GetDebuggerSettingsRequest {
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetDebuggerSettingsRequest = GetDebuggerSettingsRequest;
class GetDebuggerSettingsResponse {
}
exports.GetDebuggerSettingsResponse = GetDebuggerSettingsResponse;
class SaveDebuggerSettingsRequest {
}
exports.SaveDebuggerSettingsRequest = SaveDebuggerSettingsRequest;
class SaveDebuggerSettingsResponse {
}
exports.SaveDebuggerSettingsResponse = SaveDebuggerSettingsResponse;
class DebugSettings {
}
exports.DebugSettings = DebugSettings;
class SaveFormatterSettingsRequest {
}
exports.SaveFormatterSettingsRequest = SaveFormatterSettingsRequest;
class SaveFormatterSettingsResponse {
}
exports.SaveFormatterSettingsResponse = SaveFormatterSettingsResponse;
class GetFormatterSettingsRequest {
}
exports.GetFormatterSettingsRequest = GetFormatterSettingsRequest;
class GetFormatterSettingsResponse {
}
exports.GetFormatterSettingsResponse = GetFormatterSettingsResponse;
class FormatPreviewTextRequest {
}
exports.FormatPreviewTextRequest = FormatPreviewTextRequest;
class FormatPreviewTextResponse {
    constructor(text) {
        this.formattedText = text;
    }
}
exports.FormatPreviewTextResponse = FormatPreviewTextResponse;
class ConnectionHelpRequest {
}
exports.ConnectionHelpRequest = ConnectionHelpRequest;
class ConnectionHelpResponse {
}
exports.ConnectionHelpResponse = ConnectionHelpResponse;
class ExportFormatSettingsRequest {
}
exports.ExportFormatSettingsRequest = ExportFormatSettingsRequest;
class ExportFormatSettingsResponse {
}
exports.ExportFormatSettingsResponse = ExportFormatSettingsResponse;
class ImportFormatSettingsRequest {
}
exports.ImportFormatSettingsRequest = ImportFormatSettingsRequest;
class ImportFormatSettingsResponse {
}
exports.ImportFormatSettingsResponse = ImportFormatSettingsResponse;
