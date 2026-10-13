import React from 'react';
import {
  X,
  Sparkles,
  Check,
  ShieldCheck,
  MessageCircle,
  HelpCircle,
  Heart,
} from 'lucide-react';
import { formatCOP } from '../../utils/formatters';

export interface SoapProduct {
  id: string;
  nombre: string;
  lema?: string | null;
  descripcion?: string | null;
  tipo_piel?: string | null;
  beneficios?: string | null;
  modo_uso?: string | null;
  observaciones?: string | null;
  foto_producto_url?: string | null;
  foto_etiqueta_url?: string | null;
  valor_venta: number;
  categoria?: string;
  badge?: string;
  artesano?: string;
}

interface DetalleJabonModalProps {
  jabon: SoapProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DetalleJabonModal: React.FC<DetalleJabonModalProps> = ({
  jabon,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !jabon) return null;

  const handlePedirWhatsApp = () => {
    const texto = encodeURIComponent(
      `¡Hola! Estoy interesado en ordenar el jabón artesanal "${jabon.nombre}" (${formatCOP(jabon.valor_venta)} COP). ¿Tienen disponibilidad?`
    );
    window.open(`https://wa.me/?text=${texto}`, '_blank');
  };

  const beneficiosList = jabon.beneficios
    ? jabon.beneficios.split('\n').filter((b) => b.trim().length > 0)
    : [
        'Elaborado con 100% base vegetal de glicerina de alta pureza.',
        'Libre de sulfatos agresivos, parabenos y detergentes industriales.',
        'Mantiene el manto hidrolipídico natural de la piel.',
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón flotante cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-sm transition-colors shadow-md"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
          
          {/* Header con Imagen Principal */}
          <div className="relative bg-slate-100 h-64 sm:h-80 w-full overflow-hidden flex items-center justify-center">
            {jabon.foto_producto_url ? (
              <img
                src={jabon.foto_producto_url}
                alt={jabon.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                <Sparkles className="w-12 h-12 text-brand-500" />
                <span className="text-xs font-semibold">Jabón Botánico Exclusivo</span>
              </div>
            )}

            {/* Badges sobre la foto */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
              <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-sm shadow-md">
                {jabon.tipo_piel || 'Todo tipo de piel'}
              </span>
              {jabon.badge && (
                <span className="px-3 py-1 rounded-full bg-brand-600/90 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-sm shadow-md">
                  {jabon.badge}
                </span>
              )}
            </div>

            {/* Degradado inferior */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

            {/* Precio flotante sobre la foto */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white z-10">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-200 font-semibold block">
                  Precio Artesanal
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                  {formatCOP(jabon.valor_venta)} <span className="text-sm font-semibold">COP</span>
                </span>
              </div>

              <span className="text-[11px] bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-xl text-white font-medium border border-white/25">
                Barra ~100g
              </span>
            </div>
          </div>

          {/* Información y Ficha Técnica */}
          <div className="p-5 sm:p-7 space-y-6">
            
            {/* Título y Lema */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {jabon.nombre}
              </h2>
              {jabon.lema && (
                <p className="text-sm sm:text-base text-brand-700 font-semibold mt-1">
                  "{jabon.lema}"
                </p>
              )}
              {jabon.descripcion && (
                <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                  {jabon.descripcion}
                </p>
              )}
            </div>

            {/* Garantías estilo Rappi */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 py-2">
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 text-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="block text-[11px] font-bold text-emerald-900">100% Vegetal</span>
                <span className="text-[10px] text-emerald-700/80">Base de Glicerina</span>
              </div>
              <div className="p-3 rounded-2xl bg-teal-50/80 border border-teal-100 text-center">
                <Sparkles className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                <span className="block text-[11px] font-bold text-teal-900">Artesanal</span>
                <span className="text-[10px] text-teal-700/80">Hecho a mano</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-100 text-center">
                <Heart className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <span className="block text-[11px] font-bold text-amber-900">Biodegradable</span>
                <span className="text-[10px] text-amber-700/80">Eco amigable</span>
              </div>
            </div>

            {/* Beneficios para la piel */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Beneficios Principales
              </h3>
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                {beneficiosList.map((beneficio, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span>{beneficio}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modo de Uso */}
            {jabon.modo_uso && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-brand-600" />
                  Modo de Uso Recomendado
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-brand-50/50 p-3.5 rounded-xl border border-brand-100">
                  {jabon.modo_uso}
                </p>
              </div>
            )}

            {/* Observaciones o recomendación de conservación */}
            {jabon.observaciones && (
              <p className="text-[11px] text-slate-500 italic">
                * Nota del artesano: {jabon.observaciones}
              </p>
            )}
          </div>
        </div>

        {/* Footer de Acción estilo Rappi */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Total</span>
            <span className="text-xl font-extrabold text-slate-900">
              {formatCOP(jabon.valor_venta)} <span className="text-xs text-slate-500 font-normal">COP</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePedirWhatsApp}
              type="button"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Pedir por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
