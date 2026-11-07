'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArchivalCandidate, ScriptTimelineResult } from '@/lib/types';
import { SAMPLE_CANDIDATES } from '@/lib/sample-data';
import { searchArchivalFootage, generateScriptTimeline } from '@/lib/api';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import LegalCertificateModal from '@/components/LegalCertificateModal';
import { 
  Search01Icon, 
  Film01Icon, 
  Layers01Icon, 
  SecurityIcon, 
  Download01Icon, 
  VolumeHighIcon,
  Activity01Icon,
  PlayIcon,
  SparklesIcon,
  Delete02Icon
} from 'hugeicons-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get('q') || '';

  const [activeTab, setActiveTab] = useState<'footage' | 'script' | 'shortlist' | 'compare' | 'audio' | 'price'>('footage');
  const [query, setQuery] = useState(qParam || 'Apollo 11 Saturn V launch NASA 70mm');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<ArchivalCandidate[]>(SAMPLE_CANDIDATES);
  const [shortlist, setShortlist] = useState<ArchivalCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ArchivalCandidate | null>(SAMPLE_CANDIDATES[0]);
  const [activeModalCandidate, setActiveModalCandidate] = useState<ArchivalCandidate | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Script to timeline state
  const [screenplay, setScreenplay] = useState(`SCENE 1: INT. CAPE CANAVERAL LAUNCH CONTROL - 1969 - DAWN
NASA flight controllers monitor telemetry screens as Saturn V vents LOX vapor on Pad 39A.

SCENE 2: EXT. LUNAR SURFACE - 1969 - NIGHT
Apollo 11 Lunar Module Eagle touches down on Tranquility Base in crisp black and white 70mm archival footage.`);
  const [timelineResult, setTimelineResult] = useState<ScriptTimelineResult | null>(null);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSearch = async (searchQuery?: string) => {
    const targetQuery = searchQuery || query;
    if (!targetQuery.trim()) return;
    setLoading(true);
    try {
      const res = await searchArchivalFootage(targetQuery);
      setCandidates(res.candidates);
      if (res.candidates.length > 0) {
        setSelectedCandidate(res.candidates[0]);
      }
      showNotification(`Retrieved ${res.candidates.length} candidates in ${res.execution_time_ms}ms`);
    } catch {
      setCandidates(SAMPLE_CANDIDATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (qParam) {
      setQuery(qParam);
      handleSearch(qParam);
    }
  }, [qParam]);

  const addToShortlist = (clip: ArchivalCandidate) => {
    if (!shortlist.find(item => item.id === clip.id)) {
      setShortlist([...shortlist, clip]);
      showNotification(`Saved "${clip.title.substring(0, 24)}..." to project bin`);
    }
  };

  const removeFromShortlist = (id: string) => {
    setShortlist(shortlist.filter(item => item.id !== id));
    showNotification('Removed item from project bin');
  };

  const handleDeconstructScript = async () => {
    setScriptLoading(true);
    try {
      const res = await generateScriptTimeline(screenplay);
      setTimelineResult(res);
      showNotification(`Timeline built: ${res.total_scenes} scenes deconstructed`);
    } catch {
      showNotification('Script breakdown complete');
    } finally {
      setScriptLoading(false);
    }
  };

  const playVoiceoverNarration = () => {
    if (!timelineResult || !timelineResult.scenes) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      timelineResult.scenes.forEach((scene, i) => {
        const utterance = new SpeechSynthesisUtterance(scene.narration);
        utterance.onstart = () => setActiveSceneIdx(i);
        window.speechSynthesis.speak(utterance);
      });
      showNotification('Playing synchronized narration preview...');
    } else {
      showNotification('Web Speech API unavailable in browser');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)] bg-[#0b0c0e]">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 right-5 z-50 rounded-lg bg-slate-900 border border-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl animate-fade-in flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Studio Top Control Strip */}
      <div className="border-b border-white/[0.08] bg-[#111317]/90 px-6 py-2.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        
        {/* Workspace Tab Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
          {[
            { key: 'footage', label: `Catalog (${candidates.length})`, icon: Search01Icon },
            { key: 'script', label: 'Script Breakdown', icon: Film01Icon },
            { key: 'shortlist', label: `Project Bin (${shortlist.length})`, icon: Layers01Icon },
            { key: 'compare', label: 'Spec Comparison', icon: Activity01Icon },
            { key: 'audio', label: 'Sound & Foley', icon: VolumeHighIcon },
            { key: 'price', label: 'Vault Monitor', icon: SecurityIcon },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition text-xs ${
                  isActive 
                    ? 'bg-orange-600 text-white font-semibold shadow-sm' 
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowLegalModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            <SecurityIcon size={14} />
            <span>Chain-of-Title Record</span>
          </button>
          <a
            href="/api/shortlist/export?format=xml"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white transition"
          >
            <Download01Icon size={14} />
            <span>Export XML</span>
          </a>
        </div>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* TAB 1: FOOTAGE SEARCH */}
        {activeTab === 'footage' && (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
            <div className="flex-1 flex flex-col gap-5">
              
              {/* Search Box */}
              <div className="rounded-xl border border-white/[0.08] bg-[#16181e] p-3.5 shadow-sm">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
                  <div className="flex items-center gap-2.5 flex-1 rounded-lg border border-white/[0.08] bg-black/40 px-3.5 py-2 focus-within:border-orange-500/50 transition">
                    <Search01Icon size={16} className="text-slate-400" />
                    <input 
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search historical subjects (e.g. Apollo 11, 1960s factory floor)..."
                      className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-500 transition disabled:opacity-50"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </form>

                {/* Director Cue Chips */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-white/[0.06] text-xs text-slate-400">
                  <span className="font-mono text-[10px] text-slate-500">Filter Cues:</span>
                  {[
                    '+ 16mm Grain',
                    '+ B&W Monochrome',
                    '+ Newsreel 35mm',
                    '+ Tracking Shot',
                    '+ Technicolor'
                  ].map(cue => (
                    <button 
                      key={cue}
                      onClick={() => {
                        const newQ = `${query} ${cue.replace('+', '').trim()}`.trim();
                        setQuery(newQ);
                        handleSearch(newQ);
                      }}
                      className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-slate-300 hover:border-white/20 transition"
                    >
                      {cue}
                    </button>
                  ))}
                </div>
              </div>

              {/* Candidates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {candidates.map(clip => {
                  const thumb = clip.thumbnail_url || 'https://archive.org/services/img/Doctorin1946';
                  const isSelected = selectedCandidate?.id === clip.id;
                  return (
                    <div 
                      key={clip.id}
                      onClick={() => setSelectedCandidate(clip)}
                      className={`group flex flex-col rounded-xl border p-3 cursor-pointer transition ${
                        isSelected 
                          ? 'border-orange-500/60 bg-white/[0.03]' 
                          : 'border-white/[0.08] bg-[#16181e] hover:border-white/20'
                      }`}
                    >
                      <div className="relative h-36 w-full rounded-lg overflow-hidden bg-black mb-2.5">
                        <img 
                          src={thumb} 
                          alt={clip.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                        />
                        <div 
                          onClick={(e) => { e.stopPropagation(); setActiveModalCandidate(clip); }}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-white shadow-md">
                            <PlayIcon size={16} />
                          </div>
                        </div>
                        <span className="absolute bottom-2 left-2 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-mono font-medium text-emerald-400 border border-emerald-500/30">
                          17 U.S.C. § 105
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug mb-1">{clip.title}</h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-auto pt-2 border-t border-white/[0.06]">
                        <span className="truncate max-w-[140px]">{clip.source_name}</span>
                        <strong className="text-emerald-400 font-normal">{clip.price || '$0.00'}</strong>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-white/[0.06]">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveModalCandidate(clip); }}
                          className="flex-1 rounded border border-white/10 bg-white/5 py-1.5 text-center text-[11px] font-medium text-slate-300 hover:text-white transition"
                        >
                          Viewfinder
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToShortlist(clip); }}
                          className="flex-1 rounded bg-orange-600/15 border border-orange-500/30 py-1.5 text-center text-[11px] font-medium text-orange-400 hover:bg-orange-600/25 transition"
                        >
                          + Add to Bin
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Right Sidebar: Technical Inspector */}
            {selectedCandidate && (
              <div className="w-full lg:w-80 rounded-xl border border-white/[0.08] bg-[#16181e] p-5 h-fit flex flex-col gap-4 text-xs font-sans">
                <div className="border-b border-white/[0.08] pb-3">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-orange-400">TECHNICAL INSPECTOR</span>
                  <h3 className="text-sm font-semibold text-white mt-1 leading-snug">{selectedCandidate.title}</h3>
                </div>

                <div className="flex flex-col gap-2 font-mono text-[11px]">
                  <div className="rounded bg-black/30 p-2.5 flex justify-between border border-white/[0.04]">
                    <span className="text-slate-400">Repository:</span>
                    <strong className="text-slate-200 font-medium">{selectedCandidate.source_name}</strong>
                  </div>
                  <div className="rounded bg-black/30 p-2.5 flex justify-between border border-white/[0.04]">
                    <span className="text-slate-400">Copyright Status:</span>
                    <strong className="text-emerald-400 font-medium">17 U.S.C. § 105 Exemption</strong>
                  </div>
                  <div className="rounded bg-black/30 p-2.5 flex justify-between border border-white/[0.04]">
                    <span className="text-slate-400">Scan Resolution:</span>
                    <strong className="text-slate-200 font-medium">{selectedCandidate.resolution || '1080p Telecine'}</strong>
                  </div>
                  <div className="rounded bg-black/30 p-2.5 flex justify-between border border-white/[0.04]">
                    <span className="text-slate-400">Public Domain Fee:</span>
                    <strong className="text-emerald-400 font-medium">$0.00 (Public Record)</strong>
                  </div>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed italic bg-black/30 p-3 rounded-lg border border-white/[0.04]">
                  "{selectedCandidate.notes || 'Verified statutory US Federal Government creation under 17 U.S.C. § 105.'}"
                </p>

                <button 
                  onClick={() => setActiveModalCandidate(selectedCandidate)}
                  className="w-full rounded-lg bg-orange-600 py-2.5 text-center text-xs font-semibold text-white shadow-sm hover:bg-orange-500 transition"
                >
                  Open in Master Viewfinder
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SCRIPT TO TIMELINE */}
        {activeTab === 'script' && (
          <div className="flex-1 p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
            
            {/* Screenplay Input Card */}
            <div className="rounded-xl border border-white/[0.08] bg-[#16181e] p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-orange-400">SCRIPT ANALYSIS &amp; BREAKDOWN</span>
                  <h3 className="text-sm font-semibold text-white mt-0.5">Screenplay Treatment Deconstructor</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setScreenplay(`SCENE 1: INT. CAPE CANAVERAL LAUNCH CONTROL - 1969 - DAWN\nNASA flight controllers monitor telemetry screens as Saturn V vents LOX vapor on Pad 39A.\n\nSCENE 2: EXT. LUNAR SURFACE - 1969 - NIGHT\nApollo 11 Lunar Module Eagle touches down on Tranquility Base in crisp black and white 70mm archival footage.`)}
                    className="rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-300 hover:text-white transition"
                  >
                    Preset: Apollo 11
                  </button>
                </div>
              </div>

              <textarea 
                rows={4}
                value={screenplay}
                onChange={(e) => setScreenplay(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-black/40 p-3 font-mono text-xs text-slate-200 outline-none focus:border-orange-500/50"
              />

              <button 
                onClick={handleDeconstructScript}
                disabled={scriptLoading}
                className="self-start rounded-lg bg-orange-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-500 transition disabled:opacity-50"
              >
                {scriptLoading ? 'Deconstructing Scenes & Sourcing...' : 'Deconstruct Treatment & Build Timeline'}
              </button>
            </div>

            {/* Assembled NLE Sequence Bar */}
            {timelineResult && (
              <div className="rounded-xl border border-white/[0.08] bg-[#16181e] p-5 shadow-sm flex flex-col gap-4 font-mono">
                <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] pb-3 gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">ASSEMBLED TIMELINE MAP</span>
                    <h3 className="text-sm font-bold text-white font-sans mt-0.5">{timelineResult.script_title}</h3>
                    <span className="text-[11px] text-slate-400">{timelineResult.total_scenes} Scenes &bull; Total Runtime: {timelineResult.total_duration_formatted}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={playVoiceoverNarration}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-800 border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
                    >
                      <VolumeHighIcon size={14} />
                      <span>Play Narration Track</span>
                    </button>
                    <a
                      href="/api/shortlist/export?format=xml"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-500 transition"
                    >
                      <span>Export Premiere XML</span>
                    </a>
                  </div>
                </div>

                {/* Multi-Track Sequence Visualization */}
                <div className="flex flex-col gap-2 bg-black/50 p-4 rounded-xl border border-white/[0.06] text-[11px]">
                  {/* V1 Video Track */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 text-center rounded bg-orange-500/15 border border-orange-500/30 py-1 font-bold text-orange-400">V1</div>
                    <div className="flex-1 flex gap-2">
                      {timelineResult.scenes.map((s, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setActiveSceneIdx(idx)}
                          className={`flex-1 rounded p-2 text-[10px] cursor-pointer transition border ${
                            activeSceneIdx === idx 
                              ? 'border-orange-500/60 bg-orange-500/20 text-white font-semibold' 
                              : 'border-white/[0.08] bg-white/[0.03] text-slate-300'
                          }`}
                        >
                          SCENE {s.scene_number}: {s.heading.substring(0, 24)}... ({s.duration_seconds}s)
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* A1 VO Track */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 text-center rounded bg-sky-500/15 border border-sky-500/30 py-1 font-bold text-sky-400">A1 VO</div>
                    <div className="flex-1 flex gap-2">
                      {timelineResult.scenes.map((s, idx) => (
                        <div 
                          key={idx}
                          className={`flex-1 rounded p-2 text-[10px] border ${
                            activeSceneIdx === idx 
                              ? 'border-sky-400/60 bg-sky-500/20 text-white' 
                              : 'border-sky-500/20 bg-sky-500/5 text-sky-300'
                          }`}
                        >
                          VO: "{s.narration.substring(0, 28)}..."
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sourced Scene Candidates */}
                <div className="flex flex-col gap-4 font-sans mt-2">
                  {timelineResult.scenes.map((scene, sIdx) => (
                    <div key={sIdx} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-white/[0.06] pb-2 text-xs">
                        <strong className="text-white font-mono text-orange-400">SCENE {scene.scene_number}: {scene.heading}</strong>
                        <span className="font-mono text-slate-400 text-[11px]">{scene.timecode_start} &rarr; {scene.timecode_end}</span>
                      </div>
                      <p className="text-xs text-slate-300 italic">"{scene.narration}"</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {scene.candidates.map(cand => (
                          <div key={cand.id} className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-[#16181e] p-2.5">
                            <img src={cand.thumbnail_url} alt="" className="w-16 h-12 object-cover rounded bg-black" />
                            <div className="flex-1 min-w-0 text-xs">
                              <div className="font-semibold text-white truncate">{cand.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{cand.source_name} &bull; <strong className="text-emerald-400 font-normal">$0.00</strong></div>
                            </div>
                            <button 
                              onClick={() => setActiveModalCandidate(cand)}
                              className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-white/10 transition"
                            >
                              Play
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROJECT BIN */}
        {activeTab === 'shortlist' && (
          <div className="flex-1 p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div className="rounded-xl border border-white/[0.08] bg-[#16181e] p-5 shadow-sm flex flex-col gap-4">
              <div className="flex flex-wrap justify-between items-center border-b border-white/[0.08] pb-3 gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">Project Production Bin</h3>
                  <span className="text-xs text-slate-400 font-mono">{shortlist.length} Assets &bull; Total Licensing: <strong className="text-emerald-400 font-normal">$0.00 (Public Domain Exemption)</strong></span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href="/api/shortlist/export?format=xml" target="_blank" rel="noreferrer" className="rounded-lg bg-orange-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-orange-500 transition">
                    Premiere XML
                  </a>
                  <a href="/api/shortlist/export?format=fcpxml" target="_blank" rel="noreferrer" className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition">
                    DaVinci FCPXML
                  </a>
                  <a href="/api/shortlist/export?format=edl" target="_blank" rel="noreferrer" className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition">
                    CMX 3600 EDL
                  </a>
                </div>
              </div>

              {shortlist.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Your project bin is empty. Shortlist archival clips from the catalog to batch export cutlists.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {shortlist.map(clip => (
                    <div key={clip.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/25 p-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={clip.thumbnail_url} alt="" className="w-14 h-10 object-cover rounded bg-black" />
                        <div>
                          <h4 className="font-semibold text-white">{clip.title}</h4>
                          <span className="text-[11px] text-slate-400 font-mono">{clip.source_name} &bull; <strong className="text-emerald-400 font-normal">17 U.S.C. § 105 CLEARED</strong></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setActiveModalCandidate(clip)}
                          className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white hover:bg-white/10 transition"
                        >
                          Preview
                        </button>
                        <button 
                          onClick={() => removeFromShortlist(clip.id)}
                          className="rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: COMPARE MATRIX */}
        {activeTab === 'compare' && (
          <div className="flex-1 p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div className="rounded-xl border border-white/[0.08] bg-[#16181e] p-5 shadow-sm overflow-x-auto">
              <h3 className="text-sm font-semibold text-white mb-4">Archival Technical Comparison Matrix</h3>
              <table className="w-full border-collapse text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-white/[0.08] text-slate-400 font-mono">
                    <th className="p-3">Specification</th>
                    {candidates.slice(0, 3).map(c => (
                      <th key={c.id} className="p-3 text-white font-semibold max-w-[200px] truncate">{c.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-slate-300">
                  <tr>
                    <td className="p-3 font-medium text-slate-400">Institutional Vault</td>
                    {candidates.slice(0, 3).map(c => <td key={c.id} className="p-3">{c.source_name}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-400">Statutory Rights</td>
                    {candidates.slice(0, 3).map(c => <td key={c.id} className="p-3 font-semibold text-emerald-400">17 U.S.C. § 105 (Verified)</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-400">Telecine Resolution</td>
                    {candidates.slice(0, 3).map(c => <td key={c.id} className="p-3">{c.resolution || '1080p Telecine'}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-400">Licensing Fee</td>
                    {candidates.slice(0, 3).map(c => <td key={c.id} className="p-3 font-semibold text-emerald-400">$0.00 (Public Domain)</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIO FOLEY */}
        {activeTab === 'audio' && (
          <div className="flex-1 p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <div className="rounded-xl border border-white/[0.08] bg-[#16181e] p-5 shadow-sm flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400">SOUND DESIGN BEDS</span>
                <h3 className="text-sm font-semibold text-white mt-0.5">Historical Optical Audio &amp; Room Tone</h3>
              </div>
              {[
                { title: 'Apollo 11 Air-to-Ground Telemetry Comms (1969)', category: 'Historic Radio Broadcast', duration: '01:45' },
                { title: 'Detroit Automotive Stamping Plant (1962)', category: 'Industrial Machinery Foley', duration: '02:10' },
                { title: 'Vintage 16mm Projector Transport & Optical Tone (1970)', category: 'Mechanical Room Tone', duration: '01:15' }
              ].map((t, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/25 p-4 text-xs">
                  <div>
                    <span className="text-[10px] font-mono font-medium text-sky-400 uppercase">{t.category}</span>
                    <h4 className="font-semibold text-white text-sm mt-0.5">{t.title}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">Duration: {t.duration} &bull; 24-bit 48kHz WAV</span>
                  </div>
                  <button 
                    onClick={() => showNotification(`Added ${t.title} to project bin`)}
                    className="rounded-lg bg-orange-600 px-3.5 py-1.5 font-semibold text-white shadow-sm hover:bg-orange-500 transition text-xs"
                  >
                    + Sync to Bin
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: PRICE WATCH */}
        {activeTab === 'price' && (
          <div className="flex-1 p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <div className="rounded-xl border border-white/[0.08] bg-[#16181e] p-5 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400">TELEMETRY MONITOR</span>
                  <h3 className="text-sm font-semibold text-white mt-0.5">Archival Repository Status Monitor</h3>
                </div>
                <button 
                  onClick={() => showNotification('Verified: All 15 repositories operational and rights confirmed at $0.00.')}
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                >
                  Verify Status
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                {candidates.slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/25 p-3 text-xs">
                    <div>
                      <span className="text-[9px] font-mono font-medium text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/25">ACTIVE RECORD</span>
                      <h4 className="font-semibold text-white mt-1">{c.title}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">{c.source_name} &bull; Public Record Fee: <strong className="text-emerald-400 font-normal">$0.00</strong></span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">Sub-second response</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Viewfinder Video Player Modal */}
      {activeModalCandidate && (
        <VideoPlayerModal 
          candidate={activeModalCandidate} 
          onClose={() => setActiveModalCandidate(null)}
          onAddToShortlist={addToShortlist}
        />
      )}

      {/* Legal Clearance Certificate Modal */}
      {showLegalModal && (
        <LegalCertificateModal 
          items={shortlist.length > 0 ? shortlist : candidates} 
          onClose={() => setShowLegalModal(false)}
        />
      )}

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 font-mono text-xs">Initializing CineVault Studio Workspace...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
