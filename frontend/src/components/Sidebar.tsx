import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  Cctv,
  MapPin,
  Search,
  ShieldAlert,
  Bell,
  GitMerge,
  Briefcase,
  Archive,
  Activity,
  FileText,
  Settings,
  Video,
} from 'lucide-react';
import { useAlertStream } from '../context/WebSocketContext';

interface NavSection {
  title: string;
  items: {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeCount?: number;
  }[];
}

export const Sidebar: React.FC = () => {
  const { isConnected, recentAlerts } = useAlertStream();

  const navSections: NavSection[] = [
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Command Center', path: '/', icon: LayoutDashboard },
        { name: 'Live Intelligence', path: '/live', icon: Radio },
        { name: 'Camera Network', path: '/cameras', icon: Cctv },
        { name: 'Video Feeds', path: '/sources', icon: Video },
        { name: 'GIS Map Grid', path: '/map', icon: MapPin },
      ],
    },
    {
      title: 'INVESTIGATION',
      items: [
        { name: 'Vehicle Search', path: '/search', icon: Search },
        { name: 'Watchlist Registry', path: '/watchlist', icon: ShieldAlert },
        {
          name: 'Intercept Alerts',
          path: '/alerts',
          icon: Bell,
          badgeCount: recentAlerts.length,
        },
        { name: 'Cross-Camera Track', path: '/search?mode=tracking', icon: GitMerge },
        { name: 'Investigations', path: '/investigations', icon: Briefcase },
        { name: 'Evidence Vault', path: '/evidence', icon: Archive },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Stream Telemetry', path: '/sources', icon: Activity },
        { name: 'Audit Logs', path: '/audit', icon: FileText },
        { name: 'Administration', path: '/admin', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-[#111827] border-r border-[#1F293D] flex flex-col justify-between h-screen shrink-0 select-none">
      {/* Scrollable Nav Area */}
      <div className="flex-1 overflow-y-auto py-3">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="mb-4">
            <div className="px-4 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              {section.title}
            </div>
            <nav className="mt-1 space-y-0.5 px-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name + item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-1.5 rounded-sm-panel text-xs transition-colors duration-150 font-medium ${
                        isActive
                          ? 'bg-[#1C2638] text-slate-100 border-l-2 border-blue-500 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#161F30]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badgeCount && item.badgeCount > 0 ? (
                      <span className="px-1.5 py-0.2 bg-red-950/40 border border-red-800/60 text-red-400 rounded text-[10px] font-mono font-bold">
                        {item.badgeCount}
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* System Gateway Link Status & Build Badge */}
      <div className="p-3 border-t border-[#1F293D] bg-[#0E1522] space-y-2 shrink-0">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Gateway Relay</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span
              className={`font-mono text-[10px] ${
                isConnected ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Build Badge & Quota */}
        <div className="pt-2 border-t border-[#1F293D] flex flex-col gap-1 text-[10px] font-mono">
          <div className="flex items-center justify-between">
            <span className="px-1.5 py-0.5 rounded bg-[#161F30] border border-[#1F293D] text-slate-300 font-semibold">
              BUILD: v1.0.0-m1
            </span>
            <span className="text-slate-400">2026.09.09</span>
          </div>
          <div className="text-slate-400 text-[9px] flex justify-between">
            <span>STORAGE CAP</span>
            <span className="text-slate-300">500MB / 1000MB</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
