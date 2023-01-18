"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleOciUserToken = void 0;
class OracleOciUserToken {
    constructor(userId, tenancyId, region, defaultCompartmentId, key) {
        this._DefaultCompartmentFullName = null;
        this._ActiveKey = null;
        this._UserId = userId;
        this._TenancyId = tenancyId;
        this._Region = region;
        if (defaultCompartmentId)
            this._DefaultCompartmentId = defaultCompartmentId;
        else
            this._DefaultCompartmentId = this._TenancyId;
        this._ApiKeys = new Map();
        if (key) {
            this._ActiveKey = key;
            this._ApiKeys.set(key.Fingerprint, key);
        }
    }
    get UserId() {
        return this._UserId;
    }
    set UserId(v) {
        this._UserId = v;
    }
    get TenancyId() {
        return this._TenancyId;
    }
    set TenancyId(v) {
        this._TenancyId = v;
    }
    get Region() {
        return this._Region;
    }
    set Region(v) {
        this._Region = v;
    }
    get DefaultCompartmentId() {
        return this._DefaultCompartmentId;
    }
    set DefaultCompartmentId(v) {
        this._DefaultCompartmentId = v;
    }
    get DefaultCompartmentFullName() {
        return this._DefaultCompartmentFullName;
    }
    set DefaultCompartmentFullName(v) {
        this._DefaultCompartmentFullName = v;
    }
    get ActiveKey() {
        return this._ActiveKey;
    }
    set ActiveKey(v) {
        this._ActiveKey = v;
    }
    get ApiKeys() {
        return this._ApiKeys;
    }
}
exports.OracleOciUserToken = OracleOciUserToken;
