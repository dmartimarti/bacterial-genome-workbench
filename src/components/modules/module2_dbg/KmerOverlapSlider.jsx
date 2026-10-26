import React from 'react';

export default function KmerOverlapSlider({
  sequence,
  kSize,
  kmerList,
  stepIdx,
  setStepIdx,
  activeKmer
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Interactive Sliding Window: How k-mers Share a (k−1 = {kSize - 1} bp) Overlap
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any nucleotide or use the navigation buttons to see how each <strong className="text-slate-900 dark:text-white">{kSize}-mer</strong> edge connects its <span className="text-cyan-600 dark:text-cyan-300">Left ({kSize - 1}-mer) Node</span> to its <span className="text-purple-600 dark:text-purple-300">Right ({kSize - 1}-mer) Node</span>:
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
            disabled={stepIdx <= 0}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 border disabled:opacity-40 disabled:cursor-not-allowed text-xs transition"
          >
            ← Prev
          </button>
          <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
            k-mer #{activeKmer.index + 1} of {kmerList.length}
          </span>
          <button
            onClick={() => setStepIdx(Math.min(kmerList.length - 1, stepIdx + 1))}
            disabled={stepIdx >= kmerList.length - 1}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 border disabled:opacity-40 disabled:cursor-not-allowed text-xs transition"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Nucleotide sequence row with sliding window highlight */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col space-y-2 min-w-full">
          <div className="flex items-center gap-1">
            <span className="w-24 text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">Reference:</span>
            {sequence.split('').map((base, idx) => {
              const inCurrentWindow = idx >= activeKmer.index && idx < activeKmer.index + kSize;
              const isRepeatBase = (idx >= 3 && idx <= 6) || (idx >= 9 && idx <= 12);
              return (
                <button
                  key={idx}
                  onClick={() => setStepIdx(Math.min(kmerList.length - 1, idx))}
                  className={`w-7 h-7 rounded flex items-center justify-center font-mono text-xs font-bold transition border ${
                    inCurrentWindow
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500/30 dark:border-emerald-400 dark:text-white scale-105 shadow z-10'
                      : isRepeatBase
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300'
                      : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                  }`}
                  title={`Position ${idx + 1}: ${base} ${isRepeatBase ? '(Repeat copy)' : ''}`}
                >
                  {base}
                </button>
              );
            })}
          </div>

          {/* Active k-mer prefix -> suffix breakdown */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 font-mono">
              Current {kSize}-mer Edge:{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">{activeKmer.kmer}</strong>
            </div>
            <span className="text-slate-500 dark:text-slate-400">splits into →</span>
            <div className="bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/40 px-3 py-1.5 rounded-lg font-mono text-cyan-800 dark:text-cyan-200">
              Left Node ({kSize - 1}-mer Prefix): <strong>{activeKmer.prefix}</strong>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">──({activeKmer.kmer})──►</span>
            <div className="bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-500/40 px-3 py-1.5 rounded-lg font-mono text-purple-800 dark:text-purple-200">
              Right Node ({kSize - 1}-mer Suffix): <strong>{activeKmer.suffix}</strong>
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              (Notice that the <span className="text-purple-600 dark:text-purple-300 font-semibold">Right Node</span> of k-mer #{activeKmer.index + 1} is the exact <span className="text-cyan-600 dark:text-cyan-300 font-semibold">Left Node</span> of k-mer #{activeKmer.index + 2}!)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
