import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Database,
  KeyRound,
  UserPlus,
  LogIn,
  ArrowLeft,
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const { user, error, message } = await register(nombre, email, password);
      if (error) {
        setErrorMessage(error);
        setIsLoading(false);
        return;
      }
      if (message) {
        setSuccessMessage(message);
      }
      // Pequeño retardo para que el usuario perciba la confirmación
      setTimeout(() => {
        onLoginSuccess(user);
      }, 700);
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
    setTimeout(() => setQuickFilled(false), 2500);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-brand-500 selection:text-white">
      {/* Luces y Efectos de Fondo Botanicos / Gradientes Ambientales */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Contenedor Principal */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Botón Volver al Catálogo */}
        {onVolverAlCatalogo && (
          <div className="mb-3 text-left">
            <button
              type="button"
              onClick={onVolverAlCatalogo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Volver al Catálogo Público</span>
            </button>
          </div>
        )}

        {/* Cabecera / Identidad de Marca */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-emerald-500 text-white shadow-xl shadow-brand-500/25 mb-3 border border-brand-400/30">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Jabhaco<span className="text-brand-400 font-semibold ml-1">Lab</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Sistema Profesional de Formulación, Costeo & Registro de Jabones Artesanales
          </p>
        </div>

        {/* Tarjeta Glassmorphic */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          
          {/* Selector de Pestaña: Iniciar Sesión / Crear Cuenta */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/70 border border-slate-800 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                tab === 'login'
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-700/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                tab === 'register'
                  ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white shadow-md shadow-emerald-700/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear Cuenta</span>
            </button>
          </div>

          {/* Banner de Mensaje de Error */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-rose-200">Atención</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Banner de Mensaje de Éxito */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-emerald-200">¡Excelente!</span>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* FORMULARIO: INICIAR SESIÓN */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Campo: Correo Electrónico */}
              <div>
                <label
                  htmlFor="login_email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login_email"
                    type="email"
                    required
                    autoFocus
                    placeholder="admin@jabha.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Campo: Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login_password"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Contraseña
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login_password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="admin123*"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Recordar sesión y botón rápido de admin */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Recordar sesión</span>
                </label>

                {/* Botón de auto-rellenar credenciales oficiales */}
                <button
                  type="button"
                  onClick={handleFillAdminCredentials}
                  className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 transition-colors hover:underline"
                  title="Cargar credenciales de Administrador"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{quickFilled ? '¡Cargadas!' : 'Credenciales Admin'}</span>
                </button>
              </div>

              {/* Botón de Inicio de Sesión */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white shadow-lg shadow-brand-600/30 hover:shadow-brand-500/40 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al Laboratorio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* FORMULARIO: CREAR CUENTA */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Campo: Nombre / Emprendimiento */}
              <div>
                <label
                  htmlFor="register_nombre"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
                >
                  Tu Nombre o Emprendimiento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="register_nombre"
                    type="text"
                    required
                    autoFocus
                    placeholder="Ej. Jabonería Botánica Sofía"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Campo: Correo Electrónico */}
              <div>
                <label
                  htmlFor="register_email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="register_email"
                    type="email"
                    required
                    placeholder="contacto@mimarca.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Campo: Contraseña */}
              <div>
                <label
                  htmlFor="register_password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
                >
                  Contraseña (Mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="register_password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Campo: Confirmar Contraseña */}
              <div>
                <label
                  htmlFor="register_confirm_password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
                >
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="register_confirm_password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Botón de Registro */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-600 hover:from-brand-500 hover:to-emerald-500 text-white shadow-lg shadow-brand-600/30 hover:shadow-brand-500/40 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creando tu cuenta...</span>
                  </>
                ) : (
                  <>
                    <span>Crear Cuenta & Comenzar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tarjeta de sugerencia con las credenciales solicitadas (solo visible en pestaña Iniciar Sesión) */}
          {tab === 'login' && (
            <div className="mt-5 pt-4 border-t border-slate-800/90 text-center">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
                <div className="flex items-center justify-between text-slate-300 font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-brand-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                    Credenciales de Administrador:
                  </span>
                  <span className="text-[10px] uppercase px-1.5 py-0.2 bg-brand-500/20 text-brand-300 rounded border border-brand-500/30">
                    Oficial
                  </span>
                </div>
                <p>
                  <strong>Usuario:</strong> <code className="text-slate-200 select-all font-mono">admin@jabha.co</code>
                </p>
                <p>
                  <strong>Contraseña:</strong> <code className="text-slate-200 select-all font-mono">admin123*</code>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Estado de Supabase en la parte inferior */}
        <div className="mt-5 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">
            Conectado a Base de Datos Supabase (PostgreSQL & Auth)
          </span>
        </div>
      </div>
    </div>
  );
};
