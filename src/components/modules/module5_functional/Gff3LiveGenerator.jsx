import React, { useState } from 'react';
import { FileCode, Copy, Check, Download } from 'lucide-react';
import { FUNCTIONAL_GENES } from '../../../data/functionalHits';
import { downloadFile } from '../../../utils/exportReport';

export default function Gff3LiveGenerator({ userAssignments }) {
  const [copied, setCopied] = useState(false);

  // Generate authentic GFF3 lines
  const gffLines = [
    '##gff-version 3',
    '##sequence-region Contig_1 1 4200'
  ];

  Object.values(FUNCTIONAL_GENES).forEach((gene) => {
    const assignedProduct = userAssignments[gene.id] || 'hypothetical protein';
    const isHypo = assignedProduct.toLowerCase().includes('hypothetical');
    const geneSymbol = isHypo ? '' : gene.geneSymbol !== '-' ? `;gene=${gene.geneSymbol}` : '';
    const score = isHypo ? '.' : '0.0';

    const attrs = `ID=${gene.id};locus_tag=${gene.locusTag}${geneSymbol};product=${encodeURIComponent(assignedProduct)}`;
    gffLines.push(
      `Contig_1\tBakta_v1.9.4\tCDS\t${gene.contigStart}\t${gene.contigEnd}\t${score}\t${gene.strand}\t0\t${attrs}`
    );
  });

  const fullGFF3 = gffLines.join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullGFF3);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadFile('bacterial_annotation.gff3', fullGFF3, 'text/plain');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 transition-colors shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Live 9-Column GFF3 Specification Output
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy GFF3'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .gff3</span>
          </button>
        </div>
      </div>

      <pre className="p-3.5 bg-slate-900 dark:bg-slate-950 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800 select-all shadow-inner">
        {fullGFF3}
      </pre>

      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        <strong>Format Note:</strong> Standard GFF3 columns: <code className="text-slate-700 dark:text-slate-300 font-mono">seqid, source, type, start, end, score, strand, phase, attributes</code>.
      </div>
    </div>
  );
}
