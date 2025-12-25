# 🎉 Sistema POS - Point of Sale

Sistema de Punto de Venta desarrollado con Next.js 14+, TypeScript y Firebase, organizado siguiendo **Screaming Architecture**.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar en producción
npm start
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📚 Documentación

- **[QUICK-START.md](./QUICK-START.md)** - Guía rápida de inicio
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Documentación completa de la arquitectura
- **[MIGRATION-SUMMARY.md](./MIGRATION-SUMMARY.md)** - Resumen de la migración a Screaming Architecture
- **[CHECKLIST.md](./CHECKLIST.md)** - Checklist de verificación y próximos pasos

## 🏗️ Estructura del Proyecto

```
src/
├── app/              → Next.js routing
├── core/             → Lógica de negocio
│   ├── domain/      → Entidades
│   └── infrastructure/ → Firebase
├── features/         → Características (Screaming Architecture)
│   ├── sales/       → 💰 Ventas
│   ├── product-management/ → 📦 Gestión de Productos
│   ├── inventory/   → 📊 Inventario
│   ├── sales-history/ → 📋 Historial
│   ├── dashboard/   → 🏠 Dashboard
│   └── auth/        → 🔐 Autenticación
├── shared/           → Código compartido
│   ├── components/
│   └── types/
└── assets/           → Imágenes y estilos
```

## ✨ Características

- ✅ **Ventas**: Registro de ventas con código de barras
- ✅ **Gestión de Productos**: CRUD completo de productos
- ✅ **Inventario**: Control de stock y alertas
- ✅ **Historial**: Registro completo de ventas
- ✅ **Dashboard**: Acceso rápido a todas las funcionalidades
- ✅ **Autenticación**: Control de acceso

## 🛠️ Tecnologías

- **Next.js 14+** - Framework React
- **TypeScript** - Tipado estático
- **Firebase** - Base de datos y autenticación
- **CSS Modules** - Estilos

## 📖 Más Información

Para más detalles sobre la arquitectura y cómo contribuir, consulta la [documentación completa](./ARCHITECTURE.md).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
