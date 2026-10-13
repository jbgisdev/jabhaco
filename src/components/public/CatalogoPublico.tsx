import React, { useState, useMemo } from 'react';
import {
  Search,
  LogIn,
  Calculator,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Truck,
  Leaf,
  ChevronRight,
} from 'lucide-react';
import { formatCOP } from '../../utils/formatters';
import type { JabonGuardadoItem, AuthUser } from '../../types/database.types';
import { DetalleJabonModal } from './DetalleJabonModal';
import type { SoapProduct } from './DetalleJabonModal';
import { CalculadoraJabonModal } from './CalculadoraJabonModal';

// Jabones de alta calidad para vitrina comercial inicial
const JABONES_VITRINA_BASE: SoapProduct[] = [
  {
    id: 'vitrina-001',
    nombre: 'Jabón Carbón Activado & Árbol de Té',
    lema: 'Limpieza profunda, purificante y anti-acné',
    descripcion:
      'Formulado con carbón vegetal de bambú y aceite esencial de árbol de té. Remueve toxinas, equilibra el exceso de grasa y desobstruye los poros sin resecar.',
    tipo_piel: 'Piel Grasa / Mixta',
    categoria: 'carbon',
    badge: 'Más Vendido 🔥',
    beneficios:
      'Absorbe impurezas y toxinas superficiales de la piel.\nRegula el brillo y la producción sebácea.\nPropiedades antisépticas del árbol de té.\nEspuma cremosa y sensación ultra fresca.',
    modo_uso: 'Hacer espuma entre las manos con agua tibia. Masajear suavemente en rostro o cuerpo durante 30 segundos y enjuagar con abundante agua.',
    foto_producto_url:
      'https://images.unsplash.com/photo-1607006311029-7925e510800d?w=800&auto=format&fit=crop&q=80',
    valor_venta: 18000,
  },
  {
    id: 'vitrina-002',
    nombre: 'Jabón Avena Coloidal & Miel de Abejas',
    lema: 'Nutrición calmante y alivio para pieles delicadas',
    descripcion:
      'Delicada combinación de avena coloidal finamente molida y miel pura de abejas. Calma irritaciones, alivia rojeces y deja la piel suave y nutrida.',
    tipo_piel: 'Piel Sensible / Seca',
    categoria: 'avena',
    badge: 'Recomendado ⭐',
    beneficios:
      'Restaura la barrera de humedad de la piel.\nAlivia la sensación de picazón o enrojecimiento.\nExfoliación ultrasuave que no agrede el cutis.\nAroma suave y reconfortante natural.',
    modo_uso: 'Apto para uso diario en rostro y cuerpo. Ideal para pieles propensas a resequedad o sensibilidad climática.',
    foto_producto_url:
      'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=800&auto=format&fit=crop&q=80',
    valor_venta: 16000,
  },
  {
    id: 'vitrina-003',
    nombre: 'Jabón Arcilla Rosa & Rosa Mosqueta',
    lema: 'Regeneración celular, luminosidad y tono uniforme',
    descripcion:
      'Arcilla rosa francesa enriquecida con aceite puro de rosa mosqueta. Estimula la elasticidad celular, desintoxica suavemente e ilumina el tono natural de la piel.',
    tipo_piel: 'Todo Tipo de Piel',
    categoria: 'arcillas',
    badge: 'Línea Spa ✨',
    beneficios:
      'Revitaliza pieles apagadas o fatigadas.\nAporta antioxidantes naturales y vitamina C botánica.\nDeja la piel sedosa y tersa desde el primer uso.\nIdeal para rutina facial nocturna.',
    modo_uso: 'Aplicar sobre la piel húmeda realizando movimientos circulares ascendentes. Enjuagar con agua fría para un efecto tonificante.',
    foto_producto_url:
      'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&auto=format&fit=crop&q=80',
    valor_venta: 20000,
  },
  {
    id: 'vitrina-004',
    nombre: 'Jabón Manteca de Karité & Caléndula',
    lema: 'Ultra hidratación reparadora botánica',
    descripcion:
      'Elaborado con manteca orgánica de karité africano y extracto glicólico de caléndula medicinal. Regenera zonas resecas y protege la piel de las agresiones ambientales.',
    tipo_piel: 'Piel Muy Seca / Madura',
    categoria: 'nutricion',
    badge: 'Eco Botánico 🌿',
    beneficios:
      'Nutrición profunda con ácidos grasos esenciales.\nAcción cicatrizante y calmante de la caléndula.\nIdeal para manos resecas y piel con tirantez.\nTextura aterciopelada y humectante.',
    modo_uso: 'Frotar directamente sobre la piel o en una esponja suave durante el baño. Disfrutar de su cremosa espuma hidratante.',
    foto_producto_url:
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
    valor_venta: 19000,
  },
  {
    id: 'vitrina-005',
    nombre: 'Jabón Café Tostado Exfoliante & Coco',
    lema: 'Energía corporal, exfoliación y firmeza',
    descripcion:
      'Granos de café colombiano tostado molido en base de glicerina humectante. Estimula la microcirculación cutánea y ayuda a combatir la textura de piel de naranja.',
    tipo_piel: 'Exfoliación Corporal',
    categoria: 'cafe',
    badge: 'Energizante ☕',
    beneficios:
      'Exfoliación media vigorizante que retira células muertas.\nEstimula la circulación gracias a la cafeína natural.\nDeja la piel con una textura renovada y tersa.\nDelicioso aroma a café fresco artesanal.',
    modo_uso: 'Usar 2 a 3 veces por semana en el cuerpo (especialmente muslos, brazos y piernas). Masajear en círculos antes de enjuagar.',
    foto_producto_url:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    valor_venta: 17000,
  },
  {
    id: 'vitrina-006',
    nombre: 'Jabón Aloe Vera Puro & Pepino Fresco',
    lema: 'Frescura calmante post-solar y descongestionante',
    descripcion:
      'Gel concentrado de aloe vera orgánico y jugo fresco de pepino. Calma pieles expuestas al sol o calor intenso, hidratando al instante con una ligereza inigualable.',
    tipo_piel: 'Todo Tipo de Piel / Sensible',
    categoria: 'aloe',
    badge: 'Verano Fresco 🌊',
    beneficios:
      'Efecto refrescante inmediato.\nDisminuye la inflamación y rojeces superficiales.\nHidratación acuosa sin sensación pesada o grasa.\nIdeal para la ducha matutina.',
    modo_uso: 'Utilizar diariamente en rostro y cuerpo. Para mayor efecto refrescante, enjuagar con agua fría.',
    foto_producto_url:
      'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=800&auto=format&fit=crop&q=80',
    valor_venta: 16500,
  },
];

