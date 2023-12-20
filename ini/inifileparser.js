"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INIFileParser = void 0;
const fs = require("fs");
const readline = require("readline");
const events = require("events");
const inicomment_1 = require("./atom/inicomment");
const iniposition_1 = require("./position/iniposition");
const inisectionheader_1 = require("./atom/inisectionheader");
const iniempty_1 = require("./atom/iniempty");
const inikvpair_1 = require("./atom/inikvpair");
const iniobject_1 = require("./entity/iniobject");
const inisectionobject_1 = require("./entity/inisectionobject");
const inientryobject_1 = require("./entity/inientryobject");
const iniutil_1 = __importDefault(require("./util/iniutil"));
class INIFileParser {
    static parseFileToINIObject(iniFile) {
        return __awaiter(this, void 0, void 0, function* () {
            let content = new Array();
            try {
                const rl = readline.createInterface({
                    input: fs.createReadStream(iniFile),
                    crlfDelay: Infinity,
                });
                rl.on("line", (line) => {
                    content.push(line);
                });
                yield events.once(rl, "close");
            }
            catch (err) {
                console.error(err);
                return null;
            }
            let iniLines = new Array();
            let lineNumber = 0;
            let fileName = iniFile;
            for (let item of content) {
                let originLine = iniutil_1.default.checkObjectNull(item) ? "" : item;
                let trimmedLine = originLine.trim();
                if (trimmedLine.startsWith(";")) {
                    // comment
                    let iniComment = new inicomment_1.INIComment(originLine, new iniposition_1.INIPosition(fileName, lineNumber, 0, originLine.length));
                    INIFileParser.appendLineContentIntoLineList(iniComment, iniLines);
                }
                else if (trimmedLine.startsWith("[")) {
                    // section header
                    let rightSquareBracketsPosition = trimmedLine.indexOf("]");
                    if (rightSquareBracketsPosition < 2) {
                        throw new Error("Right square bracket's position should be greater than 1, now it is " +
                            rightSquareBracketsPosition);
                    }
                    let sectionName = trimmedLine.substr(0, rightSquareBracketsPosition + 1);
                    if (sectionName.indexOf(";") > -1) {
                        throw new Error("Section's name should not contain ';' symbol");
                    }
                    let charBegin = originLine.indexOf("[");
                    let charEnd = originLine.indexOf("]");
                    let sectionHeader = new inisectionheader_1.INISectionHeader(sectionName, new iniposition_1.INIPosition(fileName, lineNumber, charBegin, charEnd));
                    INIFileParser.appendLineContentIntoLineList(sectionHeader, iniLines);
                    INIFileParser.checkSemicolon(originLine, charEnd + 1, iniLines, fileName, lineNumber);
                }
                else if (trimmedLine.length == 0) {
                    let iniEmpty = new iniempty_1.INIEmpty(new iniposition_1.INIPosition(fileName, lineNumber, 0, 0));
                    INIFileParser.appendLineContentIntoLineList(iniEmpty, iniLines);
                }
                else {
                    // kv
                    let indexOfEqualInTrimmedString = trimmedLine.indexOf("=");
                    if (indexOfEqualInTrimmedString < 1) {
                        throw new Error("Equal's position should be greater than 0");
                    }
                    let indexOfEqualInOriginString = originLine.indexOf("=");
                    let keyName = trimmedLine
                        .substr(0, indexOfEqualInTrimmedString)
                        .trim();
                    let rightStringOfEqual = trimmedLine.substr(indexOfEqualInTrimmedString + 1);
                    let valueNameSB = new iniutil_1.default.StringBuilder();
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
                                }
                                else {
                                    stat = 1;
                                    valueNameSB.append(c);
                                }
                            }
                            else if (stat == 1) {
                                // 正在记录value
                                // value中允许有空格
                                if (c == ";") {
                                    // 记录 value 结束
                                    stat = 2;
                                    break;
                                }
                                else {
                                    stat = 1;
                                    valueNameSB.append(c);
                                }
                            }
                        }
                        let valueName = valueNameSB.toString();
                        let charBegin = originLine.indexOf(keyName);
                        let charEnd = indexOfEqualInOriginString + 1 + i;
                        let inikvPair = new inikvpair_1.INIKVPair(keyName, valueName, new iniposition_1.INIPosition(fileName, lineNumber, charBegin, charEnd));
                        INIFileParser.appendLineContentIntoLineList(inikvPair, iniLines);
                        if (i != length) {
                            // 没有到结尾，检测是不是有分号
                            INIFileParser.checkSemicolon(originLine, indexOfEqualInOriginString + 1 + i, iniLines, fileName, lineNumber);
                        }
                    }
                }
                lineNumber++;
            }
            // 最终解析为一个实体
            let iniObject = new iniobject_1.INIObject();
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
                if (iniContent instanceof iniempty_1.INIEmpty) {
                    continue;
                }
                curINIContent = iniContent;
                if (curINIContent instanceof inicomment_1.INIComment) {
                    let iniComment = curINIContent;
                    if (parseState == 0) {
                        // 还没解析到 section
                        commentsCache.push(iniComment);
                    }
                    else {
                        if (preINIContent instanceof inisectionheader_1.INISectionHeader) {
                            if (INIFileParser.checkSameLine(preINIContent, curINIContent)) {
                                // 当前 comment 属于 section
                                commentsCache.push(iniComment);
                                if (currentSectionObject == null) {
                                    currentSectionObject = new inisectionobject_1.INISectionObject();
                                }
                                currentSectionObject.addComments(commentsCache);
                                iniutil_1.default.clearArray(commentsCache);
                            }
                            else {
                                // 当前 comment 属于当前 section 的 kv 或者下一个 section 的 section
                                if (currentSectionObject == null) {
                                    currentSectionObject = new inisectionobject_1.INISectionObject();
                                }
                                currentSectionObject.addComments(commentsCache);
                                iniutil_1.default.clearArray(commentsCache);
                                commentsCache.push(iniComment);
                            }
                        }
                        else if (preINIContent instanceof inicomment_1.INIComment) {
                            // comment 累加
                            commentsCache.push(iniComment);
                        }
                        else if (preINIContent instanceof inikvpair_1.INIKVPair) {
                            if (INIFileParser.checkSameLine(preINIContent, curINIContent)) {
                                // 当前 comment 属于 kv
                                commentsCache.push(iniComment);
                                if (currentEntryObject == null) {
                                    // 不走这里
                                    currentEntryObject = new inientryobject_1.INIEntryObject();
                                }
                                currentEntryObject.addComments(commentsCache);
                                if (currentSectionObject == null) {
                                    currentSectionObject = new inisectionobject_1.INISectionObject();
                                }
                                currentSectionObject.addEntryObject(currentEntryObject);
                                currentEntryObject = null;
                                iniutil_1.default.clearArray(commentsCache);
                                // 当前 kv 收尾
                            }
                            else {
                                // 当前 comment 属于当前 section 的下一个 kv 或者下一个 section 的 section
                                iniutil_1.default.clearArray(commentsCache);
                                commentsCache.push(iniComment);
                            }
                        }
                    }
                }
                else if (curINIContent instanceof inisectionheader_1.INISectionHeader) {
                    let iniSectionHeader = curINIContent;
                    if (parseState == 0) {
                        // 解析到第一个 section
                        parseState = 1;
                        currentSectionObject = new inisectionobject_1.INISectionObject();
                        currentSectionObject.setSectionHeader(iniSectionHeader);
                    }
                    else {
                        if (preINIContent instanceof inisectionheader_1.INISectionHeader) {
                            // 连着两个 section header
                            // 收尾上一个 section header
                            if (currentSectionObject != null) {
                                currentSectionObject.addComments(commentsCache);
                                iniutil_1.default.clearArray(commentsCache);
                                iniObject.addSection(currentSectionObject);
                            }
                            // 新建 section header
                            currentSectionObject = new inisectionobject_1.INISectionObject();
                            currentSectionObject.setSectionHeader(iniSectionHeader);
                        }
                        else if (preINIContent instanceof inicomment_1.INIComment) {
                            if (commentsCache.length == 0) {
                                // 说明上一个 comment 和其之前的元素是一行，需要收尾上一个 section
                                if (currentSectionObject != null) {
                                    iniObject.addSection(currentSectionObject);
                                }
                                currentSectionObject = new inisectionobject_1.INISectionObject();
                                currentSectionObject.setSectionHeader(iniSectionHeader);
                            }
                            else {
                                currentSectionObject = new inisectionobject_1.INISectionObject();
                                currentSectionObject.setSectionHeader(iniSectionHeader);
                                currentSectionObject.addComments(commentsCache);
                                iniutil_1.default.clearArray(commentsCache);
                            }
                        }
                        else if (preINIContent instanceof inikvpair_1.INIKVPair) {
                            // 说明上一个 section 结束了，需要收尾
                            if (currentSectionObject != null) {
                                if (currentEntryObject != null) {
                                    currentSectionObject.addEntryObject(currentEntryObject);
                                    currentEntryObject = null;
                                }
                                iniObject.addSection(currentSectionObject);
                            }
                            currentSectionObject = new inisectionobject_1.INISectionObject();
                            currentSectionObject.setSectionHeader(iniSectionHeader);
                        }
                    }
                }
                else if (curINIContent instanceof inikvpair_1.INIKVPair) {
                    let inikvPair = curINIContent;
                    if (parseState == 0) {
                        // 没有 section，就出现了 kv，说明格式出错
                        throw new Error("There should be a section header before key-value pairs");
                    }
                    else {
                        if (preINIContent instanceof inisectionheader_1.INISectionHeader) {
                            currentEntryObject = new inientryobject_1.INIEntryObject();
                            currentEntryObject.setKVPair(inikvPair);
                        }
                        else if (preINIContent instanceof inicomment_1.INIComment) {
                            if (commentsCache.length == 0) {
                                // 说明上一行中，comment 是右边的注释，还包含左边的元素
                                // 当上一行的左侧是 section 时，不需要关心 section
                                // 当上一行的左侧是 kv 时，不需要关心当前 section 或者上一个 kv
                                currentEntryObject = new inientryobject_1.INIEntryObject();
                                currentEntryObject.setKVPair(inikvPair);
                            }
                            else {
                                currentEntryObject = new inientryobject_1.INIEntryObject();
                                currentEntryObject.setKVPair(inikvPair);
                            }
                        }
                        else if (preINIContent instanceof inikvpair_1.INIKVPair) {
                            // 把前一个 kv 收尾到 section 中
                            if (currentEntryObject != null) {
                                currentEntryObject.addComments(commentsCache);
                                iniutil_1.default.clearArray(commentsCache);
                                if (currentSectionObject != null) {
                                    currentSectionObject.addEntryObject(currentEntryObject);
                                }
                            }
                            currentEntryObject = new inientryobject_1.INIEntryObject();
                            currentEntryObject.setKVPair(inikvPair);
                        }
                    }
                }
                preINIContent = curINIContent;
            }
            // 最后一个元素
            if (currentEntryObject != null) {
                currentEntryObject.addComments(commentsCache);
                iniutil_1.default.clearArray(commentsCache);
            }
            if (currentSectionObject != null) {
                currentSectionObject.addComments(commentsCache);
                iniutil_1.default.clearArray(commentsCache);
                if (currentEntryObject != null) {
                    currentSectionObject.addEntryObject(currentEntryObject);
                    currentEntryObject = null;
                }
                iniObject.addSection(currentSectionObject);
            }
            return iniObject;
        });
    }
    static checkSameLine(preINIContent, curINIContent) {
        if (!iniutil_1.default.checkObjectNull(preINIContent) &&
            !iniutil_1.default.checkObjectNull(curINIContent)) {
            let prePosition = preINIContent.getPosition();
            let curPosition = curINIContent.getPosition();
            if (iniutil_1.default.checkObjectNull(prePosition) ||
                iniutil_1.default.checkObjectNull(curPosition)) {
                return false;
            }
            return prePosition.lineNumber == curPosition.lineNumber;
        }
        return false;
    }
    static appendLineContentIntoLineList(iINIContent, iniLines) {
        iniLines.push(iINIContent);
    }
    static checkSemicolon(originString, charBegin, iniLines, fileLocation, lineNumber) {
        let remainStr = originString.substr(charBegin);
        let trimmedRemainStr = remainStr.trim();
        if (trimmedRemainStr.length > 0) {
            if (trimmedRemainStr.startsWith(";")) {
                let iniComment = new inicomment_1.INIComment(trimmedRemainStr, new iniposition_1.INIPosition(fileLocation, lineNumber, originString.indexOf(";"), originString.length));
                INIFileParser.appendLineContentIntoLineList(iniComment, iniLines);
                return iniComment;
            }
            else {
                throw new Error("Need ';' symbol, but find " +
                    trimmedRemainStr.charAt(0) +
                    " instead");
            }
        }
        return null;
    }
}
exports.INIFileParser = INIFileParser;
