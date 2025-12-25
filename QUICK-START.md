# 🚀 Guía Rápida - Proyecto POS

## 📋 Tabla de Contenidos
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Imports Principales](#imports-principales)
- [Comandos Útiles](#comandos-útiles)
- [Convenciones](#convenciones)

## 📁 Estructura del Proyecto

```
src/
├── app/              → Next.js pages y layout
├── core/             → Lógica de negocio
│   ├── domain/      → Entidades (ProductoInterface, etc.)
│   └── infrastructure/ → Firebase, APIs externas
├── features/         → Características de negocio
│   ├── sales/       → 💰 Ventas
│   ├── product-management/ → 📦 Gestión de productos
│   ├── inventory/   → 📊 Inventario/Stock
│   ├── sales-history/ → 📋 Historial de ventas
│   ├── dashboard/   → 🏠 Dashboard principal
│   └── auth/        → 🔐 Login/Autenticación
├── shared/           → Código compartido
│   ├── components/  → Sidebar, UI components
│   └── types/       → Interfaces compartidas
└── assets/           → Imágenes y estilos
    ├── images/
    └── styles/
```

## 🔗 Imports Principales

### Firebase / Base de Datos
```typescript
import { 
  registrarVentaYActualizarStockPromise,
  obtenerProductosPromise,
  registrarProductoPromise 
} from '@/core/infrastructure/firebase';
```

### Entidades de Dominio
```typescript
import { 
  ProductoInterface,
  ProductoConIDInterface 
} from '@/core/domain/entities';
```

### Tipos Compartidos
```typescript
import { 
  ModalsInterfaceProps,
  SidebarInterfaceProps,
  GestionModalsSetters,
  ProductoVenta
} from '@/shared/types';
```

### Componentes de Features
```typescript
// Sales
import { VentaComponent, VentaModals } from '@/features/sales/components';

// Product Management
import { GestionComponent } from '@/features/product-management/components';

// Inventory
import { VerStockComponent } from '@/features/inventory/components';

// Sales History
import { HistorialDeVentasComponent } from '@/features/sales-history/components';

// Dashboard
import { InicioComponent } from '@/features/dashboard/components';

// Auth
import { LoginModals } from '@/features/auth/components';
```

### Componentes Compartidos
```typescript
import { Sidebar } from '@/shared/components';
```

### Estilos
```typescript
import '@/assets/styles/venta-component-style.css';
import '@/assets/styles/gestion-component-style.css';
```

### Imágenes
```typescript
import logo from '@/assets/images/logo.png';
```

## ⚡ Comandos Útiles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Build
npm run build        # Construir para producción
npm start            # Iniciar servidor de producción

# Linting
npm run lint         # Verificar código

# Formateo
npm run format       # Formatear código (si está configurado)
```

## 📝 Convenciones

### Nombres de Archivos
- **Componentes**: `PascalCase.tsx` → `VentaComponent.tsx`
- **Tipos**: `PascalCase.tsx` → `ProductoInterface.tsx`
- **Estilos**: `kebab-case.css` → `venta-component-style.css`
- **Exports**: `index.ts` en cada carpeta de componentes

### Estructura de Componentes
```typescript
// Imports externos primero
import { useState } from 'react';

// Imports de infraestructura
import { obtenerProductosPromise } from '@/core/infrastructure/firebase';

// Imports de entidades
import { ProductoInterface } from '@/core/domain/entities';

// Imports de tipos
import { ModalsInterfaceProps } from '@/shared/types';

// Imports de estilos
import '@/assets/styles/mi-componente.css';

// Componente
export const MiComponente = () => {
  // Estado
  const [productos, setProductos] = useState<ProductoInterface[]>([]);
  
  // Efectos
  useEffect(() => {
    // ...
  }, []);
  
  // Handlers
  const handleClick = () => {
    // ...
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Estructura de Features
```
features/mi-feature/
├── components/
│   ├── ComponentePrincipal.tsx
│   ├── ComponenteSecundario.tsx
│   └── index.ts          # Barrel export
├── types/
│   └── index.ts          # Tipos específicos (si aplica)
└── hooks/                # Custom hooks (si aplica)
    └── useMiHook.ts
```

## 🎯 Características Principales

### 1. Sales (Ventas)
- Registrar ventas
- Buscar productos por código de barras
- Calcular totales y vueltos
- Métodos de pago: Efectivo y Débito

### 2. Product Management (Gestión de Productos)
- Agregar productos nuevos
- Modificar productos existentes
- Eliminar productos
- Buscar productos
- Ver registros y movimientos
- Historial de ventas desde gestión

### 3. Inventory (Inventario)
- Ver stock disponible
- Paginación de productos
- Búsqueda y filtrado
- Alertas de stock bajo

### 4. Sales History (Historial de Ventas)
- Ver todas las ventas realizadas
- Detalles de cada venta
- Filtrado por fecha
- Paginación

### 5. Dashboard (Inicio)
- Acceso rápido a todas las features
- Navegación principal
- Vista general del sistema

### 6. Auth (Autenticación)
- Login con contraseña
- Control de acceso a gestión

## 🔐 Firebase

### Colecciones
- `Productos` - Productos del inventario
- `Ventas` - Registro de ventas
- `Movimientos` - Historial de cambios

### Configuración
El archivo `Credenciales.tsx` contiene la configuración de Firebase.
**Importante**: No compartir estas credenciales públicamente.

## 🎨 Estilos

Los estilos están organizados por feature y componente en `assets/styles/`:

```
assets/styles/
├── component-main-style/
├── gestion-productos-styles/
│   ├── agregar-productos-style/
│   ├── modificar-productos-style/
│   ├── search-productos-style/
│   └── ...
└── modals-close-style/
```

## 🐛 Debugging

### Errores Comunes

**Error: Cannot find module**
- Verificar que la ruta de import sea correcta
- Usar rutas absolutas con `@/`
- Verificar que el archivo exista

**Error: Type errors**
- Verificar que los tipos importados sean correctos
- Usar el barrel export de `@/shared/types`

**Error: Firebase**
- Verificar credenciales en `Credenciales.tsx`
- Verificar conexión a internet
- Verificar reglas de Firestore

## 📚 Documentación Adicional

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Documentación completa de la arquitectura
- [MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md) - Resumen de la migración
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

## 🤝 Contribuir

1. Seguir las convenciones de nombres
2. Mantener la separación de capas (Core, Features, Shared)
3. No importar entre features (usar shared para código común)
4. Documentar código complejo
5. Agregar tipos a todo

## 📞 Contacto

Para dudas o sugerencias sobre la arquitectura del proyecto, consultar:
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- Revisar código existente como ejemplo

---

**Última actualización**: Diciembre 2025
