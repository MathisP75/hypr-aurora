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
exports.CustomError = exports.ErrorCode = exports.ManageProfileTask = exports.ConnectionPropertiesPresenter = void 0;
const constants_1 = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const question_1 = require("../prompts/question");
const connectionRequest_1 = require("./../models/connectionRequest");
const helper = require("./../utilities/helper");
class ConnectionPropertiesPresenter {
    static createNameValueConnectionProperties(connectionProp) {
        const connPropertiesKeyValue = new connectionRequest_1.ConnectionPropertiesRepresentation();
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.authenticationType] = connectionProp.authenticationType;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.connectionLifeTime] = connectionProp.connectionLifeTime;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.connectionTimeout] = connectionProp.connectionTimeout;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.contextConnection] = connectionProp.contextConnection;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.connectionString] = connectionProp.connectionString;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.currentSchema] = connectionProp.currentSchema;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.dataSource] = connectionProp.dataSource;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.dBAPrivilege] = connectionProp.dBAPrivilege;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.decrPoolSize] = connectionProp.decrPoolSize;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.enlist] = connectionProp.enlist;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.hAEvents] = connectionProp.hAEvents;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.incrPoolSize] = connectionProp.incrPoolSize;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.loadBalancing] = connectionProp.loadBalancing;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.maxPoolSize] = connectionProp.maxPoolSize;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.metadataPooling] = connectionProp.metadataPooling;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.minPoolSize] = connectionProp.minPoolSize;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.serverName] = connectionProp.password;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.persistSecurityInfo] = connectionProp.persistSecurityInfo;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.pooling] = connectionProp.pooling;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.promotableTransaction] = connectionProp.promotableTransaction;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.providerDataSourceType] =
            connectionProp.providerDataSourceType;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.proxyUserID] = connectionProp.proxyUserID;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.proxyServerName] = connectionProp.proxyPassword;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.selfTunning] = connectionProp.selfTunning;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.statementCachePurge] = connectionProp.statementCachePurge;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.statementCacheSize] = connectionProp.statementCacheSize;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.userID] = connectionProp.userID;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.validateConnection] = connectionProp.validateConnection;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.tnsAdmin] = connectionProp.tnsAdmin;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.walletLocation] = connectionProp.walletLocation;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.proxyAuthByServerName] = connectionProp.proxyAuthByPassword;
        connPropertiesKeyValue.attributes[constants_1.ConnectionPropKeys.loginScript] = connectionProp.loginScript;
        return connPropertiesKeyValue;
    }
    static promptsAndAcceptsVariousConnProperties(connProperties, isPasswordRequired, wasPasswordEmptyInConfigFile, prompter, connRepository, defaultVSCodeProfileValues, deleteAndSaveProfile = false, ignoreFocusOut = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let connPropSaved = (connProperties);
            try {
                const questions = yield ConnectionPropertiesPresenter.getConnectionPropertiesFromUser(connProperties, defaultVSCodeProfileValues);
                const answers = yield prompter.prompt(questions, ignoreFocusOut);
                if (!answers) {
                    connPropSaved = null;
                }
            }
            catch (err) {
                helper.logErroAfterValidating(err.message);
            }
            return connPropSaved;
        });
    }
    static getConnectionPropertiesFromUser(connectionProp, defaultConnectionroperties, profileNew, profileNameQs) {
        return __awaiter(this, void 0, void 0, function* () {
            const passwordRequired = true;
            const questions = [
                {
                    type: question_1.QuestionTypes.hiddenInput,
                    name: localizedConstants_1.default.lblCredInfo,
                    message: localizedConstants_1.default.lblCredInfo,
                    placeHolder: connectionProp["name"] ? `Enter ${localizedConstants_1.default.questionCredInfoPlaceholder} for connection "${connectionProp['name']}"` : localizedConstants_1.default.questionCredInfoPlaceholder,
                    shouldPrompt: (answers) => ConnectionPropertiesPresenter.getPasswordInput(connectionProp, false),
                    validate: (value) => {
                        if (passwordRequired) {
                            return ConnectionPropertiesPresenter.isMandatoryValueAvlbl(localizedConstants_1.default.lblCredInfo, value);
                        }
                        return undefined;
                    },
                    onAnswered: (value) => {
                        connectionProp.password = value;
                        value = "";
                        const profile = connectionProp;
                        if (typeof (profile) !== "undefined") {
                            profile.passwordEmptyByUser = helper.isEmpty(connectionProp.password);
                        }
                    },
                },
                {
                    type: question_1.QuestionTypes.hiddenInput,
                    name: localizedConstants_1.default.lblProxyCredInfo,
                    message: localizedConstants_1.default.lblProxyCredInfo,
                    placeHolder: connectionProp["name"] ? `Enter ${localizedConstants_1.default.questionProxyCredInfoPlaceholder} for connection "${connectionProp['name']}"` : localizedConstants_1.default.questionProxyCredInfoPlaceholder,
                    shouldPrompt: (answers) => ConnectionPropertiesPresenter.getPasswordInput(connectionProp, true),
                    validate: (value) => {
                        if (passwordRequired) {
                            return ConnectionPropertiesPresenter.isMandatoryValueAvlbl(localizedConstants_1.default.lblProxyCredInfo, value);
                        }
                        return undefined;
                    },
                    onAnswered: (value) => {
                        connectionProp.proxyPassword = value;
                        value = "";
                        const profile = connectionProp;
                        if (typeof (profile) !== "undefined") {
                            profile.passwordEmptyByUser = helper.isEmpty(connectionProp.proxyPassword);
                        }
                    },
                },
            ];
            return questions;
        });
    }
    static getRoleList() {
        const roleList = [];
        roleList.push({
            name: constants_1.Constants.roleSYSDBA,
            value: constants_1.Constants.roleSYSDBA,
        });
        roleList.push({
            name: constants_1.Constants.roleSYSOPER,
            value: constants_1.Constants.roleSYSOPER,
        });
        return roleList;
    }
    static extractKeyConnString(connStr, keyTExtract) {
        let dataSource = "";
        if (connStr) {
            try {
                const regex = new RegExp(keyTExtract, "ig");
                const arr = connStr.match(regex);
                if (arr) {
                    const splitArr = arr[0].split("=");
                    if (splitArr && splitArr.length > 1) {
                        dataSource = splitArr[1];
                        for (let i = 2; i < splitArr.length; i++) {
                            dataSource = dataSource + "=" + splitArr[i];
                        }
                        if (dataSource.endsWith(";")) {
                            dataSource = dataSource.substring(0, dataSource.lastIndexOf(";"));
                        }
                    }
                }
            }
            catch (err) {
            }
        }
        return dataSource;
    }
    static isMandatoryValueAvlbl(promptStr, value) {
        if (helper.isEmpty(value)) {
            return promptStr + localizedConstants_1.default.msgIsRequired;
        }
        return undefined;
    }
    static getPasswordInput(connProp, proxy) {
        let prompt = false;
        const profileVS = connProp;
        const wasEmptyPasswordSaved = profileVS.passwordEmptyByUser && profileVS.passwordSaved;
        if (helper.isEmpty(connProp.connectionString) && !wasEmptyPasswordSaved) {
            if (proxy) {
                if (!helper.isEmpty(connProp.proxyUserID) && helper.isEmpty(connProp.proxyPassword) && connProp.proxyUserID !== "/") {
                    prompt = true;
                }
            }
            else {
                if (helper.isEmpty(connProp.password) && connProp.userID !== "/"
                    && (helper.isEmpty(connProp.proxyUserID) || connProp.proxyAuthByPassword)) {
                    prompt = true;
                }
            }
        }
        return prompt;
    }
}
exports.ConnectionPropertiesPresenter = ConnectionPropertiesPresenter;
ConnectionPropertiesPresenter.tnslist = [];
var ManageProfileTask;
(function (ManageProfileTask) {
    ManageProfileTask[ManageProfileTask["Create"] = 1] = "Create";
    ManageProfileTask[ManageProfileTask["Remove"] = 2] = "Remove";
    ManageProfileTask[ManageProfileTask["Edit"] = 3] = "Edit";
    ManageProfileTask[ManageProfileTask["ClearRecentlyUsed"] = 4] = "ClearRecentlyUsed";
})(ManageProfileTask = exports.ManageProfileTask || (exports.ManageProfileTask = {}));
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["REQUEST_TIMEDOUT"] = 1] = "REQUEST_TIMEDOUT";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
class CustomError extends Error {
}
exports.CustomError = CustomError;
