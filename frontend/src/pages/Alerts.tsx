import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../api/client';
import { EmptyState } from '../components/EmptyState';

interface AlertItem {
  id: number;
  plate_number: string;
  camera_id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESOLVED' | 'FALSE_POSITIVE';
  confidence_score: number;
  notes: string | null;
  created_at: string;
}

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/alerts');
      setAlerts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.patch(`/alerts/${id}/status`, { status });
      loadAlerts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Status update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Watchlist Intercept Alerts</h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated alerts dispatched when AI pipeline matches detected plates against hotlists.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-400">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Alerts Generated"
          description="Zero hotlist intercepts triggered yet. Once video frames containing target license plates are ingested, alerts will populate here in real-time."
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((al) => (
            <div
              key={al.id}
              className="p-4 rounded-lg bg-[#080D1A] border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-4">
                <span className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 font-mono font-black text-sm text-red-400 tracking-wider">
                  {al.plate_number}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        al.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {al.severity}
                    </span>
                    <span className="font-semibold text-slate-200">
                      Camera: {al.camera_id}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 font-mono">
                      Conf: {(al.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1">{al.notes || 'No investigator notes.'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-slate-500">
                  {new Date(al.created_at).toLocaleTimeString()}
                </span>
                {al.status === 'NEW' ? (
                  <button
                    onClick={() => handleStatusUpdate(al.id, 'ACKNOWLEDGED')}
                    className="px-2.5 py-1 rounded bg-amber-600/20 border border-amber-600/40 text-amber-300 hover:bg-amber-600/40 font-medium text-[11px]"
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                    {al.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
