const fs = require("fs");
const readline = require("readline");
const events = require("events");

import { INIComment } from "./atom/inicomment";
import { INIPosition } from "./position/iniposition";
import { INISectionHeader } from "./atom/inisectionheader";
import { INIEmpty } from "./atom/iniempty";
import { INIKVPair } from "./atom/inikvpair";
import { INIObject } from "./entity/iniobject";
import { INISectionObject } from "./entity/inisectionobject";
import { INIEntryObject } from "./entity/inientryobject";
import { IINIContent } from "./atom/interfaces/iinicontent";
import util from "./util/iniutil";

enum XXX {
    red,
}

let m: XXX = XXX.red;

class INIFileParser {
    static async parseFileToINIObject(
        iniFile: string
    ): Promise<INIObject | null> {
        let content = new Array<string>();
        try {
            const rl = readline.createInterface({
                input: fs.createReadStream(iniFile),
                crlfDelay: Infinity,
            });
            rl.on("line", (line: string) => {
                content.push(line);
            });
            await events.once(rl, "close");
        } catch (err) {
            console.error(err);
            return null;
        }

        let iniLines = new Array();
        let lineNumber = 0;
        let fileName = iniFile;

        for (let item of content) {
            let originLine = util.checkObjectNull(item) ? "" : item;
            let trimmedLine = originLine.trim();
            if (trimmedLine.startsWith(";")) {
                // comment
                let iniComment = new INIComment(
                    originLine,
                    new INIPosition(fileName, lineNumber, 0, originLine.length)
                );
                INIFileParser.appendLineContentIntoLineList(
                    iniComment,
                    iniLines
                );
            } else if (trimmedLine.startsWith("[")) {
                // section header
                let rightSquareBracketsPosition = trimmedLine.indexOf("]");
                if (rightSquareBracketsPosition < 2) {
                    throw new Error(
                        "Right square bracket's position should be greater than 1, now it is " +
                            rightSquareBracketsPosition
                    );
                }
                let sectionName = trimmedLine.substr(
                    0,
                    rightSquareBracketsPosition + 1
                );
                if (sectionName.indexOf(";") > -1) {
                    throw new Error(
                        "Section's name should not contain ';' symbol"
                    );
                }
                let charBegin = originLine.indexOf("[");
                let charEnd = originLine.indexOf("]");
                let sectionHeader = new INISectionHeader(
                    sectionName,
                    new INIPosition(fileName, lineNumber, charBegin, charEnd)
                );
                INIFileParser.appendLineContentIntoLineList(
                    sectionHeader,
                    iniLines
                );
                INIFileParser.checkSemicolon(
                    originLine,
                    charEnd + 1,
                    iniLines,
                    fileName,
                    lineNumber
                );
            } else if (trimmedLine.length == 0) {
                let iniEmpty = new INIEmpty(
                    new INIPosition(fileName, lineNumber, 0, 0)
                );
                INIFileParser.appendLineContentIntoLineList(iniEmpty, iniLines);
            } else {
                // kv
                let indexOfEqualInTrimmedString = trimmedLine.indexOf("=");
                if (indexOfEqualInTrimmedString < 1) {
                    throw new Error(
                        "Equal's position should be greater than 0"
                    );
                }
                let indexOfEqualInOriginString = originLine.indexOf("=");
                let keyName = trimmedLine
                    .substr(0, indexOfEqualInTrimmedString)
                    .trim();
                let rightStringOfEqual = trimmedLine.substr(
                    indexOfEqualInTrimmedString + 1
                );
                let valueNameSB = new util.StringBuilder();
                let length = rightStringOfEqual.length;

                if (length > 0) {
                    // 0: 过滤前面的空格，还未找到value
                    // 1: 正在记录value
                    // 2: value结束
                    let stat = 0;
                    let i = 0;
                    for (; i < length; i++) {
                        let c = rightStringOfEqual.charAt(i);
                        if (stat == 0) {
                            // 过滤前面的空格
                            if (c == " " || c == "\t") {
                                continue;
                            } else {
                                stat = 1;
                                valueNameSB.append(c);
                            }
                        } else if (stat == 1) {
                            // 正在记录value
                            // value中允许有空格
                            if (c == ";") {
                                // 记录 value 结束
                                stat = 2;
                                break;
                            } else {
                                stat = 1;
                                valueNameSB.append(c);
                            }
                        }
                    }
                    let valueName = valueNameSB.toString();
                    let charBegin = originLine.indexOf(keyName);
                    let charEnd = indexOfEqualInOriginString + 1 + i;
                    let inikvPair = new INIKVPair(
                        keyName,
                        valueName,
                        new INIPosition(
                            fileName,
                            lineNumber,
                            charBegin,
                            charEnd
                        )
                    );
                    INIFileParser.appendLineContentIntoLineList(
                        inikvPair,
                        iniLines
                    );
                    if (i != length) {
                        // 没有到结尾，检测是不是有分号
                        INIFileParser.checkSemicolon(
                            originLine,
                            indexOfEqualInOriginString + 1 + i,
                            iniLines,
                            fileName,
                            lineNumber
                        );
                    }
                }
            }
            lineNumber++;
        }
        // 最终解析为一个实体
        let iniObject = new INIObject();
        // 收集 section 或者 kv 的 comments
        let commentsCache = new Array();
        // 解析完当前的 section ，一次存入
        let currentSectionObject = null;
        // 解析当前的 kvPair
        let currentEntryObject = null;

        // 0 解析 section 阶段，还没有解析到 section
        // 1 已经解析出 sectionName 阶段，(刚刚解析完 sectionHeader ) 还没有解析到下一个 section

        let parseState = 0;
        let preINIContent = null;
        let curINIContent = null;

        for (let iniContent of iniLines) {
            if (iniContent instanceof INIEmpty) {
                continue;
            }
            curINIContent = iniContent;

            if (curINIContent instanceof INIComment) {
                let iniComment = curINIContent;
                if (parseState == 0) {
                    // 还没解析到 section
                    commentsCache.push(iniComment);
                } else {
                    if (preINIContent instanceof INISectionHeader) {
                        if (
                            INIFileParser.checkSameLine(
                                preINIContent,
                                curINIContent
                            )
                        ) {
                            // 当前 comment 属于 section
                            commentsCache.push(iniComment);
                            if (currentSectionObject == null) {
                                currentSectionObject = new INISectionObject();
                            }
                            currentSectionObject.addComments(commentsCache);
                            util.clearArray(commentsCache);
                        } else {
                            // 当前 comment 属于当前 section 的 kv 或者下一个 section 的 section
                            if (currentSectionObject == null) {
                                currentSectionObject = new INISectionObject();
                            }
                            currentSectionObject.addComments(commentsCache);
                            util.clearArray(commentsCache);
                            commentsCache.push(iniComment);
                        }
                    } else if (preINIContent instanceof INIComment) {
                        // comment 累加
                        commentsCache.push(iniComment);
                    } else if (preINIContent instanceof INIKVPair) {
                        if (
                            INIFileParser.checkSameLine(
                                preINIContent,
                                curINIContent
                            )
                        ) {
                            // 当前 comment 属于 kv
                            commentsCache.push(iniComment);
                            if (currentEntryObject == null) {
                                // 不走这里
                                currentEntryObject = new INIEntryObject();
                            }
                            currentEntryObject.addComments(commentsCache);
                            if (currentSectionObject == null) {
                                currentSectionObject = new INISectionObject();
                            }
                            currentSectionObject.addEntryObject(
                                currentEntryObject
                            );
                            currentEntryObject = null;
                            util.clearArray(commentsCache);
                            // 当前 kv 收尾
                        } else {
                            // 当前 comment 属于当前 section 的下一个 kv 或者下一个 section 的 section
                            util.clearArray(commentsCache);
                            commentsCache.push(iniComment);
                        }
                    }
                }
            } else if (curINIContent instanceof INISectionHeader) {
                let iniSectionHeader = curINIContent;
                if (parseState == 0) {
                    // 解析到第一个 section
                    parseState = 1;
                    currentSectionObject = new INISectionObject();
                    currentSectionObject.setSectionHeader(iniSectionHeader);
                } else {
                    if (preINIContent instanceof INISectionHeader) {
                        // 连着两个 section header
                        // 收尾上一个 section header
                        if (currentSectionObject != null) {
                            currentSectionObject.addComments(commentsCache);
                            util.clearArray(commentsCache);
                            iniObject.addSection(currentSectionObject);
                        }
                        // 新建 section header
                        currentSectionObject = new INISectionObject();
                        currentSectionObject.setSectionHeader(iniSectionHeader);
                    } else if (preINIContent instanceof INIComment) {
                        if (commentsCache.length == 0) {
                            // 说明上一个 comment 和其之前的元素是一行，需要收尾上一个 section
                            if (currentSectionObject != null) {
                                iniObject.addSection(currentSectionObject);
                            }
                            currentSectionObject = new INISectionObject();
                            currentSectionObject.setSectionHeader(
                                iniSectionHeader
                            );
                        } else {
                            currentSectionObject = new INISectionObject();
                            currentSectionObject.setSectionHeader(
                                iniSectionHeader
                            );
                            currentSectionObject.addComments(commentsCache);
                            util.clearArray(commentsCache);
                        }
                    } else if (preINIContent instanceof INIKVPair) {
                        // 说明上一个 section 结束了，需要收尾
                        if (currentSectionObject != null) {
                            if (currentEntryObject != null) {
                                currentSectionObject.addEntryObject(
                                    currentEntryObject
                                );
                                currentEntryObject = null;
                            }
                            iniObject.addSection(currentSectionObject);
                        }
                        currentSectionObject = new INISectionObject();
                        currentSectionObject.setSectionHeader(iniSectionHeader);
                    }
                }
            } else if (curINIContent instanceof INIKVPair) {
                let inikvPair = curINIContent;
                if (parseState == 0) {
                    // 没有 section，就出现了 kv，说明格式出错
                    throw new Error(
                        "There should be a section header before key-value pairs"
                    );
                } else {
                    if (preINIContent instanceof INISectionHeader) {
                        currentEntryObject = new INIEntryObject();
                        currentEntryObject.setKVPair(inikvPair);
                    } else if (preINIContent instanceof INIComment) {
                        if (commentsCache.length == 0) {
                            // 说明上一行中，comment 是右边的注释，还包含左边的元素
                            // 当上一行的左侧是 section 时，不需要关心 section
                            // 当上一行的左侧是 kv 时，不需要关心当前 section 或者上一个 kv
                            currentEntryObject = new INIEntryObject();
                            currentEntryObject.setKVPair(inikvPair);
                        } else {
                            currentEntryObject = new INIEntryObject();
                            currentEntryObject.setKVPair(inikvPair);
                        }
                    } else if (preINIContent instanceof INIKVPair) {
                        // 把前一个 kv 收尾到 section 中
                        if (currentEntryObject != null) {
                            currentEntryObject.addComments(commentsCache);
                            util.clearArray(commentsCache);
                            if (currentSectionObject != null) {
                                currentSectionObject.addEntryObject(
                                    currentEntryObject
                                );
                            }
                        }
                        currentEntryObject = new INIEntryObject();
                        currentEntryObject.setKVPair(inikvPair);
                    }
                }
            }
            preINIContent = curINIContent;
        }
        // 最后一个元素
        if (currentEntryObject != null) {
            currentEntryObject.addComments(commentsCache);
            util.clearArray(commentsCache);
        }
        if (currentSectionObject != null) {
            currentSectionObject.addComments(commentsCache);
            util.clearArray(commentsCache);
            if (currentEntryObject != null) {
                currentSectionObject.addEntryObject(currentEntryObject);
                currentEntryObject = null;
            }
            iniObject.addSection(currentSectionObject);
        }
        return iniObject;
    }

