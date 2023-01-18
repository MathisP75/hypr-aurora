"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicIPAddressResponse = exports.PublicIPAddressRequestParameter = exports.PublicIPAddressRequest = exports.AutonomousDBWalletPswdResponse = exports.AutonomousDBWalletPswdRequestParameter = exports.AutonomousDBWalletPswdRequest = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
const constants_1 = require("../constants/constants");
class AutonomousDBWalletPswdRequest {
}
exports.AutonomousDBWalletPswdRequest = AutonomousDBWalletPswdRequest;
AutonomousDBWalletPswdRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.autonomousDBWalletPswdRequest);
class AutonomousDBWalletPswdRequestParameter {
}
exports.AutonomousDBWalletPswdRequestParameter = AutonomousDBWalletPswdRequestParameter;
class AutonomousDBWalletPswdResponse {
}
exports.AutonomousDBWalletPswdResponse = AutonomousDBWalletPswdResponse;
class PublicIPAddressRequest {
}
exports.PublicIPAddressRequest = PublicIPAddressRequest;
PublicIPAddressRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.publicIPAddressRequest);
class PublicIPAddressRequestParameter {
}
exports.PublicIPAddressRequestParameter = PublicIPAddressRequestParameter;
class PublicIPAddressResponse {
}
exports.PublicIPAddressResponse = PublicIPAddressResponse;
