import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  noPadding = false,
}) => {
  return (
    <div
      className={`bg-[#0D1520] border border-[#1C2E42] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.5),0_0_0_1px_#1C2E42] overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1C2E42]">
          <div>
            <h3 className="text-sm font-semibold text-[#E8EFF7] tracking-tight">{title}</h3>
            {subtitle && <p className="text-[11px] text-[#8FA8C0] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4'}>{children}</div>
    </div>
  );
};
