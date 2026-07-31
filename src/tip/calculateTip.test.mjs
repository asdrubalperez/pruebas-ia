import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTip } from './calculateTip.mjs';
import { InvalidAmountError, InvalidPercentageError } from './errors.mjs';

test('Cálculo simple con porcentaje entero', () => {
  const resultado = calculateTip(100.00, 15);
  assert.strictEqual(resultado.propina, 15.00);
  assert.strictEqual(resultado.total, 115.00);
});

test('Porcentaje 0', () => {
  const resultado = calculateTip(50.00, 0);
  assert.strictEqual(resultado.propina, 0.00);
  assert.strictEqual(resultado.total, 50.00);
  // Invariante explícito: sin propina, total === monto.
  const monto = 50.00;
  assert.strictEqual(resultado.total, monto);
});

test('Redondeo límite de medio centavo (half-up)', () => {
  const resultado = calculateTip(1.00, 12.5);
  assert.strictEqual(resultado.propina, 0.13);
  assert.strictEqual(resultado.total, 1.13);
});

test('Monto inválido lanza InvalidAmountError', () => {
  assert.throws(() => calculateTip(-5, 10), InvalidAmountError);
  assert.throws(() => calculateTip(NaN, 10), InvalidAmountError);
  assert.throws(() => calculateTip(Infinity, 10), InvalidAmountError);
});

test('Porcentaje inválido lanza InvalidPercentageError', () => {
  assert.throws(() => calculateTip(10, -1), InvalidPercentageError);
});
