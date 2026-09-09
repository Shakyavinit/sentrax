import React from 'react';
import { Shield, User, LogOut, Radio, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlertStream } from '../context/WebSocketContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected, recentAlerts } = useAlertStream();

  return (
    <header className="h-14 bg-[#111827] border-b border-[#1F293D] px-5 flex items-center justify-between z-10 shrink-0">
      {/* Brand & Division Label */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <span className="text-xs font-bold tracking-wider text-slate-100 uppercase">
              SENTRAX
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-400 ml-2 font-mono">
              GUJARAT POLICE SURVEILLANCE & FORENSICS CORE
            </span>
          </div>
        </div>
      </div>

      {/* System Status & Auth */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Realtime WS Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0F17] border border-[#1F293D] text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
            }`}
          />
          <span className={isConnected ? 'text-slate-300' : 'text-red-400'}>
            {isConnected ? 'GATEWAY: ONLINE' : 'GATEWAY: RECONNECTING'}
          </span>
        </div>

        {/* Notifications / Alerts Count */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0B0F17] border border-[#1F293D] text-[11px] font-mono text-slate-300">
          <Bell className="w-3.5 h-3.5 text-slate-400" />
          <span className={recentAlerts.length > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
            {recentAlerts.length}
          </span>
        </div>

        {/* Operator Profile */}
        {user ? (
          <div className="flex items-center gap-2.5 pl-3 border-l border-[#1F293D]">
            <div className="text-right hidden md:block">
              <div className="text-xs font-medium text-slate-200 leading-tight">
                {user.full_name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {user.role} {user.badge_number ? `• ${user.badge_number}` : ''}
              </div>
            </div>
            <div className="w-7 h-7 rounded bg-[#1C2638] border border-[#1F293D] flex items-center justify-center text-slate-300 text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#1C2638] rounded transition-colors duration-150"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-amber-400 font-mono">STANDBY / UNAUTHENTICATED</div>
        )}
      </div>
    </header>
  );
};
