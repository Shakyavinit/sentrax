import React from 'react';
import { Evidence } from '../../types';
import { LicensePlate } from '../ui/LicensePlate';
import { Badge, ConfidenceBadge } from '../ui/Badge';
import { formatTimestamp, truncateHash } from '../../utils/format';
import { Download, ExternalLink, FileCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { DEMO_MODE } from '../../utils/demo';

interface EvidenceCardProps {
  evidence: Evidence;
  onView: (evidence: Evidence) => void;
  onExport: (evidence: Evidence) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, onView, onExport }) => {
  return (
    <div className="bg-[#0D1520] border border-[#1C2E42] hover:border-[#2E4E70] rounded-[6px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Badge variant="ok">{DEMO_MODE ? 'SAMPLE METADATA HASHED' : 'SHA-256 SEALED'}</Badge>
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

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1C2E42]">
        <Button
          size="sm"
          variant="secondary"
          icon={<ExternalLink className="w-3 h-3" />}
          onClick={() => onView(evidence)}
        >
          Inspect
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={<Download className="w-3 h-3" />}
          onClick={() => onExport(evidence)}
        >
          Export ZIP
        </Button>
      </div>
    </div>
  );
};
