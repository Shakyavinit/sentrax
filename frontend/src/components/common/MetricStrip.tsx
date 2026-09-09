import React from 'react';

export interface MetricItem {
  label: string;
  value: string | number;
  sublabel?: string;
  status?: 'operational' | 'warning' | 'critical' | 'neutral';
}

interface MetricStripProps {
  metrics: MetricItem[];
}

export const MetricStrip: React.FC<MetricStripProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-[#1F293D] border border-[#1F293D] rounded-lg bg-[#111827]">
      {metrics.map((m, idx) => {
        let valueColor = 'text-slate-100';
        if (m.status === 'operational') valueColor = 'text-emerald-400';
        else if (m.status === 'warning') valueColor = 'text-amber-400';
        else if (m.status === 'critical') valueColor = 'text-red-400';

        return (
          <div key={idx} className="px-4 py-3">
            <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-medium">
              {m.label}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-xl font-bold font-mono ${valueColor}`}>
                {m.value}
              </span>
              {m.sublabel && (
                <span className="text-[11px] text-slate-400 font-sans truncate">
                  {m.sublabel}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
