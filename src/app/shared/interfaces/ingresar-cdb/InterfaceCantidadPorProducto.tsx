
export interface InterfaceCantidadPorProducto {
    /*CLAVE VALOR, DENTRO DE CLAVE VALOR*/
    [CodigoDeBarras: string] : {NombreProducto : string, CodigoDeBarras : string, Precio : string, cantidad: number} 
}