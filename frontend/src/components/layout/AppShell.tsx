import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useUiStore } from '../../store/uiStore';
import { DEMO_MODE } from '../../utils/demo';
import { Toaster } from 'sonner';
import { IncidentNotepad } from '../common/IncidentNotepad';
import { IntroCinematicModal } from '../common/IntroCinematicModal';

export const AppShell: React.FC = () => {
  const { sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen, introModalOpen, setIntroModalOpen } = useUiStore();
  const location = useLocation();

  useEffect(() => {
    // Check if user has already seen the intro in this browser
    const seen = localStorage.getItem('sentrax_intro_dismissed');
    if (!seen) {
      setIntroModalOpen(true);
    }
  }, [setIntroModalOpen]);

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
    <IncidentNotepad />
    <IntroCinematicModal isOpen={introModalOpen} onClose={() => setIntroModalOpen(false)} />
    <Toaster theme="dark" position="bottom-right" />
  </div>;
};

