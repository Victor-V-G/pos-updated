import { ModificarProductoInterface } from "@/app/shared/interfaces/modificar-producto/ModificarProductoInterface";
import { useState } from "react";
import ModificarProductoModals from "../../../modals/gestion-productos-modals/modificar-productos/ModificarProductoAbrirFormModals";

export const ModificarProductoComponent = ({ producto, setRefrescarProductos }: ModificarProductoInterface) => {
    const [open, setOpen] = useState(false);

    return open ? (
        <ModificarProductoModals producto={producto} setOpenManager={setOpen} setRefrescarProductos={setRefrescarProductos} OpenManager={open} />
    ) : (
        <button className="modificar-button" onClick={() => setOpen(true)}>
            MODIFICAR
        </button>
    );
};

export default ModificarProductoComponent;
