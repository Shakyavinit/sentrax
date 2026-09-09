import React, { useState, useEffect } from 'react';
import { Archive, ShieldCheck, FileCheck, AlertTriangle } from 'lucide-react';
import api from '../api/client';
import { EmptyState } from '../components/EmptyState';

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
}

export const EvidenceVault: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

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
      alert(err.response?.data?.detail || 'Integrity check failed');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Forensic Evidence Vault</h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable digital evidence with SHA-256 cryptographic verification &amp; chain of custody.
          </p>
        </div>
      </div>

      {verificationResult && (
        <div
          className={`p-4 rounded-lg border text-xs flex items-center justify-between ${
            !verificationResult.tamper_detected
              ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300'
              : 'bg-red-950/20 border-red-800 text-red-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="font-bold">
                FORENSIC VERIFICATION: {verificationResult.status}
              </div>
              <div className="font-mono text-[11px] text-slate-400">
                SHA-256: {verificationResult.database_sha256}
              </div>
            </div>
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            className="text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-400">Loading evidence vault records...</div>
      ) : evidenceList.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="Evidence Vault Empty"
          description="Forensically sealed frames, plate crops, and video clips will be automatically registered with SHA-256 signatures when captured."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#080D1A]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B1222] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">UUID</th>
                <th className="px-4 py-3">File / Asset</th>
                <th className="px-4 py-3">SHA-256 Hash</th>
                <th className="px-4 py-3">Camera Node</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Integrity Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {evidenceList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3 text-cyan-400 text-[11px]">{item.evidence_uuid.slice(0, 8)}...</td>
                  <td className="px-4 py-3 font-sans font-semibold text-slate-200">
                    {item.file_name} ({(item.file_size_bytes / 1024).toFixed(1)} KB)
                  </td>
                  <td className="px-4 py-3 text-[10px] text-slate-400 max-w-[200px] truncate" title={item.sha256_hash}>
                    {item.sha256_hash}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{item.camera_id || 'SYSTEM'}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-500">
                    {new Date(item.captured_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleVerify(item.evidence_uuid)}
                      disabled={verifyingId === item.evidence_uuid}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600/20 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-600/30 text-[11px]"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      {verifyingId === item.evidence_uuid ? 'Verifying...' : 'Verify Hash'}
                    </button>
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
