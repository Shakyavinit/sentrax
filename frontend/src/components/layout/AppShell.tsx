import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useUiStore } from '../../store/uiStore';
import { DEMO_MODE } from '../../utils/demo';
import { Toaster } from 'sonner';
import { IncidentNotepad } from '../common/IncidentNotepad';
import { CopilotModal } from '../ui/CopilotModal';
import { Bot } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const [globalCopilotOpen, setGlobalCopilotOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname, setMobileMenuOpen]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
    window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close);
  }, [setMobileMenuOpen]);
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    {mobileMenuOpen && <button className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} aria-label="Dismiss navigation" />}
    <Sidebar />
    <div className={`app-workspace ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
      <TopBar />
      {DEMO_MODE && <div className="workspace-notice"><strong>DEMO WORKSPACE</strong><span>Fictional records · Prerecorded footage · Changes saved on this device only · No police systems connected</span></div>}
      <main id="main-content" className="app-content" tabIndex={-1}><Outlet /></main>
    </div>

    {/* Global Floating AI Copilot Trigger */}
    <button
      onClick={() => setGlobalCopilotOpen(true)}
      className="fixed bottom-5 right-40 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full shadow-[0_0_20px_rgba(14,127,224,0.4)] transition text-xs font-mono font-bold bg-[#0E7FE0] hover:bg-[#1A9FFF] text-white hover:scale-105 border border-white/20 cursor-pointer"
      title="Open Forensic AI Copilot"
    >
      <Bot size={15} className="animate-pulse" />
      <span className="hidden sm:inline">AI COPILOT</span>
      <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] animate-ping" />
    </button>

    <IncidentNotepad />
    <CopilotModal isOpen={globalCopilotOpen} onClose={() => setGlobalCopilotOpen(false)} />
    <Toaster theme="dark" position="bottom-right" />
  </div>;
};

