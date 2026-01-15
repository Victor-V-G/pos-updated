/**
 * EJEMPLO: Cómo integrar offline-first en un componente de Ventas
 * Este archivo muestra cómo modificar un componente existente
 */

// ============= ANTES (Sin offline) =============
/*
import { useState } from 'react';
import { guardarVentaPromise } from '@/core/infrastructure/firebase/Promesas';

export function RealizarVentaComponentBefore() {
  const [venta, setVenta] = useState(null);

  const handleCompleteSale = async () => {
    try {
      await guardarVentaPromise(venta);
      alert('Venta guardada exitosamente');
    } catch (error) {
      alert('Error al guardar la venta');
    }
  };

  return (
    <div>
      <button onClick={handleCompleteSale}>Guardar Venta</button>
    </div>
  );
}
*/

// ============= DESPUÉS (Con offline) =============

import { useState } from 'react';
import { useOfflineSync } from '@/core/infrastructure/offline';
import { guardarVentaPromise } from '@/core/infrastructure/firebase/Promesas';

export function RealizarVentaComponentAfter() {
  const [venta, setVenta] = useState(null);
  const { saveSale, isOnline } = useOfflineSync();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleCompleteSale = async () => {
    try {
      setIsSyncing(true);
      const result = await saveSale(venta, guardarVentaPromise);
      
      if (result.offline) {
        alert('✅ Venta guardada localmente. Se sincronizará cuando haya conexión.');
      } else {
        alert('✅ Venta guardada en el servidor');
      }
    } catch (error) {
      alert('❌ Error al guardar la venta');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div>
      {/* Mostrar indicador de conexión */}
      {!isOnline && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #fcd34d',
          color: '#92400e',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '10px',
          fontSize: '14px',
        }}>
          📡 Trabajando sin conexión. Los cambios se sincronizarán automáticamente.
        </div>
      )}

      <button 
        onClick={handleCompleteSale}
        disabled={isSyncing}
        style={{
          opacity: isSyncing ? 0.5 : 1,
          cursor: isSyncing ? 'not-allowed' : 'pointer',
        }}
      >
        {isSyncing ? 'Guardando...' : 'Guardar Venta'}
      </button>
    </div>
  );
}

// ============= EJEMPLO: Componente de Productos =============

import { useEffect } from 'react';
import { obtenerProductosPromise, registrarProductoPromise } from '@/core/infrastructure/firebase/Promesas';

export function GestionProductosComponentAfter() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { saveProduct, getProducts, isOnline } = useOfflineSync();

  // Cargar productos (combina Firebase + offline)
  const loadProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await getProducts(obtenerProductosPromise);
      setProductos(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async (nuevoProducto: any) => {
    try {
      const result = await saveProduct(nuevoProducto, registrarProductoPromise);
      
      if (result.offline) {
        console.log('Producto guardado localmente');
      } else {
        console.log('Producto guardado en Firebase');
      }

      // Recargar productos
      await loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <div>
      {!isOnline && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fef3c7', 
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          📡 Sin conexión - Los productos se guardarán localmente
        </div>
      )}

      {loading ? <p>Cargando...</p> : (
        <div>
          {/* Mostrar productos */}
          {productos.map((producto: any) => (
            <div key={producto.id}>
              <h3>{producto.NombreProducto}</h3>
              <p>Stock: {producto.Stock}</p>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => handleAddProduct({ NombreProducto: 'Nuevo Producto' })}>
        Agregar Producto
      </button>
    </div>
  );
}

// ============= EJEMPLO: Hook personalizado para un caso específico =============

export const useProductManagement = () => {
  const { saveProduct, getProducts, isOnline } = useOfflineSync();

  const addProduct = async (producto: any) => {
    return saveProduct(producto, (data) => {
      // Aquí puedes hacer cualquier transformación
      return guardarProductoPromise({
        ...data,
        timestamp: new Date().toISOString(),
      });
    });
  };

  return {
    addProduct,
    isOnline,
    getProducts,
  };
};

// Uso:
/*
export function MyProductComponent() {
  const { addProduct, isOnline } = useProductManagement();

  return (
    <button onClick={() => addProduct({ name: 'Test' })}>
      Agregar {!isOnline && '(Offline)'}
    </button>
  );
}
*/
