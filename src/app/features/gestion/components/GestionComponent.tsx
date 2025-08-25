import { useState } from "react"
import AgregarProductoModals from "../modals/AgregarProductoModals"
import '../assets/gestion-component-style.css'



export const GestionComponent = () => {

    const [OpenManagerGestionComponent, setOpenManagerGestionComponent] = useState(true)
    
    const [OpenManagerAgregarProducto, setOpenManagerAgregarProducto] = useState(false)

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
                                }}>
                                <span>AGREGAR PRODUCTO</span>
                            </button>

                            <button>
                                <span>GESTIONAR INVENTARIO</span>
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
    
}

export default GestionComponent