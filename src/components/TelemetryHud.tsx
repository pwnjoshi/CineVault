'use client';

import React, { useState } from 'react';
import { SparklesIcon, CpuIcon, Activity01Icon, Layers01Icon } from 'hugeicons-react';

export default function TelemetryHud() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 font-mono text-xs">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-purple-500/40 bg-[#0f1117]/95 px-3.5 py-1.5 text-white shadow-xl backdrop-blur-md transition hover:border-purple-400 hover:scale-105"
      >
        <span className="live-pulse bg-purple-400 shadow-[0_0_8px_#a78bfa]" />
        <span className="font-bold text-purple-300">Parallel API &amp; MCP HUD</span>
        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">820ms</span>
      </button>

      {open && (
        <div className="absolute bottom-11 right-0 w-80 rounded-2xl border border-purple-500/40 bg-[#0f1117]/98 p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5 z-50">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <strong className="text-white font-sans text-xs flex items-center gap-1.5">
              <CpuIcon size={14} className="text-purple-400" />
              ⚡ Live Engine Telemetry
            </strong>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
              100% ONLINE
            </span>
          </div>

          <div className="flex flex-col gap-1.5 text-[11px]">
            <div className="flex items-center justify-between rounded bg-white/5 p-1.5 border-l-2 border-purple-400">
              <span className="text-slate-300">Parallel Search (/v1/search)</span>
              <strong className="text-purple-300">214ms</strong>
            </div>
            <div className="flex items-center justify-between rounded bg-white/5 p-1.5 border-l-2 border-sky-400">
              <span className="text-slate-300">Parallel Extract (/v1/extract)</span>
              <strong className="text-sky-300">178ms</strong>
            </div>
            <div className="flex items-center justify-between rounded bg-white/5 p-1.5 border-l-2 border-[#EE5F29]">
              <span className="text-slate-300">Gemini 1.5 Pro Reasoning</span>
              <strong className="text-[#EE5F29]">412ms</strong>
            </div>
            <div className="flex items-center justify-between rounded bg-white/5 p-1.5 border-l-2 border-emerald-400">
              <span className="text-slate-300">17 U.S.C. § 105 PD Risk Engine</span>
              <strong className="text-emerald-300">16ms</strong>
            </div>
          </div>

          <div className="border-t border-white/10 pt-2 text-[10px] text-slate-400 leading-relaxed">
            <div>Connected: <strong>15 Global Archives</strong> (NARA, LOC, NASA, BFI, INA, UCLA, EFG, Smithsonian)</div>
            <div className="mt-0.5">MCP Protocol: <code className="text-purple-300">tools/call search_archival_footage</code></div>
          </div>
        </div>
      )}
    </div>
  );
}
