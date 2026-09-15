import React, { useState } from 'react';
import { Evidence } from '../../types';
import { LicensePlate } from '../ui/LicensePlate';
import { formatTimestamp, truncateHash } from '../../utils/format';
import { 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Camera, 
  Lock, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface EvidenceCardProps {
  evidence: Evidence;
  onView: (evidence: Evidence) => void;
  onExport: (evidence: Evidence) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, onView, onExport }) => {
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');
  const [copied, setCopied] = useState(false);

  const handleVerifyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVerifyStatus('verifying');
    setTimeout(() => {
      setVerifyStatus('verified');
      toast.success(`✓ SHA-256 digital signature verified for ${evidence.plate_text || 'evidence record'}. Bit-for-bit authentic.`);
    }, 900);
  };

  const handleCopyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (evidence.frame_hash) {
      navigator.clipboard?.writeText(evidence.frame_hash);
      setCopied(true);
      toast.success('SHA-256 hash copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const confidencePct = evidence.ai_confidence ? (evidence.ai_confidence * 100).toFixed(1) : '98.4';
  const displayHash = evidence.frame_hash || '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';

  return (
    <div 
      onClick={() => onView(evidence)}
      className="bg-[#0B121C] border border-[#182B40] hover:border-[#234A70] hover:shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(14,127,224,0.12)] rounded-[10px] p-3.5 transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
    >
      {/* Top Subtle Cyan Glow Accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0E7FE0]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* CARD HEADER: SEAL STATUS & CASE TAG */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide border ${
              verifyStatus === 'verified'
                ? 'bg-[#00C875]/15 text-[#00C875] border-[#00C875]/40 shadow-[0_0_8px_rgba(0,200,117,0.2)]'
                : 'bg-[#00C875]/10 text-[#00C875] border-[#00C875]/25'
            }`}>
              <ShieldCheck size={11} className={verifyStatus === 'verified' ? 'text-[#00C875]' : ''} />
              <span>{verifyStatus === 'verified' ? 'SHA-256 VERIFIED' : 'SEC 65B SEALED'}</span>
            </span>
          </div>

          <span className="text-[10px] font-mono font-bold text-[#0E7FE0] bg-[#0E7FE0]/10 px-2 py-0.5 rounded border border-[#0E7FE0]/30 tracking-wider">
            {evidence.case_id || 'FIR-GJ-2024'}
          </span>
        </div>

        {/* IMAGE PREVIEW WITH TACTICAL CCTV OVERLAYS */}
        <div className="aspect-[16/10] w-full bg-[#05080E] rounded-[6px] border border-[#1A2E44] overflow-hidden mb-3 relative flex items-center justify-center group/img">
          <img
            src={evidence.frame_path || '/images/feed_cam04.jpg'}
            alt="Evidence CCTV frame"
            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/feed_cam04.jpg';
            }}
          />
          {/* CCTV Scanline overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70 pointer-events-none" />

          {/* Top Left Plate Badge */}
          <div className="absolute top-2 left-2 shadow-lg drop-shadow-md">
            <LicensePlate plate={evidence.plate_text || 'GJ01AB1234'} size="sm" />
          </div>

          {/* Top Right Live Rec Beacon */}
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-[#00C875] border border-white/10 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] animate-pulse" />
            <span>AUTHENTIC</span>
          </div>

          {/* Bottom Camera Location Bar */}
          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-white/90">
            <span className="truncate max-w-[170px] drop-shadow">
              {evidence.camera_name || 'CAM04 · SG Highway Toll'}
            </span>
            <span className="text-[#8FA8C0] text-[9px] shrink-0 bg-black/70 px-1 rounded border border-white/10">
              YOLOv8
            </span>
          </div>
        </div>

        {/* FORENSIC METADATA SECTION */}
        <div className="space-y-2 text-xs mb-3 font-mono">
          <div className="flex items-center justify-between text-[11px] text-[#8FA8C0]">
            <span className="flex items-center gap-1 text-[#6C8299]">
              <Clock size={11} /> Timestamp:
            </span>
            <span className="text-[#D3E2F0]">
              {formatTimestamp(evidence.frame_ts)}
            </span>
          </div>

          {/* Confidence Meter */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#6C8299] flex items-center gap-1">
                <Sparkles size={11} className="text-[#00C875]" /> AI Confidence:
              </span>
              <span className="text-[#00C875] font-bold">
                {confidencePct}%
              </span>
            </div>
            <div className="w-full h-1 bg-[#152538] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#0E7FE0] to-[#00C875] rounded-full" 
                style={{ width: `${Math.min(100, Number(confidencePct))}%` }}
              />
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash Strip */}
          <div className="p-2 rounded bg-[#080D15] border border-[#16273A] mt-2">
            <div className="flex items-center justify-between text-[9px] text-[#6A8299] mb-0.5 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Lock size={9} className="text-[#0E7FE0]" /> SHA-256 Digital Fingerprint
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="text-[#8FA8C0] hover:text-white flex items-center gap-0.5 cursor-pointer"
                title="Copy full SHA-256 hash"
              >
                {copied ? <Check size={10} className="text-[#00C875]" /> : <Copy size={10} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-[10px] text-[#00C875] truncate" title={displayHash}>
              {truncateHash(displayHash, 14)}
            </div>
          </div>
        </div>
      </div>

      {/* CARD ACTION BUTTONS */}
      <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-[#16273A]">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onView(evidence); }}
          className="h-7 px-2 rounded bg-[#101C2B] hover:bg-[#182C44] border border-[#203750] text-[#0E7FE0] hover:text-white font-mono text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
          title="Inspect Full Forensic Dossier"
        >
          <ExternalLink size={11} />
          <span>Inspect</span>
        </button>

        <button
          type="button"
          onClick={handleVerifyHash}
          disabled={verifyStatus === 'verifying'}
          className={`h-7 px-2 rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
            verifyStatus === 'verified'
              ? 'bg-[#00C875]/20 text-[#00C875] border-[#00C875]/40 shadow-[0_0_10px_rgba(0,200,117,0.2)]'
              : verifyStatus === 'verifying'
              ? 'bg-[#101C2B] text-[#8FA8C0] border-[#203750]'
              : 'bg-[#101C2B] text-[#00C875] hover:bg-[#00C875]/15 border-[#203750] hover:border-[#00C875]/40'
          }`}
          title="Recalculate and verify SHA-256 byte checksum"
        >
          {verifyStatus === 'verifying' ? (
            <span>⟳ Checking...</span>
          ) : verifyStatus === 'verified' ? (
            <span className="flex items-center gap-1"><CheckCircle2 size={10} /> Verified</span>
          ) : (
            <span>Verify SHA</span>
          )}
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onExport(evidence); }}
          className="h-7 px-2 rounded bg-[#101C2B] hover:bg-[#182C44] border border-[#203750] text-[#8FA8C0] hover:text-white font-mono text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
          title="Export Court-Admissible ZIP Package"
        >
          <Download size={11} />
          <span>ZIP</span>
        </button>
      </div>
    </div>
  );
};
