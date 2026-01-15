/**
 * Provider para sincronización offline
 * Inicializa la BD offline y maneja la sincronización automática
 */

'use client';

import { useEffect } from 'react';
import { initOfflineDB } from './offlineStorage';
import { useOnlineStatus } from './useOnlineStatus';
import { startAutoSync } from './autoSync';
import { initializeOfflineDataOnce } from './initializeOfflineData';

export const OfflineSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // Inicializar IndexedDB
    initOfflineDB().catch((error) => {
      console.error('Failed to initialize offline DB:', error);
    });
    
    // Precargar datos de Firebase en IndexedDB la primera vez
    if (isOnline) {
      initializeOfflineDataOnce().catch((error) => {
        console.error('Failed to initialize offline data:', error);
      });
    }
  }, []);

  useEffect(() => {
    // Iniciar sincronización cuando se restaura la conexión
    if (isOnline) {
      const timer = setTimeout(() => {
        startAutoSync(isOnline);
      }, 1000); // Esperar 1 segundo para asegurar que se restauró la conexión

      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return <>{children}</>;
};
