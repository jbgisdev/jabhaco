import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { login, register, ADMIN_CREDENTIALS } from '../../lib/auth';
import type { AuthUser } from '../../types/database.types';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  onVolverAlCatalogo?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onVolverAlCatalogo }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Campos
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados de carga y feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quickFilled, setQuickFilled] = useState(false);

  const handleTabChange = (newTab: 'login' | 'register') => {
    setTab(newTab);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const { user, error } = await login(email, password);
      if (error) {
        setErrorMessage(error);
        setIsLoading(false);
        return;
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error inesperado al iniciar sesión.');
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const nombreCompleto = `${nombre} ${apellido}`.trim() || nombre;
      const { user, error, message } = await register(nombreCompleto, email, password);
      if (error) {
        setErrorMessage(error);
        setIsLoading(false);
        return;
      }
      if (message) {
        setSuccessMessage(message);
      }
      setTimeout(() => {
        onLoginSuccess(user);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar el registro.');
      setIsLoading(false);
    }
  };

  const handleFillAdminCredentials = () => {
    setEmail(ADMIN_CREDENTIALS.email);
    setPassword(ADMIN_CREDENTIALS.password);
    setErrorMessage(null);
    setQuickFilled(true);
    setTimeout(() => setQuickFilled(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-[#0b5c3b] selection:text-white">
      {/* Mancha orgánica verde menta en la esquina superior derecha (Estilo Vecino Pro) */}
      <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#e6f4ea] rounded-bl-[140px] pointer-events-none -z-0" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-50/60 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Contenedor Principal */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Botón Volver al Catálogo */}
        {onVolverAlCatalogo && (
          <div className="mb-4 text-left">
            <button
              type="button"
              onClick={onVolverAlCatalogo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Volver al Catálogo</span>
            </button>
          </div>
        )}

        {/* Logo e Identidad estilo Vecino Pro */}
        <div className="mb-6 text-left">
          {/* Badge Icono Cuadrado Redondeado Verde */}
          <div className="w-14 h-14 rounded-2xl bg-[#0b5c3b] flex items-center justify-center text-white shadow-md shadow-[#0b5c3b]/20 mb-4">
            <span className="font-black text-xl tracking-tight">JL</span>
          </div>

          <span className="text-[11px] font-black uppercase tracking-widest text-[#0b5c3b] block">
            JABHACO LAB • JABONERÍA BOTÁNICA
          </span>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 leading-tight">
            Jabones botánicos,<br />
            <span className="text-[#0b5c3b]">hechos para ti.</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Elige tus productos, formula tus recetas y gestiona tus pedidos fácilmente.
          </p>
        </div>

        {/* Segmented Switch: Regístrate / Inicia sesión */}
        <div className="bg-slate-100 p-1 rounded-2xl grid grid-cols-2 gap-1 mb-5 border border-slate-200/60">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Inicia sesión
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-[#0b5c3b] shadow-sm border border-slate-200/80'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Regístrate
          </button>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-rose-900">Atención</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Mensaje de Éxito */}
        {successMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-emerald-900">¡Cuenta Creada!</span>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* FORMULARIO LOGIN */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="nombre@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0b5c3b]/20 focus:border-[#0b5c3b] transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0b5c3b]/20 focus:border-[#0b5c3b] transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón Principal Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 rounded-2xl bg-[#0b5c3b] hover:bg-[#08482e] text-white font-extrabold text-sm shadow-md shadow-[#0b5c3b]/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <span>Iniciar sesión y entrar</span>
              )}
            </button>

            {/* Acceso Rápido Administrador */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleFillAdminCredentials}
                className="text-xs text-slate-400 hover:text-[#0b5c3b] font-semibold transition-colors inline-flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{quickFilled ? '✓ Credenciales de admin cargadas' : 'Cargar credenciales de admin (demo)'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* FORMULARIO REGISTRO (Exacto a Imagen 1) */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {/* Nombre y Apellido en 2 columnas */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0b5c3b]/20 focus:border-[#0b5c3b] transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  placeholder="Tu apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0b5c3b]/20 focus:border-[#0b5c3b] transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                placeholder="nombre@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0b5c3b]/20 focus:border-[#0b5c3b] transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Número de WhatsApp
              </label>
              <input
                type="tel"
                placeholder="300 000 0000"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0b5c3b]/20 focus:border-[#0b5c3b] transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0b5c3b]/20 focus:border-[#0b5c3b] transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón Principal Registro */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 rounded-2xl bg-[#0b5c3b] hover:bg-[#08482e] text-white font-extrabold text-sm shadow-md shadow-[#0b5c3b]/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <span>Crear cuenta y entrar</span>
              )}
            </button>
          </form>
        )}

        {/* Nota al pie estilo Vecino Pro */}
        <p className="text-[11px] text-slate-400 text-center mt-5 leading-normal max-w-xs mx-auto">
          Tus datos se usan para identificar tus pedidos y avisarte cuando estén listos.
        </p>

      </div>
    </div>
  );
};
