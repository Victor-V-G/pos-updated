import { ModalsInterfaceProps } from "@/app/shared/interfaces/modals/ModalsInterfaceProps";
import VerStockComponent from "../components/VerStockComponent";


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