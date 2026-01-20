import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  AlertTriangle, 
  AlertCircle, 
  Clock,
  XCircle,
  CircleAlert,
  Filter,
  Wifi,
  WifiOff,
  Check,
  CheckCircle
} from 'lucide-react';
import { obtenerAlertasPromise, generarAlertasDesdeReportesPromise, marcarAlertaComoLeidaPromise } from '@/core/infrastructure/firebase';
import { useOfflineSync, useOnlineStatus } from '@/core/infrastructure/offline';

// Exportamos la interfaz desde Promesas
interface AlertaInterface {
  id: string;
  tipo: 'sin-stock' | 'stock-critico' | 'stock-bajo' | 'desfase';
  producto: string;
  idProducto: string;
  mensaje: string;
  fecha: Date;
  valorDesfase?: number;
  stockRestante?: number;
  leida: boolean;
}

interface AlertasProps {
  onClose: () => void;
}

export function Alertas({ onClose }: AlertasProps) {
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'sin-stock' | 'stock-critico' | 'stock-bajo' | 'desfase' | 'leidas'>('todos');
  const [ordenFecha, setOrdenFecha] = useState<'recientes' | 'antiguas'>('recientes');
  const [paginaActual, setPaginaActual] = useState(1);
  const [alertas, setAlertas] = useState<AlertaInterface[]>([]);
  const [cargando, setCargando] = useState(true);
  const alertasPorPagina = 4;
  
  // Offline functionality
  const { getSales } = useOfflineSync();
  const isOnline = useOnlineStatus();

  // Cargar alertas de Firebase (solo una vez, sin generar automáticamente)
  useEffect(() => {
    const cargarAlertas = async () => {
      try {
        // NO generar alertas automáticamente - solo cargar las existentes
        // Las alertas de desfase se crean cuando se reporta un nuevo desfase
        const alertasFirebase = await obtenerAlertasPromise();
        setAlertas(alertasFirebase);
      } catch (error) {
        console.error('Error cargando alertas:', error);
        setAlertas([]);
      } finally {
        setCargando(false);
      }
    };

    cargarAlertas();
  }, []); // Array vacío para que solo se ejecute una vez al montar

  const handleMarcarLeida = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const exito = await marcarAlertaComoLeidaPromise(id);
      if (exito) {
        // Actualizar estado local marcando como leída en lugar de eliminar
        setAlertas(prev => prev.map(a => 
          a.id === id ? { ...a, leida: true } : a
        ));
      }
    } catch (error) {
      console.error('Error al marcar alerta como leída:', error);
    }
  };

  // Filtrar alertas
  let alertasFiltradas = alertas.filter(alerta => {
    if (filtroTipo === 'leidas') {
      return alerta.leida;
    }
    // Solo mostrar alertas NO leídas para los demás filtros
    if (alerta.leida) return false;
    return filtroTipo === 'todos' || alerta.tipo === filtroTipo;
  });

  // Ordenar por fecha
  alertasFiltradas = alertasFiltradas.sort((a, b) => {
    if (ordenFecha === 'recientes') {
      return b.fecha.getTime() - a.fecha.getTime();
    } else {
      return a.fecha.getTime() - b.fecha.getTime();
    }
  });

  // Resetear a primera página cuando cambia el filtro
  const totalAlertas_filtered = alertasFiltradas.length;
  const totalPaginas = Math.ceil(totalAlertas_filtered / alertasPorPagina);
  const indiceInicial = (paginaActual - 1) * alertasPorPagina;
  const indiceFinal = indiceInicial + alertasPorPagina;
  const alertasActuales = alertasFiltradas.slice(indiceInicial, indiceFinal);

  // Estadísticas de alertas (solo contar las NO leídas para los filtros principales)
  const totalAlertas = alertas.filter(a => !a.leida).length;
  const sinStock = alertas.filter(a => a.tipo === 'sin-stock' && !a.leida).length;
  const stockCritico = alertas.filter(a => a.tipo === 'stock-critico' && !a.leida).length;
  const stockBajo = alertas.filter(a => a.tipo === 'stock-bajo' && !a.leida).length;
  const desfases = alertas.filter(a => a.tipo === 'desfase' && !a.leida).length;
  const leidasCount = alertas.filter(a => a.leida).length;


  const formatearFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatearHora = (fecha: Date) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatearFechaCorta = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const obtenerIconoAlerta = (tipo: string) => {
    switch (tipo) {
      case 'sin-stock':
        return <XCircle className="w-4 h-4" />;
      case 'stock-critico':
        return <AlertCircle className="w-4 h-4" />;
      case 'stock-bajo':
        return <AlertTriangle className="w-4 h-4" />;
      case 'desfase':
        return <CircleAlert className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const obtenerColorAlerta = (tipo: string) => {
    switch (tipo) {
      case 'sin-stock':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'stock-critico':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'stock-bajo':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'desfase':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const obtenerColorBorde = (tipo: string) => {
    switch (tipo) {
      case 'sin-stock':
        return 'border-red-400';
      case 'stock-critico':
        return 'border-orange-400';
      case 'stock-bajo':
        return 'border-yellow-400';
      case 'desfase':
        return 'border-purple-400';
      default:
        return 'border-gray-400';
    }
  };

  const obtenerTextoTipo = (tipo: string) => {
    switch (tipo) {
      case 'sin-stock':
        return 'Sin Stock';
      case 'stock-critico':
        return 'Stock Crítico';
      case 'stock-bajo':
        return 'Stock Bajo';
      case 'desfase':
        return 'Desfase';
      default:
        return tipo;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center px-20 py-0">
      <div className="w-full h-[850px] bg-white rounded-lg shadow-lg p-8 flex flex-col">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-4xl text-gray-900 mb-2">Alertas de Inventario</h1>
            <p className="text-gray-600">Sistema de notificaciones de stock y desfases</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 rounded-lg transition hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al menu
          </button>
        </div>

        {/* Filtros y Ordenamiento */}
        <div className="mb-2 shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-700">Filtros:</h3>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Filtros de tipo */}
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                filtroTipo === 'todos'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({totalAlertas})
            </button>
            <button
              onClick={() => setFiltroTipo('sin-stock')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                filtroTipo === 'sin-stock'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <XCircle className="w-4 h-4" />
              Sin Stock ({sinStock})
            </button>
            <button
              onClick={() => setFiltroTipo('stock-critico')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                filtroTipo === 'stock-critico'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Stock Crítico ({stockCritico})
            </button>
            <button
              onClick={() => setFiltroTipo('stock-bajo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                filtroTipo === 'stock-bajo'
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Stock Bajo ({stockBajo})
            </button>
            <button
              onClick={() => setFiltroTipo('desfase')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                filtroTipo === 'desfase'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              <CircleAlert className="w-4 h-4" />
              Desfases ({desfases})
            </button>
            <button
              onClick={() => setFiltroTipo('leidas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                filtroTipo === 'leidas'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Leídas ({leidasCount})
            </button>


            {/* Separador */}
            <div className="h-8 w-px bg-gray-300"></div>

            {/* Ordenamiento */}
            <select
              value={ordenFecha}
              onChange={(e) => setOrdenFecha(e.target.value as 'recientes' | 'antiguas')}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 cursor-pointer hover:border-gray-400 transition"
            >
              <option value="recientes">Más recientes primero</option>
              <option value="antiguas">Más antiguas primero</option>
            </select>
          </div>
        </div>

        {/* Lista de Alertas */}
        <div className="flex-1 border-2 border-gray-200 rounded-lg flex flex-col overflow-hidden">
          {cargando ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
                <p className="text-lg">Cargando alertas...</p>
              </div>
            </div>
          ) : alertasFiltradas.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No hay alertas para mostrar</p>
                <p className="text-sm mt-2">Todas las alertas de este tipo han sido resueltas</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="divide-y divide-gray-200 flex-1 overflow-y-auto">
                {alertasActuales.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`p-3 hover:bg-gray-50 transition border-l-4 ${obtenerColorBorde(alerta.tipo)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${obtenerColorAlerta(alerta.tipo)} border`}>
                        {obtenerIconoAlerta(alerta.tipo)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-sm font-bold uppercase ${obtenerColorAlerta(alerta.tipo)} border`}>
                            {obtenerTextoTipo(alerta.tipo)}
                          </span>
                          <span className="text-base text-gray-900 font-bold">{alerta.producto}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{alerta.mensaje}</p>
                        <div className="flex items-center gap-3 text-sm">
                          {alerta.valorDesfase !== undefined && (
                            <span className={`px-2 py-1 rounded ${alerta.valorDesfase < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-semibold`}>
                              Desfase: {alerta.valorDesfase > 0 ? '+' : ''}{alerta.valorDesfase} unidades
                            </span>
                          )}
                          {alerta.stockRestante !== undefined && (
                            <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 font-semibold">
                              Stock actual: {alerta.stockRestante} unidades
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                       {/* Solo mostrar botón de marcar como leída si no está leída */}
                       {!alerta.leida && (
                       <button
                        onClick={(e) => handleMarcarLeida(alerta.id, e)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition border border-green-200 text-sm font-medium"
                        title="Marcar como leída (desaparecerá de la lista)"
                      >
                        <Check className="w-4 h-4" />
                        Marcar como leída
                      </button>
                      )}
                      <div className="flex items-center gap-1.5 text-gray-600 text-sm mt-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">{formatearHora(alerta.fecha)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{formatearFechaCorta(alerta.fecha)}</p>
                    </div>
                  </div>
                </div>
              ))}
              </div>
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50">
                  <span className="text-sm text-gray-600 font-medium">
                    Mostrando {indiceInicial + 1} - {Math.min(indiceFinal, totalAlertas_filtered)} de {totalAlertas_filtered} alertas
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                      disabled={paginaActual === 1}
                      className="px-2 py-1 rounded bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition font-medium text-sm"
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                      <button
                        key={pagina}
                        onClick={() => setPaginaActual(pagina)}
                        className={`w-8 h-8 rounded font-medium transition text-sm ${
                          paginaActual === pagina
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pagina}
                      </button>
                    ))}
                    <button
                      onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                      disabled={paginaActual === totalPaginas}
                      className="px-2 py-1 rounded bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition font-medium text-sm"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
