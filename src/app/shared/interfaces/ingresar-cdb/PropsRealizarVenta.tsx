import { PropsProductosVenta } from "./PropsProductosVenta";

export interface PropsRealizarVenta {
    TotalGeneral: number,
    ProductosVenta: PropsProductosVenta[],
}