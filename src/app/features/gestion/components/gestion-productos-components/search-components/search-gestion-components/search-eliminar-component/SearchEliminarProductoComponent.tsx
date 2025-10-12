import { eliminarProductoPromise, ObtenerIDProductoSearchEliminarPromise, registrarMovimientosPromise, searchObtenerProductoPorIdPromise } from "@/app/firebase/Promesas";
import { IDDocumentosInterface } from "@/app/shared/interfaces/id-documentos/IDDocumentosInterface";
import { SearchEliminarInterface } from "@/app/shared/interfaces/search-producto/SearchEliminarInterface";
import { useEffect, useState } from "react";
import '../../../../../assets/css/gestion-productos-styles/search-productos-style/search-button.css'

export const SearchEliminarProductoComponent = ({ ObtenerCodigoDeBarras, setRefrescarProductos }: SearchEliminarInterface) => {

    const [IDRecuperado, setIDRecuperado] = useState<IDDocumentosInterface | null>(null);

    useEffect(() => {
        const obtenerID = async () => {
            try {
                const idRecuperadoGet = await ObtenerIDProductoSearchEliminarPromise("CodigoDeBarras", ObtenerCodigoDeBarras);
                if (idRecuperadoGet.length > 0) {
                    setIDRecuperado(idRecuperadoGet[0]);
                } else {
                    alert("NO SE ENCONTRÓ EL PRODUCTO CON ESE CÓDIGO DE BARRAS");
                }
            } catch (error) {
                console.error("Error al recuperar ID:", error);
                alert("SE PRODUJO UN ERROR AL RECUPERAR EL PRODUCTO");
            }
        };

        obtenerID();
    }, [ObtenerCodigoDeBarras]);

    const handleEliminarProducto = async () => {
        try {
            if (!IDRecuperado) {
                alert("ID DEL PRODUCTO NO DISPONIBLE");
                return;
            }

            // Paso 1: Obtener el producto completo
            const productoGet = await searchObtenerProductoPorIdPromise(IDRecuperado);
            if (!productoGet || productoGet.length === 0) {
                alert("NO SE RECUPERÓ EL PRODUCTO");
                return;
            }

            const producto = productoGet[0];

            // Paso 2: Registrar movimiento
            const mensajeMovimiento = `Se eliminó el producto: Nombre: ${producto.NombreProducto}, Código de barras: ${producto.CodigoDeBarras}, Precio: $${producto.Precio}, Stock: ${producto.Stock}`;
            await registrarMovimientosPromise("ELIMINAR PRODUCTO", mensajeMovimiento);
            console.log("MOVIMIENTO REGISTRADO");

            // Paso 3: Eliminar el producto
            await eliminarProductoPromise(IDRecuperado);
            alert("PRODUCTO ELIMINADO CORRECTAMENTE");

            // Paso 4: Refrescar productos
            setRefrescarProductos(true);

        } catch (error) {
            console.error("ERROR AL ELIMINAR PRODUCTO:", error);
            alert("SE PRODUJO UN ERROR DURANTE LA ELIMINACIÓN");
        }
    };

    return (
        <button
            className="button-eliminar"
            onClick={handleEliminarProducto}
            disabled={!IDRecuperado} // desactiva el botón si no hay ID aún
        >
            <span>ELIMINAR</span>
        </button>
    );
};

export default SearchEliminarProductoComponent;
