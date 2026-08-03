"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const tip_1 = require("./tip");
(0, node_test_1.test)('Cálculo típico: calculateTip(100, 15)', () => {
    const result = (0, tip_1.calculateTip)(100, 15);
    strict_1.default.deepEqual(result, { tipAmount: 15, total: 115 });
});
(0, node_test_1.test)('Porcentaje cero (límite): calculateTip(50, 0)', () => {
    const result = (0, tip_1.calculateTip)(50, 0);
    strict_1.default.deepEqual(result, { tipAmount: 0, total: 50 });
});
(0, node_test_1.test)('Redondeo ambiguo half-up: calculateTip(10.005, 10)', () => {
    const result = (0, tip_1.calculateTip)(10.005, 10);
    strict_1.default.deepEqual(result, { tipAmount: 1.00, total: 11.01 });
});
(0, node_test_1.test)('Monto inválido: calculateTip(-5, 10) lanza Error', () => {
    strict_1.default.throws(() => {
        (0, tip_1.calculateTip)(-5, 10);
    }, Error);
});
(0, node_test_1.test)('Porcentaje inválido: calculateTip(100, NaN) lanza Error', () => {
    strict_1.default.throws(() => {
        (0, tip_1.calculateTip)(100, NaN);
    }, Error);
});
