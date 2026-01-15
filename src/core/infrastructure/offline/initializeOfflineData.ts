'use client';

/**
 * Inicializar datos offline desde Firebase cuando la app carga
 * Se ejecuta solo una vez, cuando hay conexión disponible
 */

import {
  obtenerProductosPromise,
  obtenerVentasPromise,
} from '../firebase';
import {
  saveProductOffline,
  saveSaleOffline,
} from './offlineSync';

const INIT_FLAG_KEY = 'OFFLINE_DATA_INITIALIZED';

/**
 * Precarga datos de Firebase en IndexedDB la primera vez que hay conexión
 */
export const initializeOfflineDataOnce = async () => {
  try {
    // Verificar si ya se inicializó
    const isInitialized = localStorage.getItem(INIT_FLAG_KEY);
    if (isInitialized === 'true') {
      console.log('✅ Offline data already initialized');
      return;
    }

    // Verificar conexión
    if (!navigator.onLine) {
      console.warn('📡 No internet connection, skipping offline data initialization');
      return;
    }

    console.log('🔄 Initializing offline data from Firebase...');

    // Precargar productos
    try {
      const productos = await obtenerProductosPromise();
      if (productos && productos.length > 0) {
        for (const producto of productos) {
          if (producto && producto.id) {
            await saveProductOffline(producto, true);
          }
        }
        console.log('✅ Cached ' + productos.length + ' products offline');
      }
    } catch (error) {
      console.warn('⚠️ Error caching products:', error);
    }

    // Precargar ventas
    try {
      const ventas = await obtenerVentasPromise();
      if (ventas && ventas.length > 0) {
        for (const venta of ventas) {
          if (venta && venta.id) {
            await saveSaleOffline(venta, true);
          }
        }
        console.log('✅ Cached ' + ventas.length + ' sales offline');
      }
    } catch (error) {
      console.warn('⚠️ Error caching sales:', error);
    }

    // Marcar como inicializado
    localStorage.setItem(INIT_FLAG_KEY, 'true');
    console.log('💾 Offline data initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing offline data:', error);
  }
};

/**
 * Hook para ejecutar la inicialización en componentes
 */
export const useInitializeOfflineData = () => {
  // Solo ejecutar en cliente
  if (typeof window === 'undefined') return;

  if (navigator.onLine) {
    initializeOfflineDataOnce();
  }
};

/**
 * Limpiar bandera de inicialización (para desarrollo/testing)
 */
export const resetOfflineInitialization = () => {
  localStorage.removeItem(INIT_FLAG_KEY);
  console.log('🔄 Offline initialization flag reset');
};
