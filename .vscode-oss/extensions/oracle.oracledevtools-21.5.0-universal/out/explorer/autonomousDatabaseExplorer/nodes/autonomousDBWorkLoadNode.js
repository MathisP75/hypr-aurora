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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADBJSONWorkLoadNode = exports.ADWWorkLoadNode = exports.ATPWorkLoadNode = exports.ADBWorkLoadNode = exports.CreateNewAutonomousDatabase = exports.CreateNewAutonomousDatabaseData = void 0;
const vscode = require("vscode");
const treeNodeBase_1 = require("../../treeNodeBase");
const iExplorerNode_1 = require("../../iExplorerNode");
const utilities_1 = require("../../utilities");
const ociExplorerModel_1 = require("../ociExplorerModel");
const autonomousDBInstanceNode_1 = require("./autonomousDBInstanceNode");
const helper = require("../../../utilities/helper");
const localizedConstants_1 = require("../../../constants/localizedConstants");
const database = require("oci-database");
const autonomousDBModels_1 = require("../../../models/autonomousDBModels");
const constants_1 = require("../../../constants/constants");
const adbInstanceStatusHandler_1 = require("../adbInstanceStatusHandler");
const autonomousDBUtils_1 = require("../autonomousDBUtils");
const logger_1 = require("../../../infrastructure/logger");
var DbWorkload;
(function (DbWorkload) {
    DbWorkload["Oltp"] = "OLTP";
    DbWorkload["Dw"] = "DW";
    DbWorkload["Ajd"] = "AJD";
    DbWorkload["Apex"] = "APEX";
})(DbWorkload || (DbWorkload = {}));
var LicenseModel;
(function (LicenseModel) {
    LicenseModel["LicenseIncluded"] = "LICENSE_INCLUDED";
    LicenseModel["BringYourOwnLicense"] = "BRING_YOUR_OWN_LICENSE";
})(LicenseModel || (LicenseModel = {}));
class CreateNewAutonomousDatabaseData {
    constructor() {
        this.whitelistedIps = [];
        this.isMtlsConnectionRequired = true;
    }
}
exports.CreateNewAutonomousDatabaseData = CreateNewAutonomousDatabaseData;
class CreateNewAutonomousDatabase {
    static createAndGetADBDatabaseNode(response, workLoadNode) {
        let instanceNode = null;
        let profileNode = workLoadNode.getRootNode();
        var ociDatabaseProperties = new autonomousDBInstanceNode_1.AutonomousDBInfo();
        ociDatabaseProperties.adbInstanceDisplayName = response.autonomousDatabase.displayName;
        ociDatabaseProperties.adbInstanceID = response.autonomousDatabase.id;
        ociDatabaseProperties.adbInstanceName = response.autonomousDatabase.dbName;
        ociDatabaseProperties.adbInstanceStatus = autonomousDBUtils_1.AutonomousDBUtils.getADBLifeCycleStateFromOCIADBLifeCycleState(response.autonomousDatabase.lifecycleState);
        ociDatabaseProperties.alwaysFree = response.autonomousDatabase.isFreeTier;
        ociDatabaseProperties.dedicated = response.autonomousDatabase.isDedicated;
        ociDatabaseProperties.serviceConsoleUrl = response.autonomousDatabase.serviceConsoleUrl;
        ociDatabaseProperties.profileName = profileNode.getProfileName();
        instanceNode = new autonomousDBInstanceNode_1.AutonomousDBInstance(ociDatabaseProperties, workLoadNode, profileNode);
        return instanceNode;
    }
    static getCreateAutonomousDBInitializationData(rootNode, workloadtype) {
        return __awaiter(this, void 0, void 0, function* () {
            let createNewAutonomousDatabaseData = new CreateNewAutonomousDatabaseData();
            let defaultDBName = autonomousDBUtils_1.AutonomousDBUtils.getdefaultDatabaseName();
            createNewAutonomousDatabaseData.userName = "ADMIN";
            createNewAutonomousDatabaseData.alwaysFree = true;
            createNewAutonomousDatabaseData.dedicated = false;
            createNewAutonomousDatabaseData.cpuCoreCount = 1;
            createNewAutonomousDatabaseData.storage = 1;
            createNewAutonomousDatabaseData.autoScaling = true;
            createNewAutonomousDatabaseData.displayName = defaultDBName;
            createNewAutonomousDatabaseData.workLoadType = workloadtype;
            createNewAutonomousDatabaseData.dbName = defaultDBName;
            createNewAutonomousDatabaseData.compartmentFullPathForDisplay = rootNode.getcompartmentFullPathForDisplay();
            createNewAutonomousDatabaseData.compartmentID = rootNode.getcompartmentID();
            createNewAutonomousDatabaseData.profileName = rootNode.getProfileName();
            createNewAutonomousDatabaseData.licenseType = (workloadtype == autonomousDBModels_1.ADBworkLoadType.AJD) ? autonomousDBModels_1.ADBLicenseType.SubscribeToNewLicense : autonomousDBModels_1.ADBLicenseType.BringYourLicense;
            createNewAutonomousDatabaseData.compartmentData = yield rootNode.getCompartmentListForTenancyNode();
            createNewAutonomousDatabaseData.workloadSupportedDBVersionsList = yield rootNode.getSupportedDBVersionListForTenancy();
            return createNewAutonomousDatabaseData;
        });
    }
    static getLicenseType(licenseType) {
        let licenseModel = LicenseModel.BringYourOwnLicense;
        if (licenseType) {
            licenseModel = ((licenseType == autonomousDBModels_1.ADBLicenseType.BringYourLicense) ? LicenseModel.BringYourOwnLicense : LicenseModel.LicenseIncluded);
        }
        return licenseModel;
    }
    static getWorkloadType(adbWorkloadNodeType) {
        let dbWorkload = DbWorkload.Oltp;
        switch (adbWorkloadNodeType) {
            case autonomousDBModels_1.ADBworkLoadType.OLTP:
                dbWorkload = DbWorkload.Oltp;
                break;
            case autonomousDBModels_1.ADBworkLoadType.DW:
                dbWorkload = DbWorkload.Dw;
                break;
            case autonomousDBModels_1.ADBworkLoadType.AJD:
                dbWorkload = DbWorkload.Ajd;
                break;
            default:
                break;
        }
        return dbWorkload;
    }
    static getAutonomousContainerDatabases(adbContainerDBRequest, accountComponent) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, error) => __awaiter(this, void 0, void 0, function* () {
                var e_1, _a;
                let containerDBresponse = new autonomousDBModels_1.autonomousContainerDatabasesResponse();
                try {
                    logger_1.FileStreamLogger.Instance.info("Fetching container databases for selected compartment");
                    const autonomousContainerDatabaseRequest = {
                        compartmentId: adbContainerDBRequest.compartmentID,
                        lifecycleState: database.models.AutonomousContainerDatabaseSummary.LifecycleState.Available
                    };
                    let containerDatabases = accountComponent.ServicesClients.DatabaseServiceClient.listAllAutonomousContainerDatabases(autonomousContainerDatabaseRequest);
                    logger_1.FileStreamLogger.Instance.info("Received data from ListAutonomousContainerDatabasesRequest");
                    let adbContainerDBResponse = null;
                    containerDBresponse.windowUri = adbContainerDBRequest.windowUri;
                    containerDBresponse.executionId = adbContainerDBRequest.executionId;
                    try {
                        for (var containerDatabases_1 = __asyncValues(containerDatabases), containerDatabases_1_1; containerDatabases_1_1 = yield containerDatabases_1.next(), !containerDatabases_1_1.done;) {
                            const response = containerDatabases_1_1.value;
                            adbContainerDBResponse = new autonomousDBModels_1.autonomousContainerDBResponse();
                            adbContainerDBResponse.containerDatabaseID = response.id;
                            adbContainerDBResponse.compartmentId = response.compartmentId;
                            adbContainerDBResponse.displayName = response.displayName;
                            adbContainerDBResponse.dbUniqueName = response.dbVersion;
                            containerDBresponse.adbContainerDatabases.push(adbContainerDBResponse);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (containerDatabases_1_1 && !containerDatabases_1_1.done && (_a = containerDatabases_1.return)) yield _a.call(containerDatabases_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    if (containerDBresponse.adbContainerDatabases.length > 0) {
                        logger_1.FileStreamLogger.Instance.info("Fetched container databases for selected compartment");
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info("No container databases found for selected compartment");
                    }
                    resolve(containerDBresponse);
                }
                catch (error) {
                    helper.logErroAfterValidating(error);
                    if (error && error.message) {
                        let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.getAutonomousDBContainerDatabasesFailed, adbContainerDBRequest.compartmentName, error.message);
                        logger_1.ChannelLogger.Instance.info(errorMessage);
                        vscode.window.showErrorMessage(errorMessage);
                        containerDBresponse.errorMessage = error.message;
                    }
                    resolve(containerDBresponse);
                }
            }));
        });
    }
    static updateModel(param) {
        ociExplorerModel_1.OCIExplorerModel.getInstance().EmitModelChangeEvent(param);
    }
    static logDBCreateInfoToOutputWindow(createNewdatabaseRequest) {
        try {
            logger_1.ChannelLogger.Instance.info(` ${localizedConstants_1.default.database}: ${createNewdatabaseRequest.displayName} - ${autonomousDBModels_1.LifecycleState.Provisioning}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.profile}: ${createNewdatabaseRequest.profileName}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.compartment}: ${createNewdatabaseRequest.compartmentFullPath}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.workloadType}: ${autonomousDBUtils_1.AutonomousDBUtils.getworkLoadTypeDisplayString(createNewdatabaseRequest.workLoadType)}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.databaseName}: ${createNewdatabaseRequest.dbName}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.displayName}: ${createNewdatabaseRequest.displayName}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.alwaysFree}: ${createNewdatabaseRequest.alwaysFree ? true : false}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.deploymentType}: ${createNewdatabaseRequest.dedicated ? localizedConstants_1.default.dedicatedInfrastructure : localizedConstants_1.default.sharedInfrastructure}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.databaseVersion}: ${createNewdatabaseRequest.dbVersion}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.OCPUCount}: ${createNewdatabaseRequest.cpuCoreCount}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.storage}: ${createNewdatabaseRequest.storage}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.autoScaling}: ${createNewdatabaseRequest.autoScaling ? true : false}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.licenseType}: ${autonomousDBUtils_1.AutonomousDBUtils.getLicenseTypeDisplayString(createNewdatabaseRequest.licenseType)}`);
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    static createNewAutonomousDatabase(createNewdatabaseRequest, workLoadNode) {
        let createAutonomousDatabaseRequest = null;
        try {
            vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.autonomousCreatingDB, createNewdatabaseRequest.displayName));
            if (createNewdatabaseRequest.dedicated) {
                createAutonomousDatabaseRequest = {
                    createAutonomousDatabaseDetails: {
                        source: "NONE",
                        compartmentId: createNewdatabaseRequest.compartmentID,
                        dbName: createNewdatabaseRequest.dbName,
                        displayName: createNewdatabaseRequest.displayName,
                        isDedicated: createNewdatabaseRequest.dedicated,
                        isFreeTier: createNewdatabaseRequest.alwaysFree,
                        dbWorkload: CreateNewAutonomousDatabase.getWorkloadType(createNewdatabaseRequest.workLoadType),
                        adminPassword: String.fromCodePoint(...createNewdatabaseRequest.password),
                        dataStorageSizeInTBs: createNewdatabaseRequest.storage,
                        cpuCoreCount: createNewdatabaseRequest.cpuCoreCount,
                        isAutoScalingEnabled: createNewdatabaseRequest.autoScaling,
                        autonomousContainerDatabaseId: createNewdatabaseRequest.autonomousContainerDatabaseId,
                        isAccessControlEnabled: createNewdatabaseRequest.isAccessControlEnabled,
                        whitelistedIps: createNewdatabaseRequest.whitelistedIps,
                    }
                };
                let arr = createNewdatabaseRequest.password;
                createNewdatabaseRequest.password = null;
                if (arr !== undefined && arr !== null && arr.length > 0) {
                    arr.fill(0);
                    arr.splice(0, arr.length);
                    arr = null;
                }
            }
            else {
                let adbCreateRequest = {
                    source: "NONE",
                    compartmentId: createNewdatabaseRequest.compartmentID,
                    dbName: createNewdatabaseRequest.dbName,
                    displayName: createNewdatabaseRequest.displayName,
                    isDedicated: createNewdatabaseRequest.dedicated,
                    isFreeTier: createNewdatabaseRequest.alwaysFree,
                    dbWorkload: CreateNewAutonomousDatabase.getWorkloadType(createNewdatabaseRequest.workLoadType),
                    adminPassword: String.fromCodePoint(...createNewdatabaseRequest.password),
                    dataStorageSizeInTBs: createNewdatabaseRequest.storage,
                    cpuCoreCount: createNewdatabaseRequest.cpuCoreCount,
                    isAutoScalingEnabled: createNewdatabaseRequest.autoScaling,
                    autonomousContainerDatabaseId: createNewdatabaseRequest.autonomousContainerDatabaseId,
                    licenseModel: CreateNewAutonomousDatabase.getLicenseType(createNewdatabaseRequest.licenseType),
                    dbVersion: createNewdatabaseRequest.dbVersion,
                    whitelistedIps: createNewdatabaseRequest.whitelistedIps,
                    isMtlsConnectionRequired: createNewdatabaseRequest.isMtlsConnectionRequired
                };
                createAutonomousDatabaseRequest = {
                    createAutonomousDatabaseDetails: adbCreateRequest
                };
                let arr = createNewdatabaseRequest.password;
                createNewdatabaseRequest.password = null;
                if (arr !== undefined && arr !== null && arr.length > 0) {
                    arr.fill(0);
                    arr.splice(0, arr.length);
                    arr = null;
                }
            }
            CreateNewAutonomousDatabase.logDBCreateInfoToOutputWindow(createNewdatabaseRequest);
            workLoadNode.getAccountComponent().ServicesClients.DatabaseServiceClient.createAutonomousDatabase(createAutonomousDatabaseRequest).
                then((response) => __awaiter(this, void 0, void 0, function* () {
                yield workLoadNode.addADBDatabaseNodeOrRefresh(CreateNewAutonomousDatabase.createAndGetADBDatabaseNode(response, workLoadNode));
                let adbDatabaseNode = workLoadNode.getADBDatabaseNode(response.autonomousDatabase.id);
                if (adbDatabaseNode) {
                    var adbInstanceStateHandler = new adbInstanceStatusHandler_1.adbInstanceStatusHandler(workLoadNode.getAccountComponent(), adbDatabaseNode, new Date().getTime(), this.updateModel, autonomousDBModels_1.ADBDatabaseOperation.createDatabase, createNewdatabaseRequest, new adbInstanceStatusHandler_1.adbOutputWindowMessageHandler(autonomousDBModels_1.ADBDatabaseOperation.createDatabase));
                    yield adbInstanceStateHandler.getAutonomousDatabasePropertiesPeriodically();
                }
            }), (error) => {
                helper.logErroAfterValidating(error);
                let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.autonomousCreateDBFailed, createNewdatabaseRequest.displayName, error.message);
                logger_1.ChannelLogger.Instance.error(errorMessage);
                vscode.window.showErrorMessage(errorMessage);
                ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendCreateNewAutonomousDBResponse(autonomousDBUtils_1.AutonomousDBUtils.getCreateDBResponse(createNewdatabaseRequest, false));
            });
        }
        catch (err) {
            helper.logErroAfterValidating(err);
            let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.autonomousCreateDBFailed, createNewdatabaseRequest.displayName, err.message);
            logger_1.ChannelLogger.Instance.error(errorMessage);
            vscode.window.showErrorMessage(errorMessage);
            ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendCreateNewAutonomousDBResponse(autonomousDBUtils_1.AutonomousDBUtils.getCreateDBResponse(createNewdatabaseRequest, false));
        }
        finally {
            if (createNewdatabaseRequest !== undefined && createNewdatabaseRequest !== null &&
                createNewdatabaseRequest.password !== undefined && createNewdatabaseRequest.password !== null) {
                let arr = createNewdatabaseRequest.password;
                createNewdatabaseRequest.password = null;
                if (arr !== undefined && arr !== null && arr.length > 0) {
                    arr.fill(0);
                    arr.splice(0, arr.length);
                    arr = null;
                }
            }
        }
    }
}
exports.CreateNewAutonomousDatabase = CreateNewAutonomousDatabase;
class ADBWorkLoadNode extends treeNodeBase_1.TreeNodeBase {
    constructor(connectionURI, parentPath, nodeID, nodeType, contextValue, iconPath, schemaName, nodeLabel, rootNode, accountComponent) {
        super(connectionURI, parentPath, nodeID, nodeType, contextValue, iconPath, schemaName, nodeLabel);
        this.rootNode = rootNode;
        this.accountComponent = accountComponent;
        this.expandNode = false;
        this.fetchDatabaseInstances = true;
    }
    getWorkloadNodeName() {
        let workloadName = localizedConstants_1.default.ATPWorkloadNode;
        switch (this.adbworkLoadType) {
            case autonomousDBModels_1.ADBworkLoadType.OLTP:
                workloadName = localizedConstants_1.default.ATPWorkloadNode;
                break;
            case autonomousDBModels_1.ADBworkLoadType.DW:
                workloadName = localizedConstants_1.default.ADWWorkloadNode;
                break;
            case autonomousDBModels_1.ADBworkLoadType.AJD:
                workloadName = localizedConstants_1.default.AJDWorkloadNode;
                break;
            default:
                break;
        }
        return workloadName;
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            this.fetchDatabaseInstances = true;
            try {
                yield this.fetcADBInstances();
                this.updateModel(this);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorRefreshingworkLoadNode, this.getWorkloadNodeName(), this.rootNode.getProfileName(), error.message);
                logger_1.ChannelLogger.Instance.error(errorMessage);
                vscode.window.showErrorMessage(errorMessage);
            }
        });
    }
    getNodeExpansionState() {
        return this.expandNode ? vscode.TreeItemCollapsibleState.Expanded : this.getExpansionState();
    }
    fetcADBInstances() {
        var e_2, _a;
        return __awaiter(this, void 0, void 0, function* () {
            let listAutonomousDatabasesRequest;
            let compartmentID = this.rootNode.getcompartmentID();
            switch (this.adbworkLoadType) {
                case autonomousDBModels_1.ADBworkLoadType.OLTP:
                    listAutonomousDatabasesRequest = {
                        compartmentId: compartmentID,
                        dbWorkload: "OLTP"
                    };
                    break;
                case autonomousDBModels_1.ADBworkLoadType.DW:
                    listAutonomousDatabasesRequest = {
                        compartmentId: compartmentID,
                        dbWorkload: "DW"
                    };
                    break;
                case autonomousDBModels_1.ADBworkLoadType.AJD:
                    listAutonomousDatabasesRequest = {
                        compartmentId: compartmentID,
                        dbWorkload: "AJD"
                    };
                    break;
            }
            try {
                const adbInstances = this.accountComponent.ServicesClients.DatabaseServiceClient.listAllAutonomousDatabases(listAutonomousDatabasesRequest);
                this.children = [];
                let adbstate = autonomousDBModels_1.LifecycleState.UnknownValue;
                try {
                    for (var adbInstances_1 = __asyncValues(adbInstances), adbInstances_1_1; adbInstances_1_1 = yield adbInstances_1.next(), !adbInstances_1_1.done;) {
                        const atpInstance = adbInstances_1_1.value;
                        adbstate = autonomousDBUtils_1.AutonomousDBUtils.getADBLifeCycleStateFromOCIADBSummaryLifeCycleState(atpInstance.lifecycleState);
                        var ociDatabaseProperties = new autonomousDBInstanceNode_1.AutonomousDBInfo();
                        ociDatabaseProperties.adbInstanceDisplayName = atpInstance.displayName;
                        ociDatabaseProperties.adbInstanceID = atpInstance.id;
                        ociDatabaseProperties.adbInstanceName = atpInstance.dbName;
                        ociDatabaseProperties.adbInstanceStatus = adbstate;
                        ociDatabaseProperties.alwaysFree = atpInstance.isFreeTier;
                        ociDatabaseProperties.dedicated = atpInstance.isDedicated;
                        ociDatabaseProperties.profileName = this.rootNode.getProfileName();
                        ociDatabaseProperties.serviceConsoleUrl = atpInstance.serviceConsoleUrl;
                        ociDatabaseProperties.whitelistedIps = atpInstance.whitelistedIps;
                        ociDatabaseProperties.isAccessControlEnabled = atpInstance.isAccessControlEnabled;
                        this.children.push(new autonomousDBInstanceNode_1.AutonomousDBInstance(ociDatabaseProperties, this, this.rootNode));
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (adbInstances_1_1 && !adbInstances_1_1.done && (_a = adbInstances_1.return)) yield _a.call(adbInstances_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                this.fetchDatabaseInstances = false;
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateModel(param) {
        ociExplorerModel_1.OCIExplorerModel.getInstance().EmitModelChangeEvent(param);
    }
    addADBDatabaseNodeOrRefresh(childNode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.children) {
                this.children.push(childNode);
                this.updateModel(this);
            }
            else {
                yield this.refresh();
            }
        });
    }
    getADBDatabaseNode(adbDatabaseID) {
        let adbDatabaseNode = null;
        let adbDatabaseFoundNode = null;
        if (this.children && this.children.length > 0) {
            for (var node of this.children) {
                adbDatabaseFoundNode = node;
                if (adbDatabaseFoundNode.adbInstanceNodeProperties.adbInstanceID == adbDatabaseID) {
                    adbDatabaseNode = adbDatabaseFoundNode;
                    break;
                }
            }
        }
        return adbDatabaseNode;
    }
    updateChildren(childNode) {
        if (this.children && this.children.length > 0) {
            var dbInstanceNode = null;
            var childFound = false;
            for (var node of this.children) {
                dbInstanceNode = node;
                if (dbInstanceNode.getNodeIdentifier == childNode.getNodeIdentifier) {
                    dbInstanceNode.adbInstanceNodeProperties.adbInstanceStatus = childNode.adbInstanceNodeProperties.adbInstanceStatus;
                    childFound = true;
                    break;
                }
            }
            if (childFound) {
                this.updateModel(this);
            }
        }
    }
    getAccountComponent() {
        return this.accountComponent;
    }
    getCreateAutonomousDBInitializationData() {
        return __awaiter(this, void 0, void 0, function* () {
            let createNewAutonomousDatabaseData = yield CreateNewAutonomousDatabase.getCreateAutonomousDBInitializationData(this.rootNode, this.adbworkLoadType);
            return createNewAutonomousDatabaseData;
        });
    }
    getTreeItem() {
        const treeItemObject = {};
        treeItemObject.label = this.getNodeIdentifier;
        treeItemObject.collapsibleState = this.getNodeExpansionState();
        treeItemObject.contextValue = this.getContextValue;
        treeItemObject.iconPath = this.getIconPath;
        treeItemObject.command = this.getCommandObject();
        return treeItemObject;
    }
    getADWWindowTitle() {
        let title = localizedConstants_1.default.adbCreateADB;
        return title;
    }
    getADBWindowURI() {
        return constants_1.Constants.adbCreateNewDatabaseWindowUri;
    }
    getWorkLoadType() {
        return this.adbworkLoadType;
    }
    getRootNode() {
        return this.rootNode;
    }
    getInstanceNode(instanceName) {
        let adbInstanceNode = null;
        let adbNode = null;
        for (var node of this.children) {
            adbNode = node;
            if (adbNode.getNodeIdentifier == instanceName) {
                adbInstanceNode = adbNode;
                break;
            }
        }
        return adbInstanceNode;
    }
    CreateNewAutonomousDatabase(createNewdatabaseRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            CreateNewAutonomousDatabase.createNewAutonomousDatabase(createNewdatabaseRequest, this);
        });
    }
    getAutonomousContainerDatabases(adbContainerDBRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            CreateNewAutonomousDatabase.getAutonomousContainerDatabases(adbContainerDBRequest, this.accountComponent).
                then((adbContainerDatabases) => {
                ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendAutonomousContainerDatabases(adbContainerDatabases);
            }, (error) => {
            });
        });
    }
    LaunchCreateNewDatabaseUI() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var explorerModel = ociExplorerModel_1.OCIExplorerModel.getInstance();
                explorerModel.ociExplorerUIHandler.openCreateADBDatabaseUI(this);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
            }
        });
    }
}
exports.ADBWorkLoadNode = ADBWorkLoadNode;
class ATPWorkLoadNode extends ADBWorkLoadNode {
    constructor(name, rootNode) {
        super("", "", name, iExplorerNode_1.ExplorerNodeType.Category, utilities_1.TreeViewConstants.ociWorkloadItemStr, new vscode.ThemeIcon('file-directory'), "", "", rootNode, rootNode.getAccountComponent());
        this.adbworkLoadType = autonomousDBModels_1.ADBworkLoadType.OLTP;
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.fetchDatabaseInstances) {
                    yield this.fetcADBInstances();
                }
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                this.children = [];
                let msg = null;
                if (this.rootNode.getcompartmentFullPathForDisplay()) {
                    msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorGettingADBInstancesForWorkloadNode, localizedConstants_1.default.ATPWorkloadNode, this.rootNode.getcompartmentFullPathForDisplay(), this.rootNode.tenancyName, error.message);
                }
                else {
                    msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorGettingADBInstancesForRootNode, localizedConstants_1.default.ATPWorkloadNode, this.rootNode.tenancyName, error.message);
                }
                vscode.window.showErrorMessage(msg);
            }
            return this.children;
        });
    }
}
exports.ATPWorkLoadNode = ATPWorkLoadNode;
class ADWWorkLoadNode extends ADBWorkLoadNode {
    constructor(name, rootNode) {
        super("", "", name, iExplorerNode_1.ExplorerNodeType.Category, utilities_1.TreeViewConstants.ociWorkloadItemStr, new vscode.ThemeIcon('file-directory'), "", "", rootNode, rootNode.getAccountComponent());
        this.adbworkLoadType = autonomousDBModels_1.ADBworkLoadType.DW;
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.fetchDatabaseInstances) {
                    yield this.fetcADBInstances();
                }
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                this.children = [];
                let msg = null;
                if (this.rootNode.getcompartmentFullPathForDisplay()) {
                    msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorGettingADBInstancesForWorkloadNode, localizedConstants_1.default.ADWWorkloadNode, this.rootNode.getcompartmentFullPathForDisplay(), this.rootNode.tenancyName, error.message);
                }
                else {
                    msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorGettingADBInstancesForRootNode, localizedConstants_1.default.ADWWorkloadNode, this.rootNode.tenancyName, error.message);
                }
                vscode.window.showErrorMessage(msg);
            }
            return this.children;
        });
    }
}
exports.ADWWorkLoadNode = ADWWorkLoadNode;
class ADBJSONWorkLoadNode extends ADBWorkLoadNode {
    constructor(name, rootNode) {
        super("", "", name, iExplorerNode_1.ExplorerNodeType.Category, utilities_1.TreeViewConstants.ociWorkloadItemStr, new vscode.ThemeIcon('file-directory'), "", "", rootNode, rootNode.getAccountComponent());
        this.adbworkLoadType = autonomousDBModels_1.ADBworkLoadType.AJD;
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.fetchDatabaseInstances) {
                    yield this.fetcADBInstances();
                }
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                this.children = [];
                let msg = null;
                if (this.rootNode.getcompartmentFullPathForDisplay()) {
                    msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorGettingADBInstancesForWorkloadNode, localizedConstants_1.default.AJDWorkloadNode, this.rootNode.getcompartmentFullPathForDisplay(), this.rootNode.tenancyName, error.message);
                }
                else {
                    msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorGettingADBInstancesForRootNode, localizedConstants_1.default.AJDWorkloadNode, this.rootNode.tenancyName, error.message);
                }
                vscode.window.showErrorMessage(msg);
            }
            return this.children;
        });
    }
}
exports.ADBJSONWorkLoadNode = ADBJSONWorkLoadNode;
