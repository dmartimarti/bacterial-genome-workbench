import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

export default function ToolCard({ toolName, cliCommand, description, flags = [] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-semibold">
            CLI Pipeline Equivalent: {toolName}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 transition"
          title="Copy command to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="bg-slate-900 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto select-all">
        <code>$ {cliCommand}</code>
      </div>

      {description && <p className="text-xs text-slate-600 dark:text-slate-400">{description}</p>}

      {flags && flags.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/60">
          {flags.map((flag, idx) => (
            <div key={idx} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
              <span className="font-mono text-cyan-600 dark:text-cyan-400 shrink-0 font-medium">{flag.name}</span>
              <span>— {flag.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
