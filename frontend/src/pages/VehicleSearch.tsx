import React, { useState, useEffect } from 'react';
import { Search, Car, Calendar, MapPin, Eye, ShieldAlert, ArrowRight, History, GitMerge } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';

const routeIcon = L.divIcon({
  className: 'route-marker',
  html: `<div style="background-color: #EF4444; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #FFFFFF;"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

export const VehicleSearch: React.FC = () => {
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setSearched(true);
      let query = `/sightings?limit=50`;
      if (plate.trim()) query += `&plate_number=${encodeURIComponent(plate.trim())}`;
      if (vehicleType.trim()) query += `&vehicle_type=${encodeURIComponent(vehicleType.trim())}`;
      const res = await api.get(query);
      const data = res.data || [];
      setResults(data);
      if (data.length > 0) {
        setSelectedVehicle(data[0]);
      } else {
        setSelectedVehicle(null);
      }
    } catch (err) {
      console.error('Vehicle search failed', err);
    } finally {
      setLoading(false);
    }
  };

  // Preload recent vehicles for quick triage
  useEffect(() => {
    handleSearch();
  }, []);

  // Summary statistics for searched plate
  const targetSightings = plate.trim()
    ? results.filter((r) => r.plate_number.toLowerCase().includes(plate.trim().toLowerCase()))
    : results;

  const firstSeen = targetSightings.length > 0
    ? new Date(targetSightings[targetSightings.length - 1].timestamp).toLocaleString()
    : 'N/A';
  const lastSeen = targetSightings.length > 0
    ? new Date(targetSightings[0].timestamp).toLocaleString()
    : 'N/A';
  const isWatchlist = targetSightings.some((r) => r.is_watchlist_hit);

  // Chronological route coordinate points for GIS Reconstruction
  const routePoints: [number, number][] = targetSightings
    .filter((s) => s.camera && s.camera.latitude && s.camera.longitude)
    .map((s) => [s.camera.latitude, s.camera.longitude] as [number, number]);

  const columns: Column<any>[] = [
    {
      header: 'Plate Number',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-100 bg-[#161F30] px-2 py-0.5 rounded border border-[#1F293D]">
          {row.plate_number}
        </span>
      ),
    },
    {
      header: 'Vehicle Type',
      accessor: (row) => <span className="capitalize text-slate-300">{row.vehicle_type || 'Unknown'}</span>,
    },
    {
      header: 'Camera Node',
      accessor: (row) => <span className="font-mono text-slate-300">{row.camera_id}</span>,
    },
    {
      header: 'Timestamp',
      accessor: (row) => (
        <span className="font-mono text-slate-400 text-[11px]">
          {new Date(row.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Watchlist Status',
      accessor: (row) =>
        row.is_watchlist_hit ? (
          <StatusBadge status="critical" label="HOTLIST MATCH" size="sm" />
        ) : (
          <StatusBadge status="operational" label="CLEARED" size="sm" />
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vehicle Search & Cross-Camera Timeline"
        category="INVESTIGATION / ANPR INTELLIGENCE"
        description="Search cross-camera plate records, analyze multi-node trajectory, and reconstruct geospatial movement routes."
      />

      {/* Primary Search Input Strip */}
      <form onSubmit={handleSearch} className="p-3.5 rounded-lg border border-[#1F293D] bg-[#111827] space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
              License Plate / Partial Registration
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. GJ01AB1234, GJ-05, etc."
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">
              Vehicle Classification
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-3 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="">All Classifications</option>
              <option value="car">Car / Sedan / SUV</option>
              <option value="motorcycle">Motorcycle / Two-Wheeler</option>
              <option value="truck">Truck / Commercial</option>
              <option value="bus">Bus / Transit</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-1.5 px-4 rounded-sm-panel bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'QUERYING...' : 'EXECUTE SEARCH'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Target Vehicle Intelligence Summary (When Query Returns) */}
      {targetSightings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#1F293D] border border-[#1F293D] rounded-lg bg-[#111827]">
          <div className="px-4 py-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">TARGET PLATE</div>
            <div className="text-base font-bold font-mono text-slate-100 mt-0.5">
              {plate.trim() ? plate.toUpperCase() : targetSightings[0].plate_number}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">WATCHLIST STATUS</div>
            <div className="mt-1">
              {isWatchlist ? (
                <StatusBadge status="critical" label="HOTLIST TARGET" size="sm" />
              ) : (
                <StatusBadge status="operational" label="NOT FLAGGED" size="sm" />
              )}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">TOTAL SIGHTINGS</div>
            <div className="text-base font-bold font-mono text-blue-400 mt-0.5">
              {targetSightings.length}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">FIRST DETECTED</div>
            <div className="text-xs font-mono text-slate-300 mt-0.5 truncate">{firstSeen}</div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[10px] font-mono text-slate-400 uppercase">LAST SEEN</div>
            <div className="text-xs font-mono text-slate-300 mt-0.5 truncate">{lastSeen}</div>
          </div>
        </div>
      )}

      {/* Movement Timeline + GIS Route Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Chronological Movement Timeline */}
        <div className="border border-[#1F293D] rounded-lg bg-[#111827] flex flex-col h-[380px]">
          <div className="px-4 py-2.5 border-b border-[#1F293D] bg-[#161F30] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-200 font-semibold">
                Cross-Camera Chronological Trail
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {targetSightings.length} NODES LOGGED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {targetSightings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <Car className="w-8 h-8 mb-2 text-slate-600" />
                <span className="text-xs font-mono font-semibold text-slate-400">NO TRAJECTORY DATA</span>
                <p className="text-[11px] mt-1 text-slate-500">
                  Search by plate number to reconstruct movement between CCTV junctions.
                </p>
              </div>
            ) : (
              targetSightings.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="flex items-start gap-3 text-xs p-2.5 rounded border border-[#1F293D] bg-[#161F30]/40"
                >
                  <div className="flex flex-col items-center shrink-0">
                    <span className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    {idx < targetSightings.length - 1 && (
                      <div className="w-0.5 h-6 bg-[#1F293D] my-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-200">{s.camera_id}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(s.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {s.camera?.address || s.location || 'Gujarat Highway Junction'}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] font-mono">
                      <span className="text-slate-500">CONF: {s.confidence ? `${(s.confidence * 100).toFixed(0)}%` : '98%'}</span>
                      {s.is_watchlist_hit && (
                        <span className="text-red-400 font-semibold">• WATCHLIST HIT</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: GIS Route Map */}
        <div className="border border-[#1F293D] rounded-lg bg-[#111827] flex flex-col h-[380px]">
          <div className="px-4 py-2.5 border-b border-[#1F293D] bg-[#161F30] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-200 font-semibold">
                GIS Route Reconstruction
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {routePoints.length > 1 ? 'INTERPOLATED PATH' : 'STANDBY'}
            </span>
          </div>

          <div className="flex-1 relative z-0">
            <MapContainer
              center={routePoints.length > 0 ? routePoints[0] : [23.03, 72.58]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              {routePoints.map((pt, idx) => (
                <Marker key={idx} position={pt} icon={routeIcon}>
                  <Popup>
                    <div className="text-xs font-mono">
                      <b>Waypoint {idx + 1}</b>
                      <div>Lat: {pt[0].toFixed(4)}, Lng: {pt[1].toFixed(4)}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {routePoints.length > 1 && (
                <Polyline positions={routePoints} color="#EF4444" weight={3} dashArray="5, 5" />
              )}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Sightings Table */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
          Full Query Results ({results.length} Sighting Records)
        </div>
        <DataTable
          columns={columns}
          data={results}
          keyField="id"
          loading={loading}
          emptyMessage="No matching vehicle records found in database."
        />
      </div>
    </div>
  );
};
