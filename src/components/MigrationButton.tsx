'use client';

import React, { useState } from 'react';
import { migrateProducts, verifyMigration } from '../scripts/migrateProducts';

/**
 * Componente para ejecutar la migración de productos desde la UI
 * Uso: Agregar este componente temporalmente a cualquier página admin
 */
export const MigrationButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);

  const handleMigrate = async () => {
    if (!confirm('¿Estás seguro de ejecutar la migración? Esto actualizará TODOS los productos en Firebase.')) {
      return;
    }

    setLoading(true);
    setResult(null);
    setVerification(null);

    try {
      console.log('Iniciando migración...');
      const migrateResult = await migrateProducts();
      setResult(migrateResult);

      // Verificar automáticamente después de migrar
      console.log('Verificando migración...');
      const verifyResult = await verifyMigration();
      setVerification(verifyResult);

      alert(`✅ Migración completada!\n\nProductos actualizados: ${migrateResult.count}\nErrores: ${migrateResult.errors}`);
    } catch (error) {
      console.error('Error en migración:', error);
      alert(`❌ Error en la migración: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setVerification(null);

    try {
      console.log('Verificando productos...');
      const verifyResult = await verifyMigration();
      setVerification(verifyResult);
    } catch (error) {
      console.error('Error en verificación:', error);
      alert(`❌ Error en la verificación: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '20px',
      backgroundColor: '#fff',
      border: '2px solid #333',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      zIndex: 9999,
      maxWidth: '400px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>
        🔧 Migración de Productos
      </h3>

      <div style={{ marginBottom: '15px', fontSize: '14px', color: '#555' }}>
        <p style={{ margin: '0 0 8px 0' }}>Esta migración:</p>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>Agrega TipoProducto: "unidad"</li>
          <li>Convierte Stock y Precio a string</li>
          <li>Elimina el campo "cantidad"</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button
          onClick={handleMigrate}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Procesando...' : '▶️ Ejecutar Migración'}
        </button>

        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔍 Verificar
        </button>
      </div>

      {result && (
        <div style={{
          padding: '10px',
          backgroundColor: result.success ? '#e8f5e9' : '#ffebee',
          borderRadius: '4px',
          fontSize: '13px',
          marginBottom: '10px'
        }}>
          <strong>Resultado:</strong>
          <div>✅ Actualizados: {result.count}</div>
          <div>❌ Errores: {result.errors}</div>
        </div>
      )}

      {verification && (
        <div style={{
          padding: '10px',
          backgroundColor: verification.success ? '#e8f5e9' : '#fff3e0',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <strong>Verificación:</strong>
          <div>📦 Total: {verification.total}</div>
          <div>✅ Con TipoProducto: {verification.conTipoProducto}</div>
          <div>⚠️ Sin TipoProducto: {verification.sinTipoProducto}</div>
          <div>🗑️ Con "cantidad": {verification.conCantidad}</div>
          <div>🔢 Stock number: {verification.stockNumber}</div>
          <div>💰 Precio number: {verification.precioNumber}</div>
        </div>
      )}

      <div style={{ fontSize: '11px', color: '#999', marginTop: '10px' }}>
        💡 Revisa la consola del navegador para ver los detalles
      </div>
    </div>
  );
};

export default MigrationButton;
