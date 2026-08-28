'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserSession } from '@/lib/types';
import { 
  Film01Icon, 
  SparklesIcon, 
  Settings01Icon, 
  PlayIcon, 
  UserCircleIcon,
  Moon02Icon,
  Sun01Icon
} from 'hugeicons-react';

export default function Header() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('cinevault_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      }
    } else {
      // Default demo lead editor
      const demo: UserSession = {
        id: 'usr_demo_lead_editor',
        name: 'Pawan Joshi',
        email: 'joshipawan2021@gmail.com',
        avatar: 'PJ',
        role: 'LEAD_EDITOR',
        roleTitle: 'Lead Film Editor & Colorist',
        token: 'token_demo_lead_editor_active',
        provider: 'demo'
      };
      localStorage.setItem('cinevault_user', JSON.stringify(demo));
      setUser(demo);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const loginDemo = () => {
    const demo: UserSession = {
      id: 'usr_demo_lead_editor',
      name: 'Pawan Joshi',
      email: 'joshipawan2021@gmail.com',
      avatar: 'PJ',
      role: 'LEAD_EDITOR',
      roleTitle: 'Lead Film Editor & Colorist',
      token: 'token_demo_lead_editor_active',
      provider: 'demo'
    };
    localStorage.setItem('cinevault_user', JSON.stringify(demo));
    setUser(demo);
  };

  const handleSignOut = () => {
    localStorage.removeItem('cinevault_user');
    setUser(null);
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#090b10]/95 px-6 py-3 backdrop-blur-md">
      {/* Brand Identity */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 text-white no-underline transition hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EE5F29] text-white shadow-lg shadow-[#EE5F29]/30">
            <Film01Icon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-white text-base">CINEVAULT</span>
              <span className="rounded bg-[#EE5F29]/20 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-[#EE5F29] border border-[#EE5F29]/40">STUDIO</span>
            </div>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300 font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>15 Institutional Vaults &bull; 100% Cleared</span>
        </div>
      </div>

      {/* Nav Actions & Profile */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun01Icon size={14} /> : <Moon02Icon size={14} />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        <Link 
          href="/"
          className="hidden sm:inline-flex rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
        >
          Overview
        </Link>

        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#EE5F29] px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-[#EE5F29]/25 transition hover:brightness-110"
        >
          <PlayIcon size={13} />
          Studio Workspace
        </Link>

        <a 
          href="http://localhost:4000/premiere/" 
          target="_blank" 
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300 transition hover:bg-purple-500/20"
        >
          <span className="font-mono font-bold text-[11px] text-purple-400">Pr</span>
          Premiere Panel
        </a>

        {/* 1-Click Demo Lead Editor or Profile */}
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1.5 pr-3 text-xs text-white transition hover:border-white/20"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EE5F29] font-bold text-white text-[11px]">
                {user.avatar || 'PJ'}
              </div>
              <span className="font-medium hidden sm:inline">{user.name}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/15 bg-[#11141c] p-2 shadow-2xl shadow-black/80 z-50">
                <div className="border-b border-white/10 px-3 py-2 text-xs">
                  <div className="font-bold text-white">{user.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                  <div className="mt-1 inline-block rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                    {user.roleTitle || 'Lead Film Editor'}
                  </div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={loginDemo}
            className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            <SparklesIcon size={14} />
            ⚡ Demo Editor
          </button>
        )}
      </div>
    </header>
  );
}
