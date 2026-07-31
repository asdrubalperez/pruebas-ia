import { InvalidAmountError, InvalidPercentageError } from './errors.mjs';

// Función pura: calcula la propina y el total a partir de un monto y un
// porcentaje. No realiza I/O ni logging, y no depende de calculateSplitTip
// (que pertenece a un release posterior).
//
// Estrategia de cálculo (evita residuos de punto flotante):
// 1. El monto (que llega con hasta 2 decimales) se convierte a centavos
//    enteros usando Math.round, para eliminar el arrastre binario propio
//    de multiplicar números decimales en JavaScript.
// 2. La propina se calcula en centavos y se redondea con criterio
//    half-up: propinaCentavosExacta se le suma 0.5 y se trunca con
//    Math.floor. Este es un criterio de diseño explícito (no especificado
//    por negocio): una fracción de exactamente 0.5 centavos redondea
//    siempre hacia arriba.
// 3. El total se obtiene sumando los centavos enteros de monto y propina
//    (no reconvirtiendo y sumando en punto flotante), garantizando por
//    construcción el invariante propina + monto = total.
// 4. Finalmente se reconvierte de centavos enteros a unidad monetaria
//    dividiendo por 100, lo que produce siempre como máximo 2 decimales
//    exactos.
export function calculateTip(monto, porcentaje) {
  if (!Number.isFinite(monto) || monto <= 0) {
    throw new InvalidAmountError(monto);
  }
  if (!Number.isFinite(porcentaje) || porcentaje < 0) {
    throw new InvalidPercentageError(porcentaje);
  }

  const montoCentavos = Math.round(monto * 100);
  const propinaCentavosExacta = (montoCentavos * porcentaje) / 100;
  // Half-up: 0.5 centavos exactos redondean hacia arriba.
  const propinaCentavos = Math.floor(propinaCentavosExacta + 0.5);
  const totalCentavos = montoCentavos + propinaCentavos;

  const propina = propinaCentavos / 100;
  const total = totalCentavos / 100;

  return { propina, total };
}
