import React, { useState } from 'react';
import { Settings, UserPlus, ShieldCheck, Key } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';

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
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMsg('');
      setErrorMsg('');
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
      setErrorMsg(err.response?.data?.detail || 'Failed to provision officer account');
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="System Administration & Role-Based Access Control"
        category="SYSTEM / ACCESS CONTROL & POLICIES"
        description="Provision police analyst and officer credentials, enforce RBAC roles, and manage digital forensic custody permissions."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Provision User Account */}
        <div className="p-4 rounded-lg bg-[#111827] border border-[#1F293D] space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-200 border-b border-[#1F293D] pb-3">
            <UserPlus className="w-4 h-4 text-blue-400" />
            <span>Provision Police Officer Account</span>
          </div>

          {msg && (
            <div className="p-3 rounded bg-emerald-950/20 border border-emerald-800 text-emerald-300 text-xs font-mono">
              {msg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded bg-red-950/20 border border-red-800 text-red-300 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Official Email
              </label>
              <input
                type="email"
                required
                placeholder="officer@sentrax.gujarat.gov.in"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Inspector V. K. Jadeja"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Badge Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="GJ-AHM-408"
                  value={form.badge_number}
                  onChange={(e) => setForm({ ...form, badge_number: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Role Tier
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-200"
                >
                  <option value="OFFICER">Field Officer / Analyst</option>
                  <option value="OPERATOR">Console Operator</option>
                  <option value="ADMIN">Command Center Admin</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
              >
                Provision Officer Account
              </button>
            </div>
          </form>
        </div>

        {/* Current Active Session & RBAC Policy */}
        <div className="p-4 rounded-lg bg-[#111827] border border-[#1F293D] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-200 border-b border-[#1F293D] pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Active Command Session Policy</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-[#161F30] border border-[#1F293D]">
              <span className="text-slate-400 block text-[10px]">AUTHENTICATED OPERATOR</span>
              <span className="text-slate-200 font-bold">{user?.full_name} ({user?.email})</span>
            </div>
            <div className="p-2.5 rounded bg-[#161F30] border border-[#1F293D]">
              <span className="text-slate-400 block text-[10px]">ASSIGNED JURISDICTION</span>
              <span className="text-slate-200 font-bold">{user?.department || 'Gujarat Police HQ'}</span>
            </div>
            <div className="p-2.5 rounded bg-[#161F30] border border-[#1F293D]">
              <span className="text-slate-400 block text-[10px]">CRYPTOGRAPHIC ALGORITHM</span>
              <span className="text-slate-200 font-bold">SHA-256 (FIPS 180-4 Standard)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
