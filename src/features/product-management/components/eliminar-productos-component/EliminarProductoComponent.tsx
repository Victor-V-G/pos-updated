import { eliminarProductoPromise } from "@/core/infrastructure/firebase";
import { EliminarProductoInterface } from "@/shared/types";

export const EliminarProductoComponent = ({ producto, setRefrescarProductos }: EliminarProductoInterface) => {

    const handleEliminar = async () => {
        if (!confirm(`¿Eliminar el producto "${producto.NombreProducto}"?`)) return;

        await eliminarProductoPromise(producto.id);
        alert("✅ Producto eliminado correctamente");
        setRefrescarProductos(true);
    };

    return (
        <button className="button-eliminar" onClick={handleEliminar}>
            ELIMINAR
        </button>
    );
};

export default EliminarProductoComponent;