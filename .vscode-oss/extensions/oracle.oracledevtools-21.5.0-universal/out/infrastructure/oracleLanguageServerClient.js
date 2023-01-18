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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleLanguageServerClient = exports.LanguageServerConnectionErrorHandler = void 0;
const path = require("path");
const vscode_languageclient_1 = require("vscode-languageclient");
const helper = require("../utilities/helper");
const helper_1 = require("../utilities/helper");
const constants_1 = require("./../constants/constants");
const localizedConstants_1 = require("./../constants/localizedConstants");
const logger_1 = require("./logger");
const oracleVSCodeConnector_1 = require("./oracleVSCodeConnector");
const connectionRequest_1 = require("../models/connectionRequest");
class LanguageServerConnectionErrorHandler {
    constructor(vscodeConnector) {
        this.vscodeConnector = vscodeConnector;
        if (!this.vscodeConnector) {
            this.vscodeConnector = new oracleVSCodeConnector_1.OracleVSCodeConnector();
        }
    }
    showOnErrorPrompt(error) {
        const self = this;
        if (error) {
            self.vscodeConnector.showErrorMessage(error.message);
        }
        else {
            self.vscodeConnector.showErrorMessage("disconnectedFromLanguageServer");
        }
    }
    error(error, message, count) {
        const self = this;
        self.showOnErrorPrompt(error);
        return vscode_languageclient_1.ErrorAction.Shutdown;
    }
    closed() {
        const self = this;
        self.showOnErrorPrompt(undefined);
        return vscode_languageclient_1.CloseAction.DoNotRestart;
    }
}
exports.LanguageServerConnectionErrorHandler = LanguageServerConnectionErrorHandler;
class OracleLanguageServerClient {
    constructor() {
        this.varLanguageClient = undefined;
        this.context = undefined;
        this.logger = logger_1.FileStreamLogger.Instance;
        this.vscodeConnector = undefined;
    }
    get languageClient() {
        const self = this;
        return self.varLanguageClient;
    }
    static get instance() {
        if (OracleLanguageServerClient.varInstance === undefined) {
            const tempClient = new OracleLanguageServerClient();
            OracleLanguageServerClient.varInstance = tempClient;
        }
        return OracleLanguageServerClient.varInstance;
    }
    init(context, varVSCodeintegrator, dotnetRuntimeFullVersion, dotnetRuntimeMajorVersion, dotnetRuntimePath) {
        const self = this;
        return new Promise((resolve, reject) => {
            try {
                self.context = context;
                self.vscodeConnector = varVSCodeintegrator;
                self.varLanguageClient = self.initializeServerAndClient(context, dotnetRuntimeFullVersion, dotnetRuntimeMajorVersion, dotnetRuntimePath);
                self.varLanguageClient.onReady().then(() => {
                    resolve(true);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    sendRequest(type, params) {
        const self = this;
        if (self.languageClient !== undefined) {
            return self.languageClient.sendRequest(type, params);
        }
    }
    sendNotification(type, params) {
        const self = this;
        if (self.languageClient !== undefined) {
            self.languageClient.sendNotification(type, params);
        }
    }
    onNotification(type, handler) {
        const self = this;
        if (self.languageClient !== undefined) {
            return self.languageClient.onNotification(type, handler);
        }
    }
    initializeServerAndClient(context, dotnetRuntimeFullVersion, dotnetRuntimeMajorVersion, dotnetRuntimePath) {
        const self = this;
        logger_1.FileStreamLogger.Instance.info("Initializing Language client and server");
        logger_1.FileStreamLogger.Instance.info("dotnetRuntimeMajorVersion: " + dotnetRuntimeMajorVersion);
        logger_1.FileStreamLogger.Instance.info("dotnetRuntimePath: " + dotnetRuntimePath);
        let serverdll = "";
        switch (dotnetRuntimeMajorVersion) {
            case 3:
                serverdll = path.join(path.dirname(__dirname), "server", constants_1.Constants.server31DllName);
                break;
            case 5:
                serverdll = path.join(path.dirname(__dirname), "server", constants_1.Constants.server50DllName);
                break;
            case 6:
                serverdll = path.join(path.dirname(__dirname), "server", constants_1.Constants.server60DllName);
                break;
            default:
                break;
        }
        logger_1.FileStreamLogger.Instance.info("Using Language Server: " + serverdll);
        const serveroptions = self.prepareServerInputArguments(serverdll, dotnetRuntimePath);
        const clientInstance = self.prepareLanguageClientComponentArgument(serveroptions, dotnetRuntimeFullVersion);
        const disposable = clientInstance.start();
        context.subscriptions.push(disposable);
        logger_1.FileStreamLogger.Instance.info("Initialized Language client and server");
        return clientInstance;
    }
    prepareServerInputArguments(servicePath, dotnetRuntimePath) {
        logger_1.FileStreamLogger.Instance.info("Preparing Server Input Arguments using .NET runtime path: " + dotnetRuntimePath);
        let { serverCommand, serverArgs } = helper_1.Utils.getServerInputArguments(servicePath, constants_1.Constants.serverLogFileName, dotnetRuntimePath);
        const serverOptions = {
            command: serverCommand,
            args: serverArgs,
            transport: vscode_languageclient_1.TransportKind.stdio,
        };
        return serverOptions;
    }
    prepareLanguageClientComponentArgument(serverOptions, dotnetRuntimeFullVersion) {
        const self = this;
        const clientOptions = {
            documentSelector: [
                { language: constants_1.Constants.oracleLanguageID, scheme: "file" },
                { language: constants_1.Constants.oracleLanguageID, scheme: "untitled" },
                { language: constants_1.Constants.oracleLanguageID, scheme: constants_1.Constants.oracleScheme }
            ],
            synchronize: {
                configurationSection: constants_1.Constants.extensionConfigSectionName,
            },
            errorHandler: new LanguageServerConnectionErrorHandler(self.vscodeConnector),
            outputChannel: logger_1.ChannelLogger.Instance.channelLogger,
            outputChannelName: constants_1.Constants.outputChannelName,
            revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Info
        };
        const client = new vscode_languageclient_1.LanguageClient(constants_1.Constants.oracleLanguageServerName, serverOptions, clientOptions);
        client.onReady().then(() => {
            logger_1.ChannelLogger.Instance.info(helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgServerReady, constants_1.Constants.dotnetRuntime, dotnetRuntimeFullVersion));
        });
        return client;
    }
}
exports.OracleLanguageServerClient = OracleLanguageServerClient;
_a = OracleLanguageServerClient;
OracleLanguageServerClient.dispose = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!OracleLanguageServerClient.disposed) {
        OracleLanguageServerClient.instance.varLanguageClient.sendNotification(connectionRequest_1.ExitNotificationTyped.type, new connectionRequest_1.ExitNotificationParameters());
        yield OracleLanguageServerClient.instance.varLanguageClient.stop();
        OracleLanguageServerClient.varInstance = null;
        OracleLanguageServerClient.disposed = true;
    }
});
OracleLanguageServerClient.varInstance = undefined;
OracleLanguageServerClient.disposed = false;
