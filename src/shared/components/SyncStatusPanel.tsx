/**
 * Componente avanzado para mostrar estado detallado de sincronización
 * Incluye indicador de conexión, cola pendiente y progreso
 */

'use client';

import React, { useState } from 'react';
import { useSyncStatus } from './useSyncStatus';
import { useOnlineStatus } from './useOnlineStatus';

interface SyncStatusPanelProps {
  position?: 'top' | 'bottom' | 'floating';
  showDetails?: boolean;
  onClearQueue?: () => void;
}

export const SyncStatusPanel: React.FC<SyncStatusPanelProps> = ({
  position = 'floating',
  showDetails = false,
  onClearQueue,
}) => {
  const syncStatus = useSyncStatus();
  const [isExpanded, setIsExpanded] = useState(false);

  const positionClasses = {
    top: 'fixed top-0 left-0 right-0 z-40',
    bottom: 'fixed bottom-0 left-0 right-0 z-40',
    floating: 'fixed bottom-4 right-4 z-40',
  };

  const getConnectionIcon = () => {
    if (syncStatus.isOnline) {
      return syncStatus.isSyncing ? '🔄' : '✅';
    }
    return '📡';
  };

  const getConnectionText = () => {
    if (syncStatus.isOnline) {
      return syncStatus.isSyncing ? 'Sincronizando...' : 'Conectado';
    }
    return 'Sin conexión';
  };

  const getBackgroundColor = () => {
    if (!syncStatus.isOnline) return '#fef3c7'; // Amarillo para offline
    if (syncStatus.isSyncing) return '#dbeafe'; // Azul para sincronizando
    return '#dcfce7'; // Verde para conectado
  };

  const getBorderColor = () => {
    if (!syncStatus.isOnline) return '#fcd34d';
    if (syncStatus.isSyncing) return '#93c5fd';
    return '#86efac';
  };

  if (position === 'floating') {
    return (
      <div
        className={positionClasses[position]}
        style={{
          backgroundColor: getBackgroundColor(),
          border: `2px solid ${getBorderColor()}`,
          borderRadius: '8px',
          padding: '12px 16px',
          minWidth: '200px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{getConnectionIcon()}</span>
          <span style={{ fontWeight: '500' }}>{getConnectionText()}</span>
          {syncStatus.pendingCount > 0 && (
            <span
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 'bold',
                marginLeft: 'auto',
              }}
            >
              {syncStatus.pendingCount}
            </span>
          )}
        </div>

        {isExpanded && (
          <div style={{ marginTop: '12px', borderTop: '1px solid rgba(0, 0, 0, 0.1)', paddingTop: '12px' }}>
            <div style={{ fontSize: '12px', marginBottom: '8px' }}>
              <p style={{ margin: '4px 0' }}>
                <strong>Estado:</strong> {syncStatus.isOnline ? 'En línea' : 'Desconectado'}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Sincronizando:</strong> {syncStatus.isSyncing ? 'Sí' : 'No'}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Pendientes:</strong> {syncStatus.pendingCount}
              </p>
              {syncStatus.lastSyncTime && (
                <p style={{ margin: '4px 0' }}>
                  <strong>Última sincronización:</strong>{' '}
                  {syncStatus.lastSyncTime.toLocaleTimeString()}
                </p>
              )}
            </div>

            {syncStatus.pendingCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  syncStatus.clearQueue();
                }}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                Limpiar Cola
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Versión para top/bottom
  return (
    <div
      className={positionClasses[position]}
      style={{
        backgroundColor: getBackgroundColor(),
        borderRight: `4px solid ${getBorderColor()}`,
        padding: '12px 16px',
        boxShadow: position === 'top' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 -4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{getConnectionIcon()}</span>
          <span style={{ fontWeight: '500' }}>{getConnectionText()}</span>
          {syncStatus.pendingCount > 0 && (
            <span style={{ fontSize: '12px', color: '#666' }}>
              ({syncStatus.pendingCount} pendientes)
            </span>
          )}
        </div>

        {syncStatus.pendingCount > 0 && (
          <button
            onClick={syncStatus.clearQueue}
            style={{
              padding: '4px 12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Componente compacto solo para indicador de conexión
 */
export const CompactConnectionIndicator: React.FC<{
  hideWhenOnline?: boolean;
}> = ({ hideWhenOnline = true }) => {
  const isOnline = useOnlineStatus();

  if (hideWhenOnline && isOnline) {
    return null;
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        backgroundColor: isOnline ? '#dcfce7' : '#fef3c7',
        border: `1px solid ${isOnline ? '#86efac' : '#fcd34d'}`,
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
      }}
    >
      <span>{isOnline ? '✅' : '📡'}</span>
      <span>{isOnline ? 'En línea' : 'Sin conexión'}</span>
    </div>
  );
};

/**
 * Modal/Drawer para ver detalles completos de la sincronización
 */
export const SyncDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const syncStatus = useSyncStatus();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>Detalles de Sincronización</h2>

        <div style={{ marginBottom: '16px' }}>
          <p>
            <strong>Estado de conexión:</strong> {syncStatus.isOnline ? 'En línea' : 'Sin conexión'}
          </p>
          <p>
            <strong>Sincronizando:</strong> {syncStatus.isSyncing ? 'Sí' : 'No'}
          </p>
          <p>
            <strong>Operaciones pendientes:</strong> {syncStatus.pendingCount}
          </p>
        </div>

        {syncStatus.pendingOperations.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h3>Operaciones Pendientes:</h3>
            <div
              style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '4px',
                padding: '12px',
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {syncStatus.pendingOperations.map((op, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px',
                    borderBottom: idx < syncStatus.pendingOperations.length - 1 ? '1px solid #e5e7eb' : 'none',
                    fontSize: '12px',
                  }}
                >
                  <p style={{ margin: '0 0 4px 0' }}>
                    <strong>{op.type || 'unknown'}</strong>
                  </p>
                  <pre
                    style={{
                      margin: 0,
                      fontSize: '11px',
                      overflow: 'auto',
                      color: '#666',
                    }}
                  >
                    {JSON.stringify(op, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {syncStatus.syncError && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '16px',
            }}
          >
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#991b1b' }}>
              Error de Sincronización:
            </p>
            <p style={{ margin: 0, color: '#7f1d1d', fontSize: '12px' }}>
              {syncStatus.syncError.message}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          {syncStatus.pendingCount > 0 && (
            <button
              onClick={syncStatus.clearQueue}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Limpiar Cola
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e5e7eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
