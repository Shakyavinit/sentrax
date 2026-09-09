import React, { useState } from 'react';
import { Shield, Lock, Mail } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('command@sentrax.gujarat.gov.in');
  const [password, setPassword] = useState('SentinelAdmin2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/login/json', { email, password });
      login(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Verify officer credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-[#111827] border border-[#1F293D] p-7 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded bg-blue-600/15 border border-blue-500/30 mx-auto flex items-center justify-center text-blue-400 mb-3">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-base font-bold tracking-wider text-slate-100 uppercase">
            SENTRAX INTELLIGENCE CORE
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            GUJARAT POLICE SURVEILLANCE &amp; FORENSICS PLATFORM
          </p>
          <div className="mt-2.5 inline-block">
            <StatusBadge status="warning" label="RESTRICTED LAW ENFORCEMENT ACCESS" size="sm" showDot={false} />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-red-950/30 border border-red-900/50 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 font-semibold">
              Officer Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1 font-semibold">
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-sm-panel bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs tracking-wider uppercase transition flex items-center justify-center gap-2"
            >
              <span>{loading ? 'AUTHENTICATING...' : 'ACCESS COMMAND CONSOLE'}</span>
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[#1F293D] text-center text-[10px] font-mono text-slate-500">
          AUTHORIZED PERSONNEL ONLY • AUDIT TRAIL ACTIVE
        </div>
      </div>
    </div>
  );
};
