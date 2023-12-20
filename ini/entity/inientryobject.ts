import { INIComment } from "../atom/inicomment";
import { INIKVPair } from "../atom/inikvpair";
import util from "../util/iniutil";

class INIEntryObject {
    comments: Array<INIComment>;
    inikvPair: INIKVPair | null;
    constructor() {
        this.comments = new Array();
        this.inikvPair = null;
    }

    setKVPair(inikvPair: INIKVPair) {
        this.inikvPair = inikvPair;
    }

    getKVPair(): INIKVPair | null {
        return this.inikvPair;
    }

    addComments(comments: Array<INIComment>) {
        if (util.checkArrayEmpty(comments)) {
            return;
        }
        if (util.checkArrayNull(this.comments)) {
            this.comments = comments;
        }
        comments.forEach((item, index) => {
            this.comments.push(item);
        });
    }

    addComment(comment: INIComment) {
        if (util.checkObjectNull(comment)) {
            return;
        }
        if (util.checkArrayNull(this.comments)) {
            this.comments = new Array();
        }
        this.comments.push(comment);
    }

    getComments(): Array<INIComment> {
        return this.comments;
    }

    generateContentLines() {
        let lines = new Array();
        if (!util.checkArrayEmpty(this.comments)) {
            this.comments.forEach((item, index) => {
                lines.push(item);
            });
        }
        if (!util.checkObjectNull(this.inikvPair)) {
            lines.push(this.inikvPair);
        }
        return lines;
    }
}

export { INIEntryObject };
