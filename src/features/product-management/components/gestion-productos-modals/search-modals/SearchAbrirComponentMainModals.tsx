
import { SearchMainComponent } from '../../search-components/SearchMainComponent'
import { SearchModalsInterface } from "@/shared/types";
import '@/assets/styles/gestion-productos-styles/search-productos-style/search-component.css'


export const SearchAbrirComponentMainModals = ({OpenManager, setOpenManager, RefrescarProductos, setRefrescarProductos} : SearchModalsInterface) => {

    if (OpenManager == false) {
        return null
    }


    return (

        <>

            <div className="search-component">
                
                <SearchMainComponent
                    RefrescarProductos={RefrescarProductos}
                    setRefrescarProductos={setRefrescarProductos}
                />
                
                <div className="div-modals-cerrar-search">

                    <button 
                        onClick={()=>{
                            setOpenManager(false);
                        }}>
                        <span>VOLVER ATRAS</span>
                    </button>

                </div>

            </div>

        </>

    )

}

export default SearchAbrirComponentMainModals;