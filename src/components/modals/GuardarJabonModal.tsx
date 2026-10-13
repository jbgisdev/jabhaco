import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Save,
  DollarSign,
  AlertCircle,
  Database,
  Layers,
  ChevronDown,
  ChevronUp,
  Percent,
  Camera,
} from 'lucide-react';
import type { JabonFormData, RecetaItem } from '../../types/database.types';
import { formatCOP, formatDecimal } from '../../utils/formatters';
import { getSupabaseCredentials } from '../../lib/supabase';
import { FotoUploader } from '../common/FotoUploader';
import { ThousandsInput } from '../common/ThousandsInput';

interface GuardarJabonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSave: () => Promise<void>;
  formData: JabonFormData;
  onFormChange: (field: keyof JabonFormData, value: any) => void;
  componentes: RecetaItem[];
  isSaving: boolean;
}

export const GuardarJabonModal: React.FC<GuardarJabonModalProps> = ({
  isOpen,
  onClose,
  onConfirmSave,
  formData,
  onFormChange,
  componentes,
  isSaving,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Cálculos de la receta
  const costoTotal = componentes.reduce((acc, curr) => acc + curr.subtotal_costo, 0);
  const bases = componentes.filter((c) => c.insumo.categoria === 'base_glicerina');
  const pesoTotalBases = bases.reduce((acc, curr) => acc + curr.cantidad_usada, 0);

  const valorVenta = Number(formData.valor_venta) || 0;
  const margenDinero = valorVenta - costoTotal;
  const margenPorcentaje = valorVenta > 0 ? (margenDinero / valorVenta) * 100 : 0;

  const { isConfigured } = getSupabaseCredentials();

  useEffect(() => {
    if (isOpen) {
      setErrorLocal(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Botones de margen sugerido
  const aplicarMargenSugerido = (porcentajeMargen: number) => {
    if (costoTotal <= 0) return;
    // Margen comercial = (Venta - Costo) / Venta => Venta = Costo / (1 - Margen)
    const factor = 1 - porcentajeMargen / 100;
    const precioCalculado = Math.ceil(costoTotal / factor / 100) * 100; // Redondear a cientos
    onFormChange('valor_venta', precioCalculado);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setErrorLocal('Ingresa un nombre para el jabón artesanal.');
      return;
    }
    if (valorVenta <= 0) {
      setErrorLocal('Ingresa un precio de venta mayor a $ 0 COP.');
      return;
    }
    setErrorLocal(null);
    await onConfirmSave();
  };

  const tiposPiel = [
    'Todo tipo de piel',
    'Piel Grasa / Acneica',
    'Piel Mixta',
    'Piel Seca',
    'Piel Sensible / Atópica',
    'Piel Madura',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 pl-3.5 pr-7 sm:p-6 sm:px-6">
      <div className="relative w-full max-w-[calc(100vw-2.5rem)] sm:max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 mx-auto">
        
        {/* Cabecera con degradado elegante */}
        <div className="px-4 pr-5 sm:px-6 sm:py-5 bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 truncate">
                <span>Registrar & Guardar Jabón</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-brand-500 text-white rounded-md">
                  Ficha Oficial
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                Formulación, fotos y precio de venta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 pl-4 pr-5 sm:p-6 sm:pr-6 space-y-5">
          {/* Tarjeta de Resumen Rápido de la Receta */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Ingredientes
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                <Layers className="w-4 h-4 text-brand-600" />
                {componentes.length} {componentes.length === 1 ? 'materia' : 'materias'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Peso Base
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-800 mt-0.5 block">
                {formatDecimal(pesoTotalBases)} g
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/70 shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Costo Fabricación
              </span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-700 mt-0.5 block">
                {formatCOP(costoTotal)}
              </span>
            </div>
          </div>

          {errorLocal && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorLocal}</span>
            </div>
          )}

          {/* Campo: Nombre del Jabón */}
          <div>
            <label
              htmlFor="modal_nombre_jabon"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Nombre del Jabón <span className="text-rose-500">*</span>
            </label>
            <input
              id="modal_nombre_jabon"
              type="text"
              autoFocus
              placeholder="Ej: Jabón de Avena, Miel & Manteca de Karité"
              value={formData.nombre}
              onChange={(e) => onFormChange('nombre', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all"
            />
          </div>

          {/* Bloque: Precio de Venta y Margen Dinámico */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-brand-50/30 border border-brand-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label
                htmlFor="modal_valor_venta"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
              >
                <DollarSign className="w-4 h-4 text-brand-600" />
                Precio de Venta al Público (COP) <span className="text-rose-500">*</span>
              </label>

              {/* Botones de sugerencia de margen */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                  Sugerir margen:
                </span>
                {[35, 50, 65, 100].map((margen) => (
                  <button
                    key={margen}
                    type="button"
                    onClick={() => aplicarMargenSugerido(margen)}
                    className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white hover:bg-brand-50 text-brand-700 border border-brand-200 shadow-2xs transition-all active:scale-95"
                    title={`Aplicar ${margen}% de margen comercial`}
                  >
                    {margen}%
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-6">
                <ThousandsInput
                  id="modal_valor_venta"
                  value={formData.valor_venta}
                  onChange={(val) => onFormChange('valor_venta', val)}
                  prefix={<span className="text-slate-400 font-bold text-sm">$</span>}
                  placeholder="0"
                  inputClassName="text-base font-extrabold"
                />
              </div>

              {/* Indicador de Ganancia Neta & Rentabilidad */}
              <div className="sm:col-span-6 flex items-center justify-between sm:justify-end gap-3 px-3 py-2 bg-white rounded-xl border border-slate-200/80">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Ganancia Neta
                  </span>
                  <span
                    className={`text-sm font-extrabold ${
                      margenDinero > 0
                        ? 'text-emerald-700'
                        : margenDinero === 0
                        ? 'text-slate-500'
                        : 'text-rose-600'
                    }`}
                  >
                    {formatCOP(margenDinero)}
                  </span>
                </div>

                <div className="h-6 w-[1px] bg-slate-200" />

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Rentabilidad
                  </span>
                  <span
                    className={`text-sm font-extrabold inline-flex items-center gap-0.5 ${
                      margenPorcentaje >= 40
                        ? 'text-emerald-700'
                        : margenPorcentaje > 0
                        ? 'text-amber-700'
                        : 'text-rose-600'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    {margenPorcentaje.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Accordion para Datos Opcionales (Lema, Tipo de piel, Cliente) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-2.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-brand-600" />
                <span>Fotos & Datos Comerciales (Fotos del jabón, Lema, Piel)</span>
              </span>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showAdvanced && (
              <div className="p-4 space-y-4 bg-white border-t border-slate-200">
                {/* Fotografías del Jabón y Etiqueta */}
                <div className="space-y-3 pb-3 border-b border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FotoUploader
                      label="Foto del Jabón"
                      sublabel="Barra terminada"
                      tipo="producto"
                      valorUrl={formData.foto_producto_url}
                      onChangeUrl={(url) => onFormChange('foto_producto_url', url)}
                    />

                    <FotoUploader
                      label="Foto de Etiqueta"
                      sublabel="Diseño o empaque"
                      tipo="etiqueta"
                      valorUrl={formData.foto_etiqueta_url}
                      onChangeUrl={(url) => onFormChange('foto_etiqueta_url', url)}
                    />
                  </div>
                </div>

                {/* Lema */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lema o Eslogan
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Nutrición y calma para pieles delicadas"
                    value={formData.lema || ''}
                    onChange={(e) => onFormChange('lema', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                {/* Tipo de Piel y Cliente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipo de Piel Recomendado
                    </label>
                    <select
                      value={formData.tipo_piel || ''}
                      onChange={(e) => onFormChange('tipo_piel', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">Selecciona tipo de piel...</option>
                      {tiposPiel.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cliente o Destino
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Stock General / Pedido Especial"
                      value={formData.cliente || ''}
                      onChange={(e) => onFormChange('cliente', e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Descripción y Beneficios */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Beneficios Principales
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej: Exfoliación suave, hidratación profunda con karité y miel pura."
                    value={formData.beneficios || ''}
                    onChange={(e) => onFormChange('beneficios', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Destino de Almacenamiento */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-600" />
              <span className="text-slate-600 font-medium">Destino de guardado:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                  isConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isConfigured ? 'Supabase PostgreSQL' : 'Sandbox Local (Navegador)'}
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.publicado_catalogo}
                onChange={(e) => onFormChange('publicado_catalogo', e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              <span className="text-slate-700 font-medium">Visible en Catálogo</span>
            </label>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving || !formData.nombre.trim() || valorVenta <= 0}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all ${
                !formData.nombre.trim() || valorVenta <= 0 || isSaving
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/25 active:scale-95 cursor-pointer'
              }`}
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Guardando en Base de Datos...' : 'Confirmar & Guardar Jabón'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
