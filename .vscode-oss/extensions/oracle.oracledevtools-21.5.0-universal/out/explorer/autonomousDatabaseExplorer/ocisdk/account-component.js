"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleOciAccountComponent = void 0;
const common = require("oci-common");
const services_clients_1 = require("./services-clients");
const user_token_1 = require("./user-token");
const user_api_key_1 = require("./user-api-key");
const fs_1 = require("fs");
const logger_1 = require("../../../infrastructure/logger");
class OracleOciAccountComponent {
    constructor(tenancy, user, region, apiKey) {
        this.key = null;
        logger_1.FileStreamLogger.Instance.info("In create authentication provider");
        this._UserToken = new user_token_1.OracleOciUserToken(user, tenancy, region);
        if (apiKey) {
            this._UserToken.ApiKeys.set(apiKey.Fingerprint, apiKey);
            this._UserToken.ActiveKey = apiKey;
        }
        let pp = this.getPassphrase();
        if (pp !== undefined && pp !== null) {
            logger_1.FileStreamLogger.Instance.info("Creating SimpleAuthenticationDetailsProvider: Passphrase is not null");
            this._AuthProvider = new common.SimpleAuthenticationDetailsProvider(tenancy, user, this.getFingerprint(), this.getPrivateKey(), String.fromCodePoint(...pp), region);
            pp = null;
        }
        else {
            logger_1.FileStreamLogger.Instance.info("Creating SimpleAuthenticationDetailsProvider: Passphrase is null");
            this._AuthProvider = new common.SimpleAuthenticationDetailsProvider(tenancy, user, this.getFingerprint(), this.getPrivateKey(), null, region);
        }
        logger_1.FileStreamLogger.Instance.info("Exiting create authentication provider");
    }
    get AuthProvider() {
        return this._AuthProvider;
    }
    get UserToken() {
        return this._UserToken;
    }
    get ServicesClients() {
        if (this._ServicesClients)
            return this._ServicesClients;
        else {
            this._ServicesClients = services_clients_1.OracleOciServicesClients.CreateServicesClients({ authenticationDetailsProvider: this._AuthProvider });
            return this._ServicesClients;
        }
    }
    static CreateAccountComponent(configFileData) {
        logger_1.FileStreamLogger.Instance.info("In CreateAccountComponent");
        if (!configFileData.keyFile && !configFileData.fingerprint)
            throw Error("Undefined private key file or fingerprint in the configuration file");
        let region;
        if (configFileData.regionId !== null) {
            try {
                region = common.Region.fromRegionId(configFileData.regionId);
            }
            catch (e) {
                throw e;
            }
        }
        else {
            throw Error("Region not specified in Config file. Can not proceed without setting a region.");
        }
        const key = new user_api_key_1.OracleOciApiKey(configFileData.keyFile, configFileData.fingerprint, configFileData.passPhrase);
        if (!configFileData.tenancy && !configFileData.user)
            throw Error("Undefined user or tenancy in the configuration file");
        const ac = new OracleOciAccountComponent(configFileData.tenancy, configFileData.user, region, key);
        logger_1.FileStreamLogger.Instance.info("Exiting CreateAccountComponent");
        return ac;
    }
    getPrivateKey() {
        if (this.key === null) {
            if (this._UserToken.ActiveKey)
                this.key = (0, fs_1.readFileSync)(this._UserToken.ActiveKey.PrivateKey, "utf8");
            else
                throw Error("There is no active API key defined for this account entry");
        }
        return this.key;
    }
    getPassphrase() {
        if (this._UserToken.ActiveKey)
            return this._UserToken.ActiveKey.Passphrase;
        else
            throw Error("There is no active API key defined for this account entry");
    }
    getFingerprint() {
        if (this._UserToken.ActiveKey)
            return this._UserToken.ActiveKey.Fingerprint;
        else
            throw Error("There is no active API key defined for this account entry");
    }
    getTenantId() {
        return this._AuthProvider.getTenantId();
    }
    getUser() {
        return this._AuthProvider.getUser();
    }
    getRegion() {
        return this._AuthProvider.getRegion();
    }
    getRegionName() {
        return this._AuthProvider.getRegion().regionId;
    }
}
exports.OracleOciAccountComponent = OracleOciAccountComponent;
