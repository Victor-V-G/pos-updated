import { obtenerIDProductosPromise } from "@/app/firebase/Promesas";
import { IDDocumentosInterface } from "@/app/shared/interfaces/id-documentos/IDDocumentosInterface";
import { ModificarProductoInterface } from "@/app/shared/interfaces/modificar-producto/ModificarProductoInterface";
import { useEffect, useState } from "react";
import ModificarProductoModals from "../modals/ModificarProductoModals";



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

            {ObtenerIndexModificar}
            <button 
                onClick={()=>{
                    setOpenManager(true);
                }}>
                <span>MODIFICAR</span>
            </button>

        </>

    )

}

export default ModificarProductoComponent;