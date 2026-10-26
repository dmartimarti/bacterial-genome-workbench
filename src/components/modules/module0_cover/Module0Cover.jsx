import React from 'react';
import { 
  Dna, 
  ArrowRight, 
  Sliders, 
  Share2, 
  Layers, 
  Search, 
  Database, 
  Terminal, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  GitMerge, 
  Pill, 
  BookOpen, 
  Cpu, 
  Scissors,
  FileCode,
  Flame,
  Award
} from 'lucide-react';
import { useLabState } from '../../../context/LabStateContext';

const PIPELINE_STAGES = [
  {
    step: 1,
    title: 'Stage 1: Read QC & Coverage Physics',
    shortName: 'QC & Trimming',
    tools: 'fastp / FastQC',
    color: 'from-cyan-500/20 to-cyan-500/5 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    icon: Sliders,
    badge: 'Illumina Physics',
    inputFile: 'raw_R1.fq.gz, raw_R2.fq.gz',
    outputFile: 'clean_R1.fq.gz, clean_R2.fq.gz',
    highlights: [
      'Lander-Waterman Poisson coverage calculation: P(0) = e^(-C)',
      'Phred+33 ASCII decoding & basecall accuracy formula: Q = -10 log10(P)',
      'Sliding-window trimming (fastp) to prevent 3\' tail noise from poisoning graphs'
    ]
  },
  {
    step: 2,
    title: 'Stage 2: De Bruijn Graph Assembly',
    shortName: 'DBG Assembly',
    tools: 'SPAdes / Bandage',
    color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: Share2,
    badge: 'Graph Algorithms',
    inputFile: 'clean_R1.fq.gz, clean_R2.fq.gz',
    outputFile: 'assembly_graph.gfa, contigs.fasta',
    highlights: [
      'Decomposing reads into (k-1) prefix/suffix node pairs',
      'The k-mer dilemma: small k connects gaps; large k resolves repeats',
      'Iterative multi-k merging (k=21, 33, 55) & tip-clipping / bubble-popping'
    ]
  },
  {
    step: 3,
    title: 'Stage 3: Scaffolding & Evaluation',
    shortName: 'Scaffolding & QC',
    tools: 'QUAST / CheckM2',
    color: 'from-indigo-500/20 to-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    icon: Layers,
    badge: 'Quality Assurance',
    inputFile: 'contigs.fasta, reference.fasta',
    outputFile: 'scaffolds.fasta, quast_report.html',
    highlights: [
      'Repeat bottlenecks: why 150 bp reads stall at 5,000 bp rRNA operons',
      'The N50 Trap: when high contiguity hides catastrophic chimeric joins',
      'CheckM2 machine learning (LightGBM/DNN) completeness & contamination'
    ]
  },
  {
    step: 4,
    title: 'Stage 4: Structural Gene Calling',
    shortName: 'Gene Calling',
    tools: 'Prodigal / Pyrodigal',
    color: 'from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: Search,
    badge: 'Ab Initio Calling',
    inputFile: 'scaffolds.fasta',
    outputFile: 'genes.gff, proteins.faa',
    highlights: [
      '6-frame translation: distinguishing random ORFs from true coding sequences',
      'Shine-Dalgarno (AGGAGG) ribosome binding sites with optimal 5-10 bp spacing',
      'Non-canonical bacterial start codons: GTG (~14%) & TTG (~3%)'
    ]
  },
  {
    step: 5,
    title: 'Stage 5: Functional & Clinical Annotation',
    shortName: 'Functional Triage',
    tools: 'Bakta / CARD / VFDB',
    color: 'from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/30',
    icon: Database,
    badge: 'Clinical Genomics',
    inputFile: 'proteins.faa, contigs.fasta',
    outputFile: 'annotated_genome.gff3, antibiogram',
    highlights: [
      'Hierarchical evidence triage: curated Swiss-Prot vs unreviewed TrEMBL',
      'The Domain Trap: why 96% identity over 16% coverage causes misannotation',
      'Antimicrobial Resistance (CARD) & Virulence Factors (VFDB) profiling'
    ]
  }
];

export default function Module0Cover() {
  const { setActiveTab, totalQuestionsCorrect, completedCount } = useLabState();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MSc Bioinformatics Practical Laboratory</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Bacterial Genome Assembly &amp; Annotation Workbench
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            An end-to-end interactive curriculum guiding you from raw Illumina short-read sequencing data through graph algorithms, contiguity evaluation, structural gene prediction, and clinical antimicrobial resistance triage.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={() => setActiveTab(1)}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-900/40 transform hover:-translate-y-0.5"
            >
              <span>Begin Practical: Module 1 (Read QC)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" /> CLI Terminal Integrated
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <Award className="w-3.5 h-3.5 text-amber-400" /> 10 Diagnostic Checkpoints ({totalQuestionsCorrect || 0}/10)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual End-to-End Pipeline Roadmap Diagram */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Typical Bacterial Genomics Pipeline Flowchart
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Follow the transformation of genomic data from flowcell optical clusters to functional GFF3 annotation.
            </p>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            5 Interactive Modules
          </span>
        </div>

        {/* Pipeline Diagram (Horizontal on Desktop, Vertical on Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 relative">
          {PIPELINE_STAGES.map((stg, i) => {
            const Icon = stg.icon;
            return (
              <div
                key={stg.step}
                onClick={() => setActiveTab(stg.step)}
                className="group cursor-pointer bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-100 dark:hover:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                {/* Step Pill */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-500 transition">
                    STEP {stg.step}
                  </span>
                  <div className={`p-1.5 rounded-lg border bg-gradient-to-br ${stg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition leading-snug">
                    {stg.shortName}
                  </h4>
                  <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 mt-0.5">
                    {stg.tools}
                  </div>
                </div>

                {/* File transformations */}
                <div className="text-[10px] font-mono bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80 space-y-1">
                  <div className="text-slate-400 truncate">
                    <span className="text-slate-500">IN:</span> {stg.inputFile.split(',')[0]}
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 truncate">
                    <span className="text-slate-500">OUT:</span> {stg.outputFile.split(',')[0]}
                  </div>
                </div>

                {/* Jump link */}
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between pt-1">
                  <span>Enter Module {stg.step}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep-Dive Stage Detail Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Interactive Practical Syllabus &amp; Core Concepts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border bg-gradient-to-br ${stage.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">MODULE {stage.step}</span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{stage.shortName}</h4>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                      {stage.badge}
                    </span>
                  </div>

                  {/* Core Highlights */}
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {stage.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-slate-400">
                    Tool: <strong className="text-slate-700 dark:text-slate-200">{stage.tools.split(' ')[0]}</strong>
                  </div>
                  <button
                    onClick={() => setActiveTab(stage.step)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-semibold text-xs border border-emerald-300 dark:border-emerald-700/50 transition flex items-center gap-1"
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Quick Practical Terminal Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Terminal className="w-5 h-5" />
                  <span className="font-bold text-sm text-white">CLI Terminal Simulator</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Zsh Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Test real bioinformatic command-line executions directly inside the browser. Try commands like <code className="text-cyan-300">spades.py</code>, <code className="text-cyan-300">checkm2</code>, <code className="text-cyan-300">quast.py</code>, and <code className="text-cyan-300">abricate</code>.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Docked at bottom-right</span>
              <span className="text-emerald-400 font-mono text-[11px]">Click &ldquo;Bioinformatics Terminal&rdquo;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
