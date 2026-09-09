import React, { useState } from 'react';
import { Settings, UserPlus, ShieldCheck } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Administration: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    badge_number: '',
    department: 'Gujarat Police',
    role: 'OFFICER',
  });
  const [msg, setMsg] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMsg('');
      await api.post('/auth/users', form);
      setMsg(`Officer account ${form.email} created successfully.`);
      setForm({
        email: '',
        password: '',
        full_name: '',
        badge_number: '',
        department: 'Gujarat Police',
        role: 'OFFICER',
      });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create officer account');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">System Administration &amp; Access Control</h2>
        <p className="text-xs text-slate-400 mt-1">
          Role-Based Access Control (RBAC), operator credential management, and platform policies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-lg bg-[#080D1A] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <UserPlus className="w-4 h-4 text-cyan-400" />
            <span>Provision Police Officer / Analyst Account</span>
          </div>

          {msg && (
            <div className="p-3 rounded bg-emerald-950/20 border border-emerald-800 text-emerald-300 text-xs font-mono">
              {msg}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Official Police Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="officer@sentrax.gujarat.gov.in"
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Full Name &amp; Rank</label>
                <input
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Insp. R. V. Patel"
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Badge Number</label>
                <input
                  required
                  value={form.badge_number}
                  onChange={(e) => setForm({ ...form, badge_number: e.target.value })}
                  placeholder="GJ-AHM-9021"
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Role / Authority</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                >
                  <option value="OFFICER">OFFICER (Field View &amp; Alerts)</option>
                  <option value="ANALYST">ANALYST (Video &amp; Forensics)</option>
                  <option value="INVESTIGATOR">INVESTIGATOR (Watchlist &amp; Cases)</option>
                  <option value="SUPERVISOR">SUPERVISOR (Camera Mgmt)</option>
                  <option value="ADMIN">ADMIN (Full Authority)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Department</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow"
            >
              Provision Account
            </button>
          </form>
        </div>

        <div className="p-5 rounded-lg bg-[#080D1A] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Active Session &amp; Authority State</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300 font-mono">
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500">Operator Identity: </span>
              <span className="text-slate-200">{user?.full_name || 'Guest / Unauthenticated'}</span>
            </div>
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500">Role &amp; Clearance: </span>
              <span className="text-cyan-400 font-bold">{user?.role || 'None'}</span>
            </div>
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500">Badge Identifier: </span>
              <span className="text-slate-200">{user?.badge_number || 'N/A'}</span>
            </div>
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500">Security Standard: </span>
              <span className="text-emerald-400">JWT HS256 + Argon2/Bcrypt + SHA-256</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
