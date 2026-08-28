'use client';

import React, { useState, useRef } from 'react';
import { ArchivalCandidate } from '@/lib/types';
import { 
  Cancel01Icon, 
  PlayIcon, 
  SparklesIcon, 
  Download01Icon, 
  CheckmarkCircle02Icon,
  Scissor01Icon
} from 'hugeicons-react';

interface Props {
  candidate: ArchivalCandidate | null;
  onClose: () => void;
  onAddToShortlist: (candidate: ArchivalCandidate) => void;
}

export default function VideoPlayerModal({ candidate, onClose, onAddToShortlist }: Props) {
  const [aspect, setAspect] = useState<'16-9' | '4-3' | '239' | '185' | '9-16'>('16-9');
  const [lut, setLut] = useState<'standard' | 'kodachrome' | 'technicolor' | 'trix' | 'sepia' | 'fuji'>('standard');
  const [show4kComparison, setShow4kComparison] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [added, setAdded] = useState(false);
  const [tcIn, setTcIn] = useState('00:00:15:00');
  const [tcOut, setTcOut] = useState('00:01:00:00');
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!candidate) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex w-full max-w-5xl flex-col rounded-2xl border border-white/15 bg-[#11141c] p-5 shadow-2xl shadow-black">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div>
            <span className="text-[10px] font-mono font-extrabold uppercase text-[#EE5F29] tracking-wider">
              CINEMA VIEWFINDER &bull; 4K TELECINE MASTER
            </span>
            <h3 className="text-base font-bold text-white truncate max-w-xl">{candidate.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <Cancel01Icon size={18} />
          </button>
        </div>

        {/* Viewfinder Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5 mb-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Aspect:</span>
            {(['16-9', '4-3', '239', '185', '9-16'] as const).map(a => (
              <button 
                key={a} 
                onClick={() => setAspect(a)}
                className={`rounded px-2 py-1 text-[11px] font-mono transition ${aspect === a ? 'bg-[#EE5F29] text-white font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
              >
                {a === '16-9' ? '16:9' : a === '4-3' ? '4:3' : a === '239' ? '2.39:1' : a === '185' ? '1.85:1' : '9:16'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Emulsion LUT:</span>
            {[
              { key: 'standard', name: 'Raw' },
              { key: 'kodachrome', name: 'Kodachrome 64' },
              { key: 'technicolor', name: 'Technicolor' },
              { key: 'trix', name: '16mm Tri-X B&W' },
              { key: 'sepia', name: '1930s Sepia' },
              { key: 'fuji', name: 'Fuji Eterna' },
            ].map(l => (
              <button 
                key={l.key} 
                onClick={() => setLut(l.key as any)}
                className={`rounded px-2 py-1 text-[11px] transition ${lut === l.key ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
              >
                {l.name}
              </button>
            ))}
            
            <button 
              onClick={handleExportLut}
              className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20"
            >
              <Download01Icon size={12} />
              .cube LUT
            </button>

            <button 
              onClick={() => setShow4kComparison(!show4kComparison)}
              className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold transition ${show4kComparison ? 'bg-sky-500 text-white' : 'border border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'}`}
            >
              <SparklesIcon size={12} />
              4K AI Restorer
            </button>
          </div>
        </div>

        {/* Video Canvas Stage */}
        <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-black max-h-[460px] min-h-[340px] lut-${lut}`}>
          <video 
            ref={videoRef}
            src={candidate.preview_video_url || 'https://ia800108.us.archive.org/21/items/Apollo11Audio/Apollo11Launch.mp4'}
            poster={thumb}
            controls
            playsInline
            className="w-full h-full object-contain max-h-[440px]"
          />

          {/* 4K Split Comparison Slider */}
          {show4kComparison && (
            <div className="absolute inset-0 z-30 pointer-events-auto select-none">
              <div 
                className="absolute inset-0 bg-cover bg-center grayscale filter contrast-125"
                style={{ backgroundImage: `url('${thumb}')`, clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <span className="absolute top-3 left-3 rounded bg-black/70 px-2 py-1 text-[10px] font-mono font-bold text-slate-300">
                  RAW 480p ARCHIVAL
                </span>
              </div>
              <div 
                className="absolute inset-0 bg-cover bg-center filter saturate-150 contrast-125 brightness-105"
                style={{ backgroundImage: `url('${thumb}')`, clipPath: `inset(0 0 0 ${sliderPos}%)` }}
              >
                <span className="absolute top-3 right-3 rounded bg-[#EE5F29] px-2 py-1 text-[10px] font-mono font-bold text-white shadow-lg">
                  4K AI RESTORED (60FPS)
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-x-0 bottom-4 z-40 mx-auto w-3/4 cursor-pointer accent-[#EE5F29]"
              />
            </div>
          )}
        </div>

        {/* SMPTE In/Out Trimmer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 mt-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="rounded bg-white/5 px-2 py-1 text-slate-400">TIME: <strong className="text-white">00:00:15:00</strong></span>
            <span className="rounded bg-sky-500/10 px-2 py-1 text-sky-300 border border-sky-500/20">IN: <strong>{tcIn}</strong></span>
            <span className="rounded bg-rose-500/10 px-2 py-1 text-rose-300 border border-rose-500/20">OUT: <strong>{tcOut}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EE5F29] px-4 py-2 font-bold text-white shadow-md shadow-[#EE5F29]/25 hover:brightness-110"
            >
              {added ? <CheckmarkCircle02Icon size={14} /> : <PlayIcon size={14} />}
              {added ? 'Saved to Project Bin' : '+ Add to Shortlist Bin'}
            </button>
            <a 
              href="http://localhost:4000/premiere/" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-2 font-bold text-purple-300 hover:bg-purple-500/20"
            >
              Export to Premiere
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
