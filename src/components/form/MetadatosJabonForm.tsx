import React, { useState } from 'react';
import {
  Sparkles,
  DollarSign,
  Tag,
  User,
  Heart,
  Droplets,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Globe,
  Camera,
} from 'lucide-react';
import type { JabonFormData } from '../../types/database.types';
import { formatCOP } from '../../utils/formatters';
import { FotoUploader } from '../common/FotoUploader';
import { ThousandsInput } from '../common/ThousandsInput';

interface MetadatosJabonFormProps {
  formData: JabonFormData;
  onChange: (field: keyof JabonFormData, value: any) => void;
  errors: Partial<Record<keyof JabonFormData, string>>;
}

export const MetadatosJabonForm: React.FC<MetadatosJabonFormProps> = ({
  formData,
  onChange,
  errors,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const tiposPiel = [
    'Todo tipo de piel',
    'Piel Grasa / Acneica',
    'Piel Mixta',
    'Piel Seca',
    'Piel Sensible / Atópica',
    'Piel Madura',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden transition-all">
      {/* Cabecera del Accordion / Card */}
      <div className="px-3.5 py-3 sm:px-5 sm:py-4 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50 border-b border-slate-200/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 truncate">
              <span>Ficha Técnica del Jabón</span>
              <span className="hidden sm:inline-block text-[11px] font-normal text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                Comercial & Botánica
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              Datos de identidad, fotos y precio de venta
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title={isExpanded ? 'Contraer sección' : 'Expandir sección'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Contenido del Formulario */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5">
          {/* Fila Principal: Nombre*, Valor Venta* y Lema */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
            {/* Nombre del Jabón */}
            <div className="md:col-span-5">
              <label
                htmlFor="nombre"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Nombre del Jabón <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="nombre"
                  type="text"
                  placeholder="Ej: Jabón de Avena, Miel & Karité"
                  value={formData.nombre}
                  onChange={(e) => onChange('nombre', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50/50 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.nombre
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
                  }`}
                />
              </div>
              {errors.nombre && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.nombre}</p>
              )}
            </div>

            {/* Valor de Venta en COP */}
            <div className="md:col-span-3">
              <label
                htmlFor="valor_venta"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Precio de Venta (COP) <span className="text-rose-500">*</span>
              </label>
              <ThousandsInput
                id="valor_venta"
                value={formData.valor_venta}
                onChange={(val) => onChange('valor_venta', val)}
                prefix={<DollarSign className="w-4 h-4" />}
                placeholder="32.000"
                inputClassName={
                  errors.valor_venta
                    ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/30'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
                }
              />
              <div className="flex items-center justify-between mt-1">
                {errors.valor_venta ? (
                  <p className="text-xs text-rose-500 font-medium">{errors.valor_venta}</p>
                ) : (
                  <span className="text-[11px] text-brand-700 font-medium">
                    Vista previa: {formatCOP(formData.valor_venta)}
                  </span>
                )}
              </div>
            </div>

            {/* Lema o Eslogan */}
            <div className="md:col-span-4">
              <label
                htmlFor="lema"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Lema o Eslogan Comercial
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Tag className="w-4 h-4" />
                </div>
                <input
                  id="lema"
                  type="text"
                  placeholder="Ej: Exfoliación suave y nutrición profunda"
                  value={formData.lema}
                  onChange={(e) => onChange('lema', e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Fila Secundaria: Tipo de Piel, Cliente y Publicado */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
            {/* Tipo de Piel */}
            <div className="md:col-span-4">
              <label
                htmlFor="tipo_piel"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Tipo de Piel Recomendado
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Droplets className="w-4 h-4" />
                </div>
                <select
                  id="tipo_piel"
                  value={formData.tipo_piel}
                  onChange={(e) => onChange('tipo_piel', e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecciona el tipo de piel...</option>
                  {tiposPiel.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Cliente o Proyecto */}
            <div className="md:col-span-4">
              <label
                htmlFor="cliente"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Cliente / Proyecto Especial
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="cliente"
                  type="text"
                  placeholder="Ej: Línea Propia, Hotel Boutique, Pedido Personalizado"
                  value={formData.cliente}
                  onChange={(e) => onChange('cliente', e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Publicado en Catálogo (Toggle Switch) */}
            <div className="md:col-span-4 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Publicar en Catálogo
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Visible en tienda y lista de precios
                  </span>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.publicado_catalogo}
                  onChange={(e) => onChange('publicado_catalogo', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>
          </div>

          {/* Fila 3: Beneficios, Modo de Uso y Observaciones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Beneficios */}
            <div>
              <label
                htmlFor="beneficios"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                Beneficios Principales
              </label>
              <textarea
                id="beneficios"
                rows={2}
                placeholder="Ej: Calma irritaciones, regenera tejidos e hidrata..."
                value={formData.beneficios}
                onChange={(e) => onChange('beneficios', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Modo de Uso */}
            <div>
              <label
                htmlFor="modo_uso"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                Modo de Uso
              </label>
              <textarea
                id="modo_uso"
                rows={2}
                placeholder="Ej: Frotar sobre piel húmeda hasta generar espuma..."
                value={formData.modo_uso}
                onChange={(e) => onChange('modo_uso', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Observaciones / Notas de Taller */}
            <div>
              <label
                htmlFor="observaciones"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                Observaciones del Lote
              </label>
              <textarea
                id="observaciones"
                rows={2}
                placeholder="Ej: Mantener temperatura por debajo de 60°C al verter..."
                value={formData.observaciones}
                onChange={(e) => onChange('observaciones', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50/50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>

          {/* Fila 4: Fotografías del Jabón y Etiqueta Comercial */}
          <div className="pt-4 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Fotografías del Jabón (Catálogo & Ficha Comercial)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FotoUploader
                label="Foto Principal del Jabón"
                sublabel="Barra terminada para exhibición comercial"
                tipo="producto"
                valorUrl={formData.foto_producto_url}
                onChangeUrl={(url) => onChange('foto_producto_url', url)}
              />

              <FotoUploader
                label="Foto de Etiqueta / Empaque"
                sublabel="Diseño de etiqueta, faja o presentación"
                tipo="etiqueta"
                valorUrl={formData.foto_etiqueta_url}
                onChangeUrl={(url) => onChange('foto_etiqueta_url', url)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
