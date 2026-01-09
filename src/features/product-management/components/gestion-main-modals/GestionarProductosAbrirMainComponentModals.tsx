import { GestionModalsSetters } from "@/shared/types";
import { useEffect } from "react";
import GestionProductosMainComponent from "../GestionarProductosMainComponent";



export const GestionarProductosModals = ({OpenManager, setOpenManager, SetOpenManagerGestionComponentSetter} : GestionModalsSetters) => { 

    if (OpenManager == false){
        return null
    }

    if (OpenManager == true){
        useEffect(() => {
            SetOpenManagerGestionComponentSetter(false);
        }, [])
    }

    const handleVolver = () => {
        setOpenManager(false);
        SetOpenManagerGestionComponentSetter(true);
    }

    return (
        <GestionProductosMainComponent onVolver={handleVolver} />
    )



}

export default GestionarProductosModals;