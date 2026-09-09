import React, { useState, useEffect } from 'react';
import { FileText, Shield, User } from 'lucide-react';
import api from '../api/client';
import { EmptyState } from '../components/EmptyState';

interface AuditItem {
  id: number;
  user_email: string | null;
  badge_number: string | null;
  action: string;
  target_resource: string | null;
  target_id: string | null;
  timestamp: string;
  details: any;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/audit');
        setLogs(res.data || []);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Immutable Security Audit Trail</h2>
        <p className="text-xs text-slate-400 mt-1">
          Full forensic record of operator logins, watchlist adjustments, camera changes, and evidence access.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-400">Loading audit trail...</div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Audit Entries Found"
          description="Every security event, login, target addition, and evidence verification is automatically recorded here."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#080D1A]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B1222] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Officer / User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target Resource</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-200">
                    <div>{log.user_email || 'System'}</div>
                    {log.badge_number && (
                      <div className="text-[10px] text-cyan-400 font-mono">
                        Badge: {log.badge_number}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {log.target_resource ? `${log.target_resource} (${log.target_id || ''})` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[10px] max-w-[300px] truncate">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
