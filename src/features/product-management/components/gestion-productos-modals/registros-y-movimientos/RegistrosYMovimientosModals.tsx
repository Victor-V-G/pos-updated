
import { GestionModalsSetters } from '@/shared/types';
import '@/assets/styles/modals-close-style/modals-cerrar-button.css'
import { useEffect } from 'react';
import RegistrosYMovimientosComponent from '../../registros-y-movimientos-component/RegistrosYMovimientosComponent';


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
                
                <div className='modals-cerrar-button'>

                    <button 
                        onClick={()=>{
                            setOpenManager(false);
                            SetOpenManagerGestionComponentSetter(true);
                        }}>
                        <span>← VOLVER ATRAS</span>
                    </button>

                </div>
                
            </div>

        </>
    )
}

export default RegistrosYMovimientosModals;