import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Insumo,
  CategoriaInsumo,
  UnidadMedida,
  JabonFormData,
  RecetaItem,
  Jabon,
  JabonGuardadoItem,
} from '../types/database.types';

// Mock data inicial para pruebas cuando aún no se conecte con las credenciales de Supabase
const MOCK_INSUMOS_STORAGE_KEY = 'jabhaco_mock_insumos';

const MOCK_BASES_INICIALES: Insumo[] = [
  // Bases de Glicerina
  {
    id: 'base-001',
    categoria: 'base_glicerina',
    nombre: 'Base Glicerina Cristal (Transparente)',
    proveedor: 'Químicos del Valle',
    unidad: 'gramos',
    cantidad_comprada: 1000,
    valor_compra: 28000,
    costo_unitario: 28, // 28 COP / gramo
    costo_gota: null,
    activo: true,
  },
  {
    id: 'base-002',
    categoria: 'base_glicerina',
    nombre: 'Base Glicerina Blanca Opaca (Dióxido de Titanio)',
    proveedor: 'Laboratorios Jaboneros Bogotá',
    unidad: 'gramos',
    cantidad_comprada: 1000,
    valor_compra: 30000,
    costo_unitario: 30, // 30 COP / gramo
    costo_gota: null,
    activo: true,
  },
  {
    id: 'base-003',
    categoria: 'base_glicerina',
    nombre: 'Base Glicerina con Manteca de Karité',
    proveedor: 'BioEsencias Colombia',
    unidad: 'gramos',
    cantidad_comprada: 500,
    valor_compra: 22500,
    costo_unitario: 45, // 45 COP / gramo
    costo_gota: null,
    activo: true,
  },
  {
    id: 'base-004',
    categoria: 'base_glicerina',
    nombre: 'Base Glicerina con Miel de Abejas Natural',
    proveedor: 'EcoAromas Medellín',
    unidad: 'gramos',
    cantidad_comprada: 1000,
    valor_compra: 34000,
    costo_unitario: 34, // 34 COP / gramo
    costo_gota: null,
    activo: true,
  },
  {
    id: 'base-005',
    categoria: 'base_glicerina',
    nombre: 'Base Glicerina de Avena y Leche de Cabra',
    proveedor: 'BioEsencias Colombia',
    unidad: 'gramos',
    cantidad_comprada: 500,
    valor_compra: 24000,
    costo_unitario: 48, // 48 COP / gramo
    costo_gota: null,
    activo: true,
  },
  // Aditivos Botánicos, Polvos y Extractos
  {
    id: 'adt-001',
    categoria: 'aditivo',
    nombre: 'Harina de Avena Coloidal Ultrafina',
    proveedor: 'Molinos BioSalud',
    unidad: 'gramos',
    cantidad_comprada: 250,
    valor_compra: 15000,
    costo_unitario: 60, // 60 COP / gramo
    costo_gota: null,
    activo: true,
  },
  {
    id: 'adt-002',
    categoria: 'aditivo',
    nombre: 'Arcilla Rosa Francesa de Alta Pureza',
    proveedor: 'Mineral & Spa Colombia',
    unidad: 'gramos',
    cantidad_comprada: 100,
    valor_compra: 18000,
    costo_unitario: 180, // 180 COP / gramo
    costo_gota: null,
    activo: true,
  },
  {
    id: 'adt-003',
    categoria: 'aditivo',
    nombre: 'Carbón Activado de Bambú Grado Cosmético',
    proveedor: 'EcoAromas Medellín',
    unidad: 'gramos',
    cantidad_comprada: 100,
    valor_compra: 14000,
    costo_unitario: 140, // 140 COP / gramo
    costo_gota: null,
    activo: true,
  },
  {
    id: 'adt-004',
    categoria: 'aditivo',
    nombre: 'Vitamina E Líquida (Tocoferol Puro)',
    proveedor: 'BioEsencias Colombia',
    unidad: 'mililitros',
    cantidad_comprada: 60,
    valor_compra: 24000,
    costo_unitario: 400, // 400 COP / ml
    costo_gota: 20, // 20 COP / gota (20 gotas por ml)
    activo: true,
  },
  {
    id: 'adt-005',
    categoria: 'aditivo',
    nombre: 'Extracto Glicólico de Caléndula y Manzanilla',
    proveedor: 'Químicos del Valle',
    unidad: 'mililitros',
    cantidad_comprada: 120,
    valor_compra: 21600,
    costo_unitario: 180, // 180 COP / ml
    costo_gota: 9,
    activo: true,
  },
  {
    id: 'adt-006',
    categoria: 'aditivo',
    nombre: 'Café Orgánico Tostado Molido Exfoliante',
    proveedor: 'Finca Café Taller',
    unidad: 'gramos',
    cantidad_comprada: 500,
    valor_compra: 16000,
    costo_unitario: 32, // 32 COP / g
    costo_gota: null,
    activo: true,
  },
  // Fragancias y Aceites Esenciales
  {
    id: 'frg-001',
    categoria: 'fragancia',
    nombre: 'Aceite Esencial Puro de Lavanda Francesa',
    proveedor: 'Aromas del Huila',
    unidad: 'mililitros',
    cantidad_comprada: 30,
    valor_compra: 33000,
    costo_unitario: 1100, // 1100 COP / ml
    costo_gota: 55, // 55 COP / gota
    activo: true,
  },
  {
    id: 'frg-002',
    categoria: 'fragancia',
    nombre: 'Esencia Cosmética de Coco & Vainilla Tropical',
    proveedor: 'BioEsencias Colombia',
    unidad: 'mililitros',
    cantidad_comprada: 100,
    valor_compra: 28000,
    costo_unitario: 280, // 280 COP / ml
    costo_gota: 14,
    activo: true,
  },
  {
    id: 'frg-003',
    categoria: 'fragancia',
    nombre: 'Aceite Esencial de Romero & Eucalipto',
    proveedor: 'EcoAromas Medellín',
    unidad: 'mililitros',
    cantidad_comprada: 50,
    valor_compra: 26000,
    costo_unitario: 520, // 520 COP / ml
    costo_gota: 26,
    activo: true,
  },
  // Colorantes y Micas Minerales
  {
    id: 'col-001',
    categoria: 'color',
    nombre: 'Mica Mineral Oro Dorado Perlada (Cosmetic Grade)',
    proveedor: 'Pigmentos del Valle',
    unidad: 'gramos',
    cantidad_comprada: 50,
    valor_compra: 17500,
    costo_unitario: 350, // 350 COP / g
    costo_gota: null,
    activo: true,
  },
  {
    id: 'col-002',
    categoria: 'color',
    nombre: 'Mica Mineral Azul Océano Brillante',
    proveedor: 'Pigmentos del Valle',
    unidad: 'gramos',
    cantidad_comprada: 50,
    valor_compra: 17500,
    costo_unitario: 350, // 350 COP / g
    costo_gota: null,
    activo: true,
  },
  {
    id: 'col-003',
    categoria: 'color',
    nombre: 'Colorante Líquido Rojo Carmín Jabonero',
    proveedor: 'Laboratorios Jaboneros Bogotá',
    unidad: 'mililitros',
    cantidad_comprada: 60,
    valor_compra: 12000,
    costo_unitario: 200, // 200 COP / ml
    costo_gota: 10,
    activo: true,
  },
  {
    id: 'col-004',
    categoria: 'color',
    nombre: 'Óxido de Hierro Verde Oliva Natural',
    proveedor: 'Mineral & Spa Colombia',
    unidad: 'gramos',
    cantidad_comprada: 100,
    valor_compra: 19000,
    costo_unitario: 190, // 190 COP / g
    costo_gota: null,
    activo: true,
  },
  // Empaques
  {
    id: 'emp-001',
    categoria: 'empaque',
    nombre: 'Caja Kraft Plegable Ecológica con Ventana (100g)',
    proveedor: 'EcoEmpaques Colombia',
    unidad: 'unidades',
    cantidad_comprada: 100,
    valor_compra: 65000,
    costo_unitario: 650, // 650 COP por unidad
    costo_gota: null,
    activo: true,
  },
  {
    id: 'emp-002',
    categoria: 'empaque',
    nombre: 'Faja / Etiqueta Adhesiva Botánica Personalizada',
    proveedor: 'Imprenta Gráfica Express',
    unidad: 'unidades',
    cantidad_comprada: 200,
    valor_compra: 40000,
    costo_unitario: 200, // 200 COP por unidad
    costo_gota: null,
    activo: true,
  },
  {
    id: 'emp-003',
    categoria: 'empaque',
    nombre: 'Papel Manteca Antigrasa Satinado Protector',
    proveedor: 'EcoEmpaques Colombia',
    unidad: 'unidades',
    cantidad_comprada: 100,
    valor_compra: 15000,
    costo_unitario: 150, // 150 COP por pliego cortado
    costo_gota: null,
    activo: true,
  },
  {
    id: 'emp-004',
    categoria: 'empaque',
    nombre: 'Cordel de Yute Natural Rústico 2mm',
    proveedor: 'EcoEmpaques Colombia',
    unidad: 'metros',
    cantidad_comprada: 100,
    valor_compra: 18000,
    costo_unitario: 180, // 180 COP / metro
    costo_gota: null,
    activo: true,
  },
  {
    id: 'emp-005',
    categoria: 'empaque',
    nombre: 'Cinta de Raso de Seda Blanca 15mm',
    proveedor: 'Cintas & Moños Medellín',
    unidad: 'metros',
    cantidad_comprada: 50,
    valor_compra: 15000,
    costo_unitario: 300, // 300 COP / metro
    costo_gota: null,
    activo: true,
  },
  // Moldes (Amortización por barra)
  {
    id: 'mol-001',
    categoria: 'molde',
    nombre: 'Molde Silicona Grado Platino 6 Barras (Costo Amortizado)',
    proveedor: 'Moldes & Insumos Pro',
    unidad: 'unidades',
    cantidad_comprada: 1,
    valor_compra: 45000,
    costo_unitario: 100, // 100 COP amortizado por barra
    costo_gota: null,
    activo: true,
  },
  // Costos / Gastos Indirectos de Fabricación
  {
    id: 'ind-001',
    categoria: 'costo_indirecto',
    nombre: 'Mano de Obra Artesanal (Elaboración y Desmolde)',
    proveedor: 'Taller Botánico Propio',
    unidad: 'horas',
    cantidad_comprada: 160,
    valor_compra: 1600000,
    costo_unitario: 10000, // 10.000 COP / hora (~167 COP/minuto)
    costo_gota: null,
    activo: true,
  },
  {
    id: 'ind-002',
    categoria: 'costo_indirecto',
    nombre: 'Alcohol Isopropílico 96% (Rociador Anti-burbujas)',
    proveedor: 'Químicos & Solventes del Valle',
    unidad: 'mililitros',
    cantidad_comprada: 1000,
    valor_compra: 18000,
    costo_unitario: 18, // 18 COP / ml
    costo_gota: null,
    activo: true,
  },
  {
    id: 'ind-003',
    categoria: 'costo_indirecto',
    nombre: 'Consumo Eléctrico Fundidor / Microondas por Lote',
    proveedor: 'Servicios Públicos Taller',
    unidad: 'unidades',
    cantidad_comprada: 100,
    valor_compra: 25000,
    costo_unitario: 250, // 250 COP por barra/lote
    costo_gota: null,
    activo: true,
  },
  {
    id: 'ind-004',
    categoria: 'costo_indirecto',
    nombre: 'Depreciación de Termómetro Digital y Utensilios Inox',
    proveedor: 'Dotación Taller',
    unidad: 'unidades',
    cantidad_comprada: 500,
    valor_compra: 75000,
    costo_unitario: 150, // 150 COP prorrateado por barra
    costo_gota: null,
    activo: true,
  },
];

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem('jabhaco_supabase_url') || '';
  const localKey = localStorage.getItem('jabhaco_supabase_key') || '';

  const url = localUrl || envUrl;
  const anonKey = localKey || envKey;

  const isConfigured = Boolean(
    url && 
    url.startsWith('https://') && 
    anonKey && 
    anonKey.length > 20
  );

  return { url, anonKey, isConfigured };
}

