"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sum = sum;
function sum(a, b) {
    if (typeof a !== 'number') {
        throw new Error(`Invalid argument 'a': expected number, got ${typeof a}`);
    }
    if (typeof b !== 'number') {
        throw new Error(`Invalid argument 'b': expected number, got ${typeof b}`);
    }
    if (Number.isNaN(a)) {
        throw new Error("Invalid argument 'a': NaN is not a valid number");
    }
    if (Number.isNaN(b)) {
        throw new Error("Invalid argument 'b': NaN is not a valid number");
    }
    return a + b;
}
