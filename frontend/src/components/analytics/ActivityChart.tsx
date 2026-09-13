import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, height = 260 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1C2E42" vertical={false} />
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
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0D1520',
              border: '1px solid #233A52',
              borderRadius: '4px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              color: '#E8EFF7',
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Vehicle Scans"
            stroke="#0E7FE0"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#1A9FFF', stroke: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
