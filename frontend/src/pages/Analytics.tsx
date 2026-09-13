import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/analytics/StatCard';
import { ActivityChart } from '../components/analytics/ActivityChart';
import { HeatmapChart } from '../components/analytics/HeatmapChart';
import { Card } from '../components/ui/Card';
import { LicensePlate } from '../components/ui/LicensePlate';
import { Badge } from '../components/ui/Badge';
import { analyticsApi } from '../api/analytics';
import { Camera, Car, ShieldAlert, Scan, BarChart2, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('24h');

  const { data: summary } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: analyticsApi.getSummary,
  });

  const { data: activity = [] } = useQuery({
    queryKey: ['analyticsActivity', period],
    queryFn: () => analyticsApi.getActivity(period),
  });

  const { data: topPlates = [] } = useQuery({
    queryKey: ['topPlates'],
    queryFn: analyticsApi.getTopPlates,
  });

  const { data: heatmapData = [] } = useQuery({
    queryKey: ['heatmapData'],
    queryFn: analyticsApi.getHeatmap,
  });

  const { data: confDist = [] } = useQuery({
    queryKey: ['confDist'],
    queryFn: analyticsApi.getConfidenceDistribution,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forensic Analytics & Intelligence Metrics"
        description="High-level surveillance metrics, traffic intensity heatmaps, and OCR confidence diagnostics."
        actions={
          <div className="flex items-center bg-[#0D1520] border border-[#1C2E42] rounded-[4px] p-0.5 text-xs font-mono">
            <button
              onClick={() => setPeriod('24h')}
              className={`px-3 py-1 rounded-[3px] transition-colors ${
                period === '24h' ? 'bg-[#0E7FE0] text-white' : 'text-[#8FA8C0] hover:text-white'
              }`}
            >
              24 Hours
            </button>
            <button
              onClick={() => setPeriod('7d')}
              className={`px-3 py-1 rounded-[3px] transition-colors ${
                period === '7d' ? 'bg-[#0E7FE0] text-white' : 'text-[#8FA8C0] hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-3 py-1 rounded-[3px] transition-colors ${
                period === '30d' ? 'bg-[#0E7FE0] text-white' : 'text-[#8FA8C0] hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>
        }
      />

      {/* Row 1: KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Operational Nodes"
          value={`${summary?.cameras_online ?? 9}/${summary?.cameras_total ?? 10}`}
          subValue="Active network nodes"
          icon={Camera}
          trend={{ value: 100, isPositive: true }}
        />
        <StatCard
          label="Total Scans (Period)"
          value={summary?.vehicles_detected_today ? `${summary.vehicles_detected_today * 4}` : '5,680'}
          subValue="Across all cameras"
          icon={Car}
          trend={{ value: 14.2, isPositive: true }}
        />
        <StatCard
          label="Active Interceptions"
          value={summary?.active_alerts ?? 3}
          subValue="Flagged targets detected"
          icon={ShieldAlert}
          highlightAlert={true}
        />
        <StatCard
          label="Unique Plate Identifications"
          value={summary?.plates_scanned ? `${summary.plates_scanned}` : '8,924'}
          subValue="Validated Indian syntax"
          icon={Scan}
          trend={{ value: 9.1, isPositive: true }}
        />
      </div>

      {/* Row 2: Detection Activity Chart */}
      <Card
        title="Vehicle Detection Velocity Trend"
        subtitle={`Aggregated detection counts across ${period === '24h' ? 'the past 24 hours' : period}`}
      >
        <ActivityChart data={activity} height={280} />
      </Card>

      {/* Row 3: Hourly Heatmap Matrix + Top Plates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-7">
          <Card
            title="Surveillance Intensity Heatmap (Camera vs. Hour)"
            subtitle="Identification density across top camera nodes over 24-hour cycle"
          >
            <HeatmapChart data={heatmapData} />
          </Card>
        </div>

        {/* Top Plates Table */}
        <div className="lg:col-span-5">
          <Card
            title="Most Frequently Seen Registrations"
            subtitle="Top identified vehicles in the observation window"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-mono text-[#8FA8C0] border-b border-[#1C2E42] uppercase">
                  <tr>
                    <th className="pb-2">Plate</th>
                    <th className="pb-2">Detections</th>
                    <th className="pb-2">Last Seen</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2E42]">
                  {topPlates.slice(0, 6).map((tp) => (
                    <tr key={tp.plate_text} className="hover:bg-[#121E2E]">
                      <td className="py-2.5">
                        <LicensePlate plate={tp.plate_text} size="sm" />
                      </td>
                      <td className="py-2.5 font-mono text-white font-bold">{tp.count}</td>
                      <td className="py-2.5 text-[10px] font-mono text-[#8FA8C0]">{tp.last_seen}</td>
                      <td className="py-2.5 text-right">
                        {tp.is_watchlist ? (
                          <Badge variant="alert">WATCHLIST</Badge>
                        ) : (
                          <Badge variant="ok">CLEAN</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 4: ANPR Confidence Distribution */}
      <Card
        title="OCR Model Confidence Distribution"
        subtitle="Accuracy histogram of license plate OCR character extractions"
      >
        <div className="h-48 w-full">
          <ResponsiveContainer>
            <BarChart data={confDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2E42" vertical={false} />
              <XAxis
                dataKey="bucket"
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
              <Bar dataKey="count" name="Plate Detections" fill="#0E7FE0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
