import React from 'react';
import { Sparkles, Sliders, Share2, Layers, Search, Database, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLabState } from '../../context/LabStateContext';
import { MODULES_METADATA } from '../../data/modulesData';

const ICON_MAP = {
  Sparkles,
  Sliders,
  Share2,
  Layers,
  Search,
  Database
};


export default function ModuleNav() {
  const { activeTab, setActiveTab, completedModules } = useLabState();

  return (
    <div className="border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/60 backdrop-blur transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
        <div className="flex items-center gap-2 py-2.5 min-w-max">
          {MODULES_METADATA.map((mod, idx) => {
            const Icon = ICON_MAP[mod.iconName] || Sliders;
            const isActive = activeTab === mod.id;
            const isDone = completedModules[mod.id];

            return (
              <React.Fragment key={mod.id}>
                <button
                  onClick={() => setActiveTab(mod.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 border ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500/20 dark:text-white dark:border-emerald-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span>{mod.shortTitle}</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                {idx < MODULES_METADATA.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-800 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
