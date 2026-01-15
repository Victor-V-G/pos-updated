import { useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  Banknote,
  HelpCircle,
  X,
  Wifi,
  WifiOff
} from "lucide-react";
import {
  obtenerVentasPromise,
  obtenerTransaccionesCajaPromise,
} from "@/core/infrastructure/firebase";
import { useOfflineSync, useOnlineStatus } from "@/core/infrastructure/offline";
import "@/assets/styles/historial-de-venta-style.css";

interface FirebaseProductoVenta {
  NombreProducto?: string;
  CodigoDeBarras?: string;
  TipoProducto?: "unidad" | "peso";
  cantidad?: number;
  PrecioUnitario?: number;
  Precio?: number;
  subtotal?: number;
}

interface FirebaseVenta {
  id?: string;
  fechaHora?: string;
  TotalGeneral?: number;
  metodoPago?: "DEBITO" | "EFECTIVO";
  pagoCliente?: number | null;
  vueltoEntregado?: number | null;
  ProductosVenta?: FirebaseProductoVenta[];
}

interface FirebaseTransaccionCaja {
  id?: string;
  tipo?: "GIRO" | "DEPOSITO";
  monto?: number;
  descripcion?: string;
  fechaHora?: any;
  fechaHoraCL?: string;
}

interface ProductoVenta {
  nombre: string;
  codigoBarras: string;
  tipo: "unidad" | "peso";
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface VentaNormalizada {
  id: string;
  fecha: string;
  hora: string;
  total: number;
  metodo: "tarjeta" | "efectivo" | "transaccion";
  pago: number;
  vuelto: number;
  productos: ProductoVenta[];
  transaccionTipo?: "giro" | "deposito";
  descripcion?: string;
  eliminada?: boolean;
  fechaEliminacionStr?: string;
  originalId?: string;
}

interface HistorialVentasProps {
  onClose?: () => void;
  setOpenManager?: () => void;
  SetOpenManagerGestionComponentSetter?: (value: boolean) => void;
}

const VENTAS_POR_PAGINA = 4;

const formatearFechaHoy = () => {
  const formatter = new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Santiago"
  });
  const parts = formatter.formatToParts(new Date());
  const dia = parts.find(p => p.type === "day")?.value || "01";
  const mes = parts.find(p => p.type === "month")?.value || "01";
  const anio = parts.find(p => p.type === "year")?.value || "2024";
  return `${dia}-${mes}-${anio}`;
};

