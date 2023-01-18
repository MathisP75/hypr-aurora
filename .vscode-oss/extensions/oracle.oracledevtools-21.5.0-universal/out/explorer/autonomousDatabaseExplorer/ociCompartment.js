"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ociCompartmentTree = exports.ociCompartment = void 0;
const autonomousDBUtils_1 = require("./autonomousDBUtils");
class ociCompartment {
    constructor(name = null, id = null, parentID = null, childs = null) {
        this.name = name;
        this.id = id;
        this.parentId = parentID;
        if (childs != null) {
            this.children = childs;
        }
        this.fullPath = name;
    }
    setCompartmentPropertiesfromFullName(compartmentFullName) {
        if (compartmentFullName) {
            this.fullPath = compartmentFullName;
            let idx = compartmentFullName.lastIndexOf(autonomousDBUtils_1.AutonomousDBUtils.compartmentSeparator);
            if (idx >= 0) {
                this.name = compartmentFullName.substr(idx + 1);
                this.nameForDisplay = this.name;
                this.fullNameForDisplay = autonomousDBUtils_1.AutonomousDBUtils.getRootAppenedFullCompartmentNameForDisplay(compartmentFullName);
            }
            else {
                let rootAppendedName = autonomousDBUtils_1.AutonomousDBUtils.getRootAppendedDisplayName(compartmentFullName);
                this.name = compartmentFullName;
                this.nameForDisplay = rootAppendedName;
                this.fullNameForDisplay = rootAppendedName;
            }
        }
    }
    setCompartmentProperties(compartmentFullName, compartmentID) {
        this.setCompartmentPropertiesfromFullName(compartmentFullName);
        this.id = compartmentID;
    }
}
exports.ociCompartment = ociCompartment;
class ociCompartmentTree {
    constructor(nodeList) {
        this.nodeList = nodeList;
    }
    getRootNode() {
        return this.rootNode;
    }
    populateTree(rootNodeID) {
        for (let [key, value] of this.nodeList) {
            var childNode = this.nodeList.get(key);
            if (childNode.parentId) {
                var parentNode = this.nodeList.get(childNode.parentId);
                parentNode.children.push(childNode);
            }
        }
        this.rootNode = this.nodeList.get(rootNodeID);
        this.pouplateNodesFullPath();
    }
    pouplateNodesFullPath() {
        var rootCompartment = this.nodeList.get(this.rootNode.id);
        for (let [key, value] of this.nodeList) {
            var childNode = this.nodeList.get(key);
            var node = this.findNode(rootCompartment, childNode.id);
            if (node) {
                let ociCompartment = node.selectedNode;
                ociCompartment.setCompartmentPropertiesfromFullName(node.fullPath);
            }
        }
    }
    getNodetoSelectAndAncestorsList(node, fullPath) {
        if (fullPath == null || undefined) {
            return null;
        }
        if (node.fullPath == fullPath) {
            return {
                ancesstorNodes: [node.id],
                selectedNode: node,
                fullPath: node.name
            };
        }
        else if (node.children) {
            for (let i = 0; i < node.children.length; i++) {
                const target = this.getNodetoSelectAndAncestorsList(node.children[i], fullPath);
                if (target) {
                    var fullPath;
                    var nodes = new Array();
                    if (target.fullPath == node.name) {
                        fullPath = target.fullPath;
                        nodes.push(node.id);
                    }
                    else {
                        fullPath = `${node.name}${autonomousDBUtils_1.AutonomousDBUtils.compartmentSeparator}${target.fullPath}`;
                        nodes.push(node.id);
                        for (let i = 0; i < target.ancesstorNodes.length; i++) {
                            nodes.push(target.ancesstorNodes[i]);
                        }
                    }
                    target.fullPath = fullPath;
                    target.ancesstorNodes = nodes;
                    return target;
                }
            }
        }
    }
    findNode(node, id) {
        if (node.id == id) {
            return {
                fullPath: node.name,
                selectedNode: node
            };
        }
        else if (node.children) {
            for (let i = 0; i < node.children.length; i++) {
                const target = this.findNode(node.children[i], id);
                if (target) {
                    var fullPath;
                    if (target.fullPath == node.name) {
                        fullPath = target.fullPath;
                    }
                    else {
                        fullPath = `${node.name}${autonomousDBUtils_1.AutonomousDBUtils.compartmentSeparator}${target.fullPath}`;
                    }
                    target.fullPath = fullPath;
                    return target;
                }
            }
        }
    }
    ;
}
exports.ociCompartmentTree = ociCompartmentTree;
