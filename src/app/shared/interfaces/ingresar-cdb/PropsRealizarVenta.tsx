// shared/interfaces/ingresar-cdb/PropsRealizarVenta.ts

import { PropsProductosVenta } from "./PropsProductosVenta";

export interface PropsRealizarVenta {
  TotalGeneral: number;
  ProductosVenta: PropsProductosVenta[];
}