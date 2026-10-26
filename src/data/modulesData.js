export const MODULES_METADATA = [
  {
    id: 0,
    shortTitle: '0. Pipeline Overview',
    title: 'Bacterial Genomics End-to-End Pipeline Roadmap',
    tool: 'Workflow Architecture',
    iconName: 'Sparkles',
    badge: 'Curriculum Cover',
    goal: 'Understand the end-to-end bioinformatics lifecycle from raw sequencing reads to clinical functional annotation.',
    cliEquivalent: 'fastp -> spades.py -> quast.py & checkm2 -> prodigal -> bakta & abricate'
  },
  {
    id: 1,
    shortTitle: '1. Read QC & Coverage',
    title: 'Sequencing Depth, Quality & Lander-Waterman',
    tool: 'fastp / FastQC',
    iconName: 'Sliders',
    badge: 'QC & Depth',
    goal: 'Understand why 30x–50x coverage is needed for short-read assembly and why untrimmed 3\' errors/adapters poison downstream graphs.',
    cliEquivalent: 'fastp -i reads_R1.fq.gz -I reads_R2.fq.gz -o clean_R1.fq.gz -O clean_R2.fq.gz --detect_adapter_for_pe --cut_tail --cut_mean_quality 20'
  },

  {
    id: 2,
    shortTitle: '2. De Bruijn Graph',
    title: 'k-mer Spectrum, Repeats & Error Bubbles',
    tool: 'SPAdes / Shovill / Bandage',
    iconName: 'Share2',
    badge: 'De Bruijn Graph',
    goal: 'Explore how k-mer size balances repeat resolution against coverage fragmentation, and how sequencing errors form tips and bubbles.',
    cliEquivalent: 'spades.py -1 clean_R1.fq.gz -2 clean_R2.fq.gz -k 21,33,55,77,99,127 --careful -o spades_output/'
  },
  {
    id: 3,
    shortTitle: '3. Repeats & Scaffolding',
    title: 'Why Short Reads Fragment & QUAST QC',
    tool: 'QUAST / Unicycler / Bandage',
    iconName: 'Layers',
    badge: 'QUAST & Scaffolding',
    goal: 'See why 150 bp reads cannot resolve 5 kb rRNA operons, how paired-end reads scaffold contigs, and why highest N50 is not always best.',
    cliEquivalent: 'quast.py assembly_A.fasta assembly_B.fasta assembly_C.fasta -R ecoli_ref.fasta -o quast_comparison/'
  },
  {
    id: 4,
    shortTitle: '4. Structural Annotation',
    title: 'Ab Initio Gene Calling & Shine-Dalgarno Motifs',
    tool: 'Prodigal / Pyrodigal',
    iconName: 'Search',
    badge: 'Gene Calling',
    goal: 'Distinguish random Open Reading Frames (ORFs) from true bacterial coding sequences (CDS) using length, start codons, and RBS motifs.',
    cliEquivalent: 'prodigal -i contigs.fasta -o genes.gff -a proteins.faa -d genes.fna -p single -m'
  },
  {
    id: 5,
    shortTitle: '5. Functional Annotation',
    title: 'Homology Triage, Domain Traps & Hypotheticals',
    tool: 'Bakta / Prokka / Diamond',
    iconName: 'Database',
    badge: 'Functional Triage',
    goal: 'Avoid the "domain trap" in BLAST/Diamond searches by balancing query coverage, percent identity, and curated database hierarchy.',
    cliEquivalent: 'bakta --db bakta_db/ --min-contig-length 200 --prefix bacterial_sample contigs.fasta'
  }
];
