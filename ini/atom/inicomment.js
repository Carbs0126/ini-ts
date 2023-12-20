"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INIComment = void 0;
class INIComment {
    constructor(comment, iniPosition) {
        this.comment = comment;
        this.iniPosition = iniPosition;
    }
    getPosition() {
        return this.iniPosition;
    }
    toINIOutputString() {
        return this.comment;
    }
}
exports.INIComment = INIComment;
