import React, { useState } from 'react';
import {
  Package,
  Box,
  Plus,
  Trash2,
  Edit2,
  Building,
  Check,
  X,
} from 'lucide-react';
import type { RecetaItem } from '../../types/database.types';
import { formatCOP, formatCostoUnitario, formatDecimal, formatUnidadLabel } from '../../utils/formatters';

interface EmpaqueMoldesTabProps {
  itemsReceta: RecetaItem[];
  onOpenAgregarModal: () => void;
  onUpdateCantidad: (tempId: string, nuevaCantidad: number) => void;
  onRequestEliminarItem: (item: RecetaItem) => void;
}

export const EmpaqueMoldesTab: React.FC<EmpaqueMoldesTabProps> = ({
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

  const empaques = itemsReceta.filter((i) => i.insumo.categoria === 'empaque');
  const moldes = itemsReceta.filter((i) => i.insumo.categoria === 'molde');

  const costoTotal = itemsReceta.reduce((acc, curr) => acc + curr.subtotal_costo, 0);

  return (
    <div className="space-y-5">
      {/* Barra de Resumen Rápido & Botón de Acción Principal */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Empaques & Moldes
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {itemsReceta.length} {itemsReceta.length === 1 ? 'insumo' : 'insumos'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Cajas, fajas, papel manteca, etiquetas y costo de molde por barra
            </p>
          </div>
        </div>

        {/* Métricas rápidas y botón */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          {itemsReceta.length > 0 && (
            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                  Composición
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {empaques.length} emp. • {moldes.length} mol.
                </span>
              </div>
              <div className="h-7 w-[1px] bg-slate-200" />
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                  Subtotal
                </span>
                <span className="text-sm font-bold text-teal-900">
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
            <span>Agregar Empaque o Molde</span>
          </button>
        </div>
      </div>

      {/* Contenido: Empty State o Tabla */}
      {itemsReceta.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center shadow-subtle">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
            <Package className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">
            Ningún empaque o molde asignado
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            Asigna el costo del packaging (caja kraft, etiqueta adhesiva, papel manteca) y la amortización del molde por barra para calcular el costo de producto terminado real.
          </p>
          <button
            type="button"
            onClick={onOpenAgregarModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Empaque o Molde</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 sm:px-5">Insumo / Categoría</th>
                  <th className="py-3 px-4 text-center">Cantidad Usada</th>
                  <th className="py-3 px-4 text-right">Costo Unitario</th>
                  <th className="py-3 px-4 text-right">Subtotal ($)</th>
                  <th className="py-3 px-4 text-right w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {itemsReceta.map((item) => {
                  const isEditing = editingId === item.tempId;
                  const esEmpaque = item.insumo.categoria === 'empaque';

                  return (
                    <tr
                      key={item.tempId}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Nombre y Categoría */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${esEmpaque
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                          >
                            {esEmpaque ? (
                              <>
                                <Package className="w-3 h-3 text-teal-600" />
                                <span>Empaque</span>
                              </>
                            ) : (
                              <>
                                <Box className="w-3 h-3 text-amber-600" />
                                <span>Molde</span>
                              </>
                            )}
                          </span>
                          <span className="font-bold text-slate-900">
                            {item.insumo.nombre}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{item.insumo.proveedor || 'Sin proveedor especificado'}</span>
                        </div>
                      </td>

                      {/* Cantidad */}
                      <td className="py-3.5 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              step={item.insumo.unidad === 'unidades' ? '1' : '0.01'}
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                            {formatDecimal(item.cantidad_usada)} {formatUnidadLabel(item.insumo.unidad)}
                          </span>
                        )}
                      </td>

                      {/* Costo Unitario */}
                      <td className="py-3.5 px-4 text-right text-slate-600 font-medium">
                        {formatCostoUnitario(item.costo_unitario_aplicado)} / {item.insumo.unidad}
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

          <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              📦 <span>Tip de presentación: Un empaque estético y ecológico incrementa el valor percibido del jabón artesanal.</span>
            </div>
            <div className="font-semibold text-slate-700">
              Total Insumos: <span className="text-slate-900">{itemsReceta.length}</span> • Subtotal:{' '}
              <span className="text-teal-900 font-extrabold text-sm">{formatCOP(costoTotal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
