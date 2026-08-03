"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const splitTip_1 = require("./splitTip");
(0, node_test_1.test)('Escenario 1: Reparto exacto sin remanente', () => {
    // calculateSplitTip(100, 10, 2)
    // totalAPagar = 100 + (100 * 10 / 100) = 100 + 10 = 110.00
    // 110.00 / 2 = 55.00 cada uno
    // Suma = 55.00 + 55.00 = 110.00 ✓
    const result = (0, splitTip_1.calculateSplitTip)(100, 10, 2);
    strict_1.default.deepEqual(result, [55.00, 55.00]);
    const suma = result.reduce((a, b) => a + b, 0);
    strict_1.default.strictEqual(suma, 110.00);
});
(0, node_test_1.test)('Escenario 2: Reparto con centavos remanentes', () => {
    // calculateSplitTip(100, 10, 3)
    // totalAPagar = 100 + (100 * 10 / 100) = 100 + 10 = 110.00
    // 110.00 = 11000 centavos
    // 11000 / 3 = 3666 centavos base, remanente = 11000 - 3666*3 = 11000 - 10998 = 2 centavos
    // Índice 0: 3666 + 1 = 3667 centavos = 36.67
    // Índice 1: 3666 + 1 = 3667 centavos = 36.67
    // Índice 2: 3666 centavos = 36.66
    // Suma = 36.67 + 36.67 + 36.66 = 110.00 ✓
    const result = (0, splitTip_1.calculateSplitTip)(100, 10, 3);
    strict_1.default.deepEqual(result, [36.67, 36.67, 36.66]);
    const suma = result.reduce((a, b) => a + b, 0);
    strict_1.default.strictEqual(suma, 110.00);
});
(0, node_test_1.test)('Escenario 3: Caso límite un comensal', () => {
    // calculateSplitTip(50, 15, 1)
    // totalAPagar = 50 + (50 * 15 / 100) = 50 + 7.5 = 57.50
    // 57.50 / 1 = 57.50
    const result = (0, splitTip_1.calculateSplitTip)(50, 15, 1);
    strict_1.default.deepEqual(result, [57.50]);
});
(0, node_test_1.test)('Escenario 4a: Comensales inválido (cero)', () => {
    // calculateSplitTip(100, 10, 0) debe lanzar Error
    strict_1.default.throws(() => {
        (0, splitTip_1.calculateSplitTip)(100, 10, 0);
    }, Error);
});
(0, node_test_1.test)('Escenario 4b: Comensales inválido (no entero)', () => {
    // calculateSplitTip(100, 10, 2.5) debe lanzar Error
    strict_1.default.throws(() => {
        (0, splitTip_1.calculateSplitTip)(100, 10, 2.5);
    }, Error);
});
(0, node_test_1.test)('Escenario 5: Monto negativo', () => {
    // calculateSplitTip(-10, 10, 2) debe lanzar Error
    strict_1.default.throws(() => {
        (0, splitTip_1.calculateSplitTip)(-10, 10, 2);
    }, Error);
});
