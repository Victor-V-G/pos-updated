import { eliminarProductoPromise, ObtenerIDProductoSearchEliminarPromise } from "@/app/firebase/Promesas";
import { IDDocumentosInterface } from "@/app/shared/interfaces/id-documentos/IDDocumentosInterface";
import { SearchEliminarInterface } from "@/app/shared/interfaces/search-producto/SearchEliminarInterface";
import { useEffect, useState } from "react";
import '../../assets/search-style/search-button.css'

export const SearchEliminarProductoComponent = ({ObtenerCodigoDeBarras, setRefrescarProductos} : SearchEliminarInterface) => {

    const [IDRecuperado, setIDRecuperado] = useState<IDDocumentosInterface[]>([])

    const handleObtenerIDCallPromise = () => {
        ObtenerIDProductoSearchEliminarPromise("CodigoDeBarras", ObtenerCodigoDeBarras).then((idRecuperadaDocumentoGet)=>{
            setIDRecuperado(idRecuperadaDocumentoGet)
        }).catch((error)=>{
            alert("SE PRODUJO UN ERROR AL ELIMINAR")
            console.log(error)
        })
    }

    useEffect(() => {
      handleObtenerIDCallPromise()
    }, [])
    
    const handleEliminarProducto = () => {
        eliminarProductoPromise(IDRecuperado[0]).then(()=>{
            alert("PRODUCTO ELIMINADO CORRECTAMENTE")
        }).catch((error)=>{
            alert("SE PRODUJO UN ERROR AL ELIMINAR EL PRODUCTO")
            console.log(error)
        })
    }
      


    return (
        <>

            <button
                className="button-eliminar"
                onClick={()=>{
                    handleEliminarProducto();
                    setRefrescarProductos(true);
                }}>
                <span>ELIMINAR</span>
            </button>

        </>
    )
}

export default SearchEliminarProductoComponent;