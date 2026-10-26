import React from 'react';

export default function ParameterSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  statusLabel = '',
  statusColor = 'text-emerald-400',
  accentColor = 'accent-emerald-500',
  minLabel,
  maxLabel,
  midLabel,
  onChange,
  helpText
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-700 dark:text-slate-300 font-medium">{label}</span>
        <span className={`font-mono font-bold ${statusColor}`}>
          {value}{unit} {statusLabel && `(${statusLabel})`}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${accentColor} cursor-pointer`}
      />

      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{minLabel || `${min}${unit}`}</span>
        {midLabel && <span>{midLabel}</span>}
        <span>{maxLabel || `${max}${unit}`}</span>
      </div>

      {helpText && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{helpText}</p>}
    </div>
  );
}
