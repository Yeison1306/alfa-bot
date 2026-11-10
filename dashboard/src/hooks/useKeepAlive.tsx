// Client-side keep-alive para mantener la sesión activa
// Se ejecuta en el navegador del usuario logueado

'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';

export function useKeepAlive(intervalMinutes = 10) {
  useEffect(() => {
    const ping = async () => {
      try {
        await fetch('/api/health', { method: 'GET', cache: 'no-store' });
      } catch {
        // Silencioso
      }
    };

    // Ping inicial
    ping();
    
    // Intervalo
    const intervalId = setInterval(ping, intervalMinutes * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [intervalMinutes]);
}

// Componente wrapper para usar en layout
export function KeepAliveProvider({ children, intervalMinutes = 10 }: { children: ReactNode; intervalMinutes?: number }) {
  useKeepAlive(intervalMinutes);
  return <>{children}</>;
}