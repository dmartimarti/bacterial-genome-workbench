import React, { useState } from 'react';
import { Eye, FileSearch } from 'lucide-react';
import BlastPairwiseModal from './BlastPairwiseModal';

export default function AlignmentCoverageRuler({
  currentGene,
  selectedGene,
  minQueryCov,
  userAssignments,
  onAssign
}) {
  const [inspectHit, setInspectHit] = useState(null);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">
          Query Protein: <span className="text-cyan-600 dark:text-cyan-400 font-mono">{currentGene.locusTag}</span> (1 to {currentGene.lengthAa} amino acids)
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Hits below your <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{minQueryCov}%</span> coverage cutoff are flagged with a warning border
        </div>
      </div>

      {/* Query Full Length Ruler */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between text-xs font-mono px-1">
          <span className="text-cyan-700 dark:text-cyan-300 font-bold">
            QUERY PROTEIN: 1 aa ───────────────────────────► {currentGene.lengthAa} aa (100% Length)
          </span>
          {selectedGene === 'cds2' && (
            <span className="text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/30 font-semibold">
              Conserved Walker-A ATP-Binding Domain (aa 48–110 = 16% of query)
            </span>
          )}
        </div>

        {/* Ruler Bar */}
        <div className="h-8 bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/50 rounded-lg relative flex items-center overflow-hidden">
          <div className="w-full flex justify-between px-3 text-[10px] font-mono text-cyan-800 dark:text-cyan-400/80 select-none">
            <span>N-term (1 aa)</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>C-term ({currentGene.lengthAa} aa)</span>
          </div>

          {selectedGene === 'cds2' && (
            <div
              style={{ left: '12%', width: '16%' }}
              className="absolute top-0 bottom-0 bg-amber-400/40 border-x-2 border-amber-500 flex items-center justify-center shadow"
              title="Conserved Walker-A motif (aa 48-110)"
            >
              <span className="text-[10px] font-mono text-amber-900 dark:text-amber-100 font-bold tracking-tight">
                Walker-A (16%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Database Hit Rows */}
      <div className="space-y-3 pt-2">
        {currentGene.hits.map((hit) => {
          const passesCov = hit.queryCov >= minQueryCov && hit.evalue !== '0.24';
          const isChosen = userAssignments[currentGene.id] === hit.product;

          return (
            <div
              key={hit.id}
              className={`p-3.5 rounded-xl border transition space-y-2.5 ${
                passesCov
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 shadow-xs'
                  : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                      {hit.db}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{hit.product}</span>
                    <span className="text-xs font-mono text-slate-400">({hit.accession})</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Identity: <strong className="text-slate-800 dark:text-white">{hit.identity}%</strong> | Query Coverage:{' '}
                    <strong className={hit.queryCov < minQueryCov ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {hit.queryCov}%
                    </strong>{' '}
                    | E-value: <strong className="text-slate-800 dark:text-white">{hit.evalue}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setInspectHit(hit)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
                    title="View Pairwise BLAST Alignment"
                  >
                    <FileSearch className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Inspect BLAST</span>
                  </button>

                  <button
                    onClick={() => onAssign(currentGene.id, hit.product)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isChosen
                        ? 'bg-emerald-600 text-white font-bold shadow'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                    }`}
                  >
                    {isChosen ? '✓ Assigned' : 'Assign'}
                  </button>
                </div>
              </div>

              {/* Alignment Coverage Bar */}
              <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-950 rounded overflow-hidden relative border border-slate-300 dark:border-slate-800">
                <div
                  style={{
                    marginLeft: `${hit.alignStart}%`,
                    width: `${hit.alignEnd - hit.alignStart}%`
                  }}
                  className={`h-full rounded ${
                    hit.recommended ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{hit.note}</p>
            </div>
          );
        })}

        {/* Option to assign "Hypothetical protein" */}
        {selectedGene === 'cds3' && (
          <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <strong className="text-emerald-800 dark:text-emerald-300">No database hits pass E-value &amp; coverage cutoffs:</strong> Safe fallback is <code className="text-slate-900 dark:text-white font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">Hypothetical protein</code>.
            </div>
            <button
              onClick={() => onAssign('cds3', 'Hypothetical protein')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                userAssignments.cds3 === 'Hypothetical protein'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {userAssignments.cds3 === 'Hypothetical protein' ? '✓ Assigned: Hypothetical protein' : 'Assign: Hypothetical protein'}
            </button>
          </div>
        )}
      </div>

      {/* Pairwise BLAST Modal */}
      {inspectHit && (
        <BlastPairwiseModal
          hit={inspectHit}
          gene={currentGene}
          onClose={() => setInspectHit(null)}
        />
      )}
    </div>
  );
}
