import React, { useState } from 'react';
import { Layers, GitMerge, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Network } from 'lucide-react';

const KMER_LEVELS = {
  k21: {
    k: 21,
    label: 'Small k (k=21)',
    badge: 'High Sensitivity / Repeat Collapse',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    n50: '18,400 bp',
    contigs: 412,
    repeatBranches: '38 unresolvable knots',
    coverageDropouts: 0,
    description: 'Small k has maximum sensitivity! It effortlessly connects low-coverage regions (even 4x depth). However, any repeated sequence longer than 21 bp (such as IS elements and transposons) causes the graph to collapse into tangled multi-way forks.',
    pros: 'Zero coverage gaps; bridges fragile 2x–5x coverage regions.',
    cons: 'Massive repeat tangles; cannot assemble across transposons or rRNA operons.'
  },
  k33: {
    k: 33,
    label: 'Intermediate k (k=33)',
    badge: 'Standard Compromise',
    badgeColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    n50: '68,200 bp',
    contigs: 148,
    repeatBranches: '16 unresolved knots',
    coverageDropouts: 2,
    description: 'A balanced middle ground. Resolves short micro-satellites and insertion sequences, but still gets blocked at 500 bp repeat elements and suffers occasional drops at coverage valleys.',
    pros: 'Significantly fewer repeat tangles than k=21.',
    cons: 'Still fails at 16S/23S ribosomal operons (1.5–5 kb).'
  },
  k55: {
    k: 55,
    label: 'Large k (k=55)',
    badge: 'High Specificity / Coverage Fractures',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    n50: '42,100 bp',
    contigs: 280,
    repeatBranches: '3 unresolved knots',
    coverageDropouts: 19,
    description: 'Large k is ultra-specific: repeats shorter than 55 bp are completely disentangled into linear paths. However, because reads must share a 55-bp error-free overlap, any sequencing error or dip in sequencing depth causes the graph to shatter into disconnected contigs!',
    pros: 'Untangles repeats up to 54 bp effortlessly; linear contig paths.',
    cons: 'Severely fractures at low-coverage bins; cannot tolerate sequencing errors.'
  },
  multiK: {
    k: '21,33,55',
    label: 'SPAdes Multi-k Merge (k=21, 33, 55)',
    badge: 'Optimal Algorithmic Synergy',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    n50: '142,500 bp',
    contigs: 54,
    repeatBranches: '0 (Resolved via path jumping)',
    coverageDropouts: 0,
    description: 'The SPAdes breakthrough: constructs graphs iteratively starting at small k (k=21 to capture all low-depth bridges), maps paired-end read paths onto larger k graphs (k=33, 55), using large k to untangle repeat knots while preserving small k bridges!',
    pros: 'Combines small k coverage resilience with large k repeat resolution.',
    cons: 'Higher computational memory and CPU runtime during graph merging.'
  }
};

