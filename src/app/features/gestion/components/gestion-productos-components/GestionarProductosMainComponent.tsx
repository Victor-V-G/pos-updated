import { obtenerProductosPromise } from "@/app/firebase/Promesas";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import { useEffect, useState } from "react";
import '../../assets/css/gestion-productos-styles/crud-style/crud-style.css'
import ModificarProductoComponent from "./modificar-productos-component/ModificarProductoMainComponent";
import EliminarProductoComponent from "./eliminar-productos-component/EliminarProductoComponent";
import React from "react";

const PRODUCTOS_POR_PAGINA = 10;

export const GestionProductosMainComponent = () => {

  const [Productos, setProductos] = useState<ProductoInterface[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [RefrescarProductos, setRefrescarProductos] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [ordenPrecio, setOrdenPrecio] = useState("");
  const [ordenStock, setOrdenStock] = useState("");

  useEffect(() => {
    obtenerProductosPromise().then(setProductos);
    setRefrescarProductos(false);
  }, [RefrescarProductos]);

  const productosProcesados = [...Productos]
    .filter((p) => {
      const txt = busqueda.toLowerCase();
      return (
        p.NombreProducto.toLowerCase().includes(txt) ||
        p.CodigoDeBarras.toLowerCase().includes(txt)
      );
    })
    .filter((p) => {
      const s = Number(p.Stock);
      if (filtroEstado === "sin") return s === 0;
      if (filtroEstado === "bajo") return s === 1;
      if (filtroEstado === "medio") return s > 1 && s <= 5;
      if (filtroEstado === "normal") return s > 5;
      return true;
    })
    .sort((a, b) => {
      if (ordenPrecio === "asc") return Number(a.Precio) - Number(b.Precio);
      if (ordenPrecio === "desc") return Number(b.Precio) - Number(a.Precio);
      if (ordenStock === "asc") return Number(a.Stock) - Number(b.Stock);
      if (ordenStock === "desc") return Number(b.Stock) - Number(a.Stock);
      return 0;
    });

  const totalPaginas = Math.ceil(productosProcesados.length / PRODUCTOS_POR_PAGINA);
  const productosPagina = productosProcesados.slice(
    (paginaActual - 1) * PRODUCTOS_POR_PAGINA,
    paginaActual * PRODUCTOS_POR_PAGINA
  );

  return (
    <div className="gestion-container">
      <div className="gestion-panel">

        <h2 className="gestion-title">🛠 GESTIÓN DE PRODUCTOS</h2>

        <div className="gestion-filtros">
          <label>Búsqueda: </label>
          <input
            className="gestion-input"
            type="text"
            placeholder="Nombre o código..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />

          <label>Estado: </label>
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

        <div className="gestion-wrapper">
          <table className="gestion-table">
            <thead>
              <tr>
                <td>NOMBRE</td>
                <td>CÓDIGO</td>
                <td>PRECIO</td>
                <td>STOCK</td>
                <td>ESTADO</td>
                <td>ACCIONES</td>
              </tr>
            </thead>

            <tbody>
              {productosPagina.map((producto, index) => {
                const stock = Number(producto.Stock);

                const estado =
                  stock === 0 ? "🚫 SIN STOCK" :
                  stock === 1 ? "⚠ Crítico" :
                  stock <= 5 ? "⚠ Poco stock" :
                  "✅ OK";

                const clase =
                  stock === 0 ? "gestion-row-sin" :
                  stock === 1 ? "gestion-row-bajo" :
                  stock <= 5 ? "gestion-row-medio" :
                  "";

                return (
                  <tr key={index} className={clase}>
                    <td>{producto.NombreProducto}</td>
                    <td>{producto.CodigoDeBarras}</td>
                    <td>${producto.Precio}</td>
                    <td>{stock}</td>
                    <td className="gestion-estado">{estado}</td>
                    <td>
                        <div className="gestion-acciones">
                            <ModificarProductoComponent
                                ObtenerIndexModificar={index}
                                setRefrescarProductos={setRefrescarProductos}
                            />
                            <EliminarProductoComponent
                                ObtenerIndexEliminar={index}
                                setRefrescarProductos={setRefrescarProductos}
                            />
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="gestion-pagination">
            <button disabled={paginaActual === 1}
              onClick={() => setPaginaActual(paginaActual - 1)}>
              ← Anterior
            </button>

            <span>Página {paginaActual} de {totalPaginas}</span>

            <button disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual(paginaActual + 1)}>
              Siguiente →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GestionProductosMainComponent;
