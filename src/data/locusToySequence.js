/**
 * Simulated 1,000 bp bacterial locus data
 * Used for Illumina 2x150 bp read pileup and Lander-Waterman statistics simulation.
 */

export const LOCUS_LENGTH_BP = 1000;
export const READ_LENGTH_BP = 150;
export const NUM_BINS = 100; // Each bin corresponds to 10 bp
export const BIN_SIZE_BP = 10;

// Deterministic pseudo-random positions for realistic non-uniform coverage
// Simulates GC-bias, stochastic Poisson clustering, and coverage drops at low depth
export const PSEUDO_POSITIONS = [
  2, 68, 14, 73, 45, 5, 81, 48, 12, 70, 84, 42, 7, 65, 18, 76, 50, 9, 83, 46,
  1, 67, 15, 72, 43, 4, 79, 52, 11, 74, 62, 22, 85, 38, 16, 69, 49, 8, 80, 44,
  34, 58, 25, 60, 31, 55, 27, 63, 35, 57, 29, 82, 3, 71, 19, 77, 47, 10, 66, 41
];

// Reference toy sequence for the 16 bp repeat locus in Module 2
export const TOY_REPEAT_SEQ = 'ATGGCTACCGCTATTA';
export const TOY_REPEAT_MOTIF = 'GCTA'; // 4 bp repeat appearing twice
