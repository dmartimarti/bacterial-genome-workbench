import React, { useState, useMemo } from 'react';
import { Share2, BookOpen, BarChart3, Network, Sparkles, Layers, HelpCircle, GitMerge, Scissors } from 'lucide-react';
import KmerOverlapSlider from './KmerOverlapSlider';
import BandageGraphViewer from './BandageGraphViewer';
import ErrorCorrectionSandbox from './ErrorCorrectionSandbox';
import ContigAssemblerWalker from './ContigAssemblerWalker';
import KmerSpectrumViewer from './KmerSpectrumViewer';
import MultiKmerExplorer from './MultiKmerExplorer';
import GraphSimplificationWalkthrough from './GraphSimplificationWalkthrough';
import OlcVsDbgModal from './OlcVsDbgModal';
import ToolCard from '../../common/ToolCard';
import DiagnosticQuiz from '../../common/DiagnosticQuiz';
import {
  PRESET_SEQUENCES,
  constructDynamicDeBruijnGraph
} from '../../../utils/kmerUtils';
import { MOCK_GFA_K3, MOCK_GFA_K5, MOCK_GFA_ERROR } from '../../../data/mockGFA';

export default function Module2DBG() {
  const [selectedPresetId, setSelectedPresetId] = useState('canonical');
  const [customSequence, setCustomSequence] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [kSize, setKSize] = useState(5);
  const [stepIdx, setStepIdx] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [cleaned, setCleaned] = useState(false);
  const [showGFA, setShowGFA] = useState(false);
  const [showOlcModal, setShowOlcModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('graph'); // 'graph' | 'assembler' | 'spectrum' | 'multik' | 'simplification'

  // Determine current active DNA sequence
  const activePreset = PRESET_SEQUENCES.find((p) => p.id === selectedPresetId) || PRESET_SEQUENCES[0];
  const activeSeq = isCustomMode && customSequence.trim().length >= 8
    ? customSequence.trim().toUpperCase().replace(/[^ATGC]/g, '')
    : activePreset.seq;

  // Dynamically construct mathematical De Bruijn graph
  const graphData = useMemo(() => {
    return constructDynamicDeBruijnGraph(activeSeq, kSize, hasError, cleaned);
  }, [activeSeq, kSize, hasError, cleaned]);

  const { kmers, nodes, edges, cytoscapeElements, eulerianTrail, assembledContig } = graphData;

  const activeKmer = kmers[Math.min(stepIdx, kmers.length - 1)] || kmers[0] || {
    index: 0,
    kmer: activeSeq.slice(0, kSize),
    prefix: activeSeq.slice(0, kSize - 1),
    suffix: activeSeq.slice(1, kSize)
  };

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setIsCustomMode(false);
    setKSize(preset.recommendedK || 5);
    setStepIdx(0);
  };

  const handleSelectK = (newK) => {
    setKSize(newK);
    setStepIdx(0);
  };

  const handleToggleError = () => {
    setHasError(!hasError);
    setCleaned(false);
  };

  // Determine active GFA text
  const activeGFA = useMemo(() => {
    if (hasError && !cleaned) return MOCK_GFA_ERROR;
    if (kSize <= 4) return MOCK_GFA_K3;
    return MOCK_GFA_K5;
  }, [kSize, hasError, cleaned]);

  return (
    <div className="space-y-6">
      {/* CLI Tool Card */}
      <ToolCard
        toolName="SPAdes / Shovill / Bandage"
        cliCommand="spades.py -1 clean_R1.fq.gz -2 clean_R2.fq.gz -k 21,33,55,77,99,127 --careful -o spades_output/"
        description="Constructs multi-k De Bruijn graphs from short reads, resolving small repeats with larger k values and pruning tips and bubbles based on k-mer depth coverage."
        flags={[
          { name: '-k 21,33,55,77,99,127', desc: 'Iterative multi-k spectrum balancing sensitivity and repeat resolution' },
          { name: '--careful', desc: 'Applies MismatchCorrector post-assembly to eliminate small INDELs and SNPs' },
          { name: 'Bandage load assembly_graph.gfa', desc: 'Visualizes assembly graph topology, repeat loops, and dead-ends' }
        ]}
      />

      {/* Main Sandbox Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Dynamic De Bruijn Graph Reconstruction &amp; Assembly Sandbox
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select a bacterial genomic locus preset or enter your own custom DNA sequence to explore how (k−1) prefixes and suffixes build graph nodes.
            </p>
          </div>

          <button
            onClick={() => setShowOlcModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why OLC Failed vs DBG</span>
          </button>
        </div>

        {/* Preset & Custom Sequence Selector */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Genomic Locus Template:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCustomMode(!isCustomMode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                  isCustomMode
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                {isCustomMode ? '✓ Custom Input Active' : 'Enter Custom DNA'}
              </button>
            </div>
          </div>

          {/* Preset Buttons */}
          {!isCustomMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESET_SEQUENCES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-lg border text-left transition ${
                    selectedPresetId === preset.id && !isCustomMode
                      ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-500 text-slate-900 dark:text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-xs">{preset.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {preset.description}
                  </div>
                  <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                    {preset.seq}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={customSequence}
                onChange={(e) => setCustomSequence(e.target.value)}
                placeholder="Type nucleotide sequence (e.g., ATGGCTACCGCTATTA)..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 uppercase"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Type any sequence of at least 8 bp using A, T, G, C. The graph constructor will dynamically compute all prefix/suffix nodes and Eulerian paths!
              </p>
            </div>
          )}
        </div>

        {/* 3 Sandbox Action Cards */}
        <ErrorCorrectionSandbox
          kSize={kSize}
          handleSelectK={handleSelectK}
          hasError={hasError}
          handleToggleError={handleToggleError}
          cleaned={cleaned}
          setCleaned={setCleaned}
          showGFA={showGFA}
          setShowGFA={setShowGFA}
        />

        {/* GFA Format Inspector Dropdown */}
        {showGFA && (
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 animate-fadeIn transition-colors">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-cyan-700 dark:text-cyan-300 font-semibold">Graphical Fragment Assembly (.gfa v1.0) Preview:</span>
              <span className="text-slate-500 dark:text-slate-400">S = Segment, L = Directed Link Overlap</span>
            </div>
            <pre className="p-3 bg-white dark:bg-slate-900 rounded-lg text-emerald-600 dark:text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-200 dark:border-slate-800/80">
              {activeGFA}
            </pre>
          </div>
        )}

        {/* Sliding-Window k-mer Overlap Inspector */}
        <KmerOverlapSlider
          sequence={activeSeq}
          kSize={kSize}
          kmerList={kmers}
          stepIdx={stepIdx}
          setStepIdx={setStepIdx}
          activeKmer={activeKmer}
        />
      </div>

      {/* Sub-view switcher: Graph View vs Eulerian Assembler vs Jellyfish Spectrum vs Multi-k vs Simplification */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('graph')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'graph'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Interactive De Bruijn Graph</span>
        </button>

        <button
          onClick={() => setActiveSubTab('multik')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'multik'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <GitMerge className="w-3.5 h-3.5" />
          <span>Multi-k (SPAdes)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('simplification')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'simplification'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Tips &amp; Bubbles</span>
        </button>

        <button
          onClick={() => setActiveSubTab('assembler')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'assembler'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Eulerian Assembler</span>
        </button>

        <button
          onClick={() => setActiveSubTab('spectrum')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'spectrum'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Jellyfish k-mer Spectrum</span>
        </button>
      </div>

      {/* Dynamic Sub-tab views */}
      {activeSubTab === 'graph' && (
        <BandageGraphViewer
          kSize={kSize}
          hasError={hasError}
          cleaned={cleaned}
          activeKmer={activeKmer}
          cytoscapeElements={cytoscapeElements}
        />
      )}

      {activeSubTab === 'multik' && (
        <MultiKmerExplorer />
      )}

      {activeSubTab === 'simplification' && (
        <GraphSimplificationWalkthrough />
      )}

      {activeSubTab === 'assembler' && (
        <ContigAssemblerWalker
          eulerianTrail={eulerianTrail}
          activeStep={stepIdx}
          setActiveStep={setStepIdx}
          kSize={kSize}
        />
      )}

      {activeSubTab === 'spectrum' && (
        <KmerSpectrumViewer />
      )}

      {/* OLC vs DBG Explainer Modal */}
      <OlcVsDbgModal
        isOpen={showOlcModal}
        onClose={() => setShowOlcModal(false)}
      />

      {/* Module 2 Diagnostic Question Checkpoint */}
      <DiagnosticQuiz moduleId={2} />
    </div>
  );
}
