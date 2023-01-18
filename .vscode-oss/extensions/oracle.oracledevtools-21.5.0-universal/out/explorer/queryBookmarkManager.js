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
exports.QueryBookmarkManager = exports.QueryBookmarkTreeDataProvider = exports.QueryBookmarkModel = exports.QueryBookmarkNode = exports.QueryBookmarkGroupNode = void 0;
const fs = require("fs");
const path = require("path");
const iExplorerNode_1 = require("./iExplorerNode");
const vscode = require("vscode");
const events_1 = require("events");
const treeNodeBase_1 = require("./treeNodeBase");
const question_1 = require("../prompts/question");
const helper = require("./../utilities/helper");
const helper_1 = require("./../utilities/helper");
const utilities_1 = require("./utilities");
const queryBookmarkRequest_1 = require("./queryBookmarkRequest");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const localizedConstants_1 = require("../constants/localizedConstants");
const constants_1 = require("../constants/constants");
const userPreferenceManager_1 = require("../infrastructure/userPreferenceManager");
const setup_1 = require("../utilities/setup");
const logger_1 = require("../infrastructure/logger");
const connectionRequest_1 = require("../models/connectionRequest");
class QueryBookmarkGroupNode extends treeNodeBase_1.TreeNodeBase {
    constructor(groupName) {
        super("", "", groupName, iExplorerNode_1.ExplorerNodeType.Category, utilities_1.TreeViewConstants.bookmarkGroupOne, new vscode.ThemeIcon('file-directory'), "");
        this.queryDict = new Map();
        this.context = utilities_1.TreeViewConstants.bookmarkGroupOne;
    }
    setContextValue(value) {
        this.context = value;
    }
    get getContextValue() {
        return this.context;
    }
    getChildren() {
        return this.children;
    }
    getTreeItem() {
        const treeItemObject = {};
        treeItemObject.label = this.getNodeIdentifier;
        treeItemObject.collapsibleState = this.getExpansionState();
        treeItemObject.contextValue = this.getContextValue;
        treeItemObject.iconPath = this.getIconPath;
        treeItemObject.command = this.getCommandObject();
        return treeItemObject;
    }
    getCommandObject() {
        return {
            command: constants_1.Constants.selectBookmarkQuery,
            title: constants_1.Constants.edit,
            arguments: [this],
        };
    }
    toJSON() {
        return Object.assign({}, { folderName: this.nodeID, bookmarks: this.children });
    }
}
exports.QueryBookmarkGroupNode = QueryBookmarkGroupNode;
class QueryBookmarkNode extends treeNodeBase_1.TreeNodeBase {
    constructor(query, groupName, queryName) {
        super("", groupName, queryName, iExplorerNode_1.ExplorerNodeType.Leaf, utilities_1.TreeViewConstants.bookmarkItemOne, new vscode.ThemeIcon('bookmark'), "");
        this.context = utilities_1.TreeViewConstants.bookmarkItemOne;
        this.query = query;
    }
    setContextValue(value) {
        this.context = value;
    }
    get getContextValue() {
        return this.context;
    }
    getTreeItem() {
        const treeItemObject = {};
        treeItemObject.label = this.getNodeIdentifier;
        treeItemObject.collapsibleState = this.getExpansionState();
        treeItemObject.contextValue = this.getContextValue;
        treeItemObject.iconPath = this.getIconPath;
        treeItemObject.command = this.getCommandObject();
        treeItemObject.tooltip = this.query;
        return treeItemObject;
    }
    getCommandObject() {
        return {
            command: constants_1.Constants.selectBookmarkQuery,
            title: constants_1.Constants.edit,
            arguments: [this],
        };
    }
    toJSON() {
        return Object.assign({}, { name: this.nodeID, sql: this.query });
    }
}
exports.QueryBookmarkNode = QueryBookmarkNode;
class QueryBookmarkModel {
    constructor(bookMarkExplorerManager) {
        this.bookMarkExplorerManager = bookMarkExplorerManager;
        this.modelChanged = new events_1.EventEmitter();
        this.MODEL_CHANGED = constants_1.Constants.modelChangedEvent;
        this.init();
    }
    validateFilePath() {
        try {
            logger_1.FileStreamLogger.Instance.info(`Validating FilePath`);
            var dirPath = this.getbookmarkFolderAndFilePath()[0];
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.error(`Error in validateFilePath`);
            helper.logErroAfterValidating(err);
        }
    }
    getbookmarkFolderAndFilePath() {
        let storagePath;
        try {
            logger_1.FileStreamLogger.Instance.info(`getbookmarkFolderAndFilePath() called`);
            const config = setup_1.Setup.getExtensionConfigSection();
            if (config) {
                storagePath = config.get(constants_1.Constants.bookMarkFileFolderPropertyName);
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.error(`Error in getbookmarkFolderAndFilePath()`);
            helper.logErroAfterValidating(err);
        }
        return [storagePath, path.join(storagePath, QueryBookmarkModel.fileName)];
    }
    init() {
        if (fs.existsSync(this.getbookmarkFolderAndFilePath()[1])) {
            this.initializeModel();
        }
    }
    burnModelToDisk() {
        fs.writeFileSync(this.getbookmarkFolderAndFilePath()[1], JSON.stringify(QueryBookmarkModel.data));
    }
    changeDetected() {
        if (fs.existsSync(this.getbookmarkFolderAndFilePath()[1])) {
            var dataOnDisk = fs.readFileSync(this.getbookmarkFolderAndFilePath()[1], 'utf8');
            return dataOnDisk != JSON.stringify(QueryBookmarkModel.data);
        }
        return false;
    }
    hasData() {
        return QueryBookmarkModel.data.length == 0 ? false : true;
    }
    initializeModel() {
        var modelContents = '';
        if (fs.existsSync(this.getbookmarkFolderAndFilePath()[1])) {
            modelContents = fs.readFileSync(this.getbookmarkFolderAndFilePath()[1], 'utf8');
            QueryBookmarkModel.bookmarkDict.clear();
            QueryBookmarkModel.data = this.rebuildModelFromJSON(modelContents);
        }
        else {
            QueryBookmarkModel.data = [];
            QueryBookmarkModel.bookmarkDict.clear();
        }
        this.modelChanged.emit(this.MODEL_CHANGED);
    }
    rebuildModelFromJSON(modelContents) {
        var groupNodeArray = [];
        var rawModel = JSON.parse(modelContents);
        rawModel.forEach(obj => {
            var grpNode = new QueryBookmarkGroupNode(obj.folderName);
            grpNode.children = [];
            grpNode.queryDict = new Map();
            if (obj.bookmarks != undefined) {
                obj.bookmarks.forEach(item => {
                    var qryNode = new QueryBookmarkNode(item.sql, obj.folderName, item.name);
                    grpNode.queryDict.set(item.name, qryNode);
                    grpNode.children.push(qryNode);
                });
            }
            groupNodeArray.push(grpNode);
            QueryBookmarkModel.bookmarkDict.set(grpNode.getNodeIdentifier, grpNode);
        });
        QueryBookmarkModel.data = groupNodeArray;
        this.resetContextValueForTree(null);
        return groupNodeArray;
    }
    getFolderList() {
        var lastFolder = undefined;
        var userPreferences = userPreferenceManager_1.UserPreferenceManager.Instance.readUserPreferencesFromJsonFile();
        if (userPreferences && userPreferences.bookmarkProperties &&
            userPreferences.bookmarkProperties.lastFolder) {
            lastFolder = userPreferences.bookmarkProperties.lastFolder;
        }
        var folderList = [];
        var element;
        var node;
        var folderFound = false;
        for (let index = 0; index < QueryBookmarkModel.data.length; index++) {
            element = QueryBookmarkModel.data[index].getNodeIdentifier;
            if (lastFolder != undefined && element == lastFolder) {
                folderFound = true;
                continue;
            }
            node = { label: element };
            folderList.push(node);
        }
        if (lastFolder != undefined && folderFound) {
            node = { label: lastFolder };
            folderList.unshift(node);
        }
        var newFolder = { label: localizedConstants_1.default.newFolder };
        newFolder["toIdentifyNewFolder"] = true;
        folderList.push(newFolder);
        return folderList;
    }
    getDefaultFolderName() {
        let index = 1;
        let folderName = "Folder" + index;
        while (QueryBookmarkModel.bookmarkDict.has(folderName)) {
            folderName = "Folder" + (++index);
        }
        return folderName;
    }
    getDefaultQueryName(lastFolderName) {
        let queryName = undefined;
        let name = "Bookmark";
        if (QueryBookmarkModel.bookmarkDict.has(lastFolderName)) {
            var folderNode = QueryBookmarkModel.bookmarkDict.get(lastFolderName);
            var childs = folderNode.getChildren();
            if (childs != null && childs != undefined) {
                let index = 1;
                name = `${name}${index}`;
                while (childs.find(node => node.getNodeIdentifier === name)) {
                    name = "Bookmark" + (++index);
                }
                queryName = name;
            }
        }
        queryName = queryName == undefined ? `${name}1` : queryName;
        return queryName;
    }
    updateModel(params) {
        this.validateFilePath();
        var nodeToSelect;
        switch (params.dataOp) {
            case (helper_1.Operation.Insert):
                {
                    this.insertData(params.queryVal, params.groupName, params.queryName, helper_1.Operation.Insert);
                    break;
                }
            case (helper_1.Operation.Delete):
                {
                    this.deleteNode(params.node);
                    break;
                }
            case (helper_1.Operation.DeleteAll):
                {
                    this.clearAll();
                    break;
                }
            case (helper_1.Operation.Rename):
                {
                    this.renameNode(params.node, params.newName);
                    break;
                }
            case (helper_1.Operation.MoveUP):
                {
                    nodeToSelect = this.moveNodeUP(params.node);
                    break;
                }
            case (helper_1.Operation.MoveDown):
                {
                    nodeToSelect = this.moveNodeDown(params.node);
                    break;
                }
        }
        this.burnModelToDisk();
        this.modelChanged.emit(this.MODEL_CHANGED);
        if (nodeToSelect) {
            this.bookMarkExplorerManager.selectNode(nodeToSelect);
        }
    }
    resetContextValueForTree(node, refreshTree = true) {
        var index = 0;
        for (index = 0; index < QueryBookmarkModel.data.length; index++) {
            var groupNode = QueryBookmarkModel.data[index];
            groupNode.setContextValue(utilities_1.TreeViewConstants.bookmarkGroupOne);
            groupNode.children.forEach(node => node.setContextValue(utilities_1.TreeViewConstants.bookmarkItemOne));
        }
        if (node != null) {
            this.updateContextValueForNode(node);
        }
        if (refreshTree) {
            this.modelChanged.emit(this.MODEL_CHANGED);
        }
    }
    updateContextValueForNode(node) {
        var parentNodeIndex = 0;
        if (node instanceof QueryBookmarkNode) {
            var parentNodeName = QueryBookmarkModel.bookmarkDict.get(node.parentPath).getNodeIdentifier;
            for (parentNodeIndex = 0; parentNodeIndex < QueryBookmarkModel.data.length; parentNodeIndex++) {
                var parentNode = QueryBookmarkModel.data[parentNodeIndex];
                if (parentNode.getNodeIdentifier === parentNodeName) {
                    break;
                }
            }
            var nodes = parentNode.getChildren();
            var index = 0;
            for (index = 0; index < nodes.length; index++) {
                if (node.getNodeIdentifier === nodes[index].getNodeIdentifier) {
                    if (index == 0) {
                        if (QueryBookmarkModel.data.length == 1 && nodes.length == 1) {
                            nodes[index].setContextValue(utilities_1.TreeViewConstants.bookmarkItemOne);
                        }
                        else if (parentNodeIndex == 0 && (nodes.length > 1 || QueryBookmarkModel.data.length > 1)) {
                            nodes[index].setContextValue(utilities_1.TreeViewConstants.firstBookmarkItem);
                        }
                        else if (parentNodeIndex == QueryBookmarkModel.data.length - 1 && nodes.length == 1) {
                            nodes[index].setContextValue(utilities_1.TreeViewConstants.lastBookmarkItem);
                        }
                        else {
                            nodes[index].setContextValue(utilities_1.TreeViewConstants.middleBookmarkItem);
                        }
                    }
                    else {
                        if (index == nodes.length - 1) {
                            if (QueryBookmarkModel.data.length == 1 || QueryBookmarkModel.data.length - 1 == parentNodeIndex) {
                                nodes[index].setContextValue(utilities_1.TreeViewConstants.lastBookmarkItem);
                            }
                            else {
                                nodes[index].setContextValue(utilities_1.TreeViewConstants.middleBookmarkItem);
                            }
                        }
                        else {
                            nodes[index].setContextValue(utilities_1.TreeViewConstants.middleBookmarkItem);
                        }
                    }
                }
                else {
                    nodes[index].setContextValue(utilities_1.TreeViewConstants.bookmarkItemOne);
                }
            }
        }
        else {
            for (index = 0; index < QueryBookmarkModel.data.length; index++) {
                var parentNode = QueryBookmarkModel.data[index];
                if (parentNode.getNodeIdentifier === node.getNodeIdentifier) {
                    if (index == 0) {
                        if (index == QueryBookmarkModel.data.length - 1) {
                            parentNode.setContextValue(utilities_1.TreeViewConstants.bookmarkGroupOne);
                        }
                        else {
                            parentNode.setContextValue(utilities_1.TreeViewConstants.firstBookmarkGroup);
                        }
                    }
                    else {
                        if (index == QueryBookmarkModel.data.length - 1) {
                            parentNode.setContextValue(utilities_1.TreeViewConstants.lastBookmarkGroup);
                        }
                        else {
                            parentNode.setContextValue(utilities_1.TreeViewConstants.middleBookMarkGroup);
                        }
                    }
                }
                else {
                    parentNode.setContextValue(utilities_1.TreeViewConstants.bookmarkGroupOne);
                }
            }
        }
    }
    insertData(query, groupName, queryName, operation, insertNodeAtBegining = false) {
        var grpNode;
        if (!QueryBookmarkModel.bookmarkDict.has(groupName)) {
            grpNode = new QueryBookmarkGroupNode(groupName);
            QueryBookmarkModel.bookmarkDict.set(groupName, grpNode);
            grpNode.children = [];
            if (queryName != undefined) {
                var bkmarkNode = new QueryBookmarkNode(query, groupName, queryName);
                if (insertNodeAtBegining) {
                    grpNode.children.unshift(bkmarkNode);
                }
                else {
                    grpNode.children.push(bkmarkNode);
                }
                grpNode.queryDict.set(queryName, bkmarkNode);
            }
            QueryBookmarkModel.data.push(grpNode);
        }
        else {
            if (queryName == undefined) {
                throw new Error(localizedConstants_1.default.bookmarkDuplicateGroup);
            }
            grpNode = QueryBookmarkModel.bookmarkDict.get(groupName);
            if (!grpNode.queryDict.has(queryName)) {
                var bkmarkNode = new QueryBookmarkNode(query, groupName, queryName);
                if (insertNodeAtBegining) {
                    grpNode.children.unshift(bkmarkNode);
                }
                else {
                    grpNode.children.push(bkmarkNode);
                }
                grpNode.queryDict.set(queryName, bkmarkNode);
            }
            else {
                throw new Error(this.getErrorMessage(groupName, queryName, operation));
            }
        }
    }
    getErrorMessage(folderName, bookMarkName, operation) {
        let message;
        switch (operation) {
            case helper_1.Operation.MoveDown:
                message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.bookmarkDuplicatebookMark, localizedConstants_1.default.moveDown, bookMarkName, folderName);
                break;
            case helper_1.Operation.MoveUP:
                message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.bookmarkDuplicatebookMark, localizedConstants_1.default.moveUp, bookMarkName, folderName);
                break;
            case helper_1.Operation.Insert:
                message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.bookmarkDuplicatebookMark, localizedConstants_1.default.add, bookMarkName, folderName);
                break;
            default:
                break;
        }
        return message;
    }
    moveGroupNode(nodes, from, to) {
        var node = nodes[from];
        nodes.splice(from, 1);
        nodes.splice(to, 0, node);
    }
    moveNodeUP(node) {
        let grpNodeIndex = -1;
        var bookMarkNode;
        var groupNode;
        if (node instanceof QueryBookmarkNode) {
            var parentNode = QueryBookmarkModel.bookmarkDict.get(node.parentPath);
            var nodes = parentNode.getChildren();
            grpNodeIndex = nodes.indexOf(node);
            if (grpNodeIndex > -1) {
                if (grpNodeIndex == 0) {
                    var previousParentNode = this.getPreviousParentNode(parentNode);
                    if (previousParentNode) {
                        this.insertData(node.query, previousParentNode.getNodeIdentifier, node.getNodeIdentifier, helper_1.Operation.MoveUP);
                        this.deleteNode(node);
                        bookMarkNode = previousParentNode.children[previousParentNode.children.length - 1];
                    }
                }
                else {
                    this.moveGroupNode(nodes, grpNodeIndex, grpNodeIndex - 1);
                    bookMarkNode = nodes[grpNodeIndex - 1];
                }
                if (bookMarkNode) {
                    this.resetContextValueForTree(bookMarkNode, false);
                }
            }
        }
        else {
            let grpNodeIndex = QueryBookmarkModel.data.indexOf(node);
            if (grpNodeIndex > -1) {
                this.moveGroupNode(QueryBookmarkModel.data, grpNodeIndex, grpNodeIndex - 1);
                groupNode = QueryBookmarkModel.data[grpNodeIndex - 1];
                this.resetContextValueForTree(groupNode, false);
            }
        }
        return bookMarkNode;
    }
    getNextParentNode(node) {
        var nextParentNode = null;
        for (let index = 0; index < QueryBookmarkModel.data.length; index++) {
            var element = QueryBookmarkModel.data[index];
            if (element.getNodeIdentifier == node.getNodeIdentifier) {
                if ((index + 1) < QueryBookmarkModel.data.length) {
                    nextParentNode = QueryBookmarkModel.data[index + 1];
                }
                break;
            }
        }
        return nextParentNode;
    }
    getPreviousParentNode(node) {
        var nextParentNode = null;
        for (let index = 0; index < QueryBookmarkModel.data.length; index++) {
            var element = QueryBookmarkModel.data[index];
            if (element.getNodeIdentifier == node.getNodeIdentifier) {
                if ((index - 1) < QueryBookmarkModel.data.length) {
                    nextParentNode = QueryBookmarkModel.data[index - 1];
                }
                break;
            }
        }
        return nextParentNode;
    }
    moveNodeDown(node) {
        let grpNodeIndex = -1;
        var bookMarkNode;
        var groupNode;
        if (node instanceof QueryBookmarkNode) {
            var parentNode = QueryBookmarkModel.bookmarkDict.get(node.parentPath);
            var nodes = parentNode.getChildren();
            grpNodeIndex = nodes.indexOf(node);
            if (grpNodeIndex > -1) {
                if (grpNodeIndex == nodes.length - 1) {
                    var nextParentNode = this.getNextParentNode(parentNode);
                    if (nextParentNode) {
                        this.insertData(node.query, nextParentNode.getNodeIdentifier, node.getNodeIdentifier, helper_1.Operation.MoveDown, true);
                        this.deleteNode(node);
                        bookMarkNode = nextParentNode.children[0];
                    }
                }
                else {
                    this.moveGroupNode(nodes, grpNodeIndex, grpNodeIndex + 1);
                    bookMarkNode = nodes[grpNodeIndex + 1];
                }
                if (bookMarkNode) {
                    this.resetContextValueForTree(bookMarkNode, false);
                }
            }
        }
        else {
            grpNodeIndex = QueryBookmarkModel.data.indexOf(node);
            if (grpNodeIndex > -1) {
                this.moveGroupNode(QueryBookmarkModel.data, grpNodeIndex, grpNodeIndex + 1);
                var groupNode = QueryBookmarkModel.data[grpNodeIndex + 1];
                this.resetContextValueForTree(groupNode, false);
            }
        }
        return bookMarkNode;
    }
    deleteNode(node) {
        if (node instanceof QueryBookmarkNode) {
            var parentNode = QueryBookmarkModel.bookmarkDict.get(node.parentPath);
            parentNode.removeChild(node);
            parentNode.queryDict.delete(node.getNodeIdentifier);
        }
        else {
            let grpNodeIndex = QueryBookmarkModel.data.indexOf(node);
            if (grpNodeIndex > -1) {
                QueryBookmarkModel.bookmarkDict.delete(node.getNodeIdentifier);
                QueryBookmarkModel.data.splice(grpNodeIndex, 1);
            }
        }
    }
    clearAll() {
        QueryBookmarkModel.bookmarkDict.clear();
        QueryBookmarkModel.data = [];
    }
    renameNode(node, newName) {
        if (node instanceof QueryBookmarkGroupNode) {
            if (QueryBookmarkModel.bookmarkDict.has(newName)) {
                throw new Error(localizedConstants_1.default.bookmarkDuplicateGroup);
            }
            node.queryDict.forEach((value, key) => {
                value.parentPath = newName;
            });
            QueryBookmarkModel.bookmarkDict.delete(node.getNodeIdentifier);
            node.setNodeIdentifier = newName;
            QueryBookmarkModel.bookmarkDict.set(newName, node);
        }
        else {
            var prntNode = QueryBookmarkModel.bookmarkDict.get(node.parentPath);
            if (prntNode.queryDict.has(newName)) {
                throw new Error(localizedConstants_1.default.bookmarkDuplicateQuery);
            }
            prntNode.queryDict.delete(node.getNodeIdentifier);
            node.setNodeIdentifier = newName;
            prntNode.queryDict.set(newName, node);
        }
    }
    get rootNodes() {
        return QueryBookmarkModel.data;
    }
    getChildren(node) {
        return node ? node.getChildren() : this.rootNodes;
    }
    addModelChangedHandler(handler) {
        this.modelChanged.on(this.MODEL_CHANGED, handler);
    }
}
exports.QueryBookmarkModel = QueryBookmarkModel;
QueryBookmarkModel.bookmarkDict = new Map();
QueryBookmarkModel.data = [];
QueryBookmarkModel.fileName = constants_1.Constants.bookmarkJsonFile;
class QueryBookmarkTreeDataProvider {
    constructor(model) {
        this.model = model;
        this._varonDidChangeTreeData = new vscode.EventEmitter();
        this.nodes = new Map();
        this.onDidChangeTreeData = this._varonDidChangeTreeData.event;
        model.addModelChangedHandler((data) => {
            this.varonDidChangeTreeData.fire(data);
        });
    }
    get varonDidChangeTreeData() {
        return this._varonDidChangeTreeData;
    }
    set varonDidChangeTreeData(value) {
        this._varonDidChangeTreeData = value;
    }
    getTreeItem(element) {
        return element ? element.getTreeItem() : null;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            let children = yield this.model.getChildren(element);
            if (children) {
                children.forEach((child) => {
                    this.nodes.set(child.getNodeIdentifier, child);
                });
            }
            return Promise.resolve(children);
        });
    }
    getParent(element) {
        let result;
        if (element) {
            let treeNode = element;
            if (treeNode.parentPath) {
                let lastTokenStart = treeNode.parentPath.lastIndexOf("\\");
                let nodeIdentifer = treeNode.parentPath.substring(lastTokenStart + 1);
                if (this.nodes.has(nodeIdentifer)) {
                    result = this.nodes.get(nodeIdentifer);
                }
            }
        }
        return result;
    }
}
exports.QueryBookmarkTreeDataProvider = QueryBookmarkTreeDataProvider;
class QueryBookmarkManager {
    constructor(connectionCommandsHandler, vsCodeConnector, scriptExecutor, prompter, untitledDcoumentProvider, fileLogger) {
        this.connectionCommandsHandler = connectionCommandsHandler;
        this.prompter = prompter;
        this.vsCodeConnector = vsCodeConnector;
        this.scriptExecutor = scriptExecutor;
        this.untitledDocumentProvider = untitledDcoumentProvider;
        this.fileLogger = fileLogger;
        this.queryBookmarkDataModel = new QueryBookmarkModel(this);
        this.previousBookmarkFileLocation = this.queryBookmarkDataModel.getbookmarkFolderAndFilePath()[0];
        const treeDataProvider = new QueryBookmarkTreeDataProvider(this.queryBookmarkDataModel);
        this.bookMarkExpTreeView = vscode.window.createTreeView(constants_1.Constants.bookmarkTreeview, { treeDataProvider });
        vscode.commands.registerCommand(constants_1.Constants.moveUpBookmarkQueryItem, (bookMarkNode) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Move UP bookmark item handler invoked");
                this.updateModel({ dataOp: helper_1.Operation.MoveUP, node: bookMarkNode });
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.workspace.onDidChangeConfiguration((param) => { this.onConfigurationChanged(param); });
        vscode.commands.registerCommand(constants_1.Constants.movedownBookmarkQueryItem, (bookMarkNode) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Move Down bookmark item handler invoked");
                this.updateModel({ dataOp: helper_1.Operation.MoveDown, node: bookMarkNode });
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.moveUpBookmarkQueryGroup, (bookMarkNode) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Move UP bookmark folder handler invoked");
                this.updateModel({ dataOp: helper_1.Operation.MoveUP, node: bookMarkNode });
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.movedownBookmarkQueryGroup, (bookMarkNode) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Move Down bookmark folder handler invoked");
                this.updateModel({ dataOp: helper_1.Operation.MoveDown, node: bookMarkNode });
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.addBookmarkQuery, () => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Add bookmark handler invoked");
                this.addBookmarkItem();
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.editBookmarkQuery, (queryBookmarkNode) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Edit Bookmark handler invoked");
                this.editBookmarkItem(queryBookmarkNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.selectBookmarkQuery, (node) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Select Bookmark handler invoked");
                this.queryBookmarkDataModel.resetContextValueForTree(node);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.runBookmarkQuery, (queryBookmarkNode) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Run Bookmark handler invoked");
                this.runBookmarkItem(queryBookmarkNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.deleteBookmarkQuery, (queryBookmarkNode) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Delete Bookmark handler invoked");
                this.deleteBookmarkItem(queryBookmarkNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.clearallBookmarks, () => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Clear All Bookmark handler invoked");
                this.clearAll();
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.openBookmarkQuery, (queryBookmarkNode) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Copy to editor bookmark handler invoked");
                this.copyToEditor(queryBookmarkNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.renameBookmarkQuery, (queryBookmarkNode) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Rename Bookmark handler invoked");
                this.renameNode(queryBookmarkNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        vscode.commands.registerCommand(constants_1.Constants.addBookmarkFolder, () => __awaiter(this, void 0, void 0, function* () {
            try {
                this.fileLogger.info("Add Folder Bookmark handler invoked");
                this.addFolder();
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        }));
        this.fileLogger.info("Bookmark module instantiated");
    }
    selectNode(node) {
        this.bookMarkExpTreeView.reveal(node, { select: true, focus: true });
    }
    onConfigurationChanged(param) {
        this.fileLogger.info("Handling configuration change for the application");
        const config = setup_1.Setup.getExtensionConfigSection();
        var newBookmarkLocation;
        if (config) {
            newBookmarkLocation = config.get(constants_1.Constants.bookMarkFileFolderPropertyName);
        }
        if (this.previousBookmarkFileLocation !== newBookmarkLocation) {
            this.previousBookmarkFileLocation = newBookmarkLocation;
            this.queryBookmarkDataModel.initializeModel();
            this.fileLogger.info("Handled configuration changed for the application");
        }
    }
    static CreateInstance(connectionCommandsHandler, vsCodeConnector, scriptExecutor, prompter, untitledCoumentProvider, fileLogger) {
        try {
            if (QueryBookmarkManager.pvtInstance == undefined) {
                QueryBookmarkManager.pvtInstance = new QueryBookmarkManager(connectionCommandsHandler, vsCodeConnector, scriptExecutor, prompter, untitledCoumentProvider, fileLogger);
            }
            return QueryBookmarkManager.pvtInstance;
        }
        catch (err) {
            helper.logErroAfterValidating(new Error(err));
        }
    }
    static Instance() {
        return QueryBookmarkManager.pvtInstance;
    }
    addBookmarkItem() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var selected = this.vsCodeConnector.getActiveDocumentSelectedText();
                if (selected == undefined || selected.length == 0) {
                    var queryInfo = yield utilities_1.QueryBookmarkUtil.BookmarkQuery(utilities_1.QueryBookmarkUtil.ConstructParams(this.vsCodeConnector));
                    if (queryInfo.isInvalidQuery) {
                        1;
                        helper.AppUtils.ShowErrorAndLog(new Error(localizedConstants_1.default.bookmarkInvalidQuery), this.vsCodeConnector);
                        return;
                    }
                    selected = this.generateBookmarkQuery(queryInfo.queries);
                }
                this.addQueryToBookmarks(selected);
            }
            catch (err) {
                helper.AppUtils.ShowErrorAndLog(err, this.vsCodeConnector);
            }
        });
    }
    addQueryToBookmarks(sqlquery) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var groupName;
                var queryName;
                const questions = [];
                var defaultQueryName;
                var defaultFolderName = undefined;
                defaultFolderName = this.queryBookmarkDataModel.getDefaultFolderName();
                var promptFolderName = false;
                var folders = this.queryBookmarkDataModel.getFolderList();
                questions.push({
                    type: question_1.QuestionTypes.expand,
                    choices: folders,
                    placeHolder: localizedConstants_1.default.selectBookmarkFolder,
                    name: localizedConstants_1.default.selectBookmarkFolder,
                    message: localizedConstants_1.default.selectBookmarkFolder,
                    shouldPrompt: () => true,
                    onAnswered: (value) => {
                        groupName = value.label;
                        if (groupName == localizedConstants_1.default.newFolder && value.toIdentifyNewFolder != undefined) {
                            promptFolderName = true;
                        }
                        else {
                            defaultQueryName = this.queryBookmarkDataModel.getDefaultQueryName(groupName);
                        }
                    }
                });
                questions.push({
                    type: question_1.QuestionTypes.input,
                    name: localizedConstants_1.default.enterBookmarkFolder,
                    message: localizedConstants_1.default.enterBookmarkFolder,
                    shouldPrompt: function () {
                        this.value = defaultFolderName;
                        return promptFolderName == true ? true : false;
                    },
                    onAnswered: (value) => {
                        groupName = value;
                        defaultQueryName = this.queryBookmarkDataModel.getDefaultQueryName(groupName);
                    }
                });
                questions.push({
                    type: question_1.QuestionTypes.input,
                    name: localizedConstants_1.default.enterBookmarkQueryName,
                    message: localizedConstants_1.default.enterBookmarkQueryName,
                    shouldPrompt: function () {
                        this.value = defaultQueryName;
                        return defaultQueryName != undefined;
                    },
                    onAnswered: (value) => {
                        queryName = value;
                    }
                });
                const answers = yield this.prompter.prompt(questions, true);
                if (answers) {
                    if ((groupName.trim() == '' || queryName.trim() == '')) {
                        helper.AppUtils.ShowErrorAndLog(new Error(localizedConstants_1.default.invalidBookmark), this.vsCodeConnector);
                        return;
                    }
                    this.addBookmarkHelper(sqlquery, groupName, queryName);
                }
            }
            catch (err) {
                helper.AppUtils.ShowErrorAndLog(err, this.vsCodeConnector);
            }
        });
    }
    generateBookmarkQuery(queries) {
        var finalQuery = '';
        queries.forEach(query => {
            if (query.startsWith('--') || query.startsWith('\*')) {
                if (query.endsWith('\r\n') || query.endsWith('\n')) {
                    finalQuery += query;
                }
                else {
                    finalQuery = finalQuery + query + '\n';
                }
            }
            else {
                if (query.endsWith('/') || query.endsWith(';\r\n') ||
                    query.endsWith(';\n')) {
                    finalQuery += query;
                }
                else {
                    if (query.endsWith(';')) {
                        finalQuery = finalQuery + query + '\n';
                    }
                    else {
                        if (query.endsWith('\n') || query.endsWith('\r\n')) {
                            finalQuery = finalQuery + query.substr(0, query.length - 1) + ';\n';
                        }
                        else {
                            finalQuery = finalQuery + query + ';\n';
                        }
                    }
                }
            }
        });
        return finalQuery;
    }
    addBookmarkHelper(query, groupName, queryName) {
        return __awaiter(this, void 0, void 0, function* () {
            var modelUpdated = yield this.updateModel({
                dataOp: helper_1.Operation.Insert,
                queryVal: query, groupName: groupName,
                queryName: queryName
            });
            if (modelUpdated) {
                this.vsCodeConnector.showInformationMessage(localizedConstants_1.default.bookmarkSavedMsg);
            }
        });
    }
    editBookmarkItem(node) {
        var content = `--${node.getNodeIdentifier}\n${node.query}`;
        this.untitledDocumentProvider.createAndOpen(content);
    }
    deleteBookmarkItem(node) {
        return __awaiter(this, void 0, void 0, function* () {
            var nodeName = node instanceof QueryBookmarkNode ?
                helper.stringFormatterCsharpStyle(localizedConstants_1.default.deleteBookmarkItemConfirmation, `${node.parentPath}:${node.getNodeIdentifier}`) :
                helper.stringFormatterCsharpStyle(localizedConstants_1.default.deleteBookmarkItemConfirmation, node.getNodeIdentifier);
            const question = {
                type: question_1.QuestionTypes.confirm,
                name: nodeName,
                message: nodeName
            };
            try {
                const proceed = yield this.prompter.promptSingle(question);
                if (proceed == undefined || !proceed) {
                    return;
                }
                this.updateModel({
                    dataOp: helper_1.Operation.Delete,
                    node: node
                });
            }
            catch (err) {
                helper.AppUtils.ShowErrorAndLog(err, this.vsCodeConnector);
            }
        });
    }
    clearAll() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.queryBookmarkDataModel.hasData()) {
                return;
            }
            const question = {
                type: question_1.QuestionTypes.confirm,
                name: localizedConstants_1.default.clearAllBookmarkConfirmation,
                message: localizedConstants_1.default.clearAllBookmarkConfirmation,
            };
            try {
                const proceed = yield this.prompter.promptSingle(question);
                if (proceed == undefined || !proceed) {
                    return;
                }
                this.updateModel({ dataOp: helper_1.Operation.DeleteAll });
            }
            catch (err) {
                helper.AppUtils.ShowErrorAndLog(err, this.vsCodeConnector);
            }
        });
    }
    runBookmarkItem(node) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var response = yield utilities_1.QueryBookmarkUtil.ConnectFirstSQLInBookmarkQuery(new queryBookmarkRequest_1.detectConnectAsStartSQLParams(node.query, constants_1.Constants.bookmarkOwnerIdentifier));
                if (response.connectFirstSQL) {
                    utilities_1.QueryBookmarkUtil.RunBookmarkItem(node, this.scriptExecutor, QueryBookmarkManager.ownerIdentifier, response.connectFirstSQL, setup_1.ConfigManager.instance.tnsAdmin, setup_1.ConfigManager.instance.walletLocation);
                }
                else {
                    var conProps = yield this.connectionCommandsHandler.showConnections();
                    if (conProps != undefined) {
                        var connected = yield this.connectionCommandsHandler.connect(QueryBookmarkManager.ownerIdentifier, conProps, false, false, connectionRequest_1.ConnectionSource.Bookmarks);
                        if (connected) {
                            utilities_1.QueryBookmarkUtil.RunBookmarkItem(node, this.scriptExecutor, QueryBookmarkManager.ownerIdentifier, response.connectFirstSQL, null, null);
                        }
                    }
                }
            }
            catch (err) {
                helper.AppUtils.ShowErrorAndLog(new Error(err), this.vsCodeConnector);
            }
        });
    }
    copyToEditor(node) {
        if (this.vsCodeConnector.activeTextEditor != undefined) {
            var selection = this.vsCodeConnector.activeTextEditor.selection;
            this.vsCodeConnector.activeTextEditor.edit((editbuilder) => {
                editbuilder.insert(new vscode.Position(selection.end.line, selection.end.character), node.query);
            }).then(success => {
                if (success) {
                    vscode.commands.executeCommand(constants_1.Constants.focusCurrentEditor);
                }
            });
            ;
        }
    }
    renameNode(node) {
        return __awaiter(this, void 0, void 0, function* () {
            var newName;
            const questions = [];
            questions.push({
                value: node.getNodeIdentifier,
                type: question_1.QuestionTypes.input,
                name: localizedConstants_1.default.bookmarkRename,
                message: localizedConstants_1.default.bookmarkRename,
                shouldPrompt: () => true,
                onAnswered: (value) => {
                    newName = value;
                }
            });
            try {
                const answers = yield this.prompter.prompt(questions, true);
                if (answers) {
                    if (newName.trim() == '') {
                        if (node instanceof QueryBookmarkNode) {
                            helper.AppUtils.ShowErrorAndLog(new Error(localizedConstants_1.default.invalidBookmarkQueryName), this.vsCodeConnector);
                        }
                        else {
                            helper.AppUtils.ShowErrorAndLog(new Error(localizedConstants_1.default.invalidBookmarkFolderName), this.vsCodeConnector);
                        }
                        return;
                    }
                    this.updateModel({ dataOp: helper_1.Operation.Rename, node: node, newName: newName });
                }
            }
            catch (err) {
                helper.AppUtils.ShowErrorAndLog(err, this.vsCodeConnector);
            }
        });
    }
    addFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            var folderName;
            const questions = [];
            var defaultFolderName = this.queryBookmarkDataModel.getDefaultFolderName();
            questions.push({
                type: question_1.QuestionTypes.input,
                name: localizedConstants_1.default.enterBookmarkFolder,
                message: localizedConstants_1.default.enterBookmarkFolder,
                shouldPrompt: function () {
                    this.value = defaultFolderName;
                    return true;
                },
                onAnswered: (value) => {
                    folderName = value;
                }
            });
            try {
                const answers = yield this.prompter.prompt(questions, true);
                if (answers) {
                    if (folderName.trim() == '') {
                        helper.AppUtils.ShowErrorAndLog(new Error(localizedConstants_1.default.invalidBookmarkFolderName), this.vsCodeConnector);
                        return;
                    }
                    this.updateModel({ dataOp: helper_1.Operation.Insert, groupName: folderName });
                }
            }
            catch (err) {
                helper.AppUtils.ShowErrorAndLog(err, this.vsCodeConnector);
            }
        });
    }
    updateModel(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.queryBookmarkDataModel.changeDetected()) {
                    const question = {
                        type: question_1.QuestionTypes.confirm,
                        name: localizedConstants_1.default.bookmarksChanged,
                        message: localizedConstants_1.default.bookmarksChanged,
                    };
                    const proceedOverwrite = yield this.prompter.promptSingle(question);
                    if (proceedOverwrite == undefined) {
                        return;
                    }
                    else if (!proceedOverwrite) {
                        this.queryBookmarkDataModel.initializeModel();
                        return false;
                    }
                    else {
                        this.queryBookmarkDataModel.updateModel(params);
                    }
                }
                else {
                    this.queryBookmarkDataModel.updateModel(params);
                }
                if (params.dataOp == helper_1.Operation.Insert) {
                    var preferences = userPreferenceManager_1.UserPreferenceManager.Instance.readUserPreferencesFromJsonFile();
                    if (preferences == undefined) {
                        preferences = new scriptExecutionModels_1.UserPreferences();
                    }
                    preferences.bookmarkProperties = new scriptExecutionModels_1.BookmarkProperties();
                    preferences.bookmarkProperties.lastFolder = params.groupName;
                    userPreferenceManager_1.UserPreferenceManager.Instance.saveUserPreferencesToJsonFile(preferences);
                }
                return true;
            }
            catch (err) {
                helper.AppUtils.ShowErrorAndLog(err, this.vsCodeConnector);
            }
        });
    }
}
exports.QueryBookmarkManager = QueryBookmarkManager;
QueryBookmarkManager.ownerIdentifier = constants_1.Constants.bookmarkOwnerIdentifier;
