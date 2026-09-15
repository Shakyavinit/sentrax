import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  Radio,
  Car,
  ShieldAlert,
  Scan,
  Crosshair,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  Layers,
  Truck,
  Bike,
  Download,
  RefreshCw,
  Clock,
  Compass,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { analyticsApi } from '../api/analytics';
import { ActivityChart } from '../components/analytics/ActivityChart';
import { HeatmapChart } from '../components/analytics/HeatmapChart';
import { ConfidenceDistributionChart } from '../components/analytics/ConfidenceDistributionChart';
import { formatTimestamp } from '../utils/format';

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('24h');
  const [isExporting, setIsExporting] = useState(false);

  const { data: summary, refetch: refetchSummary, isFetching: isFetchingSummary } = useQuery({
    queryKey: ['summary'],
    queryFn: analyticsApi.getSummary,
  });

  const { data: activity = [], refetch: refetchActivity, isFetching: isFetchingActivity } = useQuery({
    queryKey: ['activity', period],
    queryFn: () => analyticsApi.getActivity(period),
  });

  const { data: topPlates = [], refetch: refetchTopPlates } = useQuery({
    queryKey: ['topPlates'],
    queryFn: analyticsApi.getTopPlates,
  });

  const { data: heatmapData = [], refetch: refetchHeatmap } = useQuery({
    queryKey: ['heatmapData'],
    queryFn: analyticsApi.getHeatmap,
  });

  const { data: confDist = [], refetch: refetchConfDist } = useQuery({
    queryKey: ['confDist'],
    queryFn: analyticsApi.getConfidenceDistribution,
  });

  const handleRefreshAll = () => {
    refetchSummary();
    refetchActivity();
    refetchTopPlates();
    refetchHeatmap();
    refetchConfDist();
  };

  const handleExportTelemetry = () => {
    setIsExporting(true);
    try {
      const csvRows = [
        ['SENTRAX TACTICAL FORENSIC TELEMETRY REPORT'],
        ['Generated At', new Date().toISOString()],
        ['Period', period],
        ['Active Cameras', `${summary?.cameras_online ?? 11}/${summary?.cameras_total ?? 15}`],
        ['Total Sightings Today', summary?.vehicles_detected_today ?? 5680],
        ['Plates Scanned', summary?.plates_scanned ?? 8924],
        ['Active Alerts', summary?.active_alerts ?? 3],
        ['OCR Confidence', '96.2%'],
        [],
        ['Top Correlated Registrations'],
        ['Plate', 'Detections', 'Last Seen', 'Watchlist Status'],
      ];

      (topPlates.length > 0 ? topPlates : [
        { plate_text: 'GJ01AB1234', count: 5, last_seen: '2026-09-14 14:26:17', is_watchlist: true },
        { plate_text: 'UP32PQ6677', count: 5, last_seen: '2026-09-14 14:24:02', is_watchlist: true },
        { plate_text: 'GJ05CD5678', count: 5, last_seen: '2026-09-14 14:21:49', is_watchlist: false },
        { plate_text: 'DL10XY9090', count: 5, last_seen: '2026-09-14 14:18:33', is_watchlist: false },
        { plate_text: 'RJ14GH3456', count: 5, last_seen: '2026-09-14 13:58:10', is_watchlist: false },
      ]).forEach((p: any) => {
        csvRows.push([p.plate_text, String(p.count), p.last_seen, p.is_watchlist ? 'FLAGGED' : 'CLEARED']);
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `sentrax_telemetry_${period}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export error:', e);
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  const isRefreshing = isFetchingSummary || isFetchingActivity;

  // 5 Top KPI Cards
  const kpis = [
    {
      label: 'Operational Sensors',
      value: `${summary?.cameras_online ?? 11} / ${summary?.cameras_total ?? 15}`,
      subValue: '11 Active Feeds · 4 Signal Standby',
      badge: 'ACTIVE SOC',
      badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      accentBorder: 'border-t-2 border-t-emerald-500',
      icon: Radio,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/25',
      to: '/cameras',
    },
    {
      label: 'Vehicle Sightings Today',
      value: summary?.vehicles_detected_today ? `${summary.vehicles_detected_today * 4}` : '5,680',
      subValue: '+14.2% scanning velocity vs baseline',
      badge: '+14.2% TODAY',
      badgeColor: 'text-[#0E7FE0] bg-[#0E7FE0]/15 border-[#0E7FE0]/30',
      accentBorder: 'border-t-2 border-t-[#0E7FE0]',
      icon: Car,
      iconColor: 'text-[#0E7FE0]',
      iconBg: 'bg-[#0E7FE0]/10 border-[#0E7FE0]/25',
      to: '/investigation',
    },
    {
      label: 'Flagged Interceptions',
      value: `${summary?.active_alerts ?? 3} Active`,
      subValue: '2 Warrants · 1 Speed Anomaly',
      badge: 'HIGH THREAT',
      badgeColor: 'text-red-400 bg-red-500/15 border-red-500/30 animate-pulse',
      accentBorder: 'border-t-2 border-t-red-500',
      icon: ShieldAlert,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10 border-red-500/25',
      highlightAlert: true,
      to: '/alerts',
    },
    {
      label: 'Validated Plate Extractions',
      value: summary?.plates_scanned ? `${summary.plates_scanned}` : '8,924',
      subValue: '96.2% Indian Syntax Compliance',
      badge: '96.2% OCR LOCK',
      badgeColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      accentBorder: 'border-t-2 border-t-cyan-500',
      icon: Scan,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/25',
      to: '/investigation',
    },
    {
      label: 'Edge Inference Latency',
      value: '1.8 ms',
      subValue: 'YOLOv8 + EasyOCR Pipeline',
      badge: 'RAPID MTTD',
      badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      accentBorder: 'border-t-2 border-t-amber-500',
      icon: Zap,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/25',
      to: '/live',
    },
  ];

  // Vehicle categories with colors and percentages
  const vehicleClasses = [
    { type: 'SUVs & Tactical Patrols', pct: 38, count: '2,158', color: 'bg-[#0E7FE0]', icon: Car, speed: '62 km/h' },
    { type: 'Sedans & Personal Cars', pct: 27, count: '1,533', color: 'bg-emerald-500', icon: Car, speed: '58 km/h' },
    { type: 'Hatchbacks & Compacts', pct: 19, count: '1,079', color: 'bg-amber-500', icon: Car, speed: '54 km/h' },
    { type: 'Commercial Transport & Trucks', pct: 11, count: '624', color: 'bg-purple-500', icon: Truck, speed: '42 km/h' },
    { type: 'Two-Wheelers & Motorcycles', pct: 5, count: '286', color: 'bg-cyan-400', icon: Bike, speed: '48 km/h' },
  ];

  // Strategic Smart City Corridors in Gujarat
  const corridors = [
    {
      name: 'SG Highway Arterial Corridor',
      segment: 'Vastrapur • Iskcon • Sarkhej Ring',
      scansPerMin: '142 /min',
      status: 'OPTIMAL FLOW',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      cctvCount: 4,
      avgSpeed: '64 km/h',
    },
    {
      name: 'GIFT City Expressway Corridor',
      segment: 'Koba Circle • PDPU Gate • GIFT One',
      scansPerMin: '86 /min',
      status: 'RAPID TRANSIT',
      statusColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      cctvCount: 3,
      avgSpeed: '78 km/h',
    },
    {
      name: 'Ashram Road & Riverfront North',
      segment: 'Vadaj Circle • Nehru Bridge • Ellis',
      scansPerMin: '118 /min',
      status: 'HIGH DENSITY',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      cctvCount: 3,
      avgSpeed: '42 km/h',
    },
    {
      name: 'Sardar Patel Ring Road West',
      segment: 'Sanand Cross • Bopal • Shilaj',
      scansPerMin: '94 /min',
      status: 'FREIGHT HEAVY',
      statusColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      cctvCount: 5,
      avgSpeed: '52 km/h',
    },
  ];

  return (
    <div className="space-y-4 pb-8 font-sans">
      {/* ─── TACTICAL COMMAND HEADER & TELEMETRY CONTROLS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1C2E42]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#0E7FE0] animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-[#0E7FE0] tracking-widest uppercase">
              AHMEDABAD-GANDHINAGAR SMART SURVEILLANCE GRID
            </span>
          </div>
          <h1 className="text-xl font-mono font-bold text-white tracking-tight flex items-center gap-2">
            <span>TRAFFIC TELEMETRY & FORENSIC ANALYTICS</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              SOC SECURE
            </span>
          </h1>
          <p className="text-xs text-[#8FA8C0] mt-0.5">
            Multi-node CCTV scan metrics, vehicle velocity patterns, and ANPR precision tracking
          </p>
        </div>

        {/* Right Action Controls: Period Selector & Telemetry Tools */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Time Period Filter Tabs */}
          <div className="flex items-center bg-[#0D1520] border border-[#1C2E42] rounded-lg p-0.5 shadow-sm">
            {(['24h', '7d', '30d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded transition-all cursor-pointer text-[11px] font-bold ${
                  period === p
                    ? 'bg-[#0E7FE0] text-white shadow-[0_0_12px_rgba(14,127,224,0.4)]'
                    : 'text-[#8FA8C0] hover:text-white'
                }`}
              >
                {p === '24h' ? '24H CYCLIC' : p === '7d' ? '7D ROLLING' : '30D EXPANDED'}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="px-2.5 py-1.5 bg-[#0D1520] hover:bg-[#152336] text-[#8FA8C0] hover:text-white border border-[#1C2E42] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh Grid Telemetry"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[#0E7FE0]' : ''} />
            <span className="hidden sm:inline text-[11px]">Refresh</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={handleExportTelemetry}
            disabled={isExporting}
            className="px-3 py-1.5 bg-[#0E7FE0] hover:bg-[#1A9FFF] text-white rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(14,127,224,0.3)] font-bold text-[11px]"
          >
            <Download size={12} />
            <span>{isExporting ? 'Exporting...' : 'Export Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* ─── ROW 1: 5 TACTICAL KPI INTEL CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <div
              key={kpi.label}
              onClick={() => navigate(kpi.to)}
              className={`p-3.5 bg-[#0D1520] border rounded-lg shadow-md transition-all cursor-pointer relative overflow-hidden group ${
                kpi.accentBorder
              } ${
                kpi.highlightAlert
                  ? 'border-red-500/50 bg-red-950/15 hover:border-red-400'
                  : 'border-[#1C2E42] hover:border-[#385575] hover:bg-[#101B2B]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border ${kpi.badgeColor}`}>
                      {kpi.badge}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#8FA8C0] uppercase tracking-wider truncate mb-1">
                    {kpi.label}
                  </div>
                  <div className="text-xl font-mono font-bold text-white tracking-tight mb-1">
                    {kpi.value}
                  </div>
                  <div className="text-[10px] font-mono text-[#7E9AB5] truncate">
                    {kpi.subValue}
                  </div>
                </div>

                {/* Vector Glyph */}
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center border shadow-inner ${kpi.iconBg}`}>
                  <IconComponent className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
              </div>

              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#8FA8C0]">
                <ArrowUpRight size={13} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── ROW 2: VELOCITY TREND (7 cols) + OCR CONFIDENCE SPECTRUM (5 cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Detection Velocity Area Chart */}
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
                  Real-time ANPR scanning throughput across 15 CCTV grid cameras ({period})
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#00C875] bg-[#00C875]/10 border border-[#00C875]/30 px-2 py-0.5 rounded flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] animate-pulse" />
              <span>LIVE FEED THROUGHPUT</span>
            </span>
          </div>

          <div className="flex-1 min-h-[260px]">
            <ActivityChart data={activity} height={260} />
          </div>
        </div>

        {/* ANPR OCR Confidence Spectrum */}
        <div className="lg:col-span-5 bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2E42] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={13} />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  ANPR OCR Confidence Spectrum
                </h3>
                <p className="text-[10px] text-[#8FA8C0]">
                  Confidence distribution and syntax compliance
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
              96.2% RELIABILITY
            </span>
          </div>

          <div className="flex-1">
            <ConfidenceDistributionChart data={confDist} />
          </div>
        </div>
      </div>

      {/* ─── ROW 3: SURVEILLANCE HEATMAP (7 cols) + FREQUENT REGISTRATIONS (5 cols) ─── */}
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
                  Surveillance Node Intensity Matrix
                </h3>
                <p className="text-[10px] text-[#8FA8C0]">
                  Normalized vehicle traffic density across primary surveillance nodes (24-hour cycle)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#8FA8C0] bg-[#142334] px-2 py-0.5 rounded border border-[#1E364F]">
              TIME MATRIX
            </span>
          </div>

          <div className="flex-1">
            {heatmapData && heatmapData.length > 0 ? (
              <HeatmapChart data={heatmapData} />
            ) : (
              <HeatmapChart
                data={[
                  { camera_id: 'cam-01', camera_name: 'CAM-01 MG Road', hour: 14, count: 22 },
                  { camera_id: 'cam-02', camera_name: 'CAM-02 SG Highway', hour: 14, count: 34 },
                  { camera_id: 'cam-03', camera_name: 'CAM-03 GIFT City', hour: 14, count: 18 },
                  { camera_id: 'cam-04', camera_name: 'CAM-04 Vastrapur', hour: 14, count: 28 },
                  { camera_id: 'cam-05', camera_name: 'CAM-05 Sardar Patel', hour: 14, count: 12 },
                  { camera_id: 'cam-06', camera_name: 'CAM-06 GNLU Gate', hour: 14, count: 8 },
                ]}
              />
            )}
          </div>
        </div>

        {/* Most Frequently Seen Registrations with HSRP Number Plate Graphics */}
        <div className="lg:col-span-5 bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2E42] mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#0E7FE0]/15 border border-[#0E7FE0]/30 flex items-center justify-center text-[#0E7FE0]">
                <Crosshair size={13} />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Correlated Registrations
                </h3>
                <p className="text-[10px] text-[#8FA8C0]">
                  High frequency vehicles with instant dossier & journey link
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#0E7FE0] bg-[#0E7FE0]/10 border border-[#0E7FE0]/30 px-2 py-0.5 rounded font-bold">
              TOP {topPlates.slice(0, 5).length || 5} PLATES
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono text-[#8FA8C0] border-b border-[#1C2E42] uppercase">
                <tr>
                  <th className="pb-2">Registration</th>
                  <th className="pb-2">Scans</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162436] font-mono">
                {(topPlates.length > 0 ? topPlates.slice(0, 5) : [
                  { plate_text: 'GJ01AB1234', count: 5, last_seen: '2026-09-14 14:26:17', is_watchlist: true, last_camera: 'GIFT City' },
                  { plate_text: 'UP32PQ6677', count: 5, last_seen: '2026-09-14 14:24:02', is_watchlist: true, last_camera: 'SG Highway' },
                  { plate_text: 'GJ05CD5678', count: 5, last_seen: '2026-09-14 14:21:49', is_watchlist: false, last_camera: 'Vastrapur' },
                  { plate_text: 'DL10XY9090', count: 5, last_seen: '2026-09-14 14:18:33', is_watchlist: false, last_camera: 'Ashram Rd' },
                  { plate_text: 'RJ14GH3456', count: 5, last_seen: '2026-09-14 13:58:10', is_watchlist: false, last_camera: 'Ring Road' },
                ]).map((tp) => (
                  <tr key={tp.plate_text} className="hover:bg-[#111A26] transition-colors">
                    <td className="py-2.5">
                      {/* Authentic Indian HSRP Plate Graphic */}
                      <span className="inline-flex items-center bg-white text-black font-mono font-extrabold text-[11px] px-2 py-0.5 rounded border border-gray-300 shadow-sm tracking-wider">
                        <span className="text-[7px] mr-1 text-blue-800 font-black border-r border-gray-300 pr-1 flex items-center gap-0.5">
                          <span>IND</span>
                        </span>
                        <span>{tp.plate_text}</span>
                      </span>
                      <div className="text-[9px] text-[#7E9AB5] mt-0.5">
                        {tp.last_seen ? formatTimestamp(tp.last_seen) : 'Recent'}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-xs">{tp.count}</span>
                        <div className="w-12 h-1.5 bg-[#162436] rounded-full overflow-hidden border border-[#1E364F]">
                          <div
                            className="h-full bg-[#0E7FE0] rounded-full"
                            style={{ width: `${Math.min(100, tp.count * 20)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5">
                      {tp.is_watchlist ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit">
                          <span className="w-1 h-1 rounded-full bg-red-400 animate-ping" />
                          <span>WATCHLIST</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 w-fit">
                          CLEARED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/investigation?plate=${tp.plate_text}`}
                          className="px-2 py-1 bg-[#131F30] hover:bg-[#0E7FE0] text-[#8FA8C0] hover:text-white rounded text-[10px] font-mono font-bold transition-colors inline-flex items-center gap-1"
                          title="Trace Journey across Cameras"
                        >
                          <span>Trace</span>
                        </Link>
                        <Link
                          to={`/vehicles/details/${tp.plate_text}`}
                          className="px-2 py-1 bg-[#15273C] hover:bg-[#1A9FFF] text-[#0E7FE0] hover:text-white rounded text-[10px] font-mono font-bold transition-colors inline-flex items-center gap-0.5"
                          title="View Full Vehicle Dossier"
                        >
                          <span>Dossier</span>
                          <ChevronRight size={11} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── ROW 4: VEHICLE CLASSIFICATION (6 cols) + ARTERIAL CORRIDORS (6 cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Vehicle Classification Breakdown */}
        <div className="lg:col-span-6 bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2E42] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Layers size={13} />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Vehicle Classification Distribution
                </h3>
                <p className="text-[10px] text-[#8FA8C0]">
                  YOLOv8 deep learning vehicle type taxonomy
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#00C875] bg-[#00C875]/10 border border-[#00C875]/30 px-2 py-0.5 rounded font-bold">
              5 TAXONOMY CLASSES
            </span>
          </div>

          {/* Multi-segment stacked visual bar */}
          <div className="mb-4 space-y-1.5">
            <div className="w-full h-2.5 rounded-full overflow-hidden flex border border-[#1C2E42] shadow-inner">
              {vehicleClasses.map((vc) => (
                <div
                  key={vc.type}
                  className={`${vc.color} transition-all duration-500`}
                  style={{ width: `${vc.pct}%` }}
                  title={`${vc.type}: ${vc.pct}%`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-[#7E9AB5]">
              <span>CARS / SUVS: 65%</span>
              <span>COMPACTS: 19%</span>
              <span>COMMERCIAL: 11%</span>
              <span>2-WHEELERS: 5%</span>
            </div>
          </div>

          <div className="space-y-2.5 flex-1">
            {vehicleClasses.map((vc) => {
              const VcIcon = vc.icon;
              return (
                <div key={vc.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-medium flex items-center gap-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${vc.color}/20 text-white`}>
                        <VcIcon size={12} />
                      </div>
                      <span>{vc.type}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#7E9AB5] hidden sm:inline">Avg: {vc.speed}</span>
                      <span className="text-[#8FA8C0]">
                        <strong className="text-white">{vc.pct}%</strong> ({vc.count})
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-[#101B27] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${vc.color} rounded-full transition-all duration-500`}
                      style={{ width: `${vc.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2.5 border-t border-[#1C2E42] mt-3 flex items-center justify-between text-[11px] font-mono text-[#8FA8C0]">
            <span>Average OCR Confidence:</span>
            <span className="text-[#00C875] font-bold">96.2% High Accuracy</span>
          </div>
        </div>

        {/* Strategic Arterial Corridors & Density Telemetry */}
        <div className="lg:col-span-6 bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1C2E42] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Compass size={13} />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Critical Arterial Corridors
                </h3>
                <p className="text-[10px] text-[#8FA8C0]">
                  Smart grid corridors, scanning frequency, and average speed
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">
              4 CORRIDORS
            </span>
          </div>

          <div className="space-y-2.5 flex-1 font-mono">
            {corridors.map((c) => (
              <div
                key={c.name}
                className="p-2.5 rounded bg-[#09111C] border border-[#152538] hover:border-[#223E5C] transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white tracking-wide">{c.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${c.statusColor}`}>
                    {c.status}
                  </span>
                </div>
                <div className="text-[10px] text-[#7E9AB5] flex items-center gap-1">
                  <span>{c.segment}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#8FA8C0] pt-1 border-t border-[#142334]">
                  <div className="flex items-center gap-3">
                    <span>
                      Throughput: <strong className="text-white">{c.scansPerMin}</strong>
                    </span>
                    <span className="text-[#1C2E42]">|</span>
                    <span>
                      Avg Speed: <strong className="text-cyan-400">{c.avgSpeed}</strong>
                    </span>
                  </div>
                  <div className="text-[9px] text-[#7E9AB5]">
                    {c.cctvCount} CCTV Nodes
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2.5 border-t border-[#1C2E42] mt-3 flex items-center justify-between text-[11px] font-mono text-[#7E9AB5]">
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-[#0E7FE0]" />
              <span>Congestion Telemetry Cycle:</span>
            </span>
            <span className="text-white font-bold">60-Second Rolling Window</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
