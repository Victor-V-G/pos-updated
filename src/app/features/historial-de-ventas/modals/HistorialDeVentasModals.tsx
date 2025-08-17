
import { ModalsInterfaceProps } from "@/app/shared/interfaces/modals/ModalsInterfaceProps";
import HistorialDeVentaComponent from "../components/HistorialDeVentasComponent";

export const HistorialDeVentaModals = ({OpenManager} : ModalsInterfaceProps) => {
    
    if (OpenManager == false) {
        return null
    } else {
        return (
            <div>
                <HistorialDeVentaComponent/>
            </div>
        )
    }

}

export default HistorialDeVentaModals;