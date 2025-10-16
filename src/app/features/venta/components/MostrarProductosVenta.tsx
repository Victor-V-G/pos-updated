import { InterfaceCantidadPorProducto } from "@/app/shared/interfaces/ingresar-cdb/InterfaceCantidadPorProducto";
import { PropsMostrarProductosVenta } from "@/app/shared/interfaces/ingresar-cdb/PropsMostrarProductosVenta";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import { useEffect, useState } from "react";

export const MostrarProductosVenta = ({ProductoAgregado}:PropsMostrarProductosVenta) => {

    const [AlmacenarProducto, setAlmacenarProducto] = useState<ProductoInterface[]>([])
    const [CantidadPorProducto, setCantidadPorProducto] = useState<InterfaceCantidadPorProducto>({})
    
    useEffect(() => {
        const producto = ProductoAgregado[0]
        const YaExiste = AlmacenarProducto.find(p => p.CodigoDeBarras === producto.CodigoDeBarras)
        if (YaExiste){
            setCantidadPorProducto(prev => ({...prev, [producto.CodigoDeBarras]:{cantidad: ((prev[producto.CodigoDeBarras]?.cantidad || 1) + 1)}}));
        } else {
            setAlmacenarProducto(prev => [...prev, ...ProductoAgregado])
        }
    }, [ProductoAgregado])
    

    const handleDescartarProducto = (CodigoDeBarras: string) => {
        // obtener la cantidad actual
        const cantidadActual = CantidadPorProducto[CodigoDeBarras]?.cantidad || 1;
        const nuevaCantidad = cantidadActual - 1;

        if (nuevaCantidad < 1) {
            // eliminar del array de productos
            setAlmacenarProducto(prev => prev.filter(p => p.CodigoDeBarras !== CodigoDeBarras));

            // eliminar del objeto de cantidades
            setCantidadPorProducto(prev => {
                const nuevo = { ...prev };
                delete nuevo[CodigoDeBarras]; // borramos la clave
                return nuevo;
            });
        } else {
            // actualizar solo la cantidad
            setCantidadPorProducto(prev => ({...prev, [CodigoDeBarras]: { cantidad: nuevaCantidad }}));
        }
    };



    return (
        <>
            {
                AlmacenarProducto.length === 0 ? (
                    <h1></h1>
                ) : (
                    <table>
                        <tbody>
                            <tr>
                                <td>NOMBRE DEL PRODUCTO</td>
                                <td>CODIGO DE BARRAS</td>
                                <td>PRECIO</td>
                                <td>STOCK</td>
                                <td>CANTIDAD A LLEVAR</td>
                            </tr>
                                {AlmacenarProducto.map((productoMap, index) => (
                                    <tr 
                                        key={index}
                                        className={
                                            Number(productoMap.Stock) <= 1 ? "fila-stock-bajo" : 
                                            Number(productoMap.Stock) <= 5 ? "fila-stock-medio" : ""}>
                                        <td>{productoMap.NombreProducto}</td>
                                        <td>{productoMap.CodigoDeBarras}</td>
                                        <td>{productoMap.Precio}</td>
                                        <td>{productoMap.Stock}</td>
                                        <td>{CantidadPorProducto[productoMap.CodigoDeBarras]?.cantidad || 1 }
                                            <button onClick={()=>{
                                                handleDescartarProducto(productoMap.CodigoDeBarras);
                                            }}>-</button>
                                        </td>
                                        
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )
            }  
        </>
    )
}

export default MostrarProductosVenta;