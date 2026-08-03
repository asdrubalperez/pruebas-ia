"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTip = calculateTip;
// Redondeo determinista half-up a 2 decimales.
// Se suma Number.EPSILON para evitar que errores de representación binaria
// (ej. 3.335 almacenado como 3.33499...) empujen el tercer decimal por
// debajo del umbral half-up.
function redondearDosDecimales(valor) {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
}
// Función pura: mismas entradas producen siempre las mismas salidas, sin
// efectos secundarios, persistencia ni UI.
// propina = monto * (porcentaje / 100), redondeada a 2 decimales.
// total = monto + propina (ya redondeada), redondeado a 2 decimales.
function calculateTip(monto, porcentaje) {
    const propina = redondearDosDecimales(monto * (porcentaje / 100));
    const total = redondearDosDecimales(monto + propina);
    return { propina, total };
}
