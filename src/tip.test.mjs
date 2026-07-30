// src/tip.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTip } from './tip.mjs';

test('Cálculo estándar de propina sobre un monto exacto', () => {
  const resultado = calculateTip(50, 15);
  assert.deepEqual(resultado, { propina: 7.5, total: 57.5 });

  // Verificación explícita: propina + monto (en centavos) iguala exactamente a total,
  // sin residuos de punto flotante.
  const montoCents = Math.round(50 * 100);
  const propinaCents = Math.round(resultado.propina * 100);
  const totalCents = Math.round(resultado.total * 100);
  assert.equal(montoCents + propinaCents, totalCents);
});

test('Redondeo límite (medio centavo)', () => {
  const resultado = calculateTip(0.03, 50);
  assert.deepEqual(resultado, { propina: 0.02, total: 0.05 });
});

test('Porcentaje 0', () => {
  const resultado = calculateTip(20, 0);
  assert.deepEqual(resultado, { propina: 0, total: 20 });
});

test('Monto inválido (negativo)', () => {
  assert.throws(() => calculateTip(-5, 10), RangeError);
  let resultadoCapturado;
  try {
    resultadoCapturado = calculateTip(-5, 10);
  } catch (error) {
    assert.ok(error instanceof RangeError);
    assert.equal(resultadoCapturado, undefined);
  }
});

test('Entrada no finita', () => {
  assert.throws(() => calculateTip(NaN, 10), TypeError);
  let resultadoCapturado;
  try {
    resultadoCapturado = calculateTip(NaN, 10);
  } catch (error) {
    assert.ok(error instanceof TypeError);
    assert.equal(resultadoCapturado, undefined);
    assert.notEqual(Number.isNaN(error), true);
  }
});
