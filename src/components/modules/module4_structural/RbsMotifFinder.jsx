import React from 'react';
import { BookOpen } from 'lucide-react';

export default function RbsMotifFinder() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs transition-colors">
      <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
        <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Prokaryotic Ribosome Binding Site (Shine-Dalgarno) Mechanics</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 dark:text-slate-300 leading-relaxed">
        <div>
          <p>
            In bacteria, translation initiation requires the 30S ribosomal subunit to bind mRNA via base-pairing between the <strong className="text-amber-600 dark:text-amber-300">Shine-Dalgarno sequence (AGGAGG)</strong> and the 16S rRNA 3&apos; end (<code className="text-cyan-700 dark:text-cyan-300 font-mono">3&apos;-UCCUCC-5&apos;</code>).
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Optimal spacing is strictly 5 to 10 nucleotides upstream of the start codon.
          </p>
        </div>
        <div>
          <p>
            <strong className="text-emerald-700 dark:text-emerald-300">Start Codon Plasticity:</strong> While ~83% of E. coli genes start with <code className="text-slate-900 dark:text-white font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">ATG</code>, ~14% use <code className="text-cyan-700 dark:text-cyan-300 font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">GTG</code> (like <em>gyrB</em>) and ~3% use <code className="text-purple-700 dark:text-purple-300 font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">TTG</code>!
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Crucially, regardless of codon, all bacterial initiator tRNAs load <strong className="text-slate-900 dark:text-white">N-formylmethionine (fMet)</strong> at the start position.
          </p>
        </div>
      </div>
    </div>
  );
}
