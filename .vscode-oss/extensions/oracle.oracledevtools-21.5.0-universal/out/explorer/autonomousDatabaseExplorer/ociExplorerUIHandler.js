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
exports.OCIExplorerUIHandler = void 0;
const vscode = require("vscode");
const localizedConstants_1 = require("../../constants/localizedConstants");
const scriptExcutionCommandHandler_1 = require("../../scriptExecution/scriptExcutionCommandHandler");
const resultsDataServer_1 = require("../../scriptExecution/resultsDataServer");
const DocumentConnectionInformation_1 = require("../../connectionManagement/DocumentConnectionInformation");
const scriptExecutionModels_1 = require("../../models/scriptExecutionModels");
const autonomousDBModels_1 = require("../../models/autonomousDBModels");
const ociExplorerModel_1 = require("./ociExplorerModel");
const ociExplorerManager_1 = require("./ociExplorerManager");
const logger_1 = require("../../infrastructure/logger");
const helper = require("../../utilities/helper");
const constants_1 = require("../../constants/constants");
const path = require("path");
const autonomousDBUtils_1 = require("./autonomousDBUtils");
class OCIExplorerUIHandler {
    constructor(adbExplorerModel) {
        this.adbExplorerModel = adbExplorerModel;
        this.reusableCreateADBDatabaseUIWindowUri = undefined;
        this.reusableCreateADBDatabaseUIExecutionId = undefined;
        this.usedADBNames = {};
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.ociCompartmentRequestMessage, (message) => {
            this.sendCompartmentList(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.adbChangePswdResponse, (message) => {
            this.sendChangePswdResponse(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.ociRegionRequestMessage, (message) => {
            this.sendRegions(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.ociUpdateCompartmentAndRegionMessage, (message) => {
            this.updateCompartmentAndRegion(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.ociUpdateAdminstratorPswd, (message) => {
            this.updateAdminstratorPswd(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.adbDownloadWalletFileRequestMessage, (message) => {
            this.downloadWalletFile(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.adbReplaceWalletFileRequestMessage, (message) => {
            this.handleExistingWalletFile(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.initializeCreateNewAutonomousDBPageRequestMessage, (message) => {
            this.sendCreateNewDBInializationData(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.ociCreateNewATPDBRequestMessage, (message) => {
            this.createAutonomousDatabase(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.autonomousContainerDBRequestMessage, (message) => {
            this.getAutonomousContainerDatabases(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.updateAutonomousDBNameRequestMessage, (message) => {
            this.updateAutonomousDBName(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.ociLaunchChangeadminPswdDialogRequestMessage, (message) => {
            this.launchAdminPasswordDialogRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.adbDownloadWalletFilePathRequestMessage, (message) => {
            this.handleDownloadWalletFileRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.ociGetConnectionstringsRequestMessage, (message) => {
            this.sendADBConnectionStringsData(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.ociGetPublicIPAddressRequesttMessage, (message) => {
            this.getPublicIPAddressRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.ociUpdateNetworkAccessTypeRequetMessage, (message) => {
            this.updateNetworkAccessType(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.initializeNetworkAccessTypeRequestMessage, (message) => {
            this.getInitializeNetworkAccessTypeData(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.ociVCNListRequestMessage, (message) => {
            this.getOCIVCNList(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.initializeMutualAuthenticationTypeRequestMessage, (message) => {
            this.getInitializeMutualAuthenticationData(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.ociEditMutualAuthenticationRequestMessage, (message) => {
            this.updateMutualAuthentication(message);
        });
    }
    sendCompartmentList(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let profileNode = this.adbExplorerModel.getProfileNode(message.profileName);
                if (profileNode != null) {
                    var compartmentResponse = yield profileNode.getCompartmentResponse();
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.ociCompartmentResponseMessage, compartmentResponse);
                }
            }
            catch (error) {
                helper.logErroAfterValidating(error);
            }
        });
    }
    sendChangePswdResponse(message) {
        try {
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.adbChangePswdResponse, message);
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    sendRegions(message) {
        let profileNode = this.adbExplorerModel.getProfileNode(message.profileName);
        if (profileNode != null) {
            profileNode.fetchRegions().then((regions) => {
                let regionResponse = new autonomousDBModels_1.ociRegionResponse();
                for (let index = 0; index < regions.length; index++) {
                    regionResponse.regionList.push(regions[index]);
                }
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.ociRegionResponseMessage, regionResponse);
            }, error => {
            });
        }
    }
    sendCreateNewDBInializationData(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = message;
            let createADBInitializationData = new autonomousDBModels_1.initializeCreateNewAutonomousDBPageResponse();
            let adbWorkLoadNode = this.getWorkloadNode(request.profileName, request.workloadType);
            let autonoumousDatabaseInfo = yield adbWorkLoadNode.getCreateAutonomousDBInitializationData();
            createADBInitializationData.compartmentNameForDisplay = autonoumousDatabaseInfo.compartmentFullPathForDisplay;
            createADBInitializationData.compartmentFullPathForDisplay = autonoumousDatabaseInfo.compartmentFullPathForDisplay;
            createADBInitializationData.compartmentID = autonoumousDatabaseInfo.compartmentID;
            createADBInitializationData.userName = autonoumousDatabaseInfo.userName;
            createADBInitializationData.displayName = autonoumousDatabaseInfo.displayName;
            createADBInitializationData.dbName = autonoumousDatabaseInfo.dbName;
            createADBInitializationData.storage = autonoumousDatabaseInfo.storage;
            createADBInitializationData.cpuCoreCount = autonoumousDatabaseInfo.cpuCoreCount;
            createADBInitializationData.alwaysFree = autonoumousDatabaseInfo.alwaysFree;
            createADBInitializationData.autoScaling = autonoumousDatabaseInfo.autoScaling;
            createADBInitializationData.dedicated = autonoumousDatabaseInfo.dedicated;
            createADBInitializationData.workLoadType = autonoumousDatabaseInfo.workLoadType;
            createADBInitializationData.compartmentData = autonoumousDatabaseInfo.compartmentData;
            createADBInitializationData.profileName = autonoumousDatabaseInfo.profileName;
            createADBInitializationData.licenseType = autonoumousDatabaseInfo.licenseType;
            createADBInitializationData.region = adbWorkLoadNode.getRootNode().regionName;
            createADBInitializationData.dbVersionJSONDataForWorkloadNode = autonoumousDatabaseInfo.workloadSupportedDBVersionsList.getJSON();
            createADBInitializationData.isMtlsConnectionRequired = autonoumousDatabaseInfo.isMtlsConnectionRequired;
            createADBInitializationData.whitelistedIps = autonoumousDatabaseInfo.whitelistedIps;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.initializeCreateNewAutonomousDBPageResponseMessage, createADBInitializationData);
        });
    }
    updateAutonomousDBName(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let updateRequest = message;
            const clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(updateRequest.windowUri, updateRequest.executionId);
            let panel = clients && clients.length > 0 ? clients[0].panel : null;
            if (panel) {
                let title = localizedConstants_1.default.adbCreateADB;
                if (updateRequest.dbName) {
                    title = title + ": " + updateRequest.dbName;
                }
                panel.title = title;
                this.usedADBNames[updateRequest.executionId] = updateRequest.dbName;
            }
            else {
                delete this.usedADBNames[updateRequest.executionId];
            }
            this.updateCreateNewADBWindows();
        });
    }
    updateCreateNewADBWindows() {
        const clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(constants_1.Constants.adbCreateNewDatabaseWindowUri);
        if (clients) {
            clients.forEach((client) => {
                let msg = new autonomousDBModels_1.usedADBNamesUpdatedMessageData();
                msg.windowUri = client.ownerUri;
                msg.executionId = client.executionId;
                msg.usedADBNames = this.usedADBNames;
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(msg.windowUri, msg.executionId, scriptExecutionModels_1.MessageName.usedADBNamesUpdatedMessage, msg);
            });
        }
    }
    sendCreateNewAutonomousDBResponse(message) {
        return __awaiter(this, void 0, void 0, function* () {
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.createNewAutonomousDBResponseMessage, message);
        });
    }
    sendAutonomousContainerDatabases(message) {
        return __awaiter(this, void 0, void 0, function* () {
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.autonomousContainerDBResponseMessage, message);
        });
    }
    getWorkloadNode(profileName, workLoadType) {
        let workLoadNode = null;
        let profileNode = this.adbExplorerModel.getProfileNode(profileName);
        if (profileNode != null) {
            workLoadNode = profileNode.getWorkloadNode(workLoadType);
        }
        return workLoadNode;
    }
    createAutonomousDatabase(message) {
        logger_1.FileStreamLogger.Instance.info('Received createAutonomousDatabase request');
        var createNewdatabaseRequest = message;
        if (createNewdatabaseRequest.windowUri === this.reusableCreateADBDatabaseUIWindowUri &&
            createNewdatabaseRequest.executionId === this.reusableCreateADBDatabaseUIExecutionId) {
            this.reusableCreateADBDatabaseUIWindowUri = undefined;
            this.reusableCreateADBDatabaseUIExecutionId = undefined;
        }
        try {
            let workLoadNode = this.getWorkloadNode(createNewdatabaseRequest.profileName, createNewdatabaseRequest.workLoadType);
            if (this.canStartADBCreation(createNewdatabaseRequest, workLoadNode)) {
                workLoadNode.CreateNewAutonomousDatabase(createNewdatabaseRequest);
            }
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    getAutonomousContainerDatabases(message) {
        logger_1.FileStreamLogger.Instance.info('Received autonomousContainerDBrequest');
        let adbContainerDBRequest = message;
        logger_1.FileStreamLogger.Instance.info(`Request from windowUri ${adbContainerDBRequest.windowUri}`);
        let workLoadNode = null;
        workLoadNode = this.getWorkloadNode(adbContainerDBRequest.profileName, adbContainerDBRequest.workloadType);
        if (workLoadNode === null || workLoadNode === undefined) {
            logger_1.FileStreamLogger.Instance.info(`WorkLoadNode is null or undefined`);
        }
        else {
            workLoadNode.getAutonomousContainerDatabases(adbContainerDBRequest);
        }
    }
    downloadWalletFile(message) {
        try {
            this.adbExplorerModel.downloadWalletFile(message);
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    sendDownloadWalletFileResponse(message) {
        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.adbDownloadWalletFileResponseMessage, message);
    }
    handleExistingWalletFile(message) {
        try {
            this.adbExplorerModel.handleExistingWalletFile(message);
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    updateAdminstratorPswd(message) {
        var msg = message;
        this.adbExplorerModel.changeADBAdministratorPswd(msg);
    }
    launchAdminPasswordDialogRequest(message) {
        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.ociLaunchChangeadminPswdDialogResponseMessage, {
            executionId: message.executionId,
            windowUri: message.windowUri
        });
    }
    updateCompartmentAndRegion(message) {
        var msg = message;
        let progressMsg = "";
        if (msg.updateType === autonomousDBModels_1.CompartmentAndRegionUpdateType.CompartmentAndRegion) {
            progressMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updatingOCITreeforCompartmentAndRegion, msg.selectedCompartmentFullname, msg.regionName, msg.profileName);
        }
        else if (msg.updateType === autonomousDBModels_1.CompartmentAndRegionUpdateType.Compartment) {
            progressMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updatingOCITreeforCompartment, msg.selectedCompartmentFullname, msg.profileName);
        }
        else if (msg.updateType === autonomousDBModels_1.CompartmentAndRegionUpdateType.Region) {
            progressMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updatingOCITreeforRegion, msg.regionName, msg.profileName);
        }
        let compartmentUpdated = false;
        let regionUpdated = false;
        let errorMessage = "";
        vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: progressMsg }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
            var p = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                var response = autonomousDBModels_1.ociUpdateCompartmentAndRegionResponse.create(msg);
                var canProceedWithUpdate = true;
                try {
                    switch (msg.updateType) {
                        case autonomousDBModels_1.CompartmentAndRegionUpdateType.Region:
                            try {
                                canProceedWithUpdate = yield this.adbExplorerModel.updateProfileNodeCompartmentOrRegion(msg);
                                errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.changeRegionNotStartedProfileNotFound, msg.profileName);
                                regionUpdated = true;
                            }
                            catch (err) {
                                logger_1.FileStreamLogger.Instance.info(`Error in updateRegionList for node ${msg.regionName}`);
                                helper.logErroAfterValidating(err);
                            }
                            break;
                        case autonomousDBModels_1.CompartmentAndRegionUpdateType.Compartment:
                            try {
                                canProceedWithUpdate = yield this.adbExplorerModel.updateProfileNodeCompartmentOrRegion(msg);
                                errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.changeCompartmentNotStartedProfileNotFound, msg.profileName);
                                compartmentUpdated = true;
                            }
                            catch (err) {
                                logger_1.FileStreamLogger.Instance.info(`Error in updateCompartmentList for node ${msg.selectedCompartmentFullname}`);
                                helper.logErroAfterValidating(err);
                            }
                            break;
                        case autonomousDBModels_1.CompartmentAndRegionUpdateType.CompartmentAndRegion:
                            try {
                                canProceedWithUpdate = yield this.adbExplorerModel.updateProfileNodeCompartmentOrRegion(msg);
                                compartmentUpdated = true;
                                regionUpdated = true;
                                errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.changeCompartmentNRegionNotStartedProfileNotFound, msg.profileName);
                            }
                            catch (err) {
                                logger_1.FileStreamLogger.Instance.info(`Error in updateCompartmentList for node ${msg.selectedCompartmentFullname}`);
                                helper.logErroAfterValidating(err);
                            }
                            break;
                        default:
                            break;
                    }
                    try {
                        if (canProceedWithUpdate) {
                            if (compartmentUpdated && regionUpdated) {
                                response.upateResult = autonomousDBModels_1.CompartmentAndRegionUpdateType.CompartmentAndRegion;
                            }
                            else if (compartmentUpdated) {
                                response.upateResult = autonomousDBModels_1.CompartmentAndRegionUpdateType.Compartment;
                            }
                            else if (regionUpdated) {
                                response.upateResult = autonomousDBModels_1.CompartmentAndRegionUpdateType.Region;
                            }
                            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.ociUpdateCompartmentAndRegionResponse, response);
                        }
                    }
                    catch (err) {
                        logger_1.FileStreamLogger.Instance.info(`Error on sending compartment and region update response to UI`);
                        helper.logErroAfterValidating(err);
                    }
                }
                finally {
                    resolve();
                    if (!canProceedWithUpdate) {
                        response.upateResult = autonomousDBModels_1.CompartmentAndRegionUpdateType.None;
                        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.ociUpdateCompartmentAndRegionResponse, response);
                        vscode.window.showErrorMessage(errorMessage);
                    }
                }
                if (canProceedWithUpdate) {
                    this.showUpdateCompartmentAndRegionResult(msg, regionUpdated, compartmentUpdated);
                }
            }));
            return p;
        })).then(() => {
        });
    }
    showUpdateCompartmentAndRegionResult(msg, regionUpdated, compartmentUpdated) {
        let notificationMsg = "";
        switch (msg.updateType) {
            case autonomousDBModels_1.CompartmentAndRegionUpdateType.Region:
                if (regionUpdated) {
                    notificationMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updateRegionSucceeded, msg.regionName, msg.profileName);
                    vscode.window.showInformationMessage(notificationMsg);
                }
                else {
                    notificationMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updateRegionFailed, msg.regionName, msg.profileName);
                    vscode.window.showErrorMessage(notificationMsg);
                }
                break;
            case autonomousDBModels_1.CompartmentAndRegionUpdateType.Compartment:
                if (compartmentUpdated) {
                    notificationMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updateCompartmentSucceeded, msg.selectedCompartmentFullname, msg.profileName);
                    vscode.window.showInformationMessage(notificationMsg);
                }
                else {
                    notificationMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updateCompartmentFailed, msg.selectedCompartmentFullname, msg.profileName);
                    vscode.window.showErrorMessage(notificationMsg);
                }
                break;
            case autonomousDBModels_1.CompartmentAndRegionUpdateType.CompartmentAndRegion:
                if (compartmentUpdated && regionUpdated) {
                    notificationMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updateCompartmentAndRegionSucceeded, msg.selectedCompartmentFullname, msg.regionName, msg.profileName);
                    vscode.window.showInformationMessage(notificationMsg);
                }
                else if (!regionUpdated && !compartmentUpdated) {
                    notificationMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updateCompartmentAndRegionFailed, msg.selectedCompartmentFullname, msg.regionName, msg.profileName);
                    vscode.window.showErrorMessage(notificationMsg);
                }
                else {
                    if (regionUpdated) {
                        notificationMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updateRegionSucceeded, msg.regionName, msg.profileName);
                        vscode.window.showInformationMessage(notificationMsg);
                    }
                    else {
                        notificationMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updateRegionFailed, msg.regionName, msg.profileName);
                        vscode.window.showErrorMessage(notificationMsg);
                    }
                    if (compartmentUpdated) {
                        notificationMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updateCompartmentSucceeded, msg.selectedCompartmentFullname, msg.profileName);
                        vscode.window.showInformationMessage(notificationMsg);
                    }
                    else {
                        notificationMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updateCompartmentFailed, msg.selectedCompartmentFullname, msg.profileName);
                        vscode.window.showErrorMessage(notificationMsg);
                    }
                }
                break;
        }
    }
    static getInstance(ociExplorerModel) {
        if (this.cloudExplorerUIHandler == null) {
            this.cloudExplorerUIHandler = new OCIExplorerUIHandler(ociExplorerModel);
        }
        return this.cloudExplorerUIHandler;
    }
    handleDownloadWalletFileRequest(msg) {
        try {
            let request = msg;
            let walletPath = "";
            if (request.appendDatabaseName) {
                if (path.basename(request.filePath) == request.databaseName) {
                    walletPath = request.filePath;
                }
                else {
                    walletPath = path.join(request.filePath, request.databaseName);
                }
            }
            else {
                if (path.basename(request.filePath) == request.databaseName) {
                    walletPath = path.dirname(request.filePath);
                }
                else {
                    walletPath = request.filePath;
                }
            }
            let downloadWalletFilePathResponse = new autonomousDBModels_1.adbDownloadWalletFilePathResponse();
            downloadWalletFilePathResponse.filePath = walletPath;
            downloadWalletFilePathResponse.windowUri = msg.windowUri;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(msg.windowUri, msg.executionId, scriptExecutionModels_1.MessageName.adbDownloadWalletFilePathResponseMessage, downloadWalletFilePathResponse);
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    openDownloadCredentialsFileUI(connectionCommandsHandler, databaseInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield connectionCommandsHandler.openCreateProfileUI("", false, databaseInfo);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
            }
        });
    }
    openCreateConnectionUI(connectionCommandsHandler, databaseInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield connectionCommandsHandler.openCreateProfileUI("", false, databaseInfo);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
            }
        });
    }
    openCreateADBDatabaseUI(workloadNode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let existingPanel = null;
                if (this.reusableCreateADBDatabaseUIWindowUri && this.reusableCreateADBDatabaseUIExecutionId) {
                    const clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(this.reusableCreateADBDatabaseUIWindowUri, this.reusableCreateADBDatabaseUIExecutionId);
                    existingPanel = clients && clients.length > 0 ? clients[0].panel : null;
                }
                if (existingPanel) {
                    resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(this.reusableCreateADBDatabaseUIWindowUri, this.reusableCreateADBDatabaseUIExecutionId);
                    delete this.usedADBNames[this.reusableCreateADBDatabaseUIExecutionId];
                    this.updateCreateNewADBWindows();
                }
                else {
                    this.reusableCreateADBDatabaseUIWindowUri = workloadNode.getADBWindowURI();
                }
                let args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
                let rootNode = workloadNode.getRootNode();
                var explorerModel = ociExplorerModel_1.OCIExplorerModel.getInstance();
                this.reusableCreateADBDatabaseUIExecutionId = (++explorerModel.executionID).toString();
                args.uri = this.reusableCreateADBDatabaseUIWindowUri;
                args.executionId = this.reusableCreateADBDatabaseUIExecutionId;
                args.windowUri = this.reusableCreateADBDatabaseUIWindowUri;
                args.uiMode = scriptExecutionModels_1.UIDisplayMode.CreateAutonomousDatabase;
                args.windowTitle = workloadNode.getADWWindowTitle();
                args.profileName = rootNode.getProfileName();
                args.compartmentName = rootNode.getCompartmentName();
                args.adbWorkLoadType = workloadNode.getWorkLoadType();
                this.openOCIUI(args, "OracleCreateADBDatabaseModule", existingPanel, true, (uri, execId) => {
                    this.reusableCreateADBDatabaseUIWindowUri = args.windowUri;
                    this.reusableCreateADBDatabaseUIExecutionId = args.executionId;
                }, (uri, execId) => {
                    resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(uri, execId);
                    delete this.usedADBNames[execId];
                    this.updateCreateNewADBWindows();
                });
            }
            catch (error) {
                helper.logErroAfterValidating(error);
            }
        });
    }
    openNewOCIPage(args, panelType) {
        try {
            const clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri);
            clients.forEach(client => {
                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(client.ownerUri, client.executionId);
            });
            const existingPanel = clients && clients.length > 0 ? clients[0].panel : null;
            let panel = existingPanel;
            if (!panel) {
                panel = vscode.window.createWebviewPanel(panelType, args.windowTitle, vscode.ViewColumn.Active, {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                });
            }
            panel.title = args.windowTitle;
            panel.webview.html = scriptExcutionCommandHandler_1.ScriptExecutionCommandHandler.generateHtml(ociExplorerManager_1.OCIExplorerManager.Instance.vsCodeConnector, args);
            panel.onDidDispose(() => {
                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(args.windowUri);
            }, undefined, ociExplorerManager_1.OCIExplorerManager.Instance.vsCodeConnector.ExtensionContext.subscriptions);
            panel.onDidChangeViewState((e) => {
                if (e && e.webviewPanel) {
                    if (e.webviewPanel.active && e.webviewPanel.visible) {
                        DocumentConnectionInformation_1.fileLogger.info("Connection page is active and visible");
                    }
                }
            });
            panel.reveal(panel.viewColumn, false);
            if (existingPanel) {
                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(args.windowUri);
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, args.windowUri, args.executionId);
            if (!existingPanel) {
                let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri, args.executionId);
                if (clients) {
                    clients.forEach(client => {
                        resultsDataServer_1.ResultDataServer.instanceSingle.AssociateJavaScriptEventWithWindow(panel, client);
                    });
                }
            }
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    openOCIUI(args, viewType, existingPanel, refreshExistingPanel, uiSpecificLaunchHandler = null, uiSpecificDisposeHandler = null) {
        try {
            let panel = existingPanel;
            if (!panel) {
                panel = vscode.window.createWebviewPanel(viewType, args.windowTitle, vscode.ViewColumn.Active, {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                });
                panel.webview.html = scriptExcutionCommandHandler_1.ScriptExecutionCommandHandler.generateHtml(ociExplorerManager_1.OCIExplorerManager.Instance.vsCodeConnector, args);
                panel.title = args.windowTitle;
                panel.onDidDispose(() => {
                    uiSpecificDisposeHandler === null || uiSpecificDisposeHandler === void 0 ? void 0 : uiSpecificDisposeHandler(args.windowUri, args.executionId);
                }, undefined, ociExplorerManager_1.OCIExplorerManager.Instance.vsCodeConnector.ExtensionContext.subscriptions);
                panel.onDidChangeViewState((e) => {
                    if (e && e.webviewPanel) {
                        if (e.webviewPanel.active && e.webviewPanel.visible) {
                            DocumentConnectionInformation_1.fileLogger.info("Connection page is active and visible");
                        }
                    }
                });
                resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, args.windowUri, args.executionId);
                let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri, args.executionId);
                if (clients) {
                    clients.forEach(client => {
                        resultsDataServer_1.ResultDataServer.instanceSingle.AssociateJavaScriptEventWithWindow(panel, client);
                    });
                }
                uiSpecificLaunchHandler === null || uiSpecificLaunchHandler === void 0 ? void 0 : uiSpecificLaunchHandler(args.windowUri, args.executionId);
            }
            else if (refreshExistingPanel) {
                panel.onDidDispose(() => {
                    uiSpecificDisposeHandler === null || uiSpecificDisposeHandler === void 0 ? void 0 : uiSpecificDisposeHandler(args.windowUri, args.executionId);
                }, undefined, ociExplorerManager_1.OCIExplorerManager.Instance.vsCodeConnector.ExtensionContext.subscriptions);
                resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(existingPanel, args.windowUri, args.executionId);
                panel.webview.html = scriptExcutionCommandHandler_1.ScriptExecutionCommandHandler.generateHtml(ociExplorerManager_1.OCIExplorerManager.Instance.vsCodeConnector, args);
                panel.title = args.windowTitle;
                uiSpecificLaunchHandler === null || uiSpecificLaunchHandler === void 0 ? void 0 : uiSpecificLaunchHandler(args.windowUri, args.executionId);
            }
            panel.reveal(panel.viewColumn, false);
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    getWindowTitle(profileName, dbDisplayName, operationName) {
        let title = profileName;
        title = (dbDisplayName != null) ? `[${profileName}:${dbDisplayName}]` : `[${profileName}]`;
        return `${title} ${operationName}`;
    }
    launchChangeADBAdministratorPswdUI(execID, profileName, adbDisplayName, adbDatabaseID, compartmentFullPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
            let uri = helper.stringFormatterCsharpStyle(constants_1.Constants.ociChangePswdWindowUri, profileName, adbDatabaseID);
            args.uri = uri;
            args.executionId = execID;
            args.windowUri = uri;
            args.uiMode = scriptExecutionModels_1.UIDisplayMode.ChangeADBPassword;
            args.windowTitle = this.getWindowTitle(profileName, adbDisplayName, localizedConstants_1.default.ociChangePswdTitle);
            args.profileName = profileName;
            args.adbDatabaseID = adbDatabaseID;
            args.compartmentFullPath = compartmentFullPath;
            args.adbDisplayName = adbDisplayName;
            this.openNewOCIPage(args, "OCIChangePasswordModule");
        });
    }
    openOCICompartmentAndRegionPanel(execID, displayMode, profileName, regionName) {
        let args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
        let uri = helper.stringFormatterCsharpStyle(constants_1.Constants.ocicompartmentORRegionWindowUri, profileName);
        args.uri = uri;
        args.executionId = execID;
        args.windowUri = uri;
        args.uiMode = displayMode;
        args.regionName = regionName;
        args.windowTitle = this.getWindowTitle(profileName, null, localizedConstants_1.default.ociCompartmentTitle);
        args.profileName = profileName;
        let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri);
        const existingPanel = clients && clients.length > 0 ? clients[0].panel : null;
        this.openOCIUI(args, "OracleOCICompartmentModule", existingPanel, false, null, (uri, execId) => {
            resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(uri);
        });
    }
    canStartADBCreation(createNewdatabaseRequest, workLoadNode) {
        let startDBCreation = true;
        if (workLoadNode == null) {
            vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.adbCreationNotStartedProfileNotFound, createNewdatabaseRequest.profileName));
            startDBCreation = false;
        }
        return startDBCreation;
    }
    sendADBConnectionStringsData(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var adbConnectionStringsRequest = message;
                let profileNode = this.adbExplorerModel.getProfileNode(message.profileName);
                let dbNode = profileNode.getAutonomousDBNode(adbConnectionStringsRequest.adbDatabaseID);
                let connectionStringsResponse;
                logger_1.FileStreamLogger.Instance.info(`trying to get connection string`);
                if (dbNode.canGetConnectionString()) {
                    connectionStringsResponse = yield dbNode.getADBConnectionstrings();
                }
                else {
                    connectionStringsResponse = dbNode.getConnectionStringErrorMessage();
                }
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.ociGetConnectionstringsResponseMessage, connectionStringsResponse);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                vscode.window.showErrorMessage(error.message);
            }
        });
    }
    sendUpdateNetworkAccessTypeResponse(message) {
        try {
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.ociUpdateNetworkAccessTypeResponseMessage, message);
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    sendUpdateMTLSAuthenticationResponse(message) {
        try {
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.ociEditMutualAuthenticationResponseMessage, message);
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    getOCIVCNList(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let vcnRequest = msg;
            let vcnListResponse = new autonomousDBModels_1.ociVCNResponse();
            try {
                let profileNode = this.adbExplorerModel.getProfileNode(vcnRequest.profileName);
                let compartmentID = vcnRequest.compartmentID ? vcnRequest.compartmentID : profileNode.getcompartmentID();
                vcnListResponse.vcnData = yield autonomousDBUtils_1.AutonomousDBUtils.getVCNList(profileNode.getAccountComponent().AuthProvider, compartmentID);
                vcnListResponse.compartmentName = vcnRequest.compartmentName;
                vcnListResponse.compartmentID = vcnRequest.compartmentID;
                vcnListResponse.moduleID = vcnRequest.moduleID;
                vcnListResponse.vcnOptionInitValue = vcnRequest.vcnOptionInitValue;
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(msg.windowUri, msg.executionId, scriptExecutionModels_1.MessageName.ociVCNListResponseMessage, vcnListResponse);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                vcnListResponse.errorMessage = error.message ? error.message : localizedConstants_1.default.unKnownError;
                vcnListResponse.moduleID = vcnRequest.moduleID;
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(msg.windowUri, msg.executionId, scriptExecutionModels_1.MessageName.ociVCNListResponseMessage, vcnListResponse);
                let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToVCNListForCompartment, vcnRequest.compartmentName, error.message);
                vscode.window.showErrorMessage(errorMessage);
            }
        });
    }
    getInitializeNetworkAccessTypeData(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let dbNode = null;
            try {
                let message = msg;
                let profileNode = this.adbExplorerModel.getProfileNode(message.profileName);
                dbNode = profileNode.getAutonomousDBNode(message.adbDatabaseID);
                let networkAccessData = yield dbNode.getADBNetworkAccessData();
                if (networkAccessData) {
                    let response = new autonomousDBModels_1.ociInitializeNetworkAccessTypeResponse();
                    response.whitelistedIps = networkAccessData.whitelistedIps;
                    ;
                    response.dedicated = dbNode.adbInstanceNodeProperties.dedicated;
                    response.isAccessControlEnabled = networkAccessData.isAccessControlEnabled;
                    response.isMtlsConnectionRequired = networkAccessData.isMtlsConnectionRequired;
                    response.networkAccessLaunchSource = response.dedicated ? autonomousDBModels_1.updateNetworkAccessLaunchSource.UpdateNetworkAccessContextmenuForDedicatedDB
                        : autonomousDBModels_1.updateNetworkAccessLaunchSource.UpdateNetworkAccessContextmenuForSharedDB;
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(msg.windowUri, msg.executionId, scriptExecutionModels_1.MessageName.initializeNetworkAccessTypeResponseMessage, response);
                }
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetNetworkAccessDataForADB, dbNode.adbInstanceNodeProperties.adbInstanceDisplayName, error.message);
                logger_1.ChannelLogger.Instance.error(errorMessage);
                vscode.window.showErrorMessage(errorMessage);
            }
        });
    }
    getInitializeMutualAuthenticationData(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let dbNode = null;
            try {
                let message = msg;
                let profileNode = this.adbExplorerModel.getProfileNode(message.profileName);
                dbNode = profileNode.getAutonomousDBNode(message.adbDatabaseID);
                let mtlsConnectionRequired = yield (dbNode === null || dbNode === void 0 ? void 0 : dbNode.getMTLSAuthentication());
                if (mtlsConnectionRequired) {
                    let response = new autonomousDBModels_1.ociInitializeNetworkAccessTypeResponse();
                    response.isMtlsConnectionRequired = mtlsConnectionRequired[0];
                    response.whitelistedIps = mtlsConnectionRequired[1];
                    response.networkAccessLaunchSource = response.dedicated ? autonomousDBModels_1.updateNetworkAccessLaunchSource.UpdateNetworkAccessContextmenuForDedicatedDB
                        : autonomousDBModels_1.updateNetworkAccessLaunchSource.UpdateNetworkAccessContextmenuForSharedDB;
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(msg.windowUri, msg.executionId, scriptExecutionModels_1.MessageName.initializeMutualAuthenticationTypeRequestMessage, response);
                }
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGeAuthenticatonValueForADB, dbNode.adbInstanceNodeProperties.adbInstanceDisplayName, error.message);
                logger_1.ChannelLogger.Instance.error(errorMessage);
                vscode.window.showErrorMessage(errorMessage);
            }
        });
    }
    updateNetworkAccessType(msg) {
        try {
            let message = msg;
            let profileNode = this.adbExplorerModel.getProfileNode(message.profileName);
            let dbNode = profileNode.getAutonomousDBNode(message.adbDatabaseID);
            dbNode.updateNetworkAccessType(message, (param) => {
                this.adbExplorerModel.modelChanged.emit(this.adbExplorerModel.MODEL_CHANGED, param);
            });
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    updateMutualAuthentication(msg) {
        try {
            let message = msg;
            let profileNode = this.adbExplorerModel.getProfileNode(message.profileName);
            let dbNode = profileNode.getAutonomousDBNode(message.adbDatabaseID);
            dbNode.updateMutualAuthentication(message, (param) => {
                this.adbExplorerModel.modelChanged.emit(this.adbExplorerModel.MODEL_CHANGED, param);
            });
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    getPublicIPAddressRequest(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let request = msg;
                var response = yield autonomousDBUtils_1.AutonomousDBUtils.getPublicIPAddress({ windowUri: request.windowUri });
                let ipAddressResponse = new autonomousDBModels_1.GetPublicIPAddressResponse();
                ipAddressResponse.windowUri = response.windowUri;
                ipAddressResponse.ipAddress = response.publicIPAddress;
                ipAddressResponse.status = ipAddressResponse.ipAddress ? autonomousDBModels_1.operationStatus.Success : autonomousDBModels_1.operationStatus.Error;
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(msg.windowUri, msg.executionId, scriptExecutionModels_1.MessageName.ociGetPublicIPAddressResponseMessage, ipAddressResponse);
                if (ipAddressResponse.status == autonomousDBModels_1.operationStatus.Error) {
                    vscode.window.showErrorMessage(localizedConstants_1.default.adbPublicIPAddressError);
                }
            }
            catch (error) {
                helper.logErroAfterValidating(error);
            }
        });
    }
    openGetADBConnectionStringsUI(connectionCommandsHandler, databaseInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield connectionCommandsHandler.openCreateProfileUI("", false, databaseInfo);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
            }
        });
    }
    launchGetADBConnectionStringsUI(execID, profileName, adbDisplayName, adbDatabaseID, compartmentFullPath, adbworkloadType) {
        return __awaiter(this, void 0, void 0, function* () {
            let args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
            let uri = constants_1.Constants.ociGetADBConnectionStringsUri;
            args.uri = uri;
            args.executionId = execID;
            args.windowUri = uri;
            args.uiMode = scriptExecutionModels_1.UIDisplayMode.getADBConnectionStrings;
            args.windowTitle = `${localizedConstants_1.default.ociConnectionStringsTitle} : ${adbDisplayName}`;
            args.profileName = profileName;
            args.adbDatabaseID = adbDatabaseID;
            args.compartmentFullPath = compartmentFullPath;
            args.adbDisplayName = adbDisplayName;
            args.adbWorkLoadType = adbworkloadType;
            let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri);
            const existingPanel = clients && clients.length > 0 ? clients[0].panel : null;
            this.openOCIUI(args, "ociGetADBConnectionStringsModule", existingPanel, true, null, (uri, execId) => {
                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(uri);
            });
        });
    }
    launchConfigureWalletlessConnectivityAndNetworkAccessUI(execID, dbInfo, compartmentName, compartmentFullPath, adbworkloadType) {
        return __awaiter(this, void 0, void 0, function* () {
            let args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
            let uri = constants_1.Constants.ociEditmTLSAuthenticationUri;
            args.uri = uri;
            args.executionId = execID;
            args.windowUri = uri;
            args.uiMode = scriptExecutionModels_1.UIDisplayMode.configureWalletlessConnectivityAndNetworkAccess;
            let title = dbInfo.dedicated ? localizedConstants_1.default.adbConfigureDatabaseAccessControl : localizedConstants_1.default.adbConfigureWalletlessConnectivityandNetworkAccess;
            args.windowTitle = this.getWindowTitle(dbInfo.profileName, dbInfo.adbInstanceDisplayName, title);
            args.profileName = dbInfo.profileName;
            args.adbDatabaseID = dbInfo.adbInstanceID;
            args.compartmentFullPath = compartmentFullPath;
            args.compartmentName = compartmentName;
            args.adbDisplayName = dbInfo.adbInstanceDisplayName;
            args.adbWorkLoadType = adbworkloadType;
            let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri);
            const existingPanel = clients && clients.length > 0 ? clients[0].panel : null;
            this.openOCIUI(args, "adbConfigureWalletlessConnectivityAndNetworkAccessModule", existingPanel, true, null, (uri, execId) => {
                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(uri);
            });
        });
    }
}
exports.OCIExplorerUIHandler = OCIExplorerUIHandler;
OCIExplorerUIHandler.cloudExplorerUIHandler = null;
