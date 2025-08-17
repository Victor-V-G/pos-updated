import { ModalsInterfaceProps } from "@/app/shared/interfaces/modals/ModalsInterfaceProps";
import VentaComponent from "../components/VentaComponent";


export const VentaModals = ({OpenManager} : ModalsInterfaceProps) => {
    
    if (OpenManager == false) {
        return null
    } else {
        return (
            <div>
                <VentaComponent/>
            </div>
        )
    }

}

export default VentaModals;