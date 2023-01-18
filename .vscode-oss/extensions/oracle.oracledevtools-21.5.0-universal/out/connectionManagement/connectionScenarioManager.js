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
exports.ConnectionScenarioManager = void 0;
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const oracleVSCodeConnector_1 = require("../infrastructure/oracleVSCodeConnector");
const connectionModels_1 = require("../models/connectionModels");
const question_1 = require("../prompts/question");
const helper = require("../utilities/helper");
const Utils = require("../utilities/helper");
const connectionCommandsScenarioManager_1 = require("./connectionCommandsScenarioManager");
const utilities_1 = require("../explorer/utilities");
const scriptExcutionCommandHandler_1 = require("../scriptExecution/scriptExcutionCommandHandler");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const defaultConnectionManager_1 = require("./defaultConnectionManager");
class ConnectionScenarioManager {
    constructor(varConnectionCmdHandler, varConnectionRepository, varPrompter, varOracleVsCodeConnector, varScriptExecutionCommandHandler) {
        this.varConnectionCmdHandler = varConnectionCmdHandler;
        this.varConnectionRepository = varConnectionRepository;
        this.varPrompter = varPrompter;
        this.varOracleVsCodeConnector = varOracleVsCodeConnector;
        this.varScriptExecutionCommandHandler = varScriptExecutionCommandHandler;
        if (!this.OracleVSCodeConnector) {
            this.OracleVSCodeConnector = new oracleVSCodeConnector_1.OracleVSCodeConnector();
        }
    }
    get connCommandHandler() {
        return this.varConnectionCmdHandler;
    }
    get OracleVSCodeConnector() {
        return this.varOracleVsCodeConnector;
    }
    set OracleVSCodeConnector(value) {
        this.varOracleVsCodeConnector = value;
    }
    displayConnectionList(createProfile, showExistingProfiles, isExplorer, showExistingProfilesOnly = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let listOfConns = self.varConnectionRepository.getConnectionListForDropDown(showExistingProfiles, showExistingProfilesOnly);
            let profileCreatedOrSelected;
            try {
                {
                    const selectedConn = yield self.askUserToSelectFromList({
                        placeHolder: localizedConstants_1.default.labelSelectConnectionFromList,
                        matchOnDescription: true,
                    }, listOfConns);
                    if (selectedConn) {
                        profileCreatedOrSelected = yield self.processSelectedConnection(createProfile, selectedConn, isExplorer);
                    }
                }
            }
            catch (err) {
                helper.logErroAfterValidating(err);
            }
            return profileCreatedOrSelected;
        });
    }
    askLanguageChange() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            const picklist = [
                {
                    label: localizedConstants_1.default.extensionOwner,
                    description: localizedConstants_1.default.plsqlLanguageDescription,
                    providerName: constants_1.Constants.extensionOwner,
                },
                {
                    label: localizedConstants_1.default.noneOwner,
                    description: localizedConstants_1.default.useNoneLanguage,
                    providerName: constants_1.Constants.noneOwner,
                },
            ];
            try {
                const selection = yield self.askUserToSelectFromList({
                    placeHolder: localizedConstants_1.default.selectLanguage,
                    matchOnDescription: true,
                }, picklist);
                if (selection) {
                    return selection.providerName;
                }
                else {
                    return undefined;
                }
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                return undefined;
            }
        });
    }
    aksToCancelConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let valToReturn = false;
            const question = {
                type: question_1.QuestionTypes.confirm,
                name: "cnfCancelConnect",
                message: localizedConstants_1.default.cnfCancelConnection,
            };
            try {
                const askResult = yield self.varPrompter.promptSingle(question);
                valToReturn = askResult ? true : false;
            }
            catch (err) {
                helper.logErroAfterValidating(err);
            }
            return valToReturn;
        });
    }
    askForLanguageModeChange() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            const question = {
                type: question_1.QuestionTypes.confirm,
                name: "cnfLangChange",
                message: localizedConstants_1.default.cnfChangeLanguageMode,
            };
            let funcresult = false;
            try {
                const selValue = yield self.varPrompter.promptSingle(question);
                if (selValue) {
                    yield vscode.commands.executeCommand("workbench.action.editor.changeLanguageMode");
                    funcresult = yield self.stopTillLanguageIsOraclePLSQL();
                }
                else {
                    funcresult = false;
                }
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                funcresult = false;
            }
            return funcresult;
        });
    }
    handleDisconnectChoice() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            try {
                const question = {
                    type: question_1.QuestionTypes.confirm,
                    name: localizedConstants_1.default.disconnectConnectionMessage,
                    message: localizedConstants_1.default.cnfDisconnectConnection,
                };
                const result = yield self.varPrompter.promptSingle(question);
                return result;
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                return false;
            }
        });
    }
    removeProfile(connProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let continueWithRemove = true;
            if (!connProfile) {
                const profiles = self.varConnectionRepository.getSavedConnectionProfilesList(false);
                connProfile = yield self.selectProfileForRemoval(profiles);
            }
            else {
                let msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConfirmProfileRemoval, connProfile.name);
                continueWithRemove = yield Utils.Utils.promptForConfirmation(msg, this.OracleVSCodeConnector);
            }
            if (connProfile && continueWithRemove) {
                const profileDeleted = yield self.varConnectionRepository.deleteConnectionProfile(connProfile);
                if (profileDeleted === true) {
                    self.varOracleVsCodeConnector.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgProfileRemovedSuccess, connProfile.name));
                    yield defaultConnectionManager_1.DefaultConnectionManager.instance.connectionDeleted(connProfile.name);
                }
                return profileDeleted;
            }
            else {
                return false;
            }
        });
    }
    updateProfile(connProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            try {
                if (!connProfile) {
                    const profiles = self.varConnectionRepository.getSavedConnectionProfilesList(false);
                    connProfile = yield self.selectProfileForUpdate(profiles);
                }
                if (connProfile) {
                    const args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
                    args.uri = utilities_1.TreeViewConstants.baseUri + connProfile.name + "_Update";
                    args.executionId = (++self.varScriptExecutionCommandHandler.scriptExecutionCount).toString();
                    args.windowUri = constants_1.Constants.connectionWindowUri;
                    args.uiMode = scriptExecutionModels_1.UIDisplayMode.ConnectionManagement;
                    args.isCreate = false;
                    args.profileName = connProfile.name;
                    args.windowTitle = localizedConstants_1.default.connectionUITitle;
                    self.connCommandHandler.openProfileUI(args);
                }
                else {
                    return false;
                }
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                return false;
            }
        });
    }
    shallAskForAnyMissingConnInfo(connPropVsCode, ignoreFocusOut = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let connPropToReturn;
            if (connPropVsCode.connectionString) {
                connPropToReturn = (connPropVsCode);
            }
            else {
                const passwordEmptyInConfigFile = Utils.isEmpty(connPropVsCode.password);
                try {
                    connPropToReturn =
                        yield connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.promptsAndAcceptsVariousConnProperties(connPropVsCode, false, passwordEmptyInConfigFile, self.varPrompter, self.varConnectionRepository, null, false, ignoreFocusOut);
                }
                catch (err) {
                    helper.logErroAfterValidating(err);
                }
            }
            return connPropToReturn;
        });
    }
    askUserToSelectFromList(options, choices) {
        const self = this;
        const question = {
            choices,
            matchOptions: options,
            message: options.placeHolder,
            name: "connectionselectquestion",
            type: question_1.QuestionTypes.expand,
        };
        return self.varPrompter.promptSingle(question);
    }
    processSelectedConnection(createProfile, selectedItem, isExplorer) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            let profileToreturn;
            if (selectedItem !== undefined) {
                try {
                    switch (selectedItem.matchingEnumType) {
                        case connectionModels_1.ConnectionAttributesSelection.CreateNew:
                            yield self.connCommandHandler.openCreateProfileUI(self.OracleVSCodeConnector.activeTextEditorUri, true);
                            break;
                        default:
                            profileToreturn = yield self.shallAskForAnyMissingConnInfo(selectedItem.connectionProperties);
                    }
                }
                catch (err) {
                    helper.logErroAfterValidating(err);
                }
            }
            return profileToreturn;
        });
    }
    askToClearRecentConnectionsList() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            try {
                const question = {
                    message: localizedConstants_1.default.cnfClearRecentConnectionList,
                    name: localizedConstants_1.default.cnfClearRecentConnectionList,
                    type: question_1.QuestionTypes.confirm,
                };
                const result = yield self.varPrompter.promptSingle(question);
                return result ? true : false;
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                return false;
            }
        });
    }
    saveVsCodeProfile(oracleVsCodeprofile, oldConnectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            let savedProfile;
            const self = this;
            savedProfile = yield self.varConnectionRepository.saveConnectionProfileToConfig(oracleVsCodeprofile, oldConnectionName);
            return savedProfile;
        });
    }
    selectProfileForRemoval(profiles) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            if (!profiles || profiles.length === 0) {
                self.varOracleVsCodeConnector.showErrorMessage(localizedConstants_1.default.msgNoProfileAvaialble);
                return undefined;
            }
            const questions = [
                {
                    choices: profiles,
                    matchOptions: { matchOnDescription: true },
                    message: localizedConstants_1.default.msgSelectProfileToRemove,
                    name: "selectProfile",
                    type: question_1.QuestionTypes.expand,
                    onAnswered: (value) => {
                        const connectionProps = value.connectionProperties;
                        const connectionName = connectionProps.name;
                        questions[1].message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConfirmProfileRemoval, connectionName);
                    }
                },
                {
                    message: localizedConstants_1.default.msgConfirmProfileRemoval,
                    name: "cnfREmoval",
                    type: question_1.QuestionTypes.confirm,
                },
            ];
            try {
                const answers = yield self.varPrompter.prompt(questions);
                if (answers && answers.cnfREmoval) {
                    const profilePickItem = answers.selectProfile;
                    return profilePickItem.connectionProperties;
                }
                else {
                    return undefined;
                }
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                return undefined;
            }
        });
    }
    selectProfileForUpdate(profiles) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            if (!profiles || profiles.length === 0) {
                self.varOracleVsCodeConnector.showErrorMessage(localizedConstants_1.default.msgNoProfileAvaialble);
                return undefined;
            }
            const questions = [
                {
                    choices: profiles,
                    matchOptions: { matchOnDescription: true },
                    message: localizedConstants_1.default.msgSelectProfileToUpdate,
                    name: "selectProfile",
                    type: question_1.QuestionTypes.expand,
                }
            ];
            try {
                const answers = yield self.varPrompter.prompt(questions);
                if (answers) {
                    const profilePickItem = answers.selectProfile;
                    return profilePickItem.connectionProperties;
                }
                else {
                    return undefined;
                }
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                return undefined;
            }
        });
    }
    stopForDocumentToAssociateWWithOracle(resolve, timer) {
        const self = this;
        if (timer.getDuration() > constants_1.Constants.timeToWaitForLanguageModeChange) {
            resolve(false);
        }
        else if (self.OracleVSCodeConnector.isActiveOracleFile) {
            resolve(true);
        }
        else {
            setTimeout(self.stopForDocumentToAssociateWWithOracle.bind(self, resolve, timer), 50);
        }
    }
    stopTillLanguageIsOraclePLSQL() {
        const self = this;
        return new Promise((resolve, reject) => {
            const timer = new Utils.Timer();
            timer.start();
            self.stopForDocumentToAssociateWWithOracle(resolve, timer);
        });
    }
    renameRecentlyUsedConnection(oldConnName, newConnName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.varConnectionRepository.renameRecentlyUsedConnection(oldConnName, newConnName);
        });
    }
}
exports.ConnectionScenarioManager = ConnectionScenarioManager;
