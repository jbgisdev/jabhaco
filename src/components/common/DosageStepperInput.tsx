import React, { useRef, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface DosageStepperInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  unidad?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  dosisUsuales?: number[];
  autoFocus?: boolean;
  className?: string;
}

export const DosageStepperInput: React.FC<DosageStepperInputProps> = ({
  id,
  value,
  onChange,
  min = 0.1,
  max = 30,
  step = 0.1,
  unidad = 'ml',
  icon,
  placeholder = '5.0',
  disabled = false,
  dosisUsuales,
  autoFocus = false,
  className = '',
}) => {
  const holdTimerRef = useRef<number | null>(null);
  const intervalTimerRef = useRef<number | null>(null);

  // Helper para parsear números manejando coma o punto
  const parseNum = useCallback(
    (val: string): number => {
      const clean = val.replace(',', '.').trim();
      const num = parseFloat(clean);
      return isNaN(num) ? min : num;
    },
    [min]
  );

  // Formatear a 1 decimal sin ceros innecesarios (ej: 5 o 5.5)
  const formatNum = (num: number): string => {
    const rounded = Math.round(num * 10) / 10;
    return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
  };

  const currentNum = parseNum(value);

  // Incremento seguro clamped a max
  const handleIncrement = useCallback(() => {
    const current = parseNum(value);
    const next = Math.min(max, Math.round((current + step) * 10) / 10);
    onChange(formatNum(next));
  }, [value, max, step, parseNum, onChange]);

  // Decremento seguro clamped a min
  const handleDecrement = useCallback(() => {
    const current = parseNum(value);
    const next = Math.max(min, Math.round((current - step) * 10) / 10);
    onChange(formatNum(next));
  }, [value, min, step, parseNum, onChange]);

  // Soporte para mantener presionado (Long press)
  const stopHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
  };

  const startHold = (action: () => void) => {
    if (disabled) return;
    action();
    holdTimerRef.current = setTimeout(() => {
      intervalTimerRef.current = setInterval(() => {
        action();
      }, 75);
    }, 350);
  };

  useEffect(() => {
    return () => stopHold();
  }, []);

  // Manejo de teclado con soporte para comas
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Permitir que el usuario escriba coma y convertirla internamente a punto
    const sanitized = raw.replace(',', '.');
    // Permitir dígitos y un punto decimal
    if (sanitized === '' || /^\d*\.?\d*$/.test(sanitized)) {
      onChange(sanitized);
    }
  };

  const handleBlur = () => {
    if (value === '' || isNaN(parseFloat(value))) {
      onChange(formatNum(min));
      return;
    }
    const num = parseFloat(value);
    const clamped = Math.min(max, Math.max(min, num));
    onChange(formatNum(clamped));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  const isMin = currentNum <= min;
  const isMax = currentNum >= max;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Caja Principal del Input con Flechitas (Spinner Táctil) */}
      <div className="relative flex items-stretch bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-300 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all shadow-xs overflow-hidden">
        {/* Ícono a la izquierda */}
        {icon && (
          <div className="pl-3.5 pr-1 flex items-center justify-center text-brand-600 pointer-events-none shrink-0">
            {icon}
          </div>
        )}

        {/* Input Numérico con soporte para decimales y teclado móvil */}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          disabled={disabled}
          className="w-full pl-2.5 pr-2 py-3 bg-transparent text-lg sm:text-xl font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none tracking-tight select-all"
        />

        {/* Etiqueta de la Unidad (ml o g) */}
        {unidad && (
          <div className="flex items-center px-2 shrink-0">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              {unidad}
            </span>
          </div>
        )}

        {/* Botones de Flechitas (Componente Spinner Superior / Inferior) */}
        <div className="flex flex-col border-l border-slate-200 bg-slate-50/80 divide-y divide-slate-200 shrink-0 select-none">
          {/* Flechita Arriba (Aumentar en 0.1) */}
          <button
            type="button"
            onPointerDown={() => startHold(handleIncrement)}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            disabled={disabled || isMax}
            className={`w-12 sm:w-14 h-6 sm:h-6.5 flex items-center justify-center transition-all ${
              isMax || disabled
                ? 'opacity-30 cursor-not-allowed text-slate-300 bg-slate-100'
                : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50/80 active:bg-brand-100 active:scale-95 cursor-pointer'
            }`}
            title={`Aumentar 0.1 ${unidad} (Máximo ${max})`}
            aria-label="Aumentar cantidad en 0.1"
          >
            <ChevronUp className="w-4 h-4 stroke-[2.75]" />
          </button>

          {/* Flechita Abajo (Disminuir en 0.1) */}
          <button
            type="button"
            onPointerDown={() => startHold(handleDecrement)}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            disabled={disabled || isMin}
            className={`w-12 sm:w-14 h-6 sm:h-6.5 flex items-center justify-center transition-all ${
              isMin || disabled
                ? 'opacity-30 cursor-not-allowed text-slate-300 bg-slate-100'
                : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50/80 active:bg-brand-100 active:scale-95 cursor-pointer'
            }`}
            title={`Disminuir 0.1 ${unidad} (Mínimo ${min})`}
            aria-label="Disminuir cantidad en 0.1"
          >
            <ChevronDown className="w-4 h-4 stroke-[2.75]" />
          </button>
        </div>
      </div>

      {/* Rango Permitido y Botones de Dosis Usuales */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
        <div className="text-[11px] font-medium text-slate-400">
          Rango permitido: <span className="font-bold text-slate-600">{min}</span> a{' '}
          <span className="font-bold text-slate-600">{max} {unidad}</span>{' '}
          <span className="text-[10px] text-brand-600 font-semibold">(paso de ±0.1)</span>
        </div>

        {/* Píldoras de dosis frecuentes */}
        {dosisUsuales && dosisUsuales.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Dosis usuales:</span>
            {dosisUsuales.map((val) => {
              const isSelected = Math.abs(currentNum - val) < 0.05;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange(formatNum(val))}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  {val}{unidad}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
