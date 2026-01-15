/**
 * EJEMPLO COMPLETO: Componente con Offline-First Totalmente Integrado
 * Este archivo muestra cómo integrar correctamente el sistema offline
 * en un componente real de productos
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useOfflineSync, useSyncStatus } from '@/core/infrastructure/offline';
import { CompactConnectionIndicator, SyncStatusPanel } from '@/shared/components/SyncStatusPanel';
import { obtenerProductosPromise, registrarProductoPromise } from '@/core/infrastructure/firebase/Promesas';

interface Producto {
  id?: string;
  NombreProducto: string;
  Precio: number;
  Stock: number;
  Categoria?: string;
}

/**
 * Componente de gestión de productos con soporte offline completo
 */
export function ProductosOfflineComponent() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState<Producto>({
    NombreProducto: '',
    Precio: 0,
    Stock: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Hooks offline
  const { saveProduct, getProducts, isOnline } = useOfflineSync();
  const syncStatus = useSyncStatus();

  // Cargar productos al montar
  useEffect(() => {
    cargarProductos();
  }, []);

  // Auto-cargar cuando cambia el estado de sincronización
  useEffect(() => {
    if (!syncStatus.isSyncing && syncStatus.pendingCount === 0) {
      cargarProductos();
    }
  }, [syncStatus.isSyncing, syncStatus.pendingCount]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      // getProducts combina Firebase + datos offline
      const datos = await getProducts(obtenerProductosPromise);
      setProductos(datos || []);
      mostrarMensaje('Productos cargados', 'success');
    } catch (error) {
      console.error('Error cargando productos:', error);
      mostrarMensaje('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const guardarNuevoProducto = async () => {
    if (!nuevoProducto.NombreProducto || nuevoProducto.Precio <= 0) {
      mostrarMensaje('Por favor completa todos los campos', 'error');
      return;
    }

    try {
      setLoading(true);

      // Usar saveProduct con la función promise de Firebase
      const resultado = await saveProduct(nuevoProducto, registrarProductoPromise);

      if (resultado.offline) {
        mostrarMensaje('✓ Producto guardado localmente. Se sincronizará cuando haya conexión.', 'info');
      } else {
        mostrarMensaje('✓ Producto guardado en el servidor', 'success');
      }

      // Limpiar formulario
      setNuevoProducto({ NombreProducto: '', Precio: 0, Stock: 0 });

      // Recargar lista
      await cargarProductos();
    } catch (error) {
      console.error('Error guardando producto:', error);
      mostrarMensaje('Error al guardar el producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto: string, tipo: 'success' | 'error' | 'info') => {
    setMessage({ type: tipo, text: texto });
    setTimeout(() => setMessage(null), 3000);
  };

  const getBgColor = (tipo: 'success' | 'error' | 'info') => {
    switch (tipo) {
      case 'success':
        return '#d1fae5';
      case 'error':
        return '#fee2e2';
      case 'info':
        return '#dbeafe';
      default:
        return '#f3f4f6';
    }
  };

  const getBorderColor = (tipo: 'success' | 'error' | 'info') => {
    switch (tipo) {
      case 'success':
        return '#6ee7b7';
      case 'error':
        return '#fca5a5';
      case 'info':
        return '#93c5fd';
      default:
        return '#d1d5db';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Indicador de conexión compacto */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Gestión de Productos</h1>
        <CompactConnectionIndicator hideWhenOnline={false} />
      </div>

      {/* Panel flotante de sincronización */}
      <SyncStatusPanel position="floating" />

      {/* Mostrar mensaje si hay */}
      {message && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            backgroundColor: getBgColor(message.type),
            border: `2px solid ${getBorderColor(message.type)}`,
            borderRadius: '6px',
            color: message.type === 'error' ? '#991b1b' : '#065f46',
            fontWeight: '500',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Formulario para agregar producto */}
      <div
        style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Agregar Nuevo Producto</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Nombre del producto"
            value={nuevoProducto.NombreProducto}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, NombreProducto: e.target.value })}
            style={{
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <input
            type="number"
            placeholder="Precio"
            value={nuevoProducto.Precio}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, Precio: parseFloat(e.target.value) })}
            style={{
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <input
            type="number"
            placeholder="Stock"
            value={nuevoProducto.Stock}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, Stock: parseInt(e.target.value) })}
            style={{
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
          <input
            type="text"
            placeholder="Categoría (opcional)"
            value={nuevoProducto.Categoria || ''}
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, Categoria: e.target.value })}
            style={{
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        <button
          onClick={guardarNuevoProducto}
          disabled={loading || syncStatus.isSyncing}
          style={{
            padding: '10px 20px',
            backgroundColor: isOnline ? '#3b82f6' : '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Guardando...' : 'Guardar Producto'}
        </button>

        {!isOnline && (
          <p style={{ marginTop: '10px', color: '#f59e0b', fontSize: '12px' }}>
            📡 Sin conexión - El producto se guardará localmente
          </p>
        )}
      </div>

      {/* Estadísticas de sincronización */}
      <div
        style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Estado de Sincronización</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px' }}>
          <div>
            <strong>Conexión:</strong> {syncStatus.isOnline ? '✅ En línea' : '📡 Sin conexión'}
          </div>
          <div>
            <strong>Estado:</strong> {syncStatus.isSyncing ? '🔄 Sincronizando...' : '✓ Sincronizado'}
          </div>
          <div>
            <strong>Pendientes:</strong> {syncStatus.pendingCount} operaciones
          </div>
          {syncStatus.lastSyncTime && (
            <div>
              <strong>Última sincronización:</strong> {syncStatus.lastSyncTime.toLocaleTimeString()}
            </div>
          )}
        </div>
        {syncStatus.pendingCount > 0 && (
          <button
            onClick={syncStatus.clearQueue}
            style={{
              marginTop: '10px',
              padding: '8px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Limpiar Cola ({syncStatus.pendingCount})
          </button>
        )}
      </div>

      {/* Lista de productos */}
      <div>
        <h2>Productos ({productos.length})</h2>

        {loading && !productos.length ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>No hay productos registrados</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {productos.map((producto) => (
              <div
                key={producto.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
              >
                <h3 style={{ marginTop: 0 }}>{producto.NombreProducto}</h3>
                <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                  <strong>Precio:</strong> ${producto.Precio}
                </p>
                <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                  <strong>Stock:</strong> {producto.Stock} unidades
                </p>
                {producto.Categoria && (
                  <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                    <strong>Categoría:</strong> {producto.Categoria}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductosOfflineComponent;
