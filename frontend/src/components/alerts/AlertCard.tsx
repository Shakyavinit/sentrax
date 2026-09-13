import React from 'react';
import { Alert } from '../../types';
import { LicensePlate } from '../ui/LicensePlate';
import { Badge, ConfidenceBadge } from '../ui/Badge';
import { formatTimestamp } from '../../utils/format';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface AlertCardProps {
  alert: Alert;
  onSelect?: (alert: Alert) => void;
  onAcknowledge?: (alert: Alert) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onSelect, onAcknowledge }) => {
  const priorityVariant =
    alert.priority === 'critical'
      ? 'alert'
      : alert.priority === 'high'
      ? 'warn'
      : 'info';

  return (
    <div
      onClick={() => onSelect && onSelect(alert)}
      className="bg-[#0D1520] bg-gradient-to-r from-[rgba(255,59,59,0.12)] via-transparent to-transparent border-l-[3px] border-l-[#FF3B3B] border border-[#1C2E42] rounded-[4px] p-3 transition-all hover:bg-[#121E2E] cursor-pointer relative overflow-hidden animate-slide-in shadow-[0_0_16px_rgba(255,59,59,0.1)]"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={priorityVariant}>{alert.priority}</Badge>
          <span className="text-[10px] font-mono text-[#8FA8C0]">
            {alert.camera_identifier || 'CAM'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#8FA8C0]">
          {formatTimestamp(alert.triggered_at)}
        </span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <LicensePlate plate={alert.plate_text} size="sm" />
        <ConfidenceBadge confidence={alert.plate_conf} />
      </div>

      {alert.watchlist_reason && (
        <p className="text-[11px] text-[#8FA8C0] line-clamp-2 mb-3 bg-[#080C12]/50 p-1.5 rounded border border-[#1C2E42]">
          {alert.watchlist_reason}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[#1C2E42]">
        <span
          className={`text-[10px] font-mono font-bold uppercase ${
            alert.status === 'active' ? 'text-[#FF3B3B]' : 'text-[#00C875]'
          }`}
        >
          {alert.status}
        </span>
        {alert.status === 'active' && onAcknowledge && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onAcknowledge(alert);
            }}
          >
            Acknowledge
          </Button>
        )}
      </div>
    </div>
  );
};
