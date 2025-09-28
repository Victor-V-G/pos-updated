
import SearchModificarProductoManagerForm from '@/app/features/gestion/components/gestion-productos-components/search-components/search-gestion-components/search-modificar-components/SearchModificarProductoManagerForm';
import '../../../../assets/css/gestion-productos-styles/modificar-productos-style/modificar-producto-manager-form.css'
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