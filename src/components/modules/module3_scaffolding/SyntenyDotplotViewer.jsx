import React, { useState } from 'react';
import { Grid, Eye, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function SyntenyDotplotViewer({ selectedAssembly }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Synteny segments for each assembly:
  // x1, y1, x2, y2 represent coordinates from 0 to 4.6 Mb
  const syntenyData = {
    optimal: {
      title: 'Assembly C (Hybrid Unicycler - Long + Short Reads)',
      status: 'Perfect Collinear Synteny (1 Closed Chromosome)',
      statusColor: 'text-emerald-600 dark:text-emerald-400',
      lines: [
        { id: 'c1', x1: 0, y1: 0, x2: 4.6, y2: 4.6, type: 'syntenic', label: 'Contig 1 (4,639,221 bp) - 100% syntenic to E. coli K-12 MG1655' }
      ]
    },
    chimeric: {
      title: 'Assembly B (Chimeric Fast Assembler)',
      status: '1 Extensive Inversion + 2 Translocations across rRNA Operons!',
      statusColor: 'text-rose-600 dark:text-rose-400',
      lines: [
        { id: 'b1', x1: 0, y1: 0, x2: 1.8, y2: 1.8, type: 'syntenic', label: 'Contig 1 (0–1.8 Mb): Collinear' },
        // Chimeric inversion across rRNA operons: anti-diagonal slash!
        { id: 'b2', x1: 1.8, y1: 2.8, x2: 2.8, y2: 1.8, type: 'inversion', label: 'Contig 2 (1.8–2.8 Mb): 1.0 Mb Inverted Block (False chromosomal rearrangement!)' },
        { id: 'b3', x1: 2.8, y1: 2.8, x2: 3.6, y2: 3.6, type: 'syntenic', label: 'Contig 3 (2.8–3.6 Mb): Collinear' },
        // Translocation jump
        { id: 'b4', x1: 3.6, y1: 4.2, x2: 4.2, y2: 4.6, type: 'translocation', label: 'Contig 4 (3.6–4.2 Mb): Translocated Block' },
        { id: 'b5', x1: 4.2, y1: 3.6, x2: 4.6, y2: 4.0, type: 'translocation', label: 'Contig 5 (4.2–4.6 Mb): Translocated Block' }
      ]
    },
    fragmented: {
      title: 'Assembly A (Careful SPAdes - Illumina Short Reads)',
      status: 'Collinear but Fragmented (54 Contigs Broken at Repeats)',
      statusColor: 'text-cyan-600 dark:text-cyan-400',
      lines: [
        { id: 'a1', x1: 0.0, y1: 0.0, x2: 0.8, y2: 0.8, type: 'syntenic', label: 'Contig 1 (800 kb)' },
        { id: 'a2', x1: 0.82, y1: 0.82, x2: 1.4, y2: 1.4, type: 'syntenic', label: 'Contig 2 (580 kb)' },
        { id: 'a3', x1: 1.42, y1: 1.42, x2: 2.1, y2: 2.1, type: 'syntenic', label: 'Contig 3 (680 kb)' },
        { id: 'a4', x1: 2.12, y1: 2.12, x2: 2.9, y2: 2.9, type: 'syntenic', label: 'Contig 4 (780 kb)' },
        { id: 'a5', x1: 2.92, y1: 2.92, x2: 3.7, y2: 3.7, type: 'syntenic', label: 'Contig 5 (780 kb)' },
        { id: 'a6', x1: 3.72, y1: 3.72, x2: 4.6, y2: 4.6, type: 'syntenic', label: 'Contig 6 (880 kb)' }
      ]
    }
  };

  const activeData = syntenyData[selectedAssembly] || syntenyData.optimal;

  // Scale: 4.6 Mb mapped to 40..360 in SVG
  const scale = (mb) => 40 + (mb / 4.6) * 320;
  const invScale = (mb) => 360 - (mb / 4.6) * 320;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            2D Synteny Dotplot (MUMmer / Mauve Genome Alignment Simulator)
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Hover over segments to inspect collinearity against the ground-truth reference genome.
          </p>
        </div>
        <div className={`text-xs font-semibold ${activeData.statusColor}`}>
          {activeData.status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* SVG Dotplot */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <svg viewBox="0 0 420 400" className="w-full h-auto select-none">
            {/* Grid Lines */}
            {[0, 1, 2, 3, 4, 4.6].map((tick) => {
              const pos = scale(tick);
              const invPos = invScale(tick);
              return (
                <g key={`grid_${tick}`}>
                  {/* Vertical */}
                  <line x1={pos} y1="40" x2={pos} y2="360" stroke="#94a3b8" strokeDasharray="2,2" strokeWidth="0.7" opacity="0.3" />
                  <text x={pos} y="375" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    {tick}M
                  </text>
                  {/* Horizontal */}
                  <line x1="40" y1={invPos} x2="360" y2={invPos} stroke="#94a3b8" strokeDasharray="2,2" strokeWidth="0.7" opacity="0.3" />
                  <text x="32" y={invPos + 3} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">
                    {tick}M
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line x1="40" y1="360" x2="365" y2="360" stroke="#64748b" strokeWidth="1.5" />
            <line x1="40" y1="40" x2="40" y2="360" stroke="#64748b" strokeWidth="1.5" />

            <text x="200" y="392" fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              Reference Genome: E. coli K-12 (0 → 4.6 Mb)
            </text>
            <text x="12" y="200" fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle" transform="rotate(-90 12 200)">
              Assembled Contigs (0 → 4.6 Mb)
            </text>

            {/* Synteny Lines */}
            {activeData.lines.map((seg) => {
              const x1 = scale(seg.x1);
              const y1 = invScale(seg.y1);
              const x2 = scale(seg.x2);
              const y2 = invScale(seg.y2);

              const strokeColor =
                seg.type === 'inversion' ? '#f43f5e' : seg.type === 'translocation' ? '#f59e0b' : '#10b981';

              const isHovered = hoveredPoint === seg.id;

              return (
                <g key={seg.id} onMouseEnter={() => setHoveredPoint(seg.id)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer">
                  {/* Hover hit area */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="12" />
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={strokeColor}
                    strokeWidth={isHovered ? 4.5 : 3}
                    strokeLinecap="round"
                    className="transition-all"
                  />
                  {seg.type === 'inversion' && (
                    <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r="5" fill="#f43f5e" className="animate-ping" opacity="0.75" />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Diagnostic Panel */}
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Dotplot Diagnostic Legend:
            </span>
            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 bg-emerald-500 rounded-full"></span>
                <span><strong>Forward Diagonal:</strong> True collinear synteny</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 bg-rose-500 rounded-full"></span>
                <span><strong>Reverse Anti-Diagonal:</strong> Inversion misassembly!</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-1 bg-amber-500 rounded-full"></span>
                <span><strong>Off-Diagonal Shift:</strong> Translocation</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-semibold text-slate-800 dark:text-white">Active Segment Detail:</div>
            {hoveredPoint ? (
              <p className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px] leading-relaxed">
                {activeData.lines.find((l) => l.id === hoveredPoint)?.label}
              </p>
            ) : (
              <p className="text-slate-500 text-[11px]">Hover over any line segment on the grid to inspect contig coordinates.</p>
            )}
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/40">
            <strong className="text-amber-800 dark:text-amber-300">Why MUMmer dotplots matter:</strong> Assembly B boasts the highest N50 (2,800 kb) on paper, but the dotplot instantly catches the <span className="text-rose-600 dark:text-rose-400 font-bold">1 Mb inverted block</span> created when the assembler linked the wrong rRNA operons!
          </div>
        </div>
      </div>
    </div>
  );
}
