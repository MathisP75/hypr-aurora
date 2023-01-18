"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleOciApiKey = void 0;
class OracleOciApiKey {
    constructor(privateKey, fingerprint, passPhrase) {
        if (privateKey === undefined || privateKey === null) {
            this._privateKey = "";
        }
        else {
            this._privateKey = privateKey;
        }
        if (fingerprint === undefined || fingerprint === null) {
            this._fingerprint = "";
        }
        else {
            this._fingerprint = fingerprint;
        }
        if (passPhrase === undefined || passPhrase === null) {
            this._passPhrase = null;
        }
        else {
            this._passPhrase = passPhrase;
        }
    }
    get PrivateKey() {
        return this._privateKey;
    }
    set PrivateKey(value) {
        this._privateKey = value;
    }
    get Fingerprint() {
        return this._fingerprint;
    }
    set Fingerprint(value) {
        this._fingerprint = value;
    }
    get Passphrase() {
        return this._passPhrase;
    }
    set Passphrase(value) {
        this._passPhrase = value;
    }
    ;
}
exports.OracleOciApiKey = OracleOciApiKey;
