import React from 'react';
import { Shield, User, LogOut, Bell, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlertStream } from '../context/WebSocketContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useAlertStream();

  return (
    <header className="h-16 bg-[#080D1A] border-b border-slate-800/80 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h1 className="text-sm font-semibold tracking-wide text-slate-100">
            GUJARAT POLICE CCTV INTELLIGENCE &amp; FORENSIC PLATFORM
          </h1>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>State Cyber &amp; Surveillance Division</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Realtime Link Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-red-400 animate-pulse'}`} />
          <span className="text-slate-300">WS HUB</span>
        </div>

        {/* User Card */}
        {user ? (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="text-right">
              <div className="text-xs font-medium text-slate-200">{user.full_name}</div>
              <div className="text-[10px] text-cyan-400 font-mono">
                {user.role} {user.badge_number ? `• ${user.badge_number}` : ''}
              </div>
            </div>
            <div className="w-8 h-8 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <User className="w-4 h-4" />
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-amber-400 font-mono">STANDBY / AUTH REQUIRED</div>
        )}
      </div>
    </header>
  );
};
