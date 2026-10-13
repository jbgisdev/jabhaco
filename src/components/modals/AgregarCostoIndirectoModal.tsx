import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Coins,
  Clock,
  Check,
  Building,
  DollarSign,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Copy,
  Code2,
  Zap,
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

interface AgregarCostoIndirectoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInsumo: (insumo: Insumo, cantidad: number) => void;
  itemsExistentesEnRecetaIds: string[];
}

type ModalView = 'catalogo' | 'asignar_cantidad' | 'crear_nueva';
type FiltroTipo = 'todas' | 'horas' | 'volumen_peso' | 'unidades';

export const AgregarCostoIndirectoModal: React.FC<AgregarCostoIndirectoModalProps> = ({
  isOpen,
  onClose,
  onSelectInsumo,
  itemsExistentesEnRecetaIds,
}) => {
  const [view, setView] = useState<ModalView>('catalogo');
  const [filtro, setFiltro] = useState<FiltroTipo>('todas');
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Item seleccionado
  const [itemSeleccionado, setItemSeleccionado] = useState<Insumo | null>(null);
  const [cantidadInput, setCantidadInput] = useState<string>('0.25');
  const [errorCantidad, setErrorCantidad] = useState<string | null>(null);

  // Formulario de creación
  const [creandoLoading, setCreandoLoading] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);
  const [showRlsHelper, setShowRlsHelper] = useState(false);
  const [copiedRls, setCopiedRls] = useState(false);
  const [nuevoForm, setNuevoForm] = useState<NuevoInsumoFormData>({
    categoria: 'costo_indirecto',
    nombre: '',
    proveedor: '',
    unidad: 'horas',
    cantidad_comprada: 160,
    valor_compra: 1600000,
  });

  useEffect(() => {
    if (isOpen) {
      cargarInsumos();
      setView('catalogo');
      setItemSeleccionado(null);
      setCantidadInput('0.25');
      setErrorCantidad(null);
      setErrorCrear(null);
      setShowRlsHelper(false);
    }
  }, [isOpen]);

  const cargarInsumos = async () => {
    setLoading(true);
    try {
      const res = await fetchInsumos('costo_indirecto');
      setInsumos(res.data);
    } catch (err) {
      console.error('Error cargando costos indirectos:', err);
    } finally {
      setLoading(false);
    }
  };

  const insumosFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    return insumos
      .filter((item) => {
        if (filtro === 'horas' && item.unidad !== 'horas') return false;
        if (filtro === 'volumen_peso' && item.unidad !== 'mililitros' && item.unidad !== 'gramos') return false;
        if (filtro === 'unidades' && item.unidad !== 'unidades') return false;

        if (!query) return true;
        const nombreMatch = item.nombre.toLowerCase().includes(query);
        const provMatch = item.proveedor?.toLowerCase().includes(query) ?? false;
        return nombreMatch || provMatch;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [insumos, busqueda, filtro]);

  const handleIniciarSeleccion = (insumo: Insumo) => {
    setItemSeleccionado(insumo);
    // Valor inicial sugerido según unidad
    if (insumo.unidad === 'horas') {
      setCantidadInput('0.15'); // ~9 minutos
    } else if (insumo.unidad === 'mililitros') {
      setCantidadInput('5');
    } else {
      setCantidadInput('1');
    }
    setErrorCantidad(null);
    setView('asignar_cantidad');
  };

  const handleConfirmarCantidad = () => {
    if (!itemSeleccionado) return;

    const cantidad = parseFloat(cantidadInput);
    if (isNaN(cantidad) || cantidad <= 0) {
      setErrorCantidad(`Ingresa una cantidad o fracción válida (mayor a 0).`);
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
      setErrorCrear('El nombre del concepto es obligatorio.');
      return;
    }
    if (nuevoForm.cantidad_comprada <= 0) {
      setErrorCrear('La cantidad total debe ser mayor a 0.');
      return;
    }
    if (nuevoForm.valor_compra <= 0) {
      setErrorCrear('El valor monetario debe ser mayor a $ 0 COP.');
      return;
    }

    setCreandoLoading(true);
    try {
      const res = await createInsumo({
        categoria: 'costo_indirecto',
        nombre: toTitleCase(nuevoForm.nombre),
        proveedor: nuevoForm.proveedor ? toTitleCase(nuevoForm.proveedor) : null,
        unidad: nuevoForm.unidad,
        cantidad_comprada: nuevoForm.cantidad_comprada,
        valor_compra: nuevoForm.valor_compra,
      });

      if (res.error || !res.data) {
        const errorMsg = res.error || 'No se pudo crear el costo indirecto.';
        setErrorCrear(errorMsg);
        if (errorMsg.toLowerCase().includes('row-level security') || errorMsg.toLowerCase().includes('violates')) {
          setShowRlsHelper(true);
        }
        return;
      }

      await cargarInsumos();
      setItemSeleccionado(res.data);
      setCantidadInput(res.data.unidad === 'horas' ? '0.15' : '1');
      setView('asignar_cantidad');
    } catch (err: any) {
      const msg = err.message || 'Error inesperado al crear costo indirecto.';
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

  // Conversión a minutos si es en horas
  const minutosEquivalentes = itemSeleccionado?.unidad === 'horas' ? Math.round(cantidadParsed * 60) : 0;

  if (!isOpen) return null;

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
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-sm">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {view === 'catalogo' && 'Agregar Costo / Gasto Indirecto'}
                {view === 'asignar_cantidad' && 'Imputar Fracción por Barra de Jabón'}
                {view === 'crear_nueva' && 'Crear Nuevo Costo Indirecto en Inventario'}
              </h3>
              <p className="text-xs text-slate-500">
                {view === 'catalogo' && 'Mano de obra, alcohol para burbujas, servicios y amortización de equipo'}
                {view === 'asignar_cantidad' && `Calculando subtotal para: ${itemSeleccionado?.nombre}`}
                {view === 'crear_nueva' && 'Registra un gasto operativo, servicio o insumo auxiliar prorrateado'}
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
                    placeholder="Buscar mano de obra, alcohol, energía, depreciación..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all"
                  />
                  {busqueda && (
                    <button
                      type="button"
                      onClick={() => setBusqueda('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNuevoForm({
                      categoria: 'costo_indirecto',
                      nombre: '',
                      proveedor: '',
                      unidad: 'horas',
                      cantidad_comprada: 160,
                      valor_compra: 1600000,
                    });
                    setView('crear_nueva');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-brand-600/20 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Nuevo Costo</span>
                </button>
              </div>

              {/* Filtro por tipo de unidad */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-xs">
                <span className="text-slate-400 font-medium mr-1 text-[11px]">Tipo:</span>
                {[
                  { id: 'todas', label: 'Todos' },
                  { id: 'horas', label: 'Mano de Obra (Horas)' },
                  { id: 'volumen_peso', label: 'Auxiliares (ml / g)' },
                  { id: 'unidades', label: 'Servicios & Cuotas (und)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFiltro(tab.id as FiltroTipo)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                      filtro === tab.id
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Listado */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                  <span className="text-xs">Cargando catálogo de costos indirectos...</span>
                </div>
              ) : insumosFiltrados.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Coins className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    No se encontraron costos indirectos
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    {busqueda
                      ? 'No hay registros que coincidan con la búsqueda.'
                      : 'Aún no tienes conceptos de costos indirectos registrados.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setView('crear_nueva')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar nuevo costo indirecto
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-subtle">
                  {insumosFiltrados.map((item) => {
                    const yaEstaEnReceta = itemsExistentesEnRecetaIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                              {item.unidad === 'horas' ? (
                                <Clock className="w-3 h-3 text-blue-600" />
                              ) : (
                                <Zap className="w-3 h-3 text-blue-600" />
                              )}
                              <span>{formatUnidadLabel(item.unidad).toUpperCase()}</span>
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
                              <span className="text-slate-400 italic">Sin detalle</span>
                            )}
                            <span>•</span>
                            <span className="font-medium text-slate-700">
                              Costo:{' '}
                              <strong className="text-brand-700">
                                {formatCostoUnitario(item.costo_unitario)}
                              </strong>{' '}
                              / {formatUnidadLabel(item.unidad)}
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
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* Card del insumo seleccionado */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {itemSeleccionado.nombre}
                  </h4>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {formatUnidadLabel(itemSeleccionado.unidad)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proveedor: {itemSeleccionado.proveedor || 'No especificado'} • Tarifa base:{' '}
                  <span className="font-semibold text-slate-800">
                    {formatCostoUnitario(itemSeleccionado.costo_unitario)} / {formatUnidadLabel(itemSeleccionado.unidad)}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="cantidad_indirecto_input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Cantidad o fracción por jabón ({formatUnidadLabel(itemSeleccionado.unidad)}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="cantidad_indirecto_input"
                  type="number"
                  step={itemSeleccionado.unidad === 'horas' ? '0.01' : itemSeleccionado.unidad === 'unidades' ? '0.05' : '1'}
                  min="0.01"
                  placeholder={itemSeleccionado.unidad === 'horas' ? 'Ej: 0.15' : 'Ej: 1'}
                  value={cantidadInput}
                  onChange={(e) => {
                    setCantidadInput(e.target.value);
                    setErrorCantidad(null);
                  }}
                  className="w-full px-3.5 py-3 bg-white rounded-xl border border-slate-300 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 transition-all"
                  autoFocus
                />
              </div>

              {/* Ayudante en minutos si es en horas */}
              {itemSeleccionado.unidad === 'horas' && (
                <div className="mt-2 flex items-center justify-between text-xs text-blue-700 bg-blue-50/70 p-2 rounded-lg border border-blue-200/50">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Equivalente en tiempo:
                  </span>
                  <span className="font-bold">
                    {minutosEquivalentes} {minutosEquivalentes === 1 ? 'minuto' : 'minutos'} de trabajo artesanal
                  </span>
                </div>
              )}

              {/* Botones comunes según la unidad */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[11px] text-slate-400">Atajos sugeridos:</span>
                {itemSeleccionado.unidad === 'horas' ? (
                  [
                    { val: 0.08, lbl: '5 min (0.08h)' },
                    { val: 0.17, lbl: '10 min (0.17h)' },
                    { val: 0.25, lbl: '15 min (0.25h)' },
                    { val: 0.5, lbl: '30 min (0.5h)' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => {
                        setCantidadInput(preset.val.toString());
                        setErrorCantidad(null);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold transition-colors border border-blue-200/60"
                    >
                      {preset.lbl}
                    </button>
                  ))
                ) : itemSeleccionado.unidad === 'mililitros' ? (
                  [2, 5, 10].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setCantidadInput(val.toString());
                        setErrorCantidad(null);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                    >
                      {val} ml
                    </button>
                  ))
                ) : (
                  [0.1, 0.5, 1].map((val) => (
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

            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-900 font-medium block">
                  Subtotal Imputado por Barra:
                </span>
                <span className="text-[11px] text-blue-700">
                  {formatDecimal(cantidadParsed, 2)} {formatUnidadLabel(itemSeleccionado.unidad)} × {formatCostoUnitario(itemSeleccionado.costo_unitario)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-blue-950">
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

            {/* Nombre */}
            <div>
              <label
                htmlFor="nuevo_ind_nombre"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Nombre del Concepto o Insumo Indirecto <span className="text-rose-500">*</span>
              </label>
              <input
                id="nuevo_ind_nombre"
                type="text"
                placeholder="Ej: Mano de Obra Artesanal, Alcohol 96% Rociador, Consumo Eléctrico..."
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
                  htmlFor="nuevo_ind_proveedor"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Taller / Proveedor / Detalle
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    id="nuevo_ind_proveedor"
                    type="text"
                    placeholder="Ej: Taller Propio, Servicios Públicos"
                    value={nuevoForm.proveedor}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, proveedor: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="nuevo_ind_unidad"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Unidad de Medida <span className="text-rose-500">*</span>
                </label>
                <select
                  id="nuevo_ind_unidad"
                  value={nuevoForm.unidad}
                  onChange={(e) =>
                    setNuevoForm({
                      ...nuevoForm,
                      unidad: e.target.value as UnidadMedida,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="horas">Horas (Mano de obra, tiempo de operario)</option>
                  <option value="mililitros">Mililitros (ml) - Alcohol rociador, desinfectante</option>
                  <option value="unidades">Unidades (Servicios por lote, amortizaciones)</option>
                  <option value="gramos">Gramos (g) - Limpiadores, insumos auxiliares sólidos</option>
                </select>
              </div>
            </div>

            {/* Cantidad comprada y Valor de compra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="nuevo_ind_cantidad"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Cantidad Total Comprada/Contratada ({formatUnidadLabel(nuevoForm.unidad)}) <span className="text-rose-500">*</span>
                </label>
                <ThousandsInput
                  id="nuevo_ind_cantidad"
                  value={nuevoForm.cantidad_comprada}
                  onChange={(val) =>
                    setNuevoForm({
                      ...nuevoForm,
                      cantidad_comprada: val,
                    })
                  }
                  allowDecimals={true}
                  suffix={formatUnidadLabel(nuevoForm.unidad)}
                  placeholder="160"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Ej: 160 horas (mes laboral) o 1.000 ml alcohol
                </p>
              </div>

              <div>
                <label
                  htmlFor="nuevo_ind_valor"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Valor Monetario Total (COP) <span className="text-rose-500">*</span>
                </label>
                <ThousandsInput
                  id="nuevo_ind_valor"
                  value={nuevoForm.valor_compra}
                  onChange={(val) =>
                    setNuevoForm({
                      ...nuevoForm,
                      valor_compra: val,
                    })
                  }
                  prefix={<DollarSign className="w-4 h-4" />}
                  placeholder="1.600.000"
                />
                {/* Visualización en miles en tiempo real */}
                <p className="text-[11px] font-medium text-emerald-600 mt-1">
                  En miles: {formatCOP(nuevoForm.valor_compra)}
                </p>
              </div>
            </div>

            {/* Tarjeta de cálculo previo */}
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-900 font-medium block">
                  Costo Unitario Calculado:
                </span>
                <span className="text-[11px] text-blue-700">
                  {formatCOP(nuevoForm.valor_compra)} ÷ {formatDecimal(nuevoForm.cantidad_comprada)} {formatUnidadLabel(nuevoForm.unidad)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-blue-950">
                  {formatCostoUnitario(costoUnitarioNuevo)} / {formatUnidadLabel(nuevoForm.unidad)}
                </span>
              </div>
            </div>

            {/* Acciones */}
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                {creandoLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando en Inventario...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Guardar y Asignar a la Receta</span>
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
