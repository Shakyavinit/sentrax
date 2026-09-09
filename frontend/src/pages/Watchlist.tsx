import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2, Search, Car } from 'lucide-react';
import api from '../api/client';
import { EmptyState } from '../components/EmptyState';

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
      alert(err.response?.data?.detail || 'Failed to add vehicle to watchlist');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this vehicle from active watchlist?')) return;
    try {
      await api.delete(`/watchlist/${id}`);
      loadWatchlist();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Delete failed');
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.plate_number.toLowerCase().includes(search.toLowerCase()) ||
      (item.reason && item.reason.toLowerCase().includes(search.toLowerCase())) ||
      (item.fir_number && item.fir_number.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Target Watchlist &amp; Hotlist</h2>
          <p className="text-xs text-slate-400 mt-1">
            Intercept list of suspect, stolen, or wanted vehicles for automated ANPR trigger.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition"
        >
          <Plus className="w-4 h-4" /> Add Target Plate
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by license plate, FIR number or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded bg-[#080D1A] border border-slate-800 text-xs text-slate-200 placeholder-slate-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-400">Loading hotlist targets...</div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="Watchlist Empty"
          description="No target vehicles currently active in the database. Add license plates to initiate automatic real-time alerts upon camera sighting."
          actionText="Add Target Plate"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((target) => (
            <div
              key={target.id}
              className="p-4 rounded-lg bg-[#080D1A] border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded bg-slate-900 border border-slate-700 font-mono font-black text-sm text-cyan-400 tracking-wider">
                  {target.plate_number}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    target.priority === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {target.priority}
                </span>
              </div>

              <div className="text-xs text-slate-300">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  {target.vehicle_make || 'Unknown Make'} {target.vehicle_model || ''} • {target.vehicle_color || 'Unknown Color'}
                </div>
                <div className="mt-1 text-slate-400 line-clamp-2">{target.reason}</div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>FIR: {target.fir_number || 'N/A'}</span>
                <button
                  onClick={() => handleDelete(target.id)}
                  className="text-slate-500 hover:text-red-400 transition"
                  title="Delete Target"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Target Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg bg-[#0A0F1E] border border-slate-700 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Add Target to Watchlist</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Plate Number *</label>
                  <input
                    required
                    value={form.plate_number}
                    onChange={(e) => setForm({ ...form, plate_number: e.target.value })}
                    placeholder="e.g. GJ01AB1234"
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Make</label>
                  <input
                    value={form.vehicle_make}
                    onChange={(e) => setForm({ ...form, vehicle_make: e.target.value })}
                    placeholder="Hyundai"
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Model</label>
                  <input
                    value={form.vehicle_model}
                    onChange={(e) => setForm({ ...form, vehicle_model: e.target.value })}
                    placeholder="Creta"
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Color</label>
                  <input
                    value={form.vehicle_color}
                    onChange={(e) => setForm({ ...form, vehicle_color: e.target.value })}
                    placeholder="White"
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">FIR / Crime Ref</label>
                  <input
                    value={form.fir_number}
                    onChange={(e) => setForm({ ...form, fir_number: e.target.value })}
                    placeholder="FIR/2026/0491"
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    <option value="SUSPECT_VEHICLE">Suspect Vehicle</option>
                    <option value="STOLEN_VEHICLE">Stolen Vehicle</option>
                    <option value="WARRANT">Warrant / Court Order</option>
                    <option value="TERROR_SUSPECT">Anti-Terror / Threat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Interception Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Details of suspicion, fleeing route, or investigation background..."
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                >
                  Save to Hotlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
