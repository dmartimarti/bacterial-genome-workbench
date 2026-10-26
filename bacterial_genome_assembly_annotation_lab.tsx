import React, { useState, useMemo } from 'react';
import {
  Dna,
  Sliders,
  Share2,
  Layers,
  Search,
  Database,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Terminal,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Scissors,
  Eye,
  Info,
  Award,
  BookOpen
} from 'lucide-react';

// ==========================================
// SHARED DATA & HELPER FUNCTIONS
// ==========================================

const MODULES = [
  {
    id: 1,
    shortTitle: '1. Read QC & Coverage',
    title: 'Sequencing Depth, Quality & Lander-Waterman',
    tool: 'fastp / FastQC',
    icon: Sliders,
    goal: 'Understand why 30x–50x coverage is needed for short-read assembly and why untrimmed 3\' errors/adapters poison downstream graphs.'
  },
  {
    id: 2,
    shortTitle: '2. De Bruijn Graph',
    title: 'k-mer Spectrum, Repeats & Error Bubbles',
    tool: 'SPAdes / Shovill',
    icon: Share2,
    goal: 'Explore how k-mer size balances repeat resolution against coverage fragmentation, and how sequencing errors form tips and bubbles.'
  },
  {
    id: 3,
    shortTitle: '3. Repeats & Scaffolding',
    title: 'Why Short Reads Fragment & QUAST QC',
    tool: 'QUAST / Bandage',
    icon: Layers,
    goal: 'See why 150 bp reads cannot resolve 5 kb rRNA operons, how paired-end reads scaffold contigs, and why highest N50 is not always best.'
  },
  {
    id: 4,
    shortTitle: '4. Structural Annotation',
    title: 'Ab Initio Gene Calling & Shine-Dalgarno Motifs',
    tool: 'Prodigal / Pyrodigal',
    icon: Search,
    goal: 'Distinguish random Open Reading Frames (ORFs) from true bacterial coding sequences (CDS) using length, start codons, and RBS motifs.'
  },
  {
    id: 5,
    shortTitle: '5. Functional Annotation',
    title: 'Homology Triage, Domain Traps & Hypotheticals',
    tool: 'Bakta / Prokka',
    icon: Database,
    goal: 'Avoid the "domain trap" in BLAST/Diamond searches by balancing query coverage, percent identity, and curated database hierarchy.'
  }
];

const QUESTIONS = {
  1: {
    question: "At 8x sequencing depth, even if every read is 100% error-free, why does a short-read assembler still produce dozens of fragmented contigs?",
    options: [
      { id: 'a', text: "Because the assembler deletes reads when coverage is below 20x.", correct: false, feedback: "Assemblers don't arbitrarily delete all reads below 20x, though very low-abundance k-mers may be filtered." },
      { id: 'b', text: "Random Poisson sampling leaves physical 0x coverage gaps where no reads happened to land.", correct: true, feedback: "Spot on! By Lander-Waterman statistics, random shotgun sampling at low depth leaves stochastic gaps with zero reads, physically breaking the assembly." },
      { id: 'c', text: "Phred scores are always lower when coverage is low.", correct: false, feedback: "Per-base Phred quality is a property of the sequencing chemistry/optics, independent of how many reads you sequence." }
    ]
  },
  2: {
    question: "In the De Bruijn graph above, what happens when you choose a k-mer size that is SHORTER than a repetitive sequence in the genome?",
    options: [
      { id: 'a', text: "The repeat collapses into a central node/loop with multiple incoming and outgoing paths, making the true order ambiguous.", correct: true, feedback: "Correct! When k is smaller than the repeat, identical k-mers from different genomic copies merge into the exact same graph nodes." },
      { id: 'b', text: "The graph shatters into unconnected fragments.", correct: false, feedback: "Graph fragmentation happens when k is too LARGE (approaching read length), leaving no k-1 overlap between adjacent reads." },
      { id: 'c', text: "It creates a dead-end tip on the graph.", correct: false, feedback: "Tips and bubbles are caused by sequencing errors (SNPs/indels) near the end or middle of reads, not repeats." }
    ]
  },
  3: {
    question: "An E. coli genome (~4.6 Mb) has seven nearly identical 5,000 bp rRNA (rrn) operons. Why can't standard 150 bp paired-end reads (450 bp insert size) assemble this into 1 circular chromosome?",
    options: [
      { id: 'a', text: "Because E. coli has linear chromosomes.", correct: false, feedback: "E. coli has a single circular chromosome." },
      { id: 'b', text: "Both the read length (150 bp) and paired-end insert size (450 bp) are shorter than the 5,000 bp repeat, so neither k-mers nor read pairs can bridge across unique flanking regions.", correct: true, feedback: "Exactly! To span a repeat, you need either reads or mate-pair inserts longer than the repeat itself (e.g., Oxford Nanopore or PacBio long reads)." },
      { id: 'c', text: "SPAdes cannot process rRNA sequences because they are high in GC content.", correct: false, feedback: "rRNA operons are actually well-covered in sequencing data; the issue is strictly mathematical graph ambiguity." }
    ]
  },
  4: {
    question: "In Frame +2 of our contig, there are two small ORFs (<120 bp) with no upstream Shine-Dalgarno (AGGAGG) motif. How does Prodigal treat them?",
    options: [
      { id: 'a', text: "It annotates them as valid genes because every ATG-to-Stop interval is a gene.", correct: false, feedback: "In random DNA, stop codons occur roughly every 21 codons by chance! Calling every small ORF would flood the genome with false positives." },
      { id: 'b', text: "It rejects them as likely random open reading frames because they lack coding hexamer bias, sufficient length, and an upstream RBS.", correct: true, feedback: "Correct! Bacterial gene callers score ORFs using hexamer coding frequency, length, start codon type (ATG>GTG>TTG), and upstream RBS motifs." },
      { id: 'c', text: "It merges them with Frame +1.", correct: false, feedback: "Reading frames are distinct translations shifted by 1 base; they aren't merged unless a programmed ribosomal frameshift is modeled." }
    ]
  },
  5: {
    question: "Look at CDS_002 ('The Domain Trap'). Why is annotating it as 'ATP-dependent DNA helicase PcrA' a serious bioinformatics error?",
    options: [
      { id: 'a', text: "Because the E-value (1e-42) is too high to be statistically significant.", correct: false, feedback: "An E-value of 1e-42 is extremely significant statistically—it confirms the short domain is real, not that the whole protein is PcrA!" },
      { id: 'b', text: "Because the alignment only covers 16% of our protein (a shared ATP-binding Walker A motif), whereas the rest of the protein is a completely different family.", correct: true, feedback: "Bravo! Many unrelated proteins share conserved domains (like ATP-binding cassettes). High identity over 15% query coverage only annotates the domain, not the full protein's function." },
      { id: 'c', text: "Because you should always pick the hit with the highest % identity regardless of length.", correct: false, feedback: "Relying purely on % identity or E-value without checking query coverage (>70-80%) is the #1 cause of misannotation in public databases." }
    ]
  }
};

