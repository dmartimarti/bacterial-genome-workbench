import React from 'react';
import { Layers } from 'lucide-react';

export default function RepeatBottleneckVisualizer({
  showPairedEnd,
  setShowPairedEnd,
  showLongRead,
  setShowLongRead
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 transition-colors">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          The Bacterial Repeat Bottleneck: Why 150 bp Reads Yield ~50 Contigs
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          In a De Bruijn graph, any repeat longer than the read length (<code className="text-slate-700 dark:text-slate-200 font-mono">150 bp</code>) breaks the assembly into separate contigs. Toggle the two technologies below to see how bioinformaticians bridge across repeats:
        </p>
      </div>

      {/* Explanatory Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 transition-colors">
          <div className="space-y-1">
            <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              Technology 1: Illumina Paired-End Read Scaffolding
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Instead of sequencing just one end, we sequence <strong className="text-slate-900 dark:text-white">both ends (2 × 150 bp)</strong> of a <strong className="text-cyan-600 dark:text-cyan-300">500 bp DNA fragment</strong>. If Read 1 lands in Contig 1 and Read 2 lands in Contig 2, the assembler links them into a <strong>Scaffold</strong> (filling the unsequenced gap with <code className="text-amber-500 font-mono">NNNN</code>s).
            </p>
          </div>
          <button
            onClick={() => setShowPairedEnd(!showPairedEnd)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition ${
              showPairedEnd
                ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/50'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500'
            }`}
          >
            {showPairedEnd ? '✓ Showing Paired-End Mate Links (500 bp Insert)' : '1. Test Paired-End Scaffolding (500 bp Insert)'}
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 transition-colors">
          <div className="space-y-1">
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Technology 2: Hybrid Long-Read Resolution (Nanopore / PacBio)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              A <strong className="text-amber-600 dark:text-amber-300">5,000 bp rRNA operon</strong> is 10× longer than a 500 bp Illumina fragment, so paired-end mates fall blindly inside the repeat! By adding <strong className="text-purple-600 dark:text-purple-300">10,000+ bp Oxford Nanopore reads</strong> (via <em>Unicycler / Hybracter</em>), a single read physically spans the entire rRNA operon.
            </p>
          </div>
          <button
            onClick={() => setShowLongRead(!showLongRead)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition ${
              showLongRead
                ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/50'
                : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
            }`}
          >
            {showLongRead ? '✓ Showing Hybrid Nanopore Long Read (12,000 bp)' : '2. Test Hybrid Nanopore Long Read (12,000 bp)'}
          </button>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition-colors">
        <svg viewBox="0 0 760 205" className="w-full h-auto select-none">
          {/* Contig 1 */}
          <rect x="20" y="85" width="160" height="32" rx="6" fill="#059669" stroke="#10b981" strokeWidth="2" />
          <text x="48" y="105" fill="#ffffff" fontSize="12" fontWeight="bold">Contig 1 (Unique)</text>

          {/* Repeat 1: 350 bp miniature transposon / short repeat */}
          <rect x="186" y="85" width="90" height="32" rx="4" fill="#e11d48" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4,2" />
          <text x="195" y="100" fill="#ffffff" fontSize="10" fontWeight="bold">Short Repeat</text>
          <text x="207" y="112" fill="#ffe4e6" fontSize="9">(350 bp)</text>

          {/* Contig 2 */}
          <rect x="282" y="85" width="165" height="32" rx="6" fill="#059669" stroke="#10b981" strokeWidth="2" />
          <text x="315" y="105" fill="#ffffff" fontSize="12" fontWeight="bold">Contig 2 (Unique)</text>

          {/* Repeat 2: 5,000 bp rRNA Operon (16S-23S-5S) */}
          <rect x="453" y="80" width="155" height="42" rx="4" fill="#d97706" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="5,3" />
          <text x="468" y="99" fill="#ffffff" fontSize="11" fontWeight="bold">rRNA Operon (rrn)</text>
          <text x="470" y="113" fill="#fef3c7" fontSize="9">5,000 bp (7 copies in genome!)</text>

          {/* Contig 3 */}
          <rect x="614" y="85" width="125" height="32" rx="6" fill="#059669" stroke="#10b981" strokeWidth="2" />
          <text x="635" y="105" fill="#ffffff" fontSize="12" fontWeight="bold">Contig 3</text>

          {/* Paired-End Read Arcs */}
          {showPairedEnd && (
            <g>
              {/* Bridges the 350 bp repeat! */}
              <path d="M 155 82 Q 231 20, 305 82" fill="none" stroke="#0891b2" strokeWidth="2.5" />
              <rect x="142" y="75" width="18" height="6" fill="#0891b2" />
              <rect x="298" y="75" width="18" height="6" fill="#0891b2" />
              <text x="120" y="34" fill="#0891b2" fontSize="10" fontWeight="bold">
                ✓ 500 bp Paired-End Insert bridges 350 bp repeat → Links Contig 1 &amp; 2 into Scaffold!
              </text>

              {/* Fails to bridge the 5,000 bp rRNA operon */}
              <path d="M 425 82 Q 465 42, 505 80" fill="none" stroke="#e11d48" strokeWidth="2" strokeDasharray="3,3" />
              <rect x="415" y="75" width="18" height="6" fill="#e11d48" />
              <rect x="498" y="75" width="18" height="6" fill="#e11d48" />
              <text x="435" y="55" fill="#e11d48" fontSize="10" fontWeight="bold">
                ✗ Mate lands INSIDE 5,000 bp rRNA repeat (Cannot bridge!)
              </text>
            </g>
          )}

          {/* Oxford Nanopore / PacBio Long Read */}
          {showLongRead && (
            <g>
              <rect x="45" y="148" width="670" height="20" rx="4" fill="#9333ea" opacity="0.95" />
              <text x="135" y="162" fill="#ffffff" fontSize="10.5" fontWeight="bold" fontFamily="monospace">
                12,000 bp Oxford Nanopore Read (Anchors Contig 1 → Contig 2 → Contig 3 into 1 Closed Chromosome!)
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
