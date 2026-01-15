import { useState, useRef, useEffect } from "react";
import { ScanBarcode, Plus, Minus, Trash2, CreditCard, Banknote, HelpCircle, X, Scale, ShoppingCart, Wifi, WifiOff } from "lucide-react";

import { 
  obtenerProductosPromise, 
  registrarVentaYActualizarStockPromise,
  registrarTransaccionCajaPromise
} from "@/core/infrastructure/firebase";
import { ProductoInterface } from "@/core/domain/entities";
import { ProductoVenta } from "@/shared/types";
import { useOfflineSync, useOnlineStatus } from "@/core/infrastructure/offline";

interface ProductoCarrito {
  codigoBarras: string;
  nombre: string;
  tipo: "unidad" | "peso";
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  cantidadTemporal?: string; // Para manejar la edición temporal
}

export const VentaComponent = () => {
  const [codigoBarras, setCodigoBarras] = useState("");
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [montoPagado, setMontoPagado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [focusTrigger, setFocusTrigger] = useState(0); // Para forzar el focus cuando sea necesario
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [mostrarTransaccion, setMostrarTransaccion] = useState(false);
  const [tipoTransaccion, setTipoTransaccion] = useState<"giro" | "deposito">("giro");
  const [montoTransaccion, setMontoTransaccion] = useState("");
  const [descripcionTransaccion, setDescripcionTransaccion] = useState("");
  const [mensajeTransaccion, setMensajeTransaccion] = useState("");
  const [cargandoTransaccion, setCargandoTransaccion] = useState(false);
  const [mostrarProductosPeso, setMostrarProductosPeso] = useState(false);
  const [productosPeso, setProductosPeso] = useState<ProductoInterface[]>([]);
  const [busquedaProductoPeso, setBusquedaProductoPeso] = useState("");
  const [mostrarModalPeso, setMostrarModalPeso] = useState(false);
  const [productoPesoTemporal, setProductoPesoTemporal] = useState<ProductoInterface | null>(null);
  const [pesoBruto, setPesoBruto] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputMontoRef = useRef<HTMLInputElement>(null);
  const inputPesoRef = useRef<HTMLInputElement>(null);
  const carritoScrollRef = useRef<HTMLDivElement>(null);

  // Hooks offline
  const { saveSale, getProducts, isOnline } = useOfflineSync();
  const onlineStatus = useOnlineStatus();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cargar productos por peso al montar el componente
  useEffect(() => {
    const cargarProductosPeso = async () => {
      try {
        const productos = await getProducts(obtenerProductosPromise);
        const productosPorPeso = productos.filter((p: ProductoInterface) => p.TipoProducto === "peso");
        setProductosPeso(productosPorPeso);
      } catch (error) {
        console.error("Error cargando productos por peso:", error);
      }
    };
    cargarProductosPeso();
  }, []);

  // Reactivar focus cuando se necesite
  useEffect(() => {
    if (focusTrigger > 0) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [focusTrigger]);

  // Agregar producto automáticamente después de escribir/escanear
  useEffect(() => {
    if (!codigoBarras.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      handleEscanear();
    }, 500); // Esperar 500ms después de que se deje de escribir

    return () => clearTimeout(timer);
  }, [codigoBarras]);

  // Activar focus en el input de monto cuando se selecciona pago en efectivo
  useEffect(() => {
    if (mostrarPago) {
      inputMontoRef.current?.focus();
    }
  }, [mostrarPago]);

  // Atajos de teclado para métodos de pago
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputElement = target.tagName === 'INPUT';
      const isCodigoBarrasInput = target === inputRef.current;
      
      // Permitir scroll con flechas si hay carrito, incluso con foco en código de barras vacío
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && carrito.length > 0) {
        const container = carritoScrollRef.current;
        if (container && (!isInputElement || (isCodigoBarrasInput && !codigoBarras.trim()))) {
          e.preventDefault();
          const direction = e.key === 'ArrowDown' ? 1 : -1;
          container.scrollBy({
            top: 80 * direction,
            behavior: 'smooth'
          });
          return;
        }
      }

      // Si estamos en el input de código de barras pero tiene contenido, no interferir
      if (isCodigoBarrasInput && codigoBarras.trim()) {
        return;
      }
      
      // Si estamos en otro input (como el de monto), no interferir
      if (isInputElement && !isCodigoBarrasInput) {
        return;
      }

      // Solo activar si hay productos en el carrito
      if (carrito.length === 0) {
        return;
      }

      // E = Efectivo, T = Tarjeta
      if (e.key.toLowerCase() === 'e' && !mostrarPago) {
        e.preventDefault();
        setMostrarPago(true);
      } else if (e.key.toLowerCase() === 't' && !mostrarPago) {
        e.preventDefault();
        handlePagarTarjeta();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [carrito, mostrarPago, codigoBarras]);

  const buscarProducto = async (codigo: string): Promise<ProductoInterface | null> => {
    try {
      const productos = await getProducts(obtenerProductosPromise);
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
      setMensaje("Producto no encontrado, verifique que este registrado");
      setCodigoBarras("");
      setFocusTrigger(prev => prev + 1);
      return;
    }

    // Si es un producto de peso, abrir modal para ingresar el peso
    if (producto.TipoProducto === "peso") {
      setProductoPesoTemporal(producto);
      setPesoBruto("");
      setMostrarModalPeso(true);
      setCodigoBarras("");
      return;
    }

    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find((p) => p.codigoBarras === codigoBarras);

    if (productoExistente) {
      // Si ya existe, incrementar cantidad y mover al inicio
      const incremento = producto.TipoProducto === "unidad" ? 1 : 0.5;
      setCarrito((prev) => {
        const actualizado = prev.map((item) => {
          if (item.codigoBarras === codigoBarras) {
            const nuevaCantidad = redondearCantidad(item.cantidad + incremento);
            return {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: item.precioUnitario * nuevaCantidad,
              cantidadTemporal: undefined,
            };
          }
          return item;
        });
        const itemActualizado = actualizado.find((item) => item.codigoBarras === codigoBarras);
        const resto = actualizado.filter((item) => item.codigoBarras !== codigoBarras);
        return itemActualizado ? [itemActualizado, ...resto] : actualizado;
      });
      
      // Mostrar mensaje según el tipo de producto
      if (producto.TipoProducto === "unidad") {
        setMensaje(`${producto.NombreProducto} - Unidad añadida correctamente`);
      } else {
        setMensaje(`${producto.NombreProducto} - ${incremento}kg añadidos correctamente`);
      }
    } else {
      // Agregar nuevo producto al carrito al inicio
      const cantidadInicial = producto.TipoProducto === "unidad" ? 1 : 0.5;
      const nuevoProducto: ProductoCarrito = {
        codigoBarras: producto.CodigoDeBarras,
        nombre: producto.NombreProducto,
        tipo: producto.TipoProducto as "unidad" | "peso",
        precioUnitario: Number(producto.Precio),
        cantidad: cantidadInicial,
        subtotal: Number(producto.Precio) * cantidadInicial,
      };
      setCarrito((prev) => [nuevoProducto, ...prev]);
      setMensaje(`${producto.NombreProducto} agregado al carrito`);
    }

    setCodigoBarras("");
    setFocusTrigger(prev => prev + 1);
  };

  const handleAgregarConPeso = () => {
    if (!productoPesoTemporal || !pesoBruto.trim()) {
      setMensaje("Por favor ingresa el peso del producto");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    // Parsear el peso ingresado
    let pesoFinal = 0;
    let valorLimpio = pesoBruto.replace(/\s/g, '').replace(',', '.');
    
    // Si comienza con 0 y no tiene punto o coma, insertar punto después del 0
    if (valorLimpio.startsWith('0') && !pesoBruto.includes('.') && !pesoBruto.includes(',')) {
      valorLimpio = '0.' + valorLimpio.substring(1);
    }
    
    // Convertir a número
    pesoFinal = parseFloat(valorLimpio);

    if (isNaN(pesoFinal) || pesoFinal <= 0) {
      setMensaje("Ingresa un peso válido");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find((p) => p.codigoBarras === productoPesoTemporal.CodigoDeBarras);

    if (productoExistente) {
      // Si ya existe, sumar el peso y mover al inicio
      setCarrito((prev) => {
        const actualizado = prev.map((item) => {
          if (item.codigoBarras === productoPesoTemporal.CodigoDeBarras) {
            const nuevaCantidad = redondearCantidad(item.cantidad + pesoFinal);
            return {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: item.precioUnitario * nuevaCantidad,
              cantidadTemporal: undefined,
            };
          }
          return item;
        });
        const itemActualizado = actualizado.find((item) => item.codigoBarras === productoPesoTemporal.CodigoDeBarras);
        const resto = actualizado.filter((item) => item.codigoBarras !== productoPesoTemporal.CodigoDeBarras);
        return itemActualizado ? [itemActualizado, ...resto] : actualizado;
      });
      setMensaje(`${productoPesoTemporal.NombreProducto} - ${pesoFinal.toFixed(3)}kg añadidos correctamente`);
    } else {
      // Agregar nuevo producto al carrito con el peso ingresado al inicio
      const nuevoProducto: ProductoCarrito = {
        codigoBarras: productoPesoTemporal.CodigoDeBarras,
        nombre: productoPesoTemporal.NombreProducto,
        tipo: "peso",
        precioUnitario: Number(productoPesoTemporal.Precio),
        cantidad: pesoFinal,
        subtotal: Number(productoPesoTemporal.Precio) * pesoFinal,
      };
      setCarrito((prev) => [nuevoProducto, ...prev]);
      setMensaje(`${productoPesoTemporal.NombreProducto} - ${pesoFinal.toFixed(3)}kg agregado al carrito`);
    }

    // Cerrar modal y limpiar
    setMostrarModalPeso(false);
    setProductoPesoTemporal(null);
    setPesoBruto("");
    setFocusTrigger(prev => prev + 1);
  };

  const redondearCantidad = (cantidad: number): number => {
    // Redondear a 3 decimales para evitar problemas de precisión
    return Math.round(cantidad * 1000) / 1000;
  };

  const actualizarCantidad = (codigoBarras: string, nuevaCantidad: number) => {
    setCarrito(
      carrito.map((item) => {
        if (item.codigoBarras === codigoBarras) {
          // Redondear la cantidad para evitar valores como 0.9999999
          const cantidadRedondeada = redondearCantidad(nuevaCantidad);
          const cantidadFinal = cantidadRedondeada > 0 ? cantidadRedondeada : item.cantidad;
          return {
            ...item,
            cantidad: cantidadFinal,
            subtotal: item.precioUnitario * cantidadFinal,
            cantidadTemporal: undefined,
          };
        }
        return item;
      })
    );
  };

  const manejarCambioInputCantidad = (codigoBarras: string, valorTexto: string, tipoPeso: boolean) => {
    // Intentar parsear el valor en tiempo real
    let cantidadParseada = 0;
    
    if (valorTexto.trim()) {
      if (tipoPeso) {
        let valorLimpio = valorTexto.replace(/\s/g, '').replace(',', '.');
        
        if (!valorTexto.includes('.') && !valorTexto.includes(',')) {
          const valorNumerico = parseFloat(valorLimpio);
          if (!isNaN(valorNumerico)) {
            cantidadParseada = valorNumerico / 1000;
          }
        } else {
          cantidadParseada = parseFloat(valorLimpio);
        }
      } else {
        cantidadParseada = parseFloat(valorTexto);
      }
    }

    setCarrito(
      carrito.map((item) => {
        if (item.codigoBarras === codigoBarras) {
          // Si el valor parseado es válido, actualizar cantidad y subtotal en tiempo real
          if (!isNaN(cantidadParseada) && cantidadParseada > 0) {
            return {
              ...item,
              cantidad: cantidadParseada,
              subtotal: item.precioUnitario * cantidadParseada,
              cantidadTemporal: valorTexto,
            };
          }
          // Si no es válido, solo guardar el texto temporal
          return {
            ...item,
            cantidadTemporal: valorTexto,
          };
        }
        return item;
      })
    );
  };

  const procesarCantidadFinal = (codigoBarras: string, valorTexto: string, tipoPeso: boolean) => {
    if (!valorTexto.trim()) {
      // Si está vacío, restaurar la cantidad original
      setCarrito(
        carrito.map((item) => {
          if (item.codigoBarras === codigoBarras) {
            return {
              ...item,
              cantidadTemporal: undefined,
            };
          }
          return item;
        })
      );
      return;
    }

    let cantidadFinal = 0;

    if (tipoPeso) {
      // Eliminar espacios y reemplazar coma por punto
      let valorLimpio = valorTexto.replace(/\s/g, '').replace(',', '.');
      
      // Si no contiene punto o coma, interpretar como gramos y convertir a kg
      if (!valorTexto.includes('.') && !valorTexto.includes(',')) {
        const valorNumerico = parseFloat(valorLimpio);
        if (!isNaN(valorNumerico)) {
          cantidadFinal = valorNumerico / 1000; // Convertir gramos a kg
        }
      } else {
        cantidadFinal = parseFloat(valorLimpio);
      }
    } else {
      cantidadFinal = parseFloat(valorTexto);
    }

    if (!isNaN(cantidadFinal) && cantidadFinal > 0) {
      actualizarCantidad(codigoBarras, cantidadFinal);
    } else {
      // Si el valor no es válido, restaurar
      setCarrito(
        carrito.map((item) => {
          if (item.codigoBarras === codigoBarras) {
            return {
              ...item,
              cantidadTemporal: undefined,
            };
          }
          return item;
        })
      );
    }
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

    const ventaData = {
      ProductosVenta: productosVenta,
      TotalGeneral: total,
      metodoPago: "DEBITO",
      pagoCliente: null,
      vueltoEntregado: null,
    };

    // Usar saveSale con offline support
    const result = await saveSale(ventaData, registrarVentaYActualizarStockPromise);
    const ok = result && !result.error;

    setCargando(false);

    if (ok) {
      const statusMsg = result.offline ? " (Guardado offline - Se sincronizará)" : "";
      const confirmar = confirm(`Venta realizada exitosamente!${statusMsg}\nTotal: $${total.toLocaleString("es-CL")}\nMétodo: Tarjeta de Débito/Crédito\n\nPresione Enter para continuar o Escape para cancelar el pago\n(Cancelar mantiene el carrito)`);
      if (confirmar) {
        resetearVenta();
      } else {
        setMensaje("Pago cancelado - Carrito mantenido");
        setTimeout(() => setMensaje(""), 3000);
        setFocusTrigger(prev => prev + 1);
      }
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

    const ventaData = {
      ProductosVenta: productosVenta,
      TotalGeneral: total,
      metodoPago: "EFECTIVO",
      pagoCliente: monto,
      vueltoEntregado: vuelto,
    };

    // Usar saveSale con offline support
    const result = await saveSale(ventaData, registrarVentaYActualizarStockPromise);
    const ok = result && !result.error;

    setCargando(false);

    if (ok) {
      const statusMsg = result.offline ? " (Guardado offline - Se sincronizará)" : "";
      const confirmar = confirm(`Venta realizada exitosamente!${statusMsg}\nTotal: $${total.toLocaleString("es-CL")}\nPagado: $${monto.toLocaleString("es-CL")}\nVuelto: $${vuelto.toLocaleString("es-CL")}\n\nPresione Enter para continuar o Escape para cancelar el pago\n(Cancelar mantiene el carrito)`);
      if (confirmar) {
        resetearVenta();
      } else {
        // Si cancela, volver a mostrar el input de código de barras
        setMostrarPago(false);
        setMontoPagado("");
        setMensaje("Pago cancelado - Carrito mantenido");
        setTimeout(() => setMensaje(""), 3000);
        setFocusTrigger(prev => prev + 1);
      }
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
    setFocusTrigger(prev => prev + 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEscanear();
    }
  };

  const handleRegistrarTransaccion = async () => {
    const monto = parseFloat(montoTransaccion);

    if (isNaN(monto) || monto <= 0) {
      setMensajeTransaccion("Ingresa un monto válido");
      return;
    }

    setCargandoTransaccion(true);
    setMensajeTransaccion("");

    const ok = await registrarTransaccionCajaPromise({
      tipo: tipoTransaccion === "giro" ? "GIRO" : "DEPOSITO",
      monto,
      descripcion: descripcionTransaccion.trim(),
    });

    setCargandoTransaccion(false);

    if (!ok) {
      setMensajeTransaccion("No se pudo registrar la transacción");
      return;
    }

    setMensaje(
      `${tipoTransaccion === "giro" ? "Giro" : "Depósito"} registrado: $${monto.toLocaleString("es-CL")}`
    );
    setTimeout(() => setMensaje(""), 3000);

    setMostrarTransaccion(false);
    setTipoTransaccion("giro");
    setMontoTransaccion("");
    setDescripcionTransaccion("");
    setFocusTrigger(prev => prev + 1);
  };

  const total = calcularTotal();

  return (
    <div 
      className="w-full h-full flex items-center px-6"
      onMouseDown={(e) => {
        // Si se hace clic fuera de inputs y botones interactivos, mantener focus en el escáner
        const target = e.target as HTMLElement;
        const isInteractiveElement = 
          target.tagName === 'INPUT' || 
          target.tagName === 'BUTTON' || 
          target.closest('button') ||
          target.closest('input');
        
        if (!isInteractiveElement) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }}
    >
      <div className="w-full max-w-[95%] h-[85vh] bg-white rounded-lg shadow-lg p-6 flex flex-col mx-auto">
        {/* Header */}
        <div className="mb-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-gray-900 mb-1 font-bold">Realizar Venta</h1>
              <p className="text-sm text-gray-600">Escanea o ingresa el código de barras de los productos</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMostrarProductosPeso(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Productos por Kg"
              >
                <Scale className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={() => {
                  setMensajeTransaccion("");
                  setMostrarTransaccion(true);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Registrar transacción"
              >
                <Banknote className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={() => setMostrarAyuda(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Atajos de teclado"
              >
                <HelpCircle className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
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
                    onChange={(e) => {
                      setCodigoBarras(e.target.value);
                      // Limpiar el mensaje cuando se comienza a escribir un nuevo código
                      if (mensaje) {
                        setMensaje("");
                      }
                    }}
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
              <div
                className={`${mensaje.includes("Error") || mensaje.includes("insuficiente") || mensaje.includes("sin stock") || mensaje.includes("no encontrado")
                  ? "bg-red-50 border-red-500 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
                } border-2 rounded-lg p-4 shrink-0`}
              >
                <p className={`${mensaje.includes("Error") || mensaje.includes("insuficiente") || mensaje.includes("sin stock") || mensaje.includes("no encontrado") ? "text-base font-semibold" : "text-sm font-medium"}`}>
                  {mensaje}
                </p>
              </div>
            )}

            {/* Lista de productos en carrito con scroll */}
            <div className="border border-gray-200 rounded-lg p-3 flex-1 flex flex-col overflow-hidden">
              <h2 className="text-lg text-gray-900 mb-3 shrink-0 font-semibold">
                Carrito de Compras
              </h2>

              {carrito.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-gray-400 gap-3">
                  <ShoppingCart className="w-14 h-14 text-gray-300" />
                  <p>No hay productos en el carrito</p>
                </div>
              ) : (
                <div ref={carritoScrollRef} className="space-y-1.5 overflow-y-auto pr-2 flex-1">
                  {carrito.map((item) => (
                    <div
                      key={item.codigoBarras}
                      className="group rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all p-2.5"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-xs md:text-sm text-slate-900 font-semibold">
                            {item.nombre}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1 mt-0.5">
                            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                              ${item.precioUnitario.toLocaleString("es-CL")} / {item.tipo === "peso" ? "kg" : "unidad"}
                            </span>
                            <span className="text-xs text-slate-400">
                              Código: {item.codigoBarras}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => eliminarProducto(item.codigoBarras)}
                          className="p-1 rounded-full text-red-600 hover:bg-red-50 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1">
                          <button
                            onClick={() => {
                              const nuevaCantidad = item.cantidad - (item.tipo === "unidad" ? 1 : 0.1);
                              if (nuevaCantidad <= 0) {
                                eliminarProducto(item.codigoBarras);
                              } else {
                                actualizarCantidad(item.codigoBarras, nuevaCantidad);
                              }
                            }}
                            className="p-1 rounded-md hover:bg-white transition"
                          >
                            <Minus className="w-3 h-3 text-slate-700" />
                          </button>

                          <input
                            type="text"
                            value={item.cantidadTemporal !== undefined ? item.cantidadTemporal : item.cantidad}
                            onChange={(e) => {
                              manejarCambioInputCantidad(item.codigoBarras, e.target.value, item.tipo === "peso");
                            }}
                            onBlur={(e) => {
                              procesarCantidadFinal(item.codigoBarras, e.target.value, item.tipo === "peso");
                            }}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                procesarCantidadFinal(item.codigoBarras, e.currentTarget.value, item.tipo === "peso");
                                e.currentTarget.blur();
                              }
                            }}
                            className="w-20 px-1 py-1 border border-slate-300 rounded-md text-center text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder={item.tipo === "peso" ? "0.5" : "1"}
                          />

                          <span className="text-xs text-slate-600">
                            {item.tipo === "peso" ? "kg" : "un."}
                          </span>

                          <button
                            onClick={() =>
                              actualizarCantidad(
                                item.codigoBarras,
                                item.cantidad + (item.tipo === "unidad" ? 1 : 0.1)
                              )
                            }
                            className="p-1 rounded-md hover:bg-white transition"
                          >
                            <Plus className="w-3 h-3 text-slate-700" />
                          </button>
                        </div>

                        <div className="text-right -mt-1">
                          <p className="text-xs text-slate-500">Subtotal</p>
                          <p className="text-sm md:text-base text-slate-900 font-extrabold">
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
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4 shrink-0 shadow-md">
              <h2 className="text-xl text-gray-900 mb-3 font-bold">Resumen de Venta</h2>
              <div className="space-y-2.5 mb-2">
                <div className="flex justify-between items-center bg-white rounded-lg p-2.5 border border-blue-200">
                  <span className="text-sm text-gray-700 font-semibold">Productos:</span>
                  <span className="text-2xl text-blue-600 font-extrabold">{carrito.length}</span>
                </div>
                <div className="flex justify-between items-center bg-white rounded-lg p-2.5 border border-blue-200">
                  <span className="text-sm text-gray-700 font-semibold">Subtotal:</span>
                  <span className="text-lg text-blue-600 font-extrabold">
                    ${total.toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="border-t-2 border-green-300 pt-2.5 mt-1.5">
                  <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-green-600 rounded-lg p-3">
                    <span className="text-base text-white font-bold">TOTAL:</span>
                    <span className="text-3xl text-white font-extrabold">
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
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg transition shrink-0 font-medium text-sm"
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
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg transition shrink-0 font-medium text-sm"
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
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition text-sm font-medium"
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
                        ref={inputMontoRef}
                        type="number"
                        value={montoPagado}
                        onChange={(e) => setMontoPagado(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handlePagarEfectivo();
                          }
                        }}
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
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:bg-gray-400 text-white py-3 rounded-lg transition shrink-0 font-medium text-sm"
                  >
                    {cargando ? "Procesando..." : "Finalizar Venta"}
                  </button>
                </>
              )}

              {/* Botón para limpiar carrito */}
              {carrito.length > 0 && (
                <button
                  onClick={() => {
                    const confirmar = confirm("¿Está seguro que desea cancelar la venta?\n\nPresione Enter para cancelar o Escape para continuar con la venta");
                    if (confirmar) {
                      resetearVenta();
                    }
                  }}
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

      {/* Modal de Transacción */}
      {mostrarTransaccion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Banknote className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Registrar Transacción</h2>
              </div>
              <button
                onClick={() => setMostrarTransaccion(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Registra movimientos de caja como giros a cuenta bancaria o depósitos a caja.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm text-gray-700 font-medium">Tipo de Transacción</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoTransaccion("giro")}
                    className={`py-2 rounded-lg border text-sm font-medium transition ${
                      tipoTransaccion === "giro"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Giro
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoTransaccion("deposito")}
                    className={`py-2 rounded-lg border text-sm font-medium transition ${
                      tipoTransaccion === "deposito"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Depósito
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-700 font-medium">Monto</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">$
                  </span>
                  <input
                    type="number"
                    value={montoTransaccion}
                    onChange={(e) => {
                      setMontoTransaccion(e.target.value);
                      if (mensajeTransaccion) {
                        setMensajeTransaccion("");
                      }
                    }}
                    placeholder="40000"
                    min="0"
                    className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ejemplo: $40.000 transferidos a cuenta bancaria (giro)
                </p>
              </div>

              <div>
                <label className="block mb-1 text-sm text-gray-700 font-medium">Descripción (opcional)</label>
                <input
                  type="text"
                  value={descripcionTransaccion}
                  onChange={(e) => setDescripcionTransaccion(e.target.value)}
                  placeholder="Ej: Depósito en cuenta principal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                />
              </div>

              {mensajeTransaccion && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3">
                  <p className="text-sm font-medium">{mensajeTransaccion}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setMostrarTransaccion(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarTransaccion}
                disabled={cargandoTransaccion}
                className={`flex-1 px-4 py-3 text-white rounded-lg transition font-medium text-sm ${
                  tipoTransaccion === "giro"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                }`}
              >
                {cargandoTransaccion ? "Registrando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ayuda */}
      {mostrarAyuda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Atajos de Teclado</h2>
              <button
                onClick={() => setMostrarAyuda(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Acceso Rápido</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Scale className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">Productos por Kilogramo</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Muestra una lista de todos los productos que se venden por peso (kg) con sus códigos de barras para consulta rápida.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b pb-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Métodos de Pago</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pagar con Efectivo</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-semibold">E</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pagar con Tarjeta</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-semibold">T</kbd>
                  </div>
                </div>
              </div>

              <div className="border-b pb-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Acciones Generales</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Agregar Producto</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-semibold">Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Finalizar Pago Efectivo</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-semibold">Enter</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Confirmaciones</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Aceptar / Continuar</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-semibold">Enter</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cancelar / Rechazar</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-semibold">Escape</kbd>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-900">
                  <strong>⚠️ Producto no encontrado:</strong> Si un producto no está registrado, fotografíelo y avise al propietario del local para agregarlo al sistema.
                </p>
              </div>
            </div>

            <button
              onClick={() => setMostrarAyuda(false)}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal de Productos por Peso */}
      {mostrarProductosPeso && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b shrink-0">
              <div className="flex items-center gap-2">
                <Scale className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Productos por Kilogramo</h2>
              </div>
              <button
                onClick={() => {
                  setMostrarProductosPeso(false);
                  setBusquedaProductoPeso("");
                }}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Campo de búsqueda */}
            <div className="p-4 border-b shrink-0">
              <div className="relative">
                <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={busquedaProductoPeso}
                  onChange={(e) => setBusquedaProductoPeso(e.target.value)}
                  placeholder="Buscar por nombre de producto..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto p-4">
              {productosPeso.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No hay productos por peso registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {productosPeso
                    .filter((producto) =>
                      producto && producto.NombreProducto 
                        ? String(producto.NombreProducto).toLowerCase().includes(busquedaProductoPeso.toLowerCase())
                        : false
                    )
                    .map((producto) => (
                      <div
                        key={producto.CodigoDeBarras}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                              {producto.NombreProducto}
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm text-gray-800 font-semibold">Código de Barras:</span>
                                <span className="font-mono text-xl text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded border border-blue-200">
                                  {producto.CodigoDeBarras}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500">Precio por kg:</span>
                                <span className="text-lg text-green-600 font-bold">
                                  ${Number(producto.Precio).toLocaleString("es-CL")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  {productosPeso.filter((producto) =>
                    producto && producto.NombreProducto
                      ? String(producto.NombreProducto).toLowerCase().includes(busquedaProductoPeso.toLowerCase())
                      : false
                  ).length === 0 && busquedaProductoPeso && (
                    <div className="flex items-center justify-center py-8 text-gray-400">
                      <p>No se encontraron productos con ese nombre</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer con información */}
            <div className="p-4 border-t shrink-0 bg-gray-50">
              <p className="text-sm text-gray-600">
                Total de productos por peso: <span className="font-semibold">{productosPeso.length}</span>
                {busquedaProductoPeso && (
                  <span>
                    {" "}| Mostrando:{" "}
                    <span className="font-semibold">
                      {productosPeso.filter((p) =>
                        p && p.NombreProducto
                          ? String(p.NombreProducto).toLowerCase().includes(busquedaProductoPeso.toLowerCase())
                          : false
                      ).length}
                    </span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ingreso de Peso */}
      {mostrarModalPeso && productoPesoTemporal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Scale className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Ingresa el Peso</h2>
              </div>
              <button
                onClick={() => {
                  setMostrarModalPeso(false);
                  setProductoPesoTemporal(null);
                  setPesoBruto("");
                  setFocusTrigger(prev => prev + 1);
                }}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Producto:</p>
              <p className="text-lg font-semibold text-gray-900">{productoPesoTemporal.NombreProducto}</p>
              <p className="text-sm text-green-600 font-medium mt-2">
                Precio: ${Number(productoPesoTemporal.Precio).toLocaleString("es-CL")} / kg
              </p>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm text-gray-700 font-medium">
                Peso del Producto
              </label>
              <div className="relative">
                <input
                  ref={inputPesoRef}
                  type="text"
                  value={pesoBruto}
                  onChange={(e) => {
                    setPesoBruto(e.target.value);
                    if (mensaje) {
                      setMensaje("");
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAgregarConPeso();
                    }
                  }}
                  placeholder="Ej: 0.5, 1, 1.25 o 2"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-lg"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  kg
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Ingresa el peso en kilogramos (ej: 1 = 1kg, 0.5 = 0.5kg)
              </p>
            </div>

            {pesoBruto && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Subtotal:</p>
                <p className="text-3xl font-bold text-green-600">
                  ${(() => {
                    let valor = pesoBruto.replace(/\s/g, '').replace(',', '.');
                    
                    // Si comienza con 0 y no tiene punto o coma, insertar punto después del 0
                    if (valor.startsWith('0') && !pesoBruto.includes('.') && !pesoBruto.includes(',')) {
                      valor = '0.' + valor.substring(1);
                    }
                    
                    let peso = parseFloat(valor);
                    const subtotal = !isNaN(peso) && peso > 0 ? peso * Number(productoPesoTemporal.Precio) : 0;
                    return subtotal.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                  })()}
                </p>
              </div>
            )}

            {mensaje && (
              <div className={`${mensaje.includes("Error") || mensaje.includes("válido") ? "bg-red-50 border-red-200 text-red-800" : "bg-blue-50 border-blue-200 text-blue-800"} border rounded-lg p-3 mb-6`}>
                <p className="text-sm font-medium">{mensaje}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModalPeso(false);
                  setProductoPesoTemporal(null);
                  setPesoBruto("");
                  setFocusTrigger(prev => prev + 1);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgregarConPeso}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentaComponent;
