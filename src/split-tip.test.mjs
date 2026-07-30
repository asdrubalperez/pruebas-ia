// src/split-tip.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSplitTip } from './split-tip.mjs';

test('Reparto exacto sin resto: calculateSplitTip(30, 10, 3)', () => {
  const resultado = calculateSplitTip(30, 10, 3);
  assert.deepEqual(resultado.partes, [11.0, 11.0, 11.0]);
  assert.equal(resultado.propina, 3.0);
  assert.equal(resultado.total, 33.0);

  const sumaCentavos = resultado.partes.reduce(
    (acc, parte) => acc + Math.round(parte * 100),
    0,
  );
  assert.equal(sumaCentavos, Math.round(resultado.total * 100));
});

test('Reparto con resto de centavos: calculateSplitTip(10, 10, 3)', () => {
  const resultado = calculateSplitTip(10, 10, 3);
  assert.deepEqual(resultado.partes, [3.67, 3.67, 3.66]);
  assert.equal(resultado.propina, 1.0);
  assert.equal(resultado.total, 11.0);

  const sumaCentavos = resultado.partes.reduce(
    (acc, parte) => acc + Math.round(parte * 100),
    0,
  );
  assert.equal(sumaCentavos, 1100);
  assert.equal(sumaCentavos, Math.round(resultado.total * 100));
});

test('Comensales inválido (cero): calculateSplitTip(10, 10, 0) lanza RangeError', () => {
  assert.throws(() => calculateSplitTip(10, 10, 0), RangeError);
});

test('Comensales no entero: calculateSplitTip(10, 10, 2.5) lanza RangeError o TypeError', () => {
  assert.throws(
    () => calculateSplitTip(10, 10, 2.5),
    (err) => err instanceof RangeError || err instanceof TypeError,
  );
});

test('Comensales=1 (caso trivial): calculateSplitTip(20, 10, 1)', () => {
  const resultado = calculateSplitTip(20, 10, 1);
  assert.deepEqual(resultado.partes, [22.0]);
  assert.equal(resultado.propina, 2.0);
  assert.equal(resultado.total, 22.0);
});
