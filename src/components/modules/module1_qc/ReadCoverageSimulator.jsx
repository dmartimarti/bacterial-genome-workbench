import React from 'react';

export default function ReadCoverageSimulator({
  reads,
  depthTrack,
  zeroBins
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 transition-colors shadow-sm">
      <div>
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
          Live Read Pileup &amp; Depth Histogram (1,000 bp Bacterial Locus)
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Red vertical columns show <span className="text-rose-600 dark:text-rose-400 font-semibold">0x coverage dropout gaps</span> where no error-free reads span the reference—forcing the contig to break!
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3.5 text-xs bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-3 h-2.5 rounded-sm bg-emerald-500 inline-block"></span> Safe Depth (≥3x)
        </span>
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-3 h-2.5 rounded-sm bg-amber-500 inline-block"></span> Fragile Depth (1–2x)
        </span>
        <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
          <span className="w-3 h-2.5 rounded-sm bg-rose-500 inline-block"></span> 0x Dropout Gap (Breaks Assembly!)
        </span>
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-3 h-2 rounded-sm bg-cyan-500 inline-block"></span> 150 bp Read
        </span>
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Internal SNP Error
        </span>
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <span className="w-3 h-2 rounded-sm bg-rose-500 inline-block"></span> 3&apos; Error / Adapter Tail
        </span>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <svg viewBox="0 0 650 245" className="w-full h-auto select-none">
          {/* Y-Axis Label and Axis Lines */}
          <text x="4" y="13" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold">
            DEPTH
          </text>
          <line x1="42" y1="16" x2="42" y2="68" stroke="#475569" strokeWidth="1" />

          {/* Y-Axis ticks & horizontal guide lines */}
          <text x="8" y="22" fill="#64748b" fontSize="9" fontFamily="monospace">≥20x</text>
          <line x1="42" y1="19" x2="642" y2="19" stroke="#1e293b" strokeDasharray="2,2" strokeWidth="1" />

          <text x="14" y="43" fill="#64748b" fontSize="9" fontFamily="monospace">10x</text>
          <line x1="42" y1="40" x2="642" y2="40" stroke="#1e293b" strokeDasharray="2,2" strokeWidth="1" />

          <text x="19" y="67" fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">0x</text>
          <line x1="42" y1="68" x2="642" y2="68" stroke="#475569" strokeWidth="1" />

          {/* Reference DNA Track Label */}
          <text x="4" y="79" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">
            REF DNA
          </text>

          {/* Coverage Histogram Bars & Ref Track */}
          {depthTrack.map((d, idx) => {
            const barH = Math.min(48, d * 2.4);
            const x = 44 + idx * 5.95;
            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={68 - barH}
                  width="5.1"
                  height={Math.max(2, barH)}
                  fill={d === 0 ? '#f43f5e' : d < 3 ? '#f59e0b' : '#10b981'}
                  opacity="0.9"
                />
                <rect
                  x={x}
                  y="72"
                  width="6"
                  height="7"
                  fill={d === 0 ? '#f43f5e' : '#334155'}
                />
              </g>
            );
          })}

          {/* Highlight 0x dropout columns vertically */}
          {depthTrack.map((d, idx) =>
            d === 0 ? (
              <rect
                key={`drop-${idx}`}
                x={44 + idx * 5.95}
                y="18"
                width="5.95"
                height="215"
                fill="#f43f5e"
                opacity="0.22"
                className="animate-pulse"
              />
            ) : null
          )}

          {/* Read Pileup Rows */}
          <text x="4" y="102" fill="#64748b" fontSize="8.5" fontFamily="monospace">
            READS
          </text>
          {reads.map((r) => {
            const x = 44 + r.start * 5.95;
            const width = (r.end - r.start) * 5.95;
            const y = 90 + r.row * 14;
            return (
              <g key={r.id}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height="8"
                  rx="2"
                  fill="#06b6d4"
                  opacity="0.82"
                />
                {/* Un-trimmed 3' error tail */}
                {r.has3PrimeError && (
                  <rect
                    x={x + width - 17}
                    y={y}
                    width="17"
                    height="8"
                    rx="2"
                    fill="#f43f5e"
                  />
                )}
                {/* Random internal sequencing error (Yellow dot) */}
                {r.hasMidError && (
                  <circle
                    cx={44 + r.errorPos * 5.95}
                    cy={y + 4}
                    r="3.2"
                    fill="#fbbf24"
                    stroke="#0f172a"
                    strokeWidth="0.8"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
