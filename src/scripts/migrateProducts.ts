/**
 * Script de migración de productos
 * Agrega TipoProducto: "unidad" a todos los productos que no lo tienen
 * Elimina campos no deseados como "cantidad"
 */

import { collection, getDocs, updateDoc, doc, deleteField } from 'firebase/firestore';
import { db } from '../core/infrastructure/firebase/Conexion';

interface ProductoFirebase {
  id?: string;
  NombreProducto?: string;
  CodigoDeBarras?: string;
  Precio?: string | number;
  Stock?: string | number;
  TipoProducto?: 'unidad' | 'peso';
}

export const migrateProducts = async () => {
  try {
    console.log('🔄 Iniciando migración de productos...');

    // Obtener todos los productos (nombre correcto de colección con mayúscula)
    const productosRef = collection(db, 'Productos');
    const snapshot = await getDocs(productosRef);

    if (snapshot.empty) {
      console.log('⚠️ No hay productos para migrar');
      return { success: true, count: 0, errors: 0 };
    }

    console.log(`📦 Encontrados ${snapshot.size} productos para migrar`);

    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Actualizar cada producto
    for (const docSnapshot of snapshot.docs) {
      try {
        const productoId = docSnapshot.id;
        const productoData = docSnapshot.data() as ProductoFirebase;

        // Preparar las actualizaciones necesarias
        const updates: any = {};

        // 1. Agregar TipoProducto si no existe
        if (!productoData.TipoProducto) {
          updates.TipoProducto = 'unidad';
          console.log(`  ✏️ Agregando TipoProducto: "unidad" a: ${productoData.NombreProducto || productoId}`);
        }

        // 2. Convertir Stock a string si es number
        if (productoData.Stock !== undefined && typeof productoData.Stock === 'number') {
          updates.Stock = String(productoData.Stock);
          console.log(`  🔢 Convirtiendo Stock de number ${productoData.Stock} a string "${String(productoData.Stock)}" en: ${productoData.NombreProducto || productoId}`);
        }

        // 3. Convertir Precio a string si es number
        if (productoData.Precio !== undefined && typeof productoData.Precio === 'number') {
          updates.Precio = String(productoData.Precio);
          console.log(`  💰 Convirtiendo Precio de number ${productoData.Precio} a string "${String(productoData.Precio)}" en: ${productoData.NombreProducto || productoId}`);
        }

        // 4. Eliminar campo "cantidad" si existe (campo temporal que no debe guardarse)
        if ('cantidad' in productoData) {
          updates.cantidad = deleteField();
          console.log(`  🗑️ Eliminando campo "cantidad" de: ${productoData.NombreProducto || productoId}`);
        }

        // Solo actualizar si hay cambios
        if (Object.keys(updates).length > 0) {
          const docRef = doc(db, 'Productos', productoId);
          await updateDoc(docRef, updates);
          console.log(`  ✅ Actualizado: ${productoData.NombreProducto || productoId}`);
          successCount++;
        } else {
          console.log(`  ⏭️ Sin cambios necesarios: ${productoData.NombreProducto || productoId}`);
        }

      } catch (error) {
        console.error(`  ❌ Error actualizando producto:`, error);
        errorCount++;
        errors.push({ id: docSnapshot.id, error });
      }
    }

    console.log('\n📊 Resumen de migración:');
    console.log(`  ✅ Productos actualizados: ${successCount}`);
    console.log(`  ❌ Errores: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\n⚠️ Detalles de errores:');
      errors.forEach(({ id, error }) => {
        console.log(`  - Producto ID ${id}:`, error);
      });
    }

    return {
      success: errorCount === 0,
      count: successCount,
      errors: errorCount,
      errorDetails: errors
    };

  } catch (error) {
    console.error('❌ Error crítico en la migración:', error);
    throw error;
  }
};

// Función auxiliar para verificar productos después de la migración
export const verifyMigration = async () => {
  try {
    console.log('\n🔍 Verificando migración...');

    const productosRef = collection(db, 'Productos');
    const snapshot = await getDocs(productosRef);

    let sinTipoProducto = 0;
    let conTipoProducto = 0;
    let conCantidad = 0;
    let stockNumber = 0;
    let precioNumber = 0;

    snapshot.docs.forEach((docSnapshot) => {
      const producto = docSnapshot.data() as ProductoFirebase;

      if (!producto.TipoProducto) {
        sinTipoProducto++;
        console.log(`  ⚠️ Sin TipoProducto: ${producto.NombreProducto || docSnapshot.id}`);
      } else {
        conTipoProducto++;
      }

      if ('cantidad' in producto) {
        conCantidad++;
        console.log(`  ⚠️ Tiene campo "cantidad": ${producto.NombreProducto || docSnapshot.id}`);
      }

      if (typeof producto.Stock === 'number') {
        stockNumber++;
        console.log(`  ⚠️ Stock es number: ${producto.NombreProducto || docSnapshot.id}`);
      }

      if (typeof producto.Precio === 'number') {
        precioNumber++;
        console.log(`  ⚠️ Precio es number: ${producto.NombreProducto || docSnapshot.id}`);
      }
    });

    console.log('\n📊 Resultado de verificación:');
    console.log(`  Total productos: ${snapshot.size}`);
    console.log(`  ✅ Con TipoProducto: ${conTipoProducto}`);
    console.log(`  ⚠️ Sin TipoProducto: ${sinTipoProducto}`);
    console.log(`  🗑️ Con campo "cantidad": ${conCantidad}`);
    console.log(`  🔢 Stock es number: ${stockNumber}`);
    console.log(`  💰 Precio es number: ${precioNumber}`);

    const allGood = sinTipoProducto === 0 && conCantidad === 0 && stockNumber === 0 && precioNumber === 0;
    console.log(allGood ? '\n✅ Todos los productos están correctos!' : '\n⚠️ Aún hay productos por migrar');

    return {
      total: snapshot.size,
      conTipoProducto,
      sinTipoProducto,
      conCantidad,
      stockNumber,
      precioNumber,
      success: allGood
    };

  } catch (error) {
    console.error('❌ Error en verificación:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (typeof window !== 'undefined') {
  console.log('💡 Script de migración cargado. Usa las funciones:');
  console.log('  - migrateProducts() para ejecutar la migración');
  console.log('  - verifyMigration() para verificar los resultados');
}
