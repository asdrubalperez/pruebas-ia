// Errores tipados para el módulo de cálculo de propina.
// Ambos incluyen el valor inválido recibido para facilitar el diagnóstico.

export class InvalidAmountError extends Error {
  constructor(monto) {
    super(`Monto inválido: se esperaba un número finito mayor a 0, se recibió ${String(monto)}`);
    this.name = 'InvalidAmountError';
    this.invalidValue = monto;
  }
}

export class InvalidPercentageError extends Error {
  constructor(porcentaje) {
    super(`Porcentaje inválido: se esperaba un número finito mayor o igual a 0, se recibió ${String(porcentaje)}`);
    this.name = 'InvalidPercentageError';
    this.invalidValue = porcentaje;
  }
}
