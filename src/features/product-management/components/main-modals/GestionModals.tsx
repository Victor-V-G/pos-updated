'use client'
import { ModalsInterfaceProps } from "@/shared/types";
import LoginModals from "@/features/auth/components/LoginModals";
import { useEffect, useState } from "react";
import GestionComponent from "../GestionComponent";


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