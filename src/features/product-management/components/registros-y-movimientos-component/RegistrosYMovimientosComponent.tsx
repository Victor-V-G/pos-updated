import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Package, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronDown, X, TrendingUp } from 'lucide-react';
import { obtenerMovimientosPromise, obtenerProductoPorCodigoPromise, obtenerProductoPorNombrePromise, obtenerVentasEliminadasPromise } from '@/core/infrastructure/firebase';
import { RegistrosYMovimientosInterface } from '@/shared/types';

interface RegistroMovimientosProps {
  onClose: () => void;
}

const ITEMS_POR_PAGINA = 5;
const PAGINAS_VISIBLES = 10;

export function RegistrosYMovimientosComponent({ onClose }: RegistroMovimientosProps) {
  const [movimientos, setMovimientos] = useState<RegistrosYMovimientosInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'registrar' | 'editar' | 'eliminar' | 'reestock' | 'ventaEliminada'>('todos');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [mostrarSelectorFechas, setMostrarSelectorFechas] = useState(false);
  const [movimientoDetalle, setMovimientoDetalle] = useState<RegistrosYMovimientosInterface | null>(null);
  const [indiceDetalle, setIndiceDetalle] = useState<number | null>(null);
  const [productoDetalle, setProductoDetalle] = useState<any>(null);
  const [loadingProducto, setLoadingProducto] = useState(false);

  // Cargar datos del producto cuando se abre el modal
  useEffect(() => {
    if (movimientoDetalle) {
      const cargarProducto = async () => {
        setLoadingProducto(true);
        try {
          const detalle = parseDetalleMovimiento(movimientoDetalle);
          if (detalle.codigo) {
            const producto = await obtenerProductoPorCodigoPromise(detalle.codigo);
            setProductoDetalle(producto);
          } else if (detalle.nombre) {
            const nombreBase = detalle.nombre.trim();
            const nombreSinParentesis = nombreBase.replace(/\s*\(\s*[^)]+\s*\)\s*$/, '');

            // Intenta primero sin paréntesis, luego con nombre original
            let producto = await obtenerProductoPorNombrePromise(nombreSinParentesis);
            if (!producto) {
              producto = await obtenerProductoPorNombrePromise(nombreBase);
            }
            setProductoDetalle(producto);
          }
        } catch (error) {
          console.error("Error al cargar producto:", error);
        } finally {
          setLoadingProducto(false);
        }
      };
      cargarProducto();
    } else {
      setProductoDetalle(null);
    }
  }, [movimientoDetalle]);
  const parsearFecha = (fechaHora: string) => {
    try {
      if (!fechaHora) return new Date(0);
      // Normalizar separadores y detectar AM/PM
      const texto = fechaHora.replace(/\s+/g, ' ').trim();
      const am = /(a\.?\s*m\.?)/i.test(texto);
      const pm = /(p\.?\s*m\.?)/i.test(texto);

      // Intentar extraer con regex: dd[/|-]MM[/|-]yyyy HH:MM[:SS] [AM|PM]
      const re = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4}).*?(\d{1,2}):(\d{2})(?::(\d{2}))?/;
      const m = texto.match(re);
      if (m) {
        let dia = Number(m[1]);
        let mes = Number(m[2]);
        let año = Number(m[3]);
        let hora = Number(m[4]);
        const min = Number(m[5]);
        const seg = m[6] ? Number(m[6]) : 0;
        if (pm && hora < 12) hora += 12;
        if (am && hora === 12) hora = 0;
        return new Date(año, mes - 1, dia, hora, min, seg);
      }

      // Fallback: intentar separar por coma "fecha, hora"
      const partes = texto.split(', ');
      if (partes.length === 2) {
        const [fecha, horaStr] = partes;
        const [dia, mes, año] = fecha.split(/[\/\-]/).map(Number);
        let [hora, min, seg] = horaStr.split(':').map(Number);
        if (pm && hora < 12) hora += 12;
        if (am && hora === 12) hora = 0;
        return new Date(año, mes - 1, dia, hora || 0, min || 0, seg || 0);
      }

      // Último recurso: Date.parse puede fallar en locales; devolver 0
      const d = new Date(texto);
      return isNaN(d.getTime()) ? new Date(0) : d;
    } catch (error) {
      console.error("Error parseando fecha:", fechaHora);
      return new Date(0);
    }
  };

  const extraerFechaSinHora = (fechaHora: string) => {
    if (!fechaHora) return '';
    const texto = fechaHora.replace(/\s+/g, ' ').trim();
    const m = texto.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/);
    return m ? m[1] : (texto.split(', ')[0] || texto);
  };

  useEffect(() => {
    const cargarMovimientos = async () => {
      try {
        setLoading(true);
        const [movimientosGet, ventasEliminadas] = await Promise.all([
          obtenerMovimientosPromise(),
          obtenerVentasEliminadasPromise().catch(() => [])
        ]);

        // Transformar ventas eliminadas a formato de movimientos
        const movimientosVentasEliminadas: RegistrosYMovimientosInterface[] = (ventasEliminadas as any[]).map((v: any) => {
          const fechaEliminar = v.fechaEliminacion || v.fechaHora || 'Sin fecha';
          const fechaOriginal = v.fechaHora || 'Sin fecha';
          const total = typeof v.TotalGeneral === 'number' ? v.TotalGeneral : Number(v.TotalGeneral) || 0;
          const metodo = v.metodoPago || '-';
          const items = Array.isArray(v.ProductosVenta) ? v.ProductosVenta.length : 0;
          return {
            accion: 'Venta eliminada',
            cambios: `Venta eliminada: método ${metodo}, total $${Math.round(total)}, productos ${items}${v.fechaHora ? ` (original ${v.fechaHora})` : ''}`,
            fechaHora: fechaEliminar,
            // Metadatos adicionales para mostrar en el detalle
            productosVenta: v.ProductosVenta || [],
            fechaEliminacion: fechaEliminar,
            fechaOriginal,
            totalVenta: total,
            metodoPago: metodo,
          } as any;
        });

        const combinados = [...movimientosGet, ...movimientosVentasEliminadas];
        const ordenados = combinados.sort((a, b) =>
          parsearFecha(b.fechaHora).getTime() - parsearFecha(a.fechaHora).getTime()
        );
        setMovimientos(ordenados);
      } catch (error) {
        console.error("Error al obtener movimientos:", error);
        setMovimientos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarMovimientos();
  }, []);

  // Obtener fechas únicas ordenadas (más reciente a más antigua)
  const fechasUnicas = useMemo(() => {
    const fechas = new Set(movimientos.map(m => extraerFechaSinHora(m.fechaHora)));
    return Array.from(fechas).sort((a, b) => {
      const fechaA = parsearFecha(a + ", 00:00");
      const fechaB = parsearFecha(b + ", 00:00");
      return fechaB.getTime() - fechaA.getTime();
    });
  }, [movimientos]);

  // Filtrar movimientos
  let movimientosFiltrados = movimientos.filter(movimiento => {
    const accionLower = movimiento.accion.toLowerCase();
    const fechaMovimiento = extraerFechaSinHora(movimiento.fechaHora);
    
    // Filtro por tipo (basado en accion)
    let coincideTipo = false;
    if (filtroTipo === 'todos') {
      coincideTipo = true;
    } else if (filtroTipo === 'registrar') {
      coincideTipo = accionLower.includes('registrar');
    } else if (filtroTipo === 'editar') {
      coincideTipo = accionLower.includes('modificar') || accionLower.includes('editar');
    } else if (filtroTipo === 'eliminar') {
      // Solo eliminaciones de productos, no ventas
      coincideTipo = accionLower.includes('eliminar') && !accionLower.includes('venta');
    } else if (filtroTipo === 'reestock') {
      coincideTipo = accionLower.includes('reestock');
    } else if (filtroTipo === 'ventaEliminada') {
      coincideTipo = accionLower.includes('venta') && accionLower.includes('eliminada');
    }

    // Filtro por fecha seleccionada
    const coincideFecha = !fechaSeleccionada || fechaMovimiento === fechaSeleccionada;

    return coincideTipo && coincideFecha;
  });

  // Paginación
  const totalPaginas = Math.ceil(movimientosFiltrados.length / ITEMS_POR_PAGINA);

  // Manejar navegación con flechas del teclado
  useEffect(() => {
    const manejarTeclas = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (paginaActual > 1) {
          setPaginaActual(paginaActual - 1);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (paginaActual < totalPaginas) {
          setPaginaActual(paginaActual + 1);
        }
      }
    };

    window.addEventListener('keydown', manejarTeclas);
    return () => window.removeEventListener('keydown', manejarTeclas);
  }, [paginaActual, totalPaginas]);
  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const indiceFin = indiceInicio + ITEMS_POR_PAGINA;
  const movimientosPaginados = movimientosFiltrados.slice(indiceInicio, indiceFin);

  const paginasVisibles = useMemo(() => {
    if (totalPaginas <= PAGINAS_VISIBLES) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }

    const mitadVentana = Math.floor(PAGINAS_VISIBLES / 2);
    let inicio = paginaActual - mitadVentana;
    let fin = paginaActual + mitadVentana - 1;

    if (inicio < 1) {
      inicio = 1;
      fin = PAGINAS_VISIBLES;
    } else if (fin > totalPaginas) {
      fin = totalPaginas;
      inicio = totalPaginas - PAGINAS_VISIBLES + 1;
    }

    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  }, [paginaActual, totalPaginas]);

  // Estadísticas
  const totalMovimientos = movimientos.length;
  const registros = movimientos.filter(m => m.accion.toLowerCase().includes('registrar')).length;
  const ediciones = movimientos.filter(m => m.accion.toLowerCase().includes('modificar') || m.accion.toLowerCase().includes('editar')).length;
  const eliminaciones = movimientos.filter(m => m.accion.toLowerCase().includes('eliminar') && !m.accion.toLowerCase().includes('venta')).length;
  const reestocks = movimientos.filter(m => m.accion.toLowerCase().includes('reestock')).length;
  const ventasEliminadasCount = movimientos.filter(m => m.accion.toLowerCase().includes('venta') && m.accion.toLowerCase().includes('eliminada')).length;

  const irAPagina = (pagina: number) => {
    setPaginaActual(pagina);
  };

  const resetearFiltros = () => {
    setFiltroTipo('todos');
    setFechaSeleccionada('');
    setPaginaActual(1);
  };

  const formatearFecha = (fechaHora: string) => {
    // La fecha ya viene formateada de Firebase, solo la retornamos
    return fechaHora;
  };

  const obtenerIcono = (accion: string) => {
    const a = accion.toLowerCase();
    if (a.includes('registrar')) return <Package className="w-5 h-5" />;
    if (a.includes('modificar') || a.includes('editar')) return <Pencil className="w-5 h-5" />;
    if (a.includes('venta') && a.includes('eliminada')) return <Trash2 className="w-5 h-5" />;
    if (a.includes('eliminar')) return <Trash2 className="w-5 h-5" />;
    if (a.includes('reestock')) return <TrendingUp className="w-5 h-5" />;
    return null;
  };

  const obtenerColorTipo = (accion: string) => {
    const a = accion.toLowerCase();
    if (a.includes('registrar')) return 'text-green-700 bg-green-100';
    if (a.includes('modificar') || a.includes('editar')) return 'text-blue-700 bg-blue-100';
    if (a.includes('venta') && a.includes('eliminada')) return 'text-red-700 bg-red-100';
    if (a.includes('eliminar')) return 'text-red-700 bg-red-100';
    if (a.includes('reestock')) return 'text-amber-700 bg-amber-100';
    return 'text-gray-700 bg-gray-100';
  };

  const parseDetalleMovimiento = (mov: RegistrosYMovimientosInterface) => {
    // Intenta parsear formato multiline (con \n) primero
    const lineas = mov.cambios.split('\n').filter(l => l.trim());
    const parsed: { [key: string]: string } = {};
    const cambiosDetallados: Array<{ campo: string; anterior: string; nuevo: string }> = [];
    const camposModificados = new Set<string>(); // Para rastrear qué campos cambiaron
    
    // Primero, intenta extraer con regex para capturar datos de cualquier formato
    const nombreMatch = mov.cambios.match(/nombre[:\s]*([^\n,]+)/i);
    const codigoMatch = mov.cambios.match(/c(o|ó)digo\s*de\s*barras[:\s]*([^\n,]+)/i);
    const precioMatch = mov.cambios.match(/precio[:\s]*\$?([^\n,]+)/i);
    const stockMatch = mov.cambios.match(/stock\s*(final|nuevo)?[:\s]*([^\n,]+)/i);
    const cantidadMatch = mov.cambios.match(/cantidad\s*(agregada|a\u00f1adida|sumada)[:\s]*([^\n,]+)/i);
    const stockPrevioMatch = mov.cambios.match(/stock\s*(anterior|previo)[:\s]*([^\n,]+)/i);
    const tipoMatch = mov.cambios.match(/tipo\s*de\s*producto[:\s]*([^\n,]+)/i);

    // Guardar valores extraídos por regex
    if (nombreMatch) parsed['nombre'] = nombreMatch[1].trim();
    if (codigoMatch) parsed['código de barras'] = codigoMatch[2].trim();
    if (precioMatch) parsed['precio'] = precioMatch[1].trim();
    if (stockMatch) parsed['stock'] = stockMatch[2].trim();
    if (cantidadMatch) parsed['cantidad agregada'] = cantidadMatch[2].trim();
    if (stockPrevioMatch) parsed['stock anterior'] = stockPrevioMatch[2].trim();
    if (tipoMatch) parsed['tipo de producto'] = tipoMatch[1].trim();

    // Ahora procesa líneas para detectar cambios y otros datos
    lineas.forEach(linea => {
      // Patrón: "Campo cambió: valorAnterior → valorNuevo"
      const cambioMatch = linea.match(/^(.+?)\s*cambió:\s*(.+?)\s*→\s*(.+)$/i);
      if (cambioMatch) {
        const [, campo, anterior, nuevo] = cambioMatch;
        const campoNormalizado = campo.trim().toLowerCase();
        cambiosDetallados.push({
          campo: campo.trim(),
          anterior: anterior.trim(),
          nuevo: nuevo.trim()
        });
        camposModificados.add(campoNormalizado);
        // Guardar el valor nuevo en parsed
        parsed[campoNormalizado] = nuevo.trim();

        // Si el campo corresponde a precio/stock/tipo, llenar claves normalizadas
        if (campoNormalizado.startsWith('precio')) {
          parsed['precio'] = nuevo.trim();
          const nombreEnCampo = campo.match(/precio\s*de\s*(.+)$/i);
          if (nombreEnCampo && nombreEnCampo[1]) {
            parsed['nombre'] = nombreEnCampo[1].trim();
          }
          camposModificados.add('precio');
        } else if (campoNormalizado.startsWith('stock')) {
          parsed['stock'] = nuevo.trim();
          const nombreEnCampo = campo.match(/stock\s*de\s*(.+)$/i);
          if (nombreEnCampo && nombreEnCampo[1]) {
            parsed['nombre'] = nombreEnCampo[1].trim();
          }
          camposModificados.add('stock');
        } else if (campoNormalizado.startsWith('tipo')) {
          parsed['tipo de producto'] = nuevo.trim();
          camposModificados.add('tipo de producto');
        } else if (campoNormalizado.startsWith('nombre')) {
          parsed['nombre'] = nuevo.trim();
          camposModificados.add('nombre');
        }
      } else {
        // Intenta parsear como clave: valor
        const [clave, valor] = linea.split(':').map(s => s.trim());
        if (clave && valor && !parsed[clave.toLowerCase()]) {
          parsed[clave.toLowerCase()] = valor;
        }
      }
    });

    // Normalizar claves alternativas
    const nombre = parsed['nombre'] || '';
    const codigo = parsed['código de barras'] || parsed['codigo de barras'] || '';
    const precio = parsed['precio'] || '';
    const stock = parsed['stock final'] || parsed['stock final'] || parsed['stock'] || '';
    const tipoProducto = parsed['tipo de producto'] || parsed['tipo producto'] || '';
    const stockPrevio = parsed['stock anterior'] || '';
    const cantidadAgregada = parsed['cantidad agregada'] || '';

    // Retorna objeto con claves normalizadas del formato multiline
    return {
      nombre: nombre,
      codigo: codigo,
      precio: precio,
      stock: stock,
      cantidadAgregada: cantidadAgregada,
      stockPrevio: stockPrevio,
      tipoProducto: tipoProducto,
      cambios: cambiosDetallados,
      camposModificados: camposModificados,
    };
  };

  const parseDetalleVentaEliminada = (mov: RegistrosYMovimientosInterface) => {
    const texto = mov.cambios || '';
    const regex = /método\s+([^,]+),\s*total\s*\$?([\d.,]+),\s*productos\s+(\d+)/i;
    const match = texto.match(regex);
    const metodo = match ? match[1].trim() : '-';
    const totalStr = match ? match[2].replace(/\./g, '').replace(/,/g, '.') : '0';
    const total = Number(totalStr) || 0;
    const productos = match ? Number(match[3]) || 0 : 0;
    return { metodo, total, productos };
  };

  const resumenMovimiento = (mov: RegistrosYMovimientosInterface) => {
    const a = mov.accion.toLowerCase();
    if (a.includes('registrar')) {
      const { nombre } = parseDetalleMovimiento(mov);
      return nombre ? `Producto registrado: ${nombre}` : 'Producto registrado';
    }
    if (a.includes('venta') && a.includes('eliminada')) {
      return mov.cambios;
    }
    if (a.includes('reestock')) {
      const { nombre, cantidadAgregada, stockPrevio, stock } = parseDetalleMovimiento(mov);
      if (nombre && cantidadAgregada && stockPrevio && stock) {
        return `Stock repuesto: ${nombre} - Añadido: +${cantidadAgregada} (De ${stockPrevio} a ${stock})`;
      }
      if (nombre && cantidadAgregada) return `Stock repuesto: ${nombre} (+${cantidadAgregada})`;
      if (nombre) return `Stock repuesto: ${nombre}`;
      return 'Stock repuesto';
    }
    return mov.cambios;
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-[90rem] h-[790px] min-h-[790px] max-h-[790px] bg-white rounded-lg shadow-md shadow-gray-200/80 border border-gray-100 p-8 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-4xl text-gray-900 mb-2">Registro y Movimientos</h1>
            <p className="text-gray-600">Historial completo de todas las acciones realizadas en el programa</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 rounded-lg transition hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Inicio
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-4 space-y-4 flex-shrink-0">
          {/* Filtros por tipo */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setFiltroTipo('todos');
                setPaginaActual(1);
              }}
              className={`px-4 py-2 rounded-lg transition ${
                filtroTipo === 'todos'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({totalMovimientos})
            </button>
            <button
              onClick={() => {
                setFiltroTipo('registrar');
                setPaginaActual(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                filtroTipo === 'registrar'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Registros ({registros})
            </button>
            <button
              onClick={() => {
                setFiltroTipo('editar');
                setPaginaActual(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                filtroTipo === 'editar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <Pencil className="w-4 h-4" />
              Ediciones ({ediciones})
            </button>
            <button
              onClick={() => {
                setFiltroTipo('eliminar');
                setPaginaActual(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                filtroTipo === 'eliminar'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Eliminaciones ({eliminaciones})
            </button>
            <button
              onClick={() => {
                setFiltroTipo('ventaEliminada');
                setPaginaActual(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                filtroTipo === 'ventaEliminada'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Ventas eliminadas ({ventasEliminadasCount})
            </button>
            <button
              onClick={() => {
                setFiltroTipo('reestock');
                setPaginaActual(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                filtroTipo === 'reestock'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Reestock ({reestocks})
            </button>

            <div className="border-l border-gray-300 mx-2"></div>

            <button
              onClick={resetearFiltros}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              Limpiar Filtros
            </button>
          </div>

          {/* Filtros por fecha */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Seleccionar fecha:</label>
            <div className="relative">
              <button
                onClick={() => setMostrarSelectorFechas(!mostrarSelectorFechas)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] text-left flex items-center justify-between"
              >
                <span>{fechaSeleccionada || 'Todas las fechas'}</span>
                <span className="text-gray-500">▼</span>
              </button>
              
              {mostrarSelectorFechas && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <div className="max-h-[240px] overflow-y-auto">
                    <button
                      onClick={() => {
                        setFechaSeleccionada('');
                        setPaginaActual(1);
                        setMostrarSelectorFechas(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 text-gray-900 border-b border-gray-100"
                    >
                      Todas las fechas
                    </button>
                    {fechasUnicas.map((fecha) => (
                      <button
                        key={fecha}
                        onClick={() => {
                          setFechaSeleccionada(fecha);
                          setPaginaActual(1);
                          setMostrarSelectorFechas(false);
                        }}
                        className={`w-full text-left px-3 py-2 border-b border-gray-100 last:border-b-0 transition ${
                          fechaSeleccionada === fecha
                            ? 'bg-blue-100 text-blue-900 font-medium'
                            : 'hover:bg-blue-50 text-gray-900'
                        }`}
                      >
                        {fecha}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de Movimientos */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col border border-gray-200 rounded-lg">
          {/* Encabezado */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex-shrink-0">
            <div className="grid grid-cols-12 gap-4 text-sm text-gray-700">
              <div className="col-span-2">ACCIÓN</div>
              <div className="col-span-6">MOVIMIENTO REGISTRADO</div>
              <div className="col-span-3">FECHA Y HORA</div>
              <div className="col-span-1 text-center">VER DETALLES</div>
            </div>
          </div>

          {/* Contenido */}
          <div className="overflow-y-auto max-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Cargando movimientos...</p>
              </div>
            ) : movimientosPaginados.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>No se encontraron movimientos</p>
              </div>
            ) : (
              movimientosPaginados.map((movimiento, idx) => (
                <div
                  key={`${movimiento.fechaHora}-${idx}`}
                  className="border-b border-gray-200 last:border-b-0 px-4 py-2 hover:bg-gray-50 transition"
                >
                  <div className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-2">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${obtenerColorTipo(movimiento.accion)}`}>
                        {obtenerIcono(movimiento.accion)}
                        <span className="text-sm font-medium">{movimiento.accion.toLowerCase().includes('reestock') ? 'REESTOCK' : movimiento.accion}</span>
                      </div>
                    </div>
                    <div className="col-span-6">
                      <div className="flex flex-col gap-2">
                        <p className="text-gray-900 text-sm leading-relaxed">{resumenMovimiento(movimiento)}</p>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <p className="text-gray-600 text-sm">{formatearFecha(movimiento.fechaHora)}</p>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => {
                          setMovimientoDetalle(movimiento);
                          setIndiceDetalle(indiceInicio + idx + 1);
                        }}
                        className="p-2 rounded hover:bg-gray-100 transition"
                        aria-label="Ver detalles"
                      >
                        <ChevronDown className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Paginación */}
        {movimientosFiltrados.length > 0 && (
          <div className="mt-auto pt-4 flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-gray-600">
              Mostrando {indiceInicio + 1} - {Math.min(indiceFin, movimientosFiltrados.length)} de {movimientosFiltrados.length} movimientos
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
                {paginasVisibles.map((pagina) => (
                  <button
                    key={pagina}
                    onClick={() => irAPagina(pagina)}
                    className={`w-10 h-10 rounded-lg transition ${
                      paginaActual === pagina
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
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

      {movimientoDetalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl shadow-gray-300/70 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-500 uppercase">{movimientoDetalle.accion.toUpperCase()}</p>
                <h2 className="text-2xl font-bold text-gray-900">Detalle del Movimiento</h2>
              </div>
              <button
                onClick={() => {
                  setMovimientoDetalle(null);
                  setIndiceDetalle(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <section className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="text-gray-500">Fecha y Hora</p>
                    <p className="font-medium text-gray-900">{movimientoDetalle.fechaHora}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tipo de Acción</p>
                    <p className="font-medium text-gray-900 capitalize">{movimientoDetalle.accion}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ID de Movimiento</p>
                    <p className="font-medium text-gray-900">{indiceDetalle ?? '-'}</p>
                  </div>
                </div>
              </section>

              {(() => {
                const detalle = parseDetalleMovimiento(movimientoDetalle);
                
                const esModificacion = movimientoDetalle.accion.toLowerCase().includes('modificar') || 
                                      movimientoDetalle.accion.toLowerCase().includes('editar');
                const esReestock = movimientoDetalle.accion.toLowerCase().includes('reestock');
                const esVentaEliminada = movimientoDetalle.accion.toLowerCase().includes('venta') && movimientoDetalle.accion.toLowerCase().includes('eliminada');

                if (esVentaEliminada) {
                  const ventaInfo = parseDetalleVentaEliminada(movimientoDetalle);
                  const productosVenta = (movimientoDetalle as any).productosVenta || [];
                  const fechaOriginal = (movimientoDetalle as any).fechaOriginal || '-';
                  const fechaEliminacion = (movimientoDetalle as any).fechaEliminacion || movimientoDetalle.fechaHora;
                  const totalVenta = (movimientoDetalle as any).totalVenta ?? ventaInfo.total;
                  const metodoPago = (movimientoDetalle as any).metodoPago || ventaInfo.metodo;
                  return (
                    <section className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de venta eliminada</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-800">
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                          <p className="text-xs uppercase font-semibold text-red-700 mb-1">Productos en la venta</p>
                          <p className="text-xl font-bold text-red-900">{ventaInfo.productos}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="text-xs uppercase font-semibold text-blue-700 mb-1">Total de la venta</p>
                          <p className="text-xl font-bold text-blue-900">${totalVenta.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <p className="text-xs uppercase font-semibold text-gray-700 mb-1">Método de pago</p>
                          <p className="text-lg font-bold text-gray-900">{metodoPago}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                          <p className="text-xs uppercase font-semibold text-amber-700 mb-1">Fechas</p>
                          <div className="text-gray-900 text-sm space-y-1">
                            <div><span className="font-semibold">Venta:</span> {fechaOriginal}</div>
                            <div><span className="font-semibold">Eliminación:</span> {fechaEliminacion}</div>
                          </div>
                        </div>
                      </div>

                      {/* Lista de productos vendidos */}
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Productos vendidos ({productosVenta.length})</h4>
                        {productosVenta.length === 0 ? (
                          <p className="text-gray-600 text-sm">No hay detalle de productos.</p>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg divide-y divide-gray-200">
                            {productosVenta.map((p: any, idx: number) => (
                              <div key={idx} className="px-3 py-2 flex flex-col md:flex-row md:items-center md:gap-4 text-sm text-gray-800">
                                <div className="font-semibold text-gray-900 flex-1">{p.NombreProducto || `Producto ${idx + 1}`}</div>
                                <div className="text-gray-700">Cant: {p.cantidad ?? '-'}</div>
                                <div className="text-gray-700">Tipo: {p.TipoProducto || '-'}</div>
                                <div className="text-gray-700">Precio: {p.PrecioUnitario ?? p.Precio ?? '-'}</div>
                                <div className="text-gray-900 font-semibold">Subtotal: {p.subtotal ?? '-'}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>
                  );
                }
                
                // Usar datos del producto si se cargó, si no usar los parseados
                const datosProducto = productoDetalle || {
                  NombreProducto: detalle.nombre,
                  CodigoDeBarras: detalle.codigo,
                  Precio: detalle.precio ? detalle.precio.replace(/\$/g, '').trim() : '',
                  TipoProducto: detalle.tipoProducto,
                  Stock: detalle.stock,
                };

                // Todos los campos del producto - mismo orden que reestock
                const campos = [
                  { label: 'Nombre del Producto', valor: datosProducto.NombreProducto, key: 'nombre' },
                  { label: 'Código de Barras', valor: datosProducto.CodigoDeBarras, key: 'código de barras' },
                  { label: 'Stock', valor: datosProducto.Stock ? `${datosProducto.Stock}` : '', key: 'stock' },
                  { label: 'Precio', valor: datosProducto.Precio ? (String(datosProducto.Precio).startsWith('$') ? String(datosProducto.Precio) : `$${datosProducto.Precio}`) : '', key: 'precio' },
                  { label: 'Tipo (Unidad o Kg)', valor: datosProducto.TipoProducto, key: 'tipo de producto' },
                ];

                // Mostrar siempre todos los campos para mantener consistencia con Reestock
                const camposConValor = campos;

                return (
                  <section className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Detalles Completos del Producto</h3>
                      {loadingProducto && (
                        <span className="text-xs text-gray-500">Cargando datos del producto...</span>
                      )}
                    </div>
                    <div className="space-y-4">
                      {/* Mostrar todos los campos del producto */}
                      {camposConValor.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {camposConValor.map((campo) => {
                            const fueModificado = detalle.camposModificados && detalle.camposModificados.has(campo.key.toLowerCase());
                            return (
                              <div
                                key={campo.key}
                                className={`p-4 rounded-lg border-2 transition ${
                                  fueModificado
                                    ? 'bg-amber-50 border-amber-400 shadow-md ring-1 ring-amber-300'
                                    : 'bg-blue-50 border-blue-200'
                                }`}
                              >
                                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-2">
                                  {campo.label}
                                </p>
                                <p className={`font-bold mt-1 text-lg ${fueModificado ? 'text-amber-900' : 'text-blue-900'}`}>
                                  {campo.valor || '-'}
                                </p>
                                {fueModificado && (
                                  <p className="text-amber-600 text-xs font-bold mt-2">
                                    MODIFICADO
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">Cargando información del producto...</p>
                      )}

                      {/* Cambios detallados para modificaciones */}
                      {esModificacion && detalle.cambios && detalle.cambios.length > 0 && (
                        <div className="border-t pt-5 mt-5">
                          <h4 className="font-bold text-gray-900 mb-4 text-base">Detalles de Cambios</h4>
                          <div className="space-y-3">
                            {detalle.cambios.map((cambio, idx) => (
                              <div key={idx} className="bg-gradient-to-r from-red-50 to-green-50 border-l-4 border-orange-400 rounded-lg p-4 shadow-sm">
                                <p className="font-bold text-gray-900 mb-3 text-base">{cambio.campo}</p>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-gray-600 text-xs font-bold uppercase mb-2">Valor Anterior</p>
                                    <p className="font-mono text-red-700 text-base font-semibold bg-red-100 px-3 py-2 rounded">
                                      {cambio.anterior}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 text-xs font-bold uppercase mb-2">Valor Nuevo</p>
                                    <p className="font-mono text-green-700 text-base font-bold bg-green-100 px-3 py-2 rounded">
                                      {cambio.nuevo}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detalles de cambios para reestock */}
                      {esReestock && detalle.stockPrevio && detalle.stock && detalle.cantidadAgregada && (
                        <div className="border-t pt-5 mt-5">
                          <h4 className="font-bold text-gray-900 mb-4 text-base">Detalles de Cambios</h4>
                          <div className="space-y-3">
                            <div className="bg-gradient-to-r from-red-50 to-green-50 border-l-4 border-orange-400 rounded-lg p-4 shadow-sm">
                              <p className="font-bold text-gray-900 mb-3 text-base">Stock del Producto</p>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-gray-600 text-xs font-bold uppercase mb-2">Valor Anterior</p>
                                  <p className="font-mono text-red-700 text-base font-semibold bg-red-100 px-3 py-2 rounded">
                                    {detalle.stockPrevio}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600 text-xs font-bold uppercase mb-2">Valor Nuevo</p>
                                  <p className="font-mono text-green-700 text-base font-bold bg-green-100 px-3 py-2 rounded">
                                    {parseInt(detalle.stockPrevio) + parseInt(detalle.cantidadAgregada)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                                <p className="text-amber-900 text-sm font-semibold">
                                  Cantidad agregada: +{detalle.cantidadAgregada}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })()}

              {/* Se eliminó la sección de "Descripción Completa" según solicitud */}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setMovimientoDetalle(null);
                  setIndiceDetalle(null);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrosYMovimientosComponent;