import { useState } from "react"
import AgregarProductoModals from "../modals/AgregarProductoModals"
import '../assets/gestion-component-style.css'
import GestionarProductosModals from "../modals/GestionarProductosModals"



export const GestionComponent = () => {

    /*------------------------GESTOR DEL PROPIO COMPONENTE-------------------------------*/
    const [OpenManagerGestionComponent, setOpenManagerGestionComponent] = useState(true)
    /*-----------------------------------------------------------------------------------*/

    /*-------------------GESTOR DEL COMPONENTE DE AGREGAR PRODUCTO-----------------------*/
    const [OpenManagerAgregarProducto, setOpenManagerAgregarProducto] = useState(false)
    /*-----------------------------------------------------------------------------------*/

    /*------------------GESTOR DEL COMPONENTE GESTIONAR PRODUCTOS------------------------*/
    const [OpenManagerGestionarProductos, setOpenManagerGestionarProductos] = useState(false)
    /*-----------------------------------------------------------------------------------*/


    if (OpenManagerGestionComponent == true){
        return (
            <>

                <div className="gestion-component-style">

                    <header>
                        <h1>MENU DE GESTION</h1>
                    </header>
                    
                    <main>

                        <nav>

                            <button
                                onClick={()=>{
                                    setOpenManagerAgregarProducto(true);
                                    setOpenManagerGestionComponent(false);
                                    setOpenManagerGestionarProductos(false);
                                }}>
                                <span>AGREGAR PRODUCTO</span>
                            </button>

                            <button
                                onClick={()=>{
                                    setOpenManagerGestionarProductos(true);
                                    setOpenManagerGestionComponent(false);
                                    setOpenManagerAgregarProducto(false);
                                }}>
                                <span>GESTIONAR PRODUCTOS</span>
                            </button>

                        </nav>
                        
                    </main>

                </div>
                    
            </>
        )

    }

    if (OpenManagerAgregarProducto == true){
        return(

            <>

                <AgregarProductoModals
                        OpenManager={OpenManagerAgregarProducto}
                        setOpenManager={()=>setOpenManagerAgregarProducto(false)}
                        OpenManagerSetter={OpenManagerGestionComponent}
                        SetOpenManagerGestionComponentSetter={setOpenManagerGestionComponent}
                />

            </>

        )
    }

    if (OpenManagerGestionarProductos == true){
        return(

            <>

                <GestionarProductosModals
                    OpenManager={OpenManagerGestionarProductos}
                    setOpenManager={()=>setOpenManagerGestionarProductos(false)}
                    OpenManagerSetter={OpenManagerGestionComponent}
                    SetOpenManagerGestionComponentSetter={setOpenManagerGestionComponent}
                />
                
            </>
        
        )
    }
    
}

export default GestionComponent;