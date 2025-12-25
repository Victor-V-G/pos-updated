# Arquitectura del Proyecto - POS System

Este proyecto implementa **Screaming Architecture**, donde la estructura del proyecto "grita" su propósito de negocio (Point of Sale - Sistema de Punto de Venta).

## 📁 Estructura del Proyecto

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Página principal
│   ├── layout.tsx               # Layout principal
│   └── globals.css              # Estilos globales
│
├── core/                         # Núcleo de la aplicación
│   ├── domain/                  # Entidades de dominio
│   │   ├── entities/            # Interfaces de entidades de negocio
│   │   │   ├── ProductoInterface.tsx
│   │   │   └── index.ts
│   │   └── types/               # Tipos de dominio
│   │
│   └── infrastructure/          # Capa de infraestructura
│       └── firebase/            # Implementación de Firebase
│           ├── Conexion.tsx     # Configuración de conexión
│           ├── Credenciales.tsx # Credenciales de Firebase
│           ├── Promesas.tsx     # Funciones de acceso a datos
│           └── index.ts
│
├── features/                     # Características de negocio (Screaming Architecture)
│   │
│   ├── sales/                   # 💰 Gestión de Ventas
│   │   ├── components/
│   │   │   ├── VentaComponent.tsx
│   │   │   ├── VentaModals.tsx
│   │   │   ├── IngresarCDB.tsx
│   │   │   ├── MostrarProductosVenta.tsx
│   │   │   ├── ProductoEncontradoAgregar.tsx
│   │   │   ├── RealizarVenta.tsx
│   │   │   └── index.ts
│   │   └── types/               # Tipos específicos de ventas
│   │
│   ├── product-management/      # 📦 Gestión de Productos
│   │   ├── components/
│   │   │   ├── GestionComponent.tsx
│   │   │   ├── GestionarProductosMainComponent.tsx
│   │   │   ├── agregar-productos-component/
│   │   │   ├── eliminar-productos-component/
│   │   │   ├── modificar-productos-component/
│   │   │   ├── search-components/
│   │   │   ├── registros-y-movimientos-component/
│   │   │   ├── historial-de-ventas-gestion/
│   │   │   ├── gestion-main-modals/
│   │   │   └── gestion-productos-modals/
│   │   └── types/               # Tipos específicos de gestión
│   │
│   ├── inventory/               # 📊 Gestión de Inventario
│   │   ├── components/
│   │   │   ├── VerStockComponent.tsx
│   │   │   ├── VerStockModals.tsx
│   │   │   └── index.ts
│   │   └── types/
│   │
│   ├── sales-history/           # 📋 Historial de Ventas
│   │   ├── components/
│   │   │   ├── HistorialDeVentasComponent.tsx
│   │   │   ├── HistorialDeVentasModals.tsx
│   │   │   └── index.ts
│   │   └── types/
│   │
│   ├── dashboard/               # 🏠 Panel Principal
│   │   ├── components/
│   │   │   ├── InicioComponent.tsx
│   │   │   ├── InicioModals.tsx
│   │   │   └── index.ts
│   │   └── types/
│   │
│   └── auth/                    # 🔐 Autenticación
│       ├── components/
│       │   ├── LoginModals.tsx
│       │   └── index.ts
│       └── types/
│
├── shared/                       # Código compartido
│   ├── components/              # Componentes reutilizables
│   │   ├── sidebar/
│   │   │   ├── components/
│   │   │   │   └── Sidebar.tsx
│   │   │   └── assets/
│   │   ├── ui/                  # Componentes UI genéricos
│   │   └── index.ts
│   │
│   └── types/                   # Tipos e interfaces compartidas
│       ├── modals/
│       ├── login/
│       ├── sidebar/
│       ├── gestion/
│       ├── search-producto/
│       ├── modificar-producto/
│       ├── eliminar-producto/
│       ├── ingresar-cdb/
│       ├── id-documentos/
│       ├── registros-y-movimientos/
│       └── index.ts             # Barrel export de todos los tipos
│
└── assets/                       # Recursos estáticos
    ├── images/                  # Imágenes
    └── styles/                  # Estilos CSS organizados
        ├── component-main-style/
        ├── gestion-productos-styles/
        └── modals-close-style/
