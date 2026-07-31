import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSplitTip } from './calculateSplitTip.mjs';

test('calculateSplitTip(90, 10, 3) devuelve { montos: [33, 33, 33], total: 99 }', () => {
  const result = calculateSplitTip(90, 10, 3);
  assert.deepStrictEqual(result, { montos: [33, 33, 33], total: 99 });
});

test('calculateSplitTip(100, 10, 3) reparte el residuo por indice ascendente', () => {
  const result = calculateSplitTip(100, 10, 3);
  assert.deepStrictEqual(result, { montos: [36.67, 36.67, 36.66], total: 110 });
});

test('calculateSplitTip(100, 10, 1) devuelve { montos: [110], total: 110 }', () => {
  const result = calculateSplitTip(100, 10, 1);
  assert.deepStrictEqual(result, { montos: [110], total: 110 });
});

test('calculateSplitTip(100, 10, 0) lanza Error por comensales invalido', () => {
  assert.throws(() => calculateSplitTip(100, 10, 0), Error);
});

test('calculateSplitTip(-5, 10, 2) lanza Error por monto negativo', () => {
  assert.throws(() => calculateSplitTip(-5, 10, 2), Error);
});
