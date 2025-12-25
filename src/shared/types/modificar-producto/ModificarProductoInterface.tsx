
export interface ProductoConIDInterface {
    id: string;
    NombreProducto: string;
    CodigoDeBarras: string;
    Precio: string;
    Stock: string;
}


export interface ModificarProductoInterface {
    producto: ProductoConIDInterface;  // ✅ Se recibe el producto completo con ID
    setRefrescarProductos: (value: boolean) => void;
}