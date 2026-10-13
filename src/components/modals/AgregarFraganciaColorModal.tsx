import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Palette,
  Flame,
  Check,
  Building,
  Scale,
  Droplets,
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
} from '../../utils/formatters';
import { DosageStepperInput } from '../common/DosageStepperInput';
import { ThousandsInput } from '../common/ThousandsInput';

interface AgregarFraganciaColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInsumo: (insumo: Insumo, cantidad: number, esEnGotas?: boolean) => void;
  itemsExistentesEnRecetaIds: string[];
}

type ModalView = 'catalogo' | 'asignar_cantidad' | 'crear_nueva';
type FiltroCategoria = 'todas' | 'fragancia' | 'color';

export const AgregarFraganciaColorModal: React.FC<AgregarFraganciaColorModalProps> = ({
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

  // Insumo seleccionado
  const [itemSeleccionado, setItemSeleccionado] = useState<Insumo | null>(null);
  const [cantidadInput, setCantidadInput] = useState<string>('3');
  const [modoGotas, setModoGotas] = useState(false);
  const [gotasInput, setGotasInput] = useState<string>('20');
  const [errorCantidad, setErrorCantidad] = useState<string | null>(null);

  // Formulario de creación
  const [creandoLoading, setCreandoLoading] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);
  const [showRlsHelper, setShowRlsHelper] = useState(false);
  const [copiedRls, setCopiedRls] = useState(false);
  const [nuevoForm, setNuevoForm] = useState<NuevoInsumoFormData>({
    categoria: 'fragancia',
    nombre: '',
    proveedor: '',
    unidad: 'mililitros',
    cantidad_comprada: 50,
    valor_compra: 25000,
  });

  useEffect(() => {
    if (isOpen) {
      cargarInsumos();
      setView('catalogo');
      setItemSeleccionado(null);
      setCantidadInput('3');
      setModoGotas(false);
      setErrorCantidad(null);
      setErrorCrear(null);
      setShowRlsHelper(false);
    }
  }, [isOpen]);

  const cargarInsumos = async () => {
    setLoading(true);
    try {
      const res = await fetchInsumos(['fragancia', 'color']);
      setInsumos(res.data);
    } catch (err) {
      console.error('Error cargando fragancias y colores:', err);
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
    if (insumo.categoria === 'fragancia') {
      setCantidadInput(insumo.unidad === 'mililitros' ? '3' : '3');
    } else {
      setCantidadInput(insumo.unidad === 'mililitros' ? '1' : '1');
    }
    setModoGotas(false);
    setErrorCantidad(null);
    setView('asignar_cantidad');
  };

  const handleConfirmarCantidad = () => {
    if (!itemSeleccionado) return;

    if (modoGotas && itemSeleccionado.unidad === 'mililitros') {
      const gotas = parseFloat(gotasInput.replace(',', '.'));
      if (isNaN(gotas) || gotas <= 0) {
        setErrorCantidad('Ingresa un número válido de gotas (mayor a 0).');
        return;
      }
      const mlEquivalente = gotas / 20;
      onSelectInsumo(itemSeleccionado, mlEquivalente, true);
      onClose();
      return;
    }

    const cantidad = parseFloat(cantidadInput.replace(',', '.'));
    if (isNaN(cantidad) || cantidad < 0.1 || cantidad > 30) {
      setErrorCantidad(`La cantidad permitida debe estar entre 0.1 y 30 ${itemSeleccionado.unidad}.`);
      return;
    }

    onSelectInsumo(itemSeleccionado, cantidad, false);
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
      setCantidadInput(res.data.categoria === 'fragancia' ? '3' : '1');
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

  let cantidadEfectiva = parseFloat(cantidadInput.replace(',', '.')) || 0;
  if (modoGotas && itemSeleccionado?.unidad === 'mililitros') {
    const gotas = parseFloat(gotasInput.replace(',', '.')) || 0;
    cantidadEfectiva = gotas / 20;
  }
  const subtotalEstimado = itemSeleccionado
    ? cantidadEfectiva * itemSeleccionado.costo_unitario
    : 0;

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
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-sm">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {view === 'catalogo' && 'Agregar Fragancia o Color'}
                {view === 'asignar_cantidad' && 'Dosificar en la Receta'}
                {view === 'crear_nueva' && 'Crear Nueva Fragancia o Color en Inventario'}
              </h3>
              <p className="text-xs text-slate-500">
                {view === 'catalogo' && 'Aceites esenciales, esencias cosméticas, micas y colorantes'}
                {view === 'asignar_cantidad' && `Calculando subtotal para: ${itemSeleccionado?.nombre}`}
                {view === 'crear_nueva' && 'Registra el insumo aromático o pigmento con sus costos'}
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
            {/* Filtros por pestaña y buscador */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar fragancia, aceite esencial, mica o color..."
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

              {/* Botones de filtro rápido: Todas, Fragancias, Colores */}
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
                  onClick={() => setFiltro('fragancia')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    filtro === 'fragancia'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  Fragancias ({insumos.filter((i) => i.categoria === 'fragancia').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltro('color')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    filtro === 'color'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Palette className="w-3 h-3" />
                  Colores & Micas ({insumos.filter((i) => i.categoria === 'color').length})
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
                  <p className="text-sm">Cargando fragancias y colores...</p>
                </div>
              ) : insumosFiltrados.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-purple-600">
                    <Palette className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    No se encontraron insumos
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    {busqueda
                      ? `No hay coincidencias para "${busqueda}". Puedes crearlo ahora mismo.`
                      : 'Aún no tienes fragancias ni colores registrados.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setView('crear_nueva')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar nuevo insumo ahora
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-subtle">
                  {insumosFiltrados.map((item) => {
                    const yaEstaEnReceta = itemsExistentesEnRecetaIds.includes(item.id);
                    const esFragancia = item.categoria === 'fragancia';

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                esFragancia
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}
                            >
                              {esFragancia ? 'Fragancia' : 'Color / Mica'}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {item.nombre}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-medium">
                              ({item.unidad})
                            </span>
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
                              / {item.unidad === 'gramos' ? 'g' : 'ml'}
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
                  itemSeleccionado.categoria === 'fragancia'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {itemSeleccionado.categoria === 'fragancia' ? (
                  <Flame className="w-5 h-5" />
                ) : (
                  <Palette className="w-5 h-5" />
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
                    {formatCostoUnitario(itemSeleccionado.costo_unitario)} / {itemSeleccionado.unidad === 'gramos' ? 'g' : 'ml'}
                  </span>
                </p>
              </div>
            </div>

            {itemSeleccionado.unidad === 'mililitros' && (
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setModoGotas(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !modoGotas ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Medir en Mililitros (ml)
                </button>
                <button
                  type="button"
                  onClick={() => setModoGotas(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    modoGotas ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5" />
                  Medir en Gotas (~20 gotas/ml)
                </button>
              </div>
            )}

            {!modoGotas ? (
              <div>
                <label
                  htmlFor="cantidad_item_input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Cantidad a dosificar (en {itemSeleccionado.unidad}) <span className="text-rose-500">*</span>
                </label>
                <DosageStepperInput
                  id="cantidad_item_input"
                  value={cantidadInput}
                  onChange={(val) => {
                    setCantidadInput(val);
                    setErrorCantidad(null);
                  }}
                  min={0.1}
                  max={30}
                  step={0.1}
                  unidad={itemSeleccionado.unidad === 'gramos' ? 'g' : 'ml'}
                  icon={
                    itemSeleccionado.unidad === 'mililitros' ? (
                      <Droplets className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Scale className="w-5 h-5 text-purple-600" />
                    )
                  }
                  dosisUsuales={
                    itemSeleccionado.categoria === 'fragancia'
                      ? [0.5, 1, 2, 3, 5, 8, 10]
                      : [0.5, 1, 2, 2.5, 3, 5]
                  }
                  autoFocus
                />
              </div>
            ) : (
              <div>
                <label
                  htmlFor="gotas_item_input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Número de Gotas <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <input
                    id="gotas_item_input"
                    type="number"
                    step="1"
                    min="1"
                    value={gotasInput}
                    onChange={(e) => {
                      setGotasInput(e.target.value);
                      setErrorCantidad(null);
                    }}
                    className="w-full pl-10 pr-16 py-3 bg-white rounded-xl border border-slate-300 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 transition-all"
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-500">
                    gotas
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-400">Gotas comunes:</span>
                  {[5, 10, 15, 20, 30].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setGotasInput(val.toString());
                        setErrorCantidad(null);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                    >
                      {val} gotas ({(val / 20).toFixed(2)} ml)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errorCantidad && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errorCantidad}</p>
            )}

            <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-900 font-medium block">
                  Subtotal estimado
                </span>
                <span className="text-[11px] text-purple-700">
                  {formatDecimal(cantidadEfectiva)} {itemSeleccionado.unidad === 'gramos' ? 'g' : 'ml'} ×{' '}
                  {formatCostoUnitario(itemSeleccionado.costo_unitario)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-purple-950">
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

            {/* Categoría: Fragancia vs Color */}
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
                      categoria: 'fragancia',
                      unidad: 'mililitros',
                    })
                  }
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                    nuevoForm.categoria === 'fragancia'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Flame className="w-4 h-4 text-indigo-600" />
                  <span>Fragancia / Aceite Esencial</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNuevoForm({
                      ...nuevoForm,
                      categoria: 'color',
                      unidad: 'gramos',
                    })
                  }
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                    nuevoForm.categoria === 'color'
                      ? 'bg-purple-50 border-purple-300 text-purple-900 ring-2 ring-purple-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Palette className="w-4 h-4 text-purple-600" />
                  <span>Mica Mineral / Colorante</span>
                </button>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label
                htmlFor="nuevo_frag_nombre"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Nombre del Insumo <span className="text-rose-500">*</span>
              </label>
              <input
                id="nuevo_frag_nombre"
                type="text"
                placeholder={
                  nuevoForm.categoria === 'fragancia'
                    ? 'Ej: Aceite Esencial de Hierbabuena, Esencia de Mango...'
                    : 'Ej: Mica Mineral Turquesa Perlada, Pigmento Violeta...'
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
                  htmlFor="nuevo_frag_proveedor"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Proveedor / Marca
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    id="nuevo_frag_proveedor"
                    type="text"
                    placeholder="Ej: Aromas del Valle, Pigmentos Spa"
                    value={nuevoForm.proveedor}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, proveedor: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="nuevo_frag_unidad"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Unidad de Medida <span className="text-rose-500">*</span>
                </label>
                <select
                  id="nuevo_frag_unidad"
                  value={nuevoForm.unidad}
                  onChange={(e) =>
                    setNuevoForm({
                      ...nuevoForm,
                      unidad: e.target.value as UnidadMedida,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="mililitros">Mililitros (ml) - Líquidos y aceites</option>
                  <option value="gramos">Gramos (g) - Micas en polvo y pastas</option>
                </select>
              </div>
            </div>

            {/* Cantidad comprada y Valor de compra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="nuevo_frag_cantidad"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Cantidad Comprada ({nuevoForm.unidad}) <span className="text-rose-500">*</span>
                </label>
                <ThousandsInput
                  id="nuevo_frag_cantidad"
                  value={nuevoForm.cantidad_comprada}
                  onChange={(val) =>
                    setNuevoForm({
                      ...nuevoForm,
                      cantidad_comprada: val,
                    })
                  }
                  allowDecimals={true}
                  prefix={<Scale className="w-4 h-4" />}
                  suffix={nuevoForm.unidad === 'gramos' ? 'g' : 'ml'}
                  placeholder="100"
                />
              </div>

              <div>
                <label
                  htmlFor="nuevo_frag_valor"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Valor Total Compra (COP) <span className="text-rose-500">*</span>
                </label>
                <ThousandsInput
                  id="nuevo_frag_valor"
                  value={nuevoForm.valor_compra}
                  onChange={(val) =>
                    setNuevoForm({
                      ...nuevoForm,
                      valor_compra: val,
                    })
                  }
                  prefix={<DollarSign className="w-4 h-4" />}
                  placeholder="25.000"
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
                  {nuevoForm.unidad === 'gramos' ? 'g' : 'ml'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-brand-700">
                  {formatCostoUnitario(costoUnitarioNuevo)}
                </span>
                <span className="text-xs text-slate-500">
                  {' '}
                  / {nuevoForm.unidad === 'gramos' ? 'g' : 'ml'}
                </span>
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
