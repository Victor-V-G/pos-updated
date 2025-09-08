import { modificarProductoPromise, obtenerIDProductoSearchModificarPromise, searchObtenerProductoPorIdPromise } from "@/app/firebase/Promesas"
import { IDDocumentosInterface } from "@/app/shared/interfaces/id-documentos/IDDocumentosInterface"
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface"
import { useEffect, useState } from "react"
import '../../assets/modificar-producto-manager-form.css'
import { SearchModificarProductoInterface } from "@/app/shared/interfaces/search-producto/SearchModificarProductoInterface"


const InitialStateProductoSeleccionadoForm : ProductoInterface = {
    NombreProducto : "",
    CodigoDeBarras : "",
    Precio : "",
    Stock : ""
}


export const SearchModificarProductoManagerForm = ({ObtenerCodigoDeBarras, setRefrescarProductos} : SearchModificarProductoInterface) => {


    /*-----------------------ALMACENAR DATOS RECUPERADOS DE LAS PROMISES----------------------*/
    const [ProductoRecuperado, setProductoRecuperado] = useState<ProductoInterface[]>([])
    
    const [IDRecuperado, setIDRecuperado] = useState<IDDocumentosInterface[]>([])
    /*----------------------------------------------------------------------------------------*/


    /*------------------------SE VALIDA QUE SE OBTUVO EL PRODUCTO-----------------------------*/
    const [SeObtuvo, setSeObtuvo] = useState(false)
    /*----------------------------------------------------------------------------------------*/


    /*-------------------------ALMACENA EL DATO SELECCIONADO A MODIFICAR----------------------*/
    const [ProductoSeleccionadoForm, setProductoSeleccionadoForm] = useState(InitialStateProductoSeleccionadoForm)
    /*----------------------------------------------------------------------------------------*/



    /*--------------------HANDLE REESCRIBIR FORM------------------*/
    const handleModificarInput = (name:string, value:string) => {
        setProductoSeleccionadoForm(
            {...ProductoSeleccionadoForm,[name]:value}
        )
    }
    /*-----------------------------------------------------------*/


    const handleLlamarPromesaObtenerIDEspecifica = () => {
        obtenerIDProductoSearchModificarPromise("CodigoDeBarras", ObtenerCodigoDeBarras).then((idRecuperadaDocumentosGet)=>{
            setIDRecuperado(idRecuperadaDocumentosGet)
        }).catch((error) => {
            alert("OCURRIO UN ERROR AL RECUPERAR LA ID")
            console.log(error)
        })
    }


    useEffect(() => {
      handleLlamarPromesaObtenerIDEspecifica();
    }, [])


    useEffect(() => {
      searchObtenerProductoPorIdPromise(IDRecuperado[0]).then((productoGet) => {
        setProductoRecuperado(productoGet)
        setSeObtuvo(true)
      }).catch((error) => {
        console.log("SE PRODUJO UN ERROR AL RECUPERAR EL PRODUCTO MEDIANTE ID")
        console.log(error)
      })
    }, [IDRecuperado])


    const handleLlenarFormulario = () => {

        if (ProductoRecuperado.length == 0) {
            return;
        }

        const ProductoSeleccionado = ProductoRecuperado[0];
        if (!ProductoSeleccionado) {
            alert("EL PRODUCTO SELECCIONADO NO FUE ENCONTRADO")
            return;
        }

        setProductoSeleccionadoForm(ProductoSeleccionado)
    }
    

    useEffect(() => {
      handleLlenarFormulario();
    }, [SeObtuvo == true])
    
    /*-------------------HANDLE LLAMAR A LA PROMESA DE MODIFICAR----------------*/
    const handleCallPromiseModificarProducto = () => {
        modificarProductoPromise(IDRecuperado[0], ProductoSeleccionadoForm).then(() => {
            alert("PRODUCTO MODIFICADO CORRECTAMENTE")
        }).catch((error) => {
            alert("OCURRIO UN ERROR AL MODIFICAR EL PRODUCTO")
            console.log(error)
        })
    }
    /*--------------------------------------------------------------------------*/


    return (

        <>
            <main>

                <section className='section-title-style'>
                        
                        <div>
                            <h1>MODIFICAR PRODUCTO</h1> <br />
                        </div>
                        
                </section> <br />

                <form className='modificar-form'>

                    <div className='input-box'>
                        <input 
                            type="text"
                            name="NombreProducto"
                            required spellCheck="false"
                            value={ProductoSeleccionadoForm.NombreProducto}
                            onChange={(e)=>handleModificarInput(e.currentTarget.name, e.currentTarget.value)}
                        />
                        <label>NOMBRE DEL PRODUCTO</label> <br />
                    </div>
                    
                    <div className='input-box'>
                        <input 
                            type="number" 
                            name="CodigoDeBarras"
                            required spellCheck="false"
                            value={ProductoSeleccionadoForm.CodigoDeBarras}
                            onChange={(e)=>handleModificarInput(e.currentTarget.name, e.currentTarget.value)}
                        /> 
                        <label>CODIGO DE BARRAS</label><br />
                    </div>
                    
                    <div className='input-box'>
                        <input 
                            type="number" 
                            name="Precio"
                            required spellCheck="false"
                            value={ProductoSeleccionadoForm.Precio}
                            onChange={(e)=>handleModificarInput(e.currentTarget.name, e.currentTarget.value)}
                        />
                        <label>PRECIO</label> <br />
                    </div>
                    
                    <div className='input-box'>
                        <input 
                            type="number" 
                            name="Stock"
                            required spellCheck="false"
                            value={ProductoSeleccionadoForm.Stock}
                            onChange={(e)=>handleModificarInput(e.currentTarget.name, e.currentTarget.value)}
                        /> 
                        <label>STOCK</label><br />
                    </div>

                    <button
                        className="modificar-form"
                        onClick={(e)=>{
                            e.preventDefault();
                            setRefrescarProductos(true);
                            handleCallPromiseModificarProducto();
                        }}>
                        <span>MODIFICAR PRODUCTO</span>
                    </button>

                </form>

            </main>    

        </>

    )

}

export default SearchModificarProductoManagerForm;