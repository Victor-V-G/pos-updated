
export interface ProductoConIDInterface {
    id: string;
    NombreProducto: string;
    CodigoDeBarras: string;
    Precio: string;
    Stock: string;
}

export interface EliminarProductoInterface {
    producto: ProductoConIDInterface;  // ✅ Producto completo
    setRefrescarProductos: (value: boolean) => void;
}