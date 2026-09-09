import React, { useState, useEffect } from 'react';
import { FileText, Shield, User, Filter } from 'lucide-react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';

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

  const columns: Column<AuditItem>[] = [
    {
      header: 'Timestamp',
      accessor: (row) => (
        <span className="font-mono text-slate-400 text-[11px]">
          {new Date(row.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Officer / Operator',
      accessor: (row) => (
        <div>
          <span className="font-medium text-slate-200 block text-xs">
            {row.user_email || 'System Daemon'}
          </span>
          {row.badge_number && (
            <span className="text-[10px] font-mono text-slate-400">
              BADGE: {row.badge_number}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Security Action',
      accessor: (row) => (
        <span className="font-mono text-xs text-blue-400 font-semibold">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Target Resource',
      accessor: (row) => (
        <span className="text-slate-300 text-xs">
          {row.target_resource} {row.target_id ? `(#${row.target_id})` : ''}
        </span>
      ),
    },
    {
      header: 'Result',
      accessor: () => <StatusBadge status="operational" label="AUTHORIZED" size="sm" />,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Immutable Security Audit Trail & Access Logs"
        category="SYSTEM / FORENSIC ACCOUNTABILITY"
        description="Non-repudiable audit ledger recording operator logins, watchlist adjustments, camera node creation, and evidence verifications."
      />

      <DataTable
        columns={columns}
        data={logs}
        keyField="id"
        loading={loading}
        emptyMessage="No audit logs recorded yet. Security actions and user operations will appear here automatically."
      />
    </div>
  );
};
