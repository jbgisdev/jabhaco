export type CategoriaInsumo =
  | 'base_glicerina'
  | 'aditivo'
  | 'fragancia'
  | 'color'
  | 'empaque'
  | 'molde'
  | 'costo_indirecto';

export type UnidadMedida = 'gramos' | 'mililitros' | 'unidades' | 'horas' | 'metros';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'usuario';
  created_at?: string;
}

export interface Insumo {
  id: string;
  categoria: CategoriaInsumo;
  nombre: string;
  proveedor: string | null;
  unidad: UnidadMedida;
  cantidad_comprada: number;
  valor_compra: number;
  costo_unitario: number;
  costo_gota: number | null;
  activo: boolean;
  created_at?: string;
}

export interface Jabon {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  nombre: string;
  lema: string | null;
  descripcion: string | null;
  tipo_piel: string | null;
  beneficios: string | null;
  modo_uso: string | null;
  observaciones: string | null;
  foto_producto_url: string | null;
  foto_etiqueta_url: string | null;
  cliente: string | null;
  valor_venta: number;
  publicado_catalogo: boolean;
  created_at?: string;
}

export interface JabonComponente {
  id: string;
  jabon_id: string;
  insumo_id: string;
  cantidad_usada: number;
  es_en_gotas: boolean;
  costo_unitario_aplicado: number;
  subtotal_costo: number;
}

export interface VResumenJabon {
  jabon_id: string;
  nombre: string;
  valor_venta: number;
  costo_real: number;
  margen_ganancia: number;
  rentabilidad_porcentaje: number;
}

/**
 * Representación en estado frontend para un componente añadido a la receta
 */
export interface RecetaItem {
  tempId: string; // Para control de UI antes de persistir
  insumo_id: string;
  insumo: Insumo;
  cantidad_usada: number;
  es_en_gotas: boolean;
  costo_unitario_aplicado: number;
  subtotal_costo: number;
}

export interface JabonFormData {
  nombre: string;
  lema: string;
  descripcion: string;
  tipo_piel: string;
  beneficios: string;
  modo_uso: string;
  observaciones: string;
  cliente: string;
  valor_venta: number;
  publicado_catalogo: boolean;
  foto_producto_url?: string | null;
  foto_etiqueta_url?: string | null;
}

export interface NuevoInsumoFormData {
  categoria: CategoriaInsumo;
  nombre: string;
  proveedor: string;
  unidad: UnidadMedida;
  cantidad_comprada: number;
  valor_compra: number;
}

export interface JabonGuardadoItem {
  jabon: Jabon;
  componentes: RecetaItem[];
  costo_total: number;
  margen_ganancia: number;
  rentabilidad_porcentaje: number;
  isMock: boolean;
}
