import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, XCircle, ChevronDown, ArrowLeft, HelpCircle, AlertTriangle } from 'lucide-react';
import { obtenerProductosPromiseUpdate } from '@/core/infrastructure/firebase';
import { ProductoConIDInterface } from '@/core/domain/entities';
import '@/assets/styles/gestion-productos-styles/crud-style/crud-style.css';

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

export function VerStock({ onVolver }: { onVolver?: () => void }) {
  const [productos, setProductos] = useState<ProductoConIDInterface[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoStock | 'todos'>('todos');
  const [ordenPrecio, setOrdenPrecio] = useState<'asc' | 'desc' | null>(null);
  const [ordenStock, setOrdenStock] = useState<'asc' | 'desc' | null>(null);
  const [acordeonAbierto, setAcordeonAbierto] = useState<'precio' | 'stock' | null>(null);
  const [refreshProductos, setRefreshProductos] = useState(false);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  
  // Estados para reportar desfase
  const [modalDesfase, setModalDesfase] = useState(false);
  const [productoDesfase, setProductoDesfase] = useState<ProductoConIDInterface | null>(null);
  const [stockReal, setStockReal] = useState('');
  const [anotacionDesfase, setAnotacionDesfase] = useState('');
  const [enviandoDesfase, setEnviandoDesfase] = useState(false);

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

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && paginaActual > 1) {
        irAPagina(paginaActual - 1);
      } else if (e.key === 'ArrowRight' && paginaActual < totalPaginas) {
        irAPagina(paginaActual + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paginaActual, totalPaginas]);

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

  const abrirModalDesfase = (producto: ProductoConIDInterface) => {
    setProductoDesfase(producto);
    setStockReal('');
    setAnotacionDesfase('');
    setModalDesfase(true);
  };

  const cerrarModalDesfase = () => {
    setModalDesfase(false);
    setProductoDesfase(null);
    setStockReal('');
    setAnotacionDesfase('');
  };

  const confirmarReporteDesfase = async () => {
    if (!productoDesfase || stockReal === '') return;

    setEnviandoDesfase(true);
    try {
      // TODO: Crear la promesa reportarDesfasePromise en Firebase
      // await reportarDesfasePromise({
      //   idProducto: productoDesfase.id,
      //   nombreProducto: productoDesfase.NombreProducto,
      //   codigoBarras: productoDesfase.CodigoDeBarras,
      //   stockSistema: Number(productoDesfase.Stock),
      //   stockReal: Number(stockReal),
      //   diferencia: Number(stockReal) - Number(productoDesfase.Stock),
      //   anotacion: anotacionDesfase,
      //   fecha: new Date().toISOString(),
      //   estado: 'pendiente' // pendiente, revisado, resuelto
      // });
      
      console.log('Reporte de desfase:', {
        producto: productoDesfase.NombreProducto,
        stockSistema: productoDesfase.Stock,
        stockReal: stockReal,
        anotacion: anotacionDesfase
      });
      
      alert('Desfase reportado exitosamente. El propietario lo revisará pronto.');
      cerrarModalDesfase();
    } catch (error) {
      console.error('Error al reportar desfase:', error);
      alert('Error al reportar el desfase. Intenta nuevamente.');
    } finally {
      setEnviandoDesfase(false);
    }
  };

  return (
    <div className="w-full flex justify-center -mt-4 pb-8 px-4">
      <div className="w-full max-w-[90%] bg-white rounded-lg shadow-lg p-8 flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl text-gray-900 mb-2">Ver Stock y Precios</h1>
            <p className="text-gray-600">Consulta el inventario y precios de productos del minimarket</p>
          </div>
          <div className="flex items-center gap-2">
            {onVolver && (
              <button
                onClick={onVolver}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver al menú
              </button>
            )}
            <button
              onClick={() => setMostrarAyuda(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
              title="Ayuda"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
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
                  setFiltroEstado('todos');
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
                setBusqueda('');
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
                setBusqueda('');
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
                setBusqueda('');
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
                setBusqueda('');
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
                setBusqueda('');
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
            <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
              <div className="col-span-3">NOMBRE</div>
              <div className="col-span-2">CÓDIGO</div>
              <div className="col-span-2">TIPO</div>
              <div className="col-span-2">PRECIO</div>
              <div className="col-span-1">STOCK</div>
              <div className="col-span-1">ESTADO</div>
              <div className="col-span-1">REPORTAR</div>
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
                    className="border-b border-gray-200 last:border-b-0 px-6 py-3 hover:bg-gray-50 transition"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3 text-gray-900 font-medium truncate">{producto.NombreProducto}</div>
                      <div className="col-span-2 text-gray-900 text-sm font-mono font-semibold">
                        {producto.CodigoDeBarras}
                      </div>
                      <div className="col-span-2">
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
                        <span className="whitespace-nowrap">
                          {stockNum}
                          {producto.TipoProducto === 'peso' ? ' kg' : ' unid.'}
                        </span>
                      </div>
                      <div className="col-span-1">
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
                      <div className="col-span-1">
                        <button
                          onClick={() => abrirModalDesfase(producto)}
                          className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                          title="Reportar desfase de stock"
                        >
                          <AlertTriangle className="w-5 h-5" />
                        </button>
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
                {(() => {
                  const MAX_PAGINAS = 10;
                  let inicio = Math.max(1, paginaActual - Math.floor(MAX_PAGINAS / 2));
                  let fin = Math.min(totalPaginas, inicio + MAX_PAGINAS - 1);
                  
                  // Ajustar inicio si estamos cerca del final
                  if (fin - inicio + 1 < MAX_PAGINAS) {
                    inicio = Math.max(1, fin - MAX_PAGINAS + 1);
                  }
                  
                  const paginasAMostrar = Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
                  
                  return paginasAMostrar.map((pagina) => (
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
                  ));
                })()}
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

      {mostrarAyuda && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Ayuda - Atajos y Funciones
              </h2>
              <button
                onClick={() => setMostrarAyuda(false)}
                className="text-gray-400 hover:text-gray-600 transition"
                aria-label="Cerrar"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Atajos de Teclado */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Atajos de Teclado</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-800 text-white rounded flex items-center justify-center text-sm font-medium">
                        ←
                      </div>
                      <span className="text-sm text-gray-700">Izquierda</span>
                    </div>
                    <span className="text-sm text-gray-600 text-right flex-1 ml-4">
                      Va a la página anterior del historial.
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-800 text-white rounded flex items-center justify-center text-sm font-medium">
                        →
                      </div>
                      <span className="text-sm text-gray-700">Derecha</span>
                    </div>
                    <span className="text-sm text-gray-600 text-right flex-1 ml-4">
                      Va a la página siguiente del historial.
                    </span>
                  </div>
                </div>
              </section>

              {/* Consulta de Stock y Precios */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Consulta de Stock y Precios</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Visualización de Productos</h4>
                    <p className="text-sm text-gray-600">
                      Este módulo te permite consultar el inventario actual de productos. 
                      Puedes ver el nombre, código de barras, tipo, precio unitario, cantidad en stock y estado de disponibilidad de cada producto.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Estados de Stock</h4>
                    <p className="text-sm text-gray-600">
                      Los productos se clasifican según su disponibilidad: <strong>Sin Stock</strong> (0 unidades), 
                      <strong>Crítico</strong> (1 unidad), <strong>Bajo</strong> (2-5 unidades), y <strong>En Stock</strong> (más de 6 unidades).
                    </p>
                  </div>
                </div>
              </section>

              {/* Filtros */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Filtros</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Búsqueda de Productos</h4>
                    <p className="text-sm text-gray-600">
                      Busca productos por nombre o código de barras en tiempo real. Los resultados se filtran automáticamente.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Ordenar por Precio</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Mayor a menor:</strong> Ordena productos del precio más alto al más bajo. <strong>Menor a mayor:</strong> Ordena del precio más bajo al más alto.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Ordenar por Stock</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Mayor a menor:</strong> Muestra productos con más stock primero. <strong>Menor a mayor:</strong> Muestra productos con menos stock primero.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Estado de Stock</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Todos:</strong> Ver todos los productos. <strong>Sin Stock:</strong> Productos sin unidades disponibles. <strong>Crítico:</strong> 1 unidad. <strong>Bajo:</strong> 2-5 unidades. <strong>En Stock:</strong> Más de 6 unidades.
                    </p>
                  </div>
                </div>
              </section>

              {/* Información General */}
              <section>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Información General</h3>
                <p className="text-sm text-gray-600">
                  Este módulo permite consultar el inventario de productos del minimarket. 
                  Puedes buscar productos, filtrar por estado de stock, y ordenar por precio o cantidad disponible. 
                  Los productos se clasifican por tipo (unidad o peso) y se muestran indicadores visuales 
                  para identificar rápidamente el estado del inventario.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setMostrarAyuda(false)}
                className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reportar Desfase */}
      {modalDesfase && productoDesfase && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Reportar Desfase de Stock
                </h2>
              </div>
              <button
                onClick={cerrarModalDesfase}
                disabled={enviandoDesfase}
                className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                aria-label="Cerrar"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Información del Producto */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm font-semibold text-gray-700">Producto:</span>
                  <p className="text-gray-900">{productoDesfase.NombreProducto}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700">Código:</span>
                  <p className="text-gray-900 font-mono">{productoDesfase.CodigoDeBarras}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700">Stock en Sistema:</span>
                  <p className="text-gray-900">
                    {productoDesfase.Stock} {productoDesfase.TipoProducto === 'peso' ? 'kg' : 'unidades'}
                  </p>
                </div>
              </div>

              {/* Stock Real */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Real (físico) *
                </label>
                <input
                  type="number"
                  value={stockReal}
                  onChange={(e) => setStockReal(e.target.value)}
                  disabled={enviandoDesfase}
                  min="0"
                  step={productoDesfase.TipoProducto === 'peso' ? '0.1' : '1'}
                  placeholder={`Cantidad real en ${productoDesfase.TipoProducto === 'peso' ? 'kg' : 'unidades'}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
                />
              </div>

              {/* Anotación */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Anotación (opcional)
                </label>
                <textarea
                  value={anotacionDesfase}
                  onChange={(e) => setAnotacionDesfase(e.target.value)}
                  disabled={enviandoDesfase}
                  placeholder="Describe la situación encontrada..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100 resize-none"
                />
              </div>

              {/* Advertencia */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> Este reporte será enviado al propietario para su revisión. 
                  El stock del sistema se actualizará una vez que el propietario lo verifique.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
              <button
                onClick={cerrarModalDesfase}
                disabled={enviandoDesfase}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarReporteDesfase}
                disabled={enviandoDesfase || stockReal === ''}
                className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {enviandoDesfase ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Reportar Desfase'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default VerStock;