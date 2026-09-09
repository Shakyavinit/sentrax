import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2, Search, Car, AlertTriangle } from 'lucide-react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';

interface WatchlistItem {
  id: number;
  plate_number: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  owner_name?: string;
  fir_number?: string;
  case_reference?: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  is_active: boolean;
  created_at: string;
}

export const Watchlist: React.FC = () => {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    plate_number: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_color: '',
    fir_number: '',
    case_reference: '',
    category: 'SUSPECT_VEHICLE',
    priority: 'HIGH',
    reason: '',
  });

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/watchlist');
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to load watchlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/watchlist', form);
      setShowModal(false);
      setForm({
        plate_number: '',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_color: '',
        fir_number: '',
        case_reference: '',
        category: 'SUSPECT_VEHICLE',
        priority: 'HIGH',
        reason: '',
      });
      loadWatchlist();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add target to watchlist');
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm('Authorize removal of target from state active watchlist?')) return;
    try {
      await api.delete(`/watchlist/${id}`);
      loadWatchlist();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to remove target');
    }
  };

  const filtered = items.filter(
    (item) =>
      item.plate_number.toLowerCase().includes(search.toLowerCase()) ||
      (item.fir_number && item.fir_number.toLowerCase().includes(search.toLowerCase())) ||
      (item.reason && item.reason.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: Column<WatchlistItem>[] = [
    {
      header: 'Priority',
      accessor: (row) => <StatusBadge status={row.priority} size="sm" />,
    },
    {
      header: 'Plate Number',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-100 bg-[#161F30] px-2 py-0.5 rounded border border-[#1F293D]">
          {row.plate_number}
        </span>
      ),
    },
    {
      header: 'FIR / Case Reference',
      accessor: (row) => (
        <span className="font-mono text-slate-300 text-xs">
          {row.fir_number || row.case_reference || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Classification Reason',
      accessor: (row) => (
        <span className="text-slate-300 text-xs truncate max-w-xs block">
          {row.reason}
        </span>
      ),
    },
    {
      header: 'Vehicle Model',
      accessor: (row) => (
        <span className="text-slate-400 text-xs">
          {row.vehicle_make} {row.vehicle_model} {row.vehicle_color ? `(${row.vehicle_color})` : ''}
        </span>
      ),
    },
    {
      header: 'Enforcement Status',
      accessor: (row) =>
        row.is_active ? (
          <StatusBadge status="critical" label="ACTIVE HOTLIST" size="sm" />
        ) : (
          <StatusBadge status="offline" label="SUSPENDED" size="sm" />
        ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => handleRemove(row.id)}
          className="p-1 text-slate-400 hover:text-red-400 hover:bg-[#161F30] rounded transition"
          title="Remove from Hotlist"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="State Surveillance Watchlist & Hotlist Registry"
        category="INVESTIGATION / TARGET ENFORCEMENT"
        description="Vehicles of interest, stolen automobiles, and FIR suspects actively scanned across state-wide automated optical license plate recognition feeds."
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search targets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500 w-44"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1.5 rounded-sm-panel bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Target</span>
            </button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        keyField="id"
        loading={loading}
        emptyMessage="No targets in state watchlist. Add vehicle license plates to trigger automated ANPR alerts."
      />

      {/* Target Enrollment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F293D] rounded-lg max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
              <span className="text-xs font-mono font-bold text-slate-100 uppercase">
                ENROLL HOTLIST SURVEILLANCE TARGET
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                DISMISS [ESC]
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="GJ01AB1234"
                    value={form.plate_number}
                    onChange={(e) => setForm({ ...form, plate_number: e.target.value.toUpperCase() })}
                    className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100"
                  >
                    <option value="CRITICAL">Critical (Immediate Intercept)</option>
                    <option value="HIGH">High (Active Alert)</option>
                    <option value="MEDIUM">Medium (Observe &amp; Track)</option>
                    <option value="LOW">Low (Log Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Enforcement Rationale / Offense Details
                </label>
                <input
                  type="text"
                  required
                  placeholder="Suspect vehicle in narcotics contraband probe"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    FIR Number
                  </label>
                  <input
                    type="text"
                    placeholder="FIR-GJ-2026-8841"
                    value={form.fir_number}
                    onChange={(e) => setForm({ ...form, fir_number: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Case Reference
                  </label>
                  <input
                    type="text"
                    placeholder="CASE-CR-409"
                    value={form.case_reference}
                    onChange={(e) => setForm({ ...form, case_reference: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded bg-[#161F30] text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                >
                  Confirm Hotlist Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
