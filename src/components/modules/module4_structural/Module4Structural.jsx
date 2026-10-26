import React, { useState } from 'react';
import { Search } from 'lucide-react';
import SixFrameBrowser from './SixFrameBrowser';
import AminoAcidTranslationRuler from './AminoAcidTranslationRuler';
import CodingScoreInspector from './CodingScoreInspector';
import RbsMotifFinder from './RbsMotifFinder';
import ToolCard from '../../common/ToolCard';
import DiagnosticQuiz from '../../common/DiagnosticQuiz';
import { STRUCTURAL_ORFS } from '../../../data/mockGFF3';

export default function Module4Structural() {
  const [minLengthFilter, setMinLengthFilter] = useState(false);
  const [requireRBS, setRequireRBS] = useState(false);
  const [selectedOrfId, setSelectedOrfId] = useState('orf1');

  const isOrfVisible = (orf) => {
    if (minLengthFilter && orf.lengthBp < 180) return false;
    if (requireRBS && !orf.hasRBS) return false;
    return true;
  };

  const remainingCount = STRUCTURAL_ORFS.filter(isOrfVisible).length;
  const activeOrf = STRUCTURAL_ORFS.find((o) => o.id === selectedOrfId) || STRUCTURAL_ORFS[0];

  return (
    <div className="space-y-6">
      {/* CLI Tool Card */}
      <ToolCard
        toolName="Prodigal / Pyrodigal"
        cliCommand="prodigal -i contigs.fasta -o genes.gff -a proteins.faa -d genes.fna -p single -m"
        description="Fast, accurate ab initio bacterial gene finder that builds an unsupervised dynamic Markov model of hexamer frequencies, RBS motifs, and start codon usage directly from contig sequences."
        flags={[
          { name: '-p single', desc: 'Single genome mode (trains species-specific hexamer model)' },
          { name: '-m', desc: 'Treats contig edges as closed, avoiding partial truncated calls' },
          { name: '-o genes.gff', desc: 'Outputs standard 9-column structural GFF3 annotations' }
        ]}
      />

      {/* Main Structural Annotation Sandbox */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 transition-colors shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              6-Frame Structural Gene Caller (Prodigal / Pyrodigal Simulator)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Notice how <strong className="text-slate-800 dark:text-slate-200">neither filter alone is sufficient</strong>: Filter 1 removes short random ORFs (<code className="text-rose-700 dark:text-rose-300 font-mono">96 bp &amp; 114 bp</code>), while Filter 2 removes the long <code className="text-rose-700 dark:text-rose-300 font-mono">420 bp Shadow ORF</code> overlapping inside <em>gyrB</em>!
            </p>
          </div>

          {/* Dual Filter Synergy Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMinLengthFilter(!minLengthFilter)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                minLengthFilter
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-600 dark:border-emerald-500/50 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {minLengthFilter ? '✓ Filter 1 Active: Min Length (>180 bp)' : '1. Toggle Length Filter (>180 bp)'}
            </button>
            <button
              onClick={() => setRequireRBS(!requireRBS)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                requireRBS
                  ? 'bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 border-amber-600 dark:border-amber-500/50 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {requireRBS ? '✓ Filter 2 Active: Require RBS & Coding Score' : '2. Toggle RBS & Hexamer Score Filter'}
            </button>
          </div>
        </div>

        {/* Live Filter Status Bar */}
        <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Active Pipeline State:</strong>{' '}
            {!minLengthFilter && !requireRBS && 'Raw Unfiltered 6-Frame Translation (6 total candidates: 3 True CDS + 3 False Positives)'}
            {minLengthFilter && !requireRBS && 'Filter 1 Only: Removed 2 short ORFs, but the 420 bp Shadow_ORF in Frame +3 still contaminates the call set!'}
            {!minLengthFilter && requireRBS && 'Filter 2 Only: Removed Shadow_ORF and Short_A, but Short_B (114 bp with a chance GGAG) still slips through!'}
            {minLengthFilter && requireRBS && 'BOTH Filters Combined (Prodigal Default): All 3 false positives eliminated → Exact 3 True Bacterial CDSs remain!'}
          </div>
          <span className={`font-mono font-bold px-2.5 py-0.5 rounded ${
            remainingCount === 3 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
          }`}>
            {remainingCount} / 6 Passing
          </span>
        </div>

        {/* 6-Frame Browser Track */}
        <SixFrameBrowser
          orfs={STRUCTURAL_ORFS}
          isOrfVisible={isOrfVisible}
          selectedOrfId={selectedOrfId}
          setSelectedOrfId={setSelectedOrfId}
        />

        {/* Direct Amino Acid Translation Ruler */}
        <AminoAcidTranslationRuler activeOrf={activeOrf} />

        {/* Selected ORF Inspector Card */}
        <CodingScoreInspector activeOrf={activeOrf} />

        {/* Biological Primer on RBS & Start Codons */}
        <RbsMotifFinder />
      </div>

      {/* Module 4 Diagnostic Question Checkpoint */}
      <DiagnosticQuiz moduleId={4} />
    </div>
  );
}
