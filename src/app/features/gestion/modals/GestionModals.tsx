import { ModalsInterfaceProps } from "@/app/shared/interfaces/modals/ModalsInterfaceProps";
import GestionComponent from "../components/GestionComponent";

export const GestionModals = ({OpenManager} : ModalsInterfaceProps) => {
    
    if (OpenManager == false) {
        return null
    } else {
        return (
            <div>
                <GestionComponent/>
            </div>
        )
    }

}

export default GestionModals;