## 🚀 QUICK START - Sistema Offline Completo

### ✅ Instalación Completa (Ya está lista)

El sistema offline está **totalmente instalado y configurado** en tu aplicación. Los archivos incluyen:

- ✅ **offlineStorage.ts** - Almacenamiento local con IndexedDB
- ✅ **useOnlineStatus.ts** - Hook para detectar conexión
- ✅ **offlineSync.ts** - Cola de sincronización y persistencia
- ✅ **autoSync.ts** - Sincronización automática
- ✅ **OfflineSyncProvider.tsx** - Proveedor global (instalado en layout.tsx)
- ✅ **offlineWrapper.ts** - Funciones wrapper para Firebase
- ✅ **useOfflineSync.ts** - Hook fácil de usar
- ✅ **useSyncStatus.ts** - Hook avanzado con detalles de sincronización
- ✅ **offlineConfig.ts** - Configuración centralizada
- ✅ **ConnectionIndicator.tsx** - Indicador visual de conexión
- ✅ **SyncStatusPanel.tsx** - Panel detallado de estado

---

### 🎯 Uso Básico en Componentes

#### Opción 1: Hook Simple (Recomendado)

```tsx
import { useOfflineSync } from '@/core/infrastructure/offline';
import { guardarVentaPromise } from '@/core/infrastructure/firebase/Promesas';

export function RealizarVentaComponent() {
  const { saveSale, isOnline } = useOfflineSync();

  const handleSaveSale = async (venta) => {
    try {
      const result = await saveSale(venta, guardarVentaPromise);
      if (result.offline) {
        alert('✅ Guardado localmente - Sincronizará al conectarse');
      } else {
        alert('✅ Guardado en el servidor');
      }
    } catch (error) {
      alert('❌ Error');
    }
  };

  return (
    <div>
      {!isOnline && <p>📡 Sin conexión</p>}
      <button onClick={() => handleSaveSale(venta)}>Guardar</button>
    </div>
  );
}
```

#### Opción 2: Hook Avanzado (Para más detalles)

```tsx
import { useSyncStatus } from '@/core/infrastructure/offline';

export function Dashboard() {
  const syncStatus = useSyncStatus();

  return (
    <div>
      <p>En línea: {syncStatus.isOnline ? 'Sí' : 'No'}</p>
      <p>Sincronizando: {syncStatus.isSyncing ? 'Sí' : 'No'}</p>
      <p>Pendientes: {syncStatus.pendingCount}</p>
      <button onClick={syncStatus.clearQueue}>Limpiar Cola</button>
    </div>
  );
}
```

#### Opción 3: Funciones Wrapper Directas

```tsx
import { guardarProductoOfflineFirst } from '@/core/infrastructure/offline';
import { registrarProductoPromise } from '@/core/infrastructure/firebase/Promesas';

const resultado = await guardarProductoOfflineFirst(
  productoData,
  registrarProductoPromise
);

if (resultado.offline) {
  console.log('Guardado offline, se sincronizará después');
} else {
  console.log('Guardado en Firebase');
}
```

---

### 📊 Componentes UI Listos para Usar

#### Panel de Estado de Sincronización

```tsx
import { SyncStatusPanel } from '@/shared/components/SyncStatusPanel';

// Floating en la esquina inferior derecha
<SyncStatusPanel position="floating" />

// En la parte superior
<SyncStatusPanel position="top" />

// En la parte inferior
<SyncStatusPanel position="bottom" />
```

#### Indicador Compacto

```tsx
import { CompactConnectionIndicator } from '@/shared/components/SyncStatusPanel';

// Solo se muestra cuando está sin conexión
<CompactConnectionIndicator hideWhenOnline={true} />
```

#### Modal con Detalles

```tsx
import { useState } from 'react';
import { SyncDetailsModal } from '@/shared/components/SyncStatusPanel';

export function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>Ver Sincronización</button>
      <SyncDetailsModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
```

---

### ⚙️ Configuración (opcional)

