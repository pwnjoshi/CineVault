'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search01Icon, 
  SparklesIcon, 
  Film01Icon, 
  Layers01Icon, 
  SecurityIcon, 
  PlayIcon,
  ArrowRight01Icon
} from 'hugeicons-react';

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      router.push('/dashboard?q=Apollo+11+Saturn+V+launch+NASA+70mm');
    } else {
      router.push('/dashboard?q=' + encodeURIComponent(query.trim()));
    }
  };

  const handleChipClick = (presetQuery: string) => {
    router.push('/dashboard?q=' + encodeURIComponent(presetQuery));
  };

  return (
    <main className="flex flex-col items-center justify-center px-4 py-12 md:py-20 max-w-7xl mx-auto">
      
      {/* Live Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-mono text-purple-300 mb-8 backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
        <span>Gemini Enterprise + Parallel AI Search &bull; 15 Archival Repositories</span>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mb-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Agentic Archival Footage Sourcing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EE5F29] via-amber-400 to-rose-400">Pro Filmmakers</span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Autonomous multi-step search agent that parses treatments, verifies 17 U.S.C. § 105 statutory public domain clearance, and injects graded masters straight into Premiere Pro and DaVinci Resolve.
        </p>
      </div>

      {/* Hero Interactive Search Form */}
      <div className="w-full max-w-2xl bg-[#11141c] border border-white/15 rounded-2xl p-3 shadow-2xl shadow-black/80 mb-8">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="flex items-center gap-3 flex-1 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
            <Search01Icon size={18} className="text-slate-400" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe historical footage (e.g., Apollo 11 Saturn V launch, 1960s factory floor)..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>
          <button 
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-[#EE5F29] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#EE5F29]/30 hover:brightness-110 transition"
          >
            <span>Search</span>
            <ArrowRight01Icon size={16} />
          </button>
        </form>

        {/* Benchmark Cues */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-white/5 text-xs text-slate-400">
          <span className="font-mono text-[11px] text-slate-500">Examples:</span>
          {[
            '1960s Factory Floor',
            'Apollo 11 Moon Landing',
            '80s Neon Tokyo',
            '1930s Dust Bowl'
          ].map(chip => (
            <button 
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300 hover:border-white/20 hover:text-white transition font-mono text-[11px]"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Showstopper Feature Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-16">
        
        <Link href="/dashboard" className="group rounded-2xl border border-white/10 bg-[#11141c] p-5 transition hover:border-[#EE5F29]/50 hover:bg-white/[0.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EE5F29]/15 text-[#EE5F29] mb-3 group-hover:scale-110 transition">
            <Film01Icon size={20} />
          </div>
          <h3 className="font-bold text-white text-sm mb-1">Script-to-Timeline AI</h3>
          <p className="text-xs text-slate-400 leading-normal">Deconstruct screenplay scenes, calculate timecode cuts, and source archival sequence bins.</p>
        </Link>

        <Link href="/dashboard" className="group rounded-2xl border border-white/10 bg-[#11141c] p-5 transition hover:border-sky-500/50 hover:bg-white/[0.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 mb-3 group-hover:scale-110 transition">
            <Layers01Icon size={20} />
          </div>
          <h3 className="font-bold text-white text-sm mb-1">Visual Moodboard Matcher</h3>
          <p className="text-xs text-slate-400 leading-normal">Upload reference frames &rarr; Gemini Vision matches historical cinematography and framing.</p>
        </Link>

        <Link href="/dashboard" className="group rounded-2xl border border-white/10 bg-[#11141c] p-5 transition hover:border-purple-500/50 hover:bg-white/[0.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 mb-3 group-hover:scale-110 transition">
            <SparklesIcon size={20} />
          </div>
          <h3 className="font-bold text-white text-sm mb-1">Cinema Viewfinder &amp; LUTs</h3>
          <p className="text-xs text-slate-400 leading-normal">Live Kodachrome, 16mm Tri-X &amp; Technicolor emulation with 1-click .cube 3D LUT export.</p>
        </Link>

        <Link href="/dashboard" className="group rounded-2xl border border-white/10 bg-[#11141c] p-5 transition hover:border-emerald-500/50 hover:bg-white/[0.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 mb-3 group-hover:scale-110 transition">
            <SecurityIcon size={20} />
          </div>
          <h3 className="font-bold text-white text-sm mb-1">E&amp;O Legal Certificate</h3>
          <p className="text-xs text-slate-400 leading-normal">Printable Chain-of-Title certification with SHA-256 seal and statutory 17 U.S.C. § 105 warranty.</p>
        </Link>

      </div>

      {/* 15 Archival Repositories Grid */}
      <div className="w-full rounded-2xl border border-white/10 bg-[#11141c]/60 p-6 backdrop-blur-md">
        <div className="text-center mb-6">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">Institutional Repository Vault Network</span>
          <h3 className="text-lg font-bold text-white mt-1">Grounding Across 15 Official Historical Archives</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-center text-xs font-mono">
          {[
            'National Archives (NARA)',
            'Library of Congress (LOC)',
            'NASA Image & Video Vault',
            'Prelinger Archives',
            'British Film Institute (BFI)',
            'Institut National Audiovisuel (INA)',
            'UCLA Film & TV Archive',
            'European Film Gateway (EFG)',
            'Smithsonian National Archive',
            'Imperial War Museum (IWM)'
          ].map(vault => (
            <div key={vault} className="rounded-xl border border-white/5 bg-white/5 p-3 text-slate-300 flex items-center justify-center">
              {vault}
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}