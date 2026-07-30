// src/split-tip.mjs
// Función pura para el reparto de una propina (y su total) entre N comensales.
// Reutiliza calculateTip de src/tip.mjs para no duplicar la lógica de redondeo
// ni la validación de monto/porcentaje.

import { calculateTip } from './tip.mjs';

/**
 * Calcula la propina y el total de un monto (delegando en calculateTip) y reparte
 * el total entre `comensales` partes expresadas en unidad monetaria con 2 decimales.
 *
 * El reparto se hace en centavos enteros (para no arrastrar error de punto flotante):
 * - totalCents = round(total * 100)
 * - base = Math.floor(totalCents / comensales)
 * - resto = totalCents % comensales
 * - las primeras `resto` partes reciben (base + 1) centavos, el resto recibe `base`
 *   centavos (método de mayor resto, asignación determinística por índice ascendente).
 *
 * Función 100% pura: sin console.log, sin I/O, sin estado mutable compartido.
 *
 * @param {number} monto - monto base, debe ser un número finito mayor a 0.
 * @param {number} porcentaje - porcentaje de propina, debe ser un número finito >= 0.
 * @param {number} comensales - cantidad de comensales, debe ser un entero finito >= 1.
 * @returns {{partes: number[], propina: number, total: number}}
 */
export function calculateSplitTip(monto, porcentaje, comensales) {
  if (typeof comensales !== 'number' || !Number.isFinite(comensales)) {
    throw new TypeError('comensales debe ser un número finito');
  }
  if (!Number.isInteger(comensales)) {
    throw new RangeError('comensales debe ser un número entero');
  }
  if (comensales < 1) {
    throw new RangeError('comensales debe ser mayor o igual a 1');
  }

  const { propina, total } = calculateTip(monto, porcentaje);

  const totalCents = Math.round(total * 100);
  const base = Math.floor(totalCents / comensales);
  const resto = totalCents % comensales;

  const partes = [];
  for (let i = 0; i < comensales; i += 1) {
    const parteCents = i < resto ? base + 1 : base;
    partes.push(parteCents / 100);
  }

  return { partes, propina, total };
}
