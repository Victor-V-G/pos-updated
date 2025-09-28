
import { ModificarProductoInterface } from "@/app/shared/interfaces/modificar-producto/ModificarProductoInterface";
import { useState } from "react";
import '../../../assets/css/gestion-productos-styles/table-productos-style/gestion-productos-table.css'
import ModificarProductoModals from "../../../modals/gestion-productos-modals/modificar-productos/ModificarProductoAbrirFormModals";


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