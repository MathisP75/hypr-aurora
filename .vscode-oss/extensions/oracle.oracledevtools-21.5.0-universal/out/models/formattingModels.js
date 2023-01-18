"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatTextRequest = exports.FormatTextResponse = exports.FormatTextRequestParam = exports.FormatType = exports.FormatOptions = exports.WhiteSpaceSetting = exports.SingleLineCommentFormatType = exports.IfCaseWhileFormatType = exports.LineBreakPosition = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
const constants_1 = require("../constants/constants");
const intellisenseModels_1 = require("./intellisenseModels");
var LineBreakPosition;
(function (LineBreakPosition) {
    LineBreakPosition[LineBreakPosition["Before"] = 0] = "Before";
    LineBreakPosition[LineBreakPosition["After"] = 1] = "After";
    LineBreakPosition[LineBreakPosition["NoBreak"] = 2] = "NoBreak";
})(LineBreakPosition = exports.LineBreakPosition || (exports.LineBreakPosition = {}));
var IfCaseWhileFormatType;
(function (IfCaseWhileFormatType) {
    IfCaseWhileFormatType[IfCaseWhileFormatType["IndentedActionInlinedCondition"] = 0] = "IndentedActionInlinedCondition";
    IfCaseWhileFormatType[IfCaseWhileFormatType["Terse"] = 1] = "Terse";
    IfCaseWhileFormatType[IfCaseWhileFormatType["LineBreaksAfterConditionAndAction"] = 2] = "LineBreaksAfterConditionAndAction";
    IfCaseWhileFormatType[IfCaseWhileFormatType["IndentedConditionAndAction"] = 3] = "IndentedConditionAndAction";
})(IfCaseWhileFormatType = exports.IfCaseWhileFormatType || (exports.IfCaseWhileFormatType = {}));
var SingleLineCommentFormatType;
(function (SingleLineCommentFormatType) {
    SingleLineCommentFormatType[SingleLineCommentFormatType["KeepUnchanged"] = 0] = "KeepUnchanged";
    SingleLineCommentFormatType[SingleLineCommentFormatType["WrapMultiline"] = 1] = "WrapMultiline";
    SingleLineCommentFormatType[SingleLineCommentFormatType["WrapSingleline"] = 2] = "WrapSingleline";
})(SingleLineCommentFormatType = exports.SingleLineCommentFormatType || (exports.SingleLineCommentFormatType = {}));
var WhiteSpaceSetting;
(function (WhiteSpaceSetting) {
    WhiteSpaceSetting[WhiteSpaceSetting["Default"] = 0] = "Default";
    WhiteSpaceSetting[WhiteSpaceSetting["NoSpace"] = 1] = "NoSpace";
    WhiteSpaceSetting[WhiteSpaceSetting["AddSpace"] = 2] = "AddSpace";
    WhiteSpaceSetting[WhiteSpaceSetting["InsideBrackets"] = 3] = "InsideBrackets";
    WhiteSpaceSetting[WhiteSpaceSetting["OutsideBrackets"] = 4] = "OutsideBrackets";
})(WhiteSpaceSetting = exports.WhiteSpaceSetting || (exports.WhiteSpaceSetting = {}));
class FormatOptions {
    constructor() {
        this.identifierCasing = this.keywordCasing = intellisenseModels_1.Casing.SameAsIntellisense;
        this.lineBrkBtwnStmts = 2;
        this.lineBreakOnComma = LineBreakPosition.After;
        this.lineBreakOnConcat = LineBreakPosition.Before;
        this.lineBreakOnBooleanConn = LineBreakPosition.Before;
        this.lineBreakOnANSIJoins = true;
        this.lineBreakBeforeLineComments = false;
        this.lineBreakAfterSelectFromWhere = true;
        this.lineBreakForIfCaseWhile = IfCaseWhileFormatType.IndentedActionInlinedCondition;
        this.singleLineComments = SingleLineCommentFormatType.KeepUnchanged;
        this.wsAroundOperators = WhiteSpaceSetting.Default;
        this.wsAfterCommas = true;
        this.wsAroundParenthesis = WhiteSpaceSetting.Default;
    }
}
exports.FormatOptions = FormatOptions;
var FormatType;
(function (FormatType) {
    FormatType[FormatType["FormatDocument"] = 0] = "FormatDocument";
    FormatType[FormatType["FormatRange"] = 1] = "FormatRange";
    FormatType[FormatType["FormatOnType"] = 2] = "FormatOnType";
    FormatType[FormatType["FormatString"] = 3] = "FormatString";
})(FormatType = exports.FormatType || (exports.FormatType = {}));
class FormatTextRequestParam {
    constructor(uri, formatOptions, formatRequestType) {
        this.documentUri = uri;
        this.config = formatOptions;
        this.formatRequestType = formatRequestType;
    }
}
exports.FormatTextRequestParam = FormatTextRequestParam;
class FormatTextResponse {
}
exports.FormatTextResponse = FormatTextResponse;
class FormatTextRequest {
}
exports.FormatTextRequest = FormatTextRequest;
FormatTextRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.formatDocumentRequest);
