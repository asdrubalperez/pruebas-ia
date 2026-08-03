import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTip } from './calculateTip';

test('caso típico porcentaje entero: calculateTip(100, 15)', () => {
  const resultado = calculateTip(100, 15);
  assert.deepEqual(resultado, { propina: 15.0, total: 115.0 });
  assert.equal(resultado.propina, 15);
  assert.equal(resultado.total, 115);
});

test('monto con decimales: calculateTip(45.50, 10)', () => {
  assert.deepEqual(calculateTip(45.5, 10), { propina: 4.55, total: 50.05 });
});

test('redondeo half-up con intermedio >2 decimales: calculateTip(33.33, 18)', () => {
  // 33.33 * 18 / 100 = 5.9994 → propina 6.00
  // 33.33 + 5.9994 = 39.3294 → total 39.33
  assert.deepEqual(calculateTip(33.33, 18), { propina: 6.0, total: 39.33 });
});

test('porcentaje cero: calculateTip(50, 0)', () => {
  assert.deepEqual(calculateTip(50, 0), { propina: 0.0, total: 50.0 });
});

test('entradas inválidas lanzan Error descriptivo (assert.throws)', () => {
  assert.throws(() => calculateTip(-10, 15), /monto/);
  assert.throws(() => calculateTip(100, -5), /porcentaje/);
  assert.throws(() => calculateTip('abc' as any, 15), /monto/);
  assert.throws(() => calculateTip(NaN, 15), /monto/);
});

test('entradas inválidas nunca retornan NaN ni objeto', () => {
  const entradasInvalidas: Array<[unknown, unknown]> = [
    [-10, 15],
    [100, -5],
    ['abc', 15],
    [NaN, 15],
  ];

  for (const [monto, porcentaje] of entradasInvalidas) {
    let retorno: unknown;
    let lanzoError = false;
    try {
      retorno = calculateTip(monto as number, porcentaje as number);
    } catch {
      lanzoError = true;
    }
    assert.equal(lanzoError, true);
    assert.equal(retorno, undefined);
  }
});
