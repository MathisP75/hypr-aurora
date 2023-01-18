"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultDataServer = exports.ResultUIClientInfo = void 0;
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const helper_1 = require("../utilities/helper");
const logger_1 = require("./../infrastructure/logger");
const util_1 = require("util");
const logger = logger_1.FileStreamLogger.Instance;
class ResultUIClientInfo {
    constructor() {
        this.msgesNotSent = [];
        this.dispose = () => {
            logger.info("Start - Dispose of ResultUIClientInfo");
            if (!this.disposed) {
                logger.info("Disposing ResultUIClientInfo, uri: " + this.ownerUri + " executionId: " + this.executionId);
                this.ownerUri = null;
                this.executionId = null;
                this.ready = false;
                this.panel = null;
                this.disposed = true;
            }
            logger.info("Done - Dispose of ResultUIClientInfo");
        };
        this.ready = false;
        this.disposed = false;
    }
    get uniqueId() {
        return helper_1.Utils.CreateIdByURIandExecutionId(this.ownerUri, this.executionId);
    }
}
exports.ResultUIClientInfo = ResultUIClientInfo;
class ResultDataServer {
    constructor() {
        this.resultUIClientList = new Map();
        this.messageHandlers = new Map();
        this.detachedPanels = {};
        this.addMessageHandler(scriptExecutionModels_1.MessageName.receiverReady, (message) => {
            this.handleReadyRequest(message);
        });
        this.addMessageHandler(scriptExecutionModels_1.MessageName.logData, (message) => {
            const logData = message;
            logger_1.FileStreamLogger.Instance.log(logData);
        });
    }
    static init() {
        if (!ResultDataServer.instanceSingle) {
            ResultDataServer.instanceSingle = new ResultDataServer();
        }
    }
    getExecutionInfo(scriptPath) {
        let result = [];
        if (this.resultUIClientList && this.resultUIClientList.size > 0) {
            this.resultUIClientList.forEach((clientInfo, key) => {
                if (clientInfo.ownerUri === scriptPath) {
                    result.push(clientInfo);
                }
            });
        }
        return result;
    }
    getFromDetachedPanels(fileUri) {
        return this.detachedPanels[fileUri];
    }
    addToDetachedPanels(fileUri, panel) {
        this.detachedPanels[fileUri] = panel;
    }
    removeFromDetachedPanels(fileUri) {
        delete this.detachedPanels[fileUri];
    }
    handleReadyRequest(data) {
        const clientDetails = this.resultUIClientList.get(helper_1.Utils.CreateIdByURIandExecutionId(data.ownerUri, data.executionId));
        if (clientDetails && clientDetails.panel) {
            clientDetails.ready = true;
            logger.info("Receiver is ready " + data.ownerUri);
            this.writePendingMessages(clientDetails, clientDetails.panel, clientDetails.executionId);
        }
    }
    registerResultUI(panel, uri, executionId) {
        logger.info("Start - Registering UI Client with Result Data Server");
        logger.info("Result UI Client Info, uri: " + uri + " executionId: " + executionId);
        let uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(uri, executionId);
        logger.info("Result UI Client Info, uniqueId: " + uniqueId);
        const clients = this.resultUIClientList;
        let clientDetails = clients.get(uniqueId);
        if (clientDetails === undefined) {
            logger.info("Creating new ResultUIClientInfo for uniqueId: " + uniqueId);
            clientDetails = new ResultUIClientInfo();
            clients.set(uniqueId, clientDetails);
            logger.info("Added new ResultUIClientInfo " + uniqueId + " to list of clients for Result Data Server, number of clients = " + clients.size);
        }
        else {
            logger.info("Reusing existing ResultClientInfo for uniqueId: " + uniqueId);
        }
        logger.info("Settings values in ResultClientInfo for uniqueId: " + uniqueId);
        clientDetails.panel = panel;
        clientDetails.executionId = executionId;
        clientDetails.ownerUri = uri;
        logger.info("Done - Registering UI Client with Result Data Server");
    }
    registerLoginScriptClient(uri, executionId) {
        logger.info("Start - Registering UI Client with Result Data Server");
        logger.info("Result UI Client Info, uri: " + uri + " executionId: " + executionId);
        let uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(uri, executionId);
        logger.info("Result UI Client Info, uniqueId: " + uniqueId);
        const clients = this.resultUIClientList;
        let clientDetails = clients.get(uniqueId);
        if (clientDetails === undefined) {
            logger.info("Creating new ResultUIClientInfo for uniqueId: " + uniqueId);
            clientDetails = new ResultUIClientInfo();
            clients.set(uniqueId, clientDetails);
            logger.info("Added new ResultUIClientInfo " + uniqueId + " to list of clients for Result Data Server, number of clients = " + clients.size);
        }
        else {
            logger.info("Reusing existing ResultClientInfo for uniqueId: " + uniqueId);
        }
        logger.info("Settings values in ResultClientInfo for uniqueId: " + uniqueId);
        clientDetails.panel = null;
        clientDetails.ready = true;
        clientDetails.executionId = executionId;
        clientDetails.ownerUri = uri;
        logger.info("Done - Registering UI Client with Result Data Server");
    }
    AssociateJavaScriptEventWithWindow(panel, clientDetails) {
        let disposable;
        disposable = clientDetails.panel.webview.onDidReceiveMessage((message) => {
            this.processMessage(message);
        });
        clientDetails.disposable = disposable;
    }
    processMessage(message) {
        if (message && message.type) {
            const handler = this.messageHandlers.get(message.type);
            if (handler) {
                handler(message.data);
            }
        }
        else {
            logger.info("No handler for message type " + message);
        }
    }
    convertMessageToString(msg) {
        let str = msg.type;
        const data = msg.data;
        if (data.ownerUri) {
            str = str + ` ownerUri = ${data.ownerUri}`;
        }
        else if (data.OwnerUri) {
            str = str + ` OwnerUri = ${data.OwnerUri}`;
        }
        if (data.executionId) {
            str = str + ` executionId = ${data.executionId}`;
        }
        return str;
    }
    postToClients(uri, executionId, event, data) {
        const msg = {
            type: event,
            executionId: executionId,
            data: data ? data : undefined,
        };
        let uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(uri, executionId);
        let clientInfo = this.resultUIClientList.get(uniqueId);
        if (clientInfo === undefined) {
            clientInfo = new ResultUIClientInfo();
            this.resultUIClientList.set(uniqueId, clientInfo);
        }
        this.postInternal(clientInfo, msg, uniqueId);
    }
    postToAll(event, data) {
        const msg = {
            type: event,
            data: data ? data : undefined,
            executionId: null
        };
        if (this.resultUIClientList && this.resultUIClientList.size > 0) {
            this.resultUIClientList.forEach((value, key) => {
                const clientInfo = value;
                if (clientInfo.panel && clientInfo.ready) {
                    logger.info("posting " + this.convertMessageToString(msg));
                    this.post(clientInfo.panel, msg);
                }
                else {
                    clientInfo.msgesNotSent.push(msg);
                }
            });
        }
    }
    getClientInfo(ownerUri, executionId) {
        let result = [];
        this.resultUIClientList.forEach((clientInfo, key) => {
            if ((!(0, util_1.isNullOrUndefined)(clientInfo)) && clientInfo.ownerUri === ownerUri && ((0, util_1.isNullOrUndefined)(executionId) || (!(0, util_1.isNullOrUndefined)(executionId) && executionId === clientInfo.executionId))) {
                result.push(clientInfo);
            }
        });
        return result;
    }
    getCurrentClientsInfo() {
        let result = [];
        this.resultUIClientList.forEach((clientInfo, key) => {
            if (!(0, util_1.isNullOrUndefined)(clientInfo)) {
                result.push(clientInfo);
            }
        });
        logger.info("getCurrentClientsInfo() - Number of UI Clients Info returned: " + result.length);
        return result;
    }
    unRegisterClient(ownerUri, executionId) {
        logger.info("Start - Unregister UI Client from ResultDataServer");
        let results = this.getClientInfo(ownerUri, executionId);
        for (let index = 0; index < results.length; index++) {
            const client = results[index];
            logger.info("Unregistering Client " + client.uniqueId);
            this.resultUIClientList.set(client.uniqueId, null);
            this.resultUIClientList.delete(client.uniqueId);
            logger.info("Deleted Client " + client.uniqueId + " from the registered client list for ResultDataServer, number of remaining clients = " + this.resultUIClientList.size);
        }
        logger.info("Done - Unregister UI Client from ResultDataServer");
    }
    addMessageHandler(type, handler) {
        this.messageHandlers.set(type, handler);
    }
    postInternal(clientInfo, msg, uiId) {
        if (clientInfo.panel && clientInfo.ready) {
            logger.info("posting " + this.convertMessageToString(msg));
            let correctWindow = uiId.indexOf(clientInfo.ownerUri) > -1;
            if (correctWindow) {
                this.post(clientInfo.panel, msg);
            }
        }
        else {
            clientInfo.msgesNotSent.push(msg);
        }
    }
    writePendingMessages(clientDetails, panel, executionId) {
        logger.info("Writing " + clientDetails.msgesNotSent.length + " pending messages.");
        clientDetails.msgesNotSent.forEach((msg) => {
            if (!msg.executionId || msg.executionId === executionId) {
                logger.info("posting " + this.convertMessageToString(msg));
                this.post(panel, msg);
            }
        });
        clientDetails.msgesNotSent = [];
    }
    post(panel, msg) {
        panel.webview.postMessage(msg).then(() => {
            logger.info("posted message successfully.");
        }, () => {
            logger.error("Could not post message");
        });
    }
}
exports.ResultDataServer = ResultDataServer;
ResultDataServer.dispose = () => {
    logger.info("Start - Dispose of result data server");
    if (!ResultDataServer.disposed) {
        logger.info("Disposing result data server");
        ResultDataServer.instanceSingle.resultUIClientList.forEach((entry) => {
            logger.info("Disposing Each Registered UI Client Info");
            if (!(0, util_1.isNullOrUndefined)(entry)) {
                if (entry.panel !== null && entry.panel !== undefined) {
                    entry.panel.dispose();
                }
                entry.dispose();
            }
        });
        ResultDataServer.instanceSingle.resultUIClientList.clear();
        ResultDataServer.instanceSingle = null;
        ResultDataServer.disposed = true;
        logger.info("Disposed result data server ");
    }
    logger.info("Done - Dispose of result data server");
};
ResultDataServer.disposed = false;
