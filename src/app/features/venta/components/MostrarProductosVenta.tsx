import { InterfaceCantidadPorProducto } from "@/app/shared/interfaces/ingresar-cdb/InterfaceCantidadPorProducto";
import { InterfacePrecioTotal } from "@/app/shared/interfaces/ingresar-cdb/InterfacePrecioTotal";
import { PropsMostrarProductosVenta } from "@/app/shared/interfaces/ingresar-cdb/PropsMostrarProductosVenta";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import { useEffect, useState } from "react";
import RealizarVenta from "./RealizarVenta";

export const MostrarProductosVenta = ({ProductoAgregado}:PropsMostrarProductosVenta) => {

    const [AlmacenarProducto, setAlmacenarProducto] = useState<ProductoInterface[]>([])
    const [CantidadPorProducto, setCantidadPorProducto] = useState<InterfaceCantidadPorProducto>({})
    const [PrecioTotal, setPrecioTotal] = useState<InterfacePrecioTotal>({})
    const [TotalGeneral, setTotalGeneral] = useState(0)
    
    useEffect(() => {
        const producto = ProductoAgregado?.[0]
        if (!producto) return;
        const YaExiste = AlmacenarProducto.find(p => p.CodigoDeBarras === producto.CodigoDeBarras)
        if (YaExiste){
            setCantidadPorProducto(prev => ({...prev, [producto.CodigoDeBarras]:{cantidad: ((prev[producto.CodigoDeBarras]?.cantidad || 1) + 1)}}));
            setPrecioTotal(prev => ({...prev, [producto.CodigoDeBarras]:{total: ((prev[producto.CodigoDeBarras]?.total || Number(producto.Precio)) + Number(producto.Precio))}}));
        } else {
            setAlmacenarProducto(prev => [...prev, ...ProductoAgregado])
            setCantidadPorProducto(prev => ({...prev, [producto.CodigoDeBarras]:{cantidad:1},}));
            setPrecioTotal(prev => ({...prev, [producto.CodigoDeBarras]:{total: Number(producto.Precio)},}));
        }
    }, [ProductoAgregado])
    
    const handleAñadirProducto = (CodigoDeBarras: string, Precio: string) => {
        // obtener la cantidad actual
        const cantidadActual = CantidadPorProducto[CodigoDeBarras]?.cantidad || 1;
        const nuevaCantidad = cantidadActual + 1;

        const cantidadTotalActual = PrecioTotal[CodigoDeBarras]?.total || Number(Precio);
        const nuevoTotal = cantidadTotalActual + Number(Precio);
        
        setCantidadPorProducto(prev => ({...prev, [CodigoDeBarras]: { cantidad: nuevaCantidad }}));
        setPrecioTotal(prev => ({...prev, [CodigoDeBarras]: { total: nuevoTotal }}));
    };

    const handleDescartarProducto = (CodigoDeBarras: string, Precio: string) => {
        // obtener la cantidad actual
        const cantidadActual = CantidadPorProducto[CodigoDeBarras]?.cantidad || 1;
        const nuevaCantidad = cantidadActual - 1;

        const cantidadTotalActual = PrecioTotal[CodigoDeBarras]?.total || Number(Precio);
        const nuevoTotal = cantidadTotalActual - Number(Precio);
        
        if (nuevaCantidad < 1) {
            // eliminar del array de productos
            setAlmacenarProducto(prev => prev.filter(p => p.CodigoDeBarras !== CodigoDeBarras));

            // eliminar del objeto de cantidades
            setCantidadPorProducto(prev => {
                const nuevo = { ...prev };
                delete nuevo[CodigoDeBarras]; // borramos la clave
                return nuevo;
            });

            setPrecioTotal(prev => {
                const nuevoValor = {...prev };
                delete nuevoValor[CodigoDeBarras];
                return nuevoValor
            });
        } else {
            // actualizar solo la cantidad
            setCantidadPorProducto(prev => ({...prev, [CodigoDeBarras]: { cantidad: nuevaCantidad }}));
            setPrecioTotal(prev => ({...prev, [CodigoDeBarras]: { total: nuevoTotal }}));
        }
    };

    useEffect(() => {
      const total = Object.values(PrecioTotal).reduce((acc, item) => acc + (item.total || 0), 0);
      setTotalGeneral(total)
    }, [PrecioTotal])
    

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
                                                handleAñadirProducto(productoMap.CodigoDeBarras, productoMap.Precio);
                                            }}>+</button>
                                            <button onClick={()=>{
                                                handleDescartarProducto(productoMap.CodigoDeBarras, productoMap.Precio);
                                            }}>-</button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )
            }

            <RealizarVenta TotalGeneral={TotalGeneral}/> 

        </>
    )
}

export default MostrarProductosVenta;