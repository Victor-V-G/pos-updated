import { GestionModalsSetters } from "@/app/shared/interfaces/gestion/GestionModalsSetters";
import { useEffect } from "react";
import GestionProductosComponent from "../components/GestionarProductosComponent";
import '../assets/modals-cerrar-button.css'
import SearchModals from "./SearchModals";

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

            <div className="modals-cerrar-button">  

                <button
                    onClick={()=>{
                        setOpenManager(false);
                        SetOpenManagerGestionComponentSetter(true);
                    }}>
                    <span>VOLVER ATRAS</span>
                </button>
            
            </div>

        </>

    )



}

export default GestionarProductosModals;