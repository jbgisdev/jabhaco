import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Link as LinkIcon,
  X,
  Sparkles,
  Check,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface FotoUploaderProps {
  label: string;
  sublabel?: string;
  tipo: 'producto' | 'etiqueta';
  valorUrl: string | null | undefined;
  onChangeUrl: (url: string | null) => void;
}

// Presets elegantes inspirados en jabonería artesanal
const PRESETS_BOTANICOS = [
  {
    nombre: 'Avena, Miel & Karité',
    url: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80',
  },
  {
    nombre: 'Carbón Activado & Coco',
    url: 'https://images.unsplash.com/photo-1607006311600-33471430268f?auto=format&fit=crop&w=600&q=80',
  },
  {
    nombre: 'Lavanda & Manzanilla',
    url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80',
  },
  {
    nombre: 'Caléndula & Naranja',
    url: 'https://images.unsplash.com/photo-1547793548-7a0e7dfdb24f?auto=format&fit=crop&w=600&q=80',
  },
  {
    nombre: 'Café Exfoliante & Cacao',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
  },
  {
    nombre: 'Arcilla Rosa Francesa',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
  },
];

const PRESETS_ETIQUETAS = [
  {
    nombre: 'Etiqueta Kraft Ecológica',
    url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
  },
  {
    nombre: 'Faja Minimalista Botánica',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
  },
];

/**
 * Optimiza y comprime imágenes cargadas a un tamaño ligero (~50KB)
 */
const comprimirImagen = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 750;
        const MAX_HEIGHT = 750;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Formato JPEG con compresión 0.78
        const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('No se pudo procesar la imagen'));
      img.src = e.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const FotoUploader: React.FC<FotoUploaderProps> = ({
  label,
  sublabel,
  tipo,
  valorUrl,
  onChangeUrl,
}) => {
  const [modo, setModo] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const presets = tipo === 'producto' ? PRESETS_BOTANICOS : PRESETS_ETIQUETAS;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    setIsProcessing(true);
    try {
      const base64Optimizada = await comprimirImagen(file);
      onChangeUrl(base64Optimizada);
    } catch (err) {
      console.error('Error al optimizar imagen:', err);
      alert('Hubo un error al procesar la imagen. Intenta con otra imagen.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAplicarUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onChangeUrl(urlInput.trim());
    setUrlInput('');
  };

  const handleQuitarFoto = () => {
    onChangeUrl(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            {label}
          </label>
          {sublabel && <p className="text-[11px] text-slate-400">{sublabel}</p>}
        </div>

        {valorUrl && (
          <button
            type="button"
            onClick={handleQuitarFoto}
            className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Quitar foto</span>
          </button>
        )}
      </div>

      {/* Si ya hay foto cargada: Vista previa destacada */}
      {valorUrl ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm aspect-video sm:aspect-16/9 flex items-center justify-center">
          <img
            src={valorUrl}
            alt={label}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/30 opacity-80 group-hover:opacity-100 transition-opacity" />

          {/* Badge superior */}
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white backdrop-blur-md text-[11px] font-bold flex items-center gap-1 shadow-sm">
            <Check className="w-3 h-3" />
            <span>{tipo === 'producto' ? 'Foto de Barra' : 'Foto de Etiqueta'}</span>
          </div>

          {/* Acciones flotantes */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPreviewModal(true)}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all active:scale-95"
              title="Ver en tamaño completo"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-xs font-bold backdrop-blur-md transition-all shadow-md active:scale-95 flex items-center gap-1"
              title="Reemplazar foto"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Cambiar</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        /* Si NO hay foto: Selector interactivo por pestañas */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-3 sm:p-4 space-y-3 transition-colors hover:border-brand-400">
          {/* Selector de modo */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setModo('upload')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                modo === 'upload'
                  ? 'bg-brand-50 text-brand-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Foto</span>
            </button>

            <button
              type="button"
              onClick={() => setModo('presets')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                modo === 'presets'
                  ? 'bg-brand-50 text-brand-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Sugeridas</span>
            </button>

            <button
              type="button"
              onClick={() => setModo('url')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                modo === 'url'
                  ? 'bg-brand-50 text-brand-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Pegar URL</span>
            </button>
          </div>

          {/* Modo 1: Carga desde archivo / Drag & Drop */}
          {modo === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border border-dashed border-slate-200 rounded-xl p-4 bg-white hover:bg-brand-50/20 text-center space-y-2 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                {isProcessing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {isProcessing ? 'Optimizando foto...' : 'Selecciona o toma una foto'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  JPG, PNG o WEBP (se optimiza automáticamente)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Modo 2: Galería de presets sugeridos */}
          {modo === 'presets' && (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-500 font-medium">
                Selecciona una foto artesanal para tu prototipo:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChangeUrl(p.url)}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video text-left hover:ring-2 hover:ring-brand-500 transition-all active:scale-95"
                  >
                    <img
                      src={p.url}
                      alt={p.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-black/20 to-transparent" />
                    <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] font-bold text-white line-clamp-1 leading-tight drop-shadow">
                      {p.nombre}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modo 3: Pegar enlace URL */}
          {modo === 'url' && (
            <form onSubmit={handleAplicarUrl} className="flex gap-2">
              <input
                type="url"
                placeholder="https://ejemplo.com/foto-jabon.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={!urlInput.trim()}
                className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
              >
                Aplicar
              </button>
            </form>
          )}
        </div>
      )}

      {/* Modal de Zoom / Vista Previa Completa */}
      {previewModal && valorUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pl-3.5 pr-7 sm:p-6 sm:px-6"
          onClick={() => setPreviewModal(false)}
        >
          <div className="relative max-w-[calc(100vw-2.5rem)] sm:max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 mx-auto">
            <button
              onClick={() => setPreviewModal(false)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={valorUrl}
              alt={label}
              className="w-full max-h-[80vh] object-contain rounded-xl mx-auto"
            />
            <p className="text-center text-xs text-slate-300 py-2 font-medium">{label}</p>
          </div>
        </div>
      )}
    </div>
  );
};
