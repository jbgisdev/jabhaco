import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Key,
  Globe,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveLocalSupabaseCredentials,
  clearLocalSupabaseCredentials,
} from '../../lib/supabase';

interface ConfigSupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdated: () => void;
}

export const ConfigSupabaseModal: React.FC<ConfigSupabaseModalProps> = ({
  isOpen,
  onClose,
  onCredentialsUpdated,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [mensajeExito, setMensajeExito] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      setMensajeExito(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalSupabaseCredentials(url.trim(), anonKey.trim());
    setMensajeExito(true);
    setTimeout(() => {
      onCredentialsUpdated();
      onClose();
    }, 700);
  };

  const handleRestablecerMock = () => {
    clearLocalSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    onCredentialsUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 pl-3.5 pr-7 sm:p-6 sm:px-6 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[calc(100vw-2.5rem)] sm:max-w-lg rounded-2xl shadow-modal border border-slate-200 overflow-hidden mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pr-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Conexión con Supabase
              </h3>
              <p className="text-xs text-slate-500">
                Configura las credenciales de tu proyecto PostgreSQL en Supabase
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGuardar} className="p-4 pl-4 pr-5 sm:p-6 sm:pr-6 space-y-4">
          {mensajeExito && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>¡Credenciales actualizadas y cliente de Supabase reiniciado!</span>
            </div>
          )}

          <div>
            <label
              htmlFor="supabase_url"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Project URL de Supabase
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                id="supabase_url"
                type="url"
                placeholder="https://xyzabcdefghijklmno.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Encuéntrala en <strong>Project Settings → API → Project URL</strong>
            </p>
          </div>

          <div>
            <label
              htmlFor="supabase_anon_key"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Anon / Public API Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                id="supabase_anon_key"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Encuéntrala en <strong>Project Settings → API → anon / public key</strong>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
              <span>¿Cómo funciona el modo Sandbox?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Si dejas las credenciales vacías, la app opera en modo Sandbox Local con bases de glicerina precargadas y almacenamiento en tu navegador. Cuando ingreses las credenciales reales de Supabase, las operaciones se sincronizarán directamente con PostgreSQL.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleRestablecerMock}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Usar Modo Sandbox</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition-all"
              >
                Guardar Conexión
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
