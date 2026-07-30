import { test } from 'node:test';
import assert from 'node:assert';
import { sum } from './sum';

test('sum(2, 3) returns 5', () => {
  assert.strictEqual(sum(2, 3), 5);
});

test('sum(-2, -3) returns -5', () => {
  assert.strictEqual(sum(-2, -3), -5);
});

test('sum(1.5, 2.5) returns 4', () => {
  assert.strictEqual(sum(1.5, 2.5), 4);
});

test("sum('2', 3) throws Error without coercion", () => {
  assert.throws(() => {
    // @ts-expect-error intentionally passing a string to test strict validation
    sum('2', 3);
  }, Error);
});

test('sum(NaN, 3) throws Error even though typeof NaN === "number"', () => {
  assert.throws(() => {
    sum(NaN, 3);
  }, Error);
});
