import React from 'react';

interface PageHeaderProps {
  title: string;
  category?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  category = 'STATE INTELLIGENCE OPERATIONS',
  description,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1F293D] gap-3">
      <div>
        <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
          {category}
        </div>
        <h1 className="text-lg font-bold text-slate-100 tracking-tight mt-0.5">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
};
