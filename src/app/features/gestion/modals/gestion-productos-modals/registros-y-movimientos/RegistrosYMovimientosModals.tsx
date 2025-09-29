
import { GestionModalsSetters } from '@/app/shared/interfaces/gestion/GestionModalsSetters';
import '../../../assets/css/gestion-productos-styles/agregar-productos-style/agregar-producto-style.css'
import { useEffect } from 'react';
import AgregarProductoComponent from '../../../components/gestion-productos-components/agregar-productos-component/AgregarProductoComponent';
import RegistrosYMovimientosComponent from '../../../components/gestion-productos-components/registros-y-movimientos-component/RegistrosYMovimientosComponent';


export const RegistrosYMovimientosModals = ({OpenManager, setOpenManager, SetOpenManagerGestionComponentSetter} : GestionModalsSetters) => {

    if (OpenManager == false) {
        return null
    }

    if (OpenManager == true){
        useEffect(() => {
            SetOpenManagerGestionComponentSetter(false);
        }, [])
    }

    
    return (
        <>
        
            <div>

                <RegistrosYMovimientosComponent/>
                
                <div>

                    <button 
                        className='modals-cerrar'
                        onClick={()=>{
                            setOpenManager(false);
                            SetOpenManagerGestionComponentSetter(true);
                        }}>
                        <span>VOLVER ATRAS</span>
                    </button>

                </div>
                
            </div>

        </>
    )
}

export default RegistrosYMovimientosModals;