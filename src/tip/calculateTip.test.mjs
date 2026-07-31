import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTip } from './calculateTip.mjs';

test('calculateTip(100, 15) devuelve { propina: 15, total: 115 }', () => {
  const result = calculateTip(100, 15);
  assert.deepStrictEqual(result, { propina: 15, total: 115 });
});

test('calculateTip(19.99, 18) devuelve { propina: 3.6, total: 23.59 }', () => {
  const result = calculateTip(19.99, 18);
  assert.strictEqual(result.propina, 3.6);
  assert.strictEqual(result.total, 23.59);
});

test('calculateTip(0, 20) devuelve { propina: 0, total: 0 }', () => {
  const result = calculateTip(0, 20);
  assert.deepStrictEqual(result, { propina: 0, total: 0 });
});

test('calculateTip(-10, 15) lanza Error por monto negativo', () => {
  assert.throws(() => calculateTip(-10, 15), Error);
});

test('calculateTip(100, NaN) lanza Error por porcentaje no finito', () => {
  assert.throws(() => calculateTip(100, NaN), Error);
});
