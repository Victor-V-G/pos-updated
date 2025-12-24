// shared/interfaces/ingresar-cdb/PropsMostrarProductosVenta.ts

import { ProductoInterface } from "../producto/ProductoInterface";

export interface PropsMostrarProductosVenta {
  ProductoAgregado: ProductoInterface[];
  recargarProductos: () => void;
}