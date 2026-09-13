import React from 'react';
import { formatPlate } from '../../utils/format';

interface LicensePlateProps {
  plate: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LicensePlate: React.FC<LicensePlateProps> = ({ plate, size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'text-xs px-1.5 py-0.5 tracking-wider',
    md: 'text-sm px-2.5 py-0.5 tracking-widest',
    lg: 'text-base px-3.5 py-1 tracking-widest',
  };

  const formatted = formatPlate(plate);

  return (
    <div
      className={`inline-flex items-center justify-center font-mono font-bold bg-[#FFFFFF] text-[#080C12] rounded-[2px] border border-[#CCCCCC] shadow-[0_1px_4px_rgba(0,0,0,0.4)] select-all ${sizeStyles[size]} ${className}`}
      title={formatted}
    >
      <span className="mr-1 text-[9px] font-sans font-semibold text-[#1A2A3D] opacity-60">IND</span>
      {formatted || 'UNKNOWN'}
    </div>
  );
};
