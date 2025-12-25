// shared/interfaces/producto/ProductoInterface.ts

export type TipoProducto = "unidad" | "peso";

export interface ProductoInterface {
  NombreProducto: string;
  CodigoDeBarras: string;
  Precio: string;      // Precio unitario (por unidad o por kg)
  Stock: string;       // Stock (unidades o kg, según TipoProducto)
  TipoProducto: TipoProducto;
  // Campo opcional usado solo en flujo de venta (no se guarda en DB)
  cantidad?: number;
}

export interface ProductoConIDInterface extends ProductoInterface {
  id: string;
}