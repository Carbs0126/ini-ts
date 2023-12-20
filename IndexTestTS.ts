import { INIObject } from "./ini/entity/iniobject";
import { INIFileParser } from "./ini/inifileparser";
import { INIFileGenerator } from "./ini/inifilegenerator";

const path = require("path");

let iniObject = INIFileParser.parseFileToINIObject(
    path.resolve("test-input.ini")
);
iniObject.then((resolve: INIObject | null) => {
    if (resolve === null) {
        console.log("INIFileParser INIObject is null");
        return;
    }
    // console.log(resolve.toString());
    INIFileGenerator.generateFileFromINIObject(
        resolve,
        path.resolve("test-output.ini")
    )
        .then((resolve) => {
            console.log("INIFileGenerator Resolve:", resolve);
        })
        .catch((error) => {
            console.error("INIFileGenerator Error:", error);
        });
});
