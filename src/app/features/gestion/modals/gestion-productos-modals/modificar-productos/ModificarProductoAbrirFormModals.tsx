import { ModificarProductoModalsInterface } from "@/app/shared/interfaces/modificar-producto/ModificarProductoModalsInterface";
import ModificarProductoManagerFrom from "../../../components/gestion-productos-components/modificar-productos-component/ModificarProductoManagerForm";

export const ModificarProductoModals = ({ producto, setOpenManager, setRefrescarProductos }: ModificarProductoModalsInterface) => {
    return (
        <div className='modificar-producto-style'>
            <ModificarProductoManagerFrom producto={producto} setRefrescarProductos={setRefrescarProductos} />
            <div className='div-modals-cerrar'>
                <button className='modals-cerrar' onClick={() => setOpenManager(false)}>
                    VOLVER ATRÁS
                </button>
            </div>
        </div>
    );
};

export default ModificarProductoModals;
