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
exports.XMLViewCategoryNode = void 0;
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
class XMLViewCategoryNode extends databaseObjectBasic_1.CategoryNodeBase {
    constructor(connURI, parentPath, schemaName) {
        super(connURI, parentPath, utilities_1.TreeViewConstants.xmlViewsStr, utilities_1.TreeViewConstants.xmlViewsStr, schemaName);
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!this.children) {
                        let restrictions = [];
                        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_IncludeSchemas, [this.schemaName]));
                        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_ExcludeSchemas, []));
                        this.children = yield utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLView, restrictions);
                    }
                    return resolve(this.children);
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
}
exports.XMLViewCategoryNode = XMLViewCategoryNode;
