'use client';

/**
 * Hook avanzado para monitorear estado de sincronización
 * Proporciona información detallada sobre operaciones pendientes y estado de sync
 */

import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { getPendingSyncQueue, clearSyncQueue } from './offlineSync';
import { isSyncInProgress } from './autoSync';
import { offlineLogger, OFFLINE_CONFIG } from './offlineConfig';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  pendingOperations: any[];
  lastSyncTime: Date | null;
  syncError: Error | null;
}

export const useSyncStatus = () => {
  const isOnline = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline,
    isSyncing: false,
    pendingCount: 0,
    pendingOperations: [],
    lastSyncTime: null,
    syncError: null,
  });

  // Cargar estado inicial
  useEffect(() => {
    const loadPendingQueue = async () => {
      try {
        const queue = await getPendingSyncQueue();
        setSyncStatus((prev) => ({
          ...prev,
          pendingCount: queue.length,
          pendingOperations: queue,
        }));
      } catch (error) {
        offlineLogger.error('Error loading pending queue', error);
      }
    };

    loadPendingQueue();
  }, []);

  // Monitorear cambios en la cola de sincronización
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const queue = await getPendingSyncQueue();
        const syncing = await isSyncInProgress();

        setSyncStatus((prev) => ({
          ...prev,
          isOnline,
          isSyncing: syncing,
          pendingCount: queue.length,
          pendingOperations: queue,
        }));
      } catch (error) {
        offlineLogger.error('Error updating sync status', error);
      }
    }, 1000); // Actualizar cada segundo

    return () => clearInterval(interval);
  }, [isOnline]);

  // Función para limpiar la cola manualmente
  const clearQueue = useCallback(async () => {
    try {
      await clearSyncQueue();
      setSyncStatus((prev) => ({
        ...prev,
        pendingCount: 0,
        pendingOperations: [],
      }));
      offlineLogger.log('Sync queue cleared');
    } catch (error) {
      offlineLogger.error('Error clearing sync queue', error);
      setSyncStatus((prev) => ({
        ...prev,
        syncError: error as Error,
      }));
    }
  }, []);

  return {
    ...syncStatus,
    clearQueue,
  };
};

/**
 * Hook para manejar operaciones con reintentos automáticos
 */
export const useOfflineOperation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useOnlineStatus();

  const executeWithRetry = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      options = { maxRetries: OFFLINE_CONFIG.MAX_SYNC_RETRIES }
    ): Promise<T> => {
      setIsLoading(true);
      setError(null);

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
        try {
          const result = await Promise.race([
            operation(),
            new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error('Operation timeout')),
                OFFLINE_CONFIG.SYNC_TIMEOUT
              )
            ),
          ]);

          offlineLogger.log(`Operation succeeded on attempt ${attempt + 1}`);
          setIsLoading(false);
          return result;
        } catch (err) {
          lastError = err as Error;
          offlineLogger.warn(
            `Operation failed on attempt ${attempt + 1}: ${lastError.message}`
          );

          // Si no tenemos conexión y no es el último intento, esperar
          if (!isOnline && attempt < options.maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, OFFLINE_CONFIG.SYNC_INTERVAL)
            );
          }
        }
      }

      setError(lastError);
      setIsLoading(false);
      throw lastError;
    },
    [isOnline]
  );

  return { executeWithRetry, isLoading, error };
};

/**
 * Hook para monitorear cambios específicos de un tipo de dato
 */
export const useOfflineDataMonitor = (dataType: 'products' | 'sales' | 'transactions') => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const syncStatus = useSyncStatus();

  // Filtrar operaciones pendientes del tipo especificado
  const pendingOperations = syncStatus.pendingOperations.filter(
    (op) => op.type === dataType
  );

  const isSyncingThisType = syncStatus.isSyncing && pendingOperations.length > 0;

  return {
    data,
    setData,
    isLoading,
    setIsLoading,
    error,
    setError,
    pendingOperations,
    isSyncingThisType,
    hasPendingChanges: pendingOperations.length > 0,
  };
};

/**
 * Hook para notificaciones de sincronización
 */
export interface SyncNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
}

export const useSyncNotifications = () => {
  const [notifications, setNotifications] = useState<SyncNotification[]>([]);

  const addNotification = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' | 'warning' = 'info',
      duration = 3000
    ) => {
      const id = Date.now().toString();
      const notification: SyncNotification = { id, type, message, duration };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
};
