"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INIObject = void 0;
const iniutil_1 = __importDefault(require("../util/iniutil"));
class INIObject {
    constructor() {
        this.sectionsMap = new Map();
        this.orderedSectionsName = new Array();
    }
    addSection(sectionObject) {
        let name = sectionObject.getName();
        if (name === null) {
            return;
        }
        this.orderedSectionsName.push(name);
        this.sectionsMap.set(name, sectionObject);
    }
    getSection(sectionName) {
        if (iniutil_1.default.checkStringEmpty(sectionName)) {
            return null;
        }
        let retSectionObject = this.sectionsMap.get(sectionName);
        if (retSectionObject === undefined) {
            return null;
        }
        return retSectionObject;
    }
    getSectionsMap() {
        return this.sectionsMap;
    }
    getOrderedSectionsName() {
        return this.orderedSectionsName;
    }
    static compareINIContent(a, b) {
        if (iniutil_1.default.checkObjectNull(a)) {
            return 1;
        }
        if (iniutil_1.default.checkObjectNull(b)) {
            return -1;
        }
        let iniPositionA = a.getPosition();
        let iniPositionB = b.getPosition();
        // 将 position 为空的元素排到最后
        if (iniutil_1.default.checkObjectNull(iniPositionA)) {
            return 1;
        }
        if (iniutil_1.default.checkObjectNull(iniPositionB)) {
            return -1;
        }
        let lineNumber = iniPositionA.lineNumber - iniPositionB.lineNumber;
        if (lineNumber != 0) {
            return lineNumber;
        }
        return iniPositionA.charBegin - iniPositionB.charBegin;
    }
    generateStringLines() {
        let iniContentLines = new Array();
        this.orderedSectionsName.forEach((sectionName) => {
            if (!iniutil_1.default.checkObjectNull(sectionName) &&
                this.sectionsMap.has(sectionName)) {
                let iniSectionObject = this.sectionsMap.get(sectionName);
                if (iniSectionObject !== undefined) {
                    let oneSectionLines = iniSectionObject.generateContentLines();
                    if (!iniutil_1.default.checkArrayEmpty(oneSectionLines)) {
                        oneSectionLines.forEach((item, index) => {
                            iniContentLines.push(item);
                        });
                    }
                }
            }
        });
        // 排序  先 line number，后 start position
        iniContentLines.sort(INIObject.compareINIContent);
        let stringLines = new Array();
        let sbOneLine = new iniutil_1.default.StringBuilder();
        let preLineNumber = -1;
        let curLineNumber = -1;
        for (let iiniContent of iniContentLines) {
            if (iniutil_1.default.checkObjectNull(iiniContent)) {
                continue;
            }
            let curINIPosition = iiniContent.getPosition();
            if (iniutil_1.default.checkObjectNull(curINIPosition)) {
                if (sbOneLine.length() > 0) {
                    stringLines.push(sbOneLine.toString());
                    sbOneLine.clear();
                }
                stringLines.push(iiniContent.toINIOutputString());
                continue;
            }
            curLineNumber = curINIPosition.lineNumber;
            if (preLineNumber != curLineNumber) {
                if (preLineNumber > -1) {
                    stringLines.push(sbOneLine.toString());
                    sbOneLine.clear();
                }
                let lineDelta = curLineNumber - preLineNumber;
                if (lineDelta > 1) {
                    // 中间有空行
                    for (let i = 0; i < lineDelta - 1; i++) {
                        stringLines.push("");
                    }
                }
                sbOneLine.append(iiniContent.toINIOutputString());
            }
            else {
                sbOneLine.append(iiniContent.toINIOutputString());
            }
            preLineNumber = curLineNumber;
        }
        stringLines.push(sbOneLine.toString());
        return stringLines;
    }
    toString() {
        function replacer(key, value) {
            if (value instanceof Map) {
                return {
                    dataType: "Map",
                    value: Array.from(value.entries()),
                };
            }
            else {
                return value;
            }
        }
        return JSON.stringify(this, replacer, 2);
    }
}
exports.INIObject = INIObject;
