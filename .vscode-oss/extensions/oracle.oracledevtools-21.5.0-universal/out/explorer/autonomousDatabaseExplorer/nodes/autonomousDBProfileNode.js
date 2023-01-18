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
exports.dbVersionsInTenancyForRegion = exports.AutonomousDBProfileNode = void 0;
const vscode = require("vscode");
const treeNodeBase_1 = require("../../treeNodeBase");
const iExplorerNode_1 = require("../../iExplorerNode");
const utilities_1 = require("../../utilities");
const helper = require("../../../utilities/helper");
const autonomousDBWorkLoadNode_1 = require("./autonomousDBWorkLoadNode");
const localizedConstants_1 = require("../../../constants/localizedConstants");
const autonomousDBModels_1 = require("../../../models/autonomousDBModels");
const ociCompartment_1 = require("../ociCompartment");
const ociExplorerModel_1 = require("../ociExplorerModel");
const request_1 = require("oci-identity/lib/request");
const autonomousDBWalletFileHandler_1 = require("../autonomousDBWalletFileHandler");
const OciServicesSdk = require("../ocisdk/index");
const scriptExecutionModels_1 = require("../../../models/scriptExecutionModels");
const logger_1 = require("../../../infrastructure/logger");
const question_1 = require("../../../prompts/question");
const adapter_1 = require("../../../prompts/adapter");
const ociExplorerManager_1 = require("../ociExplorerManager");
class AutonomousDBProfileNode extends treeNodeBase_1.TreeNodeBase {
    constructor(configFileData) {
        super("", "", "", iExplorerNode_1.ExplorerNodeType.Category, utilities_1.TreeViewConstants.ociRootNodeItemStr, new vscode.ThemeIcon("account"), "");
        this.DBVersionsForTenancyInRegionMap = null;
        this.compartmentResponse = null;
        this.context = utilities_1.TreeViewConstants.ociRootNodeItemStr;
        this.fetchChildren = true;
        logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: In constructor");
        this.expandNodeField = vscode.TreeItemCollapsibleState.Collapsed;
        this.prompter = new adapter_1.default();
        this.ociCompartment = new ociCompartment_1.ociCompartment();
        this.compartmentTree = null;
        this.DBVersionsForTenancyInRegionMap = new dbVersionsInTenancyForRegion();
        if (configFileData) {
            this.nodeIdentifier = `${configFileData.profileName}${++AutonomousDBProfileNode.ID}`;
            this.profileName = configFileData.profileName;
            this.tenancyID = configFileData.tenancy;
            this.nodeID = configFileData.profileName;
            this.populateProfileFromVScodeSetting(configFileData);
            this.configFileData = configFileData;
            logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: Creating oci account component");
            this.accountComponent = OciServicesSdk.OracleOciAccountComponent.CreateAccountComponent(configFileData);
        }
        else {
            this.setContextValue("");
            this.ociCompartment = null;
        }
    }
    setExpand(value) {
        this.expandNodeField = value;
    }
    getExpansionState() {
        return this.expandNodeField;
    }
    getConfigFileData() {
        return this.configFileData;
    }
    getSupportedDBVersionListForTenancy() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.DBVersionsForTenancyInRegionMap.getWorkloadSupportedDBVersionInfo(this.tenancyID, this.regionName, this.accountComponent);
        });
    }
    getTenancyName() {
        return __awaiter(this, void 0, void 0, function* () {
            let tenancyName = null;
            let tenancyInfo = null;
            let retry = true;
            while (retry) {
                try {
                    const getTenancyReq = { tenancyId: this.configFileData.tenancy };
                    logger_1.FileStreamLogger.Instance.info('calling  getTenancy...');
                    tenancyInfo = yield this.accountComponent.ServicesClients.IdentityServiceClient.getTenancy(getTenancyReq);
                    tenancyName = tenancyInfo.tenancy.name;
                    retry = false;
                    this.resetFetchChildren();
                    logger_1.FileStreamLogger.Instance.info('got tenancy name');
                }
                catch (error) {
                    logger_1.FileStreamLogger.Instance.error("Error getting tenancy info using tenancy id ");
                    this.fetchChildren = false;
                    if (error && error.message && error.message.indexOf('getaddrinfo ENOTFOUND') > 0) {
                        retry = false;
                    }
                    else if (error && error.name) {
                        logger_1.FileStreamLogger.Instance.error("Error name: " + error.name);
                        if (error.name !== "KeyEncryptedError" &&
                            error.name !== "KeyParseError") {
                            retry = false;
                        }
                        else {
                            if (error.name === "KeyParseError") {
                                logger_1.FileStreamLogger.Instance.error("Error name = " + error.name);
                                retry = false;
                                this.configFileData.passPhrase = null;
                                this.accountComponent = OciServicesSdk.OracleOciAccountComponent.CreateAccountComponent(this.configFileData);
                            }
                        }
                    }
                    if (!retry) {
                        throw error;
                    }
                }
                if (retry) {
                    try {
                        const questions = [];
                        let creds = null;
                        let promptMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.enterCreds, this.configFileData.profileName);
                        questions.push({
                            type: question_1.QuestionTypes.hiddenInput,
                            name: promptMsg,
                            message: promptMsg,
                            shouldPrompt: () => true,
                            onAnswered: (value) => {
                                if (value != undefined && value != null && value.length > 0) {
                                    creds = value;
                                    value = null;
                                }
                            }
                        });
                        const answers = yield this.prompter.prompt(questions, true);
                        if (answers) {
                            if (creds != undefined && creds != null && creds.length > 0) {
                                this.configFileData.passPhrase = creds;
                                this.accountComponent = OciServicesSdk.OracleOciAccountComponent.CreateAccountComponent(this.configFileData);
                                creds.fill(0);
                                creds.splice(0, creds.length);
                                creds = null;
                                this.configFileData.passPhrase = null;
                            }
                        }
                        else {
                            retry = false;
                            logger_1.FileStreamLogger.Instance.info('Input prompt for creds canceled by user');
                        }
                    }
                    catch (error) {
                        logger_1.FileStreamLogger.Instance.info('Error prompting for creds and creating new accountComponent to retry');
                        throw error;
                    }
                }
            }
            return tenancyName;
        });
    }
    getDisplayName() {
        var displayName = "";
        if (ociExplorerModel_1.OCIExplorerModel.getInstance().configFileExists()) {
            if (this.ociCompartment.name != undefined && this.ociCompartment.name.length > 0) {
                displayName = this.ociCompartment.name;
            }
            else {
                if (this.tenancyName) {
                    displayName = this.tenancyName;
                }
            }
            if (displayName != "") {
                if (this.regionName) {
                    displayName = `${this.profileName} (${displayName}:${this.regionName})`;
                }
                else {
                    displayName = `${this.profileName} (${displayName})`;
                }
            }
            else {
                if (this.regionName) {
                    displayName = `${this.profileName} (${this.regionName})`;
                }
                else {
                    displayName = this.profileName;
                }
            }
        }
        else {
            displayName = `[${localizedConstants_1.default.ociAccountNotFound}]`;
        }
        return displayName;
    }
    getToolTip() {
        var tooltip = "";
        if (ociExplorerModel_1.OCIExplorerModel.getInstance().configFileExists()) {
            let region = this.regionName ? this.regionName : localizedConstants_1.default.noRegionSpecified;
            if (this.ociCompartment.fullNameForDisplay) {
                tooltip = `${localizedConstants_1.default.compartment}: ${this.ociCompartment.fullNameForDisplay}`;
            }
            if (tooltip != "") {
                tooltip = `${tooltip}\n${localizedConstants_1.default.region}: ${region}`;
            }
            else {
                tooltip = `${localizedConstants_1.default.region}: ${region}`;
            }
        }
        else {
            tooltip = `[${localizedConstants_1.default.ociAccountNotFound}]`;
        }
        return tooltip;
    }
    getAccountComponent() {
        return this.accountComponent;
    }
    getProfileName() {
        return this.profileName;
    }
    getcompartmentFullPathForDisplay() {
        return this.ociCompartment.fullNameForDisplay;
    }
    getcompartmentFullPath() {
        return this.ociCompartment.fullPath;
    }
    getCompartmentName() {
        return this.ociCompartment.name;
    }
    getCompartmentNameForDisplay() {
        return this.ociCompartment.nameForDisplay;
    }
    getcompartmentID() {
        return this.ociCompartment.id;
    }
    replaceORSkipFiles(walletFileRequest) {
        this.walletFileHandler.replaceORSkipFiles(walletFileRequest);
    }
    getWorkloadNode(workLoadType) {
        let workloadNode = null;
        if (this.children) {
            for (let index = 0; index < this.children.length; index++) {
                workloadNode = this.children[index];
                if (workloadNode.adbworkLoadType == workLoadType) {
                    break;
                }
            }
            return workloadNode;
        }
    }
    getAutonomousDBNode(adbInstanceID) {
        let adbNode = null;
        if (this.children) {
            for (let index = 0; index < this.children.length; index++) {
                let workloadNode = this.children[index];
                if (workloadNode && workloadNode.children) {
                    for (let idx = 0; idx < workloadNode.children.length; idx++) {
                        let autonomousDBNode = workloadNode.children[idx];
                        if (autonomousDBNode.adbInstanceNodeProperties.adbInstanceID == adbInstanceID) {
                            return autonomousDBNode;
                        }
                    }
                }
            }
        }
        return adbNode;
    }
    downloadWalletFile(walletFileRequest) {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: localizedConstants_1.default.downloadingCredentialFile
        }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
            yield this.walletFileHandler.downloadWalletFile(this.accountComponent, walletFileRequest).then(data => {
                ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendDownloadWalletFileResponse({ executionId: walletFileRequest.executionId, windowUri: walletFileRequest.windowUri, downloadCredentialsFilesData: data });
            }, error => {
                helper.logErroAfterValidating(error);
            });
        }));
    }
    addORUpdateOCIVSCodeTenancySetting() {
        let addorUpdatetenancyName = false;
        if ((!this.tenancyNameInOCISetting && this.tenancyName)
            || (this.tenancyNameInOCISetting && this.tenancyNameInOCISetting != this.tenancyName)) {
            addorUpdatetenancyName = true;
        }
        return addorUpdatetenancyName;
    }
    updateOCIVSCodeTenancySetting() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.addORUpdateOCIVSCodeTenancySetting()) {
                let profileSettingManager = ociExplorerModel_1.ociProfileSettingManager.getInstance();
                yield profileSettingManager.updateOCISetting(autonomousDBModels_1.OCISettingType.Tenancy, { compartmentName: null, region: null, profileName: this.profileName, tenancyName: this.tenancyName, tenancyID: this.tenancyID });
                this.tenancyNameInOCISetting = this.tenancyName;
                this.tenancyIDInOCISetting = this.tenancyID;
            }
        });
    }
    populateProfileFromVScodeSetting(configFileData) {
        this.regionName = configFileData.regionId;
        let profileSettingManager = ociExplorerModel_1.ociProfileSettingManager.getInstance();
        if (profileSettingManager) {
            let profileSetting = profileSettingManager.getProfileSetting(configFileData.profileName);
            if (profileSetting) {
                this.tenancyIDInOCISetting = profileSetting.tenancyID;
                if (this.canCopyTenancyIDFromSetting(profileSetting.tenancyID, configFileData.tenancy)) {
                    if (profileSetting.region) {
                        this.regionName = profileSetting.region;
                        configFileData.regionId = profileSetting.region;
                    }
                    if (profileSetting.tenancyName) {
                        this.tenancyName = profileSetting.tenancyName;
                        this.tenancyNameInOCISetting = profileSetting.tenancyName;
                    }
                    this.ociCompartment.setCompartmentPropertiesfromFullName(profileSetting.compartmentName);
                }
            }
        }
        this.walletFileHandler = new autonomousDBWalletFileHandler_1.AutonomousDBWalletFileHandler();
    }
    getCompartmentResponse() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.compartmentResponse) {
                let comapartmentList = yield this.getCompartmentListForTenancyNode();
                return comapartmentList;
            }
            return this.compartmentResponse;
        });
    }
    updateCompartmentOrRegion(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                switch (msg.updateType) {
                    case autonomousDBModels_1.CompartmentAndRegionUpdateType.Region:
                        this.regionName = msg.regionName;
                        this.configFileData.regionId = msg.regionName;
                        this.accountComponent = OciServicesSdk.OracleOciAccountComponent.CreateAccountComponent(this.configFileData);
                        break;
                    case autonomousDBModels_1.CompartmentAndRegionUpdateType.Compartment:
                        this.ociCompartment.setCompartmentProperties(msg.selectedCompartmentFullname, msg.selectedCompartmentID);
                        this.tenancyName = msg.rootTenancy;
                        break;
                    case autonomousDBModels_1.CompartmentAndRegionUpdateType.CompartmentAndRegion:
                        this.regionName = msg.regionName;
                        this.configFileData.regionId = msg.regionName;
                        this.accountComponent = OciServicesSdk.OracleOciAccountComponent.CreateAccountComponent(this.configFileData);
                        this.ociCompartment.setCompartmentProperties(msg.selectedCompartmentFullname, msg.selectedCompartmentID);
                        this.tenancyName = msg.rootTenancy;
                        break;
                }
                this.resetFetchChildren();
                ociExplorerModel_1.OCIExplorerModel.getInstance().updateProfileNode(this);
                this.getOCISettingType(msg.updateType);
                yield ociExplorerModel_1.ociProfileSettingManager.getInstance().updateOCISetting(this.getOCISettingType(msg.updateType), {
                    profileName: msg.profileName, compartmentName: msg.selectedCompartmentFullname,
                    region: msg.regionName, tenancyID: null, tenancyName: null
                });
            }
            catch (err) {
                helper.logErroAfterValidating(err);
            }
        });
    }
    getOCISettingType(updateType) {
        let settingType = autonomousDBModels_1.OCISettingType.None;
        switch (updateType) {
            case autonomousDBModels_1.CompartmentAndRegionUpdateType.Compartment:
                settingType = autonomousDBModels_1.OCISettingType.Compartment;
                break;
            case autonomousDBModels_1.CompartmentAndRegionUpdateType.Region:
                settingType = autonomousDBModels_1.OCISettingType.Region;
                break;
            case autonomousDBModels_1.CompartmentAndRegionUpdateType.CompartmentAndRegion:
                settingType = autonomousDBModels_1.OCISettingType.CompartmentAndRegion;
                break;
            default:
                break;
        }
        return settingType;
    }
    fetchRegions() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    let regions = new Array();
                    const listRegionSubscriptionsRequest = {
                        "tenancyId": this.tenancyID
                    };
                    this.accountComponent.ServicesClients.IdentityServiceClient.listRegionSubscriptions(listRegionSubscriptionsRequest).then(((subscribedRegions) => {
                        let checkForRegionNameMismatch = false;
                        if (subscribedRegions.items.length === 1) {
                            checkForRegionNameMismatch = true;
                        }
                        for (let region of subscribedRegions.items) {
                            if (checkForRegionNameMismatch &&
                                this.regionName.toLowerCase() != region.regionName.toLowerCase()) {
                                regions.push(this.regionName);
                            }
                            else {
                                regions.push(region.regionName);
                            }
                        }
                        if (regions && regions.length > 0) {
                            logger_1.FileStreamLogger.Instance.info(`autonomousDBProfileNode.fetchRegions: Returning ${regions.length} region names`);
                        }
                        resolve(regions);
                    }), error => {
                        helper.logErroAfterValidating(error);
                        vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorFetchingRegions, error.message));
                        reject(error.message);
                    });
                }
                catch (err) {
                    helper.logErroAfterValidating(err);
                    vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorFetchingRegions, err.message));
                }
            });
        });
    }
    doProfileNodeExpansionTask(updateSettingAndProperties, fetchTenancyName = true) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("In doProfileNodeExpansionTask");
            let nodetoSelectInfo = null;
            if (fetchTenancyName) {
                logger_1.FileStreamLogger.Instance.info("Calling getTenancyName");
                this.tenancyName = yield this.getTenancyName();
                if (this.tenancyName === null) {
                    logger_1.FileStreamLogger.Instance.info("getTenancyName returned tenancy name as null");
                    return nodetoSelectInfo;
                }
                logger_1.FileStreamLogger.Instance.info("getTenancyName returned a tenancy name");
            }
            if (this.ociCompartment.fullPath == null || this.ociCompartment.fullPath == undefined) {
                this.ociCompartment.fullPath = this.tenancyName;
            }
            if (this.compartmentTree == null) {
                this.compartmentTree = yield this.getOCICompartmentTree();
            }
            let compartmentTree = this.compartmentTree;
            if (compartmentTree) {
                nodetoSelectInfo = compartmentTree.getNodetoSelectAndAncestorsList(compartmentTree.getRootNode(), this.ociCompartment.fullPath);
            }
            if (updateSettingAndProperties) {
                yield this.DeleteProfileSettings();
                yield this.updateOCIVSCodeTenancySetting();
                if (nodetoSelectInfo) {
                    this.ociCompartment.setCompartmentProperties(this.ociCompartment.fullPath, nodetoSelectInfo.selectedNode.id);
                }
                else {
                    this.ociCompartment.setCompartmentProperties(this.tenancyName, this.configFileData.tenancy);
                }
                ociExplorerModel_1.OCIExplorerModel.getInstance().updateProfileNode(this);
            }
            return nodetoSelectInfo;
        });
    }
    getOCICompartmentResponse(nodetoSelectInfo) {
        let response = new autonomousDBModels_1.ociCompartmentResponse();
        response.compartmentList = this.compartmentTree ? JSON.stringify(this.compartmentTree.getRootNode()) : null;
        response.rootNodeName = this.tenancyName;
        response.rootNodeID = this.tenancyID;
        if (nodetoSelectInfo) {
            response.compartmentToselect = nodetoSelectInfo.selectedNode.id;
            response.ancestorList = nodetoSelectInfo.ancesstorNodes;
        }
        return response;
    }
    launchCompartmentAndRegionUIList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let explorerModel = ociExplorerModel_1.OCIExplorerModel.getInstance();
                let nodetoSelectInfo = yield this.doProfileNodeExpansionTask(true);
                if (nodetoSelectInfo !== null) {
                    let execID = (++explorerModel.executionID).toString();
                    this.compartmentResponse = this.getOCICompartmentResponse(nodetoSelectInfo);
                    explorerModel.ociExplorerUIHandler.openOCICompartmentAndRegionPanel((execID).toString(), scriptExecutionModels_1.UIDisplayMode.OCICompartment, this.profileName, this.regionName);
                }
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                if (error && error.name) {
                    logger_1.FileStreamLogger.Instance.error("Error name = " + error.name);
                }
                let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToOpenCompartmentUI, this.profileName, error.message);
                logger_1.ChannelLogger.Instance.error(errorMessage);
                vscode.window.showErrorMessage(errorMessage);
            }
        });
    }
    getCompartmentListForTenancyNode() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            try {
                var nodetoSelectInfo = yield this.doProfileNodeExpansionTask(false, false);
                if (nodetoSelectInfo !== null) {
                    response = this.getOCICompartmentResponse(nodetoSelectInfo);
                }
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                if (error && error.name) {
                    logger_1.FileStreamLogger.Instance.error("Error name = " + error.name);
                }
                let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorInGettingCompartmentForTenancy, this.profileName, error.message);
                logger_1.ChannelLogger.Instance.error(errorMessage);
                vscode.window.showErrorMessage(errorMessage);
            }
            return response;
        });
    }
    setContextValue(value) {
        this.context = value;
    }
    get getContextValue() {
        return this.context;
    }
    resetFetchChildren() {
        logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: In resetFetchChildren");
        this.fetchChildren = true;
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: In refresh");
            this.DBVersionsForTenancyInRegionMap.clear();
            logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: Calling resetFetchChildren");
            this.resetFetchChildren();
            logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: Calling updateProfileNode");
            ociExplorerModel_1.OCIExplorerModel.getInstance().updateProfileNode(this);
        });
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: In getChildren");
                if (this.fetchChildren && ociExplorerModel_1.OCIExplorerModel.getInstance().configFileExists()) {
                    logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: Calling doProfileNodeExpansionTask");
                    let nodetoSelectInfo = yield this.doProfileNodeExpansionTask(true);
                    if (nodetoSelectInfo !== null) {
                        var nodes = [];
                        nodes.push(new autonomousDBWorkLoadNode_1.ATPWorkLoadNode(localizedConstants_1.default.atpWorkLoadTypeNode, this));
                        nodes.push(new autonomousDBWorkLoadNode_1.ADWWorkLoadNode(localizedConstants_1.default.adwWorkLoadTypeNode, this));
                        nodes.push(new autonomousDBWorkLoadNode_1.ADBJSONWorkLoadNode(localizedConstants_1.default.adbJSONWorkLoadTypeNode, this));
                        this.children = nodes;
                        this.fetchChildren = false;
                        logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: Returning child nodes");
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: Calling collapseProfileNode - nodetoSelectInfo is null");
                        yield this.collapseProfileNode();
                    }
                }
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                if (error && error.name) {
                    logger_1.FileStreamLogger.Instance.error("Error name = " + error.name);
                }
                let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetProfileDetails, this.profileName, error.message);
                logger_1.ChannelLogger.Instance.error(errorMessage);
                vscode.window.showErrorMessage(errorMessage);
                logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: Calling collapseProfileNode on error");
                yield this.collapseProfileNode();
            }
            return this.children;
        });
    }
    getTreeItem() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: In getTreeItem");
            const treeItemObject = {};
            let displayName = this.getDisplayName();
            treeItemObject.label = displayName;
            treeItemObject.tooltip = this.getToolTip();
            treeItemObject.collapsibleState = this.getExpansionState();
            treeItemObject.id = this.getNodeId();
            treeItemObject.contextValue = this.getContextValue;
            treeItemObject.iconPath = this.getIconPath;
            treeItemObject.command = this.getCommandObject();
            logger_1.FileStreamLogger.Instance.info(`autonomousDBProfileNode: treeItemObject.collapsibleState = ${treeItemObject.collapsibleState}`);
            return treeItemObject;
        });
    }
    getOCICompartmentTree() {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            let compartmentTree = null;
            try {
                let rootNodeName = this.tenancyName;
                let rootNodeOCID = this.tenancyID;
                const listCompartmentsRequest = {
                    compartmentId: rootNodeOCID,
                    compartmentIdInSubtree: true,
                    accessLevel: request_1.ListCompartmentsRequest.AccessLevel.Accessible
                };
                var compartmentIDVsCompartmentDict = new Map();
                compartmentIDVsCompartmentDict.set(rootNodeOCID, new ociCompartment_1.ociCompartment(rootNodeName, rootNodeOCID, null, []));
                var ocicompartment;
                const compartmentsInfo = this.accountComponent.ServicesClients.IdentityServiceClient.listAllCompartments(listCompartmentsRequest);
                try {
                    for (var compartmentsInfo_1 = __asyncValues(compartmentsInfo), compartmentsInfo_1_1; compartmentsInfo_1_1 = yield compartmentsInfo_1.next(), !compartmentsInfo_1_1.done;) {
                        const compartment = compartmentsInfo_1_1.value;
                        ocicompartment = new ociCompartment_1.ociCompartment(compartment.name, compartment.id, compartment.compartmentId, []);
                        compartmentIDVsCompartmentDict.set(compartment.id, ocicompartment);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (compartmentsInfo_1_1 && !compartmentsInfo_1_1.done && (_a = compartmentsInfo_1.return)) yield _a.call(compartmentsInfo_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                compartmentTree = new ociCompartment_1.ociCompartmentTree(compartmentIDVsCompartmentDict);
                compartmentTree.populateTree(rootNodeOCID);
            }
            catch (error) {
                throw error;
            }
            return compartmentTree;
        });
    }
    canCopyTenancyIDFromSetting(tenancyIDInSetting, tenacyIDInConfigFile) {
        let copyTenancyID = false;
        if (tenancyIDInSetting && tenancyIDInSetting == tenacyIDInConfigFile || !tenancyIDInSetting) {
            copyTenancyID = true;
        }
        return copyTenancyID;
    }
    DeleteProfileSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.canCopyTenancyIDFromSetting(this.tenancyIDInOCISetting, this.tenancyID)) {
                yield ociExplorerModel_1.ociProfileSettingManager.getInstance().deleteProfile(this.profileName);
            }
        });
    }
    getNodeId() {
        return this.nodeIdentifier;
    }
    updateNodeID() {
        if (!this.nodeIdentifier.endsWith("_")) {
            this.nodeIdentifier = this.nodeIdentifier + "_";
        }
        else {
            this.nodeIdentifier = this.nodeIdentifier.substr(0, this.nodeIdentifier.length - 1);
        }
        return this.nodeIdentifier;
    }
    collapseProfileNode() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: In collapseProfileNode");
            this.setExpand(vscode.TreeItemCollapsibleState.Collapsed);
            this.children = undefined;
            this.updateNodeID();
            logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: Calling updateProfileNode");
            ociExplorerModel_1.OCIExplorerModel.getInstance().updateProfileNode(this);
            logger_1.FileStreamLogger.Instance.info("autonomousDBProfileNode: Calling selectNode");
            ociExplorerManager_1.OCIExplorerManager.Instance.selectNode(this);
        });
    }
}
exports.AutonomousDBProfileNode = AutonomousDBProfileNode;
AutonomousDBProfileNode.ID = 1;
class dbVersionsInTenancyForRegion {
    constructor() {
        this.dDBVersionsInTenancyForRegionMap = new Map();
    }
    clear() {
        this.dDBVersionsInTenancyForRegionMap.clear();
    }
    getKey(tenancyID, regionIdentifier) {
        return `${tenancyID}:${regionIdentifier}`;
    }
    getWorkloadSupportedDBVersionInfo(tenancyID, regionIdentifier, accountComponent) {
        return __awaiter(this, void 0, void 0, function* () {
            let dbVersionsForWorkloadMap = null;
            try {
                let key = this.getKey(tenancyID, regionIdentifier);
                if (this.dDBVersionsInTenancyForRegionMap.has(key)) {
                    dbVersionsForWorkloadMap = this.dDBVersionsInTenancyForRegionMap.get(key);
                }
                else {
                    dbVersionsForWorkloadMap = new autonomousDBModels_1.dbVersionsForWorkloadNode();
                    this.dDBVersionsInTenancyForRegionMap.set(key, dbVersionsForWorkloadMap);
                    let request = { compartmentId: tenancyID };
                    let autonomousDBversionList = yield accountComponent.ServicesClients.DatabaseServiceClient.listAutonomousDbVersions(request);
                    let paidAndfreeSupportedDBVersions = null;
                    for (let idx = 0; idx < autonomousDBversionList.items.length; idx++) {
                        paidAndfreeSupportedDBVersions = dbVersionsForWorkloadMap.getPaidAndfreeSupportedDBVersionList(autonomousDBversionList.items[idx].dbWorkload);
                        if (paidAndfreeSupportedDBVersions == null) {
                            paidAndfreeSupportedDBVersions = new autonomousDBModels_1.paidAndfreeSupportedDBVersionList();
                            dbVersionsForWorkloadMap.set(autonomousDBversionList.items[idx].dbWorkload, paidAndfreeSupportedDBVersions);
                        }
                        if (autonomousDBversionList.items[idx].isFreeTierEnabled) {
                            paidAndfreeSupportedDBVersions.freeSupportedDBVersionList.push(autonomousDBversionList.items[idx].version);
                        }
                        if (autonomousDBversionList.items[idx].isPaidEnabled) {
                            paidAndfreeSupportedDBVersions.paidSupportedDBVersionList.push(autonomousDBversionList.items[idx].version);
                        }
                    }
                }
            }
            catch (error) {
                helper.logErroAfterValidating(error);
            }
            return dbVersionsForWorkloadMap;
        });
    }
}
exports.dbVersionsInTenancyForRegion = dbVersionsInTenancyForRegion;
