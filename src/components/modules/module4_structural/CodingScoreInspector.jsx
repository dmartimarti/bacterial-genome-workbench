import React from 'react';

export default function CodingScoreInspector({ activeOrf }) {
  if (!activeOrf) return null;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center transition-colors">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
            activeOrf.isTrueGene ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
          }`}>
            {activeOrf.isTrueGene ? 'TRUE BACTERIAL CDS' : 'FALSE POSITIVE ORF'}
          </span>
          <span className="text-slate-900 dark:text-white font-semibold text-sm">{activeOrf.name}</span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Frame {activeOrf.frame} | Length: {activeOrf.lengthBp} bp | Start: {activeOrf.startCodon} → Stop: {activeOrf.stopCodon}
        </div>
        <div className="text-[11px] text-amber-700 dark:text-amber-300 font-mono font-medium">
          Filter Verdict: {activeOrf.rejectedBy}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400">Shine-Dalgarno RBS:</div>
          <div className="font-mono text-amber-600 dark:text-amber-300 font-bold mt-0.5">{activeOrf.rbsMotif}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400">Hexamer Coding Score:</div>
          <div className="font-mono text-cyan-600 dark:text-cyan-300 font-bold mt-0.5">{activeOrf.gcCodingScore}</div>
        </div>
      </div>

      <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
        {activeOrf.explanation}
      </div>
    </div>
  );
}
