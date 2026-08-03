// Resultado del cálculo de propina: propina y total, ambos con exactamente
// 2 decimales de precisión monetaria y coherentes entre sí.
export interface ResultadoPropina {
  propina: number;
  total: number;
}

// Redondeo monetario half-up a 2 decimales escalando a centavos (enteros).
// Trabajar en la escala de centavos evita arrastrar el error de representación
// IEEE 754 de la aritmética decimal nativa (p. ej. 0.1 + 0.2). Se suma
// Number.EPSILON antes de escalar para que un tercer decimal exacto de .005
// almacenado como .00499999… no caiga por debajo del umbral half-up.
function redondearACentavos(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

// Valida que un argumento numérico exista, sea del tipo correcto y finito.
// Lanza un Error descriptivo para no silenciar entradas inválidas (NaN,
// Infinity, strings, etc.) devolviendo NaN u objetos incoherentes.
function validarNumeroFinito(valor: number, nombreCampo: string): void {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new Error(
      `${nombreCampo} debe ser un número finito; se recibió: ${String(valor)}`,
    );
  }
}

// Calcula la propina y el total de una cuenta con precisión monetaria exacta.
// - propina = monto * (porcentaje / 100), redondeada half-up a 2 decimales.
// - total   = monto + propina_sin_redondeo_intermedio, redondeado half-up a
//   2 decimales sobre el acumulado final (no sobre la propina ya redondeada),
//   para no acumular error de centavos.
// Función pura: mismas entradas producen siempre las mismas salidas, sin
// efectos secundarios, persistencia ni UI.
export function calculateTip(monto: number, porcentaje: number): ResultadoPropina {
  validarNumeroFinito(monto, 'monto');
  validarNumeroFinito(porcentaje, 'porcentaje');

  if (monto <= 0) {
    throw new Error(`monto debe ser mayor a 0; se recibió: ${monto}`);
  }
  if (porcentaje < 0) {
    throw new Error(`porcentaje no puede ser negativo; se recibió: ${porcentaje}`);
  }

  const propinaSinRedondear = monto * (porcentaje / 100);
  const propina = redondearACentavos(propinaSinRedondear);
  const total = redondearACentavos(monto + propinaSinRedondear);

  return { propina, total };
}
