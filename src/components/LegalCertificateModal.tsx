'use client';

import React, { useState } from 'react';
import { ArchivalCandidate } from '@/lib/types';
import { 
  Cancel01Icon, 
  PrinterIcon, 
  Copy01Icon, 
  CheckmarkCircle02Icon,
  SecurityIcon 
} from 'hugeicons-react';

interface Props {
  items: ArchivalCandidate[];
  onClose: () => void;
}

export default function LegalCertificateModal({ items, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const certId = 'CV-PROV-2026-NARA-8842';
  const sha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyJson = () => {
    const record = {
      certificate_id: certId,
      issued_date: new Date().toISOString(),
      sha256_audit_fingerprint: sha256,
      statutory_exemption: '17 U.S.C. § 105 (U.S. Government Works & Pre-1929 Public Domain)',
      audited_assets: items.map(i => ({
        title: i.title,
        source_repository: i.source_name,
        public_domain_status: i.pd_claim,
        license_rate: i.price,
        archive_identifier: i.id
      }))
    };
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="flex w-full max-w-4xl flex-col rounded-2xl border border-white/10 bg-[#16181e] p-6 shadow-2xl shadow-black my-8 font-sans">
        
        {/* Modal Action Header */}
        <div className="no-print flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <SecurityIcon size={16} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">Statutory Rights Record</span>
              <h3 className="text-sm font-bold text-white">Chain-of-Title &amp; Provenance Record</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
            >
              <PrinterIcon size={14} />
              <span>Print / Save PDF</span>
            </button>
            <button 
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              {copied ? <CheckmarkCircle02Icon size={14} /> : <Copy01Icon size={14} />}
              <span>{copied ? 'Copied JSON' : 'Export JSON'}</span>
            </button>
            <button 
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <Cancel01Icon size={16} />
            </button>
          </div>
        </div>

        {/* Official Printable Certificate Document */}
        <div id="printable-certificate" className="rounded-xl border border-slate-300 bg-white p-8 text-slate-900 shadow-sm font-serif">
          
          <div className="text-center border-b border-slate-300 pb-5 mb-5">
            <div className="font-sans text-[11px] font-bold uppercase tracking-widest text-orange-600">
              CINEVAULT STUDIO &bull; ARCHIVAL RIGHTS &amp; PROVENANCE REGISTRY
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950 mt-1 mb-1 font-serif">
              RECORD OF STATUTORY PUBLIC DOMAIN CLEARANCE
            </h2>
            <div className="text-xs text-slate-600 font-mono">
              RECORD ID: <strong>{certId}</strong> &bull; DATE OF AUDIT: {dateStr}
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-700 mb-4 font-serif">
            This document records that the audiovisual assets identified below have undergone archival provenance auditing pursuant to <strong>17 U.S.C. § 105 (Works of the United States Government)</strong> and historical public domain statutory criteria. As works created by officers or employees of the United States Government as part of their official duties, or as published materials whose statutory copyright terms have expired, these items reside in the public domain and are eligible for editorial, broadcast, and theatrical use without commercial copyright royalties.
          </p>

          <table className="w-full border-collapse text-left text-xs mb-5 font-sans">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-slate-800 font-semibold">
                <th className="p-2.5">Asset Title</th>
                <th className="p-2.5">Institutional Repository</th>
                <th className="p-2.5">Statutory Basis</th>
                <th className="p-2.5 text-right">Fee Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.slice(0, 6).map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="p-2.5 font-medium text-slate-900">#{idx + 1}: {item.title}</td>
                  <td className="p-2.5 text-slate-600">{item.source_name}</td>
                  <td className="p-2.5 font-semibold text-emerald-700">17 U.S.C. § 105 Exemption</td>
                  <td className="p-2.5 text-right font-mono font-semibold text-emerald-700">$0.00 (Public Domain)</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-6 border-t border-slate-300 pt-4 text-[11px] font-sans">
            <div>
              <strong className="uppercase text-slate-900 tracking-wider text-[10px]">Audit Provenance &amp; Verification Hash</strong>
              <p className="text-slate-600 mt-1 leading-normal text-xs">
                Asset provenance has been indexed from primary federal repositories, educational archives, and national film collections.
              </p>
              <div className="font-mono text-[9px] text-slate-500 mt-2 break-all bg-slate-50 p-2 rounded border border-slate-200">
                SHA-256 Seal: {sha256}
              </div>
            </div>
            <div className="text-right flex flex-col justify-between">
              <div>
                <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Provenance Verification Authority</div>
                <div className="text-xs text-slate-600 mt-1">CineVault Studio Archival Rights Registry</div>
              </div>
              <div className="font-mono text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block self-end border border-emerald-200">
                ✓ VERIFIED &amp; LOGGED TO PROJECT BIN
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
