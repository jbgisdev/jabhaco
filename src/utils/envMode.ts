/**
 * Detecta si la aplicación debe ejecutarse en modo 'Calculadora Exclusiva de Pruebas'.
 * 
 * Se activa automáticamente en:
 * 1. Despliegues de Vercel (*.vercel.app).
 * 2. Si la variable de entorno VITE_MODO_CALCULADORA es 'true'.
 * 3. Si la URL contiene el parámetro ?calc o ?calculadora (útil para simular localmente).
 * 
 * En local (localhost / 127.0.0.1 sin parámetros), retorna false, permitiendo
 * continuar con el desarrollo normal del catálogo y la administración.
 */
export const isModoCalculadoraFijo = (): boolean => {
  if (typeof window === 'undefined') return false;

  // 1. Variable de entorno explícita
  if (import.meta.env.VITE_MODO_CALCULADORA === 'true') {
    return true;
  }

  // 2. Despliegue en Vercel
  if (window.location.hostname.includes('vercel.app')) {
    return true;
  }

  // 3. Parámetro query de URL (?calc o ?calculadora)
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has('calc') || params.has('calculadora')) {
      return true;
    }
  } catch {
    // ignorar en entornos sin window
  }

  return false;
};
