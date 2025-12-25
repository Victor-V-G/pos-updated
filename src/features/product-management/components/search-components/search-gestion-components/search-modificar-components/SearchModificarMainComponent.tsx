
import { useState } from "react";
import '@/assets/styles/gestion-productos-styles/table-productos-style/gestion-productos-table.css'
import { SearchModificarProductoInterface } from "@/shared/types";
import '@/assets/styles/gestion-productos-styles/search-productos-style/search-button.css'
import SearchModificarProducto from "../../gestion-productos-modals/search-modals/search-modals-modificar/SearchModificarProducto";

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
                className="modificar-search-button"
                onClick={()=>{
                    setOpenManager(true);
                }}>
                <span>MODIFICAR</span>
            </button>

        </>

    )

}

export default SearchModificarComponent;