import { ModalsInterfaceProps } from "@/shared/types";
import VentaComponent from "./VentaComponent";


export const VentaModals = ({OpenManager} : ModalsInterfaceProps) => {
    
    if (OpenManager == false) {
        return null
    } else {
       return (
            <div className="venta-scope">
                <VentaComponent />
            </div>
        );
    }

}

export default VentaModals;