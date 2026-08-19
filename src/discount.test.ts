import assert from "node:assert/strict";
import test from "node:test";

import { applyDiscountWithCap, applyVolumeDiscount } from "./discount.js";

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

test("applies volume thresholds when the cap is not restrictive", () => {
  assert.deepEqual(
    [
      applyDiscountWithCap(100, 9, 100),
      applyDiscountWithCap(100, 10, 100),
      applyDiscountWithCap(100, 49, 100),
      applyDiscountWithCap(100, 50, 100),
    ],
    [
      { discountAmount: 0, total: 100 },
      { discountAmount: 5, total: 95 },
      { discountAmount: 5, total: 95 },
      { discountAmount: 10, total: 90 },
    ],
  );
});

test("limits a nominal discount that exceeds the cap", () => {
  assert.deepEqual(applyDiscountWithCap(1000, 50, 60), {
    discountAmount: 60,
    total: 940,
  });
});

test("preserves a nominal discount equal to the cap", () => {
  assert.deepEqual(applyDiscountWithCap(1000, 50, 100), {
    discountAmount: 100,
    total: 900,
  });
});

test("preserves the unrounded discount and rounds the capped total once", () => {
  assert.deepEqual(applyDiscountWithCap(10.05, 10, 1), {
    discountAmount: 0.5025,
    total: 9.55,
  });
});

test("rejects invalid amounts and unit quantities before returning a result", () => {
  const invalidCalls = [
    () => applyDiscountWithCap(-1, 10, 100),
    () => applyDiscountWithCap("100" as unknown as number, 10, 100),
    () => applyDiscountWithCap(100, -1, 100),
    () => applyDiscountWithCap(100, "10" as unknown as number, 100),
  ];

  for (const invalidCall of invalidCalls) {
    assert.throws(invalidCall, Error);
  }
});
