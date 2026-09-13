import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useAlertStore } from '../../store/alertStore';
import { useAuthStore } from '../../store/authStore';
import { CopilotModal } from '../ui/CopilotModal';

export const TopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useAlertStore();
  const { user } = useAuthStore();
  const [searchInput, setSearchInput] = useState('');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return 'INTELLIGENCE / DASHBOARD';
    if (path.startsWith('/live')) return 'INTELLIGENCE / LIVE MONITOR';
    if (path.startsWith('/investigation')) return 'INVESTIGATION / VEHICLE RECONSTRUCTION';
    if (path.startsWith('/journey')) return 'INVESTIGATION / VEHICLE JOURNEY';
    if (path.startsWith('/evidence')) return 'FORENSICS / EVIDENCE VAULT';
    if (path.startsWith('/watchlist')) return 'OPERATIONS / TARGET WATCHLIST';
    if (path.startsWith('/alerts')) return 'OPERATIONS / ACTIVE ALERTS';
    if (path.startsWith('/cameras')) return 'INFRASTRUCTURE / CAMERA REGISTRY';
    if (path.startsWith('/analytics')) return 'INTELLIGENCE / REPORTS & METRICS';
    return 'SENTRAX PLATFORM';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/investigation?plate=${encodeURIComponent(searchInput.trim().toUpperCase())}`);
      setSearchInput('');
    }
  };

  return (
    <header className="h-[52px] bg-[#0D1520] border-b border-[#1C2E42] flex items-center justify-between px-6 z-20 sticky top-0">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono tracking-widest text-[#8FA8C0] uppercase">
          {getBreadcrumbs()}
        </span>
      </div>

      {/* Center: Global Search */}
      <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-xl mx-6 relative">
        <Search className="w-4 h-4 absolute left-3.5 text-[#4D6B85]" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
          placeholder="Search vehicle plate, camera, location or case... (e.g. GJ01AB1234)"
          className="w-full bg-[#0A1017] border border-[#1F334D] focus:border-[#0E7FE0] rounded-lg pl-10 pr-9 py-1.5 text-xs text-[#E8EFF7] placeholder-[#4D6B85] focus:outline-none font-mono uppercase shadow-inner transition-colors"
        />
        <span className="absolute right-2.5 text-[10px] font-mono text-[#8FA8C0] bg-[#121E2E] px-1.5 py-0.5 rounded border border-[#233A52]">
          /
        </span>
      </form>

      {/* Right: AI Copilot, Security Badge, Alerts Bell & User Avatar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="flex items-center gap-1.5 text-xs font-mono font-bold text-white bg-gradient-to-r from-[#0E7FE0] to-[#1A9FFF] hover:opacity-95 px-3 py-1.5 rounded-lg border border-[#2E4E70] shadow-[0_0_15px_rgba(14,127,224,0.35)] transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          <span>AI COPILOT</span>
          <span className="text-[9px] bg-white/20 px-1 py-0.2 rounded font-bold ml-0.5">BETA</span>
        </button>

        {/* SECURE FORENSIC MODE */}
        <div className="hidden sm:flex items-center gap-2 text-left px-2.5 py-1 rounded-lg bg-[#00C875]/10 border border-[#00C875]/30">
          <span className="w-2 h-2 rounded-full bg-[#00C875] shadow-[0_0_6px_#00C875] animate-pulse" />
          <div>
            <div className="text-[10px] font-mono font-bold text-[#00C875] uppercase leading-tight">
              SECURE FORENSIC MODE
            </div>
            <div className="text-[9px] font-mono text-[#8FA8C0] leading-tight">
              All systems operational
            </div>
          </div>
        </div>

        {/* Alert Bell with badge */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 text-[#8FA8C0] hover:text-[#E8EFF7] hover:bg-[#121E2E] rounded-lg border border-transparent hover:border-[#1C2E42] transition-colors cursor-pointer"
          aria-label="View Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF3B3B] text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center shadow-md">
            {unreadCount > 0 ? unreadCount : 3}
          </span>
        </button>

        {/* User avatar circle */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A2A3D] to-[#0D1522] border border-[#2E4E70] flex items-center justify-center text-xs font-mono font-bold text-white shadow-md">
          {user?.username?.slice(0, 2).toUpperCase() || 'AD'}
        </div>
      </div>

      <CopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </header>
  );
};
