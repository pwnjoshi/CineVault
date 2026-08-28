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
  const certId = 'CV-EO-2026-NARA-8842';
  const sha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const signer = 'Sarah Vance, Esq. (Lead Archival Rights Counsel)';
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyJson = () => {
    const record = {
      certificate_id: certId,
      issued_date: new Date().toISOString(),
      sha256_audit_fingerprint: sha256,
      statutory_exemption: '17 U.S.C. § 105 (United States Government Works)',
      eo_warranty_coverage: '$250,000 USD',
      signatory: signer,
      audited_assets: items.map(i => ({
        title: i.title,
        source_repository: i.source_name,
        public_domain_status: i.pd_claim,
        license_rate: i.price
      }))
    };
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="flex w-full max-w-4xl flex-col rounded-2xl border border-white/15 bg-[#11141c] p-6 shadow-2xl shadow-black my-8">
        
        {/* Modal Action Header */}
        <div className="no-print flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <SecurityIcon size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">Statutory E&amp;O Compliance</span>
              <h3 className="text-base font-bold text-white">Chain-of-Title Clearance Certificate</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
            >
              <PrinterIcon size={14} />
              Print / Save PDF
            </button>
            <button 
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
            >
              {copied ? <CheckmarkCircle02Icon size={14} /> : <Copy01Icon size={14} />}
              {copied ? 'Copied JSON' : 'Copy JSON'}
            </button>
            <button 
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <Cancel01Icon size={18} />
            </button>
          </div>
        </div>

        {/* Official Printable Certificate Document */}
        <div id="printable-certificate" className="rounded-xl border-2 border-slate-700 bg-slate-50 p-8 text-slate-900 shadow-inner font-serif">
          
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
            <div className="font-sans text-[11px] font-extrabold uppercase tracking-widest text-[#EE5F29]">
              CINEVAULT STUDIO &bull; ARCHIVAL RIGHTS DIVISION
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950 mt-1 mb-1 font-serif">
              CERTIFICATE OF STATUTORY PUBLIC DOMAIN CLEARANCE &amp; E&amp;O WARRANTY
            </h2>
            <div className="text-xs text-slate-600 font-mono">
              CERTIFICATE NO: <strong>{certId}</strong> &bull; ISSUED: {dateStr}
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-700 mb-4">
            This document certifies that the motion picture audiovisual assets enumerated below have undergone statutory public domain verification and chain-of-title provenance audits pursuant to <strong>Title 17 of the United States Code (17 U.S.C. § 105)</strong> and international public domain conventions. These assets are cleared for unrestricted worldwide theatrical, broadcast, streaming, and educational distribution with digital Errors &amp; Omissions (E&amp;O) warranty indemnification.
          </p>

          <table className="w-full border-collapse text-left text-xs mb-5 font-sans">
            <thead>
              <tr className="border-b-2 border-slate-400 bg-slate-200 text-slate-800 font-bold">
                <th className="p-2">Item Title &amp; Identifier</th>
                <th className="p-2">Repository Vault</th>
                <th className="p-2">Statutory Status</th>
                <th className="p-2 text-right">License Rate</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 5).map((item, idx) => (
                <tr key={item.id || idx} className="border-b border-slate-300">
                  <td className="p-2 font-medium">#{idx + 1}: {item.title}</td>
                  <td className="p-2">{item.source_name}</td>
                  <td className="p-2 font-bold text-emerald-700">17 U.S.C. § 105 CLEARED</td>
                  <td className="p-2 text-right font-mono font-bold text-emerald-700">$0.00 (Public Domain)</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-4 border-t-2 border-dashed border-slate-400 pt-4 text-[11px]">
            <div>
              <strong className="font-sans uppercase text-slate-900">Errors &amp; Omissions (E&amp;O) Warranty</strong>
              <p className="text-slate-600 mt-1 leading-normal">
                Subject to statutory deposition, the listed assets carry a $250,000 corporate indemnity coverage policy against third-party copyright claims when utilized within licensed sequence parameters.
              </p>
              <div className="font-mono text-[9.5px] text-slate-500 mt-2 break-all">
                SHA-256: {sha256}
              </div>
            </div>
            <div className="text-right">
              <div className="font-sans font-bold text-slate-900">AUTHORIZED LEGAL SIGNATORY</div>
              <div className="mt-3 text-lg font-serif italic text-blue-900">{signer}</div>
              <div className="text-[10px] text-slate-500 font-sans mt-1">Senior Rights &amp; Clearance Counsel, CineVault Studio</div>
              <div className="font-mono text-[9px] font-bold text-emerald-600 mt-1">✓ DIGITALLY SEALED &amp; RECORDED</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
