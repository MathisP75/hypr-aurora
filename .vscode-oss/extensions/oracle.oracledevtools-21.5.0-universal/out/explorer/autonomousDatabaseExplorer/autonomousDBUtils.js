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
exports.adbDownloadCredentialsFilesData = exports.adbConnectionProfile = exports.AutonomousDBUtils = void 0;
const model_1 = require("oci-database/lib/model");
const oracleLanguageServerClient_1 = require("../../infrastructure/oracleLanguageServerClient");
const autonomousDBModels_1 = require("../../models/autonomousDBModels");
const autonomousDBRequest_1 = require("../../models/autonomousDBRequest");
const localizedConstants_1 = require("../../constants/localizedConstants");
const core = require("oci-core");
class AutonomousDBUtils {
    static getADBLifeCycleStateFromOCIADBLifeCycleState(ociADBLifecycleState) {
        let lifecycleState = autonomousDBModels_1.LifecycleState.UnknownValue;
        if (AutonomousDBUtils.lifeCycleVsOCILifeCycleMap == null) {
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap = new Map();
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.Provisioning, autonomousDBModels_1.LifecycleState.Provisioning);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.Available, autonomousDBModels_1.LifecycleState.Available);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.Stopping, autonomousDBModels_1.LifecycleState.Stopping);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.Stopped, autonomousDBModels_1.LifecycleState.Stopped);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.Starting, autonomousDBModels_1.LifecycleState.Starting);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.Terminating, autonomousDBModels_1.LifecycleState.Terminating);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.Terminated, autonomousDBModels_1.LifecycleState.Terminated);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.Unavailable, autonomousDBModels_1.LifecycleState.Unavailable);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.RestoreInProgress, autonomousDBModels_1.LifecycleState.RestoreInProgress);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.RestoreFailed, autonomousDBModels_1.LifecycleState.RestoreFailed);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.BackupInProgress, autonomousDBModels_1.LifecycleState.BackupInProgress);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.ScaleInProgress, autonomousDBModels_1.LifecycleState.ScaleInProgress);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.AvailableNeedsAttention, autonomousDBModels_1.LifecycleState.AvailableNeedsAttention);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.Updating, autonomousDBModels_1.LifecycleState.Updating);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.MaintenanceInProgress, autonomousDBModels_1.LifecycleState.MaintenanceInProgress);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.Restarting, autonomousDBModels_1.LifecycleState.Restarting);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.Recreating, autonomousDBModels_1.LifecycleState.Recreating);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.RoleChangeInProgress, autonomousDBModels_1.LifecycleState.RoleChangeInProgress);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.Upgrading, autonomousDBModels_1.LifecycleState.Upgrading);
            AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.set(model_1.AutonomousDatabase.LifecycleState.UnknownValue, autonomousDBModels_1.LifecycleState.UnknownValue);
        }
        if (AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.has(ociADBLifecycleState)) {
            lifecycleState = AutonomousDBUtils.lifeCycleVsOCILifeCycleMap.get(ociADBLifecycleState);
        }
        return lifecycleState;
    }
    static getADBLifeCycleStateFromOCIADBSummaryLifeCycleState(ociADBSummaryLifecycleState) {
        let lifecycleState = autonomousDBModels_1.LifecycleState.UnknownValue;
        if (AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap == null) {
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap = new Map();
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.Provisioning, autonomousDBModels_1.LifecycleState.Provisioning);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.Available, autonomousDBModels_1.LifecycleState.Available);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.Stopping, autonomousDBModels_1.LifecycleState.Stopping);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.Stopped, autonomousDBModels_1.LifecycleState.Stopped);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.Starting, autonomousDBModels_1.LifecycleState.Starting);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.Terminating, autonomousDBModels_1.LifecycleState.Terminating);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.Terminated, autonomousDBModels_1.LifecycleState.Terminated);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.Unavailable, autonomousDBModels_1.LifecycleState.Unavailable);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.RestoreInProgress, autonomousDBModels_1.LifecycleState.RestoreInProgress);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.RestoreFailed, autonomousDBModels_1.LifecycleState.RestoreFailed);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.BackupInProgress, autonomousDBModels_1.LifecycleState.BackupInProgress);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.ScaleInProgress, autonomousDBModels_1.LifecycleState.ScaleInProgress);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.AvailableNeedsAttention, autonomousDBModels_1.LifecycleState.AvailableNeedsAttention);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.Updating, autonomousDBModels_1.LifecycleState.Updating);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.MaintenanceInProgress, autonomousDBModels_1.LifecycleState.MaintenanceInProgress);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.Restarting, autonomousDBModels_1.LifecycleState.Restarting);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.Recreating, autonomousDBModels_1.LifecycleState.Recreating);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.RoleChangeInProgress, autonomousDBModels_1.LifecycleState.RoleChangeInProgress);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.Upgrading, autonomousDBModels_1.LifecycleState.Upgrading);
            AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.set(model_1.AutonomousDatabaseSummary.LifecycleState.UnknownValue, autonomousDBModels_1.LifecycleState.UnknownValue);
        }
        if (AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.has(ociADBSummaryLifecycleState)) {
            lifecycleState = AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap.get(ociADBSummaryLifecycleState);
        }
        return lifecycleState;
    }
    static getWalletPassword(request) {
        var languageClient = oracleLanguageServerClient_1.OracleLanguageServerClient.instance;
        return languageClient.sendRequest(autonomousDBRequest_1.AutonomousDBWalletPswdRequest.type, request);
    }
    static getCreateDBResponse(createNewdatabaseRequest, operationSucceeded) {
        let dbResponse = new autonomousDBModels_1.createNewAutonomousDBResponse();
        dbResponse.executionId = createNewdatabaseRequest.executionId;
        dbResponse.windowUri = createNewdatabaseRequest.windowUri;
        dbResponse.executionId = createNewdatabaseRequest.executionId;
        dbResponse.operationSucceeded = operationSucceeded;
        if (operationSucceeded) {
            let defaultDBName = AutonomousDBUtils.getdefaultDatabaseName();
            dbResponse.dbName = defaultDBName;
            dbResponse.displayName = defaultDBName;
        }
        return dbResponse;
    }
    static getdefaultDatabaseName() {
        let dbName = "";
        let date = new Date();
        dbName = `${date.getFullYear()}${AutonomousDBUtils.convertSingleDigitToTwoDigit(date.getMonth() + 1)}${AutonomousDBUtils.convertSingleDigitToTwoDigit(date.getDate())}${AutonomousDBUtils.convertSingleDigitToTwoDigit(date.getHours())}${this.convertSingleDigitToTwoDigit(date.getMinutes())}`;
        return `DB${dbName}`;
    }
    static convertSingleDigitToTwoDigit(dateComponent) {
        let dateComponentStr = dateComponent.toString();
        if (dateComponentStr.length < 2) {
            dateComponentStr = `0${dateComponentStr}`;
        }
        return dateComponentStr;
    }
    static getworkLoadTypeDisplayString(workloadType) {
        let workloadTypeStr = "";
        switch (workloadType) {
            case autonomousDBModels_1.ADBworkLoadType.OLTP:
                workloadTypeStr = localizedConstants_1.default.atpWorkloadNode;
                break;
            case autonomousDBModels_1.ADBworkLoadType.DW:
                workloadTypeStr = localizedConstants_1.default.datawareHouseWorkloadNode;
                break;
            case autonomousDBModels_1.ADBworkLoadType.AJD:
                workloadTypeStr = localizedConstants_1.default.jsonWorkloadNode;
                break;
        }
        return workloadTypeStr;
    }
    static getLicenseTypeDisplayString(licenseType) {
        let licenseTypeStr = "";
        switch (licenseType) {
            case autonomousDBModels_1.ADBLicenseType.BringYourLicense:
                licenseTypeStr = localizedConstants_1.default.bringyourOwnLicense;
                break;
            case autonomousDBModels_1.ADBLicenseType.SubscribeToNewLicense:
                licenseTypeStr = localizedConstants_1.default.licenseIncluded;
                break;
        }
        return licenseTypeStr;
    }
    static getRootAppendedDisplayName(name) {
        let appendedName = name;
        return appendedName;
    }
    static getRootAppenedFullCompartmentNameForDisplay(compartmentFullName) {
        let compartmentNameForDisplay = compartmentFullName;
        return compartmentNameForDisplay;
    }
    static getPublicIPAddress(request) {
        var languageClient = oracleLanguageServerClient_1.OracleLanguageServerClient.instance;
        return languageClient.sendRequest(autonomousDBRequest_1.PublicIPAddressRequest.type, request);
    }
    static getUpdateNetworkAccessTypeResponse(requestObject, operationSucceeded) {
        let responseObject = new autonomousDBModels_1.ociUpdateNetworkAccessTypeResponse();
        responseObject.executionId = requestObject.executionId;
        responseObject.windowUri = requestObject.windowUri;
        responseObject.profileName = requestObject.profileName;
        responseObject.status = operationSucceeded ? autonomousDBModels_1.operationStatus.Success : autonomousDBModels_1.operationStatus.Error;
        return responseObject;
    }
    static getVCNList(authProvider, compartmentID) {
        return __awaiter(this, void 0, void 0, function* () {
            let vcnDetails = new Array();
            let vcnClient = new core.VirtualNetworkClient({ authenticationDetailsProvider: authProvider });
            let list = yield vcnClient.listVcns({ compartmentId: compartmentID });
            list.items.forEach(vcn => {
                vcnDetails.push({ displayName: vcn.displayName, ocid: vcn.id });
            });
            return vcnDetails;
        });
    }
}
exports.AutonomousDBUtils = AutonomousDBUtils;
AutonomousDBUtils.lifeCycleVsOCILifeCycleMap = null;
AutonomousDBUtils.lifeCycleVsOCIADBsummaryLifeCycleMap = null;
AutonomousDBUtils.compartmentSeparator = "/";
class adbConnectionProfile {
}
exports.adbConnectionProfile = adbConnectionProfile;
class adbDownloadCredentialsFilesData {
    constructor() {
        this.existingFiles = new Array();
        this.errorMessage = "";
    }
}
exports.adbDownloadCredentialsFilesData = adbDownloadCredentialsFilesData;
