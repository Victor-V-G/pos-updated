import { useEffect, useState } from 'react'
import '../assets/css/ingresar-cdb-style.css'
import { obtenerProductosPromise } from '@/app/firebase/Promesas'
import { ProductoInterface } from '@/app/shared/interfaces/producto/ProductoInterface'
import { InterfaceIngresarCDB } from '@/app/shared/interfaces/ingresar-cdb/InterfaceIngresarCDB'
import { SetterProductoFind } from '@/app/shared/interfaces/ingresar-cdb/SetterProductoFind'


const InitialStateInputCDB : InterfaceIngresarCDB = {
    CodigoDeBarras: "",
}

export const IngresarCDB = ({setProductoFindSetter, LimpiarImput, setLimpiarInput} : SetterProductoFind) => {
    
    const [InputCDB, setInputCDB] = useState(InitialStateInputCDB)
    const [ProductoObtenido, setProductoObtenido] = useState<ProductoInterface[]>([])
    const [ProductoEncontrado, setProductoEncontrado] = useState<ProductoInterface[]>([])

    useEffect(() => {
      obtenerProductosPromise().then((productoGet) => {
        setProductoObtenido(productoGet)
      })
    }, [])

    const handleRecuperarInput = (name:string, value:string) => {
        setInputCDB(
            {...InputCDB,[name]:value}
        )
    }

    useEffect(() => {
        const ProductoFind = ProductoObtenido.find(p => p.CodigoDeBarras === InputCDB.CodigoDeBarras);
        if (ProductoFind) {
            setProductoEncontrado([ProductoFind]);
        } else {
            setProductoEncontrado([])
        }
    }, [InputCDB.CodigoDeBarras, ProductoObtenido]);

    useEffect(() => {
      setProductoFindSetter(ProductoEncontrado)
    }, [ProductoEncontrado])
    
    useEffect(() => {
      setInputCDB(InitialStateInputCDB)
      setLimpiarInput(false)
    }, [LimpiarImput == true])
    
    return (
        <>  <div className='center'>
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
            </div>
        </>

    )
}

export default IngresarCDB;