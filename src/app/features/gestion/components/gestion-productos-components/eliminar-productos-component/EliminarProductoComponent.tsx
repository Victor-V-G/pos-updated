import { eliminarProductoPromise, obtenerIDProductosPromise, registrarMovimientosPromise, searchObtenerProductoPorIdPromise } from "@/app/firebase/Promesas";
import { EliminarProductoInterface } from "@/app/shared/interfaces/eliminar-producto/EliminarProductoInterface";
import { IDDocumentosInterface } from "@/app/shared/interfaces/id-documentos/IDDocumentosInterface";
import { useEffect, useState } from "react";

export const ElimiarProductoComponent = ({ ObtenerIndexEliminar, setRefrescarProductos }: EliminarProductoInterface) => {

    const [IDSRecuperados, setIDSRecuperados] = useState<IDDocumentosInterface[]>([]);

    useEffect(() => {
        obtenerIDProductosPromise()
            .then((idsDocumentosGet) => {
                setIDSRecuperados(idsDocumentosGet);
            })
            .catch((error) => {
                console.error(error);
                alert("SE PRODUJO UN ERROR AL RECUPERAR LAS IDS");
            });
    }, []);

    const handleEliminar = async () => {
        try {
            const IdSeleccionada = IDSRecuperados[ObtenerIndexEliminar];

            if (!IdSeleccionada) {
                alert("NO SE ENCONTRÓ LA ID DEL PRODUCTO");
                return;
            }

            // Paso 1: Obtener producto por ID
            const productoGet = await searchObtenerProductoPorIdPromise(IdSeleccionada);
            if (!productoGet || productoGet.length === 0) {
                alert("NO SE RECUPERÓ EL PRODUCTO");
                return;
            }

            const producto = productoGet[0]; // el único producto recuperado

            // Paso 2: Registrar movimiento
            const mensajeMovimiento = `Se eliminó el producto: Nombre: ${producto.NombreProducto}, Código de barras: ${producto.CodigoDeBarras}, Precio: $${producto.Precio}, Stock: ${producto.Stock}`;
            await registrarMovimientosPromise("ELIMINAR PRODUCTO", mensajeMovimiento);
            console.log("MOVIMIENTO REGISTRADO");

            // Paso 3: Eliminar producto
            await eliminarProductoPromise(IdSeleccionada);
            alert("PRODUCTO ELIMINADO CORRECTAMENTE");

            // Paso 4: Refrescar
            setRefrescarProductos(true);

        } catch (error) {
            console.error("ERROR EN EL PROCESO DE ELIMINACIÓN:", error);
            alert("OCURRIÓ UN ERROR AL ELIMINAR EL PRODUCTO");
        }
    };

    return (
        <button className="button-eliminar" onClick={handleEliminar}>
            <span>ELIMINAR</span>
        </button>
    );
};

export default ElimiarProductoComponent;
