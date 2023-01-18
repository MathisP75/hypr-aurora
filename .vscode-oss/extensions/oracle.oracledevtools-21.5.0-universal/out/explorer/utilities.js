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
exports.DataExplorerExceptionCodes = exports.QueryBookmarkUtil = exports.QueryHistoryUtil = exports.ExplorerStatusManager = exports.TreeViewConstants = exports.ExplorerUtilities = void 0;
const vscode = require("vscode");
const logger_1 = require("../infrastructure/logger");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const localizedConstants_1 = require("./../constants/localizedConstants");
const dataExplorerRequests_1 = require("./dataExplorerRequests");
const connectionNode_1 = require("./nodes/connectionNode");
const functionNode_1 = require("./nodes/functionNode");
const functionProcedureParameterNode_1 = require("./nodes/functionProcedureParameterNode");
const packageBodyNode_1 = require("./nodes/packageBodyNode");
const packageMethodNode_1 = require("./nodes/packageMethodNode");
const packageMethodParameterNode_1 = require("./nodes/packageMethodParameterNode");
const packageNode_1 = require("./nodes/packageNode");
const procedureNode_1 = require("./nodes/procedureNode");
const relationalTableNode_1 = require("./nodes/relationalTableNode");
const sequenceNode_1 = require("./nodes/sequenceNode");
const synonymNode_1 = require("./nodes/synonymNode");
const tableColumnNode_1 = require("./nodes/tableColumnNode");
const tableConstraintNode_1 = require("./nodes/tableConstraintNode");
const tableIndexNode_1 = require("./nodes/tableIndexNode");
const tableTriggerNode_1 = require("./nodes/tableTriggerNode");
const viewNodes_1 = require("./nodes/viewNodes");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const userNode_1 = require("./nodes/userNode");
const queryHistoryRequests_1 = require("./queryHistoryRequests");
const queryBookmarkRequest_1 = require("./queryBookmarkRequest");
const dataExplorerManager_1 = require("./dataExplorerManager");
const constants_1 = require("../constants/constants");
const packageBodyPrivateMethodNode_1 = require("./nodes/packageBodyPrivateMethodNode");
const editorUtils_1 = require("./editors/editorUtils");
const DocumentConnectionInformation_1 = require("../connectionManagement/DocumentConnectionInformation");
const helper = require("../utilities/helper");
const setup_1 = require("../utilities/setup");
const compilerSettingsManager_1 = require("./compilerSettingsManager");
class ExplorerUtilities {
    static refreshNode(node) {
        if (ExplorerUtilities.refreshNodeField) {
            ExplorerUtilities.refreshNodeField(node);
        }
    }
    static getConnectionNodeID(nodeName, connectionId, connStatus, oldConnStatus, currentConnNodeId, connAsscoType) {
        let connNodeID = nodeName + connectionId.toString();
        switch (connStatus) {
            case connectionNode_1.ConnectionStatus.Connected:
                connNodeID = connNodeID + connectionNode_1.ConnectionStatus.Connected;
                break;
            case connectionNode_1.ConnectionStatus.Disconnected:
                connNodeID = connNodeID + connectionNode_1.ConnectionStatus.Disconnected;
                break;
            case connectionNode_1.ConnectionStatus.Connecting:
                connNodeID = connNodeID + connectionNode_1.ConnectionStatus.Disconnected;
                break;
            case connectionNode_1.ConnectionStatus.Errored:
                connNodeID = connNodeID + connectionNode_1.ConnectionStatus.Errored;
                break;
        }
        if (connAsscoType === connectionNode_1.ConnAssocType.Default) {
            connNodeID = connNodeID + connectionNode_1.ConnAssocType.Default;
        }
        if (connStatus === oldConnStatus && currentConnNodeId && !currentConnNodeId.endsWith("_")) {
            connNodeID = connNodeID + "_";
        }
        return connNodeID;
    }
    static isProfilesEqual(profile1, profile2) {
        const propsNotToCompareForUpgradedConn = [
            "databaseHostName",
            "databasePortNumber",
            "databaseServiceName",
            "passwordEmptyByUser"
        ];
        let result = true;
        let notCompared = 0;
        for (var propertyName in profile1) {
            if (propsNotToCompareForUpgradedConn.indexOf(propertyName) !== -1) {
                if (!(propertyName in profile2)) {
                    notCompared += 1;
                }
                continue;
            }
            let isProcessingPassword = (propertyName == "password" || propertyName == "proxyPassword");
            let passwordMatch = isProcessingPassword ?
                ExplorerUtilities.isPasswordEqual(profile1[propertyName], profile2[propertyName]) : true;
            let wasSaved = profile1.passwordSaved || profile2.passwordSaved;
            if (isProcessingPassword && wasSaved && !passwordMatch) {
                result = false;
                break;
            }
            else if (!isProcessingPassword &&
                profile1[propertyName] !== profile2[propertyName]) {
                result = false;
                break;
            }
        }
        if (result) {
            if (Object.keys(profile1).length - notCompared !== Object.keys(profile2).length) {
                result = false;
            }
        }
        return result;
    }
    static isPasswordEqual(password1, password2) {
        let result = true;
        if (password1 && password2) {
            for (let index = 0; index < password1.length; index++) {
                if (password1[index] !== password2[index]) {
                    result = false;
                    break;
                }
            }
        }
        else {
            if ((!password2 && password1) || (password2 && !password1)) {
                result = false;
            }
        }
        return result;
    }
    static getObjectUri(objectProperties) {
        let objectUri = "";
        if (objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ||
            objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) {
            const parentName = objectProperties.dbObject.parent;
            objectUri = `${objectProperties.connectionUri}/${objectProperties.ddexType}/${objectProperties.schemaName}.${parentName}.${objectProperties.objectName}`;
        }
        else {
            objectUri = `${objectProperties.connectionUri}/${objectProperties.ddexType}/${objectProperties.schemaName}.${objectProperties.objectName}`;
        }
        return objectUri;
    }
    static getUniqueURI(objectProperties) {
        let resultsWindowUri = "";
        let objectUri = this.getObjectUri(objectProperties);
        resultsWindowUri = ExplorerUtilities.objectUriToResultsWindowUriMap[objectUri];
        if (!resultsWindowUri) {
            ++ExplorerUtilities.resultsUriCount;
            resultsWindowUri = `${objectProperties.connectionUri}/${objectProperties.ddexType}/ResultsWindow/${ExplorerUtilities.resultsUriCount}`;
            ExplorerUtilities.objectUriToResultsWindowUriMap[objectUri] = resultsWindowUri;
        }
        return resultsWindowUri;
    }
    static onShowData(objectProperties, scriptExecuter, treeNode, parent) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let [response, connOpen] = yield ExplorerUtilities.getBasicPropertiesFromDB(objectProperties);
                if (!connOpen) {
                    let connectionNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(objectProperties.connectionUri);
                    if (connectionNode) {
                        dataExplorerManager_1.DataExplorerManager.Instance.onConnectionDisconnect(connectionNode, true);
                    }
                    resolve();
                    return;
                }
                if (!response || !response.object || !response.object.objectExists) {
                    if (parent) {
                        parent.removeChild(treeNode);
                        ExplorerUtilities.refreshNode(parent);
                    }
                    resolve();
                    return;
                }
                const basicObjectPropertiesRequest = new dataExplorerRequests_1.DataExplorerBasicObjectPropertiesParams();
                basicObjectPropertiesRequest.ownerUri = ExplorerUtilities.getUniqueURI(objectProperties);
                basicObjectPropertiesRequest.objectName = objectProperties.objectName;
                basicObjectPropertiesRequest.schemaName = objectProperties.schemaName;
                basicObjectPropertiesRequest.connectionUri = objectProperties.connectionUri;
                basicObjectPropertiesRequest.showDataFetchSize = constants_1.Constants.showDataFetchSize;
                scriptExecuter.startShowDataExecution(basicObjectPropertiesRequest, objectProperties.connectionName);
                resolve();
            }));
        });
    }
    static getRunResultsUri(connectionUri, ddexObjectType, schemaname, objectname) {
        let resultsWindowUri = "";
        let objectUri = `${connectionUri}/${ddexObjectType}/${schemaname}.${objectname}`;
        resultsWindowUri = ExplorerUtilities.objectUriToResultsWindowUriMap[objectUri];
        if (!resultsWindowUri) {
            ++ExplorerUtilities.resultsUriCount;
            resultsWindowUri = `${connectionUri}/${ddexObjectType}/ResultsWindow/${ExplorerUtilities.resultsUriCount}`;
            ExplorerUtilities.objectUriToResultsWindowUriMap[objectUri] = resultsWindowUri;
        }
        return resultsWindowUri;
    }
    static runCodeObjectFromFile(editorUri, scriptExecutor, dataExpManager, debug, debugHostIP, debugPort, debugSessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = editorUtils_1.editorUtils.getQueryParameters(editorUri);
            if (params) {
                let connNode = dataExpManager.getConnectionNode(params.connectionUri);
                let ownerUri = ExplorerUtilities.getRunResultsUri(params.connectionUri, params.ddexObjectType, params.schemaname, params.objectname);
                let [response, connOpen] = yield ExplorerUtilities.runCodeObject(connNode.connectionURI, ownerUri, params.ddexObjectType, params.schemaname, params.objectname, undefined, undefined, connNode.connectionProperties.name, scriptExecutor, debug, debugHostIP, debugPort, debugSessionId);
                if (!connOpen) {
                    let connectionNode = dataExpManager.getConnectionNode(params.connectionUri);
                    if (connectionNode) {
                        dataExpManager.onConnectionDisconnect(connectionNode, true);
                    }
                }
            }
        });
    }
    static runCodeObjectFromOENode(objectProperties, scriptExecutor, dataExpManager, debug, debugHostIP, debugPort, debugSessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            let object = objectProperties.objectName;
            if (objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ||
                objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) {
                const parentName = objectProperties.dbObject.parent;
                object = `${parentName}.${objectProperties.objectName}`;
            }
            let ownerUri = ExplorerUtilities.getRunResultsUri(objectProperties.connectionUri, objectProperties.ddexType, objectProperties.schemaName, object);
            let ddexObjectType = (objectProperties.ddexType == dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) ?
                dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod : objectProperties.ddexType;
            let schemaName = objectProperties.schemaName;
            let objectName = objectProperties.objectName;
            let parentName = undefined;
            let methodId = undefined;
            if (objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ||
                objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) {
                const method = objectProperties.dbObject;
                parentName = method.parent;
                methodId = method.id.toString();
            }
            let connectionName = objectProperties.connectionName;
            let [response, connOpen] = yield this.runCodeObject(objectProperties.connectionUri, ownerUri, ddexObjectType, schemaName, objectName, parentName, methodId, connectionName, scriptExecutor, debug, debugHostIP, debugPort, debugSessionId);
            if (!connOpen) {
                let connectionNode = dataExpManager.getConnectionNode(objectProperties.connectionUri);
                if (connectionNode) {
                    dataExpManager.onConnectionDisconnect(connectionNode, true);
                }
            }
        });
    }
    static runCodeObject(connectionUri, ownerUri, ddexObjectType, schemaName, objectName, parentName, methodId, connectionName, scriptExecutor, debug, debugHostIP, debugPort, debugSessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const basicPropertiesRequest = new dataExplorerRequests_1.DataExplorerFetchBasicObjectPropertiesParams();
                basicPropertiesRequest.ownerUri = ownerUri;
                basicPropertiesRequest.objectType = ddexObjectType;
                basicPropertiesRequest.objectName = objectName;
                basicPropertiesRequest.schemaName = schemaName;
                basicPropertiesRequest.connectionUri = connectionUri;
                basicPropertiesRequest.parentName = parentName;
                oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerFetchBasicObjectPropertiesRequest.type, basicPropertiesRequest).then((response) => {
                    if (response.object && response.object.status === dataExplorerRequests_1.Status.Valid) {
                        const requestParams = new dataExplorerRequests_1.RunCodeObjectRequestParams();
                        requestParams.ownerUri = ownerUri;
                        requestParams.objectType = ddexObjectType;
                        requestParams.objectName = objectName;
                        requestParams.schemaName = schemaName;
                        requestParams.connectionUri = connectionUri;
                        requestParams.parentName = parentName;
                        requestParams.methodId = methodId;
                        requestParams.isDebug = debug;
                        requestParams.debugSessionId = debugSessionId;
                        if (debug) {
                            requestParams.debugHostIP = debugHostIP;
                            requestParams.debugPort = debugPort;
                        }
                        scriptExecutor.startCodeExecution(requestParams, connectionName, connectionName);
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info(localizedConstants_1.default.invalidObjectMessage);
                        this.vscodeConnector.showErrorMessage(localizedConstants_1.default.invalidObjectMessage);
                    }
                    resolve([response, true]);
                }, (error) => {
                    logger_1.FileStreamLogger.Instance.info(localizedConstants_1.default.invalidObjectMessage);
                    let connOpen = true;
                    if (error.code === DataExplorerExceptionCodes.Error_NotConnectedToOracle) {
                        connOpen = false;
                    }
                    else {
                        this.vscodeConnector.showErrorMessage(localizedConstants_1.default.invalidObjectMessage);
                    }
                    resolve([undefined, connOpen]);
                });
            });
        });
    }
    static get vscodeConnector() {
        return ExplorerUtilities.vscodeConnectorField;
    }
    static set vscodeConnector(v) {
        ExplorerUtilities.vscodeConnectorField = v;
    }
    static getNodePath(parentPath, nodeId) {
        return parentPath + "\\" + nodeId;
    }
    static getCodeObjectSource(ownerUri, objectType, objectName, schemaName, appendSchema) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let sourceText = "";
                let createdDateTime = "";
                let modifiedDateTime = "";
                const requestParams = new dataExplorerRequests_1.DataExplorerFetchSourceRequestParams();
                requestParams.ownerUri = ownerUri;
                requestParams.objectType = objectType;
                requestParams.objectName = objectName;
                requestParams.schemaName = schemaName;
                requestParams.appendSchema = appendSchema;
                oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerFetchSourceRequestStronglyTyped.type, requestParams).
                    then((response) => {
                    if (response) {
                        sourceText = response.sourceText;
                        createdDateTime = response.createdDateTime;
                        modifiedDateTime = response.modifiedDateTime;
                    }
                    resolve([sourceText, createdDateTime, modifiedDateTime, response, true]);
                    logger_1.FileStreamLogger.Instance.info("Fetched source text for object");
                }, (error) => {
                    logger_1.FileStreamLogger.Instance.error("Error on fetching source text");
                    logger_1.FileStreamLogger.Instance.error(error.message);
                    let res = new dataExplorerRequests_1.DataExplorerFetchSourceResponse();
                    res.messageType = dataExplorerRequests_1.DataExplorerFetchMessageType.Error;
                    res.message = error.message;
                    let connOpen = true;
                    if (error.code === DataExplorerExceptionCodes.Error_NotConnectedToOracle) {
                        connOpen = false;
                    }
                    resolve([undefined, undefined, undefined, res, connOpen]);
                });
            });
        });
    }
    static saveToDatabase(fileUri, ownerUri, objectType, objectName, schemaName, checkObjectState, modifiedDateTime, compileDebug) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const requestParams = new dataExplorerRequests_1.DataExplorerSaveToDatabaseRequestParams();
                requestParams.fileUri = fileUri;
                requestParams.ownerUri = ownerUri;
                requestParams.objectType = objectType;
                requestParams.objectName = objectName;
                requestParams.schemaName = schemaName;
                requestParams.checkObjectState = checkObjectState;
                requestParams.modifiedDateTime = modifiedDateTime;
                requestParams.compileDebug = compileDebug;
                const extensionConfig = setup_1.Setup.getExtensionConfigSection();
                let compileSettings = extensionConfig.get(constants_1.Constants.compilerSettingsPropertyName);
                const compileFlags = compilerSettingsManager_1.CompilerSettingsManager.processCompilerFlagsFromSettings(compileSettings, false);
                const compileDebugFlags = compilerSettingsManager_1.CompilerSettingsManager.processCompilerFlagsFromSettings(compileSettings, true);
                if (compileFlags.enableFlags)
                    requestParams.compileFlags = compileFlags;
                if (compileDebugFlags.enableFlags)
                    requestParams.compileDebugFlags = compileDebugFlags;
                oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerSaveToDatabaseRequestStronglyTyped.type, requestParams).
                    then((response) => {
                    resolve([response, true]);
                    logger_1.FileStreamLogger.Instance.info("Save to Dababase response received");
                }, (error) => {
                    logger_1.FileStreamLogger.Instance.error("Error received as Save to Dababase response");
                    logger_1.FileStreamLogger.Instance.error(error.message);
                    let res = new dataExplorerRequests_1.DataExplorerSaveToDatabaseResponse();
                    res.messageType = dataExplorerRequests_1.DataExplorerSaveToDatabaseMessageType.Error;
                    res.message = error.message;
                    let connOpen = true;
                    if (error.code === DataExplorerExceptionCodes.Error_NotConnectedToOracle) {
                        connOpen = false;
                    }
                    resolve([res, connOpen]);
                });
            });
        });
    }
    static compileCodeObject(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                DocumentConnectionInformation_1.fileLogger.info("Compilation is starting for PL/SQL code object");
                let headerMsg = args.debug ? localizedConstants_1.default.compileDebugObjectHeaderMsg : localizedConstants_1.default.compileObjectHeaderMsg;
                const header = helper.stringFormatterCsharpStyle(headerMsg, args.schemaName, args.objectName);
                var outputWindow = logger_1.ChannelLogger.Instance;
                let dataExplorer = dataExplorerManager_1.DataExplorerManager.Instance;
                oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.CompileCodeObjectRequest.type, args).then((response) => __awaiter(this, void 0, void 0, function* () {
                    outputWindow.info(header + '\n' + response.queryText + '\n' + response.resultDetails + '\n');
                    outputWindow.show();
                    if (response.messageType != scriptExecutionModels_1.ScriptExecutionMessageType.Message) {
                        let connectionNode = dataExplorer.getConnectionNode(args.connectionUri);
                        if (response.openObject) {
                            let editorUri = vscode.Uri.parse(args.fileUri);
                            yield editorUtils_1.editorUtils.openEditor(editorUri, connectionNode);
                        }
                        if (args.objectType == dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package && response.openObjectBody) {
                            let bodyEditorUri = vscode.Uri.parse(args.bodyFileUri);
                            yield editorUtils_1.editorUtils.openEditor(bodyEditorUri, connectionNode);
                        }
                    }
                    resolve([true, response.modifiedDateTime]);
                }), error => {
                    let connOpen = true;
                    if (error.code === DataExplorerExceptionCodes.Error_NotConnectedToOracle) {
                        connOpen = false;
                    }
                    let splitIndex = error.message.indexOf(';'), errorMsg, queryText;
                    if (splitIndex > -1) {
                        errorMsg = error.message.slice(splitIndex + 1);
                        queryText = error.message.slice(0, splitIndex);
                    }
                    else
                        errorMsg = error.message;
                    const outputMsg = header + '\n' + queryText + '\n' + errorMsg + '\n';
                    outputWindow.error(outputMsg);
                    outputWindow.show();
                    DocumentConnectionInformation_1.fileLogger.error(error.message);
                    resolve([connOpen, null]);
                });
            }));
        });
    }
    static getChildNodes(parent, ddexType, restrictions) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                logger_1.FileStreamLogger.Instance.info("Oracle Explorer Connection: Fetching list of objects");
                const requestParams = new dataExplorerRequests_1.DataExplorerGetObjectsRequestParams();
                requestParams.ownerUri = parent.connectionURI;
                requestParams.type = ddexType;
                requestParams.restrictions = restrictions;
                requestParams.requestID = parent.connectionURI + parent.getNodeIdentifier;
                let connectionNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(parent.connectionURI);
                if (!connectionNode)
                    resolve(null);
                try {
                    var response = yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerGetObjectsRequestStronglyTyped.type, requestParams);
                    if (response.messageType !== dataExplorerRequests_1.DataExplorerGetObjectsMessageType.Error) {
                        logger_1.FileStreamLogger.Instance.info("Oracle Explorer Connection: Received list of objects from server, beginning tree nodes construction");
                        const results = [];
                        var i = 0;
                        const prtPath = ExplorerUtilities.getNodePath(parent.getParentPath, parent.getNodeIdentifier);
                        while (i < response.objects.length && connectionNode.status == connectionNode_1.ConnectionStatus.Connected) {
                            var nodeObj = ExplorerUtilities.GetChildObject(parent.connectionURI, prtPath, ddexType, response.objects[i]);
                            results.push(nodeObj);
                            ++i;
                        }
                        logger_1.FileStreamLogger.Instance.info("End of tree nodes construction");
                        parent.children = results;
                        if (ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Procedure ||
                            ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Function ||
                            ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ||
                            ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) {
                            const paramRequest = new dataExplorerRequests_1.DataExplorerGetMethodParamsRequest();
                            paramRequest.requestID = requestParams.requestID;
                            logger_1.FileStreamLogger.Instance.info("Fetching list of parameters for methods");
                            let paramResponse = yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerGetMethodParamsRequestStronglyTyped.type, paramRequest);
                            if (paramResponse.cacheFound) {
                                logger_1.FileStreamLogger.Instance.info("Received list of parameters, updating tree nodes.");
                                i = 0;
                                let index, isPackageMethod = ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod || ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod;
                                let responseObj;
                                while (i < response.objects.length) {
                                    responseObj = response.objects[i];
                                    index = isPackageMethod ? responseObj['name'] + responseObj['id'] : responseObj['name'];
                                    responseObj['params'] = paramResponse.paramDictionary[index];
                                    results[i].toolTipMsg = this.getNodeToolTip(results[i], paramResponse.paramDictionary[index]);
                                    ++i;
                                }
                                logger_1.FileStreamLogger.Instance.info("End of tree nodes updation");
                            }
                        }
                        resolve(parent.children);
                        logger_1.FileStreamLogger.Instance.info("Returning tree nodes - number of objects: " + results.length);
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info("Data Explorer getObjects request returned error");
                        ExplorerUtilities.vscodeConnector.showErrorMessage(response.message);
                        reject(false);
                    }
                }
                catch (error) {
                    logger_1.FileStreamLogger.Instance.error("Could not fetch objects");
                    logger_1.FileStreamLogger.Instance.error(error.message);
                    if (error.code === DataExplorerExceptionCodes.Error_NotConnectedToOracle &&
                        connectionNode) {
                        dataExplorerManager_1.DataExplorerManager.Instance.onConnectionDisconnect(connectionNode, true);
                        resolve(null);
                    }
                    else if (!connectionNode) {
                        resolve(null);
                    }
                    else {
                        reject(error);
                    }
                }
                logger_1.FileStreamLogger.Instance.info("Data Explorer getObjects completed");
            }));
        });
    }
    static GetChildObject(connectUri, parentPath, type, databaseObject) {
        if (!this.childObjectMapping) {
            this.childObjectMapping = new Map();
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTable, () => {
                return new relationalTableNode_1.RelationalTableNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTable, () => {
                return new relationalTableNode_1.ObjectTableNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTable, () => {
                return new relationalTableNode_1.XMLTableNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLView, () => {
                return new viewNodes_1.XMLViewNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectView, () => {
                return new viewNodes_1.ObjectViewNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalView, () => {
                return new viewNodes_1.RelationalViewNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedView, () => {
                return new viewNodes_1.MaterializedViewNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Sequence, () => {
                return new sequenceNode_1.SequenceNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Synonym, () => {
                return new synonymNode_1.SynonymNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Procedure, () => {
                return new procedureNode_1.ProcedureNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Function, () => {
                return new functionNode_1.FunctionNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package, () => {
                return new packageNode_1.PackageNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_StoredProcedureParameter, () => {
                return new functionProcedureParameterNode_1.functionProcedureParameterNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_FunctionParameter, () => {
                return new functionProcedureParameterNode_1.functionProcedureParameterNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod, () => {
                return new packageMethodNode_1.PackageMethodNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod, () => {
                return new packageMethodNode_1.PackageMethodNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody, () => {
                return new packageBodyNode_1.PackageBodyNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyPrivateMethod, () => {
                return new packageBodyPrivateMethodNode_1.PackageBodyPrivateMethodNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageStoredProcedureParameter, () => {
                return new packageMethodParameterNode_1.packageMethodParameterNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableConstraint, () => {
                return new tableConstraintNode_1.TableConstraintNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableIndex, () => {
                return new tableIndexNode_1.TableIndexNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableConstraint, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableIndex, () => {
                return new tableIndexNode_1.TableIndexNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableConstraint, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableIndex, () => {
                return new tableIndexNode_1.TableIndexNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalViewColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalViewTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectViewColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectViewTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLViewColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLViewTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedViewColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedViewTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_TableTriggerMain, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ViewTriggerMain, () => {
                return new tableTriggerNode_1.ViewTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_SchemaTriggerMain, () => {
                return new tableTriggerNode_1.SchemaTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_DatabaseTriggerMain, () => {
                return new tableTriggerNode_1.DatabaseTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Schema, () => {
                return new userNode_1.userNode();
            });
        }
        const resultObject = this.childObjectMapping.get(type)();
        resultObject.connectionURI = connectUri;
        resultObject.parentPath = parentPath;
        resultObject.populate(databaseObject);
        resultObject.ddexObjectType = type;
        return resultObject;
    }
    static getNodeToolTip(node, methodParams = null) {
        let isFunction = false;
        switch (node.ddexObjectType) {
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Function: isFunction = true;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Procedure:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyPrivateMethod:
                node.toolTipMsg = this.getToolTipForMethod(methodParams, node.getNodeIdentifier, true, isFunction);
        }
        return node.toolTipMsg;
    }
    static getToolTipForMethod(methodParameters, nodeIdentifier, isDbParams, isFunction = false) {
        var _a, _b;
        if (methodParameters == null || methodParameters == undefined || methodParameters.length == 0)
            return isFunction ? constants_1.Constants.function + ' ' + nodeIdentifier : constants_1.Constants.procedure + ' ' + nodeIdentifier;
        if (!isFunction && methodParameters[0].name == '"ReturnValue"')
            isFunction = true;
        let i = isFunction ? 1 : 0;
        let tool_tip = (isFunction ? constants_1.Constants.function : constants_1.Constants.procedure) + ' ' + nodeIdentifier + ' ';
        if (methodParameters.length > i) {
            tool_tip += '\n(';
            for (; i < methodParameters.length; ++i)
                tool_tip += (methodParameters[i].name) + ' '
                    + (isDbParams ? methodParameters[i].dataType : (_a = methodParameters[i].dataType) === null || _a === void 0 ? void 0 : _a.displayName) + ',\n';
            tool_tip = tool_tip.slice(0, -2) + ')';
        }
        if (isFunction)
            tool_tip += constants_1.Constants.return + (isDbParams ? methodParameters[0].dataType : (_b = methodParameters[0].dataType) === null || _b === void 0 ? void 0 : _b.displayName);
        return tool_tip;
    }
    static registerRefreshMethod(treeDataProvider) {
        ExplorerUtilities.refreshNodeField = (node) => {
            treeDataProvider.refresh(node);
        };
    }
    static getBasicPropertiesFromDB(objectProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            let parentName = undefined;
            if (objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod) {
                const method = objectProperties.dbObject;
                parentName = method.parent;
            }
            return ExplorerUtilities.getObjectBasicPropertiesFromDB(objectProperties.connectionUri, objectProperties.ddexType, objectProperties.objectName, objectProperties.schemaName, parentName);
        });
    }
    static getObjectBasicPropertiesFromDB(connectionUri, ddexType, objectName, schemaName, parentName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const basicPropertiesRequest = new dataExplorerRequests_1.DataExplorerFetchBasicObjectPropertiesParams();
                basicPropertiesRequest.ownerUri = connectionUri;
                basicPropertiesRequest.objectType = ddexType;
                basicPropertiesRequest.objectName = objectName;
                basicPropertiesRequest.schemaName = schemaName;
                basicPropertiesRequest.connectionUri = connectionUri;
                if (ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod) {
                    basicPropertiesRequest.parentName = parentName;
                }
                yield oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerFetchBasicObjectPropertiesRequest.type, basicPropertiesRequest).then((response) => {
                    resolve([response, true]);
                }, (error) => {
                    let connOpen = true;
                    if (error.code === DataExplorerExceptionCodes.Error_NotConnectedToOracle) {
                        connOpen = false;
                    }
                    logger_1.FileStreamLogger.Instance.info(localizedConstants_1.default.invalidObjectMessage);
                    resolve([undefined, connOpen]);
                });
            }));
        });
    }
}
exports.ExplorerUtilities = ExplorerUtilities;
ExplorerUtilities.resultsUriCount = 0;
ExplorerUtilities.objectUriToResultsWindowUriMap = {};
class TreeViewConstants {
}
exports.TreeViewConstants = TreeViewConstants;
TreeViewConstants.tablesStr = "Tables";
TreeViewConstants.viewsStr = "Views";
TreeViewConstants.proceduresStr = "Procedures";
TreeViewConstants.procedureStr = "Procedure";
TreeViewConstants.functionsStr = "Functions";
TreeViewConstants.packagesStr = "Packages";
TreeViewConstants.packageStr = "Package";
TreeViewConstants.sequencesStr = "Sequences";
TreeViewConstants.sequenceStr = "Sequence";
TreeViewConstants.synonymsStr = "Synonyms";
TreeViewConstants.synonymStr = "Synonym";
TreeViewConstants.functionStr = "Function";
TreeViewConstants.baseUri = "OracleExplorer://";
TreeViewConstants.compilerSettingsUri = TreeViewConstants.baseUri + "CompilerSettings";
TreeViewConstants.formatterSettingsUri = TreeViewConstants.baseUri + "FormatterSettings";
TreeViewConstants.explorerViewName = "oracleDBObjectExplorer";
TreeViewConstants.relationalTablesStr = "Relational Tables";
TreeViewConstants.relationalTableStr = "Relational Table";
TreeViewConstants.objectTableStr = "Object Table";
TreeViewConstants.xmlTableStr = "XML Table";
TreeViewConstants.objectTablesStr = "Object Tables";
TreeViewConstants.xmlTablesStr = "XML Tables";
TreeViewConstants.relationalViewsStr = "Relational Views";
TreeViewConstants.relationalViewStr = "Relational View";
TreeViewConstants.objectViewsStr = "Object Views";
TreeViewConstants.objectViewStr = "Object View";
TreeViewConstants.xmlViewsStr = "XML Views";
TreeViewConstants.xmlViewStr = "XML View";
TreeViewConstants.materializedViewsStr = "Materialized Views";
TreeViewConstants.materializedViewCaptionStr = "Materialized View";
TreeViewConstants.parameterStr = "Parameter";
TreeViewConstants.packageMethodStr = "PackageMethod";
TreeViewConstants.packageBodyPrivateMethodStr = "PackageBodyPrivateMethod";
TreeViewConstants.packageBodyStr = "PackageBody";
TreeViewConstants.packageBodyCaptionStr = "Package Body";
TreeViewConstants.constraintsStr = "Constraints";
TreeViewConstants.indexesStr = "Indexes";
TreeViewConstants.triggersStr = "Triggers";
TreeViewConstants.columnStr = "Column";
TreeViewConstants.constraintStr = "Constraint";
TreeViewConstants.indexStr = "Index";
TreeViewConstants.triggerStr = "Trigger";
TreeViewConstants.parameterDirectionOUT = "OUT";
TreeViewConstants.connectionStr = "Connection";
TreeViewConstants.tableTriggersStr = "Table Triggers";
TreeViewConstants.viewTriggersStr = "View Triggers";
TreeViewConstants.databaseTriggersStr = "Database Triggers";
TreeViewConstants.schemaTriggersStr = "Schema Triggers";
TreeViewConstants.packageMethodParameterStr = "PackageMethod Parameter";
TreeViewConstants.usersStr = "Other Users";
TreeViewConstants.userStr = "User";
TreeViewConstants.historyGroupStr = "History Group";
TreeViewConstants.historyItemStr = "HistoryItem";
TreeViewConstants.middleBookMarkGroup = "middleBookMarkGroup";
TreeViewConstants.lastBookmarkGroup = "lastBookmarkGroup";
TreeViewConstants.firstBookmarkGroup = "firstBookmarkGroup";
TreeViewConstants.bookmarkGroupOne = "bookmarkGroupOne";
TreeViewConstants.middleBookmarkItem = "middleBookmarkItem";
TreeViewConstants.lastBookmarkItem = "lastBookmarkItem";
TreeViewConstants.firstBookmarkItem = "firstBookmarkItem";
TreeViewConstants.bookmarkItemOne = "bookmarkItemOne";
TreeViewConstants.ociRootNodeItemStr = "ociRootNodeItem";
TreeViewConstants.ociWorkloadItemStr = "ociWorkloadItem";
TreeViewConstants.ociDedicatedDatabaseItemStr = "ociDedicatedDatabaseItem";
TreeViewConstants.ociNonDedicatedDatabaseItemStr = "ociNonDedicatedDatabaseItem";
TreeViewConstants.returnValueCaptionStr = "(Return Value: {0})";
TreeViewConstants.tableStr = "Table";
TreeViewConstants.viewStr = "View";
TreeViewConstants.materializedViewStr = "MaterializedView";
class ExplorerStatusManager {
    static updateStatusBar(connectionNode) {
    }
}
exports.ExplorerStatusManager = ExplorerStatusManager;
ExplorerStatusManager.varConnectionStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
class QueryHistoryUtil {
    static RunHistObject(queryHistNode, scriptExecutor, ownerUri) {
        scriptExecutor.startHistObjectExecution(new queryHistoryRequests_1.RunHistoryObjectParams(queryHistNode.getNodeIdentifier, ownerUri));
    }
}
exports.QueryHistoryUtil = QueryHistoryUtil;
class QueryBookmarkUtil {
    static BookmarkQuery(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(queryBookmarkRequest_1.QueryBookmarkRequest.type, params).then((response) => {
                    resolve(response);
                }, (error) => {
                    resolve(undefined);
                });
            });
        });
    }
    static getErrorMessage(error) {
        var msg = "";
        if (error && error.message) {
            msg = error.message;
        }
        return msg;
    }
    static ConnectFirstSQLInBookmarkQuery(params) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.FileStreamLogger.Instance.info("In ConnectFirstSQLInBookmarkQuery");
            return new Promise((resolve, reject) => {
                oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(queryBookmarkRequest_1.detectConnectAsStartSQLRequest.type, params).then((response) => {
                    resolve(response);
                }, (error) => {
                    logger_1.FileStreamLogger.Instance.error(`Error:ConnectFirstSQLInBookmarkQuery() error: ${QueryBookmarkUtil.getErrorMessage(error)}`);
                    resolve(undefined);
                });
            });
        });
    }
    static ConstructParams(vscodeConnector) {
        var ownerUri = vscodeConnector.activeTextEditorUri;
        var selection = vscodeConnector.getActiveDocumentSelection();
        return new queryBookmarkRequest_1.BookmarkQueryParams(selection, ownerUri);
    }
    static RunBookmarkItem(bookmarkNode, scriptExecuter, ownerUri, connectFirstSQL, tnsAdmin, walletLocation) {
        scriptExecuter.startBookmarkObjectExecution(new queryBookmarkRequest_1.RunBookmarkQueryParams(bookmarkNode.query, ownerUri, connectFirstSQL, bookmarkNode.getParentPath, bookmarkNode.getNodeIdentifier));
    }
}
exports.QueryBookmarkUtil = QueryBookmarkUtil;
class DataExplorerExceptionCodes {
}
exports.DataExplorerExceptionCodes = DataExplorerExceptionCodes;
DataExplorerExceptionCodes.Error_NotConnectedToOracle = -1000;
