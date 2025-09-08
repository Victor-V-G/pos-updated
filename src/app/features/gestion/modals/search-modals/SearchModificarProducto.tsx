
import '../../assets/modificar-producto-manager-form.css'
import SearchModificarProductoManagerForm from "../../components/search/SearchModificarProductoManagerForm";
import { ExtendsModalsModificar } from "@/app/shared/interfaces/search-producto/ExtendsModalsModificar";

export const SearchModificarProducto = ({OpenManager, setOpenManager, ObtenerCodigoDeBarras, setRefrescarProductos} : ExtendsModalsModificar) => {


    if (OpenManager == false) {
        return null
    }


    return (

        <>

            <div className='modificar-producto-style'>

                <SearchModificarProductoManagerForm
                    ObtenerCodigoDeBarras={ObtenerCodigoDeBarras}
                    setRefrescarProductos={setRefrescarProductos}
                />
                
                <div className='div-modals-cerrar'>

                    <button
                        className='modals-cerrar'
                        onClick={()=>{
                            setRefrescarProductos(false);
                            setOpenManager(false);
                        }}>
                        <span>VOLVER ATRAS</span>
                    </button>

                </div>

            </div>

        </>

    )

}

export default SearchModificarProducto;