export function saveLocalSupabaseCredentials(url: string, key: string) {
  if (url) localStorage.setItem('jabhaco_supabase_url', url.trim());
  if (key) localStorage.setItem('jabhaco_supabase_key', key.trim());
  supabaseInstance = null;
}

export function clearLocalSupabaseCredentials() {
  localStorage.removeItem('jabhaco_supabase_url');
  localStorage.removeItem('jabhaco_supabase_key');
  supabaseInstance = null;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, anonKey);
  }
  return supabaseInstance;
}

// Helpers para almacenamiento mock local
function getMockInsumos(): Insumo[] {
  const stored = localStorage.getItem(MOCK_INSUMOS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(MOCK_INSUMOS_STORAGE_KEY, JSON.stringify(MOCK_BASES_INICIALES));
    return MOCK_BASES_INICIALES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return MOCK_BASES_INICIALES;
  }
}

function saveMockInsumos(insumos: Insumo[]) {
  localStorage.setItem(MOCK_INSUMOS_STORAGE_KEY, JSON.stringify(insumos));
}

// ==========================================
// SERVICIOS DE BASE DE DATOS
// ==========================================

/**
 * Obtiene insumos filtrados por categoría (o lista de categorías)
 */
export async function fetchInsumos(
  categoria?: CategoriaInsumo | CategoriaInsumo[]
): Promise<{ data: Insumo[]; error: string | null; isMock: boolean }> {
  const client = getSupabaseClient();

  if (!client) {
    let list = getMockInsumos().filter((i) => i.activo);
    if (categoria) {
      if (Array.isArray(categoria)) {
        list = list.filter((i) => categoria.includes(i.categoria));
      } else {
        list = list.filter((i) => i.categoria === categoria);
      }
    }
    list.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
    return { data: list, error: null, isMock: true };
  }

  try {
    let query = client
      .from('insumos')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (categoria) {
      if (Array.isArray(categoria)) {
        query = query.in('categoria', categoria);
      } else {
        query = query.eq('categoria', categoria);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Error fetching from Supabase, usando respaldo local:', error.message);
      let list = getMockInsumos().filter((i) => i.activo);
      if (categoria) {
        if (Array.isArray(categoria)) {
          list = list.filter((i) => categoria.includes(i.categoria));
        } else {
          list = list.filter((i) => i.categoria === categoria);
        }
      }
      list.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
      return { data: list, error: error.message, isMock: true };
    }

    return { data: (data as Insumo[]) || [], error: null, isMock: false };
  } catch (err: any) {
    return { data: getMockInsumos(), error: err.message, isMock: true };
  }
}

/**
 * Crea un nuevo insumo en la tabla 'insumos'
 */
export async function createInsumo(nuevo: {
  categoria: CategoriaInsumo;
  nombre: string;
  proveedor: string | null;
  unidad: UnidadMedida;
  cantidad_comprada: number;
  valor_compra: number;
}): Promise<{ data: Insumo | null; error: string | null; isMock: boolean }> {
  const client = getSupabaseClient();
  const costoUnitarioCalculado = nuevo.cantidad_comprada > 0 ? nuevo.valor_compra / nuevo.cantidad_comprada : 0;
  const costoGotaCalculado = nuevo.unidad === 'mililitros' ? costoUnitarioCalculado / 20 : null;

  if (!client) {
    const mockList = getMockInsumos();
    const created: Insumo = {
      id: 'ins-' + Date.now(),
      categoria: nuevo.categoria,
      nombre: nuevo.nombre.trim(),
      proveedor: nuevo.proveedor?.trim() || null,
      unidad: nuevo.unidad,
      cantidad_comprada: nuevo.cantidad_comprada,
      valor_compra: nuevo.valor_compra,
      costo_unitario: Number(costoUnitarioCalculado.toFixed(4)),
      costo_gota: costoGotaCalculado ? Number(costoGotaCalculado.toFixed(4)) : null,
      activo: true,
      created_at: new Date().toISOString(),
    };
    mockList.push(created);
    saveMockInsumos(mockList);
    return { data: created, error: null, isMock: true };
  }

  try {
    const currentUser = getActiveSessionUser();
    const payload: any = {
      categoria: nuevo.categoria,
      nombre: nuevo.nombre.trim(),
      proveedor: nuevo.proveedor?.trim() || null,
      unidad: nuevo.unidad,
      cantidad_comprada: nuevo.cantidad_comprada,
      valor_compra: nuevo.valor_compra,
      activo: true,
    };

    if (currentUser?.id) {
      payload.user_id = currentUser.id;
    }

    const { data, error } = await client
      .from('insumos')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      return { data: null, error: error.message, isMock: false };
    }

    return { data: data as Insumo, error: null, isMock: false };
  } catch (err: any) {
    return { data: null, error: err.message, isMock: false };
  }
}

