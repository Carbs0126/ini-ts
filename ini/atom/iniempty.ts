import { INIPosition } from "../position/iniposition";
import { IINIContent } from "./interfaces/iinicontent";

class INIEmpty implements IINIContent {
    iniPosition: INIPosition;
    constructor(iniPosition: INIPosition) {
        this.iniPosition = iniPosition;
    }

    public getPosition(): INIPosition {
        return this.iniPosition;
    }

    public toINIOutputString(): string {
        return "";
    }
}

export { INIEmpty };
