import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cctv,
  Activity,
  MapPin,
  Search,
  ShieldAlert,
  Bell,
  Briefcase,
  Archive,
  FileText,
  Settings,
  Radio,
  Video
} from 'lucide-react';
import { useAlertStream } from '../context/WebSocketContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badgeCount?: number;
}

export const Sidebar: React.FC = () => {
  const { recentAlerts, isConnected } = useAlertStream();

  const navigation: NavItem[] = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Camera Network', path: '/cameras', icon: Cctv },
    { name: 'Video Sources', path: '/sources', icon: Video },
    { name: 'Live Intelligence', path: '/live', icon: Activity },
    { name: 'GIS Map', path: '/map', icon: MapPin },
    { name: 'Vehicle Search', path: '/search', icon: Search },
    { name: 'Watchlist', path: '/watchlist', icon: ShieldAlert },
    { name: 'Alerts', path: '/alerts', icon: Bell, badgeCount: recentAlerts.length },
    { name: 'Investigations', path: '/investigations', icon: Briefcase },
    { name: 'Evidence Vault', path: '/evidence', icon: Archive },
    { name: 'Audit Logs', path: '/audit', icon: FileText },
    { name: 'Administration', path: '/admin', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#080D1A] border-r border-slate-800/80 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80 gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-wider text-slate-100">SENTRAX</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                HQ Core
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Gujarat Sentinel</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border-l-2 border-cyan-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span className="px-1.5 py-0.2 bg-red-500/20 border border-red-500/40 text-red-400 rounded text-[10px] font-bold">
                    {item.badgeCount}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Gateway Link Status & Build Badge */}
      <div className="p-3.5 border-t border-slate-800/80 bg-[#060A14] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Gateway Relay</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-red-500 animate-pulse'
              }`}
            />
            <span className={isConnected ? 'text-emerald-400 font-mono font-semibold' : 'text-red-400 font-mono font-semibold'}>
              {isConnected ? 'LIVE WS' : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        {/* Build Badge */}
        <div className="pt-2 border-t border-slate-800/40 flex flex-col gap-1 text-[10px] font-mono">
          <div className="flex items-center justify-between">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold">
              BUILD: v1.0.0-m1
            </span>
            <span className="text-slate-400">2026.09.09</span>
          </div>
          <div className="text-slate-500 text-[9px] flex justify-between">
            <span>STORAGE CAP</span>
            <span className="text-slate-400">500M / 1000M</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
