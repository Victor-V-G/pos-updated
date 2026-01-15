/**
 * Wrapper para funciones de Firebase que soportan modo offline
 * Intenta conectarse a Firebase, y si falla, guarda en almacenamiento offline
 */

import { useOnlineStatus } from './useOnlineStatus';
import {
  saveProductOffline,
  saveSaleOffline,
  saveTransactionOffline,
  getProductsOffline,
  getSalesOffline,
  getTransactionsOffline,
} from './offlineSync';
import { saveToOfflineStorage, getFromOfflineStorage } from './offlineStorage';

/**
 * Wrapper para guardar producto
 * Intenta guardar en Firebase, y si no hay conexión, guarda localmente
 */
export const guardarProductoOfflineFirst = async (
  producto: any,
  firebaseFunction: (data: any) => Promise<any>
): Promise<{ success: boolean; offline: boolean }> => {
  const isOnline = navigator.onLine;

  try {
    if (isOnline) {
      // Intentar guardar en Firebase
      await firebaseFunction(producto);
      console.log('✅ Product saved to Firebase');
      return { success: true, offline: false };
    } else {
      // Sin conexión, guardar localmente
      await saveProductOffline(producto, false);
      return { success: true, offline: true };
    }
  } catch (error) {
    console.warn('⚠️ Firebase error, saving locally:', error);
    // Si Firebase falla, guardar localmente como fallback
    await saveProductOffline(producto, false);
    return { success: true, offline: true };
  }
};

/**
 * Wrapper para guardar venta
 */
export const guardarVentaOfflineFirst = async (
  venta: any,
  firebaseFunction: (data: any) => Promise<any>
): Promise<{ success: boolean; offline: boolean }> => {
  const isOnline = navigator.onLine;

  try {
    if (isOnline) {
      await firebaseFunction(venta);
      console.log('✅ Sale saved to Firebase');
      return { success: true, offline: false };
    } else {
      await saveSaleOffline(venta, false);
      return { success: true, offline: true };
    }
  } catch (error) {
    console.warn('⚠️ Firebase error, saving locally:', error);
    await saveSaleOffline(venta, false);
    return { success: true, offline: true };
  }
};

/**
 * Wrapper para guardar transacción
 */
export const guardarTransaccionOfflineFirst = async (
  transaccion: any,
  firebaseFunction: (data: any) => Promise<any>
): Promise<{ success: boolean; offline: boolean }> => {
  const isOnline = navigator.onLine;

  try {
    if (isOnline) {
      await firebaseFunction(transaccion);
      console.log('✅ Transaction saved to Firebase');
      return { success: true, offline: false };
    } else {
      await saveTransactionOffline(transaccion, false);
      return { success: true, offline: true };
    }
  } catch (error) {
    console.warn('⚠️ Firebase error, saving locally:', error);
    await saveTransactionOffline(transaccion, false);
    return { success: true, offline: true };
  }
};

/**
 * Wrapper para obtener productos
 * Combina datos de Firebase con datos offline Y guarda en IndexedDB
 */
export const obtenerProductosMerged = async (
  firebaseFunction: () => Promise<any[]>
): Promise<any[]> => {
  const isOnline = navigator.onLine;

  try {
    let firebaseProducts: any[] = [];
    
    if (isOnline) {
      try {
        firebaseProducts = await firebaseFunction();
        // 🔑 GUARDAR DATOS DE FIREBASE EN INDEXEDDB COMO CACHE
        if (firebaseProducts && firebaseProducts.length > 0) {
          // Reemplazar completamente el cache con datos frescos de Firebase
          await saveProductOffline({ __bulk: firebaseProducts }, true);
          console.log('💾 Firebase products cached offline:', firebaseProducts.length);
        }
      } catch (error) {
        console.warn('⚠️ Error fetching from Firebase, using cached offline data:', error);
        firebaseProducts = [];
      }
    }

    // Si tenemos datos de Firebase, usarlos directamente (son la fuente de verdad)
    if (firebaseProducts.length > 0) {
      // Obtener solo productos offline que NO estén sincronizados (pendientes de crear)
      const offlineProducts = await getProductsOffline();
      const unsyncedProducts = offlineProducts.filter(p => 
        p.id && p.id.startsWith('offline_') && !p.synced
      );
      
      console.log('📊 Firebase products:', firebaseProducts.length, '+ Unsynced offline:', unsyncedProducts.length);
      return [...firebaseProducts, ...unsyncedProducts];
    }

    // Si no hay conexión o Firebase falló, usar datos del cache offline
    const offlineProducts = await getProductsOffline();
    console.log('📊 Using cached products:', offlineProducts.length);
    return offlineProducts;
  } catch (error) {
    console.warn('⚠️ Error fetching products, using offline data:', error);
    return getProductsOffline();
  }
};

