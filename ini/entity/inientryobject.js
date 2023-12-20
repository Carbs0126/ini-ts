"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INIEntryObject = void 0;
const iniutil_1 = __importDefault(require("../util/iniutil"));
class INIEntryObject {
    constructor() {
        this.comments = new Array();
        this.inikvPair = null;
    }
    setKVPair(inikvPair) {
        this.inikvPair = inikvPair;
    }
    getKVPair() {
        return this.inikvPair;
    }
    addComments(comments) {
        if (iniutil_1.default.checkArrayEmpty(comments)) {
            return;
        }
        if (iniutil_1.default.checkArrayNull(this.comments)) {
            this.comments = comments;
        }
        comments.forEach((item, index) => {
            this.comments.push(item);
        });
    }
    addComment(comment) {
        if (iniutil_1.default.checkObjectNull(comment)) {
            return;
        }
        if (iniutil_1.default.checkArrayNull(this.comments)) {
            this.comments = new Array();
        }
        this.comments.push(comment);
    }
    getComments() {
        return this.comments;
    }
    generateContentLines() {
        let lines = new Array();
        if (!iniutil_1.default.checkArrayEmpty(this.comments)) {
            this.comments.forEach((item, index) => {
                lines.push(item);
            });
        }
        if (!iniutil_1.default.checkObjectNull(this.inikvPair)) {
            lines.push(this.inikvPair);
        }
        return lines;
    }
}
exports.INIEntryObject = INIEntryObject;
