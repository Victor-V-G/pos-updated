import { eliminarProductoPromise } from "@/core/infrastructure/firebase";
import { EliminarProductoInterface } from "@/shared/types";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export const EliminarProductoComponent = ({ producto, setRefrescarProductos }: EliminarProductoInterface) => {
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDeleteConfirm = async () => {
        try {
            setLoading(true);
            await eliminarProductoPromise(producto.id);
            setShowConfirmDelete(false);
            setRefrescarProductos(true);
        } catch (error) {
            console.error("Error eliminando producto:", error);
            alert("❌ Error al eliminar el producto");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button 
                className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-800 transition text-xs font-medium"
                onClick={() => setShowConfirmDelete(true)}
            >
                <Trash2 className="w-3.5 h-3.5" />
                ELIMINAR
            </button>

            {/* Modal de Confirmación */}
            {showConfirmDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-gray-900">Confirmar eliminación</h2>
                                <p className="text-sm text-gray-600 mt-1">Esta acción no se puede deshacer</p>
                            </div>
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Contenido */}
                        <p className="text-gray-600 mb-3 text-sm">
                            ¿Deseas eliminar este producto?
                        </p>

                        {/* Detalles del Producto */}
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase">Nombre del Producto</p>
                                <p className="text-sm font-medium text-gray-900">{producto.NombreProducto}</p>
                            </div>
                            <hr className="border-red-200" />
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Código de Barras</p>
                                    <p className="text-sm text-gray-900 font-mono">{producto.CodigoDeBarras}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Tipo</p>
                                    <p className="text-sm text-gray-900">
                                        {producto.TipoProducto === "peso" ? "Por Peso (kg)" : "Unidad"}
                                    </p>
                                </div>
                            </div>
                            <hr className="border-red-200" />
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Precio</p>
                                    <p className="text-lg font-bold text-red-700">
                                        ${Number(producto.Precio).toLocaleString("es-CL")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Stock</p>
                                    <p className="text-sm text-gray-900">
                                        {Number(producto.Stock)} {producto.TipoProducto === "peso" ? "kg" : "unid."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                disabled={loading}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 rounded-lg transition font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={loading}
                                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-lg transition font-medium flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {loading ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EliminarProductoComponent;