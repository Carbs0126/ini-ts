"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INISectionObject = void 0;
const iniutil_1 = __importDefault(require("../util/iniutil"));
class INISectionObject {
    constructor() {
        this.iniSectionHeader = null;
        this.comments = new Array();
        this.entryObjects = new Array();
    }
    addComment(iniComment) {
        if (iniutil_1.default.checkObjectNull(this.comments)) {
            this.comments = new Array();
        }
        this.comments.push(iniComment);
    }
    addComments(comments) {
        if (iniutil_1.default.checkArrayEmpty(comments)) {
            return;
        }
        if (iniutil_1.default.checkArrayNull(this.comments)) {
            this.comments = new Array();
        }
        comments.forEach((item, index) => {
            this.comments.push(item);
        });
    }
    getComments() {
        return this.comments;
    }
    addEntryObject(entryObject) {
        if (iniutil_1.default.checkArrayNull(this.entryObjects)) {
            this.entryObjects = new Array();
        }
        this.entryObjects.push(entryObject);
    }
    getName() {
        if (this.iniSectionHeader === null) {
            return null;
        }
        return this.iniSectionHeader.sectionName;
    }
    setSectionHeader(sectionHeader) {
        this.iniSectionHeader = sectionHeader;
    }
    getSectionHeader() {
        return this.iniSectionHeader;
    }
    generateContentLines() {
        let lines = new Array();
        if (!iniutil_1.default.checkArrayNull(this.comments)) {
            this.comments.forEach((item, index) => {
                lines.push(item);
            });
        }
        if (!iniutil_1.default.checkObjectNull(this.iniSectionHeader)) {
            lines.push(this.iniSectionHeader);
        }
        if (!iniutil_1.default.checkArrayNull(this.entryObjects)) {
            this.entryObjects.forEach((iniEntryObject) => {
                if (iniEntryObject !== null) {
                    let entryLines = iniEntryObject.generateContentLines();
                    if (entryLines !== null && entryLines.length > 0) {
                        entryLines.forEach((item, index) => {
                            lines.push(item);
                        });
                    }
                }
            });
        }
        return lines;
    }
}
exports.INISectionObject = INISectionObject;
