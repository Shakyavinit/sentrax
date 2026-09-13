import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Search,
  Route,
  ShieldAlert,
  Archive,
  Eye,
  Camera,
  BarChart3,
  FileText,
  Bot,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Car,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useAlertStore } from '../../store/alertStore';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const { unreadCount } = useAlertStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'INTELLIGENCE',
      items: [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/live', label: 'Live Monitor', icon: Video },
        { path: '/investigation', label: 'Investigation', icon: Search },
        { path: '/vehicles/details/GJ01AB1234', label: 'Vehicle Dossier', icon: Car },
        { path: '/journey', label: 'Vehicle Journey', icon: Route },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          path: '/alerts',
          label: 'Alerts',
          icon: ShieldAlert,
          badge: 260,
        },
        { path: '/watchlist', label: 'Watchlist', icon: Eye },
        { path: '/evidence', label: 'Evidence Vault', icon: Archive },
        { path: '/cameras', label: 'Camera Registry', icon: Camera },
      ],
    },
    {
      title: 'REPORTS',
      items: [
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/analytics', label: 'Audit Trail', icon: FileText },
      ],
    },
    {
      title: 'TOOLS',
      items: [
        { path: '/research-agent', label: 'Research Agent', icon: Bot },
        { path: '/cameras', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-[#070B11] border-r border-[#142030] flex flex-col transition-all duration-200 ${
        sidebarCollapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Top Header & Logo */}
      <div className="h-[52px] border-b border-[#142030] flex items-center justify-between px-3">
        <NavLink to="/" className="flex items-center gap-2 overflow-hidden">
          <Logo collapsed={sidebarCollapsed} className={sidebarCollapsed ? 'h-6 w-6' : 'h-7'} />
        </NavLink>
        <button
          onClick={toggleSidebar}
          className="text-[#8FA8C0] hover:text-[#E8EFF7] p-1 rounded hover:bg-[#121E2E] hidden lg:block"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 min-h-0 py-2.5 px-2 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1C2E42]">
        {navSections.map((sec) => (
          <div key={sec.title}>
            {!sidebarCollapsed && (
              <div className="px-2.5 pb-1 text-[9px] font-mono tracking-wider text-[#4D6B85] uppercase font-bold">
                {sec.title}
              </div>
            )}
            <nav className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center h-8 px-2.5 rounded-[6px] text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#0E7FE0] text-white font-semibold shadow-[0_0_12px_rgba(14,127,224,0.35)]'
                          : 'text-[#8FA8C0] hover:text-[#E8EFF7] hover:bg-[#0D1520]'
                      } ${sidebarCollapsed ? 'justify-center px-0' : 'gap-2.5'}`
                    }
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    {!sidebarCollapsed && item.badge && (
                      <span className="ml-auto bg-[#FF3B3B] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* System Status Widget */}
      {!sidebarCollapsed && (
        <div className="mx-2 mb-2 p-2.5 rounded-lg bg-[#0A1017] border border-[#162536] text-[10px] font-mono shadow-inner shrink-0">
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="text-[#8FA8C0] flex items-center gap-1.5">
              <span>⚙️</span> AI Engine
            </span>
            <span className="text-[#00C875] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] shadow-[0_0_6px_#00C875] animate-pulse" />
              Running
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#4D6B85] pt-0.5">
            <span>YOLOv8 + LPR</span>
            <span className="text-[#8FA8C0]">25 FPS Active</span>
          </div>
        </div>
      )}

      {/* User Info & Logout Footer */}
      <div className="p-2 border-t border-[#142030] bg-[#070B11] shrink-0">
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between px-1'}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#0E7FE0] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                AD
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-[#E8EFF7] truncate">
                  {user?.username || 'admin'}
                </div>
                <div className="text-[10px] font-sans text-[#8FA8C0] truncate">
                  Administrator
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 text-[#8FA8C0] hover:text-[#FF3B3B] hover:bg-[#121E2E] rounded transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
