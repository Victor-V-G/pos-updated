## ✅ CHECKLIST DE IMPLEMENTACIÓN - Sistema Offline

### 📦 Instalación Base (COMPLETADO)

- ✅ IndexedDB wrapper (`offlineStorage.ts`)
- ✅ Detección de conexión (`useOnlineStatus.ts`)
- ✅ Cola de sincronización (`offlineSync.ts`)
- ✅ Auto-sincronización (`autoSync.ts`)
- ✅ Provider global (`OfflineSyncProvider.tsx`)
- ✅ Wrappers de Firebase (`offlineWrapper.ts`)
- ✅ Hook simple (`useOfflineSync.ts`)
- ✅ Hook avanzado (`useSyncStatus.ts`)
- ✅ Configuración (`offlineConfig.ts`)
- ✅ Componentes UI (`ConnectionIndicator.tsx`, `SyncStatusPanel.tsx`)
- ✅ Integrado en layout.tsx

### 🎯 Próximos Pasos de Integración

Según su orden de importancia y dependencias:

#### Fase 1: Componentes Críticos (ALTA PRIORIDAD)

- [ ] **RealizarVentaComponent** (`src/features/sales/components/`)
  - **Por qué**: Core de la aplicación, debe funcionar sin internet
  - **Cambios**: Usar `useOfflineSync` para guardar ventas
  - **Archivos afectados**: Búscar dónde se llama `guardarVentaPromise`
  - **Estimación**: 15-20 minutos

- [ ] **GestionComponent** (`src/features/product-management/components/`)
  - **Por qué**: Gestión de productos, datos críticos
  - **Cambios**: Integrar `saveProduct`, `getProducts`
  - **Archivos afectados**: Búscar dónde se llama `registrarProductoPromise`
  - **Estimación**: 15-20 minutos

- [ ] **VerStockComponent** (`src/features/inventory/components/`)
  - **Por qué**: Ver inventario sin internet es importante
  - **Cambios**: Usar `getProducts` para obtener stock offline
  - **Estimación**: 10-15 minutos

#### Fase 2: Componentes Secundarios (MEDIA PRIORIDAD)

- [ ] **LoginModals** (`src/features/auth/components/`)
  - **Por qué**: Validación local de credenciales guardadas
  - **Estimación**: 10-15 minutos

- [ ] **Historial de Ventas** (`src/features/sales-history/`)
  - **Por qué**: Ver historial offline
  - **Estimación**: 10-15 minutos

#### Fase 3: Mejoras UI (BAJA PRIORIDAD)

- [ ] Agregar `SyncStatusPanel` a layout o header
  - Para que usuarios vean estado de sincronización

- [ ] Notificaciones toast en componentes
  - Feedback visual cuando se guarda offline

- [ ] Sync status dashboard
  - Vista detallada de operaciones pendientes

### 🔧 Pasos Detallados para Cada Componente

#### Paso 1: Identificar llamadas a Firebase

```bash
# Buscar en la codebase
grep -r "guardarVentaPromise\|registrarProductoPromise\|obtenerProductosPromise" src/
```

#### Paso 2: Importar hooks necesarios

```typescript
import { useOfflineSync, useSyncStatus } from '@/core/infrastructure/offline';
```

#### Paso 3: Reemplazar llamadas directas

**ANTES:**
```typescript
await guardarVentaPromise(ventaData);
```

**DESPUÉS:**
```typescript
const { saveSale, isOnline } = useOfflineSync();
const result = await saveSale(ventaData, guardarVentaPromise);

if (result.offline) {
  mostrarNotificacion('Guardado localmente - Se sincronizará al conectarse');
}
```

#### Paso 4: Agregar indicador de estado (Opcional)

```typescript
const { isOnline } = useOnlineStatus();

{!isOnline && <CompactConnectionIndicator />}
```

---

## 📋 Template para Integración Rápida

Copia este template para cada componente:

