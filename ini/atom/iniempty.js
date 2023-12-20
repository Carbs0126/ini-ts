"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INIEmpty = void 0;
class INIEmpty {
    constructor(iniPosition) {
        this.iniPosition = iniPosition;
    }
    getPosition() {
        return this.iniPosition;
    }
    toINIOutputString() {
        return "";
    }
}
exports.INIEmpty = INIEmpty;
