import React, { useState } from 'react';
import { Scissors, Sparkles, ArrowRight, ArrowLeft, RefreshCw, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Step 1: Raw De Bruijn Graph (With Sequencing Errors)',
    badge: 'Raw k-mer Graph',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    description: 'Raw Illumina short reads contain sequencing errors (~0.5–2%). When decomposing reads into k-mers, these errors generate false k-mers that produce two classic graph artifacts: dead-end "Tips" (when errors occur at read ends) and alternative "Bubbles" (when errors occur in the middle of reads).',
    action: 'Notice the dead-end tip in red and the sequencing error bubble in amber branching off the main genome backbone in green.',
    stats: { nodes: 14, edges: 16, contiguity: 'Complex & Fractured' }
  },
  {
    step: 2,
    title: 'Step 2: Tip Clipping (Pruning Dead-End Errors)',
    badge: 'Pruning Tips',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    description: 'The assembler identifies short dead-end branches whose length is shorter than 2k and whose k-mer coverage is markedly lower than the genomic mean (e.g., depth = 1x vs 45x). These represent low-Phred 3\' terminal read errors and are clipped away!',
    action: 'The red dead-end tip is snipped, preventing the Eulerian assembler from wandering into a premature dead end.',
    stats: { nodes: 11, edges: 12, contiguity: 'Tips Cleared' }
  },
  {
    step: 3,
    title: 'Step 3: Bubble Popping (Collapsing Error Branches)',
    badge: 'Popping Bubbles',
    badgeColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    description: 'When an internal sequencing error creates an alternative path between two identical nodes, a "bubble" forms. The algorithm compares the k-mer coverage of both branches: the genuine bacterial sequence has ~45x depth, while the error branch has only ~1–2x depth. The error branch is popped and merged!',
    action: 'The 1x error branch is popped, leaving a single canonical sequence backbone.',
    stats: { nodes: 8, edges: 8, contiguity: 'Bubbles Resolved' }
  },
  {
    step: 4,
    title: 'Step 4: Linear Contraction into Unitigs',
    badge: 'Unitig Condensation',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    description: 'Finally, all unambiguous linear chains of nodes—where an in-degree of 1 leads directly to an out-degree of 1 with no branches—are condensed into a single continuous, non-branching contiguous sequence called a "Unitig" (contig).',
    action: 'Multiple individual (k-1) nodes are fused into long, clean contig FASTA sequences ready for scaffolding!',
    stats: { nodes: 3, edges: 2, contiguity: 'Continuous Unitigs (N50 Peak)' }
  }
];

