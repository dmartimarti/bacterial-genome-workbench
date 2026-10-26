import React, { useState } from 'react';
import RepeatBottleneckVisualizer from './RepeatBottleneckVisualizer';
import QuastComparativeTable from './QuastComparativeTable';
import CheckM2Evaluator from './CheckM2Evaluator';
import NxPlot from './NxPlot';
import MisassemblyDiagram from './MisassemblyDiagram';
import SyntenyDotplotViewer from './SyntenyDotplotViewer';
import ToolCard from '../../common/ToolCard';
import DiagnosticQuiz from '../../common/DiagnosticQuiz';
import { MOCK_ASSEMBLIES } from '../../../data/mockQUAST';

export default function Module3Scaffolding() {
  const [showPairedEnd, setShowPairedEnd] = useState(false);
  const [showLongRead, setShowLongRead] = useState(false);
  const [selectedAssembly, setSelectedAssembly] = useState('optimal');

  const currentAsm = MOCK_ASSEMBLIES[selectedAssembly];

  return (
    <div className="space-y-6">
      {/* CLI Tool Card */}
      <ToolCard
        toolName="QUAST &amp; CheckM2 / Bandage"
        cliCommand="quast.py assembly_A.fasta assembly_B.fasta assembly_C.fasta -R ecoli_k12_reference.fasta -o quast_out/ &amp;&amp; checkm2 predict --threads 8 -i assemblies/ -o checkm2_out/"
        description="Evaluates assembly quality, contiguity (N50, L50), genome fraction, and machine-learning predicted completeness and contamination without relying on rigid lineage marker sets."
        flags={[
          { name: '-R reference.fasta', desc: 'Provides ground truth for detecting structural misassemblies, translocations, and inversions' },
          { name: 'checkm2 predict', desc: 'Predicts Completeness (%) and Contamination (%) using LightGBM and Deep Neural Networks' },
          { name: '--database_path .dmnd', desc: 'Universal Diamond reference database spanning over 10,000 bacterial/archaeal genomes' }
        ]}
      />

      {/* Part 1: Repeat Bottlenecks, Paired-End & Long Reads */}
      <RepeatBottleneckVisualizer
        showPairedEnd={showPairedEnd}
        setShowPairedEnd={setShowPairedEnd}
        showLongRead={showLongRead}
        setShowLongRead={setShowLongRead}
      />

      {/* Part 2: CheckM2 Machine Learning Assessment */}
      <CheckM2Evaluator
        assemblies={MOCK_ASSEMBLIES}
        selectedAssembly={selectedAssembly}
        setSelectedAssembly={setSelectedAssembly}
      />

      {/* Part 3: Interactive QUAST Comparison & Nx Plots */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-6 transition-colors shadow-sm">
        <QuastComparativeTable
          assemblies={MOCK_ASSEMBLIES}
          selectedAssembly={selectedAssembly}
          setSelectedAssembly={setSelectedAssembly}
        />

        {/* 2D Synteny Dotplot (MUMmer / Mauve) */}
        <SyntenyDotplotViewer selectedAssembly={selectedAssembly} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <NxPlot currentAsm={currentAsm} selectedAssembly={selectedAssembly} />
          <MisassemblyDiagram />
        </div>
      </div>

      {/* Module 3 Diagnostic Question Checkpoint */}
      <DiagnosticQuiz moduleId={3} />
    </div>
  );
}

