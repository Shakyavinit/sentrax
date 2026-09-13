import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Sun, ChevronDown, ChevronRight, Menu } from 'lucide-react';
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
  const [currentTime, setCurrentTime] = useState('Mon Sep 14, 2026  1:08 AM');

  useEffect(() => {
    const updateDateTime = () => {
      const d = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };
      setCurrentTime(d.toLocaleString('en-US', options).replace(',', ''));
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/live')) {
      return { parent: 'Live Monitor', child: 'Camera Analysis' };
    }
    if (path.startsWith('/investigation')) {
      return { parent: 'Investigation', child: 'Vehicle Reconstruction' };
    }
    if (path.startsWith('/journey')) return { parent: 'Investigation', child: 'Vehicle Journey' };
    if (path.startsWith('/vehicles/details')) return { parent: 'Investigation', child: 'Vehicle Dossier' };
    if (path.startsWith('/evidence')) return { parent: 'Operations', child: 'Evidence Vault' };
    if (path.startsWith('/watchlist')) return { parent: 'Operations', child: 'Target Watchlist' };
    if (path.startsWith('/alerts')) return { parent: 'Operations', child: 'Active Alerts' };
    if (path.startsWith('/cameras')) return { parent: 'Operations', child: 'Camera Registry' };
    if (path.startsWith('/analytics')) return { parent: 'Reports', child: 'Analytics & Metrics' };
    return { parent: 'Sentrax', child: 'Platform' };
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/investigation?plate=${encodeURIComponent(searchInput.trim().toUpperCase())}`);
      setSearchInput('');
    }
  };

  const crumbs = getBreadcrumbs();

  return (
    <header className="h-[52px] bg-[#070B11] border-b border-[#142030] flex items-center justify-between px-5 z-20 sticky top-0">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-sans select-none">
        <Menu className="w-4 h-4 text-[#8FA8C0] cursor-pointer" />
        <span className="text-[#8FA8C0] font-medium">{crumbs.parent}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#324860]" />
        <span className="text-white font-semibold">{crumbs.child}</span>
      </div>

      {/* Center: Global Search */}
      <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-xl mx-6 relative">
        <Search className="w-3.5 h-3.5 absolute left-3.5 text-[#4D6B85]" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
          placeholder="Search plate number, vehicle, camera, location..."
          className="w-full bg-[#0B131E] border border-[#162536] focus:border-[#0E7FE0] rounded-lg pl-9 pr-16 py-1.5 text-xs text-[#E8EFF7] placeholder-[#4D6B85] focus:outline-none font-sans shadow-inner transition-colors"
        />
        <span className="absolute right-2.5 text-[10px] font-mono text-[#627D98] bg-[#0F1B2B] px-1.5 py-0.5 rounded border border-[#1C2E42]">
          Ctrl + K
        </span>
      </form>

      {/* Right: Status Pill, Time, Bell, Theme, User */}
      <div className="flex items-center gap-4">
        {/* System Online badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C875]/10 border border-[#00C875]/30">
          <span className="w-2 h-2 rounded-full bg-[#00C875] shadow-[0_0_8px_#00C875] animate-pulse" />
          <span className="text-xs font-sans font-medium text-[#00C875]">System Online</span>
        </div>

        {/* Date / Time */}
        <span className="text-xs font-mono text-[#8FA8C0] hidden xl:inline">
          {currentTime}
        </span>

        {/* Alert Bell with badge */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-1 text-[#8FA8C0] hover:text-white transition-colors"
          aria-label="View Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF3B3B] text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center shadow-md">
            {unreadCount > 0 ? unreadCount : 12}
          </span>
        </button>

        {/* Sun / Theme icon */}
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="p-1 text-[#8FA8C0] hover:text-white transition-colors"
          title="Toggle Theme / Copilot"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* User avatar dropdown */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-[#0E7FE0] text-white font-mono font-bold text-xs flex items-center justify-center shadow-sm">
            {user?.username?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <span className="text-xs font-sans font-medium text-white hidden sm:inline">Admin</span>
          <ChevronDown className="w-3 h-3 text-[#8FA8C0]" />
        </div>
      </div>

      <CopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </header>
  );
};
