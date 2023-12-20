import { INIObject } from "./entity/iniobject";
import util from "./util/iniutil";
const fs = require("fs");

class INIFileGenerator {
    static async generateFileFromINIObject(
        iniObject: INIObject,
        fileAbsolutePath: string
    ): Promise<number> {
        if (util.checkObjectNull(iniObject)) {
            throw new Error("IniObject should not be null");
        }
        let lines = iniObject.generateStringLines();
        if (util.checkArrayEmpty(lines)) {
            return -1;
        }
        return await INIFileGenerator.writeFile(lines, fileAbsolutePath);
    }

    static async writeFile(lines: Array<string>, fileAbsolutePath: string) {
        const writeStream = fs.createWriteStream(fileAbsolutePath);
        let linesMaxIndex = lines.length - 1;
        lines.forEach((line, index) => {
            if (index < linesMaxIndex) {
                writeStream.write(line + "\n");
            } else {
                writeStream.write(line);
            }
        });

        writeStream.end();
        writeStream.on("finish", () => {});
        writeStream.on("error", (err: Error) => {
            console.error(
                "Error occurred when writing data into ini file.",
                err
            );
        });
        return 0;
    }
}

export { INIFileGenerator };
