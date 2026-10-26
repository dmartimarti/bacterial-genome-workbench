import React, { useState } from 'react';
import { Database } from 'lucide-react';
import AlignmentCoverageRuler from './AlignmentCoverageRuler';
import DomainTrapInspector from './DomainTrapInspector';
import Gff3LiveGenerator from './Gff3LiveGenerator';
import AmrVirulenceProfiler from './AmrVirulenceProfiler';
import ToolCard from '../../common/ToolCard';
import DiagnosticQuiz from '../../common/DiagnosticQuiz';
import ParameterSlider from '../../common/ParameterSlider';
import { useLabState } from '../../../context/LabStateContext';
import { FUNCTIONAL_GENES } from '../../../data/functionalHits';

export default function Module5Functional() {
  const [selectedGene, setSelectedGene] = useState('cds2');
  const [minQueryCov, setMinQueryCov] = useState(80);

  const { functionalAssignments, setFunctionalAssignments } = useLabState();

  const handleAssign = (geneId, product) => {
    setFunctionalAssignments((prev) => ({
      ...prev,
      [geneId]: product
    }));
  };

  const currentGene = FUNCTIONAL_GENES[selectedGene];

  return (
    <div className="space-y-6">
      {/* CLI Tool Card */}
      <ToolCard
        toolName="Bakta &amp; ABRicate / AMRFinderPlus"
        cliCommand="bakta --db bakta_db/ --prefix ecoli contigs.fasta &amp;&amp; abricate --db card contigs.fasta &amp;&amp; abricate --db vfdb contigs.fasta"
        description="Comprehensive microbial genome annotator pairing hierarchical protein orthology (Swiss-Prot, UniRef90, Pfam) with targeted antimicrobial resistance (CARD) and virulence factor (VFDB) profiling."
        flags={[
          { name: '--db bakta_db/', desc: 'Uses high-quality curated databases prioritized by experimental evidence' },
          { name: '--db card', desc: 'Screens acquired resistance genes and QRDR target mutations against CARD database' },
          { name: '--db vfdb', desc: 'Identifies adhesins, invasins, siderophores, and toxins in VFDB' }
        ]}
      />

      {/* Main Annotation Triage Workspace (Bakta / Prokka Logic) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 transition-colors shadow-sm">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Functional Annotation Triage (Bakta / Prokka Logic)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Once Prodigal finds the coordinates of our genes, Bakta/Prokka searches them against hierarchical databases (<span className="text-emerald-700 dark:text-emerald-300 font-medium">Swiss-Prot → UniRef90 → Pfam HMMs</span>).
            </p>
          </div>

          {/* Query Coverage Cutoff Slider */}
          <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div>
              <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                Min Query Coverage Cutoff: <span className="text-emerald-600 dark:text-emerald-400 font-mono">{minQueryCov}%</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Standard cutoff is typically ≥80% mutual length
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

        {/* 3 Gene Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.values(FUNCTIONAL_GENES).map((g) => {
            const isAssigned = !!functionalAssignments[g.id];
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGene(g.id)}
                className={`p-3.5 rounded-xl border text-left transition ${
                  selectedGene === g.id
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-500 text-slate-900 dark:text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span>{g.locusTag}</span>
                  <span>{g.lengthAa} aa</span>
                </div>
                <div className="font-semibold text-sm mt-1">{g.title}</div>
                <div className="text-xs mt-1.5 truncate text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                  Assigned: {functionalAssignments[g.id] || '⚠️ Needs Triage (Click)'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Alignment Coverage Ruler & Hit Triage */}
        <AlignmentCoverageRuler
          currentGene={currentGene}
          selectedGene={selectedGene}
          minQueryCov={minQueryCov}
          userAssignments={functionalAssignments}
          onAssign={handleAssign}
        />

        {/* The Domain Trap Deep Dive */}
        <DomainTrapInspector />

        {/* Dynamic Live GFF3 Generator */}
        <Gff3LiveGenerator userAssignments={functionalAssignments} />
      </div>

      {/* Antimicrobial Resistance (CARD) & Virulence Factors (VFDB) Profiler */}
      <AmrVirulenceProfiler />

      {/* Module 5 Diagnostic Question Checkpoint */}
      <DiagnosticQuiz moduleId={5} />
    </div>
  );
}


