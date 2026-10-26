import React, { useState, useMemo } from 'react';
import { ShieldCheck, Cpu, AlertTriangle, Layers, Info, CheckCircle2, XCircle, Sliders, ArrowRight, Database, Award } from 'lucide-react';

export default function CheckM2Evaluator({ assemblies, selectedAssembly, setSelectedAssembly }) {
  const [activeTab, setActiveTab] = useState('benchmark'); // 'benchmark' | 'how_it_works' | 'sandbox'
  
  // Sandbox state
  const [injectedContam, setInjectedContam] = useState(0);
  const [injectedDropout, setInjectedDropout] = useState(0);

  const currentAsm = assemblies[selectedAssembly];
  const checkmData = currentAsm.checkm2;

  // Calculate sandbox dynamic values
  const simulatedCompleteness = Math.max(10, Math.min(100, (currentAsm.checkm2.completeness * (1 - injectedDropout / 100)).toFixed(1)));
  const simulatedContam = Math.min(40, (currentAsm.checkm2.contamination + injectedContam).toFixed(2));
  const simulatedScore = Math.max(0, (simulatedCompleteness - 5 * simulatedContam).toFixed(1));

  // Determine MIMAG quality tier
  const getMimagTier = (comp, contam) => {
    if (comp >= 90 && contam < 5) {
      return {
        label: 'High-Quality Draft (HQ)',
        badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        desc: 'Meets MIMAG standards: >90% Completeness, <5% Contamination. Suitable for species delineation and comparative pangenomics.'
      };
    } else if (comp >= 50 && contam < 10) {
      return {
        label: 'Medium-Quality Draft (MQ)',
        badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
        desc: 'Completeness ≥50% and Contamination <10%. Usable for broad phylogenomics, but caution advised for gene presence/absence calls.'
      };
    } else {
      return {
        label: 'Low-Quality / Contaminated (LQ)',
        badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
        desc: 'Fails quality threshold (Completeness <50% or Contamination ≥10%). Not acceptable for reference databases or publication without bin refinement.'
      };
    }
  };

  const sandboxTier = getMimagTier(simulatedCompleteness, simulatedContam);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 transition-colors shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            CheckM2: Machine Learning Genome Completeness &amp; Contamination
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Predicts isolate and MAG completeness and contamination using universal Diamond homology and Gradient Boosted Decision Trees (LightGBM) &amp; Deep Neural Networks.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'benchmark'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Assembly Benchmark
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'sandbox'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Contamination Sandbox
          </button>
          <button
            onClick={() => setActiveTab('how_it_works')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === 'how_it_works'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            How CheckM2 Works
          </button>
        </div>
      </div>

      {/* Tab 1: Assembly Benchmark */}
      {activeTab === 'benchmark' && (
        <div className="space-y-5">
          {/* Assembly Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.values(assemblies).map((asm) => {
              const isSelected = selectedAssembly === asm.id;
              const chk = asm.checkm2;
              const tier = getMimagTier(chk.completeness, chk.contamination);

              return (
                <button
                  key={asm.id}
                  onClick={() => setSelectedAssembly(asm.id)}
                  className={`p-4 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{asm.name.split(':')[0]}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${tier.badge}`}>
                      {tier.label.split(' ')[0]}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">{asm.name.split(':')[1]}</div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Completeness:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{chk.completeness}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Contamination:</span>
                      <span className={`font-bold ${chk.contamination > 5 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                        {chk.contamination}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Assembly CheckM2 HUD */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Score Metrics */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Completeness Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Completeness</span>
                    <span className="text-[10px] font-mono">Target &gt;90%</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {checkmData.completeness}%
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${checkmData.completeness}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Predicted genes: <strong className="text-slate-700 dark:text-slate-200 font-mono">{checkmData.predictedGenes}</strong>
                  </div>
                </div>

                {/* Contamination Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Contamination</span>
                    <span className="text-[10px] font-mono">Target &lt;5%</span>
                  </div>
                  <div className={`text-2xl font-bold font-mono mt-1 ${
                    checkmData.contamination > 5 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {checkmData.contamination}%
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        checkmData.contamination > 5 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, checkmData.contamination * 5)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Duplicated features: <strong className={checkmData.contamination > 5 ? 'text-rose-400' : 'text-slate-700 dark:text-slate-200'}>
                      {checkmData.contamination > 5 ? 'High (Chimeras)' : 'Nominal (<0.5%)'}
                    </strong>
                  </div>
                </div>

                {/* CheckM2 Quality Score */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Quality Score</span>
                    <span className="text-[10px] font-mono font-bold">Comp - 5*Cont</span>
                  </div>
                  <div className={`text-2xl font-bold font-mono mt-1 ${
                    checkmData.qualityScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : checkmData.qualityScore >= 50 ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {checkmData.qualityScore}
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        checkmData.qualityScore >= 80 ? 'bg-emerald-500' : checkmData.qualityScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, checkmData.qualityScore))}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Model: <span className="font-mono text-cyan-600 dark:text-cyan-400">{checkmData.modelUsed.split(' ')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Biological Evaluation Note */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span>CheckM2 Genome Assessment for {currentAsm.name}:</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {checkmData.notes}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-mono">
                  <span>Coding Density: <strong className="text-slate-700 dark:text-slate-300">{checkmData.codingDensity}</strong></span>
                  <span>Predicted Model: <strong className="text-cyan-600 dark:text-cyan-400">{checkmData.modelUsed}</strong></span>
                </div>
              </div>
            </div>

            {/* Right: MIMAG Standard Tier Box */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
                  MIMAG Specification Tier:
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 ${
                  getMimagTier(checkmData.completeness, checkmData.contamination).badge
                }`}>
                  {checkmData.mimagTier}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {getMimagTier(checkmData.completeness, checkmData.contamination).desc}
                </p>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
                <div className="font-semibold text-slate-700 dark:text-slate-300">Minimum Information Guidelines:</div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>HQ: Completeness &gt; 90%, Contamination &lt; 5%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>MQ: Completeness &ge; 50%, Contamination &lt; 10%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>LQ: Completeness &lt; 50% or Contam &ge; 10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contamination & Dropout Sandbox */}
      {activeTab === 'sandbox' && (
        <div className="space-y-5">
          <div className="p-4 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-800 dark:text-cyan-300 flex items-start gap-3">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Interactive CheckM2 Stress-Test Sandbox:</strong> Simulate real-world sequencing mishaps—such as cross-contamination (index hopping from a co-multiplexed sample) or severe low-coverage dropouts—and observe how the Machine Learning classifier penalizes the assembly quality score!
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            {/* Slider 1: Contamination */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-rose-500" />
                  Injected Contamination (Foreign Contigs / Chimeras):
                </span>
                <span className="font-mono font-bold text-rose-500">+{injectedContam}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={injectedContam}
                onChange={(e) => setInjectedContam(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Simulates chimeric misassemblies, duplicate ribosomal markers, or co-isolated plasmid contigs.
              </p>
            </div>

            {/* Slider 2: Gene Dropout */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  Simulated Missing Genomic Fraction (Dropouts):
                </span>
                <span className="font-mono font-bold text-amber-500">-{injectedDropout}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="2"
                value={injectedDropout}
                onChange={(e) => setInjectedDropout(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Simulates low-coverage dropout or aggressive k-mer filtering that amputates essential metabolic operons.
              </p>
            </div>
          </div>

          {/* Dynamic Sandbox Results */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">Predicted Completeness</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {simulatedCompleteness}%
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">Predicted Contamination</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${
                simulatedContam >= 5 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {simulatedContam}%
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">CheckM2 Score (C - 5*M)</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${
                simulatedScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : simulatedScore >= 50 ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {simulatedScore}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
              <span className="text-xs text-slate-400 mb-1">MIMAG Verdict:</span>
              <span className={`px-2 py-1 rounded text-xs font-bold text-center border ${sandboxTier.badge}`}>
                {sandboxTier.label.split(' ')[0]} Draft
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: How CheckM2 Works */}
      {activeTab === 'how_it_works' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>The Problem with CheckM v1 (Legacy HMMs)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                CheckM v1 relied on strict, lineage-specific sets of single-copy marker genes. When assembling novel phyla, Candidate Phyla Radiation (CPR), or highly reduced genomes (e.g. endosymbionts), CheckM1 severely underestimates completeness or reports false-positive contamination when gene duplications naturally occur.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                <Cpu className="w-4 h-4 shrink-0" />
                <span>The CheckM2 Breakthrough (Machine Learning)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                CheckM2 ditches rigid marker gene lists. Instead, it extracts a comprehensive universal vector of <strong>1,200+ features</strong> (metabolic pathways, gene counts, coding density, amino acid frequencies) via fast Diamond protein search, then feeds them into an ensemble of <strong>Gradient Boosted Decision Trees (LightGBM)</strong> and <strong>Deep Neural Networks</strong>.
              </p>
            </div>
          </div>

          {/* 4-Stage Architectural Flowchart */}
          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              CheckM2 Prediction Pipeline Architecture:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400 font-bold font-mono">
                  <span>Stage 1</span>
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">Diamond BLASTp</div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Rapid homology search of all predicted CDSs against universal reference database (10k+ genomes).
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400 font-bold font-mono">
                  <span>Stage 2</span>
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">Feature Extraction</div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  1,200+ features: KEGG KO pathway modules, amino acid composition, coding density, tetranucleotides.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400 font-bold font-mono">
                  <span>Stage 3</span>
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">ML Ensemble</div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  LightGBM (Gradient Boosted Trees) + DNN meta-model trained on tens of thousands of simulated MAGs.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  <span>Stage 4</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">Quality Assessment</div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Accurate Completeness (%), Contamination (%), and MIMAG tier assignment across all bacteria &amp; archaea.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
