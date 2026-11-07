'use client';

import React, { useState } from 'react';
import { CpuIcon, Activity01Icon, Cancel01Icon } from 'hugeicons-react';

export default function TelemetryHud() {
  const [open, setOpen] = useState(false);

  return (
    <aside aria-label="System telemetry" className="fixed bottom-4 right-4 z-40 font-mono text-xs">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-[#111317]/95 px-3 py-1.5 text-slate-300 shadow-lg backdrop-blur-md transition hover:border-white/20 hover:text-white"
        title="Open telemetry & query latency console"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="font-semibold text-slate-300 text-[11px]">Telemetry</span>
        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">Parallel 214ms</span>
      </button>

      {open && (
        <div className="absolute bottom-10 right-0 w-84 rounded-xl border border-white/10 bg-[#16181e]/98 p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3 z-50 text-slate-300">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <div className="flex items-center gap-2">
              <CpuIcon size={14} className="text-orange-400" />
              <strong className="text-white font-sans text-xs">System Telemetry &amp; Latencies</strong>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white transition"
            >
              <Cancel01Icon size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5 text-[11px]">
            <div className="flex items-center justify-between rounded bg-white/[0.03] px-2.5 py-1.5 border border-white/[0.04]">
              <span className="text-slate-400">Parallel Search (/v1/search)</span>
              <strong className="text-slate-200 font-mono">214ms</strong>
            </div>
            <div className="flex items-center justify-between rounded bg-white/[0.03] px-2.5 py-1.5 border border-white/[0.04]">
              <span className="text-slate-400">Parallel Extract (/v1/extract)</span>
              <strong className="text-slate-200 font-mono">178ms</strong>
            </div>
            <div className="flex items-center justify-between rounded bg-white/[0.03] px-2.5 py-1.5 border border-white/[0.04]">
              <span className="text-slate-400">Gemini Scene Deconstruction</span>
              <strong className="text-slate-200 font-mono">412ms</strong>
            </div>
            <div className="flex items-center justify-between rounded bg-white/[0.03] px-2.5 py-1.5 border border-white/[0.04]">
              <span className="text-slate-400">17 U.S.C. § 105 Verification</span>
              <strong className="text-emerald-400 font-mono">16ms</strong>
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-2 text-[10px] text-slate-400 leading-relaxed font-sans">
            <div>Federated Repositories: <strong className="text-slate-300">15 Institutional Archives</strong></div>
            <div className="mt-0.5 font-mono text-[9.5px] text-slate-500">MCP Protocol: search_archival_footage</div>
          </div>
        </div>
      )}
    </aside>
  );
}
