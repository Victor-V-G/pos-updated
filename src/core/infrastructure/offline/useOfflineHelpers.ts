'use client';

/**
 * Utilidad para integrar offline-first en componentes existentes
 * Proporciona funciones helper para facilitar la migración
 */

import { 
  guardarProductoOfflineFirst,
  guardarVentaOfflineFirst,
  obtenerProductosMerged,
  obtenerVentasMerged,
  useOfflineSync,
  useSyncStatus
} from '@/core/infrastructure/offline';
import { useOnlineStatus } from '@/core/infrastructure/offline';

/**
 * Hook para reemplazar obtenerProductosPromise
 * Automáticamente combina datos Firebase + offline
 */
export const useProductos = (firebaseFunction: any) => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { getProducts, isOnline } = useOfflineSync();

  const cargar = async () => {
    try {
      setLoading(true);
      const datos = await getProducts(firebaseFunction);
      setProductos(datos);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  return { productos, loading, cargar, isOnline, setProductos };
};

/**
 * Hook para reemplazar obtenerVentasPromise
 */
export const useVentas = (firebaseFunction: any) => {
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { getSales, isOnline } = useOfflineSync();

  const cargar = async () => {
    try {
      setLoading(true);
      const datos = await getSales(firebaseFunction);
      setVentas(datos);
    } catch (error) {
      console.error('Error cargando ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  return { ventas, loading, cargar, isOnline, setVentas };
};

/**
 * Hook para guardar con offline support
 */
export const useGuardarOffline = () => {
  const { saveProduct, saveSale, saveTransaction, isOnline } = useOfflineSync();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const guardar = async (tipo: 'producto' | 'venta' | 'transaccion', datos: any, firebaseFunc: any) => {
    try {
      setGuardando(true);
      setError(null);

      let resultado;
      switch (tipo) {
        case 'producto':
          resultado = await saveProduct(datos, firebaseFunc);
          break;
        case 'venta':
          resultado = await saveSale(datos, firebaseFunc);
          break;
        case 'transaccion':
          resultado = await saveTransaction(datos, firebaseFunc);
          break;
      }

      return {
        exito: true,
        offline: resultado.offline,
        mensaje: resultado.offline 
          ? '✓ Guardado localmente - Se sincronizará al conectarse'
          : '✓ Guardado en el servidor'
      };
    } catch (err) {
      setError(err as Error);
      return {
        exito: false,
        error: (err as Error).message,
        mensaje: '❌ Error al guardar'
      };
    } finally {
      setGuardando(false);
    }
  };

  return { guardar, guardando, error, isOnline };
};

/**
 * Hook para obtener estado de sincronización
 */
export const useEstadoSync = () => {
  const syncStatus = useSyncStatus();
  const isOnline = useOnlineStatus();

  return {
    estoyConectado: isOnline,
    estoySincronizando: syncStatus.isSyncing,
    operacionesPendientes: syncStatus.pendingCount,
    detallesOperaciones: syncStatus.pendingOperations,
    limpiarCola: syncStatus.clearQueue
  };
};

/**
 * Función helper para mostrar notificación
 */
export const mostrarNotificacionOffline = (resultado: any) => {
  if (resultado.offline) {
    return `✓ Guardado localmente - Se sincronizará cuando haya conexión`;
  }
  return `✓ Guardado en el servidor`;
};

// Importar React
import { useState } from 'react';
