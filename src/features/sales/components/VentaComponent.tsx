import { useState, useRef, useEffect } from "react";
import { ScanBarcode, Plus, Minus, Trash2, CreditCard, Banknote } from "lucide-react";

import { 
  obtenerProductosPromise, 
  registrarVentaYActualizarStockPromise 
} from "@/core/infrastructure/firebase";
import { ProductoInterface } from "@/core/domain/entities";
import { ProductoVenta } from "@/shared/types";

interface ProductoCarrito {
  codigoBarras: string;
  nombre: string;
  tipo: "unidad" | "peso";
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export const VentaComponent = () => {
  const [codigoBarras, setCodigoBarras] = useState("");
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [montoPagado, setMontoPagado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const buscarProducto = async (codigo: string): Promise<ProductoInterface | null> => {
    try {
      const productos = await obtenerProductosPromise();
      const encontrado = productos.find((p: ProductoInterface) => p.CodigoDeBarras === codigo);
      return encontrado || null;
    } catch (error) {
      console.error("Error buscando producto:", error);
      return null;
    }
  };

  const handleEscanear = async () => {
    if (!codigoBarras.trim()) {
      setMensaje("Ingresa un código de barras");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    setCargando(true);
    const producto = await buscarProducto(codigoBarras);
    setCargando(false);

    if (!producto) {
      setMensaje("Producto no encontrado");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    // Verificar stock
    if (Number(producto.Stock) <= 0) {
      setMensaje("Producto sin stock disponible");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find((p) => p.codigoBarras === codigoBarras);

    if (productoExistente) {
      // Si ya existe, incrementar cantidad
      const incremento = producto.TipoProducto === "unidad" ? 1 : 0.5;
      actualizarCantidad(codigoBarras, productoExistente.cantidad + incremento);
    } else {
      // Agregar nuevo producto al carrito
      const cantidadInicial = producto.TipoProducto === "unidad" ? 1 : 0.5;
      const nuevoProducto: ProductoCarrito = {
        codigoBarras: producto.CodigoDeBarras,
        nombre: producto.NombreProducto,
        tipo: producto.TipoProducto as "unidad" | "peso",
        precioUnitario: Number(producto.Precio),
        cantidad: cantidadInicial,
        subtotal: Number(producto.Precio) * cantidadInicial,
      };
      setCarrito([...carrito, nuevoProducto]);
      setMensaje(`${producto.NombreProducto} agregado al carrito`);
      setTimeout(() => setMensaje(""), 3000);
    }

    setCodigoBarras("");
    inputRef.current?.focus();
  };

  const actualizarCantidad = (codigoBarras: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarProducto(codigoBarras);
      return;
    }

    setCarrito(
      carrito.map((item) => {
        if (item.codigoBarras === codigoBarras) {
          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: item.precioUnitario * nuevaCantidad,
          };
        }
        return item;
      })
    );
  };

  const eliminarProducto = (codigoBarras: string) => {
    setCarrito(carrito.filter((item) => item.codigoBarras !== codigoBarras));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.subtotal, 0);
  };

  const handlePagarTarjeta = async () => {
    if (carrito.length === 0) {
      setMensaje("El carrito está vacío");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    setCargando(true);
    setMensaje("Procesando pago con tarjeta...");

    const total = calcularTotal();
    const productosVenta: ProductoVenta[] = carrito.map((item) => ({
      NombreProducto: item.nombre,
      CodigoDeBarras: item.codigoBarras,
      TipoProducto: item.tipo,
      PrecioUnitario: item.precioUnitario,
      cantidad: item.cantidad,
      subtotal: item.subtotal,
    }));

    const ok = await registrarVentaYActualizarStockPromise({
      ProductosVenta: productosVenta,
      TotalGeneral: total,
      metodoPago: "DEBITO",
      pagoCliente: null,
      vueltoEntregado: null,
    });

    setCargando(false);

    if (ok) {
      alert(`Venta realizada exitosamente!\nTotal: $${total.toLocaleString("es-CL")}\nMétodo: Tarjeta de Débito/Crédito`);
      resetearVenta();
    } else {
      setMensaje("Error al procesar la venta");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const handlePagarEfectivo = async () => {
    if (carrito.length === 0) {
      setMensaje("El carrito está vacío");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    const monto = parseFloat(montoPagado);
    const total = calcularTotal();

    if (isNaN(monto) || monto <= 0) {
      setMensaje("Ingresa un monto válido");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    if (monto < total) {
      setMensaje(`El monto es insuficiente. Falta: $${(total - monto).toLocaleString("es-CL")}`);
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    setCargando(true);
    const vuelto = monto - total;

    const productosVenta: ProductoVenta[] = carrito.map((item) => ({
      NombreProducto: item.nombre,
      CodigoDeBarras: item.codigoBarras,
      TipoProducto: item.tipo,
      PrecioUnitario: item.precioUnitario,
      cantidad: item.cantidad,
      subtotal: item.subtotal,
    }));

    const ok = await registrarVentaYActualizarStockPromise({
      ProductosVenta: productosVenta,
      TotalGeneral: total,
      metodoPago: "EFECTIVO",
      pagoCliente: monto,
      vueltoEntregado: vuelto,
    });

    setCargando(false);

    if (ok) {
      alert(`Venta realizada exitosamente!\nTotal: $${total.toLocaleString("es-CL")}\nPagado: $${monto.toLocaleString("es-CL")}\nVuelto: $${vuelto.toLocaleString("es-CL")}`);
      resetearVenta();
    } else {
      setMensaje("Error al procesar la venta");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const resetearVenta = () => {
    setCarrito([]);
    setCodigoBarras("");
    setMostrarPago(false);
    setMontoPagado("");
    setMensaje("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEscanear();
    }
  };

  const total = calcularTotal();

  return (
    <div className="w-full h-full flex items-center px-6">
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-lg shadow-lg p-6 flex flex-col mx-auto">
        {/* Header */}
        <div className="mb-4 shrink-0">
          <h1 className="text-2xl text-gray-900 mb-1 font-bold">Realizar Venta</h1>
          <p className="text-sm text-gray-600">Escanea o ingresa el código de barras de los productos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Panel Izquierdo - Escáner */}
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Input de código de barras */}
            <div className="shrink-0">
              <label className="block mb-1 text-sm text-gray-700 font-medium">Código de Barras</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={codigoBarras}
                    onChange={(e) => setCodigoBarras(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escanea o ingresa el código"
                    disabled={cargando}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 text-sm"
                  />
                </div>
                <button
                  onClick={handleEscanear}
                  disabled={cargando}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium text-sm"
                >
                  {cargando ? "..." : "Agregar"}
                </button>
              </div>
            </div>

            {/* Mensaje */}
            {mensaje && (
              <div className={`${mensaje.includes("Error") || mensaje.includes("insuficiente") || mensaje.includes("sin stock") ? "bg-red-50 border-red-200 text-red-800" : "bg-blue-50 border-blue-200 text-blue-800"} border rounded-lg p-2 shrink-0`}>
                <p className="text-xs">{mensaje}</p>
              </div>
            )}

            {/* Lista de productos en carrito con scroll */}
            <div className="border border-gray-200 rounded-lg p-3 flex-1 flex flex-col overflow-hidden">
              <h2 className="text-lg text-gray-900 mb-3 shrink-0 font-semibold">
                Carrito de Compras
              </h2>

              {carrito.length === 0 ? (
                <div className="flex items-center justify-center flex-1 text-gray-400">
                  <p>No hay productos en el carrito</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto pr-2 flex-1">
                  {carrito.map((item) => (
                    <div key={item.codigoBarras} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-sm text-gray-900 font-medium">{item.nombre}</h3>
                          <p className="text-xs text-gray-500">
                            ${item.precioUnitario.toLocaleString("es-CL")} por{" "}
                            {item.tipo === "peso" ? "kg" : "unidad"}
                          </p>
                        </div>
                        <button
                          onClick={() => eliminarProducto(item.codigoBarras)}
                          className="p-1 hover:bg-red-100 rounded transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              actualizarCantidad(
                                item.codigoBarras,
                                item.cantidad - (item.tipo === "unidad" ? 1 : 0.1)
                              )
                            }
                            className="p-1 bg-gray-100 hover:bg-gray-200 rounded transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => {
                              const valor = parseFloat(e.target.value);
                              if (!isNaN(valor) && valor >= 0) {
                                actualizarCantidad(item.codigoBarras, valor);
                              }
                            }}
                            step={item.tipo === "peso" ? "0.1" : "1"}
                            min="0"
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          />

                          <span className="text-sm text-gray-600">
                            {item.tipo === "peso" ? "kg" : "un."}
                          </span>

                          <button
                            onClick={() =>
                              actualizarCantidad(
                                item.codigoBarras,
                                item.cantidad + (item.tipo === "unidad" ? 1 : 0.1)
                              )
                            }
                            className="p-1 bg-gray-100 hover:bg-gray-200 rounded transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-900 font-semibold">
                            ${item.subtotal.toLocaleString("es-CL")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel Derecho - Resumen y Pago */}
          <div className="flex flex-col gap-3 overflow-hidden">
            {/* Resumen del Total */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shrink-0">
              <h2 className="text-lg text-gray-900 mb-3 font-semibold">Resumen</h2>
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Productos:</span>
                  <span className="text-sm text-gray-900 font-medium">{carrito.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm text-gray-900 font-medium">
                    ${total.toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-lg text-gray-900 font-semibold">Total:</span>
                    <span className="text-xl text-blue-600 font-bold">
                      ${total.toLocaleString("es-CL")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Métodos de Pago */}
            <div className="flex-1 flex flex-col gap-3">
              {!mostrarPago ? (
                <>
                  <h2 className="text-lg text-gray-900 shrink-0 font-semibold">
                    Método de Pago
                  </h2>

                  <button
                    onClick={handlePagarTarjeta}
                    disabled={carrito.length === 0 || cargando}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg transition shrink-0 font-medium text-sm"
                  >
                    <CreditCard className="w-6 h-6" />
                    <span>Pagar con Tarjeta</span>
                  </button>

                  <button
                    onClick={() => {
                      if (carrito.length === 0) {
                        setMensaje("El carrito está vacío");
                        setTimeout(() => setMensaje(""), 3000);
                        return;
                      }
                      setMostrarPago(true);
                    }}
                    disabled={carrito.length === 0 || cargando}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg transition shrink-0 font-medium text-sm"
                  >
                    <Banknote className="w-6 h-6" />
                    <span>Pagar con Efectivo</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between shrink-0">
                    <h2 className="text-lg text-gray-900 font-semibold">Pago en Efectivo</h2>
                    <button
                      onClick={() => {
                        setMostrarPago(false);
                        setMontoPagado("");
                      }}
                      className="text-xs text-gray-600 hover:text-gray-900"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="shrink-0">
                    <label className="block mb-1 text-sm text-gray-700 font-medium">
                      Monto Recibido
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={montoPagado}
                        onChange={(e) => setMontoPagado(e.target.value)}
                        placeholder="0"
                        step="100"
                        min="0"
                        className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
                      />
                    </div>
                  </div>

                  {montoPagado && parseFloat(montoPagado) >= total && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 shrink-0">
                      <p className="text-xs text-green-800 mb-1 font-medium">Vuelto a entregar:</p>
                      <p className="text-lg text-green-900 font-bold">
                        ${(parseFloat(montoPagado) - total).toLocaleString("es-CL")}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handlePagarEfectivo}
                    disabled={cargando}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg transition shrink-0 font-medium text-sm"
                  >
                    {cargando ? "Procesando..." : "Finalizar Venta"}
                  </button>
                </>
              )}

              {/* Botón para limpiar carrito */}
              {carrito.length > 0 && (
                <button
                  onClick={resetearVenta}
                  disabled={cargando}
                  className="w-full flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 disabled:bg-gray-200 text-red-700 py-2 rounded-lg transition shrink-0 mt-auto font-medium text-sm"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Cancelar Venta</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentaComponent;
