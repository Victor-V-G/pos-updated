import { modificarProductoPromise, registrarMovimientosPromise } from "@/core/infrastructure/firebase";
import { ModificarProductoInterface } from "@/shared/types";
import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

export interface ProductoConIDInterface { id: string; NombreProducto: string; CodigoDeBarras: string; Precio: string; Stock: string; TipoProducto?: string; }

export const ModificarProductoManagerFrom = ({ producto, setRefrescarProductos, onSuccess }: ModificarProductoInterface & { onSuccess?: () => void }) => {
    const [form, setForm] = useState<ProductoConIDInterface>(producto);
    const [original] = useState<ProductoConIDInterface>(producto);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (name: string, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const registrarMovimientos = async () => {
        if (form.Precio !== original.Precio) {
            await registrarMovimientosPromise(
                "MODIFICAR PRODUCTO",
                `Precio de ${original.NombreProducto} (${original.CodigoDeBarras}) cambió: $${original.Precio} → $${form.Precio}`
            );
        }
        if (form.Stock !== original.Stock) {
            await registrarMovimientosPromise(
                "MODIFICAR PRODUCTO",
                `Stock de ${original.NombreProducto} (${original.CodigoDeBarras}) cambió: ${original.Stock} → ${form.Stock}`
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            setError(null);

            await modificarProductoPromise(producto.id, form);
            await registrarMovimientos();

            setSuccess(true);
            setRefrescarProductos(true);
            
            setTimeout(() => {
                onSuccess?.();
            }, 1500);
        } catch (error) {
            console.error("❌ Error al modificar producto:", error);
            setError("Ocurrió un error al modificar el producto. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} id="modificar-form" className="space-y-4">
            {/* Nombre del Producto */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Producto
                </label>
                <input
                    type="text"
                    name="NombreProducto"
                    required
                    value={form.NombreProducto}
                    onChange={(e) => handleChange(e.target.name, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Leche descremada"
                />
            </div>

            {/* Código de Barras */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Código de Barras
                </label>
                <input
                    type="text"
                    name="CodigoDeBarras"
                    required
                    value={form.CodigoDeBarras}
                    onChange={(e) => handleChange(e.target.name, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="Ej: 7501234567890"
                />
            </div>

            {/* Precio */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                    <input
                        type="number"
                        name="Precio"
                        required
                        value={form.Precio}
                        onChange={(e) => handleChange(e.target.name, e.target.value)}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                    />
                </div>
                {form.Precio !== original.Precio && (
                    <p className="text-xs text-blue-600 mt-1">
                        Cambio: ${original.Precio} → ${form.Precio}
                    </p>
                )}
            </div>

            {/* Stock */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock ({original.TipoProducto === "peso" ? "kg" : "unidades"})
                </label>
                <input
                    type="number"
                    name="Stock"
                    required
                    value={form.Stock}
                    onChange={(e) => handleChange(e.target.name, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                />
                {form.Stock !== original.Stock && (
                    <p className="text-xs text-blue-600 mt-1">
                        Cambio: {original.Stock} → {form.Stock} {original.TipoProducto === "peso" ? "kg" : "unid."}
                    </p>
                )}
            </div>

            {/* Mensaje de Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Mensaje de Éxito */}
            {success && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">Producto modificado correctamente</p>
                </div>
            )}
        </form>
    );
};

export default ModificarProductoManagerFrom;
