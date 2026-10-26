import React, { useState } from 'react';
import { Sparkles, Dna, ArrowRight } from 'lucide-react';

const CODON_TABLE = {
  ATG: { aa: 'M', name: 'Methionine (Start / fMet)', isStart: true },
  GTG: { aa: 'M', name: 'Valine / Initiator fMet (Start)', isStart: true },
  TTG: { aa: 'M', name: 'Leucine / Initiator fMet (Start)', isStart: true },
  ACC: { aa: 'T', name: 'Threonine' },
  GCC: { aa: 'A', name: 'Alanine' },
  GTC: { aa: 'V', name: 'Valine' },
  AAC: { aa: 'N', name: 'Asparagine' },
  CAG: { aa: 'Q', name: 'Glutamine' },
  AAA: { aa: 'K', name: 'Lysine' },
  CTG: { aa: 'L', name: 'Leucine' },
  CGT: { aa: 'R', name: 'Arginine' },
  GGC: { aa: 'G', name: 'Glycine' },
  ATC: { aa: 'I', name: 'Isoleucine' },
  TTC: { aa: 'F', name: 'Phenylalanine' },
  TAA: { aa: '*', name: 'Ochre Stop Codon', isStop: true },
  TAG: { aa: '*', name: 'Amber Stop Codon', isStop: true },
  TGA: { aa: '*', name: 'Opal Stop Codon', isStop: true },
};

// Representative codon sequences for sample ORFs
const MOCK_ORFS_CODONS = {
  orf1: {
    upstream: 'AGGAGG',
    spacing: 7,
    codons: ['ATG', 'AAC', 'GTC', 'CAG', 'AAA', 'GCC', 'CTG', 'CGT', 'GTC', 'TAA']
  },
  orf2: {
    upstream: 'GGAG',
    spacing: 6,
    codons: ['GTG', 'ACC', 'GCC', 'GTC', 'CTG', 'AAA', 'ATC', 'TTC', 'GGC', 'TAA']
  },
  orf3: {
    upstream: 'AGGAG',
    spacing: 8,
    codons: ['ATG', 'CTG', 'CGT', 'AAC', 'GTC', 'GCC', 'CAG', 'AAA', 'GTC', 'TGA']
  },
  orf_shadow: {
    upstream: 'No motif',
    spacing: 0,
    codons: ['ATG', 'GTC', 'CTG', 'CAG', 'AAC', 'GCC', 'CGT', 'ATC', 'TTC', 'TAA']
  },
  orf_short_a: {
    upstream: 'None',
    spacing: 0,
    codons: ['ATG', 'GCC', 'CTG', 'TAA']
  },
  orf_short_b: {
    upstream: 'GGAG',
    spacing: 6,
    codons: ['ATG', 'AAA', 'GTC', 'CTG', 'TAA']
  }
};

export default function AminoAcidTranslationRuler({ activeOrf }) {
  const [hoveredCodon, setHoveredCodon] = useState(null);

  if (!activeOrf) return null;

  const sample = MOCK_ORFS_CODONS[activeOrf.id] || MOCK_ORFS_CODONS.orf1;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Dna className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Translation &amp; Ribosome Binding Track: <span className="text-emerald-600 dark:text-emerald-400 font-mono normal-case">{activeOrf.name}</span>
          </h4>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          Bacterial Genetic Code 11
        </span>
      </div>

      {/* Upstream Shine-Dalgarno RBS + Triplet Codons Track */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-2 font-mono text-xs min-w-[620px]">
          {/* Shine-Dalgarno Badge */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mb-1 font-sans">
              Shine-Dalgarno
            </span>
            <div className={`px-2.5 py-1.5 rounded-lg border font-bold text-xs tracking-wider ${
              activeOrf.hasRBS
                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 shadow-xs'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-dashed border-slate-300 dark:border-slate-700'
            }`}>
              {sample.upstream}
            </div>
            <span className="text-[9.5px] text-slate-400 mt-1 font-sans">
              {sample.spacing > 0 ? `-${sample.spacing} bp gap` : 'Absent'}
            </span>
          </div>

          {/* Spacer Arrow */}
          <div className="flex flex-col items-center px-1 text-slate-400">
            <span className="text-[10px] select-none">···</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="text-[9px] select-none">gap</span>
          </div>

          {/* Codon triplets and peptide residues */}
          <div className="flex items-center gap-1.5 flex-1">
            {sample.codons.map((codon, idx) => {
              const info = CODON_TABLE[codon] || { aa: 'X', name: 'Unknown' };
              const isStart = idx === 0;
              const isStop = idx === sample.codons.length - 1;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCodon({ codon, ...info, idx })}
                  onMouseLeave={() => setHoveredCodon(null)}
                  className={`flex flex-col items-center p-1.5 rounded-lg border cursor-pointer transition ${
                    isStart
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/50 hover:scale-105'
                      : isStop
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-600/50 hover:scale-105'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  {/* Nucleotide Codon */}
                  <span className={`text-[11px] font-bold ${
                    isStart ? 'text-emerald-700 dark:text-emerald-400' : isStop ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {codon}
                  </span>
                  {/* Amino Acid Residue */}
                  <span className={`text-xs font-black mt-0.5 ${
                    isStart ? 'text-emerald-800 dark:text-emerald-300' : isStop ? 'text-rose-800 dark:text-rose-300' : 'text-cyan-700 dark:text-cyan-400'
                  }`}>
                    {info.aa}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hover Tooltip / Didactic Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
        {hoveredCodon ? (
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
              Codon #{hoveredCodon.idx + 1}: {hoveredCodon.codon}
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              Encodes <strong>{hoveredCodon.name}</strong> ({hoveredCodon.aa})
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Hover any codon block to inspect amino acid translation and genetic code properties.</span>
          </div>
        )}

        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          Start: <strong className="text-emerald-600 dark:text-emerald-400">{activeOrf.startCodon}</strong> | Stop: <strong className="text-rose-600 dark:text-rose-400">{activeOrf.stopCodon}</strong>
        </div>
      </div>
    </div>
  );
}
