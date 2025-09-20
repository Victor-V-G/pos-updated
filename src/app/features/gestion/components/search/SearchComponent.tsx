import { obtenerProductosPromise } from "@/app/firebase/Promesas";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import { CodigoDeBarrasInputInterface } from "@/app/shared/interfaces/search-producto/CodigoDeBarrasInputInterface";
import { useEffect, useState } from "react";
import { SearchInterface } from "@/app/shared/interfaces/search-producto/SearchInterface";
import SearchModificarComponent from "./SearchModificarComponent";
import '../../assets/search-style/search-component.css'
import SearchEliminarProductoComponent from "./SearchEliminarProductoComponent";


const InitialStateCodigoDeBarrasInput : CodigoDeBarrasInputInterface = {
    CodigoDeBarrasInput : ""
}


export const SearchComponent = ({RefrescarProductos, setRefrescarProductos} : SearchInterface) => {


    const [ProductosRecuperados, setProductosRecuperados] = useState<ProductoInterface[]>([])

    const [CodigoDeBarrasInput, setCodigoDeBarrasInput] = useState(InitialStateCodigoDeBarrasInput)


    useEffect(() => {
        obtenerProductosPromise().then((productoGet) => {
            setProductosRecuperados(productoGet)
            console.log("PRODUCTO RECUPERADO CORRECTAMENTE")
        }).catch((error) => {
            alert("OCURRIO UN ERROR AL RECUPERAR LOS PRODUCTOS")
            console.log(error)
        })
    }, [])

    
    const handleCodigoDeBarrasInput = (name : string , value : string) => {
        setCodigoDeBarrasInput(
            {...CodigoDeBarrasInput,[name]:value}
        )
    }


    useEffect(() => {
        obtenerProductosPromise().then((productoGet) => {
            setProductosRecuperados(productoGet)
            console.log("PRODUCTO RECUPERADO CORRECTAMENTE")
        }).catch((error) => {
            alert("OCURRIO UN ERROR AL RECUPERAR LOS PRODUCTOS")
            console.log(error)
        })
    }, [RefrescarProductos == true])


    const ProductoFiltrado = ProductosRecuperados.filter(ElementoProductoFiltrado => ElementoProductoFiltrado.CodigoDeBarras == CodigoDeBarrasInput.CodigoDeBarrasInput)


    return (

        <>
            
            <header className="header-title-style">

                <div>
                    <h1>BUSQUEDA RAPIDA</h1>
                </div>

            </header>
            
            <section className="input-codigo-de-barras">
                
                <form className="search-form">
                
                    <div className="search-input">
                        <input 
                            type="text"
                            name="CodigoDeBarrasInput"
                            required spellCheck="false"
                            onChange={(e)=>{
                                handleCodigoDeBarrasInput(e.currentTarget.name, e.currentTarget.value)
                                
                            }}
                        />
                        <label>CODIGO DE BARRAS</label>
                    </div>

                </form>

            </section>
        
            <table className="search-tabla-productos">

                <tbody>

                    <tr>

                        <td>NOMBRE DEL PRODUCTO</td>
                        <td>CODIGO DE BARRAS</td>
                        <td>PRECIO</td>
                        <td>STOCK</td>
                        <td>ACCIONES</td>

                    </tr>
                    
                    {
                        ProductoFiltrado.length === 0 ? (

                            <tr>
                                <td colSpan={5}
                                    className="no-productos">
                                    DEBE INGRESAR UN CODIGO DE BARRAS VALIDO PARA BUSCAR
                                </td> 
                            </tr>

                        ) : (
                            ProductoFiltrado.map((productoFiltradoMap, index) =>(

                                <tr key={index}>

                                    <td>{productoFiltradoMap.NombreProducto}</td>
                                    <td>{productoFiltradoMap.CodigoDeBarras}</td>
                                    <td>{productoFiltradoMap.Precio}</td>
                                    <td>{productoFiltradoMap.Stock}</td>

                                    <td>

                                        <SearchModificarComponent
                                            ObtenerCodigoDeBarras={CodigoDeBarrasInput.CodigoDeBarrasInput}
                                            setRefrescarProductos={setRefrescarProductos}
                                        />

                                        <SearchEliminarProductoComponent
                                            ObtenerCodigoDeBarras={CodigoDeBarrasInput.CodigoDeBarrasInput}
                                            setRefrescarProductos={setRefrescarProductos}
                                        />

                                    </td>

                                </tr>

                            ))
                        )
                    }

                </tbody>

            </table>
            
        </>

    )


}

export default SearchComponent;