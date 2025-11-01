import { useEffect, useRef, useState } from 'react'
import '../assets/css/ingresar-cdb-style.css'
import { obtenerProductosPromise } from '@/app/firebase/Promesas'
import { ProductoInterface } from '@/app/shared/interfaces/producto/ProductoInterface'
import { InterfaceIngresarCDB } from '@/app/shared/interfaces/ingresar-cdb/InterfaceIngresarCDB'
import { SetterProductoFind } from '@/app/shared/interfaces/ingresar-cdb/SetterProductoFind'

const InitialStateInputCDB: InterfaceIngresarCDB = {
  CodigoDeBarras: "",
}

export const IngresarCDB = ({ setProductoFindSetter, LimpiarImput, setLimpiarInput }: SetterProductoFind) => {

  const [InputCDB, setInputCDB] = useState(InitialStateInputCDB)
  const [ProductoObtenido, setProductoObtenido] = useState<ProductoInterface[]>([])
  const [ProductoEncontrado, setProductoEncontrado] = useState<ProductoInterface[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null); // ✅ referencia al input

  useEffect(() => {
    obtenerProductosPromise().then((productoGet) => {
      setProductoObtenido(productoGet)
    })
  }, [])

  const handleRecuperarInput = (name: string, value: string) => {
    setInputCDB({ ...InputCDB, [name]: value })
  }

  useEffect(() => {
    const ProductoFind = ProductoObtenido.find(p => p.CodigoDeBarras === InputCDB.CodigoDeBarras);
    setProductoEncontrado(ProductoFind ? [ProductoFind] : [])
  }, [InputCDB.CodigoDeBarras, ProductoObtenido]);

  useEffect(() => {
    setProductoFindSetter(ProductoEncontrado)
  }, [ProductoEncontrado])

  // ✅ Cuando se limpia: reset y focus
  useEffect(() => {
    if (LimpiarImput) {
      setInputCDB(InitialStateInputCDB)
      setLimpiarInput(false)

      // ✅ Focus automático cuando se limpia
      inputRef.current?.focus()
    }
  }, [LimpiarImput])

  // ✅ Focus cuando el componente monta
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const recargarProductos = () => {
    obtenerProductosPromise().then((productoGet) => {
      setProductoObtenido(productoGet);
    });
  };

    // ⬇ Nuevo prop a retornar
  useEffect(() => {
    if (LimpiarImput) {
      setInputCDB(InitialStateInputCDB);
      setLimpiarInput(false);
      inputRef.current?.focus();
      recargarProductos(); // ✅ Refrescamos los productos después de venta
    }
  }, [LimpiarImput]);

  return (
    <div className='center'>
      <form
        className='ingresar-cdb'
        onSubmit={(e) => e.preventDefault()}>
        <div className='input-box'>
          <input
            ref={inputRef} // ✅ Enlazamos el ref
            type="number"
            required
            spellCheck="false"
            name='CodigoDeBarras'
            value={InputCDB.CodigoDeBarras}
            onChange={(e) => handleRecuperarInput(e.currentTarget.name, e.currentTarget.value)}
          />
          <label>CODIGO DE BARRAS</label>
        </div>
      </form>
    </div>
  )
}

export default IngresarCDB;
