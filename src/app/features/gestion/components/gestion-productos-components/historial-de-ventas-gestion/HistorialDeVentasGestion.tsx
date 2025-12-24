import React, { useEffect, useState } from "react";
import { obtenerVentasPromise, eliminarVentaPromise } from "@/app/firebase/Promesas";
import "../../../assets/css/gestion-productos-styles/historial-de-venta-gestion-style/historial-de-venta-gestion-style.css";
import { GestionModalsSetters } from "@/app/shared/interfaces/gestion/GestionModalsSetters";

const VENTAS_POR_PAGINA = 10;

export const HistorialDeVentasGestion = ({
  setOpenManager,
  SetOpenManagerGestionComponentSetter,
}: GestionModalsSetters) => {
  const [ventas, setVentas] = useState<any[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<string | null>(null);

  // ===== FILTROS =====
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroTotalMin, setFiltroTotalMin] = useState("");
  const [filtroTotalMax, setFiltroTotalMax] = useState("");
  const [filtroMetodoPago, setFiltroMetodoPago] = useState("todos");

  const cargarVentas = () => {
    obtenerVentasPromise().then((response) => setVentas(response));
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  // ===== ELIMINAR VENTA =====
  const handleEliminarVenta = async (venta: any) => {
    const confirmacion = confirm("⚠ ¿Está seguro que desea ELIMINAR esta venta?");
    if (!confirmacion) return;

    const resultado = await eliminarVentaPromise(venta.id);

    if (resultado) {
      alert("✅ Venta eliminada");
      setVentaSeleccionada(null);
      cargarVentas();
    } else {
      alert("❌ Hubo un error al eliminar la venta");
    }
  };

  // ===== APLICAR FILTROS =====
  const ventasFiltradas = ventas.filter((venta) => {
    const fechaVenta = venta.fechaHora?.split(",")[0];
    const total = Number(venta.TotalGeneral);

    const fechaFiltroValida =
      filtroFecha === "" ||
      fechaVenta === filtroFecha.split("-").reverse().join("-");

    const totalMinValido =
      filtroTotalMin === "" || total >= Number(filtroTotalMin);

    const totalMaxValido =
      filtroTotalMax === "" || total <= Number(filtroTotalMax);

    const metodoPagoValido =
      filtroMetodoPago === "todos" ||
      venta.metodoPago === filtroMetodoPago.toUpperCase();

    return fechaFiltroValida && totalMinValido && totalMaxValido && metodoPagoValido;
  });

  const totalPaginas = Math.ceil(ventasFiltradas.length / VENTAS_POR_PAGINA);

  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * VENTAS_POR_PAGINA,
    paginaActual * VENTAS_POR_PAGINA
  );

  return (
    <div className="ver-stock-container">
      <div className="ver-stock-panel">

        {/* ===== HEADER ===== */}
        <h2 className="ver-stock-title">
          <div className="titulo-header-container">
            <button
              className="btn-salir btn-volver-atras"
              onClick={() => {
                setOpenManager(false);
                SetOpenManagerGestionComponentSetter(true);
              }}
            >
              ← VOLVER ATRÁS
            </button>
            <span className="titulo-centrado">📋 HISTORIAL DE VENTAS</span>
            <div className="espacio-boton"></div>
          </div>
        </h2>

        {/* ===== FILTROS ===== */}
        <div className="filtros-stock">
          <div>
            <label>Fecha:</label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => {
                setFiltroFecha(e.target.value);
                setPaginaActual(1);
              }}
            />
          </div>

          <div>
            <label>Total Mín:</label>
            <input
              type="number"
              placeholder="0"
              value={filtroTotalMin}
              onChange={(e) => {
                setFiltroTotalMin(e.target.value);
                setPaginaActual(1);
              }}
            />
          </div>

          <div>
            <label>Total Máx:</label>
            <input
              type="number"
              placeholder="999999"
              value={filtroTotalMax}
              onChange={(e) => {
                setFiltroTotalMax(e.target.value);
                setPaginaActual(1);
              }}
            />
          </div>

          <div>
            <label>Método Pago:</label>
            <select
              value={filtroMetodoPago}
              onChange={(e) => {
                setFiltroMetodoPago(e.target.value);
                setPaginaActual(1);
              }}
            >
              <option value="todos">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="debito">Débito</option>
            </select>
          </div>
        </div>

        {ventasFiltradas.length === 0 ? (
          <p className="ver-stock-no-resultados">
            ⚠ No hay ventas que coincidan con los filtros
          </p>
        ) : (
          <div className="ver-stock-wrapper">
            {/* ===== TABLA ===== */}
            <table className="ver-stock-table">
              <thead>
                <tr>
                  <td>FECHA</td>
                  <td>HORA</td>
                  <td>TOTAL</td>
                  <td>MÉTODO</td>
                  <td>PAGO</td>
                  <td>VUELTO</td>
                  <td>PRODUCTOS</td>
                  <td>ACCIONES</td>
                </tr>
              </thead>

              <tbody>
                {ventasPaginadas.map((venta) => (
                  <React.Fragment key={venta.id}>
                    <tr>
                      <td>{venta.fechaHora?.split(",")[0]}</td>
                      <td>{venta.fechaHora?.split(",")[1]}</td>

                      <td>
                        <b>${Number(venta.TotalGeneral).toLocaleString("es-CL")}</b>
                      </td>

                      <td
                        style={{
                          fontWeight: "bold",
                          color: venta.metodoPago === "DEBITO" ? "#2563eb" : "#16a34a",
                        }}
                      >
                        {venta.metodoPago === "DEBITO" ? "💳 Débito" : "💵 Efectivo"}
                      </td>

                      <td>
                        {venta.pagoCliente !== null
                          ? `$${Number(venta.pagoCliente).toLocaleString("es-CL")}`
                          : "-"}
                      </td>

                      <td>
                        {venta.vueltoEntregado !== null
                          ? `$${Number(venta.vueltoEntregado).toLocaleString("es-CL")}`
                          : "-"}
                      </td>

                      <td>
                        {
                          venta.ProductosVenta.reduce(
                            (acc: number, p: any) => acc + p.cantidad,
                            0
                          )
                        }{" "}
                        productos
                      </td>

                      <td className="acciones-col">
                        <button
                          className="btn-ver-detalles"
                          onClick={() =>
                            setVentaSeleccionada(
                              ventaSeleccionada === venta.id ? null : venta.id
                            )
                          }
                        >
                          {ventaSeleccionada === venta.id ? "▲ Ocultar" : "▼ Detalles"}
                        </button>

                        <button
                          className="btn-eliminar"
                          onClick={() => handleEliminarVenta(venta)}
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>

                    {/* ===== DETALLES EXPANDIDOS ===== */}
                    {ventaSeleccionada === venta.id && (
                      <tr className="detalle-venta-row">
                        <td colSpan={8}>
                          <div className="detalle-venta-scroll">

                            <table className="detalle-venta-table">
                              <thead>
                                <tr>
                                  <td>PRODUCTO</td>
                                  <td>CÓDIGO</td>
                                  <td>TIPO</td>
                                  <td>CANT / KG</td>
                                  <td>PRECIO UNIT.</td>
                                  <td>SUBTOTAL</td>
                                </tr>
                              </thead>

                              <tbody>
                                {venta.ProductosVenta.map((p: any, idx: number) => (
                                  <tr key={idx}>
                                    <td>{p.NombreProducto}</td>
                                    <td>{p.CodigoDeBarras}</td>

                                    <td>
                                      {p.TipoProducto === "peso"
                                        ? "⚖️ Por peso"
                                        : "📦 Unidad"}
                                    </td>

                                    <td>
                                      {p.cantidad}
                                      {p.TipoProducto === "peso" ? " kg" : ""}
                                    </td>

                                    <td>
                                      ${Number(p.PrecioUnitario).toLocaleString("es-CL")}
                                    </td>

                                    <td>
                                      <b>
                                        ${Number(p.subtotal).toLocaleString("es-CL")}
                                      </b>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* ===== PAGINACIÓN ===== */}
            <div className="ver-stock-pagination">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(paginaActual - 1)}
              >
                ← Anterior
              </button>

              <span>Página {paginaActual} de {totalPaginas}</span>

              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(paginaActual + 1)}
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialDeVentasGestion;
