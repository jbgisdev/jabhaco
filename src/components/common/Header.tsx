import React from 'react';
import { Database, Settings, Save, BookOpen, LogOut, Store, Calculator } from 'lucide-react';
import { getSupabaseCredentials } from '../../lib/supabase';
import type { AuthUser } from '../../types/database.types';

interface HeaderProps {
  onOpenConfig: () => void;
  onGuardar: () => void;
  onVerJabones: () => void;
  onVerCatalogoPublico?: () => void;
  onOpenCalculadora?: () => void;
  onLogout?: () => void;
  currentUser?: AuthUser | null;
  isSaving: boolean;
  canSave: boolean;
  totalComponentes: number;
  jabonesGuardadosCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenConfig,
  onGuardar,
  onVerJabones,
  onVerCatalogoPublico,
  onOpenCalculadora,
  onLogout,
  currentUser,
  isSaving,
  totalComponentes,
  jabonesGuardadosCount,
}) => {
  const { isConfigured } = getSupabaseCredentials();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto pl-3.5 pr-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18">
          
          {/* Logo y Branding */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src="/logo.png"
              alt="Jabhaco Lab"
              className="h-9 sm:h-11 w-auto object-contain select-none"
            />
            <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              v1.0
            </span>
          </div>

          {/* Acciones de Cabecera (Totalmente responsivas para Mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Botón Ver Catálogo Público (Tienda) */}
            {onVerCatalogoPublico && (
              <button
                onClick={onVerCatalogoPublico}
                type="button"
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all active:scale-95 cursor-pointer"
                title="Ver Catálogo Público (Tienda)"
              >
                <Store className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline">Catálogo Público</span>
              </button>
            )}

            {/* Botón Calculadora Rápida */}
            {onOpenCalculadora && (
              <button
                onClick={onOpenCalculadora}
                type="button"
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all active:scale-95 cursor-pointer"
                title="Calculadora de Proporciones (Regla 1.2 & 3%)"
              >
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span className="hidden lg:inline">Calculadora</span>
              </button>
            )}

            {/* Botón Ver Catálogo / Mis Jabones */}
            <button
              onClick={onVerJabones}
              type="button"
              className="relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all active:scale-95"
              title="Mis Jabones Guardados"
            >
              <BookOpen className="w-4 h-4 text-brand-600" />
              <span className="hidden md:inline">Mis Jabones</span>
              {jabonesGuardadosCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:static sm:ml-0.5 inline-flex items-center justify-center bg-brand-600 sm:bg-brand-100 text-white sm:text-brand-800 text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-auto sm:h-auto sm:px-1.5 sm:py-0.2 rounded-full">
                  {jabonesGuardadosCount}
                </span>
              )}
            </button>

            {/* Estado de Supabase */}
            <button
              onClick={onOpenConfig}
              type="button"
              className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium border transition-all ${
                isConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title={isConfigured ? 'Supabase Conectado' : 'Modo Sandbox Local'}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">
                {isConfigured ? 'Supabase Conectado' : 'Sandbox Local'}
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            </button>

            {/* Botón Principal Guardar Jabón */}
            <button
              onClick={onGuardar}
              disabled={isSaving}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                totalComponentes > 0
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-brand-600/25 ring-2 ring-brand-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
              title="Guardar y registrar jabón"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSaving ? 'Guardando...' : 'Guardar Jabón'}
              </span>
              <span className="sm:hidden font-semibold">
                {isSaving ? '...' : 'Guardar'}
              </span>
              {totalComponentes > 0 && (
                <span className="inline-flex items-center justify-center bg-white/20 text-white text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                  {totalComponentes}
                </span>
              )}
            </button>

            {/* Usuario autenticado & Botón Cerrar Sesión */}
            {currentUser && (
              <div className="flex items-center gap-1 pl-1 sm:pl-2 border-l border-slate-200">
                <div
                  className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                  title={`Conectado como ${currentUser.email} (${currentUser.nombre})`}
                >
                  <div className="w-5 h-5 rounded-lg bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {currentUser.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[110px] truncate">{currentUser.nombre}</span>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    type="button"
                    className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4 text-slate-500 hover:text-rose-600" />
                    <span className="hidden lg:inline text-[11px]">Salir</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
