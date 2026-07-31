"use strict";
/**
 * Prorrateo de propina entre comensales.
 *
 * Reutiliza calculateTip para obtener total y propina, y reparte el total
 * (en centavos enteros) entre los comensales usando el método de mayor
 * resto: división entera + reparto de 1 centavo por comensal empezando en
 * el índice 0 hasta agotar el sobrante. Toda la aritmética intermedia se
 * realiza sobre enteros para evitar errores de punto flotante.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSplitTip = calculateSplitTip;
const index_1 = require("../tip/index");
/**
 * Convierte un valor entero de centavos a un número decimal con exactamente
 * 2 decimales (evitando artefactos de representación en punto flotante al
 * hacer la división final).
 */
function centsToDecimal(cents) {
    return Number((cents / 100).toFixed(2));
}
/**
 * Calcula el total y la propina (reutilizando calculateTip) y reparte el
 * total entre los comensales indicados.
 *
 * @param monto Monto base, validado por calculateTip.
 * @param porcentaje Porcentaje de propina, validado por calculateTip.
 * @param comensales Cantidad de comensales entre los que se reparte el
 * total, debe ser un entero >= 1.
 * @throws Error si comensales no es un entero >= 1, o el error propagado
 * por calculateTip si monto/porcentaje son inválidos.
 */
function calculateSplitTip(monto, porcentaje, comensales) {
    if (!Number.isInteger(comensales) || comensales < 1) {
        throw new Error(`comensales inválido: se esperaba un entero mayor o igual a 1, se recibió ${comensales}`);
    }
    const { total, propina } = (0, index_1.calculateTip)(monto, porcentaje);
    const totalCentavos = Math.round(total * 100);
    const baseCentavos = Math.floor(totalCentavos / comensales);
    const sobranteCentavos = totalCentavos - baseCentavos * comensales;
    const partes = [];
    for (let i = 0; i < comensales; i += 1) {
        const centavosComensal = baseCentavos + (i < sobranteCentavos ? 1 : 0);
        partes.push(centsToDecimal(centavosComensal));
    }
    return {
        total,
        propina,
        partes,
    };
}
