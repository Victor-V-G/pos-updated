import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  Banknote
} from "lucide-react";
import { obtenerVentasPromise } from "@/core/infrastructure/firebase";
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
  onClose: () => void;
}

const VENTAS_POR_PAGINA = 5;

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

export function HistorialVentas({ onClose }: HistorialVentasProps) {
  const [ventasFirebase, setVentasFirebase] = useState<FirebaseVenta[]>([]);
  const [ventaExpandida, setVentaExpandida] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroMetodo, setFiltroMetodo] = useState<"todos" | "tarjeta" | "efectivo">("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fechaActual = useMemo(() => formatearFechaHoy(), []);

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        setLoading(true);
        const response = await obtenerVentasPromise();
        setVentasFirebase(response || []);
      } catch (err) {
        console.error("Error cargando ventas:", err);
        setError("No se pudieron cargar las ventas. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    cargarVentas();
  }, []);

  const ventasNormalizadas = useMemo<VentaNormalizada[]>(() => {
    return (ventasFirebase || []).map((venta, idx) => {
      const { fecha, hora } = separarFechaHora(venta.fechaHora);
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
        fecha: fecha || "-",
        hora: hora || "-",
        total: Number(venta.TotalGeneral || 0),
        metodo: venta.metodoPago === "DEBITO" ? "tarjeta" : "efectivo",
        pago: Number(venta.pagoCliente ?? venta.TotalGeneral ?? 0),
        vuelto: Number(venta.vueltoEntregado ?? 0),
        productos: productosNormalizados
      };
    });
  }, [ventasFirebase]);

  const ventasDelDia = useMemo(() => {
    return ventasNormalizadas.filter((venta) => venta.fecha === fechaActual);
  }, [ventasNormalizadas, fechaActual]);

  const ventasFiltradas = useMemo(() => {
    const base = ventasDelDia;
    if (filtroMetodo === "todos") return base;
    return base.filter((v) => v.metodo === filtroMetodo);
  }, [ventasDelDia, filtroMetodo]);

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
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-4xl text-gray-900 mb-2">Historial de Ventas</h1>
            <p className="text-gray-600">Ventas del día {fechaActual}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-4 flex gap-2 flex-shrink-0">
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
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 flex-shrink-0">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-600 mb-1">Total de Ventas Realizadas</p>
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
            <div className="flex-1 overflow-y-auto min-h-[260px]">
              {ventasPaginadas.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No hay ventas para mostrar</p>
                </div>
              ) : (
                ventasPaginadas.map((venta) => (
                  <div key={venta.id} className="border-b border-gray-200 last:border-b-0">
                    {/* Fila principal */}
                    <div
                      className={`px-4 py-2 transition ${
                        ventaExpandida === venta.id
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : "hover:bg-gray-50"
                      }`}
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
    </div>
  );
}

export default HistorialVentas;
