import { GestionModalsSetters } from '@/app/shared/interfaces/gestion/GestionModalsSetters';
import '../../../assets/css/gestion-productos-styles/agregar-productos-style/agregar-producto-style.css'
import { useEffect } from 'react';
import AgregarProductoComponent from '../../../components/gestion-productos-components/agregar-productos-component/AgregarProductoComponent';


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