import React, { useState, useMemo } from 'react';
import { ShieldAlert, Pill, Flame, AlertTriangle, CheckCircle2, Search, Filter, Stethoscope, Info, ExternalLink } from 'lucide-react';

const AMR_TARGETS = [
  {
    id: 'blaCTX-M-15',
    type: 'amr',
    gene: 'blaCTX-M-15',
    category: 'Beta-lactamase (ESBL)',
    drugClass: 'Cephalosporins (3rd/4th gen) & Penicillins',
    drugs: ['Ceftriaxone', 'Cefotaxime', 'Cefepime', 'Ampicillin'],
    mechanism: 'Enzymatic hydrolysis of beta-lactam ring',
    identity: '100.0%',
    coverage: '100.0%',
    database: 'CARD / ResFinder',
    phenotype: 'RESISTANT',
    threat: 'CRITICAL',
    threatBadge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    clinicalNote: 'WHO Critical Priority Pathogen marker. Renders 3rd-generation cephalosporins clinically useless; mandates carbapenem therapy (e.g. Meropenem).'
  },
  {
    id: 'blaTEM-1B',
    type: 'amr',
    gene: 'blaTEM-1B',
    category: 'Beta-lactamase (Class A)',
    drugClass: 'Narrow-spectrum Penicillins',
    drugs: ['Ampicillin', 'Amoxicillin', 'Piperacillin'],
    mechanism: 'Hydrolysis of penicillin amide bond',
    identity: '99.8%',
    coverage: '100.0%',
    database: 'CARD / ResFinder',
    phenotype: 'RESISTANT',
    threat: 'HIGH',
    threatBadge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    clinicalNote: 'Susceptible to clavulanic acid inhibition (Augmentin / Co-amoxiclav) unless co-expressed with ESBLs or AmpC hyperproducers.'
  },
  {
    id: 'gyrA_S83L',
    type: 'amr',
    gene: 'gyrA (S83L)',
    category: 'Target Site Mutation (QRDR)',
    drugClass: 'Fluoroquinolones',
    drugs: ['Ciprofloxacin', 'Levofloxacin'],
    mechanism: 'Topoisomerase II mutation prevents quinolone binding',
    identity: 'SNP Ser83Leu',
    coverage: '100.0%',
    database: 'CARD PointFinder',
    phenotype: 'RESISTANT',
    threat: 'HIGH',
    threatBadge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    clinicalNote: 'Single amino acid substitution Ser83Leu increases Ciprofloxacin MIC from 0.015 mg/L to >2 mg/L, exceeding EUCAST breakpoint.'
  },
  {
    id: 'tetA',
    type: 'amr',
    gene: 'tet(A)',
    category: 'Efflux Pump (MFS)',
    drugClass: 'Tetracyclines',
    drugs: ['Tetracycline', 'Doxycycline'],
    mechanism: 'Active proton-dependent drug extrusion across membrane',
    identity: '99.2%',
    coverage: '100.0%',
    database: 'CARD',
    phenotype: 'RESISTANT',
    threat: 'MODERATE',
    threatBadge: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
    clinicalNote: 'Plasmid-borne efflux protein. Does not confer resistance to glycylcyclines (e.g. Tigecycline).'
  },
  {
    id: 'aac6_Ib_cr',
    type: 'amr',
    gene: "aac(6')-Ib-cr",
    category: 'Aminoglycoside Acetyltransferase',
    drugClass: 'Aminoglycosides & Fluoroquinolones',
    drugs: ['Tobramycin', 'Kanamycin', 'Ciprofloxacin (low-level)'],
    mechanism: 'N-acetylation of antibiotic amine groups',
    identity: '100.0%',
    coverage: '98.5%',
    database: 'CARD',
    phenotype: 'RESISTANT',
    threat: 'HIGH',
    threatBadge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    clinicalNote: 'Dual-action resistance determinant: modifies aminoglycosides and simultaneously reduces fluoroquinolone susceptibility.'
  }
];

