"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionTypes = void 0;
class QuestionTypes {
    static get input() { return "input"; }
    static get hiddenInput() { return "password"; }
    static get list() { return "list"; }
    static get confirm() { return "confirm"; }
    static get confirmWithCancel() { return "confirmWithCancel"; }
    static get checkbox() { return "checkbox"; }
    static get expand() { return "expand"; }
}
exports.QuestionTypes = QuestionTypes;
