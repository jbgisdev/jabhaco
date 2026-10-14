import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
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
  onAgregarAlCarrito?: (jabon: SoapProduct, cantidad: number) => void;
}

export const DetalleJabonModal: React.FC<DetalleJabonModalProps> = ({
  jabon,
  isOpen,
  onClose,
  onAgregarAlCarrito,
}) => {
  const [cantidad, setCantidad] = useState(1);
  const [agregadoAnim, setAgregadoAnim] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCantidad(1);
      setAgregadoAnim(false);
    }
  }, [isOpen]);

  if (!isOpen || !jabon) return null;

  const handleEnviarABolsa = () => {
    if (onAgregarAlCarrito) {
      onAgregarAlCarrito(jabon, cantidad);
      setAgregadoAnim(true);
      setTimeout(() => {
        setAgregadoAnim(false);
        onClose();
      }, 400);
    } else {
      // Fallback a WhatsApp directo
      const texto = encodeURIComponent(
        `¡Hola Jabhaco Lab! 🧼 Quiero ordenar ${cantidad}x "${jabon.nombre}" (${formatCOP(
          jabon.valor_venta * cantidad
        )} COP). ¿Tienen disponibilidad?`
      );
      window.open(`https://wa.me/?text=${texto}`, '_blank');
      onClose();
    }
  };

  const beneficiosList = jabon.beneficios
    ? jabon.beneficios.split('\n').filter((b) => b.trim().length > 0)
    : [
        'Elaborado con 100% base vegetal de glicerina de alta pureza.',
        'Libre de sulfatos agresivos, parabenos y detergentes industriales.',
        'Mantiene el manto hidrolipídico natural de la piel.',
      ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de arrastre estilo Bottom Sheet */}
        <div className="pt-3 pb-1 shrink-0 flex items-center justify-center relative">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
          <button
            onClick={onClose}
            className="absolute right-4 top-2 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo Scrolleable */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-6 pb-4 space-y-4">
          
          {/* Imagen Grande Redondeada estilo Vecino Pro */}
          <div className="w-full h-64 sm:h-72 rounded-3xl bg-slate-100 overflow-hidden relative shadow-sm">
            {jabon.foto_producto_url ? (
              <img
                src={jabon.foto_producto_url}
                alt={jabon.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                <Sparkles className="w-12 h-12 text-[#0b5c3b]" />
                <span className="text-xs font-semibold text-slate-400">Jabón Botánico Exclusivo</span>
              </div>
            )}

            {/* Badges sobre la foto */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {jabon.badge ? (
                <span className="px-3 py-1 rounded-full bg-[#0b5c3b] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  {jabon.badge}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  OFERTA
                </span>
              )}
            </div>
          </div>

          {/* Información Principal del Producto */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0b5c3b] block">
              JABHACO BOTÁNICO
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5 leading-tight">
              {jabon.nombre}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              100g • {jabon.tipo_piel || 'Para todo tipo de piel'}
            </p>
            {jabon.lema && (
              <p className="text-xs text-[#0b5c3b] font-semibold italic mt-1">
                "{jabon.lema}"
              </p>
            )}

            {/* Precio en grande estilo Vecino Pro */}
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {formatCOP(jabon.valor_venta)} <span className="text-xs font-bold text-slate-500">COP</span>
              </span>
            </div>
          </div>

          {/* Descripción & Beneficios */}
          {jabon.descripcion && (
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {jabon.descripcion}
            </p>
          )}

          {/* Beneficios Clave */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Beneficios Botánicos
            </span>
            <div className="space-y-1.5 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/80">
              {beneficiosList.map((beneficio, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0b5c3b] mt-1.5 shrink-0" />
                  <span>{beneficio}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modo de Uso si existe */}
          {jabon.modo_uso && (
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Modo de empleo</span>
              <p>{jabon.modo_uso}</p>
            </div>
          )}

        </div>

        {/* Footer con Stepper y Botón Enviar a bolsa (Exacto a Imagen 3) */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
          
          {/* Stepper de Cantidad [- 1 +] */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
              disabled={cantidad <= 1}
              className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs disabled:opacity-40 transition-all cursor-pointer"
              title="Disminuir"
            >
              <Minus className="w-4 h-4 text-[#0b5c3b]" />
            </button>

            <span className="w-7 text-center font-black text-base text-slate-900">
              {cantidad}
            </span>

            <button
              type="button"
              onClick={() => setCantidad((prev) => prev + 1)}
              className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs transition-all cursor-pointer"
              title="Aumentar"
            >
              <Plus className="w-4 h-4 text-[#0b5c3b]" />
            </button>
          </div>

          {/* Botón Principal: Enviar a bolsa */}
          <button
            type="button"
            onClick={handleEnviarABolsa}
            className={`flex-1 py-3.5 px-5 rounded-2xl font-extrabold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer ${
              agregadoAnim
                ? 'bg-emerald-600 shadow-emerald-600/30'
                : 'bg-[#0b5c3b] hover:bg-[#08482e] shadow-[#0b5c3b]/25'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{agregadoAnim ? '¡Agregado!' : 'Enviar a bolsa'}</span>
          </button>

        </div>

      </div>
    </div>
  );
};
