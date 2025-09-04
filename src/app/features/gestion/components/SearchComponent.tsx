import { obtenerIDProductoSearchModificarPromise, obtenerProductosPromise } from "@/app/firebase/Promesas";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import { CodigoDeBarrasInputInterface } from "@/app/shared/interfaces/search-producto/CodigoDeBarrasInputInterface";
import { useEffect, useState } from "react";
import ModificarProductoComponent from "./ModificarProductoComponent";
import { SearchInterface } from "@/app/shared/interfaces/search-producto/SearchInterface";


const InitialStateCodigoDeBarrasInput : CodigoDeBarrasInputInterface = {
    CodigoDeBarrasInput : ""
}


export const SearchComponent = ({setRefrescarProductos} : SearchInterface) => {


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


    const ProductoFiltrado = ProductosRecuperados.filter(ElementoProductoFiltrado => ElementoProductoFiltrado.CodigoDeBarras == CodigoDeBarrasInput.CodigoDeBarrasInput)
{/* PROBLEMAS CON EL INDEX, RECUPERA MAL*/}
                    
    const handleLlamarPromesaObtenerIDEspecifica = () => {
        obtenerIDProductoSearchModificarPromise("CodigoDeBarras", CodigoDeBarrasInput.CodigoDeBarrasInput);
    }
{/* PROBLEMAS CON EL INDEX, RECUPERA MAL*/}
                    
    return (

        <>
        
            <h1>COMPONENTE SEARCH</h1>

            <form>

                {CodigoDeBarrasInput.CodigoDeBarrasInput}

                <input 
                    type="number"
                    name="CodigoDeBarrasInput"
                    onChange={(e)=>{
                        handleCodigoDeBarrasInput(e.currentTarget.name, e.currentTarget.value)
                        handleLlamarPromesaObtenerIDEspecifica();
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
                    {/* PROBLEMAS CON EL INDEX, RECUPERA MAL*/}
                    {

                        ProductoFiltrado.map((productoFiltradoMap, index) =>(

                            <tr key={index}>

                                <td>{productoFiltradoMap.NombreProducto}</td>
                                <td>{productoFiltradoMap.CodigoDeBarras}</td>
                                <td>{productoFiltradoMap.Precio}</td>
                                <td>{productoFiltradoMap.Stock}</td>

                                <td>

                                    <ModificarProductoComponent
                                        ObtenerIndexModificar={index}
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