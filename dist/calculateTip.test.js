"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const calculateTip_1 = require("./calculateTip");
(0, node_test_1.test)('caso típico porcentaje entero: calculateTip(100, 15)', () => {
    const resultado = (0, calculateTip_1.calculateTip)(100, 15);
    strict_1.default.deepEqual(resultado, { propina: 15.0, total: 115.0 });
    strict_1.default.equal(resultado.propina, 15);
    strict_1.default.equal(resultado.total, 115);
});
(0, node_test_1.test)('monto con decimales: calculateTip(45.50, 10)', () => {
    strict_1.default.deepEqual((0, calculateTip_1.calculateTip)(45.5, 10), { propina: 4.55, total: 50.05 });
});
(0, node_test_1.test)('redondeo half-up con intermedio >2 decimales: calculateTip(33.33, 18)', () => {
    // 33.33 * 18 / 100 = 5.9994 → propina 6.00
    // 33.33 + 5.9994 = 39.3294 → total 39.33
    strict_1.default.deepEqual((0, calculateTip_1.calculateTip)(33.33, 18), { propina: 6.0, total: 39.33 });
});
(0, node_test_1.test)('porcentaje cero: calculateTip(50, 0)', () => {
    strict_1.default.deepEqual((0, calculateTip_1.calculateTip)(50, 0), { propina: 0.0, total: 50.0 });
});
(0, node_test_1.test)('entradas inválidas lanzan Error descriptivo (assert.throws)', () => {
    strict_1.default.throws(() => (0, calculateTip_1.calculateTip)(-10, 15), /monto/);
    strict_1.default.throws(() => (0, calculateTip_1.calculateTip)(100, -5), /porcentaje/);
    strict_1.default.throws(() => (0, calculateTip_1.calculateTip)('abc', 15), /monto/);
    strict_1.default.throws(() => (0, calculateTip_1.calculateTip)(NaN, 15), /monto/);
});
(0, node_test_1.test)('entradas inválidas nunca retornan NaN ni objeto', () => {
    const entradasInvalidas = [
        [-10, 15],
        [100, -5],
        ['abc', 15],
        [NaN, 15],
    ];
    for (const [monto, porcentaje] of entradasInvalidas) {
        let retorno;
        let lanzoError = false;
        try {
            retorno = (0, calculateTip_1.calculateTip)(monto, porcentaje);
        }
        catch {
            lanzoError = true;
        }
        strict_1.default.equal(lanzoError, true);
        strict_1.default.equal(retorno, undefined);
    }
});
