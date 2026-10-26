import React, { useState, useMemo } from 'react';
import { Sliders, Scissors } from 'lucide-react';
import ReadCoverageSimulator from './ReadCoverageSimulator';
import FastQCPlot from './FastQCPlot';
import LanderWatermanStats from './LanderWatermanStats';
import FastqRawViewer from './FastqRawViewer';
import DiagnosticQuiz from '../../common/DiagnosticQuiz';
import ToolCard from '../../common/ToolCard';
import ParameterSlider from '../../common/ParameterSlider';
import { simulateReadPileup, estimateLanderWatermanContigs } from '../../../utils/sequenceUtils';

export default function Module1QC() {
  const [coverage, setCoverage] = useState(8);
  const [errorRate, setErrorRate] = useState(2.5);
  const [trimmed, setTrimmed] = useState(false);

  // Compute read pileup and depth statistics
  const { reads, depthTrack, zeroBins, lowDepthBins, effectiveCoverage } = useMemo(() => {
    return simulateReadPileup(coverage, errorRate, trimmed);
  }, [coverage, errorRate, trimmed]);

  // Compute Lander-Waterman expected contigs across E. coli
  const estContigs = useMemo(() => {
    return estimateLanderWatermanContigs(zeroBins, lowDepthBins, errorRate, trimmed);
  }, [zeroBins, lowDepthBins, errorRate, trimmed]);

  return (
    <div className="space-y-6">
      {/* CLI Tool Reference */}
      <ToolCard
        toolName="fastp / FastQC"
        cliCommand="fastp -i raw_R1.fq.gz -I raw_R2.fq.gz -o clean_R1.fq.gz -O clean_R2.fq.gz --detect_adapter_for_pe --cut_tail --cut_mean_quality 20"
        description="Performs quality trimming on Illumina short reads, removing optical errors, 3' decayed bases, and read-through sequencing adapters before assembling."
        flags={[
          { name: '--detect_adapter_for_pe', desc: 'Auto-scans and clips Illumina adapter sequences' },
          { name: '--cut_tail', desc: 'Sliding window trimming of low-Phred 3\' ends' },
          { name: '--cut_mean_quality 20', desc: 'Discards windows with average Phred Q < 20 (1% error rate)' }
        ]}
      />

      {/* Simulator Controls & Live Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Illumina Short-Read Simulator Controls
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              2 × 150 bp Paired-End
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coverage Slider */}
            <ParameterSlider
              label="Sequencing Depth (Coverage)"
              value={coverage}
              min={4}
              max={70}
              step={2}
              unit="x"
              statusLabel={coverage < 20 ? 'Dropout Prone!' : coverage <= 55 ? 'Sweet Spot' : 'High/Redundant'}
              statusColor={coverage < 20 ? 'text-rose-400' : coverage <= 60 ? 'text-emerald-400' : 'text-amber-400'}
              minLabel="4x (Many 0x gaps)"
              midLabel="30x–50x (Optimal)"
              maxLabel="70x"
              onChange={setCoverage}
            />

            {/* Error Rate Slider */}
            <ParameterSlider
              label="Sequencing Error & 3' Adapter Rate"
              value={errorRate}
              min={0.5}
              max={4.5}
              step={0.5}
              unit="%"
              statusColor={errorRate > 2 ? 'text-rose-400' : 'text-amber-400'}
              accentColor="accent-rose-500"
              minLabel="0.5% (Clean)"
              midLabel="2.5% (Typical raw)"
              maxLabel="4.5% (Corrupts k-mers)"
              onChange={setErrorRate}
            />
          </div>

          {/* fastp Trimming Toggle */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 transition-colors">
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Run <code className="text-cyan-700 dark:text-cyan-300 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono">fastp</code> Quality &amp; Adapter Trimming
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Clips low-Phred (<code className="text-slate-700 dark:text-slate-300">Q&lt;20</code>) 3&apos; tails (red ends) so false k-mers do not poison the assembly graph.
              </p>
            </div>
            <button
              onClick={() => setTrimmed(!trimmed)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition flex items-center gap-2 shrink-0 ${
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

        {/* Lander-Waterman HUD */}
        <LanderWatermanStats
          zeroBins={zeroBins}
          lowDepthBins={lowDepthBins}
          effectiveCoverage={effectiveCoverage}
          estContigs={estContigs}
          trimmed={trimmed}
        />
      </div>

      {/* Visual Track: Pileup Canvas & FastQC Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReadCoverageSimulator
            reads={reads}
            depthTrack={depthTrack}
            zeroBins={zeroBins}
          />
        </div>
        <div>
          <FastQCPlot trimmed={trimmed} errorRate={errorRate} />
        </div>
      </div>

      {/* Raw FASTQ Format & Phred Quality ASCII Inspector */}
      <FastqRawViewer />

      {/* Module 1 Diagnostic Question Checkpoint */}
      <DiagnosticQuiz moduleId={1} />
    </div>
  );
}
