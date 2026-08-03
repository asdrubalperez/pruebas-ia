export interface ResultadoPropina {
    propina: number;
    total: number;
}
export declare function calculateTip(monto: number, porcentaje: number): ResultadoPropina;
