import React from 'react';
import { X, CheckCircle2, AlertTriangle, ExternalLink, FileSearch } from 'lucide-react';

const MOCK_BLAST_ALIGNMENTS = {
  // CDS 1
  hit1: {
    program: 'BLASTP 2.14.0+',
    database: 'Swiss-Prot (UniProtKB/Swiss-Prot release 2024_04)',
    queryHeader: 'Query= locus_tag=CDS_001 [organism=Escherichia coli] [length=286 aa]',
    subjectHeader: 'Subject= sp|P62593|BLAT_ECOLX Beta-lactamase TEM-1 [length=286 aa]',
    score: '584 bits (1505)',
    evalue: '0.0',
    identities: '286/286 (100%)',
    positives: '286/286 (100%)',
    gaps: '0/286 (0%)',
    blocks: [
      {
        qStart: 1,
        qSeq: 'MSIQHFRVALIPFFAAFCLPVFAHPETLVKVKDAEDQLGARVGYIELDLNSGKILESFRP',
        match: '||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||',
        sSeq: 'MSIQHFRVALIPFFAAFCLPVFAHPETLVKVKDAEDQLGARVGYIELDLNSGKILESFRP',
        sStart: 1
      },
      {
        qStart: 61,
        qSeq: 'EERFPMMSTFKVLLCGAVLSRVDAGQEQLGRRIHYSQNDLVEYSPVTEKHLTDGMTVREL',
        match: '||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||',
        sSeq: 'EERFPMMSTFKVLLCGAVLSRVDAGQEQLGRRIHYSQNDLVEYSPVTEKHLTDGMTVREL',
        sStart: 61
      }
    ],
    verdict: 'Golden Ortholog: 100% full-length identical alignment to experimentally curated Swiss-Prot TEM-1 beta-lactamase.'
  },
  hit2: {
    program: 'BLASTP 2.14.0+',
    database: 'NCBI RefSeq (non-redundant nr)',
    queryHeader: 'Query= locus_tag=CDS_001 [length=286 aa]',
    subjectHeader: 'Subject= ref|WP_00123456.1| regulatory protein BlaR1 [Staphylococcus aureus]',
    score: '68.2 bits (165)',
    evalue: '3e-11',
    identities: '34/121 (28%)',
    positives: '61/121 (50%)',
    gaps: '8/121 (6%)',
    blocks: [
      {
        qStart: 45,
        qSeq: 'IELDLNSGKILESFRPEERFPMMSTFKVLLCGAVLSRVDAGQEQLGRRIHYSQNDLVEYS',
        match: '+ +D+ +G+ L + R ++   + +  KVL+  A    ++ G+     +  +  +  +  +',
        sSeq: 'VYIDIGTGEYLITNRKDDFKKLKTAAKVLIAAA--EELNLGKVVETEKIEWGDDSFIKYA',
        sStart: 112
      }
    ],
    verdict: 'Partial Serine-Hydrolase Homology: Low coverage (42%) and weak identity (28%). Do NOT assign regulatory BlaR1 to a genuine TEM-1 enzyme!'
  },

  // CDS 2
  hit3: {
    program: 'BLASTP 2.14.0+',
    database: 'Swiss-Prot (UniProtKB/Swiss-Prot release 2024_04)',
    queryHeader: 'Query= locus_tag=CDS_002 [length=380 aa]',
    subjectHeader: 'Subject= sp|P0A7B8|PCRA_GEOST ATP-dependent DNA helicase PcrA [length=740 aa]',
    score: '172 bits (436)',
    evalue: '1e-42',
    identities: '58/60 (96.7%)',
    positives: '60/60 (100%)',
    gaps: '0/60 (0%)',
    blocks: [
      {
        qStart: 48,
        qSeq: 'GAGKTALLDILAAALPTTEGSVLVLDNFNPDERIEKAFARAGEVPFIVEEAKRSLDTRKA',
        match: '||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||',
        sSeq: 'GAGKTALLDILAAALPTTEGSVLVLDNFNPDERIEKAFARAGEVPFIVEEAKRSLDTRKA',
        sStart: 15
      }
    ],
    verdict: 'THE DOMAIN TRAP! Despite an astounding 96.7% identity and 1e-42 E-value, this alignment spans ONLY 60 amino acids (16% query coverage). It is the conserved Walker-A P-loop ATP-binding cassette, NOT a helicase!'
  },
  hit4: {
    program: 'BLASTP 2.14.0+',
    database: 'TrEMBL / UniRef90',
    queryHeader: 'Query= locus_tag=CDS_002 [length=380 aa]',
    subjectHeader: 'Subject= tr|A0A024R1A1| YkpA ABC transporter permease [Escherichia coli]',
    score: '458 bits (1178)',
    evalue: '2e-135',
    identities: '215/368 (58.4%)',
    positives: '290/368 (78.8%)',
    gaps: '4/368 (1%)',
    blocks: [
      {
        qStart: 12,
        qSeq: 'LLVLVLALVTLFVLVGAGKTALLDILAAALPTTEGSVLVLDNFNPDERIEKAFARAGEVP',
        match: '+LV++LA+ TL +++GAGKTALLD+LAA LP +EGSVLVLDNF+P ERIE+AF RAG VP',
        sSeq: 'VLVILLAIFTLTLIMGAGKTALLDVLAAGLPASEGSVLVLDNFDPKERIERAFTRAGAVP',
        sStart: 10
      },
      {
        qStart: 72,
        qSeq: 'FIVEEAKRSLDTRKAALLLTRLVEQFPWLRQRVGLSLALVGSVTLLSVLVAAIPQYLVGF',
        match: '++VEEAK+SLDTRKA+LLLTRL+EQFPWLRQRVG+SLAL+G++T+LS++V AIPQYL+GF',
        sSeq: 'YVVEEAKKSLDTRKASLLLTRLLEQFPWLRQRVGISLALIGALTMLSIVVTAIPQYLLGF',
        sStart: 70
      }
    ],
    verdict: 'True Physiological Ortholog: 97% reciprocal query coverage with high synteny across the transmembrane and permease domains.'
  },

  // CDS 3
  hit5: {
    program: 'BLASTP 2.14.0+',
    database: 'NCBI nr',
    queryHeader: 'Query= locus_tag=CDS_003 [length=140 aa]',
    subjectHeader: 'Subject= ref|WP_999999.1| putative membrane protein [uncultured bacterium]',
    score: '24.6 bits (52)',
    evalue: '0.24',
    identities: '12/50 (24%)',
    positives: '21/50 (42%)',
    gaps: '3/50 (6%)',
    blocks: [
      {
        qStart: 15,
        qSeq: 'VLLAAILFSGLLVVALAIPFVSLLPV',
        match: '+LL  IL +G+LV+  A+P + +LP+',
        sSeq: 'LLLLGILVAGILVILFALPIIPILPI',
        sStart: 88
      }
    ],
    verdict: 'Insignificant Optical Noise: E-value of 0.24 means this match occurs by pure random chance. Mandatory fallback: "hypothetical protein".'
  }
};

