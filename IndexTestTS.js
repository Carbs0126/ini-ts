"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inifileparser_1 = require("./ini/inifileparser");
const inifilegenerator_1 = require("./ini/inifilegenerator");
const path = require("path");
let iniObject = inifileparser_1.INIFileParser.parseFileToINIObject(path.resolve("test-input.ini"));
iniObject.then((resolve) => {
    if (resolve === null) {
        console.log("INIFileParser INIObject is null");
        return;
    }
    // console.log(resolve.toString());
    inifilegenerator_1.INIFileGenerator.generateFileFromINIObject(resolve, path.resolve("test-output.ini"))
        .then((resolve) => {
        console.log("INIFileGenerator Resolve:", resolve);
    })
        .catch((error) => {
        console.error("INIFileGenerator Error:", error);
    });
});
