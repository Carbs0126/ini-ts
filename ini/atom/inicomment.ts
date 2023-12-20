import { INIPosition } from "../position/iniposition";
import { IINIContent } from "./interfaces/iinicontent";

class INIComment implements IINIContent {
    comment: string;
    iniPosition: INIPosition;

    constructor(comment: string, iniPosition: INIPosition) {
        this.comment = comment;
        this.iniPosition = iniPosition;
    }

    public getPosition(): INIPosition {
        return this.iniPosition;
    }

    public toINIOutputString(): string {
        return this.comment;
    }
}

export { INIComment };
