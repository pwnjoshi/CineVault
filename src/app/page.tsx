'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search01Icon, 
  Film01Icon, 
  Layers01Icon, 
  SecurityIcon, 
  ArrowRight01Icon,
  SparklesIcon,
  PlayIcon
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
      q: 'How does CineVault audit 17 U.S.C. § 105 public domain standing?',
      a: 'Under 17 U.S.C. § 105, copyright protection is not available for works created by officers or employees of the United States Government as part of their official duties. CineVault audits institutional provenance records from primary agencies (NARA, NASA, Library of Congress), cross-references pre-1929 statutory publication dates, and compiles a tamper-evident chain-of-title record with a cryptographic SHA-256 audit seal.'
    },
    {
      q: 'How does CineVault integrate with editing workflows?',
      a: 'CineVault provides native interchange with major Non-Linear Editors. You can work directly inside Adobe Premiere Pro via our native UXP panel, or export industry-standard sequence files including Premiere XML (.xml), DaVinci Resolve FCPXML (.fcpxml), CMX 3600 Edit Decision Lists (.edl), and metadata spreadsheets (.csv).'
    },
    {
      q: 'What role do Parallel APIs play in the search engine?',
      a: 'CineVault uses Google Cloud Gemini models to deconstruct treatments and natural-language cues into structured search vectors. The platform then executes sub-second federated queries across 15 institutional repositories via the Parallel Search API, extracts metadata and pricing via Parallel Extract, and monitors collection status via Parallel Monitor.'
    },
    {
      q: 'How are 3D LUTs calibrated for color grading?',
      a: 'The built-in Master Viewfinder features real-time film stock emulation calibrated to historical sensitometric curves (Kodachrome 64, Technicolor Three-Strip, Kodak 16mm Tri-X, Sepia Nitrate, Fuji Eterna 500T). Editors can export industry-standard .cube 3D LUT files directly into DaVinci Resolve Studio or Premiere Lumetri Color.'
    }
  ];

  return (
    <main className="flex flex-col items-center justify-center px-4 py-12 md:py-20 max-w-7xl mx-auto space-y-24">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & SEARCH */}
      {/* ========================================================================= */}
      <section className="flex flex-col items-center text-center w-full max-w-4xl">
        
        {/* Institutional Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-mono text-slate-300 mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Institutional Archive Sourcing &bull; 15 Repositories &bull; NLE Interchange</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15]">
          Archival footage ingest &amp; rights clearance for editorial teams
        </h1>
        
        <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
          Deconstruct treatments, search 15 institutional historical vaults in sub-second queries, verify 17 U.S.C. § 105 statutory public domain provenance, and export graded cutlists directly to Premiere Pro and DaVinci Resolve.
        </p>

        {/* Metrics Strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 mb-8 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            <span className="text-white font-semibold">15</span> Institutional Vaults
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-white font-semibold">~700ms</span> Parallel Search p50
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span className="text-white font-semibold">17 U.S.C. § 105</span> Public Domain
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span className="text-white font-semibold">4</span> NLE Export Formats
          </div>
        </div>

        {/* Hero Search Box */}
        <div className="w-full max-w-2xl bg-[#16181e] border border-white/10 rounded-2xl p-2.5 shadow-xl">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="flex items-center gap-3 flex-1 bg-black/40 rounded-xl px-4 py-3 border border-white/[0.08] focus-within:border-orange-500/50 transition">
              <Search01Icon size={18} className="text-slate-400" />
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search historical subjects (e.g., Apollo 11 Saturn V launch, 1960s factory assembly line)..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>
            <button 
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 transition"
            >
              <span>Search</span>
              <ArrowRight01Icon size={16} />
            </button>
          </form>

          {/* Sample Query Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2.5 border-t border-white/[0.06] text-xs text-slate-400">
            <span className="font-mono text-[11px] text-slate-500">Sample Queries:</span>
            {[
              'Apollo 11 Moon Landing',
              '1960s Factory Floor',
              '80s Neon Tokyo',
              '1930s Dust Bowl'
            ].map(chip => (
              <button 
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-slate-300 hover:border-white/20 hover:text-white transition font-mono text-[11px]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. CORE CAPABILITY TILES */}
      {/* ========================================================================= */}
      <section className="w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-orange-400">Editorial Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Built for Archival Researchers &amp; Editors</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          
          <Link href="/dashboard" className="group rounded-2xl border border-white/[0.08] bg-[#16181e] p-6 transition hover:border-orange-500/40 hover:bg-white/[0.02]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 mb-4 border border-orange-500/20 group-hover:scale-105 transition">
              <Film01Icon size={20} />
            </div>
            <h3 className="font-semibold text-white text-base mb-1.5">Script-to-Timeline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Deconstruct treatments into scene-by-scene search parameters with estimated durations and timecode markers.</p>
          </Link>

          <Link href="/dashboard" className="group rounded-2xl border border-white/[0.08] bg-[#16181e] p-6 transition hover:border-sky-500/40 hover:bg-white/[0.02]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 mb-4 border border-sky-500/20 group-hover:scale-105 transition">
              <Layers01Icon size={20} />
            </div>
            <h3 className="font-semibold text-white text-base mb-1.5">Visual Reference Search</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Match historical film grammar, lens angles, and lighting compositions against archival collections using multimodal vision.</p>
          </Link>

          <Link href="/dashboard" className="group rounded-2xl border border-white/[0.08] bg-[#16181e] p-6 transition hover:border-purple-500/40 hover:bg-white/[0.02]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-4 border border-purple-500/20 group-hover:scale-105 transition">
              <SparklesIcon size={20} />
            </div>
            <h3 className="font-semibold text-white text-base mb-1.5">Film Stock Emulation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Audition footage under calibrated historical film profiles and export industry-standard .cube LUTs for DaVinci Resolve.</p>
          </Link>

          <Link href="/dashboard" className="group rounded-2xl border border-white/[0.08] bg-[#16181e] p-6 transition hover:border-emerald-500/40 hover:bg-white/[0.02]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20 group-hover:scale-105 transition">
              <SecurityIcon size={20} />
            </div>
            <h3 className="font-semibold text-white text-base mb-1.5">Chain-of-Title Audit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Generate printable provenance documentation recording 17 U.S.C. § 105 statutory standing with SHA-256 audit hashes.</p>
          </Link>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS: WORKFLOW PIPELINE */}
      {/* ========================================================================= */}
      <section className="w-full rounded-2xl border border-white/[0.08] bg-[#14161d] p-8 sm:p-12 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">Production Pipeline</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">From Treatment to Master Cutlist</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Accelerate archival research from weeks to minutes with structured scene deconstruction and institutional vault search.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Step 1 */}
          <div className="relative flex flex-col items-start bg-black/30 border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400 font-mono font-bold text-xs border border-orange-500/25">
                01
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/[0.08]">Ingest</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Script &amp; Cue Breakdown</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingest treatments, voiceover scripts, or shot cues. Scenes are deconstructed into historical time periods, camera angles, and subject criteria.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-start bg-black/30 border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400 font-mono font-bold text-xs border border-purple-500/25">
                02
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/[0.08]">Search &amp; Audit</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Federated Vault Retrieval</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Parallel Search executes sub-second queries across 15 institutional vaults while the clearance engine audits statutory public domain status.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-start bg-black/30 border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/25">
                03
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/[0.08]">Conform</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">NLE Assembly &amp; Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Send clips directly to Premiere Pro bins or export standard Premiere XML, DaVinci Resolve FCPXML, and CMX 3600 EDL cutlists.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. COST & RIGHTS COMPARISON MATRIX */}
      {/* ========================================================================= */}
      <section className="w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">Rights &amp; Budget Optimization</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Public Domain vs Commercial Stock Libraries</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Comparing statutory public domain archival research with commercial stock licensing fees.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#16181e] shadow-sm">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] font-mono text-[11px] text-slate-400">
                <th className="p-4 font-semibold">Evaluation Criteria</th>
                <th className="p-4 text-orange-400 font-semibold">CineVault Studio</th>
                <th className="p-4 text-slate-400 font-semibold">Commercial Stock (Getty / Shutterstock / Pond5)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-300">
              <tr>
                <td className="p-4 font-medium text-white">Licensing Fee per Clip</td>
                <td className="p-4 text-emerald-400 font-mono font-semibold">$0.00 (Statutory Public Domain)</td>
                <td className="p-4 font-mono text-slate-400">$250 – $1,200+ per clip</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Search &amp; Clearance Latency</td>
                <td className="p-4 text-emerald-400 font-mono font-semibold">~700ms (Automated parallel search)</td>
                <td className="p-4 text-slate-400 font-mono">3 – 14 business days broker review</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Statutory Copyright Basis</td>
                <td className="p-4 text-emerald-400 font-medium">17 U.S.C. § 105 &amp; Pre-1929 Public Record</td>
                <td className="p-4 text-slate-400">Commercial contract with usage limitations</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Chain-of-Title Documentation</td>
                <td className="p-4 text-emerald-400 font-medium">SHA-256 Verifiable Provenance Record</td>
                <td className="p-4 text-slate-400">Standard sales invoice without legal provenance</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">Master Quality &amp; Color Grading</td>
                <td className="p-4 text-emerald-400 font-medium">Archival Telecine Scans + .cube 3D LUTs</td>
                <td className="p-4 text-slate-400">Compressed H.264 preview comps</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-white">NLE Interchange</td>
                <td className="p-4 text-emerald-400 font-medium">Adobe Premiere UXP Panel + XML/FCPXML/EDL</td>
                <td className="p-4 text-slate-400">Manual web browser download and re-link</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CINEMATIC LUT & FILM EMULSION SHOWCASE */}
      {/* ========================================================================= */}
      <section className="w-full rounded-2xl border border-white/[0.08] bg-[#14161d] p-8 sm:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">Color Calibration</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Film Emulsion Profiles &amp; 3D LUTs</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl">
              Audition archival masters with real-time film stock emulation and export industry-standard .cube LUTs calibrated for DaVinci Resolve and Premiere Lumetri.
            </p>
          </div>
          <Link 
            href="/dashboard" 
            className="self-start md:self-auto inline-flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/25 px-4 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
          >
            <SparklesIcon size={16} />
            <span>Open Viewfinder</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[
            { name: 'Kodachrome 64', era: '1974', desc: 'Warm saturation, high contrast, signature reversal color', badge: 'Color Reversal' },
            { name: 'Technicolor', era: '1935', desc: 'Dye-transfer cyan/magenta/yellow three-strip separation', badge: 'Golden Age' },
            { name: 'Kodak 16mm Tri-X', era: '1954', desc: 'Fine grain monochrome with deep, punchy black floor', badge: 'Newsreel B&W' },
            { name: 'Sepia Nitrate', era: '1920s', desc: 'Warm aged monochrome with gentle edge roll-off', badge: 'Silent Era' },
            { name: 'Fuji Eterna 500T', era: '1990s', desc: 'Subdued pastel tonality with gentle highlight roll-off', badge: 'Tungsten 35mm' }
          ].map(lut => (
            <div key={lut.name} className="rounded-xl border border-white/[0.08] bg-black/30 p-4 flex flex-col justify-between hover:border-amber-500/30 transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-amber-400 font-semibold">{lut.era}</span>
                  <span className="text-[9px] font-mono bg-white/[0.06] px-1.5 py-0.5 rounded text-slate-400">{lut.badge}</span>
                </div>
                <div className="font-semibold text-white text-xs mb-1">{lut.name}</div>
                <div className="text-[11px] text-slate-400 leading-snug">{lut.desc}</div>
              </div>
              <div className="mt-4 pt-2.5 border-t border-white/[0.06] text-[10px] font-mono text-slate-500">
                1-Click .cube Export
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. INSTITUTIONAL REPOSITORY VAULT NETWORK (15 ARCHIVES) */}
      {/* ========================================================================= */}
      <section className="w-full rounded-2xl border border-white/[0.08] bg-[#16181e] p-6 sm:p-8">
        <div className="text-center mb-6">
          <span className="text-[11px] font-mono font-semibold uppercase text-slate-400 tracking-wider">Archival Index</span>
          <h3 className="text-xl font-bold text-white mt-1">Connected to 15 Historical Repositories</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
            Primary source material indexed directly from government, educational, and international film collections.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-center text-xs font-mono">
          {[
            { name: 'National Archives (NARA)', territory: 'USA • Federal Record' },
            { name: 'Library of Congress (LOC)', territory: 'USA • National Collection' },
            { name: 'NASA Image & Video Vault', territory: 'USA • Aerospace 70mm' },
            { name: 'Prelinger Archives', territory: 'USA • Educational & Ephemeral' },
            { name: 'British Film Institute (BFI)', territory: 'UK • Heritage Collection' },
            { name: 'INA Audiovisual Institute', territory: 'France • Broadcast News' },
            { name: 'UCLA Film & TV Archive', territory: 'USA • Classic Cinema' },
            { name: 'European Film Gateway (EFG)', territory: 'EU • Federated Archives' },
            { name: 'Smithsonian Institution', territory: 'USA • Scientific Film' },
            { name: 'Imperial War Museum (IWM)', territory: 'UK • Historical Conflicts' },
            { name: 'National Film Board (NFB)', territory: 'Canada • Documentary' },
            { name: 'NFSA National Screen Archive', territory: 'Australia • Film Heritage' },
            { name: 'Filmarkivet', territory: 'Sweden • 35mm Telecine' },
            { name: 'National Library of Medicine', territory: 'USA • Scientific & Medical' },
            { name: 'Danish Film Institute (DFI)', territory: 'Denmark • Silent Era' }
          ].map(vault => (
            <div key={vault.name} className="rounded-xl border border-white/[0.06] bg-black/25 p-3 text-slate-300 flex flex-col items-center justify-center hover:bg-white/[0.04] transition">
              <span className="font-semibold text-white text-[11px]">{vault.name}</span>
              <span className="text-[9.5px] text-slate-400 mt-0.5">{vault.territory}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. NLE INTERCHANGE */}
      {/* ========================================================================= */}
      <section className="w-full text-center max-w-3xl mx-auto">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-400">Editorial Compatibility</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Interchange With Your Post Pipeline</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 mb-8">
          Export industry-standard sequences and cutlists without manual conform or transcodes.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/[0.08] bg-[#16181e] p-4 text-center">
            <div className="font-mono font-bold text-purple-400 text-base mb-1">Pr</div>
            <div className="font-semibold text-white text-xs">Premiere Pro</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Native UXP + XML</div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#16181e] p-4 text-center">
            <div className="font-mono font-bold text-orange-400 text-base mb-1">DaVinci</div>
            <div className="font-semibold text-white text-xs">Resolve Studio</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">FCPXML + .cube LUTs</div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#16181e] p-4 text-center">
            <div className="font-mono font-bold text-sky-400 text-base mb-1">FCP</div>
            <div className="font-semibold text-white text-xs">Final Cut Pro</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Apple FCPXML v1.10</div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#16181e] p-4 text-center">
            <div className="font-mono font-bold text-slate-300 text-base mb-1">EDL</div>
            <div className="font-semibold text-white text-xs">Avid / CMX 3600</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Standard SMPTE EDL</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      {/* ========================================================================= */}
      <section className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">Documentation</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={faq.q}
              className="rounded-xl border border-white/[0.08] bg-[#16181e] overflow-hidden transition"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold text-white hover:bg-white/[0.02] transition"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 text-base font-mono">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/[0.06] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CALL-TO-ACTION BANNER */}
      {/* ========================================================================= */}
      <section className="w-full rounded-2xl border border-white/10 bg-[#14161d] p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Begin Archival Ingest
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mt-2 leading-relaxed">
          Search institutional vaults, verify statutory public domain rights, and export directly to your editing timeline.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-6">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 transition"
          >
            <PlayIcon size={16} />
            <span>Open Studio Workspace</span>
          </Link>
          <a 
            href="/premiere/index.html"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white transition"
          >
            <span className="font-mono text-purple-400 font-bold text-xs">Pr</span>
            <span>Open Premiere Panel</span>
          </a>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. STUDIO FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-white/[0.08] pt-8 pb-4 text-center text-xs font-mono text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-4 text-slate-400">
          <Link href="/dashboard" className="hover:text-white transition">Studio Workspace</Link>
          <a href="/premiere/index.html" target="_blank" rel="noreferrer" className="hover:text-white transition">Premiere Pro Panel</a>
          <a href="https://github.com/pwnjoshi/CineVault" target="_blank" rel="noreferrer" className="hover:text-white transition">GitHub Repository</a>
          <a href="/api/health" target="_blank" rel="noreferrer" className="hover:text-white transition">System Health</a>
        </div>
        <p>CineVault Studio &bull; Archival Footage Ingest &amp; Clearance Engine &bull; MIT License</p>
      </footer>

    </main>
  );
}