const CATEGORIAS_PILLS = [
  { id: 'todos', label: 'Todos', icon: '🧼' },
  { id: 'carbon', label: 'Piel Grasa & Acné', icon: '🌿' },
  { id: 'avena', label: 'Piel Sensible', icon: '🌸' },
  { id: 'arcillas', label: 'Línea Facial Spa', icon: '✨' },
  { id: 'nutricion', label: 'Nutrición Profunda', icon: '🍯' },
  { id: 'cafe', label: 'Exfoliantes', icon: '☕' },
  { id: 'aloe', label: 'Refrescantes', icon: '🍃' },
];

interface CatalogoPublicoProps {
  jabonesGuardados?: JabonGuardadoItem[];
  currentUser?: AuthUser | null;
  onIrAlLogin: () => void;
  onIrAlLaboratorio: () => void;
}

export const CatalogoPublico: React.FC<CatalogoPublicoProps> = ({
  jabonesGuardados = [],
  currentUser,
  onIrAlLogin,
  onIrAlLaboratorio,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('todos');
  const [orden, setOrden] = useState<'populares' | 'precio_bajo' | 'precio_alto'>('populares');
  const [selectedJabon, setSelectedJabon] = useState<SoapProduct | null>(null);
  const [isCalculadoraOpen, setIsCalculadoraOpen] = useState(false);

  // Combinar los jabones de Supabase/Guardados con los de vitrina base
  const todosLosJabones = useMemo(() => {
    const convertidosDesdeApp: SoapProduct[] = jabonesGuardados
      .filter((item) => item.jabon.publicado_catalogo !== false)
      .map((item) => ({
        id: item.jabon.id,
        nombre: item.jabon.nombre,
        lema: item.jabon.lema,
        descripcion: item.jabon.descripcion,
        tipo_piel: item.jabon.tipo_piel || 'Artesanal Especial',
        beneficios: item.jabon.beneficios,
        modo_uso: item.jabon.modo_uso,
        observaciones: item.jabon.observaciones,
        foto_producto_url: item.jabon.foto_producto_url || JABONES_VITRINA_BASE[0].foto_producto_url,
        foto_etiqueta_url: item.jabon.foto_etiqueta_url,
        valor_venta: item.jabon.valor_venta > 0 ? item.jabon.valor_venta : 18000,
        categoria: 'todos',
        badge: 'Fórmula de Autor 🧼',
        artesano: item.jabon.user_email || undefined,
      }));

    // Si hay jabones creados en la app, van de primero
    return [...convertidosDesdeApp, ...JABONES_VITRINA_BASE];
  }, [jabonesGuardados]);

  // Filtrado interactivo en tiempo real
  const jabonesFiltrados = useMemo(() => {
    let result = todosLosJabones.filter((j) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        j.nombre.toLowerCase().includes(q) ||
        (j.lema || '').toLowerCase().includes(q) ||
        (j.descripcion || '').toLowerCase().includes(q) ||
        (j.tipo_piel || '').toLowerCase().includes(q) ||
        (j.beneficios || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (selectedCategoria === 'todos') return true;
      return j.categoria === selectedCategoria;
    });

    if (orden === 'precio_bajo') {
      result.sort((a, b) => a.valor_venta - b.valor_venta);
    } else if (orden === 'precio_alto') {
      result.sort((a, b) => b.valor_venta - a.valor_venta);
    }

    return result;
  }, [todosLosJabones, searchTerm, selectedCategoria, orden]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white flex flex-col">
      
      {/* 1. HEADER PÚBLICO ESTILO RAPPI */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto pl-3.5 pr-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
            
            {/* Logo de Marca */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <img
                src="/logo.png"
                alt="Jabhaco Lab - Jabonería Botánica"
                className="h-10 sm:h-12 w-auto object-contain select-none hover:scale-105 transition-transform"
              />
            </div>

            {/* Buscador Central estilo Rappi (Visible en Desktop y Tablet) */}
            <div className="hidden md:flex flex-1 max-w-lg relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar jabón por aroma, beneficio, tipo de piel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white rounded-2xl border border-transparent focus:border-brand-500 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all placeholder:text-slate-400 shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 px-1.5 py-0.5"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Los 2 Botones solicitados: Acceso al Login y Calculadora (en standby) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Botón 1: Calculadora Jabonera Interactiva */}
              <button
                type="button"
                onClick={() => setIsCalculadoraOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/90 transition-all active:scale-95 cursor-pointer shadow-xs"
                title="Calculadora Rápida de Proporciones (Regla 1.2 y 3% aditivos)"
              >
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Calculadora</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-200/80 text-emerald-950 text-[10px] font-extrabold uppercase">
                  Proporciones
                </span>
              </button>

              {/* Botón 2: Acceso al Login o Laboratorio */}
              {currentUser ? (
                <button
                  type="button"
                  onClick={onIrAlLaboratorio}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white shadow-md shadow-brand-600/25 active:scale-95 transition-all cursor-pointer"
                  title="Ir a mi Laboratorio Formulador"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Mi Laboratorio</span>
                  <span className="sm:hidden">Laboratorio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onIrAlLogin}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white shadow-md shadow-brand-600/25 active:scale-95 transition-all cursor-pointer"
                  title="Ingresar o Registrarse"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Acceso al Login</span>
                </button>
              )}
            </div>

          </div>

          {/* Buscador en Mobile debajo del Header */}
          <div className="md:hidden pb-3 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar jabones, piel, aroma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 bg-slate-100 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. HERO BANNER PROMOCIONAL ESTILO RAPPI */}
      <section className="bg-gradient-to-br from-slate-950 via-brand-950 to-emerald-950 text-white py-8 sm:py-12 relative overflow-hidden">
        {/* Círculos ambientales de iluminación */}
        <div className="absolute top-0 -left-20 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto pl-3.5 pr-6 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="space-y-3 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Leaf className="w-3.5 h-3.5" />
                <span>Jabonería Artesanal Colombiana • 100% Glicerina Vegetal</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Cuidado Botánico Puro Para Tu Piel
              </h1>
              
              <p className="text-xs sm:text-base text-slate-300 font-normal leading-relaxed">
                Fórmulas libres de sulfatos y parabenos, enriquecidas con extractos naturales, arcillas puras y aceites esenciales.
              </p>

              {/* Badges de Garantía */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs text-slate-200">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sin detergentes agresivos</span>
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <Truck className="w-4 h-4 text-brand-300" />
                  <span>Envíos a todo el país</span>
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Calidad de formulación</span>
                </span>
              </div>
            </div>

            {/* Tarjeta Destacada de Entrada Rápida a la formulación */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-3xl text-center md:text-left max-w-sm shadow-2xl">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 block mb-1">
                ¿Eres Artesano o Emprendedor?
              </span>
              <h4 className="text-base font-bold text-white mb-2">
                Formula y Costea tus propios jabones
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Usa el formulador con base de glicerina, aditivos, fragancias, empaques y margen de ganancia automático.
              </p>
              <button
                type="button"
                onClick={currentUser ? onIrAlLaboratorio : onIrAlLogin}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span>{currentUser ? 'Ir al Laboratorio' : 'Entrar como Artesano'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. BARRA DE CATEGORÍAS TIPO PILLS ESTILO RAPPI */}
      <section className="bg-white border-b border-slate-200 sticky top-16 sm:top-20 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto pl-3.5 pr-6 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* Scroll horizontal de pills estilo Rappi */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
              {CATEGORIAS_PILLS.map((cat) => {
                const isActive = selectedCategoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoria(cat.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-102'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                    }`}
                  >
                    <span className="text-sm">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selector de Orden */}
            <div className="hidden sm:flex items-center gap-2 shrink-0 border-l border-slate-200 pl-4">
              <span className="text-xs text-slate-400 font-semibold">Ordenar:</span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as any)}
                className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-xl border-none focus:ring-2 focus:ring-brand-500 cursor-pointer outline-none"
              >
                <option value="populares">Más Populares</option>
                <option value="precio_bajo">Precio: Menor a Mayor</option>
                <option value="precio_alto">Precio: Mayor a Menor</option>
              </select>
            </div>

          </div>
        </div>
      </section>

      {/* 4. GRID DE PRODUCTOS ESTILO RAPPI */}
      <main className="max-w-7xl mx-auto w-full pl-3.5 pr-6 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1">
        
        {/* Título de Sección y Conteo */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Nuestras Barras Botánicas</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {jabonesFiltrados.length} disponibles
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic en cualquier jabón para ver sus ingredientes, propiedades o pedir por WhatsApp
            </p>
          </div>
        </div>

        {/* Sin resultados */}
        {jabonesFiltrados.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No encontramos jabones coincidentes</h3>
            <p className="text-xs text-slate-500">
              Intenta con otra búsqueda o selecciona la categoría "Todos" para ver el catálogo completo.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategoria('todos');
              }}
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700"
            >
              Ver todos los jabones
            </button>
          </div>
        ) : (
          /* Grid de Tarjetas Estilo Rappi */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 sm:gap-6">
            {jabonesFiltrados.map((jabon) => (
              <div
                key={jabon.id}
                onClick={() => setSelectedJabon(jabon)}
                className="group bg-white rounded-3xl border border-slate-200/90 hover:border-brand-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
              >
                {/* Imagen del Producto */}
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={jabon.foto_producto_url || ''}
                    alt={jabon.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Badge de Categoría o Tipo de Piel */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                      {jabon.tipo_piel}
                    </span>
                    {jabon.badge && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                        {jabon.badge}
                      </span>
                    )}
                  </div>

                  {/* Precio Flotante estilo Rappi */}
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-md border border-slate-100 font-extrabold text-slate-900 text-sm">
                    {formatCOP(jabon.valor_venta)} <span className="text-[10px] font-semibold text-slate-500">COP</span>
                  </div>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-1">
                      {jabon.nombre}
                    </h3>
                    {jabon.lema && (
                      <p className="text-xs text-brand-600 font-semibold mt-0.5 line-clamp-1">
                        {jabon.lema}
                      </p>
                    )}
                    {jabon.descripcion && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {jabon.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Botones de Acción estilo Rappi */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJabon(jabon);
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-brand-700 py-1.5 flex items-center gap-1 transition-colors"
                    >
                      <span>Ver Detalles</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const texto = encodeURIComponent(
                          `¡Hola! Quiero pedir el jabón artesanal "${jabon.nombre}" (${formatCOP(jabon.valor_venta)} COP).`
                        );
                        window.open(`https://wa.me/?text=${texto}`, '_blank');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
                      title="Pedir por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pedir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 5. FOOTER PÚBLICO */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto pl-3.5 pr-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                J
              </div>
              <span className="font-bold text-white text-sm">
                Jabhaco Lab • Catálogo de Jabones Artesanales
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button
                onClick={() => setIsCalculadoraOpen(true)}
                className="hover:text-white transition-colors"
              >
                Calculadora
              </button>
              <button
                onClick={currentUser ? onIrAlLaboratorio : onIrAlLogin}
                className="hover:text-white transition-colors"
              >
                Área de Artesanos
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modales */}
      <DetalleJabonModal
        jabon={selectedJabon}
        isOpen={Boolean(selectedJabon)}
        onClose={() => setSelectedJabon(null)}
      />

      <CalculadoraJabonModal
        isOpen={isCalculadoraOpen}
        onClose={() => setIsCalculadoraOpen(false)}
        onIrAlLaboratorio={currentUser ? onIrAlLaboratorio : onIrAlLogin}
      />
    </div>
  );
};
