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
exports.INIFileGenerator = void 0;
const iniutil_1 = __importDefault(require("./util/iniutil"));
const fs = require("fs");
class INIFileGenerator {
    static generateFileFromINIObject(iniObject, fileAbsolutePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (iniutil_1.default.checkObjectNull(iniObject)) {
                throw new Error("IniObject should not be null");
            }
            let lines = iniObject.generateStringLines();
            if (iniutil_1.default.checkArrayEmpty(lines)) {
                return -1;
            }
            return yield INIFileGenerator.writeFile(lines, fileAbsolutePath);
        });
    }
    static writeFile(lines, fileAbsolutePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const writeStream = fs.createWriteStream(fileAbsolutePath);
            let linesMaxIndex = lines.length - 1;
            lines.forEach((line, index) => {
                if (index < linesMaxIndex) {
                    writeStream.write(line + "\n");
                }
                else {
                    writeStream.write(line);
                }
            });
            writeStream.end();
            writeStream.on("finish", () => { });
            writeStream.on("error", (err) => {
                console.error("Error occurred when writing data into ini file.", err);
            });
            return 0;
        });
    }
}
exports.INIFileGenerator = INIFileGenerator;
