import { INIPosition } from "../position/iniposition";
import { IINIContent } from "./interfaces/iinicontent";
import util from "../util/iniutil";

class INIKVPair implements IINIContent {
    key: string;
    value: string;
    iniPosition: INIPosition;
    constructor(key: string, value: string, iniPosition: INIPosition) {
        this.key = key;
        this.value = value;
        this.iniPosition = iniPosition;
    }

    getPosition(): INIPosition {
        return this.iniPosition;
    }

    toINIOutputString(): string {
        if (util.checkStringEmpty(this.key)) {
            throw new Error("Key of INIEntry should not be empty");
        }
        if (util.checkStringEmpty(this.value)) {
            this.value = "";
        }
        return this.key + "=" + this.value;
    }
}

export { INIKVPair };
