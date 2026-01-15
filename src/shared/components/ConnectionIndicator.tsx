/**
 * Componente indicador de estado de conexión
 * Muestra si la app está online/offline
 */

'use client';

import { useOnlineStatus } from '../offline/useOnlineStatus';

interface ConnectionIndicatorProps {
  position?: 'top' | 'bottom' | 'floating';
  className?: string;
}

export const ConnectionIndicator = ({
  position = 'top',
  className = '',
}: ConnectionIndicatorProps) => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null; // No mostrar si está online
  }

  const baseStyles = `
    fixed left-0 right-0 p-3 text-center font-semibold z-50
    bg-yellow-100 border-b-2 border-yellow-500 text-yellow-900
  `;

  const positionStyles = {
    top: 'top-0',
    bottom: 'bottom-0',
    floating: 'top-4 left-4 right-auto w-auto rounded-lg shadow-lg',
  };

  return (
    <div className={`${baseStyles} ${positionStyles[position]} ${className}`}>
      <span className="inline-flex items-center gap-2">
        <span className="text-lg">📡</span>
        <span>Sin conexión a internet - Los cambios se guardarán localmente</span>
      </span>
    </div>
  );
};
