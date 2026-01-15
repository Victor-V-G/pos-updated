/**
 * Gestor de sincronización automática cuando se restaura la conexión
 */

import {
  getPendingSyncQueue,
  clearSyncQueue,
  getAllOfflineData,
} from './offlineSync';
import {
  registrarProductoPromise,
  registrarVentaYActualizarStockPromise,
  registrarTransaccionCajaPromise,
  guardarReporteDesfasePromise,
} from '../firebase/Promesas';

let isSyncing = false;

export const startAutoSync = (isOnline: boolean) => {
  if (!isOnline || isSyncing) return;

  console.log('🔄 Starting automatic sync...');
  isSyncing = true;

  performSync().finally(() => {
    isSyncing = false;
  });
};

export const performSync = async (): Promise<void> => {
  try {
    console.log('📤 Performing data synchronization...');

    const syncQueue = await getPendingSyncQueue();

    if (syncQueue.length === 0) {
      console.log('✅ No pending data to sync');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const action of syncQueue) {
      try {
        switch (action.collection) {
          case 'productos':
            if (action.type === 'CREATE' || action.type === 'UPDATE') {
              await registrarProductoPromise(action.data);
              console.log(`✅ Synced product: ${action.data.id}`);
              successCount++;
            }
            break;

          case 'ventas':
            if (action.type === 'CREATE') {
              await registrarVentaYActualizarStockPromise(action.data);
              console.log(`✅ Synced sale: ${action.data.id}`);
              successCount++;
            }
            break;

          case 'transacciones_caja':
            if (action.type === 'CREATE') {
              await registrarTransaccionCajaPromise(action.data);
              console.log(`✅ Synced transaction: ${action.data.id}`);
              successCount++;
            }
            break;

          case 'reportes_desfase':
            if (action.type === 'CREATE') {
              await guardarReporteDesfasePromise(action.data);
              console.log(`✅ Synced desfase report: ${action.data.id}`);
              successCount++;
            }
            break;

          default:
            console.warn(`⚠️ Unknown collection: ${action.collection}`);
        }
      } catch (error) {
        console.error(`❌ Error syncing ${action.collection}:`, error);
        errorCount++;
      }
    }

    if (errorCount === 0) {
      await clearSyncQueue();
      // Limpiar datos offline sincronizados exitosamente
      await cleanupSyncedOfflineData();
      console.log(`✅ Sync completed successfully! Synced ${successCount} items`);
    } else {
      console.warn(
        `⚠️ Sync completed with errors. Success: ${successCount}, Errors: ${errorCount}`
      );
    }
  } catch (error) {
    console.error('❌ Critical error during sync:', error);
  }
};

export const isSyncInProgress = (): boolean => {
  return isSyncing;
};

/**
 * Limpiar datos offline que ya fueron sincronizados exitosamente
 */
const cleanupSyncedOfflineData = async (): Promise<void> => {
  try {
    const { saveToOfflineStorage, getFromOfflineStorage } = await import('./offlineStorage');
    
    // Limpiar ventas offline sincronizadas (las que tienen ID offline_)
    const sales = (await getFromOfflineStorage('SALES')) || [];
    const unsyncedSales = sales.filter((s: any) => !s.id.startsWith('offline_'));
    await saveToOfflineStorage('SALES', unsyncedSales);
    
    // Limpiar productos offline sincronizados
    const products = (await getFromOfflineStorage('PRODUCTS')) || [];
    const unsyncedProducts = products.filter((p: any) => !p.id.startsWith('offline_'));
    await saveToOfflineStorage('PRODUCTS', unsyncedProducts);
    
    // Limpiar transacciones offline sincronizadas
    const transactions = (await getFromOfflineStorage('TRANSACTIONS')) || [];
    const unsyncedTransactions = transactions.filter((t: any) => !t.id.startsWith('offline_'));
    await saveToOfflineStorage('TRANSACTIONS', unsyncedTransactions);
    
    // Limpiar reportes de desfase offline sincronizados
    const reportesDesfase = (await getFromOfflineStorage('REPORTES_DESFASE')) || [];
    const unsyncedReportesDesfase = reportesDesfase.filter((r: any) => !r.id.startsWith('offline_desfase_'));
    await saveToOfflineStorage('REPORTES_DESFASE', unsyncedReportesDesfase);
    
    console.log('🧹 Cleaned up synced offline data including desfase reports');
  } catch (error) {
    console.error('❌ Error cleaning up synced data:', error);
  }
};
