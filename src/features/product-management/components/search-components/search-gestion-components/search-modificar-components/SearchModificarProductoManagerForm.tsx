import { modificarProductoPromise, obtenerIDProductoSearchModificarPromise, registrarMovimientosPromise, searchObtenerProductoPorIdPromise } from "@/core/infrastructure/firebase"
import { IDDocumentosInterface } from "@/shared/types"
import { ProductoInterface } from "@/core/domain/entities"
import { useEffect, useState } from "react"
import '@/assets/styles/gestion-productos-styles/modificar-productos-style/modificar-producto-manager-form.css'
import { SearchModificarProductoInterface } from "@/shared/types"


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

    /*---------------------ALMACENA EL DATO QUE SE REALIZA EL MOVIMIENTO----------------------*/
    const [ProductoOriginal, setProductoOriginal] = useState<ProductoInterface | null>(null)
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
        setProductoOriginal(ProductoSeleccionado)
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

    const handleCallRegistrarMovimiento = () => {
    
        const nuevo = ProductoSeleccionadoForm
        const viejo = ProductoOriginal

        if (viejo?.Precio !== nuevo.Precio) {
            registrarMovimientosPromise("MODIFICAR PRODUCTO", (`El producto: ${viejo?.NombreProducto}, con Codigo de barras: ${viejo?.CodigoDeBarras}, su Precio cambió de $${viejo?.Precio} a $${nuevo.Precio}`)).then(()=>{
                console.log("MOVIMIENTO REGISTRADO")
            }).catch(()=>{
                alert("NO SE PUDO REGISTRAR LA ACCION")
            })
        }

        if (viejo?.Stock !== nuevo.Stock) {
            registrarMovimientosPromise("MODIFICAR PRODUCTO", (`El producto: ${viejo?.NombreProducto}, con Codigo de barras: ${viejo?.CodigoDeBarras}, su Stock cambió de ${viejo?.Stock} unidades a ${nuevo.Stock} unidades`)).then(()=>{
                console.log("MOVIMIENTO REGISTRADO")
            }).catch(()=>{
                alert("NO SE PUDO REGISTRAR LA ACCION")
            })
        }


    }
    

    return (

        <>

            <header className='header-title-style'>
                        
                <div>
                    <h1>MODIFICAR PRODUCTO</h1> <br />
                </div>
                    
            </header>

            <main>

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
                            handleCallRegistrarMovimiento();
                        }}>
                        <span>MODIFICAR PRODUCTO</span>
                    </button>   

                </form>

            </main>    

        </>

    )

}

export default SearchModificarProductoManagerForm;