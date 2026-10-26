import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Maximize2, Minimize2, X, ChevronUp, ChevronDown, Play, Trash2, HelpCircle, CornerDownLeft } from 'lucide-react';

const PRESET_COMMANDS = [
  {
    name: 'fastp',
    cmd: 'fastp -i raw_R1.fq.gz -I raw_R2.fq.gz -o clean_R1.fq.gz -O clean_R2.fq.gz --detect_adapter_for_pe --cut_tail',
    desc: 'QC & sliding-window adapter/quality trimming'
  },
  {
    name: 'spades',
    cmd: 'spades.py -1 clean_R1.fq.gz -2 clean_R2.fq.gz -k 21,33,55 --careful -o spades_out/',
    desc: 'Iterative multi-k De Bruijn graph assembler'
  },
  {
    name: 'quast',
    cmd: 'quast.py spades_out/contigs.fasta -r ecoli_k12_ref.fa -o quast_report/',
    desc: 'Assembly contiguity & misassembly evaluation'
  },
  {
    name: 'checkm2',
    cmd: 'checkm2 predict --threads 8 -i spades_out/ -o checkm2_out/ --database_path /db/CheckM2.dmnd',
    desc: 'Machine learning completeness & contamination'
  },
  {
    name: 'prokka',
    cmd: 'prokka --outdir annot_out/ --prefix ECOLI_K12 --genus Escherichia spades_out/contigs.fasta',
    desc: 'Rapid bacterial structural & functional annotation'
  },
  {
    name: 'abricate (CARD)',
    cmd: 'abricate --db card spades_out/contigs.fasta',
    desc: 'Antimicrobial resistance gene screening'
  },
  {
    name: 'abricate (VFDB)',
    cmd: 'abricate --db vfdb spades_out/contigs.fasta',
    desc: 'Bacterial virulence factor identification'
  }
];

