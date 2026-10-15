import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  LogIn,
  Calculator,
  User,
  ShoppingBag,
  CheckCircle2,
  Home,
  Plus,
} from 'lucide-react';
import { formatCOP } from '../../utils/formatters';
import type { JabonGuardadoItem, AuthUser } from '../../types/database.types';
import { DetalleJabonModal } from './DetalleJabonModal';
import type { SoapProduct } from './DetalleJabonModal';
import { CarritoDrawer } from './CarritoDrawer';
import type { CartItem } from './CarritoDrawer';
import { CalculadoraJabonModal } from './CalculadoraJabonModal';
import { isModoCalculadoraFijo } from '../../utils/envMode';

// Jabones de vitrina base con formulaciones botánicas
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
    nombre: 'Manteca de Karité & Caléndula',
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
    nombre: 'Café Tostado Exfoliante & Coco',
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
    nombre: 'Aloe Vera Puro & Pepino Fresco',
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
  { id: 'todos', label: 'Todos', icon: '✨' },
  { id: 'carbon', label: 'Purificantes', icon: '🍃' },
  { id: 'avena', label: 'Suaves & Piel Sensible', icon: '🧼' },
  { id: 'arcillas', label: 'Facial Spa', icon: '🌸' },
  { id: 'nutricion', label: 'Nutrición Karité', icon: '🍯' },
  { id: 'cafe', label: 'Exfoliantes Café', icon: '☕' },
  { id: 'aloe', label: 'Aloe & Frescura', icon: '🌿' },
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
  const [selectedJabon, setSelectedJabon] = useState<SoapProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const modoCalculadoraFijo = useMemo(() => isModoCalculadoraFijo(), []);
  const [isCalculadoraOpen, setIsCalculadoraOpen] = useState<boolean>(modoCalculadoraFijo);

  // Carrito persistido en localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('jabhaco_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('jabhaco_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  const handleAddToCart = (product: SoapProduct, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [...prevCart, { product, quantity }];
      }
    });
    showNotification(`+${quantity} ${product.nombre} añadido a la bolsa`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

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

    return [...convertidosDesdeApp, ...JABONES_VITRINA_BASE];
  }, [jabonesGuardados]);

  // Filtrado interactivo en tiempo real
  const jabonesFiltrados = useMemo(() => {
    return todosLosJabones.filter((j) => {
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
  }, [todosLosJabones, searchTerm, selectedCategoria]);

  const userNameDisplay = currentUser?.nombre || 'Jaime';
  const userInitial = userNameDisplay.charAt(0).toUpperCase() || 'J';

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans selection:bg-[#0b5c3b] selection:text-white pb-24 md:pb-12">
      
      {/* Toast Notification flotante */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0b5c3b] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER ESTILO VECINO PRO (Limpio, con indicador verde 'ABIERTO AHORA' y Bolsa) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Estado ABIERTO AHORA y Marca */}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  ABIERTO AHORA
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none mt-0.5">
                Jabhaco Lab
              </h1>
            </div>

            {/* Accesos rápidos a la derecha (Bolsa con badge estilo Vecino Pro) */}
            <div className="flex items-center gap-2.5">
              
              {/* Botón Calculadora rápida (Desktop/Tablet) */}
              <button
                type="button"
                onClick={() => setIsCalculadoraOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold text-[#0b5c3b] bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 transition-all cursor-pointer"
                title="Calculadora de Jabones y Velas de Soja"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calculadora</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-200/80 text-emerald-950 text-[10px] font-extrabold uppercase">
                  Jabón & Velas
                </span>
              </button>

              {/* Botón Mi Laboratorio / Login (Desktop) */}
              {currentUser ? (
                <button
                  type="button"
                  onClick={onIrAlLaboratorio}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold text-white bg-[#0b5c3b] hover:bg-[#08482e] transition-all cursor-pointer shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Mi Laboratorio</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onIrAlLogin}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Acceso Login</span>
                </button>
              )}

              {/* Botón Bolsa de Compras con Badge Naranja (Exacto a Imagen 2) */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-2xl border border-slate-200/80 hover:bg-slate-50 transition-all cursor-pointer text-slate-800"
                title="Ver bolsa de compras"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {totalCartCount}
                  </span>
                )}
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        
        {/* 2. SALUDO PERSONALIZADO Y AVATAR ESTILO VECINO PRO */}
        <section className="flex items-center justify-between">
          <div>
            <span className="text-xs sm:text-sm text-slate-400 font-medium block">
              Hola,
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{userNameDisplay}</span>
              <span className="text-xl sm:text-2xl">👋</span>
            </h2>
          </div>

          {/* Avatar con fondo verde suave */}
          <button
            type="button"
            onClick={currentUser ? onIrAlLaboratorio : onIrAlLogin}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#e6f4ea] hover:bg-[#d5eedf] text-[#0b5c3b] flex items-center justify-center font-black text-base sm:text-lg transition-transform active:scale-95 cursor-pointer shadow-xs"
            title={currentUser ? 'Ir a mi Laboratorio' : 'Iniciar sesión'}
          >
            {userInitial}
          </button>
        </section>

        {/* 3. BUSCADOR PILL ESTILO VECINO PRO */}
        <section className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar jabón, beneficio, tipo de piel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-16 py-3.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-transparent focus:border-[#0b5c3b] rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0b5c3b]/10 transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1"
            >
              Limpiar
            </button>
          )}
        </section>

        {/* 4. BANNER PROMOCIONAL CARD VERDE OSCURO (Exacto a Imagen 2) */}
        <section className="rounded-3xl bg-[#0b5c3b] text-white p-5 sm:p-6 relative overflow-hidden shadow-lg shadow-[#0b5c3b]/15">
          {/* Mancha orgánica verde de fondo */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 block">
                COMPRA RÁPIDA
              </span>
              <h3 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">
                Jabones puros,<br />
                listos para tu piel.
              </h3>
              <p className="text-xs text-emerald-100/90 font-normal pt-1">
                Lun–Dom • 7:00 a. m. – 10:00 p. m.
              </p>
            </div>

            {/* Ilustración de bolsas de compra estilizadas (Estilo Imagen 2) */}
            <div className="relative shrink-0 flex items-end gap-1.5 pr-2">
              <div className="w-12 h-14 bg-emerald-400/80 rounded-xl rounded-t-lg transform -rotate-6 shadow-md flex items-center justify-center text-emerald-950 font-black text-xs">
                🧼
              </div>
              <div className="w-10 h-12 bg-rose-300 rounded-xl rounded-t-lg transform rotate-3 shadow-md flex items-center justify-center text-rose-950 font-black text-xs -ml-3">
                🌿
              </div>
            </div>
          </div>
        </section>

        {/* 5. EXPLORA CATEGORÍAS (Exacto a Imagen 2) */}
        <section className="space-y-2.5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              EXPLORA
            </span>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Categorías
            </h3>
          </div>

          {/* Carrusel horizontal de píldoras */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORIAS_PILLS.map((cat) => {
              const isActive = selectedCategoria === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoria(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#e6f4ea] text-[#0b5c3b] border border-[#0b5c3b]/30 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 6. PRODUCTOS DESTACADOS (Grid de 2 columnas en móvil exacto a Imagen 2) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                PARA TI
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Productos destacados
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              {jabonesFiltrados.length} productos
            </span>
          </div>

          {/* Grid de Productos 2 columnas en mobile */}
          {jabonesFiltrados.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-slate-200/70 p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No encontramos jabones coincidentes</h4>
              <p className="text-xs text-slate-400">
                Prueba con otro término de búsqueda o selecciona "Todos".
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategoria('todos');
                }}
                className="px-4 py-2 bg-[#0b5c3b] text-white rounded-2xl text-xs font-bold hover:bg-[#08482e]"
              >
                Ver todos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {jabonesFiltrados.map((jabon) => (
                <div
                  key={jabon.id}
                  onClick={() => setSelectedJabon(jabon)}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 hover:border-[#0b5c3b]/50 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer"
                >
                  {/* Contenedor Imagen */}
                  <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                    <img
                      src={jabon.foto_producto_url || ''}
                      alt={jabon.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badges superiores estilo Vecino Pro */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                        OFERTA
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/60 backdrop-blur-xs text-white text-[9px] font-bold">
                        100g
                      </span>
                    </div>
                  </div>

                  {/* Contenido de la Tarjeta */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate">
                        JABHACO BOTÁNICO
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-[#0b5c3b] transition-colors leading-tight">
                        {jabon.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {jabon.tipo_piel || 'Jabón botánico puro'}
                      </p>
                    </div>

                    {/* Fila de Precio y Botón (+) redondo estilo Vecino Pro */}
                    <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs sm:text-sm font-black text-slate-900">
                          {formatCOP(jabon.valor_venta)}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 ml-0.5">COP</span>
                      </div>

                      {/* Botón Circular Verde (+) de agregar directo a bolsa */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(jabon, 1);
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl sm:rounded-2xl bg-[#0b5c3b] hover:bg-[#08482e] active:scale-90 text-white flex items-center justify-center font-bold shadow-xs transition-all cursor-pointer"
                        title="Añadir a la bolsa"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* 7. BARRA DE NAVEGACIÓN INFERIOR MÓVIL ESTILO VECINO PRO (Fixed Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2">
        <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-items-center text-[10px] font-bold text-slate-500">
          
          {/* 1. Inicio */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategoria('todos');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-0.5 text-[#0b5c3b] cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span>Inicio</span>
          </button>

          {/* 2. Buscar */}
          <button
            type="button"
            onClick={() => {
              searchInputRef.current?.focus();
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-0.5 hover:text-slate-900 cursor-pointer"
          >
            <Search className="w-5 h-5" />
            <span>Buscar</span>
          </button>

          {/* 3. Bolsa (Botón Elevado Redondeado Verde en el Centro) */}
          <div className="relative -top-4">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="w-12 h-12 rounded-2xl bg-[#0b5c3b] text-white flex flex-col items-center justify-center shadow-lg shadow-[#0b5c3b]/30 active:scale-95 transition-all cursor-pointer relative"
              title="Mi Bolsa de Compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
            <span className="block text-center text-[10px] font-black text-[#0b5c3b] mt-0.5">
              Bolsa
            </span>
          </div>

          {/* 4. Calculadora */}
          <button
            type="button"
            onClick={() => setIsCalculadoraOpen(true)}
            className="flex flex-col items-center gap-0.5 hover:text-slate-900 cursor-pointer"
          >
            <Calculator className="w-5 h-5" />
            <span>Cálculo</span>
          </button>

          {/* 5. Perfil / Login */}
          <button
            type="button"
            onClick={currentUser ? onIrAlLaboratorio : onIrAlLogin}
            className="flex flex-col items-center gap-0.5 hover:text-slate-900 cursor-pointer"
          >
            <User className="w-5 h-5" />
            <span>{currentUser ? 'Perfil' : 'Ingresar'}</span>
          </button>

        </div>
      </nav>

      {/* MODAL DETALLE DE PRODUCTO (Bottom Sheet con stepper y botón Enviar a bolsa) */}
      <DetalleJabonModal
        jabon={selectedJabon}
        isOpen={Boolean(selectedJabon)}
        onClose={() => setSelectedJabon(null)}
        onAgregarAlCarrito={(item, qty) => {
          handleAddToCart(item, qty);
          setIsCartOpen(true);
        }}
      />

      {/* DRAWER BOLSA DE COMPRAS (El carrito que faltaba con WhatsApp checkout) */}
      <CarritoDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* MODAL CALCULADORA */}
      <CalculadoraJabonModal
        isOpen={isCalculadoraOpen || modoCalculadoraFijo}
        isLocked={modoCalculadoraFijo}
        onClose={() => {
          if (!modoCalculadoraFijo) {
            setIsCalculadoraOpen(false);
          }
        }}
        onIrAlLaboratorio={currentUser ? onIrAlLaboratorio : onIrAlLogin}
      />

    </div>
  );
};

