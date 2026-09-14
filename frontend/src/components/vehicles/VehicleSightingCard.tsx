import React from 'react';
import { Sighting } from '../../types';
import { LicensePlate } from '../ui/LicensePlate';
import { ConfidenceBadge } from '../ui/Badge';
import { formatTimestamp } from '../../utils/format';
import { ShieldAlert, Archive, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';

interface VehicleSightingCardProps {
  sighting: Sighting;
  onPreserveEvidence?: (sighting: Sighting) => void;
  onSelect?: (sighting: Sighting) => void;
  isSelected?: boolean;
}

export const VehicleSightingCard: React.FC<VehicleSightingCardProps> = ({
  sighting,
  onPreserveEvidence,
  onSelect,
  isSelected = false,
}) => {
  return (
    <div
      onClick={() => onSelect && onSelect(sighting)}
      className={`p-3 bg-[#0D1520] border rounded-[6px] transition-all cursor-pointer ${
        isSelected
          ? 'border-[#0E7FE0] bg-[#1F3050]/40 shadow-[0_0_12px_rgba(14,127,224,0.15)]'
          : 'border-[#1C2E42] hover:border-[#2E4E70]'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <LicensePlate plate={sighting.plate_text || 'UNKNOWN'} size="sm" />
          <ConfidenceBadge confidence={sighting.plate_conf} />
        </div>
        <span className="text-[10px] font-mono text-[#8FA8C0]">
          {formatTimestamp(sighting.frame_ts)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[#E8EFF7] mb-2 font-medium">
        <MapPin className="w-3.5 h-3.5 text-[#0E7FE0] flex-shrink-0" />
        <span className="truncate">
          {sighting.camera_name || sighting.camera_identifier || 'Camera Feed'}
        </span>
      </div>

      {/* Visual ANPR Confidence Progress Bar */}
      <div className="my-2">
        <div className="flex justify-between items-center text-[10px] mb-1">
          <span className="text-[#8FA8C0]">ANPR Confidence</span>
          <span className={`font-mono font-bold ${
            (sighting.plate_conf || 0) >= 0.85 ? 'text-[#00C875]' :
            (sighting.plate_conf || 0) >= 0.70 ? 'text-[#FF8C00]' : 'text-[#FF3B3B]'
          }`}>
            {((sighting.plate_conf || 0) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-[#16202C] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              (sighting.plate_conf || 0) >= 0.85 ? 'bg-[#00C875]' :
              (sighting.plate_conf || 0) >= 0.70 ? 'bg-[#FF8C00]' : 'bg-[#FF3B3B]'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, (sighting.plate_conf || 0) * 100))}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#1C2E42] text-[11px] text-[#8FA8C0]">
        <div className="capitalize">
          Class: <strong className="text-[#E8EFF7]">{sighting.vehicle_class || 'Vehicle'}</strong>
        </div>
        {onPreserveEvidence && (
          <Button
            size="sm"
            variant="ghost"
            icon={<Archive className="w-3 h-3" />}
            onClick={(e) => {
              e.stopPropagation();
              onPreserveEvidence(sighting);
            }}
          >
            Preserve
          </Button>
        )}
      </div>
    </div>
  );
};
