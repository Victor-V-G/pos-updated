# Sistema Offline-First - Guía de Integración

## Descripción General

El sistema offline-first permite que tu aplicación funcione completamente sin conexión a internet. Todos los datos se guardan localmente usando IndexedDB, y cuando se restaura la conexión, se sincronizan automáticamente con Firebase.

## Características

✅ Funciona sin conexión  
✅ Sincronización automática cuando se restaura conexión  
✅ Persistencia de datos (productos, ventas, transacciones)  
✅ Cola de sincronización para cambios pendientes  
✅ Fallback automático a datos offline si Firebase falla  
✅ Detección automática de cambios de conexión  

## Pasos de Integración

### 1. Añadir el Provider en `layout.tsx`

```tsx
import { OfflineSyncProvider } from '@/core/infrastructure/offline';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <OfflineSyncProvider>
          {children}
        </OfflineSyncProvider>
      </body>
    </html>
  );
}
```

### 2. Usar en componentes de productos

#### Antes:
```tsx
import { registrarProductoPromise } from '@/core/infrastructure/firebase/Promesas';

const handleSaveProduct = async (producto: ProductoInterface) => {
  await registrarProductoPromise(producto);
};
```

#### Después:
```tsx
import { guardarProductoOfflineFirst } from '@/core/infrastructure/offline';
import { registrarProductoPromise } from '@/core/infrastructure/firebase/Promesas';

const handleSaveProduct = async (producto: ProductoInterface) => {
  const result = await guardarProductoOfflineFirst(
    producto,
    registrarProductoPromise
  );
  
  if (result.offline) {
    toast.info('Producto guardado localmente. Se sincronizará cuando haya conexión.');
  }
};
```

### 3. Usar en componentes de ventas

```tsx
import { guardarVentaOfflineFirst } from '@/core/infrastructure/offline';
import { guardarVentaPromise } from '@/core/infrastructure/firebase/Promesas';

const handleCompleteSale = async (venta: any) => {
  const result = await guardarVentaOfflineFirst(
    venta,
    guardarVentaPromise
  );
  
  if (result.offline) {
    console.log('Venta guardada localmente');
  }
};
```

### 4. Usar en componentes de transacciones

```tsx
import { guardarTransaccionOfflineFirst } from '@/core/infrastructure/offline';
import { guardarTransaccionPromise } from '@/core/infrastructure/firebase/Promesas';

const handleSaveTransaction = async (transaccion: any) => {
  const result = await guardarTransaccionOfflineFirst(
    transaccion,
    guardarTransaccionPromise
  );
};
```

### 5. Obtener datos (combinando Firebase + Offline)

```tsx
import { obtenerProductosMerged } from '@/core/infrastructure/offline';
import { obtenerProductosPromise } from '@/core/infrastructure/firebase/Promesas';

const loadProducts = async () => {
  const products = await obtenerProductosMerged(obtenerProductosPromise);
  setProducts(products);
};
```

### 6. Detectar estado de conexión en componentes

```tsx
import { useOnlineStatus } from '@/core/infrastructure/offline';

export function MyComponent() {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-100 p-2 rounded mb-4">
          ⚠️ Trabajando sin conexión. Los cambios se sincronizarán cuando se restaure.
        </div>
      )}
      {/* Tu contenido aquí */}
    </div>
  );
}
```

## Cómo Funciona

### Flujo Sin Conexión
1. Usuario realiza una acción (guardar producto, venta, etc.)
2. Sistema intenta guardar en Firebase
3. Si falla o sin conexión, guarda localmente en IndexedDB
4. Acción se añade a cola de sincronización
5. Usuario ve confirmación de que está guardado localmente

### Flujo Con Restauración de Conexión
1. Sistema detecta que se restauró la conexión
2. Automáticamente inicia sincronización
3. Lee la cola de sincronización pendiente
4. Envía todos los cambios a Firebase
5. Limpia la cola si todo fue exitoso
6. Si hay errores, mantiene la cola para reintentar

## Almacenamiento

### IndexedDB
- **Ventaja**: Soporta más datos (50+ MB)
- **Ubicación**: `POS_OFFLINE_DB`
- **Stores**: 
  - `offlineData`: Datos generales
  - `syncQueue`: Cola de sincronización

### LocalStorage (Fallback)
- Se usa si IndexedDB no está disponible
- Soporta ~5-10 MB de datos

## Monitoreo y Debugging

### Ver datos offline guardados
```tsx
import { getAllOfflineData } from '@/core/infrastructure/offline';

const data = await getAllOfflineData();
console.log('Productos:', data.products);
console.log('Ventas:', data.sales);
console.log('Transacciones:', data.transactions);
console.log('Cola sincronización:', data.syncQueue);
```

### Ver estado de sincronización
```tsx
import { isSyncInProgress } from '@/core/infrastructure/offline';

if (isSyncInProgress()) {
  console.log('Sincronización en progreso...');
}
```

### Forzar sincronización manual
```tsx
import { performSync } from '@/core/infrastructure/offline';

await performSync();
```

## Configuración Recomendada

### 1. Toast/Notificaciones
Usa una librería como `react-toastify` para notificar al usuario:

```tsx
import { toast } from 'react-toastify';

const result = await guardarVentaOfflineFirst(venta, guardarVentaPromise);

if (result.offline) {
  toast.warning('📡 Venta guardada localmente. Pendiente sincronización.', {
    autoClose: 3000,
  });
} else {
  toast.success('✅ Venta guardada en el servidor.');
}
```

### 2. Indicador de Conexión
Muestra indicador visual en la interfaz:

```tsx
import { useOnlineStatus } from '@/core/infrastructure/offline';

export function ConnectionIndicator() {
  const isOnline = useOnlineStatus();
  
  return (
    <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? '🌐 En línea' : '📡 Sin conexión'}
    </div>
  );
}
```

## Próximas Mejoras

- [ ] Caché de lectura para queries offline
- [ ] Compresión de datos para optimizar almacenamiento
- [ ] UI de estado de sincronización en tiempo real
- [ ] Manejo de conflictos (última escritura gana)
- [ ] Limpieza automática de datos sincronizados viejos
- [ ] Historial de cambios para auditoría

## Solución de Problemas

### "IndexedDB not initialized"
Asegúrate de que `OfflineSyncProvider` está en el `layout.tsx` raíz.

### Datos no se sincronizan
1. Verifica que hay conexión internet
2. Verifica que Firebase está configurado correctamente
3. Revisa la consola para errores
4. Intenta `performSync()` manualmente

### Se ve duplicado de datos
Los datos offline se fusionan con Firebase. Verifica que los IDs son únicos.

## Ejemplos Completos

Ver archivos de ejemplo en:
- `src/core/infrastructure/offline/examples/` (próximamente)