const separarFechaHora = (fechaHora?: string) => {
  if (!fechaHora) return { fecha: "", hora: "" };
  const [fechaCruda = "", horaCruda = ""] = fechaHora.split(",");
  return {
    fecha: fechaCruda.trim().replace(/\//g, "-"),
    hora: horaCruda.trim()
  };
};

const normalizarFechaHoraCL = (fechaHora?: any) => {
  if (!fechaHora) return { fecha: "", hora: "" };

  if (typeof fechaHora === "string") {
    return separarFechaHora(fechaHora);
  }

  if (typeof fechaHora === "object" && fechaHora !== null && "toDate" in fechaHora) {
    const dateStr = (fechaHora as any).toDate().toLocaleString("es-CL", {
      timeZone: "America/Santiago",
    });
    return separarFechaHora(dateStr);
  }

  return { fecha: "", hora: "" };
};

const convertirHoraAMinutos = (hora: string): number => {
  // Ej: "11:04:23 a. m." o "2:15:28 p. m."
  const match = hora.match(/(\d{1,2}):(\d{2}):(\d{2})\s+(a|p)\.\s*m\./i);
  if (!match) {
    console.warn("No se pudo parsear la hora:", hora);
    return 0;
  }
  
  const [, horaStr, minStr, segStr, periodo] = match;
  let horaNum = parseInt(horaStr);
  const minutos = parseInt(minStr);
  const segundos = parseInt(segStr);
  
  // Convertir a formato 24h
  if (periodo.toLowerCase() === "p" && horaNum !== 12) {
    horaNum += 12;
  } else if (periodo.toLowerCase() === "a" && horaNum === 12) {
    horaNum = 0;
  }
  
  return horaNum * 60 + minutos + segundos / 60;
};

export function HistorialVentas({ onClose, setOpenManager, SetOpenManagerGestionComponentSetter }: HistorialVentasProps) {
  const [ventasFirebase, setVentasFirebase] = useState<FirebaseVenta[]>([]);
  const [transaccionesCaja, setTransaccionesCaja] = useState<FirebaseTransaccionCaja[]>([]);
  const [ventaExpandida, setVentaExpandida] = useState<string | null>(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroMetodo, setFiltroMetodo] = useState<"todos" | "tarjeta" | "efectivo" | "giro" | "deposito">("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenHora, setOrdenHora] = useState<"asc" | "desc">("desc");
  const [ordenTotal, setOrdenTotal] = useState<"asc" | "desc" | "ninguno">("ninguno");
  const [showAyuda, setShowAyuda] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Offline functionality
  const { getSales } = useOfflineSync();
  const isOnline = useOnlineStatus();

  const fechaActual = useMemo(() => formatearFechaHoy(), []);

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        setLoading(true);
        const [ventasResponse, transaccionesResponse] = await Promise.all([
          getSales(obtenerVentasPromise),
          obtenerTransaccionesCajaPromise(),
        ]);

        console.log("Ventas obtenidas:", ventasResponse);
        if (ventasResponse && Array.isArray(ventasResponse)) {
          setVentasFirebase(ventasResponse as any);
        } else {
          console.warn("Respuesta inesperada ventas:", ventasResponse);
          setVentasFirebase([]);
        }

        if (transaccionesResponse && Array.isArray(transaccionesResponse)) {
          setTransaccionesCaja(transaccionesResponse as any);
        } else {
          console.warn("Respuesta inesperada transacciones:", transaccionesResponse);
          setTransaccionesCaja([]);
        }
      } catch (err) {
        console.error("Error cargando ventas:", err);
        setError("No se pudieron cargar las ventas. Intenta nuevamente.");
        setVentasFirebase([]);
        setTransaccionesCaja([]);
      } finally {
        setLoading(false);
      }
    };

    cargarVentas();
  }, [getSales]);

  const ventasNormalizadas = useMemo<VentaNormalizada[]>(() => {
    return (ventasFirebase || []).map((venta, idx) => {
      const { fecha, hora } = normalizarFechaHoraCL(venta.fechaHora);

      // Campos adicionales para ventas eliminadas
      const eliminada = (venta as any).eliminada === true;
      const originalId = (venta as any).originalId || (venta.id || String(idx + 1));
      const fechaEliminacionStr = typeof (venta as any).fechaEliminacion === "string" ? (venta as any).fechaEliminacion : undefined;

      const productosNormalizados: ProductoVenta[] = (venta.ProductosVenta || []).map((p, prodIdx) => ({
        nombre: p.NombreProducto || `Producto ${prodIdx + 1}`,
        codigoBarras: p.CodigoDeBarras || "-",
        tipo: p.TipoProducto === "peso" ? "peso" : "unidad",
        cantidad: Number(p.cantidad || 0),
        precioUnitario: Number(p.PrecioUnitario ?? p.Precio ?? 0),
        subtotal: Number(p.subtotal || 0)
      }));

      return {
        id: venta.id || String(idx + 1),
        fecha: fecha,
        hora: hora,
        total: Number(venta.TotalGeneral || 0),
        metodo: venta.metodoPago === "DEBITO" ? "tarjeta" : "efectivo",
        pago: Number(venta.pagoCliente ?? venta.TotalGeneral ?? 0),
        vuelto: Number(venta.vueltoEntregado ?? 0),
        productos: productosNormalizados,
        eliminada,
        originalId,
        fechaEliminacionStr,
      };
    });
  }, [ventasFirebase]);

  const transaccionesNormalizadas = useMemo<VentaNormalizada[]>(() => {
    return (transaccionesCaja || []).map((transaccion, idx) => {
      const fechaHoraRaw = transaccion.fechaHoraCL || transaccion.fechaHora;
      const { fecha, hora } = normalizarFechaHoraCL(fechaHoraRaw);

      return {
        id: transaccion.id || `transaccion-${idx + 1}`,
        fecha: fecha || "-",
        hora: hora || "-",
        total: Number(transaccion.monto || 0),
        metodo: "transaccion",
        pago: 0,
        vuelto: 0,
        productos: [],
        transaccionTipo: transaccion.tipo === "GIRO" ? "giro" : "deposito",
        descripcion: transaccion.descripcion || "",
      };
    });
  }, [transaccionesCaja]);

  const ventasDelDia = useMemo(() => {
    return [...ventasNormalizadas, ...transaccionesNormalizadas].filter(
      (venta) => venta.fecha === fechaActual
    );
  }, [ventasNormalizadas, transaccionesNormalizadas, fechaActual]);

  const ventasFiltradas = useMemo(() => {
    let base = ventasDelDia;
    if (filtroMetodo !== "todos") {
      base = base.filter((v) => {
        if (filtroMetodo === "giro" || filtroMetodo === "deposito") {
          return v.metodo === "transaccion" && v.transaccionTipo === filtroMetodo;
        }

        return v.metodo === filtroMetodo;
      });
    }
    
    // Aplicar ordenamiento
    return [...base].sort((a, b) => {
      // Si hay orden por total, aplicar primero
      if (ordenTotal !== "ninguno") {
        return ordenTotal === "desc" ? b.total - a.total : a.total - b.total;
      }
      
      // Si no, ordenar por hora
      const minA = convertirHoraAMinutos(a.hora);
      const minB = convertirHoraAMinutos(b.hora);
      return ordenHora === "asc" ? minA - minB : minB - minA;
    });
  }, [ventasDelDia, filtroMetodo, ordenHora, ordenTotal]);

  useEffect(() => {
    const totalPaginasCalc = Math.max(1, Math.ceil(ventasFiltradas.length / VENTAS_POR_PAGINA));
    if (paginaActual > totalPaginasCalc) {
      setPaginaActual(totalPaginasCalc);
      setVentaExpandida(null);
    }
  }, [ventasFiltradas, paginaActual]);

  const indiceInicio = (paginaActual - 1) * VENTAS_POR_PAGINA;
  const indiceFin = indiceInicio + VENTAS_POR_PAGINA;
  const ventasPaginadas = ventasFiltradas.slice(indiceInicio, indiceFin);

  const totalVentas = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0);
  const ventasTarjeta = ventasFiltradas.filter((v) => v.metodo === "tarjeta").length;
  const ventasEfectivo = ventasFiltradas.filter((v) => v.metodo === "efectivo").length;
  const transaccionesGiro = ventasDelDia.filter((v) => v.metodo === "transaccion" && v.transaccionTipo === "giro").length;
  const transaccionesDeposito = ventasDelDia.filter((v) => v.metodo === "transaccion" && v.transaccionTipo === "deposito").length;
  const totalPaginas = Math.max(1, Math.ceil(ventasFiltradas.length / VENTAS_POR_PAGINA));

  // Limpieza de historial a medianoche
  useEffect(() => {
    const verificarMedianoche = () => {
      const ahora = new Date();
      const proximaMedianoche = new Date(ahora);
      proximaMedianoche.setDate(proximaMedianoche.getDate() + 1);
      proximaMedianoche.setHours(0, 0, 0, 0);
      
      const tiempoHastaMedianoche = proximaMedianoche.getTime() - ahora.getTime();
      
      const timeout = setTimeout(() => {
        // Limpiar ventas del día anterior
        setVentasFirebase([]);
        setVentaSeleccionada(null);
        setVentaExpandida(null);
        setPaginaActual(1);
        
        // Recargar ventas del nuevo día
        const cargarVentas = async () => {
          try {
            setLoading(true);
            const [ventasResponse, transaccionesResponse] = await Promise.all([
              getSales(obtenerVentasPromise),
              obtenerTransaccionesCajaPromise(),
            ]);

            if (ventasResponse && Array.isArray(ventasResponse)) {
              setVentasFirebase(ventasResponse as any);
            }

            if (transaccionesResponse && Array.isArray(transaccionesResponse)) {
              setTransaccionesCaja(transaccionesResponse as any);
            }
          } catch (err) {
            console.error("Error cargando ventas:", err);
            setTransaccionesCaja([]);
          } finally {
            setLoading(false);
          }
        };
        cargarVentas();
      }, tiempoHastaMedianoche);
      
      return () => clearTimeout(timeout);
    };
    
    return verificarMedianoche();
  }, []);

  // Seleccionar automáticamente la primera venta cuando cambian las ventas paginadas
  useEffect(() => {
    if (ventasPaginadas.length > 0 && !ventaSeleccionada) {
      setVentaSeleccionada(ventasPaginadas[0].id);
    } else if (ventasPaginadas.length === 0) {
      setVentaSeleccionada(null);
    }
  }, [ventasPaginadas]);

  // Manejar navegación con teclas de flecha (solo en la tabla)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Solo navegar si no hay un elemento de entrada enfocado
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === "SELECT" || 
                             activeElement?.tagName === "INPUT" || 
                             activeElement?.tagName === "TEXTAREA";
      
      if (isInputFocused) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (paginaActual < totalPaginas) {
          irAPagina(paginaActual + 1);
          setVentaSeleccionada(ventasPaginadas[0]?.id || null);
        }
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (paginaActual > 1) {
          irAPagina(paginaActual - 1);
          setVentaSeleccionada(ventasPaginadas[0]?.id || null);
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        
        // Si hay una venta expandida, hacer scroll en su contenedor
        if (ventaExpandida === ventaSeleccionada && scrollContainerRef.current) {
          scrollContainerRef.current.scrollBy({ top: 60, behavior: "smooth" });
          return;
        }
        
        if (ventasPaginadas.length === 0) return;
        
        // Si no hay seleccionada, seleccionar la primera
        if (!ventaSeleccionada) {
          setVentaSeleccionada(ventasPaginadas[0].id);
          return;
        }
        
        // Encontrar índice de la venta seleccionada
        const indiceActual = ventasPaginadas.findIndex(v => v.id === ventaSeleccionada);
        
        if (indiceActual < ventasPaginadas.length - 1) {
          // No es la última, ir a la siguiente en la misma página
          setVentaSeleccionada(ventasPaginadas[indiceActual + 1].id);
        }
        // Si es la última, no hacer nada (no cambiar de página)
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        
        // Si hay una venta expandida, hacer scroll en su contenedor
        if (ventaExpandida === ventaSeleccionada && scrollContainerRef.current) {
          scrollContainerRef.current.scrollBy({ top: -60, behavior: "smooth" });
          return;
        }
        
        if (ventasPaginadas.length === 0) return;
        
        // Si no hay seleccionada, seleccionar la última
        if (!ventaSeleccionada) {
          setVentaSeleccionada(ventasPaginadas[ventasPaginadas.length - 1].id);
          return;
        }
        
        // Encontrar índice de la venta seleccionada
        const indiceActual = ventasPaginadas.findIndex(v => v.id === ventaSeleccionada);
        
        if (indiceActual > 0) {
          // No es la primera, ir a la anterior en la misma página
          setVentaSeleccionada(ventasPaginadas[indiceActual - 1].id);
        }
        // Si es la primera, no hacer nada (no cambiar de página)
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (ventaSeleccionada) {
          toggleVenta(ventaSeleccionada);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [paginaActual, totalPaginas, ventaSeleccionada, ventasPaginadas, ventaExpandida]);

  const toggleVenta = (id: string) => {
    setVentaExpandida(ventaExpandida === id ? null : id);
  };

  const irAPagina = (pagina: number) => {
    setPaginaActual(pagina);
    setVentaExpandida(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-0 px-4">
      <div className="w-full max-w-7xl h-[85vh] bg-white rounded-lg shadow-lg p-6 flex flex-col">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl text-gray-900">Historial de ventas</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAyuda(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                title="Ayuda y atajos"
              >
                <HelpCircle className="w-8 h-8 text-gray-600" />
              </button>
            </div>
          </div>
          <p className="text-gray-600">Ventas del día {fechaActual}</p>
        </div>

        {/* Filtros */}
        <div className="mb-2 flex gap-2 flex-wrap items-center flex-shrink-0">
          <button
            onClick={() => {
              setFiltroMetodo("todos");
              setPaginaActual(1);
              setVentaExpandida(null);
            }}
            className={`px-4 py-2 rounded-lg transition ${
              filtroMetodo === "todos"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos ({ventasDelDia.length})
          </button>
          <button
            onClick={() => {
              setFiltroMetodo("tarjeta");
              setPaginaActual(1);
              setVentaExpandida(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              filtroMetodo === "tarjeta"
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Tarjeta ({ventasDelDia.filter((v) => v.metodo === "tarjeta").length})
          </button>
          <button
            onClick={() => {
              setFiltroMetodo("efectivo");
              setPaginaActual(1);
              setVentaExpandida(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              filtroMetodo === "efectivo"
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            <Banknote className="w-4 h-4" />
            Efectivo ({ventasDelDia.filter((v) => v.metodo === "efectivo").length})
          </button>
          <button
            onClick={() => {
              setFiltroMetodo("giro");
              setPaginaActual(1);
              setVentaExpandida(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              filtroMetodo === "giro"
                ? "bg-purple-600 text-white"
                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
            }`}
          >
            <Banknote className="w-4 h-4" />
            Giros ({transaccionesGiro})
          </button>
          <button
            onClick={() => {
              setFiltroMetodo("deposito");
              setPaginaActual(1);
              setVentaExpandida(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              filtroMetodo === "deposito"
                ? "bg-orange-600 text-white"
                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
            }`}
          >
            <Banknote className="w-4 h-4" />
            Depósitos ({transaccionesDeposito})
          </button>
        </div>

        {/* Ordenamiento y Limpiar */}
        <div className="mb-4 flex gap-2 items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Ordenar por hora:</label>
            <select
              value={ordenHora}
              onChange={(e) => {
                setOrdenHora(e.target.value as "asc" | "desc");
                setOrdenTotal("ninguno");
                setPaginaActual(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="desc">Descendente (Más reciente)</option>
              <option value="asc">Ascendente (Más antiguo)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Ordenar por total:</label>
            <select
              value={ordenTotal}
              onChange={(e) => {
                setOrdenTotal(e.target.value as "asc" | "desc" | "ninguno");
                setPaginaActual(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ninguno">Sin ordenar</option>
              <option value="desc">Mayor a menor</option>
              <option value="asc">Menor a mayor</option>
            </select>
          </div>

          <button
            onClick={() => {
              setFiltroMetodo("todos");
              setOrdenHora("desc");
              setOrdenTotal("ninguno");
              setPaginaActual(1);
              setVentaExpandida(null);
            }}
            className="ml-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
            title="Restaurar valores por defecto"
          >
            Limpiar filtros
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 flex-shrink-0">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-600 mb-1">
              Total de Ventas Realizadas
              {filtroMetodo === "tarjeta" && " con Tarjeta"}
              {filtroMetodo === "efectivo" && " con Efectivo"}
            </p>
            <p className="text-2xl text-purple-900">{ventasFiltradas.length}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-1">Ventas con Tarjeta</p>
            <p className="text-2xl text-blue-900">
              {filtroMetodo === "efectivo" ? "No aplica" : `${ventasTarjeta} transacciones`}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 mb-1">Ventas en Efectivo</p>
            <p className="text-2xl text-green-900">
              {filtroMetodo === "tarjeta" ? "No aplica" : `${ventasEfectivo} transacciones`}
            </p>
          </div>
        </div>

        {/* Carga y error */}
        {loading && (
          <div className="flex-1 flex items-center justify-center text-gray-500">Cargando ventas...</div>
        )}
        {!loading && error && (
          <div className="flex-1 flex items-center justify-center text-red-600">{error}</div>
        )}

        {/* Tabla de Ventas con scroll */}
        {!loading && !error && (
          <div className="flex-1 overflow-hidden flex flex-col border border-gray-200 rounded-lg">
            {/* Encabezado de tabla fijo */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex-shrink-0">
              <div className="grid grid-cols-12 gap-4 text-sm text-gray-700">
                <div className="col-span-2">FECHA</div>
                <div className="col-span-1">HORA</div>
                <div className="col-span-2">TOTAL</div>
                <div className="col-span-2">MÉTODO</div>
                <div className="col-span-2">PAGO</div>
                <div className="col-span-2">VUELTO</div>
                <div className="col-span-1 text-center">VER</div>
              </div>
            </div>

            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto min-h-[260px]" ref={scrollContainerRef}>
              {ventasPaginadas.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No hay ventas para mostrar</p>
                </div>
              ) : (
                ventasPaginadas.map((venta) => (
                  <div key={venta.id} className="border-b border-gray-200 last:border-b-0">
                    {/* Fila principal */}
                    <div
                      className={`px-4 py-2 transition cursor-pointer ${
                        ventaSeleccionada === venta.id
                          ? "bg-yellow-100 border-l-4 border-l-yellow-500"
                          : ventaExpandida === venta.id
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setVentaSeleccionada(venta.id)}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2 text-gray-900">{venta.fecha}</div>
                        <div className="col-span-1 text-gray-900">{venta.hora}</div>
                        <div className="col-span-2 text-gray-900">${venta.total.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            {venta.metodo === "tarjeta" ? (
                              <>
                                <CreditCard className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-700">Tarjeta</span>
                              </>
                            ) : venta.metodo === "efectivo" ? (
                              <>
                                <Banknote className="w-4 h-4 text-green-600" />
                                <span className="text-green-700">Efectivo</span>
                              </>
                            ) : (
                              <>
                                <Banknote className="w-4 h-4 text-purple-600" />
                                <span className="text-purple-700">
                                  {venta.transaccionTipo === "giro" ? "Giro" : "Depósito"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2 text-gray-900">
                          {venta.metodo === "transaccion"
                            ? "-"
                            : venta.pago > 0
                            ? `$${venta.pago.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                            : "-"}
                        </div>
                        <div className="col-span-2 text-gray-900">
                          {venta.metodo === "transaccion"
                            ? "-"
                            : venta.vuelto > 0
                            ? `$${venta.vuelto.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                            : "-"}
                        </div>
                        <div className="col-span-1 flex justify-center">
                          {venta.metodo === "transaccion" ? (
                            <span className="text-gray-400 text-xs">—</span>
                          ) : (
                            <button
                              onClick={() => toggleVenta(venta.id)}
                              className={`p-1 rounded transition ${
                                ventaExpandida === venta.id
                                  ? "bg-blue-200 hover:bg-blue-300"
                                  : "hover:bg-gray-200"
                              }`}
                            >
                              {ventaExpandida === venta.id ? (
                                <ChevronUp className="w-5 h-5 text-blue-700" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detalle de productos expandible */}
                    {venta.metodo !== "transaccion" && ventaExpandida === venta.id && (
                      <div className="bg-blue-50 px-4 py-4 border-t border-blue-200 border-l-4 border-l-blue-500">
                        <h4 className="text-sm text-blue-900 mb-3">Productos ({venta.productos.length})</h4>
                        <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
                          {/* Encabezado de tabla de productos */}
                          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                            <div className="grid grid-cols-12 gap-4 text-xs text-gray-600">
                              <div className="col-span-3">PRODUCTO</div>
                              <div className="col-span-2">CÓDIGO DE BARRAS</div>
                              <div className="col-span-2">TIPO</div>
                              <div className="col-span-2">CANT / KG</div>
                              <div className="col-span-2">PRECIO UNIT.</div>
                              <div className="col-span-1">SUBTOTAL</div>
                            </div>
                          </div>
                          {/* Filas de productos */}
                          {venta.productos.map((producto, index) => (
                            <div
                              key={`${venta.id}-${index}`}
                              className="px-4 py-3 border-b border-gray-200 last:border-b-0"
                            >
                              <div className="grid grid-cols-12 gap-4 text-sm items-center">
                                <div className="col-span-3 text-gray-900">{producto.nombre}</div>
                                <div className="col-span-2 text-gray-600 text-xs font-mono">
                                  {producto.codigoBarras}
                                </div>
                                <div className="col-span-2">
                                  <span
                                    className={`inline-block px-2 py-1 rounded text-xs ${
                                      producto.tipo === "peso"
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {producto.tipo === "peso" ? "Por Peso (kg)" : "Por Unidad"}
                                  </span>
                                </div>
                                <div className="col-span-2 text-gray-900">
                                  {producto.cantidad} {producto.tipo === "peso" ? "kg" : "un."}
                                </div>
                                <div className="col-span-2 text-gray-900">
                                  ${producto.precioUnitario.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                                <div className="col-span-1 text-gray-900">
                                  ${producto.subtotal.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Paginación */}
        {!loading && !error && ventasFiltradas.length > 0 && (
          <div className="mt-4 flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-gray-600">
              Mostrando {ventasFiltradas.length === 0 ? 0 : indiceInicio + 1} - {Math.min(indiceFin, ventasFiltradas.length)} de {ventasFiltradas.length} ventas
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => irAPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                  <button
                    key={pagina}
                    onClick={() => irAPagina(pagina)}
                    className={`w-10 h-10 rounded-lg transition ${
                      paginaActual === pagina
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pagina}
                  </button>
                ))}
              </div>

              <button
                onClick={() => irAPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Ayuda */}
      {showAyuda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-gray-50 border-b border-gray-300 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Ayuda - Atajos y Funciones</h2>
              <button
                onClick={() => setShowAyuda(false)}
                className="p-1 hover:bg-gray-200 rounded transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Atajos de Teclado */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Atajos de Teclado</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="inline-block bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium">↑</span>
                      <span className="font-medium text-gray-700">Arriba</span>
                    </div>
                    <span className="text-gray-600 text-sm text-right max-w-xs">Navega a la venta anterior en la página actual. Si está expandida, hace scroll en los productos.</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="inline-block bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium">↓</span>
                      <span className="font-medium text-gray-700">Abajo</span>
                    </div>
                    <span className="text-gray-600 text-sm text-right max-w-xs">Navega a la venta siguiente en la página actual. Si está expandida, hace scroll en los productos.</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="inline-block bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium">←</span>
                      <span className="font-medium text-gray-700">Izquierda</span>
                    </div>
                    <span className="text-gray-600 text-sm text-right max-w-xs">Va a la página anterior del historial.</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="inline-block bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium">→</span>
                      <span className="font-medium text-gray-700">Derecha</span>
                    </div>
                    <span className="text-gray-600 text-sm text-right max-w-xs">Va a la página siguiente del historial.</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="inline-block bg-gray-800 text-white px-4 py-1 rounded text-sm font-medium">↲</span>
                      <span className="font-medium text-gray-700">Enter</span>
                    </div>
                    <span className="text-gray-600 text-sm text-right max-w-xs">Expande o contrae los detalles de la venta seleccionada.</span>
                  </div>
                </div>
              </section>

              {/* Filtros */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Filtros</h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Ordenar por Hora</p>
                    <p className="text-gray-600 text-sm"><span className="font-semibold">Descendente:</span> Muestra primero las ventas más recientes. <span className="font-semibold">Ascendente:</span> Muestra primero las ventas más antiguas.</p>
                  </div>
                  <hr className="border-gray-200" />
                  <div>
                    <p className="font-medium text-gray-900">Ordenar por Total</p>
                    <p className="text-gray-600 text-sm"><span className="font-semibold">Mayor a menor:</span> Ordena de la venta más grande a la más pequeña. <span className="font-semibold">Menor a mayor:</span> Ordena de la más pequeña a la más grande.</p>
                  </div>
                  <hr className="border-gray-200" />
                  <div>
                    <p className="font-medium text-gray-900">Método de Pago</p>
                    <p className="text-gray-600 text-sm"><span className="font-semibold">Todos:</span> Ver todas las ventas. <span className="font-semibold">Tarjeta:</span> Solo ventas con tarjeta. <span className="font-semibold">Efectivo:</span> Solo ventas en efectivo.</p>
                  </div>
                </div>
              </section>

              {/* Información General */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Información General</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg text-gray-600 text-sm">
                  <p>• <span className="font-medium">Fila Amarilla:</span> Indica la venta actualmente seleccionada.</p>
                  <p>• <span className="font-medium">Fila Azul:</span> Indica la venta expandida con sus detalles de productos.</p>
                  <p>• <span className="font-medium">4 ventas por página:</span> El historial se divide en páginas para mejor visualización.</p>
                  <p>• <span className="font-medium">Limpieza automática:</span> El historial se limpia automáticamente a medianoche.</p>
                </div>
              </section>

              {/* Consejo */}
              <section className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-blue-900 text-sm">
                  <span className="font-bold">Consejo:</span> Usa las flechas del teclado para navegar rápidamente. Presiona Enter para ver los detalles de los productos de una venta.
                </p>
              </section>
            </div>

            {/* Footer del Modal */}
            <div className="sticky bottom-0 bg-gray-50 p-4 border-t border-gray-300 flex justify-end">
              <button
                onClick={() => setShowAyuda(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistorialVentas;
