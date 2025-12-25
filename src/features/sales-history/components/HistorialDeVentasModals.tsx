
import { ModalsInterfaceProps } from "@/shared/types";
import HistorialDeVentaComponent from "./HistorialDeVentasComponent";

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