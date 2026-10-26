import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, StepForward, StepBack, CheckCircle2, Sparkles, BookOpen, ArrowRight, GitCommit } from 'lucide-react';

export default function ContigAssemblerWalker({
  eulerianTrail = [],
  activeStep = 0,
  setActiveStep,
  kSize = 5
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTheory, setShowTheory] = useState(false);

  const totalSteps = eulerianTrail.length;
  const currentItem = eulerianTrail[Math.min(activeStep, totalSteps - 1)] || eulerianTrail[0];

  // Auto-play interval
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 750);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, setActiveStep]);

  if (!currentItem || totalSteps === 0) return null;

  const prefix = currentItem.kmer ? currentItem.kmer.slice(0, -1) : '';
  const suffix = currentItem.kmer ? currentItem.kmer.slice(1) : '';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 transition-colors shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Eulerian Path Walker: How SPAdes Traverses Overlaps to Assemble Contigs
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every edge in the De Bruijn graph is a <strong className="text-slate-800 dark:text-slate-200">{kSize}-mer</strong>. Walking an edge consumes the overlap and extends the assembled contig by exactly <strong className="text-emerald-600 dark:text-emerald-400">1 nucleotide</strong>!
          </p>
        </div>

        {/* Playback Controls & Theory Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTheory(!showTheory)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition ${
              showTheory
                ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showTheory ? 'Hide Didactics' : 'Eulerian Theory'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setIsPlaying(false);
                setActiveStep(Math.max(0, activeStep - 1));
              }}
              disabled={activeStep <= 0}
              className="p-1 rounded-md hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition"
              title="Step back"
            >
              <StepBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition shadow-sm"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setActiveStep(Math.min(totalSteps - 1, activeStep + 1));
              }}
              disabled={activeStep >= totalSteps - 1}
              className="p-1 rounded-md hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition"
              title="Step forward"
            >
              <StepForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setActiveStep(0);
              }}
              className="p-1 rounded-md hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
              title="Reset to beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Didactic Callout: Eulerian vs Hamiltonian */}
      {showTheory && (
        <div className="p-3.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 text-xs text-slate-700 dark:text-slate-300 space-y-2 animate-in fade-in">
          <div className="font-semibold text-cyan-900 dark:text-cyan-200 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Why modern assemblers use Eulerian Walks instead of Hamiltonian Paths:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed">
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-cyan-100 dark:border-cyan-900/40">
              <span className="font-bold text-amber-600 dark:text-amber-400">Overlap-Layout-Consensus (Hamiltonian):</span>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Nodes are whole reads. Must visit every <em>node</em> exactly once. This is the <strong>Hamiltonian Path problem</strong>, which is <strong>NP-complete</strong>! Computationally impossible for 50 million short Illumina reads.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-cyan-100 dark:border-cyan-900/40">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">De Bruijn Graph (Eulerian):</span>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Nodes are (k-1)-mers; directed edges are k-mers. Must visit every <em>edge</em> exactly once. This is the <strong>Eulerian Path problem</strong>, solvable in <strong>linear time O(|V| + |E|)</strong> using Hierholzer&apos;s algorithm!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Traversal State HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 text-[11px]">Eulerian Progress:</div>
          <div className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5">
            Step {activeStep + 1} of {totalSteps}
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${((activeStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 text-[11px]">Traversing {kSize}-mer Edge:</div>
          <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
            {currentItem.kmer}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Edge connects 2 nodes
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 text-[11px]">(k-1) Overlap Transition:</div>
          <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
            <span className="text-cyan-600 dark:text-cyan-400">{prefix}</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="text-emerald-600 dark:text-emerald-400">{suffix}</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Overlaps by {kSize - 2} internal bp
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 text-[11px]">Contig Extension:</div>
          <div className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm mt-0.5">
            +{currentItem.addedChar} (3&apos; base)
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Total length: {currentItem.assembledSoFar.length} bp
          </div>
        </div>
      </div>

      {/* Interactive Step Scrubber / Timeline */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-medium flex items-center gap-1">
            <GitCommit className="w-3 h-3 text-emerald-500" />
            Eulerian Edge Sequence Timeline (Click any step to inspect):
          </span>
          <span className="font-mono">{activeStep + 1}/{totalSteps} edges consumed</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
          {eulerianTrail.map((step, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsPlaying(false);
                setActiveStep(idx);
              }}
              className={`px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap transition border ${
                idx === activeStep
                  ? 'bg-emerald-600 text-white font-bold border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500 shadow-sm'
                  : idx < activeStep
                  ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900'
                  : 'bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500 border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              #{idx + 1} {step.kmer}
            </button>
          ))}
        </div>
      </div>

      {/* Live Assembled Sequence Box */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Reconstructed Contig Sequence ({currentItem.assembledSoFar.length} bp):
          </span>
          {activeStep === totalSteps - 1 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-xs">
              <CheckCircle2 className="w-4 h-4" /> Full Eulerian Contig Reconstructed!
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              {totalSteps - 1 - activeStep} edges remaining to traverse
            </span>
          )}
        </div>

        <div className="font-mono text-sm tracking-widest break-all p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
          <span className="text-slate-400 text-xs mr-1 select-none font-sans">5&apos;-</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">{currentItem.assembledSoFar.slice(0, -1)}</span>
          <span className="bg-amber-400/30 text-amber-700 dark:text-amber-300 px-1 py-0.5 rounded font-black border border-amber-400/50 animate-pulse">
            {currentItem.assembledSoFar.slice(-1)}
          </span>
          <span className="text-slate-400 text-xs ml-1 select-none font-sans">-3&apos;</span>
        </div>
      </div>
    </div>
  );
}