const COMMAND_OUTPUTS = {
  'fastp': `[fastp 0.23.4] Quality trimming and adapter detection
Detecting adapter for paired-end reads...
> Read 1: Illumina TruSeq Universal Adapter detected in 4.82% of reads
> Read 2: Illumina TruSeq Adapter detected in 5.11% of reads
Filtering low-quality 3' ends with sliding window (mean Q < 20)...
Total reads processed: 1,842,500 pairs
Q20 bases before filter: 91.4% -> after filter: 98.7%
Q30 bases before filter: 83.2% -> after filter: 94.6%
Reads passed filter: 1,810,120 (98.24%)
Cleaned reads written to clean_R1.fq.gz and clean_R2.fq.gz in 14.2s.`,

  'spades': `[SPAdes v3.15.5] Multi-k De Bruijn Graph Assembler
Starting k=21 iteration...
  Constructing DBG: 4,120,540 k-mers.
  Clipping tips: pruned 12,410 low-coverage dead-ends.
  Popping bubbles: collapsed 840 sequencing error bubbles.
Starting k=33 iteration...
  Mapping paired-end reads and jumping across transposon repeats...
Starting k=55 iteration...
  Untangling long repeats up to 54 bp...
Running MismatchCorrector post-assembly...
Assembled 54 contigs. Total length: 4,638,900 bp. N50: 142,500 bp.
Output written to spades_out/contigs.fasta in 1m 42s.`,

  'quast': `[QUAST v5.2.0] Quality Assessment Tool for Genome Assemblies
Aligning spades_out/contigs.fasta against ecoli_k12_ref.fa (4.64 Mb)...
------------------------------------------------------------------------
Metric                          spades_contigs.fasta
------------------------------------------------------------------------
Total contigs (>= 500 bp)       54
Largest contig                  412,000 bp
Total length                    4,638,900 bp
Reference length                4,641,652 bp
N50                             142,500 bp
L50                             11
GC (%)                          50.8%
Genome fraction (%)             99.82%
Misassemblies                   0 (Zero structural inversions/relocations)
Mismatches per 100 kbp          1.40
Indels per 100 kbp              0.30
------------------------------------------------------------------------
HTML report saved to quast_report/report.html`,

  'checkm2': `[CheckM2 v1.0.2] Machine Learning Completeness & Contamination Predictor
[Step 1/4] Running Diamond BLASTp against universal reference database (CheckM2.dmnd)...
  Aligned 4,310 predicted CDS proteins.
[Step 2/4] Extracting 1,200 biological features (KEGG pathways, coding density, amino acid frequencies)...
  Feature extraction complete.
[Step 3/4] Evaluating Gradient Boosted Decision Tree (LightGBM) & Deep Neural Network models...
  Ensemble meta-model selected: Gradient Boosted Trees (LightGBM).
[Step 4/4] Results Summary:
  Name: spades_out/contigs.fasta
  Completeness: 99.40%
  Contamination: 0.18%
  Quality Score: 98.50 (Completeness - 5*Contamination)
  MIMAG Specification: High-Quality Draft (HQ)
CheckM2 assessment completed in 22.8s. Results: checkm2_out/quality_report.tsv`,

  'prokka': `[Prokka v1.14.6] Rapid Prokaryotic Genome Annotation
Running Prodigal v2.6.3 for structural CDS gene prediction...
  Found 4,310 potential coding sequences.
Running Aragorn v1.2 for transfer RNA prediction...
  Found 86 tRNAs (covering all 20 standard amino acids).
Running Barrnap v0.9 for ribosomal RNA detection...
  Found 7 complete rRNA operons (5S, 16S, 23S).
Running BLASTp against curated Swiss-Prot database (UniProtKB)...
  Assigned high-confidence gene names to 3,680 CDSs.
Running HMMER3 against Pfam database...
  Assigned domain signatures to 510 CDSs.
Hypothetical proteins remaining: 120 (2.78%).
Annotated GFF3 and GenBank files written to annot_out/ECOLI_K12.gff in 38.4s.`,

  'abricate (card)': `[ABRicate v1.0.1] Resistance Gene Identifier (CARD database)
#FILE                   SEQUENCE        START   END     GENE            RESISTANCE              %IDENTITY
contigs.fasta:NODE_1    14200           15076   blaCTX-M-15     CEPHALOSPORIN (ESBL)    100.00%
contigs.fasta:NODE_4    8940            9801    blaTEM-1B       PENICILLIN              99.88%
contigs.fasta:NODE_8    45012           47650   gyrA (S83L)     FLUOROQUINOLONE         100.00%
contigs.fasta:NODE_12   1200            2380    tet(A)          TETRACYCLINE            99.20%
contigs.fasta:NODE_15   6800            7382    aac(6')-Ib-cr   AMINOGLYCOSIDE/CIPRO    98.50%
Scan complete. 5 antimicrobial resistance genes detected.`,

  'abricate (vfdb)': `[ABRicate v1.0.1] Virulence Factor Identifier (VFDB database)
#FILE                   SEQUENCE        START   END     GENE    VIRULENCE FACTOR                %IDENTITY
contigs.fasta:NODE_2    21000           21900   fimH    Type 1 fimbriae tip adhesin     99.50%
contigs.fasta:NODE_5    54000           57075   hlyA    Alpha-hemolysin pore toxin      98.70%
contigs.fasta:NODE_9    12400           14600   iroN    Salmochelin siderophore rec.    100.00%
contigs.fasta:NODE_11   8200            9050    kpsM    K1/K2 capsule transport ABC     99.10%
Scan complete. ExPEC/UPEC pathotype confirmed (4 major virulence markers).`,

  'ls': `total 4640
drwxr-xr-x  6 student  bioinfo   192B Oct 26 16:30 .
drwxr-xr-x  4 student  bioinfo   128B Oct 26 16:20 ..
-rw-r--r--  1 student  bioinfo   245M Oct 26 16:21 raw_R1.fq.gz
-rw-r--r--  1 student  bioinfo   248M Oct 26 16:21 raw_R2.fq.gz
-rw-r--r--  1 student  bioinfo   4.6M Oct 26 16:22 ecoli_k12_ref.fa
drwxr-xr-x  3 student  bioinfo    96B Oct 26 16:25 spades_out/
drwxr-xr-x  4 student  bioinfo   128B Oct 26 16:26 quast_report/
drwxr-xr-x  3 student  bioinfo    96B Oct 26 16:27 checkm2_out/
drwxr-xr-x  8 student  bioinfo   256B Oct 26 16:28 annot_out/`,

  'help': `Available Workbench Practical Commands:
  • fastp        : Run sliding-window quality & adapter trimming
  • spades.py    : Multi-k iterative De Bruijn graph assembly
  • quast.py     : Contiguity & misassembly evaluation vs reference
  • checkm2      : Machine learning completeness & contamination
  • prokka       : Structural (Prodigal) & functional annotation
  • abricate     : AMR (CARD) & Virulence (VFDB) profiling
  • ls           : List virtual workspace directory files
  • clear        : Clear console output screen`
};

