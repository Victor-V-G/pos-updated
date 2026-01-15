/**
 * Exportar todos los módulos de offline
 */

export { initOfflineDB, saveToOfflineStorage, getFromOfflineStorage, getAllOfflineData, markAsSynced, clearOfflineStorage } from './offlineStorage';
export { useOnlineStatus } from './useOnlineStatus';
export { useOfflineSync } from './useOfflineSync';
export { saveProductOffline, saveSaleOffline, saveTransactionOffline, getProductsOffline, getSalesOffline, getTransactionsOffline, addToSyncQueue, getPendingSyncQueue, clearSyncQueue } from './offlineSync';
export { startAutoSync, performSync, isSyncInProgress } from './autoSync';
export { OfflineSyncProvider } from './OfflineSyncProvider';
export { guardarProductoOfflineFirst, guardarVentaOfflineFirst, guardarTransaccionOfflineFirst, obtenerProductosMerged, obtenerVentasMerged, obtenerTransaccionesMerged } from './offlineWrapper';
export { useSyncStatus, useOfflineOperation, useOfflineDataMonitor, useSyncNotifications } from './useSyncStatus';
export type { SyncStatus, SyncNotification } from './useSyncStatus';
export { OFFLINE_CONFIG, offlineLogger } from './offlineConfig';
export type { OfflineConfig } from './offlineConfig';
export { initializeOfflineDataOnce, useInitializeOfflineData, resetOfflineInitialization } from './initializeOfflineData';
