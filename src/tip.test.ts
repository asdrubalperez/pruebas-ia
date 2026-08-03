import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTip } from './tip';

test('cálculo estándar: calculateTip(100, 10)', () => {
  assert.deepEqual(calculateTip(100, 10), { propina: 10.0, total: 110.0 });
});

test('redondeo a 2 decimales: calculateTip(33.33, 10)', () => {
  assert.deepEqual(calculateTip(33.33, 10), { propina: 3.33, total: 36.66 });
});

test('porcentaje con decimal exacto: calculateTip(100, 15.5)', () => {
  assert.deepEqual(calculateTip(100, 15.5), { propina: 15.5, total: 115.5 });
});

test('porcentaje cero (límite): calculateTip(50, 0)', () => {
  assert.deepEqual(calculateTip(50, 0), { propina: 0.0, total: 50.0 });
});

test('monto cero (límite): calculateTip(0, 20)', () => {
  assert.deepEqual(calculateTip(0, 20), { propina: 0.0, total: 0.0 });
});
