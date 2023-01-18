"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ociConfigFileHandler = exports.ociConfigFileData = void 0;
const config_file_reader_1 = require("oci-common/lib/config-file-reader");
const logger_1 = require("../../infrastructure/logger");
const helper = require("../../utilities/helper");
const fs = require("fs");
class ociConfigFileData {
}
exports.ociConfigFileData = ociConfigFileData;
class ociConfigFileHandler {
    constructor() {
    }
    getKeyFilePath(keyFile) {
        var filePath = keyFile;
        try {
            if (keyFile) {
                filePath = config_file_reader_1.ConfigFileReader.expandUserHome(filePath);
            }
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
        return filePath;
    }
    getConfigFile() {
        return this.configFile;
    }
    readConfigFile(configFilePath) {
        let configFileExists = false;
        try {
            configFileExists = config_file_reader_1.ConfigFileReader.fileExists(configFilePath);
            if (configFileExists) {
                logger_1.FileStreamLogger.Instance.info("parsing config file using OCI ConfigFileReader");
                this.configFile = config_file_reader_1.ConfigFileReader.parseFileFromPath(configFilePath, null);
                this.configFileLocation = config_file_reader_1.ConfigFileReader.expandUserHome(config_file_reader_1.ConfigFileReader.expandUserHome(configFilePath));
                logger_1.FileStreamLogger.Instance.info("parsed config file using OCI ConfigFileReader");
            }
            else {
                logger_1.FileStreamLogger.Instance.info("oci config file does not exist");
            }
        }
        catch (error) {
            throw error;
        }
    }
    getConfigFileData(profile) {
        logger_1.FileStreamLogger.Instance.info("Reading data from config file for a specific profile");
        let configuration = this.configFile.accumulator.configurationsByProfile.get(profile);
        let configFileData = new ociConfigFileData();
        configFileData.tenancy = configuration.get("tenancy");
        configFileData.user = configuration.get("user");
        configFileData.regionId = configuration.get("region");
        configFileData.keyFile = this.getKeyFilePath(configuration.get("key_file"));
        if (configFileData.keyFile) {
            configFileData.fileStats = fs.statSync(configFileData.keyFile);
        }
        configFileData.fingerprint = configuration.get("fingerprint");
        configFileData.profileName = profile;
        configFileData.passPhrase = null;
        configFileData.ppInFile = false;
        let creds = configuration.get("pass_phrase");
        if (creds && creds.length > 0) {
            configFileData.ppInFile = true;
            configFileData.passPhrase = helper.Utils.toCodePointArray(creds);
            creds = "";
        }
        configFileData.configFileLocation = this.configFileLocation;
        logger_1.FileStreamLogger.Instance.info("Returning data from config file for the profile");
        return configFileData;
    }
    static isRegionSpecified(configFileRegionID, existingFileRegionID) {
        let regionspecified = true;
        if (!configFileRegionID && existingFileRegionID || configFileRegionID && !existingFileRegionID) {
            regionspecified = false;
        }
        return regionspecified;
    }
    static keyFileSame(configFileStat, existingFileStat) {
        let sameFile = false;
        if ((!configFileStat && existingFileStat)
            || (!existingFileStat && configFileStat)) {
            sameFile = false;
        }
        else if (!configFileStat && !existingFileStat) {
            sameFile = true;
        }
        else {
            if (configFileStat.mtime.toString() == existingFileStat.mtime.toString()) {
                sameFile = true;
            }
            else {
                sameFile = false;
            }
        }
        return sameFile;
    }
    static IsProfileSame(currentConfigFileData, existingConfigFileData) {
        let sameProfile = false;
        if (currentConfigFileData.profileName === existingConfigFileData.profileName
            && currentConfigFileData.fingerprint === existingConfigFileData.fingerprint
            && currentConfigFileData.user === existingConfigFileData.user
            && currentConfigFileData.tenancy === existingConfigFileData.tenancy
            && this.keyFileSame(currentConfigFileData.fileStats, existingConfigFileData.fileStats)
            && this.isRegionSpecified(currentConfigFileData.regionId, existingConfigFileData.regionId)
            && !currentConfigFileData.ppInFile && !existingConfigFileData.ppInFile) {
            sameProfile = true;
        }
        return sameProfile;
    }
}
exports.ociConfigFileHandler = ociConfigFileHandler;
