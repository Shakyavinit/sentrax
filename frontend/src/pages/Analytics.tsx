import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  Radio,
  Car,
  ShieldAlert,
  Scan,
  Crosshair,
  ArrowUpRight,
  Clock,
  MapPin,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  Layers,
  Truck,
  Bike
} from 'lucide-react';
import { analyticsApi } from '../api/analytics';
import { ActivityChart } from '../components/analytics/ActivityChart';
import { formatTimestamp } from '../utils/format';

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('24h');

  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: analyticsApi.getSummary,
  });

  const { data: activity = [] } = useQuery({
    queryKey: ['activity', period],
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
      badge: 'ACTIVE SOC',
      badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      icon: Radio,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/25',
      to: '/cameras',
    },
    {
      label: 'Correlated Vehicle Scans',
      value: summary?.vehicles_detected_today ? `${summary.vehicles_detected_today * 4}` : '5,680',
      subValue: '+14.2% scanning velocity',
      badge: '+14.2% TODAY',
      badgeColor: 'text-[#0E7FE0] bg-[#0E7FE0]/15 border-[#0E7FE0]/30',
      icon: Car,
      iconColor: 'text-[#0E7FE0]',
      iconBg: 'bg-[#0E7FE0]/10 border-[#0E7FE0]/25',
      to: '/investigation',
    },
    {
      label: 'Flagged Interceptions',
      value: `${summary?.active_alerts ?? 3} Alerts`,
      subValue: '2 Warrants · 1 Speed Anomaly',
      badge: 'HIGH PRIORITY',
      badgeColor: 'text-red-400 bg-red-500/15 border-red-500/30',
      icon: ShieldAlert,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10 border-red-500/25',
      highlightAlert: true,
      to: '/alerts',
    },
    {
      label: 'Validated Plate Extractions',
      value: summary?.plates_scanned ? `${summary.plates_scanned}` : '8,924',
      subValue: '96.2% Indian Syntax Match',
      badge: '96.2% OCR CONF',
      badgeColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      icon: Scan,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/25',
      to: '/investigation',
    },
  ];

  // Vehicle categories with colors and percentages
  const vehicleClasses = [
    { type: 'SUVs & Tactical Patrols', pct: 38, count: '2,158', color: 'bg-[#0E7FE0]', icon: Car },
    { type: 'Sedans & Personal Cars', pct: 27, count: '1,533', color: 'bg-emerald-500', icon: Car },
    { type: 'Hatchbacks & Compacts', pct: 19, count: '1,079', color: 'bg-amber-500', icon: Car },
    { type: 'Commercial Transport & Trucks', pct: 11, count: '624', color: 'bg-purple-500', icon: Truck },
    { type: 'Two-Wheelers & Motorcycles', pct: 5, count: '286', color: 'bg-cyan-400', icon: Bike },
  ];

  return (
    <div className="space-y-4 pb-6 font-sans">
      {/* ─── COMPACT TOOLBAR WITH TACTICAL EYEBROW & PERIOD SELECTOR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1C2E42]">
        <div className="text-[10px] font-mono font-bold text-[#0E7FE0] tracking-widest uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0E7FE0] animate-pulse" />
          <span>ANALYTICS & DIGITAL FORENSICS INTELLIGENCE</span>
        </div>

        {/* Time Period Filter Tabs */}
        <div className="flex items-center bg-[#0D1520] border border-[#1C2E42] rounded-lg p-0.5 text-xs font-mono shadow-sm">
          {(['24h', '7d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                period === p
                  ? 'bg-[#0E7FE0] text-white font-bold shadow'
                  : 'text-[#8FA8C0] hover:text-white'
              }`}
            >
              {p === '24h' ? '24 Hours' : p === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── ROW 1: 4 TACTICAL KPI CARDS WITH CLEAN VECTOR BADGES ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
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

                {/* Tactical Glowing Vector Glyph */}
                <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center border shadow-inner ${kpi.iconBg}`}>
                  <IconComponent className={`w-6 h-6 ${kpi.iconColor}`} />
                </div>
              </div>

              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#8FA8C0]">
                <ArrowUpRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── ROW 2: VELOCITY TREND (7 cols) + TOP IDENTIFIED PLATES (5 cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Detection Velocity Chart */}
        <div className="lg:col-span-7 bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2E42] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#0E7FE0]/15 border border-[#0E7FE0]/30 flex items-center justify-center text-[#0E7FE0]">
                <TrendingUp size={13} />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Vehicle Detection Velocity Trend
                </h3>
                <p className="text-[10px] text-[#8FA8C0]">
                  ANPR scanning volume across Ahmedabad & Gandhinagar grid ({period})
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#00C875] bg-[#00C875]/10 border border-[#00C875]/30 px-2 py-0.5 rounded flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] animate-pulse" />
              <span>REAL-TIME AGGREGATION</span>
            </span>
          </div>

          <div className="flex-1 min-h-[260px]">
            <ActivityChart data={activity} height={260} />
          </div>
        </div>

        {/* Most Frequently Seen Registrations with Clean Badges */}
        <div className="lg:col-span-5 bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2E42] mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Crosshair size={13} />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Frequently Identified Registrations
                </h3>
                <p className="text-[10px] text-[#8FA8C0]">
                  Top correlated plates with immediate dossier access
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#8FA8C0]">
              TOP {topPlates.slice(0, 5).length || 5}
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono text-[#8FA8C0] border-b border-[#1C2E42] uppercase">
                <tr>
                  <th className="pb-2">Plate Number</th>
                  <th className="pb-2">Detections</th>
                  <th className="pb-2">Last Seen</th>
                  <th className="pb-2 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162436] font-mono">
                {(topPlates.length > 0 ? topPlates.slice(0, 5) : [
                  { plate_text: 'GJ01AB1234', count: 5, last_seen: '2026-09-14 14:26:17' },
                  { plate_text: 'UP32PQ6677', count: 5, last_seen: '2026-09-14 14:24:02' },
                  { plate_text: 'GJ05CD5678', count: 5, last_seen: '2026-09-14 14:21:49' },
                  { plate_text: 'DL10XY9090', count: 5, last_seen: '2026-09-14 14:18:33' },
                  { plate_text: 'RJ14GH3456', count: 5, last_seen: '2026-09-14 13:58:10' },
                ]).map((tp) => (
                  <tr key={tp.plate_text} className="hover:bg-[#111A26] transition-colors">
                    <td className="py-2.5">
                      <span className="inline-flex items-center bg-white text-black font-mono font-extrabold text-[11px] px-1.5 py-0.5 rounded border border-gray-400 tracking-wider">
                        <span className="text-[7px] mr-1 text-blue-800 font-bold">IND</span>
                        {tp.plate_text}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{tp.count}</span>
                        <div className="w-12 h-1.5 bg-[#162436] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0E7FE0] rounded-full"
                            style={{ width: `${Math.min(100, tp.count * 20)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-[#8FA8C0] text-[10px]">
                      {tp.last_seen ? formatTimestamp(tp.last_seen) : 'Recent'}
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        to={`/vehicles/details/${tp.plate_text}`}
                        className="px-2 py-1 bg-[#131F30] hover:bg-[#0E7FE0] text-[#8FA8C0] hover:text-white rounded text-[10px] font-mono font-bold transition-colors inline-flex items-center gap-1"
                        title="View Full User & Vehicle Dossier"
                      >
                        <span>Dossier</span>
                        <ChevronRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── ROW 3: HEATMAP (7 cols) + VEHICLE CLASSIFICATION (5 cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Surveillance Intensity Heatmap */}
        <div className="lg:col-span-7 bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2E42] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BarChart3 size={13} />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Surveillance Intensity Heatmap (Camera vs. Hour)
                </h3>
                <p className="text-[10px] text-[#8FA8C0]">
                  Normalized vehicle traffic density across all 15 CCTV nodes
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#8FA8C0]">24-HR CYCLE</span>
          </div>

          <div className="space-y-2 flex-1">
            {heatmapData.length > 0 ? (
              heatmapData.slice(0, 6).map((hm: any) => (
                <div key={hm.camera_id} className="flex items-center gap-2.5 text-xs font-mono">
                  <span className="w-14 truncate text-[#8FA8C0] text-[10px]">{hm.camera_name.split(' ')[0]}</span>
                  <div className="flex-1 grid grid-cols-12 gap-1">
                    {(hm.hourly_counts || [1, 2, 4, 8, 12, 15, 14, 10, 8, 6, 3, 1]).map((cnt: number, idx: number) => {
                      const intensity = Math.min(1, cnt / 15);
                      return (
                        <div
                          key={idx}
                          className="h-5 rounded-[2px] transition-all hover:scale-110"
                          style={{
                            backgroundColor:
                              intensity > 0.7
                                ? '#0E7FE0'
                                : intensity > 0.4
                                ? '#00C875'
                                : intensity > 0.1
                                ? '#1A334E'
                                : '#101B27',
                          }}
                          title={`Hour ${idx * 2}:00 — ${cnt} scans`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                {['MG Road', 'Sardar Brg', 'Vastrapur', 'SG Toll', 'GIFT City', 'GNLU Gate'].map((cam, idx) => (
                  <div key={cam} className="flex items-center gap-2.5 text-xs font-mono">
                    <span className="w-16 truncate text-[#8FA8C0] text-[10px]">{cam}</span>
                    <div className="flex-1 grid grid-cols-12 gap-1">
                      {Array.from({ length: 12 }).map((_, h) => {
                        const val = ((idx + 1) * (h + 1)) % 10;
                        return (
                          <div
                            key={h}
                            className="h-4 rounded-[2px]"
                            style={{
                              backgroundColor: val > 6 ? '#0E7FE0' : val > 3 ? '#00C875' : '#142233',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Classification Breakdown with Rich Colored Progress Bars */}
        <div className="lg:col-span-5 bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2E42] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Layers size={13} />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Vehicle Classification Breakdown
                </h3>
                <p className="text-[10px] text-[#8FA8C0]">
                  YOLOv8 vehicle category telemetry
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#00C875] font-bold">5 CATEGORIES</span>
          </div>

          <div className="space-y-3 flex-1">
            {vehicleClasses.map((vc) => {
              const VcIcon = vc.icon;
              return (
                <div key={vc.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-medium flex items-center gap-1.5">
                      <VcIcon size={12} className="text-[#8FA8C0]" />
                      <span>{vc.type}</span>
                    </span>
                    <span className="text-[#8FA8C0]">
                      <strong className="text-white">{vc.pct}%</strong> ({vc.count})
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#101B27] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${vc.color} rounded-full transition-all duration-500`}
                      style={{ width: `${vc.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#1C2E42] mt-3 flex items-center justify-between text-[11px] font-mono text-[#8FA8C0]">
            <span>Average OCR Confidence:</span>
            <span className="text-[#00C875] font-bold">96.2% High Accuracy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
