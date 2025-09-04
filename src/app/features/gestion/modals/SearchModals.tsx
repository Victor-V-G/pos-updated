import { ModalsInterfaceProps } from "@/app/shared/interfaces/modals/ModalsInterfaceProps";
import SearchComponent from "../components/SearchComponent";
import { ExtendsModalsRefrescar } from "@/app/shared/interfaces/search-producto/ExtendsModalsRefrescar";

export const SearchModals = ({OpenManager, setOpenManager, setRefrescarProductos} : ExtendsModalsRefrescar) => {

    if (OpenManager == false) {
        return null
    }


    return (

        <>
        
            <SearchComponent
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