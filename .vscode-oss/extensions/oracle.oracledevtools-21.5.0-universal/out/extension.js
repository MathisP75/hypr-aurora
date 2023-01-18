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
exports.deactivate = exports.getSystemManager = exports.activate = void 0;
const vscode = require("vscode");
const localizedConstants_1 = require("./constants/localizedConstants");
const logger_1 = require("./infrastructure/logger");
const systemManager_1 = require("./infrastructure/systemManager");
const constants_1 = require("./constants/constants");
const setup_1 = require("./utilities/setup");
const util = require("util");
const childProcess = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");
const helper = require("./utilities/helper");
let systemManager;
let dotnetRuntimeMajorVersion;
let dotnetRuntimeFullVersion;
let dotnetRuntimePath;
function activate(context) {
    let dotnetRuntimeFound = false;
    try {
        let extnLogDir;
        try {
            if (context.logUri && context.logUri.fsPath) {
                if (!fs.existsSync(context.logUri.fsPath)) {
                    fs.mkdirSync(context.logUri.fsPath, { recursive: true });
                }
                extnLogDir = context.logUri.fsPath;
            }
        }
        catch (error) {
        }
        if (!extnLogDir) {
            extnLogDir = context.extensionPath;
        }
        logger_1.FileStreamLogger.extensionPath = extnLogDir;
        constants_1.Constants.setPaths(context.extensionPath);
        logger_1.FileStreamLogger.Instance.info("Activating Extension...!" + context.extensionPath);
        logger_1.ChannelLogger.Instance.info(localizedConstants_1.default.msgActivatingExtension);
        setup_1.Setup.CurrentColorThemeKind = vscode.window.activeColorTheme.kind;
        logger_1.FileStreamLogger.Instance.info(`Active Color Theme Kind: ${setup_1.Setup.CurrentColorThemeKind}`);
        let doneValidatingInstalledRuntime = false;
        let installedDotnetPath = context.globalState.get("odtvscodeInstalledDotnetPath");
        if (installedDotnetPath && fs.existsSync(installedDotnetPath)) {
            dotnetRuntimePath = installedDotnetPath;
            logger_1.FileStreamLogger.Instance.info(`Checking previously installed .NET Core runtime in VSCode`);
            checkDotnetRuntimeInfo(context).then((val) => {
                doneValidatingInstalledRuntime = true;
                dotnetRuntimeFound = val;
                logger_1.FileStreamLogger.Instance.info(`Using previously installed .NET Core runtime in VSCode`);
                setup_1.Setup.migrateConfigurationSettings(context.extensionPath);
                setup_1.Setup.migrateStorageValues(context);
                setup_1.Setup.setDefaultLocationsForFiles(context.extensionPath).then(() => {
                    logger_1.FileStreamLogger.Instance.info(`Config value processing done`);
                }).catch(() => {
                    logger_1.FileStreamLogger.Instance.warn(`Config value processing failed`);
                });
                logger_1.FileStreamLogger.Instance.info("Extension will be activated using .NET Core Runtime: " + dotnetRuntimeFullVersion);
                startExtension(context);
            }).catch((err) => {
                doneValidatingInstalledRuntime = true;
                dotnetRuntimeFound = false;
                logger_1.FileStreamLogger.Instance.info("Exception checking previously installed .NET Core Runtime in VSCode: " + err);
                if (!checkDotnetInfoOnLocalMachine(context, dotnetRuntimeFound, doneValidatingInstalledRuntime)) {
                    return Promise.reject(false);
                }
            });
            setup_1.Setup.CurrentColorThemeKind = vscode.window.activeColorTheme.kind;
        }
        else {
            doneValidatingInstalledRuntime = true;
            if (!checkDotnetInfoOnLocalMachine(context, dotnetRuntimeFound, doneValidatingInstalledRuntime)) {
                return Promise.reject(false);
            }
        }
    }
    catch (error) {
        logger_1.FileStreamLogger.Instance.error("Error during extension activation : " + error.message);
        logger_1.ChannelLogger.Instance.error(error);
        return Promise.reject(false);
    }
    return Promise.resolve(true);
}
exports.activate = activate;
function startExtension(context) {
    try {
        logger_1.FileStreamLogger.Instance.info("Oracle Developer Tools Extension will be activated with dotnetRuntimeVersion:" + dotnetRuntimeFullVersion);
        systemManager = new systemManager_1.SystemManager(context);
        systemManager.init(dotnetRuntimeFullVersion, dotnetRuntimeMajorVersion, dotnetRuntimePath);
        logger_1.FileStreamLogger.Instance.info("Oracle Developer Tools Extension Activated");
        logger_1.ChannelLogger.Instance.info(localizedConstants_1.default.msgOracleDevToolsActivated);
    }
    catch (error) {
        logger_1.FileStreamLogger.Instance.error("Error during extension activation: " + error);
        logger_1.ChannelLogger.Instance.error(error);
    }
}
function getSystemManager() { return systemManager; }
exports.getSystemManager = getSystemManager;
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        if (systemManager) {
            yield systemManager.deactivate();
        }
    });
}
exports.deactivate = deactivate;
function checkDotnetInfoOnLocalMachine(context, dotnetRuntimeFound, doneValidatingInstalledRuntime) {
    let retVal = false;
    if (!dotnetRuntimeFound && doneValidatingInstalledRuntime) {
        dotnetRuntimePath = "dotnet";
        logger_1.FileStreamLogger.Instance.info(`Checking previously installed .NET Core runtime on machine`);
        checkDotnetRuntimeInfo(context).then((val) => {
            dotnetRuntimeFound = val;
            logger_1.FileStreamLogger.Instance.info(`Using previously installed .NET Core Runtime on machine`);
            setup_1.Setup.migrateConfigurationSettings(context.extensionPath);
            setup_1.Setup.migrateStorageValues(context);
            setup_1.Setup.setDefaultLocationsForFiles(context.extensionPath).then(() => {
                logger_1.FileStreamLogger.Instance.info(`Config value processing done.`);
            }).catch(() => {
                logger_1.FileStreamLogger.Instance.warn(`Config value processing failed.`);
            });
            logger_1.FileStreamLogger.Instance.info("Extension will be activated using .NET Core Runtime: " + dotnetRuntimeFullVersion);
            startExtension(context);
            retVal = true;
        }).catch((err) => {
            dotnetRuntimeFound = false;
            logger_1.FileStreamLogger.Instance.info("Exception checking installed .NET Core Runtimes on machine: " + err);
            logger_1.FileStreamLogger.Instance.info(`Trying to install dotnet runtime.`);
            installDotnetRuntime(context).then((dotnetPath) => {
                dotnetRuntimePath = dotnetPath;
                logger_1.FileStreamLogger.Instance.info(`Installed .NET Core Runtime in VSCode: ${dotnetRuntimePath}`);
                logger_1.FileStreamLogger.Instance.info(`Saving installed .NET Core Runtime in VSCode to cache: ${dotnetRuntimePath}`);
                context.globalState.update("odtvscodeInstalledDotnetPath", dotnetPath).then(() => {
                    logger_1.FileStreamLogger.Instance.info(`Saved installed .NET Core Runtime in VSCode to cache: ${dotnetRuntimePath}`);
                    checkDotnetRuntimeInfo(context).then((val) => {
                        dotnetRuntimeFound = val;
                        logger_1.FileStreamLogger.Instance.info(`Found installed .NET Core Runtime in VSCode`);
                        setup_1.Setup.migrateConfigurationSettings(context.extensionPath);
                        setup_1.Setup.migrateStorageValues(context);
                        setup_1.Setup.setDefaultLocationsForFiles(context.extensionPath).then(() => {
                            logger_1.FileStreamLogger.Instance.info(`Config value processing done.`);
                        }).catch(() => {
                            logger_1.FileStreamLogger.Instance.warn(`Config value processing failed.`);
                        });
                        logger_1.FileStreamLogger.Instance.info("Extension will be activated using .NET Core Runtime: " + dotnetRuntimeFullVersion);
                        startExtension(context);
                        retVal = true;
                    }).catch((err) => {
                        dotnetRuntimeFound = false;
                        logger_1.FileStreamLogger.Instance.error("Exception checking installed .NET Core Runtime in VSCode: " + err);
                        logger_1.FileStreamLogger.Instance.warn("Failed to install .NET Core Runtime in VSCode: " + err);
                        logger_1.ChannelLogger.Instance.error(localizedConstants_1.default.msgdotnetRuntimeNotFound);
                        ShowDotnetRuntimeInstallInfoDialog(context);
                    });
                });
            }).catch((err) => {
                dotnetRuntimePath = null;
                dotnetRuntimeFound = false;
                logger_1.FileStreamLogger.Instance.warn("Failed to install .NET Core Runtime in VSCode: " + err);
                logger_1.ChannelLogger.Instance.error(localizedConstants_1.default.msgdotnetRuntimeNotFound);
                ShowDotnetRuntimeInstallInfoDialog(context);
            });
        });
    }
    return retVal;
}
function checkDotnetRuntimeInfo(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let dotnetRuntimeFound = false;
        let dotnetVer = "";
        let errMsg = "";
        logger_1.FileStreamLogger.Instance.info("Checking installed .NET Core Runtimes");
        try {
            yield getDotnetInfo().then((val) => {
                if (val != null) {
                    logger_1.FileStreamLogger.Instance.info("Found .NET Core Runtimes");
                    dotnetRuntimeFound = IsRequiredDotnetVersion(val);
                    if (!dotnetRuntimeFound) {
                        var dotnetversions = val.split(os.EOL);
                        if (dotnetversions != null && dotnetversions.length > 0) {
                            for (let i = dotnetversions.length - 2; i >= 0; i--) {
                                dotnetRuntimeFound = IsRequiredDotnetVersion(dotnetversions[i]);
                                if (dotnetRuntimeFound) {
                                    break;
                                }
                            }
                        }
                    }
                }
            }).catch((err) => {
                dotnetRuntimeFound = false;
            });
            if (dotnetRuntimeFound === false) {
                logger_1.FileStreamLogger.Instance.error("No .NET Core Runtime 2.1 or higher version found");
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.error("Finding installed .NET Core Runtimes returns error");
            logger_1.FileStreamLogger.Instance.error(err.message);
            logger_1.ChannelLogger.Instance.error(err);
        }
        if (dotnetRuntimeFound === false) {
            return Promise.reject(false);
        }
        return Promise.resolve(true);
    });
}
function IsRequiredDotnetVersion(val) {
    let dotnetRuntimeFound = false;
    let dotnetRuntimeName = constants_1.Constants.dotnetRuntime + " ";
    let dotnetVer = "";
    if (val != null) {
        let idx = val.lastIndexOf(dotnetRuntimeName);
        if (idx >= 0) {
            logger_1.FileStreamLogger.Instance.info("Found " + constants_1.Constants.dotnetRuntime);
            var substr = val.substring(idx);
            var strs = substr.split(" ", 2);
            if (strs != null && strs.length > 1) {
                dotnetVer = strs[1];
                logger_1.FileStreamLogger.Instance.info(".NET Core Runtime found, version: " + dotnetVer);
                strs = dotnetVer.split(".", 3);
                if (strs != null && strs.length > 1) {
                    var majorVer = Number(strs[0]);
                    var minorVer = Number(strs[1]);
                    logger_1.FileStreamLogger.Instance.info(".NET Core Runtime majorver: " + majorVer + " minorver: " + minorVer);
                    if ((majorVer === 6 && minorVer == 0) ||
                        (majorVer === 3 && minorVer >= 1)) {
                        let serverdll = "";
                        switch (majorVer) {
                            case 3:
                                serverdll = path.join(path.dirname(__dirname), "out", "server", constants_1.Constants.server31DllName);
                                break;
                            case 6:
                                serverdll = path.join(path.dirname(__dirname), "out", "server", constants_1.Constants.server60DllName);
                                break;
                            default:
                                break;
                        }
                        if (serverdll && serverdll.length > 0) {
                            logger_1.FileStreamLogger.Instance.info("Checking if OracleVSCode Language Server assembly " + serverdll + " exists");
                            if (fs.existsSync(serverdll)) {
                                logger_1.FileStreamLogger.Instance.info(serverdll + " Exists");
                                logger_1.FileStreamLogger.Instance.info("Using OracleVSCode Language Server assembly: " + serverdll);
                                dotnetRuntimeMajorVersion = majorVer;
                                dotnetRuntimeFullVersion = dotnetVer;
                                dotnetRuntimeFound = true;
                            }
                            else {
                                logger_1.FileStreamLogger.Instance.info(serverdll + " is missing");
                            }
                        }
                        else {
                            logger_1.FileStreamLogger.Instance.info(`serverdll is empty. Net Runtime ${majorVer}.${minorVer} is not supported`);
                        }
                    }
                }
            }
        }
    }
    return dotnetRuntimeFound;
}
function getDotnetInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.FileStreamLogger.Instance.info("Finding installed .NET Core Runtimes using .NET Runtime path: " + dotnetRuntimePath);
        const exec = util.promisify(childProcess.exec);
        let dotnetPath = null;
        if (dotnetRuntimePath.indexOf(' ') < 0) {
            dotnetPath = dotnetRuntimePath + ' --list-runtimes';
        }
        else {
            logger_1.FileStreamLogger.Instance.info(".NET Runtime path includes space characters, enclosing path in double quotes");
            dotnetPath = '"' + dotnetRuntimePath + '" --list-runtimes';
        }
        logger_1.FileStreamLogger.Instance.info(`List .NET Core Runtimes using ${dotnetPath}`);
        const { stdout, stderr } = yield exec(dotnetPath);
        if (stdout != null && stdout.length > 0)
            return stdout;
        if (stderr != null && stderr.length > 0) {
            logger_1.FileStreamLogger.Instance.error("Error finding installed .NET Core Runtimes");
            logger_1.FileStreamLogger.Instance.error(stderr);
            return Promise.reject(new Error(stderr));
        }
        else {
            logger_1.FileStreamLogger.Instance.error("No installed .NET Core Runtimes found");
            return Promise.reject(new Error(localizedConstants_1.default.msgdotnetRuntimeNotFound));
        }
    });
}
function onLaunchDotnetPage() {
    return __awaiter(this, void 0, void 0, function* () {
        let startCommand = `${constants_1.Constants.linuxOpenCommand} ${constants_1.Constants.oracleDotNetRuntimeInstallInfoLink_AnyOs}`;
        if (process.platform === constants_1.Constants.windowsProcessPlatform) {
            startCommand = `${constants_1.Constants.windowsOpenCommand} ${constants_1.Constants.oracleDotNetRuntimeInstallInfoLink_Windows}`;
        }
        else if (process.platform === constants_1.Constants.macOSprocessplatform) {
            startCommand = `${constants_1.Constants.macOSOpenCommand} ${constants_1.Constants.oracleDotNetRuntimeInstallInfoLink_Mac}`;
        }
        else if (process.platform === constants_1.Constants.linuxProcessPlatform) {
            startCommand = `${constants_1.Constants.linuxOpenCommand} ${constants_1.Constants.oracleDotNetRuntimeInstallInfoLink_Linux}`;
        }
        yield childProcess.exec(startCommand);
        return true;
    });
}
function ShowDotnetRuntimeInstallInfoDialog(context) {
    if (setup_1.Setup.getShowMissingDotnetCoreRuntimeDialog(context)) {
        vscode.window.showWarningMessage(localizedConstants_1.default.msgDialogTextMissingDotnetRuntime, { modal: true }, localizedConstants_1.default.messageDontShowDialogAgain, localizedConstants_1.default.messageGoToDownloadPage).then(action => {
            if (action && action === localizedConstants_1.default.messageGoToDownloadPage) {
                onLaunchDotnetPage();
            }
            else if (action === localizedConstants_1.default.messageDontShowDialogAgain) {
                setup_1.Setup.updateShowMissingDotnetCoreRuntimeDialog(context, true);
            }
        });
    }
}
function installDotnetRuntime(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let dotnetPath = null;
        logger_1.FileStreamLogger.Instance.info("Starting dotnet runtime install");
        logger_1.ChannelLogger.Instance.info(localizedConstants_1.default.downloadingDotnetRuntime);
        logger_1.FileStreamLogger.Instance.info("Executing command dotnet.showAcquisitonLog, to show dotnet runtime download and install acquisition log");
        yield vscode.commands.executeCommand('dotnet.showAcquisitionLog');
        logger_1.FileStreamLogger.Instance.info("Successfully enabled showing acquisition logs using dotnet.showAcquisitonLog");
        const context2 = { version: '6.0', requestingExtensionId: 'Oracle.oracledevtools' };
        let result = null;
        let checkAcquireStatus = true;
        try {
            logger_1.FileStreamLogger.Instance.info(`Executing command dotnet.acquire, to download/install dotnet runtime.`);
            result = yield vscode.commands.executeCommand('dotnet.acquire', context2);
            if (result && result.dotnetPath) {
                logger_1.FileStreamLogger.Instance.info(`Successfully downloaded/installed dotnet runtime using dotnet.acquire`);
                logger_1.FileStreamLogger.Instance.info(`Result from dotnet.acquire: ${result}`);
                dotnetPath = result.dotnetPath;
                logger_1.FileStreamLogger.Instance.info(`Not executing command dotnetPath.acquireStatus`);
                checkAcquireStatus = false;
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error(`Error downloading/installing dotnet runtime in vscode using dotnet.acquire`);
            logger_1.FileStreamLogger.Instance.error(`Error: ${error}`);
            logger_1.ChannelLogger.Instance.error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime);
            throw new Error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime);
        }
        if (checkAcquireStatus) {
            try {
                logger_1.FileStreamLogger.Instance.info(`Executing command dotnet.acquireStatus, to get status of dotnet download/install.`);
                result = yield vscode.commands.executeCommand('dotnet.acquireStatus', context2);
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error(`Error getting dotnet runtime download/install status using dotnet.acquireStatus`);
                logger_1.FileStreamLogger.Instance.error(`Error: ${error}`);
                logger_1.ChannelLogger.Instance.error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime);
                throw new Error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime);
            }
            if (result && result.dotnetPath) {
                logger_1.FileStreamLogger.Instance.info("Successfully acquired dotnet runtime download/install status using dotnet.acquireStatus");
                logger_1.FileStreamLogger.Instance.info(`Result from dotnet.acquireStatus: ${result}`);
                dotnetPath = result.dotnetPath;
            }
            else {
                logger_1.FileStreamLogger.Instance.error(`Failed to get dotnet download/install status using dotnet.acquireStatus`);
                logger_1.FileStreamLogger.Instance.error(`Error: ${result}`);
                logger_1.ChannelLogger.Instance.error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime);
                throw new Error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime);
            }
        }
        if (!dotnetPath) {
            logger_1.FileStreamLogger.Instance.error("Failed to get installed path for dotnet runtime, dotnetPath is null or undefined, returning error.");
            throw new Error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime);
        }
        else {
            logger_1.FileStreamLogger.Instance.info("dotnetPath: " + dotnetPath);
            logger_1.ChannelLogger.Instance.info(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadAndInstallCompleteForDotnetRuntime, dotnetPath));
        }
        try {
            logger_1.FileStreamLogger.Instance.info("Executing command dotnet.ensureDotnetDependencies, to ensure all required dotnet runtime dependencies are installed.");
            yield vscode.commands.executeCommand('dotnet.ensureDotnetDependencies', { command: dotnetPath, arguments: undefined });
            logger_1.FileStreamLogger.Instance.info("Successfully executed command dotnet.ensureDotnetDependencies");
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error('Error ensuring all required dotnet runtime dependencies are installed using dotnet.ensureDotnetDependencies.');
            throw new Error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime);
        }
        logger_1.FileStreamLogger.Instance.info("Finished dotnet runtime download/install, returning dotnetRuntimePath: " + dotnetPath);
        return dotnetPath;
    });
}
