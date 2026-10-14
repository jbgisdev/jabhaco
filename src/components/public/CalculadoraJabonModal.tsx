import React, { useState, useMemo } from 'react';
import {
  Calculator,
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Plus,
  Minus,
  HelpCircle,
  FlaskConical,
  Droplets,
  Info,
} from 'lucide-react';
import { formatDecimal } from '../../utils/formatters';
import { ApoyarProyectoModal } from './ApoyarProyectoModal';

interface CalculadoraJabonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIrAlLaboratorio: () => void;
  isLocked?: boolean;
}

export const CalculadoraJabonModal: React.FC<CalculadoraJabonModalProps> = ({
  isOpen,
  onClose,
  onIrAlLaboratorio,
  isLocked = false,
}) => {
  // Modal de Apoyo / Nequi
  const [isApoyoModalOpen, setIsApoyoModalOpen] = useState(false);

  // 1. Estado de inputs principales
  const [pesoDeseado, setPesoDeseado] = useState<number>(100); // gramos por barra
  const [cantidadBarras, setCantidadBarras] = useState<number>(1); // número de barras
  const [factorMolde, setFactorMolde] = useState<number>(1.2); // factor 1.2
  const [porcentajeAditivos, setPorcentajeAditivos] = useState<number>(3.0); // Rango 3.0% a 6.0% con step 0.1

  // 2. Estado de Fragancia (Opcional con regla de 12 gotas / 0.5g por 100g)
  const [incluirFragancia, setIncluirFragancia] = useState<boolean>(true);
  const [gotasFraganciaManual, setGotasFraganciaManual] = useState<number | null>(null);

  // Estados visuales
  const [mostrarDetallesAvanzados, setMostrarDetallesAvanzados] = useState<boolean>(false);

  // Pills rápidas
  const PESOS_PREDETERMINADOS = [50, 80, 100, 120];
  const PORCENTAJES_RAPIDOS = [3.0, 3.5, 4.0];

  // Modificar peso deseado de 10 en 10
  const ajustarPeso = (delta: number) => {
    setPesoDeseado((prev) => {
      const base = prev || 0;
      const nuevo = Math.max(10, Math.round((base + delta) / 10) * 10);
      return nuevo;
    });
    setGotasFraganciaManual(null);
  };

  // Modificar porcentaje con paso de 0.1 dentro del rango [3.0, 6.0]
  const ajustarPorcentaje = (delta: number) => {
    setPorcentajeAditivos((prev) => {
      const nuevo = Math.round((prev + delta) * 10) / 10;
      return Math.min(6.0, Math.max(3.0, nuevo));
    });
  };

  // Cálculos reactivos
  const calculos = useMemo(() => {
    const pesoNetoUnitario = Math.max(1, pesoDeseado || 0);
    const barras = Math.max(1, cantidadBarras || 1);
    const factor = Math.max(1, factorMolde || 1.2);
    // Clampeado estricto entre 3.0 y 6.0
    const pctAditivos = Math.min(6.0, Math.max(3.0, Math.round((porcentajeAditivos || 3.0) * 10) / 10));

    // 1. Total peso neto deseado del lote
    const totalNetoLote = pesoNetoUnitario * barras;

    // 2. Total mezcla requerida multiplicando por factor (1.2)
    // Ejemplo: 100g * 1.2 = 120g (o para 50g: 50g * 1.2 = 60g)
    const totalMezclaLote = totalNetoLote * factor;

    // 3. Aditivos correspondientes al porcentaje seleccionado (3% a 6%) de la mezcla total
    // Ejemplo con 3%: 120g * 3% = 3.60g
    // Ejemplo con 4.5%: 120g * 4.5% = 5.40g
    const totalGramosAditivos = totalMezclaLote * (pctAditivos / 100);

    // 4. Base de glicerina restante (Mezcla - Aditivos)
    // Ejemplo: 120g - 3.60g = 116.40g
    const totalGramosGlicerina = totalMezclaLote - totalGramosAditivos;

    // 5. Regla de fragancia (Máximo recomendado: 100g -> 12 gotas / 0.5g; 50g -> 6 gotas / 0.25g)
    // Gotas máximas = pesoNetoUnitario * (12 / 100) = pesoNetoUnitario * 0.12
    const maxGotasPorBarra = Math.round(pesoNetoUnitario * 0.12);
    const maxGramosFraganciaPorBarra = Number((pesoNetoUnitario * 0.005).toFixed(2));

    const totalMaxGotasFragancia = maxGotasPorBarra * barras;
    const totalMaxGramosFragancia = Number((maxGramosFraganciaPorBarra * barras).toFixed(2));

    // Gotas actuales si está activada la fragancia
    const gotasFraganciaActuales = incluirFragancia
      ? (gotasFraganciaManual !== null ? Math.min(totalMaxGotasFragancia, Math.max(0, gotasFraganciaManual)) : totalMaxGotasFragancia)
      : 0;

    // Gramos reales de fragancia (a razón de 20 gotas ≈ 1g / 0.05g por gota)
    const gramosFraganciaActuales = incluirFragancia
      ? Number(((gotasFraganciaActuales / 24) * totalMaxGramosFragancia).toFixed(2)) || Number((gotasFraganciaActuales * 0.0416).toFixed(2))
      : 0;

    // Gramos restantes para otros aditivos (Extractos, vitaminas, arcillas, color)
    const gramosOtrosAditivos = Math.max(0, totalGramosAditivos - gramosFraganciaActuales);

    // Valores unitarios por barra
    const glicerinaPorBarra = totalGramosGlicerina / barras;
    const aditivosPorBarra = totalGramosAditivos / barras;
    const mezclaPorBarra = totalMezclaLote / barras;

    return {
      pesoNetoUnitario,
      barras,
      factor,
      pctAditivos,
      totalNetoLote,
      totalMezclaLote,
      totalGramosAditivos,
      totalGramosGlicerina,
      glicerinaPorBarra,
      aditivosPorBarra,
      mezclaPorBarra,
      // Fragancia
      maxGotasPorBarra,
      maxGramosFraganciaPorBarra,
      totalMaxGotasFragancia,
      totalMaxGramosFragancia,
      gotasFraganciaActuales,
      gramosFraganciaActuales,
      gramosOtrosAditivos,
    };
  }, [pesoDeseado, cantidadBarras, factorMolde, porcentajeAditivos, incluirFragancia, gotasFraganciaManual]);

  const handleReset = () => {
    setPesoDeseado(100);
    setCantidadBarras(1);
    setFactorMolde(1.2);
    setPorcentajeAditivos(3.0);
    setIncluirFragancia(true);
    setGotasFraganciaManual(null);
  };

  if (!isOpen && !isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Principal con degradado botánico */}
        <div className="relative bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-900 p-5 sm:p-6 text-white overflow-hidden shrink-0">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-brand-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Botón Cerrar (Oculto en modo bloqueado) */}
          {!isLocked && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/35 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Cerrar calculadora"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0">
              <Calculator className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/30 text-emerald-200 text-[10px] font-extrabold uppercase tracking-wider">
                  Proporciones de Moldeo
                </span>
                <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">
                  Regla x1.2 • Aditivos {calculos.pctAditivos}% (3 a 6%)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                Calculadora Jabonera Jabhaco
              </h2>
            </div>
          </div>
        </div>

        {/* Cuerpo Scrolleable */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
          
          {/* 1. SECCIÓN DE INPUTS Y PARÁMETROS UNIFICADA */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
            
            {/* Fila 1: Peso Deseado y Cantidad de Barras */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Input: Peso Deseado por Barra con stepper +/- 10 */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Peso Deseado por Barra
                </label>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => ajustarPeso(-10)}
                    disabled={pesoDeseado <= 10}
                    className="w-11 h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                    title="Disminuir 10g"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={10}
                      max={2000}
                      step={10}
                      value={pesoDeseado || ''}
                      onChange={(e) => {
                        setPesoDeseado(Number(e.target.value) || 0);
                        setGotasFraganciaManual(null); // Recalcular fragancia proporcional
                      }}
                      className="w-full pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-extrabold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                      placeholder="100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                      g
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => ajustarPeso(+10)}
                    className="w-11 h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
                    title="Aumentar 10g"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Pills rápidas de pesos estándar */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Rápido:</span>
                  {PESOS_PREDETERMINADOS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPesoDeseado(p);
                        setGotasFraganciaManual(null);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        pesoDeseado === p
                          ? 'bg-brand-600 text-white shadow-xs scale-102'
                          : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {p}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Input: Cantidad de Barras */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cantidad de Barras
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCantidadBarras((prev) => Math.max(1, prev - 1))}
                    className="w-11 h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
                    title="Disminuir barra"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex-1 text-center bg-white border border-slate-300 py-2.5 rounded-xl shadow-xs flex items-center justify-center">
                    <span className="text-xl font-black text-slate-900 leading-none">
                      {cantidadBarras}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCantidadBarras((prev) => prev + 1)}
                    className="w-11 h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
                    title="Aumentar barra"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 pt-1">
                  Peso neto total del lote: <strong>{calculos.totalNetoLote}g</strong>
                </p>
              </div>

            </div>

            {/* Fila 2: Porcentaje de Aditivos dentro del mismo frame */}
            <div className="border-t border-slate-200/90 pt-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Porcentaje de Aditivos Permitido
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Rango recomendado: de <strong>3.0%</strong> a <strong>6.0%</strong> (paso ±0.1%)
                  </p>
                </div>

                {/* Stepper de Porcentaje (▲ y ▼ en 0.1) */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => ajustarPorcentaje(-0.1)}
                    disabled={porcentajeAditivos <= 3.0}
                    className="w-10 h-10 rounded-xl bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                    title="Disminuir 0.1%"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="min-w-[90px] text-center bg-white border-2 border-brand-500/30 py-1.5 px-3 rounded-xl shadow-inner">
                    <span className="text-xl font-black text-brand-700">
                      {calculos.pctAditivos.toFixed(1)}%
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => ajustarPorcentaje(+0.1)}
                    disabled={porcentajeAditivos >= 6.0}
                    className="w-10 h-10 rounded-xl bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                    title="Aumentar 0.1%"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Selector rápido de porcentajes típicos */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Valores típicos:</span>
                {PORCENTAJES_RAPIDOS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPorcentajeAditivos(pct)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      calculos.pctAditivos === pct
                        ? 'bg-amber-600 text-white shadow-xs scale-102'
                        : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80 shadow-xs'
                    }`}
                  >
                    {pct.toFixed(1)}%
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 3. TARJETAS DE RESULTADOS PRINCIPALES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Resultados Calculados con Factor 1.2
              </h3>

              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                title="Restablecer valores predeterminados (100g, 1.2, 3%)"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            </div>

            {/* Grid 2 Columnas de Resultado Principal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Tarjeta 1: Base de Glicerina */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border-2 border-emerald-300/80 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-emerald-800 mb-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    Base de Glicerina a Fundir
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                    {(100 - calculos.pctAditivos).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 my-1">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight">
                    {formatDecimal(calculos.totalGramosGlicerina, 1)}
                  </span>
                  <span className="text-base font-extrabold text-emerald-700">gramos</span>
                </div>

                <p className="text-[11px] text-emerald-800/90 leading-tight">
                  {calculos.barras > 1 ? (
                    <>Equivale a <strong>{formatDecimal(calculos.glicerinaPorBarra, 1)}g</strong> de base por cada barra.</>
                  ) : (
                    <>Glicerina resultante tras restar los <strong>{formatDecimal(calculos.totalGramosAditivos, 2)}g</strong> de aditivos.</>
                  )}
                </p>
              </div>

              {/* Tarjeta 2: Total Aditivos */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100/60 border-2 border-amber-300/80 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between text-amber-900 mb-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-amber-600" />
                    Total Aditivos ({calculos.pctAditivos}%)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950">
                    {calculos.pctAditivos}%
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 my-1">
                  <span className="text-3xl sm:text-4xl font-black text-amber-950 tracking-tight">
                    {formatDecimal(calculos.totalGramosAditivos, 2)}
                  </span>
                  <span className="text-base font-extrabold text-amber-700">gramos</span>
                </div>

                <p className="text-[11px] text-amber-900/90 leading-tight">
                  {calculos.barras > 1 ? (
                    <>Equivale a <strong>{formatDecimal(calculos.aditivosPorBarra, 2)}g</strong> de aditivos por barra.</>
                  ) : (
                    <>Calculado aplicando el {calculos.pctAditivos}% a los <strong>{formatDecimal(calculos.totalMezclaLote, 1)}g</strong> de mezcla.</>
                  )}
                </p>
              </div>

            </div>

            {/* Barra Visual de Proporciones */}
            <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5">
                <span className="flex items-center gap-1 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Base Glicerina ({(100 - calculos.pctAditivos).toFixed(1)}% = {formatDecimal(calculos.totalGramosGlicerina, 1)}g)
                </span>
                <span className="flex items-center gap-1 text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Aditivos ({calculos.pctAditivos}% = {formatDecimal(calculos.totalGramosAditivos, 2)}g)
                </span>
              </div>

              {/* Barra segmentada */}
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${100 - calculos.pctAditivos}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all duration-300"
                  style={{ width: `${calculos.pctAditivos}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                <span>Total mezcla en molde ({calculos.totalNetoLote}g × 1.2): <strong>{formatDecimal(calculos.totalMezclaLote, 1)}g</strong></span>
                <span>Factor: <strong>x{calculos.factor}</strong></span>
              </div>
            </div>
          </div>

          {/* 4. MÓDULO DE FRAGANCIA (REGLA: 100g -> MÁX 12 GOTAS / 0.5g; 50g -> 6 GOTAS) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/90 via-pink-50/50 to-purple-100/40 border-2 border-purple-200/90 space-y-3">
            
            {/* Header del bloque con switch estilo iOS/Material */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 p-3.5 rounded-xl border border-purple-200/80 shadow-xs">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                  <span>🌸 Fragancia / Esencia</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-bold">
                    Opcional
                  </span>
                </span>
                <p className="text-[11px] text-purple-800/80 mt-0.5">
                  Regla recomendada: para <strong>100g</strong> máx <strong>12 gotas (0.5g)</strong> • para <strong>50g</strong> máx <strong>6 gotas (0.25g)</strong>
                </p>
              </div>

              {/* Toggle switch visual e intuitivo */}
              <label className="inline-flex items-center gap-3 cursor-pointer select-none shrink-0 bg-white px-3.5 py-2 rounded-xl border border-purple-200 shadow-xs hover:border-purple-300 transition-all">
                <span className={`text-xs font-bold transition-colors ${
                  incluirFragancia ? 'text-purple-900' : 'text-slate-400'
                }`}>
                  {incluirFragancia ? 'Con fragancia' : 'Sin fragancia'}
                </span>
                
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={incluirFragancia}
                    onChange={(e) => setIncluirFragancia(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div>
                </div>
              </label>
            </div>

            {incluirFragancia ? (
              <div className="space-y-3 pt-1">
                {/* Cuadro destacado de recomendación de fragancia */}
                <div className="bg-white/90 p-3.5 rounded-xl border border-purple-200 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-600 block">
                      Máximo Recomendado para tu jabón ({calculos.pesoNetoUnitario}g)
                    </span>
                    <span className="text-base font-extrabold text-purple-950">
                      {calculos.maxGotasPorBarra} gotas ({formatDecimal(calculos.maxGramosFraganciaPorBarra, 2)}g) <span className="text-xs font-medium text-purple-700">por barra</span>
                    </span>
                    {calculos.barras > 1 && (
                      <span className="block text-[11px] text-purple-700 font-semibold mt-0.5">
                        Total para {calculos.barras} barras: <strong>{calculos.totalMaxGotasFragancia} gotas ({formatDecimal(calculos.totalMaxGramosFragancia, 2)}g)</strong>
                      </span>
                    )}
                  </div>

                  {/* Selector rápido de gotas */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto bg-purple-50 p-1.5 rounded-xl border border-purple-200">
                    <button
                      type="button"
                      onClick={() => setGotasFraganciaManual((prev) => Math.max(1, (prev ?? calculos.totalMaxGotasFragancia) - 1))}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 flex items-center justify-center font-bold"
                      title="Disminuir 1 gota"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <span className="px-2 font-black text-purple-950 text-sm">
                      {calculos.gotasFraganciaActuales} gotas
                    </span>

                    <button
                      type="button"
                      onClick={() => setGotasFraganciaManual((prev) => Math.min(calculos.totalMaxGotasFragancia, (prev ?? calculos.totalMaxGotasFragancia) + 1))}
                      disabled={calculos.gotasFraganciaActuales >= calculos.totalMaxGotasFragancia}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 flex items-center justify-center font-bold disabled:opacity-40"
                      title="Aumentar 1 gota"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Desglose de distribución: Fragancia vs Otros aditivos */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-purple-100/70 border border-purple-200 text-purple-950">
                    <span className="text-[10px] font-bold text-purple-800 uppercase block">Fragancia aplicada</span>
                    <span className="font-extrabold text-sm text-purple-900">
                      {calculos.gotasFraganciaActuales} gotas (~{formatDecimal(calculos.gramosFraganciaActuales, 2)}g)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-emerald-950">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Resto para otros aditivos</span>
                    <span className="font-extrabold text-sm text-emerald-900">
                      {formatDecimal(calculos.gramosOtrosAditivos, 2)}g disponibles
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white/80 rounded-xl border border-purple-200 text-xs text-slate-600 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  <strong>Jabón sin fragancia:</strong> Todo el presupuesto de <strong>{formatDecimal(calculos.totalGramosAditivos, 2)}g</strong> de aditivos ({calculos.pctAditivos}%) queda disponible para extractos botánicos, miel, avena, arcillas o aceites nutritivos.
                </span>
              </div>
            )}
          </div>

          {/* 5. EXPLICACIÓN PEDAGÓGICA PASO A PASO */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setMostrarDetallesAvanzados(!mostrarDetallesAvanzados)}
            >
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
                ¿Cómo funciona exactamente este cálculo?
              </span>
              <button type="button" className="text-brand-600 font-semibold hover:underline text-[11px]">
                {mostrarDetallesAvanzados ? 'Ocultar paso a paso' : 'Ver desglose paso a paso'}
              </button>
            </div>

            {mostrarDetallesAvanzados && (
              <div className="pt-2 border-t border-slate-200 space-y-1.5 font-mono text-[11px] text-slate-700 bg-white p-3 rounded-xl border">
                <p>
                  <strong>Paso 1:</strong> Peso deseado de barra = <code>{calculos.pesoNetoUnitario}g</code> (Lote de {calculos.barras} barra(s) = <code>{calculos.totalNetoLote}g</code>)
                </p>
                <p>
                  <strong>Paso 2:</strong> Multiplicar por factor 1.2 = <code>{calculos.totalNetoLote}g × 1.2 = {formatDecimal(calculos.totalMezclaLote, 1)}g</code>
                </p>
                <p>
                  <strong>Paso 3:</strong> Calcular el {calculos.pctAditivos}% de aditivos = <code>{formatDecimal(calculos.totalMezclaLote, 1)}g × {calculos.pctAditivos}% = {formatDecimal(calculos.totalGramosAditivos, 2)}g</code>
                </p>
                <p className="text-emerald-700 font-bold">
                  <strong>Paso 4:</strong> Restar aditivos a la mezcla total = <code>{formatDecimal(calculos.totalMezclaLote, 1)}g - {formatDecimal(calculos.totalGramosAditivos, 2)}g = {formatDecimal(calculos.totalGramosGlicerina, 1)}g de base de glicerina</code>
                </p>
                <p className="text-purple-700 font-bold pt-1 border-t border-slate-100">
                  <strong>Regla Fragancia:</strong> Para 100g → máx 12 gotas (0.5g). Para {calculos.pesoNetoUnitario}g → máx {calculos.maxGotasPorBarra} gotas ({formatDecimal(calculos.maxGramosFraganciaPorBarra, 2)}g) por barra.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Footer de Acciones */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          <button
            type="button"
            onClick={() => setIsApoyoModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-50 via-purple-50 to-amber-50 hover:from-pink-100 hover:to-amber-100 text-[#200020] border-2 border-purple-200/90 font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer group"
            title="Apoya el proyecto con Nequi o PayPal"
          >
            <span className="text-base group-hover:scale-125 transition-transform inline-block">☕</span>
            <span>Invítame un café (Nequi / PayPal)</span>
          </button>

          {!isLocked ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onIrAlLaboratorio();
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white shadow-md shadow-brand-600/25 active:scale-95 transition-all cursor-pointer"
              >
                <span>Formular & Costear</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Jabhaco Lab • Proporciones Botánicas</span>
            </div>
          )}

        </div>
      </div>

      {/* Modal de Apoyo / Nequi QR */}
      <ApoyarProyectoModal
        isOpen={isApoyoModalOpen}
        onClose={() => setIsApoyoModalOpen(false)}
      />
    </div>
  );
};
