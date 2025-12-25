import { ModalsInterfaceProps } from "@/shared/types";
import VerStockComponent from "./VerStockComponent";


export const VerStockModals = ({OpenManager} : ModalsInterfaceProps) => {
    
    if (OpenManager == false) {
        return null
    } else {
        return (
            <div>
                <VerStockComponent/>
            </div>
        )
    }

}

export default VerStockModals;