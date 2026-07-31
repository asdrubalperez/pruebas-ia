"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const index_1 = require("./index");
(0, node_test_1.test)("Caso 1 - Cálculo estándar con porcentaje entero", () => {
    const result = (0, index_1.calculateTip)(10.0, 15);
    strict_1.default.equal(result.propina, 1.5);
    strict_1.default.equal(result.total, 11.5);
});
(0, node_test_1.test)("Caso 2 - Precisión exacta en caso propenso a error de punto flotante", () => {
    const result = (0, index_1.calculateTip)(19.99, 18);
    strict_1.default.equal(result.propina, 3.6);
    strict_1.default.equal(result.total, 23.59);
});
(0, node_test_1.test)("Caso 3 - Porcentaje cero", () => {
    const result = (0, index_1.calculateTip)(50.0, 0);
    strict_1.default.equal(result.propina, 0.0);
    strict_1.default.equal(result.total, 50.0);
});
(0, node_test_1.test)("Caso 4 - Monto cero", () => {
    const result = (0, index_1.calculateTip)(0, 20);
    strict_1.default.equal(result.propina, 0.0);
    strict_1.default.equal(result.total, 0.0);
});
(0, node_test_1.test)("Caso 5 - Entrada inválida (monto negativo)", () => {
    strict_1.default.throws(() => (0, index_1.calculateTip)(-5, 10));
});
