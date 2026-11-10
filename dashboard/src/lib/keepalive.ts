// Keep-alive interno para Render Free Tier
// Se auto-ejecutaría en el servidor, pero en Render Free el proceso duerme
// Este módulo exporta la lógica para ser usada en un cron job externo o en el cliente

export function startKeepAlive(intervalMinutes = 10) {
  if (typeof window === 'undefined') {
    // Lado servidor: en Render Free esto NO funciona porque el proceso duerme
    // Se incluye por compatibilidad si se usa en VPS/servidor propio
    const intervalMs = intervalMinutes * 60 * 1000;
    
    const ping = async () => {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
        const response = await fetch(`${baseUrl}/api/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          console.log(`[KeepAlive] ${new Date().toISOString()} - Health check OK`);
        } else {
          console.warn(`[KeepAlive] ${new Date().toISOString()} - Health check failed: ${response.status}`);
        }
      } catch (error) {
        console.error(`[KeepAlive] ${new Date().toISOString()} - Error:`, error);
      }
    };

    // Ping inicial
    ping();
    
    // Intervalo
    const intervalId = setInterval(ping, intervalMs);
    
    // Cleanup en señales de terminación
    process.on('SIGTERM', () => clearInterval(intervalId));
    process.on('SIGINT', () => clearInterval(intervalId));
    
    return intervalId;
  }
  
  // Lado cliente: no aplica
  return null;
}

export function stopKeepAlive(intervalId: NodeJS.Timeout | null) {
  if (intervalId) clearInterval(intervalId);
}

// Función para ser llamada desde un cron job externo (GitHub Actions, cron-job.org, etc.)
export async function externalPing(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Helper para generar configuración de cron-job.org / UptimeRobot
export function generateCronConfig(baseUrl: string) {
  return {
    url: `${baseUrl}/api/health`,
    method: 'GET',
    intervalMinutes: 10,
    expectedStatus: 200,
    timeoutSeconds: 30,
    headers: {
      'User-Agent': 'Alfa-Dashboard-KeepAlive/1.0',
    },
  };
}