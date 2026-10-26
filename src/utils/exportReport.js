/**
 * Export student lab report as formatted Markdown or JSON
 */

import { MODULES_METADATA } from '../data/modulesData';
import { DIAGNOSTIC_QUESTIONS } from '../data/questionsData';

/**
 * Generate formatted Markdown practical report
 */
export function generateMarkdownReport(state) {
  const { studentName, studentId, completedModules, selectedAnswers, studentNotes, scorePercentage, masteryTier } = state;
  const completedCount = Object.keys(completedModules).filter((k) => completedModules[k]).length;
  const dateStr = new Date().toLocaleString();

  let md = `# Bacterial Genome Assembly & Annotation Workbench\n`;
  md += `## Student Practical Report & Diagnostic Evaluation\n\n`;
  md += `**Student Name:** ${studentName || 'MSc Student'}  \n`;
  md += `**Student ID / Matriculation:** ${studentId || 'BIOINFO-2027'}  \n`;
  md += `**Date of Submission:** ${dateStr}  \n`;
  md += `**Practical Score:** ${scorePercentage !== undefined ? scorePercentage : Math.round((completedCount / 5) * 100)}% (${completedCount} / 5 Checkpoints Passed)  \n`;
  md += `**Mastery Tier:** ${masteryTier || (completedCount === 5 ? 'Distinction (Mastery)' : 'In Progress')}  \n\n`;

  md += `---\n\n`;
  md += `## Executive Summary of Practical Learning Objectives\n\n`;
  md += `1. **Short-Read QC & Coverage:** Demonstrated that stochastic Poisson 0x coverage dropout occurs when depth falls below 15x, and that untrimmed 3' low-quality tails (Q<20) inject false k-mers that poison assembly graphs.\n`;
  md += `2. **De Bruijn Graph Topology:** Visualized how repeats of length $L$ collapse when $k \\le L$, resolve into unambiguous Eulerian paths when $k > L$, and shatter when $k$ exceeds contiguous read coverage. Simulated tip clipping and bubble popping via coverage depth cutoff.\n`;
  md += `3. **Repeats, Scaffolding & QUAST QC:** Evaluated why 150 bp short reads cannot bridge 5 kb rRNA operons, proved how 500 bp paired-end inserts scaffold 350 bp IS elements, and discovered the 'N50 Trap' where Assembly C created 14 chimeric misassemblies.\n`;
  md += `4. **Structural Annotation (Prodigal):** Proved the dual-filter synergy of bacterial gene calling, where length cutoff (>180 bp) and RBS/hexamer coding scoring are mutually indispensable to eliminate both 96-114 bp random ORFs and 420 bp shadow ORFs.\n`;
  md += `5. **Functional Annotation Triage:** Dissected the 'Domain Trap' by demonstrating that 96% identity over 16% query coverage represents a shared ATP-binding cassette rather than true orthology, requiring strict query coverage gating (≥80%) for accurate Swiss-Prot assignment.\n\n`;

  md += `---\n\n`;
  md += `## Detailed Module Diagnostics & Responses\n\n`;

  MODULES_METADATA.forEach((mod) => {
    const questions = DIAGNOSTIC_QUESTIONS[mod.id] || [];
    const isDone = completedModules[mod.id];
    const notes = studentNotes?.[mod.id] || 'No custom notes provided.';

    md += `### Module ${mod.id}: ${mod.title}\n`;
    md += `- **CLI Equivalent:** \`${mod.cliEquivalent}\`\n`;
    md += `- **Module Status:** ${isDone ? '✅ PASSED (All questions solved)' : '⚠️ INCOMPLETE'}\n\n`;

    questions.forEach((q) => {
      const qKey = `${mod.id}_q${q.questionNum}`;
      const userChoice = selectedAnswers[qKey] || selectedAnswers[mod.id];

      md += `#### Question ${q.questionNum}: ${q.title}\n`;
      md += `*${q.question}*\n\n`;

      if (userChoice) {
        md += `- **Selected Answer:** [${userChoice.id.toUpperCase()}] ${userChoice.text}\n`;
        md += `- **Evaluation:** ${userChoice.correct ? '✅ CORRECT' : '❌ INCORRECT'}\n`;
        md += `- **Mechanistic Feedback:** ${userChoice.feedback}\n\n`;
      } else {
        md += `- **Selected Answer:** *Not attempted yet*\n\n`;
      }
    });

    md += `**Student Reflective Notes:**\n> ${notes.replace(/\n/g, '\n> ')}\n\n`;
  });


  md += `---\n`;
  md += `*Generated automatically by BioAssemble Workbench (MSc Bioinformatics Curriculum).*  \n`;

  return md;
}

/**
 * Trigger browser file download
 * @param {string} filename
 * @param {string} content
 * @param {string} mimeType
 */
export function downloadFile(filename, content, mimeType = 'text/markdown') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
