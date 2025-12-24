import { useState } from "react";

import IngresarCDB from "./IngresarCDB";
import ProductoEncontradoAgregar from "./ProductoEncontradoAgregar";
import MostrarProductosVenta from "./MostrarProductosVenta";

import { registrarVentaYActualizarStockPromise } from "@/app/firebase/Promesas";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import { ProductoVenta } from "@/app/shared/interfaces/ingresar-cdb/ProductoVenta";

import "../assets/css/venta-component-style.css";

export const VentaComponent = () => {
  const [ProductoFindSetter, setProductoFindSetter] =
    useState<ProductoInterface[]>([]);

  const [ProductoAgregado, setProductoAgregado] =
    useState<ProductoInterface[]>([]);

  const [DatosVenta, setDatosVenta] = useState<{
    ProductosVenta: ProductoVenta[];
    TotalGeneral: number;
  }>({
    ProductosVenta: [],
    TotalGeneral: 0,
  });

  const [mostrarInputEfectivo, setMostrarInputEfectivo] = useState(false);
  const [montoEntregado, setMontoEntregado] = useState("");

  const total = DatosVenta.TotalGeneral;
  const monto = Number(montoEntregado);

  const falta = monto < total ? total - monto : 0;
  const vuelto = monto >= total ? monto - total : 0;

  const finalizarVentaEfectivo = async () => {
    if (DatosVenta.ProductosVenta.length === 0) return;
    if (monto < total) return;

    const ok = await registrarVentaYActualizarStockPromise({
      ProductosVenta: DatosVenta.ProductosVenta,
      TotalGeneral: total,
      metodoPago: "EFECTIVO",
      pagoCliente: monto,
      vueltoEntregado: vuelto,
    });

    if (ok) window.location.reload();
  };

  const pagarDebito = async () => {
    if (DatosVenta.ProductosVenta.length === 0) return;

    const ok = await registrarVentaYActualizarStockPromise({
      ProductosVenta: DatosVenta.ProductosVenta,
      TotalGeneral: DatosVenta.TotalGeneral,
      metodoPago: "DEBITO",
      pagoCliente: null,
      vueltoEntregado: null,
    });

    if (ok) window.location.reload();
  };

  return (
    <div className="container mt-3">

      <div className="card shadow p-4">
        <h1 className="text-center fw-bold mb-4">🛒 REALIZAR VENTA</h1>

        <IngresarCDB setProductoFindSetter={setProductoFindSetter} />

        <div className="mt-3">
          <ProductoEncontradoAgregar
            ProductoFindSetter={ProductoFindSetter}
            setProductoAgregado={setProductoAgregado}
            setLimpiarInput={() => {}}
          />
        </div>

        <MostrarProductosVenta
          ProductoAgregado={ProductoAgregado}
          setDatosVenta={setDatosVenta}
          pagarDebito={pagarDebito}
          pagarEfectivo={() => setMostrarInputEfectivo(true)}
        />

        {mostrarInputEfectivo && (
          <div className="card p-4 shadow-sm mt-4">
            <h3 className="fw-bold">Pago en efectivo</h3>

            <p className="mt-2">Total: <b>${total.toLocaleString("es-CL")}</b></p>

            <label className="fw-bold mt-2">Monto recibido:</label>
            <input
              type="number"
              className="form-control"
              value={montoEntregado}
              onChange={(e) => setMontoEntregado(e.target.value)}
              placeholder="Ingrese monto entregado"
            />

            {falta > 0 && (
              <p className="text-danger mt-2 fw-bold">
                ⚠ Falta: ${falta.toLocaleString("es-CL")}
              </p>
            )}

            {vuelto > 0 && (
              <p className="text-success mt-2 fw-bold">
                ✔ Vuelto: ${vuelto.toLocaleString("es-CL")}
              </p>
            )}

            <button
              className="btn btn-dark mt-3"
              disabled={monto < total}
              onClick={finalizarVentaEfectivo}
            >
              FINALIZAR VENTA
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VentaComponent;
