

import { ModalsInterfaceProps } from "@/app/shared/interfaces/modals/ModalsInterfaceProps";
import HistorialDeVentasGestion from "../../../components/gestion-productos-components/historial-de-ventas-gestion/HistorialDeVentasGestion";
import { GestionModalsSetters } from "@/app/shared/interfaces/gestion/GestionModalsSetters";
import { useEffect } from "react";

export const HistorialDeVentasGesitonModals = ({OpenManager , SetOpenManagerGestionComponentSetter, setOpenManager} : GestionModalsSetters) => {
    
    if (OpenManager == false) {
            return null
        }
    
    if (OpenManager == true){
        useEffect(() => {
            SetOpenManagerGestionComponentSetter(false);
        }, [])
    }

   
    return (
        <>
                
            <div>

                <HistorialDeVentasGestion setOpenManager={setOpenManager} SetOpenManagerGestionComponentSetter={SetOpenManagerGestionComponentSetter} OpenManager OpenManagerSetter/>
                
                
            </div>

        </>
    )
    

}

export default HistorialDeVentasGesitonModals;