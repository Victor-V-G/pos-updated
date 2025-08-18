import { GestionModalsSetters } from '@/app/shared/interfaces/gestion/GestionModalsSetters';
import '../assets/agregar-producto-style.css'
import { useEffect } from 'react';

export const AgregarProductoModals = ({OpenManager, SetOpenManagerGestionComponentSetter} : GestionModalsSetters) => {

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

                <header>
                    <h1>REGISTRAR PRODUCTO</h1>
                </header>

                <main>

                    <form>

                        <span>NOMBRE DEL PRODUCTO</span> <br />
                        <input 
                            type="text"
                            name="Nombre"
                        /> <br />
                        
                        <span>CODIGO DE BARRAS</span> <br />
                        <input 
                            type="text" 
                            name="CodigoDeBarras"
                        /> <br />
                        
                        <span>PRECIO</span> <br />
                        <input 
                            type="text" 
                            name="Precio"
                        /> <br />

                        <span>STOCK</span> <br />
                        <input 
                            type="text" 
                            name="Stock"
                        /> <br />

                        <button>
                            <span>REGISTRAR</span>
                        </button>

                    </form>

                </main>
                
            </div>
        </>
    )
}

export default AgregarProductoModals;