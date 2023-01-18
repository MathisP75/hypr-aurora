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
exports.SystemManager = void 0;
const childProcess = require("child_process");
const events = require("events");
const vscode = require("vscode");
const connectionCommandsHandler_1 = require("../connectionManagement/connectionCommandsHandler");
const constants_1 = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const utilities_1 = require("../explorer/utilities");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const untitiledDocumentProvider_1 = require("../models/untitiledDocumentProvider");
const adapter_1 = require("../prompts/adapter");
const helper_1 = require("../utilities/helper");
const helper = require("../utilities/helper");
const resultsDataServer_1 = require("./../scriptExecution/resultsDataServer");
const scriptExcutionCommandHandler_1 = require("./../scriptExecution/scriptExcutionCommandHandler");
const scriptExecutionEventsHandler_1 = require("./../scriptExecution/scriptExecutionEventsHandler");
const logger_1 = require("./logger");
const oracleLanguageServerClient_1 = require("./oracleLanguageServerClient");
const oracleVSCodeConnector_1 = require("./oracleVSCodeConnector");
const statusBarManager_1 = require("./statusBarManager");
const localizedConstants_2 = require("./../constants/localizedConstants");
const setup_1 = require("../utilities/setup");
const oracleCompletionItemProvider_1 = require("./oracleCompletionItemProvider");
const oracleSignatureHelpProvider_1 = require("./oracleSignatureHelpProvider");
const queryHistoryManager_1 = require("../explorer/queryHistoryManager");
const queryBookmarkManager_1 = require("../explorer/queryBookmarkManager");
const testsManager_1 = require("../tests/testsManager");
const userPreferenceManager_1 = require("./userPreferenceManager");
const oracleEditorManager_1 = require("./oracleEditorManager");
const oracleDocumentSymbolProvider_1 = require("./oracleDocumentSymbolProvider");
const ociExplorerManager_1 = require("../explorer/autonomousDatabaseExplorer/ociExplorerManager");
const editorProvider_1 = require("../explorer/editors/editorProvider");
const debugManager_1 = require("../debugger/debugManager");
const compilerSettingsManager_1 = require("../explorer/compilerSettingsManager");
const oracleGotoProviders_1 = require("./oracleGotoProviders");
const oracleHoverProvider_1 = require("./oracleHoverProvider");
const debuggerSettingsManager_1 = require("../explorer/debuggerSettingsManager");
const connectionSettingsManager_1 = require("../connectionManagement/connectionSettingsManager");
const connectionModels_1 = require("../models/connectionModels");
const oracleCodeLensProviders_1 = require("./oracleCodeLensProviders");
const oracleFormattingProvider_1 = require("./oracleFormattingProvider");
const oracleCodeFoldingProvider_1 = require("./oracleCodeFoldingProvider");
const formatterSettingsManager_1 = require("../explorer/formatterSettingsManager");
const defaultConnectionManager_1 = require("../connectionManagement/defaultConnectionManager");
const editorUtils_1 = require("../explorer/editors/editorUtils");
class SystemManager {
    constructor(context) {
        this.context = context;
        this.vscodeConnector = undefined;
        this.fileLogger = undefined;
        this.initialized = false;
        this.scriptExecutionCommandHandler = undefined;
        this.event = new events.EventEmitter();
        this.openingFolderFirstTime = true;
        this.vscodeConnector = new oracleVSCodeConnector_1.OracleVSCodeConnector(context);
        this.untitiledDocumentProvider = new untitiledDocumentProvider_1.default(this.vscodeConnector);
        this.sessionId = process.pid.toString() + "_" + new Date().valueOf().toString();
    }
    deactivate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.debugManager.removeBreakpoints();
            const self = this;
            self.fileLogger.info("Disposing language client.");
            yield oracleLanguageServerClient_1.OracleLanguageServerClient.dispose();
            self.fileLogger.info("Disposed language client.");
            self.fileLogger.info("Disposing Result UI Process.");
            resultsDataServer_1.ResultDataServer.dispose();
            self.fileLogger.info("Disposed Result UI Process.");
            self.fileLogger.info("Deactivating System Manager.");
        });
    }
    canExecuteQuery() {
        if (this.vscodeConnector.isActiveOracleFile) {
            return true;
        }
    }
    init(dotnetRuntimeFullVersion, dotnetRuntimeMajorVersion, dotnetRuntimePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            if (!self.initialized) {
                self.fileLogger = logger_1.FileStreamLogger.Instance;
                self.fileLogger.info("Initializing System Manager ");
                self.setLocale();
                setup_1.ConfigManager.initialize(this.context.extensionPath);
                self.statusController = new statusBarManager_1.StatusBarManager(self.vscodeConnector);
                utilities_1.ExplorerUtilities.vscodeConnector = self.vscodeConnector;
                try {
                    const srvInitResult = yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance
                        .init(self.context, self.vscodeConnector, dotnetRuntimeFullVersion, dotnetRuntimeMajorVersion, dotnetRuntimePath);
                    if (srvInitResult) {
                        self.fileLogger.info("Initializing Oracle Language Server and Client");
                        self.fileLogger.info("Initializing Result Data Server");
                        resultsDataServer_1.ResultDataServer.init();
                        self.fileLogger.info("Initialized Result Data Server");
                        self.fileLogger.info("Registering commands");
                        self.registerCommands();
                        self.fileLogger.info("Registered commands");
                        self.fileLogger.info("Initializing ScriptExecution Events Handler");
                        scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.init(this.statusController, self.vscodeConnector, resultsDataServer_1.ResultDataServer.instanceSingle);
                        self.fileLogger.info("Initialized ScriptExecution Events Handler");
                        self.fileLogger.info("Creating ScriptExecution Command Handler");
                        self.scriptExecutionCommandHandler = new scriptExcutionCommandHandler_1.ScriptExecutionCommandHandler(scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance, self.vscodeConnector, resultsDataServer_1.ResultDataServer.instanceSingle, self.statusController);
                        self.fileLogger.info("Created ScriptExecution Command Handler");
                        self.fileLogger.info("Creating Connection Commands Handler");
                        self.connectionController = new connectionCommandsHandler_1.default(self.context, self.statusController, new adapter_1.default(), self.scriptExecutionCommandHandler);
                        self.fileLogger.info("Created Connection Commands Handler");
                        self.fileLogger.info("Creating Compiler Settings Manager");
                        self.compilerSettingsManager = new compilerSettingsManager_1.CompilerSettingsManager(self.scriptExecutionCommandHandler);
                        self.fileLogger.info("Created Compiler Settings Manager");
                        self.fileLogger.info("Creating Formatter Settings Handler");
                        self.formatterSettingsManager = new formatterSettingsManager_1.FormatterSettingsManager(self.scriptExecutionCommandHandler);
                        self.fileLogger.info("Created Formatter Settings Handler");
                        self.fileLogger.info("Creating Debugger Settings Handler");
                        self.debuggerSettingsManager = new debuggerSettingsManager_1.debuggerSettingsManager();
                        self.fileLogger.info("Created Debugger Settings Handler");
                        self.fileLogger.info("Creating Oracle Database Explorer Manager");
                        self.dataExpManager = dataExplorerManager_1.DataExplorerManager.CreateInstance(self.vscodeConnector, self.connectionController, self.context, self.scriptExecutionCommandHandler);
                        self.fileLogger.info("Created Oracle Database Explorer Manager");
                        self.fileLogger.info("Initializing Oracle Database Explorer Manager");
                        self.dataExpManager.init();
                        self.fileLogger.info("Initialized Oracle Database Explorer Manager");
                        self.fileLogger.info("Creating OCI Cloud Explorer Manager ");
                        self.cloudExplorerManager = ociExplorerManager_1.OCIExplorerManager.CreateInstance(self.vscodeConnector, self.connectionController, self.fileLogger);
                        self.fileLogger.info("Created OCI Cloud Explorer Manager");
                        self.fileLogger.info("Creating Query History Manager ");
                        self.queryHistorManager = queryHistoryManager_1.QueryHistoryManager.CreateInstance(self.connectionController, self.vscodeConnector, self.scriptExecutionCommandHandler, self.fileLogger, new adapter_1.default(), self.untitiledDocumentProvider);
                        self.fileLogger.info("Created Query History Manager");
                        self.fileLogger.info("Get the Global Storage Path from Extension Context");
                        var storagePath = self.context.globalStoragePath;
                        self.fileLogger.info("Creating Query Bookmark Manager");
                        self.queryBookmarkManager = queryBookmarkManager_1.QueryBookmarkManager.CreateInstance(self.connectionController, self.vscodeConnector, self.scriptExecutionCommandHandler, new adapter_1.default(), self.untitiledDocumentProvider, self.fileLogger);
                        self.fileLogger.info("Created Query Bookmark Manager");
                        self.fileLogger.info("Initializing Toolbar Manager");
                        oracleEditorManager_1.default.initialize(this.context, this.vscodeConnector, resultsDataServer_1.ResultDataServer.instanceSingle);
                        self.fileLogger.info("Initialized Toolbar Manager");
                        self.fileLogger.info("Creating Inteliisense Data Manager");
                        this.oracleIntelliSenseDataManager = oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance;
                        self.fileLogger.info("Created Intellisense Data Manager");
                        self.fileLogger.info("Set Status Bar Manager on the Intellisense Data Manager");
                        this.oracleIntelliSenseDataManager.setStatusBarManager(self.statusController);
                        self.fileLogger.info("Creating Oracle Signature Help Provider");
                        this.signatureHelpProvider = new oracleSignatureHelpProvider_1.oracleSignatureHelpProvider(self.vscodeConnector, self.connectionController, self.dataExpManager);
                        self.fileLogger.info("Created Oracle Signature Help Provider");
                        self.fileLogger.info("Registering Oracle Signature Help Provider with VSCode");
                        vscode.languages.registerSignatureHelpProvider(constants_1.Constants.oracleLanguageID, this.signatureHelpProvider, '(', ',');
                        self.fileLogger.info("Registered Oracle Signature Help Provider with VSCode");
                        self.fileLogger.info("Creating Default Connection Manager");
                        self.defaultConnManager = defaultConnectionManager_1.DefaultConnectionManager.CreateInstance(self.dataExpManager, self.vscodeConnector, self.statusController, self.connectionController);
                        self.fileLogger.info("Created Default Connection Manager instance");
                        self.fileLogger.info("Creating Oracle CompletionItem Provider");
                        this.completionitemProvider = new oracleCompletionItemProvider_1.oracleCompletionitemProvider(self.vscodeConnector, self.connectionController, self.dataExpManager, this.signatureHelpProvider);
                        self.fileLogger.info("Created Oracle CompletionItem Provider");
                        self.fileLogger.info("Registering Oracle CompletionItem Provider with VSCode");
                        vscode.languages.registerCompletionItemProvider(constants_1.Constants.oracleLanguageID, this.completionitemProvider, '.', " ");
                        self.fileLogger.info("Registered Oracle CompletionItem Provider with VSCode");
                        self.fileLogger.info("Creating Oracle Document Symbol Provider");
                        this.documentSymbolProvider = new oracleDocumentSymbolProvider_1.oracleDocumentSymbolProvider();
                        self.fileLogger.info("Created Oracle Document Symbol Provider");
                        self.fileLogger.info("Registering Oracle Document Symbol Provider with VSCode");
                        vscode.languages.registerDocumentSymbolProvider(constants_1.Constants.oracleLanguageID, this.documentSymbolProvider);
                        self.fileLogger.info("Registered Oracle Document Symbol Provider with VSCode");
                        self.fileLogger.info("Creating Oracle Hover Provider");
                        this.hoverProvider = new oracleHoverProvider_1.oracleHoverProvider(self.vscodeConnector, self.connectionController, self.dataExpManager);
                        self.fileLogger.info("Created Oracle Hover Provider");
                        self.fileLogger.info("Registering Oracle Hover Provider with VSCode");
                        vscode.languages.registerHoverProvider(constants_1.Constants.oracleLanguageID, this.hoverProvider);
                        self.fileLogger.info("Registered Oracle Hover Provider with VSCode");
                        self.fileLogger.info("Creating Test Manager");
                        self.testsManager = new testsManager_1.TestsManager();
                        self.fileLogger.info("Created Test Manager");
                        self.fileLogger.info("Initializing Test Manager");
                        self.testsManager.init(new adapter_1.default(), self.vscodeConnector, self.fileLogger, storagePath);
                        self.fileLogger.info("Initialized Test Manager");
                        self.fileLogger.info("Creating User Preference Manager");
                        this.userPreferenceManager = userPreferenceManager_1.UserPreferenceManager.CreateInstance();
                        self.fileLogger.info("Created User Preference Manager");
                        self.fileLogger.info("Initializing User Preference Manager");
                        this.userPreferenceManager.init();
                        self.fileLogger.info("Initialized User Preference Manager");
                        self.fileLogger.info("Creating Code Editor Provider");
                        this.codeEditorProvider = new editorProvider_1.editorProvider(this.vscodeConnector, this.dataExpManager);
                        self.fileLogger.info("Created Code Editor Provider");
                        self.fileLogger.info("Creating Oracle Definition Provider");
                        this.definitionProvider = new oracleGotoProviders_1.oracleDefinitionProvider(this.vscodeConnector, this.connectionController, this.dataExpManager, this.codeEditorProvider);
                        self.fileLogger.info("Created Oracle Definition Provider");
                        self.fileLogger.info("Registering Oracle Definition Provider");
                        vscode.languages.registerDefinitionProvider(constants_1.Constants.oracleLanguageID, this.definitionProvider);
                        self.fileLogger.info("Registered Oracle Definition Provider");
                        self.fileLogger.info("Creating Oracle Implementation Provider");
                        this.implementationProvider = new oracleGotoProviders_1.oracleImplementationProvider(this.vscodeConnector, this.connectionController, this.dataExpManager, this.codeEditorProvider);
                        self.fileLogger.info("Created Oracle Implementation Provider");
                        self.fileLogger.info("Registering Oracle Implementation Provider");
                        vscode.languages.registerImplementationProvider(constants_1.Constants.oracleLanguageID, this.implementationProvider);
                        self.fileLogger.info("Registered Oracle Implementation Provider");
                        self.fileLogger.info("Creating Oracle Type Definition Provider");
                        this.typeDefinitionProvider = new oracleGotoProviders_1.oracleTypeDefinitionProvider(this.vscodeConnector, this.connectionController, this.dataExpManager, this.codeEditorProvider);
                        self.fileLogger.info("Created Oracle Type Definition Provider");
                        self.fileLogger.info("Registering Oracle Type Definition Provider");
                        vscode.languages.registerTypeDefinitionProvider(constants_1.Constants.oracleLanguageID, this.typeDefinitionProvider);
                        self.fileLogger.info("Registering Oracle Type Definition Provider");
                        self.fileLogger.info("Creating Oracle Reference Provider");
                        this.referenceProvider = new oracleGotoProviders_1.oracleReferenceProvider(this.vscodeConnector, this.connectionController, this.dataExpManager, this.codeEditorProvider);
                        self.fileLogger.info("Created Oracle Reference Provider");
                        self.fileLogger.info("Registering Oracle Reference Provider");
                        vscode.languages.registerReferenceProvider(constants_1.Constants.oracleLanguageID, this.referenceProvider);
                        self.fileLogger.info("Registered Oracle Reference Provider");
                        self.fileLogger.info("Creating Oracle CodeLens Provider");
                        this.codelensreferenceProvider = new oracleCodeLensProviders_1.oracleCodeLensReferenceProvider(this.vscodeConnector, this.connectionController, this.dataExpManager, this.codeEditorProvider);
                        self.fileLogger.info("Created Oracle CodeLens Provider");
                        self.fileLogger.info("Registering Oracle CodeLens Provider");
                        vscode.languages.registerCodeLensProvider(constants_1.Constants.oracleLanguageID, this.codelensreferenceProvider);
                        self.fileLogger.info("Registered Oracle CodeLens Provider");
                        self.fileLogger.info("Creating Oracle Document Formatting Provider");
                        this.formattingProvider = new oracleFormattingProvider_1.oracleDocumentFormattingProvider();
                        self.fileLogger.info("Created Oracle Document Formatting Provider");
                        self.fileLogger.info("Registering Oracle Document Formatting Provider");
                        vscode.languages.registerDocumentFormattingEditProvider(constants_1.Constants.oracleLanguageID, this.formattingProvider);
                        self.fileLogger.info("Registered Oracle Document Formatting Provider");
                        self.fileLogger.info("Creating Oracle Document Range Formatting Provider");
                        this.rangeFormattingProvider = new oracleFormattingProvider_1.oracleRangeFormattingProvider();
                        self.fileLogger.info("Created Oracle Document Range Formatting Provider");
                        self.fileLogger.info("Registering Oracle Document Range Formatting Provider");
                        vscode.languages.registerDocumentRangeFormattingEditProvider(constants_1.Constants.oracleLanguageID, this.rangeFormattingProvider);
                        self.fileLogger.info("Registered Oracle Document Range Formatting Provider");
                        self.fileLogger.info("Creating Oracle Type Formatting Provider");
                        this.onTypeFormattingProvider = new oracleFormattingProvider_1.oracleTypeFormattingProvider();
                        self.fileLogger.info("Created Oracle Type Formatting Provider");
                        self.fileLogger.info("Registering Oracle Type Formatting Provider");
                        vscode.languages.registerOnTypeFormattingEditProvider(constants_1.Constants.oracleLanguageID, this.onTypeFormattingProvider, ';', '/');
                        self.fileLogger.info("Registered Oracle Type Formatting Provider");
                        self.fileLogger.info("Creating Oracle Folding Range Provider");
                        this.codeFoldingProvider = new oracleCodeFoldingProvider_1.oracleCodeFoldingProvider();
                        self.fileLogger.info("Created Oracle Folding Range Provider");
                        self.fileLogger.info("Registering Oracle Folding Range Provider");
                        vscode.languages.registerFoldingRangeProvider(constants_1.Constants.oracleLanguageID, this.codeFoldingProvider);
                        self.fileLogger.info("Registered Oracle Folding Range Provider");
                        self.fileLogger.info("Registering Oracle File System Provider");
                        this.context.subscriptions.push(vscode.workspace.registerFileSystemProvider(constants_1.Constants.oracleScheme, this.codeEditorProvider, { isCaseSensitive: true }));
                        self.fileLogger.info("Registered Oracle File System Provider");
                        self.fileLogger.info("Set PL/SQL Debugger Progam Name using dotnet runtime major version: " + dotnetRuntimeMajorVersion);
                        setup_1.Setup.setPlsqlDebuggerProgram(dotnetRuntimeMajorVersion, dotnetRuntimePath);
                        self.fileLogger.info("Creating PL/SQL Debugger Manager");
                        self.debugManager = debugManager_1.DebugManager.CreateInstance(self.context, self.dataExpManager, self.scriptExecutionCommandHandler, self.vscodeConnector);
                        self.fileLogger.info("Created PL/SQL Debugger Manager");
                        self.fileLogger.info("Initializing PL/SQL Debugger Manager");
                        self.debugManager.init();
                        self.fileLogger.info("Initialized PL/SQL Debugger Manager");
                        if (self.vscodeConnector.isActiveOracleFile) {
                            self.fileLogger.info("Updating status bar for active file");
                            self.statusController.displayDefaults(self.vscodeConnector.activeTextEditorUri);
                            self.fileLogger.info("Updated status bar for active file");
                            self.fileLogger.info("Associating default connection with active file");
                            self.defaultConnManager.associateDefaultConnectionToFile(self.vscodeConnector.activeTextEditor.document);
                            self.fileLogger.info("Associated default connection with active file");
                        }
                        self.initialized = true;
                        self.fileLogger.info("Initialization completed");
                    }
                }
                catch (error) {
                    self.fileLogger.error("Error during initialization. Error: " + error);
                    throw new Error(error);
                }
            }
        });
    }
    onRebuildIntelliSenseHandler() {
        const self = this;
        self.fileLogger.info("Rebuild Intellisense metadata command received from VS Code");
        if (self.isExtensionInitialized && self.documentIsOpenAndOracle()) {
            const fileUri = self.vscodeConnector.activeTextEditorUri;
            if (fileUri) {
                this.statusController.displayLangServiceStatus(fileUri, localizedConstants_1.default.updatingIntellisenseMessage);
                oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendNotification(intellisenseRequests_1.RebuildIntelliSenseNotification.event, { uri: fileUri });
            }
        }
    }
    isSaveRequired() {
        const self = this;
        self.fileLogger.info("checking if the active text document needs to be saved.");
        const activeDoc = this.vscodeConnector.activeTextEditor.document;
        if (activeDoc && (activeDoc.isDirty || activeDoc.isUntitled)) {
            if (activeDoc.isDirty && !activeDoc.isUntitled) {
                activeDoc.save();
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }
    openDocumentHandler(doc) {
        const self = this;
        if (self.initialized === false) {
            return;
        }
        self.fileLogger.info("Open Document event received from VS Code");
        this.connectionController.textDocumentOpenHandler(doc);
        if (doc && doc.languageId === constants_1.Constants.oracleLanguageID) {
            this.statusController.extensionChanged(helper.convertURIToString(doc.uri), constants_1.Constants.extensionOwner);
        }
        self.previousOpenedDoc = helper.convertURIToString(doc.uri);
        self.documentOpenedTimer = new helper_1.Timer();
        self.documentOpenedTimer.start();
        let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(doc);
        if (explorerFile) {
            this.codeEditorProvider.onEditorOpened(doc, this);
        }
        else {
            this.defaultConnManager.associateDefaultConnectionToFile(doc);
        }
        this.scriptExecutionCommandHandler.resetScriptExecution(doc.uri.toString());
    }
    saveDocumentHandler(doc) {
        const self = this;
        if (self.initialized === false) {
            return;
        }
        self.fileLogger.info("Save Document event received from VS Code");
        self.previousSavedDoc = helper.convertURIToString(doc.uri);
        self.documentSavedTimer = new helper_1.Timer();
        self.documentSavedTimer.start();
    }
    isExtensionInitialized() {
        const self = this;
        if (!this.initialized) {
            self.vscodeConnector.showErrorMessage("extensionUnInitializedError");
        }
        return self.initialized;
    }
    documentIsOpenAndOracle() {
        this.fileLogger.info("Check if a document is associated with Oracle");
        let valToReturn = true;
        if (!this.vscodeConnector.isActiveOracleFile) {
            this.vscodeConnector.showWarningMessage("msgFileAssociationMissing");
            valToReturn = false;
        }
        return valToReturn;
    }
    isExecuteCurrentQueryCommand(selection) {
        let result = false;
        if (selection) {
            if (selection.startLine === selection.endLine &&
                selection.startColumn === selection.endColumn) {
                result = true;
            }
        }
        return result;
    }
    registerCommandHandler(commandName) {
        const self = this;
        self.vscodeConnector.registerCommand(commandName, () => {
            self.event.emit(commandName);
        }, self);
    }
    registerCommands() {
        const self = this;
        self.fileLogger.info("Registering command handlers for various commands");
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdExecuteAll, self.executeAllCommand, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdExecuteSQL, self.executeSQLCommand, self);
        self.event.on(constants_1.Constants.cmdConnectCommandName, () => {
            self.runAndLogUnhandledError(self.newConnectionHandler());
        });
        self.registerCommandHandler(constants_1.Constants.cmdConnectCommandName);
        self.event.on(constants_1.Constants.cmdDisconnectCommandName, () => {
            self.runAndLogUnhandledError(self.disconnectHandler());
        });
        self.registerCommandHandler(constants_1.Constants.cmdDisconnectCommandName);
        self.registerCommandHandler(constants_1.Constants.cmdManageProfiles);
        self.event.on(constants_1.Constants.cmdEnableDisableOracleLanguageServices, () => __awaiter(this, void 0, void 0, function* () {
            yield self.oracleLanguageAssocHandler().
                then(result => {
                if (result != undefined) {
                    this.oracleIntelliSenseDataManager.updateLanguageFeatureForDocument(self.vscodeConnector.activeTextEditorUri, result);
                }
            }).catch(error => {
                self.vscodeConnector.showErrorMessage(localizedConstants_1.default.errorEncountered + error);
            });
        }));
        self.registerCommandHandler(constants_1.Constants.cmdEnableDisableOracleLanguageServices);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdCancelScriptExecution, self.cancelScriptExecutionHandler, self);
        self.event.on(constants_1.Constants.cmdRebuildIntelliSenseMetaData, () => {
            self.onRebuildIntelliSenseHandler();
        });
        self.registerCommandHandler(constants_1.Constants.cmdRebuildIntelliSenseMetaData);
        this.event.on(constants_1.Constants.cmdRunNewQuery, () => {
            self.onRunNewQuery();
        });
        self.registerCommandHandler(constants_1.Constants.cmdRunNewQuery);
        this.event.on(constants_1.Constants.cmdRunGettingStartedGuide, () => {
            self.onGettingStartedGuide();
        });
        self.registerCommandHandler(constants_1.Constants.cmdRunGettingStartedGuide);
        self.vscodeConnector.onDidCloseTextDocument((params) => {
            self.closeDocumentHandler(params);
        });
        self.vscodeConnector.onDidOpenTextDocument((params) => self.openDocumentHandler(params));
        self.vscodeConnector.onDidSaveTextDocument((params) => self.saveDocumentHandler(params));
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerConnectionDelete, (conNode) => __awaiter(this, void 0, void 0, function* () {
            if (conNode) {
                yield this.connectionController.removeProfileHandler(conNode.connectionProperties);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerConnectionModify, (conNode) => __awaiter(this, void 0, void 0, function* () {
            yield this.onModifyConnection(conNode);
        }));
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerConnectionNew, (conNode) => __awaiter(this, void 0, void 0, function* () {
            yield this.onNewConnection();
        }));
        vscode.commands.registerCommand(constants_1.Constants.cmdPaletteClearRecentConnections, () => __awaiter(this, void 0, void 0, function* () {
            yield self.connectionController.clearMRUConnectionList();
        }));
        vscode.commands.registerCommand(constants_1.Constants.cmdPaletteConnectionDelete, () => __awaiter(this, void 0, void 0, function* () {
            yield self.connectionController.removeProfileHandler(undefined);
        }));
        vscode.commands.registerCommand(constants_1.Constants.cmdPaletteConnectionModify, () => __awaiter(this, void 0, void 0, function* () {
            yield self.connectionController.updateProfileHandler(undefined);
        }));
        vscode.commands.registerCommand(constants_1.Constants.cmdPaletteConnectionNew, () => __awaiter(this, void 0, void 0, function* () {
            yield this.newConnectionUI(self);
        }));
        self.vscodeConnector.onDidChangeActiveTextEditor((textEditor) => __awaiter(this, void 0, void 0, function* () { return yield self.onActiveTextEditorChanged(textEditor); }));
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerOpenNewSQLFile, (conNode) => __awaiter(this, void 0, void 0, function* () {
            yield this.onOpenNewSQLFileFromConnection(conNode);
        }));
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerOpenExistingSQLFile, (conNode) => __awaiter(this, void 0, void 0, function* () {
            yield this.onOpenExistingSQLFileFromConnection(conNode);
        }));
        vscode.commands.registerCommand(constants_1.Constants.openCompilerSettingsCommand, () => __awaiter(this, void 0, void 0, function* () {
            yield self.compilerSettingsManager.openCompilerSettings();
        }));
        vscode.commands.registerCommand(constants_1.Constants.openFormatterSettingsCommand, () => __awaiter(this, void 0, void 0, function* () {
            yield self.formatterSettingsManager.openFormatterSettings(false);
        }));
        vscode.commands.registerCommand(constants_1.Constants.openFormatterSettingFromToolbarCmd, () => __awaiter(this, void 0, void 0, function* () {
            yield self.formatterSettingsManager.openFormatterSettings(true);
        }));
        vscode.commands.registerCommand(constants_1.Constants.cmdGetDatabaseExplorerConnections, () => __awaiter(this, void 0, void 0, function* () {
            return self.getDatabaseExplorerConnections();
        }));
        vscode.commands.registerCommand(constants_1.Constants.installXeDatabase, () => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Launching XE Database installation page");
                let command;
                let link;
                if (process.platform === constants_1.Constants.windowsProcessPlatform) {
                    link = constants_1.Constants.oracleInstallXEDatabaseWinURL;
                    command = `${constants_1.Constants.windowsOpenCommand} ${constants_1.Constants.oracleInstallXEDatabaseWinURL}`;
                }
                else if (process.platform === constants_1.Constants.linuxProcessPlatform) {
                    link = constants_1.Constants.oracleInstallXEDatabaseLinURL;
                    command = `${constants_1.Constants.linuxOpenCommand} ${constants_1.Constants.oracleInstallXEDatabaseLinURL}`;
                }
                else {
                    link = constants_1.Constants.oracleInstallXEDatabaseMacURL;
                    command = `${constants_1.Constants.macOSOpenCommand} ${constants_1.Constants.oracleInstallXEDatabaseMacURL}`;
                }
                logger_1.ChannelLogger.Instance.info(helper.stringFormatterCsharpStyle(localizedConstants_2.default.outwindowConnectionPageDialogue, link));
                yield childProcess.exec(command);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.errorLaunchingXEDatabaseInstallationURL, error.message));
            }
        }));
    }
    newConnectionUI(self) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                self.connectionController.openCreateProfileUI("", false);
            }
            catch (error) {
                this.vscodeConnector.showErrorMessage(localizedConstants_1.default.errorEncountered + error);
            }
        });
    }
    onActiveTextEditorChanged(textEditor) {
        return __awaiter(this, void 0, void 0, function* () {
            if (textEditor) {
                if (textEditor.document && textEditor.document.uri) {
                    this.fileLogger.info("onActiveTextEditorChanged for Active text editor");
                }
                else {
                    this.fileLogger.info("onActiveTextEditorChanged - TextEditor.document  or TextEditor.document.uri is undefined");
                }
            }
            else {
                this.fileLogger.info("onActiveTextEditorChanged - TextEditor is undefined");
            }
            let document = undefined;
            if (textEditor) {
                document = textEditor.document;
            }
            this.statusController.onActiveTextEditorChanged(textEditor);
            if (textEditor) {
                oracleEditorManager_1.default.instance.handleExecutionStatusChangeInResultUI(null);
            }
            let doc = undefined;
            if (textEditor) {
                doc = textEditor.document;
            }
            yield this.defaultConnManager.associateDefaultConnectionToFile(doc);
        });
    }
    newConnectionHandler() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            self.fileLogger.info("Create new connection profile/connection for active document");
            let valToReturn = false;
            if (self.isExtensionInitialized() && self.documentIsOpen()) {
                valToReturn = yield self.connectionController.newConnectionHandler(self.vscodeConnector.activeTextEditorUri);
            }
            if (valToReturn === undefined) {
                valToReturn = false;
            }
            return valToReturn;
        });
    }
    disconnectHandler() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            self.fileLogger.info("Disconnect command received from VS Code for the currently active text document.");
            let valToReturn = false;
            if (self.isExtensionInitialized() && self.documentIsOpenAndOracle()) {
                valToReturn = yield this.connectionController.disocnnectRequestHandler();
            }
            if (valToReturn === undefined) {
                valToReturn = false;
            }
            return valToReturn;
        });
    }
    oracleLanguageAssocHandler() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            self.fileLogger.info("Check if the currently active text document is associated with Oracle extension.");
            let valToReturn = undefined;
            if (self.isExtensionInitialized() && self.documentIsOpenAndOracle()) {
                const uri = self.vscodeConnector.activeTextEditorUri;
                if (uri) {
                    valToReturn = yield self.connectionController.languageAssociationHandler();
                }
            }
            return valToReturn;
        });
    }
    documentIsOpen() {
        const self = this;
        self.fileLogger.info("Check if a document is open in VS Code");
        let valToReturn = true;
        if (self.vscodeConnector.activeTextEditor === undefined ||
            !(self.vscodeConnector.activeTextEditor.document.uri.scheme === "file" ||
                self.vscodeConnector.activeTextEditor.document.uri.scheme === "untitled")) {
            if (self.vscodeConnector.activeTextEditor.document.uri.scheme !== constants_1.Constants.oracleScheme)
                self.vscodeConnector.showWarningMessage("msgFileAssociationMissing");
            valToReturn = false;
        }
        return valToReturn;
    }
    setLocale() {
        this.fileLogger.info("Setting Locale :" + vscode.env.language);
        localizedConstants_1.default.localize(vscode.env.language);
        this.fileLogger.info("Locale Set and messages localized");
    }
    executeSQLCommand() {
        this.executeQueryCommand(scriptExecutionModels_1.ExecutionMode.Selection);
    }
    executeAllCommand() {
        this.executeQueryCommand(scriptExecutionModels_1.ExecutionMode.File);
    }
    executeQueryCommand(mode) {
        this.fileLogger.info("Query execution command handler invoked");
        if (this.isExtensionInitialized() && this.documentIsOpenAndOracle()) {
            if (this.vscodeConnector.isActiveDocumentEmpty()) {
                return;
            }
            this.fileLogger.info("Validated query execution input");
            let activeDoc = this.vscodeConnector.activeTextEditor.document;
            const fileName = activeDoc.fileName;
            const executeQueryRequest = new scriptExecutionModels_1.ScriptExecuteParams();
            executeQueryRequest.ownerUri = this.vscodeConnector.activeTextEditorUri;
            executeQueryRequest.executionMode = mode;
            let executeCurrentQueryCommand = false;
            if (mode === scriptExecutionModels_1.ExecutionMode.Selection) {
                executeQueryRequest.selection = this.vscodeConnector.getActiveDocumentSelection();
                executeCurrentQueryCommand = this.isExecuteCurrentQueryCommand(executeQueryRequest.selection);
            }
            if (executeCurrentQueryCommand) {
                this.scriptExecutionCommandHandler.startQueryExecution(executeQueryRequest, fileName, scriptExecutionModels_1.UIDisplayMode.ExecuteSQLStatement);
            }
            else {
                this.scriptExecutionCommandHandler.startQueryExecution(executeQueryRequest, fileName, scriptExecutionModels_1.UIDisplayMode.ExecuteScript);
            }
        }
    }
    cancelScriptExecutionHandler() {
        const self = this;
        self.fileLogger.info("Cancel script execution command handler invoked");
        if (self.isExtensionInitialized() && this.documentIsOpenAndOracle()) {
            const scriptPath = this.vscodeConnector.activeTextEditorUri;
            this.scriptExecutionCommandHandler.cancelAllScriptExecution(scriptPath);
        }
    }
    runAndLogUnhandledError(commandHandlerPromise) {
        const self = this;
        return commandHandlerPromise.catch((err) => {
            if (err && err.message) {
                self.vscodeConnector.showErrorMessage(localizedConstants_1.default.errorEncountered + err);
            }
            return undefined;
        });
    }
    closeDocumentHandler(doc) {
        const self = this;
        if (!self.initialized) {
            return;
        }
        this.statusController.onTextEditorClosed(doc);
        self.fileLogger.info("Close Document event received from VS Code");
        if (self.documentSavedTimer) {
            self.documentSavedTimer.end();
        }
        if (self.documentOpenedTimer) {
            self.documentOpenedTimer.end();
        }
        const currentDocUriScheme = doc.uri.scheme;
        const currentDocUri = helper.convertURIToString(doc.uri);
        if (self.previousOpenedDoc &&
            self.documentOpenedTimer.getDuration() <
                constants_1.Constants.definedTimeForRenameDoc) {
            self.connectionController.changeDatabaseConnectionForDoc(currentDocUri, self.previousOpenedDoc);
        }
        else if (self.previousSavedDoc &&
            currentDocUriScheme === constants_1.Constants.untitled &&
            self.documentSavedTimer.getDuration() <
                constants_1.Constants.definedTimeForUntitledSave) {
            self.connectionController.changeDatabaseConnectionForDoc(currentDocUri, self.previousSavedDoc);
        }
        else {
            self.connectionController.textDocumentCloseHandler(doc);
        }
        self.previousOpenedDoc = undefined;
        self.previousSavedDoc = undefined;
        self.documentSavedTimer = undefined;
        self.documentOpenedTimer = undefined;
        this.codeEditorProvider.onEditorClosed(doc.uri);
        this.oracleIntelliSenseDataManager.clearCacheForDocument(currentDocUri);
    }
    onRunNewQuery() {
        return __awaiter(this, void 0, void 0, function* () {
            let valtoRet = false;
            if (this.isExtensionInitialized) {
                try {
                    this.untitiledDocumentProvider.createAndOpen().then((doc) => __awaiter(this, void 0, void 0, function* () {
                        yield this.connectionController.newConnectionHandler(doc.uri.toString());
                        valtoRet = true;
                    }));
                }
                catch (err) {
                    this.fileLogger.error("Unhandled error received in a command handler");
                    valtoRet = false;
                }
            }
            return Promise.resolve(valtoRet);
        });
    }
    onGettingStartedGuide() {
        return __awaiter(this, void 0, void 0, function* () {
            const startCommand = (process.platform === constants_1.Constants.macOSprocessplatform ? constants_1.Constants.macOSOpenCommand :
                process.platform === constants_1.Constants.windowsProcessPlatform ? constants_1.Constants.windowsOpenCommand : constants_1.Constants.linuxOpenCommand);
            childProcess.exec(startCommand + " " + constants_1.Constants.oracleGettingStartedLink);
            return Promise.resolve(true);
        });
    }
    onModifyConnection(connNode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (connNode) {
                    yield this.connectionController.updateProfileHandler(connNode.connectionProperties);
                }
            }
            catch (error) {
                helper_1.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
            }
        });
    }
    onNewConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.newConnectionUI(this);
            }
            catch (error) {
                helper_1.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
            }
        });
    }
    onOpenNewSQLFileFromConnection(connNode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (connNode && this.isExtensionInitialized) {
                try {
                    this.defaultConnManager.associateDefaultConn = false;
                    this.untitiledDocumentProvider.createAndOpen().then((doc) => {
                        this.defaultConnManager.associateDefaultConn = true;
                        this.connectionController.createConnectionFromConnProps(connNode.connectionProperties, doc.uri.toString(), true);
                    });
                }
                catch (err) {
                    this.defaultConnManager.associateDefaultConn = true;
                    helper.logErroAfterValidating(err);
                }
            }
        });
    }
    onOpenExistingSQLFileFromConnection(connNode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (connNode && this.isExtensionInitialized) {
                try {
                    const options = {};
                    options.canSelectFiles = true;
                    options.canSelectFolders = false;
                    options.canSelectMany = false;
                    options.filters = {
                        [localizedConstants_2.default.languageName]: ['sql', 'plsql', 'pls']
                    };
                    if (this.openingFolderFirstTime && vscode.workspace && vscode.workspace.rootPath) {
                        options.defaultUri = vscode.Uri.file(vscode.workspace.rootPath);
                    }
                    options.openLabel = localizedConstants_2.default.selectFile;
                    vscode.window.showOpenDialog(options).then((uri) => {
                        if (uri && uri.length > 0 && uri[0] && uri[0].fsPath) {
                            logger_1.FileStreamLogger.Instance.info(`Selected file to open- ${uri[0].fsPath}`);
                            this.openingFolderFirstTime = false;
                            this.openFileAndAssocateWithConn(uri[0].fsPath, connNode);
                            logger_1.FileStreamLogger.Instance.info("File opened and connected to database");
                        }
                    }, (error) => {
                        helper.logErroAfterValidating(error);
                    });
                }
                catch (err) {
                    helper.logErroAfterValidating(err);
                }
            }
        });
    }
    openFileAndAssocateWithConn(filename, connNode) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info(`Opening file- ${filename}`);
            defaultConnectionManager_1.DefaultConnectionManager.instance.addToExcludedFilesForDefaultConnection(filename);
            vscode.workspace.openTextDocument(vscode.Uri.file(filename))
                .then((document) => __awaiter(this, void 0, void 0, function* () {
                vscode.languages.setTextDocumentLanguage(document, constants_1.Constants.oracleLanguageID).then(() => {
                    vscode.window.showTextDocument(document, { preview: false }).then((editor) => {
                        try {
                            this.connectionController.createConnectionFromConnProps(connNode.connectionProperties, document.uri.toString(), true);
                            logger_1.FileStreamLogger.Instance.info(`File opened successfully- ${filename}`);
                        }
                        catch (err) {
                            helper.logErroAfterValidating(err);
                        }
                    }, (err) => {
                        logger_1.FileStreamLogger.Instance.error(`Failed to open file ${filename}`);
                        helper.logErroAfterValidating(err);
                    });
                }, (err) => {
                    logger_1.FileStreamLogger.Instance.error(`Failed to open file ${filename}`);
                    helper.logErroAfterValidating(err);
                });
            }), (err) => {
                logger_1.FileStreamLogger.Instance.error(`Failed to open file ${filename}`);
                helper.logErroAfterValidating(err);
            });
        });
    }
    getDatabaseExplorerConnections() {
        return __awaiter(this, void 0, void 0, function* () {
            const newProfiles = [];
            logger_1.FileStreamLogger.Instance.info("In getDatabaseExplorerConnections");
            try {
                const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager();
                const profiles = helperSettings.retrieveConnProfilesFromConfig();
                if (profiles && profiles.length > 0) {
                    logger_1.FileStreamLogger.Instance.info(`Number of odtvscode connection profiles:  ${profiles.length}`);
                    var connInfo = null;
                    var profile = null;
                    for (let i = 0; i < profiles.length; i++) {
                        logger_1.FileStreamLogger.Instance.info(`Processing connection profile:  ${i}`);
                        profile = profiles[i];
                        connInfo = new connectionModels_1.ConnectionInfo();
                        newProfiles.push(connInfo);
                        switch (profile.connectionType) {
                            case scriptExecutionModels_1.ConnectionType.TNS:
                                {
                                    connInfo.connectionType = "TNSAlias";
                                    break;
                                }
                            case scriptExecutionModels_1.ConnectionType.DataSource:
                                {
                                    connInfo.connectionType = "EZConnect";
                                    break;
                                }
                            case scriptExecutionModels_1.ConnectionType.Advanced:
                                {
                                    connInfo.connectionType = "EZConnectPlus";
                                    break;
                                }
                            case scriptExecutionModels_1.ConnectionType.ODPConnectionString:
                                {
                                    connInfo.connectionType = "DotnetConnectionString";
                                    break;
                                }
                            default:
                                break;
                        }
                        if (profile.name) {
                            connInfo.connectionName = profile.name;
                        }
                        if (profile.dBAPrivilege) {
                            connInfo.dbaPrivilege = profile.dBAPrivilege;
                        }
                        else {
                            connInfo.dbaPrivilege = "None";
                        }
                        if (profile.dataSource) {
                            connInfo.dataSource = profile.dataSource;
                        }
                        if (profile.tnsAdmin) {
                            connInfo.tnsAdmin = profile.tnsAdmin;
                        }
                        else {
                            connInfo.tnsAdmin = "";
                        }
                        if (profile.walletLocation) {
                            connInfo.walletLocation = profile.walletLocation;
                        }
                        else {
                            connInfo.walletLocation = "";
                        }
                        if (profile.userID) {
                            connInfo.userName = profile.userID;
                            if (profile.userID.length === 1 && profile.userID === "/") {
                                connInfo.authenticationType = "Integrated";
                                connInfo.userName = "";
                            }
                            else {
                                connInfo.authenticationType = "Database";
                            }
                        }
                        if (profile.proxyUserID) {
                            connInfo.proxyUsername = profile.proxyUserID;
                        }
                        else {
                            connInfo.proxyUsername = "";
                        }
                        if (profile.password) {
                            connInfo.passwordRequired = true;
                        }
                        else {
                            connInfo.passwordRequired = false;
                        }
                        if (profile.proxyAuthByPassword) {
                            connInfo.proxyPasswordRequired = true;
                        }
                        else {
                            connInfo.proxyPasswordRequired = false;
                        }
                        if (profile.loginScript) {
                            connInfo.loginScript = profile.loginScript;
                        }
                        else {
                            connInfo.loginScript = "";
                        }
                        logger_1.FileStreamLogger.Instance.info(`Number of new connection profiles:  ${newProfiles.length}`);
                    }
                }
            }
            catch (err) {
                helper.logErroAfterValidating(err);
            }
            var connInfos = JSON.stringify({ "oracledevtools.connections": newProfiles });
            logger_1.FileStreamLogger.Instance.info(`Returning connection profiles as a string of length ${connInfos.length} characters`);
            return connInfos;
        });
    }
}
exports.SystemManager = SystemManager;
