import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, AlertTriangle, Edit3, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLabState } from '../../context/LabStateContext';
import { DIAGNOSTIC_QUESTIONS } from '../../data/questionsData';

export default function DiagnosticQuiz({ moduleId }) {
  const [activeQIdx, setActiveQIdx] = useState(0);
  const { selectedAnswers, recordAnswer, completedModules, studentNotes, updateStudentNote } = useLabState();

  const questions = DIAGNOSTIC_QUESTIONS[moduleId] || [];
  if (!questions.length) return null;

  const currentQuestion = questions[activeQIdx] || questions[0];
  const qKey = `${moduleId}_q${currentQuestion.questionNum}`;
  const userChoice = selectedAnswers[qKey];
  const isModulePassed = completedModules[moduleId];
  const currentNote = studentNotes[moduleId] || '';

  // Calculate questions passed in this module
  const q1Passed = selectedAnswers[`${moduleId}_q1`]?.correct;
  const q2Passed = selectedAnswers[`${moduleId}_q2`]?.correct;
  const passedInModuleCount = (q1Passed ? 1 : 0) + (q2Passed ? 1 : 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 transition-colors shadow-sm">
      {/* Header & Question Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Practical Checkpoint (Module {moduleId})
          </h3>
          <span className="text-xs font-mono text-slate-400">
            ({passedInModuleCount}/{questions.length} Solved)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Question 1 / Question 2 Switcher Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            {questions.map((q, idx) => {
              const qIsCorrect = selectedAnswers[`${moduleId}_q${q.questionNum}`]?.correct;
              const isActive = activeQIdx === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => setActiveQIdx(idx)}
                  className={`px-3 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Q{q.questionNum}</span>
                  {qIsCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {isModulePassed && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1 shrink-0 border border-emerald-300 dark:border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Module Passed
            </span>
          )}
        </div>
      </div>

      {/* Question Title & Prompt */}
      <div className="space-y-1">
        <div className="text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400">
          Question {currentQuestion.questionNum} of {questions.length}: {currentQuestion.title}
        </div>
        <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
          {currentQuestion.question}
        </p>
      </div>

      {/* Multiple-choice Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {currentQuestion.options.map((opt) => {
          const isSelected = userChoice?.id === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => recordAnswer(qKey, opt, moduleId)}
              className={`p-3.5 rounded-xl border text-left text-xs leading-relaxed transition flex flex-col justify-between ${
                !isSelected
                  ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  : opt.correct
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div>
                <span className="font-mono font-bold uppercase mr-1.5 text-cyan-600 dark:text-cyan-400">[{opt.id}]</span>
                {opt.text}
              </div>
            </button>
          );
        })}
      </div>

      {/* Mechanistic Feedback Banner */}
      {userChoice && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
            userChoice.correct
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700/60 text-rose-900 dark:text-rose-200'
          }`}
        >
          {userChoice.correct ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed flex-1">
            <strong className="block mb-0.5">
              {userChoice.correct ? 'Biological / Algorithmic Insight:' : 'Clarification:'}
            </strong>
            {userChoice.feedback}
          </div>

          {/* Quick jump to next question if correct and on Q1 */}
          {userChoice.correct && activeQIdx === 0 && questions.length > 1 && (
            <button
              onClick={() => setActiveQIdx(1)}
              className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold text-[11px] shrink-0 flex items-center gap-1 hover:bg-emerald-500 transition shadow-xs"
            >
              <span>Next Q2</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Reflective Notebook for Lab Report Export */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
        <label className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
          <span>Student Reflective Lab Note (Module {moduleId} Practical Observations):</span>
        </label>
        <textarea
          rows={2}
          value={currentNote}
          onChange={(e) => updateStudentNote(moduleId, e.target.value)}
          placeholder={`Record your observations or interpretations for Module ${moduleId} here...`}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition resize-y font-mono"
        />
      </div>
    </div>
  );
}
