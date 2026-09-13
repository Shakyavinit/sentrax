import React, { useState } from 'react';
import { X, CheckCircle, Ban, Archive, Route, User } from 'lucide-react';
import { Alert } from '../../types';
import { LicensePlate } from '../ui/LicensePlate';
import { ConfidenceBadge, Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatTimestamp } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { VehicleDossierModal } from '../vehicles/VehicleDossierModal';

interface AlertDrawerProps {
  alert: Alert | null;
  onClose: () => void;
  onAcknowledge: (alert: Alert) => void;
  onDismiss: (alert: Alert) => void;
  onPreserveEvidence?: (alert: Alert) => void;
}

export const AlertDrawer: React.FC<AlertDrawerProps> = ({
  alert,
  onClose,
  onAcknowledge,
  onDismiss,
  onPreserveEvidence,
}) => {
  const navigate = useNavigate();
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  if (!alert) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[420px] bg-[#0D1520] border-l border-[#2E4E70] shadow-[0_24px_48px_rgba(0,0,0,0.8)] flex flex-col animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1C2E42] bg-[#0A101A]">
        <div className="flex items-center gap-2">
          <Badge variant={alert.priority === 'critical' ? 'alert' : 'warn'}>
            {alert.priority} ALERT
          </Badge>
          <span className="text-xs font-mono text-[#8FA8C0]">#{alert.id.slice(0, 8)}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#8FA8C0] hover:text-white rounded hover:bg-[#121E2E]"
          aria-label="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
        {/* Large License Plate Section */}
        <div className="p-4 bg-[#080C12] border border-[#1C2E42] rounded-[6px] text-center flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-[#8FA8C0] uppercase">
            FLAGGED TARGET PLATE
          </span>
          <LicensePlate plate={alert.plate_text} size="lg" />
          <ConfidenceBadge confidence={alert.plate_conf} />
          <button
            onClick={() => setIsDossierOpen(true)}
            className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-[#0E7FE0] hover:bg-[#0c6ec2] text-white rounded-[4px] text-xs font-mono font-bold transition-colors shadow cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            INSPECT OWNER & CRIME DOSSIER
          </button>
        </div>

        {/* Watchlist Reason */}
        <div>
          <h4 className="text-[11px] font-mono text-[#8FA8C0] uppercase tracking-wider mb-1.5">
            WATCHLIST HIT REASON
          </h4>
          <div className="p-3 bg-[#121E2E] border border-[#233A52] rounded-[4px] text-[#E8EFF7] leading-relaxed">
            {alert.watchlist_reason || 'Flagged for surveillance and law enforcement interception.'}
          </div>
        </div>

        {/* Camera Source Details */}
        <div>
          <h4 className="text-[11px] font-mono text-[#8FA8C0] uppercase tracking-wider mb-1.5">
            LOCATION & SIGHTING INFO
          </h4>
          <div className="p-3 bg-[#121E2E] border border-[#233A52] rounded-[4px] space-y-2">
            <div className="flex justify-between">
              <span className="text-[#8FA8C0]">Camera:</span>
              <span className="font-semibold text-white">{alert.camera_name || 'CAM'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8FA8C0]">Location:</span>
              <span className="text-right text-[#E8EFF7]">{alert.location_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8FA8C0]">Triggered At:</span>
              <span className="font-mono text-[#00C875]">{formatTimestamp(alert.triggered_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8FA8C0]">Vehicle Class:</span>
              <span className="capitalize text-white">{alert.vehicle_class || 'Car'}</span>
            </div>
          </div>
        </div>

        {/* Frame Snapshot */}
        {alert.frame_path && (
          <div>
            <h4 className="text-[11px] font-mono text-[#8FA8C0] uppercase tracking-wider mb-1.5">
              CCTV FRAME CAPTURE
            </h4>
            <div className="relative aspect-video rounded-[4px] overflow-hidden border border-[#233A52] bg-black">
              <img
                src={alert.frame_path}
                alt="Captured CCTV frame"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-[#1C2E42] bg-[#0A101A] space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {alert.status === 'active' ? (
            <Button
              variant="primary"
              icon={<CheckCircle className="w-4 h-4" />}
              onClick={() => onAcknowledge(alert)}
            >
              Acknowledge
            </Button>
          ) : (
            <div className="flex items-center justify-center text-xs font-mono text-[#00C875] bg-[#121E2E] rounded border border-[#233A52]">
              ACKNOWLEDGED
            </div>
          )}
          <Button
            variant="danger"
            icon={<Ban className="w-4 h-4" />}
            onClick={() => onDismiss(alert)}
          >
            Dismiss
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="ghost"
            icon={<Route className="w-3.5 h-3.5" />}
            onClick={() => {
              onClose();
              navigate(`/journey?plate=${encodeURIComponent(alert.plate_text)}`);
            }}
          >
            Trace Journey
          </Button>
          <Button
            variant="secondary"
            icon={<Archive className="w-3.5 h-3.5" />}
            onClick={() => onPreserveEvidence && onPreserveEvidence(alert)}
          >
            Vault Evidence
          </Button>
        </div>
      </div>

      {/* VAHAN & CCTNS VEHICLE OWNER DOSSIER MODAL */}
      <VehicleDossierModal
        plate={alert.plate_text}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />
    </div>
  );
};
