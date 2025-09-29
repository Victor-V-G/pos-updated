import { useState } from "react"
import '../../assets/css/component-main-style/gestion-component-style.css'
import GestionarProductosModals from "../../modals/gestion-main-modals/GestionarProductosAbrirMainComponentModals"
import AgregarProductoModals from "../../modals/gestion-productos-modals/agregar-productos/AgregarProductoModals"
import RegistrosYMovimientosModals from "../../modals/gestion-productos-modals/registros-y-movimientos/RegistrosYMovimientosModals"


export const GestionComponent = () => {

    /*------------------------GESTOR DEL PROPIO COMPONENTE-------------------------------*/
    const [OpenManagerGestionComponent, setOpenManagerGestionComponent] = useState(true)
    /*-----------------------------------------------------------------------------------*/

    /*-------------------GESTOR DEL COMPONENTE DE AGREGAR PRODUCTO-----------------------*/
    const [OpenManagerAgregarProducto, setOpenManagerAgregarProducto] = useState(false)
    /*-----------------------------------------------------------------------------------*/

    /*-------------------GESTOR DEL COMPONENTE DE AGREGAR PRODUCTO-----------------------*/
    const [OpenManagerRegistrosYMovimientos, setOpenManagerRegistrosYMovimientos] = useState(false)
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
                                    setOpenManagerRegistrosYMovimientos(false);
                                }}>
                                <span>AGREGAR PRODUCTO</span>
                            </button>
                            
                            <button
                                onClick={()=>{
                                    setOpenManagerRegistrosYMovimientos(true);
                                    setOpenManagerAgregarProducto(false);
                                    setOpenManagerGestionComponent(false);
                                    setOpenManagerGestionarProductos(false);
                                }}>
                                <span>REGISTROS Y MOVIMIENTOS</span>
                            </button>

                            <button
                                onClick={()=>{
                                    setOpenManagerGestionarProductos(true);
                                    setOpenManagerGestionComponent(false);
                                    setOpenManagerAgregarProducto(false);
                                    setOpenManagerRegistrosYMovimientos(false);
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

    if (OpenManagerRegistrosYMovimientos == true){
        return(

            <>

                <RegistrosYMovimientosModals
                    OpenManager={OpenManagerRegistrosYMovimientos}
                    setOpenManager={()=>setOpenManagerRegistrosYMovimientos(false)}
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