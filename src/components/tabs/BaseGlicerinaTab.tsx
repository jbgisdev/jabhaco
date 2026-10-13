import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Scale,
  Building,
  Check,
  X,
} from 'lucide-react';
import type { RecetaItem } from '../../types/database.types';
import { formatCOP, formatCostoUnitario, formatDecimal } from '../../utils/formatters';

interface BaseGlicerinaTabProps {
  basesReceta: RecetaItem[];
  onOpenAgregarModal: () => void;
  onUpdateCantidad: (tempId: string, nuevaCantidad: number) => void;
  onRequestEliminarItem: (item: RecetaItem) => void;
}

export const BaseGlicerinaTab: React.FC<BaseGlicerinaTabProps> = ({
  basesReceta,
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

  const totalGramosBases = basesReceta.reduce((acc, curr) => acc + curr.cantidad_usada, 0);
  const costoTotalBases = basesReceta.reduce((acc, curr) => acc + curr.subtotal_costo, 0);

  return (
    <div className="space-y-5">
      {/* Barra de Resumen Rápido & Botón de Acción Principal */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Bases de Glicerina en la Receta
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {basesReceta.length} {basesReceta.length === 1 ? 'base' : 'bases'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Cuerpo principal y matriz del jabón artesanal
            </p>
          </div>
        </div>

        {/* Métricas rápidas y botón */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          {basesReceta.length > 0 && (
            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                  Peso Base
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {formatDecimal(totalGramosBases)} g
                </span>
              </div>
              <div className="h-7 w-[1px] bg-slate-200" />
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                  Subtotal
                </span>
                <span className="text-sm font-bold text-brand-700">
                  {formatCOP(costoTotalBases)}
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
            <span>Agregar Base</span>
          </button>
        </div>
      </div>

      {/* Contenido: Empty State o Tabla de Bases */}
      {basesReceta.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center shadow-subtle">
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <Layers className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">
            Ninguna base de glicerina añadida aún
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            Todo jabón comienza con su base de glicerina (cristal, blanca opaca, karité, avena o leche de cabra). Agrega una o combina varias bases para crear tu fórmula.
          </p>
          <button
            type="button"
            onClick={onOpenAgregarModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Primera Base</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 sm:px-5">Base / Proveedor</th>
                  <th className="py-3 px-4 text-center">Cantidad (g)</th>
                  <th className="py-3 px-4 text-right">Costo / g</th>
                  <th className="py-3 px-4 text-right">Subtotal ($)</th>
                  <th className="py-3 px-4 text-right w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {basesReceta.map((item) => {
                  const isEditing = editingId === item.tempId;

                  return (
                    <tr
                      key={item.tempId}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="font-bold text-slate-900">
                          {item.insumo.nombre}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{item.insumo.proveedor || 'Sin proveedor especificado'}</span>
                        </div>
                      </td>

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
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200">
                            <Scale className="w-3 h-3 text-slate-400" />
                            <span>{formatDecimal(item.cantidad_usada)} g</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-600 font-medium">
                        {formatCostoUnitario(item.costo_unitario_aplicado)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCOP(item.subtotal_costo)}
                      </td>

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
              💡 <span>Tip formulador: Puedes combinar varias bases para lograr textura cremosa y óptima espuma.</span>
            </div>
            <div className="font-semibold text-slate-700">
              Total Bases: <span className="text-slate-900">{formatDecimal(totalGramosBases)} g</span> • Subtotal:{' '}
              <span className="text-brand-800 font-extrabold text-sm">{formatCOP(costoTotalBases)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
