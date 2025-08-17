
import InicioComponent from "../components/InicioComponent";
import { ExtendsModalsSidebar } from "@/app/shared/interfaces/modals/ExtendsModalsSidebar";

export const InicioModals = ({OpenManager, setOpenManagerInicio, setOpenManagerVenta, setOpenManagerVerStock, setOpenManagerHistorialDeVenta, setOpenManagerGestion} : ExtendsModalsSidebar) => {
    
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