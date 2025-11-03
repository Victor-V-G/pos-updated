import { PropsProductoFind } from "@/app/shared/interfaces/ingresar-cdb/PropsProductoFind";
import "../assets/css/producto-encontrado-style.css";
import { useEffect, useState } from "react";

export const ProductoEncontradoAgregar = ({
  ProductoFindSetter,
  setProductoAgregado,
  setLimpiarInput,
  modoAutomatico,   // ✅ RECIBIMOS EL MODO
}: PropsProductoFind & { modoAutomatico: boolean }) => {

  const [mostrarTabla, setMostrarTabla] = useState(false);

  useEffect(() => {
    const hayProducto = ProductoFindSetter.length > 0;
    setMostrarTabla(hayProducto);

    // ✅ Si hay producto y es modo automático → agregar sin mostrar tabla
    if (hayProducto && modoAutomatico) {
      handleAgregarProducto();
    }

  }, [ProductoFindSetter, modoAutomatico]);

  const handleAgregarProducto = () => {
    setProductoAgregado(ProductoFindSetter);
    setLimpiarInput(true);
    setMostrarTabla(false);
  };

  const hayStockCritico = ProductoFindSetter.some(p => Number(p.Stock) <= 1);
  const hayStockBajo = ProductoFindSetter.some(p => Number(p.Stock) <= 5);

  // ✅ SOLO si es MANUAL se usa el Enter para agregar
  useEffect(() => {
    if (!modoAutomatico) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === "Enter" && mostrarTabla) {
          e.preventDefault();
          handleAgregarProducto();
        }
      };

      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [mostrarTabla, modoAutomatico]);

  return (
    <>
      {!mostrarTabla && (
        <div className="placeholder-busqueda">
          <div className="placeholder-icono">🔍</div>
          <p>
            {modoAutomatico
              ? "Escanee para agregar automáticamente"
              : "Escanee y presione ENTER o AGREGAR"}
          </p>
        </div>
      )}

      {/* ✅ Tabla solo si es MANUAL */}
      {mostrarTabla && !modoAutomatico && (
        <>
          <table className="table-producto-encontrado">
            <thead>
              <tr>
                <td>NOMBRE DEL PRODUCTO</td>
                <td>CODIGO DE BARRAS</td>
                <td>PRECIO</td>
                <td>STOCK</td>
                <td>ACCION</td>
              </tr>
            </thead>
            <tbody className="fila-stock">
              {ProductoFindSetter.map((productoMap, index) => (
                <tr
                  key={index}
                  className={
                    Number(productoMap.Stock) <= 1
                      ? "fila-stock-bajo"
                      : Number(productoMap.Stock) <= 5
                      ? "fila-stock-medio"
                      : ""
                  }
                >
                  <td>{productoMap.NombreProducto}</td>
                  <td>{productoMap.CodigoDeBarras}</td>
                  <td>{productoMap.Precio}</td>
                  <td>{productoMap.Stock}</td>

                  <td className="button-producto-encontrado">
                    <button onClick={handleAgregarProducto}>
                      <h1>AGREGAR</h1>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ NO TOCADO */}
          {hayStockCritico ? (
            <div className="advertencia advertencia-minima">
              ⚠️ Stock crítico: solo queda 1 unidad
            </div>
          ) : hayStockBajo && (
            <div className="advertencia advertencia-baja">
              ⚠️ Stock bajo: menos de 5 unidades disponibles
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ProductoEncontradoAgregar;
