import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, XCircle, ChevronDown, ArrowLeft } from 'lucide-react';
import { obtenerProductosPromiseUpdate } from '@/core/infrastructure/firebase';
import { ProductoConIDInterface } from '@/core/domain/entities';
import '@/assets/styles/gestion-productos-styles/crud-style/crud-style.css';
import ModificarProductoComponent from './modificar-productos-component/ModificarProductoMainComponent';
import EliminarProductoComponent from './eliminar-productos-component/EliminarProductoComponent';

type EstadoStock = 'sin-stock' | 'critico' | 'bajo' | 'en-stock';

const ITEMS_POR_PAGINA = 5;

// Función para determinar el estado del stock
function obtenerEstadoStock(stock: number): EstadoStock {
  const stockNum = Number(stock);
  if (stockNum === 0) return 'sin-stock';
  if (stockNum === 1) return 'critico';
  if (stockNum <= 5) return 'bajo';
  return 'en-stock';
}

export function GestionarProductos({ onVolver }: { onVolver?: () => void }) {
  const [productos, setProductos] = useState<ProductoConIDInterface[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoStock | 'todos'>('todos');
  const [ordenPrecio, setOrdenPrecio] = useState<'asc' | 'desc' | null>(null);
  const [ordenStock, setOrdenStock] = useState<'asc' | 'desc' | null>(null);
  const [acordeonAbierto, setAcordeonAbierto] = useState<'precio' | 'stock' | null>(null);
  const [refreshProductos, setRefreshProductos] = useState(false);

  useEffect(() => {
    obtenerProductosPromiseUpdate().then(setProductos);
    setRefreshProductos(false);
  }, [refreshProductos]);

  // Filtrar y ordenar productos
  let productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = 
      producto.NombreProducto.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.CodigoDeBarras.toLowerCase().includes(busqueda);
    
    const estadoStock = obtenerEstadoStock(Number(producto.Stock));
    const coincideEstado = filtroEstado === 'todos' || estadoStock === filtroEstado;
    
    return coincideBusqueda && coincideEstado;
  });

  // Ordenar por precio
  if (ordenPrecio) {
    productosFiltrados = [...productosFiltrados].sort((a, b) => 
      ordenPrecio === 'desc' 
        ? Number(b.Precio) - Number(a.Precio) 
        : Number(a.Precio) - Number(b.Precio)
    );
  }

  // Ordenar por stock
  if (ordenStock) {
    productosFiltrados = [...productosFiltrados].sort((a, b) => 
      ordenStock === 'desc' 
        ? Number(b.Stock) - Number(a.Stock) 
        : Number(a.Stock) - Number(b.Stock)
    );
  }

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const indiceFin = indiceInicio + ITEMS_POR_PAGINA;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);

  // Calcular estadísticas
  const totalProductos = productos.length;
  const sinStock = productos.filter(p => obtenerEstadoStock(Number(p.Stock)) === 'sin-stock').length;
  const stockCritico = productos.filter(p => obtenerEstadoStock(Number(p.Stock)) === 'critico').length;
  const stockBajo = productos.filter(p => obtenerEstadoStock(Number(p.Stock)) === 'bajo').length;

  const handleOrdenPrecio = (orden: 'asc' | 'desc') => {
    setOrdenPrecio(orden);
    setOrdenStock(null);
    setPaginaActual(1);
    setAcordeonAbierto(null);
  };

  const handleOrdenStock = (orden: 'asc' | 'desc') => {
    setOrdenStock(orden);
    setOrdenPrecio(null);
    setPaginaActual(1);
    setAcordeonAbierto(null);
  };

  const irAPagina = (pagina: number) => {
    setPaginaActual(pagina);
  };

  const resetearFiltros = () => {
    setBusqueda('');
    setFiltroEstado('todos');
    setOrdenPrecio(null);
    setOrdenStock(null);
    setPaginaActual(1);
    setAcordeonAbierto(null);
  };

  return (
    <div className="w-full flex justify-center -mt-4 pb-8 px-4">
      <div className="w-full max-w-[90%] bg-white rounded-lg shadow-lg p-8 flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl text-gray-900 mb-2">Gestionar Productos</h1>
            <p className="text-gray-600">Administrador de productos e inventario del minimarket</p>
          </div>
          {onVolver && (
            <button
              onClick={onVolver}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al menú
            </button>
          )}
        </div>

        {/* Filtros y Búsqueda */}
        <div className="mb-4 space-y-4 flex-shrink-0">
          {/* Búsqueda */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o código de barras..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={resetearFiltros}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              Limpiar Filtros
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setFiltroEstado('todos');
                setPaginaActual(1);
              }}
              className={`px-4 py-2 rounded-lg transition ${
                filtroEstado === 'todos'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({totalProductos})
            </button>
            <button
              onClick={() => {
                setFiltroEstado('sin-stock');
                setPaginaActual(1);
              }}
              className={`px-4 py-2 rounded-lg transition ${
                filtroEstado === 'sin-stock'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Sin Stock ({sinStock})
            </button>
            <button
              onClick={() => {
                setFiltroEstado('critico');
                setPaginaActual(1);
              }}
              className={`px-4 py-2 rounded-lg transition ${
                filtroEstado === 'critico'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              Crítico ({stockCritico})
            </button>
            <button
              onClick={() => {
                setFiltroEstado('bajo');
                setPaginaActual(1);
              }}
              className={`px-4 py-2 rounded-lg transition ${
                filtroEstado === 'bajo'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              Bajo ({stockBajo})
            </button>
            <button
              onClick={() => {
                setFiltroEstado('en-stock');
                setPaginaActual(1);
              }}
              className={`px-4 py-2 rounded-lg transition ${
                filtroEstado === 'en-stock'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              En Stock
            </button>

            <div className="border-l border-gray-300 mx-2"></div>

            {/* Acordeón de Precio */}
            <div className="relative">
              <button
                onClick={() => setAcordeonAbierto(acordeonAbierto === 'precio' ? null : 'precio')}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  ordenPrecio
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Ordenar por Precio
                <ChevronDown className={`w-4 h-4 transition-transform ${acordeonAbierto === 'precio' ? 'rotate-180' : ''}`} />
              </button>
              {acordeonAbierto === 'precio' && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px]">
                  <button
                    onClick={() => handleOrdenPrecio('desc')}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition rounded-t-lg ${
                      ordenPrecio === 'desc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    Mayor a Menor ↓
                  </button>
                  <button
                    onClick={() => handleOrdenPrecio('asc')}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition rounded-b-lg ${
                      ordenPrecio === 'asc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    Menor a Mayor ↑
                  </button>
                </div>
              )}
            </div>

            {/* Acordeón de Stock */}
            <div className="relative">
              <button
                onClick={() => setAcordeonAbierto(acordeonAbierto === 'stock' ? null : 'stock')}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  ordenStock
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                Ordenar por Stock
                <ChevronDown className={`w-4 h-4 transition-transform ${acordeonAbierto === 'stock' ? 'rotate-180' : ''}`} />
              </button>
              {acordeonAbierto === 'stock' && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px]">
                  <button
                    onClick={() => handleOrdenStock('desc')}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition rounded-t-lg ${
                      ordenStock === 'desc' ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                    }`}
                  >
                    Mayor a Menor ↓
                  </button>
                  <button
                    onClick={() => handleOrdenStock('asc')}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition rounded-b-lg ${
                      ordenStock === 'asc' ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                    }`}
                  >
                    Menor a Mayor ↑
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="flex-1 overflow-hidden flex flex-col border border-gray-200 rounded-lg">
          {/* Encabezado */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="grid grid-cols-12 gap-6 text-sm font-semibold text-gray-700">
              <div className="col-span-2">NOMBRE</div>
              <div className="col-span-2">CÓDIGO</div>
              <div className="col-span-1">TIPO</div>
              <div className="col-span-2">PRECIO</div>
              <div className="col-span-1">STOCK</div>
              <div className="col-span-2">ESTADO</div>
              <div className="col-span-1 text-center">ACCIONES</div>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-hidden">
            {productosPaginados.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>No se encontraron productos</p>
              </div>
            ) : (
              productosPaginados.map((producto) => {
                const estadoStock = obtenerEstadoStock(Number(producto.Stock));
                const tipoProducto = producto.TipoProducto === 'peso' ? 'Por peso (kg)' : 'Unidad';
                const stockNum = Number(producto.Stock);
                const precioNum = Number(producto.Precio);
                
                return (
                  <div
                    key={producto.id}
                    className="border-b border-gray-200 last:border-b-0 px-6 py-4 hover:bg-gray-50 transition"
                  >
                    <div className="grid grid-cols-12 gap-6 items-center">
                      <div className="col-span-2 text-gray-900 font-medium truncate">{producto.NombreProducto}</div>
                      <div className="col-span-2 text-gray-900 text-sm font-mono font-semibold">
                        {producto.CodigoDeBarras}
                      </div>
                      <div className="col-span-1">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs whitespace-nowrap ${
                            producto.TipoProducto === 'peso'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {tipoProducto}
                        </span>
                      </div>
                      <div className="col-span-2 text-gray-900 font-medium">
                        ${precioNum.toLocaleString('es-CL')}
                        {producto.TipoProducto === 'peso' ? '/kg' : ''}
                      </div>
                      <div className="col-span-1 text-gray-900">
                        {stockNum}
                        {producto.TipoProducto === 'peso' ? ' kg' : ' unid.'}
                      </div>
                      <div className="col-span-2">
                        {estadoStock === 'sin-stock' && (
                          <div className="flex items-center gap-2 text-red-700">
                            <XCircle className="w-5 h-5" />
                            <span className="px-3 py-1 bg-red-100 rounded-full text-sm">
                              Sin Stock
                            </span>
                          </div>
                        )}
                        {estadoStock === 'critico' && (
                          <div className="flex items-center gap-2 text-orange-700">
                            <CircleAlert className="w-5 h-5" />
                            <span className="px-3 py-1 bg-orange-100 rounded-full text-sm">
                              Crítico
                            </span>
                          </div>
                        )}
                        {estadoStock === 'bajo' && (
                          <div className="flex items-center gap-2 text-yellow-700">
                            <CircleAlert className="w-5 h-5" />
                            <span className="px-3 py-1 bg-yellow-100 rounded-full text-sm">
                              Bajo
                            </span>
                          </div>
                        )}
                        {estadoStock === 'en-stock' && (
                          <div className="flex items-center gap-2 text-green-700">
                            <CircleCheck className="w-5 h-5" />
                            <span className="px-3 py-1 bg-green-100 rounded-full text-sm">
                              En Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="col-span-1 flex justify-center gap-2">
                        <ModificarProductoComponent
                          producto={producto}
                          setRefrescarProductos={setRefreshProductos}
                        />
                        <EliminarProductoComponent
                          producto={producto}
                          setRefrescarProductos={setRefreshProductos}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Paginación */}
        {productosFiltrados.length > 0 && (
          <div className="mt-4 flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-gray-600">
              Mostrando {indiceInicio + 1} - {Math.min(indiceFin, productosFiltrados.length)} de {productosFiltrados.length} productos
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
    </div>
  );
}

export default GestionarProductos;