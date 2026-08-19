import assert from "node:assert/strict";
import test from "node:test";

import { applyVolumeDiscount } from "./discount.js";

test("applies the expected rates at every volume boundary", () => {
  const quantities = [0, 9, 10, 49, 50, 51];
  const expectedResults = [
    { discountAmount: 0, total: 100 },
    { discountAmount: 0, total: 100 },
    { discountAmount: 5, total: 95 },
    { discountAmount: 5, total: 95 },
    { discountAmount: 10, total: 90 },
    { discountAmount: 10, total: 90 },
  ];

  assert.deepEqual(
    quantities.map((quantity) => applyVolumeDiscount(100, quantity)),
    expectedResults,
  );
});

test("preserves the unrounded discount and rounds only the total half up", () => {
  assert.deepEqual(applyVolumeDiscount(0, 50), { discountAmount: 0, total: 0 });
  assert.deepEqual(applyVolumeDiscount(10.1, 10), {
    discountAmount: 0.505,
    total: 9.6,
  });
});

test("rejects negative and non-numeric inputs", () => {
  const invalidCalls = [
    () => applyVolumeDiscount(-1, 10),
    () => applyVolumeDiscount(100, -1),
    () => applyVolumeDiscount("100" as unknown as number, 10),
    () => applyVolumeDiscount(100, "10" as unknown as number),
  ];

  for (const invalidCall of invalidCalls) {
    assert.throws(invalidCall, Error);
  }
});

test("returns deterministic results without observable side effects", () => {
  const firstResult = applyVolumeDiscount(100, 50);
  const secondResult = applyVolumeDiscount(100, 50);

  assert.deepEqual(firstResult, { discountAmount: 10, total: 90 });
  assert.deepEqual(secondResult, firstResult);
  assert.notStrictEqual(secondResult, firstResult);
});
