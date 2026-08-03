import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSplitTip } from './splitTip';

test('Escenario 1: Reparto exacto sin remanente', () => {
  // calculateSplitTip(100, 10, 2)
  // totalAPagar = 100 + (100 * 10 / 100) = 100 + 10 = 110.00
  // 110.00 / 2 = 55.00 cada uno
  // Suma = 55.00 + 55.00 = 110.00 ✓
  const result = calculateSplitTip(100, 10, 2);
  assert.deepEqual(result, [55.00, 55.00]);
  const suma = result.reduce((a, b) => a + b, 0);
  assert.strictEqual(suma, 110.00);
});

test('Escenario 2: Reparto con centavos remanentes', () => {
  // calculateSplitTip(100, 10, 3)
  // totalAPagar = 100 + (100 * 10 / 100) = 100 + 10 = 110.00
  // 110.00 = 11000 centavos
  // 11000 / 3 = 3666 centavos base, remanente = 11000 - 3666*3 = 11000 - 10998 = 2 centavos
  // Índice 0: 3666 + 1 = 3667 centavos = 36.67
  // Índice 1: 3666 + 1 = 3667 centavos = 36.67
  // Índice 2: 3666 centavos = 36.66
  // Suma = 36.67 + 36.67 + 36.66 = 110.00 ✓
  const result = calculateSplitTip(100, 10, 3);
  assert.deepEqual(result, [36.67, 36.67, 36.66]);
  const suma = result.reduce((a, b) => a + b, 0);
  assert.strictEqual(suma, 110.00);
});

test('Escenario 3: Caso límite un comensal', () => {
  // calculateSplitTip(50, 15, 1)
  // totalAPagar = 50 + (50 * 15 / 100) = 50 + 7.5 = 57.50
  // 57.50 / 1 = 57.50
  const result = calculateSplitTip(50, 15, 1);
  assert.deepEqual(result, [57.50]);
});

test('Escenario 4a: Comensales inválido (cero)', () => {
  // calculateSplitTip(100, 10, 0) debe lanzar Error
  assert.throws(() => {
    calculateSplitTip(100, 10, 0);
  }, Error);
});

test('Escenario 4b: Comensales inválido (no entero)', () => {
  // calculateSplitTip(100, 10, 2.5) debe lanzar Error
  assert.throws(() => {
    calculateSplitTip(100, 10, 2.5);
  }, Error);
});

test('Escenario 5: Monto negativo', () => {
  // calculateSplitTip(-10, 10, 2) debe lanzar Error
  assert.throws(() => {
    calculateSplitTip(-10, 10, 2);
  }, Error);
});
