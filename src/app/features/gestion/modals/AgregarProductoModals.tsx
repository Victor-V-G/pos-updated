import { GestionModalsSetters } from '@/app/shared/interfaces/gestion/GestionModalsSetters';
import '../assets/agregar-producto-style.css'
import { useEffect } from 'react';
import AgregarProductoComponent from '../components/AgregarProductoComponent';

export const AgregarProductoModals = ({OpenManager, setOpenManager, SetOpenManagerGestionComponentSetter} : GestionModalsSetters) => {

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
            <div className='agregar-producto-style'>

                <AgregarProductoComponent/>
                
                <div className='div-modals-cerrar'>

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

export default AgregarProductoModals;