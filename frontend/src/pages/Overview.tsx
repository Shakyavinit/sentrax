import React, { useEffect, useState } from 'react';
import { Cctv, ShieldAlert, Eye, Archive, Radio, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../api/client';
import { useAlertStream } from '../context/WebSocketContext';

export const Overview: React.FC = () => {
  const { isConnected, recentAlerts } = useAlertStream();
  const [stats, setStats] = useState({
    totalCameras: 0,
    onlineCameras: 0,
    watchlistTargets: 0,
    totalSightings: 0,
    evidenceItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        const [camsRes, watchRes, sightRes, evidRes] = await Promise.all([
          api.get('/cameras'),
          api.get('/watchlist'),
          api.get('/sightings?limit=1'),
          api.get('/evidence?limit=1'),
        ]);

        const cameras = camsRes.data || [];
        const onlineCount = cameras.filter((c: any) => c.status === 'ONLINE').length;

        setStats({
          totalCameras: cameras.length,
          onlineCameras: onlineCount,
          watchlistTargets: (watchRes.data || []).length,
          totalSightings: sightRes.data?.length || 0,
          evidenceItems: evidRes.data?.length || 0,
        });
      } catch (err) {
        console.error('Failed to load overview data from real backend', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Surveillance Command Center</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed telemetry, watchlist enforcement &amp; forensic auditing state.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400">Pipeline Status:</span>
          <span className="font-mono text-cyan-400 font-semibold">MILESTONE 1 (FOUNDATION ACTIVE)</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#080D1A] border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Registered Cameras</span>
            <Cctv className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {loading ? '...' : stats.totalCameras}
            </span>
            <span className="text-[11px] text-emerald-400">
              ({stats.onlineCameras} online)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#080D1A] border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Watchlist Targets</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {loading ? '...' : stats.watchlistTargets}
            </span>
            <span className="text-[11px] text-slate-500">Vehicles of Interest</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#080D1A] border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Logged Sightings</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {loading ? '...' : stats.totalSightings}
            </span>
            <span className="text-[11px] text-slate-500">Genuine Frames</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#080D1A] border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Secured Evidence</span>
            <Archive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {loading ? '...' : stats.evidenceItems}
            </span>
            <span className="text-[11px] text-emerald-500 font-mono">SHA-256 Vault</span>
          </div>
        </div>
      </div>

      {/* Realtime Alert Feed or Empty State */}
      <div className="rounded-lg bg-[#080D1A] border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isConnected ? 'text-red-500 animate-pulse' : 'text-slate-600'}`} />
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
              Live Intercept Broadcasts
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {recentAlerts.length} Event(s) Received
          </span>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded bg-[#060913]">
            No live alerts in current session. Awaiting video pipeline ingestion and watchlist triggers.
          </div>
        ) : (
          <div className="space-y-2">
            {recentAlerts.map((alert) => (
              <div
                key={alert.alert_id}
                className="p-3 rounded bg-red-950/20 border border-red-900/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono font-bold">
                    {alert.plate_number}
                  </span>
                  <span className="text-slate-300">{alert.reason}</span>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  {alert.camera_id} • {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
