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
exports.OracleVSCodeConnectionSettingsManager = void 0;
const Constants = require("../constants/constants");
const oracleVSCodeConnector_1 = require("../infrastructure/oracleVSCodeConnector");
const helper = require("../utilities/helper");
const setup_1 = require("../utilities/setup");
class OracleVSCodeConnectionSettingsManager {
    constructor(vscodeConnector) {
        this.vscodeConnector = vscodeConnector;
        if (!this.vscodeConnector) {
            this.vscodeConnector = new oracleVSCodeConnector_1.OracleVSCodeConnector();
        }
    }
    addConnection(connProfile, oldConnectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let strdConnProfiles = self.retrieveConnProfilesFromConfig();
            if (oldConnectionName) {
                strdConnProfiles = strdConnProfiles.filter((item) => ((item.name != connProfile.name) && (item.name != oldConnectionName)));
            }
            else {
                strdConnProfiles = strdConnProfiles.filter((item) => (item.name != connProfile.name));
            }
            strdConnProfiles.push(connProfile);
            yield self.replaceProfilesinSettings(strdConnProfiles);
        });
    }
    retrieveAllConnections(fetchWorkSpaceConn) {
        const self = this;
        let conns = [];
        const connComparer = (a, b) => {
            const nameA = a.name ? a.name : (a.dataSource ? a.dataSource : a.connectionString);
            const nameB = b.name ? b.name : (b.dataSource ? b.dataSource : b.connectionString);
            return nameA.localeCompare(nameB);
        };
        const userConfigConns = self.retrieveConnProfilesFromConfig();
        userConfigConns.sort(connComparer);
        conns = conns.concat(userConfigConns);
        if (fetchWorkSpaceConn) {
            const wkspcConfigConns = self.retrieveConnProfilesFromConfig(false);
            wkspcConfigConns.sort(connComparer);
            conns = conns.concat(wkspcConfigConns);
        }
        if (conns.length > 0) {
            conns = conns.filter((conn) => {
                return conn.connectionString || conn.dataSource;
            });
        }
        return conns;
    }
    deleteConnection(connProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let connProfiles = self.retrieveConnProfilesFromConfig();
            let found = false;
            connProfiles = connProfiles.filter((value) => {
                if (helper.profilesAreSame(value, connProfile)) {
                    found = true;
                    return false;
                }
                else {
                    return true;
                }
            });
            yield self.replaceProfilesinSettings(connProfiles);
            return found;
        });
    }
    retrieveConnProfilesFromConfig(fetchGlobal = true) {
        const self = this;
        const config = setup_1.Setup.getExtensionConfigSection();
        let profilesToReturn = [];
        const connConfigurationEntries = config.inspect(Constants.Constants.connectionSettingsPropertyName);
        if (fetchGlobal) {
            profilesToReturn = connConfigurationEntries.globalValue;
        }
        else {
            profilesToReturn = connConfigurationEntries.workspaceValue;
            if (profilesToReturn !== undefined) {
                profilesToReturn = profilesToReturn.concat(connConfigurationEntries.workspaceFolderValue || []);
            }
            else {
                profilesToReturn = connConfigurationEntries.workspaceFolderValue;
            }
        }
        if (profilesToReturn === undefined) {
            profilesToReturn = [];
        }
        this.PostProcessReadProfile(profilesToReturn);
        return profilesToReturn;
    }
    PostProcessReadProfile(profilesToReturn) {
        if (profilesToReturn) {
            profilesToReturn.forEach(profile => {
                let strRepresentation = profile.password;
                this.updateProfileCredentials(strRepresentation, profile);
                profile.password = helper.Utils.toCodePointArray(strRepresentation);
                strRepresentation = "";
                let strRepresentation2 = profile.proxyPassword;
                profile.proxyPassword = helper.Utils.toCodePointArray(strRepresentation2);
                this.updateProfileCredentials(strRepresentation2, profile);
                strRepresentation2 = "";
            });
        }
    }
    updateProfileCredentials(strRepresentation, profile) {
        if (strRepresentation) {
            if (!profile.passwordSaved) {
                profile.passwordSaved = true;
            }
            if (strRepresentation === "" || strRepresentation.length === 0) {
                profile.passwordEmptyByUser = true;
            }
        }
    }
    checkProfileNameForUniqueness(profileName) {
        const arrayOfProfiles = this.retrieveAllConnections(true);
        const val = arrayOfProfiles.find((value) => {
            return value.name === profileName;
        });
        if (val) {
            return false;
        }
        else {
            return true;
        }
    }
    replaceProfilesinSettings(connProfiles) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            this.PreProcessSaveProfile(connProfiles);
            yield setup_1.Setup.getExtensionConfigSection().update(Constants.Constants.connectionSettingsPropertyName, connProfiles, true);
        });
    }
    PreProcessSaveProfile(connProfiles) {
        if (connProfiles) {
            connProfiles.forEach((profile) => {
                if (profile.password) {
                    profile.password = String.fromCodePoint(...profile.password);
                }
                if (profile.proxyPassword) {
                    profile.proxyPassword = String.fromCodePoint(...profile.proxyPassword);
                }
            });
        }
    }
}
exports.OracleVSCodeConnectionSettingsManager = OracleVSCodeConnectionSettingsManager;
