import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  tipo: 'success' | 'error' | 'info';
  titulo: string;
  descripcion?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const styles = {
    success: 'bg-emerald-950/90 text-emerald-100 border-emerald-800 shadow-emerald-950/20',
    error: 'bg-rose-950/90 text-rose-100 border-rose-800 shadow-rose-950/20',
    info: 'bg-slate-900/90 text-slate-100 border-slate-700 shadow-slate-950/20',
  }[toast.tipo];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[toast.tipo];

  const iconColors = {
    success: 'text-emerald-400',
    error: 'text-rose-400',
    info: 'text-brand-400',
  }[toast.tipo];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${styles}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColors}`} />
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold leading-tight">{toast.titulo}</h5>
        {toast.descripcion && (
          <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{toast.descripcion}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="text-white/60 hover:text-white p-0.5 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
