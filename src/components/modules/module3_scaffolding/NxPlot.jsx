import React from 'react';

export default function NxPlot({ currentAsm, selectedAssembly }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Contig Size Distribution (Longest → Shortest)</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">50% Genome Mark (N50)</span>
      </div>

      {/* Bar Chart Representation */}
      <div className="relative h-28 flex items-end gap-1.5 pt-6 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute left-1/2 top-0 bottom-0 border-l-2 border-dashed border-emerald-500 z-10 flex items-start">
          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono px-1.5 py-0.5 rounded ml-1 border border-emerald-300 dark:border-emerald-800/60 font-semibold shadow-xs">
            50% of 4.6 Mb
          </span>
        </div>

        {currentAsm.bars.map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%`, width: `${100 / currentAsm.bars.length}%` }}
            className={`rounded-t transition-all ${
              selectedAssembly === 'chimeric' && i < 2
                ? 'bg-rose-500 border border-rose-600 dark:border-rose-400'
                : 'bg-cyan-500 border border-cyan-600 dark:border-cyan-400'
            }`}
            title={`Contig ${i + 1} (${h}% relative length)`}
          />
        ))}
      </div>

      <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
        <p>
          <strong className="text-slate-800 dark:text-slate-200">What is N50?</strong> If you order contigs from longest to shortest, <strong>N50</strong> is the length of the shortest contig in the set that together covers 50% of the entire genome.
        </p>
        <p>
          <strong className="text-slate-800 dark:text-slate-200">What is L50?</strong> The minimum <em>count</em> of contigs needed to reach that 50% genome threshold (lower is generally more contiguous).
        </p>
      </div>
    </div>
  );
}
