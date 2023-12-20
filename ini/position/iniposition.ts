class INIPosition {
    fileLocation: string;
    lineNumber: number;
    charBegin: number;
    charEnd: number;

    constructor(
        fileLocation: string,
        lineNumber: number,
        charBegin: number,
        charEnd: number
    ) {
        this.fileLocation = fileLocation;
        this.lineNumber = lineNumber;
        this.charBegin = charBegin;
        this.charEnd = charEnd;
    }
}

export { INIPosition };
