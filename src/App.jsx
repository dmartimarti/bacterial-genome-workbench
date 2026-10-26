import React from 'react';
import { Terminal, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import { LabStateProvider, useLabState } from './context/LabStateContext';
import Header from './components/layout/Header';
import ModuleNav from './components/layout/ModuleNav';
import Module0Cover from './components/modules/module0_cover/Module0Cover';
import Module1QC from './components/modules/module1_qc/Module1QC';
import Module2DBG from './components/modules/module2_dbg/Module2DBG';
import Module3Scaffolding from './components/modules/module3_scaffolding/Module3Scaffolding';
import Module4Structural from './components/modules/module4_structural/Module4Structural';
import Module5Functional from './components/modules/module5_functional/Module5Functional';
import CliTerminalDrawer from './components/common/CliTerminalDrawer';
import { MODULES_METADATA } from './data/modulesData';

function WorkbenchContent() {
  const { activeTab, setActiveTab } = useLabState();
  const currentModule = MODULES_METADATA.find((m) => m.id === activeTab) || MODULES_METADATA[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-16 transition-colors">
      {/* Top Academic Header */}
      <Header />

      {/* 5-Step Pipeline Navigation */}
      <ModuleNav />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Module Context Banner (for modules 1 to 5) */}
        {activeTab > 0 && (
          <div className="bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                <span className="font-semibold uppercase tracking-wider">MODULE {currentModule.id} OF 5</span>
                <span>•</span>
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-300 dark:border-slate-800 text-cyan-700 dark:text-cyan-300">
                  <Terminal className="w-3.5 h-3.5" /> Pipeline Focus: {currentModule.tool}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {currentModule.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-start sm:items-center gap-2 leading-relaxed">
                <BookOpen className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                <span>
                  <strong className="text-slate-900 dark:text-white">Core Practical Goal:</strong> {currentModule.goal}
                </span>
              </p>
            </div>

            {/* Prev / Next Step Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setActiveTab(activeTab - 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 border transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{activeTab === 1 ? 'Overview' : 'Prev Step'}</span>
              </button>

              {activeTab < 5 && (
                <button
                  onClick={() => setActiveTab(activeTab + 1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition flex items-center gap-1.5"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Modular Component */}
        {activeTab === 0 && <Module0Cover />}
        {activeTab === 1 && <Module1QC />}
        {activeTab === 2 && <Module2DBG />}
        {activeTab === 3 && <Module3Scaffolding />}
        {activeTab === 4 && <Module4Structural />}
        {activeTab === 5 && <Module5Functional />}
      </main>


      {/* Global Interactive Bioinformatician CLI Terminal Drawer */}
      <CliTerminalDrawer />

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-6 text-center text-xs text-slate-400 space-y-1">
        <p>Bacterial Genome Assembly &amp; Annotation Workbench • MSc Bioinformatics Practical Curriculum</p>
        <p className="font-mono text-[11px] text-slate-400">
          Tools simulated: fastp, FastQC, SPAdes, Shovill, Bandage, QUAST, CheckM2, Prodigal, Bakta, CARD, VFDB
        </p>
      </footer>
    </div>
  );
}


export default function App() {
  return (
    <LabStateProvider>
      <WorkbenchContent />
    </LabStateProvider>
  );
}
