import { IINIContent } from "../atom/interfaces/iinicontent";
import { INISectionObject } from "./inisectionobject";
import util from "../util/iniutil";

class INIObject {
    sectionsMap: Map<string, INISectionObject>;
    orderedSectionsName: Array<string>;
    constructor() {
        this.sectionsMap = new Map();
        this.orderedSectionsName = new Array();
    }

    addSection(sectionObject: INISectionObject) {
        let name = sectionObject.getName();
        if (name === null) {
            return;
        }
        this.orderedSectionsName.push(name as string);
        this.sectionsMap.set(name as string, sectionObject);
    }

    getSection(sectionName: string): INISectionObject | null {
        if (util.checkStringEmpty(sectionName)) {
            return null;
        }
        let retSectionObject = this.sectionsMap.get(sectionName);
        if (retSectionObject === undefined) {
            return null;
        }
        return retSectionObject;
    }

    getSectionsMap(): Map<string, INISectionObject> {
        return this.sectionsMap;
    }

    getOrderedSectionsName(): Array<string> {
        return this.orderedSectionsName;
    }

    static compareINIContent(a: IINIContent, b: IINIContent) {
        if (util.checkObjectNull(a)) {
            return 1;
        }
        if (util.checkObjectNull(b)) {
            return -1;
        }

        let iniPositionA = a.getPosition();
        let iniPositionB = b.getPosition();

        // 将 position 为空的元素排到最后
        if (util.checkObjectNull(iniPositionA)) {
            return 1;
        }
        if (util.checkObjectNull(iniPositionB)) {
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
            if (
                !util.checkObjectNull(sectionName) &&
                this.sectionsMap.has(sectionName)
            ) {
                let iniSectionObject = this.sectionsMap.get(sectionName);
                if (iniSectionObject !== undefined) {
                    let oneSectionLines =
                        iniSectionObject.generateContentLines();
                    if (!util.checkArrayEmpty(oneSectionLines)) {
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
        let sbOneLine = new util.StringBuilder();
        let preLineNumber = -1;
        let curLineNumber = -1;

        for (let iiniContent of iniContentLines) {
            if (util.checkObjectNull(iiniContent)) {
                continue;
            }
            let curINIPosition = iiniContent.getPosition();
            if (util.checkObjectNull(curINIPosition)) {
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
            } else {
                sbOneLine.append(iiniContent.toINIOutputString());
            }
            preLineNumber = curLineNumber;
        }
        stringLines.push(sbOneLine.toString());
        return stringLines;
    }

    toString() {
        function replacer(key: any, value: any) {
            if (value instanceof Map) {
                return {
                    dataType: "Map",
                    value: Array.from(value.entries()),
                };
            } else {
                return value;
            }
        }
        return JSON.stringify(this, replacer, 2);
    }
}

export { INIObject };
