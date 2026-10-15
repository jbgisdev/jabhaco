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
  Flame,
  Thermometer,
  Scale,
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

  // Selector de Modo: 'jabon' | 'velas'
  const [modoCalculadora, setModoCalculadora] = useState<'jabon' | 'velas'>('jabon');

  // ==========================================
  // ESTADOS MODO JABÓN
  // ==========================================
  const [pesoDeseadoJabon, setPesoDeseadoJabon] = useState<number>(100); // gramos por barra
  const [cantidadBarras, setCantidadBarras] = useState<number>(1); // número de barras
  const [factorMolde, setFactorMolde] = useState<number>(1.2); // factor 1.2
  const [porcentajeAditivos, setPorcentajeAditivos] = useState<number>(3.0); // Rango 3.0% a 6.0% con step 0.1
  const [incluirFraganciaJabon, setIncluirFraganciaJabon] = useState<boolean>(true);
  const [gotasFraganciaManual, setGotasFraganciaManual] = useState<number | null>(null);
  const [mostrarDetallesJabon, setMostrarDetallesJabon] = useState<boolean>(false);

  const PESOS_PREDETERMINADOS_JABON = [50, 80, 100, 120];
  const PORCENTAJES_RAPIDOS_JABON = [3.0, 3.5, 4.0];

  const ajustarPesoJabon = (delta: number) => {
    setPesoDeseadoJabon((prev) => {
      const base = prev || 0;
      return Math.max(10, Math.round((base + delta) / 10) * 10);
    });
    setGotasFraganciaManual(null);
  };

  const ajustarPorcentajeJabon = (delta: number) => {
    setPorcentajeAditivos((prev) => {
      const nuevo = Math.round((prev + delta) * 10) / 10;
      return Math.min(6.0, Math.max(3.0, nuevo));
    });
  };

  const calculosJabon = useMemo(() => {
    const pesoNetoUnitario = Math.max(1, pesoDeseadoJabon || 0);
    const barras = Math.max(1, cantidadBarras || 1);
    const factor = Math.max(1, factorMolde || 1.2);
    const pctAditivos = Math.min(6.0, Math.max(3.0, Math.round((porcentajeAditivos || 3.0) * 10) / 10));

    const totalNetoLote = pesoNetoUnitario * barras;
    const totalMezclaLote = totalNetoLote * factor;
    const totalGramosAditivos = totalMezclaLote * (pctAditivos / 100);
    const totalGramosGlicerina = totalMezclaLote - totalGramosAditivos;

    const maxGotasPorBarra = Math.round(pesoNetoUnitario * 0.12);
    const maxGramosFraganciaPorBarra = Number((pesoNetoUnitario * 0.005).toFixed(2));
    const totalMaxGotasFragancia = maxGotasPorBarra * barras;
    const totalMaxGramosFragancia = Number((maxGramosFraganciaPorBarra * barras).toFixed(2));

    const gotasFraganciaActuales = incluirFraganciaJabon
      ? (gotasFraganciaManual !== null ? Math.min(totalMaxGotasFragancia, Math.max(0, gotasFraganciaManual)) : totalMaxGotasFragancia)
      : 0;

    const gramosFraganciaActuales = incluirFraganciaJabon
      ? Number(((gotasFraganciaActuales / 24) * totalMaxGramosFragancia).toFixed(2)) || Number((gotasFraganciaActuales * 0.0416).toFixed(2))
      : 0;

    const gramosOtrosAditivos = Math.max(0, totalGramosAditivos - gramosFraganciaActuales);

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
      maxGotasPorBarra,
      maxGramosFraganciaPorBarra,
      totalMaxGotasFragancia,
      totalMaxGramosFragancia,
      gotasFraganciaActuales,
      gramosFraganciaActuales,
      gramosOtrosAditivos,
    };
  }, [pesoDeseadoJabon, cantidadBarras, factorMolde, porcentajeAditivos, incluirFraganciaJabon, gotasFraganciaManual]);

  // ==========================================
  // ESTADOS MODO VELAS DE SOJA (BPF vs APF)
  // ==========================================
  const [tipoCeraSoja, setTipoCeraSoja] = useState<'bpf' | 'apf'>('bpf');
  const [pesoAguaVela, setPesoAguaVela] = useState<number>(200); // gramos de agua que caben en el molde/recipiente
  const [cantidadVelas, setCantidadVelas] = useState<number>(1); // número de velas
  const [porcentajeAromaVela, setPorcentajeAromaVela] = useState<number>(9.0); // Rango 5.0% a 12.0%
  const [mostrarDetallesVelas, setMostrarDetallesVelas] = useState<boolean>(false);

  const RECIPIENTES_RAPIDOS_VELAS = [100, 150, 200, 250, 300];

  const ajustarPesoAguaVela = (delta: number) => {
    setPesoAguaVela((prev) => {
      const base = prev || 0;
      return Math.max(5, Math.round((base + delta) / 5) * 5);
    });
  };

  const ajustarPorcentajeAromaVela = (delta: number) => {
    setPorcentajeAromaVela((prev) => {
      const nuevo = Math.round((prev + delta) * 10) / 10;
      return Math.min(12.0, Math.max(4.0, nuevo));
    });
  };

  const handleCambiarTipoCera = (tipo: 'bpf' | 'apf') => {
    setTipoCeraSoja(tipo);
    if (tipo === 'apf') {
      // APF para moldes decorativos: recomendado 6% a 8%
      setPorcentajeAromaVela((prev) => (prev > 8.0 ? 7.0 : prev < 6.0 ? 6.0 : prev));
    } else {
      // BPF para vasos: recomendado 8% a 10%
      setPorcentajeAromaVela((prev) => (prev < 8.0 ? 9.0 : prev));
    }
  };

  const calculosVela = useMemo(() => {
    const aguaPorRecipiente = Math.max(10, pesoAguaVela || 0);
    const velas = Math.max(1, cantidadVelas || 1);
    const pctAroma = Math.min(12.0, Math.max(4.0, Math.round((porcentajeAromaVela || (tipoCeraSoja === 'bpf' ? 9.0 : 7.0)) * 10) / 10));

    // 1. Agua total requerida para el lote de recipientes
    const totalAguaLote = aguaPorRecipiente * velas;

    // 2. Factor densidad cera de soja = 0.90
    // La cera vegetal fundida tiene menor densidad que el agua (~0.90 g/ml) tanto en BPF como en APF
    const factorDensidad = 0.90;
    const totalCeraMezclaLote = totalAguaLote * factorDensidad; // Peso total que llenará los recipientes

    // 3. Gramos de esencia / aroma aromático según el porcentaje
    const totalGramosAroma = totalCeraMezclaLote * (pctAroma / 100);

    // 4. Gramos de Cera de Soja pura = Total Mezcla - Gramos de Aroma
    const totalGramosCeraSoja = totalCeraMezclaLote - totalGramosAroma;

    // Valores unitarios por vela
    const aguaPorVela = aguaPorRecipiente;
    const mezclaPorVela = totalCeraMezclaLote / velas;
    const ceraSojaPorVela = totalGramosCeraSoja / velas;
    const aromaPorVela = totalGramosAroma / velas;

    return {
      aguaPorVela,
      velas,
      factorDensidad,
      pctAroma,
      totalAguaLote,
      totalCeraMezclaLote,
      totalGramosAroma,
      totalGramosCeraSoja,
      mezclaPorVela,
      ceraSojaPorVela,
      aromaPorVela,
    };
  }, [pesoAguaVela, cantidadVelas, porcentajeAromaVela, tipoCeraSoja]);

  const handleReset = () => {
    if (modoCalculadora === 'jabon') {
      setPesoDeseadoJabon(100);
      setCantidadBarras(1);
      setFactorMolde(1.2);
      setPorcentajeAditivos(3.0);
      setIncluirFraganciaJabon(true);
      setGotasFraganciaManual(null);
    } else {
      setTipoCeraSoja('bpf');
      setPesoAguaVela(200);
      setCantidadVelas(1);
      setPorcentajeAromaVela(9.0);
    }
  };

  if (!isOpen && !isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Principal con degradado dinámico según modo */}
        <div className={`relative p-5 sm:p-6 text-white overflow-hidden shrink-0 transition-colors duration-300 ${
          modoCalculadora === 'jabon'
            ? 'bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-900'
            : tipoCeraSoja === 'bpf'
            ? 'bg-gradient-to-r from-amber-950 via-stone-900 to-orange-950'
            : 'bg-gradient-to-r from-stone-900 via-amber-950 to-amber-900'
        }`}>
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

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

          {/* Título de Cabecera */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0">
              {modoCalculadora === 'jabon' ? (
                <Calculator className="w-6 h-6 text-emerald-300" />
              ) : (
                <Flame className="w-6 h-6 text-amber-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${
                  modoCalculadora === 'jabon'
                    ? 'bg-emerald-500/25 border-emerald-400/30 text-emerald-200'
                    : 'bg-amber-500/25 border-amber-400/30 text-amber-200'
                }`}>
                  {modoCalculadora === 'jabon'
                    ? 'Proporciones de Moldeo'
                    : tipoCeraSoja === 'bpf'
                    ? 'Cera BPF (Vasos/Frascos)'
                    : 'Cera APF (Moldes/Figuras)'}
                </span>
                <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">
                  {modoCalculadora === 'jabon'
                    ? `Regla x1.2 • Aditivos ${calculosJabon.pctAditivos}%`
                    : `Agua x0.9 • Aroma ${calculosVela.pctAroma}%`}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                {modoCalculadora === 'jabon'
                  ? 'Calculadora Jabonera Jabhaco'
                  : `Calculadora de Velas (${tipoCeraSoja === 'bpf' ? 'Soja BPF' : 'Soja APF'})`}
              </h2>
            </div>
          </div>

          {/* Selector de Pestaña Principal: Jabones vs Velas */}
          <div className="mt-4 bg-black/25 p-1 rounded-2xl border border-white/10 grid grid-cols-2 gap-1 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setModoCalculadora('jabon')}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                modoCalculadora === 'jabon'
                  ? 'bg-white text-brand-950 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🧼 Jabones de Glicerina</span>
              <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-950">
                x1.2
              </span>
            </button>

            <button
              type="button"
              onClick={() => setModoCalculadora('velas')}
              className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                modoCalculadora === 'velas'
                  ? 'bg-white text-amber-950 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🕯️ Velas de Soja (BPF / APF)</span>
              <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-950">
                x0.9
              </span>
            </button>
          </div>
        </div>

        {/* Cuerpo Scrolleable */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
          
          {/* ============================================================ */}
          {/* MODO VELAS DE SOJA (BPF vs APF) */}
          {/* ============================================================ */}
          {modoCalculadora === 'velas' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* SELECTOR ENTRE BPF Y APF */}
              <div className="bg-gradient-to-r from-amber-50 to-stone-50 p-3 sm:p-4 rounded-2xl border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <span>Selecciona el Tipo de Cera de Soja:</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-800">
                    {tipoCeraSoja === 'bpf' ? 'Punto Fusión ~45°-50°C' : 'Punto Fusión ~58°-65°C'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Opción 1: BPF */}
                  <button
                    type="button"
                    onClick={() => handleCambiarTipoCera('bpf')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      tipoCeraSoja === 'bpf'
                        ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20'
                        : 'bg-white/70 border-slate-200 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                        <span>🏺 Cera BPF</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900">
                          Para Vasos
                        </span>
                      </span>
                      {tipoCeraSoja === 'bpf' && (
                        <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      <strong>Bajo Punto de Fusión:</strong> Blanda y cremosa. Ideal para velas en frascos, vasos o latas. Soporta <strong>8% a 10%</strong> de fragancia.
                    </p>
                  </button>

                  {/* Opción 2: APF */}
                  <button
                    type="button"
                    onClick={() => handleCambiarTipoCera('apf')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      tipoCeraSoja === 'apf'
                        ? 'bg-white border-amber-600 shadow-md ring-2 ring-amber-600/20'
                        : 'bg-white/70 border-slate-200 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                        <span>🏛️ Cera APF</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-950">
                          Para Moldes
                        </span>
                      </span>
                      {tipoCeraSoja === 'apf' && (
                        <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      <strong>Alto Punto de Fusión:</strong> Cera dura que contrae al enfriar. Ideal para moldes de silicona, figuras decorativas y wax melts. Recomendado <strong>6% a 8%</strong> de aroma.
                    </p>
                  </button>
                </div>
              </div>

              {/* 1. SECCIÓN DE INPUTS DE VELAS */}
              <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-amber-200/90 space-y-4">
                
                {/* Explicación de cabecera */}
                <div className="flex items-start gap-2.5 text-xs text-amber-950 bg-white/80 p-3 rounded-xl border border-amber-200/80">
                  <Scale className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-amber-900">
                      Pesaje de Molde en Agua (Regla x0.9):
                    </span>
                    <span>
                      Llena tu molde o vaso con agua hasta el nivel deseado de la vela y pésalo en la báscula.
                      Ese peso se multiplica por <strong>0.9</strong> (densidad cera de soja), y se descuenta el aroma.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Input 1: Peso en Agua del Recipiente/Molde */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Capacidad en Agua del {tipoCeraSoja === 'bpf' ? 'Vaso / Envase' : 'Molde / Figura'}
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => ajustarPesoAguaVela(-5)}
                        disabled={pesoAguaVela <= 5}
                        className="w-11 h-11 rounded-xl bg-white hover:bg-amber-100/60 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                        title="Disminuir 5g"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="relative flex-1">
                        <input
                          type="number"
                          min={5}
                          max={3000}
                          step={5}
                          value={pesoAguaVela || ''}
                          onChange={(e) => setPesoAguaVela(Number(e.target.value) || 0)}
                          className="w-full pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-extrabold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                          placeholder="200"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                          g
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => ajustarPesoAguaVela(+5)}
                        className="w-11 h-11 rounded-xl bg-white hover:bg-amber-100/60 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
                        title="Aumentar 5g"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Botones rápidos de recipientes */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Típicos:</span>
                      {RECIPIENTES_RAPIDOS_VELAS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPesoAguaVela(p)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            pesoAguaVela === p
                              ? 'bg-amber-700 text-white shadow-xs scale-102'
                              : 'bg-white hover:bg-amber-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {p}g
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input 2: Cantidad de Velas */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Cantidad de Velas a Fabricar
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCantidadVelas((prev) => Math.max(1, prev - 1))}
                        className="w-11 h-11 rounded-xl bg-white hover:bg-amber-100/60 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
                        title="Disminuir vela"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="flex-1 text-center bg-white border border-slate-300 py-2.5 rounded-xl shadow-xs flex items-center justify-center">
                        <span className="text-xl font-black text-slate-900 leading-none">
                          {cantidadVelas}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCantidadVelas((prev) => prev + 1)}
                        className="w-11 h-11 rounded-xl bg-white hover:bg-amber-100/60 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
                        title="Aumentar vela"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 pt-1">
                      Agua total del lote: <strong>{calculosVela.totalAguaLote}g</strong> (Capacidad combinada)
                    </p>
                  </div>

                </div>

                {/* Fila 2: Porcentaje de Aroma (Adaptado según BPF o APF) */}
                <div className="border-t border-amber-200/90 pt-3.5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Porcentaje de Esencia Aromática ({tipoCeraSoja === 'bpf' ? 'Cera BPF' : 'Cera APF'})
                      </label>
                      <p className="text-[11px] text-slate-500">
                        {tipoCeraSoja === 'bpf' ? (
                          <>Recomendado para vasos: <strong>8.0% a 10.0%</strong></>
                        ) : (
                          <>Recomendado para moldes/figuras: <strong>6.0% a 8.0%</strong> (máx 10% en wax melts)</>
                        )}
                      </p>
                    </div>

                    {/* Stepper de Porcentaje de Aroma */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => ajustarPorcentajeAromaVela(-0.5)}
                        disabled={porcentajeAromaVela <= 4.0}
                        className="w-10 h-10 rounded-xl bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                        title="Disminuir 0.5%"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="min-w-[90px] text-center bg-white border-2 border-amber-500/50 py-1.5 px-3 rounded-xl shadow-inner">
                        <span className="text-xl font-black text-amber-800">
                          {calculosVela.pctAroma.toFixed(1)}%
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => ajustarPorcentajeAromaVela(+0.5)}
                        disabled={porcentajeAromaVela >= 12.0}
                        className="w-10 h-10 rounded-xl bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                        title="Aumentar 0.5%"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Pills rápidas de porcentaje según tipo de cera */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-amber-200/60">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Rápido:</span>
                    {tipoCeraSoja === 'bpf' ? (
                      [8.0, 9.0, 10.0].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setPorcentajeAromaVela(pct)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            calculosVela.pctAroma === pct
                              ? 'bg-amber-800 text-white shadow-xs scale-102'
                              : 'bg-white hover:bg-amber-100 text-amber-950 border border-amber-200'
                          }`}
                        >
                          {pct.toFixed(1)}% {pct === 8 ? '(Suave)' : pct === 9 ? '(Ideal Vaso)' : '(Intenso)'}
                        </button>
                      ))
                    ) : (
                      [6.0, 7.0, 8.0, 10.0].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setPorcentajeAromaVela(pct)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            calculosVela.pctAroma === pct
                              ? 'bg-amber-800 text-white shadow-xs scale-102'
                              : 'bg-white hover:bg-amber-100 text-amber-950 border border-amber-200'
                          }`}
                        >
                          {pct.toFixed(1)}% {pct === 6 ? '(Económico)' : pct === 7 ? '(Ideal Figura)' : pct === 8 ? '(Máx Molde)' : '(Wax Melts)'}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Advertencia técnica para cera APF */}
                  {tipoCeraSoja === 'apf' && calculosVela.pctAroma > 8.0 && (
                    <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-[11px] text-amber-900 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        <strong>Atención para velas en molde:</strong> Con más del 8% de aroma, las figuras decorativas pueden sudar aceite en la superficie o perder dureza al desmoldar. Mantén entre 6% y 8% a menos que estés fabricando *wax melts* (pastillas para quemador).
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* 2. TARJETAS DE RESULTADOS PRINCIPALES DE VELAS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Pesos Exactos de Cera & Aroma (Densidad 0.9)
                  </h3>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restablecer</span>
                  </button>
                </div>

                {/* 2 Columnas: Cera de Soja vs Aroma */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Tarjeta 1: Cera de Soja Pura */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/70 border-2 border-amber-400/80 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between text-amber-900 mb-1">
                      <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-600" />
                        Cera de Soja ({tipoCeraSoja.toUpperCase()}) a Pesar y Fundir
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-950">
                        {(100 - calculosVela.pctAroma).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 my-1">
                      <span className="text-3xl sm:text-4xl font-black text-amber-950 tracking-tight">
                        {formatDecimal(calculosVela.totalGramosCeraSoja, 1)}
                      </span>
                      <span className="text-base font-extrabold text-amber-700">gramos</span>
                    </div>

                    <p className="text-[11px] text-amber-900/90 leading-tight">
                      {calculosVela.velas > 1 ? (
                        <>Equivale a <strong>{formatDecimal(calculosVela.ceraSojaPorVela, 1)}g</strong> de cera por cada vela.</>
                      ) : (
                        <>Cera pura tras descontar los <strong>{formatDecimal(calculosVela.totalGramosAroma, 1)}g</strong> de esencia.</>
                      )}
                    </p>
                  </div>

                  {/* Tarjeta 2: Esencia Aromática */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100/60 border-2 border-purple-300/80 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between text-purple-950 mb-1">
                      <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-purple-600" />
                        Esencia Aromática ({calculosVela.pctAroma}%)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-950">
                        {calculosVela.pctAroma}%
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 my-1">
                      <span className="text-3xl sm:text-4xl font-black text-purple-950 tracking-tight">
                        {formatDecimal(calculosVela.totalGramosAroma, 1)}
                      </span>
                      <span className="text-base font-extrabold text-purple-700">gramos</span>
                    </div>

                    <p className="text-[11px] text-purple-900/90 leading-tight">
                      {calculosVela.velas > 1 ? (
                        <>Equivale a <strong>{formatDecimal(calculosVela.aromaPorVela, 1)}g</strong> de esencia por cada vela.</>
                      ) : (
                        <>Proporción óptima calculada para <strong>{formatDecimal(calculosVela.totalCeraMezclaLote, 1)}g</strong> de vela terminada.</>
                      )}
                    </p>
                  </div>

                </div>

                {/* Barra Visual de Proporciones de Vela */}
                <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1 text-amber-900">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      Cera Soja {tipoCeraSoja.toUpperCase()} ({(100 - calculosVela.pctAroma).toFixed(1)}% = {formatDecimal(calculosVela.totalGramosCeraSoja, 1)}g)
                    </span>
                    <span className="flex items-center gap-1 text-purple-900">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                      Aroma ({calculosVela.pctAroma}% = {formatDecimal(calculosVela.totalGramosAroma, 1)}g)
                    </span>
                  </div>

                  {/* Barra segmentada */}
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-300"
                      style={{ width: `${100 - calculosVela.pctAroma}%` }}
                    />
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                      style={{ width: `${calculosVela.pctAroma}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                    <span>Peso total vertido ({calculosVela.totalAguaLote}g agua × 0.9): <strong>{formatDecimal(calculosVela.totalCeraMezclaLote, 1)}g</strong></span>
                    <span>Densidad cera: <strong>0.90 g/ml</strong></span>
                  </div>
                </div>
              </div>

              {/* 3. GUÍA DE TEMPERATURAS ADAPTADA SEGÚN BPF O APF */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-50 via-amber-50/40 to-stone-100/70 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-amber-700" />
                    Temperaturas Clave de Taller ({tipoCeraSoja === 'bpf' ? 'Cera Soja BPF para Vasos' : 'Cera Soja APF para Moldes'})
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                    {tipoCeraSoja === 'bpf' ? 'PF ~45°-50°C' : 'PF ~58°-65°C'}
                  </span>
                </div>

                {tipoCeraSoja === 'bpf' ? (
                  /* Temperaturas para BPF */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-amber-200/80 shadow-xs">
                      <span className="text-[10px] font-bold text-amber-700 uppercase block">1. Fundir Cera</span>
                      <span className="text-base font-black text-slate-900 block">70°C – 75°C</span>
                      <span className="text-[10px] text-slate-500">Baño maría suave sin sobrecalentar</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-purple-200/80 shadow-xs">
                      <span className="text-[10px] font-bold text-purple-700 uppercase block">2. Agregar Aroma</span>
                      <span className="text-base font-black text-slate-900 block">60°C – 65°C</span>
                      <span className="text-[10px] text-slate-500">Revolver despacio durante 2 minutos</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-emerald-200/80 shadow-xs">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">3. Verter al Vaso</span>
                      <span className="text-base font-black text-slate-900 block">50°C – 55°C</span>
                      <span className="text-[10px] text-slate-500">Vaso templado para evitar túnel y desprendimiento</span>
                    </div>
                  </div>
                ) : (
                  /* Temperaturas para APF (MOLDES/FIGURAS) */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-amber-200/80 shadow-xs">
                      <span className="text-[10px] font-bold text-amber-700 uppercase block">1. Fundir Cera APF</span>
                      <span className="text-base font-black text-slate-900 block">75°C – 80°C</span>
                      <span className="text-[10px] text-slate-500">Punto más alto para disolver cristales duros</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-purple-200/80 shadow-xs">
                      <span className="text-[10px] font-bold text-purple-700 uppercase block">2. Agregar Aroma</span>
                      <span className="text-base font-black text-slate-900 block">65°C – 70°C</span>
                      <span className="text-[10px] text-slate-500">Mezclar suavemente durante 2 minutos</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-emerald-200/80 shadow-xs">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">3. Verter al Molde</span>
                      <span className="text-base font-black text-slate-900 block">60°C – 65°C</span>
                      <span className="text-[10px] text-slate-500">Evita líneas frías y marcas en las figuras</span>
                    </div>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-white/70 border border-amber-200/60 text-[11px] text-slate-600 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>
                    {tipoCeraSoja === 'bpf' ? (
                      <><strong>Tip BPF:</strong> Deja reposar la vela mínimo <strong>48 horas</strong> a temperatura ambiente antes de encender (ideal 7 a 14 días para mayor intensidad aromática).</>
                    ) : (
                      <><strong>Tip APF:</strong> Deja enfriar el molde mínimo <strong>6 a 12 horas</strong> a temperatura ambiente. Desmolda solo cuando la figura esté completamente fría y contraída naturalmente.</>
                    )}
                  </span>
                </div>
              </div>

              {/* 4. RECOMENDACIONES Y BUENAS PRÁCTICAS DEL ARTESANO CERERO */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-100/50 border-2 border-amber-300/80 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-2">
                    <span className="text-base">✨</span>
                    <span>Recomendaciones del Artesano Cerero (Buenas Prácticas)</span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                    Tips Pro
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  
                  {/* Tip 1: Precalentar molde o recipiente */}
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-200/80 shadow-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                      <span className="text-sm">🔥</span>
                      <span>1. Precalentar el molde o recipiente</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Pasa una pistola de calor o secador suave por el vaso o molde antes de verter. 
                      Evita el choque térmico, previene manchas húmedas (<em>wet spots</em> donde la cera se despega del cristal) y elimina marcas de estrías en moldes de silicona.
                    </p>
                  </div>

                  {/* Tip 2: Elección y centrado del pabilo */}
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-200/80 shadow-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                      <span className="text-sm">🕯️</span>
                      <span>2. Pabilo indicado y bien centrado</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      El calibre del pabilo debe coincidir con el diámetro de la vela (ej: 5–6 cm = pabilo mediano; &gt;7.5 cm = pabilo grueso o doble mecha).
                      Fija el ojalillo al fondo y usa siempre un sujetapabilos para mantenerlo tenso y recto en el centro exacto.
                    </p>
                  </div>

                  {/* Tip 3: Vertido lento y sin turbulencias */}
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-200/80 shadow-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                      <span className="text-sm">🍯</span>
                      <span>3. Vertido lento y continuo</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Vierte la mezcla a la temperatura recomendada de forma lenta y con pulso constante, dejando caer el hilo de cera cerca del borde.
                      Así evitas atrapar burbujas de aire que generen huecos o cráteres internos.
                    </p>
                  </div>

                  {/* Tip 4: Enfriamiento estable y corte de mecha */}
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-200/80 shadow-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                      <span className="text-sm">✂️</span>
                      <span>4. Enfriamiento lento y corte de mecha</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Deja enfriar sobre una superficie nivelada y sin corrientes de aire frío o ventiladores.
                      Antes del primer encendido, recorta siempre el pabilo a <strong>5 mm o 6 mm</strong> para una llama limpia y sin humo negro (hollín).
                    </p>
                  </div>

                </div>
              </div>

              {/* 5. DESGLOSE PASO A PASO */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setMostrarDetallesVelas(!mostrarDetallesVelas)}
                >
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                    ¿Cómo funciona exactamente la fórmula para cera {tipoCeraSoja.toUpperCase()}?
                  </span>
                  <button type="button" className="text-amber-800 font-semibold hover:underline text-[11px]">
                    {mostrarDetallesVelas ? 'Ocultar paso a paso' : 'Ver desglose paso a paso'}
                  </button>
                </div>

                {mostrarDetallesVelas && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5 font-mono text-[11px] text-slate-700 bg-white p-3 rounded-xl border">
                    <p>
                      <strong>Paso 1 (Capacidad en Agua):</strong> El molde o envase contiene <code>{calculosVela.aguaPorVela}g de agua</code> ({calculosVela.velas} vela(s) = <code>{calculosVela.totalAguaLote}g</code>).
                    </p>
                    <p>
                      <strong>Paso 2 (Multiplicar por 0.9):</strong> Densidad soja {tipoCeraSoja.toUpperCase()} = <code>{calculosVela.totalAguaLote}g × 0.9 = {formatDecimal(calculosVela.totalCeraMezclaLote, 1)}g de vela total</code>.
                    </p>
                    <p>
                      <strong>Paso 3 (Calcular el {calculosVela.pctAroma}% de Aroma):</strong> <code>{formatDecimal(calculosVela.totalCeraMezclaLote, 1)}g × {calculosVela.pctAroma}% = {formatDecimal(calculosVela.totalGramosAroma, 1)}g de fragancia</code>.
                    </p>
                    <p className="text-amber-800 font-bold">
                      <strong>Paso 4 (Cera de Soja pura a fundir):</strong> <code>{formatDecimal(calculosVela.totalCeraMezclaLote, 1)}g - {formatDecimal(calculosVela.totalGramosAroma, 1)}g = {formatDecimal(calculosVela.totalGramosCeraSoja, 1)}g de cera {tipoCeraSoja.toUpperCase()}</code>.
                    </p>
                    <p className="text-emerald-800 font-bold pt-1 border-t border-slate-100">
                      <strong>Comprobación:</strong> {formatDecimal(calculosVela.totalGramosCeraSoja, 1)}g cera + {formatDecimal(calculosVela.totalGramosAroma, 1)}g aroma = <code>{formatDecimal(calculosVela.totalCeraMezclaLote, 1)}g</code> (llena el molde con precisión milimétrica).
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* MODO JABÓN ARTESANAL (ORIGINAL PRESERVADO) */}
          {/* ============================================================ */}
          {modoCalculadora === 'jabon' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* 1. SECCIÓN DE INPUTS Y PARÁMETROS */}
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
                        onClick={() => ajustarPesoJabon(-10)}
                        disabled={pesoDeseadoJabon <= 10}
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
                          value={pesoDeseadoJabon || ''}
                          onChange={(e) => {
                            setPesoDeseadoJabon(Number(e.target.value) || 0);
                            setGotasFraganciaManual(null);
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
                        onClick={() => ajustarPesoJabon(+10)}
                        className="w-11 h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
                        title="Aumentar 10g"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Pills rápidas de pesos estándar */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Rápido:</span>
                      {PESOS_PREDETERMINADOS_JABON.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setPesoDeseadoJabon(p);
                            setGotasFraganciaManual(null);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            pesoDeseadoJabon === p
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
                      Peso neto total del lote: <strong>{calculosJabon.totalNetoLote}g</strong>
                    </p>
                  </div>

                </div>

                {/* Fila 2: Porcentaje de Aditivos */}
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

                    {/* Stepper de Porcentaje */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => ajustarPorcentajeJabon(-0.1)}
                        disabled={porcentajeAditivos <= 3.0}
                        className="w-10 h-10 rounded-xl bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center justify-center font-bold active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                        title="Disminuir 0.1%"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="min-w-[90px] text-center bg-white border-2 border-brand-500/30 py-1.5 px-3 rounded-xl shadow-inner">
                        <span className="text-xl font-black text-brand-700">
                          {calculosJabon.pctAditivos.toFixed(1)}%
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => ajustarPorcentajeJabon(+0.1)}
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
                    {PORCENTAJES_RAPIDOS_JABON.map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setPorcentajeAditivos(pct)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          calculosJabon.pctAditivos === pct
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

              {/* 2. TARJETAS DE RESULTADOS PRINCIPALES DE JABÓN */}
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
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restablecer</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Base de Glicerina */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border-2 border-emerald-300/80 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between text-emerald-800 mb-1">
                      <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                        <FlaskConical className="w-4 h-4 text-emerald-600" />
                        Base de Glicerina a Fundir
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                        {(100 - calculosJabon.pctAditivos).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 my-1">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight">
                        {formatDecimal(calculosJabon.totalGramosGlicerina, 1)}
                      </span>
                      <span className="text-base font-extrabold text-emerald-700">gramos</span>
                    </div>

                    <p className="text-[11px] text-emerald-800/90 leading-tight">
                      {calculosJabon.barras > 1 ? (
                        <>Equivale a <strong>{formatDecimal(calculosJabon.glicerinaPorBarra, 1)}g</strong> de base por cada barra.</>
                      ) : (
                        <>Glicerina resultante tras restar los <strong>{formatDecimal(calculosJabon.totalGramosAditivos, 2)}g</strong> de aditivos.</>
                      )}
                    </p>
                  </div>

                  {/* Total Aditivos */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100/60 border-2 border-amber-300/80 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between text-amber-900 mb-1">
                      <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-amber-600" />
                        Total Aditivos ({calculosJabon.pctAditivos}%)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950">
                        {calculosJabon.pctAditivos}%
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 my-1">
                      <span className="text-3xl sm:text-4xl font-black text-amber-950 tracking-tight">
                        {formatDecimal(calculosJabon.totalGramosAditivos, 2)}
                      </span>
                      <span className="text-base font-extrabold text-amber-700">gramos</span>
                    </div>

                    <p className="text-[11px] text-amber-900/90 leading-tight">
                      {calculosJabon.barras > 1 ? (
                        <>Equivale a <strong>{formatDecimal(calculosJabon.aditivosPorBarra, 2)}g</strong> de aditivos por barra.</>
                      ) : (
                        <>Calculado aplicando el {calculosJabon.pctAditivos}% a los <strong>{formatDecimal(calculosJabon.totalMezclaLote, 1)}g</strong> de mezcla.</>
                      )}
                    </p>
                  </div>

                </div>

                {/* Barra Visual de Proporciones */}
                <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1 text-emerald-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      Base Glicerina ({(100 - calculosJabon.pctAditivos).toFixed(1)}% = {formatDecimal(calculosJabon.totalGramosGlicerina, 1)}g)
                    </span>
                    <span className="flex items-center gap-1 text-amber-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      Aditivos ({calculosJabon.pctAditivos}% = {formatDecimal(calculosJabon.totalGramosAditivos, 2)}g)
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                      style={{ width: `${100 - calculosJabon.pctAditivos}%` }}
                    />
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all duration-300"
                      style={{ width: `${calculosJabon.pctAditivos}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                    <span>Total mezcla en molde ({calculosJabon.totalNetoLote}g × 1.2): <strong>{formatDecimal(calculosJabon.totalMezclaLote, 1)}g</strong></span>
                    <span>Factor: <strong>x{calculosJabon.factor}</strong></span>
                  </div>
                </div>
              </div>

              {/* 3. MÓDULO DE FRAGANCIA PARA JABÓN */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/90 via-pink-50/50 to-purple-100/40 border-2 border-purple-200/90 space-y-3">
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

                  <label className="inline-flex items-center gap-3 cursor-pointer select-none shrink-0 bg-white px-3.5 py-2 rounded-xl border border-purple-200 shadow-xs hover:border-purple-300 transition-all">
                    <span className={`text-xs font-bold transition-colors ${
                      incluirFraganciaJabon ? 'text-purple-900' : 'text-slate-400'
                    }`}>
                      {incluirFraganciaJabon ? 'Con fragancia' : 'Sin fragancia'}
                    </span>
                    
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={incluirFraganciaJabon}
                        onChange={(e) => setIncluirFraganciaJabon(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 shadow-inner"></div>
                    </div>
                  </label>
                </div>

                {incluirFraganciaJabon ? (
                  <div className="space-y-3 pt-1">
                    <div className="bg-white/90 p-3.5 rounded-xl border border-purple-200 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-purple-600 block">
                          Máximo Recomendado para tu jabón ({calculosJabon.pesoNetoUnitario}g)
                        </span>
                        <span className="text-base font-extrabold text-purple-950">
                          {calculosJabon.maxGotasPorBarra} gotas ({formatDecimal(calculosJabon.maxGramosFraganciaPorBarra, 2)}g) <span className="text-xs font-medium text-purple-700">por barra</span>
                        </span>
                        {calculosJabon.barras > 1 && (
                          <span className="block text-[11px] text-purple-700 font-semibold mt-0.5">
                            Total para {calculosJabon.barras} barras: <strong>{calculosJabon.totalMaxGotasFragancia} gotas ({formatDecimal(calculosJabon.totalMaxGramosFragancia, 2)}g)</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-auto bg-purple-50 p-1.5 rounded-xl border border-purple-200">
                        <button
                          type="button"
                          onClick={() => setGotasFraganciaManual((prev) => Math.max(1, (prev ?? calculosJabon.totalMaxGotasFragancia) - 1))}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 flex items-center justify-center font-bold"
                          title="Disminuir 1 gota"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="px-2 font-black text-purple-950 text-sm">
                          {calculosJabon.gotasFraganciaActuales} gotas
                        </span>

                        <button
                          type="button"
                          onClick={() => setGotasFraganciaManual((prev) => Math.min(calculosJabon.totalMaxGotasFragancia, (prev ?? calculosJabon.totalMaxGotasFragancia) + 1))}
                          disabled={calculosJabon.gotasFraganciaActuales >= calculosJabon.totalMaxGotasFragancia}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 flex items-center justify-center font-bold disabled:opacity-40"
                          title="Aumentar 1 gota"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-purple-100/70 border border-purple-200 text-purple-950">
                        <span className="text-[10px] font-bold text-purple-800 uppercase block">Fragancia aplicada</span>
                        <span className="font-extrabold text-sm text-purple-900">
                          {calculosJabon.gotasFraganciaActuales} gotas (~{formatDecimal(calculosJabon.gramosFraganciaActuales, 2)}g)
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-emerald-950">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">Resto para otros aditivos</span>
                        <span className="font-extrabold text-sm text-emerald-900">
                          {formatDecimal(calculosJabon.gramosOtrosAditivos, 2)}g disponibles
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white/80 rounded-xl border border-purple-200 text-xs text-slate-600 flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>
                      <strong>Jabón sin fragancia:</strong> Todo el presupuesto de <strong>{formatDecimal(calculosJabon.totalGramosAditivos, 2)}g</strong> de aditivos ({calculosJabon.pctAditivos}%) queda disponible para extractos botánicos, miel, avena, arcillas o aceites nutritivos.
                    </span>
                  </div>
                )}
              </div>

              {/* 4. EXPLICACIÓN PASO A PASO JABÓN */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setMostrarDetallesJabon(!mostrarDetallesJabon)}
                >
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
                    ¿Cómo funciona exactamente este cálculo?
                  </span>
                  <button type="button" className="text-brand-600 font-semibold hover:underline text-[11px]">
                    {mostrarDetallesJabon ? 'Ocultar paso a paso' : 'Ver desglose paso a paso'}
                  </button>
                </div>

                {mostrarDetallesJabon && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5 font-mono text-[11px] text-slate-700 bg-white p-3 rounded-xl border">
                    <p>
                      <strong>Paso 1:</strong> Peso deseado de barra = <code>{calculosJabon.pesoNetoUnitario}g</code> (Lote de {calculosJabon.barras} barra(s) = <code>{calculosJabon.totalNetoLote}g</code>)
                    </p>
                    <p>
                      <strong>Paso 2:</strong> Multiplicar por factor 1.2 = <code>{calculosJabon.totalNetoLote}g × 1.2 = {formatDecimal(calculosJabon.totalMezclaLote, 1)}g</code>
                    </p>
                    <p>
                      <strong>Paso 3:</strong> Calcular el {calculosJabon.pctAditivos}% de aditivos = <code>{formatDecimal(calculosJabon.totalMezclaLote, 1)}g × {calculosJabon.pctAditivos}% = {formatDecimal(calculosJabon.totalGramosAditivos, 2)}g</code>
                    </p>
                    <p className="text-emerald-700 font-bold">
                      <strong>Paso 4:</strong> Restar aditivos a la mezcla total = <code>{formatDecimal(calculosJabon.totalMezclaLote, 1)}g - {formatDecimal(calculosJabon.totalGramosAditivos, 2)}g = {formatDecimal(calculosJabon.totalGramosGlicerina, 1)}g de base de glicerina</code>
                    </p>
                    <p className="text-purple-700 font-bold pt-1 border-t border-slate-100">
                      <strong>Regla Fragancia:</strong> Para 100g → máx 12 gotas (0.5g). Para {calculosJabon.pesoNetoUnitario}g → máx {calculosJabon.maxGotasPorBarra} gotas ({formatDecimal(calculosJabon.maxGramosFraganciaPorBarra, 2)}g) por barra.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

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
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer ${
                  modoCalculadora === 'jabon'
                    ? 'bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 shadow-brand-600/25'
                    : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/25'
                }`}
              >
                <span>Formular & Costear</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className={`w-2 h-2 rounded-full inline-block ${
                modoCalculadora === 'jabon' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
              <span>Jabhaco Lab • {modoCalculadora === 'jabon' ? 'Proporciones Jaboneras' : 'Formulación de Velas de Soja'}</span>
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

