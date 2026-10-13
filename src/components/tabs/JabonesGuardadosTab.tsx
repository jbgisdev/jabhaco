import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Layers,
  Calendar,
  User,
  Trash2,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  Award,
  Database,
  Camera,
  Eye,
  X,
} from 'lucide-react';
import type { JabonGuardadoItem, Jabon } from '../../types/database.types';
import { formatCOP, formatDecimal, formatUnidadLabel } from '../../utils/formatters';

interface JabonesGuardadosTabProps {
  jabones: JabonGuardadoItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onCargarEnFormulador: (item: JabonGuardadoItem) => void;
  onRequestEliminarJabon: (jabon: Jabon) => void;
  onIrAFormular: () => void;
}

export const JabonesGuardadosTab: React.FC<JabonesGuardadosTabProps> = ({
  jabones,
  isLoading,
  onRefresh,
  onCargarEnFormulador,
  onRequestEliminarJabon,
  onIrAFormular,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState<{ url: string; titulo: string } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filtrados = jabones.filter((item) => {
    const q = searchTerm.toLowerCase();
    const nombre = item.jabon.nombre.toLowerCase();
    const lema = (item.jabon.lema || '').toLowerCase();
    const cliente = (item.jabon.cliente || '').toLowerCase();
    const tipoPiel = (item.jabon.tipo_piel || '').toLowerCase();
    return (
      nombre.includes(q) ||
      lema.includes(q) ||
      cliente.includes(q) ||
      tipoPiel.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Barra superior de título y búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Catálogo de Jabones Guardados
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {jabones.length} {jabones.length === 1 ? 'fórmula' : 'fórmulas'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Historial de jabones formulados, costeados y registrados en Supabase o Sandbox
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Campo de búsqueda */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar jabón o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-brand-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Recargar lista"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onIrAFormular}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm shadow-brand-600/20 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formular Nuevo</span>
          </button>
        </div>
      </div>

      {/* Listado de Jabones */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Cargando jabones registrados...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800">
              {searchTerm ? 'No se encontraron jabones con ese criterio' : 'Aún no has guardado jabones'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm
                ? 'Prueba buscando con otro término o limpia el buscador.'
                : 'Formula tu primera receta en las pestañas y presiona "Guardar Jabón" para conservarla en tu catálogo.'}
            </p>
          </div>
          {!searchTerm && (
            <button
              type="button"
              onClick={onIrAFormular}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-600/20 hover:bg-brand-700 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ir a Formulación de Jabones</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtrados.map((item) => {
            const isExpanded = expandedId === item.jabon.id;
            const bases = item.componentes.filter(
              (c) => c.insumo.categoria === 'base_glicerina'
            );
            const pesoBase = bases.reduce((acc, curr) => acc + curr.cantidad_usada, 0);

            return (
              <div
                key={item.jabon.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden hover:border-slate-300 transition-all"
              >
                {/* Cabecera de la tarjeta del jabón */}
                <div className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                    {/* Thumbnail con zoom */}
                    {item.jabon.foto_producto_url ? (
                      <div
                        onClick={() =>
                          setPreviewImg({
                            url: item.jabon.foto_producto_url!,
                            titulo: `${item.jabon.nombre} - Barra`,
                          })
                        }
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 shadow-xs cursor-pointer group/img"
                        title="Clic para ver foto en tamaño grande"
                      >
                        <img
                          src={item.jabon.foto_producto_url}
                          alt={item.jabon.nombre}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                        {item.jabon.foto_etiqueta_url && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/75 backdrop-blur-xs text-[9px] text-white font-bold leading-tight">
                            Etiqueta
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6" />
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                          {item.jabon.tipo_piel || 'Jabón Artesanal'}
                        </span>

                        {item.isMock ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Database className="w-3 h-3" /> Sandbox Local
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Database className="w-3 h-3" /> Supabase
                          </span>
                        )}

                        {item.jabon.cliente && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {item.jabon.cliente}
                          </span>
                        )}

                        {item.jabon.user_email && (
                          <span className="text-[10px] text-slate-600 font-medium px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 flex items-center gap-1" title="Creado por este usuario">
                            <User className="w-3 h-3 text-slate-400" />
                            {item.jabon.user_email}
                          </span>
                        )}

                        {item.jabon.created_at && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.jabon.created_at).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        {item.jabon.nombre}
                      </h4>

                      {item.jabon.lema && (
                        <p className="text-xs text-slate-500 italic">"{item.jabon.lema}"</p>
                      )}
                    </div>
                  </div>

                  {/* Métricas Financieras */}
                  <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Costo Fab.
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-700">
                        {formatCOP(item.costo_total)}
                      </span>
                    </div>

                    <div className="h-7 w-[1px] bg-slate-200 hidden sm:block" />

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Precio Venta
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-brand-700">
                        {formatCOP(item.jabon.valor_venta)}
                      </span>
                    </div>

                    <div className="h-7 w-[1px] bg-slate-200 hidden sm:block" />

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Rentabilidad
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-extrabold px-2 py-0.5 rounded-lg ${
                          item.rentabilidad_porcentaje >= 40
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.rentabilidad_porcentaje.toFixed(1)}%
                      </span>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        type="button"
                        onClick={() => onCargarEnFormulador(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200 transition-all active:scale-95"
                        title="Cargar esta receta en la mesa de formulación"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cargar Receta</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRequestEliminarJabon(item.jabon)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar del catálogo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpand(item.jabon.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title={isExpanded ? 'Ocultar componentes' : 'Ver componentes'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desglose Expandible de Componentes */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 bg-slate-50/70 border-t border-slate-200 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-brand-600" />
                        Fórmula: {item.componentes.length} componentes • Peso base:{' '}
                        {formatDecimal(pesoBase)}g
                      </span>
                      <span>Margen neto: {formatCOP(item.margen_ganancia)}</span>
                    </div>

                    {item.componentes.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-100/80 text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">Materia Prima</th>
                              <th className="py-2 px-3">Categoría</th>
                              <th className="py-2 px-3 text-right">Cantidad</th>
                              <th className="py-2 px-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {item.componentes.map((c, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 font-medium text-slate-800">
                                  {c.insumo.nombre}
                                </td>
                                <td className="py-2 px-3 text-slate-500 capitalize">
                                  {c.insumo.categoria.replace('_', ' ')}
                                </td>
                                <td className="py-2 px-3 text-right font-semibold">
                                  {formatDecimal(c.cantidad_usada)}{' '}
                                  {formatUnidadLabel(c.insumo.unidad)}
                                </td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900">
                                  {formatCOP(c.subtotal_costo)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        No hay componentes detallados registrados para esta fórmula.
                      </p>
                    )}

                    {/* Fotografías del Jabón (si existen) */}
                    {(item.jabon.foto_producto_url || item.jabon.foto_etiqueta_url) && (
                      <div className="pt-2 border-t border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                          Fotografías Registradas:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {item.jabon.foto_producto_url && (
                            <div
                              onClick={() =>
                                setPreviewImg({
                                  url: item.jabon.foto_producto_url!,
                                  titulo: `${item.jabon.nombre} - Barra Terminada`,
                                })
                              }
                              className="relative group rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-200 cursor-pointer shadow-xs"
                            >
                              <img
                                src={item.jabon.foto_producto_url}
                                alt="Foto Barra"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                                <span className="text-xs font-bold text-white flex items-center gap-1">
                                  <Camera className="w-3.5 h-3.5" /> Barra del Jabón
                                </span>
                              </div>
                            </div>
                          )}

                          {item.jabon.foto_etiqueta_url && (
                            <div
                              onClick={() =>
                                setPreviewImg({
                                  url: item.jabon.foto_etiqueta_url!,
                                  titulo: `${item.jabon.nombre} - Etiqueta / Empaque`,
                                })
                              }
                              className="relative group rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-200 cursor-pointer shadow-xs"
                            >
                              <img
                                src={item.jabon.foto_etiqueta_url}
                                alt="Foto Etiqueta"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                                <span className="text-xs font-bold text-white flex items-center gap-1">
                                  <Camera className="w-3.5 h-3.5" /> Etiqueta / Presentación
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {item.jabon.beneficios && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
                        <strong className="text-slate-800">Beneficios: </strong>
                        {item.jabon.beneficios}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Zoom de Fotografías */}
      {previewImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 pl-3.5 pr-7 sm:p-6 sm:px-6 animate-in fade-in duration-150"
          onClick={() => setPreviewImg(null)}
        >
          <div
            className="relative max-w-[calc(100vw-2.5rem)] sm:max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImg(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImg.url}
              alt={previewImg.titulo}
              className="w-full max-h-[80vh] object-contain rounded-xl mx-auto"
            />
            <p className="text-center text-xs text-slate-300 py-2.5 font-bold">
              {previewImg.titulo}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
