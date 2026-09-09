import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, ShieldAlert, Filter, Clock } from 'lucide-react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';
import { useAlertStream } from '../context/WebSocketContext';

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
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const { recentAlerts } = useAlertStream();

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

  const filtered = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const columns: Column<AlertItem>[] = [
    {
      header: 'Severity',
      accessor: (row) => <StatusBadge status={row.severity} size="sm" />,
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
      header: 'Reason / Notes',
      accessor: (row) => (
        <span className="text-slate-300 text-xs truncate max-w-xs block">
          {row.notes || 'Automated watchlist match'}
        </span>
      ),
    },
    {
      header: 'Camera Node',
      accessor: (row) => <span className="font-mono text-slate-300 text-xs">{row.camera_id}</span>,
    },
    {
      header: 'Detected Time',
      accessor: (row) => (
        <span className="font-mono text-slate-400 text-[11px]">
          {new Date(row.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Current Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Command Action',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'NEW' && (
            <button
              onClick={() => handleStatusUpdate(row.id, 'ACKNOWLEDGED')}
              className="px-2 py-1 rounded bg-[#161F30] hover:bg-[#1F293D] border border-[#1F293D] text-slate-200 font-mono text-[10px] transition"
            >
              ACKNOWLEDGE
            </button>
          )}
          {row.status !== 'RESOLVED' && (
            <button
              onClick={() => handleStatusUpdate(row.id, 'RESOLVED')}
              className="px-2 py-1 rounded bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/40 text-emerald-400 font-mono text-[10px] transition"
            >
              RESOLVE
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Watchlist Intercept Alerts & Incident Dispatch"
        category="INVESTIGATION / REAL-TIME INTERCEPTIONS"
        description="Operational incident feed triggered when automatic plate recognition matches active criminal or suspect watchlists."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">FILTER:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-sm-panel font-mono text-[10px] transition ${
                  filterSeverity === sev
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-[#161F30] text-slate-400 hover:text-slate-200 border border-[#1F293D]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        keyField="id"
        loading={loading}
        emptyMessage="No active intercept alerts. The grid continues surveillance against registered targets."
      />
    </div>
  );
};