```typescript
'use client';

import { useOfflineSync, useSyncStatus } from '@/core/infrastructure/offline';
import { CompactConnectionIndicator } from '@/shared/components/SyncStatusPanel';

export function MyComponent() {
  // Hooks offline
  const { saveProduct, saveSale, getProducts, isOnline } = useOfflineSync();
  const syncStatus = useSyncStatus();
  
  const handleSave = async (data, firebaseFunction) => {
    try {
      const result = await saveProduct(data, firebaseFunction);
      
      if (result.offline) {
        console.log('Guardado offline - Se sincronizará después');
      } else {
        console.log('Guardado en servidor');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {/* Mostrar indicador */}
      {!isOnline && <CompactConnectionIndicator hideWhenOnline={true} />}
      
      {/* Mostrar estado */}
      {syncStatus.pendingCount > 0 && (
        <p>⏳ {syncStatus.pendingCount} cambios pendientes de sincronizar</p>
      )}
      
      {/* Tus componentes aquí */}
    </div>
  );
}
```

---

## 🧪 Plan de Pruebas

Para verificar que cada componente funciona offline:

1. **Prueba 1: Crear recurso offline**
   - Abre DevTools → Network → Offline
   - Intenta guardar producto/venta
   - Verifica que se guardó localmente

2. **Prueba 2: Sincronización automática**
   - Con recursos sin sincronizar
   - Desactiva Offline en DevTools
   - Verifica que se sincronicen automáticamente

3. **Prueba 3: Datos combinados**
   - Crea recurso offline
   - Crea recurso online
   - Verifica que se vean ambos en la lista

---

## 📊 Estado Actual

```
INSTALACIÓN:        ✅ 100% Complete
HOOKS BÁSICOS:      ✅ Complete (useOnlineSync, useSyncStatus)
COMPONENTES UI:     ✅ Complete (ConnectionIndicator, SyncStatusPanel)
CONFIGURACIÓN:      ✅ Complete

INTEGRACIÓN:        ⏳ Pendiente
├─ RealizarVenta:   ⏳ NO INICIADO
├─ GestionProductos:⏳ NO INICIADO
├─ VerStock:        ⏳ NO INICIADO
├─ Historial:       ⏳ NO INICIADO
└─ Otros:           ⏳ NO INICIADO

UI/UX:              ⏳ Pendiente
├─ Status Panel:    ⏳ NO INTEGRADO
├─ Notificaciones:  ⏳ NO INTEGRADO
└─ Dashboard:       ⏳ NO INTEGRADO
```

---

## 🚀 Comando Útil para Búsqueda Rápida

```bash
# Windows PowerShell
Get-ChildItem -Recurse -Path "src" -Include "*.tsx" -o "*.ts" | 
  Select-String "guardarVentaPromise|registrarProductoPromise|obtenerProductosPromise|obtenerVentasPromise"
```

---

## ⚠️ Consideraciones Importantes

1. **Conflictos de Datos**: Si el mismo recurso se edita offline y en el servidor, "last-write-wins"
   - Puedes personalizar en `autoSync.ts` función `performSync()`

2. **Capacidad de Almacenamiento**: IndexedDB tiene ~50MB en la mayoría de navegadores
   - Para aplicaciones grandes, considera limpiar datos antiguos

3. **Sincronización en Lotes**: Se sincroniza por lotes de 50 operaciones
   - Configurable en `OFFLINE_CONFIG.SYNC_BATCH_SIZE`

4. **Testing**: Prueba siempre con Network Throttling
   - DevTools → Network → Throttling (Slow 3G, etc.)

---

## 📚 Referencias Rápidas

- **Hook Simple**: `useOfflineSync()` → getProduct, saveSale, etc.
- **Hook Avanzado**: `useSyncStatus()` → Detalles, pendingCount, isSyncing
- **Funciones Directas**: `guardarProductoOfflineFirst()` → Control total
- **Componentes UI**: `SyncStatusPanel`, `CompactConnectionIndicator`

---

## ✨ Próximo Checkpoint

Una vez completada la **Fase 1** (RealizarVenta, Gestión, Stock):
- [ ] Pruebas offline-online
- [ ] Optimización de rendimiento
- [ ] Feedback de usuarios
- [ ] Documentación de usuarios

---

**Estado del Proyecto: ✅ FUNDACIÓN LISTA - INTEGRACIONES PENDIENTES**

Puedes comenzar a integrar los componentes cuando estés listo.
