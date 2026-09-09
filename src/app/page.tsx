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
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Download01Icon,
  Activity01Icon,
  VolumeHighIcon
} from 'hugeicons-react';

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const faqs = [
    {
      q: 'How does CineVault verify 17 U.S.C. § 105 public domain status?',
      a: 'Works created by officers or employees of the United States Government (e.g., NASA, NARA, LOC, DOD) as part of their official duties enter the public domain immediately upon creation under 17 U.S.C. § 105. CineVault’s clearance engine verifies institutional provenance, publication dates (pre-1929 statutory public domain), and generates a tamper-evident E&O Chain-of-Title certificate with a SHA-256 digital seal.'
    },
    {
      q: 'How does CineVault integrate directly with Adobe Premiere Pro?',
      a: 'CineVault includes a native Adobe UXP panel (Adobe Premiere Pro 2022+) that lets editors search historical vaults, audition clips in real-time, and inject media directly into active project bins. You can also export native Premiere XML (.xml), DaVinci Resolve FCPXML (.fcpxml), and CMX 3600 EDL files.'
    },
    {
      q: 'What role does the Parallel API and Google Cloud play in the workflow?',
      a: 'Google Cloud Gemini Enterprise and Vertex AI decompose director prompts or screenplays into targeted semantic queries. CineVault then executes sub-second web searches across 15 institutional repositories via the Parallel Search API (/v1/search in ~700ms), deep-scrapes pricing and rights via Parallel Extract (/v1/extract), and registers background price watchdog alerts via Parallel Monitor (/v1/monitor).'
    },
    {
      q: 'Can I color grade archival footage with 3D LUTs for DaVinci Resolve?',
      a: 'Yes! The built-in Cinema Viewfinder offers real-time film emulsion shaders (Kodachrome 64, Technicolor Three-Strip, 16mm Tri-X, Sepia Nitrate, Fuji Eterna) and allows 1-click export of industry-standard .cube 3D LUT files directly into DaVinci Resolve Studio and Premiere Lumetri Color.'
    }
  ];

  return (
    <main className="flex flex-col items-center justify-center px-4 py-12 md:py-20 max-w-7xl mx-auto space-y-24">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & INTERACTIVE SEARCH */}
      {/* ========================================================================= */}
      <section className="flex flex-col items-center text-center w-full max-w-4xl">
        
        {/* Live Hackathon & Tech Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-mono text-purple-300 mb-8 backdrop-blur-sm shadow-lg shadow-purple-500/10">
          <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          <span>Google Cloud Gemini Enterprise &bull; Parallel API &amp; MCP &bull; 15 Vaults</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Agentic Archival Footage Sourcing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EE5F29] via-amber-400 to-rose-400">Pro Filmmakers</span>
        </h1>
        
        <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Autonomous multi-step search agent that parses treatments, verifies 17 U.S.C. § 105 statutory public domain clearance, and injects graded masters straight into Premiere Pro and DaVinci Resolve.
        </p>

        {/* Hero Metrics Strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 mb-8 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-white font-bold text-sm">~700ms</span> Parallel Search p50
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#EE5F29]" />
            <span className="text-white font-bold text-sm">$0.00</span> Public Domain Royalty
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            <span className="text-white font-bold text-sm">15</span> Institutional Vaults
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            <span className="text-white font-bold text-sm">4</span> Pro NLE Export Formats
          </div>
        </div>

        {/* Hero Search Box */}
        <div className="w-full max-w-2xl bg-[#11141c] border border-white/15 rounded-2xl p-3 shadow-2xl shadow-black/80">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="flex items-center gap-3 flex-1 bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus-within:border-[#EE5F29]/50 transition">
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

          {/* Benchmark Query Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-white/5 text-xs text-slate-400">
            <span className="font-mono text-[11px] text-slate-500">Benchmark Cues:</span>
            {[
              'Apollo 11 Moon Landing',
              '1960s Factory Floor',
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

      </section>

      {/* ========================================================================= */}
      {/* 2. CORE SHOWSTOPPER FEATURE TILES */}
      {/* ========================================================================= */}
      <section className="w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#EE5F29]">Hollywood-Grade Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Engineered for Post-Production Teams</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          
          <Link href="/dashboard" className="group rounded-2xl border border-white/10 bg-[#11141c] p-6 transition hover:border-[#EE5F29]/50 hover:bg-white/[0.02]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EE5F29]/15 text-[#EE5F29] mb-4 group-hover:scale-110 transition">
              <Film01Icon size={22} />
            </div>
            <h3 className="font-bold text-white text-base mb-1.5">Script-to-Timeline AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Deconstruct screenplay scenes, calculate timecode cuts, and source archival sequence bins automatically.</p>
          </Link>

          <Link href="/dashboard" className="group rounded-2xl border border-white/10 bg-[#11141c] p-6 transition hover:border-sky-500/50 hover:bg-white/[0.02]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 mb-4 group-hover:scale-110 transition">
              <Layers01Icon size={22} />
            </div>
            <h3 className="font-bold text-white text-base mb-1.5">Visual Moodboard Matcher</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Upload concept art or moodboard stills &rarr; Gemini Vision matches historical cinematography and composition.</p>
          </Link>

          <Link href="/dashboard" className="group rounded-2xl border border-white/10 bg-[#11141c] p-6 transition hover:border-purple-500/50 hover:bg-white/[0.02]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 mb-4 group-hover:scale-110 transition">
              <SparklesIcon size={22} />
            </div>
            <h3 className="font-bold text-white text-base mb-1.5">Cinema Viewfinder &amp; LUTs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Live Kodachrome, 16mm Tri-X &amp; Technicolor emulation with 1-click .cube 3D LUT export for DaVinci Resolve.</p>
          </Link>

          <Link href="/dashboard" className="group rounded-2xl border border-white/10 bg-[#11141c] p-6 transition hover:border-emerald-500/50 hover:bg-white/[0.02]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 mb-4 group-hover:scale-110 transition">
              <SecurityIcon size={22} />
            </div>
            <h3 className="font-bold text-white text-base mb-1.5">E&amp;O Legal Clearance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Printable Chain-of-Title certification with SHA-256 seal and statutory 17 U.S.C. § 105 warranty.</p>
          </Link>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS: 3-STEP AUTONOMOUS AGENT PIPELINE */}
      {/* ========================================================================= */}
      <section className="w-full rounded-3xl border border-white/10 bg-gradient-to-b from-[#11141c] to-[#0a0c12] p-8 sm:p-12 shadow-2xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">Autonomous Workflow</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">From Screenplay to Master Timeline in Seconds</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-3 leading-relaxed">
            CineVault replaces weeks of manual archival clearances with a deterministic, multi-agent post-production pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Step 1 */}
          <div className="relative flex flex-col items-start bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EE5F29]/20 text-[#EE5F29] font-mono font-bold text-sm">
                01
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">Input</span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Director Cue &amp; Script Ingestion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drop in a treatment, voiceover MP3, or shot cue. Google Cloud Gemini Enterprise decomposes narrative beats into timecoded search vectors and lighting criteria.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-start bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 font-mono font-bold text-sm">
                02
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">Search &amp; Audit</span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Parallel Search &amp; Rights Audit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Parallel Search API scans 15 institutional vaults in ~700ms. Parallel Extract retrieves raw pricing while our legal engine audits 17 U.S.C. § 105 clearance.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-start bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-bold text-sm">
                03
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">Export</span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Premiere Pro &amp; DaVinci Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inject cleared clips directly into active Premiere Pro project bins or export native sequence XMLs, CMX 3600 EDLs, and printable E&amp;O clearance certificates.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. COST SAVINGS & STATUTORY BENEFIT MATRIX */}
      {/* ========================================================================= */}
      <section className="w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Budget Optimization</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">CineVault Studio vs Traditional Footage Clearing</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Why leading documentary and commercial studios avoid high commercial stock licensing markups.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/15 bg-[#11141c] shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 font-mono text-[11px] text-slate-400">
                <th className="p-4">Comparison Metric</th>
                <th className="p-4 text-[#EE5F29] font-bold">CineVault Studio</th>
                <th className="p-4 text-slate-400">Traditional Commercial Stock (Getty / Shutterstock / Pond5)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr>
                <td className="p-4 font-medium text-white">License Cost per 10-Second Clip</td>
                <td className="p-4 text-emerald-400 font-bold font-mono">$0.00 (Statutory Public Domain)</td>
                <td className="p-4 font-mono text-rose-400">$250 – $1,200+ per clip</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Clearance &amp; Licensing Latency</td>
                <td className="p-4 text-emerald-400 font-bold font-mono">~700ms (Real-time agentic search)</td>
                <td className="p-4 text-slate-400 font-mono">3 – 14 business days via clearance broker</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Legal Copyright Warranty</td>
                <td className="p-4 text-emerald-400 font-bold">17 U.S.C. § 105 + $250k Statutory Warranty</td>
                <td className="p-4 text-slate-400">Standard disclaimer or capped indemnification</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Chain-of-Title Documentation</td>
                <td className="p-4 text-emerald-400 font-bold">SHA-256 Digitally Signed E&amp;O Certificate</td>
                <td className="p-4 text-slate-400">Generic PDF invoice without legal provenance</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Master Quality &amp; Grading</td>
                <td className="p-4 text-emerald-400 font-bold">ProRes 422 HQ / 4K + 3D LUT Color Profiles</td>
                <td className="p-4 text-slate-400">Compressed H.264 watermarked preview comps</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Direct NLE Integration</td>
                <td className="p-4 text-emerald-400 font-bold">Native Adobe Premiere UXP Panel + XML/EDL</td>
                <td className="p-4 text-slate-400">Manual web browser downloads and re-linking</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CINEMATIC LUT & FILM EMULSION SHADER SHOWCASE */}
      {/* ========================================================================= */}
      <section className="w-full rounded-3xl border border-white/10 bg-[#11141c] p-8 sm:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">Colorist Suite</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Film Emulsion &amp; 3D LUT Shaders</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl">
              Audition archival masters with real-time CSS film stock shaders and export 3D LUTs (.cube) calibrated for DaVinci Resolve and Premiere Lumetri Color.
            </p>
          </div>
          <Link 
            href="/dashboard" 
            className="self-start md:self-auto inline-flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/40 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition"
          >
            <SparklesIcon size={16} />
            <span>Launch Viewfinder</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Kodachrome 64', era: '1974', desc: 'Vibrant reds, warm saturation, high contrast', badge: 'Color Reversal' },
            { name: 'Technicolor Three-Strip', era: '1935', desc: 'Deep dye-transfer cyan/magenta/yellow split', badge: 'Golden Age' },
            { name: 'Kodak 16mm Tri-X', era: '1954', desc: 'Punchy B&W, heavy grain, deep black floor', badge: 'Newsreel B&W' },
            { name: 'Nitrate Sepia Tone', era: '1920s', desc: 'Warm aged monochrome, vignetted edge roll', badge: 'Silent Film' },
            { name: 'Fuji Eterna 500T', era: '1990s', desc: 'Soft pastel tonality, gentle highlight latitude', badge: 'Tungsten 35mm' }
          ].map(lut => (
            <div key={lut.name} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between hover:border-amber-500/40 transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-amber-400 font-bold">{lut.era}</span>
                  <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-slate-300">{lut.badge}</span>
                </div>
                <div className="font-bold text-white text-xs mb-1">{lut.name}</div>
                <div className="text-[11px] text-slate-400 leading-snug">{lut.desc}</div>
              </div>
              <div className="mt-4 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                1-Click .cube Export
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. INSTITUTIONAL REPOSITORY VAULT NETWORK (15 ARCHIVES) */}
      {/* ========================================================================= */}
      <section className="w-full rounded-2xl border border-white/10 bg-[#11141c]/60 p-6 sm:p-8 backdrop-blur-md">
        <div className="text-center mb-6">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">Institutional Repository Vault Network</span>
          <h3 className="text-xl font-bold text-white mt-1">Grounding Across 15 Official Historical Archives</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
            Zero synthetic hallucinations. Every candidate is verified against authentic archival holdings and streaming master copies.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-center text-xs font-mono">
          {[
            { name: 'National Archives (NARA)', territory: 'USA • Federal' },
            { name: 'Library of Congress (LOC)', territory: 'USA • National' },
            { name: 'NASA Image & Video Vault', territory: 'USA • 70mm Space' },
            { name: 'Prelinger Archives', territory: 'USA • Educational' },
            { name: 'British Film Institute (BFI)', territory: 'UK • Heritage' },
            { name: 'INA Audiovisual Institute', territory: 'France • Newsreel' },
            { name: 'UCLA Film & TV Archive', territory: 'USA • Hollywood' },
            { name: 'European Film Gateway (EFG)', territory: 'EU • Multi-Archive' },
            { name: 'Smithsonian National Archive', territory: 'USA • Science' },
            { name: 'Imperial War Museum (IWM)', territory: 'UK • Historical' },
            { name: 'National Film Board (NFB)', territory: 'Canada • Doc' },
            { name: 'NFSA National Screen Archive', territory: 'Australia • Cinema' },
            { name: 'Filmarkivet', territory: 'Sweden • 35mm Masters' },
            { name: 'National Library of Medicine', territory: 'USA • Medical' },
            { name: 'Danish Film Institute (DFI)', territory: 'Denmark • Silent Era' }
          ].map(vault => (
            <div key={vault.name} className="rounded-xl border border-white/5 bg-white/5 p-3 text-slate-300 flex flex-col items-center justify-center hover:bg-white/10 transition">
              <span className="font-bold text-white text-[11px]">{vault.name}</span>
              <span className="text-[9px] text-slate-400 mt-0.5">{vault.territory}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. NLE COMPATIBILITY & ECOSYSTEM */}
      {/* ========================================================================= */}
      <section className="w-full text-center max-w-3xl mx-auto">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">Ecosystem Integration</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Fits Directly Into Your Existing Post Pipeline</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 mb-8">
          Export industry-standard cutlists and sequences without re-encoding or manual conform.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#11141c] p-4 text-center">
            <div className="font-mono font-bold text-purple-400 text-lg mb-1">Pr</div>
            <div className="font-bold text-white text-xs">Premiere Pro</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Native UXP + XML</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11141c] p-4 text-center">
            <div className="font-mono font-bold text-rose-400 text-lg mb-1">DaVinci</div>
            <div className="font-bold text-white text-xs">Resolve Studio</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">FCPXML + .cube LUTs</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11141c] p-4 text-center">
            <div className="font-mono font-bold text-sky-400 text-lg mb-1">FCP</div>
            <div className="font-bold text-white text-xs">Final Cut Pro</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Apple FCPXML v1.10</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11141c] p-4 text-center">
            <div className="font-mono font-bold text-amber-400 text-lg mb-1">EDL</div>
            <div className="font-bold text-white text-xs">Avid / CMX 3600</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Standard SMPTE EDL</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS ACCORDION */}
      {/* ========================================================================= */}
      <section className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Got Questions?</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={faq.q}
              className="rounded-xl border border-white/10 bg-[#11141c] overflow-hidden transition"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left text-sm font-bold text-white hover:bg-white/5 transition"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 text-base font-mono">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CINEMATIC CALL-TO-ACTION BANNER */}
      {/* ========================================================================= */}
      <section className="w-full rounded-3xl border border-[#EE5F29]/30 bg-gradient-to-r from-[#EE5F29]/15 via-purple-500/10 to-transparent p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Ready to Cut Your Next Masterpiece?
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mt-3">
          Source historical B-roll with sub-second Parallel search, verify 17 U.S.C. § 105 public domain provenance, and export straight to Premiere Pro.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-[#EE5F29] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#EE5F29]/30 hover:brightness-110 transition"
          >
            <PlayIcon size={16} />
            <span>Launch Studio Workspace</span>
          </Link>
          <a 
            href="https://cinevault-studio-1087269593372.us-central1.run.app/premiere"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-slate-200 hover:bg-white/10 hover:text-white transition"
          >
            <span className="font-mono text-purple-400 font-bold text-xs">Pr</span>
            <span>Open Adobe Premiere Panel</span>
          </a>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. STUDIO FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-white/10 pt-8 pb-4 text-center text-xs font-mono text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-4 text-slate-400">
          <Link href="/dashboard" className="hover:text-white transition">Studio Workspace</Link>
          <a href="https://cinevault-studio-1087269593372.us-central1.run.app/premiere" target="_blank" rel="noreferrer" className="hover:text-white transition">Premiere Pro Panel</a>
          <a href="https://github.com/pwnjoshi/CineVault" target="_blank" rel="noreferrer" className="hover:text-white transition">GitHub Repository</a>
          <a href="https://cinevault-studio-1087269593372.us-central1.run.app/api/health" target="_blank" rel="noreferrer" className="hover:text-white transition">System Health</a>
        </div>
        <p>CineVault Studio &bull; Built for Google Cloud Agentic Cinema Hackathon &bull; MIT License</p>
      </footer>

    </main>
  );
}