Edita `/src/core/infrastructure/offline/offlineConfig.ts`:

```typescript
export const OFFLINE_CONFIG = {
  DB_NAME: 'pos-app-offline', // Nombre de la BD
  MAX_QUEUE_SIZE: 10000, // Máx. operaciones en cola
  SYNC_INTERVAL: 5000, // Intervalo de reintentos (ms)
  MAX_SYNC_RETRIES: 3, // Reintentos máximos
  DEBUG: process.env.NODE_ENV === 'development', // Logs de debug
  // ... más opciones
};
```

---

### 🔄 Cómo Funciona

1. **Usuario realiza una acción** (guardar producto, venta, etc.)
2. **Sistema verifica la conexión**
   - ✅ Si hay conexión → Guarda en Firebase + IndexedDB
   - 📡 Si NO hay conexión → Guarda solo en IndexedDB + Agrega a cola de sincronización
3. **Cuando vuelve la conexión**
   - Sistema detecta automáticamente el cambio
   - Sincroniza todos los datos pendientes
   - Limpia la cola de sincronización

---

### 🛠️ Integración en Componentes Existentes

#### ANTES (Sin offline):
```tsx
const guardarProducto = async (producto) => {
  await registrarProductoPromise(producto);
};
```

#### DESPUÉS (Con offline):
```tsx
const { saveProduct, isOnline } = useOfflineSync();

const guardarProducto = async (producto) => {
  const result = await saveProduct(producto, registrarProductoPromise);
  
  if (result.offline) {
    showNotification('Guardado localmente');
  } else {
    showNotification('Guardado en servidor');
  }
};
```

---

### 📋 Tipos de Datos Soportados

- **Productos**: `saveProduct()`, `getProducts()`
- **Ventas**: `saveSale()`, `getSales()`
- **Transacciones**: `saveTransaction()`, `getTransactions()`

---

### 🐛 Debugging

Abre la consola del navegador para ver logs (si `DEBUG: true` en config):

```
[OFFLINE] ℹ️ Offline storage initialized
[OFFLINE] ✅ Data saved offline
[OFFLINE] 🔄 Syncing pending operations...
[OFFLINE] ✅ Sync completed successfully
```

---

### 🚨 Problemas Comunes

**P: Mi dato se quedó en la cola y no se sincroniza**
R: Abre DevTools → Aplicación → IndexedDB → pos-app-offline → Ver la cola

**P: Quiero limpiar toda la cola manualmente**
R: Usa `syncStatus.clearQueue()` o llama `clearSyncQueue()` directamente

**P: ¿Qué pasa si tengo datos conflictivos?**
R: Actualmente usa "last-write-wins". Para conflictos complejos, implementa tu lógica en `autoSync.ts`

---

### 📚 Archivos Clave

```
src/
├── core/infrastructure/offline/
│   ├── offlineStorage.ts ........... Core storage
│   ├── offlineSync.ts ............. Data management
│   ├── autoSync.ts ................ Auto-sync
│   ├── offlineWrapper.ts .......... Firebase wrappers
│   ├── useOnlineStatus.ts ......... Connection hook
│   ├── useOfflineSync.ts .......... Easy hook
│   ├── useSyncStatus.ts ........... Advanced hook
│   ├── OfflineSyncProvider.tsx .... Global provider
│   ├── offlineConfig.ts ........... Configuration
│   └── index.ts ................... Exports
├── shared/components/
│   ├── ConnectionIndicator.tsx .... Simple indicator
│   └── SyncStatusPanel.tsx ........ Advanced UI
└── app/
    └── layout.tsx ................. Provider installed
```

---

### ✨ Próximos Pasos

1. **Prueba la desconexión**: Abre DevTools → Network → Offline
2. **Crea un producto/venta** sin conexión
3. **Reconecta** y verifica que se sincronice automáticamente
4. **Integra en tus componentes** usando los ejemplos anteriores

---

**¡Sistema listo para usar! 🎉**
