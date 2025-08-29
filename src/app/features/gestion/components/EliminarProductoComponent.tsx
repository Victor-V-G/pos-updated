import { eliminarProductoPromise, obtenerIDProductosPromise } from "@/app/firebase/Promesas";
import { EliminarProductoInterface } from "@/app/shared/interfaces/eliminar-producto/EliminarProductoInterface";
import { IDDocumentosInterface } from "@/app/shared/interfaces/id-documentos/IDDocumentosInterface";
import { useEffect, useState } from "react";

export const ElimiarProductoComponent = ({ObtenerIndexEliminar, setRefrescarProductos} : EliminarProductoInterface) => {

    const [IDSRecuperados, setIDSRecuperados] = useState<IDDocumentosInterface[]>([])

    useEffect(() => {
        obtenerIDProductosPromise().then((idsDocumentosGet) => {
            setIDSRecuperados(idsDocumentosGet);
        }).catch((error) => {
            console.log(error)
            alert("SE PRODUJO UN ERROR AL RECUPERAR LAS IDS")
        })
    }, [])
    
    const handleCallPromiseEliminarProducto = () => {
        const IdSeleccionada = IDSRecuperados[ObtenerIndexEliminar];
        if (!IdSeleccionada) {
            alert("NO SE ENCONTRO LA ID DEL PRODUCTO")
            return
        }
        eliminarProductoPromise(IdSeleccionada).then(() => {
            alert("PRODUCTO ELIMINADO CORRECTAMENTE");
        }).catch((error) => {
            alert("SE PRODUJO UN ERROR AL ELIMINAR EL PRODUCTO");
            console.log(error);
        })
    } 


    return (

        <>
            {ObtenerIndexEliminar}
            <button 
                onClick={()=>{
                    setRefrescarProductos(true);
                    handleCallPromiseEliminarProducto();
                }}>
                <span>ELIMINAR</span>
            </button>

        </>

    )

}

export default ElimiarProductoComponent;