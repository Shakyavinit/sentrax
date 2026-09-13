import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  highlightAlert?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  highlightAlert = false,
}) => {
  return (
    <div
      className={`p-4 bg-[#0D1520] border rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all ${
        highlightAlert && Number(value) > 0
          ? 'border-[#FF3B3B] bg-[rgba(255,59,59,0.05)] shadow-[0_0_12px_rgba(255,59,59,0.15)]'
          : 'border-[#1C2E42]'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono tracking-wider text-[#8FA8C0] uppercase">
          {label}
        </span>
        <div
          className={`p-2 rounded-[4px] ${
            highlightAlert && Number(value) > 0
              ? 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
              : 'bg-[#121E2E] text-[#0E7FE0]'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div
          className={`text-2xl font-mono font-bold tracking-tight ${
            highlightAlert && Number(value) > 0 ? 'text-[#FF3B3B]' : 'text-[#E8EFF7]'
          }`}
        >
          {value}
        </div>
        {trend && (
          <div
            className={`flex items-center text-[11px] font-mono font-medium ${
              trend.isPositive ? 'text-[#00C875]' : 'text-[#FF3B3B]'
            }`}
          >
            {trend.isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>

      {subValue && <div className="text-[11px] text-[#4D6B85] mt-1 font-mono">{subValue}</div>}
    </div>
  );
};
