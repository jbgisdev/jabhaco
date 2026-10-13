import React from 'react';
import {
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  PieChart,
  Percent,
  AlertTriangle,
  Save,
  Loader2,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { RecetaItem, JabonFormData } from '../../types/database.types';
import { MetadatosJabonForm } from '../form/MetadatosJabonForm';
import {
  formatCOP,
  formatCostoUnitario,
  formatDecimal,
  formatPorcentaje,
  formatUnidadLabel,
} from '../../utils/formatters';

interface ResumenCostosTabProps {
  formData: JabonFormData;
  onFormChange: (field: keyof JabonFormData, value: any) => void;
  formErrors: Partial<Record<keyof JabonFormData, string>>;
  componentes: RecetaItem[];
  onGuardarJabon: () => void;
  isSaving: boolean;
  onGoToBaseTab: () => void;
}

export const ResumenCostosTab: React.FC<ResumenCostosTabProps> = ({
  formData,
  onFormChange,
  formErrors,
  componentes,
  onGuardarJabon,
  isSaving,
  onGoToBaseTab,
}) => {
  // Cálculos financieros en tiempo real
  const costoRealTotal = componentes.reduce((acc, curr) => acc + curr.subtotal_costo, 0);
  const precioVenta = formData.valor_venta || 0;
  const margenBruto = precioVenta - costoRealTotal;
  const rentabilidadPorcentaje =
    precioVenta > 0 ? (margenBruto / precioVenta) * 100 : 0;

  const pesoTotalGramos = componentes.reduce((acc, curr) => acc + curr.cantidad_usada, 0);
  const costoPorGramoFinal = pesoTotalGramos > 0 ? costoRealTotal / pesoTotalGramos : 0;

  // Estado de salud del margen
  const getSaludMargen = () => {
    if (precioVenta <= 0) return { color: 'text-slate-400', bg: 'bg-slate-50', label: 'Sin Precio Definido' };
    if (margenBruto < 0) return { color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', label: 'Margen Negativo (Pérdida)' };
    if (rentabilidadPorcentaje < 25) return { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Margen Bajo (< 25%)' };
    if (rentabilidadPorcentaje < 50) return { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Margen Moderado' };
    return { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Margen Excelente (> 50%)' };
  };

  const salud = getSaludMargen();

  const canSave = Boolean(formData.nombre.trim() && formData.valor_venta > 0);

  const getCategoriaBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'base_glicerina':
        return { text: 'Base Glicerina', style: 'bg-brand-50 text-brand-700 border-brand-200' };
      case 'aditivo':
        return { text: 'Aditivo Botánico', style: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'fragancia':
        return { text: 'Fragancia', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'color':
        return { text: 'Color / Mica', style: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'empaque':
        return { text: 'Empaque', style: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'molde':
        return { text: 'Molde', style: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'costo_indirecto':
        return { text: 'Costo Indirecto', style: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { text: cat, style: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. FICHA TÉCNICA DEL JABÓN (AHORA EXCLUSIVA DE ESTA PESTAÑA) */}
      {/* ======================================================== */}
      <section aria-label="Ficha Técnica Comercial del Jabón">
        <MetadatosJabonForm
          formData={formData}
          onChange={onFormChange}
          errors={formErrors}
        />
      </section>

      {/* ======================================================== */}
      {/* 2. BLOQUE DE MÉTRICAS FINANCIERAS EN TIEMPO REAL */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Costo Real Total */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Costo Real Total
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCOP(costoRealTotal)}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Scale className="w-3 h-3" />
              <span>{formatDecimal(pesoTotalGramos)} g de masa formulada</span>
            </p>
          </div>
        </div>

        {/* Precio de Venta */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Precio de Venta
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCOP(precioVenta)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {formData.nombre ? `PVP para "${formData.nombre}"` : 'Definido en Ficha Técnica'}
            </p>
          </div>
        </div>

        {/* Margen Bruto ($) */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Margen Bruto ($)
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                margenBruto >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div
              className={`text-2xl font-extrabold tracking-tight ${
                margenBruto >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {formatCOP(margenBruto)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ganancia neta por unidad producida
            </p>
          </div>
        </div>

        {/* Rentabilidad (%) */}
        <div
          className={`p-5 bg-white rounded-2xl border shadow-subtle flex flex-col justify-between ${
            salud.bg
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Rentabilidad (%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center">
              <Percent className={`w-4 h-4 ${salud.color}`} />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-black tracking-tight ${salud.color}`}>
              {formatPorcentaje(rentabilidadPorcentaje)}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[11px] font-semibold ${salud.color}`}>
                {salud.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BARRA VISUAL DE DESGLOSE COSTO VS MARGEN */}
      {/* ======================================================== */}
      {precioVenta > 0 && (
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Composición del Precio de Venta ({formatCOP(precioVenta)})</span>
            <span>
              {formatPorcentaje(100 - rentabilidadPorcentaje)} Costo / {formatPorcentaje(rentabilidadPorcentaje)} Margen
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex p-0.5">
            <div
              className="bg-slate-600 h-full rounded-l-full transition-all duration-500"
              style={{
                width: `${Math.min(Math.max((costoRealTotal / precioVenta) * 100, 0), 100)}%`,
              }}
              title={`Costo: ${formatCOP(costoRealTotal)}`}
            />
            <div
              className={`h-full rounded-r-full transition-all duration-500 ${
                margenBruto >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{
                width: `${Math.min(Math.max(rentabilidadPorcentaje, 0), 100)}%`,
              }}
              title={`Margen: ${formatCOP(margenBruto)}`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
              Costo Insumos ({formatCOP(costoRealTotal)})
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full inline-block ${
                  margenBruto >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              Margen de Utilidad ({formatCOP(margenBruto)})
            </span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TABLA RESUMEN DE COMPONENTES */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Ficha Detallada de Componentes
              </h3>
              <p className="text-xs text-slate-500">
                Desglose analítico de materias primas agregadas a la formulación
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-700">
            {componentes.length} {componentes.length === 1 ? 'componente' : 'componentes'}
          </span>
        </div>

        {componentes.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              No has añadido componentes a este jabón
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Ve a las pestañas de "Base Glicerina", "Aditivos" o "Fragancia & Color" para agregar las materias primas y calcular los costos de producción.
            </p>
            <button
              type="button"
              onClick={onGoToBaseTab}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <span>Ir a Base Glicerina</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 sm:px-5">Componente / Categoría</th>
                  <th className="py-3 px-4 text-center">Cantidad Usada</th>
                  <th className="py-3 px-4 text-right">Costo Aplicado</th>
                  <th className="py-3 px-4 text-right">% Fórmula</th>
                  <th className="py-3 px-4 text-right">Subtotal ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {componentes.map((item) => {
                  const esMateriaPrimaMasa = item.insumo.unidad === 'gramos' || item.insumo.unidad === 'mililitros';
                  const porcentajePeso =
                    esMateriaPrimaMasa && pesoTotalGramos > 0
                      ? (item.cantidad_usada / pesoTotalGramos) * 100
                      : null;
                  const porcentajeCosto =
                    costoRealTotal > 0 ? (item.subtotal_costo / costoRealTotal) * 100 : 0;
                  const catInfo = getCategoriaBadgeStyle(item.insumo.categoria);

                  return (
                    <tr key={item.tempId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="font-bold text-slate-900">{item.insumo.nombre}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catInfo.style}`}
                          >
                            {catInfo.text}
                          </span>
                          <span className="text-xs text-slate-400">
                            {item.insumo.proveedor || 'Sin proveedor'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-slate-800 text-xs">
                          {formatDecimal(item.cantidad_usada)}{' '}
                          {formatUnidadLabel(item.insumo.unidad)}
                          {item.es_en_gotas && (
                            <span className="text-[10px] text-amber-700 block font-normal">
                              ({Math.round(item.cantidad_usada * 20)} gotas)
                            </span>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-xs text-slate-600 font-medium">
                        {formatCostoUnitario(item.costo_unitario_aplicado)} / {formatUnidadLabel(item.insumo.unidad)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="text-xs font-bold text-slate-700">
                          {porcentajePeso !== null ? formatPorcentaje(porcentajePeso) : '—'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatPorcentaje(porcentajeCosto)} del costo
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCOP(item.subtotal_costo)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/70 border-t-2 border-slate-200 font-bold text-xs text-slate-800">
                  <td className="py-3.5 px-4 sm:px-5">TOTAL FORMULACIÓN</td>
                  <td className="py-3.5 px-4 text-center text-slate-900 font-extrabold">
                    {formatDecimal(pesoTotalGramos)} g
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600">
                    Prom: {formatCostoUnitario(costoPorGramoFinal)} / g
                  </td>
                  <td className="py-3.5 px-4 text-right">100.0%</td>
                  <td className="py-3.5 px-4 text-right text-brand-900 font-extrabold text-sm">
                    {formatCOP(costoRealTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. ACCIÓN PRINCIPAL DE GUARDAR JABÓN */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            ¿Todo listo para registrar este jabón?
          </h4>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Al guardar, se registrará la ficha en la tabla <code className="bg-slate-800 px-1 py-0.5 rounded text-brand-300">jabones</code> y sus {componentes.length} componentes en <code className="bg-slate-800 px-1 py-0.5 rounded text-brand-300">jabon_componentes</code> en Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGuardarJabon}
            disabled={isSaving || componentes.length === 0}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all ${
              componentes.length > 0 && !isSaving
                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25 active:scale-95 cursor-pointer ring-2 ring-brand-400/30'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Guardar y Registrar Jabón</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!canSave && componentes.length > 0 && (
        <p className="text-xs text-center text-slate-500 font-medium">
          💡 Puedes presionar <strong>Guardar y Registrar Jabón</strong> para abrir la ventana de registro y definir el nombre y precio con asistencia de márgenes.
        </p>
      )}
    </div>
  );
};