const VF_TARGETS = [
  {
    id: 'fimH',
    type: 'vf',
    gene: 'fimH',
    category: 'Adhesin (Type 1 Fimbriae)',
    role: 'Uroepithelial binding & colonization',
    targetOrgan: 'Bladder epithelium (Uropathogenic trait)',
    mechanism: 'Binds alpha-D-mannosylated uroplakin UP1a proteins',
    identity: '99.5%',
    coverage: '100.0%',
    database: 'VFDB (VF0239)',
    phenotype: 'VIRULENT',
    threat: 'HIGH',
    threatBadge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    clinicalNote: 'Essential colonization factor for cystitis. Blocks urine flow washout, triggering host cell invasion into quiescent intracellular bacterial communities (IBCs).'
  },
  {
    id: 'hlyA',
    type: 'vf',
    gene: 'hlyA',
    category: 'Exotoxin (Alpha-hemolysin)',
    role: 'Cytotoxicity & tissue necrosis',
    targetOrgan: 'Kidney parenchyma & erythrocytes',
    mechanism: 'Pore-forming RTX toxin inserting transmembrane channels',
    identity: '98.7%',
    coverage: '100.0%',
    database: 'VFDB (VF0223)',
    phenotype: 'VIRULENT',
    threat: 'CRITICAL',
    threatBadge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    clinicalNote: 'Pyelonephritis indicator. Lyses red blood cells to release iron and induces exfoliation of renal epithelial cells.'
  },
  {
    id: 'iroN',
    type: 'vf',
    gene: 'iroN',
    category: 'Iron Acquisition (Salmochelin Siderophore)',
    role: 'Host iron scavenging in serum',
    targetOrgan: 'Systemic bloodstream (Bacteremia)',
    mechanism: 'Glucosylated enterobactin receptor evading host Lipocalin-2',
    identity: '100.0%',
    coverage: '99.1%',
    database: 'VFDB (VF0228)',
    phenotype: 'VIRULENT',
    threat: 'HIGH',
    threatBadge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    clinicalNote: 'ExPEC fitness marker: allows survival in iron-depleted human bloodstream by evading innate immune siderophore sequestering.'
  },
  {
    id: 'kpsM',
    type: 'vf',
    gene: 'kpsM',
    category: 'Immune Evasion (K1/K2 Capsule)',
    role: 'Serum resistance & phagocytosis inhibition',
    targetOrgan: 'Systemic vascular compartments',
    mechanism: 'ABC transporter for protective polysialic acid capsule export',
    identity: '99.1%',
    coverage: '100.0%',
    database: 'VFDB (VF0244)',
    phenotype: 'VIRULENT',
    threat: 'CRITICAL',
    threatBadge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    clinicalNote: 'Inhibits complement-mediated opsonization and MAC (Membrane Attack Complex) lysis; hallmark of invasive neonatal meningitis E. coli (NMEC).'
  }
];

