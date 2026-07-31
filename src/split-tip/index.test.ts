import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateSplitTip } from "./index";
import { calculateTip } from "../tip/index";

test("Caso 1 - Reparto exacto sin sobrante de centavos", () => {
  const result = calculateSplitTip(100, 10, 2);
  assert.equal(result.total, 110);
  assert.deepEqual(result.partes, [55, 55]);
});

test("Caso 2 - Reparto con sobrante de centavos distribuido determinísticamente", () => {
  const result = calculateSplitTip(10, 10, 3);
  assert.equal(result.total, 11);
  assert.deepEqual(result.partes, [3.67, 3.67, 3.66]);
  const sumaCentavos = Math.round(
    result.partes.reduce((acc, parte) => acc + parte, 0) * 100
  );
  assert.equal(sumaCentavos, Math.round(result.total * 100));
});

test("Caso 3 - Un solo comensal", () => {
  const result = calculateSplitTip(100, 15, 1);
  assert.deepEqual(result.partes, [115]);
  assert.equal(result.total, 115);
});

test("Caso 4 - Comensales inválido", () => {
  assert.throws(() => calculateSplitTip(100, 10, 0));
  assert.throws(() => calculateSplitTip(100, 10, 2.5));
});

test("Caso 5 - Consistencia con calculateTip", () => {
  const result = calculateSplitTip(200, 15, 4);
  const tip = calculateTip(200, 15);
  assert.equal(result.total, tip.total);
  assert.equal(result.propina, tip.propina);
});
