import React, { useEffect, useState } from "react";
import { obtenerVentasPromise } from "@/app/firebase/Promesas";
import '../../../assets/css/gestion-productos-styles/historial-de-venta-gestion-style/historial-de-venta-gestion-style.css'
import { GestionModalsSetters } from "@/app/shared/interfaces/gestion/GestionModalsSetters";

const VENTAS_POR_PAGINA = 10;

export const HistorialDeVentasGestion = ({setOpenManager, SetOpenManagerGestionComponentSetter}: GestionModalsSetters) => {
  const [ventas, setVentas] = useState<any[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<string | null>(null);

  // ✅ Filtros
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroTotalMin, setFiltroTotalMin] = useState("");
  const [filtroTotalMax, setFiltroTotalMax] = useState("");

  useEffect(() => {
    obtenerVentasPromise().then((response) => {
      setVentas(response);
    });
  }, []);

  // ✅ Aplicar filtros dinámicos
  const ventasFiltradas = ventas.filter((venta) => {
    const fechaVenta = venta.fechaHora?.split(",")[0]; // dd-mm-yyyy
    const total = Number(venta.TotalGeneral);

    const fechaFiltroValida = filtroFecha === "" || fechaVenta === filtroFecha.split("-").reverse().join("-");
    const totalMinValido = filtroTotalMin === "" || total >= parseInt(filtroTotalMin);
    const totalMaxValido = filtroTotalMax === "" || total <= parseInt(filtroTotalMax);

    return fechaFiltroValida && totalMinValido && totalMaxValido;
  });

  const totalPaginas = Math.ceil(ventasFiltradas.length / VENTAS_POR_PAGINA);

  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * VENTAS_POR_PAGINA,
    paginaActual * VENTAS_POR_PAGINA
  );

  return (
    <div className="ver-stock-container">
      <div className="ver-stock-panel">

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

            {/* Este div invisible ayuda a mantener el título centrado perfectamente */}
            <div className="espacio-boton"></div>
          </div>
        </h2>

        {/* ✅ FILTROS */}
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
        </div>

        {ventasFiltradas.length === 0 ? (
          <p className="ver-stock-no-resultados">
            ⚠ No hay ventas que coincidan con los filtros
          </p>
        ) : (
          <div className="ver-stock-wrapper">
            <table className="ver-stock-table">
              <thead>
                <tr>
                  <td>FECHA</td>
                  <td>HORA</td>
                  <td>TOTAL</td>
                  <td>PRODUCTOS</td>
                </tr>
              </thead>

              <tbody>
                {ventasPaginadas.map((venta) => (
                  <React.Fragment key={venta.id}>
                    <tr>
                      <td>{venta.fechaHora?.split(",")[0]}</td>
                      <td>{venta.fechaHora?.split(",")[1]}</td>
                      <td><b>${Number(venta.TotalGeneral).toLocaleString("es-CL")}</b></td>

                      <td style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                        {venta.ProductosVenta.reduce(
                          (acc: number, p: any) => acc + p.cantidad,
                          0
                        )} productos
                        <button
                          className="btn-ver-detalles"
                          onClick={() =>
                            setVentaSeleccionada(
                              ventaSeleccionada === venta.id ? null : venta.id
                            )
                          }
                        >
                          {ventaSeleccionada === venta.id ? "▲ Ocultar" : "▼ Ver detalles"}
                        </button>
                      </td>
                    </tr>

                    {ventaSeleccionada === venta.id && (
                      <tr className="detalle-venta-row">
                        <td colSpan={4}>
                          <div className="detalle-venta-scroll">
                            <table className="detalle-venta-table">
                              <thead>
                                <tr>
                                  <td>PRODUCTO</td>
                                  <td>CÓDIGO</td>
                                  <td>CANTIDAD</td>
                                  <td>PRECIO U.</td>
                                </tr>
                              </thead>
                              <tbody>
                                {venta.ProductosVenta.map((p: any, idx: number) => (
                                  <tr key={idx}>
                                    <td>{p.NombreProducto}</td>
                                    <td>{p.CodigoDeBarras}</td>
                                    <td>{p.cantidad}</td>
                                    <td>${Number(p.Precio).toLocaleString("es-CL")}</td>
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
