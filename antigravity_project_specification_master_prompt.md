# Project Specification & Master Prompt: Bacterial Genome Assembly & Annotation Lab (BioAssemble-Lab)

This document contains the complete technical blueprint and a turnkey **Master Prompt** to feed into **Google Antigravity** to scaffold, build, and deploy the full-scale, multi-file educational workbench.

---

## Part 1: Project Architecture Blueprint

### 1. High-Level Summary
* **Application Name:** `bioassemble-workbench` (Bacterial Assembly & Annotation Lab)
* **Target Audience:** MSc Bioinformatics & Molecular Biology students with limited command-line experience.
* **Goal:** Demystify short-read assembly algorithms and gene calling pipelines using interactive, visual simulations side-by-side with genuine bioinformatics formats (`.fastq`, `.gfa`, `.fasta`, `.gff3`, `quast_report.tsv`).
* **Deployment Target:** Modern browser (Vite + React + Tailwind CSS), client-side only (zero server dependency for zero-latency classroom deployment).

### 2. Suggested Directory Structure for Antigravity

```text
bioassemble-workbench/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── types/
│   │   └── bioinfo.js
│   ├── data/
│   │   ├── locusToySequence.js        # Simulated 1,000 bp bacterial locus
│   │   ├── mockGFA.js                 # Realistic GFA string with repeat nodes
│   │   ├── mockFastQC.json            # FastQC per-base quality statistics
│   │   ├── mockQUAST.js               # Multi-assembly metrics (SPAdes vs A vs C)
│   │   ├── mockGFF3.js                # Structural annotations (Prodigal format)
│   │   └── functionalHits.js          # Swiss-Prot, Pfam, NR BLAST hits
│   ├── context/
│   │   └── LabStateContext.jsx        # Quiz progress, active module, student notes
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx             # Breadcrumbs, progress bar, PDF report export
│   │   │   ├── ModuleNav.jsx          # Step-by-step pipeline tabs with completion badges
│   │   │   └── StudentWorksheet.jsx   # Interactive diagnostic quiz & reflective notebook
│   │   ├── common/
│   │   │   ├── ToolCard.jsx           # CLI equivalent explainer (e.g., "fastp --detect_adapter")
│   │   │   ├── SequenceViewer.jsx     # Monospace color-coded nucleotide/protein ruler
│   │   │   └── ParameterSlider.jsx    # Accessible, styled sliders with real-time feedback
│   │   └── modules/
│   │       ├── module1_qc/
│   │       │   ├── ReadCoverageSimulator.jsx
│   │       │   ├── FastQCPlot.jsx
│   │       │   └── LanderWatermanStats.jsx
│   │       ├── module2_dbg/
│   │       │   ├── KmerOverlapSlider.jsx
│   │       │   ├── BandageGraphViewer.jsx  # Force-directed / DAG network (Cytoscape or D3)
│   │       │   └── ErrorCorrectionSandbox.jsx
│   │       ├── module3_scaffolding/
│   │       │   ├── RepeatBottleneckVisualizer.jsx
│   │       │   ├── QuastComparativeTable.jsx
│   │       │   ├── NxPlot.jsx
│   │       │   └── MisassemblyDiagram.jsx
│   │       ├── module4_structural/
│   │       │   ├── SixFrameBrowser.jsx
│   │       │   ├── RbsMotifFinder.jsx
│   │       │   └── CodingScoreInspector.jsx
│   │       └── module5_functional/
│   │           ├── AlignmentCoverageRuler.jsx
│   │           ├── DomainTrapInspector.jsx
│   │           └── Gff3LiveGenerator.jsx
│   └── utils/
│       ├── kmerUtils.js               # Dynamic k-mer generation & prefix-suffix graph builder
│       ├── assemblyMetrics.js         # N50, L50, GC content calculation formulas
│       └── exportReport.js            # Export student progress to JSON / Markdown
```

### 3. Key Library Recommendations
* **Core:** `react`, `react-dom`
* **Styling & UI:** `tailwindcss`, `lucide-react`, `clsx`, `tailwind-merge`
* **Graph & Data Visualization:**
  * `cytoscape` & `cytoscape-dagre` (or `@visx/network` / `d3-force`): for a true Bandage-style De Bruijn assembly graph.
  * `recharts` or custom SVG for the FastQC Phred curve, Lander-Waterman coverage histogram, and QUAST $N_x$ step chart.
