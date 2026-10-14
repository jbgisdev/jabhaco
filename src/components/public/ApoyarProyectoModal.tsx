import React, { useState } from 'react';
import { X, Heart, QrCode, Download, ExternalLink } from 'lucide-react';

interface ApoyarProyectoModalProps {
  isOpen: boolean;
  onClose: () => void;
  numeroNequi?: string;
  titularNequi?: string;
  enlaceInternacional?: string;
}

export const ApoyarProyectoModal: React.FC<ApoyarProyectoModalProps> = ({
  isOpen,
  onClose,
  numeroNequi,
  titularNequi = 'Jaime Buelvas / Jabhaco Lab',
  enlaceInternacional,
}) => {
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
        <div className="relative bg-gradient-to-r from-[#200020] via-[#330033] to-[#4a004a] p-5 sm:p-6 text-white text-center shrink-0 overflow-hidden">
          {/* Luces decorativas */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-inner mb-3">
            ☕
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            Invítame un café
          </h3>
          <p className="text-xs text-pink-200/90 font-medium max-w-xs mx-auto mt-1 leading-relaxed">
            Esta calculadora botánica es <strong>100% gratuita y sin anuncios</strong>. Si te ahorró tiempo o materias primas, tu aporte voluntario ayuda a mantenerla en línea.
          </p>
        </div>

        {/* Contenido Scrolleable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Tarjeta de Nequi Oficial */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#200020]/5 via-pink-50/40 to-purple-50/60 border-2 border-purple-200/90 shadow-xs text-center space-y-3.5">
            
            {/* Header Nequi */}
            <div className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#da0081] inline-block shadow-xs" />
              <span className="text-xs font-black tracking-wider uppercase text-[#200020]">
                Aporte Directo por Nequi
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
                ¿Cómo enviar tu aporte desde Nequi?
              </p>
              <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-500 pl-1">
                <li>Abre tu aplicación de <strong>Nequi</strong> en tu celular.</li>
                <li>Toca el botón de <strong>Escanear QR</strong>.</li>
                <li>Apunta a esta pantalla con la cámara y envía tu aporte voluntario ($2.000, $5.000 o lo que nazca de tu corazón).</li>
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

            {/* Número opcional si existe */}
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

          {/* Opción Internacional (si existe enlace) */}
          {enlaceInternacional && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
                <span>🌎 ¿Estás fuera de Colombia?</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Puedes apoyar con tarjeta de crédito o PayPal desde cualquier país.
              </p>
              <a
                href={enlaceInternacional}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Aportar internacionalmente</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Mensaje de Gratitud */}
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
