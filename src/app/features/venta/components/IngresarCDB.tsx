import { useEffect, useState } from "react";
import { obtenerProductosPromise } from "@/app/firebase/Promesas";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";

export const IngresarCDB = ({ setProductoFindSetter }: any) => {
  const [CodigoDeBarras, setCodigoDeBarras] = useState("");

  useEffect(() => {
    if (CodigoDeBarras.trim() === "") return;

    const buscar = async () => {
      const productos = await obtenerProductosPromise();

      const encontrado = productos.filter(
        (p: ProductoInterface) => p.CodigoDeBarras === CodigoDeBarras
      );

      if (encontrado.length > 0) {
        setProductoFindSetter(encontrado);
        setCodigoDeBarras("");
      }
    };

    buscar();
  }, [CodigoDeBarras]);

  return (
    <div className="container mt-3">
      <input
        type="number"
        className="form-control form-control-lg shadow-sm"
        placeholder="📷 Escanee código…"
        value={CodigoDeBarras}
        onChange={(e) => setCodigoDeBarras(e.target.value)}
      />
    </div>
  );
};

export default IngresarCDB;
