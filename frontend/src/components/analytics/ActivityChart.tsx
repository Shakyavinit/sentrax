import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ActivityDataPoint } from '../../types';

interface ActivityChartProps {
  data: ActivityDataPoint[];
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-[#0B131E]/95 backdrop-blur-md border border-[#1E364F] rounded-md p-2.5 shadow-2xl font-mono text-xs">
        <div className="flex items-center justify-between gap-3 text-[10px] text-[#7E9AB5] pb-1.5 border-b border-[#1E364F]/60">
          <span>TIME WINDOW:</span>
          <span className="text-white font-bold">{label}</span>
        </div>
        <div className="pt-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0E7FE0] shadow-[0_0_8px_#0E7FE0]" />
            <span className="text-[#8FA8C0] text-[11px]">Vehicle Scans:</span>
          </div>
          <span className="text-[#0E7FE0] font-bold text-sm">{Number(value).toLocaleString()}</span>
        </div>
        <div className="mt-1.5 text-[9px] text-[#4D6B85] flex items-center justify-between">
          <span>OCR Pipeline:</span>
          <span className="text-emerald-400 font-medium">96.2% Confirmed</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, height = 260 }) => {
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.total || 0)) : 0;
  const avgValue = data.length > 0 ? Math.round(data.reduce((acc, d) => acc + (d.total || 0), 0) / data.length) : 0;

  return (
    <div className="w-full flex flex-col h-full">
      {/* Mini Stats Bar */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#7E9AB5] pb-2 mb-1 border-b border-[#142233]">
        <div className="flex items-center gap-3">
          <span>
            PEAK SCANS: <strong className="text-white">{maxValue.toLocaleString()}</strong>
          </span>
          <span className="text-[#1C2E42]">|</span>
          <span>
            HOURLY AVG: <strong className="text-[#0E7FE0]">{avgValue.toLocaleString()}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          <span>YOLOv8 + EASYOCR</span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 12, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="tacticalVelocityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0E7FE0" stopOpacity={0.45} />
                <stop offset="60%" stopColor="#0E7FE0" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#0E7FE0" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#162638" vertical={false} />
            <XAxis
              dataKey="hour"
              stroke="#4D6B85"
              fontSize={10}
              tickLine={false}
              fontFamily="JetBrains Mono, monospace"
            />
            <YAxis
              stroke="#4D6B85"
              fontSize={10}
              tickLine={false}
              fontFamily="JetBrains Mono, monospace"
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              name="Vehicle Scans"
              stroke="#0E7FE0"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#tacticalVelocityGrad)"
              activeDot={{
                r: 5,
                fill: '#1A9FFF',
                stroke: '#E8EFF7',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
