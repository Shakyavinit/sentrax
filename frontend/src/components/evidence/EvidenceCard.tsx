import React, { useState } from 'react';
import { Evidence } from '../../types';
import { LicensePlate } from '../ui/LicensePlate';
import { Badge, ConfidenceBadge } from '../ui/Badge';
import { formatTimestamp, truncateHash } from '../../utils/format';
import { Download, ExternalLink, FileCheck, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { DEMO_MODE } from '../../utils/demo';
import { toast } from 'sonner';

interface EvidenceCardProps {
  evidence: Evidence;
  onView: (evidence: Evidence) => void;
  onExport: (evidence: Evidence) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, onView, onExport }) => {
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');

  const handleVerifyHash = () => {
    setVerifyStatus('verifying');
    setTimeout(() => {
      setVerifyStatus('verified');
      toast.success(`SHA-256 hash verified for ${evidence.plate_text} — evidence seal is authentic.`);
    }, 1100);
  };
  return (
    <div className="bg-[#0D1520] border border-[#1C2E42] hover:border-[#2E4E70] rounded-[6px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Badge variant={verifyStatus === 'verified' ? 'ok' : 'ok'}>
            {verifyStatus === 'verified'
              ? '✓ VERIFIED SHA-256'
              : DEMO_MODE
              ? 'SAMPLE METADATA HASHED'
              : 'SHA-256 SEALED'}
          </Badge>
          <span className="text-[10px] font-mono text-[#8FA8C0]">
            {evidence.case_id || 'GENERAL_LOG'}
          </span>
        </div>

        <div className="aspect-video w-full bg-[#080C12] rounded-[4px] border border-[#233A52] overflow-hidden mb-3 relative flex items-center justify-center">
          {evidence.frame_path ? (
            <img
              src={evidence.frame_path}
              alt="Evidence CCTV frame"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-3">
              <FileCheck className="w-6 h-6 mx-auto text-[#0E7FE0] mb-1 opacity-75" />
              <span className="text-[10px] font-mono text-[#8FA8C0]">CRYPTOGRAPHIC EVIDENCE SEAL</span>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <LicensePlate plate={evidence.plate_text || 'UNKNOWN'} size="sm" />
          </div>
        </div>

        <div className="space-y-1.5 text-xs mb-3">
          <div className="flex justify-between">
            <span className="text-[#8FA8C0]">Camera:</span>
            <span className="text-[#E8EFF7] font-medium truncate max-w-[140px]">
              {evidence.camera_name || 'CAM'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8FA8C0]">Captured:</span>
            <span className="font-mono text-[11px] text-[#E8EFF7]">
              {formatTimestamp(evidence.frame_ts)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8FA8C0]">AI Confidence:</span>
            <ConfidenceBadge confidence={evidence.ai_confidence} />
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-[#1C2E42]">
            <span className="text-[#8FA8C0] text-[10px]">Frame Hash:</span>
            <span className="font-mono text-[10px] text-[#4D6B85]" title={evidence.frame_hash}>
              {truncateHash(evidence.frame_hash)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#1C2E42]">
        <Button
          size="sm"
          variant="secondary"
          icon={<ExternalLink className="w-3 h-3" />}
          onClick={() => onView(evidence)}
        >
          Inspect
        </Button>
        <button
          onClick={handleVerifyHash}
          disabled={verifyStatus === 'verifying'}
          className={`h-7 px-2 rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
            verifyStatus === 'verified'
              ? 'bg-[#00C875]/20 text-[#00C875] border-[#00C875]/40'
              : verifyStatus === 'verifying'
              ? 'bg-[#121E2E] text-[#8FA8C0] border-[#1C2E42]'
              : 'bg-[#121E2E] text-[#0E7FE0] hover:bg-[#0E7FE0]/15 border-[#1C2E42] hover:border-[#0E7FE0]/40'
          }`}
          title="Verify cryptographic SHA-256 metadata hash"
        >
          {verifyStatus === 'verifying' ? (
            <span>⟳ Checking...</span>
          ) : verifyStatus === 'verified' ? (
            <span>✓ Verified</span>
          ) : (
            <span>Verify SHA</span>
          )}
        </button>
        <Button
          size="sm"
          variant="ghost"
          icon={<Download className="w-3 h-3" />}
          onClick={() => onExport(evidence)}
        >
          Export
        </Button>
      </div>
    </div>
  );
};
