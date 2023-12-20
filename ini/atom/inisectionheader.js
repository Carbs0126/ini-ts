"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INISectionHeader = void 0;
const iniutil_1 = __importDefault(require("../util/iniutil"));
class INISectionHeader {
    constructor(sectionName, iniPosition) {
        this.sectionName = sectionName;
        this.iniPosition = iniPosition;
    }
    getPosition() {
        return this.iniPosition;
    }
    toINIOutputString() {
        if (iniutil_1.default.checkStringEmpty(this.sectionName)) {
            throw new Error("Key of INISectionHeader should not be empty");
        }
        return this.sectionName;
    }
}
exports.INISectionHeader = INISectionHeader;
