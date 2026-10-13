import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Layers,
  Check,
  Building,
  Scale,
  DollarSign,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Copy,
  Code2,
} from 'lucide-react';
import type { Insumo, NuevoInsumoFormData } from '../../types/database.types';
import { fetchInsumos, createInsumo } from '../../lib/supabase';
import { formatCOP, formatCostoUnitario, formatDecimal, toTitleCase } from '../../utils/formatters';
import { ThousandsInput } from '../common/ThousandsInput';

interface AgregarBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBase: (insumo: Insumo, cantidadGramos: number) => void;
  basesExistentesEnRecetaIds: string[];
}

type ModalView = 'catalogo' | 'asignar_cantidad' | 'crear_nueva';

export const AgregarBaseModal: React.FC<AgregarBaseModalProps> = ({
  isOpen,
  onClose,
  onSelectBase,
  basesExistentesEnRecetaIds,
}) => {
  const [view, setView] = useState<ModalView>('catalogo');
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Base seleccionada para ingresar cantidad
  const [baseSeleccionada, setBaseSeleccionada] = useState<Insumo | null>(null);
  const [cantidadGramosInput, setCantidadGramosInput] = useState<string>('100');
  const [errorCantidad, setErrorCantidad] = useState<string | null>(null);

  // Formulario de nueva base
  const [creandoLoading, setCreandoLoading] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);
  const [showRlsHelper, setShowRlsHelper] = useState(false);
  const [copiedRls, setCopiedRls] = useState(false);
  const [nuevaBaseForm, setNuevaBaseForm] = useState<NuevoInsumoFormData>({
    categoria: 'base_glicerina',
    nombre: '',
    proveedor: '',
    unidad: 'gramos',
    cantidad_comprada: 1000,
    valor_compra: 30000,
  });

  // Cargar bases desde Supabase o mock al abrir
  useEffect(() => {
    if (isOpen) {
      cargarBases();
      setView('catalogo');
      setBaseSeleccionada(null);
      setCantidadGramosInput('100');
      setErrorCantidad(null);
      setErrorCrear(null);
      setShowRlsHelper(false);
    }
  }, [isOpen]);

  const cargarBases = async () => {
    setLoading(true);
    try {
      const res = await fetchInsumos('base_glicerina');
      setInsumos(res.data);
    } catch (err) {
      console.error('Error cargando bases:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado y orden alfabético
  const basesFiltradas = useMemo(() => {
    const query = busqueda.trim().toLowerCase();
    return insumos
      .filter((b) => {
        if (!query) return true;
        const nombreCoincide = b.nombre.toLowerCase().includes(query);
        const proveedorCoincide = b.proveedor?.toLowerCase().includes(query) ?? false;
        return nombreCoincide || proveedorCoincide;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [insumos, busqueda]);

  if (!isOpen) return null;

  // Manejar selección de base existente
  const handleIniciarSeleccion = (insumo: Insumo) => {
    setBaseSeleccionada(insumo);
    setCantidadGramosInput('100');
    setErrorCantidad(null);
    setView('asignar_cantidad');
  };

  const handleConfirmarCantidad = () => {
    const cantidad = parseFloat(cantidadGramosInput);
    if (isNaN(cantidad) || cantidad <= 0) {
      setErrorCantidad('Por favor ingresa una cantidad válida en gramos (mayor a 0).');
      return;
    }
    if (baseSeleccionada) {
      onSelectBase(baseSeleccionada, cantidad);
      onClose();
    }
  };

  // Manejar creación de nueva base
  const handleGuardarNuevaBase = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCrear(null);
    setShowRlsHelper(false);

    if (!nuevaBaseForm.nombre.trim()) {
      setErrorCrear('El nombre de la base de glicerina es obligatorio.');
      return;
    }
    if (nuevaBaseForm.cantidad_comprada <= 0) {
      setErrorCrear('La cantidad comprada debe ser mayor a 0 gramos.');
      return;
    }
    if (nuevaBaseForm.valor_compra <= 0) {
      setErrorCrear('El valor de compra debe ser mayor a 0 pesos.');
      return;
    }

    setCreandoLoading(true);
    try {
      const res = await createInsumo({
        categoria: 'base_glicerina',
        nombre: toTitleCase(nuevaBaseForm.nombre),
        proveedor: nuevaBaseForm.proveedor ? toTitleCase(nuevaBaseForm.proveedor) : null,
        unidad: 'gramos',
        cantidad_comprada: nuevaBaseForm.cantidad_comprada,
        valor_compra: nuevaBaseForm.valor_compra,
      });

      if (res.error || !res.data) {
        const errorMsg = res.error || 'No se pudo crear la base.';
        setErrorCrear(errorMsg);
        if (errorMsg.toLowerCase().includes('row-level security') || errorMsg.toLowerCase().includes('violates')) {
          setShowRlsHelper(true);
        }
        return;
      }

      await cargarBases();
      setBaseSeleccionada(res.data);
      setCantidadGramosInput('100');
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

  const costoUnitarioNuevaBase =
    nuevaBaseForm.cantidad_comprada > 0
      ? nuevaBaseForm.valor_compra / nuevaBaseForm.cantidad_comprada
      : 0;

  const cantidadParsed = parseFloat(cantidadGramosInput) || 0;
  const subtotalEstimado = baseSeleccionada ? cantidadParsed * baseSeleccionada.costo_unitario : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 pl-3.5 pr-7 sm:p-6 sm:px-6 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-[calc(100vw-2.5rem)] sm:max-w-2xl rounded-2xl shadow-modal border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
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
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {view === 'catalogo' && 'Agregar Base de Glicerina'}
                {view === 'asignar_cantidad' && 'Especificar Cantidad de la Base'}
                {view === 'crear_nueva' && 'Crear Nueva Base en Inventario'}
              </h3>
              <p className="text-xs text-slate-500">
                {view === 'catalogo' && 'Selecciona una base del inventario o crea una nueva'}
                {view === 'asignar_cantidad' && `Calculando subtotal para: ${baseSeleccionada?.nombre}`}
                {view === 'crear_nueva' && 'Registra el insumo con su costo de compra por gramo'}
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

        {/* ============================================================ */}
        {/* VISTA 1: CATÁLOGO */}
        {/* ============================================================ */}
        {view === 'catalogo' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar base por nombre o proveedor..."
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
                <span>Crear nueva base en inventario</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
                  <p className="text-sm">Cargando inventario de bases...</p>
                </div>
              ) : basesFiltradas.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    No se encontraron bases de glicerina
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    {busqueda
                      ? `No hay coincidencias para "${busqueda}". Puedes crearla ahora mismo en tu inventario.`
                      : 'Aún no tienes bases de glicerina registradas en tu catálogo.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setView('crear_nueva')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar nueva base ahora
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-subtle">
                  {basesFiltradas.map((base) => {
                    const yaEstaEnReceta = basesExistentesEnRecetaIds.includes(base.id);

                    return (
                      <div
                        key={base.id}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {base.nombre}
                            </h4>
                            {yaEstaEnReceta && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                En receta actual
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            {base.proveedor ? (
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3 text-slate-400" />
                                {base.proveedor}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Sin proveedor</span>
                            )}
                            <span>•</span>
                            <span className="font-medium text-slate-700">
                              Costo: <strong className="text-brand-700">{formatCostoUnitario(base.costo_unitario)}</strong> / g
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end sm:justify-center">
                          <button
                            type="button"
                            onClick={() => handleIniciarSeleccion(base)}
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

        {/* ============================================================ */}
        {/* VISTA 2: ASIGNAR CANTIDAD */}
        {/* ============================================================ */}
        {view === 'asignar_cantidad' && baseSeleccionada && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">
                  {baseSeleccionada.nombre}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proveedor: {baseSeleccionada.proveedor || 'No especificado'} • Costo base:{' '}
                  <span className="font-semibold text-slate-800">
                    {formatCostoUnitario(baseSeleccionada.costo_unitario)} / gramo
                  </span>
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="cantidad_usada_g"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Cantidad a usar en esta receta (en gramos) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Scale className="w-4 h-4" />
                </div>
                <input
                  id="cantidad_usada_g"
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Ej: 100 o 85.5"
                  value={cantidadGramosInput}
                  onChange={(e) => {
                    setCantidadGramosInput(e.target.value);
                    setErrorCantidad(null);
                  }}
                  className="w-full pl-10 pr-12 py-3 bg-white rounded-xl border border-slate-300 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 transition-all"
                  autoFocus
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-500">
                  gramos
                </div>
              </div>
              {errorCantidad && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errorCantidad}</p>
              )}

              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-slate-400">Comunes:</span>
                {[50, 80, 100, 120, 250, 500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setCantidadGramosInput(val.toString());
                      setErrorCantidad(null);
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    {val}g
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-brand-800 font-medium block">
                  Subtotal estimado para esta base
                </span>
                <span className="text-[11px] text-brand-600">
                  {formatDecimal(cantidadParsed)} g × {formatCostoUnitario(baseSeleccionada.costo_unitario)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-brand-900">
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

        {/* ============================================================ */}
        {/* VISTA 3: CREAR NUEVA BASE */}
        {/* ============================================================ */}
        {view === 'crear_nueva' && (
          <form onSubmit={handleGuardarNuevaBase} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            
            {/* Alerta de Error con Helper de RLS si corresponde */}
            {errorCrear && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-rose-800 text-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-rose-900">Error al guardar insumo en Supabase:</p>
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
                    <p className="text-[10px] text-slate-500">
                      💡 Abre tu proyecto en Supabase → <strong>SQL Editor</strong> → pega este código y pulsa <strong>Run</strong>.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="nueva_base_nombre"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Nombre de la Base <span className="text-rose-500">*</span>
              </label>
              <input
                id="nueva_base_nombre"
                type="text"
                placeholder="Ej: Base Glicerina de Aceite de Oliva Extra Virgen"
                value={nuevaBaseForm.nombre}
                onChange={(e) =>
                  setNuevaBaseForm({ ...nuevaBaseForm, nombre: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="nueva_base_proveedor"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Proveedor / Marca
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  id="nueva_base_proveedor"
                  type="text"
                  placeholder="Ej: Químicos & Jabones Medellín"
                  value={nuevaBaseForm.proveedor}
                  onChange={(e) =>
                    setNuevaBaseForm({ ...nuevaBaseForm, proveedor: e.target.value })
                  }
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="nueva_base_cantidad"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Cantidad Comprada (Gramos) <span className="text-rose-500">*</span>
                </label>
                <ThousandsInput
                  id="nueva_base_cantidad"
                  value={nuevaBaseForm.cantidad_comprada}
                  onChange={(val) =>
                    setNuevaBaseForm({
                      ...nuevaBaseForm,
                      cantidad_comprada: val,
                    })
                  }
                  allowDecimals={true}
                  prefix={<Scale className="w-4 h-4" />}
                  suffix="g"
                  placeholder="1.000"
                />
              </div>

              <div>
                <label
                  htmlFor="nueva_base_valor"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Valor Total Compra (COP) <span className="text-rose-500">*</span>
                </label>
                <ThousandsInput
                  id="nueva_base_valor"
                  value={nuevaBaseForm.valor_compra}
                  onChange={(val) =>
                    setNuevaBaseForm({
                      ...nuevaBaseForm,
                      valor_compra: val,
                    })
                  }
                  prefix={<DollarSign className="w-4 h-4" />}
                  placeholder="30.000"
                />
                <span className="text-[11px] text-brand-700 font-medium block mt-1">
                  En miles: {formatCOP(nuevaBaseForm.valor_compra)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-600 block">
                  Costo Unitario Calculado (Trigger BD):
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatCOP(nuevaBaseForm.valor_compra)} / {formatDecimal(nuevaBaseForm.cantidad_comprada)} g
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-brand-700">
                  {formatCostoUnitario(costoUnitarioNuevaBase)}
                </span>
                <span className="text-xs text-slate-500"> / gramo</span>
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
