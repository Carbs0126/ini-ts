import { INIPosition } from "../../position/iniposition";

interface IINIContent {
    getPosition: () => INIPosition;
    toINIOutputString: () => string;
}

export { IINIContent };
