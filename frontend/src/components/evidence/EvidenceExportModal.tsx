import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Evidence, AuditLogEntry, EvidenceVerifyResult } from '../../types';
import { LicensePlate } from '../ui/LicensePlate';
import { Button } from '../ui/Button';
import { formatTimestamp } from '../../utils/format';
import { ChainOfCustody } from './ChainOfCustody';
import { AlertTriangle, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { evidenceApi } from '../../api/evidence';
import { toast } from 'sonner';
import { DEMO_MODE } from '../../utils/demo';

interface EvidenceExportModalProps {
  evidence: Evidence | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceExportModal: React.FC<EvidenceExportModalProps> = ({
  evidence,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'images' | 'hashes' | 'custody'>('images');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<EvidenceVerifyResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (evidence && isOpen) {
      setVerificationResult(null);
      evidenceApi.getAudit(evidence.id).then(setAuditLogs).catch(() => {});
    }
  }, [evidence, isOpen]);

  if (!evidence) return null;

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const res = await evidenceApi.verify(evidence.id);
      setVerificationResult(res);
      if (res.valid) {
        toast.success(DEMO_MODE ? 'Sample metadata hash matches. Original media is not verified.' : 'Cryptographic integrity confirmed. All SHA-256 hashes match.');
      } else {
        toast.error('Warning: Forensic hash mismatch detected.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const blob = await evidenceApi.exportZip(evidence.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evidence_${evidence.plate_text || 'export'}_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Evidence forensic archive downloaded successfully.');
    } catch (e: any) {
      toast.error(e.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>FORENSIC EVIDENCE PACKAGE — #{evidence.case_id || 'EVIDENCE'}</span>
        </div>
      }
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {DEMO_MODE && <div className="demo-notice">Demonstration metadata package only. SHA-256 verifies the sample metadata, not the illustrative images. Export contains a JSON manifest, not original CCTV evidence or a legal certificate.</div>}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#080C12] rounded-[6px] border border-[#1C2E42]">
          <div className="flex items-center gap-3">
            <LicensePlate plate={evidence.plate_text || 'UNKNOWN'} size="md" />
            <div>
              <div className="text-xs font-semibold text-white">{evidence.camera_name}</div>
              <div className="text-[10px] font-mono text-[#8FA8C0]">
                {formatTimestamp(evidence.frame_ts)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />}
              onClick={handleVerifyIntegrity}
              isLoading={isVerifying}
            >
              Verify Cryptographic Hash
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportZip}
              isLoading={isExporting}
            >
              Export Archive (ZIP)
            </Button>
          </div>
        </div>

        {verificationResult && (
          <div
            className={`p-3 rounded-[4px] border flex items-center gap-3 text-xs ${
              verificationResult.valid
                ? 'bg-[rgba(0,200,117,0.1)] border-[rgba(0,200,117,0.3)] text-[#00C875]'
                : 'bg-[rgba(255,59,59,0.12)] border-[rgba(255,59,59,0.3)] text-[#FF3B3B]'
            }`}
          >
            {verificationResult.valid ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <div>
              <div className="font-bold uppercase tracking-wider">
                Status: {verificationResult.status}
              </div>
              <div className="text-[11px] opacity-90">
                Verified at {new Date(verificationResult.verified_at).toLocaleTimeString()}.
                {verificationResult.valid
                  ? ' Disk byte contents match the cryptographic seal.'
                  : ' Tampering or file corruption detected.'}
              </div>
            </div>
          </div>
        )}

        <div className="flex border-b border-[#1C2E42] text-xs">
          <button
            onClick={() => setActiveTab('images')}
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'images'
                ? 'text-[#0E7FE0] border-b-2 border-[#0E7FE0]'
                : 'text-[#8FA8C0] hover:text-white'
            }`}
          >
            3-Panel Inspection
          </button>
          <button
            onClick={() => setActiveTab('hashes')}
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'hashes'
                ? 'text-[#0E7FE0] border-b-2 border-[#0E7FE0]'
                : 'text-[#8FA8C0] hover:text-white'
            }`}
          >
            SHA-256 Checksums
          </button>
          <button
            onClick={() => setActiveTab('custody')}
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'custody'
                ? 'text-[#0E7FE0] border-b-2 border-[#0E7FE0]'
                : 'text-[#8FA8C0] hover:text-white'
            }`}
          >
            Chain of Custody ({auditLogs.length})
          </button>
        </div>

        {activeTab === 'images' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#8FA8C0] uppercase">1. Raw CCTV Frame</span>
              <div className="aspect-video bg-black rounded border border-[#233A52] overflow-hidden flex items-center justify-center">
                {evidence.frame_path ? (
                  <img src={evidence.frame_path} alt="Raw frame" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-mono text-[#4D6B85]">Frame bytes recorded</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#8FA8C0] uppercase">2. Vehicle Crop (ROI)</span>
              <div className="aspect-video bg-black rounded border border-[#233A52] overflow-hidden flex items-center justify-center">
                {evidence.vehicle_crop_path ? (
                  <img src={evidence.vehicle_crop_path} alt="Vehicle crop" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-mono text-[#4D6B85]">Vehicle ROI recorded</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#8FA8C0] uppercase">3. License Plate Crop</span>
              <div className="aspect-video bg-black rounded border border-[#233A52] overflow-hidden flex items-center justify-center">
                {evidence.plate_crop_path ? (
                  <img src={evidence.plate_crop_path} alt="Plate crop" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-mono text-[#4D6B85]">Plate OCR crop recorded</span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hashes' && (
          <div className="space-y-3 text-xs bg-[#080C12] p-4 rounded border border-[#1C2E42]">
            <div>
              <span className="text-[10px] font-mono text-[#8FA8C0] block uppercase">Raw Frame SHA-256</span>
              <code className="text-[#00C875] font-mono text-[11px] select-all break-all">
                {evidence.frame_hash || 'SHA256_INITIALIZING'}
              </code>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#8FA8C0] block uppercase">Vehicle Crop SHA-256</span>
              <code className="text-[#00C875] font-mono text-[11px] select-all break-all">
                {evidence.vehicle_hash || 'SHA256_INITIALIZING'}
              </code>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#8FA8C0] block uppercase">Plate Crop SHA-256</span>
              <code className="text-[#00C875] font-mono text-[11px] select-all break-all">
                {evidence.plate_hash || 'SHA256_INITIALIZING'}
              </code>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#8FA8C0] block uppercase">Metadata JSON SHA-256</span>
              <code className="text-[#00C875] font-mono text-[11px] select-all break-all">
                {evidence.metadata_hash || 'SHA256_INITIALIZING'}
              </code>
            </div>
          </div>
        )}

        {activeTab === 'custody' && <ChainOfCustody logs={auditLogs} />}
      </div>
    </Modal>
  );
};
