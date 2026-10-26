import React, { useState, useMemo } from 'react';
import { BarChart3, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { generateKmerSpectrum } from '../../../utils/kmerUtils';

export default function KmerSpectrumViewer() {
  const [meanDepth, setMeanDepth] = useState(30);
  const [errorLevel, setErrorLevel] = useState(2.0);

  const spectrumData = useMemo(() => {
    return generateKmerSpectrum(meanDepth, errorLevel);
  }, [meanDepth, errorLevel]);

  // Compute estimated genome size from spectrum
  const estGenomeSize = useMemo(() => {
    const totalKmers = spectrumData.reduce((acc, p) => acc + p.depth * p.count * 1500, 0);
    const est = Math.round(totalKmers / meanDepth);
    return (est / 1000000).toFixed(2);
  }, [spectrumData, meanDepth]);

  // Find maximum point for SVG scaling
  const maxCount = Math.max(...spectrumData.map((d) => d.count), 100);

  const peakX = 40 + meanDepth * 7.5;
  const cutoffX = 85;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 transition-colors shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            k-mer Depth Frequency Spectrum (Jellyfish / KMC Diagnostic)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            How bioinformaticians distinguish optical noise from real biological sequences, filter erroneous k-mers, and estimate genome size prior to assembly.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="text-xs">
            <span className="text-slate-500 dark:text-slate-400">Target Sequencing Depth: </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{meanDepth}x</span>
          </div>
          <input
            type="range"
            min="15"
            max="50"
            step="5"
            value={meanDepth}
            onChange={(e) => setMeanDepth(Number(e.target.value))}
            className="w-24 accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* SVG Spectrum Curve with Non-Overlapping Demarcations */}
      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <svg viewBox="0 0 650 220" className="w-full h-auto select-none">
          {/* Background Zones */}
          {/* 1. Error Zone */}
          <rect x="40" y="30" width="45" height="150" fill="#f43f5e" opacity="0.12" rx="4" />

          {/* 1x Error Peak Flag Badge (Top-left, y=22) */}
          <rect x="42" y="10" width="70" height="18" rx="4" fill="#ffe4e6" stroke="#f43f5e" strokeWidth="1" />
          <text x="47" y="23" fill="#be123c" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
            1x Error Peak
          </text>

          {/* 2. Valley Cutoff Line (x=85) */}
          <line x1={cutoffX} y1="30" x2={cutoffX} y2="180" stroke="#f59e0b" strokeDasharray="4,3" strokeWidth="2" />
          
          {/* k-mer Cutoff Badge - Positioned cleanly at y=55 to prevent ANY overlap */}
          <rect x={cutoffX + 5} y="48" width="130" height="20" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
          <text x={cutoffX + 10} y="62" fill="#92400e" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
            k-mer Cutoff (Filter ≤3x)
          </text>
          <line x1={cutoffX} y1="58" x2={cutoffX + 5} y2="58" stroke="#f59e0b" strokeWidth="1.5" />

          {/* 3. Main Peak Guide & Badge */}
          <line
            x1={peakX}
            y1="30"
            x2={peakX}
            y2="180"
            stroke="#10b981"
            strokeDasharray="3,3"
            strokeWidth="1.5"
          />
          <rect x={peakX - 55} y="10" width="110" height="18" rx="4" fill="#d1fae5" stroke="#10b981" strokeWidth="1" />
          <text
            x={peakX - 50}
            y="23"
            fill="#065f46"
            fontSize="8.5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {meanDepth}x Genomic Peak
          </text>

          {/* Axes */}
          <line x1="40" y1="180" x2="620" y2="180" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="40" y1="30" x2="40" y2="180" stroke="#94a3b8" strokeWidth="1.5" />

          <text x="6" y="35" fill="#64748b" fontSize="8.5" fontFamily="monospace" fontWeight="bold">Count</text>
          <text x="560" y="198" fill="#64748b" fontSize="8.5" fontFamily="monospace" fontWeight="bold">k-mer Depth</text>

          {/* Spectrum Path */}
          <path
            d={`M 40 ${180 - (spectrumData[0].count / maxCount) * 140} ` +
              spectrumData.map((pt) => `L ${40 + pt.depth * 7.5} ${180 - (pt.count / maxCount) * 140}`).join(' ')}
            fill="none"
            stroke="#0284c7"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* X-axis tick labels */}
          <text x="40" y="196" fill="#64748b" fontSize="8.5" fontFamily="monospace">1x</text>
          <text x="115" y="196" fill="#64748b" fontSize="8.5" fontFamily="monospace">10x</text>
          <text x="190" y="196" fill="#64748b" fontSize="8.5" fontFamily="monospace">20x</text>
          <text x="265" y="196" fill="#64748b" fontSize="8.5" fontFamily="monospace">30x</text>
          <text x="340" y="196" fill="#64748b" fontSize="8.5" fontFamily="monospace">40x</text>
          <text x="415" y="196" fill="#64748b" fontSize="8.5" fontFamily="monospace">50x</text>
          <text x="490" y="196" fill="#64748b" fontSize="8.5" fontFamily="monospace">60x</text>
        </svg>
      </div>

      {/* Didactic Formulation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>How to Interpret the 3 Spectrum Zones:</span>
          </div>
          <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
              <span>
                <strong className="text-rose-600 dark:text-rose-400 font-semibold">1x–2x Error Peak:</strong> Optical errors and adapter fragments creating thousands of low-frequency false k-mers that bloat the De Bruijn graph.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
              <span>
                <strong className="text-amber-600 dark:text-amber-400 font-semibold">The Valley Cutoff:</strong> The minimum dip between error noise and true biological depth—used by SPAdes as the cutoff threshold to discard erroneous k-mers!
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{meanDepth}x Genomic Peak:</strong> Genuine single-copy bacterial genome sequence content.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Pre-Assembly Genome Size Estimation:</span>
          </div>
          <div className="font-mono text-emerald-600 dark:text-emerald-400 text-base font-bold">
            Estimated Genome Size: ~{estGenomeSize} Mb
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Formula: <code className="text-cyan-700 dark:text-cyan-300 font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">G = Total k-mers / Peak Depth</code>. Allows estimating whether sequencing was sufficient or identifying contamination (e.g., dual peaks) before wasting days running heavy assembly algorithms!
          </div>
        </div>
      </div>
    </div>
  );
}
