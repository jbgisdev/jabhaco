import React, { useState } from 'react';
import { X, Heart, QrCode, Download, ExternalLink } from 'lucide-react';

interface ApoyarProyectoModalProps {
  isOpen: boolean;
  onClose: () => void;
  numeroNequi?: string;
  titularNequi?: string;
  enlacePayPal?: string;
}

export const ApoyarProyectoModal: React.FC<ApoyarProyectoModalProps> = ({
  isOpen,
  onClose,
  numeroNequi,
  titularNequi = 'Jaime Buelvas / Jabhaco Lab',
  enlacePayPal = 'https://paypal.me/Jaimillo979',
}) => {
  const [tabActiva, setTabActiva] = useState<'nequi' | 'paypal'>('nequi');
  const [copiado, setCopiado] = useState(false);

  if (!isOpen) return null;

  const handleCopiarNumero = () => {
    if (!numeroNequi) return;
    navigator.clipboard.writeText(numeroNequi.replace(/\s+/g, ''));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Cálida con Gradiente */}
        <div className="relative bg-gradient-to-r from-[#200020] via-[#2a0845] to-[#003087] p-5 sm:p-6 text-white text-center shrink-0 overflow-hidden">
          {/* Luces decorativas */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-inner mb-2.5">
            ☕
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            Invítame un café
          </h3>
          <p className="text-xs text-blue-100/90 font-medium max-w-xs mx-auto mt-1 leading-relaxed">
            Esta calculadora botánica es <strong>100% gratuita y sin anuncios</strong>. Tu aporte voluntario nos ayuda a mantenerla en línea.
          </p>
        </div>

        {/* Selector de Pestañas: Nequi vs PayPal */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 grid grid-cols-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setTabActiva('nequi')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tabActiva === 'nequi'
                ? 'bg-white text-[#200020] shadow-sm border border-purple-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#da0081] inline-block" />
            <span>🇨🇴 Nequi (Colombia)</span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva('paypal')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tabActiva === 'paypal'
                ? 'bg-white text-[#003087] shadow-sm border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#0070ba] inline-block" />
            <span>🌎 PayPal (Mundial)</span>
          </button>
        </div>

        {/* Contenido Scrolleable según pestaña */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* TAB 1: NEQUI COLOMBIA */}
          {tabActiva === 'nequi' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#200020]/5 via-pink-50/40 to-purple-50/60 border-2 border-purple-200/90 shadow-xs text-center space-y-3.5 animate-in fade-in duration-150">
              
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-[#200020]">
                  Aporte por QR Nequi
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  0% Comisiones
                </span>
              </div>

              {/* Código QR enmarcado */}
              <div className="inline-block p-3 bg-white rounded-2xl shadow-md border-2 border-purple-100 transition-transform hover:scale-102">
                <img
                  src="/nequi-qr.png"
                  alt="Código QR Nequi Jabhaco Lab"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto rounded-xl"
                />
              </div>

              {/* Instrucciones Rápidas */}
              <div className="text-xs text-slate-600 bg-white/80 p-3 rounded-xl border border-purple-100/80 space-y-1 text-left">
                <p className="font-bold text-[#200020] flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-[#da0081]" />
                  ¿Cómo transferir desde Nequi?
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-500 pl-1">
                  <li>Abre tu aplicación de <strong>Nequi</strong> en tu celular.</li>
                  <li>Toca el botón de <strong>Escanear QR</strong>.</li>
                  <li>Apunta a este código y envía tu aporte voluntario ($2.000, $5.000 o lo que gustes).</li>
                </ol>
              </div>

              {/* Botón para descargar el QR si están en móvil */}
              <a
                href="/nequi-qr.png"
                download="Nequi-QR-JabhacoLab.png"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#200020] text-xs font-bold border border-purple-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Guardar imagen del QR en el celular</span>
              </a>

              {numeroNequi && (
                <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-purple-100">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Número de Nequi</span>
                    <span className="text-sm font-black text-slate-800 tracking-wider">{numeroNequi}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopiarNumero}
                    className="px-3 py-1.5 rounded-lg bg-[#da0081] hover:bg-[#b8006d] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    {copiado ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
              )}

              {titularNequi && (
                <p className="text-[10px] text-slate-400 font-medium">
                  Titular verificado: <strong>{titularNequi}</strong>
                </p>
              )}

            </div>
          )}

          {/* TAB 2: PAYPAL INTERNACIONAL */}
          {tabActiva === 'paypal' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-indigo-50/60 border-2 border-blue-200 shadow-xs text-center space-y-4 animate-in fade-in duration-150">
              
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-[#003087]">
                  Aporte Internacional
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Tarjetas & PayPal
                </span>
              </div>

              {/* Tarjeta PayPal con Badge */}
              <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-xl font-black text-[#003087]">
                  P
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    PayPal.Me / Jaimillo979
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Acepta pagos en <strong>USD</strong> desde cualquier país (México, España, EE.UU., Argentina, etc.) con tarjeta de crédito, débito o saldo de PayPal.
                  </p>
                </div>

                {/* Sugerencias de café */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-black text-slate-800 block">$2 USD</span>
                    <span className="text-[10px] text-slate-400">1 Café ☕</span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-xs font-black text-[#003087] block">$5 USD</span>
                    <span className="text-[10px] text-blue-600 font-semibold">2 Cafés ☕☕</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-black text-slate-800 block">Libre</span>
                    <span className="text-[10px] text-slate-400">Tu elección 💛</span>
                  </div>
                </div>

                {/* Botón Principal PayPal */}
                <a
                  href={enlacePayPal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#003087] to-[#0070ba] hover:from-[#002568] hover:to-[#005a96] text-white font-extrabold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Donar con PayPal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-[11px] text-slate-400 font-medium">
                Transacción protegida y cifrada directamente por <strong>PayPal Inc.</strong>
              </p>

            </div>
          )}

          {/* Mensaje de Gratitud Común */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>¡Gracias por apoyar la jabonería artesanal independiente!</span>
          </div>

        </div>

        {/* Footer del Modal */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Volver a la calculadora
          </button>
        </div>

      </div>
    </div>
  );
};
