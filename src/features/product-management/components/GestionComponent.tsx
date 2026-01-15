
import React, { useState } from "react";
import '@/assets/styles/component-main-style/gestion-component-style.css'
import GestionarProductosModals from "./gestion-main-modals/GestionarProductosAbrirMainComponentModals"
import AgregarProductoModals from "./gestion-productos-modals/agregar-productos/AgregarProductoModals"
import RegistrosYMovimientosModals from "./gestion-productos-modals/registros-y-movimientos/RegistrosYMovimientosModals"
import HistorialDeVentasGestion from "./historial-de-ventas-gestion/HistorialDeVentasGestion"
import HistorialDeVentasGesitonModals from "./gestion-productos-modals/historial-de-ventas-gestion-modals/HistorialDeVentasGestionModals"
import { Reportes } from "./reportes-ganancias/ReportesGananciasModals"
import { Alertas } from "./alertas/AlertasModals"
import { PackagePlus, ClipboardList, PackageSearch, History, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface MenuGestionProps {
  onMenuSelect: (menuId: string) => void;
}

export function MenuGestion({ onMenuSelect }: MenuGestionProps) {
  const menuItems: MenuItem[] = [
    {
      id: 'agregar-producto',
      label: 'Agregar Producto',
      icon: <PackagePlus className="w-6 h-6" />,
      description: 'Registra un nuevo producto al inventario'
    },
    {
      id: 'registro-movimientos',
      label: 'Registro y Movimientos',
      icon: <ClipboardList className="w-6 h-6" />,
      description: 'Historial completo de todas las acciones realizadas en el programa'
    },
    {
      id: 'gestionar-productos',
      label: 'Gestionar Productos',
      icon: <PackageSearch className="w-6 h-6" />,
      description: 'Edita, elimina, y repone stock de productos existentes'
    },
    {
      id: 'historial',
      label: 'Historial de venta avanzado',
      icon: <History className="w-6 h-6" />,
      description: 'Revisa el historial completo de todas las ventas del negocio realizadas'
    },
    {
      id: 'reportes-ganancias',
      label: 'Reportes de ganancias',
      icon: <TrendingUp className="w-6 h-6" />,
      description: 'Visualiza y analiza los reportes de ganancias del negocio'
    },
    {
      id: 'alertas',
      label: 'Alertas',
      icon: <AlertTriangle className="w-6 h-6" />,
      description: 'Revisa alertas importantes del sistema como indicadores de stock y desfases'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      <div className="mb-10 flex items-start">
        <div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-1">Menú de Gestión</h1>
          <p className="text-gray-600">Selecciona una opción para continuar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuSelect(item.id)}
            className="group relative overflow-hidden bg-white/95 backdrop-blur rounded-[20px] border border-gray-200 shadow-md p-6 flex flex-col text-left transition transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition" />
            <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-3 rounded-[16px] mb-4 text-blue-600 group-hover:text-white group-hover:from-blue-500 group-hover:via-indigo-500 group-hover:to-emerald-400 transition-all">
              {item.icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{item.label}</h2>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{item.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export const GestionComponent = () => {

  const [OpenManagerGestionComponent, setOpenManagerGestionComponent] = useState(true)

  const [OpenManagerAgregarProducto, setOpenManagerAgregarProducto] = useState(false)

  const [OpenManagerRegistrosYMovimientos, setOpenManagerRegistrosYMovimientos] = useState(false)

  const [OpenManagerGestionarProductos, setOpenManagerGestionarProductos] = useState(false)

  const [OpenManagerHistorialDeVentasGestion, setOpenManagerHistorialDeVentasGestion] = useState(false)

  const [OpenManagerReportesGanancias, setOpenManagerReportesGanancias] = useState(false)

  const [OpenManagerAlertas, setOpenManagerAlertas] = useState(false)

  const [ventaIdParaSeleccionar, setVentaIdParaSeleccionar] = useState<string | null>(null)

  const resetAll = () => {
    setOpenManagerAgregarProducto(false)
    setOpenManagerRegistrosYMovimientos(false)
    setOpenManagerGestionarProductos(false)
    setOpenManagerHistorialDeVentasGestion(false)
    setOpenManagerReportesGanancias(false)
    setOpenManagerAlertas(false)
    setOpenManagerGestionComponent(true)
  }

  const handleMenuSelect = (menuId: string) => {
    // Close main view
    setOpenManagerGestionComponent(false)
    // Open selected
    switch (menuId) {
      case 'agregar-producto':
        setOpenManagerAgregarProducto(true)
        setOpenManagerRegistrosYMovimientos(false)
        setOpenManagerGestionarProductos(false)
        setOpenManagerHistorialDeVentasGestion(false)
        break
      case 'registro-movimientos':
        setOpenManagerRegistrosYMovimientos(true)
        setOpenManagerAgregarProducto(false)
        setOpenManagerGestionarProductos(false)
        setOpenManagerHistorialDeVentasGestion(false)
        break
      case 'gestionar-productos':
        setOpenManagerGestionarProductos(true)
        setOpenManagerAgregarProducto(false)
        setOpenManagerRegistrosYMovimientos(false)
        setOpenManagerHistorialDeVentasGestion(false)
        break
      case 'historial':
        setOpenManagerHistorialDeVentasGestion(true)
        setOpenManagerAgregarProducto(false)
        setOpenManagerRegistrosYMovimientos(false)
        setOpenManagerGestionarProductos(false)
        setOpenManagerReportesGanancias(false)
        break
      case 'reportes-ganancias':
        setOpenManagerReportesGanancias(true)
        setOpenManagerAgregarProducto(false)
        setOpenManagerRegistrosYMovimientos(false)
        setOpenManagerGestionarProductos(false)
        setOpenManagerHistorialDeVentasGestion(false)
        setOpenManagerAlertas(false)
        break
      case 'alertas':
        setOpenManagerAlertas(true)
        setOpenManagerAgregarProducto(false)
        setOpenManagerRegistrosYMovimientos(false)
        setOpenManagerGestionarProductos(false)
        setOpenManagerHistorialDeVentasGestion(false)
        setOpenManagerReportesGanancias(false)
        break
      default:
        resetAll()
    }
  }

  if (OpenManagerGestionComponent) {
    return (
      <div className="gestion-component-style">
        <MenuGestion onMenuSelect={handleMenuSelect} />
      </div>
    )
  }

  if (OpenManagerAgregarProducto) {
    return (
      <AgregarProductoModals
        OpenManager={OpenManagerAgregarProducto}
        setOpenManager={() => setOpenManagerAgregarProducto(false)}
        OpenManagerSetter={OpenManagerGestionComponent}
        SetOpenManagerGestionComponentSetter={setOpenManagerGestionComponent}
      />
    )
  }

  if (OpenManagerRegistrosYMovimientos) {
    return (
      <RegistrosYMovimientosModals
        OpenManager={OpenManagerRegistrosYMovimientos}
        setOpenManager={() => setOpenManagerRegistrosYMovimientos(false)}
        OpenManagerSetter={OpenManagerGestionComponent}
        SetOpenManagerGestionComponentSetter={setOpenManagerGestionComponent}
      />
    )
  }

  if (OpenManagerGestionarProductos) {
    return (
      <GestionarProductosModals
        OpenManager={OpenManagerGestionarProductos}
        setOpenManager={() => setOpenManagerGestionarProductos(false)}
        OpenManagerSetter={OpenManagerGestionComponent}
        SetOpenManagerGestionComponentSetter={setOpenManagerGestionComponent}
      />
    )
  }

  if (OpenManagerHistorialDeVentasGestion) {
    return (
      <HistorialDeVentasGestion
        ventaIdParaSeleccionar={ventaIdParaSeleccionar}
        onClose={() => {
          setOpenManagerHistorialDeVentasGestion(false)
          setOpenManagerGestionComponent(true)
          setVentaIdParaSeleccionar(null)
        }}
      />
    )
  }

  if (OpenManagerReportesGanancias) {
    return (
      <Reportes
        onClose={() => {
          setOpenManagerReportesGanancias(false)
          setOpenManagerGestionComponent(true)
        }}
        onAbrirHistorial={(ventaId) => {
          setVentaIdParaSeleccionar(ventaId)
          setOpenManagerReportesGanancias(false)
          setOpenManagerHistorialDeVentasGestion(true)
        }}
      />
    )
  }

  if (OpenManagerAlertas) {
    return (
      <Alertas
        onClose={() => {
          setOpenManagerAlertas(false)
          setOpenManagerGestionComponent(true)
        }}
      />
    )
  }

  return null
}

export default GestionComponent;