import { useEffect, useRef, useState } from "react";
import "../assets/css/ingresar-cdb-style.css";
import { obtenerProductosPromise } from "@/app/firebase/Promesas";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import { InterfaceIngresarCDB } from "@/app/shared/interfaces/ingresar-cdb/InterfaceIngresarCDB";
import { SetterProductoFind } from "@/app/shared/interfaces/ingresar-cdb/SetterProductoFind";

const InitialStateInputCDB: InterfaceIngresarCDB = {
  CodigoDeBarras: "",
};

export const IngresarCDB = ({
  setProductoFindSetter,
  LimpiarImput,
  setLimpiarInput,
  setModoAutomatico,
  modoAutomatico,
}: any) => {

  const [InputCDB, setInputCDB] = useState(InitialStateInputCDB);
  const [ProductoObtenido, setProductoObtenido] = useState<ProductoInterface[]>([]);
  const [ProductoEncontrado, setProductoEncontrado] = useState<ProductoInterface[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    obtenerProductosPromise().then((productoGet) => {
      setProductoObtenido(productoGet);
    });
  }, []);

  const handleRecuperarInput = (name: string, value: string) => {
    setInputCDB({ ...InputCDB, [name]: value });
  };

  useEffect(() => {
    const ProductoFind = ProductoObtenido.find(
      (p) => p.CodigoDeBarras === InputCDB.CodigoDeBarras
    );
    setProductoEncontrado(ProductoFind ? [ProductoFind] : []);
  }, [InputCDB.CodigoDeBarras, ProductoObtenido]);

  useEffect(() => {
    setProductoFindSetter(ProductoEncontrado);
  }, [ProductoEncontrado]);

  useEffect(() => {
    if (LimpiarImput) {
      setInputCDB(InitialStateInputCDB);
      setLimpiarInput(false);
      inputRef.current?.focus();
    }
  }, [LimpiarImput]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="ingresar-cdb">

      {/* ✅ INPUT y BOTÓN centrados */}
      <div className="input-with-button">

        <div className="input-box">
          <input
            ref={inputRef}
            type="number"
            required
            spellCheck="false"
            name="CodigoDeBarras"
            value={InputCDB.CodigoDeBarras}
            onChange={(e) =>
              handleRecuperarInput(e.currentTarget.name, e.currentTarget.value)
            }
          />
          <label>CODIGO DE BARRAS</label>
        </div>

        {/* ✅ Botón cambio de modo */}
        <button
          type="button"
          className={`modo-btn ${modoAutomatico ? "auto" : "manual"}`}
          onClick={() => setModoAutomatico((prev: boolean) => !prev)}
        >
          {modoAutomatico ? "AUTOMÁTICO" : "MANUAL"}
        </button>
      </div>
    </div>
  );
};

export default IngresarCDB;

