// shared/interfaces/ingresar-cdb/InterfaceCantidadPorProducto.ts

import { TipoProducto } from "../producto/ProductoInterface";

export interface ProductoVenta {
  NombreProducto: string;
  CodigoDeBarras: string;
  TipoProducto: TipoProducto;
  PrecioUnitario: number; // Precio por unidad o por kg
  cantidad: number;       // Unidades o kg vendidos
  subtotal: number;       // PrecioUnitario * cantidad
}

export interface InterfaceCantidadPorProducto {
  [codigo: string]: ProductoVenta;
}