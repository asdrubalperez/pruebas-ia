function assertNonNegativeNumber(value, fieldName) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        throw new Error(`${fieldName} must be a non-negative number`);
    }
}
function roundHalfUpToTwoDecimals(value) {
    const scaledValue = value * 100;
    const floatingPointTolerance = Number.EPSILON * Math.abs(scaledValue);
    return Math.floor(scaledValue + 0.5 + floatingPointTolerance) / 100;
}
export function applyVolumeDiscount(amount, unitQuantity) {
    assertNonNegativeNumber(amount, "amount");
    assertNonNegativeNumber(unitQuantity, "unitQuantity");
    const discountRate = unitQuantity >= 50 ? 0.1 : unitQuantity >= 10 ? 0.05 : 0;
    const discountAmount = amount * discountRate;
    const total = roundHalfUpToTwoDecimals(amount - discountAmount);
    return { discountAmount, total };
}
