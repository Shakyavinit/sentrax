import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, Bot } from 'lucide-react';
import { CopilotModal } from '../ui/CopilotModal';
import { useUiStore } from '../../store/uiStore';
const titles: Record<string, string> = { '/': 'Overview', '/live': 'Camera monitor', '/investigation': 'Vehicle search', '/journey': 'Journey reconstruction', '/alerts': 'Alert review', '/watchlist': 'Watchlist', '/evidence': 'Evidence vault', '/cameras': 'Camera registry', '/analytics': 'Analytics', '/research-agent': 'Research assistant' };
export const TopBar: React.FC = () => {
  const { pathname } = useLocation(), navigate = useNavigate();
  const { mobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const [query, setQuery] = useState(''), [copilot, setCopilot] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.current?.focus(); } };
    window.addEventListener('keydown', shortcut); return () => window.removeEventListener('keydown', shortcut);
  }, []);
  return <header className="app-topbar">
    <div className="topbar-context"><button className="mobile-menu icon-button" aria-label="Open navigation" aria-expanded={mobileMenuOpen} aria-controls="primary-navigation" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu size={20}/></button>
      <span className="topbar-product">Workspace /</span><strong>{titles[pathname] || 'Vehicle dossier'}</strong></div>
    <form className="global-search" onSubmit={e => { e.preventDefault(); if (query.trim()) { navigate(`/investigation?plate=${encodeURIComponent(query.trim().toUpperCase())}`); setQuery(''); } }}>
      <Search size={16}/><input ref={input} aria-label="Search registration plate" placeholder="Search a registration plate…" value={query} onChange={e => setQuery(e.target.value)} /><kbd>⌘ K</kbd>
    </form>
    <div className="topbar-actions"><button className="icon-button" aria-label="Open alert review" onClick={() => navigate('/alerts')}><Bell size={19}/></button><button className="icon-button" aria-label="Open investigation assistant" onClick={() => setCopilot(true)}><Bot size={19}/></button></div>
    <CopilotModal isOpen={copilot} onClose={() => setCopilot(false)} />
  </header>;
};
