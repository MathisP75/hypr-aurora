"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equals = exports.unique = void 0;
function unique(arr, f) {
    let vArr = arr;
    if (f) {
        vArr = arr.map(f);
    }
    return arr.filter((_, i) => vArr.indexOf(vArr[i]) === i);
}
exports.unique = unique;
function equals(arr1, arr2) {
    if (arr1 === null || arr2 === null) {
        return false;
    }
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (const i in arr1) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}
exports.equals = equals;
//# sourceMappingURL=array.js.map