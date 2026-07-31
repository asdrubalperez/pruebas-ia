function calculateTip(monto, porcentaje) {
  if (!Number.isFinite(monto) || monto < 0) {
    throw new Error('monto invalido: debe ser un numero finito >= 0');
  }
  if (!Number.isFinite(porcentaje) || porcentaje < 0) {
    throw new Error('porcentaje invalido: debe ser un numero finito >= 0');
  }

  const montoCentavos = Math.round(monto * 100);
  const propinaCentavos = Math.round((montoCentavos * porcentaje) / 100);
  const totalCentavos = montoCentavos + propinaCentavos;

  return {
    propina: propinaCentavos / 100,
    total: totalCentavos / 100,
  };
}

export { calculateTip };
