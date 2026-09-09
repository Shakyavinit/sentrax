import React, { useState } from 'react';
import { Shield, Lock, Mail, Radio } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

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
      setError(err.response?.data?.detail || 'Authentication failed. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background surveillance radar effect */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-500/10 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full border border-cyan-500/10 pointer-events-none" />

      <div className="w-full max-w-md rounded-xl bg-[#080D1A] border border-slate-800 p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400 mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-wider text-white">SENTRAX</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Gujarat Police CCTV Intelligence Platform
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-cyan-400 font-mono">
            <Radio className="w-3 h-3 animate-pulse" /> RESTRICTED LAW ENFORCEMENT PORTAL
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/30 border border-red-900/50 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Officer / Command Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Secure Key / Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:border-cyan-500 outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow transition duration-150 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Authorize Terminal'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center font-mono">
          Gujarat Sentinel Hackathon • Milestone 1
        </div>
      </div>
    </div>
  );
};
