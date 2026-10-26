/**
 * Dynamic De Bruijn Graph Construction and Contig Assembly Utilities
 * Supports arbitrary DNA sequences, mathematical (k-1) node reduction,
 * Eulerian path walking, and Jellyfish k-mer spectrum simulation.
 */

export const PRESET_SEQUENCES = [
  {
    id: 'canonical',
    name: '1. Canonical Bacterial Repeat (16 bp)',
    seq: 'ATGGCTACCGCTATTA',
    repeatMotif: 'GCTA',
    repeatLen: 4,
    recommendedK: 5,
    description: 'Contains two identical copies of 4 bp repeat "GCTA". Collapses when k <= 4, resolves cleanly when k >= 5.'
  },
  {
    id: 'tandem',
    name: '2. Tandem Triplet Repeat (15 bp)',
    seq: 'ATGATGATGATGCCA',
    repeatMotif: 'ATG',
    repeatLen: 3,
    recommendedK: 5,
    description: 'Tandem 3 bp repeat (ATG)4. Creates a multi-cycle loop at k=3, resolving only when k spans across repeat boundaries.'
  },
  {
    id: 'inverted',
    name: '3. Inverted / Palindromic Locus (16 bp)',
    seq: 'ACGTGCAAGCGTGCAA',
    repeatMotif: 'GTGCAA',
    repeatLen: 6,
    recommendedK: 7,
    description: 'Longer 6 bp repeat "GTGCAA" mimicking bacterial insertion element ends.'
  }
];

/**
 * Generate k-mers and their (k-1) prefix and suffix nodes from a sequence
 */
export function generateKmers(sequence, k) {
  const kmers = [];
  const cleanSeq = sequence.toUpperCase().replace(/[^ATGC]/g, '');
  if (k > cleanSeq.length || k < 2) return [];

  for (let i = 0; i <= cleanSeq.length - k; i++) {
    const kmer = cleanSeq.slice(i, i + k);
    const prefix = kmer.slice(0, k - 1);
    const suffix = kmer.slice(1);
    kmers.push({
      index: i,
      kmer,
      prefix,
      suffix
    });
  }
  return kmers;
}

/**
 * Construct a true mathematical De Bruijn graph from any sequence and k
 */
