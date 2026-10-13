import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo?: string;
  mensaje: string;
  itemNombre?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  titulo = '¿Eliminar insumo de la receta?',
  mensaje,
  itemNombre,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 pl-3.5 pr-7 sm:p-6 sm:px-6 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[calc(100vw-2.5rem)] sm:max-w-md rounded-2xl shadow-modal border border-slate-200 overflow-hidden mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 pl-4 pr-5 sm:p-6 sm:pr-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h3 className="text-base font-bold text-slate-900 break-words leading-snug">{titulo}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed break-words">
                {mensaje}
              </p>
              {itemNombre && (
                <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="truncate block">{itemNombre}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 pr-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Sí, eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
