import React, { useState, useEffect } from 'react';
import { Archive, ShieldCheck, FileCheck, AlertTriangle, Key, Download, CheckCircle, ExternalLink } from 'lucide-react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';

interface EvidenceItem {
  id: number;
  evidence_uuid: string;
  file_name: string;
  file_size_bytes: number;
  sha256_hash: string;
  evidence_type: string;
  camera_id?: string;
  case_reference?: string;
  captured_at: string;
  file_path: string;
}

export const EvidenceVault: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [previewItem, setPreviewItem] = useState<EvidenceItem | null>(null);

  const loadEvidence = async () => {
    try {
      setLoading(true);
      const res = await api.get('/evidence');
      setEvidenceList(res.data || []);
    } catch (err) {
      console.error('Failed to load evidence vault', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, []);

  const handleVerify = async (uuid: string) => {
    try {
      setVerifyingId(uuid);
      const res = await api.get(`/evidence/${uuid}/verify`);
      setVerificationResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Cryptographic integrity verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const columns: Column<EvidenceItem>[] = [
    {
      header: 'Evidence UUID',
      accessor: (row) => (
        <span className="font-mono text-xs text-blue-400 font-semibold">
          {row.evidence_uuid.slice(0, 8)}...
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: (row) => (
        <span className="font-mono text-[11px] uppercase text-slate-300">
          {row.evidence_type}
        </span>
      ),
    },
    {
      header: 'Camera Node',
      accessor: (row) => (
        <span className="font-mono text-slate-300 text-xs">
          {row.camera_id || 'N/A'}
        </span>
      ),
    },
    {
      header: 'SHA-256 Hash (Forensic Digest)',
      accessor: (row) => (
        <span className="font-mono text-[11px] text-slate-400 bg-[#0B0F17] px-2 py-0.5 rounded border border-[#1F293D]">
          {row.sha256_hash.slice(0, 16)}...{row.sha256_hash.slice(-8)}
        </span>
      ),
    },
    {
      header: 'File Size',
      accessor: (row) => (
        <span className="font-mono text-slate-400 text-xs">
          {(row.file_size_bytes / 1024).toFixed(1)} KB
        </span>
      ),
    },
    {
      header: 'Timestamp',
      accessor: (row) => (
        <span className="font-mono text-slate-400 text-[11px]">
          {new Date(row.captured_at).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVerify(row.evidence_uuid)}
            disabled={verifyingId === row.evidence_uuid}
            className="px-2.5 py-1 rounded bg-[#161F30] hover:bg-[#1F293D] border border-[#1F293D] text-slate-200 font-mono text-[10px] transition flex items-center gap-1"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{verifyingId === row.evidence_uuid ? 'VERIFYING...' : 'VERIFY SHA-256'}</span>
          </button>
          <button
            onClick={() => setPreviewItem(row)}
            className="px-2 py-1 rounded bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono text-[10px] transition"
          >
            INSPECT
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Forensic Evidence Vault & Integrity Seal"
        category="DIGITAL FORENSICS / CHAIN OF CUSTODY"
        description="Immutable digital evidence vault. Individual sighting frames and alert video clips sealed with SHA-256 cryptographic hashes for judicial admissibility."
      />

      {/* Verification Result Notification */}
      {verificationResult && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between font-mono ${
            !verificationResult.tamper_detected
              ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300'
              : 'bg-red-950/20 border-red-800 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {!verificationResult.tamper_detected ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <div>
              <span className="font-bold">
                {!verificationResult.tamper_detected
                  ? 'CRYPTOGRAPHIC INTEGRITY CONFIRMED'
                  : 'INTEGRITY TAMPER DETECTED'}
              </span>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Computed Hash: {verificationResult.computed_sha256}
              </div>
            </div>
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            className="text-slate-400 hover:text-slate-200 text-xs"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Evidence Table */}
      <DataTable
        columns={columns}
        data={evidenceList}
        keyField="id"
        loading={loading}
        emptyMessage="No evidence items logged. Forensic snapshots and alert clips are saved automatically when watchlist triggers occur."
      />

      {/* Forensic Inspection Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F293D] rounded-lg max-w-xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold text-slate-100">
                  EVIDENCE: {previewItem.evidence_uuid}
                </span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-[#0B0F17] p-3 rounded border border-[#1F293D] space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase">SHA-256 CRYPTOGRAPHIC DIGEST</div>
                <div className="text-emerald-400 break-all text-[11px] font-bold">
                  {previewItem.sha256_hash}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded bg-[#161F30] border border-[#1F293D]">
                  <span className="text-slate-400 block text-[10px]">CAMERA NODE</span>
                  <span className="text-slate-200 font-bold">{previewItem.camera_id || 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded bg-[#161F30] border border-[#1F293D]">
                  <span className="text-slate-400 block text-[10px]">FILE SIZE</span>
                  <span className="text-slate-200 font-bold">{(previewItem.file_size_bytes / 1024).toFixed(1)} KB</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#161F30] border border-[#1F293D]">
                <span className="text-slate-400 block text-[10px]">CHAIN OF CUSTODY STORE</span>
                <span className="text-slate-300 break-all">{previewItem.file_path}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => handleVerify(previewItem.evidence_uuid)}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Run Integrity Hash Check</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
