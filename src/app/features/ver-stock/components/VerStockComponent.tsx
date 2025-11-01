import { useEffect, useState } from "react";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import { obtenerProductosPromise } from "@/app/firebase/Promesas";
import "../assets/css/ver-stock-style.css";
import React from "react";

const PRODUCTOS_POR_PAGINA = 10;

export const VerStockComponent = () => {
  const [Productos, setProductos] = useState<ProductoInterface[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);

  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [ordenPrecio, setOrdenPrecio] = useState("");
  const [ordenStock, setOrdenStock] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    obtenerProductosPromise().then((response: ProductoInterface[]) => {
      setProductos(response);
    });
  }, []);

  const productosProcesados = [...Productos]
    .filter((producto) => {
      const Nombre = producto.NombreProducto.toLowerCase();
      const Codigo = producto.CodigoDeBarras.toLowerCase();
      const texto = busqueda.toLowerCase();
      return Nombre.includes(texto) || Codigo.includes(texto);
    })
    .filter((producto) => {
      const stock = Number(producto.Stock);
      if (filtroEstado === "sin") return stock === 0;
      if (filtroEstado === "bajo") return stock === 1;
      if (filtroEstado === "medio") return stock > 1 && stock <= 5;
      if (filtroEstado === "normal") return stock > 5;
      return true;
    })
    .sort((a, b) => {
      const precioA = Number(a.Precio);
      const precioB = Number(b.Precio);
      const stockA = Number(a.Stock);
      const stockB = Number(b.Stock);

      if (ordenPrecio === "asc") return precioA - precioB;
      if (ordenPrecio === "desc") return precioB - precioA;
      if (ordenStock === "asc") return stockA - stockB;
      if (ordenStock === "desc") return stockB - stockA;
      return 0;
    });

  const totalPaginas = Math.ceil(productosProcesados.length / PRODUCTOS_POR_PAGINA);
  const productosPaginados = productosProcesados.slice(
    (paginaActual - 1) * PRODUCTOS_POR_PAGINA,
    paginaActual * PRODUCTOS_POR_PAGINA
  );

  return (
    <div className="ver-stock-container">
      <div className="ver-stock-panel">

        {/* ✅ Header */}
        <h2 className="ver-stock-title">📦 VER STOCK Y BÚSQUEDA</h2>

        {/* ✅ Sección de filtros */}
        <div className="filtros-stock">

          <label>Busqueda:</label>
          <input
            type="text"
            placeholder="Buscar producto por nombre o código..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="input-busqueda"
          />

          <label>Estado:</label>
          <select value={filtroEstado} onChange={(e) => {
            setFiltroEstado(e.target.value);
            setPaginaActual(1);
          }}>
            <option value="todos">Todos</option>
            <option value="sin">Sin stock</option>
            <option value="bajo">Crítico</option>
            <option value="medio">Poco stock</option>
            <option value="normal">En stock</option>
          </select>

          <label>Precio:</label>
          <select value={ordenPrecio} onChange={(e) => {
            setOrdenPrecio(e.target.value);
            setOrdenStock("");
            setPaginaActual(1);
          }}>
            <option value="">Ninguno</option>
            <option value="asc">Menor a mayor</option>
            <option value="desc">Mayor a menor</option>
          </select>

          <label>Stock:</label>
          <select value={ordenStock} onChange={(e) => {
            setOrdenStock(e.target.value);
            setOrdenPrecio("");
            setPaginaActual(1);
          }}>
            <option value="">Ninguno</option>
            <option value="asc">Menor a mayor</option>
            <option value="desc">Mayor a menor</option>
          </select>
        </div>

        {productosProcesados.length === 0 ? (
          <p style={{ marginTop: "20px", fontWeight: "bold" }}>
            ❌ No hay productos que coincidan con la búsqueda / filtro
          </p>
        ) : (
          <div className="ver-stock-wrapper">
            <table className="ver-stock-table">
              <thead>
                <tr>
                  <td>NOMBRE DEL PRODUCTO</td>
                  <td>CODIGO DE BARRAS</td>
                  <td>PRECIO</td>
                  <td>STOCK</td>
                  <td>ESTADO</td>
                </tr>
              </thead>

              <tbody>
                {productosPaginados.map((producto, index) => {
                  const stockN = Number(producto.Stock);

                  const esSinStock = stockN === 0;
                  const esBajo = stockN === 1;
                  const esMedio = stockN > 1 && stockN <= 5;

                  const advertencia =
                    esSinStock ? "🚫 SIN STOCK" :
                    esBajo ? "⚠ Stock crítico" :
                    esMedio ? "⚠ Poco stock disponible" :
                    "✓ En stock";

                  return (
                    <tr
                      key={`producto-${producto.CodigoDeBarras}-${index}`}
                      className={
                        esSinStock
                          ? "ver-stock-row-sin"
                          : esBajo
                          ? "ver-stock-row-bajo"
                          : esMedio
                          ? "ver-stock-row-medio"
                          : ""
                      }
                    >
                      <td>{producto.NombreProducto}</td>
                      <td>{producto.CodigoDeBarras}</td>
                      <td>${producto.Precio}</td>
                      <td>{stockN}</td>
                      <td className="ver-stock-estado">{advertencia}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ✅ Paginación */}
            <div className="ver-stock-pagination">
              <button disabled={paginaActual === 1} onClick={() => setPaginaActual(paginaActual - 1)}>
                ← Anterior
              </button>

              <span>Página {paginaActual} de {totalPaginas}</span>

              <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(paginaActual + 1)}>
                Siguiente →
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default VerStockComponent;
