import { ShoppingCart, Package, History, LayoutGrid } from 'lucide-react';
import { SidebarInterfaceProps } from "@/shared/types";
import { useEffect, useState } from 'react';
import { obtenerVentasPromise, obtenerProductosPromise } from '@/core/infrastructure/firebase';

export const InicioComponent = ({
  setOpenManagerInicio,
  setOpenManagerVenta,
  setOpenManagerVerStock,
  setOpenManagerHistorialDeVenta,
  setOpenManagerGestion
}: SidebarInterfaceProps) => {
  const [ventasHoy, setVentasHoy] = useState(0);
  const [totalProductos, setTotalProductos] = useState(0);
  
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  useEffect(() => {
    // Obtener ventas de hoy
    const cargarEstadisticas = async () => {
      try {
        // Obtener ventas
        const ventas = await obtenerVentasPromise();
        
        // Fecha actual en formato dd-mm-yyyy
        const hoy = new Date();
        const fechaActual = `${String(hoy.getDate()).padStart(2, '0')}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${hoy.getFullYear()}`;
        
        // Filtrar ventas del día
        const ventasDelDia = ventas.filter((venta: any) => {
          // Manejar diferentes formatos de fechaHora
          let fechaVenta = '';
          
          if (venta.fechaHora) {
            // Si es Timestamp de Firestore
            if (typeof venta.fechaHora === 'object' && 'toDate' in venta.fechaHora) {
              const date = venta.fechaHora.toDate();
              fechaVenta = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
            }
            // Si es string
            else if (typeof venta.fechaHora === 'string') {
              fechaVenta = venta.fechaHora.split(',')[0].replace(/\//g, '-');
            }
          }
          
          return fechaVenta === fechaActual;
        });
        
        setVentasHoy(ventasDelDia.length);
        
        // Obtener productos
        const productos = await obtenerProductosPromise();
        const productosConStock = productos.filter((prod: any) => (prod.Stock || 0) >= 1).length;
        setTotalProductos(productosConStock);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };
    
    cargarEstadisticas();
  }, []);

  const accesosRapidos = [
    {
      id: 'realizar-venta',
      titulo: 'Realizar Venta',
      descripcion: 'Iniciar una nueva venta',
      icono: ShoppingCart,
      color: 'bg-blue-600 hover:bg-blue-700',
      colorIcono: 'bg-blue-100',
      colorTextoIcono: 'text-blue-600',
      onClick: () => {
        setOpenManagerInicio(false);
        setOpenManagerVenta(true);
        setOpenManagerVerStock(false);
        setOpenManagerHistorialDeVenta(false);
        setOpenManagerGestion(false);
      }
    },
    {
      id: 'ver-stock',
      titulo: 'Ver Stock',
      descripcion: 'Consultar inventario disponible',
      icono: Package,
      color: 'bg-green-600 hover:bg-green-700',
      colorIcono: 'bg-green-100',
      colorTextoIcono: 'text-green-600',
      onClick: () => {
        setOpenManagerInicio(false);
        setOpenManagerVenta(false);
        setOpenManagerVerStock(true);
        setOpenManagerHistorialDeVenta(false);
        setOpenManagerGestion(false);
      }
    },
    {
      id: 'historial-ventas',
      titulo: 'Historial de Ventas',
      descripcion: 'Ver registro de transacciones',
      icono: History,
      color: 'bg-purple-600 hover:bg-purple-700',
      colorIcono: 'bg-purple-100',
      colorTextoIcono: 'text-purple-600',
      onClick: () => {
        setOpenManagerInicio(false);
        setOpenManagerVenta(false);
        setOpenManagerVerStock(false);
        setOpenManagerHistorialDeVenta(true);
        setOpenManagerGestion(false);
      }
    },
    {
      id: 'menu-gestion',
      titulo: 'Menú de Gestión',
      descripcion: 'Acceso a todas las opciones',
      icono: LayoutGrid,
      color: 'bg-gray-600 hover:bg-gray-700',
      colorIcono: 'bg-gray-100',
      colorTextoIcono: 'text-gray-600',
      onClick: () => {
        setOpenManagerInicio(false);
        setOpenManagerVenta(false);
        setOpenManagerVerStock(false);
        setOpenManagerHistorialDeVenta(false);
        setOpenManagerGestion(true);
      }
    }
  ];

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center">
      <div className="fixed inset-0 bg-linear-to-br from-gray-50 to-gray-100 -z-10" />

      <div className="w-full max-w-6xl px-6 py-6 md:py-10 flex flex-col items-center justify-center gap-10 mt-[-150px]">
        {/* Header de bienvenida */}
        <div className="text-center">
          <h1 className="text-5xl text-gray-900 mb-3">
            Bienvenido al Sistema de Gestión
          </h1>
          <h1 className="text-5xl text-gray-900 mb-3">
            Los Hermanos Hortiz
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Panel de Control de Inventario y Ventas
          </p>
          <div className="flex items-center justify-center gap-4 text-gray-500">
            <span className="capitalize">{currentDate}</span>
            <span>•</span>
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="w-full flex flex-col items-center gap-6">
          <h2 className="text-2xl text-gray-900 text-center">Accesos Rápidos</h2>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {accesosRapidos.map((acceso) => {
              const Icono = acceso.icono;
              return (
                <button
                  key={acceso.id}
                  onClick={acceso.onClick}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-left border border-gray-200 hover:border-gray-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${acceso.colorIcono} p-4 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icono className={`w-8 h-8 ${acceso.colorTextoIcono}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl text-gray-900 mb-2">
                        {acceso.titulo}
                      </h3>
                      <p className="text-gray-600">
                        {acceso.descripcion}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center border border-gray-200">
            <p className="text-gray-600 mb-2">Ventas Realizadas Hoy</p>
            <p className="text-3xl text-blue-600 font-bold">{ventasHoy}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center border border-gray-200">
            <p className="text-gray-600 mb-2">Productos en Stock</p>
            <p className="text-3xl text-green-600 font-bold">{totalProductos}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InicioComponent;
