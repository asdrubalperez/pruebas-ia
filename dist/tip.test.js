"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const tip_1 = require("./tip");
(0, node_test_1.test)('cálculo estándar: calculateTip(100, 10)', () => {
    strict_1.default.deepEqual((0, tip_1.calculateTip)(100, 10), { propina: 10.0, total: 110.0 });
});
(0, node_test_1.test)('redondeo a 2 decimales: calculateTip(33.33, 10)', () => {
    strict_1.default.deepEqual((0, tip_1.calculateTip)(33.33, 10), { propina: 3.33, total: 36.66 });
});
(0, node_test_1.test)('porcentaje con decimal exacto: calculateTip(100, 15.5)', () => {
    strict_1.default.deepEqual((0, tip_1.calculateTip)(100, 15.5), { propina: 15.5, total: 115.5 });
});
(0, node_test_1.test)('porcentaje cero (límite): calculateTip(50, 0)', () => {
    strict_1.default.deepEqual((0, tip_1.calculateTip)(50, 0), { propina: 0.0, total: 50.0 });
});
(0, node_test_1.test)('monto cero (límite): calculateTip(0, 20)', () => {
    strict_1.default.deepEqual((0, tip_1.calculateTip)(0, 20), { propina: 0.0, total: 0.0 });
});