/**
 * Helper interno para leer el usuario en sesión activa
 */
function getActiveSessionUser(): { id: string; email: string; rol?: string } | null {
  try {
    const raw = localStorage.getItem('jabhaco_auth_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Guarda el jabón y sus componentes asociados en Supabase y Sandbox Local
 */
export async function guardarJabonCompleto(
  jabonData: JabonFormData,
  componentes: RecetaItem[]
): Promise<{ data: Jabon | null; error: string | null; isMock: boolean }> {
  const client = getSupabaseClient();
  const mockKey = 'jabhaco_mock_jabones_guardados';
  const currentUser = getActiveSessionUser();

  const nuevoId = 'jab-' + Date.now();
  const mockJabon: Jabon = {
    id: nuevoId,
    user_id: currentUser?.id || 'admin-001',
    user_email: currentUser?.email || 'admin@jabha.co',
    nombre: jabonData.nombre.trim(),
    lema: jabonData.lema?.trim() || null,
    descripcion: jabonData.descripcion?.trim() || null,
    tipo_piel: jabonData.tipo_piel?.trim() || null,
    beneficios: jabonData.beneficios?.trim() || null,
    modo_uso: jabonData.modo_uso?.trim() || null,
    observaciones: jabonData.observaciones?.trim() || null,
    foto_producto_url: jabonData.foto_producto_url?.trim() || null,
    foto_etiqueta_url: jabonData.foto_etiqueta_url?.trim() || null,
    cliente: jabonData.cliente?.trim() || null,
    valor_venta: Number(jabonData.valor_venta) || 0,
    publicado_catalogo: jabonData.publicado_catalogo ?? true,
    created_at: new Date().toISOString(),
  };

  // Guardar siempre una copia local en sandbox para persistencia y respaldo offline
  try {
    const previos = JSON.parse(localStorage.getItem(mockKey) || '[]');
    previos.unshift({ jabon: mockJabon, componentes });
    localStorage.setItem(mockKey, JSON.stringify(previos));
  } catch (err) {
    console.warn('Error al guardar en respaldo local:', err);
  }

  if (!client) {
    return { data: mockJabon, error: null, isMock: true };
  }

  try {
    const insertPayload: any = {
      nombre: jabonData.nombre.trim(),
      lema: jabonData.lema?.trim() || null,
      descripcion: jabonData.descripcion?.trim() || null,
      tipo_piel: jabonData.tipo_piel?.trim() || null,
      beneficios: jabonData.beneficios?.trim() || null,
      modo_uso: jabonData.modo_uso?.trim() || null,
      observaciones: jabonData.observaciones?.trim() || null,
      foto_producto_url: jabonData.foto_producto_url?.trim() || null,
      foto_etiqueta_url: jabonData.foto_etiqueta_url?.trim() || null,
      cliente: jabonData.cliente?.trim() || null,
      valor_venta: Number(jabonData.valor_venta) || 0,
      publicado_catalogo: jabonData.publicado_catalogo ?? true,
    };

    if (currentUser?.id) {
      insertPayload.user_id = currentUser.id;
    }

    const { data: jabonCreado, error: errorJabon } = await client
      .from('jabones')
      .insert([insertPayload])
      .select('*')
      .single();

    if (errorJabon || !jabonCreado) {
      console.warn('Error guardando en Supabase, preservado en sandbox local:', errorJabon);
      return {
        data: mockJabon,
        error: `Guardado en Sandbox Local (Aviso Supabase: ${errorJabon?.message || 'Error'})`,
        isMock: true,
      };
    }

    if (componentes.length > 0) {
      const rows = componentes.map((c) => ({
        jabon_id: jabonCreado.id,
        insumo_id: c.insumo_id,
        cantidad_usada: c.cantidad_usada,
        es_en_gotas: c.es_en_gotas,
        costo_unitario_aplicado: c.costo_unitario_aplicado,
      }));

      const { error: errorComponentes } = await client
        .from('jabon_componentes')
        .insert(rows);

      if (errorComponentes) {
        return {
          data: jabonCreado as Jabon,
          error: `Jabón creado en Supabase pero falló al guardar sus componentes: ${errorComponentes.message}`,
          isMock: false,
        };
      }
    }

    return { data: jabonCreado as Jabon, error: null, isMock: false };
  } catch (err: any) {
    return { data: mockJabon, error: err.message, isMock: true };
  }
}

/**
 * Consulta la lista de jabones registrados y sus recetas, aislados por usuario
 */
export async function obtenerJabonesGuardados(): Promise<{
  data: JabonGuardadoItem[];
  error: string | null;
  isMock: boolean;
}> {
  const mockKey = 'jabhaco_mock_jabones_guardados';
  const currentUser = getActiveSessionUser();
  const isMasterAdmin =
    !currentUser || currentUser.rol === 'admin' || currentUser.email === 'admin@jabha.co';

  const getMockList = (): JabonGuardadoItem[] => {
    try {
      const raw = localStorage.getItem(mockKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);

      // Aislamiento por usuario en sandbox local:
      // - Si es administrador -> puede ver el catálogo completo de todos los usuarios
      // - Si es usuario regular -> ve únicamente los jabones creados bajo su cuenta
      const filtradoPorUsuario = parsed.filter((item: any) => {
        if (isMasterAdmin) return true;
        return item.jabon?.user_id === currentUser?.id;
      });

      return filtradoPorUsuario.map((item: any) => {
        const comps: RecetaItem[] = item.componentes || [];
        const costoTotal = comps.reduce(
          (acc: number, c: any) =>
            acc + (c.subtotal_costo || c.cantidad_usada * c.costo_unitario_aplicado || 0),
          0
        );
        const valorVenta = item.jabon?.valor_venta || 0;
        const margen = valorVenta - costoTotal;
        const rentabilidad = valorVenta > 0 ? (margen / valorVenta) * 100 : 0;
        return {
          jabon: item.jabon,
          componentes: comps,
          costo_total: Number(costoTotal.toFixed(2)),
          margen_ganancia: Number(margen.toFixed(2)),
          rentabilidad_porcentaje: Number(rentabilidad.toFixed(1)),
          isMock: true,
        };
      });
    } catch {
      return [];
    }
  };

  const client = getSupabaseClient();
  if (!client) {
    const list = getMockList();
    list.sort(
      (a, b) =>
        new Date(b.jabon.created_at || '').getTime() -
        new Date(a.jabon.created_at || '').getTime()
    );
    return { data: list, error: null, isMock: true };
  }

  try {
    let query = client
      .from('jabones')
      .select(`
        *,
        jabon_componentes (
          id,
          cantidad_usada,
          es_en_gotas,
          costo_unitario_aplicado,
          subtotal_costo,
          insumo_id,
          insumos (*)
        )
      `)
      .order('created_at', { ascending: false });

    // Filtrar por user_id para usuarios que no son admin
    if (!isMasterAdmin && currentUser?.id) {
      query = query.eq('user_id', currentUser.id);
    }

    const { data: jabones, error: errorJabones } = await query;

    if (errorJabones) {
      console.warn('Fallo al consultar jabones en Supabase, usando local:', errorJabones.message);
      return { data: getMockList(), error: errorJabones.message, isMock: true };
    }

    const items: JabonGuardadoItem[] = (jabones || []).map((j: any) => {
      const componentes: RecetaItem[] = (j.jabon_componentes || []).map((comp: any) => ({
        tempId: comp.id,
        insumo_id: comp.insumo_id,
        insumo: comp.insumos || {
          id: comp.insumo_id,
          nombre: 'Insumo',
          categoria: 'aditivo',
          unidad: 'gramos',
          costo_unitario: comp.costo_unitario_aplicado,
        },
        cantidad_usada: comp.cantidad_usada,
        es_en_gotas: comp.es_en_gotas,
        costo_unitario_aplicado: comp.costo_unitario_aplicado,
        subtotal_costo:
          comp.subtotal_costo || comp.cantidad_usada * comp.costo_unitario_aplicado,
      }));

      const costoTotal = componentes.reduce((acc, c) => acc + c.subtotal_costo, 0);
      const valorVenta = j.valor_venta || 0;
      const margen = valorVenta - costoTotal;
      const rentabilidad = valorVenta > 0 ? (margen / valorVenta) * 100 : 0;

      return {
        jabon: j,
        componentes,
        costo_total: Number(costoTotal.toFixed(2)),
        margen_ganancia: Number(margen.toFixed(2)),
        rentabilidad_porcentaje: Number(rentabilidad.toFixed(1)),
        isMock: false,
      };
    });

    const mockList = getMockList();
    // Mezclar evitando duplicados si el id coincide
    const result = [...items];
    mockList.forEach((m) => {
      if (!result.some((r) => r.jabon.id === m.jabon.id)) {
        result.push(m);
      }
    });

    result.sort(
      (a, b) =>
        new Date(b.jabon.created_at || '').getTime() -
        new Date(a.jabon.created_at || '').getTime()
    );

    return { data: result, error: null, isMock: false };
  } catch (err: any) {
    return { data: getMockList(), error: err.message, isMock: true };
  }
}

/**
 * Elimina un jabón registrado y sus componentes
 */
export async function eliminarJabonGuardado(
  jabonId: string
): Promise<{ success: boolean; error: string | null }> {
  const mockKey = 'jabhaco_mock_jabones_guardados';
  try {
    const raw = localStorage.getItem(mockKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      const filtrado = parsed.filter((item: any) => item.jabon?.id !== jabonId);
      localStorage.setItem(mockKey, JSON.stringify(filtrado));
    }
  } catch (err) {
    console.warn('Error eliminando de local:', err);
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: true, error: null };
  }

  try {
    await client.from('jabon_componentes').delete().eq('jabon_id', jabonId);
    const { error } = await client.from('jabones').delete().eq('id', jabonId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