/**
 * Wrapper para obtener ventas
 * Combina datos de Firebase con datos offline Y guarda en IndexedDB
 */
export const obtenerVentasMerged = async (
  firebaseFunction: () => Promise<any[]>
): Promise<any[]> => {
  const isOnline = navigator.onLine;

  try {
    let firebaseSales: any[] = [];
    
    if (isOnline) {
      try {
        firebaseSales = await firebaseFunction();
        // 🔑 GUARDAR DATOS DE FIREBASE EN INDEXEDDB COMO CACHE
        if (firebaseSales && firebaseSales.length > 0) {
          // Reemplazar completamente el cache con datos frescos de Firebase
          await saveToOfflineStorage('SALES_CACHE', firebaseSales);
          console.log('💾 Firebase sales cached offline:', firebaseSales.length);
        }
      } catch (error) {
        console.warn('⚠️ Error fetching sales from Firebase, using cached offline data:', error);
        firebaseSales = [];
      }
    }

    // Si tenemos datos de Firebase, usarlos directamente
    if (firebaseSales.length > 0) {
      // Obtener solo ventas offline que NO estén sincronizadas
      const offlineSales = await getSalesOffline();
      const unsyncedSales = offlineSales.filter(s => 
        s.id && s.id.startsWith('offline_') && !s.synced
      );
      
      console.log('📊 Firebase sales:', firebaseSales.length, '+ Unsynced offline:', unsyncedSales.length);
      return [...firebaseSales, ...unsyncedSales];
    }

    // Si no hay conexión, intentar usar cache o datos offline
    const cachedSales = await getFromOfflineStorage('SALES_CACHE');
    if (cachedSales && cachedSales.length > 0) {
      console.log('📊 Using cached sales:', cachedSales.length);
      return cachedSales;
    }

    const offlineSales = await getSalesOffline();
    console.log('📊 Using offline sales:', offlineSales.length);
    return offlineSales;
  } catch (error) {
    console.warn('⚠️ Error fetching sales, using offline data:', error);
    return getSalesOffline();
  }
};

/**
 * Wrapper para obtener transacciones
 * Combina datos de Firebase con datos offline Y guarda en IndexedDB
 */
export const obtenerTransaccionesMerged = async (
  firebaseFunction: () => Promise<any[]>
): Promise<any[]> => {
  const isOnline = navigator.onLine;

  try {
    let firebaseTransactions: any[] = [];
    
    if (isOnline) {
      try {
        firebaseTransactions = await firebaseFunction();
        // 🔑 GUARDAR DATOS DE FIREBASE EN INDEXEDDB COMO CACHE
        if (firebaseTransactions && firebaseTransactions.length > 0) {
          // Reemplazar completamente el cache con datos frescos de Firebase
          await saveToOfflineStorage('TRANSACTIONS_CACHE', firebaseTransactions);
          console.log('💾 Firebase transactions cached offline:', firebaseTransactions.length);
        }
      } catch (error) {
        console.warn('⚠️ Error fetching transactions from Firebase, using cached offline data:', error);
        firebaseTransactions = [];
      }
    }

    // Si tenemos datos de Firebase, usarlos directamente
    if (firebaseTransactions.length > 0) {
      // Obtener solo transacciones offline que NO estén sincronizadas
      const offlineTransactions = await getTransactionsOffline();
      const unsyncedTransactions = offlineTransactions.filter(t => 
        t.id && t.id.startsWith('offline_') && !t.synced
      );
      
      console.log('📊 Firebase transactions:', firebaseTransactions.length, '+ Unsynced offline:', unsyncedTransactions.length);
      return [...firebaseTransactions, ...unsyncedTransactions];
    }

    // Si no hay conexión, intentar usar cache o datos offline
    const cachedTransactions = await getFromOfflineStorage('TRANSACTIONS_CACHE');
    if (cachedTransactions && cachedTransactions.length > 0) {
      console.log('📊 Using cached transactions:', cachedTransactions.length);
      return cachedTransactions;
    }

    const offlineTransactions = await getTransactionsOffline();
    console.log('📊 Using offline transactions:', offlineTransactions.length);
    return offlineTransactions;
  } catch (error) {
    console.warn('⚠️ Error fetching transactions, using offline data:', error);
    return getTransactionsOffline();
  }
};
