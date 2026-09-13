import React from 'react';
import { AuditLogEntry } from '../../types';
import { formatTimestamp } from '../../utils/format';
import { UserCheck } from 'lucide-react';

export const ChainOfCustody: React.FC<{ logs: AuditLogEntry[] }> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-[#8FA8C0] border border-[#233A52] rounded-[4px] bg-[#121E2E]">
        Initial seal created. No downstream audit actions recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((entry, idx) => (
        <div
          key={entry.id || idx}
          className="flex items-start gap-3 p-2.5 bg-[#121E2E] border border-[#233A52] rounded-[4px] text-xs"
        >
          <div className="p-1.5 bg-[#1A2A3D] rounded border border-[#2E4E70] text-[#0E7FE0] mt-0.5">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
                {entry.action.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-mono text-[#8FA8C0]">
                {formatTimestamp(entry.created_at)}
              </span>
            </div>
            <div className="text-[11px] text-[#8FA8C0] mt-0.5">
              Operator: <span className="text-[#E8EFF7] font-mono">{entry.username || 'System Node'}</span>
            </div>
            {entry.detail && Object.keys(entry.detail).length > 0 && (
              <pre className="mt-1 text-[10px] font-mono text-[#4D6B85] bg-[#080C12] p-1.5 rounded overflow-x-auto">
                {JSON.stringify(entry.detail, null, 2)}
              </pre>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
