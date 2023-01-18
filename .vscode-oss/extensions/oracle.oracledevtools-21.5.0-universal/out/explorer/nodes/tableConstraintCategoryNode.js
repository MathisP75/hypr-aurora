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
exports.TableConstraintCategoryNode = void 0;
const utilities_1 = require("../utilities");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
class TableConstraintCategoryNode extends databaseObjectBasic_1.CategoryNodeBase {
    constructor(connURI, parentPath, parentSchema, parentName, ddexType, schemaName) {
        super(connURI, parentPath, utilities_1.TreeViewConstants.constraintsStr, utilities_1.TreeViewConstants.constraintsStr, schemaName);
        this.parentSchema = parentSchema;
        this.parentName = parentName;
        this.ddexType = ddexType;
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            let restrictions = [];
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.parentSchema));
            restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_ParentObjectName, this.parentName));
            return utilities_1.ExplorerUtilities.getChildNodes(this, this.ddexType, restrictions);
        });
    }
}
exports.TableConstraintCategoryNode = TableConstraintCategoryNode;
