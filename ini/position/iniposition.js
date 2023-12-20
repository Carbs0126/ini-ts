"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INIPosition = void 0;
class INIPosition {
    constructor(fileLocation, lineNumber, charBegin, charEnd) {
        this.fileLocation = fileLocation;
        this.lineNumber = lineNumber;
        this.charBegin = charBegin;
        this.charEnd = charEnd;
    }
}
exports.INIPosition = INIPosition;
