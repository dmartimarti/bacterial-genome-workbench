import React, { useState, useMemo } from 'react';
import { Terminal, Info, Scissors, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

// Authentic bacterial locus segments from E. coli K-12 gyrA & dnaA
const PRESET_READS = {
  r1_forward: {
    id: 'r1_forward',
    name: 'Illumina R1 (Forward Read - 150 bp)',
    header: '@M02345:124:000000000-A9H14:1:1101:14280:1542 1:N:0:1 (gyrA locus)',
    description: 'Standard forward read. High fidelity (Q36–Q41) across cycles 1–110, gradual phasing decay, steep drop in final 15 cycles.',
    seq: 'ATGTCCGATCTAGCCAGAGAAATCACTCCCCTGAACATCGAAGAGGAATTGAAGTCCTCTTATCTGGATTATGCGATGTCGGTTATTGTTGGCCGTGCGCTGCCGGATGTGCGTGATGGGCTGAAGCCTGTTCATCGTCGCGTACTGTACGGCATG',
    type: 'r1'
  },
  r2_reverse: {
    id: 'r2_reverse',
    name: 'Illumina R2 (Reverse Read - 150 bp)',
    header: '@M02345:124:000000000-A9H14:1:1101:14280:1542 2:N:0:1 (gyrA reverse complement)',
    description: 'Reverse read. Demonstrates typical paired-end asymmetry: earlier phasing decay and higher cycle-to-cycle noise starting at cycle 90.',
    seq: 'CATGCCGTACAGTACGCGACGATGAACAGGCTTCAGCCCATCACGCACATCCGGCAGCGCACGGCCAACAATAACCGACATCGCATAATCCAGATAAGAGGACTTCAATTCCTCTTCGATGTTCAGGGGAGTGATTTCTCTGGCTAGATCGGACAT',
    type: 'r2'
  },
  adapter_contamination: {
    id: 'adapter_contamination',
    name: 'Adapter Read-Through (Short Insert < 110 bp)',
    header: '@M02345:124:000000000-A9H14:1:1102:18942:2018 1:N:0:1 (TruSeq Adapter read-through)',
    description: 'Bacterial insert was shorter than read length. Cycle 115 sequences straight into Illumina TruSeq Universal Adapter with severe quality drop.',
    seq: 'ATGCGCCTGTCGCGTATCGTGCGCGATCTGGCGGATGAAGGCATCGTCTGTGTGGAAGCGGAAGATGGCGGTATCGAGCTTCGCGTCGAGCAGAGATCGGAAGAGCACACGTCTGAACTCCAGTCACACTGATCTATCTCGTATGCCGTCTTCTGC',
    type: 'adapter'
  }
};

// Generates authentic Illumina Phred+33 quality score with realistic entropy along the biological decay curve
function generateDecayQualityScores(length, type = 'r1', seed = 42) {
  // Pseudorandom generator with seed for reproducible re-rolling
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const randNormal = () => {
    const u1 = Math.max(1e-6, rand());
    const u2 = rand();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  };

  const scores = [];
  const qualChars = [];

  for (let i = 0; i < length; i++) {
    const progress = i / length;
    let meanQ;

    if (type === 'adapter' && i >= 114) {
      // TruSeq adapter read-through crash
      const adapterCycle = i - 114;
      meanQ = Math.max(2, 24 - adapterCycle * 0.65 + randNormal() * 2.2);
    } else if (type === 'r2') {
      // R2 reverse read has earlier and more pronounced phasing decay
      if (i < 10) {
        meanQ = 35 + (i / 10) * 3 + randNormal() * 1.0;
      } else if (i < 75) {
        meanQ = 38.0 + randNormal() * 1.3;
      } else if (i < 115) {
        // Earlier decay
        const t = (i - 75) / (115 - 75);
        meanQ = 38 - t * 10 + randNormal() * 1.8;
      } else if (i < 138) {
        const t = (i - 115) / (138 - 115);
        meanQ = 28 - t * 12 + randNormal() * 2.0;
      } else {
        meanQ = 14 - (i - 138) * 0.9 + randNormal() * 2.5;
      }
    } else {
      // Standard R1 forward read
      if (i < 12) {
        // Early cycle warmup / calibration
        meanQ = 36 + (i / 12) * 3.5 + randNormal() * 0.9;
      } else if (i < 105) {
        // Sustained high quality zone (Q37 - Q41) with subtle cycle jitter
        meanQ = 39.2 + randNormal() * 1.1;
      } else if (i < 130) {
        // Gradual phasing accumulation decay
        const t = (i - 105) / (130 - 105);
        meanQ = 39 - t * 9 + randNormal() * 1.5;
      } else if (i < 144) {
        // Steep 3' terminal descent
        const t = (i - 130) / (144 - 130);
        meanQ = 30 - t * 12 + randNormal() * 1.9;
      } else {
        // Fluorophore depletion / optical tail drop (Q2 - Q12)
        meanQ = 16 - (i - 144) * 2.1 + randNormal() * 2.2;
      }
    }

    // Realistic single-cycle optical dips (e.g. G-quadruplex or air bubble)
    if ((i === 48 || i === 92) && rand() > 0.4) {
      meanQ -= 7;
    }

    // Clamp Phred score to valid Illumina range [2, 41]
    const q = Math.max(2, Math.min(41, Math.round(meanQ)));
    scores.push(q);
    qualChars.push(String.fromCharCode(q + 33));
  }

  return {
    scores,
    qualString: qualChars.join('')
  };
}

// Find fastp sliding window cut position (window = 4, mean Q < 20)
function computeFastpCutPoint(scores, windowSize = 4, threshold = 20) {
  // fastp scans from 3' end backwards
  for (let i = scores.length - windowSize; i >= 0; i--) {
    let windowSum = 0;
    for (let j = 0; j < windowSize; j++) {
      windowSum += scores[i + j];
    }
    const mean = windowSum / windowSize;
    if (mean >= threshold) {
      return i + windowSize; // cut point (0-indexed exclusive)
    }
  }
  return scores.length;
}

export default function FastqRawViewer() {
  const [selectedPreset, setSelectedPreset] = useState('r1_forward');
  const [seed, setSeed] = useState(1337);
  const [hoveredIdx, setHoveredIdx] = useState(18);
  const [showTrimmingPreview, setShowTrimmingPreview] = useState(true);

  const activePreset = PRESET_READS[selectedPreset];
  const readSeq = activePreset.seq;

  // Generate realistic diverse qualities for the current preset & seed
  const { scores, qualString } = useMemo(() => {
    return generateDecayQualityScores(readSeq.length, activePreset.type, seed);
  }, [readSeq.length, activePreset.type, seed]);

  // Compute fastp cut point
  const cutPoint = useMemo(() => {
    return computeFastpCutPoint(scores, 4, 20);
  }, [scores]);

  const activeIdx = Math.min(hoveredIdx, readSeq.length - 1);
  const activeBase = readSeq[activeIdx] || 'A';
  const activeChar = qualString[activeIdx] || 'I';
  const asciiCode = activeChar.charCodeAt(0);
  const phredScore = scores[activeIdx] || (asciiCode - 33);
  const errorProb = Math.pow(10, -phredScore / 10);
  const accuracy = ((1 - errorProb) * 100).toFixed(phredScore >= 30 ? 3 : 2);
  const isTrimmedPosition = showTrimmingPreview && activeIdx >= cutPoint;

  const handleReroll = () => {
    setSeed(prev => prev + Math.floor(Math.random() * 9999) + 1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 transition-colors shadow-sm">
      {/* Top Header & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Interactive Raw FASTQ Format &amp; Phred+33 ASCII Decoder
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hover over any nucleotide to inspect cycle-level basecalling fidelity, Phred+33 ASCII mapping, and fastp sliding-window clipping.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset selector pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setSelectedPreset('r1_forward')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                selectedPreset === 'r1_forward'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              R1 Forward
            </button>
            <button
              onClick={() => setSelectedPreset('r2_reverse')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                selectedPreset === 'r2_reverse'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              R2 Reverse (Faster Decay)
            </button>
            <button
              onClick={() => setSelectedPreset('adapter_contamination')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                selectedPreset === 'adapter_contamination'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              TruSeq Adapter
            </button>
          </div>

          {/* Re-roll simulator button */}
          <button
            onClick={handleReroll}
            title="Simulate new read with stochastic cycle jitter along empirical decay curve"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-500" />
            <span>Re-roll Quality</span>
          </button>
        </div>
      </div>

      {/* Preset Description Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950/80 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
        <div className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>{activePreset.description}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowTrimmingPreview(!showTrimmingPreview)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition border ${
              showTrimmingPreview
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>{showTrimmingPreview ? 'Trimming Highlight (On)' : 'Trimming Highlight (Off)'}</span>
          </button>
        </div>
      </div>

      {/* Raw 4-line FASTQ Block */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed space-y-2 select-none shadow-inner overflow-hidden">
        {/* Line 1: Read Header */}
        <div className="text-slate-400 text-[11px] truncate select-all flex items-center justify-between">
          <span>
            <span className="text-cyan-400 font-semibold">{activePreset.header.split(' ')[0]}</span>{' '}
            <span className="text-slate-500">{activePreset.header.substring(activePreset.header.indexOf(' '))}</span>
          </span>
          <span className="text-slate-500 text-[10px]">Length: {readSeq.length} bp</span>
        </div>

        {/* Line 2: Nucleotide Sequence with interactive hover */}
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Line 2: Sequence (5&apos; &rarr; 3&apos;)</div>
          <div className="flex flex-wrap gap-0">
            {readSeq.split('').map((b, i) => {
              const isHovered = i === activeIdx;
              const q = scores[i];
              const isCut = showTrimmingPreview && i >= cutPoint;

              return (
                <span
                  key={`b_${i}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  className={`cursor-pointer px-[1.5px] py-[1px] transition-all duration-75 ${
                    isHovered
                      ? 'bg-emerald-400 text-slate-950 font-bold scale-125 z-20 shadow-md ring-1 ring-emerald-300'
                      : isCut
                      ? 'text-rose-400/90 bg-rose-950/40 hover:bg-rose-900/60'
                      : q >= 35
                      ? 'text-emerald-300 hover:bg-slate-800'
                      : q >= 28
                      ? 'text-emerald-400 hover:bg-slate-800'
                      : q >= 20
                      ? 'text-amber-300 hover:bg-amber-950/60'
                      : 'text-rose-400 hover:bg-rose-950/60'
                  }`}
                  title={`Cycle ${i + 1}: ${b} | Phred Q=${q} | ASCII '${qualString[i]}' (${qualString.charCodeAt(i)})`}
                >
                  {b}
                </span>
              );
            })}
          </div>
        </div>

        {/* Line 3: Plus Separator */}
        <div className="text-slate-600 text-xs font-bold">+</div>

        {/* Line 4: Quality String */}
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5 flex items-center justify-between">
            <span>Line 4: Phred+33 ASCII Quality String</span>
            {showTrimmingPreview && cutPoint < scores.length && (
              <span className="text-rose-400 text-[10px] flex items-center gap-1 font-sans">
                <Scissors className="w-3 h-3" />
                fastp cut at cycle {cutPoint + 1} ({scores.length - cutPoint} bp trimmed)
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-0">
            {qualString.split('').map((ch, i) => {
              const isHovered = i === activeIdx;
              const q = scores[i];
              const isCut = showTrimmingPreview && i >= cutPoint;

              return (
                <span
                  key={`q_${i}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  className={`cursor-pointer px-[1.5px] py-[1px] font-bold transition-all duration-75 ${
                    isHovered
                      ? 'bg-emerald-400 text-slate-950 scale-125 z-20 shadow-md ring-1 ring-emerald-300'
                      : isCut
                      ? 'text-rose-300 bg-rose-950/40 hover:bg-rose-900/60'
                      : q >= 35
                      ? 'text-emerald-400 hover:bg-slate-800'
                      : q >= 28
                      ? 'text-teal-300 hover:bg-slate-800'
                      : q >= 20
                      ? 'text-amber-300 hover:bg-amber-950/60'
                      : 'text-rose-400 hover:bg-rose-950/60'
                  }`}
                  title={`Cycle ${i + 1}: Q=${q} | Character '${ch}' (ASCII ${ch.charCodeAt(0)})`}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        </div>

        {/* Cycle-by-Cycle Phred Bar Sparkline */}
        <div className="pt-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Cycle-by-Cycle Phred Quality Profile (Q2 &rarr; Q41)</span>
            <div className="flex items-center gap-3 text-[10px] font-sans">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Q&ge;30 (Clean)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Q20–29
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Q&lt;20 (Error)
              </span>
            </div>
          </div>
          <div className="h-8 flex items-end gap-[1px] bg-slate-900/90 p-1 rounded border border-slate-800">
            {scores.map((q, i) => {
              const isHovered = i === activeIdx;
              const isCut = showTrimmingPreview && i >= cutPoint;
              const heightPct = Math.max(8, Math.round((q / 41) * 100));

              return (
                <div
                  key={`spark_${i}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  style={{ height: `${heightPct}%`, width: `${100 / scores.length}%` }}
                  className={`cursor-pointer transition-all duration-75 rounded-t-sm ${
                    isHovered
                      ? 'bg-cyan-300 ring-2 ring-cyan-400 z-10'
                      : isCut
                      ? 'bg-rose-600/80 hover:bg-rose-500'
                      : q >= 30
                      ? 'bg-emerald-500 hover:bg-emerald-400'
                      : q >= 20
                      ? 'bg-amber-500 hover:bg-amber-400'
                      : 'bg-rose-500 hover:bg-rose-400'
                  }`}
                  title={`Cycle ${i + 1}: Q=${q}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic ASCII Decoder Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Cycle / Position:</span>
            <span className="font-mono text-[10px] text-slate-400">{activeIdx + 1}/{readSeq.length}</span>
          </div>
          <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>Cycle #{activeIdx + 1}:</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
              {activeBase}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {activeIdx < 15 ? '5\' Initial calibration' : activeIdx >= 135 ? '3\' Terminal decay' : 'Core elongation phase'}
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>ASCII Phred+33 Char:</span>
            <span className="font-mono text-[10px] text-slate-400">Ord {asciiCode}</span>
          </div>
          <div className="font-mono text-base font-bold text-cyan-600 dark:text-cyan-400 mt-1 flex items-center gap-2">
            <span className="text-xl">&lsquo;{activeChar}&rsquo;</span>
            <span className="text-xs font-normal text-slate-500">(Dec {asciiCode})</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            ASCII {asciiCode} &minus; 33 offset = <strong className="text-slate-900 dark:text-white">Q{phredScore}</strong>
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Phred Score Quality:</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              phredScore >= 30 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : phredScore >= 20 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}>
              {phredScore >= 30 ? 'Q≥30 Good' : phredScore >= 20 ? 'Q20–29 Fair' : 'Q<20 Poor'}
            </span>
          </div>
          <div className={`font-mono text-base font-bold mt-1 ${
            phredScore >= 30
              ? 'text-emerald-600 dark:text-emerald-400'
              : phredScore >= 20
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            Q = {phredScore}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            {isTrimmedPosition ? (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <Scissors className="w-3 h-3" /> Clipped by fastp
              </span>
            ) : phredScore >= 30 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Retained for assembly
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Marginal quality
              </span>
            )}
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Basecall Accuracy:</span>
            <span className="font-mono text-[10px] text-slate-400">P(error)</span>
          </div>
          <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-1">
            {accuracy}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            1 error in <strong className="text-slate-900 dark:text-white font-mono">{Math.round(1 / errorProb).toLocaleString()}</strong> bp
          </div>
        </div>
      </div>

      {/* Didactic Quality Hierarchy Legend */}
      <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>
            <strong>Illumina Quality Formula:</strong> <code className="text-cyan-700 dark:text-cyan-300 font-mono">Q = -10 &times; log₁₀(P_error)</code>.
            Each increment of +10 in Phred score represents a 10-fold reduction in basecalling error probability!
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            Q40 (1 in 10,000)
          </span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            Q30 (1 in 1,000)
          </span>
          <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
            Q20 (1 in 100)
          </span>
        </div>
      </div>
    </div>
  );
}

