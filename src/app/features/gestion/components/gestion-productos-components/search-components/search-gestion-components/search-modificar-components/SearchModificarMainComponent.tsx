
import { useState } from "react";
import '../../../../../assets/css/gestion-productos-styles/table-productos-style/gestion-productos-table.css'
import { SearchModificarProductoInterface } from "@/app/shared/interfaces/search-producto/SearchModificarProductoInterface";
import '../../../../../assets/css/gestion-productos-styles/search-productos-style/search-button.css'
import SearchModificarProducto from "@/app/features/gestion/modals/gestion-productos-modals/search-modals/search-modals-modificar/SearchModificarProducto";

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