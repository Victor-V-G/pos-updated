import { useEffect, useState } from 'react'
import '../assets/css/ingresar-cdb-style.css'
import { obtenerProductosPromise } from '@/app/firebase/Promesas'
import { ProductoInterface } from '@/app/shared/interfaces/producto/ProductoInterface'
import { InterfaceIngresarCDB } from '@/app/shared/interfaces/ingresar-cdb/InterfaceIngresarCDB'
import { SetterProductoFind } from '@/app/shared/interfaces/ingresar-cdb/SetterProductoFind'


const InitialStateInputCDB : InterfaceIngresarCDB = {
    CodigoDeBarras: "",
}

export const IngresarCDB = ({setProductoFindSetter} : SetterProductoFind) => {
    
    const [InputCDB, setInputCDB] = useState(InitialStateInputCDB)
    const [ProductoObtenido, setProductoObtenido] = useState<ProductoInterface[]>([])
    const [ProductoEncontrado, setProductoEncontrado] = useState<ProductoInterface[]>([])

    useEffect(() => {
      obtenerProductosPromise().then((productoGet) => {
        setProductoObtenido(productoGet)
      })
    }, [])

    /*aplicar .sort para buscar por codigo de barras el producto almacenado */

    const handleRecuperarInput = (name:string, value:string) => {
        setInputCDB(
            {...InputCDB,[name]:value}
        )
    }

    useEffect(() => {
        const ProductoFind = ProductoObtenido.find(p => p.CodigoDeBarras === InputCDB.CodigoDeBarras);
        if (ProductoFind) {
            setProductoEncontrado([ProductoFind]);
        }
    }, [InputCDB.CodigoDeBarras, ProductoObtenido]);

    useEffect(() => {
      setProductoFindSetter(ProductoEncontrado)
    }, [ProductoEncontrado])
    

    return (

        <>
            <form className='ingresar-cdb'>
                <div className='input-box'>
                    <input 
                        type="number"
                        required spellCheck="false"
                        name='CodigoDeBarras'
                        value={InputCDB.CodigoDeBarras}
                        onChange={(e)=>{
                            handleRecuperarInput(e.currentTarget.name, e.currentTarget.value);
                        }}
                    />
                    <label>CODIGO DE BARRAS</label>
                </div>
            </form>
        </>

    )
}

export default IngresarCDB;