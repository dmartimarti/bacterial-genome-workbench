import React from 'react';

const BASE_COLORS = {
  A: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30',
  C: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-500/30',
  G: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/30',
  T: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/30',
};

export default function SequenceViewer({
  sequence,
  highlightRange = null,
  highlightColor = 'bg-emerald-500/30 border-emerald-500 text-emerald-900 dark:text-white',
  onBaseClick = null,
  showRuler = true
}) {
  return (
    <div className="overflow-x-auto bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
      {showRuler && (
        <div className="flex items-center gap-1 mb-1 font-mono text-[10px] text-slate-500 dark:text-slate-400 select-none">
          <span className="w-16 shrink-0">POS</span>
          {sequence.split('').map((_, idx) => (
            <div key={idx} className="w-7 text-center">
              {(idx + 1) % 5 === 0 || idx === 0 ? idx + 1 : '·'}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 font-mono">
        <span className="w-16 text-xs text-slate-500 dark:text-slate-400 shrink-0 select-none">5&apos; → 3&apos;</span>
        {sequence.split('').map((base, idx) => {
          const isHighlighted =
            highlightRange &&
            idx >= highlightRange.start &&
            idx < highlightRange.end;

          const defaultColor = BASE_COLORS[base.toUpperCase()] || 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800';

          return (
            <button
              key={idx}
              onClick={() => onBaseClick && onBaseClick(idx)}
              className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition border ${
                isHighlighted
                  ? `${highlightColor} scale-105 shadow z-10 font-black`
                  : defaultColor
              }`}
            >
              {base}
            </button>
          );
        })}
      </div>
    </div>
  );
}
