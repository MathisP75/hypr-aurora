"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ociUpdateNetworkAccessTypeResponse = exports.ociUpdateNetworkAccessTypeRequest = exports.GetPublicIPAddressResponse = exports.GetPublicIPAddressRequest = exports.ociADBConnectionStringsRequest = exports.ociADBConnectionStringsResponse = exports.usedADBNamesUpdatedMessageData = exports.dbVersionsForWorkloadNode = exports.paidAndfreeSupportedDBVersionList = exports.adbDownloadWalletFilePathRequest = exports.adbDownloadWalletFilePathResponse = exports.adbLaunchChangeAdminPasswordDialogResponse = exports.adbLaunchChangeAdminPasswordDialogRequest = exports.adbChangePasswordResponse = exports.operationStatus = exports.updateAutonomousDBNameRequest = exports.adbProfileVSCodeSetting = exports.autonomousContainerDatabasesResponse = exports.autonomousContainerDBResponse = exports.autonomousContainerDBRequest = exports.createNewAutonomousDBRequest = exports.createNewAutonomousDBResponse = exports.initializeCreateNewAutonomousDBPageResponse = exports.initializeCreateNewAutonomousDBPageRequest = exports.adbDownloadWalletFileResponse = exports.adbReplaceWalletFileRequest = exports.adbDownloadWalletFileRequest = exports.updateNetworkAccessLaunchSource = exports.ADBworkLoadType = exports.ADBLicenseType = exports.TLSAuthenticationType = exports.WalletType = exports.FileExistsAction = exports.ociUpdateTreeExplorerRequest = exports.ociUpdateCompartmentAndRegionResponse = exports.CompartmentAndRegionUpdateType = exports.ociUpdateAdministratorPswdRequest = exports.ociUpdateCompartmentAndRegionRequest = exports.ociCompartmentResponse = exports.ociRegionResponse = exports.ociRegionRequest = exports.ociUpdateRegionRequest = exports.ADBDatabaseInfo = exports.ociCompartmentRequest = exports.DatabaseType = exports.CompartmentType = exports.ociCompartmentTreeNodeKey = exports.LifecycleState = exports.ADBDatabaseOperation = exports.OCISettingType = void 0;
exports.adbNetworkAccessData = exports.vcnDetail = exports.ociVCNResponse = exports.ociVCNRequest = exports.ociInitializeMTLSAuthenticationTypeRequest = exports.ociMTLSAuthenticationTypeRequest = exports.ociInitializeNetworkAccessTypeResponse = exports.ociInitializeNetworkAccessTypeRequest = void 0;
const autonomousDBUtils_1 = require("../explorer/autonomousDatabaseExplorer/autonomousDBUtils");
var OCISettingType;
(function (OCISettingType) {
    OCISettingType[OCISettingType["None"] = 0] = "None";
    OCISettingType[OCISettingType["Compartment"] = 1] = "Compartment";
    OCISettingType[OCISettingType["Region"] = 2] = "Region";
    OCISettingType[OCISettingType["CompartmentAndRegion"] = 3] = "CompartmentAndRegion";
    OCISettingType[OCISettingType["Tenancy"] = 4] = "Tenancy";
})(OCISettingType = exports.OCISettingType || (exports.OCISettingType = {}));
var ADBDatabaseOperation;
(function (ADBDatabaseOperation) {
    ADBDatabaseOperation[ADBDatabaseOperation["Start"] = 0] = "Start";
    ADBDatabaseOperation[ADBDatabaseOperation["Stop"] = 1] = "Stop";
    ADBDatabaseOperation[ADBDatabaseOperation["Terminate"] = 2] = "Terminate";
    ADBDatabaseOperation[ADBDatabaseOperation["createDatabase"] = 3] = "createDatabase";
    ADBDatabaseOperation[ADBDatabaseOperation["updateNetworkAccesType"] = 4] = "updateNetworkAccesType";
    ADBDatabaseOperation[ADBDatabaseOperation["updateMutualTLSAuthentication"] = 5] = "updateMutualTLSAuthentication";
})(ADBDatabaseOperation = exports.ADBDatabaseOperation || (exports.ADBDatabaseOperation = {}));
var LifecycleState;
(function (LifecycleState) {
    LifecycleState["Provisioning"] = "PROVISIONING";
    LifecycleState["Available"] = "AVAILABLE";
    LifecycleState["Stopping"] = "STOPPING";
    LifecycleState["Stopped"] = "STOPPED";
    LifecycleState["Starting"] = "STARTING";
    LifecycleState["Terminating"] = "TERMINATING";
    LifecycleState["Terminated"] = "TERMINATED";
    LifecycleState["Unavailable"] = "UNAVAILABLE";
    LifecycleState["RestoreInProgress"] = "RESTORE_IN_PROGRESS";
    LifecycleState["RestoreFailed"] = "RESTORE_FAILED";
    LifecycleState["BackupInProgress"] = "BACKUP_IN_PROGRESS";
    LifecycleState["ScaleInProgress"] = "SCALE_IN_PROGRESS";
    LifecycleState["AvailableNeedsAttention"] = "AVAILABLE_NEEDS_ATTENTION";
    LifecycleState["Updating"] = "UPDATING";
    LifecycleState["MaintenanceInProgress"] = "MAINTENANCE_IN_PROGRESS";
    LifecycleState["Restarting"] = "RESTARTING";
    LifecycleState["Recreating"] = "RECREATING";
    LifecycleState["RoleChangeInProgress"] = "ROLE_CHANGE_IN_PROGRESS";
    LifecycleState["Upgrading"] = "UPGRADING";
    LifecycleState["Inaccessible"] = "INACCESSIBLE";
    LifecycleState["UnknownValue"] = "UNKNOWN_VALUE";
})(LifecycleState = exports.LifecycleState || (exports.LifecycleState = {}));
var LifecycleState1;
(function (LifecycleState1) {
    LifecycleState1["Provisioning"] = "PROVISIONING";
    LifecycleState1["Available"] = "AVAILABLE";
    LifecycleState1["Stopping"] = "STOPPING";
    LifecycleState1["Stopped"] = "STOPPED";
    LifecycleState1["Starting"] = "STARTING";
    LifecycleState1["Terminating"] = "TERMINATING";
    LifecycleState1["Terminated"] = "TERMINATED";
    LifecycleState1["Unavailable"] = "UNAVAILABLE";
    LifecycleState1["RestoreInProgress"] = "RESTORE_IN_PROGRESS";
    LifecycleState1["RestoreFailed"] = "RESTORE_FAILED";
    LifecycleState1["BackupInProgress"] = "BACKUP_IN_PROGRESS";
    LifecycleState1["ScaleInProgress"] = "SCALE_IN_PROGRESS";
    LifecycleState1["AvailableNeedsAttention"] = "AVAILABLE_NEEDS_ATTENTION";
    LifecycleState1["Updating"] = "UPDATING";
    LifecycleState1["MaintenanceInProgress"] = "MAINTENANCE_IN_PROGRESS";
    LifecycleState1["Restarting"] = "RESTARTING";
    LifecycleState1["Recreating"] = "RECREATING";
    LifecycleState1["RoleChangeInProgress"] = "ROLE_CHANGE_IN_PROGRESS";
    LifecycleState1["Upgrading"] = "UPGRADING";
    LifecycleState1["UnknownValue"] = "UNKNOWN_VALUE";
})(LifecycleState1 || (LifecycleState1 = {}));
class ociCompartmentTreeNodeKey {
}
exports.ociCompartmentTreeNodeKey = ociCompartmentTreeNodeKey;
var CompartmentType;
(function (CompartmentType) {
    CompartmentType[CompartmentType["Tenancy"] = 1] = "Tenancy";
    CompartmentType[CompartmentType["Comapartment"] = 2] = "Comapartment";
})(CompartmentType = exports.CompartmentType || (exports.CompartmentType = {}));
var DatabaseType;
(function (DatabaseType) {
    DatabaseType[DatabaseType["None"] = 0] = "None";
    DatabaseType[DatabaseType["NormalDatabase"] = 1] = "NormalDatabase";
    DatabaseType[DatabaseType["AutonomousDatabase"] = 2] = "AutonomousDatabase";
})(DatabaseType = exports.DatabaseType || (exports.DatabaseType = {}));
class ociCompartmentRequest {
}
exports.ociCompartmentRequest = ociCompartmentRequest;
class ADBDatabaseInfo {
}
exports.ADBDatabaseInfo = ADBDatabaseInfo;
class ociUpdateRegionRequest {
}
exports.ociUpdateRegionRequest = ociUpdateRegionRequest;
class ociRegionRequest {
}
exports.ociRegionRequest = ociRegionRequest;
class ociRegionResponse {
    constructor() {
        this.regionList = new Array();
    }
}
exports.ociRegionResponse = ociRegionResponse;
class ociCompartmentResponse {
    constructor() {
        this.ancestorList = new Array();
    }
}
exports.ociCompartmentResponse = ociCompartmentResponse;
class ociUpdateCompartmentAndRegionRequest {
    constructor() {
        this.saveCompartmentToSetting = false;
    }
}
exports.ociUpdateCompartmentAndRegionRequest = ociUpdateCompartmentAndRegionRequest;
class ociUpdateAdministratorPswdRequest {
}
exports.ociUpdateAdministratorPswdRequest = ociUpdateAdministratorPswdRequest;
var CompartmentAndRegionUpdateType;
(function (CompartmentAndRegionUpdateType) {
    CompartmentAndRegionUpdateType[CompartmentAndRegionUpdateType["None"] = 0] = "None";
    CompartmentAndRegionUpdateType[CompartmentAndRegionUpdateType["Compartment"] = 1] = "Compartment";
    CompartmentAndRegionUpdateType[CompartmentAndRegionUpdateType["Region"] = 2] = "Region";
    CompartmentAndRegionUpdateType[CompartmentAndRegionUpdateType["CompartmentAndRegion"] = 3] = "CompartmentAndRegion";
})(CompartmentAndRegionUpdateType = exports.CompartmentAndRegionUpdateType || (exports.CompartmentAndRegionUpdateType = {}));
class ociUpdateCompartmentAndRegionResponse {
    static create(message) {
        const response = new ociUpdateCompartmentAndRegionResponse();
        response.executionId = message.executionId;
        response.windowUri = message.windowUri;
        response.selectedCompartmentFullname = message.selectedCompartmentFullname;
        response.selectedCompartmentName = message.selectedCompartmentName;
        response.selectedCompartmentID = message.selectedCompartmentID;
        response.selectedCompartmentFullnameForDisplay = autonomousDBUtils_1.AutonomousDBUtils.getRootAppenedFullCompartmentNameForDisplay(message.selectedCompartmentFullname);
        response.selectedCompartmentNameForDisplay = (message.selectedCompartmentName == message.selectedCompartmentFullname)
            ? autonomousDBUtils_1.AutonomousDBUtils.getRootAppendedDisplayName(message.selectedCompartmentName)
            : message.selectedCompartmentName;
        response.regionName = message.regionName;
        response.upateResult = CompartmentAndRegionUpdateType.None;
        return response;
    }
}
exports.ociUpdateCompartmentAndRegionResponse = ociUpdateCompartmentAndRegionResponse;
class ociUpdateTreeExplorerRequest {
    constructor() {
        this.saveCompartmentToSetting = false;
    }
}
exports.ociUpdateTreeExplorerRequest = ociUpdateTreeExplorerRequest;
var FileExistsAction;
(function (FileExistsAction) {
    FileExistsAction[FileExistsAction["None"] = 1] = "None";
    FileExistsAction[FileExistsAction["Replace"] = 2] = "Replace";
    FileExistsAction[FileExistsAction["Skip"] = 3] = "Skip";
})(FileExistsAction = exports.FileExistsAction || (exports.FileExistsAction = {}));
var WalletType;
(function (WalletType) {
    WalletType[WalletType["Instance"] = 1] = "Instance";
    WalletType[WalletType["Regional"] = 2] = "Regional";
})(WalletType = exports.WalletType || (exports.WalletType = {}));
var TLSAuthenticationType;
(function (TLSAuthenticationType) {
    TLSAuthenticationType[TLSAuthenticationType["MutualTLS"] = 1] = "MutualTLS";
    TLSAuthenticationType[TLSAuthenticationType["TLS"] = 2] = "TLS";
    TLSAuthenticationType[TLSAuthenticationType["None"] = 10] = "None";
})(TLSAuthenticationType = exports.TLSAuthenticationType || (exports.TLSAuthenticationType = {}));
var ADBLicenseType;
(function (ADBLicenseType) {
    ADBLicenseType[ADBLicenseType["NoLicense"] = 1] = "NoLicense";
    ADBLicenseType[ADBLicenseType["BringYourLicense"] = 2] = "BringYourLicense";
    ADBLicenseType[ADBLicenseType["SubscribeToNewLicense"] = 3] = "SubscribeToNewLicense";
})(ADBLicenseType = exports.ADBLicenseType || (exports.ADBLicenseType = {}));
var ADBworkLoadType;
(function (ADBworkLoadType) {
    ADBworkLoadType["OLTP"] = "OLTP";
    ADBworkLoadType["DW"] = "DW";
    ADBworkLoadType["AJD"] = "AJD";
    ADBworkLoadType["APEX"] = "APEX";
})(ADBworkLoadType = exports.ADBworkLoadType || (exports.ADBworkLoadType = {}));
var updateNetworkAccessLaunchSource;
(function (updateNetworkAccessLaunchSource) {
    updateNetworkAccessLaunchSource[updateNetworkAccessLaunchSource["UpdateNetworkAccessContextmenuForSharedDB"] = 1] = "UpdateNetworkAccessContextmenuForSharedDB";
    updateNetworkAccessLaunchSource[updateNetworkAccessLaunchSource["DedicatedInfrastructureDB"] = 2] = "DedicatedInfrastructureDB";
    updateNetworkAccessLaunchSource[updateNetworkAccessLaunchSource["SharedInfrastructureDB"] = 3] = "SharedInfrastructureDB";
    updateNetworkAccessLaunchSource[updateNetworkAccessLaunchSource["UpdateNetworkAccessContextmenuForDedicatedDB"] = 4] = "UpdateNetworkAccessContextmenuForDedicatedDB";
    updateNetworkAccessLaunchSource[updateNetworkAccessLaunchSource["UnknownValue"] = 10] = "UnknownValue";
})(updateNetworkAccessLaunchSource = exports.updateNetworkAccessLaunchSource || (exports.updateNetworkAccessLaunchSource = {}));
class adbDownloadWalletFileRequest {
    constructor() {
        this.walletType = WalletType.Instance;
    }
}
exports.adbDownloadWalletFileRequest = adbDownloadWalletFileRequest;
class adbReplaceWalletFileRequest {
    constructor() {
        this.existingFiles = new Array();
    }
}
exports.adbReplaceWalletFileRequest = adbReplaceWalletFileRequest;
class adbDownloadWalletFileResponse {
}
exports.adbDownloadWalletFileResponse = adbDownloadWalletFileResponse;
class initializeCreateNewAutonomousDBPageRequest {
}
exports.initializeCreateNewAutonomousDBPageRequest = initializeCreateNewAutonomousDBPageRequest;
class initializeCreateNewAutonomousDBPageResponse {
}
exports.initializeCreateNewAutonomousDBPageResponse = initializeCreateNewAutonomousDBPageResponse;
class createNewAutonomousDBResponse {
}
exports.createNewAutonomousDBResponse = createNewAutonomousDBResponse;
class createNewAutonomousDBRequest {
    constructor() {
        this.isAccessControlEnabled = false;
    }
}
exports.createNewAutonomousDBRequest = createNewAutonomousDBRequest;
class autonomousContainerDBRequest {
}
exports.autonomousContainerDBRequest = autonomousContainerDBRequest;
class autonomousContainerDBResponse {
}
exports.autonomousContainerDBResponse = autonomousContainerDBResponse;
class autonomousContainerDatabasesResponse {
    constructor() {
        this.adbContainerDatabases = new Array();
        this.errorMessage = null;
    }
}
exports.autonomousContainerDatabasesResponse = autonomousContainerDatabasesResponse;
class adbProfileVSCodeSetting {
}
exports.adbProfileVSCodeSetting = adbProfileVSCodeSetting;
class updateAutonomousDBNameRequest {
}
exports.updateAutonomousDBNameRequest = updateAutonomousDBNameRequest;
var operationStatus;
(function (operationStatus) {
    operationStatus[operationStatus["None"] = 0] = "None";
    operationStatus[operationStatus["InProgress"] = 1] = "InProgress";
    operationStatus[operationStatus["Success"] = 2] = "Success";
    operationStatus[operationStatus["Error"] = 3] = "Error";
})(operationStatus = exports.operationStatus || (exports.operationStatus = {}));
class adbChangePasswordResponse {
}
exports.adbChangePasswordResponse = adbChangePasswordResponse;
class adbLaunchChangeAdminPasswordDialogRequest {
}
exports.adbLaunchChangeAdminPasswordDialogRequest = adbLaunchChangeAdminPasswordDialogRequest;
class adbLaunchChangeAdminPasswordDialogResponse {
}
exports.adbLaunchChangeAdminPasswordDialogResponse = adbLaunchChangeAdminPasswordDialogResponse;
class adbDownloadWalletFilePathResponse {
}
exports.adbDownloadWalletFilePathResponse = adbDownloadWalletFilePathResponse;
class adbDownloadWalletFilePathRequest {
}
exports.adbDownloadWalletFilePathRequest = adbDownloadWalletFilePathRequest;
class paidAndfreeSupportedDBVersionList {
    constructor() {
        this.paidSupportedDBVersionList = new Array();
        this.freeSupportedDBVersionList = new Array();
    }
}
exports.paidAndfreeSupportedDBVersionList = paidAndfreeSupportedDBVersionList;
class dbVersionsForWorkloadNode {
    constructor() {
        this.dbVersionsForWorkloadNodeMap = new Map();
    }
    getJSON() {
        return JSON.stringify(Array.from(this.dbVersionsForWorkloadNodeMap.entries()));
    }
    static getMap(jsonText) {
        return new Map(JSON.parse(jsonText));
    }
    setMap(map) {
        this.dbVersionsForWorkloadNodeMap = map;
    }
    getPaidAndfreeSupportedDBVersionList(workloadKey) {
        let paidNfreeSupportedDBList = null;
        if (this.dbVersionsForWorkloadNodeMap.has(workloadKey)) {
            paidNfreeSupportedDBList = this.dbVersionsForWorkloadNodeMap.get(workloadKey);
        }
        return paidNfreeSupportedDBList;
    }
    getSupportedDBVersionList(workloadKey, serachFreeDB) {
        let dbVersionSupportedList = new Array();
        if (this.dbVersionsForWorkloadNodeMap.has(workloadKey)) {
            let paidNfreeSupportedDBList = this.dbVersionsForWorkloadNodeMap.get(workloadKey);
            if (serachFreeDB) {
                dbVersionSupportedList = paidNfreeSupportedDBList.freeSupportedDBVersionList;
            }
            else {
                dbVersionSupportedList = paidNfreeSupportedDBList.paidSupportedDBVersionList;
            }
        }
        return dbVersionSupportedList;
    }
    set(key, dbVersionInfo) {
        this.dbVersionsForWorkloadNodeMap.set(key, dbVersionInfo);
    }
}
exports.dbVersionsForWorkloadNode = dbVersionsForWorkloadNode;
class usedADBNamesUpdatedMessageData {
    constructor() {
        this.usedADBNames = {};
    }
}
exports.usedADBNamesUpdatedMessageData = usedADBNamesUpdatedMessageData;
class ociADBConnectionStringsResponse {
    constructor() {
        this.connectionProfiles = new Array();
        this.tlsAuthenticationType = TLSAuthenticationType.None;
        this.isDedicated = false;
    }
    getErrorMessage() {
        let errorMessage;
        return errorMessage;
    }
}
exports.ociADBConnectionStringsResponse = ociADBConnectionStringsResponse;
class ociADBConnectionStringsRequest {
}
exports.ociADBConnectionStringsRequest = ociADBConnectionStringsRequest;
class GetPublicIPAddressRequest {
}
exports.GetPublicIPAddressRequest = GetPublicIPAddressRequest;
class GetPublicIPAddressResponse {
}
exports.GetPublicIPAddressResponse = GetPublicIPAddressResponse;
class ociUpdateNetworkAccessTypeRequest {
    constructor() {
        this.whitelistedIps = [];
    }
}
exports.ociUpdateNetworkAccessTypeRequest = ociUpdateNetworkAccessTypeRequest;
class ociUpdateNetworkAccessTypeResponse {
    constructor() {
        this.whitelistedIps = [];
    }
}
exports.ociUpdateNetworkAccessTypeResponse = ociUpdateNetworkAccessTypeResponse;
class ociInitializeNetworkAccessTypeRequest {
}
exports.ociInitializeNetworkAccessTypeRequest = ociInitializeNetworkAccessTypeRequest;
class ociInitializeNetworkAccessTypeResponse {
    constructor() {
        this.whitelistedIps = [];
    }
}
exports.ociInitializeNetworkAccessTypeResponse = ociInitializeNetworkAccessTypeResponse;
class ociMTLSAuthenticationTypeRequest {
}
exports.ociMTLSAuthenticationTypeRequest = ociMTLSAuthenticationTypeRequest;
class ociInitializeMTLSAuthenticationTypeRequest {
}
exports.ociInitializeMTLSAuthenticationTypeRequest = ociInitializeMTLSAuthenticationTypeRequest;
class ociVCNRequest {
}
exports.ociVCNRequest = ociVCNRequest;
class ociVCNResponse {
    constructor() {
        this.vcnData = new Array();
    }
}
exports.ociVCNResponse = ociVCNResponse;
class vcnDetail {
}
exports.vcnDetail = vcnDetail;
class adbNetworkAccessData {
    constructor() {
        this.isAccessControlEnabled = false;
        this.whitelistedIps = new Array();
        this.isMtlsConnectionRequired = true;
    }
}
exports.adbNetworkAccessData = adbNetworkAccessData;
