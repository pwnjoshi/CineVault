'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserSession } from '@/lib/types';
import { 
  Film01Icon, 
  PlayIcon, 
  Moon02Icon,
  Sun01Icon,
  UserCircleIcon
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
      setUser(null);
    }

    const savedTheme = localStorage.getItem('cinevault_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('cinevault_theme', next);
    if (next === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
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
      roleTitle: 'Lead Archival Editor & Colorist',
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
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.08] bg-[#0b0c0e]/95 px-6 py-3 backdrop-blur-md transition-colors">
      {/* Brand Identity */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 text-white no-underline transition hover:opacity-95">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm">
            <Film01Icon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-base">CineVault</span>
              <span className="rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider text-orange-400 border border-orange-500/25">STUDIO</span>
            </div>
          </div>
        </Link>
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-slate-400 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>15 Institutional Vaults &bull; Public Domain Provenance</span>
        </div>
      </div>

      {/* Nav Actions & Profile */}
      <div className="flex items-center gap-2.5">
        <button 
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 transition hover:border-white/20 hover:text-white"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun01Icon size={15} /> : <Moon02Icon size={15} />}
        </button>

        <Link 
          href="/"
          className="hidden sm:inline-flex rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
        >
          Overview
        </Link>

        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-500"
        >
          <PlayIcon size={13} />
          <span>Studio Workspace</span>
        </Link>

        <a 
          href="/premiere/index.html" 
          target="_blank" 
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20"
        >
          <span className="font-mono font-bold text-[10px] text-purple-400">Pr</span>
          <span>Premiere Panel</span>
        </a>

        {/* Demo Editor Profile */}
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-1 pr-2.5 text-xs text-white transition hover:border-white/20"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-600 font-bold text-white text-[10px]">
                {user.avatar || 'PJ'}
              </div>
              <span className="font-medium hidden sm:inline text-xs">{user.name}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/15 bg-[#16181e] p-2 shadow-2xl shadow-black/80 z-50 font-sans">
                <div className="border-b border-white/10 px-3 py-2 text-xs">
                  <div className="font-bold text-white">{user.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                  <div className="mt-1 inline-block rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-mono text-emerald-300 border border-emerald-500/25">
                    {user.roleTitle || 'Lead Archival Editor'}
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
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            <UserCircleIcon size={14} className="text-slate-400" />
            <span>Editor Profile</span>
          </button>
        )}
      </div>
    </header>
  );
}
