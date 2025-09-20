import { ProductoInterface } from '@/app/shared/interfaces/producto/ProductoInterface';
import '../assets/agregar-producto-style.css'
import { useState } from 'react';
import { registrarProductoPromise } from '@/app/firebase/Promesas';


const InitialStateProducto : ProductoInterface = {
    NombreProducto : "",
    CodigoDeBarras : "",
    Precio : "",
    Stock : ""
}

export const AgregarProductoComponent = () => {

    const [Producto, setProducto] = useState(InitialStateProducto);

    const handleInputProducto = (name:string , value:string) => {
        setProducto(
            {...Producto,[name]:value}
        )
    }

    const handleCallPromiseRegistrarProductos = () => {
        registrarProductoPromise(Producto).then(()=>{
            alert("PRODUCTO REGISTRADO CORRECTAMENTE")
            setProducto(InitialStateProducto);
        }).catch((error)=>{
            alert("OCURRIO UN ERROR AL REGISTRAR")
            console.log(error)
        })
    }

    return (
        <>

            <header className='header-title-style'>

                    <div>
                        <h1>REGISTRAR PRODUCTO</h1> <br />
                    </div>

            </header>

            <main>

                <form className='agregar-form'>

                    <div className='input-box'>
                        <input 
                            type="text"
                            name="NombreProducto"
                            required spellCheck="false"
                            value={Producto.NombreProducto}
                            onChange={(e)=>handleInputProducto(e.currentTarget.name, e.currentTarget.value)}
                        />
                        <label>NOMBRE DEL PRODUCTO</label> <br />
                    </div>
                    
                    <div className='input-box'>
                        <input 
                            type="number" 
                            name="CodigoDeBarras"
                            required spellCheck="false"
                            value={Producto.CodigoDeBarras}
                            onChange={(e)=>handleInputProducto(e.currentTarget.name, e.currentTarget.value)}
                        /> 
                        <label>CODIGO DE BARRAS</label><br />
                    </div>
                    
                    <div className='input-box'>
                        <input 
                            type="number" 
                            name="Precio"
                            required spellCheck="false"
                            value={Producto.Precio}
                            onChange={(e)=>handleInputProducto(e.currentTarget.name, e.currentTarget.value)}
                        />
                        <label>PRECIO</label> <br />
                    </div>
                    
                    <div className='input-box'>
                        <input 
                            type="number" 
                            name="Stock"
                            required spellCheck="false"
                            value={Producto.Stock}
                            onChange={(e)=>handleInputProducto(e.currentTarget.name, e.currentTarget.value)}
                        /> 
                        <label>STOCK</label><br />
                    </div>
                    
                    <button
                        onClick={(e)=>{
                            e.preventDefault();
                            handleCallPromiseRegistrarProductos();
                        }}>
                        <span>REGISTRAR</span>
                    </button>

                </form>

            </main>

        </>
        

    )

}

export default AgregarProductoComponent;