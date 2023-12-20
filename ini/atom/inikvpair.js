"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INIKVPair = void 0;
const iniutil_1 = __importDefault(require("../util/iniutil"));
class INIKVPair {
    constructor(key, value, iniPosition) {
        this.key = key;
        this.value = value;
        this.iniPosition = iniPosition;
    }
    getPosition() {
        return this.iniPosition;
    }
    toINIOutputString() {
        if (iniutil_1.default.checkStringEmpty(this.key)) {
            throw new Error("Key of INIEntry should not be empty");
        }
        if (iniutil_1.default.checkStringEmpty(this.value)) {
            this.value = "";
        }
        return this.key + "=" + this.value;
    }
}
exports.INIKVPair = INIKVPair;
