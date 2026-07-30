// src/tip.mjs
// Función pura para el cálculo de propina simple.
// Fuera de alcance en esta feature: calculateSplitTip (reparto entre comensales, f2),
// persistencia, UI, multi-moneda.

/**
 * Redondea un valor expresado en centavos (puede tener decimales, p.ej. producto de un
 * porcentaje) al entero de centavos más cercano, usando la convención "half-up"
 * (0.5 siempre redondea hacia arriba, nunca hacia el par más cercano / banker's rounding).
 * Se documenta explícitamente esta decisión porque el negocio podría, en el futuro,
 * requerir banker's rounding u otro criterio, y no debe asumirse implícito.
 *
 * @param {number} valorEnCentavosDecimal
 * @returns {number} entero de centavos
 */
function roundToCents(valorEnCentavosDecimal) {
  // Los valores de entrada de este dominio (monto > 0, porcentaje >= 0) nunca son negativos,
  // por lo que Math.floor(x + 0.5) implementa correctamente el redondeo half-up.
  return Math.floor(valorEnCentavosDecimal + 0.5);
}

/**
 * Calcula la propina y el total a pagar dado un monto y un porcentaje de propina.
 * Función 100% pura: sin console.log, sin I/O, sin estado mutable compartido.
 *
 * @param {number} monto - monto base, debe ser un número finito mayor a 0.
 * @param {number} porcentaje - porcentaje de propina, debe ser un número finito >= 0.
 * @returns {{propina: number, total: number}}
 */
export function calculateTip(monto, porcentaje) {
  if (typeof monto !== 'number' || !Number.isFinite(monto)) {
    throw new TypeError('monto debe ser un número finito');
  }
  if (monto <= 0) {
    throw new RangeError('monto debe ser mayor a 0');
  }
  if (typeof porcentaje !== 'number' || !Number.isFinite(porcentaje)) {
    throw new TypeError('porcentaje debe ser un número finito');
  }
  if (porcentaje < 0) {
    throw new RangeError('porcentaje no puede ser negativo');
  }

  const montoCents = Math.round(monto * 100);
  const propinaCents = roundToCents((montoCents * porcentaje) / 100);
  const totalCents = montoCents + propinaCents;

  return {
    propina: propinaCents / 100,
    total: totalCents / 100,
  };
}
