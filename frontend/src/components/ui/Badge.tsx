import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'ok' | 'warn' | 'alert' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    ok: 'bg-[rgba(0,200,117,0.10)] text-[#00C875] border border-[rgba(0,200,117,0.3)]',
    warn: 'bg-[rgba(255,140,0,0.12)] text-[#FF8C00] border border-[rgba(255,140,0,0.3)]',
    alert: 'bg-[rgba(255,59,59,0.12)] text-[#FF3B3B] border border-[rgba(255,59,59,0.3)]',
    info: 'bg-[rgba(64,169,255,0.12)] text-[#40A9FF] border border-[rgba(64,169,255,0.3)]',
    neutral: 'bg-[#121E2E] text-[#8FA8C0] border border-[#233A52]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[3px] text-[11px] font-mono font-medium uppercase tracking-wider ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const ConfidenceBadge: React.FC<{ confidence?: number }> = ({ confidence }) => {
  if (confidence === undefined || confidence === null) {
    return <Badge variant="neutral">N/A</Badge>;
  }

  const pct = confidence * 100;
  if (pct >= 85) {
    return <Badge variant="ok">{pct.toFixed(1)}%</Badge>;
  } else if (pct >= 60) {
    return <Badge variant="warn">{pct.toFixed(1)}%</Badge>;
  } else {
    return <Badge variant="alert">{pct.toFixed(1)}%</Badge>;
  }
};
