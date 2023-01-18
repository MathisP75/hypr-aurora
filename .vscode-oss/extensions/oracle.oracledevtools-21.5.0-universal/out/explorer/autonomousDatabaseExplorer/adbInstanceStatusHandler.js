"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adbInstanceStatusHandler = exports.adbOutputWindowMessageHandler = void 0;
const autonomousDBModels_1 = require("../../models/autonomousDBModels");
const helper = require("../../utilities/helper");
const localizedConstants_1 = require("../../constants/localizedConstants");
const vscode = require("vscode");
const ociExplorerModel_1 = require("./ociExplorerModel");
const autonomousDBUtils_1 = require("./autonomousDBUtils");
const logger_1 = require("../../infrastructure/logger");
class adbOutputWindowMessageHandler {
    constructor(databaseOperation) {
        this.databaseOperation = databaseOperation;
        this.prevLifecycleState = autonomousDBModels_1.LifecycleState.UnknownValue;
    }
    updateDatabaseState(requestMessage) {
    }
    getFormattedMessage(lifecycleState, databaseDisplayName) {
        let msg = `${localizedConstants_1.default.database} ${databaseDisplayName} - ${lifecycleState}`;
        return msg;
    }
    postMessageToOutputWindow(currentLifecycleState, databaseDisplayName) {
        if (this.prevLifecycleState != currentLifecycleState) {
            if (this.databaseOperation === autonomousDBModels_1.ADBDatabaseOperation.createDatabase) {
                logger_1.ChannelLogger.Instance.info(`${localizedConstants_1.default.database}: ${databaseDisplayName} - ${currentLifecycleState}`);
            }
            else {
                logger_1.ChannelLogger.Instance.info(this.getFormattedMessage(currentLifecycleState, databaseDisplayName));
            }
            this.prevLifecycleState = currentLifecycleState;
        }
    }
    postDBCreatedSuccessMessageToOutputWindow(currentLifecycleState, databaseDisplayName) {
        logger_1.ChannelLogger.Instance.info(`${localizedConstants_1.default.database}: ${databaseDisplayName} - ${currentLifecycleState}`);
        this.prevLifecycleState = currentLifecycleState;
    }
}
exports.adbOutputWindowMessageHandler = adbOutputWindowMessageHandler;
class adbInstanceStatusHandler {
    constructor(accountComponent, adbDatabaseInstance, startTime, updateModel, adbOperationToPoll, requestMessage = null, outputWindowMessageHandler = null, updateNetworkAccessRequestMessage = null, mTLSAuthenticationTypeRequest = null) {
        this.accountComponent = accountComponent;
        this.adbDatabaseInstance = adbDatabaseInstance;
        this.startTime = startTime;
        this.updateModel = updateModel;
        this.adbOperationToPoll = adbOperationToPoll;
        this.requestMessage = requestMessage;
        this.outputWindowMessageHandler = outputWindowMessageHandler;
        this.updateNetworkAccessRequestMessage = updateNetworkAccessRequestMessage;
        this.mTLSAuthenticationTypeRequest = mTLSAuthenticationTypeRequest;
        this.operationTimeout = 7200000;
        this.opertionPollFrequency = 10000;
        this.initialopertionPollFrequency = 3000;
        this.resetPollFrequency = true;
        this.whitelistedIps = [];
        this.pollingConsectiveErrorCount = 0;
        this.pollingMaximumConsectiveErrorLimit = 3;
    }
    postMessagetoOutputWindow(currentLifecycleState, databaseDisplayName) {
        if (this.outputWindowMessageHandler != null) {
            this.outputWindowMessageHandler.postMessageToOutputWindow(currentLifecycleState, databaseDisplayName);
        }
    }
    getDesiredState() {
        if (!adbInstanceStatusHandler.adbOperationNameVsDesiredStateMap) {
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateMap = new Map();
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateMap.set(autonomousDBModels_1.ADBDatabaseOperation.Start, autonomousDBModels_1.LifecycleState.Available);
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateMap.set(autonomousDBModels_1.ADBDatabaseOperation.Stop, autonomousDBModels_1.LifecycleState.Stopped);
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateMap.set(autonomousDBModels_1.ADBDatabaseOperation.Terminate, autonomousDBModels_1.LifecycleState.Terminated);
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateMap.set(autonomousDBModels_1.ADBDatabaseOperation.createDatabase, autonomousDBModels_1.LifecycleState.Available);
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateMap.set(autonomousDBModels_1.ADBDatabaseOperation.updateNetworkAccesType, autonomousDBModels_1.LifecycleState.Available);
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateMap.set(autonomousDBModels_1.ADBDatabaseOperation.updateMutualTLSAuthentication, autonomousDBModels_1.LifecycleState.Available);
        }
        return adbInstanceStatusHandler.adbOperationNameVsDesiredStateMap.get(this.adbOperationToPoll);
    }
    getDesiredStateDisplayName() {
        if (!adbInstanceStatusHandler.adbOperationNameVsDesiredStateDisplayNameMap) {
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateDisplayNameMap = new Map();
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateDisplayNameMap.set(autonomousDBModels_1.ADBDatabaseOperation.Start, "started");
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateDisplayNameMap.set(autonomousDBModels_1.ADBDatabaseOperation.Stop, "stopped");
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateDisplayNameMap.set(autonomousDBModels_1.ADBDatabaseOperation.Terminate, "terminated");
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateDisplayNameMap.set(autonomousDBModels_1.ADBDatabaseOperation.createDatabase, "created");
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateDisplayNameMap.set(autonomousDBModels_1.ADBDatabaseOperation.updateNetworkAccesType, "updated");
            adbInstanceStatusHandler.adbOperationNameVsDesiredStateDisplayNameMap.set(autonomousDBModels_1.ADBDatabaseOperation.updateMutualTLSAuthentication, "updated");
        }
        return adbInstanceStatusHandler.adbOperationNameVsDesiredStateDisplayNameMap.get(this.adbOperationToPoll);
    }
    getAutonomousDatabasePropertiesPeriodically() {
        var promise = new Promise((resolve, reject) => {
            var interval = setInterval(() => {
                this.getAutonomousDatabaseProperties(interval, resolve);
            }, this.initialopertionPollFrequency);
        });
        return promise;
    }
    gotDesiredState() {
        return this.currentOpeartionState == this.getDesiredState();
    }
    postMessageToUI(operationSucceeded) {
        if (this.adbOperationToPoll === autonomousDBModels_1.ADBDatabaseOperation.createDatabase) {
            ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendCreateNewAutonomousDBResponse(autonomousDBUtils_1.AutonomousDBUtils.getCreateDBResponse(this.requestMessage, operationSucceeded));
        }
        else if (this.adbOperationToPoll === autonomousDBModels_1.ADBDatabaseOperation.updateNetworkAccesType) {
            let updateNetworkAccessTypeResponse = autonomousDBUtils_1.AutonomousDBUtils.getUpdateNetworkAccessTypeResponse(this.updateNetworkAccessRequestMessage, operationSucceeded);
            updateNetworkAccessTypeResponse.whitelistedIps = this.whitelistedIps;
            updateNetworkAccessTypeResponse.isMtlsConnectionRequired = this.isMtlsConnectionRequired;
            ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendUpdateNetworkAccessTypeResponse(updateNetworkAccessTypeResponse);
        }
        else if (this.adbOperationToPoll === autonomousDBModels_1.ADBDatabaseOperation.updateMutualTLSAuthentication) {
            let mtlsAuthenticationResponse = autonomousDBUtils_1.AutonomousDBUtils.getUpdateNetworkAccessTypeResponse(this.mTLSAuthenticationTypeRequest, operationSucceeded);
            mtlsAuthenticationResponse.whitelistedIps = this.whitelistedIps;
            mtlsAuthenticationResponse.isMtlsConnectionRequired = this.isMtlsConnectionRequired;
            ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendUpdateMTLSAuthenticationResponse(mtlsAuthenticationResponse);
        }
    }
    getAutonomousDatabaseProperties(interval, resolve) {
        if (new Date().getTime() - this.startTime > this.operationTimeout || this.gotDesiredState()) {
            clearInterval(interval);
            if (this.gotDesiredState()) {
                this.postMessageToUI(true);
                if (this.outputWindowMessageHandler != null) {
                    this.outputWindowMessageHandler.postMessageToOutputWindow(this.currentOpeartionState, this.databaseDisplayName);
                }
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.aDBInstancePollOperationCompleted, this.adbDatabaseInstance.adbInstanceNodeProperties.adbInstanceDisplayName, this.getDesiredStateDisplayName()));
            }
            resolve();
        }
        if (this.resetPollFrequency) {
            resolve();
            clearInterval(interval);
            this.resetPollFrequency = false;
            interval = setInterval(() => {
                this.getAutonomousDatabaseProperties(interval, resolve);
            }, this.opertionPollFrequency);
        }
        var promiseReturn = this.accountComponent.ServicesClients.DatabaseServiceClient.getAutonomousDatabase({ autonomousDatabaseId: this.adbDatabaseInstance.adbInstanceNodeProperties.adbInstanceID });
        promiseReturn.then((response) => {
            let adbLifecycleState = autonomousDBUtils_1.AutonomousDBUtils.getADBLifeCycleStateFromOCIADBLifeCycleState(response.autonomousDatabase.lifecycleState);
            this.adbDatabaseInstance.adbInstanceNodeProperties.adbInstanceStatus = adbLifecycleState;
            this.currentOpeartionState = adbLifecycleState;
            this.databaseDisplayName = response.autonomousDatabase.displayName;
            this.whitelistedIps = response.autonomousDatabase.whitelistedIps;
            this.isMtlsConnectionRequired = response.autonomousDatabase.isMtlsConnectionRequired;
            this.isAccessControlEnabled = response.autonomousDatabase.isAccessControlEnabled;
            if (this.updateModel != null) {
                this.updateModel(this.adbDatabaseInstance);
            }
            this.pollingConsectiveErrorCount = 0;
        }, error => {
            helper.logErroAfterValidating(error);
            this.pollingConsectiveErrorCount++;
            if (this.pollingConsectiveErrorCount == this.pollingMaximumConsectiveErrorLimit) {
                if (error && error.message) {
                    vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.pollADBInstanceFailed, this.adbDatabaseInstance.adbInstanceNodeProperties.adbInstanceName, error.message));
                }
                this.postMessageToUI(true);
                clearInterval(interval);
                resolve();
            }
        });
    }
}
exports.adbInstanceStatusHandler = adbInstanceStatusHandler;
