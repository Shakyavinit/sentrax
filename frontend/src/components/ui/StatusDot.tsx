import React from 'react';
import { CameraStatus } from '../../types';

interface StatusDotProps {
  status: CameraStatus | 'alert';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, size = 'md', showLabel = false }) => {
  const sizeMap = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const getStatusClasses = () => {
    switch (status) {
      case 'online':
        return 'bg-[#00C875] text-[#00C875] shadow-[0_0_8px_#00C875]';
      case 'warning':
        return 'bg-[#FF8C00] text-[#FF8C00] animate-pulse-dot';
      case 'alert':
        return 'bg-[#FF3B3B] text-[#FF3B3B] animate-pulse-dot';
      case 'offline':
      default:
        return 'bg-[#4D6B85] text-[#4D6B85]';
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`rounded-full inline-block ${sizeMap[size]} ${getStatusClasses()}`} />
      {showLabel && (
        <span className="text-xs uppercase tracking-wider font-mono text-[#8FA8C0]">
          {status}
        </span>
      )}
    </div>
  );
};
