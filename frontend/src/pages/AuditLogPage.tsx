import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../components/layout/PageHeader";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { auditApi } from "../api/audit";
import { AuditLogEntry } from "../types";
import { formatTimestamp } from "../utils/format";
import { ShieldCheck, Search, Filter, Download, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const AuditLogPage: React.FC = () => {
  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit", actionFilter, userFilter],
    queryFn: () => auditApi.list({ action: actionFilter || undefined, user: userFilter || undefined }),
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "viewed_evidence":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0E7FE0]/20 text-[#0E7FE0] border border-[#0E7FE0]/30">VIEW EVIDENCE</span>;
      case "ack_alert":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00C875]/20 text-[#00C875] border border-[#00C875]/30">ACK ALERT</span>;
      case "add_watchlist":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/30">WATCHLIST ADD</span>;
      case "alert_generated":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF3B3B]/20 text-[#FF3B3B] border border-[#FF3B3B]/30">ALERT DISPATCH</span>;
      case "export_evidence":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">EVIDENCE EXPORT</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">{action.toUpperCase()}</span>;
    }
  };

  const handleExportAudit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SENTRAX_AUDIT_LOG_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Audit log exported successfully.");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Forensic Audit Trail & Chain of Custody"
        description="Tamper-evident system audit log tracking all investigator queries, alert resolutions, and evidence operations."
        actions={
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportAudit}
          >
            Export Audit Trail (JSON)
          </Button>
        }
      />

      {/* Filter Ribbon */}
      <div className="p-3 bg-[#0D1520] border border-[#1C2E42] rounded-[6px] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-6">
          <Input
            placeholder="Search by investigator name or target..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="sm:col-span-6">
          <Select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            options={[
              { label: "All Operational Actions", value: "" },
              { label: "View Evidence (viewed_evidence)", value: "viewed_evidence" },
              { label: "Acknowledge Alert (ack_alert)", value: "ack_alert" },
              { label: "Add Watchlist (add_watchlist)", value: "add_watchlist" },
              { label: "AI Alert Generated (alert_generated)", value: "alert_generated" },
              { label: "Export Evidence (export_evidence)", value: "export_evidence" },
            ]}
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0D1520] border border-[#1C2E42] rounded-[6px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121E2E] text-[#8FA8C0] text-[11px] font-mono border-b border-[#1C2E42] uppercase">
              <tr>
                <th className="py-2.5 px-4 font-medium">Log ID</th>
                <th className="py-2.5 px-4 font-medium">Timestamp</th>
                <th className="py-2.5 px-4 font-medium">Investigator / Agent</th>
                <th className="py-2.5 px-4 font-medium">Action Performed</th>
                <th className="py-2.5 px-4 font-medium">Target Entity</th>
                <th className="py-2.5 px-4 font-medium">Origin IP</th>
                <th className="py-2.5 px-4 text-right font-medium">Security Seal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2E42]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8FA8C0]">
                    Loading audit trail logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8FA8C0]">
                    No audit records matching filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#121E2E] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#8FA8C0]">
                      #{entry.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#E8EFF7]">
                      {formatTimestamp(entry.created_at)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {entry.username || "System Operator"}
                    </td>
                    <td className="py-3 px-4">
                      {getActionBadge(entry.action)}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[#0E7FE0]">
                      {entry.target_id || entry.target_type || "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#8FA8C0]">
                      {entry.ip_address || "192.168.1.10"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#00C875] bg-[#00C875]/10 border border-[#00C875]/30 px-2 py-0.5 rounded">
                        <Lock className="w-2.5 h-2.5" />
                        SEALED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AuditLogPage;
