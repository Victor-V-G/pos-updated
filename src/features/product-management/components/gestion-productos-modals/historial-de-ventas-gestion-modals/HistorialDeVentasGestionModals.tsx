

import { ModalsInterfaceProps } from "@/shared/types";
import HistorialDeVentasGestion from "../../historial-de-ventas-gestion/HistorialDeVentasGestion";
import { GestionModalsSetters } from "@/shared/types";
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

                <HistorialDeVentasGestion setOpenManager={() => setOpenManager(false)} SetOpenManagerGestionComponentSetter={SetOpenManagerGestionComponentSetter} OpenManager={OpenManager} OpenManagerSetter={setOpenManager}/>
                
                
            </div>

        </>
    )
    

}

export default HistorialDeVentasGesitonModals;