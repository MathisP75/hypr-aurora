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
exports.AutonomousDBWalletFileHandler = void 0;
const helper = require("../../utilities/helper");
const autonomousDBModels_1 = require("../../models/autonomousDBModels");
const stream = require("stream");
const fs = require("fs");
const unzipper = require("unzipper");
const path = require("path");
const model_1 = require("oci-database/lib/model");
const autonomousDBUtils_1 = require("./autonomousDBUtils");
const localizedConstants_1 = require("../../constants/localizedConstants");
const vscode = require("vscode");
const path_1 = require("path");
class ADBWalletFileInfo {
}
class AutonomousDBWalletFileHandler {
    constructor() {
        this.walletFileData = new Map();
    }
    add(databaseId, contents) {
        this.walletFileData.set(databaseId, contents);
    }
    saveToFile(walletFileRequest) {
        try {
            if (this.walletFileData.has(walletFileRequest.adbDatabaseID)) {
                var contents = this.walletFileData.get(walletFileRequest.adbDatabaseID);
                for (let index = 0; index < contents.length; index++) {
                    const content = contents[index];
                    fs.writeFileSync(content.filePath, content.fileContent);
                }
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadCompleteForCredentialFile, (0, path_1.resolve)(walletFileRequest.walletFilepath)));
            }
        }
        catch (error) {
            helper.logErroAfterValidating(error);
            let errorMessage = error.message ? error.message : error;
            vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadErrorForCredentialFile, (0, path_1.resolve)(walletFileRequest.walletFilepath), errorMessage));
        }
        finally {
            this.walletFileData.delete[walletFileRequest.adbDatabaseID];
        }
    }
    fileToSkip(walletFileRequest, filePathToVerify) {
        let fileToSkip = false;
        if (walletFileRequest.fileExistsAction == autonomousDBModels_1.FileExistsAction.Skip) {
            for (let idx = 0; idx < walletFileRequest.existingFiles.length; idx++) {
                if (filePathToVerify.indexOf(walletFileRequest.existingFiles[idx].name) >= 0) {
                    fileToSkip = true;
                    break;
                }
            }
        }
        return fileToSkip;
    }
    replaceORSkipFiles(walletFileRequest) {
        try {
            if (this.walletFileData.has(walletFileRequest.adbDatabaseID)) {
                var contents = this.walletFileData.get(walletFileRequest.adbDatabaseID);
                var newFilePath;
                var downloadedAnyFile = false;
                if (walletFileRequest.fileExistsAction == autonomousDBModels_1.FileExistsAction.Replace
                    || walletFileRequest.fileExistsAction == autonomousDBModels_1.FileExistsAction.Skip) {
                    for (let index = 0; index < contents.length; index++) {
                        const content = contents[index];
                        if (this.fileToSkip(walletFileRequest, content.filePath)) {
                            newFilePath = path.join(path.dirname(content.filePath), `${path.basename(content.filePath)}-copy${path.extname(content.filePath)}`);
                            continue;
                        }
                        if (fs.existsSync(content.filePath)) {
                            newFilePath = path.join(path.dirname(content.filePath), `${path.basename(content.filePath)}-copy${path.extname(content.filePath)}`);
                            fs.renameSync(content.filePath, newFilePath);
                        }
                        fs.writeFileSync(content.filePath, content.fileContent);
                        downloadedAnyFile = true;
                    }
                    if (downloadedAnyFile) {
                        vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadCompleteForCredentialFile, path.dirname((0, path_1.resolve)(newFilePath))));
                    }
                }
            }
        }
        catch (exp) {
            helper.logErroAfterValidating(exp);
            if (exp && exp.message) {
                vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadErrorForCredentialFile, path.dirname((0, path_1.resolve)(newFilePath)), exp.message));
            }
        }
        finally {
            this.walletFileData.delete[walletFileRequest.adbDatabaseID];
        }
    }
    clear(databaseID) {
        if (this.walletFileData.has(databaseID)) {
            this.walletFileData.delete[databaseID];
        }
    }
    getWalletType(walletFileRequest) {
        var generateType;
        switch (walletFileRequest.walletType) {
            case autonomousDBModels_1.WalletType.Instance:
                generateType = model_1.GenerateAutonomousDatabaseWalletDetails.GenerateType.Single;
                break;
            case autonomousDBModels_1.WalletType.Regional:
                generateType = model_1.GenerateAutonomousDatabaseWalletDetails.GenerateType.All;
                break;
        }
        return generateType;
    }
    downloadWalletFileUsingSDK(accountComponent, pswd, walletFileRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            var walletDetails = null;
            let downloadCredentialsFilesData = new autonomousDBUtils_1.adbDownloadCredentialsFilesData();
            if (walletFileRequest.dedicatedDb) {
                walletDetails = {
                    password: pswd
                };
            }
            else {
                walletDetails = {
                    password: pswd,
                    generateType: this.getWalletType(walletFileRequest)
                };
            }
            var generateAutonomousDatabaseWalletRequest = { autonomousDatabaseId: walletFileRequest.adbDatabaseID, generateAutonomousDatabaseWalletDetails: walletDetails };
            downloadCredentialsFilesData = yield accountComponent.ServicesClients.DatabaseServiceClient.generateAutonomousDatabaseWallet(generateAutonomousDatabaseWalletRequest).
                then((response) => __awaiter(this, void 0, void 0, function* () {
                var e_1, _a;
                var result;
                var dirPath = walletFileRequest.walletFilepath;
                var existingFiles = new Array();
                if (response.value instanceof stream.Readable) {
                    result = response.value;
                    const zip = result.pipe(unzipper.Parse({ forceStream: true }));
                    var filePath = "";
                    var fileContents = new Array();
                    try {
                        for (var zip_1 = __asyncValues(zip), zip_1_1; zip_1_1 = yield zip_1.next(), !zip_1_1.done;) {
                            const entry = zip_1_1.value;
                            const content = yield entry.buffer();
                            filePath = path.join(dirPath, entry.path);
                            fileContents.push({ filePath: filePath, fileContent: content });
                            if (fs.existsSync(filePath)) {
                                existingFiles.push(entry.path);
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (zip_1_1 && !zip_1_1.done && (_a = zip_1.return)) yield _a.call(zip_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    this.add(walletFileRequest.adbDatabaseID, fileContents);
                    if (existingFiles.length == 0) {
                        this.saveToFile(walletFileRequest);
                    }
                    downloadCredentialsFilesData.existingFiles = existingFiles;
                    return Promise.resolve(downloadCredentialsFilesData);
                }
            }), error => {
                helper.logErroAfterValidating(error);
                if (error && error.message) {
                    vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadWalletFileFailed, walletFileRequest.adbName, error.message));
                    downloadCredentialsFilesData.errorMessage = error.message;
                }
                downloadCredentialsFilesData.existingFiles = [];
                return Promise.resolve(downloadCredentialsFilesData);
            });
            return Promise.resolve(downloadCredentialsFilesData);
        });
    }
    ValidatePath(walletFileRequest) {
        var ret = true;
        try {
            if (!fs.existsSync(walletFileRequest.walletFilepath)) {
                fs.mkdirSync(walletFileRequest.walletFilepath, { recursive: true });
                ret = true;
            }
        }
        catch (exp) {
            if (exp && exp.message) {
                vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadWalletFileFailed, walletFileRequest.adbName, exp.message));
            }
            ret = false;
        }
        return ret;
    }
    downloadWalletFile(accountComponent, walletFileRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            let downloadCredentialsFilesData = new autonomousDBUtils_1.adbDownloadCredentialsFilesData();
            if (this.ValidatePath(walletFileRequest)) {
                let pswd = "";
                if (!walletFileRequest.pswd) {
                    var response = yield autonomousDBUtils_1.AutonomousDBUtils.getWalletPassword({ windowUri: walletFileRequest.windowUri, databaseID: walletFileRequest.adbDatabaseID });
                    pswd = response.pswd;
                }
                else {
                    pswd = String.fromCodePoint(...walletFileRequest.pswd);
                }
                downloadCredentialsFilesData = yield this.downloadWalletFileUsingSDK(accountComponent, pswd, walletFileRequest);
            }
            return downloadCredentialsFilesData;
        });
    }
}
exports.AutonomousDBWalletFileHandler = AutonomousDBWalletFileHandler;
