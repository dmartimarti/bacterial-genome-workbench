/**
 * Functional annotation hits across curated and unreviewed databases
 * Includes CDS_001 (clear ortholog), CDS_002 (Domain Trap!), and CDS_003 (orphan)
 */

export const FUNCTIONAL_GENES = {
  cds1: {
    id: 'cds1',
    locusTag: 'ECO_00010',
    geneSymbol: 'dnaA',
    lengthAa: 452,
    contigStart: 120,
    contigEnd: 1475,
    strand: '+',
    title: 'CDS_001 (Clear Ortholog Match)',
    hits: [
      {
        id: 'h1',
        db: 'Swiss-Prot (Curated)',
        product: 'Chromosomal replication initiator DnaA',
        gene: 'dnaA',
        accession: 'P03004',
        evalue: '0.0',
        identity: 99.1,
        queryCov: 100,
        alignStart: 0,
        alignEnd: 100,
        recommended: true,
        note: '100% query coverage and 99.1% identity to a verified Swiss-Prot reference entry. High-confidence gold-standard annotation!'
      }
    ]
  },
  cds2: {
    id: 'cds2',
    locusTag: 'ECO_00020',
    geneSymbol: 'ykpA',
    lengthAa: 395,
    contigStart: 885,
    contigEnd: 2069,
    strand: '+',
    title: 'CDS_002 (The Domain Trap!)',
    hits: [
      {
        id: 'h2_trap',
        db: 'TrEMBL (Unreviewed)',
        product: 'ATP-dependent DNA helicase PcrA',
        gene: 'pcrA',
        accession: 'A0A024R168',
        evalue: '1e-42',
        identity: 96.0,
        queryCov: 16,
        alignStart: 12,
        alignEnd: 28,
        recommended: false,
        note: 'TRAP! 96% identity is strictly restricted to a tiny 60 aa ATP-binding Walker-A motif (16% of the protein). The remaining 84% does NOT match PcrA helicase!'
      },
      {
        id: 'h2_true',
        db: 'Swiss-Prot (Curated)',
        product: 'ABC transporter ATP-binding subunit YkpA',
        gene: 'ykpA',
        accession: 'P39886',
        evalue: '1e-118',
        identity: 58.4,
        queryCov: 97,
        alignStart: 2,
        alignEnd: 99,
        recommended: true,
        note: 'CORRECT! Even though % identity is 58.4%, the alignment spans 97% of the entire protein length against a curated Swiss-Prot reference.'
      },
      {
        id: 'h2_pfam',
        db: 'Pfam-A (HMM Profile)',
        product: 'ABC transporter family protein (PF00005)',
        gene: '-',
        accession: 'PF00005',
        evalue: '3e-35',
        identity: 42.0,
        queryCov: 88,
        alignStart: 8,
        alignEnd: 96,
        recommended: false,
        note: 'Good fallback family-level profile annotation if no full-length Swiss-Prot ortholog passes thresholds.'
      }
    ]
  },
  cds3: {
    id: 'cds3',
    locusTag: 'ECO_00030',
    geneSymbol: '-',
    lengthAa: 230,
    contigStart: 2200,
    contigEnd: 2889,
    strand: '-',
    title: 'CDS_003 (Orphan / Prophage Gene)',
    hits: [
      {
        id: 'h3_noise',
        db: 'GenBank NR (Raw)',
        product: 'Putative uncharacterized protein',
        gene: '-',
        accession: 'WP_001284912',
        evalue: '0.24',
        identity: 27.0,
        queryCov: 22,
        alignStart: 40,
        alignEnd: 62,
        recommended: false,
        note: 'Insignificant E-value (0.24) and poor query coverage (22%). This is random sequence noise and should be annotated conservatively as "Hypothetical protein".'
      }
    ]
  }
};
