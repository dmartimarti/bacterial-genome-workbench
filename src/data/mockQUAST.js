/**
 * Authentic QUAST metrics for 3 bacterial assemblies (E. coli K-12 MG1655 ~4.64 Mb)
 */

export const MOCK_ASSEMBLIES = {
  under: {
    id: 'under',
    name: 'Assembly A: Single Small k (k=21)',
    tag: 'Fragmented',
    n50: '18,400 bp',
    n50Raw: 18400,
    l50: 74,
    n90: '4,100 bp',
    contigs: 412,
    largestContig: '58,200 bp',
    totalLen: '4,510,200 bp',
    gc: '50.7%',
    misassemblies: 0,
    mismatchesPer100k: 4.2,
    indelsPer100k: 1.1,
    busco: '94.2%',
    checkm2: {
      completeness: 93.8,
      contamination: 0.12,
      qualityScore: 93.2,
      modelUsed: 'Gradient Boosted Trees (LightGBM)',
      mimagTier: 'High-Quality Draft (HQ)',
      codingDensity: '88.4%',
      predictedGenes: 4120,
      notes: 'Fragmented contigs caused 26 essential marker proteins to be split across contig edges, slightly penalizing completeness.'
    },
    verdict: 'Too fragmented! Small k collapsed even minor repeats (like 300 bp insertion sequences) into hundreds of tiny contigs, splitting several essential genes across contig boundaries (lowering BUSCO to 94.2%).',
    bars: [22, 19, 18, 16, 15, 14, 12, 10, 9, 8],
    nxCurve: [
      { x: 0, y: 58 },
      { x: 10, y: 38 },
      { x: 25, y: 28 },
      { x: 50, y: 18.4 },
      { x: 75, y: 8.5 },
      { x: 90, y: 4.1 },
      { x: 100, y: 1.0 }
    ]
  },
  optimal: {
    id: 'optimal',
    name: 'Assembly B: SPAdes Multi-k + Careful',
    tag: 'Gold Standard',
    n50: '142,500 bp',
    n50Raw: 142500,
    l50: 11,
    n90: '38,200 bp',
    contigs: 54,
    largestContig: '412,000 bp',
    totalLen: '4,638,900 bp',
    gc: '50.8%',
    misassemblies: 0,
    mismatchesPer100k: 1.4,
    indelsPer100k: 0.3,
    busco: '99.8%',
    checkm2: {
      completeness: 99.4,
      contamination: 0.18,
      qualityScore: 98.5,
      modelUsed: 'Gradient Boosted Trees (LightGBM)',
      mimagTier: 'High-Quality Draft (HQ)',
      codingDensity: '90.2%',
      predictedGenes: 4310,
      notes: 'Near-perfect genome reconstruction. Essential pathways (TCA, Ribosomal, Glycolysis) 100% complete with minimal duplication.'
    },
    verdict: 'Gold Standard Short-Read Draft! Stops conservatively at the boundary of multi-kilobase repeats (like the seven 5 kb rRNA operons) rather than guessing across them. Zero misassemblies and near-complete BUSCO (99.8%).',
    bars: [48, 42, 36, 30, 25, 20, 16, 12, 8, 5],
    nxCurve: [
      { x: 0, y: 412 },
      { x: 10, y: 310 },
      { x: 25, y: 220 },
      { x: 50, y: 142.5 },
      { x: 75, y: 72 },
      { x: 90, y: 38.2 },
      { x: 100, y: 5.4 }
    ]
  },
  chimeric: {
    id: 'chimeric',
    name: 'Assembly C: Aggressive Over-Merger (Chimeric)',
    tag: 'The N50 Trap',
    n50: '390,000 bp',
    n50Raw: 390000,
    l50: 4,
    n90: '110,000 bp',
    contigs: 16,
    largestContig: '1,120,000 bp',
    totalLen: '4,641,100 bp',
    gc: '50.8%',
    misassemblies: 14,
    mismatchesPer100k: 28.5,
    indelsPer100k: 4.8,
    busco: '98.1%',
    checkm2: {
      completeness: 98.6,
      contamination: 8.74,
      qualityScore: 54.9,
      modelUsed: 'Deep Neural Network (DNN)',
      mimagTier: 'Medium-Quality Draft (MQ)',
      codingDensity: '89.1%',
      predictedGenes: 4352,
      notes: 'Warning! False joins across repeat loci created artificial duplicated gene copies and aberrant marker co-occurrence, triggering high contamination penalty (>5%).'
    },
    verdict: 'THE N50 TRAP! It boasts the highest N50 (390 kb), but achieved this by blindly joining contigs across identical 5 kb rRNA repeats—gluing the left flank of rRNA Copy #1 to the right flank of rRNA Copy #4, producing 14 catastrophic misassemblies!',
    bars: [85, 65, 45, 25, 12, 6, 4],
    nxCurve: [
      { x: 0, y: 1120 },
      { x: 10, y: 850 },
      { x: 25, y: 620 },
      { x: 50, y: 390 },
      { x: 75, y: 210 },
      { x: 90, y: 110 },
      { x: 100, y: 12.0 }
    ]
  }
};
