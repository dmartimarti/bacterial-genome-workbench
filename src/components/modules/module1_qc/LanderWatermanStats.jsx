import React from 'react';

export default function LanderWatermanStats({
  zeroBins,
  lowDepthBins,
  effectiveCoverage,
  estContigs,
  trimmed
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-colors shadow-sm">
      <div>
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Predicted Assembly Impact (Lander-Waterman)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Notice how <strong className="text-slate-800 dark:text-slate-200">low coverage (4x–14x)</strong> creates stochastic <span className="text-rose-600 dark:text-rose-400 font-semibold">0x dropout gaps</span> that physically divide contigs:
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">0x Coverage Gaps</div>
          <div className={`text-2xl font-bold font-mono mt-0.5 ${zeroBins > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {zeroBins}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {lowDepthBins > 0 ? `+ ${lowDepthBins}% fragile (<3x)` : 'All bases ≥3x covered'}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">Est. Total Contigs</div>
          <div className={`text-2xl font-bold font-mono mt-0.5 ${
            estContigs > 90 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            ~{estContigs}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">across 4.6 Mb genome</div>
        </div>
      </div>

      <div className="text-xs p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">Usable Error-Free Depth:</span>
          <span className="font-mono text-slate-900 dark:text-white font-bold">{effectiveCoverage}x</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">3&apos; False k-mer Status:</span>
          <span className={`font-mono font-bold ${trimmed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trimmed ? 'Removed by fastp (Clean)' : 'Poisoning Graph!'}
          </span>
        </div>
      </div>
    </div>
  );
}
