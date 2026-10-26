/**
 * Standard bioinformatics genome assembly metrics (QUAST formulation)
 */

/**
 * Calculate N50, L50, and total assembly length from an array of contig lengths
 * @param {number[]} contigLengths
 * @returns {{n50: number, l50: number, totalLength: number, contigCount: number}}
 */
export function calculateAssemblyMetrics(contigLengths) {
  if (!contigLengths || contigLengths.length === 0) {
    return { n50: 0, l50: 0, totalLength: 0, contigCount: 0 };
  }

  // Sort contigs descending
  const sorted = [...contigLengths].sort((a, b) => b - a);
  const totalLength = sorted.reduce((sum, len) => sum + len, 0);
  const halfLength = totalLength / 2;

  let cumulativeLength = 0;
  let n50 = 0;
  let l50 = 0;

  for (let i = 0; i < sorted.length; i++) {
    cumulativeLength += sorted[i];
    if (cumulativeLength >= halfLength) {
      n50 = sorted[i];
      l50 = i + 1; // 1-based index count
      break;
    }
  }

  return {
    n50,
    l50,
    totalLength,
    contigCount: sorted.length
  };
}

/**
 * Format base pairs with commas or standard kb/Mb units
 */
export function formatBp(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)} Mb`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)} kb`;
  return `${num} bp`;
}
