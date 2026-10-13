/**
 * Utilidades de formateo para Jabhaco Lab
 * Cumple con formato colombiano (COP) y visualización precisa de decimales
 */

/**
 * Formatea un valor monetario a pesos colombianos (COP).
 * Ejemplos: 32000 -> "$ 32.000", 2500 -> "$ 2.500"
 * Si tiene decimales significativos y includeDecimals es true (útil para costo unitario/g):
 * 42.5 -> "$ 42,50"
 */
export function formatCOP(value: number | null | undefined, includeDecimals = false): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '$ 0';
  }

  const rounded = Math.round(value * 100) / 100;

  if (includeDecimals && rounded % 1 !== 0) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(rounded)
      .replace('COP', '$')
      .trim();
  }

  // Formato estándar entero COP: "$ 32.000"
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
    .format(Math.round(rounded))
    .replace('COP', '$')
    .trim();
}

/**
 * Formato para costo unitario por gramo / ml con hasta 2 decimales para alta precisión
 */
export function formatCostoUnitario(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '$ 0';
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace('COP', '$')
    .trim();
}

/**
 * Formatea cantidades numéricas con soporte para decimales limpios
 * Ejemplos: 85 -> "85", 85.5 -> "85.5", 0.1 -> "0.1"
 */
export function formatDecimal(
  value: number | null | undefined,
  maxDecimals = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

/**
 * Formatea porcentaje con 1 decimal y signo %
 * Ejemplo: 42.857 -> "42.9%"
 */
export function formatPorcentaje(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${value.toFixed(1)}%`;
}

/**
 * Normaliza y capitaliza texto (primera letra mayúscula)
 */
export function capitalize(str: string | null | undefined): string {
  if (!str) return '';
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * Title Case para nombres de insumos o jabones
 */
export function toTitleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Normaliza y abrevia la unidad de medida para visualización limpia
 * metros -> mts, mililitros -> ml, gramos -> g, horas -> hrs, unidades -> und
 */
export function formatUnidadLabel(unidad: string | null | undefined): string {
  if (!unidad) return '';
  switch (unidad.toLowerCase()) {
    case 'metros':
      return 'mts';
    case 'mililitros':
      return 'ml';
    case 'gramos':
      return 'g';
    case 'horas':
      return 'hrs';
    case 'unidades':
      return 'und';
    default:
      return unidad;
  }
}

/**
 * Formatea un número o string con puntos de miles para entradas de usuario (es-CO).
 * Ejemplos: 30000 -> "30.000", 1000 -> "1.000", 1600000 -> "1.600.000"
 */
export function formatThousands(
  val: number | string | null | undefined,
  allowDecimals = false
): string {
  if (val === null || val === undefined || val === '') return '';
  const str = typeof val === 'number' ? val.toString() : val;
  if (allowDecimals && (str.includes('.') || str.includes(','))) {
    const parts = str.replace(',', '.').split('.');
    const intPart = parts[0].replace(/\D/g, '');
    const decPart = parts.slice(1).join('').replace(/\D/g, '');
    const formattedInt = intPart ? parseInt(intPart, 10).toLocaleString('es-CO') : '0';
    return decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt;
  }
  const cleanInt = str.replace(/\D/g, '');
  if (!cleanInt) return '';
  return parseInt(cleanInt, 10).toLocaleString('es-CO');
}

/**
 * Parsea un string con puntos de miles a número float para cálculos y bases de datos.
 * Ejemplos: "30.000" -> 30000, "1.000" -> 1000, "1.000,5" -> 1000.5
 */
export function parseThousands(val: string | null | undefined): number {
  if (!val) return 0;
  const normalized = val.replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}
