"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleOciServicesClients = void 0;
const database = require("oci-database");
const identity = require("oci-identity");
class OracleOciServicesClients {
    constructor() {
    }
    static CreateServicesClients(params) {
        var clients = new OracleOciServicesClients();
        clients.DatabaseServiceClient = new database.DatabaseClient(params);
        clients.IdentityServiceClient = new identity.IdentityClient(params);
        return clients;
    }
}
exports.OracleOciServicesClients = OracleOciServicesClients;
