export interface ResultadoPropina {
    tipAmount: number;
    total: number;
}
export declare function calculateTip(monto: number, porcentaje: number): ResultadoPropina;
