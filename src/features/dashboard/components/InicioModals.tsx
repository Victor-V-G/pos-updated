
import { InicioComponent } from "./InicioComponent";
import { ExtendsModalsSidebar } from "@/shared/types";

export const InicioModals = ({
    OpenManager,
    setOpenManagerInicio,
    setOpenManagerVenta,
    setOpenManagerVerStock,
    setOpenManagerHistorialDeVenta,
    setOpenManagerGestion
}: ExtendsModalsSidebar) => {
    
    if (OpenManager == false) {
        return null
    } else {
        return (
            <div>
                <InicioComponent
                    setOpenManagerInicio={setOpenManagerInicio}
                    setOpenManagerVenta={setOpenManagerVenta}
                    setOpenManagerVerStock={setOpenManagerVerStock}
                    setOpenManagerHistorialDeVenta={setOpenManagerHistorialDeVenta}
                    setOpenManagerGestion={setOpenManagerGestion}
                />
            </div>
        )
    }

}

export default InicioModals;