// Resultado del cálculo de propina: ambos valores en 2 decimales y
// coherentes entre sí (total usa la propina ya redondeada).
export interface ResultadoPropina {
  propina: number;
  total: number;
}

// Redondeo determinista half-up a 2 decimales.
// Se suma Number.EPSILON para evitar que errores de representación binaria
// (ej. 3.335 almacenado como 3.33499...) empujen el tercer decimal por
// debajo del umbral half-up.
function redondearDosDecimales(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

// Función pura: mismas entradas producen siempre las mismas salidas, sin
// efectos secundarios, persistencia ni UI.
// propina = monto * (porcentaje / 100), redondeada a 2 decimales.
// total = monto + propina (ya redondeada), redondeado a 2 decimales.
export function calculateTip(monto: number, porcentaje: number): ResultadoPropina {
  const propina = redondearDosDecimales(monto * (porcentaje / 100));
  const total = redondearDosDecimales(monto + propina);
  return { propina, total };
}
