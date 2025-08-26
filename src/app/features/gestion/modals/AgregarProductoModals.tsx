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

                        <div className='input-box'>
                            <input 
                                type="text"
                                name="Nombre"
                                required spellCheck="false"
                            />
                            <label>NOMBRE DEL PRODUCTO</label> <br />
                        </div>
                        
                        <div className='input-box'>
                            <input 
                                type="text" 
                                name="CodigoDeBarras"
                                required spellCheck="false"
                            /> 
                            <label>CODIGO DE BARRAS</label><br />
                        </div>
                        
                        <div className='input-box'>
                            <input 
                                type="text" 
                                name="Precio"
                                required spellCheck="false"
                            />
                            <label>PRECIO</label> <br />
                        </div>
                        
                        <div className='input-box'>
                            <input 
                                type="text" 
                                name="Stock"
                                required spellCheck="false"
                            /> 
                            <label>STOCK</label><br />
                        </div>
                        
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