/**
 * Sistema de almacenamiento offline usando IndexedDB
 * Proporciona métodos para guardar y recuperar datos sin conexión
 */

const DB_NAME = 'POS_OFFLINE_DB';
const DB_VERSION = 1;

interface StoredData {
  key: string;
  value: any;
  timestamp: number;
  synced: boolean;
}

let db: IDBDatabase | null = null;

export const initOfflineDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('✅ IndexedDB initialized successfully');
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      
      // Crear objeto store si no existe
      if (!database.objectStoreNames.contains('offlineData')) {
        const store = database.createObjectStore('offlineData', { keyPath: 'key' });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('✅ IndexedDB object stores created');
      }

      // Crear store para cola de sincronización
      if (!database.objectStoreNames.contains('syncQueue')) {
        database.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const saveToOfflineStorage = async (key: string, value: any): Promise<void> => {
  if (!db) {
    console.warn('⚠️ IndexedDB not initialized, using localStorage fallback');
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');

    const data: StoredData = {
      key,
      value,
      timestamp: Date.now(),
      synced: false,
    };

    const request = store.put(data);

    request.onerror = () => {
      console.error('Error saving to IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log(`✅ Saved to offline storage: ${key}`);
      resolve();
    };
  });
};

export const getFromOfflineStorage = async (key: string): Promise<any> => {
  if (!db) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['offlineData'], 'readonly');
    const store = transaction.objectStore('offlineData');
    const request = store.get(key);

    request.onerror = () => {
      console.error('Error reading from IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      const result = request.result as StoredData | undefined;
      resolve(result ? result.value : null);
    };
  });
};

export const getAllOfflineDataRaw = async (): Promise<{ key: string; value: any }[]> => {
  if (!db) {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        result.push({
          key,
          value: JSON.parse(localStorage.getItem(key) || 'null'),
        });
      }
    }
    return result;
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['offlineData'], 'readonly');
    const store = transaction.objectStore('offlineData');
    const request = store.getAll();

    request.onerror = () => {
      console.error('Error reading all from IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      const results = (request.result as StoredData[]).map((item) => ({
        key: item.key,
        value: item.value,
      }));
      resolve(results);
    };
  });
};

export const markAsSynced = async (key: string): Promise<void> => {
  if (!db) {
    localStorage.removeItem(key);
    return;
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');
    const request = store.get(key);

    request.onsuccess = () => {
      const data = request.result as StoredData;
      if (data) {
        data.synced = true;
        const updateRequest = store.put(data);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(request.error);
  });
};

export const clearOfflineStorage = async (): Promise<void> => {
  if (!db) {
    localStorage.clear();
    return;
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};
