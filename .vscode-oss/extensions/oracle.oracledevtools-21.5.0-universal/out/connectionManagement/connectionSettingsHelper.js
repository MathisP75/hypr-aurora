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
exports.ConnectionSettingsHelper = void 0;
const Constants = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const logger_1 = require("../infrastructure/logger");
const oracleVSCodeConnector_1 = require("../infrastructure/oracleVSCodeConnector");
const connectionModels_1 = require("./../models/connectionModels");
const helper = require("./../utilities/helper");
const connectionSettingsManager_1 = require("./connectionSettingsManager");
const setup_1 = require("../utilities/setup");
class ConnectionSettingsHelper {
    constructor(extContext, connSettingsManager, varVSCodeConnector) {
        this.extContext = extContext;
        this.connSettingsManager = connSettingsManager;
        this.varVSCodeConnector = varVSCodeConnector;
        if (!this.vscodeConnector) {
            this.vscodeConnector = new oracleVSCodeConnector_1.OracleVSCodeConnector();
        }
        if (!this.connSettingsManager) {
            this.connSettingsManager = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager();
        }
    }
    get vscodeConnector() {
        return this.varVSCodeConnector;
    }
    set vscodeConnector(value) {
        this.varVSCodeConnector = value;
    }
    getConnectionListForDropDown(showExistingProfiles, showExistingProfilesOnly = false) {
        const self = this;
        let connList = [];
        if (showExistingProfiles) {
            connList = self.retrieveAllConnections();
        }
        if (!showExistingProfilesOnly) {
            connList.push({
                label: localizedConstants_1.default.labelNewConnection,
                connectionProperties: undefined,
                matchingEnumType: connectionModels_1.ConnectionAttributesSelection.CreateNew,
            });
        }
        return connList;
    }
    getSavedConnectionProfilesList(workspaceProfiles) {
        const self = this;
        return self.getSavedConnectionProfiles(workspaceProfiles);
    }
    getRecentlyUsedConnectionList() {
        const self = this;
        let values = self.getValuesFromConfigState(Constants.Constants.recentlyUsedOracleConnections);
        if (!values) {
            values = [];
        }
        return values;
    }
    saveConnectionProfileToConfig(oracleConnectionProfile, oldConnectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let savedProfile;
            if (oracleConnectionProfile.passwordSaved) {
                savedProfile = Object.assign({}, oracleConnectionProfile);
            }
            else {
                savedProfile = Object.assign({}, oracleConnectionProfile, { password: undefined });
                savedProfile.proxyPassword = undefined;
            }
            yield self.connSettingsManager.addConnection(savedProfile, oldConnectionName);
            yield self.processSavePassword(oracleConnectionProfile);
            helper.setConnectionPropertiesDefault(oracleConnectionProfile);
            return oracleConnectionProfile;
        });
    }
    deleteRecentlyUsedConnection(connProp) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let connList = self.getRecentlyUsedConnectionList();
            let tmpConnProp = connProp;
            connList = connList.filter((connName) => connName !== tmpConnProp.name);
            yield self.extContext.globalState.update(Constants.Constants.recentlyUsedOracleConnections, connList);
            return;
        });
    }
    renameRecentlyUsedConnection(oldConnName, newConnName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const self = this;
                let connList = self.getRecentlyUsedConnectionList();
                if (connList && connList.length > 0) {
                    let index = connList.indexOf(oldConnName);
                    if (index > -1) {
                        connList[index] = newConnName;
                    }
                    yield self.extContext.globalState.update(Constants.Constants.recentlyUsedOracleConnections, connList);
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Error on updating recently used connections on connection rename.");
                helper.logErroAfterValidating(error);
            }
        });
    }
    addRecentlyUsedConnection(connProp) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let connList = self.getRecentlyUsedConnectionList();
            let tmpConnProp = connProp;
            connList = connList.filter((connName) => connName !== tmpConnProp.name);
            connList.unshift(tmpConnProp.name);
            if (connList.length > self.connectionCountInRecentList()) {
                connList = connList.slice(0, self.connectionCountInRecentList());
            }
            yield self.extContext.globalState.update(Constants.Constants.recentlyUsedOracleConnections, connList);
            yield self.processSavePassword(connProp);
            return undefined;
        });
    }
    clearAllRecentlyUsedConnections() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            try {
                yield self.extContext.globalState.update(Constants.Constants.recentlyUsedOracleConnections, []);
            }
            catch (err) {
                helper.logErroAfterValidating(err);
            }
            return;
        });
    }
    deleteConnectionProfile(oracleConnectionProfile, keepCredentialStore = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            const profileFound = yield self.connSettingsManager.deleteConnection(oracleConnectionProfile);
            yield self.deleteRecentlyUsedConnection(oracleConnectionProfile);
            return profileFound;
        });
    }
    retrieveAllConnections() {
        const self = this;
        let connList = [];
        const tmprecentConnections = self.getValuesFromConfigState(Constants.Constants.recentlyUsedOracleConnections);
        let savedProfiles = self.connSettingsManager.retrieveAllConnections(true);
        const connectionsInRecentList = [];
        self.addConnections(connectionsInRecentList, tmprecentConnections, savedProfiles);
        const profilesInRecentConnectionsList = [];
        savedProfiles = savedProfiles.filter((profile) => {
            for (let index = 0; index < connectionsInRecentList.length; index++) {
                if (helper.profilesAreSame(profile, connectionsInRecentList[index])) {
                    if (helper.connectionsAreSame(profile, connectionsInRecentList[index])) {
                        helper.setConnectionPropertiesDefault(profile);
                        connectionsInRecentList[index] = Object.assign({}, profile);
                        profilesInRecentConnectionsList.push(index);
                        return false;
                    }
                }
            }
            return true;
        });
        const recentConnectionsItems = connectionsInRecentList.map((connProp) => self.getConnectionDropDownItem(connProp, connectionModels_1.ConnectionAttributesSelection.Recent));
        for (const index of profilesInRecentConnectionsList) {
            recentConnectionsItems[index].matchingEnumType = connectionModels_1.ConnectionAttributesSelection.SavedProfile;
        }
        profilesInRecentConnectionsList.sort();
        for (let newIndex = profilesInRecentConnectionsList.length - 1; newIndex >= 0; newIndex--) {
            connList.unshift(recentConnectionsItems[profilesInRecentConnectionsList[newIndex]]);
        }
        connList = connList.concat(savedProfiles.map((connProp) => self.getConnectionDropDownItem(connProp, connectionModels_1.ConnectionAttributesSelection.SavedProfile)));
        return connList;
    }
    getSavedConnectionProfiles(workSpaceProfiles) {
        const self = this;
        const connProfileList = self.connSettingsManager.retrieveAllConnections(workSpaceProfiles).map((connProp) => {
            return self.getConnectionDropDownItem(connProp, connectionModels_1.ConnectionAttributesSelection.SavedProfile);
        });
        return connProfileList;
    }
    getValuesFromConfigState(configName) {
        const self = this;
        const configValuesStored = self.extContext.globalState.get(configName);
        return configValuesStored;
    }
    connectionCountInRecentList() {
        const self = this;
        const configValues = setup_1.Setup.getExtensionConfigSection();
        let connCount = configValues[Constants.Constants.maxRecentlyUsedConnsPropertyName];
        if (typeof (connCount) !== "number" || connCount <= 0) {
            connCount = Constants.Constants.maxRecentlyUsedConnsCount;
        }
        return connCount;
    }
    processSavePassword(oracleConnectionProfile) {
        return Promise.resolve(true);
    }
    getConnectionDropDownItem(connProp, dropDownItemType) {
        return {
            label: helper.getConnectionItemLabel(connProp),
            description: helper.getConnectionDescForSelections(helper.getConnectionItemLabel(connProp), connProp),
            detail: helper.getPicklistDetails(connProp),
            connectionProperties: connProp,
            matchingEnumType: dropDownItemType,
        };
    }
    addConnections(connections, valuestoCopyFrom, savedProfiles) {
        if (valuestoCopyFrom) {
            for (const value of valuestoCopyFrom) {
                let connProp = savedProfiles.find(prop => prop.name === value);
                if (connProp) {
                    if (connProp.connectionString || connProp.dataSource) {
                        const connection = helper.setConnectionPropertiesDefault(connProp);
                        connections.push(connection);
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.error(localizedConstants_1.default.msgConnWithNoConnStringOrDataSourc);
                        logger_1.ChannelLogger.Instance.error(localizedConstants_1.default.msgConnWithNoConnStringOrDataSourc);
                    }
                }
            }
        }
    }
}
exports.ConnectionSettingsHelper = ConnectionSettingsHelper;
