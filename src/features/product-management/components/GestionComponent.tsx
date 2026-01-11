
import React, { useState } from "react";
import '@/assets/styles/component-main-style/gestion-component-style.css'
import GestionarProductosModals from "./gestion-main-modals/GestionarProductosAbrirMainComponentModals"
import AgregarProductoModals from "./gestion-productos-modals/agregar-productos/AgregarProductoModals"
import RegistrosYMovimientosModals from "./gestion-productos-modals/registros-y-movimientos/RegistrosYMovimientosModals"
import HistorialDeVentasGestion from "./historial-de-ventas-gestion/HistorialDeVentasGestion"
import HistorialDeVentasGesitonModals from "./gestion-productos-modals/historial-de-ventas-gestion-modals/HistorialDeVentasGestionModals"
import { PackagePlus, ClipboardList, PackageSearch, History, ShoppingCart } from 'lucide-react';

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
      id: 'gestor-ventas',
      label: 'Gestor de Ventas',
      icon: <ShoppingCart className="w-6 h-6" />,
      description: 'Administra y registra las ventas'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold text-gray-900 mb-2">Menú de Gestión</h1>
        <p className="text-gray-600">Selecciona una opción para continuar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuSelect(item.id)}
            className="group bg-white rounded-2xl shadow-sm p-6 flex flex-col items-start text-left transition border border-gray-200 hover:border-blue-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <div className="inline-flex items-center justify-center bg-blue-50 p-3 rounded-md mb-4 group-hover:bg-blue-600 transition-colors">
              <div className="text-blue-600 group-hover:text-white transition-colors">
                {item.icon}
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{item.label}</h2>
            <p className="text-sm text-gray-500">{item.description}</p>
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

  const resetAll = () => {
    setOpenManagerAgregarProducto(false)
    setOpenManagerRegistrosYMovimientos(false)
    setOpenManagerGestionarProductos(false)
    setOpenManagerHistorialDeVentasGestion(false)
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
      case 'gestor-ventas':
        setOpenManagerHistorialDeVentasGestion(true)
        setOpenManagerAgregarProducto(false)
        setOpenManagerRegistrosYMovimientos(false)
        setOpenManagerGestionarProductos(false)
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
      <HistorialDeVentasGesitonModals
        OpenManager={OpenManagerHistorialDeVentasGestion}
        setOpenManager={() => setOpenManagerHistorialDeVentasGestion(false)}
        OpenManagerSetter={OpenManagerGestionComponent}
        SetOpenManagerGestionComponentSetter={setOpenManagerGestionComponent}
      />
    )
  }

  return null
}

export default GestionComponent;