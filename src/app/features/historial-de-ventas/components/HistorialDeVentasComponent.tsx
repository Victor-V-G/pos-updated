import React, { useEffect, useState } from "react";
import { obtenerVentasPromise } from "@/app/firebase/Promesas";
import "../assets/css/historial-de-venta-style.css";

const VENTAS_POR_PAGINA = 10;

export const HistorialDeVentaComponent = () => {
  const [ventas, setVentas] = useState<any[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<string | null>(null);

  useEffect(() => {
    obtenerVentasPromise().then((response) => {
      setVentas(response);
    });
  }, []);

  // ✅ Fecha de hoy en formato dd-mm-yyyy
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const año = hoy.getFullYear();
  const fechaActual = `${dia}-${mes}-${año}`;

  const ventasDelDia = ventas.filter(
    (venta) => venta.fechaHora?.split(",")[0] === fechaActual
  );

  const totalPaginas = Math.ceil(ventasDelDia.length / VENTAS_POR_PAGINA);

  const ventasPaginadas = ventasDelDia.slice(
    (paginaActual - 1) * VENTAS_POR_PAGINA,
    paginaActual * VENTAS_POR_PAGINA
  );

  return (
    <div className="ver-stock-container">
      <div className="ver-stock-panel">

        <h2 className="ver-stock-title">📋 HISTORIAL DE VENTAS</h2>

        {ventasDelDia.length === 0 ? (
          <p className="ver-stock-no-resultados">
            ⚠ No hay ventas en el día de hoy
          </p>
        ) : (
          <div className="ver-stock-wrapper">
            <table className="ver-stock-table">
              <thead>
                <tr>
                  <td>FECHA</td>
                  <td>HORA</td>
                  <td>TOTAL</td>
                  <td>METODO</td>
                  <td>PAGO</td>
                  <td>VUELTO</td>
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

                      {/* ✅ Metodo de pago */}
                      <td style={{ fontWeight: "bold", color: venta.metodoPago === "DEBITO" ? "#2563eb" : "#16a34a" }}>
                        {venta.metodoPago === "DEBITO" ? "💳 Débito" : "💵 Efectivo"}
                      </td>

                      {/* ✅ Pago del cliente */}
                      <td>{venta.pagoCliente !== null ? `$${Number(venta.pagoCliente).toLocaleString("es-CL")}` : "-"}</td>

                      {/* ✅ Vuelto entregado */}
                      <td>{venta.vueltoEntregado !== null ? `$${Number(venta.vueltoEntregado).toLocaleString("es-CL")}` : "-"}</td>

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
                          {ventaSeleccionada === venta.id ? "▲ Ocultar" : "▼ Ver"}
                        </button>
                      </td>
                    </tr>

                    {/* ✅ Detalles venta expandible */}
                    {ventaSeleccionada === venta.id && (
                      <tr className="detalle-venta-row">
                        <td colSpan={7}>
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

export default HistorialDeVentaComponent;
