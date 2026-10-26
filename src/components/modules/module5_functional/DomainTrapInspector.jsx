import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DomainTrapInspector() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 transition-colors shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        Pedagogical Deep Dive: The &ldquo;Domain Trap&rdquo; in Microbial Annotation
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        <div className="space-y-2">
          <p>
            When annotating genomes, novice bioinformaticians often sort BLAST or Diamond alignments strictly by <strong className="text-slate-900 dark:text-white">Percent Identity</strong> or <strong className="text-slate-900 dark:text-white">E-value</strong>.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            In <strong>CDS_002</strong>, Hit A (<code className="text-cyan-700 dark:text-cyan-300 font-mono bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">PcrA DNA helicase</code>) displays an extraordinary <strong className="text-rose-600 dark:text-rose-400">96.0% identity</strong> with an E-value of <strong className="text-rose-600 dark:text-rose-400">1e-42</strong>! However, the alignment only extends across 60 amino acids (<strong className="text-rose-600 dark:text-rose-400">16% query coverage</strong>).
          </p>
        </div>

        <div className="space-y-2">
          <p>
            The reason? Both DNA helicases and ABC transporters share a deeply conserved <strong className="text-amber-700 dark:text-amber-300">P-loop NTPase / Walker-A fold</strong> for binding ATP.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            By contrast, Hit B (<code className="text-emerald-700 dark:text-emerald-300 font-mono bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">YkpA ABC transporter</code>) has lower identity (<strong className="text-emerald-600 dark:text-emerald-400">58.4%</strong>), but spans <strong className="text-emerald-600 dark:text-emerald-400">97% full-length query coverage</strong>! It is the true physiological ortholog.
          </p>
        </div>
      </div>
    </div>
  );
}
