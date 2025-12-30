import { GestionModalsSetters } from '@/shared/types';
import { useEffect } from 'react';
import { ProductForm } from '../../agregar-productos-component/AgregarProductoComponent';

export const AgregarProductoModals = ({ 
    OpenManager, 
    setOpenManager, 
    SetOpenManagerGestionComponentSetter 
}: GestionModalsSetters) => {

    useEffect(() => {
        if (OpenManager) {
            SetOpenManagerGestionComponentSetter(false);
        }
    }, [OpenManager, SetOpenManagerGestionComponentSetter]);

    const handleClose = () => {
        setOpenManager(false);
        SetOpenManagerGestionComponentSetter(true);
    };

    if (!OpenManager) {
        return null;
    }
    
    return (
        <div 
            className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'
            onClick={handleClose}
        >
            {/* max-w-lg mantiene el ancho elegante. p-4 en el padre evita que toque bordes */}
            <div 
                className='w-full max-w-lg' 
                onClick={(e) => e.stopPropagation()}
            >
                <ProductForm onClose={handleClose} />
            </div>
        </div>
    )
}

export default AgregarProductoModals;