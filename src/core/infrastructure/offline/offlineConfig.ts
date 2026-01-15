/**
 * Configuración centralizada del sistema offline
 * Puedes modificar estos parámetros según tus necesidades
 */

export const OFFLINE_CONFIG = {
  // IndexedDB Configuration
  DB_NAME: 'pos-app-offline',
  DB_VERSION: 1,
  
  // Storage Limits
  MAX_QUEUE_SIZE: 10000, // Máximo de operaciones en la cola
  SYNC_BATCH_SIZE: 50, // Operaciones a sincronizar por lote
  
  // Sync Timing
  SYNC_INTERVAL: 5000, // Intervalo de reintentos en ms (5 segundos)
  MAX_SYNC_RETRIES: 3, // Número máximo de reintentos
  SYNC_TIMEOUT: 30000, // Timeout de sincronización en ms
  
  // Storage Configuration
  USE_INDEXEDDB: true, // Si false, usa localStorage
  FALLBACK_TO_LOCALSTORAGE: true, // Fallback si IndexedDB falla
  
  // Debug Logging
  DEBUG: process.env.NODE_ENV === 'development',
  
  // UI Configuration
  SHOW_CONNECTION_INDICATOR: true,
  AUTO_SYNC_ON_RECONNECT: true,
  
  // Data Retention
  CLEAR_SYNCED_DATA_AFTER_DAYS: 30, // Limpiar datos sincronizados después de X días
} as const;

export type OfflineConfig = typeof OFFLINE_CONFIG;

/**
 * Logger utility para debugging
 */
export const offlineLogger = {
  log: (message: string, data?: any) => {
    if (OFFLINE_CONFIG.DEBUG) {
      console.log(`[OFFLINE] ${message}`, data || '');
    }
  },
  
  warn: (message: string, data?: any) => {
    if (OFFLINE_CONFIG.DEBUG) {
      console.warn(`[OFFLINE] ⚠️ ${message}`, data || '');
    }
  },
  
  error: (message: string, data?: any) => {
    console.error(`[OFFLINE] ❌ ${message}`, data || '');
  },
  
  info: (message: string, data?: any) => {
    if (OFFLINE_CONFIG.DEBUG) {
      console.info(`[OFFLINE] ℹ️ ${message}`, data || '');
    }
  },
};
