import React from 'react';
import { Sighting } from '../../types';
import { LicensePlate } from '../ui/LicensePlate';
import { formatTimestamp } from '../../utils/format';
import { Archive, MapPin } from 'lucide-react';

interface VehicleSightingCardProps {
  sighting: Sighting;
  onPreserveEvidence?: (sighting: Sighting) => void;
  onSelect?: (sighting: Sighting) => void;
  isSelected?: boolean;
  index?: number;
}

export const VehicleSightingCard: React.FC<VehicleSightingCardProps> = ({
  sighting,
  onPreserveEvidence,
  onSelect,
  isSelected = false,
  index,
}) => {
  const confPercent = Math.round((sighting.plate_conf || 0) * 100);
  const confColor =
    confPercent >= 85 ? 'text-[#00C875]' : confPercent >= 70 ? 'text-[#FF8C00]' : 'text-[#FF3B3B]';
  const confBg =
    confPercent >= 85 ? 'bg-[#00C875]' : confPercent >= 70 ? 'bg-[#FF8C00]' : 'bg-[#FF3B3B]';

  return (
    <div
      onClick={() => onSelect && onSelect(sighting)}
      className={`p-2.5 bg-[#0D1520] border rounded-lg transition-all cursor-pointer select-none ${
        isSelected
          ? 'border-[#0E7FE0] bg-[#142338] shadow-[0_0_12px_rgba(14,127,224,0.25)] border-l-4 border-l-[#0E7FE0]'
          : 'border-[#1C2E42] hover:border-[#2E4E70] hover:bg-[#101B2B]'
      }`}
    >
      {/* Row 1: Plate Tag + Sighting Index + Timestamp */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          {index !== undefined && (
            <span className="px-1.5 py-0.5 rounded bg-[#162536] border border-[#223850] text-[10px] font-mono font-bold text-[#8FA8C0]">
              #{String(index + 1).padStart(2, '0')}
            </span>
          )}
          <LicensePlate plate={sighting.plate_text || 'UNKNOWN'} size="sm" />
        </div>
        <span className="text-[10px] font-mono text-[#8FA8C0]">
          {formatTimestamp(sighting.frame_ts)}
        </span>
      </div>

      {/* Row 2: Camera Name / Location */}
      <div className="flex items-center gap-1.5 text-xs text-[#E8EFF7] mb-2 font-medium">
        <MapPin className="w-3.5 h-3.5 text-[#0E7FE0] flex-shrink-0" />
        <span className="truncate font-sans font-semibold">
          {sighting.camera_name || sighting.camera_identifier || 'Camera Feed'}
        </span>
      </div>

      {/* Row 3: Confidence Micro-meter + Class Chip + Action Button */}
      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#1C2E42]/80 text-[11px]">
        {/* Confidence Meter */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
          <div className="w-16 h-1.5 bg-[#16202C] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${confBg}`}
              style={{ width: `${Math.min(100, Math.max(5, confPercent))}%` }}
            />
          </div>
          <span className={`font-mono text-[10px] font-bold ${confColor}`}>
            {confPercent}% Match
          </span>
          <span className="text-[#8FA8C0] text-[10px] font-mono capitalize ml-1">
            · {sighting.vehicle_class || 'Car'}
          </span>
        </div>

        {/* Preserve Button */}
        {onPreserveEvidence && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreserveEvidence(sighting);
            }}
            className="px-2 py-0.5 rounded bg-[#162334] hover:bg-[#0E7FE0] text-[#8FA8C0] hover:text-white border border-[#223850] hover:border-[#0E7FE0] font-mono text-[10px] font-semibold flex items-center gap-1 transition-colors"
            title="Preserve cryptographic evidence"
          >
            <Archive className="w-2.5 h-2.5" />
            <span>Preserve</span>
          </button>
        )}
      </div>
    </div>
  );
};
