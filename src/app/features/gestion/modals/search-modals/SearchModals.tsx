
import SearchComponent from "../../components/search/SearchComponent";
import { SearchModalsInterface } from "@/app/shared/interfaces/search-producto/SearchModalsInterface";


export const SearchModals = ({OpenManager, setOpenManager, RefrescarProductos, setRefrescarProductos} : SearchModalsInterface) => {

    if (OpenManager == false) {
        return null
    }


    return (

        <>
        
            <SearchComponent
                RefrescarProductos={RefrescarProductos}
                setRefrescarProductos={setRefrescarProductos}
            />
            
            <button 
                onClick={()=>{
                    setOpenManager(false);
                }}>
                <span>VOLVER ATRAS</span>
            </button>

        </>

    )

}

export default SearchModals;