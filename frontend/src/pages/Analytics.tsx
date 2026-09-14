import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ActivityChart } from '../components/analytics/ActivityChart';
import { HeatmapChart } from '../components/analytics/HeatmapChart';
import { Card } from '../components/ui/Card';
import { LicensePlate } from '../components/ui/LicensePlate';
import { Badge } from '../components/ui/Badge';
import { analyticsApi } from '../api/analytics';
import { assetUrl } from '../utils/demo';
import { TrendingUp, ArrowUpRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const PLATE_PHOTOS: Record<string, string> = {
  GJ01AB1234: 'hit_scorpio_clean.jpg',
  UP32PQ6677: 'hit_fortuner_clean.jpg',
  GJ05CD5678: 'hit_swift_clean.jpg',
  GJ18IJ7890: 'car_gj18ij7890.jpg',
  MH12EF9012: 'car_mh12ef9012.jpg',
  RJ14GH3456: 'car_rj14gh3456.jpg',
};

const VEHICLE_CLASSES = [
  { name: 'Light Passenger / Car', share: '64%', count: '3,635', image: 'hit_swift_clean.jpg', color: 'bg-[#0E7FE0]' },
  { name: 'Commercial / Heavy Cargo', share: '22%', count: '1,250', image: 'car_rj14gh3456.jpg', color: 'bg-amber-500' },
  { name: 'Two-Wheeler / Commuter', share: '10%', count: '568', image: 'car_gj18ij7890.jpg', color: 'bg-emerald-500' },
  { name: 'Transit / Public Bus', share: '4%', count: '227', image: 'car_mh12ef9012.jpg', color: 'bg-purple-500' },
];

export const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('24h');
  const navigate = useNavigate();

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

  const kpis = [
    {
      label: 'Operational Surveillance Nodes',
      value: `${summary?.cameras_online ?? 11} / ${summary?.cameras_total ?? 15}`,
      subValue: '11 Live Feeds · 4 Signal Loss',
      image: 'cctv_camera_3d.png',
      badge: 'ACTIVE SOC',
      badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      to: '/cameras',
    },
    {
      label: 'Correlated Vehicle Scans',
      value: summary?.vehicles_detected_today ? `${summary.vehicles_detected_today * 4}` : '5,680',
      subValue: '+14.2% scanning velocity',
      image: 'police_car_3d.png',
      badge: '+14.2% TODAY',
      badgeColor: 'text-[#0E7FE0] bg-[#0E7FE0]/15 border-[#0E7FE0]/30',
      to: '/investigation',
    },
    {
      label: 'Flagged Interceptions',
      value: `${summary?.active_alerts ?? 3} Alerts`,
      subValue: '2 Warrants · 1 Speed Anomaly',
      image: 'alert_beacon_3d.png',
      badge: 'HIGH PRIORITY',
      badgeColor: 'text-red-400 bg-red-500/15 border-red-500/30',
      highlightAlert: true,
      to: '/alerts',
    },
    {
      label: 'Validated Plate Extractions',
      value: summary?.plates_scanned ? `${summary.plates_scanned}` : '8,924',
      subValue: '96.2% Indian Syntax Match',
      image: 'plate_scanner_3d.png',
      badge: '96.2% OCR CONF',
      badgeColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      to: '/investigation',
    },
  ];

  return (
    <div className="space-y-4 pb-4">
      {/* ─── PAGE HEADER WITH TACTICAL EYEBROW & PERIOD SELECTOR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1C2E42]">
        <div>
          <div className="text-[10px] font-mono font-bold text-[#0E7FE0] tracking-widest uppercase flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E7FE0] animate-pulse" />
            <span>ANALYTICS & DIGITAL FORENSICS INTELLIGENCE</span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Forensic Analytics & Intelligence Metrics</span>
          </h1>
          <p className="text-xs text-[#8FA8C0]">
            Surveillance telemetry, traffic intensity heatmaps, and ANPR OCR model diagnostics.
          </p>
        </div>

        {/* Time Period Filter Tabs */}
        <div className="flex items-center bg-[#0D1520] border border-[#1C2E42] rounded-lg p-0.5 text-xs font-mono shadow-sm">
          {(['24h', '7d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded transition-colors ${
                period === p
                  ? 'bg-[#0E7FE0] text-white font-bold'
                  : 'text-[#8FA8C0] hover:text-white'
              }`}
            >
              {p === '24h' ? '24 Hours' : p === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── ROW 1: KPI STAT CARDS WITH 3D PHOTOS & HOVER COLOR REVEAL ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            onClick={() => navigate(kpi.to)}
            className={`p-3.5 bg-[#0D1520] border rounded-lg shadow-md transition-all cursor-pointer relative overflow-hidden group ${
              kpi.highlightAlert
                ? 'border-red-500/50 bg-red-950/10 hover:border-red-400'
                : 'border-[#1C2E42] hover:border-[#385575] hover:bg-[#101B2B]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border ${kpi.badgeColor}`}>
                    {kpi.badge}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#8FA8C0] uppercase tracking-wider truncate mb-1">
                  {kpi.label}
                </div>
                <div className="text-2xl font-mono font-bold text-white tracking-tight mb-1">
                  {kpi.value}
                </div>
                <div className="text-[10px] font-mono text-[#8FA8C0] truncate">
                  {kpi.subValue}
                </div>
              </div>

              {/* Real 3D Photographic Asset with Color Reveal on Hover */}
              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center relative">
                <img
                  src={assetUrl('images/' + kpi.image)}
                  alt={kpi.label}
                  className="w-14 h-14 object-contain color-reveal transition-all duration-300"
                />
              </div>
            </div>

            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#8FA8C0]">
              <ArrowUpRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* ─── ROW 2: VELOCITY TREND (7 cols) + TOP PLATES DOSSIERS (5 cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Detection Velocity Chart */}
        <div className="lg:col-span-7 bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2E42] mb-3">
            <div className="flex items-center gap-2.5">
              <img
                src={assetUrl('images/traffic_city_junction_thumb.jpg')}
                alt="Traffic"
                className="w-7 h-7 rounded object-cover border border-[#1C2E42] color-reveal"
              />
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Vehicle Detection Velocity Trend
                </h3>
                <p className="text-[10px] text-[#8FA8C0]">
                  ANPR scanning volume across Ahmedabad & Gandhinagar grid ({period})
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#00C875] bg-[#00C875]/10 border border-[#00C875]/30 px-2 py-0.5 rounded">
              ● REAL-TIME AGGREGATION
            </span>
          </div>

          <div className="flex-1 min-h-[260px]">
            <ActivityChart data={activity} height={260} />
          </div>
        </div>

        {/* Most Frequently Seen Registrations with Real Vehicle Crop Photos */}
        <div className="lg:col-span-5 bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2E42] mb-2.5">
            <div className="flex items-center gap-2.5">
              <img
                src={assetUrl('images/hit_scorpio_clean.jpg')}
                alt="Target Vehicle"
                className="w-7 h-7 rounded object-cover border border-[#1C2E42] color-reveal"
              />
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Frequently Identified Registrations
                </h3>
                <p className="text-[10px] text-[#8FA8C0]">
                  Top vehicles correlated in the surveillance observation window
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#8FA8C0]">
              TOP {topPlates.slice(0, 6).length}
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono text-[#8FA8C0] border-b border-[#1C2E42] uppercase">
                <tr>
                  <th className="pb-2">Vehicle / Plate</th>
                  <th className="pb-2">Detections</th>
                  <th className="pb-2">Last Seen</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2E42]">
                {topPlates.slice(0, 6).map((tp) => {
                  const photo = PLATE_PHOTOS[tp.plate_text] || 'hit_swift_clean.jpg';

                  return (
                    <tr
                      key={tp.plate_text}
                      onClick={() => navigate(`/investigation?plate=${tp.plate_text}`)}
                      className="hover:bg-[#121E2E] cursor-pointer transition-colors group"
                    >
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={assetUrl('images/' + photo)}
                            alt={tp.plate_text}
                            className="w-9 h-6 object-cover rounded border border-[#1C2E42] color-reveal group-hover:scale-105 transition-transform"
                          />
                          <LicensePlate plate={tp.plate_text} size="sm" />
                        </div>
                      </td>
                      <td className="py-2 font-mono text-white font-bold">{tp.count}</td>
                      <td className="py-2 text-[10px] font-mono text-[#8FA8C0]">{tp.last_seen}</td>
                      <td className="py-2 text-right">
                        {tp.is_watchlist ? (
                          <Badge variant="alert">WATCHLIST</Badge>
                        ) : (
                          <Badge variant="ok">CLEAN</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── ROW 3: SPATIAL HEATMAP (7 cols) + OCR CONFIDENCE & VEHICLE CLASSES (5 cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Heatmap Matrix */}
        <div className="lg:col-span-7 bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2E42] mb-3">
            <div className="flex items-center gap-2.5">
              <img
                src={assetUrl('images/gujarat_hud_map.jpg')}
                alt="Topology"
                className="w-7 h-7 rounded object-cover border border-[#1C2E42] color-reveal"
              />
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Surveillance Intensity Heatmap (Camera vs. Hour)
                </h3>
                <p className="text-[10px] text-[#8FA8C0]">
                  Density correlation across urban CCTV nodes over 24-hour cycle
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#0E7FE0]">
              24-HR CYCLE
            </span>
          </div>

          <div className="flex-1">
            <HeatmapChart data={heatmapData} />
          </div>
        </div>

        {/* OCR Confidence Histogram & Vehicle Class Breakdown */}
        <div className="lg:col-span-5 bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 shadow-lg flex flex-col gap-3">
          {/* Section A: Vehicle Class Breakdown with Real Photos */}
          <div>
            <div className="flex items-center gap-2 pb-1.5 border-b border-[#1C2E42] mb-2">
              <img
                src={assetUrl('images/police_car_3d.png')}
                alt="Vehicle Classes"
                className="w-5 h-5 object-contain color-reveal"
              />
              <span className="text-xs font-mono font-bold text-white uppercase">
                Vehicle Classification Breakdown
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {VEHICLE_CLASSES.map((vc) => (
                <div
                  key={vc.name}
                  className="p-2 bg-[#080C12] border border-[#1C2E42] rounded flex items-center gap-2 group hover:border-[#2A4462] transition-colors"
                >
                  <img
                    src={assetUrl('images/' + vc.image)}
                    alt={vc.name}
                    className="w-8 h-6 object-cover rounded border border-[#1C2E42] color-reveal group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-white font-bold">{vc.share}</span>
                      <span className="text-[#8FA8C0]">{vc.count}</span>
                    </div>
                    <div className="text-[9px] text-[#8FA8C0] truncate">{vc.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: OCR Model Confidence Distribution */}
          <div className="flex-1 flex flex-col pt-1 border-t border-[#1C2E42]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <img
                  src={assetUrl('images/plate_scanner_3d.png')}
                  alt="OCR"
                  className="w-5 h-5 object-contain color-reveal"
                />
                <span className="text-xs font-mono font-bold text-white uppercase">
                  OCR Accuracy Distribution
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#00C875]">96.2% AVG ACCURACY</span>
            </div>

            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confDist} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
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
          </div>
        </div>
      </div>
    </div>
  );
};
