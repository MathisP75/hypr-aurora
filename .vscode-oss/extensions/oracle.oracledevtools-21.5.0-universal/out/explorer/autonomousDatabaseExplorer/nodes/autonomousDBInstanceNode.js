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
exports.AutonomousDBInfo = exports.AutonomousDBInstance = void 0;
const vscode = require("vscode");
const treeNodeBase_1 = require("../../treeNodeBase");
const localizedConstants_1 = require("../../../constants/localizedConstants");
const autonomousDBModels_1 = require("../../../models/autonomousDBModels");
const constants_1 = require("../../../constants/constants");
const question_1 = require("../../../prompts/question");
const iExplorerNode_1 = require("../../iExplorerNode");
const adapter_1 = require("../../../prompts/adapter");
const utilities_1 = require("../../utilities");
const helper = require("../../../utilities/helper");
const path = require("path");
const logger_1 = require("../../../infrastructure/logger");
const adbInstanceStatusHandler_1 = require("../adbInstanceStatusHandler");
const scriptExecutionModels_1 = require("../../../models/scriptExecutionModels");
const autonomousDBUtils_1 = require("../autonomousDBUtils");
const ociExplorerModel_1 = require("../ociExplorerModel");
const setup_1 = require("../../../utilities/setup");
class AutonomousDBInstance extends treeNodeBase_1.TreeNodeBase {
    constructor(adbInstanceNodeProperties, parentNode, rootNode) {
        super("", "", adbInstanceNodeProperties.adbInstanceDisplayName, iExplorerNode_1.ExplorerNodeType.Leaf, "", new treeNodeBase_1.Icon(), "");
        this.adbInstanceNodeProperties = adbInstanceNodeProperties;
        this.parentNode = parentNode;
        this.rootNode = rootNode;
        this.prompter = new adapter_1.default();
    }
    getChildren() {
        return null;
    }
    proceedWithOperation(operation, dbNodeName) {
        return __awaiter(this, void 0, void 0, function* () {
            var ret = true;
            var msg = helper.stringFormatterCsharpStyle(operation, dbNodeName);
            const question = {
                type: question_1.QuestionTypes.confirm,
                name: dbNodeName,
                message: msg
            };
            const proceed = yield this.prompter.promptSingle(question);
            if (proceed == undefined || !proceed) {
                ret = false;
            }
            return ret;
        });
    }
    openDownloadCredentialsFileUI(ociExplorerUIHandler, connectionCommandsHandler) {
        ociExplorerUIHandler.openDownloadCredentialsFileUI(connectionCommandsHandler, {
            databaseType: autonomousDBModels_1.DatabaseType.AutonomousDatabase,
            databaseID: this.adbInstanceNodeProperties.adbInstanceID,
            dbDisplayName: this.adbInstanceNodeProperties.adbInstanceDisplayName,
            displayMode: scriptExecutionModels_1.UIDisplayMode.DownloadCredentialsFile,
            dbName: this.adbInstanceNodeProperties.adbInstanceName,
            profileName: this.adbInstanceNodeProperties.profileName,
            dedicatedDb: this.adbInstanceNodeProperties.dedicated,
            tlsAuthenticationType: autonomousDBModels_1.TLSAuthenticationType.MutualTLS
        });
    }
    launchChangeADBAdministratorPswdUI(execID, ociExplorerUIHandler) {
        ociExplorerUIHandler.launchChangeADBAdministratorPswdUI(execID, this.adbInstanceNodeProperties.profileName, this.adbInstanceNodeProperties.adbInstanceDisplayName, this.adbInstanceNodeProperties.adbInstanceID, this.rootNode.getcompartmentFullPathForDisplay());
    }
    openCreateConnectionUI(ociExplorerUIHandler, connectionCommandsHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield this.rootNode.getAccountComponent().ServicesClients.DatabaseServiceClient.getAutonomousDatabase({ autonomousDatabaseId: this.adbInstanceNodeProperties.adbInstanceID });
                ociExplorerUIHandler.openCreateConnectionUI(connectionCommandsHandler, {
                    databaseType: autonomousDBModels_1.DatabaseType.AutonomousDatabase,
                    databaseID: this.adbInstanceNodeProperties.adbInstanceID,
                    dbDisplayName: this.adbInstanceNodeProperties.adbInstanceDisplayName,
                    displayMode: scriptExecutionModels_1.UIDisplayMode.AutonomousDatabaseConnectionManagement,
                    dbName: this.adbInstanceNodeProperties.adbInstanceName,
                    profileName: this.adbInstanceNodeProperties.profileName,
                    dedicatedDb: this.adbInstanceNodeProperties.dedicated,
                    tlsAuthenticationType: response.autonomousDatabase.isMtlsConnectionRequired ? autonomousDBModels_1.TLSAuthenticationType.MutualTLS : autonomousDBModels_1.TLSAuthenticationType.TLS
                });
            }
            catch (error) {
                let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToOpenCreateConnectionUI, this.adbInstanceNodeProperties.adbInstanceDisplayName, error.message);
                logger_1.ChannelLogger.Instance.error(errorMessage);
                vscode.window.showErrorMessage(errorMessage);
            }
        });
    }
    changeADBAdministratorPswd(param) {
        return __awaiter(this, void 0, void 0, function* () {
            let changingpswd = helper.stringFormatterCsharpStyle(localizedConstants_1.default.aDBInstancePswsdChanging, this.adbInstanceNodeProperties.adbInstanceDisplayName);
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification, title: changingpswd
            }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
                var p = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        logger_1.ChannelLogger.Instance.info(changingpswd);
                        let pswdChangedSuccessMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.aDBInstancePswsdChangedSuccessfully, this.adbInstanceNodeProperties.adbInstanceDisplayName);
                        var promiseReturn = this.rootNode.getAccountComponent().ServicesClients.DatabaseServiceClient.updateAutonomousDatabase({
                            autonomousDatabaseId: this.adbInstanceNodeProperties.adbInstanceID,
                            updateAutonomousDatabaseDetails: {
                                adminPassword: String.fromCodePoint(...param.pswd)
                            }
                        });
                        let arr = param.pswd;
                        param.pswd = null;
                        if (arr !== undefined && arr !== null && arr.length > 0) {
                            arr.fill(0);
                            arr.splice(0, arr.length);
                            arr = null;
                        }
                        promiseReturn.then((response) => __awaiter(this, void 0, void 0, function* () {
                            logger_1.ChannelLogger.Instance.info(pswdChangedSuccessMsg);
                            resolve();
                            ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendChangePswdResponse({
                                executionId: param.executionId, windowUri: param.windowUri,
                                status: autonomousDBModels_1.operationStatus.Success, statusMessage: pswdChangedSuccessMsg
                            });
                        }), error => {
                            helper.logErroAfterValidating(error);
                            if (error && error.message) {
                                let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.aDBInstancePswsdChangedError, this.adbInstanceNodeProperties.adbInstanceDisplayName, error.message);
                                logger_1.ChannelLogger.Instance.error(errorMessage);
                                resolve();
                                ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendChangePswdResponse({
                                    executionId: param.executionId, windowUri: param.windowUri,
                                    status: autonomousDBModels_1.operationStatus.Error, statusMessage: errorMessage
                                });
                            }
                        });
                    }
                    catch (error) {
                        logger_1.FileStreamLogger.Instance.info(`Error in updating admin pswd for node ${this.adbInstanceNodeProperties.adbInstanceDisplayName}`);
                        helper.logErroAfterValidating(error);
                    }
                    finally {
                        if (param !== undefined && param !== null &&
                            param.pswd !== undefined && param.pswd !== null) {
                            let arr = param.pswd;
                            param.pswd = null;
                            if (arr !== undefined && arr !== null && arr.length > 0) {
                                arr.fill(0);
                                arr.splice(0, arr.length);
                                arr = null;
                            }
                        }
                    }
                }));
                return p;
            })).then(() => {
            });
        });
    }
    startADBInstance(updateModel) {
        return __awaiter(this, void 0, void 0, function* () {
            var proceed = yield this.proceedWithOperation(localizedConstants_1.default.startOCIDatabaseConfirmation, this.adbInstanceNodeProperties.adbInstanceDisplayName);
            if (proceed) {
                vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: helper.stringFormatterCsharpStyle(localizedConstants_1.default.startingADBInstance, this.adbInstanceNodeProperties.adbInstanceDisplayName) }, (progress, token) => {
                    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            var promiseReturn = this.rootNode.getAccountComponent().ServicesClients.DatabaseServiceClient.startAutonomousDatabase({ autonomousDatabaseId: this.adbInstanceNodeProperties.adbInstanceID });
                            promiseReturn.then((response) => __awaiter(this, void 0, void 0, function* () {
                                let adbLifecycleState = autonomousDBUtils_1.AutonomousDBUtils.getADBLifeCycleStateFromOCIADBLifeCycleState(response.autonomousDatabase.lifecycleState);
                                this.adbInstanceNodeProperties.adbInstanceStatus = adbLifecycleState;
                                updateModel(this);
                                var adbInstanceStateHandler = new adbInstanceStatusHandler_1.adbInstanceStatusHandler(this.rootNode.getAccountComponent(), this, new Date().getTime(), updateModel, autonomousDBModels_1.ADBDatabaseOperation.Start, null, new adbInstanceStatusHandler_1.adbOutputWindowMessageHandler(autonomousDBModels_1.ADBDatabaseOperation.Start));
                                adbInstanceStateHandler.postMessagetoOutputWindow(adbLifecycleState, response.autonomousDatabase.displayName);
                                yield adbInstanceStateHandler.getAutonomousDatabasePropertiesPeriodically();
                                resolve();
                            }), error => {
                                helper.logErroAfterValidating(error);
                                if (error && error.message) {
                                    let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.startADBInstanceFailed, this.adbInstanceNodeProperties.adbInstanceDisplayName, error.message);
                                    logger_1.ChannelLogger.Instance.error(errorMessage);
                                    vscode.window.showErrorMessage(errorMessage);
                                }
                                resolve();
                                this.refreshNode();
                            });
                        }
                        catch (err) {
                            logger_1.FileStreamLogger.Instance.info(`Error in startADBInstance for node ${this.adbInstanceNodeProperties.adbInstanceDisplayName}`);
                            helper.logErroAfterValidating(err);
                            resolve();
                            this.refreshNode();
                        }
                    }));
                });
            }
        });
    }
    stopADBInstance(updateModel) {
        return __awaiter(this, void 0, void 0, function* () {
            var proceed = yield this.proceedWithOperation(localizedConstants_1.default.stopOCIDatabaseConfirmation, this.adbInstanceNodeProperties.adbInstanceDisplayName);
            var sucess = false;
            if (proceed) {
                vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: helper.stringFormatterCsharpStyle(localizedConstants_1.default.stoppingADBInstance, this.adbInstanceNodeProperties.adbInstanceDisplayName) }, (progress, token) => {
                    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            var promiseReturn = this.rootNode.getAccountComponent().ServicesClients.DatabaseServiceClient.stopAutonomousDatabase({ autonomousDatabaseId: this.adbInstanceNodeProperties.adbInstanceID });
                            promiseReturn.then((response) => __awaiter(this, void 0, void 0, function* () {
                                this.adbInstanceNodeProperties.adbInstanceStatus = autonomousDBUtils_1.AutonomousDBUtils.getADBLifeCycleStateFromOCIADBLifeCycleState(response.autonomousDatabase.lifecycleState);
                                updateModel(this);
                                var adbInstanceStateHandler = new adbInstanceStatusHandler_1.adbInstanceStatusHandler(this.rootNode.getAccountComponent(), this, new Date().getTime(), updateModel, autonomousDBModels_1.ADBDatabaseOperation.Stop, null, new adbInstanceStatusHandler_1.adbOutputWindowMessageHandler(autonomousDBModels_1.ADBDatabaseOperation.Stop));
                                adbInstanceStateHandler.postMessagetoOutputWindow(autonomousDBUtils_1.AutonomousDBUtils.getADBLifeCycleStateFromOCIADBLifeCycleState(response.autonomousDatabase.lifecycleState), response.autonomousDatabase.displayName);
                                yield adbInstanceStateHandler.getAutonomousDatabasePropertiesPeriodically();
                                resolve();
                            }), error => {
                                helper.logErroAfterValidating(error);
                                if (error && error.message) {
                                    var msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.stopADBInstanceFailed, this.adbInstanceNodeProperties.adbInstanceDisplayName, error.message);
                                    logger_1.ChannelLogger.Instance.error(msg);
                                    vscode.window.showErrorMessage(msg);
                                }
                                resolve();
                                this.refreshNode();
                            });
                        }
                        catch (err) {
                            logger_1.FileStreamLogger.Instance.info(`Error in stopADBInstance for node ${this.adbInstanceNodeProperties.adbInstanceDisplayName}`);
                            helper.logErroAfterValidating(err);
                            resolve();
                            this.refreshNode();
                        }
                    }));
                });
            }
            return sucess;
        });
    }
    terminateADBInstance(updateModel) {
        return __awaiter(this, void 0, void 0, function* () {
            var proceed = yield this.proceedWithOperation(localizedConstants_1.default.deleteOCIDatabaseConfirmation, this.adbInstanceNodeProperties.adbInstanceDisplayName);
            var sucess = false;
            if (proceed) {
                vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: helper.stringFormatterCsharpStyle(localizedConstants_1.default.terminatingADBInstance, this.adbInstanceNodeProperties.adbInstanceDisplayName) }, (progress, token) => {
                    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            var promiseReturn = this.rootNode.getAccountComponent().ServicesClients.DatabaseServiceClient.deleteAutonomousDatabase({ autonomousDatabaseId: this.adbInstanceNodeProperties.adbInstanceID });
                            promiseReturn.then((response) => __awaiter(this, void 0, void 0, function* () {
                                this.adbInstanceNodeProperties.adbInstanceStatus = autonomousDBModels_1.LifecycleState.Terminating;
                                updateModel(this);
                                var adbInstanceStateHandler = new adbInstanceStatusHandler_1.adbInstanceStatusHandler(this.rootNode.getAccountComponent(), this, new Date().getTime(), updateModel, autonomousDBModels_1.ADBDatabaseOperation.Terminate, null, new adbInstanceStatusHandler_1.adbOutputWindowMessageHandler(autonomousDBModels_1.ADBDatabaseOperation.Terminate));
                                adbInstanceStateHandler.postMessagetoOutputWindow(autonomousDBModels_1.LifecycleState.Terminating, this.adbInstanceNodeProperties.adbInstanceDisplayName);
                                yield adbInstanceStateHandler.getAutonomousDatabasePropertiesPeriodically();
                                resolve();
                            }), error => {
                                helper.logErroAfterValidating(error);
                                if (error && error.message) {
                                    var msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.terminateADBInstanceFailed, this.adbInstanceNodeProperties.adbInstanceDisplayName, error.message);
                                    logger_1.ChannelLogger.Instance.error(msg);
                                    vscode.window.showErrorMessage(msg);
                                }
                                resolve();
                                this.refreshNode();
                            });
                        }
                        catch (err) {
                            logger_1.FileStreamLogger.Instance.info(`Error in terminateADBInstance for node ${this.adbInstanceNodeProperties.adbInstanceDisplayName}`);
                            helper.logErroAfterValidating(err);
                            resolve();
                            this.refreshNode();
                        }
                    }));
                });
            }
            return sucess;
        });
    }
    getTreeItem() {
        const treeItemObject = {};
        treeItemObject.label = this.getNodeIdentifier;
        treeItemObject.tooltip = `${this.getNodeIdentifier} ${this.adbInstanceNodeProperties.adbInstanceStatus}`;
        treeItemObject.collapsibleState = this.getExpansionState();
        treeItemObject.contextValue = this.getContextValue;
        treeItemObject.iconPath = this.adbInstanceNodeProperties.getIconPath();
        treeItemObject.command = this.getCommandObject();
        return treeItemObject;
    }
    get getContextValue() {
        return this.adbInstanceNodeProperties.dedicated ? utilities_1.TreeViewConstants.ociDedicatedDatabaseItemStr : utilities_1.TreeViewConstants.ociNonDedicatedDatabaseItemStr;
    }
    refreshNode() {
        try {
            var promiseReturn = this.rootNode.getAccountComponent().ServicesClients.DatabaseServiceClient.getAutonomousDatabase({ autonomousDatabaseId: this.adbInstanceNodeProperties.adbInstanceID });
            promiseReturn.then((response) => {
                this.adbInstanceNodeProperties.adbInstanceStatus = autonomousDBUtils_1.AutonomousDBUtils.getADBLifeCycleStateFromOCIADBLifeCycleState(response.autonomousDatabase.lifecycleState);
                ociExplorerModel_1.OCIExplorerModel.getInstance().EmitModelChangeEvent(this);
            }, error => {
                helper.logErroAfterValidating(error);
                if (error && error.message) {
                    vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorRefreshingADBNode, this.adbInstanceNodeProperties.adbInstanceDisplayName, error.message));
                }
            });
        }
        catch (error) {
            helper.logErroAfterValidating(error);
            if (error && error.message) {
                vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorRefreshingADBNode, this.adbInstanceNodeProperties.adbInstanceDisplayName, error.message));
            }
        }
    }
    launchGetADBConnectionStringsUI(execID, ociExplorerUIHandler) {
        ociExplorerUIHandler.launchGetADBConnectionStringsUI(execID, this.adbInstanceNodeProperties.profileName, this.adbInstanceNodeProperties.adbInstanceDisplayName, this.adbInstanceNodeProperties.adbInstanceID, this.rootNode.getcompartmentFullPathForDisplay(), this.parentNode.adbworkLoadType);
    }
    launchConfigureWalletlessConnectivityAndNetworkAccessUI(execID, ociExplorerUIHandler) {
        if (this.adbInstanceNodeProperties.adbInstanceStatus !== autonomousDBModels_1.LifecycleState.Available) {
            vscode.window.showErrorMessage(localizedConstants_1.default.adbDatabaseUnavailableError);
            return;
        }
        ociExplorerUIHandler.launchConfigureWalletlessConnectivityAndNetworkAccessUI(execID, this.adbInstanceNodeProperties, this.rootNode.getCompartmentName(), this.rootNode.getcompartmentFullPathForDisplay(), this.parentNode.adbworkLoadType);
    }
    getADBNetworkAccessData() {
        return __awaiter(this, void 0, void 0, function* () {
            let networkAccessData = null;
            try {
                let adb = yield this.rootNode.getAccountComponent().ServicesClients.DatabaseServiceClient.getAutonomousDatabase({ autonomousDatabaseId: this.adbInstanceNodeProperties.adbInstanceID });
                networkAccessData = new autonomousDBModels_1.adbNetworkAccessData();
                networkAccessData.whitelistedIps = adb === null || adb === void 0 ? void 0 : adb.autonomousDatabase.whitelistedIps;
                networkAccessData.isAccessControlEnabled = adb === null || adb === void 0 ? void 0 : adb.autonomousDatabase.isAccessControlEnabled;
                networkAccessData.isMtlsConnectionRequired = adb === null || adb === void 0 ? void 0 : adb.autonomousDatabase.isMtlsConnectionRequired;
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetNetworkAccessDataForADB, this.adbInstanceNodeProperties.adbInstanceDisplayName, error.message);
                logger_1.ChannelLogger.Instance.error(errorMessage);
                vscode.window.showErrorMessage(errorMessage);
            }
            return networkAccessData;
        });
    }
    getMTLSAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let adb = yield this.rootNode.getAccountComponent().ServicesClients.DatabaseServiceClient.getAutonomousDatabase({ autonomousDatabaseId: this.adbInstanceNodeProperties.adbInstanceID });
                return [adb === null || adb === void 0 ? void 0 : adb.autonomousDatabase.isMtlsConnectionRequired, adb.autonomousDatabase.whitelistedIps];
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateNetworkAccessType(updateNetworkAccessTypeRequest, updateModel) {
        let response = new autonomousDBModels_1.ociUpdateNetworkAccessTypeResponse();
        let updatingNetworkAccessType = helper.stringFormatterCsharpStyle(localizedConstants_1.default.aDBUpdatingNewtworkAccessType, this.adbInstanceNodeProperties.adbInstanceDisplayName);
        vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: updatingNetworkAccessType }, (progress, token) => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                try {
                    var promiseReturn = this.rootNode.getAccountComponent().ServicesClients.DatabaseServiceClient.updateAutonomousDatabase({
                        autonomousDatabaseId: this.adbInstanceNodeProperties.adbInstanceID,
                        updateAutonomousDatabaseDetails: {
                            whitelistedIps: updateNetworkAccessTypeRequest.whitelistedIps,
                            isAccessControlEnabled: updateNetworkAccessTypeRequest.isAccessControlEnabled
                        }
                    });
                    promiseReturn.then((response) => __awaiter(this, void 0, void 0, function* () {
                        let adbLifecycleState = autonomousDBUtils_1.AutonomousDBUtils.getADBLifeCycleStateFromOCIADBLifeCycleState(response.autonomousDatabase.lifecycleState);
                        this.adbInstanceNodeProperties.adbInstanceStatus = adbLifecycleState;
                        updateModel(this);
                        var adbInstanceStateHandler = new adbInstanceStatusHandler_1.adbInstanceStatusHandler(this.rootNode.getAccountComponent(), this, new Date().getTime(), updateModel, autonomousDBModels_1.ADBDatabaseOperation.updateNetworkAccesType, null, new adbInstanceStatusHandler_1.adbOutputWindowMessageHandler(autonomousDBModels_1.ADBDatabaseOperation.updateNetworkAccesType), updateNetworkAccessTypeRequest);
                        adbInstanceStateHandler.postMessagetoOutputWindow(adbLifecycleState, response.autonomousDatabase.displayName);
                        yield adbInstanceStateHandler.getAutonomousDatabasePropertiesPeriodically();
                        resolve();
                    }), error => {
                        helper.logErroAfterValidating(error);
                        if (error && error.message) {
                            let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.aDBInstancNewtworkAccessTypeChangedError, this.adbInstanceNodeProperties.adbInstanceDisplayName, error.message);
                            logger_1.ChannelLogger.Instance.error(errorMessage);
                            vscode.window.showErrorMessage(errorMessage);
                            ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendUpdateNetworkAccessTypeResponse(autonomousDBUtils_1.AutonomousDBUtils.getUpdateNetworkAccessTypeResponse(updateNetworkAccessTypeRequest, false));
                        }
                        resolve();
                        this.refreshNode();
                    });
                }
                catch (err) {
                    logger_1.FileStreamLogger.Instance.info(`Error in startADBInstance for node ${this.adbInstanceNodeProperties.adbInstanceDisplayName}`);
                    helper.logErroAfterValidating(err);
                    ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendUpdateNetworkAccessTypeResponse(autonomousDBUtils_1.AutonomousDBUtils.getUpdateNetworkAccessTypeResponse(updateNetworkAccessTypeRequest, false));
                    resolve();
                    this.refreshNode();
                }
            }));
        });
    }
    updateMutualAuthentication(updateMutualAuthenticationRequest, updateModel) {
        let response = new autonomousDBModels_1.ociUpdateNetworkAccessTypeResponse();
        let updatingNetworkAccessType = helper.stringFormatterCsharpStyle(localizedConstants_1.default.aDBUpdatingMTLSAuthentication, this.adbInstanceNodeProperties.adbInstanceDisplayName);
        vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: updatingNetworkAccessType }, (progress, token) => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                try {
                    var promiseReturn = this.rootNode.getAccountComponent().ServicesClients.DatabaseServiceClient.updateAutonomousDatabase({
                        autonomousDatabaseId: this.adbInstanceNodeProperties.adbInstanceID,
                        updateAutonomousDatabaseDetails: {
                            isMtlsConnectionRequired: updateMutualAuthenticationRequest.isMtlsConnectionRequired
                        }
                    });
                    promiseReturn.then((response) => __awaiter(this, void 0, void 0, function* () {
                        let adbLifecycleState = autonomousDBUtils_1.AutonomousDBUtils.getADBLifeCycleStateFromOCIADBLifeCycleState(response.autonomousDatabase.lifecycleState);
                        this.adbInstanceNodeProperties.adbInstanceStatus = adbLifecycleState;
                        updateModel(this);
                        var adbInstanceStateHandler = new adbInstanceStatusHandler_1.adbInstanceStatusHandler(this.rootNode.getAccountComponent(), this, new Date().getTime(), updateModel, autonomousDBModels_1.ADBDatabaseOperation.updateMutualTLSAuthentication, null, new adbInstanceStatusHandler_1.adbOutputWindowMessageHandler(autonomousDBModels_1.ADBDatabaseOperation.updateMutualTLSAuthentication), null, updateMutualAuthenticationRequest);
                        adbInstanceStateHandler.postMessagetoOutputWindow(adbLifecycleState, response.autonomousDatabase.displayName);
                        yield adbInstanceStateHandler.getAutonomousDatabasePropertiesPeriodically();
                        resolve();
                    }), error => {
                        helper.logErroAfterValidating(error);
                        if (error && error.message) {
                            let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.aDBUpdatingMTLSAuthenticationChangedError, this.adbInstanceNodeProperties.adbInstanceDisplayName, error.message);
                            logger_1.ChannelLogger.Instance.error(errorMessage);
                            vscode.window.showErrorMessage(errorMessage);
                            ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendUpdateMTLSAuthenticationResponse(autonomousDBUtils_1.AutonomousDBUtils.getUpdateNetworkAccessTypeResponse(updateMutualAuthenticationRequest, false));
                        }
                        resolve();
                        this.refreshNode();
                    });
                }
                catch (err) {
                    logger_1.FileStreamLogger.Instance.info(`Error in startADBInstance for node ${this.adbInstanceNodeProperties.adbInstanceDisplayName}`);
                    helper.logErroAfterValidating(err);
                    ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendUpdateNetworkAccessTypeResponse(autonomousDBUtils_1.AutonomousDBUtils.getUpdateNetworkAccessTypeResponse(updateMutualAuthenticationRequest, false));
                    resolve();
                    this.refreshNode();
                }
            }));
        });
    }
    getADBConnectionstrings() {
        return __awaiter(this, void 0, void 0, function* () {
            let connectionStringResponse = new autonomousDBModels_1.ociADBConnectionStringsResponse();
            try {
                let response = yield this.rootNode.getAccountComponent().ServicesClients.DatabaseServiceClient.getAutonomousDatabase({ autonomousDatabaseId: this.adbInstanceNodeProperties.adbInstanceID });
                let connectionStrings = response.autonomousDatabase.connectionStrings;
                let connectionProfiles = new Array();
                connectionStringResponse.isDedicated = response.autonomousDatabase.isDedicated;
                if (connectionStrings.profiles) {
                    connectionStrings.profiles.forEach(profile => {
                        let connectionProfile = new autonomousDBUtils_1.adbConnectionProfile();
                        connectionProfile.displayName = profile.displayName;
                        connectionProfile.connectionString = profile.value;
                        connectionProfile.tlsAuthentication = profile.tlsAuthentication.toUpperCase() === "MUTUAL"
                            ? autonomousDBModels_1.TLSAuthenticationType.MutualTLS : autonomousDBModels_1.TLSAuthenticationType.TLS;
                        connectionProfiles.push(connectionProfile);
                    });
                    connectionStringResponse.connectionProfiles = connectionProfiles;
                    connectionStringResponse.tlsAuthenticationType = response.autonomousDatabase.isMtlsConnectionRequired ? autonomousDBModels_1.TLSAuthenticationType.MutualTLS : autonomousDBModels_1.TLSAuthenticationType.TLS;
                }
                else if (connectionStrings.allConnectionStrings) {
                    let dedicateddbConnectionStrings = Object.entries(connectionStrings.allConnectionStrings);
                    if (dedicateddbConnectionStrings) {
                        dedicateddbConnectionStrings.forEach(connectionString => {
                            let connectionProfile = new autonomousDBUtils_1.adbConnectionProfile();
                            connectionProfile.displayName = connectionString[0];
                            ;
                            connectionProfile.connectionString = connectionString[1];
                            connectionProfiles.push(connectionProfile);
                        });
                        connectionStringResponse.connectionProfiles = connectionProfiles;
                    }
                }
                else {
                    connectionStringResponse.errorMessage = localizedConstants_1.default.getConnectionStringErrorMessage;
                }
            }
            catch (error) {
                throw error;
            }
            return connectionStringResponse;
        });
    }
    canGetConnectionString() {
        let canGetString = true;
        switch (this.adbInstanceNodeProperties.adbInstanceStatus) {
            case autonomousDBModels_1.LifecycleState.Provisioning:
            case autonomousDBModels_1.LifecycleState.Terminated:
            case autonomousDBModels_1.LifecycleState.Terminating:
            case autonomousDBModels_1.LifecycleState.Inaccessible:
            case autonomousDBModels_1.LifecycleState.Unavailable:
                canGetString = false;
                break;
            default:
                break;
        }
        return canGetString;
    }
    getConnectionStringErrorMessage() {
        let connectionStringsResponse = new autonomousDBModels_1.ociADBConnectionStringsResponse;
        connectionStringsResponse.errorMessage = localizedConstants_1.default.getConnectionStringErrorMessage;
        return connectionStringsResponse;
    }
}
exports.AutonomousDBInstance = AutonomousDBInstance;
class AutonomousDBInfo {
    constructor() {
        this.adbInstanceStatus = autonomousDBModels_1.LifecycleState.Available;
        this.whitelistedIps = new Array();
    }
    getIconPath() {
        let nodeIcon = undefined;
        if (!AutonomousDBInfo.adbInstanceIconMap) {
            logger_1.FileStreamLogger.Instance.info("Building adb instance icon cache - Start");
            AutonomousDBInfo.adbInstanceIconMap = new Map();
            let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
            let adbInstanceDarkIconPath = path.join(imagesPath, "dark", "instance.svg");
            let adbInstanceLightIconPath = path.join(imagesPath, "light", "instance.svg");
            let adbInstanceStoppedDarkIconPath = path.join(imagesPath, "dark", "instance_red.svg");
            let adbInstanceStoppedLightIconPath = path.join(imagesPath, "light", "instance_red.svg");
            let adbInstanceXDarkIconPath = path.join(imagesPath, "dark", "instance_orange.svg");
            let adbInstanceXLightIconPath = path.join(imagesPath, "light", "instance_orange.svg");
            let adbInstanceStatusIconMap = new Map();
            adbInstanceStatusIconMap.set(autonomousDBModels_1.LifecycleState.Available, new treeNodeBase_1.Icon(adbInstanceDarkIconPath, adbInstanceLightIconPath));
            adbInstanceStatusIconMap.set(autonomousDBModels_1.LifecycleState.Stopped, new treeNodeBase_1.Icon(adbInstanceStoppedDarkIconPath, adbInstanceStoppedLightIconPath));
            adbInstanceStatusIconMap.set(autonomousDBModels_1.LifecycleState.Unavailable, new treeNodeBase_1.Icon(adbInstanceXDarkIconPath, adbInstanceXLightIconPath));
            AutonomousDBInfo.adbInstanceIconMap.set(AutonomousDBInfo.adbInstanceIconMapKey, adbInstanceStatusIconMap);
            let adbInstanceStatusLhcIconMap = new Map();
            adbInstanceStatusLhcIconMap.set(autonomousDBModels_1.LifecycleState.Available, new treeNodeBase_1.Icon(adbInstanceLightIconPath, adbInstanceDarkIconPath));
            adbInstanceStatusLhcIconMap.set(autonomousDBModels_1.LifecycleState.Stopped, new treeNodeBase_1.Icon(adbInstanceStoppedLightIconPath, adbInstanceStoppedDarkIconPath));
            adbInstanceStatusLhcIconMap.set(autonomousDBModels_1.LifecycleState.Unavailable, new treeNodeBase_1.Icon(adbInstanceXLightIconPath, adbInstanceXDarkIconPath));
            AutonomousDBInfo.adbInstanceIconMap.set(AutonomousDBInfo.adbInstanceLhcIconMapKey, adbInstanceStatusLhcIconMap);
            let adbFreeDarkIconPath = path.join(imagesPath, "dark", "instance_star.svg");
            let adbFreeLightIconPath = path.join(imagesPath, "light", "instance_star.svg");
            let adbFreeStoppedDarkIconPath = path.join(imagesPath, "dark", "instance_red_star.svg");
            let adbFreeStoppedLightIconPath = path.join(imagesPath, "light", "instance_red_star.svg");
            let adbFreeXDarkIconPath = path.join(imagesPath, "dark", "instance_orange_star.svg");
            let adbFreeXLightIconPath = path.join(imagesPath, "light", "instance_orange_star.svg");
            let adbFreeInstanceStatusIconMap = new Map();
            adbFreeInstanceStatusIconMap.set(autonomousDBModels_1.LifecycleState.Available, new treeNodeBase_1.Icon(adbFreeDarkIconPath, adbFreeLightIconPath));
            adbFreeInstanceStatusIconMap.set(autonomousDBModels_1.LifecycleState.Stopped, new treeNodeBase_1.Icon(adbFreeStoppedDarkIconPath, adbFreeStoppedLightIconPath));
            adbFreeInstanceStatusIconMap.set(autonomousDBModels_1.LifecycleState.Unavailable, new treeNodeBase_1.Icon(adbFreeXDarkIconPath, adbFreeXLightIconPath));
            AutonomousDBInfo.adbInstanceIconMap.set(AutonomousDBInfo.adbFreeIconMapKey, adbFreeInstanceStatusIconMap);
            let adbFreeInstanceStatusLhcIconMap = new Map();
            adbFreeInstanceStatusLhcIconMap.set(autonomousDBModels_1.LifecycleState.Available, new treeNodeBase_1.Icon(adbFreeLightIconPath, adbFreeXDarkIconPath));
            adbFreeInstanceStatusLhcIconMap.set(autonomousDBModels_1.LifecycleState.Stopped, new treeNodeBase_1.Icon(adbFreeStoppedLightIconPath, adbFreeStoppedDarkIconPath));
            adbFreeInstanceStatusLhcIconMap.set(autonomousDBModels_1.LifecycleState.Unavailable, new treeNodeBase_1.Icon(adbFreeXLightIconPath, adbFreeXDarkIconPath));
            AutonomousDBInfo.adbInstanceIconMap.set(AutonomousDBInfo.adbFreeLhcIconMapKey, adbFreeInstanceStatusLhcIconMap);
            let adbDedicatedDarkIconPath = path.join(imagesPath, "dark", "dedicated-instance.svg");
            let adbDedicatedLightIconPath = path.join(imagesPath, "light", "dedicated-instance.svg");
            let adbDedicatedStoppedDarkIconPath = path.join(imagesPath, "dark", "dedicated-instance_red.svg");
            let adbDedicatedStoppedLightIconPath = path.join(imagesPath, "light", "dedicated-instance_red.svg");
            let adbDedicatedXDarkIconPath = path.join(imagesPath, "dark", "dedicated-instance_orange.svg");
            let adbDedicatedXLightIconPath = path.join(imagesPath, "light", "dedicated-instance_orange.svg");
            let adbDedicatedInstanceStatusIconMap = new Map();
            adbDedicatedInstanceStatusIconMap.set(autonomousDBModels_1.LifecycleState.Available, new treeNodeBase_1.Icon(adbDedicatedDarkIconPath, adbDedicatedLightIconPath));
            adbDedicatedInstanceStatusIconMap.set(autonomousDBModels_1.LifecycleState.Stopped, new treeNodeBase_1.Icon(adbDedicatedStoppedDarkIconPath, adbDedicatedStoppedLightIconPath));
            adbDedicatedInstanceStatusIconMap.set(autonomousDBModels_1.LifecycleState.Unavailable, new treeNodeBase_1.Icon(adbDedicatedXDarkIconPath, adbDedicatedXLightIconPath));
            AutonomousDBInfo.adbInstanceIconMap.set(AutonomousDBInfo.adbDedicatedIconMapKey, adbDedicatedInstanceStatusIconMap);
            let adbDedicatedInstanceStatusLhcIconMap = new Map();
            adbDedicatedInstanceStatusLhcIconMap.set(autonomousDBModels_1.LifecycleState.Available, new treeNodeBase_1.Icon(adbDedicatedLightIconPath, adbDedicatedDarkIconPath));
            adbDedicatedInstanceStatusLhcIconMap.set(autonomousDBModels_1.LifecycleState.Stopped, new treeNodeBase_1.Icon(adbDedicatedStoppedLightIconPath, adbDedicatedStoppedDarkIconPath));
            adbDedicatedInstanceStatusLhcIconMap.set(autonomousDBModels_1.LifecycleState.Unavailable, new treeNodeBase_1.Icon(adbDedicatedXLightIconPath, adbDedicatedXDarkIconPath));
            AutonomousDBInfo.adbInstanceIconMap.set(AutonomousDBInfo.adbDedicatedLhcIconMapKey, adbDedicatedInstanceStatusLhcIconMap);
            logger_1.FileStreamLogger.Instance.info("Building adb instance icon cache - End");
        }
        let iconMap;
        if (this.dedicated) {
            if (setup_1.Setup.CurrentColorThemeKind > vscode.ColorThemeKind.HighContrast) {
                logger_1.FileStreamLogger.Instance.info("Returning ADB Dedicated Light High Contrast Icon Map");
                iconMap = AutonomousDBInfo.adbInstanceIconMap.get(AutonomousDBInfo.adbDedicatedLhcIconMapKey);
            }
            else {
                logger_1.FileStreamLogger.Instance.info("Returning ADB Ddedicated Icon Map");
                iconMap = AutonomousDBInfo.adbInstanceIconMap.get(AutonomousDBInfo.adbDedicatedIconMapKey);
            }
        }
        else if (this.alwaysFree) {
            if (setup_1.Setup.CurrentColorThemeKind > vscode.ColorThemeKind.HighContrast) {
                logger_1.FileStreamLogger.Instance.info("Returning ADB Free Light High Contrast Icon Map");
                iconMap = AutonomousDBInfo.adbInstanceIconMap.get(AutonomousDBInfo.adbFreeLhcIconMapKey);
            }
            else {
                logger_1.FileStreamLogger.Instance.info("Returning ADB Free Icon Map");
                iconMap = AutonomousDBInfo.adbInstanceIconMap.get(AutonomousDBInfo.adbFreeIconMapKey);
            }
        }
        else {
            if (setup_1.Setup.CurrentColorThemeKind > vscode.ColorThemeKind.HighContrast) {
                logger_1.FileStreamLogger.Instance.info("Returning ADB Light High Contrast Icon Map");
                iconMap = AutonomousDBInfo.adbInstanceIconMap.get(AutonomousDBInfo.adbInstanceLhcIconMapKey);
            }
            else {
                logger_1.FileStreamLogger.Instance.info("Returning ADB Icon Map");
                iconMap = AutonomousDBInfo.adbInstanceIconMap.get(AutonomousDBInfo.adbInstanceIconMapKey);
            }
        }
        if (iconMap) {
            logger_1.FileStreamLogger.Instance.info(`IconMap size: ${iconMap.size}`);
            switch (this.adbInstanceStatus) {
                case autonomousDBModels_1.LifecycleState.Available:
                    nodeIcon = iconMap.get(autonomousDBModels_1.LifecycleState.Available);
                    break;
                case autonomousDBModels_1.LifecycleState.Stopped:
                case autonomousDBModels_1.LifecycleState.Terminated:
                    nodeIcon = iconMap.get(autonomousDBModels_1.LifecycleState.Stopped);
                    break;
                default:
                    nodeIcon = iconMap.get(autonomousDBModels_1.LifecycleState.Unavailable);
                    break;
            }
        }
        else {
            logger_1.FileStreamLogger.Instance.info("IconMap is null or undefined");
        }
        return nodeIcon;
    }
}
exports.AutonomousDBInfo = AutonomousDBInfo;
AutonomousDBInfo.adbInstanceIconMap = null;
AutonomousDBInfo.adbDedicatedIconMapKey = "adbDedicated";
AutonomousDBInfo.adbDedicatedLhcIconMapKey = "adbDedicatedLhc";
AutonomousDBInfo.adbFreeIconMapKey = "adbFree";
AutonomousDBInfo.adbFreeLhcIconMapKey = "adbFreeLhc";
AutonomousDBInfo.adbInstanceIconMapKey = "adb";
AutonomousDBInfo.adbInstanceLhcIconMapKey = "adbLhc";