export default function AmrVirulenceProfiler() {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'amr' | 'vf' | 'critical'
  const [selectedTargetId, setSelectedTargetId] = useState('blaCTX-M-15');

  const allTargets = useMemo(() => [...AMR_TARGETS, ...VF_TARGETS], []);

  const filteredTargets = useMemo(() => {
    if (filterMode === 'amr') return AMR_TARGETS;
    if (filterMode === 'vf') return VF_TARGETS;
    if (filterMode === 'critical') return allTargets.filter(t => t.threat === 'CRITICAL');
    return allTargets;
  }, [filterMode, allTargets]);

  const activeTarget = allTargets.find(t => t.id === selectedTargetId) || allTargets[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 transition-colors shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Antimicrobial Resistance (CARD) &amp; Virulence Factor (VFDB) Profiler
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Screens assembly contigs for acquired resistance genes, point mutations, and pathogenicity islands to forecast clinical treatment failure.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              filterMode === 'all'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Determinants ({allTargets.length})
          </button>
          <button
            onClick={() => setFilterMode('amr')}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
              filterMode === 'amr'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Pill className="w-3 h-3" />
            <span>AMR Only ({AMR_TARGETS.length})</span>
          </button>
          <button
            onClick={() => setFilterMode('vf')}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
              filterMode === 'vf'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Virulence (VFDB) ({VF_TARGETS.length})</span>
          </button>
          <button
            onClick={() => setFilterMode('critical')}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
              filterMode === 'critical'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Critical Only</span>
          </button>
        </div>
      </div>

      {/* Pathotype Summary HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50">
          <div className="flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 font-semibold">
            <span>Inferred Pathotype</span>
            <Stethoscope className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
            Uropathogenic E. coli (UPEC / ExPEC)
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Meets clinical molecular criteria: fimH + hlyA + iroN + kpsM
          </div>
        </div>

        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50">
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-semibold">
            <span>AMR Phenotype</span>
            <Pill className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
            Multidrug-Resistant (MDR)
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Resistant to 4 antimicrobial classes: Penicillins, 3rd Cephs, Quinolones, Tetracyclines
          </div>
        </div>

        <div className="p-3.5 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl border border-cyan-200 dark:border-cyan-900/50">
          <div className="flex items-center justify-between text-xs text-cyan-700 dark:text-cyan-300 font-semibold">
            <span>Critical First-Line Alert</span>
            <AlertTriangle className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
            Ceftriaxone &amp; Ciprofloxacin FAIL
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Empiric sepsis protocols with Ceftriaxone or Cipro will fail! Use Carbapenem.
          </div>
        </div>
      </div>

      {/* Interactive Matrix & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Determinants Table */}
        <div className="lg:col-span-2 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px]">
              <tr>
                <th className="p-3">Target Gene</th>
                <th className="p-3">Type / Category</th>
                <th className="p-3">Drugs / Target</th>
                <th className="p-3">Match</th>
                <th className="p-3">Threat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTargets.map((item) => {
                const isSelected = selectedTargetId === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedTargetId(item.id)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/30 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        {item.type === 'amr' ? (
                          <Pill className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        ) : (
                          <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                        <span className="text-slate-900 dark:text-white">{item.gene}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {item.category}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[140px] truncate">
                      {item.type === 'amr' ? item.drugClass : item.role}
                    </td>
                    <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">
                      {item.identity}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${item.threatBadge}`}>
                        {item.threat}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right: Selected Determinant Clinical Inspector */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                {activeTarget.type === 'amr' ? 'AMR Clinical Card' : 'Virulence Factor Card'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${activeTarget.threatBadge}`}>
                {activeTarget.threat} RISK
              </span>
            </div>

            <div>
              <div className="font-mono text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{activeTarget.gene}</span>
                <span className="text-xs font-normal text-slate-500 font-sans">({activeTarget.database})</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeTarget.category}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase">
                Molecular Mechanism:
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                {activeTarget.mechanism}
              </p>
            </div>

            {activeTarget.type === 'amr' ? (
              <div className="text-xs space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">Compromised Antibiotics:</span>
                <div className="flex flex-wrap gap-1">
                  {activeTarget.drugs.map((d, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 font-mono text-[11px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs space-y-1">
                <span className="text-slate-500 font-semibold block text-[11px]">Target Organ &amp; Pathogenesis:</span>
                <div className="px-2 py-1 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono text-[11px]">
                  {activeTarget.targetOrgan}
                </div>
              </div>
            )}

            <div className="text-xs space-y-1 pt-1">
              <span className="text-slate-500 font-semibold block text-[11px]">Clinical Management &amp; Impact:</span>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                {activeTarget.clinicalNote}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Identity: {activeTarget.identity}</span>
            <span>Coverage: {activeTarget.coverage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
