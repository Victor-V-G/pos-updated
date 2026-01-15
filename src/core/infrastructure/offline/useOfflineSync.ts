'use client';

/**
 * Hook personalizado para manejar operaciones offline-first
 * Simplifica la integración en componentes
 */

import { useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import {
  guardarProductoOfflineFirst,
  guardarVentaOfflineFirst,
  guardarTransaccionOfflineFirst,
  obtenerProductosMerged,
  obtenerVentasMerged,
  obtenerTransaccionesMerged,
} from './offlineWrapper';

export const useOfflineSync = () => {
  const isOnline = useOnlineStatus();

  const saveProduct = useCallback(
    async (producto: any, firebaseFunction: (data: any) => Promise<any>) => {
      return guardarProductoOfflineFirst(producto, firebaseFunction);
    },
    []
  );

  const saveSale = useCallback(
    async (venta: any, firebaseFunction: (data: any) => Promise<any>) => {
      return guardarVentaOfflineFirst(venta, firebaseFunction);
    },
    []
  );

  const saveTransaction = useCallback(
    async (transaccion: any, firebaseFunction: (data: any) => Promise<any>) => {
      return guardarTransaccionOfflineFirst(transaccion, firebaseFunction);
    },
    []
  );

  const getProducts = useCallback(
    async (firebaseFunction: () => Promise<any[]>) => {
      return obtenerProductosMerged(firebaseFunction);
    },
    []
  );

  const getSales = useCallback(
    async (firebaseFunction: () => Promise<any[]>) => {
      return obtenerVentasMerged(firebaseFunction);
    },
    []
  );

  const getTransactions = useCallback(
    async (firebaseFunction: () => Promise<any[]>) => {
      return obtenerTransaccionesMerged(firebaseFunction);
    },
    []
  );

  return {
    isOnline,
    saveProduct,
    saveSale,
    saveTransaction,
    getProducts,
    getSales,
    getTransactions,
  };
};
