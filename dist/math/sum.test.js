"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const sum_1 = require("./sum");
(0, node_test_1.test)('sum(2, 3) returns 5', () => {
    node_assert_1.default.strictEqual((0, sum_1.sum)(2, 3), 5);
});
(0, node_test_1.test)('sum(-2, -3) returns -5', () => {
    node_assert_1.default.strictEqual((0, sum_1.sum)(-2, -3), -5);
});
(0, node_test_1.test)('sum(1.5, 2.5) returns 4', () => {
    node_assert_1.default.strictEqual((0, sum_1.sum)(1.5, 2.5), 4);
});
(0, node_test_1.test)("sum('2', 3) throws Error without coercion", () => {
    node_assert_1.default.throws(() => {
        // @ts-expect-error intentionally passing a string to test strict validation
        (0, sum_1.sum)('2', 3);
    }, Error);
});
(0, node_test_1.test)('sum(NaN, 3) throws Error even though typeof NaN === "number"', () => {
    node_assert_1.default.throws(() => {
        (0, sum_1.sum)(NaN, 3);
    }, Error);
});
