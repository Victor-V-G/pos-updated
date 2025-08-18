import { useState } from "react"
import AgregarProductoModals from "../modals/AgregarProductoModals"




export const GestionComponent = () => {

    const [OpenManagerGestionComponent, setOpenManagerGestionComponent] = useState(true)
    
    const [OpenManagerAgregarProducto, setOpenManagerAgregarProducto] = useState(false)

    if (OpenManagerGestionComponent == true){
        return (
            <>

                <header>
                    <h1>MENU DE GESTION</h1>
                </header>
                
                <main>
                    
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
                    
                </main>

            </>
        )

    }

    if (OpenManagerAgregarProducto == true){
        return(

            <>

                <AgregarProductoModals
                        OpenManager={OpenManagerAgregarProducto}
                        setOpenManager={()=>setOpenManagerAgregarProducto}
                        OpenManagerSetter={OpenManagerGestionComponent}
                        SetOpenManagerGestionComponentSetter={setOpenManagerGestionComponent}
                />

            </>

        )
    }
    
}

export default GestionComponent