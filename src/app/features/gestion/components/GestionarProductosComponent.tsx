import { obtenerProductosPromise } from "@/app/firebase/Promesas";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import { useEffect, useState } from "react";
import ModificarProductoComponent from "./ModificarProductoComponent";
import ElimiarProductoComponent from "./EliminarProductoComponent";
import '../assets/gestion-productos-table.css'
import '../assets/gestion-component-style/stock-bajo.css'
import SearchModals from "../modals/search-modals/SearchModals";

export const GestionProductosComponent = () => {

    const [ProductosRecuperados, setProductosRecuperados] = useState<ProductoInterface[]>([])

    const [RefrescarProductos, setRefrescarProductos] = useState(false)

    const [OpenManagerSearch, setOpenManagerSearch] = useState(false)

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
            <div className="gestion-productos-container">

                <section className="section-search-button">

                    <div>
                        <h1>OPCIONES</h1>
                    </div>

                    <button
                        onClick={()=>{
                            setOpenManagerSearch(true);
                        }}>
                        <span>BUSCAR PRODUCTO</span>
                    </button>

                </section> 

                <SearchModals
                    OpenManager={OpenManagerSearch}
                    setOpenManager={setOpenManagerSearch}
                    RefrescarProductos={RefrescarProductos}
                    setRefrescarProductos={setRefrescarProductos}
                /> <br /> <br />

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
                            ProductosRecuperados.length === 0 ? (

                                <tr>
                                    <td colSpan={5}
                                        className="no-productos">
                                        SE DEBE REGISTRAR UN PRODUCTO PREVIAMENTE
                                    </td> 
                                </tr>

                            ) : (

                                ProductosRecuperados.map((productoMap, index) => (

                                    <tr 
                                        key={index}
                                        className={Number(productoMap.Stock) <= 1 ? "fila-stock-bajo" : 
                                            Number(productoMap.Stock) <= 5 ? "fila-stock-medio" : ""}>

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
                            )
                        }

                    </tbody>

                </table>
            
            </div>

        </>
    )

}

export default GestionProductosComponent;