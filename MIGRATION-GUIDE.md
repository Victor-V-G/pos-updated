# 🔧 Migración de Productos - Actualización de Base de Datos

## 📋 Descripción
Este script actualiza automáticamente todos los productos en Firebase para:
- ✅ Agregar `TipoProducto: "unidad"` a todos los productos
- ✅ Convertir el campo `Stock` de string a Number
- ✅ Convertir el campo `Precio` de string a Number (bonus)

## 🚀 Cómo Ejecutar la Migración

### Método 1: Desde la Interfaz (Recomendado)

1. **Inicia la aplicación**:
   ```bash
   npm run dev
   ```

2. **Accede a la página de Inicio** en tu aplicación

3. **Verás un panel flotante** en la esquina inferior derecha con el título "🔧 Migración de Productos"

4. **Opciones disponibles**:
   - **🔍 Verificar**: Revisa cuántos productos necesitan migración (sin hacer cambios)
   - **▶️ Ejecutar Migración**: Actualiza todos los productos (solicita confirmación)

5. **Sigue estos pasos**:
   ```
   a) Haz clic en "🔍 Verificar" para ver el estado actual
   b) Si hay productos sin actualizar, haz clic en "▶️ Ejecutar Migración"
   c) Confirma la acción en el diálogo
   d) Espera a que termine (verás el progreso en consola)
   e) Revisa los resultados en el panel y en la consola del navegador
   f) Haz clic nuevamente en "🔍 Verificar" para confirmar que todo está correcto
   ```

6. **Revisar logs detallados**:
   - Abre DevTools (F12)
   - Ve a la pestaña Console
   - Verás logs detallados de cada producto actualizado

### Método 2: Desde la Consola del Navegador

1. **Inicia la aplicación** y abre DevTools (F12)

2. **Ve a la pestaña Console**

3. **Ejecuta los siguientes comandos**:

   ```javascript
   // Importar las funciones (solo si no están disponibles)
   const { migrateProducts, verifyMigration } = await import('./scripts/migrateProducts');

   // Verificar estado actual (sin hacer cambios)
   await verifyMigration();

   // Ejecutar migración
   await migrateProducts();

   // Verificar nuevamente después de migrar
   await verifyMigration();
   ```

## 📊 Qué Hace el Script

### Proceso de Migración

Para cada producto en la base de datos:

1. **TipoProducto**:
   - ✅ Si NO tiene `TipoProducto` → Agrega `TipoProducto: "unidad"`
   - ⏭️ Si ya tiene `TipoProducto` → No hace nada

2. **Stock**:
   - ✅ Si es string (ej: "100") → Convierte a Number (100)
   - ✅ Si no es número válido → Convierte a 0
   - ⏭️ Si ya es Number → No hace nada

3. **Precio** (bonus):
   - ✅ Si es string (ej: "1500") → Convierte a Number (1500)
   - ✅ Si no es número válido → Convierte a 0
   - ⏭️ Si ya es Number → No hace nada

### Ejemplo de Cambios

**ANTES:**
```javascript
{
  id: "prod-001",
  NombreProducto: "Coca Cola",
  CodigoDeBarras: "7790001",
  Precio: "1500",        // ❌ string
  Stock: "50"            // ❌ string
  // ❌ falta TipoProducto
}
```

**DESPUÉS:**
```javascript
{
  id: "prod-001",
  NombreProducto: "Coca Cola",
  CodigoDeBarras: "7790001",
  Precio: 1500,           // ✅ Number
  Stock: 50,              // ✅ Number
  TipoProducto: "unidad"  // ✅ Agregado
}
```

## 📈 Resultados Esperados

Después de ejecutar la migración verás:

```
🔄 Iniciando migración de productos...
📦 Encontrados 45 productos para migrar
  ✏️ Agregando TipoProducto a: Coca Cola
  🔢 Convirtiendo Stock de "50" a 50 en: Coca Cola
  💰 Convirtiendo Precio de "1500" a 1500 en: Coca Cola
  ✅ Actualizado: Coca Cola
  ...

📊 Resumen de migración:
  ✅ Productos actualizados: 45
  ❌ Errores: 0

🔍 Verificando migración...
📊 Resultado de verificación:
  Total productos: 45
  Sin TipoProducto: 0
  Stock como string: 0
  Precio como string: 0

✅ Migración exitosa!
```

## ⚠️ Importante

### Antes de Ejecutar
- ✅ Asegúrate de tener conexión a internet
- ✅ Verifica que estás conectado a la base de datos correcta
- ✅ Haz backup de Firebase (opcional pero recomendado)
- ✅ Cierra otras pestañas que puedan estar usando la aplicación

### Después de Ejecutar
- ✅ Verifica los resultados en el panel y consola
- ✅ Prueba que los productos se muestran correctamente
- ✅ Verifica que las ventas funcionan correctamente
- ✅ **ELIMINA el componente MigrationButton** de InicioComponent.tsx

## 🗑️ Limpieza Después de la Migración

Una vez que hayas ejecutado exitosamente la migración:

1. **Elimina el import en InicioComponent.tsx**:
   ```typescript
   // ELIMINAR esta línea:
   import MigrationButton from '@/components/MigrationButton';
   ```

2. **Elimina el componente del render**:
   ```typescript
   // ELIMINAR estas líneas:
   {/* Botón de migración (remover después de ejecutar) */}
   <MigrationButton />
   ```

3. **Opcional - Eliminar archivos de migración**:
   - `src/scripts/migrateProducts.ts`
   - `src/components/MigrationButton.tsx`
   - Este archivo README

## 🐛 Solución de Problemas

### Error: "Cannot read properties of undefined"
- **Causa**: Firebase no está inicializado correctamente
- **Solución**: Verifica Credenciales.tsx y conexión a internet

### Error: "Permission denied"
- **Causa**: Reglas de seguridad de Firebase
- **Solución**: Asegúrate de tener permisos de escritura en la colección productos

### No se actualizan todos los productos
- **Causa**: Errores individuales en algunos productos
- **Solución**: Revisa la consola para ver qué productos fallaron

### "0 productos encontrados"
- **Causa**: No hay productos en la base de datos o estás viendo la DB equivocada
- **Solución**: Verifica las credenciales de Firebase

## 📝 Archivos Creados

```
src/
  scripts/
    migrateProducts.ts       # Script principal de migración
  components/
    MigrationButton.tsx      # Componente UI para ejecutar migración
  features/
    dashboard/
      components/
        InicioComponent.tsx  # Modificado para mostrar el botón
```

## ✅ Checklist de Migración

- [ ] Hacer backup de Firebase (opcional)
- [ ] Verificar conexión a internet
- [ ] Iniciar aplicación (`npm run dev`)
- [ ] Acceder a página de Inicio
- [ ] Hacer clic en "🔍 Verificar" para ver estado actual
- [ ] Hacer clic en "▶️ Ejecutar Migración"
- [ ] Confirmar en el diálogo
- [ ] Esperar a que termine
- [ ] Revisar resultados en consola
- [ ] Hacer clic nuevamente en "🔍 Verificar" para confirmar
- [ ] Probar que productos funcionan correctamente
- [ ] Eliminar MigrationButton de InicioComponent.tsx
- [ ] Eliminar archivos de migración (opcional)

## 🎯 ¿Necesitas Ayuda?

Si encuentras problemas:
1. Revisa la consola del navegador para ver errores detallados
2. Verifica que tengas permisos en Firebase
3. Asegúrate de estar en la base de datos correcta
4. Verifica que la estructura de productos en Firebase sea la esperada

---

**Última actualización**: Enero 2026
