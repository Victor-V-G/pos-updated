import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  Banknote,
  HelpCircle,
  XCircle,
  X,
  Trash2,
  AlertTriangle
} from "lucide-react";
import {
  obtenerVentasPromise,
  eliminarVentaPromise,
} from "@/core/infrastructure/firebase";
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
  metodo: "tarjeta" | "efectivo";
  pago: number;
  vuelto: number;
  productos: ProductoVenta[];
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
  
  const resultado = horaNum * 60 + minutos + segundos / 60;
  console.log(`Hora: ${hora} => Minutos: ${resultado}`);
  return resultado;
};

export function HistorialDeVentasAvanzado({ onClose, setOpenManager, SetOpenManagerGestionComponentSetter }: HistorialVentasProps) {
  const [ventasFirebase, setVentasFirebase] = useState<FirebaseVenta[]>([]);
  const [ventaExpandida, setVentaExpandida] = useState<string | null>(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroMetodo, setFiltroMetodo] = useState<"todos" | "tarjeta" | "efectivo">("todos");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenHora, setOrdenHora] = useState<"asc" | "desc">("desc");
  const [ordenTotal, setOrdenTotal] = useState<"asc" | "desc" | "ninguno">("ninguno");
  const [showAyuda, setShowAyuda] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fechaActual = useMemo(() => formatearFechaHoy(), []);

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        setLoading(true);
        const response = await obtenerVentasPromise();
        console.log("Ventas obtenidas:", response);
        if (response && Array.isArray(response)) {
          setVentasFirebase(response);
        } else {
          console.warn("Respuesta inesperada:", response);
          setVentasFirebase([]);
        }
      } catch (err) {
        console.error("Error cargando ventas:", err);
        setError("No se pudieron cargar las ventas. Intenta nuevamente.");
        setVentasFirebase([]);
      } finally {
        setLoading(false);
      }
    };

    cargarVentas();
  }, []);

  const ventasNormalizadas = useMemo<VentaNormalizada[]>(() => {
    return (ventasFirebase || []).map((venta, idx) => {
      // Manejar fechaHora que puede venir como string o timestamp
      let fecha = "-";
      let hora = "-";
      
      if (venta.fechaHora) {
        if (typeof venta.fechaHora === "string") {
          // Ya es string (ej: "4/1/2026, 1:54:36 a.m.")
          const [fechaCruda = "", horaCruda = ""] = venta.fechaHora.split(",");
          fecha = fechaCruda.trim().replace(/\//g, "-");
          hora = horaCruda.trim();
        } else if (typeof venta.fechaHora === "object" && venta.fechaHora !== null && "toDate" in venta.fechaHora) {
          // Es un Timestamp de Firebase
          const date = (venta.fechaHora as any).toDate();
          const dateStr = date.toLocaleString("es-CL");
          const [fechaCruda = "", horaCruda = ""] = dateStr.split(",");
          fecha = fechaCruda.trim().replace(/\//g, "-");
          hora = horaCruda.trim();
        }
      }

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
        productos: productosNormalizados
      };
    });
  }, [ventasFirebase]);

  const ventasDelDia = useMemo(() => {
    return ventasNormalizadas.filter((venta) => venta.fecha === fechaSeleccionada);
  }, [ventasNormalizadas, fechaSeleccionada]);

  const ventasFiltradas = useMemo(() => {
    let base = ventasDelDia;
    if (filtroMetodo !== "todos") {
      base = base.filter((v) => v.metodo === filtroMetodo);
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
  const totalPaginas = Math.max(1, Math.ceil(ventasFiltradas.length / VENTAS_POR_PAGINA));

  // Obtener todas las fechas únicas disponibles
  const fechasDisponibles = useMemo(() => {
    const fechas = Array.from(new Set(ventasNormalizadas.map(v => v.fecha))).sort().reverse();
    return fechas;
  }, [ventasNormalizadas]);

  const filtrosActivos = useMemo(() => {
    const fechaBase = fechasDisponibles[0] || "";
    return (
      filtroMetodo !== "todos" ||
      ordenHora !== "desc" ||
      ordenTotal !== "ninguno" ||
      fechaSeleccionada !== fechaBase
    );
  }, [fechaSeleccionada, filtroMetodo, ordenHora, ordenTotal, fechasDisponibles]);

  const resetFiltros = () => {
    setFiltroMetodo("todos");
    setOrdenHora("desc");
    setOrdenTotal("ninguno");
    setPaginaActual(1);
    setVentaExpandida(null);
    setVentaSeleccionada(null);
    if (fechasDisponibles.length > 0) {
      setFechaSeleccionada(fechasDisponibles[0]);
    } else {
      setFechaSeleccionada("");
    }
  };

  // Inicializar con la primera fecha disponible cuando se cargan las ventas
  useEffect(() => {
    if (fechasDisponibles.length > 0 && !fechaSeleccionada) {
      setFechaSeleccionada(fechasDisponibles[0]);
    }
  }, [fechasDisponibles]);

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

  const handleDeleteVenta = async () => {
    if (!deletingId) return;

    try {
      setLoading(true);
      await eliminarVentaPromise(deletingId);
      const nuevasVentas = ventasFirebase.filter(v => v.id !== deletingId);
      setVentasFirebase(nuevasVentas);
      
      // Resetear selección si es la que se estaba borrando
      if (ventaSeleccionada === deletingId) {
        setVentaSeleccionada(null);
      }
      if (ventaExpandida === deletingId) {
        setVentaExpandida(null);
      }
      
      setShowConfirmDelete(false);
      setDeletingId(null);
    } catch (err) {
      console.error("Error eliminando venta:", err);
      setError("No se pudo eliminar la venta. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-0 px-4">
      <div className="w-full max-w-7xl h-[85vh] bg-white rounded-lg shadow-lg p-6 flex flex-col">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl text-gray-900">Historial de ventas Avanzado</h1>
            <div className="flex items-center gap-2">
              {ventaSeleccionada && (
                <button
                  onClick={() => {
                    setDeletingId(ventaSeleccionada);
                    setShowConfirmDelete(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                  title="Eliminar venta seleccionada"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="font-medium">Eliminar venta</span>
                </button>
              )}
              <button
                onClick={() => {
                  if (SetOpenManagerGestionComponentSetter) {
                    SetOpenManagerGestionComponentSetter(true);
                  }
                  if (setOpenManager) {
                    setOpenManager();
                  } else if (onClose) {
                    onClose();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
                title="Volver atrás"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Volver al menu</span>
              </button>
              <button
                onClick={() => setShowAyuda(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                title="Ayuda y atajos"
              >
                <HelpCircle className="w-8 h-8 text-gray-600" />
              </button>
            </div>
          </div>
          <p className="text-gray-600">Historial completo de ventas del minimarket</p>
        </div>

        {/* Filtros */}
        <div className="mb-4 flex flex-col gap-3 flex-shrink-0">
          {/* Primera fila: Fecha, Hora, Total */}
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Seleccionar fecha:</label>
              <select
                value={fechaSeleccionada}
                onChange={(e) => {
                  setFechaSeleccionada(e.target.value);
                  setPaginaActual(1);
                  setVentaExpandida(null);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {fechasDisponibles.map((fecha) => (
                  <option key={fecha} value={fecha}>
                    {fecha}
                  </option>
                ))}
              </select>
            </div>

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
          </div>

          {/* Segunda fila: Método de pago */}
          <div className="flex gap-2 flex-wrap items-center">
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
              Todos del día ({ventasDelDia.length})
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
              onClick={resetFiltros}
              disabled={!filtrosActivos}
              className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                filtrosActivos
                  ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                  : "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
              }`}
              title="Quitar todos los filtros"
            >
              <XCircle className="w-4 h-4" />
              Quitar filtros
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 flex-shrink-0">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-600 mb-1">
              Total de Ventas Realizadas
              {filtroMetodo === "tarjeta" && " con Tarjeta"}
              {filtroMetodo === "efectivo" && " con Efectivo"}
            </p>
            <p className="text-2xl text-purple-900">{ventasFiltradas.length}</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-indigo-600 mb-1">
              Total Vendido del Día
              {filtroMetodo === "tarjeta" && " con Tarjeta"}
              {filtroMetodo === "efectivo" && " con Efectivo"}
            </p>
            <p className="text-2xl text-indigo-900">${totalVentas.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
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
                            ) : (
                              <>
                                <Banknote className="w-4 h-4 text-green-600" />
                                <span className="text-green-700">Efectivo</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2 text-gray-900">
                          {venta.pago > 0 ? `$${venta.pago.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "-"}
                        </div>
                        <div className="col-span-2 text-gray-900">
                          {venta.vuelto > 0 ? `$${venta.vuelto.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "-"}
                        </div>
                        <div className="col-span-1 flex justify-center">
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
                        </div>
                      </div>
                    </div>

                    {/* Detalle de productos expandible */}
                    {ventaExpandida === venta.id && (
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

      {/* Modal de Confirmación de Eliminación */}
      {showConfirmDelete && deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">Confirmar eliminación</h2>
                <p className="text-sm text-gray-600 mt-1">Esta acción no se puede deshacer</p>
              </div>
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setDeletingId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ventasFirebase.find(v => v.id === deletingId) && (() => {
              const venta = ventasFirebase.find(v => v.id === deletingId);
              return (
                <>
                  <p className="text-gray-600 mb-3 text-sm">
                    ¿Deseas eliminar esta venta?
                  </p>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Fecha y Hora</p>
                        <p className="text-sm text-gray-900">{venta?.fechaHora || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Método de Pago</p>
                        <p className="text-sm text-gray-900">
                          {venta?.metodoPago === "DEBITO" ? "Tarjeta de Débito" : "Efectivo"}
                        </p>
                      </div>
                    </div>

                    <hr className="border-red-200" />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Total de Venta</p>
                        <p className="text-lg font-bold text-red-700">${venta?.TotalGeneral?.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Pago del Cliente</p>
                        <p className="text-sm text-gray-900">${(venta?.pagoCliente || 0).toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Vuelto Entregado</p>
                        <p className="text-sm text-gray-900">${(venta?.vueltoEntregado || 0).toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Productos</p>
                        <p className="text-sm text-gray-900">{venta?.ProductosVenta?.length || 0} artículo(s)</p>
                      </div>
                    </div>

                    {venta?.ProductosVenta && venta.ProductosVenta.length > 0 && (
                      <>
                        <hr className="border-red-200" />
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Detalle de Productos</p>
                          <div className="space-y-1">
                            {venta.ProductosVenta.map((prod, idx) => (
                              <div key={idx} className="text-xs text-gray-800 flex justify-between items-center bg-white bg-opacity-50 p-2 rounded">
                                <span className="font-medium truncate flex-1">{prod.NombreProducto || `Producto ${idx + 1}`}</span>
                                <span className="text-gray-600 ml-2">
                                  {prod.cantidad} {prod.TipoProducto === "peso" ? "kg" : "un"} × ${(prod.PrecioUnitario || prod.Precio || 0).toLocaleString("es-CL")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              );
            })()}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setDeletingId(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteVenta}
                disabled={loading}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-lg transition font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <p className="font-medium text-gray-900">Seleccionar Fecha</p>
                    <p className="text-gray-600 text-sm">Elige una fecha para ver todas las ventas de ese día. El sistema mostrará solo las ventas registradas en esa fecha.</p>
                  </div>
                  <hr className="border-gray-200" />
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
                    <p className="text-gray-600 text-sm"><span className="font-semibold">Todos del día:</span> Ver todas las ventas. <span className="font-semibold">Tarjeta:</span> Solo ventas con tarjeta. <span className="font-semibold">Efectivo:</span> Solo ventas en efectivo.</p>
                  </div>
                </div>
              </section>

              {/* Eliminar una venta */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Eliminar una venta</h3>
                <div className="space-y-2 bg-red-50 p-4 rounded-lg text-sm">
                  <p className="text-red-800">1. Haz clic en una venta para seleccionarla: la fila se resalta en amarillo.</p>
                  <p className="text-red-800">2. Opcional: presiona Enter para expandir y revisar el detalle antes de eliminar.</p>
                  <p className="text-red-800">3. Pulsa el botón "Eliminar venta" en el encabezado; solo aparece cuando hay una venta seleccionada.</p>
                  <p className="text-red-800">4. Confirma en la ventana: la eliminación es permanente y no se puede deshacer.</p>
                </div>
              </section>

              {/* Información General */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Información General</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg text-gray-600 text-sm">
                  <p>• <span className="font-medium">Fila Amarilla:</span> Indica la venta actualmente seleccionada.</p>
                  <p>• <span className="font-medium">Fila Azul:</span> Indica la venta expandida con sus detalles de productos.</p>
                  <p>• <span className="font-medium">4 ventas por página:</span> El historial se divide en páginas para mejor visualización.</p>
                  <p>• <span className="font-medium">Estadísticas dinámicas:</span> Los números en las tarjetas de arriba se actualizan según los filtros aplicados.</p>
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

export default HistorialDeVentasAvanzado;