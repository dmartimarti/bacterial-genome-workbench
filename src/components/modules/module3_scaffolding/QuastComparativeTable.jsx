import React from 'react';

export default function QuastComparativeTable({
  assemblies,
  selectedAssembly,
  setSelectedAssembly
}) {
  const currentAsm = assemblies[selectedAssembly];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            QUAST Assembly Evaluation: Why Highest N50 Can Be a Chimeric Trap
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare contiguity (<code className="text-emerald-700 dark:text-emerald-300 font-mono">N50</code>) against structural correctness (<code className="text-rose-700 dark:text-rose-300 font-mono">Misassemblies</code>):
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.values(assemblies).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedAssembly(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                selectedAssembly === tab.id
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-600 dark:border-emerald-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.name.split(':')[0]} ({tab.tag})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between">
          <span>{currentAsm.name}</span>
          <span className="text-xs px-2.5 py-0.5 rounded font-mono bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            Total Size: {currentAsm.totalLen} | GC: {currentAsm.gc}
          </span>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">N50 Length</div>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{currentAsm.n50}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">L50: {currentAsm.l50} contigs</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400"># of Contigs</div>
            <div className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">{currentAsm.contigs}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Largest: {currentAsm.largestContig}</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Misassemblies</div>
            <div className={`text-lg font-bold font-mono mt-0.5 ${
              currentAsm.misassemblies > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {currentAsm.misassemblies}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {currentAsm.misassemblies > 0 ? 'Chimeric joins!' : 'Clean synteny'}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">BUSCO Completeness</div>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{currentAsm.busco}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Single-copy orthologs</div>
          </div>
        </div>

        {/* Biological Interpretation */}
        <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
          selectedAssembly === 'optimal'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/50 text-emerald-900 dark:text-emerald-200'
            : selectedAssembly === 'chimeric'
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700/50 text-rose-900 dark:text-rose-200'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-200'
        }`}>
          <strong>QC Verdict:</strong> {currentAsm.verdict}
        </div>
      </div>
    </div>
  );
}
