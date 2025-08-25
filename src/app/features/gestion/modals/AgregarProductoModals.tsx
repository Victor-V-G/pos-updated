import { GestionModalsSetters } from '@/app/shared/interfaces/gestion/GestionModalsSetters';
import '../assets/agregar-producto-style.css'
import { useEffect } from 'react';

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

                <main>
                    
                    <section className='section-title-style'>
                        
                        <div>
                            <h1>REGISTRAR PRODUCTO</h1> <br />
                        </div>
                        
                    </section> <br />

                    <form className='agregar-form'>

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

                        <button
                            onClick={(e)=>{
                                e.preventDefault();
                            }}>
                            <span>REGISTRAR</span>
                        </button>

                    </form>

                </main>
                
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