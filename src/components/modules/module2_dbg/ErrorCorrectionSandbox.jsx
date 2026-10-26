import React from 'react';
import { Sparkles, Code } from 'lucide-react';

export default function ErrorCorrectionSandbox({
  kSize,
  handleSelectK,
  hasError,
  handleToggleError,
  cleaned,
  setCleaned,
  showGFA,
  setShowGFA
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. k-mer size selector */}
      <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 transition-colors">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          1. Choose k-mer Size (Repeat = 4 bp)
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { k: 3, label: 'k = 3', sub: 'Collapses' },
            { k: 5, label: 'k = 5', sub: 'Resolves!' },
            { k: 9, label: 'k = 9', sub: 'Breaks' }
          ].map((item) => (
            <button
              key={item.k}
              onClick={() => handleSelectK(item.k)}
              className={`p-2 rounded-lg border text-center transition ${
                kSize === item.k
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:border-emerald-500 dark:text-white font-semibold shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="font-mono text-sm">{item.label}</div>
              <div className="text-[10px] opacity-80">{item.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Error Injection */}
      <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2 transition-colors">
        <div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            2. Sequencing Error Simulation
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            A single basecall error creates <code className="text-rose-500 dark:text-rose-400 font-mono">k</code> false k-mers that branch off as a <span className="text-rose-500 font-semibold">Bubble</span> or <span className="text-amber-500 font-semibold">Tip</span>.
          </p>
        </div>
        <button
          onClick={handleToggleError}
          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition border ${
            hasError
              ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700'
          }`}
        >
          {hasError ? 'Remove Simulated Errors' : '+ Inject Read with SNP & 3\' Error'}
        </button>
      </div>

      {/* 3. Graph Simplification */}
      <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2 transition-colors">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            3. Graph Simplification (SPAdes)
          </div>
          <button
            onClick={() => setShowGFA(!showGFA)}
            className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            title="Inspect GFA format text"
          >
            <Code className="w-3 h-3" />
            {showGFA ? 'Hide GFA' : 'View .gfa'}
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          SPAdes checks k-mer coverage depth: true genomic paths have <span className="text-emerald-600 dark:text-emerald-400 font-mono">30x depth</span> while error branches have <span className="text-rose-500 dark:text-rose-400 font-mono">1x depth</span>.
        </p>
        <button
          disabled={!hasError || cleaned}
          onClick={() => setCleaned(true)}
          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
            !hasError
              ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800 cursor-not-allowed'
              : cleaned
              ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {cleaned ? 'Tips Clipped & Bubbles Popped!' : 'Clip 1x Tips & Pop Error Bubbles'}
        </button>
      </div>
    </div>
  );
}
