// componente: AgregarProductoComponent.tsx

import { ProductoInterface } from '@/app/shared/interfaces/producto/ProductoInterface';
import '../../../assets/css/gestion-productos-styles/agregar-productos-style/agregar-producto-style.css';
import { useState } from 'react';
import { registrarMovimientosPromise, registrarProductoPromise } from '@/app/firebase/Promesas';

const InitialStateProducto: ProductoInterface = {
  NombreProducto: "",
  CodigoDeBarras: "",
  Precio: "",
  Stock: "",
  TipoProducto: "unidad",
};

export const AgregarProductoComponent = () => {
  const [Producto, setProducto] = useState<ProductoInterface>(InitialStateProducto);

  const handleInputProducto = (name: string, value: string) => {
    setProducto({ ...Producto, [name]: value });
  };

  const handleCallPromiseRegistrarProductos = () => {
    registrarProductoPromise(Producto)
      .then(() => {
        alert("PRODUCTO REGISTRADO CORRECTAMENTE");
        setProducto(InitialStateProducto);
      })
      .catch((error) => {
        alert("OCURRIO UN ERROR AL REGISTRAR");
        console.log(error);
      });
  };

  const handleCallRegistrarMovimiento = () => {
    const accion = Producto;
    registrarMovimientosPromise(
      "REGISTRAR PRODUCTO",
      `Se ha Registrado el producto con nombre: ${accion.NombreProducto}, codigo de barras: ${accion.CodigoDeBarras}, precio unitario: ${accion.Precio}, stock: ${accion.Stock} (${accion.TipoProducto === "peso" ? "kg" : "unidades"})`
    )
      .then(() => {
        console.log("MOVIMIENTO REGISTRADO");
      })
      .catch(() => {
        alert("NO SE PUDO REGISTRAR LA ACCION");
      });
  };

  return (
    <>
      <header className="header-title-style">
        <div>
          <h1>REGISTRAR PRODUCTO</h1> <br />
        </div>
      </header>

      <main>
        <form className="agregar-form">
          <div className="input-box">
            <input
              type="text"
              name="NombreProducto"
              required
              spellCheck="false"
              value={Producto.NombreProducto}
              onChange={(e) => handleInputProducto(e.currentTarget.name, e.currentTarget.value)}
            />
            <label>NOMBRE DEL PRODUCTO</label> <br />
          </div>

          <div className="input-box">
            <input
              type="number"
              name="CodigoDeBarras"
              required
              spellCheck="false"
              value={Producto.CodigoDeBarras}
              onChange={(e) => handleInputProducto(e.currentTarget.name, e.currentTarget.value)}
            />
            <label>CODIGO DE BARRAS</label>
            <br />
          </div>

          <div className="input-box">
            <input
              type="number"
              name="Precio"
              required
              spellCheck="false"
              value={Producto.Precio}
              onChange={(e) => handleInputProducto(e.currentTarget.name, e.currentTarget.value)}
            />
            <label>
              PRECIO {Producto.TipoProducto === "peso" ? "(POR KG)" : "(POR UNIDAD)"}
            </label>{" "}
            <br />
          </div>

          <div className="input-box">
            <input
              type="number"
              name="Stock"
              required
              spellCheck="false"
              value={Producto.Stock}
              onChange={(e) => handleInputProducto(e.currentTarget.name, e.currentTarget.value)}
            />
            <label>STOCK ({Producto.TipoProducto === "peso" ? "KG" : "UNIDADES"})</label>
            <br />
          </div>

          <div className="input-box">
            <select
              name="TipoProducto"
              value={Producto.TipoProducto}
              onChange={(e) => handleInputProducto(e.currentTarget.name, e.currentTarget.value)}
            >
              <option value="unidad">Producto por unidad</option>
              <option value="peso">Producto por peso (kg)</option>
            </select>
            <label>TIPO DE PRODUCTO</label>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleCallPromiseRegistrarProductos();
              handleCallRegistrarMovimiento();
            }}
          >
            <span>REGISTRAR</span>
          </button>
        </form>
      </main>
    </>
  );
};

export default AgregarProductoComponent;
