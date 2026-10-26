import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function MisassemblyDiagram() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 transition-colors">
      <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        Anatomy of a Misassembly: Why Chimeric Contigs Ruin Downstream Biology
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
          <p>
            A <strong className="text-slate-900 dark:text-white">misassembly (chimera)</strong> happens when an assembler encounters a multi-copy repeat (like <code className="text-amber-700 dark:text-amber-300 font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">rRNA Copy #1</code> and <code className="text-amber-700 dark:text-amber-300 font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">rRNA Copy #2</code> located 1 Mb apart) and blindly guesses the wrong exit path out of the repeat node.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
            <li>
              <strong className="text-rose-600 dark:text-rose-300">False Chromosomal Rearrangements:</strong> Creates fake inversions or translocations that appear as evolutionary mutations in synteny plots (Mauve/MUMmer).
            </li>
            <li>
              <strong className="text-rose-600 dark:text-rose-300">Broken Operons &amp; Split Gene Clusters:</strong> Artificially stitches an antimicrobial resistance gene next to a housekeeping operon or splits a 40 kb secondary metabolite BGC in half.
            </li>
            <li>
              <strong className="text-emerald-600 dark:text-emerald-300">Why SPAdes --careful is superior:</strong> It is always safer to produce <strong>54 honest contigs</strong> that stop cleanly at repeat boundaries than <strong>16 chimeric contigs</strong> that mislead experimental biologists!
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <svg viewBox="0 0 420 125" className="w-full h-auto select-none">
            {/* TRUE CHROMOSOME ORDER */}
            <text x="10" y="18" fill="#059669" fontSize="10" fontWeight="bold" fontFamily="monospace">
              TRUE CHROMOSOME ORDER:
            </text>
            <rect x="10" y="24" width="95" height="22" rx="4" fill="#059669" />
            <text x="24" y="39" fill="#ffffff" fontSize="10" fontFamily="monospace">Region A</text>

            <rect x="110" y="24" width="65" height="22" rx="4" fill="#d97706" />
            <text x="120" y="39" fill="#ffffff" fontSize="10" fontFamily="monospace">rRNA #1</text>

            <rect x="180" y="24" width="95" height="22" rx="4" fill="#0284c7" />
            <text x="196" y="39" fill="#ffffff" fontSize="10" fontFamily="monospace">Region B</text>

            <rect x="280" y="24" width="65" height="22" rx="4" fill="#d97706" />
            <text x="290" y="39" fill="#ffffff" fontSize="10" fontFamily="monospace">rRNA #2</text>

            <rect x="350" y="24" width="60" height="22" rx="4" fill="#7c3aed" />
            <text x="356" y="39" fill="#ffffff" fontSize="10" fontFamily="monospace">Region C</text>

            {/* ASSEMBLY C (CHIMERIC MISASSEMBLY) */}
            <text x="10" y="74" fill="#e11d48" fontSize="10" fontWeight="bold" fontFamily="monospace">
              ASSEMBLY C (CHIMERIC MISASSEMBLY across rRNA):
            </text>
            <rect x="10" y="80" width="95" height="24" rx="4" fill="#059669" stroke="#e11d48" strokeWidth="1.5" />
            <text x="24" y="96" fill="#ffffff" fontSize="10" fontFamily="monospace">Region A</text>

            <rect x="110" y="80" width="65" height="24" rx="4" fill="#d97706" stroke="#e11d48" strokeWidth="1.5" />
            <text x="120" y="96" fill="#ffffff" fontSize="10" fontFamily="monospace">rRNA</text>

            <rect x="180" y="80" width="60" height="24" rx="4" fill="#7c3aed" stroke="#e11d48" strokeWidth="1.5" />
            <text x="186" y="96" fill="#ffffff" fontSize="10" fontFamily="monospace">Region C</text>

            {/* Error indicator bracket */}
            <path d="M 175 80 L 175 68 L 245 68 L 245 80" fill="none" stroke="#e11d48" strokeWidth="2" strokeDasharray="3,3" />
            <text x="182" y="64" fill="#e11d48" fontSize="9" fontWeight="bold">
              Skipped Region B (Chimera!)
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
