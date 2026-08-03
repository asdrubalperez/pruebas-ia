import { calculateTip } from './tip';

// Función pura que reparte el total (monto + propina) entre N comensales.
// Retorna un array de números con 2 decimales, donde la suma es exactamente
// igual al total redondeado (sin pérdida ni sobrante de centavos).
//
// Enfoque:
// 1. Reutiliza calculateTip para obtener el total redondeado (same redondeo half-up).
// 2. Convierte el total a centavos enteros (totalCentavos).
// 3. Calcula la base: baseCentavos = floor(totalCentavos / comensales).
// 4. Calcula el remanente: centavos que no caben en la división exacta.
// 5. Distribuye el remanente de a 1 centavo, en orden ascendente de índice (0, 1, 2, ...).
// 6. Convierte cada parte a número con 2 decimales.
export function calculateSplitTip(
  monto: number,
  porcentaje: number,
  comensales: number
): number[] {
  // Validar comensales: debe ser entero >= 1.
  if (!Number.isInteger(comensales) || comensales < 1) {
    throw new Error('comensales debe ser un entero mayor que 0');
  }

  // Reutiliza calculateTip para validar monto/porcentaje y obtener el total redondeado.
  const { total } = calculateTip(monto, porcentaje);

  // Convierte el total a centavos enteros.
  const totalCentavos = Math.round(total * 100);

  // Calcula la base de centavos por comensal.
  const baseCentavos = Math.floor(totalCentavos / comensales);
  const remanente = totalCentavos - baseCentavos * comensales;

  // Construye el array de partes: comensales reciben baseCentavos + 1 si su índice < remanente.
  const partes: number[] = [];
  for (let i = 0; i < comensales; i++) {
    const centavosDelComensal = i < remanente ? baseCentavos + 1 : baseCentavos;
    // Convierte a número con 2 decimales.
    const parte = centavosDelComensal / 100;
    partes.push(parte);
  }

  return partes;
}
