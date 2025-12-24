import { registrarVentaYActualizarStockPromise } from "@/app/firebase/Promesas";
import { useState } from "react";

export const RealizarVentaComponent = ({
  TotalGeneral,
  ProductosVenta,
  VentaCompletada,
}: any) => {

  const [metodoPago, setMetodoPago] = useState<"EFECTIVO" | "DEBITO">("EFECTIVO");
  const [pagoCliente, setPagoCliente] = useState<string>("");
  const [vuelto, setVuelto] = useState<number>(0);

  const calcularVuelto = () => {
    const vueltoCalc = Number(pagoCliente) - TotalGeneral;
    setVuelto(vueltoCalc < 0 ? 0 : vueltoCalc);
  };

  const procesarVenta = async () => {
    const ok = await registrarVentaYActualizarStockPromise({
      ProductosVenta,
      TotalGeneral,
      metodoPago,
      pagoCliente: metodoPago === "EFECTIVO" ? Number(pagoCliente) : null,
      vueltoEntregado: metodoPago === "EFECTIVO" ? Number(vuelto) : null,
    });

    if (ok) {
      alert("Venta realizada con éxito");
      VentaCompletada();
    } else {
      alert("Error realizando la venta");
    }
  };

  return (
    <div className="realizar-venta-container">
      <h2>Procesar venta</h2>

      <p>Total: ${TotalGeneral.toLocaleString("es-CL")}</p>

      <label>Método de pago</label>
      <select
        value={metodoPago}
        onChange={(e) =>
          setMetodoPago(e.target.value as "EFECTIVO" | "DEBITO")
        }
      >
        <option value="EFECTIVO">EFECTIVO</option>
        <option value="DEBITO">DEBITO</option>
      </select>

      {metodoPago === "EFECTIVO" && (
        <>
          <label>Monto entregado</label>
          <input
            type="number"
            value={pagoCliente}
            onChange={(e) => setPagoCliente(e.target.value)}
          />

          <button onClick={calcularVuelto}>Calcular vuelto</button>

          <p>Vuelto: ${vuelto}</p>
        </>
      )}

      <button className="btn-finalizar-venta" onClick={procesarVenta}>
        Finalizar venta
      </button>
    </div>
  );
};

export default RealizarVentaComponent;
