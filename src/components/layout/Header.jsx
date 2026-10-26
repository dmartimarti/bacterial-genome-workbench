import React, { useState } from 'react';
import { Dna, Award, Download, FileText, RotateCcw, User, Sun, Moon, CheckCircle2, GraduationCap } from 'lucide-react';
import { useLabState } from '../../context/LabStateContext';
import { generateMarkdownReport, downloadFile } from '../../utils/exportReport';

export default function Header() {
  const { completedCount, totalQuestionsCorrect, resetAllProgress, studentName, setStudentName, studentId, setStudentId, theme, toggleTheme, ...labState } = useLabState();
  const [showExportModal, setShowExportModal] = useState(false);

  const totalQuestions = 10;
  const questionsPassed = totalQuestionsCorrect || 0;
  const scorePercentage = Math.round((questionsPassed / totalQuestions) * 100);
  const masteryTier =
    scorePercentage === 100
      ? 'Distinction (Mastery)'
      : scorePercentage >= 80
      ? 'Merit'
      : scorePercentage >= 60
      ? 'Pass'
      : 'In Progress';


  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport({
      studentName,
      studentId,
      scorePercentage,
      masteryTier,
      ...labState
    });
    const filename = `bacterial_assembly_report_${(studentName || 'student').toLowerCase().replace(/\s+/g, '_')}.md`;
    downloadFile(filename, md, 'text/markdown');
  };

  const handleDownloadJSON = () => {
    const data = {
      studentName,
      studentId,
      timestamp: new Date().toISOString(),
      completedCount,
      scorePercentage,
      masteryTier,
      completedModules: labState.completedModules,
      selectedAnswers: labState.selectedAnswers,
      studentNotes: labState.studentNotes,
      functionalAssignments: labState.functionalAssignments
    };
    const filename = `bacterial_assembly_report_${(studentName || 'student').toLowerCase().replace(/\s+/g, '_')}.json`;
    downloadFile(filename, JSON.stringify(data, null, 2), 'application/json');
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Titles */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Dna className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Bacterial Genome Assembly &amp; Annotation Workbench
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                MSc Practical
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive visual laboratory from raw Illumina short reads to annotated GFF3 files
            </p>
          </div>
        </div>

        {/* Action Controls & Progress */}
        <div className="flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Student Checkpoints & Score counter */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs">
            <Award className={`w-4 h-4 ${questionsPassed === 10 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`} />
            <div>
              <span className="text-slate-500 dark:text-slate-400">Score: </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{scorePercentage}% ({questionsPassed}/10)</span>
            </div>
          </div>

          {/* Export Report Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Report</span>
          </button>

          {/* Reset button */}
          <button
            onClick={resetAllProgress}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 transition text-xs"
            title="Reset progress"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Export Student Lab Report
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Score & Rubric Banner */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white">Practical Grade: {scorePercentage}%</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Status: {masteryTier}</div>
                </div>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                {questionsPassed}/10 Passed
              </span>
            </div>


            <p className="text-xs text-slate-600 dark:text-slate-300">
              Download your complete practical results, diagnostic test evaluations, and reflective notes for instructor grading.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" /> Full Name:
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  Matriculation / Student ID:
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 2408912"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  handleDownloadMarkdown();
                  setShowExportModal(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Markdown (.md)
              </button>

              <button
                onClick={() => {
                  handleDownloadJSON();
                  setShowExportModal(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                JSON (.json)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
