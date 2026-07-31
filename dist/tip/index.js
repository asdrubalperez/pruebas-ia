"use strict";
/**
 * Cálculo simple de propina.
 *
 * Toda la aritmética intermedia se realiza sobre enteros (centavos) para
 * evitar errores de punto flotante propios de la aritmética decimal directa.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTip = calculateTip;
function isValidNonNegativeFinite(value) {
    return Number.isFinite(value) && value >= 0;
}
/**
 * Convierte un valor entero de centavos a un número decimal con exactamente
 * 2 decimales (evitando artefactos de representación en punto flotante al
 * hacer la división final).
 */
function centsToDecimal(cents) {
    return Number((cents / 100).toFixed(2));
}
/**
 * Calcula la propina y el total a pagar dado un monto y un porcentaje.
 *
 * @param monto Monto base, debe ser un número finito >= 0.
 * @param porcentaje Porcentaje de propina, debe ser un número finito >= 0.
 * @throws Error si monto o porcentaje no son números finitos no negativos.
 */
function calculateTip(monto, porcentaje) {
    if (!isValidNonNegativeFinite(monto)) {
        throw new Error(`monto inválido: se esperaba un número finito no negativo, se recibió ${monto}`);
    }
    if (!isValidNonNegativeFinite(porcentaje)) {
        throw new Error(`porcentaje inválido: se esperaba un número finito no negativo, se recibió ${porcentaje}`);
    }
    const montoCentavos = Math.round(monto * 100);
    // Redondeo round-half-up en un único paso, sobre enteros.
    const propinaCentavos = Math.round((montoCentavos * porcentaje) / 100);
    const totalCentavos = montoCentavos + propinaCentavos;
    return {
        propina: centsToDecimal(propinaCentavos),
        total: centsToDecimal(totalCentavos),
    };
}
