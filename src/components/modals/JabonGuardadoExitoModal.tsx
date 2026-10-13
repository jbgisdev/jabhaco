import React from 'react';
import {
  CheckCircle,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Award,
} from 'lucide-react';
import type { Jabon, RecetaItem } from '../../types/database.types';
import { formatCOP, formatDecimal } from '../../utils/formatters';

interface JabonGuardadoExitoModalProps {
  isOpen: boolean;
  onClose: () => void;
  jabonGuardado: Jabon | null;
  componentes: RecetaItem[];
  isMock: boolean;
  onVerCatalogo: () => void;
  onNuevaFormulacion: () => void;
}

export const JabonGuardadoExitoModal: React.FC<JabonGuardadoExitoModalProps> = ({
  isOpen,
  onClose,
  jabonGuardado,
  componentes,
  isMock,
  onVerCatalogo,
  onNuevaFormulacion,
}) => {
  if (!isOpen || !jabonGuardado) return null;

  const costoTotal = componentes.reduce((acc, curr) => acc + curr.subtotal_costo, 0);
  const valorVenta = jabonGuardado.valor_venta || 0;
  const margen = valorVenta - costoTotal;
  const rentabilidad = valorVenta > 0 ? (margen / valorVenta) * 100 : 0;

  const bases = componentes.filter((c) => c.insumo.categoria === 'base_glicerina');
  const pesoTotalBases = bases.reduce((acc, curr) => acc + curr.cantidad_usada, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 pl-3.5 pr-7 sm:p-6 sm:px-6">
      <div className="relative w-full max-w-[calc(100vw-2.5rem)] sm:max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 mx-auto">
        
        {/* Cabecera Decorativa */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-900 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle className="w-9 h-9 text-emerald-400" />
          </div>

          <h3 className="text-xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            ¡Jabón Guardado Exitosamente!
          </h3>
          <p className="text-xs text-brand-200 mt-1 max-w-xs mx-auto">
            {isMock
              ? 'Registrado con éxito en el Sandbox Local de Jabhaco Lab.'
              : 'Persistido exitosamente en PostgreSQL (Supabase) con todos sus componentes.'}
          </p>
        </div>

        {/* Ficha Resumen del Jabón Guardado */}
        <div className="p-4 pl-4 pr-5 sm:p-6 sm:pr-6 space-y-5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            {jabonGuardado.foto_producto_url && (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 shadow-sm border border-slate-200">
                <img
                  src={jabonGuardado.foto_producto_url}
                  alt={jabonGuardado.nombre}
                  className="w-full h-full object-cover"
                />
                {jabonGuardado.foto_etiqueta_url && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white font-semibold">
                    Etiqueta adjunta
                  </div>
                )}
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                  {jabonGuardado.tipo_piel || 'Jabón Artesanal'}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-1.5 leading-snug">
                  {jabonGuardado.nombre}
                </h4>
                {jabonGuardado.lema && (
                  <p className="text-xs text-slate-500 italic mt-0.5">"{jabonGuardado.lema}"</p>
                )}
              </div>
            </div>

            {/* Grid de Métricas */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
              <div className="p-2 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Costo Fab.
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-700">
                  {formatCOP(costoTotal)}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Precio Venta
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-brand-700">
                  {formatCOP(valorVenta)}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  Rentabilidad
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
                  {rentabilidad.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Detalles rápidos */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>
                <strong>{componentes.length}</strong> componentes en fórmula
              </span>
              <span>
                <strong>{formatDecimal(pesoTotalBases)}g</strong> de base
              </span>
            </div>
          </div>

          {/* Opciones de Acción */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={onVerCatalogo}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 transition-all active:scale-95"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-brand-200" />
                <span>Ver en Catálogo de Jabones</span>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-200" />
            </button>

            <button
              type="button"
              onClick={onNuevaFormulacion}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-all active:scale-95 border border-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-5 h-5 text-slate-600" />
                <span>Formular un Nuevo Jabón (Receta Limpia)</span>
              </div>
              <Sparkles className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Continuar editando esta receta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
