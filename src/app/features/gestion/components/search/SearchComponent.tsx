import { obtenerProductosPromise } from "@/app/firebase/Promesas";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import { CodigoDeBarrasInputInterface } from "@/app/shared/interfaces/search-producto/CodigoDeBarrasInputInterface";
import { useEffect, useState } from "react";
import { SearchInterface } from "@/app/shared/interfaces/search-producto/SearchInterface";
import SearchModificarComponent from "./SearchModificarComponent";



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
        
            <h1>COMPONENTE SEARCH</h1>

            <form>

                <input 
                    type="number"
                    name="CodigoDeBarrasInput"
                    onChange={(e)=>{
                        handleCodigoDeBarrasInput(e.currentTarget.name, e.currentTarget.value)
                        
                    }}
                />
                <label>INGRESE EL CODIGO DE BARRAS</label>

            </form>
            
            <table>

                <tbody>

                    <tr>

                        <td>NOMBRE DEL PRODUCTO</td>
                        <td>CODIGO DE BARRAS</td>
                        <td>PRECIO</td>
                        <td>STOCK</td>
                        <td>ACCIONES</td>

                    </tr>

                    {

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

                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>
            
        </>

    )


}

export default SearchComponent;