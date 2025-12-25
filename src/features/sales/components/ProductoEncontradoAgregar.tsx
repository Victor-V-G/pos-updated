import { useState } from "react";

export const ProductoEncontradoAgregar = ({
  ProductoFindSetter,
  setProductoAgregado,
  setLimpiarInput,
}: any) => {
  const producto = ProductoFindSetter[0];
  const [pesoKg, setPesoKg] = useState("");

  if (!producto)
    return (
      <div className="alert alert-secondary text-center mt-3">
        Escanee un producto…
      </div>
    );

  const agregar = () => {
    if (producto.TipoProducto === "peso") {
      if (!pesoKg || Number(pesoKg) <= 0) {
        alert("Ingrese un peso válido.");
        return;
      }

      setProductoAgregado([{ ...producto, cantidad: Number(pesoKg) }]);
    } else {
      setProductoAgregado([{ ...producto, cantidad: 1 }]);
    }

    setLimpiarInput(true);
  };

  return (
    <div className="card shadow-sm p-3">
      <h4 className="fw-bold">{producto.NombreProducto}</h4>
      <p className="text-muted">Código: {producto.CodigoDeBarras}</p>
      <p><b>Precio:</b> ${producto.Precio}</p>

      {producto.TipoProducto === "peso" && (
        <input
          type="number"
          step="0.01"
          className="form-control my-2"
          placeholder="Peso en kg"
          value={pesoKg}
          onChange={(e) => setPesoKg(e.target.value)}
        />
      )}

      <button className="btn btn-primary w-100 mt-2" onClick={agregar}>
        {producto.TipoProducto === "peso"
          ? "Agregar por peso"
          : "Agregar unidad"}
      </button>
    </div>
  );
};

export default ProductoEncontradoAgregar;
