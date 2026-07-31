import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateTip } from "./index";

test("Caso 1 - Cálculo estándar con porcentaje entero", () => {
  const result = calculateTip(10.0, 15);
  assert.equal(result.propina, 1.5);
  assert.equal(result.total, 11.5);
});

test("Caso 2 - Precisión exacta en caso propenso a error de punto flotante", () => {
  const result = calculateTip(19.99, 18);
  assert.equal(result.propina, 3.6);
  assert.equal(result.total, 23.59);
});

test("Caso 3 - Porcentaje cero", () => {
  const result = calculateTip(50.0, 0);
  assert.equal(result.propina, 0.0);
  assert.equal(result.total, 50.0);
});

test("Caso 4 - Monto cero", () => {
  const result = calculateTip(0, 20);
  assert.equal(result.propina, 0.0);
  assert.equal(result.total, 0.0);
});

test("Caso 5 - Entrada inválida (monto negativo)", () => {
  assert.throws(() => calculateTip(-5, 10));
});