export default function MultiKmerExplorer() {
  const [selectedK, setSelectedK] = useState('multiK');
  const activeData = KMER_LEVELS[selectedK];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 transition-colors shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Iterative Multi-k De Bruijn Graph Merging (SPAdes Architecture)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Discover why a single k-mer size is always a flawed compromise, and how iterative multi-k merging resolves both coverage gaps and genomic repeats.
          </p>
        </div>

        <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          Algorithmic Deep Dive
        </span>
      </div>

      {/* Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {Object.entries(KMER_LEVELS).map(([key, data]) => {
          const isSelected = selectedK === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedK(key)}
              className={`p-3 rounded-xl border text-left transition ${
                isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">{data.label.split(' ')[0]} {data.label.split(' ')[1]}</span>
                {key === 'multiK' && <Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1 truncate">
                N50: {data.n50}
              </div>
              <div className={`mt-2 text-[10px] px-1.5 py-0.5 rounded border inline-block ${data.badgeColor}`}>
                {data.badge.split('/')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Graph Simulation HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Left: Interactive Graph Topology Diagram */}
        <div className="lg:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono text-emerald-400">Graph Topology: {activeData.label}</span>
            <span className="text-[11px] font-mono">Repeats: {activeData.repeatBranches}</span>
          </div>

          {/* SVG Diagram of Graph State */}
          <div className="h-44 flex items-center justify-center p-2">
            {selectedK === 'k21' && (
              <svg viewBox="0 0 400 120" className="w-full h-full select-none">
                {/* Tangled knot */}
                <path d="M 20 60 L 100 60" stroke="#10b981" strokeWidth="3" />
                <circle cx="100" cy="60" r="6" fill="#10b981" />
                
                {/* Tangled loop 1 */}
                <path d="M 100 60 C 140 10, 200 10, 240 60" stroke="#f59e0b" strokeWidth="3" fill="none" strokeDasharray="3,3" />
                {/* Tangled loop 2 */}
                <path d="M 100 60 C 140 110, 200 110, 240 60" stroke="#f59e0b" strokeWidth="3" fill="none" strokeDasharray="3,3" />
                {/* Self cycle */}
                <circle cx="170" cy="60" r="18" stroke="#f43f5e" strokeWidth="2.5" fill="none" />
                
                <circle cx="240" cy="60" r="6" fill="#10b981" />
                <path d="M 240 60 L 380 60" stroke="#10b981" strokeWidth="3" />
                
                <text x="170" y="35" fill="#f59e0b" fontSize="10" textAnchor="middle" fontFamily="monospace">Repeat Tangle (IS Element)</text>
                <text x="170" y="98" fill="#f43f5e" fontSize="9" textAnchor="middle" fontFamily="monospace">Ambiguous Eulerian Paths</text>
              </svg>
            )}

            {selectedK === 'k33' && (
              <svg viewBox="0 0 400 120" className="w-full h-full select-none">
                <path d="M 20 60 L 120 60" stroke="#10b981" strokeWidth="3" />
                <circle cx="120" cy="60" r="6" fill="#10b981" />
                
                {/* Moderate branch */}
                <path d="M 120 60 C 160 30, 220 30, 260 60" stroke="#06b6d4" strokeWidth="3" fill="none" />
                <path d="M 120 60 C 160 90, 220 90, 260 60" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeDasharray="4,3" />
                
                <circle cx="260" cy="60" r="6" fill="#10b981" />
                <path d="M 260 60 L 380 60" stroke="#10b981" strokeWidth="3" />
                
                <text x="190" y="24" fill="#06b6d4" fontSize="10" textAnchor="middle" fontFamily="monospace">Resolved Transposon Path</text>
                <text x="190" y="105" fill="#f59e0b" fontSize="9" textAnchor="middle" fontFamily="monospace">Remaining Ribosomal Knot</text>
              </svg>
            )}

            {selectedK === 'k55' && (
              <svg viewBox="0 0 400 120" className="w-full h-full select-none">
                {/* Broken paths due to dropouts */}
                <path d="M 20 60 L 110 60" stroke="#10b981" strokeWidth="3" />
                <circle cx="110" cy="60" r="6" fill="#f43f5e" />
                
                {/* Coverage gap */}
                <text x="145" y="63" fill="#f43f5e" fontSize="12" textAnchor="middle" fontWeight="bold">✂ GAP</text>
                
                <circle cx="180" cy="60" r="6" fill="#f43f5e" />
                <path d="M 180 60 L 270 60" stroke="#10b981" strokeWidth="3" />
                <circle cx="270" cy="60" r="6" fill="#f43f5e" />
                
                {/* Second gap */}
                <text x="305" y="63" fill="#f43f5e" fontSize="12" textAnchor="middle" fontWeight="bold">✂ GAP</text>
                
                <circle cx="340" cy="60" r="6" fill="#f43f5e" />
                <path d="M 340 60 L 380 60" stroke="#10b981" strokeWidth="3" />
                
                <text x="200" y="25" fill="#f43f5e" fontSize="10" textAnchor="middle" fontFamily="monospace">Shards due to 19 Low-Coverage Dropouts</text>
              </svg>
            )}

            {selectedK === 'multiK' && (
              <svg viewBox="0 0 400 120" className="w-full h-full select-none">
                {/* Continuous linear scaffold */}
                <path d="M 20 60 L 380 60" stroke="#10b981" strokeWidth="4" />
                <circle cx="20" cy="60" r="6" fill="#10b981" />
                <circle cx="120" cy="60" r="5" fill="#06b6d4" />
                <circle cx="240" cy="60" r="5" fill="#06b6d4" />
                <circle cx="380" cy="60" r="6" fill="#10b981" />
                
                {/* Multi-k bridging arcs */}
                <path d="M 100 55 C 140 20, 220 20, 260 55" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4,4" fill="none" />
                
                <text x="180" y="22" fill="#06b6d4" fontSize="10" textAnchor="middle" fontFamily="monospace">k=55 Path Resolves Repeat</text>
                <text x="180" y="85" fill="#10b981" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="monospace">Single Continuous Contig (N50 = 142.5 kb)</text>
              </svg>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono border-t border-slate-800 pt-3">
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">N50 Contiguity</span>
              <span className="text-emerald-400 font-bold">{activeData.n50}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Total Contigs</span>
              <span className="text-white font-bold">{activeData.contigs}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Repeat Knots</span>
              <span className={activeData.repeatBranches.includes('0') ? 'text-emerald-400' : 'text-amber-400'}>
                {activeData.repeatBranches.split(' ')[0]}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Coverage Gaps</span>
              <span className={activeData.coverageDropouts === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {activeData.coverageDropouts}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Biological Rationale Card */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
              Biological Mechanics:
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeData.description}
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3 text-xs">
            <div className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
              <span><strong>Strength:</strong> {activeData.pros}</span>
            </div>
            <div className="flex items-start gap-1.5 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
              <span><strong>Limitation:</strong> {activeData.cons}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
