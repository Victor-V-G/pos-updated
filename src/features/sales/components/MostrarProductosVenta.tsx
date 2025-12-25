import { useEffect, useState } from "react";
import { ProductoVenta } from "@/shared/types";

export const MostrarProductosVenta = ({
  ProductoAgregado,
  setDatosVenta,
  pagarDebito,
  pagarEfectivo,
}: any) => {
  const [productosVenta, setProductosVenta] = useState<
    Record<string, ProductoVenta>
  >({});

  useEffect(() => {
    if (ProductoAgregado.length === 0) return;

    const p = ProductoAgregado[0];

    setProductosVenta((prev) => ({
      ...prev,
      [p.CodigoDeBarras]: {
        NombreProducto: p.NombreProducto,
        CodigoDeBarras: p.CodigoDeBarras,
        TipoProducto: p.TipoProducto,
        PrecioUnitario: Number(p.Precio),
        cantidad: Number(p.cantidad),
        subtotal: Number(p.Precio) * Number(p.cantidad),
      },
    }));
  }, [ProductoAgregado]);

  useEffect(() => {
    const lista = Object.values(productosVenta);
    const total = lista.reduce((t, p) => t + p.subtotal, 0);

    setDatosVenta({
      ProductosVenta: lista,
      TotalGeneral: total,
    });
  }, [productosVenta]);

  const aumentar = (codigo: string) => {
    setProductosVenta((prev) => {
      const p = prev[codigo];
      if (!p || p.TipoProducto === "peso") return prev;

      const nuevaCantidad = p.cantidad + 1;

      return {
        ...prev,
        [codigo]: {
          ...p,
          cantidad: nuevaCantidad,
          subtotal: nuevaCantidad * p.PrecioUnitario,
        },
      };
    });
  };

  const disminuir = (codigo: string) => {
    setProductosVenta((prev) => {
      const p = prev[codigo];
      if (!p || p.TipoProducto === "peso") return prev;
      if (p.cantidad === 1) return prev;

      const nuevaCantidad = p.cantidad - 1;

      return {
        ...prev,
        [codigo]: {
          ...p,
          cantidad: nuevaCantidad,
          subtotal: nuevaCantidad * p.PrecioUnitario,
        },
      };
    });
  };

  const total = Object.values(productosVenta).reduce(
    (t, p) => t + p.subtotal,
    0
  );

  return (
    <div className="container mt-4">

      <table className="table table-striped table-hover shadow-sm">
        <thead className="table-primary text-center">
          <tr>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Cant/Kg</th>
            <th>Precio</th>
            <th>Subtotal</th>
          </tr>
        </thead>

        <tbody>
          {Object.values(productosVenta).map((p) => (
            <tr key={p.CodigoDeBarras} className="text-center">
              <td>{p.NombreProducto}</td>
              <td>{p.TipoProducto}</td>

              <td>
                {p.TipoProducto === "unidad" ? (
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => disminuir(p.CodigoDeBarras)}
                    >
                      -
                    </button>

                    <span className="fw-bold">{p.cantidad}</span>

                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => aumentar(p.CodigoDeBarras)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <b>{p.cantidad} kg</b>
                )}
              </td>

              <td>${p.PrecioUnitario}</td>
              <td className="fw-bold">${p.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-end fw-bold mt-3">TOTAL: ${total}</h2>

      <div className="d-flex gap-3 justify-content-center mt-4">
        <button className="btn btn-primary btn-lg" onClick={pagarDebito}>
          💳 Pagar con Débito
        </button>

        <button className="btn btn-success btn-lg" onClick={pagarEfectivo}>
          💵 Pagar en Efectivo
        </button>
      </div>

    </div>
  );
};

export default MostrarProductosVenta;
