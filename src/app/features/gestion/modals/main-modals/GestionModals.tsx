'use client'
import { ModalsInterfaceProps } from "@/app/shared/interfaces/modals/ModalsInterfaceProps";
import LoginModals from "../../../login/modals/LoginModals";
import { useEffect, useState } from "react";
import GestionComponent from "../../components/GestionComponent";


export const GestionModals = ({OpenManager} : ModalsInterfaceProps) => {
    
   

    const [OpenManagerLogin, setOpenManagerLogin] = useState(true)

    useEffect(() => {
      setOpenManagerLogin(true)
    }, [OpenManager])
    

    if (OpenManager == false) {
        return null
    }

    if (OpenManager && OpenManagerLogin === true){
        return (
            <>

                <LoginModals
                    setOpenManagerLogin={setOpenManagerLogin}
                />

            </>
        )
    }

    if (OpenManagerLogin === false){
        return (
            <>

                <GestionComponent/>

            </>
        )
    }

}

export default GestionModals;