import React from 'react';

export type StatusType = 'operational' | 'warning' | 'critical' | 'info' | 'offline';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  showDot = true,
}) => {
  const normStatus = (status || '').toLowerCase();

  let dotColor = 'bg-slate-400';
  let badgeClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (normStatus === 'operational' || normStatus === 'online' || normStatus === 'active' || normStatus === 'resolved') {
    dotColor = 'bg-emerald-500';
    badgeClasses = 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40';
  } else if (normStatus === 'warning' || normStatus === 'degraded' || normStatus === 'medium' || normStatus === 'acknowledged') {
    dotColor = 'bg-amber-500';
    badgeClasses = 'bg-amber-950/30 text-amber-400 border-amber-800/40';
  } else if (normStatus === 'critical' || normStatus === 'high' || normStatus === 'new' || normStatus === 'tampered' || normStatus === 'error') {
    dotColor = 'bg-red-500';
    badgeClasses = 'bg-red-950/30 text-red-400 border-red-800/40';
  } else if (normStatus === 'info' || normStatus === 'dispatched') {
    dotColor = 'bg-blue-500';
    badgeClasses = 'bg-blue-950/30 text-blue-400 border-blue-800/40';
  } else if (normStatus === 'offline' || normStatus === 'stopped' || normStatus === 'maintenance') {
    dotColor = 'bg-slate-500';
    badgeClasses = 'bg-slate-900 text-slate-400 border-slate-800';
  }

  const textLabel = label || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded uppercase tracking-wider ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${badgeClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      <span>{textLabel}</span>
    </span>
  );
};