export default function BlastPairwiseModal({ hit, gene, onClose }) {
  if (!hit) return null;

  const align = MOCK_BLAST_ALIGNMENTS[hit.id] || MOCK_BLAST_ALIGNMENTS.hit1;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                Pairwise BLAST Alignment: {hit.product}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {align.program} | {hit.db} ({hit.accession})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs">
          {/* Metadata Block */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-slate-700 dark:text-slate-300">
            <div>{align.queryHeader}</div>
            <div>{align.subjectHeader}</div>
            <div className="text-emerald-700 dark:text-emerald-400 font-bold pt-1">
              Score = {align.score}, Expect = {align.evalue}
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Identities = {align.identities}, Positives = {align.positives}, Gaps = {align.gaps}
            </div>
          </div>

          {/* Pairwise Alignment Text Blocks */}
          <div className="space-y-4 bg-slate-900 text-emerald-300 p-4 rounded-xl border border-slate-800 overflow-x-auto shadow-inner leading-relaxed">
            {align.blocks.map((b, i) => (
              <div key={i} className="space-y-0.5 select-all">
                <div className="flex gap-2 text-slate-200">
                  <span className="w-12 text-slate-400">Query</span>
                  <span className="w-6 text-right text-slate-500">{b.qStart}</span>
                  <span className="tracking-widest">{b.qSeq}</span>
                  <span className="text-slate-500">{b.qStart + b.qSeq.length - 1}</span>
                </div>
                <div className="flex gap-2 text-cyan-400">
                  <span className="w-12"></span>
                  <span className="w-6"></span>
                  <span className="tracking-widest">{b.match}</span>
                </div>
                <div className="flex gap-2 text-slate-200">
                  <span className="w-12 text-slate-400">Sbjct</span>
                  <span className="w-6 text-right text-slate-500">{b.sStart}</span>
                  <span className="tracking-widest">{b.sSeq}</span>
                  <span className="text-slate-500">{b.sStart + b.sSeq.length - 1}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Verdict Callout */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-slate-700 dark:text-slate-300 text-xs font-sans leading-relaxed">
            <strong className="text-amber-800 dark:text-amber-300">Bioinformatics Interpretation:</strong> {align.verdict}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium text-xs hover:bg-slate-700 transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
