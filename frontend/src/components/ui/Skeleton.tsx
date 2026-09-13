import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-[#121E2E] rounded-[3px] border border-[#1C2E42]/50 ${className}`}
    />
  );
};
