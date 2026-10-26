import React from 'react';

export default function SixFrameBrowser({
  orfs,
  isOrfVisible,
  selectedOrfId,
  setSelectedOrfId
}) {
  const rows = [
    { y: 32, label: 'Frame +1', frame: '+1' },
    { y: 68, label: 'Frame +2', frame: '+2' },
    { y: 104, label: 'Frame +3', frame: '+3' },
    { y: 150, label: 'Frame -1', frame: '-1 (Rev)' }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 transition-colors">
      <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pb-1">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Contig_1 (4,200 bp window) — Click any ORF block to inspect features and codon translation
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Shine-Dalgarno RBS
          </span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-300 font-medium">
            <span className="w-3 h-2 rounded-sm bg-emerald-600 inline-block"></span> True CDS
          </span>
          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-300 font-medium">
            <span className="w-3 h-2 rounded-sm bg-rose-500 inline-block"></span> False Positive ORF
          </span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox="0 0 760 190" className="w-full h-auto select-none min-w-[680px]">
          {rows.map((row, idx) => (
            <g key={idx}>
              <text x="8" y={row.y + 13} fill="#64748b" fontSize="11" fontFamily="monospace" fontWeight="bold">
                {row.label}
              </text>
              <line x1="75" y1={row.y + 9} x2="740" y2={row.y + 9} stroke="#cbd5e1" strokeWidth="2" className="dark:stroke-slate-800" />
            </g>
          ))}

          {/* Reverse strand divider */}
          <line x1="10" y1="134" x2="740" y2="134" stroke="#94a3b8" strokeDasharray="4,4" strokeWidth="1" className="dark:stroke-slate-700" />

          {/* Render ORFs */}
          {orfs.map((orf) => {
            const visible = isOrfVisible(orf);
            const yMap = { '+1': 32, '+2': 68, '+3': 104, '-1 (Rev)': 150 };
            const y = yMap[orf.frame];
            const isSelected = selectedOrfId === orf.id;
            const width = orf.end - orf.start;

            // Choose concise label for narrow boxes to prevent any overlapping
            let displayLabel = orf.name;
            if (width < 75) {
              displayLabel = orf.shortLabel || (orf.name.includes('Short_B') ? 'Spurious_B' : orf.name.includes('Short_A') ? 'Spurious_A' : orf.name.split(' ')[0]);
            } else if (width < 140) {
              displayLabel = orf.name.split(' (')[0];
            }

            return (
              <g
                key={orf.id}
                onClick={() => setSelectedOrfId(orf.id)}
                className="cursor-pointer transition-opacity"
                opacity={visible ? 1 : 0.15}
              >
                <defs>
                  <clipPath id={`clip_orf_${orf.id}`}>
                    <rect x={orf.start} y={y} width={width} height="19" rx="4" />
                  </clipPath>
                </defs>

                {/* RBS marker dot */}
                {orf.hasRBS && (
                  <circle
                    cx={orf.strand === '+' ? orf.start - 7 : orf.end + 7}
                    cy={y + 9}
                    r="5"
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    title={`RBS: ${orf.rbsMotif}`}
                  />
                )}

                {/* ORF Rectangle */}
                <rect
                  x={orf.start}
                  y={y}
                  width={width}
                  height="19"
                  rx="4"
                  fill={orf.isTrueGene ? '#059669' : '#e11d48'}
                  stroke={isSelected ? '#3b82f6' : 'none'}
                  strokeWidth={isSelected ? '2.5' : '0'}
                  className={isSelected ? 'filter drop-shadow-md' : ''}
                >
                  <title>{`${orf.name} [${orf.lengthBp} bp]`}</title>
                </rect>

                {/* ORF Label with clipPath so it can never bleed into next gene */}
                <text
                  x={orf.start + 5}
                  y={y + 13}
                  clipPath={`url(#clip_orf_${orf.id})`}
                  fill="#ffffff"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {displayLabel}
                </text>
              </g>
            );
          })}

        </svg>
      </div>
    </div>
  );
}
