/**
 * Diagnostic practical checkpoints for Modules 1 through 5.
 * Each module contains 2 rigorous, didactic multiple-choice questions (10 questions total).
 */

export const DIAGNOSTIC_QUESTIONS = {
  1: [
    {
      id: 'm1_q1',
      questionNum: 1,
      title: 'Lander-Waterman Coverage & Assembly Breakage',
      question: "At 8x sequencing depth, even if every read is 100% error-free, why does a short-read assembler still produce dozens of fragmented contigs?",
      options: [
        {
          id: 'a',
          text: "Because the assembler deletes reads when coverage is below 20x.",
          correct: false,
          feedback: "Assemblers do not arbitrarily delete all reads below 20x, though very low-abundance k-mers may be filtered out as potential sequencing errors."
        },
        {
          id: 'b',
          text: "Random Poisson sampling leaves physical 0x coverage gaps where no reads happened to land.",
          correct: true,
          feedback: "Spot on! By Lander-Waterman statistics, random shotgun sampling follows a Poisson distribution. At low mean depth (e.g. 8x), the probability P(0) = e^(-C) means multiple stochastic loci receive zero reads, physically breaking the De Bruijn graph into disjoint contigs."
        },
        {
          id: 'c',
          text: "Phred scores are always lower when coverage is low.",
          correct: false,
          feedback: "Per-base Phred quality is a physical property of the Illumina optical flowcell, SBS chemistry, and cluster phasing, entirely independent of how many reads you sequence."
        }
      ]
    },
    {
      id: 'm1_q2',
      questionNum: 2,
      title: "Phred Quality Decay & fastp 3' Trimming",
      question: "In our raw FASTQ viewer, why do basecalling quality scores drop steeply toward the 3' end (cycles 130–150), and what is the consequence if left untrimmed?",
      options: [
        {
          id: 'a',
          text: "Optical cluster fading and phasing accumulation (lagging fluorophore release) create false k-mers that poison the De Bruijn graph with dead-end tips and bubbles.",
          correct: true,
          feedback: "Exactly right! During sequencing-by-synthesis, incomplete fluorophore cleavage (phasing) and laser photobleaching degrade signal-to-noise toward the 3' end. If not trimmed with fastp, these erroneous 3' bases create millions of spurious k-mers that tangle the assembly graph."
        },
        {
          id: 'b',
          text: "The bacterial genome naturally runs out of adenine and thymine bases toward the 3' end.",
          correct: false,
          feedback: "Bacterial base composition does not depend on cycle position in a sequencer; this is an optical and chemical artifact of Illumina sequencing-by-synthesis."
        },
        {
          id: 'c',
          text: "The sequencing adapter adds complementary nucleotides that prevent basecalling.",
          correct: false,
          feedback: "Sequencing adapters produce read-through into known synthetic primer sequences, but the continuous gradual quality decay is caused by phasing and fluorophore exhaustion."
        }
      ]
    }
  ],
  2: [
    {
      id: 'm2_q1',
      questionNum: 1,
      title: 'k-mer Size & Repeat Topology in De Bruijn Graphs',
      question: "In the De Bruijn graph, what happens when you choose a k-mer size that is SHORTER than a repetitive sequence in the genome?",
      options: [
        {
          id: 'a',
          text: "The repeat collapses into a central node/loop with multiple incoming and outgoing paths, making the true order ambiguous.",
          correct: true,
          feedback: "Correct! When k is smaller than the repeat length, identical k-mers from different genomic copies merge into the exact same De Bruijn graph nodes, creating an ambiguous fork where the assembler cannot determine which incoming path pairs with which outgoing path."
        },
        {
          id: 'b',
          text: "The graph shatters into unconnected fragments.",
          correct: false,
          feedback: "Graph fragmentation happens when k is too LARGE (approaching the read length) relative to sequencing depth, because consecutive reads fail to share a full (k-1) base overlap."
        },
        {
          id: 'c',
          text: "It creates a dead-end tip on the graph.",
          correct: false,
          feedback: "Dead-end tips are caused by sequencing errors near the 3' or 5' end of reads, not repetitive DNA sequences."
        }
      ]
    },
    {
      id: 'm2_q2',
      questionNum: 2,
      title: 'Graph Simplification: Bubble Popping vs Tip Clipping',
      question: "How does a De Bruijn graph assembler like SPAdes distinguish a genuine genomic branch from a sequencing error bubble?",
      options: [
        {
          id: 'a',
          text: "By checking k-mer coverage depth: a sequencing error path has very low coverage (~1-2x) compared to the genuine genomic backbone (~30-50x), whereas genuine branches have balanced coverage.",
          correct: true,
          feedback: "Bingo! Sequencing errors are stochastic and rarely recur at the exact same base, leaving the erroneous path with 1x or 2x k-mer depth. In contrast, true single-copy genomic sequences enjoy the full ~30-50x mean sequencing depth, allowing algorithms to confidently pop the low-coverage error bubble."
        },
        {
          id: 'b',
          text: "By aligning reads against the human reference genome.",
          correct: false,
          feedback: "De novo assembly does not use an external reference genome. De Bruijn graph simplification relies purely on topological graph heuristics and local k-mer abundance."
        },
        {
          id: 'c',
          text: "By arbitrarily deleting whichever branch has a higher GC content.",
          correct: false,
          feedback: "GC content varies naturally across bacterial genomes and is never used as an arbitrary deletion criterion in graph cleaning."
        }
      ]
    }
  ],
  3: [
    {
      id: 'm3_q1',
      questionNum: 1,
      title: 'Repeat Bottlenecks & Scaffolding Limitations',
      question: "An E. coli genome (~4.6 Mb) has seven nearly identical 5,000 bp rRNA (rrn) operons. Why can't standard 150 bp paired-end reads (450 bp insert size) assemble this into 1 circular chromosome?",
      options: [
        {
          id: 'a',
          text: "Because E. coli has linear chromosomes.",
          correct: false,
          feedback: "Wild-type E. coli has a single continuous, circular double-stranded DNA chromosome (~4.64 Mb)."
        },
        {
          id: 'b',
          text: "Both the read length (150 bp) and paired-end insert size (450 bp) are shorter than the 5,000 bp repeat, so neither k-mers nor read pairs can bridge across unique flanking regions.",
          correct: true,
          feedback: "Exactly! To resolve an assembly repeat without ambiguity, you need reads or mate-pair inserts that span from the unique upstream flank across the entire 5,000 bp repeat and into the unique downstream flank. Standard 150 bp reads and 450 bp inserts fall entirely inside the repeat, requiring long reads (Oxford Nanopore / PacBio) to achieve a complete, closed circular genome."
        },
        {
          id: 'c',
          text: "SPAdes cannot process rRNA sequences because they are high in GC content.",
          correct: false,
          feedback: "Bacterial rRNA operons are easily sequenced and covered in Illumina datasets; the bottleneck is strictly mathematical graph ambiguity due to 100% identical sequence repeats."
        }
      ]
    },
    {
      id: 'm3_q2',
      questionNum: 2,
      title: 'The N50 Trap & CheckM2 Quality Assessment',
      question: "Assembly C boasts the highest N50 (390 kb), but CheckM2 flags it with an 8.74% contamination penalty and demotes it to Medium-Quality. Why is the highest N50 not always the best assembly?",
      options: [
        {
          id: 'a',
          text: "The high N50 was achieved by aggressively forcing chimeric joins across identical 5 kb rRNA repeats, creating 14 catastrophic misassemblies and duplicating gene markers.",
          correct: true,
          feedback: "Spot on! This is 'The N50 Trap'. Over-aggressive scaffolding heuristics blindly joined contigs across identical ribosomal repeats (fusing the left flank of rRNA #1 to the right flank of rRNA #4). CheckM2's machine-learning model detected the resulting abnormal duplicate marker features and high chimeric rate, appropriately penalizing the genome quality score."
        },
        {
          id: 'b',
          text: "CheckM2 penalizes assemblies if their file size on disk is too large.",
          correct: false,
          feedback: "CheckM2 evaluates biological feature vectors (pathway completeness, marker duplications, coding density), not file sizes."
        },
        {
          id: 'c',
          text: "An assembly with high N50 automatically loses all transfer RNA genes.",
          correct: false,
          feedback: "High contiguity does not cause tRNA loss; the flaw in Assembly C is structural misassembly and false duplication across repeats."
        }
      ]
    }
  ],
  4: [
    {
      id: 'm4_q1',
      questionNum: 1,
      title: 'Prodigal Ab Initio Gene Calling & False Positives',
      question: "In Frame +2 of our contig, there are two small ORFs (<120 bp) with no upstream Shine-Dalgarno (AGGAGG) motif. How does Prodigal treat them?",
      options: [
        {
          id: 'a',
          text: "It annotates them as valid genes because every ATG-to-Stop interval is a gene.",
          correct: false,
          feedback: "In random DNA with 50% GC content, stop codons occur roughly every ~21 codons (64 bp) by pure chance! Calling every open reading frame would flood the bacterial genome with thousands of spurious false positives."
        },
        {
          id: 'b',
          text: "It rejects them as likely random open reading frames because they lack coding hexamer bias, sufficient length, and an upstream RBS.",
          correct: true,
          feedback: "Correct! Modern prokaryotic gene prediction tools like Prodigal/Pyrodigal calculate a log-likelihood score based on hexamer coding bias, length penalties (<180 bp), start codon frequency (ATG > GTG > TTG), and ribosome binding site (RBS) motif presence and optimal spacing (5-10 bp upstream)."
        },
        {
          id: 'c',
          text: "It merges them with Frame +1.",
          correct: false,
          feedback: "Reading frames are distinct translations shifted by 1 or 2 nucleotides; bacterial gene callers never merge frames unless a documented ribosomal frameshift is explicitly modeled."
        }
      ]
    },
    {
      id: 'm4_q2',
      questionNum: 2,
      title: 'Shine-Dalgarno Spacing & Non-Canonical Start Codons',
      question: "Why do ab initio bacterial gene callers strictly evaluate the spacing between the Shine-Dalgarno motif and the start codon, and can bacterial genes start with codons other than ATG?",
      options: [
        {
          id: 'a',
          text: "The 16S rRNA 3' anti-SD tail requires an optimal 5–10 bp spacer to align the ribosome P-site with the start codon, and bacteria frequently use GTG (~14%) or TTG (~3%) as valid formylmethionine start codons.",
          correct: true,
          feedback: "Superb! The physical architecture of the bacterial 30S ribosomal subunit requires 5-10 bp between the Shine-Dalgarno binding cleft and the catalytic peptidyl site. Furthermore, canonical bacterial translation allows GTG and TTG start codons (recognized by fMet-tRNA), which Prodigal models dynamically."
        },
        {
          id: 'b',
          text: "Bacteria only ever use ATG start codons, and the ribosome binds exactly 1 nucleotide downstream of the promoter.",
          correct: false,
          feedback: "In E. coli, ~14% of functional genes start with GTG (e.g. gyrB) and ~3% start with TTG. Translation initiation requires a 5-10 bp spacer from the Shine-Dalgarno sequence."
        },
        {
          id: 'c',
          text: "Bacterial mRNAs do not use ribosome binding sites because they have 5' methyl-guanosine caps.",
          correct: false,
          feedback: "5' 7-methylguanosine caps are eukaryotic mRNA features! Bacteria use Shine-Dalgarno sequences on polycistronic mRNAs."
        }
      ]
    }
  ],
  5: [
    {
      id: 'm5_q1',
      questionNum: 1,
      title: 'Homology Triage & The Domain Trap',
      question: "Look at CDS_002 ('The Domain Trap'). Why is annotating it as 'ATP-dependent DNA helicase PcrA' a serious bioinformatics error?",
      options: [
        {
          id: 'a',
          text: "Because the E-value (1e-42) is too high to be statistically significant.",
          correct: false,
          feedback: "An E-value of 1e-42 is astronomically significant statistically—it proves beyond doubt that the sequence similarity is real, but it only validates a 60 aa shared domain, not the functional identity of the entire 395 aa protein!"
        },
        {
          id: 'b',
          text: "Because the alignment only covers 16% of our protein (a shared ATP-binding Walker A motif), whereas the rest of the protein is a completely different family.",
          correct: true,
          feedback: "Bravo! Conserved structural and catalytic domains (such as ATP-binding cassettes, zinc fingers, and Walker-A motifs) are shared across thousands of completely unrelated protein superfamilies. Annotating a 395 aa ABC transporter as a DNA helicase because of a 96% identity hit across 16% query coverage is the single most common cause of transitive misannotation in public databases!"
        },
        {
          id: 'c',
          text: "Because you should always pick the hit with the highest % identity regardless of length.",
          correct: false,
          feedback: "Relying purely on % identity or E-value without demanding high mutual query coverage (>70-80%) will lead directly into the 'Domain Trap'."
        }
      ]
    },
    {
      id: 'm5_q2',
      questionNum: 2,
      title: 'Clinical Pathotyping & Antimicrobial Resistance (AMR)',
      question: "Our annotated contigs revealed blaCTX-M-15 (ESBL) along with fimH, hlyA, iroN, and kpsM. What are the clinical and microbiological implications for this patient isolate?",
      options: [
        {
          id: 'a',
          text: "It is a multidrug-resistant Uropathogenic E. coli (UPEC) capable of uroepithelial adherence, hemolysis, and serum survival; standard empiric cephalosporin (Ceftriaxone) therapy will fail, requiring carbapenem treatment.",
          correct: true,
          feedback: "Outstanding clinical bioinformatics! The molecular virulence signature (fimH adhesin + hlyA toxin + iroN salmochelin + kpsM capsule) classifies this isolate as an invasive UPEC/ExPEC pathotype. The presence of blaCTX-M-15 renders third-generation cephalosporins ineffective, necessitating carbapenem escalation (e.g. Meropenem) to prevent urosepsis mortality."
        },
        {
          id: 'b',
          text: "It is a non-pathogenic laboratory cloning strain that can be safely treated with oral ampicillin.",
          correct: false,
          feedback: "blaCTX-M-15 confers high-level resistance to ampicillin and cephalosporins, and the 4 virulence factors confirm an extraintestinal pathogen, not a benign laboratory strain."
        },
        {
          id: 'c',
          text: "blaCTX-M-15 only confers resistance to heavy metals and has no effect on beta-lactam antibiotics.",
          correct: false,
          feedback: "blaCTX-M-15 is the world's most widespread Extended-Spectrum Beta-Lactamase (ESBL), hydrolyzing cephalosporins and penicillins."
        }
      ]
    }
  ]
};
