import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTip } from './tip';

test('Cálculo típico: calculateTip(100, 15)', () => {
  const result = calculateTip(100, 15);
  assert.deepEqual(result, { tipAmount: 15, total: 115 });
});

test('Porcentaje cero (límite): calculateTip(50, 0)', () => {
  const result = calculateTip(50, 0);
  assert.deepEqual(result, { tipAmount: 0, total: 50 });
});

test('Redondeo ambiguo half-up: calculateTip(10.005, 10)', () => {
  const result = calculateTip(10.005, 10);
  assert.deepEqual(result, { tipAmount: 1.00, total: 11.01 });
});

test('Monto inválido: calculateTip(-5, 10) lanza Error', () => {
  assert.throws(() => {
    calculateTip(-5, 10);
  }, Error);
});

test('Porcentaje inválido: calculateTip(100, NaN) lanza Error', () => {
  assert.throws(() => {
    calculateTip(100, NaN);
  }, Error);
});
