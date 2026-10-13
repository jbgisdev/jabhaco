import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Scale,
  Droplets,
  Building,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import type { RecetaItem } from '../../types/database.types';
import { formatCOP, formatCostoUnitario, formatDecimal } from '../../utils/formatters';

interface AditivosTabProps {
  aditivosReceta: RecetaItem[];
  pesoTotalBases: number;
  onOpenAgregarModal: () => void;
  onUpdateCantidad: (tempId: string, nuevaCantidad: number) => void;
  onRequestEliminarItem: (item: RecetaItem) => void;
}

export const AditivosTab: React.FC<AditivosTabProps> = ({
  aditivosReceta,
  pesoTotalBases,
  onOpenAgregarModal,
  onUpdateCantidad,
  onRequestEliminarItem,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleStartEdit = (item: RecetaItem) => {
    setEditingId(item.tempId);
    setEditValue(item.cantidad_usada.toString());
  };

  const handleSaveEdit = (tempId: string) => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateCantidad(tempId, parsed);
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const totalCantidadAditivos = aditivosReceta.reduce((acc, curr) => acc + curr.cantidad_usada, 0);
  const costoTotalAditivos = aditivosReceta.reduce((acc, curr) => acc + curr.subtotal_costo, 0);

  // Porcentaje estimado de aditivos respecto al peso de las bases
  const porcentajeAditivos =
    pesoTotalBases > 0 ? (totalCantidadAditivos / pesoTotalBases) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Barra de Resumen Rápido & Botón de Acción Principal */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Aditivos & Activos Botánicos
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {aditivosReceta.length} {aditivosReceta.length === 1 ? 'aditivo' : 'aditivos'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Arcillas, exfoliantes, vitaminas, extractos botánicos y principios activos
            </p>
          </div>
        </div>

        {/* Métricas rápidas y botón */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          {aditivosReceta.length > 0 && (
            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                  Total Aditivos
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {formatDecimal(totalCantidadAditivos)} g/ml
                  {pesoTotalBases > 0 && (
                    <span className="text-[10px] text-amber-700 ml-1 font-semibold">
                      ({porcentajeAditivos.toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-7 w-[1px] bg-slate-200" />
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                  Subtotal
                </span>
                <span className="text-sm font-bold text-amber-800">
                  {formatCOP(costoTotalAditivos)}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenAgregarModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Aditivo</span>
          </button>
        </div>
      </div>

      {/* Alerta de dosificación botánica si supera el 5% recomendado */}
      {porcentajeAditivos > 5 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-bold">Advertencia de formulación botánica:</span> El total de aditivos supera el 5% ({porcentajeAditivos.toFixed(1)}%) del peso de la base de glicerina. Dosis muy altas pueden disminuir la espuma del jabón o causar sudoración excesiva en climas húmedos.
          </div>
        </div>
      )}

      {/* Contenido: Empty State o Tabla de Aditivos */}
      {aditivosReceta.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center shadow-subtle">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <Sparkles className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">
            Ningún aditivo botánico agregado aún
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            Personaliza las propiedades terapéuticas y sensoriales de tu jabón añadiendo arcillas purificantes, avena coloidal, carbón activado, vitamina E o extractos botánicos.
          </p>
          <button
            type="button"
            onClick={onOpenAgregarModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Primer Aditivo</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 sm:px-5">Aditivo / Proveedor</th>
                  <th className="py-3 px-4 text-center">Cantidad Dosificada</th>
                  <th className="py-3 px-4 text-right">Costo Unitario</th>
                  <th className="py-3 px-4 text-right">Subtotal ($)</th>
                  <th className="py-3 px-4 text-right w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {aditivosReceta.map((item) => {
                  const isEditing = editingId === item.tempId;
                  const unidadLabel = item.insumo.unidad === 'gramos' ? 'g' : 'ml';

                  return (
                    <tr
                      key={item.tempId}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Nombre y Proveedor */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {item.insumo.nombre}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {item.insumo.unidad}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{item.insumo.proveedor || 'Sin proveedor especificado'}</span>
                        </div>
                      </td>

                      {/* Cantidad Usada */}
                      <td className="py-3.5 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 px-2 py-1 text-center font-bold text-sm bg-white border border-brand-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(item.tempId);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.tempId)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Guardar cambio"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-semibold text-xs border border-amber-200">
                            {item.insumo.unidad === 'mililitros' ? (
                              <Droplets className="w-3 h-3 text-amber-600" />
                            ) : (
                              <Scale className="w-3 h-3 text-amber-600" />
                            )}
                            <span>
                              {formatDecimal(item.cantidad_usada)} {unidadLabel}
                              {item.es_en_gotas && (
                                <span className="text-[10px] text-amber-700 ml-1 font-normal">
                                  (~{Math.round(item.cantidad_usada * 20)} gotas)
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Costo Unitario */}
                      <td className="py-3.5 px-4 text-right text-slate-600 font-medium">
                        {formatCostoUnitario(item.costo_unitario_aplicado)} / {unidadLabel}
                      </td>

                      {/* Subtotal */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCOP(item.subtotal_costo)}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Modificar cantidad"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestEliminarItem(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar aditivo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              🌿 <span>Tip botánico: Los activos botánicos enriquecen la fórmula sin alterar la estructura cristalina del jabón.</span>
            </div>
            <div className="font-semibold text-slate-700">
              Total Aditivos:{' '}
              <span className="text-slate-900">{formatDecimal(totalCantidadAditivos)} g/ml</span> • Subtotal:{' '}
              <span className="text-amber-900 font-extrabold text-sm">{formatCOP(costoTotalAditivos)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