```

## 🎯 Principios de Screaming Architecture

### 1. **La estructura grita el propósito del negocio**
   - Al ver `features/sales/`, inmediatamente sabes que trata de ventas
   - `features/product-management/` claramente indica gestión de productos
   - `features/inventory/` es sobre el inventario

### 2. **Separación de Capas**
   - **Core**: Lógica de negocio e infraestructura
   - **Features**: Características de negocio (casos de uso)
   - **Shared**: Código compartido entre features
   - **App**: Capa de presentación (Next.js)

### 3. **Independencia de Framework**
   - El core no depende de Next.js
   - Firebase está aislado en `infrastructure/`
   - Los features son independientes entre sí

## 📦 Patrones de Importación

### Imports desde Features
```typescript
// ✅ Correcto - Usar exports de barril
import { VentaComponent, VentaModals } from '@/features/sales/components';
import { LoginModals } from '@/features/auth/components';

// ✅ Correcto - Tipos compartidos
import { ProductoInterface } from '@/core/domain/entities';
import { ModalsInterfaceProps } from '@/shared/types';

// ✅ Correcto - Infrastructure
import { registrarVentaYActualizarStockPromise } from '@/core/infrastructure/firebase';

// ❌ Evitar - Imports directos profundos
import VentaComponent from '@/features/sales/components/VentaComponent';
```

### Imports de Estilos
```typescript
// ✅ Correcto - Ruta absoluta desde assets
import '@/assets/styles/venta-component-style.css';

// ❌ Evitar - Rutas relativas
import '../assets/css/venta-component-style.css';
```

### Imports de Imágenes
```typescript
// ✅ Correcto - Desde assets centralizados
import VentaImg from '@/assets/images/shopping-cart-inicio.png';

// ❌ Evitar - Rutas relativas
import VentaImg from '../assets/img/shopping-cart-inicio.png';
```

## 🔄 Flujo de Datos

```
User Interaction
      ↓
Components (Features)
      ↓
Infrastructure (Firebase)
      ↓
Database
```

## 🛠️ Convenciones

### Nombres de Archivos
- **Componentes**: PascalCase con extensión `.tsx`
  - `VentaComponent.tsx`, `LoginModals.tsx`
- **Barrel Exports**: `index.ts` en cada directorio de componentes
- **Tipos**: PascalCase terminando en `Interface` o `Props`
  - `ProductoInterface.tsx`, `ModalsInterfaceProps.tsx`

### Organización de Features
Cada feature sigue la estructura:
```
feature-name/
├── components/      # Componentes React
├── types/          # Tipos específicos del feature
└── hooks/          # Custom hooks (si aplica)
```

## 🚀 Ventajas de esta Arquitectura

1. **Mantenibilidad**: Fácil encontrar y modificar código
2. **Escalabilidad**: Agregar nuevas features es directo
3. **Testabilidad**: Componentes desacoplados y testeables
4. **Claridad**: La estructura comunica el propósito
5. **Onboarding**: Nuevos desarrolladores entienden rápidamente el sistema

## 📝 Agregar una Nueva Feature

1. Crear directorio en `src/features/nueva-feature/`
2. Agregar subdirectorios: `components/`, `types/`
3. Crear `index.ts` para exports
4. Implementar componentes
5. Agregar tipos en `types/` si son específicos, o en `shared/types/` si son compartidos
6. Actualizar rutas en el router principal

## 🔐 Buenas Prácticas

- **No importar entre features**: Features deben ser independientes
- **Usar tipos compartidos**: En `shared/types/` para interfaces comunes
- **Centralizar estilos**: En `assets/styles/` organizados por feature
- **Documentar componentes**: JSDoc para componentes complejos
- **Usar barrel exports**: Para mantener imports limpios

## 🎨 Estructura de Estilos

Los estilos están organizados por característica y componente:
```
assets/styles/
├── component-main-style/
│   └── gestion-component-style.css
├── gestion-productos-styles/
│   ├── agregar-productos-style/
│   ├── modificar-productos-style/
│   └── search-productos-style/
└── modals-close-style/
    └── modals-cerrar-button.css
```

---

**Última actualización**: Diciembre 2025
**Arquitectura**: Screaming Architecture + Clean Architecture
**Framework**: Next.js 14+ con TypeScript