// ==========================================
// MODULE 1: READ QC & COVERAGE COMPONENT
// ==========================================
function Module1QC() {
  const [coverage, setCoverage] = useState(8);
  const [errorRate, setErrorRate] = useState(2.5);
  const [trimmed, setTrimmed] = useState(false);

  // Realistic non-uniform read generator over a 100-bin (1,000 bp) locus
  const { reads, depthTrack, zeroBins, lowDepthBins, effectiveCoverage } = useMemo(() => {
    // Each read spans 15 bins (150 bp out of 1,000 bp) -> numReads = coverage * (100 / 15)
    const readLen = trimmed ? 13 : 15;
    const numReads = Math.max(3, Math.round(coverage * 6.5));
    const generatedReads = [];
    const depth = new Array(100).fill(0);

    // Non-uniform genome positions (simulating realistic GC-bias / stochastic Poisson clustering)
    const pseudoPositions = [
      2, 68, 14, 73, 45, 5, 81, 48, 12, 70, 84, 42, 7, 65, 18, 76, 50, 9, 83, 46,
      1, 67, 15, 72, 43, 4, 79, 52, 11, 74, 62, 22, 85, 38, 16, 69, 49, 8, 80, 44,
      34, 58, 25, 60, 31, 55, 27, 63, 35, 57, 29, 82, 3, 71, 19, 77, 47, 10, 66, 41
    ];

    for (let i = 0; i < numReads; i++) {
      let start;
      if (i < pseudoPositions.length) {
        start = pseudoPositions[i];
      } else {
        // Fill remaining regions as coverage climbs past ~12x-16x
        start = ((i * 17 + 23) % (100 - readLen));
      }
      start = Math.min(100 - readLen, Math.max(0, start));
      const end = start + readLen;

      // Determine errors
      const has3PrimeError = !trimmed && ((i * 19 + 3) % 10 < errorRate * 2.2);
      const hasMidError = ((i * 29 + 7) % 100) < (errorRate * 9);
      const midErrorBin = start + Math.floor(readLen * 0.5);

      generatedReads.push({
        id: i,
        start,
        end,
        row: i % 10,
        has3PrimeError,
        hasMidError,
        errorPos: midErrorBin
      });

      for (let pos = start; pos < end; pos++) {
        if (pos >= 0 && pos < 100) {
          // If this specific base has a sequencing error or un-trimmed 3' error, it fails to contribute to true k-mer depth!
          const isCorrupted3Prime = has3PrimeError && pos >= end - 3;
          const isCorruptedMid = hasMidError && pos === midErrorBin;
          if (!isCorrupted3Prime && !isCorruptedMid) {
            depth[pos]++;
          }
        }
      }
    }

    const zeros = depth.filter(d => d === 0).length;
    const lowBins = depth.filter(d => d > 0 && d < 3).length;
    const effCov = (depth.reduce((a, b) => a + b, 0) / 100).toFixed(1);

    return {
      reads: generatedReads,
      depthTrack: depth,
      zeroBins: zeros,
      lowDepthBins: lowBins,
      effectiveCoverage: effCov
    };
  }, [coverage, errorRate, trimmed]);

  // Lander-Waterman expected contigs in a 4.6 Mb genome
  const estContigsFromDepth = useMemo(() => {
    const poissonGaps = Math.round(zeroBins * 38 + lowDepthBins * 8);
    const errorPenalty = !trimmed && errorRate > 1.5 ? Math.round(errorRate * 28) : 0;
    return Math.max(42, 42 + poissonGaps + errorPenalty);
  }, [zeroBins, lowDepthBins, errorRate, trimmed]);

  return (
    <div className="space-y-6">
      {/* Controls & Live Metrics Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Illumina Short-Read Simulator Controls
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
              2 × 150 bp Paired-End
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coverage Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 font-medium">Sequencing Depth (Coverage)</span>
                <span className={`font-mono font-bold ${
                  coverage < 20 ? 'text-rose-400' : coverage <= 60 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {coverage}x {coverage < 20 ? '(Dropout Prone!)' : coverage <= 55 ? '(Sweet Spot)' : '(High/Redundant)'}
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="70"
                step="2"
                value={coverage}
                onChange={(e) => setCoverage(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>4x (Many 0x gaps)</span>
                <span>30x–50x (Optimal)</span>
                <span>70x</span>
              </div>
            </div>

            {/* Raw 3' Error Rate Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 font-medium">Sequencing Error &amp; 3&apos; Adapter Rate</span>
                <span className={`font-mono font-bold ${errorRate > 2 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {errorRate}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.5"
                step="0.5"
                value={errorRate}
                onChange={(e) => setErrorRate(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0.5% (Clean)</span>
                <span>2.5% (Typical raw)</span>
                <span>4.5% (Corrupts k-mers)</span>
              </div>
            </div>
          </div>

          {/* Fastp Quality Trimming Toggle */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-cyan-400" />
                Run <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">fastp</code> Sliding-Window Quality &amp; Adapter Trimming
              </div>
              <p className="text-xs text-slate-400">
                Clips low-Phred (<code className="text-slate-300">Q&lt;20</code>) 3&apos; tails (red ends) before assembly so they don&apos;t poison the graph.
              </p>
            </div>
            <button
              onClick={() => setTrimmed(!trimmed)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 shrink-0 ${
                trimmed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30'
              }`}
            >
              <Scissors className="w-4 h-4" />
              {trimmed ? '3\' Tails Trimmed (Active)' : 'Trim Low-Quality 3\' Tails'}
            </button>
          </div>
        </div>

        {/* Lander-Waterman Live Stats Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Predicted Assembly Impact
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Notice how <strong className="text-slate-200">low coverage (4x–14x)</strong> or <strong className="text-slate-200">high error rates</strong> create physical <span className="text-rose-400 font-semibold">0x dropout gaps</span>:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">0x Coverage Gaps</div>
              <div className={`text-2xl font-bold font-mono mt-0.5 ${zeroBins > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {zeroBins}%
              </div>
              <div className="text-[11px] text-slate-400">
                {lowDepthBins > 0 ? `+ ${lowDepthBins}% fragile (<3x)` : 'All bases ≥3x covered'}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Est. Total Contigs</div>
              <div className={`text-2xl font-bold font-mono mt-0.5 ${
                estContigsFromDepth > 90 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                ~{estContigsFromDepth}
              </div>
              <div className="text-[11px] text-slate-400">across 4.6 Mb genome</div>
            </div>
          </div>

          <div className="text-xs p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Usable Error-Free Depth:</span>
              <span className="font-mono text-white">{effectiveCoverage}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">3&apos; False k-mer Status:</span>
              <span className={`font-mono ${trimmed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trimmed ? 'Removed (Clean)' : 'Poisoning Graph!'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Track: Reference + Read Pileup + Phred Score Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Read Pileup Canvas (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-semibold text-white text-sm">
                Live Read Pileup &amp; Depth Histogram (1,000 bp Bacterial Locus)
              </h4>
              <p className="text-xs text-slate-400">
                Red vertical columns show <span className="text-rose-400 font-semibold">0x coverage gaps</span> where no error-free reads span the reference—forcing the contig to break!
              </p>
            </div>
          </div>

          {/* Complete Legend Explaining Every Visual Element */}
          <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-950/90 px-3.5 py-2.5 rounded-lg border border-slate-800">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-2.5 rounded-sm bg-emerald-500 inline-block"></span> Safe Depth (≥3x)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-2.5 rounded-sm bg-amber-500 inline-block"></span> Fragile Depth (1–2x)
            </span>
            <span className="flex items-center gap-1.5 text-rose-300 font-medium">
              <span className="w-3 h-2.5 rounded-sm bg-rose-500 inline-block"></span> 0x Dropout Gap (Breaks Assembly!)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-2 rounded-sm bg-cyan-500 inline-block"></span> 150 bp Read
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Random Internal SNP Error (Q&lt;20 basecall)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-2 rounded-sm bg-rose-500 inline-block"></span> Un-trimmed 3&apos; Error / Adapter Tail
            </span>
          </div>

          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 overflow-hidden">
            <svg viewBox="0 0 650 245" className="w-full h-auto">
              {/* Y-Axis for Depth Histogram */}
              <text x="4" y="13" fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                DEPTH
              </text>
              <line x1="42" y1="16" x2="42" y2="68" stroke="#475569" strokeWidth="1" />
              {/* Y-Axis ticks & horizontal guide lines */}
              <text x="8" y="22" fill="#64748b" fontSize="9" fontFamily="monospace">≥20x</text>
              <line x1="42" y1="19" x2="642" y2="19" stroke="#1e293b" strokeDasharray="2,2" strokeWidth="1" />

              <text x="14" y="43" fill="#64748b" fontSize="9" fontFamily="monospace">10x</text>
              <line x1="42" y1="40" x2="642" y2="40" stroke="#1e293b" strokeDasharray="2,2" strokeWidth="1" />

              <text x="19" y="67" fill="#f43f5e" fontSize="9" fontFamily="monospace">0x</text>
              <line x1="42" y1="68" x2="642" y2="68" stroke="#475569" strokeWidth="1" />

              {/* Reference Locus Label */}
              <text x="4" y="79" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">
                REF DNA
              </text>

              {depthTrack.map((d, idx) => {
                const barH = Math.min(48, d * 2.4);
                const x = 44 + idx * 5.95;
                return (
                  <g key={idx}>
                    {/* Coverage Histogram Bar */}
                    <rect
                      x={x}
                      y={68 - barH}
                      width="5.1"
                      height={Math.max(2, barH)}
                      fill={d === 0 ? '#f43f5e' : d < 3 ? '#f59e0b' : '#10b981'}
                      opacity="0.9"
                    />
                    {/* Reference track bar */}
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

              {/* Highlight 0x dropout zones vertically */}
              {depthTrack.map((d, idx) =>
                d === 0 ? (
                  <g key={`drop-${idx}`}>
                    <rect
                      x={44 + idx * 5.95}
                      y="18"
                      width="5.95"
                      height="215"
                      fill="#f43f5e"
                      opacity="0.18"
                    />
                  </g>
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
                    {/* Un-trimmed 3' noisy tail */}
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

        {/* FastQC Per-Base Sequence Quality Plot */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="font-semibold text-white text-sm flex items-center justify-between">
              <span>FastQC: Per-Base Phred Score</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                trimmed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {trimmed ? 'PASS (Trimmed)' : 'WARN: 3\' Drop'}
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Illumina quality degrades toward the 3&apos; end (cycles 120–150) due to phasing and fluorophore decay.
            </p>
          </div>

          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
            <svg viewBox="0 0 260 165" className="w-full h-auto">
              {/* Background Phred Zones */}
              <rect x="30" y="10" width="220" height="75" fill="#10b981" opacity="0.12" />
              <rect x="30" y="85" width="220" height="35" fill="#f59e0b" opacity="0.12" />
              <rect x="30" y="120" width="220" height="25" fill="#f43f5e" opacity="0.15" />

              {/* Y-axis labels */}
              <text x="6" y="22" fill="#10b981" fontSize="9" fontFamily="monospace">Q40</text>
              <text x="6" y="85" fill="#f59e0b" fontSize="9" fontFamily="monospace">Q28</text>
              <text x="6" y="122" fill="#f43f5e" fontSize="9" fontFamily="monospace">Q20</text>
              <text x="6" y="143" fill="#94a3b8" fontSize="9" fontFamily="monospace">Q10</text>

              {/* Q20 threshold line */}
              <line x1="30" y1="120" x2="250" y2="120" stroke="#f43f5e" strokeDasharray="3,3" strokeWidth="1" />

              {/* Quality Curve */}
              <path
                d={
                  trimmed
                    ? 'M 35 28 Q 120 26, 175 40 L 215 68'
                    : `M 35 28 Q 120 30, 165 55 T 245 ${Math.min(142, 98 + errorRate * 10)}`
                }
                fill="none"
                stroke={trimmed ? '#10b981' : '#f43f5e'}
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* X-axis labels */}
              <text x="32" y="158" fill="#94a3b8" fontSize="9" fontFamily="monospace">1 bp</text>
              <text x="115" y="158" fill="#94a3b8" fontSize="9" fontFamily="monospace">75 bp</text>
              <text x="205" y="158" fill="#94a3b8" fontSize="9" fontFamily="monospace">{trimmed ? '130 bp' : '150 bp'}</text>
            </svg>
          </div>

          <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded border border-slate-800 space-y-1">
            <div>
              <strong className="text-amber-300">What are the Yellow Dots?</strong> Random internal basecall errors (SNPs) caused by optical noise. Because they occur at different random positions in single reads, high depth (≥30x) easily outvotes them!
            </div>
            <div>
              <strong className="text-rose-300">What are the Red Tails?</strong> Systematic 3&apos; quality drop &amp; adapter read-through at the end of reads—must be trimmed with <code className="text-cyan-300">fastp</code>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODULE 2: DE BRUIJN GRAPH SANDBOX COMPONENT
// ==========================================
function Module2DBG() {
  const [kSize, setKSize] = useState(5);
  const [stepIdx, setStepIdx] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [cleaned, setCleaned] = useState(false);

  // Toy genome sequence (16 bp) with a 4 bp repeat "GCTA"
  const TOY_SEQ = 'ATGGCTACCGCTATTA';

  // Generate actual sliding window k-mers and (k-1) prefix/suffix overlaps
  const kmerList = useMemo(() => {
    const list = [];
    for (let i = 0; i <= TOY_SEQ.length - kSize; i++) {
      const kmer = TOY_SEQ.slice(i, i + kSize);
      const prefix = kmer.slice(0, kSize - 1);
      const suffix = kmer.slice(1);
      const isInRepeat = (i >= 3 && i + kSize <= 7) || (i >= 9 && i + kSize <= 13);
      list.push({
        index: i,
        kmer,
        prefix,
        suffix,
        isInRepeat
      });
    }
    return list;
  }, [kSize]);

  const activeKmer = kmerList[Math.min(stepIdx, kmerList.length - 1)] || kmerList[0];

  const handleSelectK = (newK) => {
    setKSize(newK);
    setStepIdx(0);
  };

  const handleToggleError = () => {
    if (!hasError) {
      setHasError(true);
      setCleaned(false);
    } else {
      setHasError(false);
      setCleaned(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Interactive Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              Interactive k-mer Chopper &amp; De Bruijn Graph Builder
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Our 16 bp bacterial locus contains two identical copies of a <span className="text-amber-400 font-semibold">4 bp repeat (GCTA)</span>. Step through the reads below to see how <code className="text-emerald-300">(k-1)</code> overlaps link nodes together!
            </p>
          </div>

          {/* Toy DNA Sequence Pill with Repeat Highlight */}
          <div className="bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800 font-mono text-sm tracking-wider flex items-center gap-1">
            <span className="text-xs text-slate-400 mr-1 font-sans">5&apos;</span>
            <span className="text-cyan-400">ATG</span>
            <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 font-bold" title="Repeat Copy 1">
              GCTA
            </span>
            <span className="text-emerald-400">CC</span>
            <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 font-bold" title="Repeat Copy 2">
              GCTA
            </span>
            <span className="text-purple-400">TTA</span>
            <span className="text-xs text-slate-400 ml-1 font-sans">3&apos;</span>
          </div>
        </div>

        {/* 3 Control Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. k-mer size selector */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1. Choose k-mer Size (Repeat = 4 bp)
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: 3, label: 'k = 3', sub: 'Collapses Repeat' },
                { k: 5, label: 'k = 5', sub: 'Resolves Repeat!' },
                { k: 9, label: 'k = 9', sub: 'Breaks Overlap' }
              ].map((item) => (
                <button
                  key={item.k}
                  onClick={() => handleSelectK(item.k)}
                  className={`p-2 rounded-lg border text-center transition ${
                    kSize === item.k
                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-mono text-sm">{item.label}</div>
                  <div className="text-[10px] opacity-80">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Inject Sequencing Error */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between space-y-2">
            <div>
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Sequencing Error Simulation
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                A single mutated base in 1 read creates <code className="text-rose-400">k</code> false k-mers that diverge and re-join as a <span className="text-rose-400 font-semibold">Bubble</span> or dead-end <span className="text-amber-400 font-semibold">Tip</span>.
              </p>
            </div>
            <button
              onClick={handleToggleError}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition border ${
                hasError
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {hasError ? 'Remove Sequencing Errors' : '+ Inject Read with SNP & 3\' Error'}
            </button>
          </div>

          {/* 3. Graph Simplification */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between space-y-2">
            <div>
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                3. Graph Simplification (SPAdes)
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                SPAdes checks k-mer coverage depth: true paths have <span className="text-emerald-400">30x depth</span> while error branches have <span className="text-rose-400">1x depth</span>.
              </p>
            </div>
            <button
              disabled={!hasError || cleaned}
              onClick={() => setCleaned(true)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                !hasError
                  ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                  : cleaned
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {cleaned ? 'Tips Clipped & Bubbles Popped!' : 'Clip 1x Tips & Pop Error Bubbles'}
            </button>
          </div>
        </div>

        {/* NEW: Interactive Sliding-Window k-mer Overlap Inspector */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Interactive Sliding Window: How k-mers Share a (k−1 = {kSize - 1} bp) Overlap
              </h4>
              <p className="text-xs text-slate-400">
                Click any k-mer pill or drag the slider to see how each <strong className="text-white">{kSize}-mer</strong> edge connects its <span className="text-cyan-300">Left (k−1) Node</span> to its <span className="text-purple-300">Right (k−1) Node</span>:
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
              >
                ← Prev k-mer
              </button>
              <span className="text-xs font-mono text-slate-300">
                k-mer #{activeKmer.index + 1} of {kmerList.length}
              </span>
              <button
                onClick={() => setStepIdx(Math.min(kmerList.length - 1, stepIdx + 1))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
              >
                Next k-mer →
              </button>
            </div>
          </div>

          {/* Character-by-character DNA alignment with sliding k-mer box */}
          <div className="overflow-x-auto pb-1">
            <div className="inline-flex flex-col space-y-1.5 min-w-full">
              {/* Reference bases row */}
              <div className="flex items-center gap-1">
                <span className="w-24 text-[11px] font-mono text-slate-400 shrink-0">Reference:</span>
                {TOY_SEQ.split('').map((base, idx) => {
                  const inCurrentWindow = idx >= activeKmer.index && idx < activeKmer.index + kSize;
                  const isRepeatBase = (idx >= 3 && idx <= 6) || (idx >= 9 && idx <= 12);
                  return (
                    <div
                      key={idx}
                      onClick={() => setStepIdx(Math.min(kmerList.length - 1, idx))}
                      className={`w-7 h-7 rounded flex items-center justify-center font-mono text-xs font-bold cursor-pointer transition border ${
                        inCurrentWindow
                          ? 'bg-emerald-500/30 border-emerald-400 text-white scale-105 shadow'
                          : isRepeatBase
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {base}
                    </div>
                  );
                })}
              </div>

              {/* Active k-mer prefix -> suffix breakdown */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                  Current {kSize}-mer Edge:{' '}
                  <strong className="text-emerald-400">{activeKmer.kmer}</strong>
                </div>
                <span className="text-slate-400">splits into →</span>
                <div className="bg-cyan-950/50 border border-cyan-500/40 px-3 py-1.5 rounded-lg font-mono text-cyan-200">
                  Left Node ({kSize - 1}-mer Prefix): <strong>{activeKmer.prefix}</strong>
                </div>
                <span className="text-emerald-400 font-bold">──({activeKmer.kmer})──►</span>
                <div className="bg-purple-950/50 border border-purple-500/40 px-3 py-1.5 rounded-lg font-mono text-purple-200">
                  Right Node ({kSize - 1}-mer Suffix): <strong>{activeKmer.suffix}</strong>
                </div>
                <span className="text-slate-400 text-[11px]">
                  (Notice that the <span className="text-purple-300">Right Node</span> of k-mer #{activeKmer.index + 1} is the exact <span className="text-cyan-300">Left Node</span> of k-mer #{activeKmer.index + 2}!)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Interactive SVG De Bruijn Graph */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-semibold text-white text-sm">
              Resulting De Bruijn Graph Topology (k = {kSize}, Node Overlap = {kSize - 1} bp)
            </h4>
            <p className="text-xs text-slate-400">
              {kSize === 3 &&
                'COLLAPSED REPEAT: Because k=3 is shorter than the 4 bp repeat (GCTA), the 3-mers "GCT" and "CTA" from Copy 1 and Copy 2 merge into the exact same central node! The assembler cannot tell which exit path to take.'}
              {kSize === 5 &&
                'RESOLVED LINEAR PATH: Because k=5 is longer than the 4 bp repeat (GCTA), every 5-mer spans into unique flanking DNA (e.g., TGGCT vs CGCTA). Copy 1 and Copy 2 stay completely separate!'}
              {kSize === 9 &&
                'BROKEN OVERLAP: When k=9 is too close to the short read length, adjacent reads fail to share a full 8 bp (k-1) overlap wherever depth dips, shattering the graph into disconnected pieces.'}
            </p>
          </div>
          <span className={`text-xs font-mono px-3 py-1 rounded-full border ${
            kSize === 5 && (!hasError || cleaned)
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          }`}>
            {kSize === 3 && 'Output: 3 Fragmented Contigs (Repeat Collapsed)'}
            {kSize === 5 && (!hasError || cleaned) && 'Output: 1 Complete Contig (ATGGCTACCGCTATTA)'}
            {kSize === 5 && hasError && !cleaned && 'Output: Contig Broken at Error Bubble'}
            {kSize === 9 && 'Output: Disconnected Contig Fragments'}
          </span>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
          <svg viewBox="0 0 760 265" className="w-full h-auto">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
              </marker>
              <marker id="arrow-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
              <marker id="arrow-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
              </marker>
            </defs>

            {/* CASE 1: k = 3 (Collapsed Repeat Loop) */}
            {kSize === 3 && (
              <g>
                {/* Incoming 5' unique */}
                <line x1="135" y1="135" x2="245" y2="135" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#arrow)" />
                <text x="155" y="125" fill="#67e8f9" fontSize="10" fontFamily="monospace">ATG→TGG</text>

                {/* Self Loop for CC spacer between the two GCTA repeats */}
                <path d="M 335 108 C 300 20, 460 20, 425 108" fill="none" stroke="#f59e0b" strokeWidth="3.5" markerEnd="url(#arrow)" />
                <text x="315" y="34" fill="#fbbf24" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  Spacer Loop: TAC → ACC → CCG → CGC (30x)
                </text>

                {/* Outgoing 3' unique */}
                <line x1="505" y1="135" x2="610" y2="135" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                <text x="522" y="125" fill="#d8b4fe" fontSize="10" fontFamily="monospace">TAT→ATT</text>

                {/* Left Node */}
                <rect x="25" y="112" width="110" height="46" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" />
                <text x="42" y="135" fill="#67e8f9" fontSize="12" fontFamily="monospace" fontWeight="bold">AT → TG</text>
                <text x="42" y="150" fill="#94a3b8" fontSize="9.5">5&apos; Start (30x)</text>

                {/* Central Collapsed Repeat Node */}
                <rect x="250" y="108" width="255" height="56" rx="10" fill="#451a03" stroke="#f59e0b" strokeWidth="3" />
                <text x="270" y="133" fill="#fde68a" fontSize="13" fontFamily="monospace" fontWeight="bold">
                  GC ──(GCT)──► CT ──(CTA)──► TA
                </text>
                <text x="270" y="152" fill="#fbbf24" fontSize="10">
                  Collapsed Repeat Node! (60x Depth = 2 Copies Merged)
                </text>

                {/* Right Node */}
                <rect x="615" y="112" width="115" height="46" rx="8" fill="#0f172a" stroke="#a855f7" strokeWidth="2.5" />
                <text x="632" y="135" fill="#d8b4fe" fontSize="12" fontFamily="monospace" fontWeight="bold">TT → TA</text>
                <text x="632" y="150" fill="#94a3b8" fontSize="9.5">3&apos; End (30x)</text>
              </g>
            )}

            {/* CASE 2: k = 5 (Optimal Linear Resolution showing explicit k-1 overlaps) */}
            {kSize === 5 && (
              <g>
                {/* Connecting Edges with 5-mer labels */}
                <line x1="140" y1="145" x2="215" y2="145" stroke="#10b981" strokeWidth="3.5" markerEnd="url(#arrow-emerald)" />
                <text x="150" y="136" fill="#6ee7b7" fontSize="9.5" fontFamily="monospace">GGCTA</text>

                <line x1="340" y1="145" x2="415" y2="145" stroke="#10b981" strokeWidth="3.5" markerEnd="url(#arrow-emerald)" />
                <text x="350" y="136" fill="#6ee7b7" fontSize="9.5" fontFamily="monospace">TACCG</text>

                <line x1="545" y1="145" x2="615" y2="145" stroke="#10b981" strokeWidth="3.5" markerEnd="url(#arrow-emerald)" />
                <text x="555" y="136" fill="#6ee7b7" fontSize="9.5" fontFamily="monospace">CTATT</text>

                {/* Node 1: Copy 1 */}
                <rect
                  x="20"
                  y="118"
                  width="120"
                  height="54"
                  rx="8"
                  fill={activeKmer.index <= 2 ? '#064e3b' : '#0f172a'}
                  stroke="#10b981"
                  strokeWidth={activeKmer.index <= 2 ? '3.5' : '2'}
                />
                <text x="32" y="140" fill="#6ee7b7" fontSize="11.5" fontFamily="monospace" fontWeight="bold">ATGG → GCTA</text>
                <text x="32" y="156" fill="#fde68a" fontSize="9.5">Repeat Copy #1 (30x)</text>

                {/* Node 2: Unique Spacer */}
                <rect
                  x="220"
                  y="118"
                  width="120"
                  height="54"
                  rx="8"
                  fill={activeKmer.index > 2 && activeKmer.index <= 5 ? '#064e3b' : '#0f172a'}
                  stroke="#10b981"
                  strokeWidth={activeKmer.index > 2 && activeKmer.index <= 5 ? '3.5' : '2'}
                />
                <text x="232" y="140" fill="#6ee7b7" fontSize="11.5" fontFamily="monospace" fontWeight="bold">CTAC → ACCG</text>
                <text x="232" y="156" fill="#94a3b8" fontSize="9.5">Unique Bridge (30x)</text>

                {/* Node 3: Copy 2 */}
                <rect
                  x="420"
                  y="118"
                  width="125"
                  height="54"
                  rx="8"
                  fill={activeKmer.index > 5 && activeKmer.index <= 8 ? '#064e3b' : '#0f172a'}
                  stroke="#10b981"
                  strokeWidth={activeKmer.index > 5 && activeKmer.index <= 8 ? '3.5' : '2'}
                />
                <text x="432" y="140" fill="#6ee7b7" fontSize="11.5" fontFamily="monospace" fontWeight="bold">CCGC → GCTA</text>
                <text x="432" y="156" fill="#fde68a" fontSize="9.5">Repeat Copy #2 (30x)</text>

                {/* Node 4: 3' End */}
                <rect
                  x="620"
                  y="118"
                  width="120"
                  height="54"
                  rx="8"
                  fill={activeKmer.index > 8 ? '#064e3b' : '#0f172a'}
                  stroke="#10b981"
                  strokeWidth={activeKmer.index > 8 ? '3.5' : '2'}
                />
                <text x="632" y="140" fill="#6ee7b7" fontSize="11.5" fontFamily="monospace" fontWeight="bold">TATT → ATTA</text>
                <text x="632" y="156" fill="#94a3b8" fontSize="9.5">3&apos; Terminus (30x)</text>
              </g>
            )}

            {/* CASE 3: k = 9 (Broken by Lack of 8 bp Overlap) */}
            {kSize === 9 && (
              <g>
                <rect x="30" y="120" width="190" height="52" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                <text x="45" y="144" fill="#fde68a" fontSize="12" fontFamily="monospace" fontWeight="bold">ATGGCTACC</text>
                <text x="45" y="160" fill="#94a3b8" fontSize="10">Isolated Contig 1</text>

                <text x="235" y="148" fill="#f43f5e" fontSize="11" fontWeight="bold">✗ Missing 8 bp Overlap</text>

                <rect x="375" y="120" width="175" height="52" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                <text x="392" y="144" fill="#fde68a" fontSize="12" fontFamily="monospace" fontWeight="bold">CTACCGCTA</text>
                <text x="392" y="160" fill="#94a3b8" fontSize="10">Isolated Contig 2</text>

                <text x="560" y="148" fill="#f43f5e" fontSize="11" fontWeight="bold">✗ Gap</text>

                <rect x="615" y="120" width="125" height="52" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                <text x="630" y="144" fill="#fde68a" fontSize="12" fontFamily="monospace" fontWeight="bold">CCGCTATTA</text>
                <text x="630" y="160" fill="#94a3b8" fontSize="10">Isolated Contig 3</text>
              </g>
            )}

            {/* ERROR OVERLAY: Bubble & Dead-End Tip */}
            {hasError && (
              <g opacity={cleaned ? 0.2 : 1}>
                {/* SNP Bubble in Middle */}
                <path d="M 280 118 Q 360 30, 465 118" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="5,3" markerEnd="url(#arrow-rose)" />
                <rect x="300" y="20" width="165" height="42" rx="6" fill="#4c0519" stroke="#f43f5e" strokeWidth="2" />
                <text x="312" y="39" fill="#fda4af" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  SNP Bubble: T(A→G)CCG
                </text>
                <text x="312" y="53" fill="#fecdd3" fontSize="9.5">
                  {cleaned ? 'Popped (1x vs 30x depth)!' : '1x depth false detour'}
                </text>

                {/* Dead-end 3' Tip */}
                <line x1="530" y1="172" x2="605" y2="230" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4,3" markerEnd="url(#arrow)" />
                <rect x="605" y="210" width="135" height="40" rx="6" fill="#451a03" stroke="#f59e0b" strokeWidth="2" />
                <text x="615" y="228" fill="#fde68a" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  3&apos; Tip: GCTAT(G)
                </text>
                <text x="615" y="242" fill="#fcd34d" fontSize="9.5">
                  {cleaned ? 'Clipped dead-end!' : '1x dead-end branch'}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Real-World SPAdes Multi-k Note */}
        <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3.5 text-xs text-slate-300 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">How SPAdes solves the k-mer trade-off in practice:</strong> Rather than forcing you to guess one <code className="text-emerald-300">k</code>, <strong>SPAdes</strong> builds a <em>multi-k</em> De Bruijn graph—starting at <code className="text-emerald-300">k=21</code> (where long <code className="text-emerald-300">k-1</code> overlaps aren&apos;t needed, bridging low-coverage regions) and iteratively feeding those contigs into <code className="text-emerald-300">k=33, 55, 77, 99, 127</code> to resolve repeats up to the 150 bp read length!
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODULE 3: REPEATS, SCAFFOLDING & QUAST QC
// ==========================================
function Module3Scaffolding() {
  const [showPairedEnd, setShowPairedEnd] = useState(false);
  const [showLongRead, setShowLongRead] = useState(false);
  const [selectedAssembly, setSelectedAssembly] = useState('optimal');

  const assemblies = {
    under: {
      name: 'Assembly A: Single Small k (k=21)',
      n50: '18,400 bp',
      l50: 74,
      contigs: 412,
      totalLen: '4,510,200 bp',
      gc: '50.7%',
      misassemblies: 0,
      busco: '94.2%',
      verdict: 'Too fragmented! Small k collapsed even minor repeats (like 300 bp insertion sequences) into hundreds of tiny contigs, splitting several genes across contig boundaries (lowering BUSCO to 94.2%).',
      bars: [22, 19, 18, 16, 15, 14, 12, 10, 9, 8]
    },
    optimal: {
      name: 'Assembly B: SPAdes Multi-k + Careful',
      n50: '142,500 bp',
      l50: 11,
      contigs: 54,
      totalLen: '4,638,900 bp',
      gc: '50.8%',
      misassemblies: 0,
      busco: '99.8%',
      verdict: 'Gold Standard Short-Read Draft! Stops conservatively at the boundary of multi-kilobase repeats (like the seven 5 kb rRNA operons) rather than guessing across them. Zero misassemblies!',
      bars: [48, 42, 36, 30, 25, 20, 16, 12, 8, 5]
    },
    chimeric: {
      name: 'Assembly C: Aggressive Over-Merger (Chimeric)',
      n50: '390,000 bp',
      l50: 4,
      contigs: 16,
      totalLen: '4,641,100 bp',
      gc: '50.8%',
      misassemblies: 14,
      busco: '98.1%',
      verdict: 'THE N50 TRAP! It boasts the highest N50 (390 kb), but achieved this by blindly joining contigs across identical 5 kb rRNA repeats—gluing the left flank of rRNA Copy #1 to the right flank of rRNA Copy #4!',
      bars: [85, 65, 45, 25, 12, 6, 4]
    }
  };

  const currentAsm = assemblies[selectedAssembly];

  return (
    <div className="space-y-6">
      {/* Part 1: Why Short Reads Stop at ~50 Contigs & What the 2 Technologies Do */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            The Bacterial Repeat Bottleneck: Why 150 bp Reads Yield ~50 Contigs
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            In a De Bruijn graph, any repeat longer than your read length (<code className="text-slate-200">150 bp</code>) breaks the assembly into separate contigs. Toggle the two technologies below to see how bioinformaticians bridge across repeats:
          </p>
        </div>

        {/* Explanatory Action Cards for the Two Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Technology 1: Illumina Paired-End Read Scaffolding
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Instead of sequencing just one end of a DNA fragment, we sequence <strong className="text-white">both ends (2 × 150 bp)</strong> of a <strong className="text-cyan-300">500 bp DNA fragment</strong>. If Read 1 lands in Contig 1 and its mate Read 2 lands in Contig 2, the assembler links them into a <strong>Scaffold</strong> (filling the unsequenced gap with <code className="text-amber-300">NNNN</code>s).
              </p>
            </div>
            <button
              onClick={() => setShowPairedEnd(!showPairedEnd)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                showPairedEnd
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500'
              }`}
            >
              {showPairedEnd ? '✓ Showing Paired-End Mate Links (500 bp Insert)' : '1. Test Paired-End Scaffolding (500 bp Insert)'}
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Technology 2: Hybrid Long-Read Resolution (Nanopore / PacBio)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A <strong className="text-amber-300">5,000 bp rRNA operon</strong> is 10× longer than a 500 bp Illumina fragment, so paired-end mates fall blindly inside the repeat! By adding <strong className="text-purple-300">10,000+ bp Oxford Nanopore reads</strong> (via <em>Unicycler / Hybracter</em>), a single read physically spans the entire rRNA operon.
              </p>
            </div>
            <button
              onClick={() => setShowLongRead(!showLongRead)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                showLongRead
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                  : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500'
              }`}
            >
              {showLongRead ? '✓ Showing Hybrid Nanopore Long Read (12,000 bp)' : '2. Test Hybrid Nanopore Long Read (12,000 bp)'}
            </button>
          </div>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
          <svg viewBox="0 0 760 205" className="w-full h-auto">
            {/* Contig 1 */}
            <rect x="20" y="85" width="160" height="32" rx="6" fill="#065f46" stroke="#10b981" strokeWidth="2" />
            <text x="48" y="105" fill="#ecfdf5" fontSize="12" fontWeight="bold">Contig 1 (Unique)</text>

            {/* Repeat 1: 350 bp miniature transposon / short repeat */}
            <rect x="186" y="85" width="90" height="32" rx="4" fill="#4c0519" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4,2" />
            <text x="195" y="100" fill="#fda4af" fontSize="10" fontWeight="bold">Short Repeat</text>
            <text x="207" y="112" fill="#fecdd3" fontSize="9">(350 bp)</text>

            {/* Contig 2 */}
            <rect x="282" y="85" width="165" height="32" rx="6" fill="#065f46" stroke="#10b981" strokeWidth="2" />
            <text x="315" y="105" fill="#ecfdf5" fontSize="12" fontWeight="bold">Contig 2 (Unique)</text>

            {/* Repeat 2: 5,000 bp rRNA Operon (16S-23S-5S) */}
            <rect x="453" y="80" width="155" height="42" rx="4" fill="#451a03" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="5,3" />
            <text x="468" y="99" fill="#fde68a" fontSize="11" fontWeight="bold">rRNA Operon (rrn)</text>
            <text x="470" y="113" fill="#fbbf24" fontSize="9">5,000 bp (7 copies in genome!)</text>

            {/* Contig 3 */}
            <rect x="614" y="85" width="125" height="32" rx="6" fill="#065f46" stroke="#10b981" strokeWidth="2" />
            <text x="635" y="105" fill="#ecfdf5" fontSize="12" fontWeight="bold">Contig 3</text>

            {/* Paired-End Read Arcs */}
            {showPairedEnd && (
              <g>
                {/* Bridges the 350 bp repeat! */}
                <path d="M 155 82 Q 231 20, 305 82" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
                <rect x="142" y="75" width="18" height="6" fill="#06b6d4" />
                <rect x="298" y="75" width="18" height="6" fill="#06b6d4" />
                <text x="120" y="34" fill="#67e8f9" fontSize="10" fontWeight="bold">
                  ✓ 500 bp Paired-End Insert bridges 350 bp repeat → Links Contig 1 &amp; 2 into Scaffold!
                </text>

                {/* Fails to bridge the 5,000 bp rRNA operon */}
                <path d="M 425 82 Q 465 42, 505 80" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3,3" />
                <rect x="415" y="75" width="18" height="6" fill="#f43f5e" />
                <rect x="498" y="75" width="18" height="6" fill="#f43f5e" />
                <text x="435" y="55" fill="#fda4af" fontSize="10" fontWeight="bold">
                  ✗ Mate lands INSIDE 5,000 bp rRNA repeat (Cannot bridge!)
                </text>
              </g>
            )}

            {/* Oxford Nanopore / PacBio Long Read */}
            {showLongRead && (
              <g>
                <rect x="45" y="150" width="670" height="16" rx="4" fill="#a855f7" opacity="0.9" />
                <text x="165" y="162" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  12,000 bp Oxford Nanopore Read (Anchors Contig 1 → Contig 2 → Contig 3 into 1 Closed Chromosome!)
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Part 2: Interactive QUAST Assembly Comparison & Misassembly Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-semibold text-white">
              QUAST Assembly Evaluation: Why Highest N50 Can Be a Chimeric Trap
            </h3>
            <p className="text-xs text-slate-400">
              Click each assembly below to compare contiguity (<code className="text-emerald-300">N50</code>) against structural accuracy (<code className="text-rose-300">Misassemblies</code>):
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'under', label: 'Assembly A (k=21 only)' },
              { id: 'optimal', label: 'Assembly B (SPAdes Careful)' },
              { id: 'chimeric', label: 'Assembly C (Over-Merged Trap)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedAssembly(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  selectedAssembly === tab.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Metrics Table */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-white">{currentAsm.name}</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400">N50 Length</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{currentAsm.n50}</div>
                <div className="text-[11px] text-slate-400">L50: {currentAsm.l50} contigs</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400"># of Contigs</div>
                <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">{currentAsm.contigs}</div>
                <div className="text-[11px] text-slate-400">Total: {currentAsm.totalLen}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-400">Misassemblies</div>
                <div className={`text-lg font-bold font-mono mt-0.5 ${
                  currentAsm.misassemblies > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {currentAsm.misassemblies}
                </div>
                <div className="text-[11px] text-slate-400">BUSCO: {currentAsm.busco}</div>
              </div>
            </div>

            <div className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
              selectedAssembly === 'optimal'
                ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-200'
                : selectedAssembly === 'chimeric'
                ? 'bg-rose-950/30 border-rose-700/50 text-rose-200'
                : 'bg-amber-950/30 border-amber-700/50 text-amber-200'
            }`}>
              <strong>QC Interpretation:</strong> {currentAsm.verdict}
            </div>
          </div>

          {/* Visual N50 Contig Cumulative Bar Chart */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Contigs Ordered Longest → Shortest</span>
              <span className="text-emerald-400 font-mono">50% Genome Mark (N50)</span>
            </div>
            <div className="relative h-28 flex items-end gap-1.5 pt-6 border-b border-slate-800">
              <div className="absolute left-1/2 top-0 bottom-0 border-l-2 border-dashed border-emerald-500/70 z-10 flex items-start">
                <span className="bg-emerald-950 text-emerald-300 text-[10px] font-mono px-1.5 py-0.5 rounded ml-1">
                  50% of 4.6 Mb
                </span>
              </div>

              {currentAsm.bars.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%`, width: `${100 / currentAsm.bars.length}%` }}
                  className={`rounded-t transition-all ${
                    selectedAssembly === 'chimeric' && i < 2
                      ? 'bg-rose-500/80 border border-rose-400'
                      : 'bg-cyan-500/70 border border-cyan-400'
                  }`}
                  title={`Contig ${i + 1}`}
                />
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              <strong>What is N50?</strong> Line up all contigs from longest to shortest; <strong>N50</strong> is the length of the contig that crosses the 50% mark of total assembly size.
            </p>
          </div>
        </div>

        {/* Dedicated Visual Diagram Explaining What a Misassembly Is & Why It's Dangerous */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            Anatomy of a Misassembly: Why Chimeric Contigs Ruin Downstream Biology
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                A <strong className="text-white">misassembly (chimera)</strong> happens when an assembler encounters a multi-copy repeat (like <code className="text-amber-300">rRNA Copy #1</code> and <code className="text-amber-300">rRNA Copy #2</code> located 1 Mb apart) and guesses the wrong exit path out of the repeat node.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>
                  <strong className="text-rose-300">False Chromosomal Rearrangements:</strong> Creates fake inversions or translocations that look like evolutionary mutations in synteny plots (Mauve/MUMmer).
                </li>
                <li>
                  <strong className="text-rose-300">Broken Operons &amp; Fake Pathogenicity Islands:</strong> Can artificially stitch a resistance gene next to a housekeeping region or split a biosynthetic gene cluster in half.
                </li>
                <li>
                  <strong className="text-emerald-300">Why SPAdes --careful is better:</strong> It is always safer to have <strong>54 honest contigs</strong> that stop cleanly at repeat boundaries than <strong>16 chimeric contigs</strong> with false biology!
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <svg viewBox="0 0 420 120" className="w-full h-auto">
                <text x="10" y="18" fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  TRUE CHROMOSOME ORDER:
                </text>
                <rect x="10" y="24" width="95" height="22" rx="4" fill="#065f46" />
                <text x="24" y="39" fill="#ffffff" fontSize="10" fontFamily="monospace">Region A</text>
                <rect x="110" y="24" width="65" height="22" rx="4" fill="#b45309" />
                <text x="120" y="39" fill="#fde68a" fontSize="10" fontFamily="monospace">rRNA #1</text>
                <rect x="180" y="24" width="95" height="22" rx="4" fill="#0e7490" />
                <text x="196" y="39" fill="#ffffff" fontSize="10" fontFamily="monospace">Region B</text>
                <rect x="280" y="24" width="65" height="22" rx="4" fill="#b45309" />
                <text x="290" y="39" fill="#fde68a" fontSize="10" fontFamily="monospace">rRNA #2</text>
                <rect x="350" y="24" width="60" height="22" rx="4" fill="#6d28d9" />
                <text x="356" y="39" fill="#ffffff" fontSize="10" fontFamily="monospace">Region C</text>

                <text x="10" y="74" fill="#f43f5e" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  ASSEMBLY C (CHIMERIC MISASSEMBLY across rRNA):
                </text>
                <rect x="10" y="80" width="95" height="24" rx="4" fill="#065f46" stroke="#f43f5e" strokeWidth="1.5" />
                <text x="24" y="96" fill="#ffffff" fontSize="10" fontFamily="monospace">Region A</text>
                <rect x="110" y="80" width="65" height="24" rx="4" fill="#b45309" stroke="#f43f5e" strokeWidth="1.5" />
                <text x="120" y="96" fill="#fde68a" fontSize="10" fontFamily="monospace">rRNA</text>
                <rect x="180" y="80" width="95" height="24" rx="4" fill="#6d28d9" stroke="#f43f5e" strokeWidth="2" />
                <text x="190" y="96" fill="#fda4af" fontSize="10" fontFamily="monospace" fontWeight="bold">Region C (!)</text>
                <text x="285" y="96" fill="#f43f5e" fontSize="9.5" fontWeight="bold">
                  ← False Join! (Skipped Region B)
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODULE 4: STRUCTURAL ANNOTATION (PRODIGAL)
// ==========================================
function Module4Structural() {
  const [minLengthFilter, setMinLengthFilter] = useState(false);
  const [requireRBS, setRequireRBS] = useState(false);
  const [selectedOrfId, setSelectedOrfId] = useState('orf1');

  // Redesigned ORFs so Filter 1 (Length) and Filter 2 (RBS + Hexamer Score) have distinct, complementary effects!
  const ORFS = [
    {
      id: 'orf1',
      name: 'Candidate_1 (dnaA)',
      frame: '+1',
      start: 40,
      end: 270,
      strand: '+',
      lengthBp: 1356,
      startCodon: 'ATG',
      stopCodon: 'TAA',
      hasRBS: true,
      rbsMotif: 'AGGAGG (7 bp upstream)',
      gcCodingScore: '+48.2 (Strong coding bias)',
      isTrueGene: true,
      rejectedBy: 'Passes Both Filters (True CDS)',
      explanation: 'High-confidence bacterial CDS! Long (1,356 bp), canonical ATG start, preceded 7 bp upstream by a Shine-Dalgarno (AGGAGG) motif.'
    },
    {
      id: 'orf2',
      name: 'Spurious_Short_A (96 bp)',
      frame: '+2',
      start: 70,
      end: 120,
      strand: '+',
      lengthBp: 96,
      startCodon: 'TTG',
      stopCodon: 'TGA',
      hasRBS: false,
      rbsMotif: 'None',
      gcCodingScore: '-6.4 (Random noise)',
      isTrueGene: false,
      rejectedBy: 'Filter 1 (Too Short <180 bp) AND Filter 2 (No RBS)',
      explanation: 'Tiny random ORF (96 bp) with no RBS. Stop codons occur roughly every ~60 bp by chance in non-coding DNA. Removed immediately by Filter 1 (Length).'
    },
    {
      id: 'orf6',
      name: 'Spurious_Short_B (114 bp w/ fake RBS)',
      frame: '+3',
      start: 145,
      end: 205,
      strand: '+',
      lengthBp: 114,
      startCodon: 'ATG',
      stopCodon: 'TAA',
      hasRBS: true,
      rbsMotif: 'GGAG (Chance match)',
      gcCodingScore: '-4.1 (Non-coding)',
      isTrueGene: false,
      rejectedBy: 'Filter 1 ONLY (Length <180 bp)',
      explanation: 'Why Filter 2 alone is not enough! This 114 bp random ORF happens to sit downstream of a chance GGAG sequence, so Filter 2 keeps it—you NEED Filter 1 (Min Length >180 bp) to eliminate it!'
    },
    {
      id: 'orf3',
      name: 'Candidate_2 (gyrB)',
      frame: '+2',
      start: 295,
      end: 535,
      strand: '+',
      lengthBp: 1185,
      startCodon: 'GTG',
      stopCodon: 'TAG',
      hasRBS: true,
      rbsMotif: 'GGAG (8 bp upstream)',
      gcCodingScore: '+39.7 (Strong coding bias)',
      isTrueGene: true,
      rejectedBy: 'Passes Both Filters (True CDS)',
      explanation: 'True Bacterial CDS! Uses a GTG start codon (~15% of bacterial genes use GTG/TTG, still translated as fMet) and has a strong RBS + coding score.'
    },
    {
      id: 'orf4',
      name: 'Shadow_ORF (420 bp inside gyrB)',
      frame: '+3',
      start: 330,
      end: 490,
      strand: '+',
      lengthBp: 420,
      startCodon: 'ATG',
      stopCodon: 'TAA',
      hasRBS: false,
      rbsMotif: 'None (No RBS / Negative Hexamer Score)',
      gcCodingScore: '-14.8 (Shadow frame artifact)',
      isTrueGene: false,
      rejectedBy: 'Filter 2 ONLY (Lacks RBS & Coding Hexamer Bias)',
      explanation: 'Why Filter 1 alone is not enough! At 420 bp, this "shadow ORF" inside gyrB easily passes the >180 bp length filter! You NEED Filter 2 (Shine-Dalgarno RBS & hexamer score) to reject it!'
    },
    {
      id: 'orf5',
      name: 'Candidate_3 (Rev CDS)',
      frame: '-1 (Rev)',
      start: 560,
      end: 725,
      strand: '-',
      lengthBp: 690,
      startCodon: 'ATG',
      stopCodon: 'TAA',
      hasRBS: true,
      rbsMotif: 'AGGAG (6 bp upstream on - strand)',
      gcCodingScore: '+27.5 (Coding signature)',
      isTrueGene: true,
      rejectedBy: 'Passes Both Filters (True CDS)',
      explanation: 'True Reverse-Strand CDS! Passes both the >180 bp length filter and possesses a clear upstream Shine-Dalgarno motif on the reverse strand.'
    }
  ];

  const isOrfVisible = (orf) => {
    if (minLengthFilter && orf.lengthBp < 180) return false;
    if (requireRBS && !orf.hasRBS) return false;
    return true;
  };

  const remainingCount = ORFS.filter(isOrfVisible).length;
  const activeOrf = ORFS.find((o) => o.id === selectedOrfId) || ORFS[0];

  return (
    <div className="space-y-6">
      {/* Prodigal Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              6-Frame Structural Gene Caller (Prodigal / Pyrodigal Simulator)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Notice how <strong className="text-white">neither filter alone is sufficient</strong>: Filter 1 removes short random ORFs (<code className="text-rose-300">96 bp &amp; 114 bp</code>), while Filter 2 removes the long <code className="text-rose-300">420 bp Shadow ORF</code> overlapping inside <em>gyrB</em>!
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMinLengthFilter(!minLengthFilter)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                minLengthFilter
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {minLengthFilter ? '✓ Filter 1 Active: Min Length (>180 bp)' : '1. Toggle Length Filter (>180 bp)'}
            </button>
            <button
              onClick={() => setRequireRBS(!requireRBS)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                requireRBS
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {requireRBS ? '✓ Filter 2 Active: Require RBS & Coding Score' : '2. Toggle RBS & Hexamer Score Filter'}
            </button>
          </div>
        </div>

        {/* Live Filter Status Bar showing the joint effect */}
        <div className="bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-300">
            <strong>Active Pipeline State:</strong>{' '}
            {!minLengthFilter && !requireRBS && 'Raw Unfiltered 6-Frame Translation (6 total candidates: 3 True CDS + 3 False Positives)'}
            {minLengthFilter && !requireRBS && 'Filter 1 Only: Removed 2 short ORFs, but the 420 bp Shadow_ORF in Frame +3 still contaminates the call set!'}
            {!minLengthFilter && requireRBS && 'Filter 2 Only: Removed Shadow_ORF and Short_A, but Short_B (114 bp with a chance GGAG) still slips through!'}
            {minLengthFilter && requireRBS && 'BOTH Filters Combined (Prodigal Default): All 3 false positives eliminated → 3 True Bacterial CDSs remain!'}
          </div>
          <span className={`font-mono font-bold px-2.5 py-0.5 rounded ${
            remainingCount === 3 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {remainingCount} / 6 Candidates Passing
          </span>
        </div>

        {/* 6-Frame Genome Browser Track */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2">
          <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-400 pb-1">
            <span>Contig_1 (4,200 bp window) — Click any ORF block to inspect why it passes or fails</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Shine-Dalgarno RBS
              </span>
              <span className="flex items-center gap-1 text-emerald-300">
                <span className="w-3 h-2 rounded-sm bg-emerald-500 inline-block"></span> True CDS
              </span>
              <span className="flex items-center gap-1 text-rose-300">
                <span className="w-3 h-2 rounded-sm bg-rose-500/80 inline-block"></span> False Positive ORF
              </span>
            </span>
          </div>

          <svg viewBox="0 0 760 190" className="w-full h-auto">
            {[
              { y: 32, label: 'Frame +1' },
              { y: 68, label: 'Frame +2' },
              { y: 104, label: 'Frame +3' },
              { y: 150, label: 'Frame -1' }
            ].map((row, idx) => (
              <g key={idx}>
                <text x="8" y={row.y + 13} fill="#94a3b8" fontSize="11" fontFamily="monospace">
                  {row.label}
                </text>
                <line x1="75" y1={row.y + 9} x2="740" y2={row.y + 9} stroke="#1e293b" strokeWidth="2" />
              </g>
            ))}

            <line x1="10" y1="134" x2="740" y2="134" stroke="#334155" strokeDasharray="4,4" strokeWidth="1" />

            {ORFS.map((orf) => {
              const visible = isOrfVisible(orf);
              const yMap = { '+1': 32, '+2': 68, '+3': 104, '-1 (Rev)': 150 };
              const y = yMap[orf.frame];
              const isSelected = selectedOrfId === orf.id;

              return (
                <g
                  key={orf.id}
                  onClick={() => setSelectedOrfId(orf.id)}
                  className="cursor-pointer transition-opacity"
                  opacity={visible ? 1 : 0.14}
                >
                  {orf.hasRBS && (
                    <circle
                      cx={orf.strand === '+' ? orf.start - 7 : orf.end + 7}
                      cy={y + 9}
                      r="5"
                      fill="#fbbf24"
                    />
                  )}

                  <rect
                    x={orf.start}
                    y={y}
                    width={orf.end - orf.start}
                    height="19"
                    rx="4"
                    fill={orf.isTrueGene ? '#059669' : '#e11d48'}
                    stroke={isSelected ? '#ffffff' : 'none'}
                    strokeWidth={isSelected ? '2.5' : '0'}
                  />

                  <text
                    x={orf.start + 6}
                    y={y + 13}
                    fill="#ffffff"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {orf.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected ORF Inspector Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                activeOrf.isTrueGene ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {activeOrf.isTrueGene ? 'TRUE BACTERIAL CDS' : 'FALSE POSITIVE ORF'}
              </span>
              <span className="text-white font-semibold text-sm">{activeOrf.name}</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Frame {activeOrf.frame} | Length: {activeOrf.lengthBp} bp | Start: {activeOrf.startCodon} → Stop: {activeOrf.stopCodon}
            </div>
            <div className="text-[11px] text-amber-300 font-mono">
              Filter Verdict: {activeOrf.rejectedBy}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400">Shine-Dalgarno RBS:</div>
              <div className="font-mono text-amber-300 font-semibold mt-0.5">{activeOrf.rbsMotif}</div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <div className="text-slate-400">Hexamer Coding Score:</div>
              <div className="font-mono text-cyan-300 font-semibold mt-0.5">{activeOrf.gcCodingScore}</div>
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            {activeOrf.explanation}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODULE 5: FUNCTIONAL ANNOTATION TRIAGE
// ==========================================
function Module5Functional() {
  const [selectedGene, setSelectedGene] = useState('cds2');
  const [minQueryCov, setMinQueryCov] = useState(80);
  const [userAssignments, setUserAssignments] = useState({
    cds1: 'Chromosomal replication initiator DnaA',
    cds2: null,
    cds3: 'Hypothetical protein'
  });

  const GENES = {
    cds1: {
      id: 'cds1',
      locusTag: 'ECO_00010',
      lengthAa: 452,
      title: 'CDS_001 (Clear Ortholog Match)',
      hits: [
        {
          id: 'h1',
          db: 'Swiss-Prot (Curated)',
          product: 'Chromosomal replication initiator DnaA',
          gene: 'dnaA',
          evalue: '0.0',
          identity: 99.1,
          queryCov: 100,
          alignStart: 0,
          alignEnd: 100,
          recommended: true,
          note: '100% query coverage and 99% identity to a verified Swiss-Prot entry.'
        }
      ]
    },
    cds2: {
      id: 'cds2',
      locusTag: 'ECO_00020',
      lengthAa: 395,
      title: 'CDS_002 (The Domain Trap!)',
      hits: [
        {
          id: 'h2_trap',
          db: 'TrEMBL (Unreviewed)',
          product: 'ATP-dependent DNA helicase PcrA',
          gene: 'pcrA',
          evalue: '1e-42',
          identity: 96.0,
          queryCov: 16,
          alignStart: 12,
          alignEnd: 28,
          recommended: false,
          note: 'TRAP! 96% identity is restricted to a tiny 60 aa ATP-binding Walker-A motif (16% of the protein). The remaining 84% does NOT match PcrA!'
        },
        {
          id: 'h2_true',
          db: 'Swiss-Prot (Curated)',
          product: 'ABC transporter ATP-binding subunit YkpA',
          gene: 'ykpA',
          evalue: '1e-118',
          identity: 58.4,
          queryCov: 97,
          alignStart: 2,
          alignEnd: 99,
          recommended: true,
          note: 'CORRECT! Even though % identity is 58.4%, the alignment spans 97% of the entire protein length against a curated Swiss-Prot reference.'
        },
        {
          id: 'h2_pfam',
          db: 'Pfam-A (HMM Profile)',
          product: 'ABC transporter family protein (PF00005)',
          gene: '-',
          evalue: '3e-35',
          identity: 42.0,
          queryCov: 88,
          alignStart: 8,
          alignEnd: 96,
          recommended: false,
          note: 'Good fallback family-level annotation if no Swiss-Prot ortholog passes thresholds.'
        }
      ]
    },
    cds3: {
      id: 'cds3',
      locusTag: 'ECO_00030',
      lengthAa: 230,
      title: 'CDS_003 (Orphan / Prophage Gene)',
      hits: [
        {
          id: 'h3_noise',
          db: 'GenBank NR',
          product: 'Putative uncharacterized protein',
          gene: '-',
          evalue: '0.24',
          identity: 27.0,
          queryCov: 22,
          alignStart: 40,
          alignEnd: 62,
          recommended: false,
          note: 'Insignificant E-value (0.24) and low coverage. Should be annotated conservatively as "Hypothetical protein".'
        }
      ]
    }
  };

  const currentGene = GENES[selectedGene];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Functional Annotation Triage (Bakta / Prokka Logic)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Once Prodigal finds the coordinates of our 3 genes, Bakta/Prokka searches them against hierarchical databases (<span className="text-emerald-300">Swiss-Prot → UniRef90 → Pfam HMMs</span>).
            </p>
          </div>

          {/* Query Coverage Threshold Slider */}
          <div className="bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800 flex items-center gap-4">
            <div>
              <div className="text-xs text-slate-300 font-semibold">
                Minimum Query Coverage Cutoff: <span className="text-emerald-400 font-mono">{minQueryCov}%</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Bakta/Prokka default is typically ≥80% mutual coverage
              </div>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              step="5"
              value={minQueryCov}
              onChange={(e) => setMinQueryCov(Number(e.target.value))}
              className="w-28 accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Gene Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.values(GENES).map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGene(g.id)}
              className={`p-3.5 rounded-xl border text-left transition ${
                selectedGene === g.id
                  ? 'bg-emerald-500/15 border-emerald-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{g.locusTag}</span>
                <span>{g.lengthAa} aa</span>
              </div>
              <div className="font-semibold text-sm mt-1">{g.title}</div>
              <div className="text-xs mt-1.5 truncate text-emerald-400 font-mono">
                Assigned: {userAssignments[g.id] || '⚠️ Needs Triage (Click)'}
              </div>
            </button>
          ))}
        </div>

        {/* Alignment Visualization for Selected Gene */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-white">
              Query Protein: <span className="text-cyan-400 font-mono">{currentGene.locusTag}</span> (1 to {currentGene.lengthAa} amino acids)
            </div>
            <div className="text-xs text-slate-400">
              Hits below your <span className="text-emerald-400 font-mono">{minQueryCov}%</span> coverage filter are flagged in red
            </div>
          </div>

          {/* Query Full Length Ruler (Fixed overlap by placing text label cleanly above the domain bar) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-300 px-1">
              <span>QUERY PROTEIN: 1 aa ───────────────────────────► {currentGene.lengthAa} aa (100% Full Length)</span>
              {selectedGene === 'cds2' && (
                <span className="text-amber-300">
                  Conserved ATP-Binding Walker-A Domain (aa 48–110 = 16% of protein)
                </span>
              )}
            </div>
            <div className="h-7 bg-cyan-950/80 border border-cyan-500/50 rounded-md relative flex items-center overflow-hidden">
              <div className="w-full flex justify-between px-3 text-[10px] font-mono text-cyan-400/70 select-none">
                <span>N-terminus (1 aa)</span>
                <span>50%</span>
                <span>C-terminus ({currentGene.lengthAa} aa)</span>
              </div>
              {selectedGene === 'cds2' && (
                <div
                  style={{ left: '12%', width: '16%' }}
                  className="absolute top-0 bottom-0 bg-amber-500/40 border-x-2 border-amber-400 flex items-center justify-center shadow"
                >
                  <span className="text-[10px] font-mono text-amber-100 font-bold tracking-tight">
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
                  className={`p-3.5 rounded-lg border transition space-y-2.5 ${
                    passesCov
                      ? 'bg-slate-900 border-slate-700'
                      : 'bg-rose-950/20 border-rose-900/50 opacity-75'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {hit.db}
                        </span>
                        <span className="font-semibold text-white text-sm">{hit.product}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        Identity: <strong className="text-white">{hit.identity}%</strong> | Query Coverage:{' '}
                        <strong className={hit.queryCov < minQueryCov ? 'text-rose-400' : 'text-emerald-400'}>
                          {hit.queryCov}%
                        </strong>{' '}
                        | E-value: <strong className="text-white">{hit.evalue}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setUserAssignments((prev) => ({
                          ...prev,
                          [currentGene.id]: hit.product
                        }))
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                        isChosen
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isChosen ? '✓ Assigned to GFF3' : 'Assign This Annotation'}
                    </button>
                  </div>

                  {/* Alignment Bar */}
                  <div className="w-full h-3.5 bg-slate-950 rounded overflow-hidden relative border border-slate-800">
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

                  <p className="text-xs text-slate-300">{hit.note}</p>
                </div>
              );
            })}

            {/* Option to assign "Hypothetical protein" */}
            {selectedGene === 'cds3' && (
              <div className="p-3.5 rounded-lg border border-emerald-800/50 bg-emerald-950/20 flex items-center justify-between">
                <div className="text-xs text-slate-300">
                  <strong className="text-emerald-300">No valid database hits pass E-value &amp; coverage thresholds:</strong> Assign default fallback <code className="text-white">Hypothetical protein</code>.
                </div>
                <button
                  onClick={() =>
                    setUserAssignments((prev) => ({
                      ...prev,
                      cds3: 'Hypothetical protein'
                    }))
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950"
                >
                  ✓ Assigned: Hypothetical protein
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN APP SHELL COMPONENT
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [completedModules, setCompletedModules] = useState({});

  const currentModule = MODULES.find((m) => m.id === activeTab);
  const currentQuestion = QUESTIONS[activeTab];
  const userChoice = selectedAnswers[activeTab];

  const handleSelectOption = (option) => {
    setSelectedAnswers((prev) => ({ ...prev, [activeTab]: option }));
    if (option.correct) {
      setCompletedModules((prev) => ({ ...prev, [activeTab]: true }));
    }
  };

  const completedCount = Object.keys(completedModules).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-12">
      {/* Top Academic Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Dna className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-white tracking-tight">
                  Bacterial Genome Assembly &amp; Annotation Workbench
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  MSc Bioinformatics Practical
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive step-by-step visual guide from raw Illumina short reads to annotated GFF3/GenBank files
              </p>
            </div>
          </div>

          {/* Student Checkpoint Progress */}
          <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
            <Award className={`w-4 h-4 ${completedCount === 5 ? 'text-amber-400' : 'text-emerald-400'}`} />
            <div className="text-xs">
              <span className="text-slate-400">Practical Checkpoints: </span>
              <span className="font-mono font-bold text-white">{completedCount} / 5 Completed</span>
            </div>
          </div>
        </div>

        {/* 5-Step Pipeline Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex items-center gap-1.5 py-2 min-w-max">
            {MODULES.map((mod, idx) => {
              const Icon = mod.icon;
              const isActive = activeTab === mod.id;
              const isDone = completedModules[mod.id];

              return (
                <React.Fragment key={mod.id}>
                  <button
                    onClick={() => setActiveTab(mod.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 border ${
                      isActive
                        ? 'bg-emerald-500/20 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{mod.shortTitle}</span>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  {idx < MODULES.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Module Context Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span>MODULE {currentModule.id} OF 5</span>
              <span>•</span>
              <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-cyan-300">
                <Terminal className="w-3 h-3" /> CLI Tool: {currentModule.tool}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{currentModule.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Learning Objective:</strong> {currentModule.goal}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab > 1 && (
              <button
                onClick={() => setActiveTab(activeTab - 1)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                ← Prev Step
              </button>
            )}
            {activeTab < 5 && (
              <button
                onClick={() => setActiveTab(activeTab + 1)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Interactive Workbench Module */}
        {activeTab === 1 && <Module1QC />}
        {activeTab === 2 && <Module2DBG />}
        {activeTab === 3 && <Module3Scaffolding />}
        {activeTab === 4 && <Module4Structural />}
        {activeTab === 5 && <Module5Functional />}

        {/* Bottom Diagnostic Student Checkpoint */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Practical Diagnostic Question (Module {activeTab} Checkpoint)
            </h3>
            {completedModules[activeTab] && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Checkpoint Passed
              </span>
            )}
          </div>

          <p className="text-sm text-slate-200 font-medium">{currentQuestion.question}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = userChoice?.id === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-3.5 rounded-xl border text-left text-xs leading-relaxed transition flex flex-col justify-between ${
                    !isSelected
                      ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      : opt.correct
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500 text-rose-200'
                  }`}
                >
                  <div>
                    <span className="font-mono font-bold uppercase mr-1.5">[{opt.id}]</span>
                    {opt.text}
                  </div>
                </button>
              );
            })}
          </div>

          {userChoice && (
            <div
              className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                userChoice.correct
                  ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-700/60 text-rose-200'
              }`}
            >
              {userChoice.correct ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>{userChoice.feedback}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}