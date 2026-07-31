"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const index_1 = require("./index");
const index_2 = require("../tip/index");
(0, node_test_1.test)("Caso 1 - Reparto exacto sin sobrante de centavos", () => {
    const result = (0, index_1.calculateSplitTip)(100, 10, 2);
    strict_1.default.equal(result.total, 110);
    strict_1.default.deepEqual(result.partes, [55, 55]);
});
(0, node_test_1.test)("Caso 2 - Reparto con sobrante de centavos distribuido determinísticamente", () => {
    const result = (0, index_1.calculateSplitTip)(10, 10, 3);
    strict_1.default.equal(result.total, 11);
    strict_1.default.deepEqual(result.partes, [3.67, 3.67, 3.66]);
    const sumaCentavos = Math.round(result.partes.reduce((acc, parte) => acc + parte, 0) * 100);
    strict_1.default.equal(sumaCentavos, Math.round(result.total * 100));
});
(0, node_test_1.test)("Caso 3 - Un solo comensal", () => {
    const result = (0, index_1.calculateSplitTip)(100, 15, 1);
    strict_1.default.deepEqual(result.partes, [115]);
    strict_1.default.equal(result.total, 115);
});
(0, node_test_1.test)("Caso 4 - Comensales inválido", () => {
    strict_1.default.throws(() => (0, index_1.calculateSplitTip)(100, 10, 0));
    strict_1.default.throws(() => (0, index_1.calculateSplitTip)(100, 10, 2.5));
});
(0, node_test_1.test)("Caso 5 - Consistencia con calculateTip", () => {
    const result = (0, index_1.calculateSplitTip)(200, 15, 4);
    const tip = (0, index_2.calculateTip)(200, 15);
    strict_1.default.equal(result.total, tip.total);
    strict_1.default.equal(result.propina, tip.propina);
});
