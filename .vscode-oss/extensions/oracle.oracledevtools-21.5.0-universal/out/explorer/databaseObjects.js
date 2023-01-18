"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeObjectStatus = exports.User = exports.Synonym = exports.Sequence = exports.TableViewTrigger = exports.TableIndex = exports.TableConstraint = exports.TableViewColumn = exports.PackageBodyPrivateMethod = exports.PackageMethod = exports.PackageMethodParameter = exports.FunctionProcedureParameter = exports.CodeObjectParameterBase = exports.PackageBody = exports.Package = exports.Function = exports.StoredProcedure = exports.CodeObjectBase = exports.MaterializedView = exports.View = exports.Table = exports.TableViewBase = exports.DatabaseObject = void 0;
class DatabaseObject {
}
exports.DatabaseObject = DatabaseObject;
class TableViewBase extends DatabaseObject {
}
exports.TableViewBase = TableViewBase;
class Table extends TableViewBase {
}
exports.Table = Table;
class View extends TableViewBase {
}
exports.View = View;
class MaterializedView extends DatabaseObject {
}
exports.MaterializedView = MaterializedView;
class CodeObjectBase extends DatabaseObject {
}
exports.CodeObjectBase = CodeObjectBase;
class StoredProcedure extends CodeObjectBase {
}
exports.StoredProcedure = StoredProcedure;
class Function extends CodeObjectBase {
}
exports.Function = Function;
class Package extends CodeObjectBase {
}
exports.Package = Package;
class PackageBody extends CodeObjectBase {
}
exports.PackageBody = PackageBody;
class CodeObjectParameterBase extends DatabaseObject {
}
exports.CodeObjectParameterBase = CodeObjectParameterBase;
class FunctionProcedureParameter extends CodeObjectParameterBase {
}
exports.FunctionProcedureParameter = FunctionProcedureParameter;
class PackageMethodParameter extends CodeObjectParameterBase {
}
exports.PackageMethodParameter = PackageMethodParameter;
class PackageMethod extends CodeObjectBase {
}
exports.PackageMethod = PackageMethod;
class PackageBodyPrivateMethod extends CodeObjectBase {
}
exports.PackageBodyPrivateMethod = PackageBodyPrivateMethod;
class TableViewColumn {
}
exports.TableViewColumn = TableViewColumn;
class TableConstraint {
}
exports.TableConstraint = TableConstraint;
class TableIndex {
}
exports.TableIndex = TableIndex;
class TableViewTrigger extends CodeObjectBase {
}
exports.TableViewTrigger = TableViewTrigger;
class Sequence extends DatabaseObject {
}
exports.Sequence = Sequence;
class Synonym extends DatabaseObject {
}
exports.Synonym = Synonym;
class User extends DatabaseObject {
}
exports.User = User;
var CodeObjectStatus;
(function (CodeObjectStatus) {
    CodeObjectStatus[CodeObjectStatus["None"] = 0] = "None";
    CodeObjectStatus[CodeObjectStatus["Valid"] = 1] = "Valid";
    CodeObjectStatus[CodeObjectStatus["Invalid"] = 2] = "Invalid";
    CodeObjectStatus[CodeObjectStatus["ValidCompiledDebug"] = 3] = "ValidCompiledDebug";
    CodeObjectStatus[CodeObjectStatus["InvalidCompiledDebug"] = 4] = "InvalidCompiledDebug";
})(CodeObjectStatus = exports.CodeObjectStatus || (exports.CodeObjectStatus = {}));
