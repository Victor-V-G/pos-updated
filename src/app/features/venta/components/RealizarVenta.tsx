import { useEffect, useState, useRef } from "react";
import { registrarVentaYActualizarStockPromise } from "@/app/firebase/Promesas";
import { PropsRealizarVenta } from "@/app/shared/interfaces/ingresar-cdb/PropsRealizarVenta";
import { SetterResetVenta } from "@/app/shared/interfaces/ingresar-cdb/SetterResetVenta";
import '../assets/css/realizar-venta-style.css'

type PropsCombinadas = PropsRealizarVenta & SetterResetVenta & {
  className?: string;
};

export const RealizarVenta = ({ TotalGeneral, ProductosVenta, VentaCompletada, className }: PropsCombinadas) => {

  const [pago, setPago] = useState<number | string>("");
  const vuelto = Number(pago) - TotalGeneral;

  // ✅ REFERENCIA al input del pago
  const inputPagoRef = useRef<HTMLInputElement | null>(null);

  // ✅ REGISTRAR VENTA EFECTIVO
  const realizarVentaEfectivo = () => {
    registrarVentaYActualizarStockPromise({
      TotalGeneral,
      ProductosVenta,
      metodoPago: "EFECTIVO",
      pagoCliente: Number(pago),
      vueltoEntregado: Number(vuelto),
    })
    .then(() => {
      setPago("");
      VentaCompletada();
    });
  };

  // ✅ REGISTRAR VENTA DEBITO
  const realizarVentaDebito = () => {
    registrarVentaYActualizarStockPromise({
      TotalGeneral,
      ProductosVenta,
      metodoPago: "DEBITO",
      pagoCliente: null,
      vueltoEntregado: null,
    })
    .then(() => {
      setPago("");
      VentaCompletada();
    });
  };

  // ✅ Atajos de teclado: ESPACIO y P
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {

      if (e.code === "Space" && TotalGeneral > 0) {
        e.preventDefault();

        // ✅ Si NO hay pago ingresado → se registra como DÉBITO
        if (pago === "" || Number(pago) === 0) {
          realizarVentaDebito();
        }
        // ✅ Si hay pago ingresado → se registra como EFECTIVO (solo si vuelto ≥ 0)
        else if (vuelto >= 0) {
          realizarVentaEfectivo();
        }
      }

      // ✅ P => Enfocar input de pago
      if (e.key.toLowerCase() === "p") {
        e.preventDefault();
        inputPagoRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [pago, vuelto, TotalGeneral]);

  return (
    <>
      {TotalGeneral === 0 ? (
        <div className="esqueleto-factura">
          <div className="esqueleto-linea-factura"></div>
          <div className="esqueleto-linea-factura-medio">
            Nota: presione ESPACIO para finalizar una venta | P para ingresar pago
          </div>
          <div className="esqueleto-linea-factura"></div>
        </div>
      ) : (
        <div className="factura-container">

          <div className="factura-icon">🧾</div>
          <h2 className="factura-title">FACTURA</h2>

          <div className="factura-total">
            TOTAL: <strong>${TotalGeneral}</strong>
          </div>

          {/* ✅ INGRESO DE PAGO */}
          <input
            ref={inputPagoRef}
            type="number"
            className="factura-input"
            placeholder="Ingrese pago del cliente"
            value={pago}
            onChange={(e) => setPago(e.target.value)}
            min={0}
          />

          {/* ✅ VUELTO */}
          {pago !== "" && (
            <div className={`factura-vuelto ${vuelto < 0 ? "vuelto-negativo" : ""}`}>
              {vuelto < 0 ? (
                <>Faltan <strong>${Math.abs(vuelto)}</strong></>
              ) : (
                <>Vuelto: <strong>${vuelto}</strong></>
              )}
            </div>
          )}

          {/* ✅ BOTONES */}
          <div className="factura-btns">
            <button
              className="factura-btn"
              disabled={vuelto < 0 || pago === ""}
              onClick={realizarVentaEfectivo}
            >
              💵 PAGO EFECTIVO
            </button>

            <button
              className="factura-btn debito-btn"
              onClick={realizarVentaDebito}
            >
              💳 DÉBITO
            </button>
          </div>

        </div>
      )}
    </>
  );
};

export default RealizarVenta;
