import React, { useState } from 'react';
import {
  Coins,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Building,
  Check,
  X,
  Zap,
} from 'lucide-react';
import type { RecetaItem } from '../../types/database.types';
import {
  formatCOP,
  formatCostoUnitario,
  formatDecimal,
  formatUnidadLabel,
} from '../../utils/formatters';

interface CostosIndirectosTabProps {
  itemsReceta: RecetaItem[];
  onOpenAgregarModal: () => void;
  onUpdateCantidad: (tempId: string, nuevaCantidad: number) => void;
  onRequestEliminarItem: (item: RecetaItem) => void;
}

export const CostosIndirectosTab: React.FC<CostosIndirectosTabProps> = ({
  itemsReceta,
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

  const costoTotal = itemsReceta.reduce((acc, curr) => acc + curr.subtotal_costo, 0);

  // Total de horas de mano de obra y conversión a minutos
  const totalHoras = itemsReceta
    .filter((i) => i.insumo.unidad === 'horas')
    .reduce((acc, curr) => acc + curr.cantidad_usada, 0);
  const totalMinutos = Math.round(totalHoras * 60);

  return (
    <div className="space-y-5">
      {/* Barra de Resumen Rápido & Botón de Acción Principal */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Costos & Gastos Indirectos
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {itemsReceta.length} {itemsReceta.length === 1 ? 'concepto' : 'conceptos'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Mano de obra artesanal, alcohol rociador, consumo eléctrico y amortizaciones
            </p>
          </div>
        </div>

        {/* Métricas rápidas y botón */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          {itemsReceta.length > 0 && (
            <div className="flex items-center gap-3 text-right">
              {totalMinutos > 0 && (
                <>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                      Mano de Obra
                    </span>
                    <span className="text-sm font-bold text-blue-900 flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      {totalMinutos} min ({formatDecimal(totalHoras, 2)}h)
                    </span>
                  </div>
                  <div className="h-7 w-[1px] bg-slate-200" />
                </>
              )}
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                  Subtotal
                </span>
                <span className="text-sm font-bold text-blue-950">
                  {formatCOP(costoTotal)}
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
            <span>Agregar Costo Indirecto</span>
          </button>
        </div>
      </div>

      {/* Contenido: Empty State o Tabla */}
      {itemsReceta.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center shadow-subtle">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Coins className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">
            Ningún costo indirecto imputado
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            Imputa el tiempo de mano de obra artesanal por barra (ej: 10 o 15 minutos), el uso de alcohol para eliminar burbujas o el prorrateo de energía eléctrica del taller para obtener el margen real de tu jabón.
          </p>
          <button
            type="button"
            onClick={onOpenAgregarModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Costo Indirecto</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 sm:px-5">Insumo / Concepto</th>
                  <th className="py-3 px-4 text-center">Cantidad / Fracción</th>
                  <th className="py-3 px-4 text-right">Tarifa Base</th>
                  <th className="py-3 px-4 text-right">Subtotal ($)</th>
                  <th className="py-3 px-4 text-right w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {itemsReceta.map((item) => {
                  const isEditing = editingId === item.tempId;
                  const esHoras = item.insumo.unidad === 'horas';
                  const minutosItem = esHoras ? Math.round(item.cantidad_usada * 60) : 0;

                  return (
                    <tr
                      key={item.tempId}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Concepto */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                            {esHoras ? (
                              <>
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>Mano de Obra</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-3 h-3 text-blue-600" />
                                <span>Indirecto</span>
                              </>
                            )}
                          </span>
                          <span className="font-bold text-slate-900">
                            {item.insumo.nombre}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{item.insumo.proveedor || 'Sin detalle de origen'}</span>
                        </div>
                      </td>

                      {/* Cantidad */}
                      <td className="py-3.5 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              step={esHoras ? '0.01' : item.insumo.unidad === 'unidades' ? '0.05' : '1'}
                              min="0.01"
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
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                              {formatDecimal(item.cantidad_usada, 2)} {formatUnidadLabel(item.insumo.unidad)}
                            </span>
                            {esHoras && (
                              <span className="block text-[11px] text-blue-600 font-medium mt-0.5">
                                ≈ {minutosItem} {minutosItem === 1 ? 'minuto' : 'minutos'}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Costo Unitario */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-xs text-slate-600 font-medium">
                          {formatCostoUnitario(item.costo_unitario_aplicado)} / {formatUnidadLabel(item.insumo.unidad)}
                        </span>
                      </td>

                      {/* Subtotal */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-extrabold text-blue-950 text-sm">
                          {formatCOP(item.subtotal_costo)}
                        </span>
                      </td>

                      {/* Acciones con ConfirmModal */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Editar cantidad"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestEliminarItem(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar de la receta"
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
        </div>
      )}
    </div>
  );
};
