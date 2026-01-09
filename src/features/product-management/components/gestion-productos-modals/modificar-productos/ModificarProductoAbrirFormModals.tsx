import { ModificarProductoModalsInterface } from "@/shared/types";
import ModificarProductoManagerFrom from "../../modificar-productos-component/ModificarProductoManagerForm";
import { X, ArrowLeft } from "lucide-react";
import { createPortal } from "react-dom";

export const ModificarProductoModals = ({ producto, setOpenManager, setRefrescarProductos }: ModificarProductoModalsInterface) => {
    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Modificar Producto</h2>
                        <p className="text-sm text-gray-600 mt-1">Interfaz para modificar producto</p>
                    </div>
                    <button
                        onClick={() => setOpenManager(false)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6">
                    <ModificarProductoManagerFrom 
                        producto={producto} 
                        setRefrescarProductos={setRefrescarProductos}
                        onSuccess={() => setOpenManager(false)}
                    />
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={() => setOpenManager(false)}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="modificar-form"
                        className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ModificarProductoModals;
