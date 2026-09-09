import React, { useState } from 'react';
import { Search, Car, Calendar, Filter } from 'lucide-react';
import api from '../api/client';
import { EmptyState } from '../components/EmptyState';

export const VehicleSearch: React.FC = () => {
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setSearched(true);
      let query = `/sightings?limit=50`;
      if (plate.trim()) query += `&plate_number=${encodeURIComponent(plate.trim())}`;
      if (vehicleType.trim()) query += `&vehicle_type=${encodeURIComponent(vehicleType.trim())}`;
      const res = await api.get(query);
      setResults(res.data || []);
    } catch (err) {
      console.error('Search query failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Forensic Vehicle &amp; Plate Search</h2>
        <p className="text-xs text-slate-400 mt-1">
          Query cross-camera sightings by license plate number, vehicle category, or date range.
        </p>
      </div>

      <form onSubmit={handleSearch} className="p-4 rounded-lg bg-[#080D1A] border border-slate-800 space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-400 mb-1">License Plate Number</label>
            <input
              type="text"
              placeholder="e.g. GJ01AB1234 (exact or partial)"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Vehicle Classification</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
            >
              <option value="">All Vehicle Classes</option>
              <option value="car">Car / Sedan / SUV</option>
              <option value="motorcycle">Motorcycle / Scooter</option>
              <option value="auto_rickshaw">Auto Rickshaw</option>
              <option value="bus">Bus</option>
              <option value="truck">Truck / Commercial</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Run Forensic Query
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-400">Searching sighting records...</div>
      ) : !searched ? (
        <EmptyState
          icon={Search}
          title="Vehicle Query Console"
          description="Enter an alphanumeric plate string or select vehicle attributes above to query camera sighting history."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No Sightings Recorded"
          description="Zero vehicle detections match the specified search parameters in the database."
        />
      ) : (
        <div className="space-y-3">
          {results.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg bg-[#080D1A] border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-4">
                <span className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 font-mono font-black text-cyan-400">
                  {item.plate_number || 'UNREAD_PLATE'}
                </span>
                <div>
                  <div className="font-semibold text-slate-200">
                    Camera: {item.camera_id} • Type: {item.vehicle_type || 'Vehicle'}
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                    Time: {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Confidence: {(item.vehicle_confidence * 100 || 0).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
