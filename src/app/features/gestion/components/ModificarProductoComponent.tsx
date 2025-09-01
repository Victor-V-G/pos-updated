
import { ModificarProductoInterface } from "@/app/shared/interfaces/modificar-producto/ModificarProductoInterface";
import { useState } from "react";
import ModificarProductoModals from "../modals/ModificarProductoModals";
import '../assets/gestion-productos-table.css'


export const ModificarProductoComponent = ({ObtenerIndexModificar, setRefrescarProductos} : ModificarProductoInterface) => {

    const [OpenManager, setOpenManager] = useState(false)

    

    if (OpenManager == true) {

        return (

            <ModificarProductoModals
                OpenManager={OpenManager}
                setOpenManager={setOpenManager}
                ObtenerIndexModificar={ObtenerIndexModificar}
                setRefrescarProductos={setRefrescarProductos}
            />
        
        )
    }

    return (

        <>

            <button 
                className="modificar-button"
                onClick={()=>{
                    setOpenManager(true);
                }}>
                <span>MODIFICAR</span>
            </button>

        </>

    )

}

export default ModificarProductoComponent;