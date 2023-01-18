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
exports.OCIExplorerModel = exports.ociProfileSettingManager = void 0;
const vscode = require("vscode");
const helper = require("../../utilities/helper");
const constants_1 = require("../../constants/constants");
const autonomousDBModels_1 = require("../../models/autonomousDBModels");
const events_1 = require("events");
const localizedConstants_1 = require("../../constants/localizedConstants");
const logger_1 = require("../../infrastructure/logger");
const ociExplorerUIHandler_1 = require("./ociExplorerUIHandler");
const autonomousDBProfileNode_1 = require("./nodes/autonomousDBProfileNode");
const autonomousDBInstanceNode_1 = require("./nodes/autonomousDBInstanceNode");
const setup_1 = require("../../utilities/setup");
const childProcess = require("child_process");
const ociConfigFileHandler_1 = require("./ociConfigFileHandler");
const autonomousDBWorkLoadNode_1 = require("./nodes/autonomousDBWorkLoadNode");
const autonomousDBModels_2 = require("../../models/autonomousDBModels");
class ociProfileSettingManager {
    static getInstance() {
        if (this.profileSettingManager == null) {
            this.profileSettingManager = new ociProfileSettingManager();
        }
        return this.profileSettingManager;
    }
    getProfileSetting(profileName) {
        let profile = null;
        for (let profileObj of this.profileProperties) {
            if (profileObj.profileName === profileName) {
                profile = profileObj;
                break;
            }
        }
        return profile;
    }
    getCompartmentFullPathForProfile(profileName) {
        let compartmentName;
        for (let profileObj of this.profileProperties) {
            if (profileObj.profileName === profileName) {
                compartmentName = profileObj.compartmentName;
                break;
            }
        }
        return compartmentName;
    }
    deleteProfile(profileName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.profileProperties = this.profileProperties.filter((profile) => {
                if (profile.profileName == profileName) {
                    return false;
                }
                else {
                    return true;
                }
            });
            try {
                yield setup_1.Setup.getExtensionConfigSection().update(constants_1.Constants.compartmentNamePropertyName, this.profileProperties, true);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
            }
        });
    }
    updateOCISetting(settingToUpdate, setting) {
        return __awaiter(this, void 0, void 0, function* () {
            let profileObj = this.getProfile(setting.profileName);
            let profileFound = profileObj != null ? true : false;
            if (!profileFound) {
                profileObj = new autonomousDBModels_2.adbProfileVSCodeSetting();
            }
            profileObj.profileName = setting.profileName;
            switch (settingToUpdate) {
                case autonomousDBModels_1.OCISettingType.Compartment:
                    profileObj.compartmentName = setting.compartmentName;
                    break;
                case autonomousDBModels_1.OCISettingType.Region:
                    profileObj.region = setting.region;
                    break;
                case autonomousDBModels_1.OCISettingType.CompartmentAndRegion:
                    profileObj.region = setting.region;
                    profileObj.compartmentName = setting.compartmentName;
                    break;
                case autonomousDBModels_1.OCISettingType.Tenancy:
                    profileObj.tenancyID = setting.tenancyID;
                    profileObj.tenancyName = setting.tenancyName;
                    break;
            }
            if (!profileFound) {
                this.profileProperties.push(profileObj);
            }
            try {
                yield setup_1.Setup.getExtensionConfigSection().update(constants_1.Constants.compartmentNamePropertyName, this.profileProperties, true);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
            }
        });
    }
    getProfileProperties() {
        return this.profileProperties;
    }
    readOCISetting() {
        try {
            const config = setup_1.Setup.getExtensionConfigSection();
            const profieConfigurationEntries = config.inspect(constants_1.Constants.compartmentNamePropertyName);
            if (profieConfigurationEntries) {
                if (profieConfigurationEntries.globalValue) {
                    this.profileProperties = profieConfigurationEntries.globalValue;
                }
                else {
                    this.profileProperties = new Array();
                }
            }
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    getTenancyName(profileName, tenancyID) {
        let tenancyName = null;
        for (let profileObj of this.profileProperties) {
            if (profileObj.profileName === profileName && profileObj.tenancyID === tenancyID) {
                tenancyName = profileObj.tenancyName;
                break;
            }
        }
        return tenancyName;
    }
    getProfile(profileName) {
        let profileObj = null;
        if (this.profileProperties) {
            for (let profile of this.profileProperties) {
                if (profile.profileName === profileName) {
                    profileObj = profile;
                    break;
                }
            }
        }
        return profileObj;
    }
}
exports.ociProfileSettingManager = ociProfileSettingManager;
ociProfileSettingManager.profileSettingManager = null;
class OCIExplorerModel {
    constructor() {
        this.configurationFilePath = "~/.oci/config";
        this.profileNodesMap = new Map();
        this.modelChanged = new events_1.EventEmitter();
        this.MODEL_CHANGED = constants_1.Constants.modelChangedEvent;
        this.executionID = 1;
        this.initializeModel(false);
    }
    createOCIExplorerUIHandler() {
        this.ociExplorerUIHandler = ociExplorerUIHandler_1.OCIExplorerUIHandler.getInstance(this);
    }
    configFileExists() {
        return this.foundConfigFile;
    }
    updateProfileNodeCompartmentOrRegion(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let profileNode = this.getProfileNode(msg.profileName);
            let proceedWithUpdate = true;
            if (profileNode != null) {
                profileNode.updateCompartmentOrRegion(msg);
            }
            else {
                proceedWithUpdate = false;
            }
            return proceedWithUpdate;
        });
    }
    static getInstance() {
        if (this.ociExplorerModel == null) {
            this.ociExplorerModel = new OCIExplorerModel();
        }
        return this.ociExplorerModel;
    }
    getADBNode(param) {
        let profileNode = this.getProfileNode(param.profileName);
        let adbInstanceNode = null;
        if (profileNode) {
            adbInstanceNode = profileNode.getAutonomousDBNode(param.adbDatabaseID);
        }
        else {
            this.ociExplorerUIHandler.sendChangePswdResponse({
                executionId: param.executionId, windowUri: param.windowUri,
                status: autonomousDBModels_1.operationStatus.Error, statusMessage: helper.stringFormatterCsharpStyle(localizedConstants_1.default.changeAdminPswdNotStartedProfileNotFound, param.profileName)
            });
        }
        return adbInstanceNode;
    }
    static getKey(uri, executionID) {
        return `${uri}/${executionID}`;
    }
    getSettings(settingName) {
        var settingValue;
        try {
            const config = setup_1.Setup.getExtensionConfigSection();
            if (config) {
                settingValue = config.get(settingName);
            }
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
        return settingValue;
    }
    EmitModelChangeEvent(node) {
        if (node) {
            this.modelChanged.emit(this.MODEL_CHANGED, node);
        }
        else {
            this.modelChanged.emit(this.MODEL_CHANGED);
        }
    }
    refreshNode(node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (node) {
                if (!this.foundConfigFile) {
                    this.initializeModel(true);
                }
                else {
                    if (node instanceof autonomousDBInstanceNode_1.AutonomousDBInstance) {
                        node.refreshNode();
                    }
                    else if (node instanceof autonomousDBWorkLoadNode_1.ADBWorkLoadNode) {
                        yield node.refresh();
                    }
                    else if (node instanceof autonomousDBProfileNode_1.AutonomousDBProfileNode) {
                        yield node.refresh();
                    }
                }
            }
        });
    }
    startDatabase(node) {
        if (node) {
            node.startADBInstance((param) => {
                this.modelChanged.emit(this.MODEL_CHANGED, param);
            });
        }
    }
    terminateDatabase(node) {
        if (node) {
            node.terminateADBInstance((param) => {
                this.modelChanged.emit(this.MODEL_CHANGED, param);
            });
        }
    }
    stopDatabase(node) {
        if (node) {
            node.stopADBInstance((param) => {
                this.modelChanged.emit(this.MODEL_CHANGED, param);
            });
        }
    }
    launchOracleCloudSignUpURL() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const startCommand = (process.platform === constants_1.Constants.macOSprocessplatform ? constants_1.Constants.macOSOpenCommand :
                    process.platform === constants_1.Constants.windowsProcessPlatform ? constants_1.Constants.windowsOpenCommand : constants_1.Constants.linuxOpenCommand);
                logger_1.ChannelLogger.Instance.info(helper.stringFormatterCsharpStyle(localizedConstants_1.default.outwindowOCCDialogue, constants_1.Constants.oracleSignUpCloudURL));
                yield childProcess.exec(`${startCommand} ${constants_1.Constants.oracleSignUpCloudURL}`);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorLauchingCloudSignUpURL, error.message));
            }
            return true;
        });
    }
    downloadCredentialsFile(node, connectionCommandsHandler) {
        if (node) {
            node.openDownloadCredentialsFileUI(this.ociExplorerUIHandler, connectionCommandsHandler);
        }
    }
    changeADBPassword(node) {
        if (node) {
            node.launchChangeADBAdministratorPswdUI((++this.executionID).toString(), this.ociExplorerUIHandler);
        }
    }
    changeADBAdministratorPswd(param) {
        let adbNode = this.getADBNode(param);
        if (adbNode) {
            adbNode.changeADBAdministratorPswd(param);
        }
    }
    createDataConnection(node, connectionCommandsHandler) {
        if (node) {
            node.openCreateConnectionUI(this.ociExplorerUIHandler, connectionCommandsHandler);
        }
    }
    getProfileNode(profileName) {
        let profileNode = null;
        if (this.profileNodesMap.has(profileName)) {
            profileNode = this.profileNodesMap.get(profileName);
        }
        return profileNode;
    }
    handleExistingWalletFile(walletFileRequest) {
        if (this.profileNodesMap.has(walletFileRequest.profileName)) {
            this.profileNodesMap.get(walletFileRequest.profileName).replaceORSkipFiles(walletFileRequest);
        }
    }
    downloadWalletFile(walletFileRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            let profileNode = this.getProfileNode(walletFileRequest.profileName);
            if (profileNode) {
                profileNode.downloadWalletFile(walletFileRequest);
            }
        });
    }
    fetchCompartmentList(ociNode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ociNode) {
                yield ociNode.launchCompartmentAndRegionUIList();
            }
        });
    }
    LaunchCreateNewDatabaseUI(ociNode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ociNode) {
                yield ociNode.LaunchCreateNewDatabaseUI();
            }
        });
    }
    updateProfileNode(rootNode) {
        this.modelChanged.emit(this.MODEL_CHANGED, rootNode);
    }
    initializeModel(compareExistingProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            let profileName = "";
            let profileNode = null;
            let existingProfilesMap = null;
            try {
                ociProfileSettingManager.getInstance().readOCISetting();
                logger_1.FileStreamLogger.Instance.info(`initializing adb model...`);
                if (compareExistingProfile) {
                    existingProfilesMap = new Map(this.profileNodesMap);
                }
                this.profileNodesMap.clear();
                let configFileData = null;
                let configFile = null;
                var configFileHandler = new ociConfigFileHandler_1.ociConfigFileHandler();
                try {
                    configFileHandler.readConfigFile(this.configurationFilePath);
                    configFile = configFileHandler.getConfigFile();
                }
                catch (error) {
                    helper.logErroAfterValidating(error);
                    vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorReadingDefaultConfigFile, error.message));
                }
                if (configFile && configFile.accumulator
                    && configFile.accumulator.configurationsByProfile
                    && configFile.accumulator.configurationsByProfile.size > 0) {
                    this.foundConfigFile = true;
                    for (profileName of configFile.accumulator.configurationsByProfile.keys()) {
                        try {
                            configFileData = configFileHandler.getConfigFileData(profileName);
                            let useExistingProfile = false;
                            if (configFileData != null) {
                                if (compareExistingProfile && existingProfilesMap.has(profileName)) {
                                    let existingProfile = null;
                                    existingProfile = existingProfilesMap.get(profileName);
                                    useExistingProfile = ociConfigFileHandler_1.ociConfigFileHandler.IsProfileSame(configFileData, existingProfile.getConfigFileData()) ? true : false;
                                    if (useExistingProfile) {
                                        this.profileNodesMap.set(profileName, existingProfile);
                                    }
                                }
                                if (!useExistingProfile) {
                                    profileNode = new autonomousDBProfileNode_1.AutonomousDBProfileNode(configFileData);
                                    profileNode.children = [];
                                    this.profileNodesMap.set(profileName, profileNode);
                                }
                                logger_1.FileStreamLogger.Instance.info(`adb model initialized...`);
                            }
                        }
                        catch (error) {
                            helper.logErroAfterValidating(error);
                        }
                    }
                }
                else {
                    profileNode = new autonomousDBProfileNode_1.AutonomousDBProfileNode(configFileData);
                    profileNode.children = [];
                    this.profileNodesMap.set(profileName, profileNode);
                    this.foundConfigFile = false;
                }
                this.modelChanged.emit(this.MODEL_CHANGED);
                existingProfilesMap === null || existingProfilesMap === void 0 ? void 0 : existingProfilesMap.clear();
            }
            catch (err) {
                logger_1.FileStreamLogger.Instance.info(`got exception in model initialization..`);
                helper.logErroAfterValidating(err);
            }
        });
    }
    getChildren(node) {
        if (node) {
            return node.getChildren();
        }
        else {
            var nodes = null;
            if (this.profileNodesMap && this.profileNodesMap.size > 0) {
                nodes = new Array();
                for (let [key, profileNode] of this.profileNodesMap) {
                    nodes.push(profileNode);
                }
            }
            return nodes;
        }
    }
    addModelChangedHandler(handler) {
        this.modelChanged.on(this.MODEL_CHANGED, handler);
    }
    getADBConnectionstrings(node, connectionCommandsHandler) {
        if (node) {
            node.launchGetADBConnectionStringsUI((++this.executionID).toString(), this.ociExplorerUIHandler);
        }
    }
    adbConfigureWalletlessConnectivityandNetworkAccess(node, connectionCommandsHandler) {
        if (node) {
            node.launchConfigureWalletlessConnectivityAndNetworkAccessUI((++this.executionID).toString(), this.ociExplorerUIHandler);
        }
    }
}
exports.OCIExplorerModel = OCIExplorerModel;
OCIExplorerModel.ociExplorerModel = null;
