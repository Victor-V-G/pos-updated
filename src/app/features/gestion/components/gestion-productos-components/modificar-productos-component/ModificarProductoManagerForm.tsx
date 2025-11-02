import { modificarProductoPromise, registrarMovimientosPromise } from "@/app/firebase/Promesas";
import { ModificarProductoInterface } from "@/app/shared/interfaces/modificar-producto/ModificarProductoInterface";

import { useState } from "react";
import '../../../assets/css/gestion-productos-styles/modificar-productos-style/modificar-producto-manager-form.css';

export interface ProductoConIDInterface { id: string; NombreProducto: string; CodigoDeBarras: string; Precio: string; Stock: string; }
export const ModificarProductoManagerFrom = ({ producto, setRefrescarProductos }: ModificarProductoInterface) => {

    const [form, setForm] = useState<ProductoConIDInterface>(producto);
    const [original] = useState<ProductoConIDInterface>(producto);

    const handleChange = (name: string, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
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
            await modificarProductoPromise(producto.id, form);
            await registrarMovimientos();

            alert("✅ Producto modificado correctamente");
            setRefrescarProductos(true);
        } catch (error) {
            console.error("❌ Error al modificar producto:", error);
            alert("Ocurrió un error al modificar producto");
        }
    };

    return (
        <>
            <header className='header-title-style'>
                <h1>MODIFICAR PRODUCTO</h1>
            </header>

            <main>
                <form className='modificar-form' onSubmit={handleSubmit}>

                    <div className='input-box'>
                        <input
                            type="text"
                            name="NombreProducto"
                            required
                            value={form.NombreProducto}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                        />
                        <label>NOMBRE DEL PRODUCTO</label>
                    </div>

                    <div className='input-box'>
                        <input
                            type="text"
                            name="CodigoDeBarras"
                            required
                            value={form.CodigoDeBarras}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                        />
                        <label>CODIGO DE BARRAS</label>
                    </div>

                    <div className='input-box'>
                        <input
                            type="number"
                            name="Precio"
                            required
                            value={form.Precio}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                        />
                        <label>PRECIO</label>
                    </div>

                    <div className='input-box'>
                        <input
                            type="number"
                            name="Stock"
                            required
                            value={form.Stock}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                        />
                        <label>STOCK</label>
                    </div>

                    <button className="btn-confirmar" type="submit">
                        <span>MODIFICAR PRODUCTO</span>
                    </button>

                </form>
            </main>
        </>
    );
};

export default ModificarProductoManagerFrom;
