import { useEffect, useState } from "react";
import { obtenerProductosPromise } from "@/core/infrastructure/firebase";
import { useOfflineSync } from "@/core/infrastructure/offline";
import { ProductoInterface } from "@/core/domain/entities";

export const IngresarCDB = ({ setProductoFindSetter }: any) => {
  const [CodigoDeBarras, setCodigoDeBarras] = useState("");
  const { getProducts } = useOfflineSync();

  useEffect(() => {
    if (CodigoDeBarras.trim() === "") return;

    const buscar = async () => {
      const productos = await getProducts(obtenerProductosPromise);

      const encontrado = productos.filter(
        (p: ProductoInterface) => p.CodigoDeBarras === CodigoDeBarras
      );

      if (encontrado.length > 0) {
        setProductoFindSetter(encontrado);
        setCodigoDeBarras("");
      }
    };

    buscar();
  }, [CodigoDeBarras, getProducts]);

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
