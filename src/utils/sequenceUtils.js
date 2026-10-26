import { PSEUDO_POSITIONS, NUM_BINS } from '../data/locusToySequence';

/**
 * Simulate Poisson-distributed read pileup over a 100-bin (1,000 bp) locus
 * @param {number} coverage - Sequencing depth (4x to 70x)
 * @param {number} errorRate - Error rate percentage (0.5% to 4.5%)
 * @param {boolean} trimmed - Whether fastp quality trimming is active
 * @returns {{reads: Array, depthTrack: number[], zeroBins: number, lowDepthBins: number, effectiveCoverage: string}}
 */
export function simulateReadPileup(coverage, errorRate, trimmed) {
  const readLen = trimmed ? 13 : 15; // 15 bins = 150 bp, trimmed = 130 bp
  const numReads = Math.max(3, Math.round(coverage * 6.5));
  const generatedReads = [];
  const depth = new Array(NUM_BINS).fill(0);

  for (let i = 0; i < numReads; i++) {
    let start;
    if (i < PSEUDO_POSITIONS.length) {
      start = PSEUDO_POSITIONS[i];
    } else {
      // Linear congruential distribution to fill bins as coverage increases
      start = (i * 17 + 23) % (NUM_BINS - readLen);
    }
    start = Math.min(NUM_BINS - readLen, Math.max(0, start));
    const end = start + readLen;

    // Determine errors
    const has3PrimeError = !trimmed && ((i * 19 + 3) % 10 < errorRate * 2.2);
    const hasMidError = ((i * 29 + 7) % 100) < (errorRate * 9);
    const midErrorBin = start + Math.floor(readLen * 0.5);

    generatedReads.push({
      id: i,
      start,
      end,
      row: i % 10,
      has3PrimeError,
      hasMidError,
      errorPos: midErrorBin
    });

    for (let pos = start; pos < end; pos++) {
      if (pos >= 0 && pos < NUM_BINS) {
        const isCorrupted3Prime = has3PrimeError && pos >= end - 3;
        const isCorruptedMid = hasMidError && pos === midErrorBin;
        if (!isCorrupted3Prime && !isCorruptedMid) {
          depth[pos]++;
        }
      }
    }
  }

  const zeroBins = depth.filter((d) => d === 0).length;
  const lowDepthBins = depth.filter((d) => d > 0 && d < 3).length;
  const totalBases = depth.reduce((acc, val) => acc + val, 0);
  const effectiveCoverage = (totalBases / NUM_BINS).toFixed(1);

  return {
    reads: generatedReads,
    depthTrack: depth,
    zeroBins,
    lowDepthBins,
    effectiveCoverage
  };
}

/**
 * Estimate contigs across an E. coli genome (~4.6 Mb) based on coverage and errors
 * Based on Lander-Waterman mathematical formulation
 */
export function estimateLanderWatermanContigs(zeroBins, lowDepthBins, errorRate, trimmed) {
  const poissonGaps = Math.round(zeroBins * 38 + lowDepthBins * 8);
  const errorPenalty = !trimmed && errorRate > 1.5 ? Math.round(errorRate * 28) : 0;
  return Math.max(42, 42 + poissonGaps + errorPenalty);
}

/**
 * Reverse complement of a DNA nucleotide string
 */
export function reverseComplement(dna) {
  const comp = { A: 'T', T: 'A', G: 'C', C: 'G', a: 't', t: 'a', g: 'c', c: 'g' };
  return dna.split('').reverse().map((b) => comp[b] || b).join('');
}

/**
 * Calculate GC percentage
 */
export function calculateGcPercent(dna) {
  if (!dna || dna.length === 0) return 0;
  const gcCount = (dna.match(/[GCgc]/g) || []).length;
  return ((gcCount / dna.length) * 100).toFixed(1);
}
