
import { useState } from "react";
import '../../assets/gestion-productos-table.css'
import SearchModificarProducto from "../../modals/search-modals/SearchModificarProducto";
import { SearchModificarProductoInterface } from "@/app/shared/interfaces/search-producto/SearchModificarProductoInterface";


export const SearchModificarComponent = ({ObtenerCodigoDeBarras, setRefrescarProductos} : SearchModificarProductoInterface) => {

    const [OpenManager, setOpenManager] = useState(false)

    

    if (OpenManager == true) {

        return (

            <SearchModificarProducto
                OpenManager={OpenManager}
                setOpenManager={setOpenManager}
                ObtenerCodigoDeBarras={ObtenerCodigoDeBarras}
                setRefrescarProductos={setRefrescarProductos}
            />
        
        )
    }

    return (

        <>

            <button 
                className="modificar-button"
                onClick={()=>{
                    setOpenManager(true);
                }}>
                <span>MODIFICAR</span>
            </button>

        </>

    )

}

export default SearchModificarComponent;