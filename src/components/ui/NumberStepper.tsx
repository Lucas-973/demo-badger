import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  required?: boolean;
  disabled?: boolean;
}

export function NumberStepper({ id, label, value, onChange, min, max, required = false, disabled = false }: NumberStepperProps) {
  const number = Number(value);
  const hasValue = value.trim() !== '' && Number.isFinite(number);
  const adjust = (direction: number) => {
    const next = hasValue ? Math.trunc(number) + direction : min;
    onChange(String(Math.min(max, Math.max(min, next))));
  };
  const buttonClass = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#005FB8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005FB8] disabled:cursor-not-allowed disabled:bg-transparent disabled:text-slate-300';

  return (
    <div className={`flex h-[42px] w-full items-center gap-1 rounded-lg border border-slate-200 p-1 transition focus-within:border-[#005FB8] focus-within:ring-2 focus-within:ring-blue-100 ${disabled ? 'bg-slate-50' : 'bg-white'}`}>
      <button type="button" aria-label={`Decrease ${label}`} disabled={disabled || (hasValue && number <= min)} onClick={() => adjust(-1)} className={buttonClass}>
        <Minus aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
      <input
        id={id}
        aria-label={label}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        required={required}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full w-full min-w-0 bg-transparent text-center text-sm font-semibold tabular-nums text-slate-900 outline-none disabled:text-slate-400 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button type="button" aria-label={`Increase ${label}`} disabled={disabled || (hasValue && number >= max)} onClick={() => adjust(1)} className={buttonClass}>
        <Plus aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
