import { INIPosition } from "../position/iniposition";
import { IINIContent } from "./interfaces/iinicontent";
import util from "../util/iniutil";

class INISectionHeader implements IINIContent {
    sectionName: string;
    iniPosition: INIPosition;
    constructor(sectionName: string, iniPosition: INIPosition) {
        this.sectionName = sectionName;
        this.iniPosition = iniPosition;
    }

    getPosition(): INIPosition {
        return this.iniPosition;
    }

    toINIOutputString(): string {
        if (util.checkStringEmpty(this.sectionName)) {
            throw new Error("Key of INISectionHeader should not be empty");
        }
        return this.sectionName;
    }
}

export { INISectionHeader };
