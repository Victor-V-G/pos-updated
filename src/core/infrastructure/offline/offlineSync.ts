/**
 * Servicio de sincronización offline-first
 * Maneja la sincronización de datos cuando la conexión se restaura
 */

import {
  saveToOfflineStorage,
  getFromOfflineStorage,
  markAsSynced,
} from './offlineStorage';

interface SyncAction {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  collection: string;
  data: any;
  id?: string;
  timestamp: number;
}

const SYNC_QUEUE_KEY = 'SYNC_QUEUE';
const PRODUCTS_KEY = 'PRODUCTS';
const SALES_KEY = 'SALES';
const TRANSACTIONS_KEY = 'TRANSACTIONS';
const REPORTES_DESFASE_KEY = 'REPORTES_DESFASE';

/**
 * Guardar producto localmente (funciona con o sin conexión)
 */
export const saveProductOffline = async (product: any, isOnline: boolean): Promise<void> => {
  try {
    const products = (await getFromOfflineStorage(PRODUCTS_KEY)) || [];
    const index = products.findIndex((p: any) => p.id === product.id);

    if (index >= 0) {
      products[index] = { ...products[index], ...product };
    } else {
      products.push(product);
    }

    await saveToOfflineStorage(PRODUCTS_KEY, products);

    if (!isOnline) {
      // Agregar a cola de sincronización
      await addToSyncQueue({
        type: product.id ? 'UPDATE' : 'CREATE',
        collection: 'productos',
        data: product,
        id: product.id,
        timestamp: Date.now(),
      });
    }

    console.log('✅ Product saved locally');
  } catch (error) {
    console.error('❌ Error saving product offline:', error);
  }
};

/**
 * Guardar venta localmente
 */
export const saveSaleOffline = async (sale: any, isOnline: boolean): Promise<void> => {
  try {
    const sales = (await getFromOfflineStorage(SALES_KEY)) || [];
    sales.push({
      ...sale,
      id: sale.id || `offline_${Date.now()}_${Math.random()}`,
      synced: false,
    });

    await saveToOfflineStorage(SALES_KEY, sales);

    if (!isOnline) {
      await addToSyncQueue({
        type: 'CREATE',
        collection: 'ventas',
        data: sale,
        timestamp: Date.now(),
      });
    }

    console.log('✅ Sale saved locally');
  } catch (error) {
    console.error('❌ Error saving sale offline:', error);
  }
};

/**
 * Guardar transacción de caja localmente
 */
export const saveTransactionOffline = async (transaction: any, isOnline: boolean): Promise<void> => {
  try {
    const transactions = (await getFromOfflineStorage(TRANSACTIONS_KEY)) || [];
    transactions.push({
      ...transaction,
      id: transaction.id || `offline_${Date.now()}_${Math.random()}`,
      synced: false,
    });

    await saveToOfflineStorage(TRANSACTIONS_KEY, transactions);

    if (!isOnline) {
      await addToSyncQueue({
        type: 'CREATE',
        collection: 'transacciones_caja',
        data: transaction,
        timestamp: Date.now(),
      });
    }

    console.log('✅ Transaction saved locally');
  } catch (error) {
    console.error('❌ Error saving transaction offline:', error);
  }
};

/**
 * Obtener productos locales
 */
export const getProductsOffline = async (): Promise<any[]> => {
  try {
    return (await getFromOfflineStorage(PRODUCTS_KEY)) || [];
  } catch (error) {
    console.error('❌ Error getting products offline:', error);
    return [];
  }
};

/**
 * Obtener ventas locales
 */
export const getSalesOffline = async (): Promise<any[]> => {
  try {
    return (await getFromOfflineStorage(SALES_KEY)) || [];
  } catch (error) {
    console.error('❌ Error getting sales offline:', error);
    return [];
  }
};

/**
 * Guardar reporte de desfase localmente
 */
export const saveReportDesfaseOffline = async (reporte: any, isOnline: boolean): Promise<void> => {
  try {
    const reportes = (await getFromOfflineStorage(REPORTES_DESFASE_KEY)) || [];
    const reporteId = reporte.id || `offline_desfase_${Date.now()}_${Math.random()}`;
    
    reportes.push({
      ...reporte,
      id: reporteId,
      synced: false,
    });

    await saveToOfflineStorage(REPORTES_DESFASE_KEY, reportes);

    if (!isOnline) {
      await addToSyncQueue({
        type: 'CREATE',
        collection: 'reportes_desfase',
        data: { ...reporte, id: reporteId },
        id: reporteId,
        timestamp: Date.now(),
      });
    }

    console.log('✅ Desfase report saved locally');
  } catch (error) {
    console.error('❌ Error saving desfase report offline:', error);
  }
};

/**
 * Obtener reportes de desfase locales
 */
export const getReportesDesfaseOffline = async (): Promise<any[]> => {
  try {
    return (await getFromOfflineStorage(REPORTES_DESFASE_KEY)) || [];
  } catch (error) {
    console.error('❌ Error getting desfase reports offline:', error);
    return [];
  }
};

/**
 * Obtener transacciones locales
 */
export const getTransactionsOffline = async (): Promise<any[]> => {
  try {
    return (await getFromOfflineStorage(TRANSACTIONS_KEY)) || [];
  } catch (error) {
    console.error('❌ Error getting transactions offline:', error);
    return [];
  }
};

/**
 * Agregar acción a la cola de sincronización
 */
export const addToSyncQueue = async (action: SyncAction): Promise<void> => {
  try {
    const queue = (await getFromOfflineStorage(SYNC_QUEUE_KEY)) || [];
    queue.push(action);
    await saveToOfflineStorage(SYNC_QUEUE_KEY, queue);
    console.log(`✅ Action added to sync queue: ${action.type} ${action.collection}`);
  } catch (error) {
    console.error('❌ Error adding to sync queue:', error);
  }
};

/**
 * Obtener cola de sincronización pendiente
 */
export const getPendingSyncQueue = async (): Promise<SyncAction[]> => {
  try {
    return (await getFromOfflineStorage(SYNC_QUEUE_KEY)) || [];
  } catch (error) {
    console.error('❌ Error getting sync queue:', error);
    return [];
  }
};

/**
 * Limpiar cola de sincronización
 */
export const clearSyncQueue = async (): Promise<void> => {
  try {
    await saveToOfflineStorage(SYNC_QUEUE_KEY, []);
    console.log('✅ Sync queue cleared');
  } catch (error) {
    console.error('❌ Error clearing sync queue:', error);
  }
};

/**
 * Obtener todos los datos offline
 */
export const getAllOfflineData = async () => {
  try {
    const [products, sales, transactions, reportesDesfase, syncQueue] = await Promise.all([
      getFromOfflineStorage(PRODUCTS_KEY),
      getFromOfflineStorage(SALES_KEY),
      getFromOfflineStorage(TRANSACTIONS_KEY),
      getFromOfflineStorage(REPORTES_DESFASE_KEY),
      getFromOfflineStorage(SYNC_QUEUE_KEY),
    ]);

    return {
      products: products || [],
      sales: sales || [],
      transactions: transactions || [],
      reportesDesfase: reportesDesfase || [],
      syncQueue: syncQueue || [],
    };
  } catch (error) {
    console.error('❌ Error getting all offline data:', error);
    return {
      products: [],
      sales: [],
      transactions: [],
      reportesDesfase: [],
      syncQueue: [],
    };
  }
};
