"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentConnectionInformation = exports.fileLogger = void 0;
const logger_1 = require("../infrastructure/logger");
exports.fileLogger = logger_1.FileStreamLogger.Instance;
class DocumentConnectionInformation {
    constructor() {
        this.isDocumentOpen = true;
    }
    get tryReconnect() {
        return false;
    }
}
exports.DocumentConnectionInformation = DocumentConnectionInformation;
