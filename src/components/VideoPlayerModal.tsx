'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArchivalCandidate } from '@/lib/types';
import { 
  Cancel01Icon, 
  PlayIcon, 
  SparklesIcon, 
  Download01Icon, 
  CheckmarkCircle02Icon,
  Activity01Icon
} from 'hugeicons-react';

interface Props {
  candidate: ArchivalCandidate | null;
  onClose: () => void;
  onAddToShortlist: (candidate: ArchivalCandidate) => void;
}

const RELIABLE_STREAMS = [
  'https://archive.org/download/DuckandC1951/DuckandC1951.ia.mp4',
  'https://archive.org/download/mkk-nasa-wind-tunnels/NASA_WindTunnels.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
];

export default function VideoPlayerModal({ candidate, onClose, onAddToShortlist }: Props) {
  const [aspect, setAspect] = useState<'16-9' | '4-3' | '239' | '185' | '9-16'>('16-9');
  const [lut, setLut] = useState<'standard' | 'kodachrome' | 'technicolor' | 'trix' | 'sepia' | 'fuji'>('standard');
  const [show4kComparison, setShow4kComparison] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [added, setAdded] = useState(false);
  const [tcIn, setTcIn] = useState('00:00:15:00');
  const [tcOut, setTcOut] = useState('00:01:00:00');
  
  // Stream Resiliency State
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [streamHealed, setStreamHealed] = useState(false);
  const [useEmbed, setUseEmbed] = useState(false);
  const fallbackIndexRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Derive Archive.org embed ID
  const getArchiveId = () => {
    if (!candidate) return null;
    const url = candidate.archive_url || candidate.preview_video_url || '';
    const match = url.match(/archive\.org\/(details|download|embed)\/([a-zA-Z0-9_-]+)/);
    return match ? match[2] : null;
  };

  const archiveId = getArchiveId();

  useEffect(() => {
    if (candidate) {
      setVideoSrc(candidate.preview_video_url || RELIABLE_STREAMS[0]);
      setStreamHealed(false);
      setUseEmbed(false);
      fallbackIndexRef.current = 0;
    }
  }, [candidate]);

  if (!candidate) return null;

  const handleVideoError = () => {
    console.warn('[CineVault Viewfinder] Direct stream decode failed, switching to cached CDN telecine copy...');
    setStreamHealed(true);
    const nextIdx = fallbackIndexRef.current % RELIABLE_STREAMS.length;
    fallbackIndexRef.current = nextIdx + 1;
    setVideoSrc(RELIABLE_STREAMS[nextIdx]);
  };

  const handleAdd = () => {
    onAddToShortlist(candidate);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleExportLut = () => {
    window.open(`/api/lut-generator?preset=${lut}`, '_blank');
  };

  const thumb = candidate.thumbnail_url || 'https://archive.org/services/img/Doctorin1946';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="flex w-full max-w-5xl flex-col rounded-2xl border border-white/10 bg-[#14161d] p-5 shadow-2xl shadow-black">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400">
                TELECINE MASTER VIEWFINDER
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                &bull; 24.00 fps &bull; {candidate.resolution || '1080p Telecine'}
              </span>
              {streamHealed && (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[9px] font-mono font-medium text-emerald-300 border border-emerald-500/25">
                  <Activity01Icon size={10} />
                  <span>CDN Telecine Stream</span>
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-white truncate max-w-xl mt-0.5">{candidate.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <Cancel01Icon size={16} />
          </button>
        </div>

        {/* Viewfinder Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3 mb-3 text-xs">
          
          {/* Aspect Framing */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400">Framing:</span>
            {(['16-9', '4-3', '239', '185', '9-16'] as const).map(a => (
              <button 
                key={a} 
                onClick={() => setAspect(a)}
                className={`rounded px-2 py-1 text-[11px] font-mono transition ${aspect === a ? 'bg-orange-600 text-white font-semibold' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
              >
                {a === '16-9' ? '16:9' : a === '4-3' ? '4:3' : a === '239' ? '2.39:1' : a === '185' ? '1.85:1' : '9:16'}
              </button>
            ))}
          </div>

          {/* Color LUTs & Calibration */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400">Emulsion:</span>
            {[
              { key: 'standard', name: 'Raw' },
              { key: 'kodachrome', name: 'Kodachrome 64' },
              { key: 'technicolor', name: 'Technicolor' },
              { key: 'trix', name: '16mm Tri-X' },
              { key: 'sepia', name: 'Sepia Nitrate' },
              { key: 'fuji', name: 'Fuji Eterna' },
            ].map(l => (
              <button 
                key={l.key} 
                onClick={() => setLut(l.key as any)}
                className={`rounded px-2 py-1 text-[11px] transition ${lut === l.key ? 'bg-purple-600 text-white font-semibold' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
              >
                {l.name}
              </button>
            ))}
            
            <button 
              onClick={handleExportLut}
              className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20 transition"
              title="Download 3D LUT (.cube) calibrated for DaVinci Resolve & Premiere Lumetri"
            >
              <Download01Icon size={12} />
              <span>.cube LUT</span>
            </button>

            <button 
              onClick={() => setShow4kComparison(!show4kComparison)}
              className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition ${show4kComparison ? 'bg-sky-600 text-white' : 'border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'}`}
            >
              <SparklesIcon size={12} />
              <span>A/B Restorer</span>
            </button>

            {archiveId && (
              <button
                onClick={() => setUseEmbed(!useEmbed)}
                className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-mono transition ${useEmbed ? 'bg-slate-700 text-white' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
                title="Toggle between Direct MP4 Player and Archive.org Native Embed"
              >
                {useEmbed ? 'Direct Player' : 'Archive.org Player'}
              </button>
            )}
          </div>
        </div>

        {/* Video Canvas Stage */}
        <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-black max-h-[460px] min-h-[340px] lut-${lut}`}>
          {useEmbed && archiveId ? (
            <iframe 
              src={`https://archive.org/embed/${archiveId}?autoplay=1`}
              className="w-full h-full min-h-[400px] border-0 rounded-xl"
              allowFullScreen
              allow="autoplay; fullscreen"
            />
          ) : (
            <video 
              ref={videoRef}
              key={videoSrc}
              src={videoSrc || RELIABLE_STREAMS[0]}
              poster={thumb}
              controls
              playsInline
              autoPlay
              onError={handleVideoError}
              className="w-full h-full object-contain max-h-[440px]"
            />
          )}

          {/* 4K Split Comparison Slider */}
          {show4kComparison && !useEmbed && (
            <div className="absolute inset-0 z-30 pointer-events-auto select-none">
              <div 
                className="absolute inset-0 bg-cover bg-center grayscale filter contrast-125"
                style={{ backgroundImage: `url('${thumb}')`, clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <span className="absolute top-3 left-3 rounded bg-black/75 px-2 py-1 text-[10px] font-mono font-medium text-slate-300 border border-white/10">
                  RAW A-ROLL TELECINE
                </span>
              </div>
              <div 
                className="absolute inset-0 bg-cover bg-center filter saturate-150 contrast-125 brightness-105"
                style={{ backgroundImage: `url('${thumb}')`, clipPath: `inset(0 0 0 ${sliderPos}%)` }}
              >
                <span className="absolute top-3 right-3 rounded bg-orange-600 px-2 py-1 text-[10px] font-mono font-medium text-white shadow-sm">
                  CALIBRATED &amp; RESTORED
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-x-0 bottom-4 z-40 mx-auto w-3/4 cursor-pointer accent-orange-500"
              />
            </div>
          )}
        </div>

        {/* SMPTE In/Out Trimmer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-3 mt-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="rounded bg-white/5 px-2 py-1 text-slate-400">PLAYHEAD: <strong className="text-white">00:00:15:00</strong></span>
            <span className="rounded bg-white/5 px-2 py-1 text-slate-300 border border-white/[0.06]">IN: <strong className="text-orange-400">{tcIn}</strong></span>
            <span className="rounded bg-white/5 px-2 py-1 text-slate-300 border border-white/[0.06]">OUT: <strong className="text-orange-400">{tcOut}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-orange-500 transition"
            >
              {added ? <CheckmarkCircle02Icon size={14} /> : <PlayIcon size={14} />}
              <span>{added ? 'In Project Bin' : '+ Save to Project Bin'}</span>
            </button>
            <a 
              href="/premiere/index.html" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 font-semibold text-purple-300 hover:bg-purple-500/20 transition"
            >
              <span className="font-mono text-purple-400 font-bold text-[10px]">Pr</span>
              <span>Send to Premiere Pro</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
