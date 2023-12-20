"use strict";
function checkObjectNull(obj) {
    if (typeof obj === "undefined" || obj === null) {
        return true;
    }
    return false;
}
function checkArrayEmpty(arr) {
    if (typeof arr === "undefined" || arr === null || arr.length == 0) {
        return true;
    }
    return false;
}
function checkArrayNull(arr) {
    if (typeof arr === "undefined" || arr === null) {
        return true;
    }
    return false;
}
function checkStringEmpty(str) {
    if (typeof str === "undefined" || str === null || str.length == 0) {
        return true;
    }
    return false;
}
function clearArray(arr) {
    if (checkArrayEmpty(arr)) {
        return;
    }
    while (arr.length > 0) {
        arr.pop();
    }
}
class StringBuilder {
    constructor() {
        this.arr = new Array();
    }
    append(str) {
        if (checkArrayEmpty(this.arr)) {
            this.arr = new Array();
        }
        this.arr.push(str);
    }
    length() {
        if (checkArrayEmpty(this.arr)) {
            return 0;
        }
        return this.arr.length;
    }
    clear() {
        if (checkArrayEmpty(this.arr)) {
            return;
        }
        while (this.arr.length > 0) {
            this.arr.pop();
        }
    }
    toString() {
        if (checkArrayEmpty(this.arr)) {
            return "";
        }
        return this.arr.join("");
    }
}
module.exports = {
    checkObjectNull,
    checkArrayEmpty,
    checkArrayNull,
    checkStringEmpty,
    clearArray,
    StringBuilder,
};
