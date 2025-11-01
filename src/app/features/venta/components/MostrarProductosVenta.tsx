import { InterfaceCantidadPorProducto } from "@/app/shared/interfaces/ingresar-cdb/InterfaceCantidadPorProducto";
import { InterfacePrecioTotal } from "@/app/shared/interfaces/ingresar-cdb/InterfacePrecioTotal";
import { PropsMostrarProductosVenta } from "@/app/shared/interfaces/ingresar-cdb/PropsMostrarProductosVenta";
import { ProductoInterface } from "@/app/shared/interfaces/producto/ProductoInterface";
import { useEffect, useState } from "react";
import RealizarVenta from "./RealizarVenta";
import { PropsProductosVenta } from "@/app/shared/interfaces/ingresar-cdb/PropsProductosVenta";
import "../assets/css/mostrar-producto-style.css";
import Image from "next/image";
import mas from "../assets/img/anadir.png";
import menos from "../assets/img/boton-menos.png";

const PRODUCTOS_POR_PAGINA = 7;

export const MostrarProductosVenta = ({ ProductoAgregado }: PropsMostrarProductosVenta) => {
  const [AlmacenarProducto, setAlmacenarProducto] = useState<ProductoInterface[]>([]);
  const [CantidadPorProducto, setCantidadPorProducto] = useState<InterfaceCantidadPorProducto>({});
  const [PrecioTotal, setPrecioTotal] = useState<InterfacePrecioTotal>({});
  const [TotalGeneral, setTotalGeneral] = useState(0);
  const [ProductosVenta, setProductosVenta] = useState<PropsProductosVenta[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);

  /* --- Agregar productos a la tabla --- */
  useEffect(() => {
    const producto = ProductoAgregado?.[0];
    if (!producto) return;

    const YaExiste = AlmacenarProducto.find(
      (p) => p.CodigoDeBarras === producto.CodigoDeBarras
    );

    if (YaExiste) {
      setCantidadPorProducto((prev) => ({
        ...prev,
        [producto.CodigoDeBarras]: {
          ...prev[producto.CodigoDeBarras],
          cantidad: (prev[producto.CodigoDeBarras]?.cantidad || 1) + 1,
        },
      }));

      setPrecioTotal((prev) => ({
        ...prev,
        [producto.CodigoDeBarras]: {
          total:
            (prev[producto.CodigoDeBarras]?.total || Number(producto.Precio)) +
            Number(producto.Precio),
        },
      }));
    } else {
      setAlmacenarProducto((prev) => [...prev, ...ProductoAgregado]);

      setCantidadPorProducto((prev) => ({
        ...prev,
        [producto.CodigoDeBarras]: {
          NombreProducto: producto.NombreProducto,
          CodigoDeBarras: producto.CodigoDeBarras,
          Precio: producto.Precio,
          cantidad: 1,
        },
      }));

      setPrecioTotal((prev) => ({
        ...prev,
        [producto.CodigoDeBarras]: { total: Number(producto.Precio) },
      }));

      const totalPaginas = Math.ceil(
        (AlmacenarProducto.length + 1) / PRODUCTOS_POR_PAGINA
      );
      setPaginaActual(totalPaginas);
    }
  }, [ProductoAgregado]);

  /* --- Sumar cantidad --- */
  const handleAñadirProducto = (NombreProducto: string, CodigoDeBarras: string, Precio: string) => {
    setCantidadPorProducto((prev) => ({
      ...prev,
      [CodigoDeBarras]: {
        ...prev[CodigoDeBarras],
        cantidad: prev[CodigoDeBarras].cantidad + 1,
      },
    }));

    setPrecioTotal((prev) => ({
      ...prev,
      [CodigoDeBarras]: {
        total: prev[CodigoDeBarras].total + Number(Precio),
      },
    }));
  };

  /* --- Restar cantidad --- */
  const handleDescartarProducto = (NombreProducto: string, CodigoDeBarras: string, Precio: string) => {
    const nuevaCantidad = (CantidadPorProducto[CodigoDeBarras]?.cantidad || 1) - 1;

    if (nuevaCantidad < 1) {
      setAlmacenarProducto((prev) =>
        prev.filter((p) => p.CodigoDeBarras !== CodigoDeBarras)
      );

      setCantidadPorProducto((prev) => {
        const nuevo = { ...prev };
        delete nuevo[CodigoDeBarras];
        return nuevo;
      });

      setPrecioTotal((prev) => {
        const nuevo = { ...prev };
        delete nuevo[CodigoDeBarras];
        return nuevo;
      });
    } else {
      setCantidadPorProducto((prev) => ({
        ...prev,
        [CodigoDeBarras]: {
          ...prev[CodigoDeBarras],
          cantidad: nuevaCantidad,
        },
      }));

      setPrecioTotal((prev) => ({
        ...prev,
        [CodigoDeBarras]: {
          total:
            (prev[CodigoDeBarras]?.total || Number(Precio)) -
            Number(Precio),
        },
      }));
    }
  };

  /* ✅ Reajuste inteligente de paginación */
  useEffect(() => {
    const total = Object.values(PrecioTotal).reduce(
      (acc, item) => acc + (item.total || 0),
      0
    );
    setTotalGeneral(total);
    setProductosVenta(Object.values(CantidadPorProducto));

    const totalPaginasRecalculadas = Math.ceil(
      AlmacenarProducto.length / PRODUCTOS_POR_PAGINA
    );

    if (paginaActual > totalPaginasRecalculadas && totalPaginasRecalculadas > 0) {
      setPaginaActual(1);
    }

    if (totalPaginasRecalculadas === 0) {
      setPaginaActual(1);
    }
  }, [PrecioTotal, AlmacenarProducto]);

  const totalPaginas = Math.ceil(
    AlmacenarProducto.length / PRODUCTOS_POR_PAGINA
  );

  const productosPaginados = AlmacenarProducto.slice(
    (paginaActual - 1) * PRODUCTOS_POR_PAGINA,
    paginaActual * PRODUCTOS_POR_PAGINA
  );

  return (
    <div className="mostrar-venta-container">
      {AlmacenarProducto.length === 0 ? (
        <div className="esqueleto">
          <div className="esqueleto-linea"></div>
          <div className="esqueleto-linea"></div>
          <div className="esqueleto-linea"></div>
        </div>
      ) : (
        <>
          <div className="tabla-y-paginacion">

            <table className="table-mostrar-producto">
              <thead>
                <tr>
                  <td>NOMBRE DEL PRODUCTO</td>
                  <td>CODIGO DE BARRAS</td>
                  <td>PRECIO</td>
                  <td>STOCK</td>
                  <td>CANTIDAD</td>
                </tr>
              </thead>

              <tbody>
                {productosPaginados.map((productoMap, index) => (
                  <tr
                    key={index}
                    className={
                      Number(productoMap.Stock) <= 1
                        ? "fila-stock-bajo"
                        : Number(productoMap.Stock) <= 5
                        ? "fila-stock-medio"
                        : ""
                    }
                  >
                    <td>{productoMap.NombreProducto}</td>
                    <td>{productoMap.CodigoDeBarras}</td>
                    <td>{productoMap.Precio}</td>
                    <td className="td-stock">{productoMap.Stock}</td>
                    <td className="button-cantidad">
                      {CantidadPorProducto[productoMap.CodigoDeBarras]?.cantidad || 1}

                      <button
                        className="button-suma"
                        onClick={() =>
                          handleAñadirProducto(
                            productoMap.NombreProducto,
                            productoMap.CodigoDeBarras,
                            productoMap.Precio
                          )
                        }
                      >
                        <Image src={mas} alt="+" className="mas-img" />
                      </button>

                      <button
                        className="button-resta"
                        onClick={() =>
                          handleDescartarProducto(
                            productoMap.NombreProducto,
                            productoMap.CodigoDeBarras,
                            productoMap.Precio
                          )
                        }
                      >
                        <Image src={menos} alt="-" className="menos-img" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="paginacion">
              <button
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1 || totalPaginas <= 1}
              >
                ← Anterior
              </button>

              <span>
                Página {totalPaginas === 0 ? 1 : paginaActual} de{" "}
                {totalPaginas === 0 ? 1 : totalPaginas}
              </span>

              <button
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPaginas || totalPaginas <= 1}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </>
      )}

      <RealizarVenta
        TotalGeneral={TotalGeneral}
        ProductosVenta={ProductosVenta}
        VentaCompletada={() => {
          setAlmacenarProducto([]);
          setCantidadPorProducto({});
          setPrecioTotal({});
          setTotalGeneral(0);
          setProductosVenta([]);
          setPaginaActual(1);
        }}
        className="realizar-venta"
      />
    </div>
  );
};

export default MostrarProductosVenta;
