import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Package,
  Box,
  Check,
  Building,
  DollarSign,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Copy,
  Code2,
} from 'lucide-react';
import type { Insumo, NuevoInsumoFormData, UnidadMedida } from '../../types/database.types';
import { fetchInsumos, createInsumo } from '../../lib/supabase';
import {
  formatCOP,
  formatCostoUnitario,
  formatDecimal,
  toTitleCase,
  formatUnidadLabel,
} from '../../utils/formatters';
import { ThousandsInput } from '../common/ThousandsInput';

interface AgregarEmpaqueMoldesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInsumo: (insumo: Insumo, cantidad: number) => void;
  itemsExistentesEnRecetaIds: string[];
}

type ModalView = 'catalogo' | 'asignar_cantidad' | 'crear_nueva';
type FiltroCategoria = 'todas' | 'empaque' | 'molde';

export const AgregarEmpaqueMoldesModal: React.FC<AgregarEmpaqueMoldesModalProps> = ({
  isOpen,
  onClose,
  onSelectInsumo,
  itemsExistentesEnRecetaIds,
}) => {
  const [view, setView] = useState<ModalView>('catalogo');
  const [filtro, setFiltro] = useState<FiltroCategoria>('todas');
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Item seleccionado
  const [itemSeleccionado, setItemSeleccionado] = useState<Insumo | null>(null);
  const [cantidadInput, setCantidadInput] = useState<string>('1');
  const [errorCantidad, setErrorCantidad] = useState<string | null>(null);

  // Formulario de creación
  const [creandoLoading, setCreandoLoading] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);
  const [showRlsHelper, setShowRlsHelper] = useState(false);
  const [copiedRls, setCopiedRls] = useState(false);
  const [nuevoForm, setNuevoForm] = useState<NuevoInsumoFormData>({
    categoria: 'empaque',
    nombre: '',
    proveedor: '',
    unidad: 'unidades',
    cantidad_comprada: 100,
    valor_compra: 50000,
  });

  useEffect(() => {
    if (isOpen) {
      cargarInsumos();
      setView('catalogo');
      setItemSeleccionado(null);
      setCantidadInput('1');
      setErrorCantidad(null);
      setErrorCrear(null);
      setShowRlsHelper(false);
    }
  }, [isOpen]);

  const cargarInsumos = async () => {
    setLoading(true);
    try {
      const res = await fetchInsumos(['empaque', 'molde']);
      setInsumos(res.data);
    } catch (err) {
      console.error('Error cargando empaques y moldes:', err);
    } finally {
      setLoading(false);
    }
  };

  const insumosFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    return insumos
      .filter((item) => {
        if (filtro !== 'todas' && item.categoria !== filtro) {
          return false;
        }
        if (!query) return true;
        const nombreMatch = item.nombre.toLowerCase().includes(query);
        const provMatch = item.proveedor?.toLowerCase().includes(query) ?? false;
        return nombreMatch || provMatch;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [insumos, busqueda, filtro]);

  if (!isOpen) return null;

  const handleIniciarSeleccion = (insumo: Insumo) => {
    setItemSeleccionado(insumo);
    setCantidadInput('1');
    setErrorCantidad(null);
    setView('asignar_cantidad');
  };

  const handleConfirmarCantidad = () => {
    if (!itemSeleccionado) return;

    const cantidad = parseFloat(cantidadInput);
    if (isNaN(cantidad) || cantidad <= 0) {
      setErrorCantidad(`Ingresa una cantidad válida (mayor a 0).`);
      return;
    }

    onSelectInsumo(itemSeleccionado, cantidad);
    onClose();
  };

  const handleGuardarNuevo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCrear(null);
    setShowRlsHelper(false);

    if (!nuevoForm.nombre.trim()) {
      setErrorCrear('El nombre del insumo es obligatorio.');
      return;
    }
    if (nuevoForm.cantidad_comprada <= 0) {
      setErrorCrear('La cantidad comprada debe ser mayor a 0.');
      return;
    }
    if (nuevoForm.valor_compra <= 0) {
      setErrorCrear('El valor de compra debe ser mayor a $ 0 COP.');
      return;
    }

    setCreandoLoading(true);
    try {
      const res = await createInsumo({
        categoria: nuevoForm.categoria,
        nombre: toTitleCase(nuevoForm.nombre),
        proveedor: nuevoForm.proveedor ? toTitleCase(nuevoForm.proveedor) : null,
        unidad: nuevoForm.unidad,
        cantidad_comprada: nuevoForm.cantidad_comprada,
        valor_compra: nuevoForm.valor_compra,
      });

      if (res.error || !res.data) {
        const errorMsg = res.error || 'No se pudo crear el insumo.';
        setErrorCrear(errorMsg);
        if (errorMsg.toLowerCase().includes('row-level security') || errorMsg.toLowerCase().includes('violates')) {
          setShowRlsHelper(true);
        }
        return;
      }

      await cargarInsumos();
      setItemSeleccionado(res.data);
      setCantidadInput('1');
      setView('asignar_cantidad');
    } catch (err: any) {
      const msg = err.message || 'Error inesperado al crear insumo.';
      setErrorCrear(msg);
      if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('violates')) {
        setShowRlsHelper(true);
      }
    } finally {
      setCreandoLoading(false);
    }
  };

  const sqlRlsQuery = `-- En Supabase -> SQL Editor ejecuta:\nCREATE POLICY "Permitir insert insumos" ON public.insumos FOR INSERT TO anon, authenticated WITH CHECK (true);\nCREATE POLICY "Permitir select insumos" ON public.insumos FOR SELECT TO anon, authenticated USING (true);`;

  const handleCopyRls = () => {
    navigator.clipboard.writeText(sqlRlsQuery);
    setCopiedRls(true);
    setTimeout(() => setCopiedRls(false), 2000);
  };

  const costoUnitarioNuevo =
    nuevoForm.cantidad_comprada > 0
      ? nuevoForm.valor_compra / nuevoForm.cantidad_comprada
      : 0;

  const cantidadParsed = parseFloat(cantidadInput) || 0;
  const subtotalEstimado = itemSeleccionado ? cantidadParsed * itemSeleccionado.costo_unitario : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 pl-3.5 pr-7 sm:p-6 sm:px-6 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[calc(100vw-2.5rem)] sm:max-w-2xl rounded-2xl shadow-modal border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="px-4 pr-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            {view !== 'catalogo' && (
              <button
                type="button"
                onClick={() => setView('catalogo')}
                className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                title="Volver al catálogo"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {view === 'catalogo' && 'Agregar Empaque o Molde'}
                {view === 'asignar_cantidad' && 'Especificar Unidades Utilizadas'}
                {view === 'crear_nueva' && 'Crear Nuevo Empaque o Molde en Inventario'}
              </h3>
              <p className="text-xs text-slate-500">
                {view === 'catalogo' && 'Cajas, fajas, papel protector, etiquetas y costo de molde amortizado'}
                {view === 'asignar_cantidad' && `Calculando subtotal para: ${itemSeleccionado?.nombre}`}
                {view === 'crear_nueva' && 'Registra el insumo de empaque o molde con su costo de lote'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VISTA 1: CATÁLOGO */}
        {view === 'catalogo' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar empaque, caja, etiqueta o molde..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all"
                    autoFocus
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setView('crear_nueva')}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 transition-colors whitespace-nowrap active:scale-95"
                >
                  <Plus className="w-4 h-4 text-brand-600" />
                  <span>Crear en inventario</span>
                </button>
              </div>

              {/* Filtro rápido */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFiltro('todas')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filtro === 'todas'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos ({insumos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltro('empaque')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    filtro === 'empaque'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Package className="w-3 h-3" />
                  Empaques ({insumos.filter((i) => i.categoria === 'empaque').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltro('molde')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    filtro === 'molde'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Box className="w-3 h-3" />
                  Moldes ({insumos.filter((i) => i.categoria === 'molde').length})
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
                  <p className="text-sm">Cargando empaques y moldes...</p>
                </div>
              ) : insumosFiltrados.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-teal-600">
                    <Package className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    No se encontraron insumos
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    {busqueda
                      ? `No hay coincidencias para "${busqueda}". Puedes crearlo ahora mismo.`
                      : 'Aún no tienes empaques ni moldes registrados.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setView('crear_nueva')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar nuevo empaque o molde
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-subtle">
                  {insumosFiltrados.map((item) => {
                    const yaEstaEnReceta = itemsExistentesEnRecetaIds.includes(item.id);
                    const esEmpaque = item.categoria === 'empaque';

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                esEmpaque
                                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {esEmpaque ? 'Empaque' : 'Molde'}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {item.nombre}
                            </h4>
                            {yaEstaEnReceta && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                En receta actual
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            {item.proveedor ? (
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3 text-slate-400" />
                                {item.proveedor}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Sin proveedor</span>
                            )}
                            <span>•</span>
                            <span className="font-medium text-slate-700">
                              Costo:{' '}
                              <strong className="text-brand-700">
                                {formatCostoUnitario(item.costo_unitario)}
                              </strong>{' '}
                              / {item.unidad}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end sm:justify-center">
                          <button
                            type="button"
                            onClick={() => handleIniciarSeleccion(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-brand-600 text-white transition-all shadow-sm active:scale-95"
                          >
                            <span>Seleccionar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA 2: ASIGNAR CANTIDAD */}
        {view === 'asignar_cantidad' && itemSeleccionado && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  itemSeleccionado.categoria === 'empaque'
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {itemSeleccionado.categoria === 'empaque' ? (
                  <Package className="w-5 h-5" />
                ) : (
                  <Box className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {itemSeleccionado.nombre}
                  </h4>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {itemSeleccionado.categoria}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proveedor: {itemSeleccionado.proveedor || 'No especificado'} • Costo base:{' '}
                  <span className="font-semibold text-slate-800">
                    {formatCostoUnitario(itemSeleccionado.costo_unitario)} / {itemSeleccionado.unidad}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="cantidad_empaque_input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Cantidad a utilizar por jabón ({formatUnidadLabel(itemSeleccionado.unidad)}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="cantidad_empaque_input"
                  type="number"
                  step={itemSeleccionado.unidad === 'metros' ? '0.01' : itemSeleccionado.unidad === 'unidades' ? '1' : '0.1'}
                  min="0.01"
                  placeholder={itemSeleccionado.unidad === 'metros' ? 'Ej: 0.35' : 'Ej: 1'}
                  value={cantidadInput}
                  onChange={(e) => {
                    setCantidadInput(e.target.value);
                    setErrorCantidad(null);
                  }}
                  className="w-full px-3.5 py-3 bg-white rounded-xl border border-slate-300 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 transition-all"
                  autoFocus
                />
              </div>

              {/* Botones comunes */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-slate-400">Comunes:</span>
                {itemSeleccionado.unidad === 'metros' ? (
                  [0.2, 0.35, 0.5, 1].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setCantidadInput(val.toString());
                        setErrorCantidad(null);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold transition-colors border border-teal-200/60"
                    >
                      {val} mts
                    </button>
                  ))
                ) : (
                  [1, 2, 3].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setCantidadInput(val.toString());
                        setErrorCantidad(null);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                    >
                      {val} {formatUnidadLabel(itemSeleccionado.unidad)}
                    </button>
                  ))
                )}
              </div>
            </div>

            {errorCantidad && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errorCantidad}</p>
            )}

            <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-teal-900 font-medium block">
                  Subtotal estimado
                </span>
                <span className="text-[11px] text-teal-700">
                  {formatDecimal(cantidadParsed)} {itemSeleccionado.unidad} ×{' '}
                  {formatCostoUnitario(itemSeleccionado.costo_unitario)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-teal-950">
                  {formatCOP(subtotalEstimado)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setView('catalogo')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmarCantidad}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Agregar a la Receta</span>
              </button>
            </div>
          </div>
        )}

        {/* VISTA 3: CREAR NUEVA */}
        {view === 'crear_nueva' && (
          <form onSubmit={handleGuardarNuevo} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {errorCrear && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-rose-800 text-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-rose-900">Error al guardar en Supabase:</p>
                    <p className="text-[11px] mt-0.5 text-rose-700 font-mono break-all">{errorCrear}</p>
                  </div>
                </div>

                {showRlsHelper && (
                  <div className="mt-2 pt-2 border-t border-rose-200/80 bg-white/70 p-2.5 rounded-lg text-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-slate-900 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-brand-600" />
                        Solución: Ejecutar política RLS en Supabase SQL Editor
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyRls}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedRls ? '¡Copiado!' : 'Copiar SQL'}</span>
                      </button>
                    </div>
                    <pre className="text-[10px] bg-slate-900 text-slate-100 p-2 rounded overflow-x-auto font-mono">
                      {sqlRlsQuery}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Categoría: Empaque vs Molde */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Tipo de Insumo <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setNuevoForm({
                      ...nuevoForm,
                      categoria: 'empaque',
                      unidad: 'unidades',
                    })
                  }
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                    nuevoForm.categoria === 'empaque'
                      ? 'bg-teal-50 border-teal-300 text-teal-900 ring-2 ring-teal-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Package className="w-4 h-4 text-teal-600" />
                  <span>Empaque / Etiqueta</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNuevoForm({
                      ...nuevoForm,
                      categoria: 'molde',
                      unidad: 'unidades',
                    })
                  }
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                    nuevoForm.categoria === 'molde'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Box className="w-4 h-4 text-amber-600" />
                  <span>Molde (Amortizado)</span>
                </button>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label
                htmlFor="nuevo_emp_nombre"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Nombre del Insumo <span className="text-rose-500">*</span>
              </label>
              <input
                id="nuevo_emp_nombre"
                type="text"
                placeholder={
                  nuevoForm.categoria === 'empaque'
                    ? 'Ej: Caja Kraft con Ventana 100g, Faja Botánica...'
                    : 'Ej: Molde Silicona 6 Cavidades Rectangular...'
                }
                value={nuevoForm.nombre}
                onChange={(e) => setNuevoForm({ ...nuevoForm, nombre: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all"
                autoFocus
              />
            </div>

            {/* Proveedor y Unidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="nuevo_emp_proveedor"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Proveedor / Marca
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    id="nuevo_emp_proveedor"
                    type="text"
                    placeholder="Ej: Imprenta Gráfica, EcoEmpaques"
                    value={nuevoForm.proveedor}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, proveedor: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="nuevo_emp_unidad"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Unidad de Medida <span className="text-rose-500">*</span>
                </label>
                <select
                  id="nuevo_emp_unidad"
                  value={nuevoForm.unidad}
                  onChange={(e) =>
                    setNuevoForm({
                      ...nuevoForm,
                      unidad: e.target.value as UnidadMedida,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="unidades">Unidades (Piezas, cajas, etiquetas)</option>
                  <option value="metros">Metros (mts) - Cintas, cordeles, cuerda yute</option>
                  <option value="gramos">Gramos (g) - Viruta, papeles especiales</option>
                </select>
              </div>
            </div>

            {/* Cantidad comprada y Valor de compra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="nuevo_emp_cantidad"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Cantidad Comprada ({nuevoForm.unidad}) <span className="text-rose-500">*</span>
                </label>
                <ThousandsInput
                  id="nuevo_emp_cantidad"
                  value={nuevoForm.cantidad_comprada}
                  onChange={(val) =>
                    setNuevoForm({
                      ...nuevoForm,
                      cantidad_comprada: val,
                    })
                  }
                  allowDecimals={nuevoForm.unidad === 'metros'}
                  suffix={nuevoForm.unidad === 'metros' ? 'mts' : nuevoForm.unidad === 'gramos' ? 'g' : 'und'}
                  placeholder="50"
                />
              </div>

              <div>
                <label
                  htmlFor="nuevo_emp_valor"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Valor Total Compra (COP) <span className="text-rose-500">*</span>
                </label>
                <ThousandsInput
                  id="nuevo_emp_valor"
                  value={nuevoForm.valor_compra}
                  onChange={(val) =>
                    setNuevoForm({
                      ...nuevoForm,
                      valor_compra: val,
                    })
                  }
                  prefix={<DollarSign className="w-4 h-4" />}
                  placeholder="50.000"
                />
                <span className="text-[11px] text-brand-700 font-medium block mt-1">
                  En miles: {formatCOP(nuevoForm.valor_compra)}
                </span>
              </div>
            </div>

            {/* Costo Unitario */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-600 block">
                  Costo Unitario Calculado (Trigger BD):
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatCOP(nuevoForm.valor_compra)} / {formatDecimal(nuevoForm.cantidad_comprada)}{' '}
                  {nuevoForm.unidad}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-brand-700">
                  {formatCostoUnitario(costoUnitarioNuevo)}
                </span>
                <span className="text-xs text-slate-500"> / {nuevoForm.unidad}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setView('catalogo')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={creandoLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {creandoLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando en Inventario...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Guardar y Asignar a Receta</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
