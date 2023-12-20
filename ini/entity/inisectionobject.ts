import { INIComment } from "../atom/inicomment";
import { INISectionHeader } from "../atom/inisectionheader";
import { IINIContent } from "../atom/interfaces/iinicontent";
import { INIEntryObject } from "./inientryobject";
import util from "../util/iniutil";

class INISectionObject {
    iniSectionHeader: INISectionHeader | null;
    comments: Array<INIComment>;
    entryObjects: Array<INIEntryObject>;
    constructor() {
        this.iniSectionHeader = null;
        this.comments = new Array();
        this.entryObjects = new Array();
    }

    addComment(iniComment: INIComment) {
        if (util.checkObjectNull(this.comments)) {
            this.comments = new Array();
        }
        this.comments.push(iniComment);
    }

    addComments(comments: Array<INIComment>) {
        if (util.checkArrayEmpty(comments)) {
            return;
        }
        if (util.checkArrayNull(this.comments)) {
            this.comments = new Array();
        }
        comments.forEach((item, index) => {
            this.comments.push(item);
        });
    }

    getComments(): Array<INIComment> {
        return this.comments;
    }

    addEntryObject(entryObject: INIEntryObject) {
        if (util.checkArrayNull(this.entryObjects)) {
            this.entryObjects = new Array();
        }
        this.entryObjects.push(entryObject);
    }

    getName(): string | null {
        if (this.iniSectionHeader === null) {
            return null;
        }
        return this.iniSectionHeader!.sectionName;
    }

    setSectionHeader(sectionHeader: INISectionHeader) {
        this.iniSectionHeader = sectionHeader;
    }

    getSectionHeader(): INISectionHeader | null {
        return this.iniSectionHeader;
    }

    generateContentLines() {
        let lines = new Array<IINIContent>();
        if (!util.checkArrayNull(this.comments)) {
            this.comments.forEach((item, index) => {
                lines.push(item);
            });
        }
        if (!util.checkObjectNull(this.iniSectionHeader)) {
            lines.push(this.iniSectionHeader as INISectionHeader);
        }
        if (!util.checkArrayNull(this.entryObjects)) {
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

export { INISectionObject };
