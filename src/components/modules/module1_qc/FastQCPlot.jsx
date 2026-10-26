import React from 'react';

export default function FastQCPlot({ trimmed, errorRate }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-3 transition-colors shadow-sm">
      <div>
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center justify-between">
          <span>FastQC: Per-Base Phred Score</span>
          <span className={`text-xs px-2 py-0.5 rounded font-mono ${
            trimmed ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
          }`}>
            {trimmed ? 'PASS (fastp Trimmed)' : 'WARN: 3\' Quality Drop'}
          </span>
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Illumina quality degrades toward the 3&apos; end (cycles 120–150) due to phasing and fluorophore decay.
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
        <svg viewBox="0 0 260 165" className="w-full h-auto select-none">
          {/* Background Phred Quality Zones */}
          <rect x="30" y="10" width="220" height="75" fill="#10b981" opacity="0.12" />
          <rect x="30" y="85" width="220" height="35" fill="#f59e0b" opacity="0.12" />
          <rect x="30" y="120" width="220" height="25" fill="#f43f5e" opacity="0.15" />

          {/* Y-axis labels */}
          <text x="6" y="22" fill="#059669" fontSize="9" fontFamily="monospace" fontWeight="bold">Q40</text>
          <text x="6" y="85" fill="#d97706" fontSize="9" fontFamily="monospace" fontWeight="bold">Q28</text>
          <text x="6" y="122" fill="#e11d48" fontSize="9" fontFamily="monospace" fontWeight="bold">Q20</text>
          <text x="6" y="143" fill="#64748b" fontSize="9" fontFamily="monospace">Q10</text>

          {/* Q20 threshold line */}
          <line x1="30" y1="120" x2="250" y2="120" stroke="#f43f5e" strokeDasharray="3,3" strokeWidth="1" />

          {/* Dynamic Quality Curve */}
          <path
            d={
              trimmed
                ? 'M 35 28 Q 120 26, 175 40 L 215 68'
                : `M 35 28 Q 120 30, 165 55 T 245 ${Math.min(142, 98 + errorRate * 10)}`
            }
            fill="none"
            stroke={trimmed ? '#10b981' : '#f43f5e'}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* X-axis labels */}
          <text x="32" y="158" fill="#64748b" fontSize="9" fontFamily="monospace">1 bp</text>
          <text x="115" y="158" fill="#64748b" fontSize="9" fontFamily="monospace">75 bp</text>
          <text x="205" y="158" fill="#64748b" fontSize="9" fontFamily="monospace">{trimmed ? '130 bp' : '150 bp'}</text>
        </svg>
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
        <div>
          <strong className="text-amber-600 dark:text-amber-300">Yellow Dots:</strong> Random internal SNPs (Q&lt;20 basecalls). At ≥30x depth, high-quality reads easily outvote them!
        </div>
        <div>
          <strong className="text-rose-600 dark:text-rose-300">Red Tails:</strong> Systematic 3&apos; quality drop &amp; adapter read-through—must be trimmed with <code className="text-cyan-700 dark:text-cyan-300">fastp</code>.
        </div>
      </div>
    </div>
  );
}
