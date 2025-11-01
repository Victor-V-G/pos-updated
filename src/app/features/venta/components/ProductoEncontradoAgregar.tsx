import { PropsProductoFind } from "@/app/shared/interfaces/ingresar-cdb/PropsProductoFind";
import "../assets/css/producto-encontrado-style.css";
import { useEffect, useState } from "react";

export const ProductoEncontradoAgregar = ({
  ProductoFindSetter,
  setProductoAgregado,
  setLimpiarInput,
}: PropsProductoFind) => {

  const [mostrarTabla, setMostrarTabla] = useState(false);

  useEffect(() => {
    setMostrarTabla(ProductoFindSetter.length > 0);
  }, [ProductoFindSetter]);

  const handleAgregarProducto = () => {
    setProductoAgregado(ProductoFindSetter);
    setLimpiarInput(true);
    setMostrarTabla(false);
  };

  const hayStockCritico = ProductoFindSetter.some(p => Number(p.Stock) <= 1);
  const hayStockBajo = ProductoFindSetter.some(p => Number(p.Stock) <= 5);

  // ✅ Detectar ENTER y agregar producto automáticamente
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && mostrarTabla) {
        e.preventDefault();
        handleAgregarProducto();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [mostrarTabla, ProductoFindSetter]);

  return (
    <>
      {/* Placeholder visible cuando no hay resultados */}
      {!mostrarTabla && (
        <div className="placeholder-busqueda">
          <div className="placeholder-icono">🔍</div>
          <p>Escanee o ingrese el código para buscar un producto</p>
        </div>
      )}

      {mostrarTabla && (
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