* **Canvas / Animation:** `canvas-confetti` (for module milestone completion).

---

## Part 2: The Master Antigravity Prompt

*Copy and paste the exact prompt block below into Antigravity's task input to direct the agent.*

```text
You are an expert bioinformatics software engineer and pedagogical UI designer. 
Your objective is to build a comprehensive, production-ready, interactive educational web application named "BioAssemble Workbench" designed to teach MSc Bioinformatics students the fundamentals of bacterial short-read genome assembly and gene annotation.

The app must be built with Vite, React, Tailwind CSS, Lucide React icons, and Cytoscape.js (or D3) for graph rendering. It must run entirely client-side with zero backend dependencies, featuring high-contrast scientific dark-mode UI (slate-950 background, emerald/cyan accents).

### Architectural Requirements:
1. Divide the project into a clean multi-file modular architecture under `src/` as follows:
   - `src/components/modules/` containing 5 dedicated modules.
   - `src/context/LabStateContext.jsx` tracking active step, quiz answers, and student lab notes with local storage persistence.
   - `src/data/` containing realistic bioinformatics fixtures (GFA graphs, FastQC JSON-like structures, QUAST metrics, and GFF3 tables).
   - `src/components/layout/` including a persistent Header with a "Download Practical Report (Markdown/JSON)" button and an interactive checkpoint bar.

### Detailed Requirements for the 5 Modules:

#### Module 1: Read QC, Coverage & Lander-Waterman Statistics
- CLI Tool focus: `fastp` & `FastQC`.
- Interactive Read Pileup: Render a 1,000 bp bacterial locus track with Illumina 2x150 bp reads piling up beneath.
- Controls:
  * Sequencing Depth slider (4x to 80x). Depths below 15x must realistically compute stochastic Lander-Waterman Poisson gaps, rendering distinct red 0x dropout columns.
  * Base error rate slider (0.5% to 5.0%), creating yellow dots (random internal SNPs) and red 3' degraded tails.
  * `fastp` Quality & Adapter Trimming toggle: Clips low-Phred 3' ends and adapters, dynamically updating a FastQC-style Per-Base Phred Quality Score curve (Q10 to Q40).
- Live HUD: Show calculated Lander-Waterman metrics: Effective coverage, 0x gap count, and predicted contig count across an E. coli 4.6 Mb genome.

#### Module 2: Interactive De Bruijn Graph Sandbox
- CLI Tool focus: `SPAdes` / `Shovill` / `Bandage`.
- Sequence: 22 bp locus containing two identical copies of a 5 bp repeat ("GCTAG") separated by a unique spacer.
- Interactive Sliding Window Chopper:
  * Allow students to step through the sequence base-by-base (or drag a slider) to inspect how a k-mer splits into a (k-1) Left Prefix Node and (k-1) Right Suffix Node.
- Graph Topology Modes (toggleable k values):
  * k=3 (k < repeat length): Collapses into a multi-copy central repeat node with ambiguous incoming/outgoing edges.
  * k=5 (k = repeat length): Resolves into a clean, unambiguous linear Eulerian assembly path.
  * k=9 (k too high): Shatters the graph into disconnected subgraphs due to lack of overlap at coverage drops.
- Error Simulator:
  * Button to inject a 1x-depth sequencing error, rendering an error "Bubble" (internal SNP) and a dead-end "Tip" (3' error).
  * "SPAdes Graph Simplification" button: Evaluates k-mer depth (30x true path vs 1x false detour) to clip tips and pop bubbles.
- Visualizer: Render using an interactive network viewer (nodes, directed edges, coverage-weighted line thickness).

#### Module 3: Repeats, Scaffolding & QUAST QC
- CLI Tool focus: `QUAST`, `Unicycler`, `Bandage`.
- Bacterial Repeat Bottleneck Visualizer:
  * Show why 150 bp short reads assemble unique regions but stop at 5 kb multi-copy rRNA operons (rrn).
  * Scaffolding Toggle: Overlay paired-end read pairs (500 bp insert size) bridging smaller 350 bp IS elements (generating 'NNNN' scaffold joins), while illustrating that they cannot span the 5 kb rRNA repeat.
  * Long-Read Toggle: Introduce an Oxford Nanopore 12 kb long read spanning the entire rRNA operon to close the chromosome.
- QUAST Multi-Assembly Comparative Suite:
  * Compare 3 assemblies: Assembly A (k=21 only, fragmented), Assembly B (SPAdes Multi-k Careful, optimal), Assembly C (Chimeric Over-merger, "The N50 Trap").
  * Interactive Nx step chart and metric cards (N50, L50, Contig count, Misassembly count, BUSCO completeness).
  * Misassembly Explainer: A side-by-side synteny diagram illustrating how Assembly C artificially glued rRNA copy 1 to rRNA copy 4, generating false chromosomal translocations.

#### Module 4: Structural Annotation (Prodigal Logic)
- CLI Tool focus: `Prodigal` / `Pyrodigal`.
- 6-Frame Genome Browser over a 4.2 kb contig containing 3 true genes and 3 false-positive candidates:
  * Candidate 1: dnaA (canonical ATG, upstream AGGAGG RBS, strong coding hexamer score).
  * Candidate 2: gyrB (bacterial GTG start codon, GGAG RBS).
  * Candidate 3: Reverse-strand CDS.
  * False Positive 1: Spurious Short A (96 bp, no RBS).
  * False Positive 2: Spurious Short B (114 bp, chance GGAG match).
  * False Positive 3: Shadow ORF (420 bp, inside gyrB frame +3, lacking RBS and negative coding score).
- Dual Filter Toggles:
  1. Minimum Length (>180 bp).
  2. Require Shine-Dalgarno RBS & Hexamer Coding Score.
- Emphasize pedagogical synergy: Show that Filter 1 alone leaves the 420 bp shadow ORF, Filter 2 alone leaves Short B, and BOTH are needed to recover the exact true gene set.
- Detail Card: Clicking any ORF inspects coordinates, start codon (highlighting that GTG/TTG initiate as formylmethionine), RBS spacing, and hexamer coding score.

#### Module 5: Functional Annotation Triage (Bakta / Prokka Logic)
- CLI Tool focus: `Bakta`, `Prokka`, `Diamond`, `Swiss-Prot`, `Pfam`.
- Triage Interface for 3 CDSs:
  * CDS_001: Direct high-confidence Swiss-Prot ortholog (dnaA).
  * CDS_002 ("The Domain Trap"): Present BLAST hit A (TrEMBL: PcrA helicase, 96% identity, but only 16% query coverage over a conserved Walker-A ATP-binding cassette) vs BLAST hit B (Swiss-Prot: ABC transporter, 58% identity, 97% query coverage).
  * CDS_003: Prophage orphan gene with no significant database hits (E > 0.1).
- Interactive Controls:
  * Minimum Query Coverage Threshold slider (10% to 95%). Hits falling below cutoff are highlighted with red warning flags.
  * Assignment Buttons: Allow students to assign the proper product or fall back to "Hypothetical protein".
- Live GFF3 Exporter: Dynamically construct and display valid 9-column GFF3 lines as students assign annotations.

### Pedagogical Checkpoints & Lab Report Export:
- Each of the 5 modules must contain a diagnostic multiple-choice question testing the core bioinformatic intuition with instant, detailed mechanistic feedback.
- Persistent state: Save student answers, slider experiments, and an optional text reflection box per module into localStorage.
- A "Export Student Lab Report" feature that downloads a formatted Markdown or JSON summary of their answers, scores, and timestamps for instructor grading.

Build the complete application with high attention to bioinformatic accuracy, visual polish, robust responsive layouts, and zero console errors.
```

---

## Part 3: Step-by-Step Execution Plan for Antigravity

When running this task in Antigravity, recommend following this 4-step sequence:

1. **Step 1: Workspace Scaffolding**
   * Ask Antigravity to initialize the Vite React project, install Tailwind CSS, Lucide icons, and Cytoscape/Recharts, and configure the directory structure outlined in Part 1.
2. **Step 2: Mock Bioinformatics Data Layer (`src/data/`)**
   * Have Antigravity create realistic mock datasets (valid nucleotide sequences, realistic k-mer breakdown tables, authentic GFF3 string format, and QUAST statistics).
3. **Step 3: Component Implementation (`src/components/modules/`)**
   * Allow the agent to generate Modules 1 through 5, linking them through `LabStateContext`.
4. **Step 4: Polish & Report Export**
   * Test the interactive k-mer slider, verify that the coverage histogram correctly produces 0x gaps at $<15\times$ depth, and test the student report export function.