export function constructDynamicDeBruijnGraph(sequence, kSize, hasError = false, cleaned = false) {
  const cleanSeq = sequence.toUpperCase().replace(/[^ATGC]/g, '');
  const kmers = generateKmers(cleanSeq, kSize);

  const nodeMap = new Map();
  const edgeList = [];

  // Helper to get or create node
  const getOrCreateNode = (nodeId) => {
    if (!nodeMap.has(nodeId)) {
      nodeMap.set(nodeId, {
        id: nodeId,
        kMinus1Mer: nodeId,
        inDegree: 0,
        outDegree: 0,
        depth: 0,
        incoming: [],
        outgoing: [],
        isStart: false,
        isEnd: false,
        isRepeat: false
      });
    }
    return nodeMap.get(nodeId);
  };

  // Add all k-mers as directed edges from prefix to suffix
  kmers.forEach((item, idx) => {
    const prefixNode = getOrCreateNode(item.prefix);
    const suffixNode = getOrCreateNode(item.suffix);

    prefixNode.outDegree++;
    prefixNode.depth += 30;
    suffixNode.inDegree++;
    suffixNode.depth += 30;

    const edgeId = `e_${item.prefix}_${item.suffix}_${idx}`;
    const edgeObj = {
      id: edgeId,
      source: item.prefix,
      target: item.suffix,
      kmer: item.kmer,
      index: idx,
      depth: 30,
      isError: false
    };

    prefixNode.outgoing.push(edgeObj);
    suffixNode.incoming.push(edgeObj);
    edgeList.push(edgeObj);
  });

  // Calculate start/end and repeat status
  nodeMap.forEach((node) => {
    node.isStart = node.inDegree === 0 && node.outDegree > 0;
    node.isEnd = node.outDegree === 0 && node.inDegree > 0;
    node.isRepeat = node.inDegree > 1 || node.outDegree > 1;
  });

  // Simulate Sequencing Error: SNP Bubble and 3' Tip
  const errorElements = [];
  if (hasError && !cleaned && kmers.length >= 4) {
    const midIdx = Math.floor(kmers.length / 2);
    const midKmer = kmers[midIdx];
    const sourceNode = midKmer.prefix;
    const targetNode = kmers[Math.min(kmers.length - 1, midIdx + 1)].suffix;

    // Mutated SNP node (change middle base)
    const bubbleNodeId = (sourceNode.slice(0, -1) + 'C').slice(-(kSize - 1));
    const tipNodeId = (targetNode.slice(1) + 'G').slice(-(kSize - 1));

    if (!nodeMap.has(bubbleNodeId)) {
      errorElements.push({
        data: {
          id: bubbleNodeId,
          label: `${bubbleNodeId}\n(1x SNP Bubble)`,
          depth: 1,
          type: 'error'
        }
      });
      errorElements.push({
        data: {
          id: 'e_err_in',
          source: sourceNode,
          target: bubbleNodeId,
          label: '1x SNP',
          depth: 1,
          isError: true
        }
      });
      errorElements.push({
        data: {
          id: 'e_err_out',
          source: bubbleNodeId,
          target: targetNode,
          label: '1x join',
          depth: 1,
          isError: true
        }
      });
    }

    if (!nodeMap.has(tipNodeId)) {
      errorElements.push({
        data: {
          id: tipNodeId,
          label: `${tipNodeId}\n(1x 3' Tip)`,
          depth: 1,
          type: 'tip'
        }
      });
      errorElements.push({
        data: {
          id: 'e_tip',
          source: targetNode,
          target: tipNodeId,
          label: '1x dead-end',
          depth: 1,
          isError: true
        }
      });
    }
  }

  // Build Cytoscape elements array
  const cytoscapeElements = [];

  nodeMap.forEach((node) => {
    let type = 'normal';
    if (node.isRepeat) type = 'repeat';
    else if (node.isStart) type = 'start';
    else if (node.isEnd) type = 'end';

    cytoscapeElements.push({
      data: {
        id: node.id,
        label: `${node.id}\n(in:${node.inDegree} out:${node.outDegree})`,
        depth: node.depth,
        type,
        inDegree: node.inDegree,
        outDegree: node.outDegree
      }
    });
  });

  edgeList.forEach((edge) => {
    cytoscapeElements.push({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.kmer,
        depth: edge.depth,
        index: edge.index,
        isError: false
      }
    });
  });

  cytoscapeElements.push(...errorElements);

  // Eulerian trail of contig reconstruction (ordered steps)
  const eulerianTrail = [];
  let assembledContig = '';
  if (kmers.length > 0) {
    assembledContig = kmers[0].kmer;
    eulerianTrail.push({
      step: 0,
      kmer: kmers[0].kmer,
      node: kmers[0].prefix,
      addedChar: kmers[0].kmer,
      assembledSoFar: assembledContig
    });

    for (let i = 1; i < kmers.length; i++) {
      const charToAdd = kmers[i].kmer.slice(-1);
      assembledContig += charToAdd;
      eulerianTrail.push({
        step: i,
        kmer: kmers[i].kmer,
        node: kmers[i].prefix,
        addedChar: charToAdd,
        assembledSoFar: assembledContig
      });
    }
  }

  return {
    kmers,
    nodes: Array.from(nodeMap.values()),
    edges: edgeList,
    cytoscapeElements,
    eulerianTrail,
    assembledContig
  };
}

/**
 * Simulate a Jellyfish / KMC k-mer frequency depth spectrum
 * Explains how bioinformaticians distinguish 1x sequencing errors from 30x genome depth
 */
export function generateKmerSpectrum(depth = 30, errorRate = 2.5) {
  const points = [];
  for (let c = 1; c <= 70; c++) {
    // 1. Error component: exponential drop at low coverage (1x to 3x)
    const errorComponent = Math.max(0, 100 * Math.exp(-c * (1.1 - errorRate * 0.1)));

    // 2. Main homozygous genomic peak around target depth (e.g. 30x)
    const peakWidth = 6.5;
    const genomicComponent = 75 * Math.exp(-Math.pow(c - depth, 2) / (2 * Math.pow(peakWidth, 2)));

    // 3. Repeat peak at 2x depth (60x) for 2-copy genomic repeats
    const repeatComponent = 25 * Math.exp(-Math.pow(c - depth * 2, 2) / (2 * Math.pow(peakWidth, 2)));

    const count = Math.round(errorComponent + genomicComponent + repeatComponent);
    points.push({ depth: c, count });
  }
  return points;
}
