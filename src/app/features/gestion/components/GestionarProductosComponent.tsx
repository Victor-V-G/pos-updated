import { obtenerProductosPromise } from "@/app/firebase/Promesas";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import { useEffect, useState } from "react";
import ModificarProductoComponent from "./ModificarProductoComponent";
import ElimiarProductoComponent from "./EliminarProductoComponent";
import '../assets/gestion-productos-table.css'

export const GestionProductosComponent = () => {

    const [ProductosRecuperados, setProductosRecuperados] = useState<ProductoInterface[]>([])

    const [RefrescarProductos, setRefrescarProductos] = useState(false)

    useEffect(() => {
        obtenerProductosPromise().then((productoGet) => {
            setProductosRecuperados(productoGet);
            setRefrescarProductos(false)
        }).catch((error) => {
            alert("ERROR AL RECUPERAR LOS PRODUCTOS")
            console.log(error)
        })
    }, [RefrescarProductos == true])
    


    return (
        <>
            
            <table className="tabla-gestion-style">

                <tbody>

                    <tr>

                        <td>NOMBRE DEL PRODUCTO</td>
                        <td>CODIGO DE BARRAS</td>
                        <td>PRECIO</td>
                        <td>STOCK</td>
                        <td>ACCIONES</td>

                    </tr>

                    {
                        
                        ProductosRecuperados.map((productoMap, index) => (

                            <tr key={index}>

                                <td>{productoMap.NombreProducto}</td>
                                <td>{productoMap.CodigoDeBarras}</td>
                                <td>{productoMap.Precio}</td>
                                <td>{productoMap.Stock}</td>

                                <td>

                                    <ModificarProductoComponent 
                                        ObtenerIndexModificar={index}
                                        setRefrescarProductos={setRefrescarProductos}
                                    />
                                    
                                    <ElimiarProductoComponent 
                                        ObtenerIndexEliminar={index}
                                        setRefrescarProductos={setRefrescarProductos}
                                    />
                                
                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>
            
        </>
    )

}

export default GestionProductosComponent;