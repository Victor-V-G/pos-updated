import { modificarProductoPromise, obtenerIDProductosPromise, obtenerProductosPromise } from "@/app/firebase/Promesas"
import { IDDocumentosInterface } from "@/app/shared/interfaces/id-documentos/IDDocumentosInterface"
import { ModificarProductoInterface } from "@/app/shared/interfaces/modificar-producto/ModificarProductoInterface"
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface"
import { useEffect, useState } from "react"
import '../../../assets/css/gestion-productos-styles/modificar-productos-style/modificar-producto-manager-form.css'

const InitialStateProductoSeleccionadoForm : ProductoInterface = {
    NombreProducto : "",
    CodigoDeBarras : "",
    Precio : "",
    Stock : ""
}


export const ModificarProductoManagerFrom = ({ObtenerIndexModificar, setRefrescarProductos} : ModificarProductoInterface) => {

    /*-----------------------ALMACENAR DATOS RECUPERADOS DE LAS PROMISES----------------------*/
    const [ProductosRecuperados, setProductosRecuperados] = useState<ProductoInterface[]>([])
    
    const [IDSRecuperados, setIDSRecuperados] = useState<IDDocumentosInterface[]>([])
    /*----------------------------------------------------------------------------------------*/


    /*-------------------VERIFICAR QUE LOS DATOS SE OBTUVIERON DE LAS PROMISES-----------------*/
    const [SeObtuvoProducto, setSeObtuvoProducto] = useState(false)
    
    const [SeObtuvoIDS, setSeObtuvoIDS] = useState(false)
    /*----------------------------------------------------------------------------------------*/

    /*-------------------------ALMACENA EL DATO SELECCIONADO A MODIFICAR----------------------*/
    const [IDSeleccionadaModificar, setIDSeleccionadaModificar] = useState<IDDocumentosInterface[]>([])

    const [ProductoSeleccionadoForm, setProductoSeleccionadoForm] = useState(InitialStateProductoSeleccionadoForm)
    /*----------------------------------------------------------------------------------------*/



    useEffect(() => {
        obtenerProductosPromise().then((productoGet) => {
            setProductosRecuperados(productoGet)
            console.log("PRODUCTO RECUPERADO CORRECTAMENTE")
            setSeObtuvoProducto(true)
        }).catch((error) => {
            alert("OCURRIO UN ERROR AL RECUPERAR LOS PRODUCTOS")
            console.log(error)
        })
    }, [])
    

    useEffect(() => {
      obtenerIDProductosPromise().then((idsDocumentosGet) => {
        setIDSRecuperados(idsDocumentosGet);
        console.log("IDS RECUPERADAS CORRECTAMENTE")
        setSeObtuvoIDS(true)
      }).catch((error) => {
        alert("OCURRIO UN ERROR AL RECUPERAR LAS IDS")
        console.log(error)
      })
    }, [])
    

    /*---------------------------HANDLE CARGAR FUNCIONES----------------------------*/
    const handleCargarFunciones = () => {

        /*-------------------------HANDLE RECUPERAR ID------------------------------*/
        const IdSeleccionada = IDSRecuperados[ObtenerIndexModificar];
            setIDSeleccionadaModificar([IdSeleccionada])
            console.log(IdSeleccionada);
            if (!IdSeleccionada) {
                alert("LA ID SELECCIONADA NO FUE ENCONTRADA")
                return
            }
        /*--------------------------------------------------------------------------*/

        /*----------------------HANDLE SELECCIONAR PRODUCTO-------------------------*/
        const ProductoSeleccionado = ProductosRecuperados[ObtenerIndexModificar];
            setProductoSeleccionadoForm(ProductoSeleccionado)
            console.log(ProductoSeleccionado)
            if (!ProductoSeleccionado) {
                alert("EL PRODUCTO SELECCIONADO NO FUE ENCONTRADO")
                return
            }
        /*--------------------------------------------------------------------------*/
        
    }
    /*------------------------------------------------------------------------------*/


    /*----AQUI SE EJECUTA EL HANDLE UNA VEZ SE RECUPEREN TODOS LOS DATOS DE LAS PROMISE---*/
    useEffect(() => {
      if (SeObtuvoProducto == true && SeObtuvoIDS == true) {
        handleCargarFunciones();
      }
    }, [ProductosRecuperados, IDSRecuperados])
    /*------------------------------------------------------------------------------------*/


    /*--------------------HANDLE REESCRIBIR FORM------------------*/
    const handleModificarInput = (name:string, value:string) => {
        setProductoSeleccionadoForm(
            {...ProductoSeleccionadoForm,[name]:value}
        )
    }
    /*-----------------------------------------------------------*/


    /*-------------------HANDLE LLAMAR A LA PROMESA DE MODIFICAR----------------*/
    const handleCallPromiseModificarProducto = () => {
        modificarProductoPromise(IDSeleccionadaModificar[0], ProductoSeleccionadoForm).then(() => {
            alert("PRODUCTO MODIFICADO CORRECTAMENTE")
        }).catch((error) => {
            alert("OCURRIO UN ERROR AL MODIFICAR EL PRODUCTO")
            console.log(error)
        })
    }
    /*--------------------------------------------------------------------------*/


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
                            handleCallPromiseModificarProducto();
                            setRefrescarProductos(true);
                        }}>
                        <span>MODIFICAR PRODUCTO</span>
                    </button>

                </form>

            </main>    

        </>

    )

}

export default ModificarProductoManagerFrom;