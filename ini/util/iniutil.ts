function checkObjectNull(obj: any) {
    if (typeof obj === "undefined" || obj === null) {
        return true;
    }
    return false;
}

function checkArrayEmpty(arr: Array<any>) {
    if (typeof arr === "undefined" || arr === null || arr.length == 0) {
        return true;
    }
    return false;
}

function checkArrayNull(arr: Array<any>) {
    if (typeof arr === "undefined" || arr === null) {
        return true;
    }
    return false;
}

function checkStringEmpty(str: any | string) {
    if (typeof str === "undefined" || str === null || str.length == 0) {
        return true;
    }
    return false;
}

function clearArray(arr: Array<any>) {
    if (checkArrayEmpty(arr)) {
        return;
    }
    while (arr.length > 0) {
        arr.pop();
    }
}

class StringBuilder {
    arr: Array<any>;
    constructor() {
        this.arr = new Array();
    }

    append(str: string): void {
        if (checkArrayEmpty(this.arr)) {
            this.arr = new Array();
        }
        this.arr.push(str);
    }

    length(): number {
        if (checkArrayEmpty(this.arr)) {
            return 0;
        }
        return this.arr.length;
    }

    clear(): void {
        if (checkArrayEmpty(this.arr)) {
            return;
        }
        while (this.arr.length > 0) {
            this.arr.pop();
        }
    }

    toString(): string {
        if (checkArrayEmpty(this.arr)) {
            return "";
        }
        return this.arr.join("");
    }
}

export = {
    checkObjectNull,
    checkArrayEmpty,
    checkArrayNull,
    checkStringEmpty,
    clearArray,
    StringBuilder,
};
