import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, Bot, Grid3X3 } from 'lucide-react';
import { CopilotModal } from '../ui/CopilotModal';
import { useUiStore } from '../../store/uiStore';
const titles: Record<string, string> = {
  '/': 'Investigation Overview',
  '/live': 'Surveillance Camera Monitor',
  '/investigation': 'Vehicle Search & Sightings',
  '/journey': 'Vehicle Journey Reconstruction',
  '/alerts': 'Forensic Alert Review',
  '/watchlist': 'Surveillance Target Watchlist',
  '/evidence': 'Forensic Evidence Vault',
  '/audit': 'Forensic Audit Trail',
  '/cameras': 'Surveillance Camera Registry',
  '/analytics': 'Forensic Analytics & Intelligence',
  '/research-agent': 'Forensic Research Assistant',
  '/plate-reader': 'Plate & Vehicle AI Reader',
  '/grid': 'Tactical Camera Matrix (FLIR & Night-Vision)',
};

export const TopBar: React.FC = () => {
  const { pathname } = useLocation(), navigate = useNavigate();
  const { mobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const [query, setQuery] = useState(''), [copilot, setCopilot] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const getPageTitle = () => {
    if (titles[pathname]) return titles[pathname];
    if (pathname.startsWith('/vehicle')) return 'Vehicle Dossier';
    return 'Forensic Workspace';
  };

  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
      if (e.key === 'Escape' && document.activeElement === input.current) {
        input.current?.blur();
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);

  return (
    <header className="app-topbar">
      {/* Left: Mobile Menu + SOC Node Indicator + Full Page Title */}
      <div className="topbar-left flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          id="mobile-toggle"
          className="mobile-menu icon-button"
          aria-label="Open navigation"
          aria-expanded={mobileMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded tracking-wider uppercase font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AHMEDABAD SOC</span>
          </span>
          <span className="text-[#3a4454] font-mono text-sm shrink-0">/</span>
          <h1 className="text-white font-bold text-sm sm:text-base tracking-tight truncate font-sans">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Global Search Input & Action Icons */}
      <div className="topbar-right flex items-center justify-end gap-2.5 min-w-[120px]">
        <form
          className="global-search"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) {
              navigate(`/investigation?plate=${encodeURIComponent(query.trim().toUpperCase())}`);
              setQuery('');
            }
          }}
        >
          <Search size={15} />
          <input
            ref={input}
            aria-label="Search registration plate"
            placeholder="Search a registration plate…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>⌘ K</kbd>
        </form>

        <div className="topbar-actions flex items-center gap-2">
          <button
            className="icon-button"
            aria-label="Open alert review"
            onClick={() => navigate('/alerts')}
            title="Alert Review"
          >
            <Bell size={18} />
          </button>
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0C1420] hover:bg-[#121E30] text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] border border-cyan-500/50 hover:border-cyan-400 transition-all font-mono text-xs font-bold cursor-pointer"
            aria-label="Open Tactical Camera Matrix"
            onClick={() => navigate('/grid')}
            title="Tactical Multi-Camera Matrix with FLIR Thermal & Night-Vision"
          >
            <Grid3X3 size={15} className="text-cyan-400" />
            <span className="hidden md:inline">TACTICAL GRID</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)] border border-sky-400/60 transition-all font-mono text-xs font-bold cursor-pointer"
            aria-label="Open Forensic AI Copilot"
            onClick={() => setCopilot(true)}
            title="SENTRAX Forensic AI Copilot"
          >
            <Bot size={15} className="text-white animate-pulse" />
            <span className="hidden sm:inline">AI COPILOT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>
      </div>

      <CopilotModal isOpen={copilot} onClose={() => setCopilot(false)} />
    </header>
  );
};
