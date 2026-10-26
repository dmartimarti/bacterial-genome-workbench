import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'bioassemble_lab_state_v1';

const LabStateContext = createContext(null);

export function LabStateProvider({ children }) {
  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('bioassemble_theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('bioassemble_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load initial state from localStorage if available
  const [activeTab, setActiveTab] = useState(1);
  const [completedModules, setCompletedModules] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [studentNotes, setStudentNotes] = useState({});
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');

  // Module 5 functional assignments persisted in state (all initially null until student triages)
  const [functionalAssignments, setFunctionalAssignments] = useState({
    cds1: null,
    cds2: null,
    cds3: null
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
        if (parsed.completedModules) setCompletedModules(parsed.completedModules);
        if (parsed.selectedAnswers) setSelectedAnswers(parsed.selectedAnswers);
        if (parsed.studentNotes) setStudentNotes(parsed.studentNotes);
        if (parsed.studentName) setStudentName(parsed.studentName);
        if (parsed.functionalAssignments) {
          if (parsed.functionalAssignments.cds1 === 'Chromosomal replication initiator DnaA' && parsed.functionalAssignments.cds2 === null && parsed.functionalAssignments.cds3 === 'Hypothetical protein') {
            setFunctionalAssignments({ cds1: null, cds2: null, cds3: null });
          } else {
            setFunctionalAssignments(parsed.functionalAssignments);
          }
        }
      }
    } catch (e) {

      console.warn('Failed to parse saved lab state from localStorage', e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    const stateToSave = {
      activeTab,
      completedModules,
      selectedAnswers,
      studentNotes,
      studentName,
      studentId,
      functionalAssignments
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save lab state to localStorage', e);
    }
  }, [activeTab, completedModules, selectedAnswers, studentNotes, studentName, studentId, functionalAssignments]);

  // Handle answering a diagnostic question
  const recordAnswer = (questionKey, option, moduleId) => {
    setSelectedAnswers((prev) => {
      const updatedAnswers = {
        ...prev,
        [questionKey]: option
      };

      // Check if both Q1 and Q2 for this module are correct
      const q1Key = `${moduleId}_q1`;
      const q2Key = `${moduleId}_q2`;
      const isQ1Correct = updatedAnswers[q1Key]?.correct || (questionKey === moduleId && option.correct);
      const isQ2Correct = updatedAnswers[q2Key]?.correct;

      if (isQ1Correct && isQ2Correct) {
        setCompletedModules((modPrev) => ({
          ...modPrev,
          [moduleId]: true
        }));
      }

      // Check if all 10 questions completed
      const totalCorrect = Object.values(updatedAnswers).filter((a) => a?.correct).length;
      if (totalCorrect === 10) {
        try {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }

      return updatedAnswers;
    });
  };

  const updateStudentNote = (moduleId, text) => {
    setStudentNotes((prev) => ({
      ...prev,
      [moduleId]: text
    }));
  };

  const resetAllProgress = () => {
    if (window.confirm('Are you sure you want to reset all checkpoint answers and student notes?')) {
      setActiveTab(0);
      setCompletedModules({});
      setSelectedAnswers({});
      setStudentNotes({});
      setFunctionalAssignments({
        cds1: null,
        cds2: null,
        cds3: null
      });
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const completedCount = Object.keys(completedModules).filter((k) => completedModules[k]).length;
  const totalQuestionsCorrect = Object.values(selectedAnswers).filter((a) => a?.correct).length;

  return (
    <LabStateContext.Provider
      value={{
        activeTab,
        setActiveTab,
        completedModules,
        selectedAnswers,
        recordAnswer,
        studentNotes,
        updateStudentNote,
        studentName,
        setStudentName,
        studentId,
        setStudentId,
        functionalAssignments,
        setFunctionalAssignments,
        completedCount,
        totalQuestionsCorrect,
        resetAllProgress,
        theme,
        toggleTheme
      }}
    >
      {children}
    </LabStateContext.Provider>
  );

}

export function useLabState() {
  const context = useContext(LabStateContext);
  if (!context) {
    throw new Error('useLabState must be used within a LabStateProvider');
  }
  return context;
}