    static checkSameLine(
        preINIContent: IINIContent,
        curINIContent: IINIContent
    ) {
        if (
            !util.checkObjectNull(preINIContent) &&
            !util.checkObjectNull(curINIContent)
        ) {
            let prePosition = preINIContent.getPosition();
            let curPosition = curINIContent.getPosition();
            if (
                util.checkObjectNull(prePosition) ||
                util.checkObjectNull(curPosition)
            ) {
                return false;
            }
            return prePosition.lineNumber == curPosition.lineNumber;
        }
        return false;
    }

    static appendLineContentIntoLineList(
        iINIContent: IINIContent,
        iniLines: Array<IINIContent>
    ) {
        iniLines.push(iINIContent);
    }

    static checkSemicolon(
        originString: string,
        charBegin: number,
        iniLines: Array<IINIContent>,
        fileLocation: string,
        lineNumber: number
    ) {
        let remainStr = originString.substr(charBegin);
        let trimmedRemainStr = remainStr.trim();
        if (trimmedRemainStr.length > 0) {
            if (trimmedRemainStr.startsWith(";")) {
                let iniComment = new INIComment(
                    trimmedRemainStr,
                    new INIPosition(
                        fileLocation,
                        lineNumber,
                        originString.indexOf(";"),
                        originString.length
                    )
                );
                INIFileParser.appendLineContentIntoLineList(
                    iniComment,
                    iniLines
                );
                return iniComment;
            } else {
                throw new Error(
                    "Need ';' symbol, but find " +
                        trimmedRemainStr.charAt(0) +
                        " instead"
                );
            }
        }
        return null;
    }
}

export { INIFileParser };