export default function GraphSimplificationWalkthrough() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const step = STEPS[currentStepIdx];

  const handleNext = () => {
    setCurrentStepIdx((prev) => (prev < STEPS.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentStepIdx((prev) => (prev > 0 ? prev - 1 : STEPS.length - 1));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 transition-colors shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Scissors className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Graph Simplification: Tip Clipping, Bubble Popping &amp; Unitig Contraction
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step through the core mathematical heuristics used by Velvet, SPAdes, and MEGAHIT to turn noisy k-mer graphs into pristine contigs.
          </p>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setCurrentStepIdx(idx)}
              className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center ${
                currentStepIdx === idx
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s.step}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visual Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Left: Dynamic SVG Graph Transformation */}
        <div className="lg:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono text-cyan-400">{step.title}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${step.badgeColor}`}>{step.badge}</span>
          </div>

          {/* SVG Diagram with Step States */}
          <div className="h-52 flex items-center justify-center p-2">
            <svg viewBox="0 0 500 140" className="w-full h-full select-none font-mono">
              {/* Backbone Nodes & Edges (Present across all steps) */}
              {/* Node 1 */}
              <circle cx="40" cy="70" r="10" fill="#10b981" />
              <text x="40" y="74" fill="#022c22" fontSize="9" fontWeight="bold" textAnchor="middle">N1</text>
              <path d="M 50 70 L 110 70" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow)" />

              {/* Node 2 */}
              <circle cx="120" cy="70" r="10" fill="#10b981" />
              <text x="120" y="74" fill="#022c22" fontSize="9" fontWeight="bold" textAnchor="middle">N2</text>

              {/* Step 1: Raw graph with Tip & Bubble */}
              {currentStepIdx === 0 && (
                <>
                  {/* Tip from N2 */}
                  <path d="M 120 70 L 170 25" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="3,3" />
                  <circle cx="170" cy="25" r="9" fill="#f43f5e" />
                  <text x="170" y="28" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">T1</text>
                  <text x="215" y="24" fill="#f43f5e" fontSize="9" fontStyle="italic">Dead-End Tip (1x)</text>

                  {/* Main branch to N3 */}
                  <path d="M 130 70 L 190 70" stroke="#10b981" strokeWidth="3" />
                  <circle cx="200" cy="70" r="10" fill="#10b981" />
                  <text x="200" y="74" fill="#022c22" fontSize="9" fontWeight="bold" textAnchor="middle">N3</text>

                  {/* Bubble: genuine path (bottom, 45x) vs error path (top, 1x) */}
                  <path d="M 210 70 C 240 40, 280 40, 310 70" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeDasharray="3,3" />
                  <circle cx="260" cy="48" r="8" fill="#f59e0b" />
                  <text x="260" y="51" fill="#fff" fontSize="8" textAnchor="middle">E1</text>
                  <text x="260" y="32" fill="#f59e0b" fontSize="9" textAnchor="middle">Error Path (1x)</text>

                  <path d="M 210 70 C 240 100, 280 100, 310 70" stroke="#10b981" strokeWidth="4" fill="none" />
                  <circle cx="260" cy="92" r="9" fill="#10b981" />
                  <text x="260" y="95" fill="#022c22" fontSize="8" fontWeight="bold" textAnchor="middle">N4</text>
                  <text x="260" y="118" fill="#10b981" fontSize="9" textAnchor="middle">True Path (45x)</text>

                  {/* Node 5 */}
                  <circle cx="320" cy="70" r="10" fill="#10b981" />
                  <text x="320" y="74" fill="#022c22" fontSize="9" fontWeight="bold" textAnchor="middle">N5</text>
                  <path d="M 330 70 L 400 70" stroke="#10b981" strokeWidth="3" />

                  {/* Node 6 */}
                  <circle cx="410" cy="70" r="10" fill="#10b981" />
                  <text x="410" y="74" fill="#022c22" fontSize="9" fontWeight="bold" textAnchor="middle">N6</text>
                </>
              )}

              {/* Step 2: Tip is pruned */}
              {currentStepIdx === 1 && (
                <>
                  {/* Clipped indicator */}
                  <text x="170" y="28" fill="#f43f5e" fontSize="10" fontWeight="bold">✂ CLIPPED TIP</text>
                  <line x1="120" y1="70" x2="160" y2="35" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2,2" opacity="0.4" />

                  <path d="M 130 70 L 190 70" stroke="#10b981" strokeWidth="3" />
                  <circle cx="200" cy="70" r="10" fill="#10b981" />
                  <text x="200" y="74" fill="#022c22" fontSize="9" fontWeight="bold" textAnchor="middle">N3</text>

                  {/* Bubble still present, ready to pop */}
                  <path d="M 210 70 C 240 40, 280 40, 310 70" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeDasharray="3,3" />
                  <circle cx="260" cy="48" r="8" fill="#f59e0b" />
                  <text x="260" y="32" fill="#f59e0b" fontSize="9" textAnchor="middle">Target for Popping</text>

                  <path d="M 210 70 C 240 100, 280 100, 310 70" stroke="#10b981" strokeWidth="4" fill="none" />
                  <circle cx="260" cy="92" r="9" fill="#10b981" />
                  <text x="260" y="95" fill="#022c22" fontSize="8" fontWeight="bold" textAnchor="middle">N4</text>

                  <circle cx="320" cy="70" r="10" fill="#10b981" />
                  <text x="320" y="74" fill="#022c22" fontSize="9" fontWeight="bold" textAnchor="middle">N5</text>
                  <path d="M 330 70 L 400 70" stroke="#10b981" strokeWidth="3" />
                  <circle cx="410" cy="70" r="10" fill="#10b981" />
                  <text x="410" y="74" fill="#022c22" fontSize="9" fontWeight="bold" textAnchor="middle">N6</text>
                </>
              )}

              {/* Step 3: Bubble popped */}
              {currentStepIdx === 2 && (
                <>
                  <path d="M 130 70 L 190 70" stroke="#10b981" strokeWidth="3" />
                  <circle cx="200" cy="70" r="10" fill="#10b981" />
                  <text x="200" y="74" fill="#022c22" fontSize="9" fontWeight="bold" textAnchor="middle">N3</text>

                  {/* Popped path indicator */}
                  <text x="260" y="35" fill="#06b6d4" fontSize="10" textAnchor="middle" fontWeight="bold">💥 BUBBLE POPPED (45x vs 1x)</text>

                  {/* Unified linear path */}
                  <path d="M 210 70 L 310 70" stroke="#10b981" strokeWidth="4" />
                  <circle cx="260" cy="70" r="10" fill="#10b981" />
                  <text x="260" y="74" fill="#022c22" fontSize="9" fontWeight="bold" textAnchor="middle">N4</text>

                  <circle cx="320" cy="70" r="10" fill="#10b981" />
                  <text x="320" y="74" fill="#022c22" fontSize="9" fontWeight="bold" textAnchor="middle">N5</text>
                  <path d="M 330 70 L 400 70" stroke="#10b981" strokeWidth="3" />
                  <circle cx="410" cy="70" r="10" fill="#10b981" />
                  <text x="410" y="74" fill="#022c22" fontSize="9" fontWeight="bold" textAnchor="middle">N6</text>
                </>
              )}

              {/* Step 4: Unitig Contraction */}
              {currentStepIdx === 3 && (
                <>
                  {/* Single massive contracted unitig bar */}
                  <rect x="40" y="55" width="410" height="30" rx="8" fill="#10b981" opacity="0.25" stroke="#10b981" strokeWidth="2" />
                  <path d="M 40 70 L 450 70" stroke="#10b981" strokeWidth="6" />

                  <circle cx="40" cy="70" r="10" fill="#059669" />
                  <text x="40" y="74" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">5&apos;</text>

                  <circle cx="450" cy="70" r="10" fill="#059669" />
                  <text x="450" y="74" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">3&apos;</text>

                  <text x="245" y="44" fill="#10b981" fontSize="12" textAnchor="middle" fontWeight="bold">
                    CONTIG_1 (Non-branching Unitig: 142.5 kb)
                  </text>
                  <text x="245" y="105" fill="#94a3b8" fontSize="10" textAnchor="middle">
                    N1 → N2 → N3 → N4 → N5 → N6 collapsed into 1 FASTA contig
                  </text>
                </>
              )}
            </svg>
          </div>

          {/* Bottom Live Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono border-t border-slate-800 pt-3">
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Active Graph Nodes</span>
              <span className="text-white font-bold">{step.stats.nodes} nodes</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Directed Edges</span>
              <span className="text-white font-bold">{step.stats.edges} edges</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-sans">Contiguity State</span>
              <span className="text-emerald-400 font-bold">{step.stats.contiguity}</span>
            </div>
          </div>
        </div>

        {/* Right: Step Description & Controls */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Algorithm Walkthrough:
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {step.description}
            </p>
            <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-800 dark:text-cyan-300">
              <strong>Observation:</strong> {step.action}
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition"
            >
              <span>{currentStepIdx === STEPS.length - 1 ? 'Restart Walkthrough' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
