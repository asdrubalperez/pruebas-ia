function calculateSplitTip(monto, porcentaje, comensales) {
  if (!Number.isFinite(monto) || monto < 0) {
    throw new Error('monto invalido: debe ser un numero finito >= 0');
  }
  if (!Number.isFinite(porcentaje) || porcentaje < 0) {
    throw new Error('porcentaje invalido: debe ser un numero finito >= 0');
  }
  if (!Number.isInteger(comensales) || comensales < 1) {
    throw new Error('comensales invalido: debe ser un entero >= 1');
  }

  const montoCentavos = Math.round(monto * 100);
  const propinaCentavos = Math.round((montoCentavos * porcentaje) / 100);
  const totalCentavos = montoCentavos + propinaCentavos;

  const base = Math.floor(totalCentavos / comensales);
  const residuo = totalCentavos - base * comensales;

  const restos = Array.from({ length: comensales }, (_, indice) => ({
    indice,
    resto: totalCentavos / comensales - base,
  }));

  restos.sort((a, b) => {
    if (b.resto !== a.resto) {
      return b.resto - a.resto;
    }
    return a.indice - b.indice;
  });

  const montosCentavos = new Array(comensales).fill(base);
  for (let i = 0; i < residuo; i += 1) {
    montosCentavos[restos[i].indice] += 1;
  }

  const sumaCentavos = montosCentavos.reduce((acumulado, valor) => acumulado + valor, 0);
  if (sumaCentavos !== totalCentavos) {
    throw new Error('error interno: la suma de montos no coincide con el total');
  }

  const montos = montosCentavos.map((centavos) => centavos / 100);
  const total = totalCentavos / 100;

  return { montos, total };
}

export { calculateSplitTip };
