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
exports.DataExplorerModel = void 0;
const events_1 = require("events");
const connectionSettingsManager_1 = require("../connectionManagement/connectionSettingsManager");
const logger_1 = require("../infrastructure/logger");
const connectionNode_1 = require("./nodes/connectionNode");
const utilities_1 = require("./utilities");
const constants_1 = require("../constants/constants");
const editorUtils_1 = require("./editors/editorUtils");
const defaultConnectionManager_1 = require("../connectionManagement/defaultConnectionManager");
class DataExplorerModel {
    constructor(baseUri, vscodeConnector, connectionCommandsHandler, dataExplorerManager) {
        this.baseUri = baseUri;
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandsHandler = connectionCommandsHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.modelChanged = new events_1.EventEmitter();
        this.MODEL_CHANGED = "modeChangedEvent";
        this.connectionsRefreshed = new events_1.EventEmitter();
        this.CONNECTIONS_REFRESHED = "connectionsRefreshedEvent";
        this.vscodeConnector.onDidChangeConfiguration((param) => {
            this.handleProfileChanged(param);
        });
    }
    raiseModelChangedEvent() {
        this.modelChanged.emit(this.MODEL_CHANGED);
    }
    get rootNodes() {
        if (!this.rootNodesField) {
            this.rootNodesField = [];
            this.rootNodesField = this.generateRootNodes();
            this.connectionsRefreshed.emit(this.CONNECTIONS_REFRESHED);
        }
        return this.rootNodesField;
    }
    handleProfileChanged(param) {
        logger_1.FileStreamLogger.Instance.info("Handling Configuration changed for the application");
        if (param.affectsConfiguration(constants_1.Constants.connectionSettingsPropertyFullName)) {
            this.handleProfileAdded();
        }
        else if (param.affectsConfiguration(constants_1.Constants.defaultConnectionSettingsPropertyFullName)) {
            if (this.rootNodesField) {
                let defaultConn = defaultConnectionManager_1.DefaultConnectionManager.instance.getDefaultConnection();
                let modelChanged = false;
                this.rootNodesField.forEach((connNode) => {
                    if (defaultConn === connNode.connectionProperties.name) {
                        if (connNode.connAssocType !== connectionNode_1.ConnAssocType.Default) {
                            connNode.connAssocType = connectionNode_1.ConnAssocType.Default;
                            modelChanged = true;
                        }
                    }
                    else if (connNode.connAssocType === connectionNode_1.ConnAssocType.Default) {
                        connNode.connAssocType = connectionNode_1.ConnAssocType.NonDefault;
                        modelChanged = true;
                    }
                });
                if (modelChanged) {
                    this.raiseModelChangedEvent();
                }
            }
        }
        logger_1.FileStreamLogger.Instance.info("oracleConnections changed.");
    }
    getChildren(node) {
        return node ? node.getChildren() : this.rootNodes;
    }
    addModelChangedHandler(handler) {
        this.modelChanged.on(this.MODEL_CHANGED, handler);
    }
    addConnectionsRefreshedHandler(handler) {
        this.connectionsRefreshed.on(this.CONNECTIONS_REFRESHED, handler);
    }
    handleProfileAdded() {
        this.reloadAll(false);
    }
    reloadAll(isUserRefresh) {
        return __awaiter(this, void 0, void 0, function* () {
            let profilesChanged = false;
            const connSettingHelper = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
            const latestProfiles = connSettingHelper.retrieveAllConnections(true);
            const latestProfilesDic = new Map();
            latestProfiles.forEach((profile) => { latestProfilesDic.set(profile.name, profile); });
            const explorerProfileDic = new Map();
            const explorerConnectionNodeDic = new Map();
            let defaultConn = defaultConnectionManager_1.DefaultConnectionManager.instance.getDefaultConnection();
            if (this.rootNodesField) {
                this.rootNodesField.forEach((item) => { explorerProfileDic.set(item.connectionProperties.name, item.connectionProperties); });
                this.rootNodesField.forEach((item) => { explorerConnectionNodeDic.set(item.connectionProperties.name, item); });
            }
            const allProfileNames = [];
            latestProfilesDic.forEach(item => allProfileNames.push(item.name));
            explorerProfileDic.forEach(item => {
                if (allProfileNames.indexOf(item.name) == -1) {
                    allProfileNames.push(item.name);
                }
            });
            let newRootNodes = [];
            for (let index = 0; index < allProfileNames.length; index++) {
                const profileName = allProfileNames[index];
                if (latestProfilesDic.has(profileName) && !explorerProfileDic.has(profileName)) {
                    let isNewnameOfRenamedNode = (this.dataExplorerManager.renamedConnectionNodeInfo &&
                        this.dataExplorerManager.renamedConnectionNodeInfo.newConnectionName === profileName);
                    if (isNewnameOfRenamedNode) {
                        let connNode = explorerConnectionNodeDic.get(this.dataExplorerManager.renamedConnectionNodeInfo.oldConnectionName);
                        connNode.nodeLabel = profileName;
                        connNode.connectionProperties.name = profileName;
                        newRootNodes.push(connNode);
                        yield editorUtils_1.editorUtils.updateExplorerFileOnConnectionRename(connNode);
                        profilesChanged = true;
                    }
                    else {
                        const profile = latestProfilesDic.get(profileName);
                        const connObject = new connectionNode_1.ConnectionNode(this.baseUri + profile.name, this.baseUri, profile.name, profile.name, profile, this.connectionCommandsHandler, this.dataExplorerManager, (profile.name === defaultConn ? connectionNode_1.ConnAssocType.Default : connectionNode_1.ConnAssocType.NonDefault));
                        if (this.dataExplorerManager.updatingConnectionNodeInfo &&
                            this.dataExplorerManager.updatingConnectionNodeInfo.newConnectionName === profile.name) {
                            connObject.connectionUniqueId = this.dataExplorerManager.updatingConnectionNodeInfo.connectionUniqueId;
                        }
                        newRootNodes.push(connObject);
                        profilesChanged = true;
                    }
                }
                else if (!latestProfilesDic.has(profileName) && explorerProfileDic.has(profileName)) {
                    let isOldnameOfRenamedNode = (this.dataExplorerManager.renamedConnectionNodeInfo &&
                        this.dataExplorerManager.renamedConnectionNodeInfo.oldConnectionName === profileName);
                    if (!isOldnameOfRenamedNode) {
                        const deletedConnection = explorerConnectionNodeDic.get(profileName);
                        yield this.connectionCommandsHandler.doDisconnect(deletedConnection.connectionURI, false);
                    }
                    profilesChanged = true;
                }
                else if (latestProfilesDic.has(profileName) && explorerProfileDic.has(profileName)) {
                    const updated = !utilities_1.ExplorerUtilities.isProfilesEqual(latestProfilesDic.get(profileName), explorerProfileDic.get(profileName));
                    if (updated) {
                        const deletedConnection = explorerConnectionNodeDic.get(profileName);
                        yield this.connectionCommandsHandler.doDisconnect(deletedConnection.connectionURI, false);
                        const profile = latestProfilesDic.get(profileName);
                        const connObject = new connectionNode_1.ConnectionNode(this.baseUri + profile.name, this.baseUri, profile.name, profile.name, profile, this.connectionCommandsHandler, this.dataExplorerManager, (profile.name === defaultConn ? connectionNode_1.ConnAssocType.Default : connectionNode_1.ConnAssocType.NonDefault));
                        if (this.dataExplorerManager.updatingConnectionNodeInfo &&
                            this.dataExplorerManager.updatingConnectionNodeInfo.newConnectionName === profile.name) {
                            connObject.connectionUniqueId = this.dataExplorerManager.updatingConnectionNodeInfo.connectionUniqueId;
                        }
                        newRootNodes.push(connObject);
                        profilesChanged = true;
                    }
                    else {
                        const connectionNode = explorerConnectionNodeDic.get(profileName);
                        if (isUserRefresh) {
                            connectionNode.reset();
                        }
                        newRootNodes.push(connectionNode);
                    }
                }
            }
            if (isUserRefresh || profilesChanged) {
                this.rootNodesField = newRootNodes;
                this.raiseModelChangedEvent();
                yield this.dataExplorerManager.onConnectionsRefreshed();
                if (this.dataExplorerManager.connectionToSelect) {
                    let connNodeToSelect = newRootNodes.find((node) => (node.
                        connectionProperties.name === this.dataExplorerManager.connectionToSelect));
                    if (connNodeToSelect) {
                        this.dataExplorerManager.selectNode(connNodeToSelect);
                    }
                }
            }
            this.resetRecentOperationData();
        });
    }
    resetRecentOperationData() {
        this.dataExplorerManager.renamedConnectionNodeInfo = undefined;
        this.dataExplorerManager.connectionToSelect = undefined;
        this.dataExplorerManager.updatingConnectionNodeInfo = undefined;
    }
    handleProfileRemoved() {
        this.reloadAll(false);
    }
    generateRootNodes() {
        const arrtoret = [];
        let defaultConn = defaultConnectionManager_1.DefaultConnectionManager.instance.getDefaultConnection();
        const connSettingHelper = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
        const profiles = connSettingHelper.retrieveAllConnections(true);
        profiles.forEach((profile) => {
            const connObject = new connectionNode_1.ConnectionNode(this.baseUri + profile.name, this.baseUri, profile.name, profile.name, profile, this.connectionCommandsHandler, this.dataExplorerManager, ((defaultConn && profile.name === defaultConn) ? connectionNode_1.ConnAssocType.Default : connectionNode_1.ConnAssocType.NonDefault));
            arrtoret.push(connObject);
        });
        this.copyPwdIfNeeded(this.lastRootNodes, arrtoret);
        this.lastRootNodes = null;
        return arrtoret;
    }
    copyPwdIfNeeded(oldConnNodes, newConnNodes) {
        if (oldConnNodes && oldConnNodes.length > 0 && newConnNodes && newConnNodes.length > 0) {
            oldConnNodes.forEach((oldConnNode) => {
                if (!oldConnNode.connectionProperties.passwordSaved && oldConnNode.connectionProperties.password) {
                    const newConnNode = newConnNodes.find((a) => a.connectionURI === oldConnNode.connectionURI);
                    if (newConnNode && !newConnNode.connectionProperties.passwordSaved &&
                        oldConnNode.connectionProperties.connectionType === newConnNode.connectionProperties.connectionType &&
                        oldConnNode.connectionProperties.userID === newConnNode.connectionProperties.userID &&
                        oldConnNode.status === connectionNode_1.ConnectionStatus.Connected) {
                        newConnNode.connectionProperties.password = oldConnNode.connectionProperties.password;
                    }
                }
            });
        }
    }
}
exports.DataExplorerModel = DataExplorerModel;
