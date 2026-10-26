import React from 'react';
import { HelpCircle, Check, X } from 'lucide-react';

export default function OlcVsDbgModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl transition-colors max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
            Bioinformatics Fundamentals: OLC vs De Bruijn Graphs
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Historically, early genome assemblers (like Celera Assembler used for the Human Genome Project) used the <strong className="text-slate-900 dark:text-white">Overlap-Layout-Consensus (OLC)</strong> algorithm. Why did the arrival of Next-Generation Sequencing (Illumina) force the field to shift entirely to <strong className="text-emerald-500 font-semibold">De Bruijn Graphs (DBG)</strong>?
          </p>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950 font-mono text-[11px]">
                  <th className="p-2.5 border border-slate-200 dark:border-slate-800">Feature</th>
                  <th className="p-2.5 border border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-300">OLC (Overlap-Layout-Consensus)</th>
                  <th className="p-2.5 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-300">DBG (De Bruijn Graph)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2.5 font-semibold border border-slate-200 dark:border-slate-800">Graph Nodes</td>
                  <td className="p-2.5 border border-slate-200 dark:border-slate-800">Entire raw reads</td>
                  <td className="p-2.5 border border-slate-200 dark:border-slate-800">(k−1)-mer sequence fragments</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold border border-slate-200 dark:border-slate-800">Graph Edges</td>
                  <td className="p-2.5 border border-slate-200 dark:border-slate-800">Pairwise sequence overlap between reads</td>
                  <td className="p-2.5 border border-slate-200 dark:border-slate-800">k-mer directed transitions</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold border border-slate-200 dark:border-slate-800">Computational Cost</td>
                  <td className="p-2.5 border border-slate-200 dark:border-slate-800 text-rose-500 font-mono">O(N²) pairwise alignments</td>
                  <td className="p-2.5 border border-slate-200 dark:border-slate-800 text-emerald-500 font-mono">O(N) linear hash table lookup</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold border border-slate-200 dark:border-slate-800">Mathematical Path</td>
                  <td className="p-2.5 border border-slate-200 dark:border-slate-800">Hamiltonian Path (Visits every node once; <strong>NP-complete!</strong>)</td>
                  <td className="p-2.5 border border-slate-200 dark:border-slate-800">Eulerian Trail (Visits every edge once; <strong>Linear time!</strong>)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold border border-slate-200 dark:border-slate-800">Ideal Sequencing Tech</td>
                  <td className="p-2.5 border border-slate-200 dark:border-slate-800">Long reads (PacBio HiFi, Oxford Nanopore)</td>
                  <td className="p-2.5 border border-slate-200 dark:border-slate-800">Short reads (Illumina 2x150 bp)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-100 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <strong className="text-slate-900 dark:text-white">Why OLC Failed on Illumina Reads:</strong>
            <p>
              When sequencing an E. coli or human genome with Illumina, you produce 10,000,000 to 500,000,000 reads. Computing all-versus-all pairwise overlaps for $10^8$ reads requires $10^{16}$ comparisons—which would melt even high-performance computing clusters!
            </p>
            <p className="mt-1">
              De Bruijn graphs discard read boundaries, chop everything into $k$-mers in a single pass ($O(N)$), and traverse the Eulerian trail in linear time.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
          >
            Close Explainer
          </button>
        </div>
      </div>
    </div>
  );
}
