import { ProductoInterface } from "../producto/ProductoInterface";

export interface PropsMostrarProductosVenta {
    ProductoAgregado: ProductoInterface[],
    recargarProductos: () => void   // ✅ agregado
}