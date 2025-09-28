
import { ModificarProductoModalsInterface } from "@/app/shared/interfaces/modificar-producto/ModificarProductoModalsInterface";
import ModificarProductoManagerFrom from "../../../components/gestion-productos-components/modificar-productos-component/ModificarProductoManagerForm";
import '../../../assets/css/gestion-productos-styles/modificar-productos-style/modificar-producto-manager-form.css'

export const ModificarProductoModals = ({OpenManager, setOpenManager, ObtenerIndexModificar, setRefrescarProductos} : ModificarProductoModalsInterface) => {


    if (OpenManager == false) {
        return null
    }


    return (

        <>

            <div className='modificar-producto-style'>

                <ModificarProductoManagerFrom
                    ObtenerIndexModificar={ObtenerIndexModificar}
                    setRefrescarProductos={setRefrescarProductos}
                />
                
                <div className='div-modals-cerrar'>

                    <button
                        className='modals-cerrar'
                        onClick={()=>{
                            setRefrescarProductos(false);
                            setOpenManager(false);
                        }}>
                        <span>VOLVER ATRAS</span>
                    </button>

                </div>

            </div>

        </>

    )

}

export default ModificarProductoModals;