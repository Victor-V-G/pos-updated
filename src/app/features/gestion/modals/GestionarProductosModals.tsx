import { GestionModalsSetters } from "@/app/shared/interfaces/gestion/GestionModalsSetters";
import { useEffect } from "react";
import GestionProductosComponent from "../components/GestionarProductosComponent";

export const GestionarProductosModals = ({OpenManager, setOpenManager, SetOpenManagerGestionComponentSetter} : GestionModalsSetters) => { 

    if (OpenManager == false){
        return null
    }

    if (OpenManager == true){
        useEffect(() => {
            SetOpenManagerGestionComponentSetter(false);
        }, [])
    }

    return (

        <>

            <GestionProductosComponent/>
            
            <button 
                onClick={()=>{
                    setOpenManager(false);
                    SetOpenManagerGestionComponentSetter(true);
                }}>
                <span>VOLVER ATRAS</span>
            </button>

        </>

    )



}

export default GestionarProductosModals;