export default function CliTerminalDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    {
      type: 'system',
      text: 'Bioinformatics Linux Terminal v2.4 (Ubuntu 22.04 LTS)\nType "help" or click one of the preset pipeline commands above to execute bioinformatic tools.'
    }
  ]);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen]);

  const executeCommand = (cmdStr) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    }

    const commandEntry = {
      type: 'input',
      cmd: trimmed
    };

    let outputText = '';
    const lower = trimmed.toLowerCase();

    if (lower.startsWith('fastp')) {
      outputText = COMMAND_OUTPUTS['fastp'];
    } else if (lower.startsWith('spades')) {
      outputText = COMMAND_OUTPUTS['spades'];
    } else if (lower.startsWith('quast')) {
      outputText = COMMAND_OUTPUTS['quast'];
    } else if (lower.startsWith('checkm2')) {
      outputText = COMMAND_OUTPUTS['checkm2'];
    } else if (lower.startsWith('prokka')) {
      outputText = COMMAND_OUTPUTS['prokka'];
    } else if (lower.includes('card')) {
      outputText = COMMAND_OUTPUTS['abricate (card)'];
    } else if (lower.includes('vfdb')) {
      outputText = COMMAND_OUTPUTS['abricate (vfdb)'];
    } else if (lower === 'ls' || lower.startsWith('ls ')) {
      outputText = COMMAND_OUTPUTS['ls'];
    } else if (lower === 'help') {
      outputText = COMMAND_OUTPUTS['help'];
    } else {
      outputText = `zsh: command not found: ${trimmed.split(' ')[0]}. Type "help" to see available bioinformatic commands.`;
    }

    setHistory((prev) => [
      ...prev,
      commandEntry,
      { type: 'output', text: outputText }
    ]);

    setInputVal('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (visible when terminal is closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-cyan-400 font-mono text-xs font-semibold shadow-2xl border border-cyan-500/40 hover:border-cyan-400 transition transform hover:scale-105"
        >
          <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Bioinformatics Terminal (CLI)</span>
        </button>
      )}

      {/* Docked / Expanded Terminal Drawer */}
      {isOpen && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 bg-slate-950 border-t border-slate-800 shadow-2xl flex flex-col transition-all duration-300 font-mono ${
            isExpanded ? 'h-[75vh]' : 'h-80'
          }`}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 select-none">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200">
                student@bioinfo-workbench: ~/assembly_practical
              </span>
            </div>

            {/* Quick Command Pills */}
            <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto max-w-[60%]">
              {PRESET_COMMANDS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => executeCommand(p.cmd)}
                  title={p.desc}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-cyan-900/40 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition truncate shrink-0"
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHistory([])}
                title="Clear screen"
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore height' : 'Expand terminal'}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close terminal"
                className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick preset bar for mobile / smaller screens */}
          <div className="flex lg:hidden items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 overflow-x-auto text-xs">
            <span className="text-[10px] text-slate-500 uppercase shrink-0">Presets:</span>
            {PRESET_COMMANDS.map((p) => (
              <button
                key={p.name}
                onClick={() => executeCommand(p.cmd)}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 border border-slate-700 shrink-0"
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Terminal Console Output Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs leading-relaxed select-text">
            {history.map((item, idx) => (
              <div key={idx} className="space-y-1">
                {item.type === 'system' && (
                  <pre className="text-slate-400 font-mono whitespace-pre-wrap">
                    {item.text}
                  </pre>
                )}
                {item.type === 'input' && (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span className="text-slate-500">student@workbench:~$</span>
                    <span>{item.cmd}</span>
                  </div>
                )}
                {item.type === 'output' && (
                  <pre className="text-slate-300 font-mono whitespace-pre-wrap pl-4 border-l-2 border-slate-800">
                    {item.text}
                  </pre>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Terminal Input Line */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 border-t border-slate-800">
            <span className="text-emerald-400 text-xs font-bold shrink-0">
              student@workbench:~$
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type bioinformatic command (e.g. spades.py, checkm2, quast.py, help)..."
              className="flex-1 bg-transparent text-xs text-white focus:outline-none font-mono"
              autoFocus
            />
            <button
              onClick={() => executeCommand(inputVal)}
              disabled={!inputVal.trim()}
              className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white transition flex items-center gap-1"
            >
              <span>Run</span>
              <CornerDownLeft className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
