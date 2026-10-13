import React, { useState, useEffect, useRef } from 'react';
import { formatThousands, parseThousands } from '../../utils/formatters';

interface ThousandsInputProps {
  id?: string;
  name?: string;
  value: number;
  onChange: (value: number) => void;
  allowDecimals?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export const ThousandsInput: React.FC<ThousandsInputProps> = ({
  id,
  name,
  value,
  onChange,
  allowDecimals = false,
  prefix,
  suffix,
  placeholder = '0',
  min = 0,
  max,
  className = '',
  inputClassName = '',
  autoFocus = false,
  disabled = false,
  required = false,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    return value ? formatThousands(value, allowDecimals) : '';
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar si cambia el valor numérico externamente (ej: reset de form o valor inicial)
  useEffect(() => {
    const currentParsed = parseThousands(displayValue);
    if (value !== currentParsed) {
      setDisplayValue(value ? formatThousands(value, allowDecimals) : '');
    }
  }, [value, allowDecimals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const raw = input.value;
    const selStart = input.selectionStart || 0;

    // Contar cuántos dígitos había antes del cursor antes de formatear
    const digitsBefore = raw.slice(0, selStart).replace(/\D/g, '').length;

    // Si está vacío
    if (raw.trim() === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // Formatear con separador de miles
    const formatted = formatThousands(raw, allowDecimals);
    setDisplayValue(formatted);

    const numValue = parseThousands(formatted);
    onChange(numValue);

    // Ajustar posición del cursor tras insertar o remover los puntos de miles
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      let newCursor = 0;
      let counted = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          counted++;
        }
        if (counted === digitsBefore) {
          newCursor = i + 1;
          break;
        }
      }
      if (counted < digitsBefore) {
        newCursor = formatted.length;
      }
      inputRef.current.setSelectionRange(newCursor, newCursor);
    });
  };

  const handleBlur = () => {
    const num = parseThousands(displayValue);
    let clamped = num;
    if (min !== undefined && clamped < min) clamped = min;
    if (max !== undefined && clamped > max) clamped = max;
    setDisplayValue(clamped ? formatThousands(clamped, allowDecimals) : '');
    onChange(clamped);
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {prefix && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          {prefix}
        </div>
      )}
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        inputMode={allowDecimals ? 'decimal' : 'numeric'}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        disabled={disabled}
        required={required}
        className={`w-full ${prefix ? 'pl-9' : 'pl-3.5'} ${
          suffix ? 'pr-9' : 'pr-3.5'
        } py-2.5 bg-slate-50/50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 focus:bg-white transition-all ${inputClassName}`}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">
          {suffix}
        </div>
      )}
    </div>
  );
};
