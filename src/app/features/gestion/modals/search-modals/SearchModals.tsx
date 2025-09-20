
import SearchComponent from "../../components/search/SearchComponent";
import { SearchModalsInterface } from "@/app/shared/interfaces/search-producto/SearchModalsInterface";
import '../../assets/search-style/search-component.css'


export const SearchModals = ({OpenManager, setOpenManager, RefrescarProductos, setRefrescarProductos} : SearchModalsInterface) => {

    if (OpenManager == false) {
        return null
    }


    return (

        <>

            <div className="search-component">
                
                <SearchComponent
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

export default SearchModals;