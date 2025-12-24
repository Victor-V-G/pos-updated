export interface ProductoVenta {
  NombreProducto: string;
  CodigoDeBarras: string;
  TipoProducto: "unidad" | "peso";
  PrecioUnitario: number;
  cantidad: number;      // unidades o kg
  subtotal: number;      // PrecioUnitario * cantidad
}
