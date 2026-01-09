import { ModificarProductoInterface } from "@/shared/types";
import { useState } from "react";
import { Pencil } from "lucide-react";
import ModificarProductoModals from "../gestion-productos-modals/modificar-productos/ModificarProductoAbrirFormModals";

export const ModificarProductoComponent = ({ producto, setRefrescarProductos }: ModificarProductoInterface) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button 
                className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-800 transition text-xs font-medium"
                onClick={() => setOpen(true)}
                title="Modificar producto"
            >
                <Pencil className="w-3.5 h-3.5" />
                MODIFICAR
            </button>
            {open && (
                <ModificarProductoModals 
                    producto={producto} 
                    setOpenManager={setOpen} 
                    setRefrescarProductos={setRefrescarProductos} 
                    OpenManager={open} 
                />
            )}
        </>
    );
};

export default ModificarProductoComponent;
