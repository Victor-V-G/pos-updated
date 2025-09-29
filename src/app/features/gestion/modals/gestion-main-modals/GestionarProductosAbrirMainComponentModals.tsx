import { GestionModalsSetters } from "@/app/shared/interfaces/gestion/GestionModalsSetters";
import { useEffect } from "react";
import '../../assets/css/modals-close-style/modals-cerrar-button.css'
import GestionProductosMainComponent from "../../components/gestion-productos-components/GestionarProductosMainComponent";



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

            <GestionProductosMainComponent/>

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