import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import {
  Search,
  SlidersHorizontal,
  Camera,
  Car,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Scan,
  Radio,
  Video,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Activity,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  TrendingUp,
  Maximize2,
} from 'lucide-react';
import { toast } from 'sonner';

// Gujarat State SVG Silhouette Map
const GujaratMapSilhouette: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Gujarat state stylized outline */}
    <path
      d="M28 20 C35 18 50 16 65 20 C72 24 82 28 85 36 C87 42 85 50 82 58 C78 68 76 78 78 86 C74 90 68 92 62 88 C56 84 52 76 50 70 C48 64 42 62 38 66 C32 72 26 80 20 76 C14 72 16 62 18 54 C20 46 24 40 22 32 C20 25 24 22 28 20 Z"
      stroke="#0E7FE0"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(14, 127, 224, 0.10)"
    />
    {/* Subtle radar grid line */}
    <line x1="30" y1="46" x2="75" y2="46" stroke="#0E7FE0" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.4" />
    {/* Ahmedabad / Gandhinagar Pulse Dot */}
    <circle cx="62" cy="46" r="3.5" fill="#FF3B3B" className="animate-ping" opacity="0.8" />
    <circle cx="62" cy="46" r="2" fill="#FF3B3B" />
  </svg>
);

// Tactical CCTV Camera SVG Icon for Card 1 matching mockup
const CCTVCameraGraphic: React.FC<{ className?: string }> = ({ className = 'w-14 h-12' }) => (
  <svg viewBox="0 0 70 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Mounting bracket */}
    <path d="M56 8 L62 8 L62 24 L56 24 Z" fill="#1C2E42" stroke="#2E4E70" strokeWidth="1" />
    <path d="M56 16 L44 20 L44 24 L56 20 Z" fill="#24384E" />
    <circle cx="44" cy="22" r="3" fill="#3D5A7A" />
    {/* Bullet Camera Body Angled */}
    <g transform="rotate(16 35 28)">
      {/* Sunshield Visor */}
      <path d="M12 16 L48 16 L46 20 L10 20 Z" fill="#121D2B" stroke="#0E7FE0" strokeWidth="0.8" />
      {/* Cylinder Body */}
      <rect x="14" y="19" width="32" height="15" rx="3" fill="#162232" stroke="#2E4E70" strokeWidth="1" />
      <line x1="16" y1="22" x2="44" y2="22" stroke="#0E7FE0" strokeWidth="0.8" strokeOpacity="0.5" />
      {/* Front Rim & Lens */}
      <rect x="10" y="18.5" width="4.5" height="16" rx="1.5" fill="#0D1520" stroke="#0E7FE0" strokeWidth="1" />
      <circle cx="12" cy="26.5" r="4" fill="#080C12" stroke="#00C875" strokeWidth="0.8" />
      <circle cx="12" cy="26.5" r="1.8" fill="#00C875" opacity="0.85" />
      {/* IR Status LEDs */}
      <circle cx="12" cy="21.5" r="0.75" fill="#FF3B3B" />
      <circle cx="12" cy="31.5" r="0.75" fill="#FF3B3B" />
    </g>
    <ellipse cx="26" cy="40" rx="12" ry="3" fill="rgba(0, 200, 117, 0.15)" />
  </svg>
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [quickPlate, setQuickPlate] = useState('');
  const [selectedCameraFilter, setSelectedCameraFilter] = useState('All Cameras');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPlate.trim()) {
      navigate(`/vehicles/details/${encodeURIComponent(quickPlate.trim().toUpperCase())}`);
    }
  };

  // 24-Hour Velocity Chart Data (hourly curve matching mockup with peak at 19:46)
  const velocityData = useMemo(
    () => [
      { time: '00:00', vehicles: 85 },
      { time: '02:00', vehicles: 45 },
      { time: '04:00', vehicles: 60 },
      { time: '06:00', vehicles: 140 },
      { time: '08:00', vehicles: 360 },
      { time: '10:00', vehicles: 540 },
      { time: '12:00', vehicles: 320 },
      { time: '14:00', vehicles: 290 },
      { time: '16:00', vehicles: 380 },
      { time: '18:00', vehicles: 590 },
      { time: '19:46', vehicles: 682 }, // Peak point
      { time: '20:00', vehicles: 620 },
      { time: '22:00', vehicles: 280 },
      { time: '23:59', vehicles: 120 },
    ],
    []
  );

  return (
    <div className="space-y-4 pb-10 text-white">
      {/* ─── 1. PAGE HEADER & GUJARAT STATE METRIC CLOCK ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1 border-b border-[#1C2E42]">
        <div>
          {/* Breadcrumb */}
          <div className="text-[11px] font-mono tracking-widest text-[#8FA8C0] uppercase flex items-center gap-1.5">
            <span>INTELLIGENCE</span>
            <span className="text-[#4D6B85]">/</span>
            <span className="text-[#0E7FE0] font-bold">DASHBOARD</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 mt-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Command & Intelligence Dashboard
            </h1>
            <span className="text-xs italic text-[#8FA8C0] font-serif">
              "Safer Roads, Stronger Communities"
            </span>
          </div>

          <p className="text-xs text-[#8FA8C0] font-mono mt-0.5 max-w-2xl">
            Real-time CCTV stream analysis, automatic ANPR identification, and forensic telemetry across Gujarat grid.
          </p>
        </div>

        {/* Top-Right: Gujarat State Clock & Radar */}
        <div className="flex items-center gap-4 bg-[#0A1017] border border-[#1F334D] rounded-xl px-4 py-2.5 shadow-md shrink-0">
          <div className="text-right font-mono">
            <div className="text-[11px] text-[#8FA8C0]">
              {currentTime.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <div className="text-xl font-bold text-white tracking-wider">
              {currentTime.toLocaleTimeString('en-GB', { hour12: false })}
            </div>
            <div className="text-[10px] text-[#0E7FE0]">
              Gujarat (IST) | UTC +5:30
            </div>
          </div>
          <div className="pl-3 border-l border-[#1C2E42] flex items-center">
            <div
              className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#0E7FE0]/50 bg-[#070B10] flex items-center justify-center p-0.5 shadow-[0_0_12px_rgba(14,127,224,0.3)]"
              title="Gujarat Surveillance Grid"
            >
              <img
                src="/images/gujarat_hud_map.jpg"
                alt="Gujarat Surveillance Grid"
                className="w-full h-full object-contain rounded filter contrast-125"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. PRIMARY SEARCH & HIGH-PRIORITY TARGETS STRIP ─── */}
      <div className="space-y-2.5">
        {/* Large Input Box */}
        <form
          onSubmit={handleQuickSearch}
          className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-[#0A1017] border border-[#1F334D] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center flex-1 px-3 w-full">
            <div className="p-2 rounded-lg bg-[#0E7FE0]/15 text-[#0E7FE0] border border-[#0E7FE0]/30 mr-3 shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={quickPlate}
              onChange={(e) => setQuickPlate(e.target.value.toUpperCase())}
              placeholder="Enter vehicle registration plate to initiate investigation (e.g. GJ01AB1234)"
              className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-[#4D6B85] focus:outline-none font-mono uppercase"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto px-2 sm:px-0">
            <button
              type="submit"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0E7FE0] hover:bg-[#118bf2] text-white text-xs font-mono font-bold tracking-wide shadow-[0_0_15px_rgba(14,127,224,0.4)] transition-all cursor-pointer"
            >
              <span>Track Plate</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/investigation')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] text-xs font-mono transition-colors cursor-pointer shrink-0"
              title="Advanced Search Filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Advanced Search</span>
            </button>

            <button
              type="button"
              onClick={() => {
                toast.info('ANPR Optical Scanner Ready: Uploading frame for OCR decoding...');
                navigate('/investigation');
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] text-xs font-mono transition-colors cursor-pointer shrink-0"
              title="Scan OCR Frame"
            >
              <Scan className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Scan OCR</span>
            </button>
          </div>
        </form>

        {/* High-Priority Targets Strip */}
        <div className="flex items-center gap-3 px-1 text-xs overflow-x-auto scrollbar-none py-1 whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-[#FF3B3B] font-mono font-bold text-xs shrink-0">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#FF3B3B]" />
            <span>HIGH-PRIORITY TARGETS:</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {[
              { plate: 'GJ01AB1234', label: 'Kidnapping Lead', color: 'border-[#FF3B3B]/60 text-[#FF3B3B] bg-[#FF3B3B]/10 hover:bg-[#FF3B3B]/20' },
              { plate: 'RJ14GH3456', label: 'Stolen Fortuner', color: 'border-[#FF3B3B]/60 text-[#FF3B3B] bg-[#FF3B3B]/10 hover:bg-[#FF3B3B]/20' },
              { plate: 'UP32PQ6677', label: 'Narcotics Track', color: 'border-[#FF8C00]/60 text-[#FF8C00] bg-[#FF8C00]/10 hover:bg-[#FF8C00]/20' },
              { plate: 'GJ05CD5678', label: 'Hit & Run Fatal', color: 'border-[#FF8C00]/60 text-[#FF8C00] bg-[#FF8C00]/10 hover:bg-[#FF8C00]/20' },
              { plate: 'DL10XY9090', label: 'Syndicate Convoy', color: 'border-[#0E7FE0]/60 text-[#0E7FE0] bg-[#0E7FE0]/10 hover:bg-[#0E7FE0]/20' },
            ].map((t) => (
              <button
                key={t.plate}
                onClick={() => navigate(`/vehicles/details/${t.plate}`)}
                className={`flex items-center gap-2 px-3 py-1 rounded-[4px] border text-xs font-mono transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap ${t.color}`}
              >
                <span className="font-bold tracking-wide">{t.plate}</span>
                <span className="text-[11px] opacity-85 font-sans">{t.label}</span>
              </button>
            ))}
          </div>

          <Link
            to="/watchlist"
            className="text-xs text-[#0E7FE0] hover:text-[#118bf2] flex items-center gap-1 font-semibold shrink-0 whitespace-nowrap ml-auto pl-2"
          >
            <span>View All Targets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── 3. FOUR KEY METRIC KPI STAT CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: CAMERAS ONLINE */}
        <div className="relative bg-[#0A1017] border border-[#00C875]/30 rounded-xl p-3.5 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.5)] overflow-hidden min-h-[92px] group">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#00C875]/15 text-[#00C875] border border-[#00C875]/30 flex items-center justify-center shadow-[0_0_12px_rgba(0,200,117,0.2)] shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-sans font-semibold tracking-wide text-[#8FA8C0] uppercase whitespace-nowrap">
                CAMERAS ONLINE
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-mono font-black text-white tracking-tight whitespace-nowrap">
                  8 / 10
                </span>
                <span className="text-[10px] font-mono font-bold text-[#00C875] bg-[#00C875]/15 px-1.5 py-0.2 rounded border border-[#00C875]/30 whitespace-nowrap shrink-0">
                  ▲ +20%
                </span>
              </div>
              <div className="text-[11px] font-sans text-[#8FA8C0] whitespace-nowrap mt-0.5">
                Active stream nodes
              </div>
            </div>
          </div>

          <div className="w-14 h-11 shrink-0 flex items-center justify-end overflow-hidden pl-1">
            <img
              src="/images/cctv_camera_3d.png"
              alt="Surveillance Camera"
              className="h-10 w-auto max-h-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform"
            />
          </div>
        </div>

        {/* Card 2: VEHICLES DETECTED TODAY */}
        <div className="relative bg-[#0A1017] border border-[#0E7FE0]/30 rounded-xl p-3.5 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.5)] overflow-hidden min-h-[92px]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#0E7FE0]/15 text-[#0E7FE0] border border-[#0E7FE0]/30 flex items-center justify-center shadow-[0_0_12px_rgba(14,127,224,0.2)] shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-sans font-semibold tracking-wide text-[#8FA8C0] uppercase whitespace-nowrap">
                VEHICLES DETECTED TODAY
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-mono font-black text-white tracking-tight whitespace-nowrap">
                  2,068
                </span>
                <span className="text-[10px] font-mono font-bold text-[#00C875] bg-[#00C875]/15 px-1.5 py-0.2 rounded border border-[#00C875]/30 whitespace-nowrap shrink-0">
                  ▲ +14.2%
                </span>
              </div>
              <div className="text-[11px] font-sans text-[#8FA8C0] whitespace-nowrap mt-0.5">
                Cross-camera detections
              </div>
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-9 shrink-0 pl-2">
            <div className="w-1.5 bg-[#0E7FE0]/40 h-3 rounded-full" />
            <div className="w-1.5 bg-[#0E7FE0]/60 h-5.5 rounded-full" />
            <div className="w-1.5 bg-[#0E7FE0] h-8 rounded-full shadow-[0_0_8px_#0E7FE0]" />
            <div className="w-1.5 bg-[#0E7FE0]/80 h-6.5 rounded-full" />
            <div className="w-1.5 bg-[#0E7FE0]/50 h-4 rounded-full" />
          </div>
        </div>

        {/* Card 3: ACTIVE WATCHLIST ALERTS */}
        <div className="relative bg-[#0A1017] border border-[#FF3B3B]/40 rounded-xl p-3.5 flex items-center justify-between shadow-[0_4px_20px_rgba(255,59,59,0.15)] overflow-hidden min-h-[92px]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#FF3B3B] shadow-[0_0_8px_#FF3B3B]" />
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/40 flex items-center justify-center shadow-[0_0_12px_rgba(255,59,59,0.3)] shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-sans font-semibold tracking-wide text-[#FF3B3B] uppercase whitespace-nowrap">
                ACTIVE WATCHLIST ALERTS
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-mono font-black text-[#FF3B3B] tracking-tight whitespace-nowrap">
                  320
                </span>
                <AlertCircle className="w-4 h-4 text-[#FF3B3B] animate-pulse shrink-0 self-center" />
              </div>
              <div className="text-[11px] font-sans text-[#8FA8C0] flex items-center gap-1.5 whitespace-nowrap mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse shrink-0" />
                <span>Requires officer attention</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center pl-2">
            <svg className="w-12 h-7 text-[#FF3B3B] filter drop-shadow-[0_0_6px_rgba(255,59,59,0.5)]" viewBox="0 0 60 30" fill="none">
              <path
                d="M0 15 H16 L22 4 L28 26 L34 10 L38 19 L42 15 H60"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: PLATES SCANNED */}
        <div className="relative bg-[#0A1017] border border-[#8A63D2]/30 rounded-xl p-3.5 flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.5)] overflow-hidden min-h-[92px]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#8A63D2]/15 text-[#8A63D2] border border-[#8A63D2]/30 flex items-center justify-center shadow-[0_0_12px_rgba(138,99,210,0.2)] shrink-0">
              <Scan className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-sans font-semibold tracking-wide text-[#8FA8C0] uppercase whitespace-nowrap">
                PLATES SCANNED
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-mono font-black text-white tracking-tight whitespace-nowrap">
                  3,528
                </span>
                <span className="text-[10px] font-mono font-bold text-[#00C875] bg-[#00C875]/15 px-1.5 py-0.2 rounded border border-[#00C875]/30 whitespace-nowrap shrink-0">
                  ▲ +8.3%
                </span>
              </div>
              <div className="text-[11px] font-sans text-[#8FA8C0] whitespace-nowrap mt-0.5">
                OCR validated records
              </div>
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-9 shrink-0 pl-2">
            <div className="w-1.5 bg-[#8A63D2]/40 h-3 rounded-full" />
            <div className="w-1.5 bg-[#8A63D2]/60 h-5.5 rounded-full" />
            <div className="w-1.5 bg-[#8A63D2] h-7.5 rounded-full shadow-[0_0_8px_#8A63D2]" />
            <div className="w-1.5 bg-[#8A63D2]/80 h-8 rounded-full shadow-[0_0_8px_#8A63D2]" />
            <div className="w-1.5 bg-[#8A63D2]/50 h-4 rounded-full" />
          </div>
        </div>
      </div>

      {/* ─── 4. MIDDLE SECTION: 24H VELOCITY CHART (60%) + LIVE ALERT FEED (40%) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: 24-Hour Velocity Area Chart */}
        <div className="lg:col-span-7 xl:col-span-8 bg-[#0A1017] border border-[#1F334D] rounded-xl p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1C2E42]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#0E7FE0]/15 text-[#0E7FE0] border border-[#0E7FE0]/30">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-white tracking-wide">
                  24-Hour Network Detection Velocity
                </h3>
                <p className="text-[11px] font-mono text-[#8FA8C0]">
                  Hourly aggregate vehicle flow across Ahmedabad & Gandhinagar surveillance points
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedCameraFilter}
                  onChange={(e) => setSelectedCameraFilter(e.target.value)}
                  className="bg-[#121E2E] border border-[#233A52] text-xs font-mono text-[#C5D5E6] rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:border-[#0E7FE0] appearance-none cursor-pointer"
                >
                  <option>All Cameras</option>
                  <option>Highway Corridors</option>
                  <option>City Junctions</option>
                  <option>Entry/Exit Gates</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2.5 text-[#8FA8C0] pointer-events-none" />
              </div>

              <button
                onClick={() => navigate('/analytics')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0E7FE0]/15 hover:bg-[#0E7FE0]/25 text-[#0E7FE0] border border-[#0E7FE0]/30 text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                <span>Full Analytics</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Glowing Recharts AreaChart with Peak Callout */}
          <div className="h-[270px] w-full pt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData} margin={{ top: 20, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E7FE0" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#0E7FE0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#4D6B85"
                  tick={{ fontSize: 10, fill: '#8FA8C0', fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: '#1C2E42' }}
                />
                <YAxis
                  stroke="#4D6B85"
                  tick={{ fontSize: 10, fill: '#8FA8C0', fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: '#1C2E42' }}
                  domain={[0, 800]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0D1520] border border-[#0E7FE0] p-2.5 rounded-lg shadow-xl font-mono text-xs">
                          <div className="text-[#8FA8C0] text-[10px]">{payload[0].payload.time} IST</div>
                          <div className="text-white font-bold text-sm">
                            {payload[0].value} <span className="text-[11px] font-normal text-[#8FA8C0]">vehicles</span>
                          </div>
                          {payload[0].payload.time === '19:46' && (
                            <div className="text-[#00C875] text-[10px] font-bold mt-0.5">
                              ▲ Peak Rush (+62%)
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="vehicles"
                  stroke="#0E7FE0"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#velocityGradient)"
                />
                {/* Highlight dot at peak 19:46 */}
                <ReferenceDot
                  x="19:46"
                  y={682}
                  r={5}
                  fill="#0E7FE0"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Peak Tooltip Overlay matching mockup */}
            <div className="absolute top-2 right-24 sm:right-32 bg-[#0D1520]/90 border border-[#0E7FE0]/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-mono shadow-lg pointer-events-none hidden sm:block">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>682 vehicles</span>
                <span className="text-[10px] text-[#00C875]">▲ +62%</span>
              </div>
              <div className="text-[10px] text-[#8FA8C0]">19:46 Peak</div>
            </div>
          </div>
        </div>

        {/* Right: Live Alert Feed */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#0A1017] border border-[#1F334D] rounded-xl p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1C2E42] mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#FF3B3B] animate-pulse" />
                <div>
                  <h3 className="text-sm font-mono font-bold text-white tracking-wide">
                    Live Alert Feed
                  </h3>
                  <p className="text-[10px] font-mono text-[#8FA8C0]">
                    Real-time watchlist detections and critical events
                  </p>
                </div>
              </div>

              <Link
                to="/alerts"
                className="text-xs font-mono text-[#0E7FE0] hover:text-[#118bf2] flex items-center gap-1 font-semibold"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* 3 Rich Tactical Alert Cards matching mockup */}
            <div className="space-y-2.5">
              {/* Alert 1: UP32PQ6677 (HIGH Threat) */}
              <div
                onClick={() => navigate('/vehicles/details/UP32PQ6677')}
                className="group relative bg-[#0D1522] border border-[#FF3B3B]/30 hover:border-[#FF3B3B] rounded-lg p-3 transition-all cursor-pointer shadow-sm overflow-hidden"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#FF3B3B]" />

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-1.5 py-0.2 rounded bg-[#FF3B3B] text-white font-bold">
                      HIGH
                    </span>
                    <span className="text-[#8FA8C0]">CAM02</span>
                    <span className="text-[#4D6B85]">•</span>
                    <span className="text-[#8FA8C0]">14:24:17</span>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-[#FF3B3B] text-white text-[10px] font-mono font-bold shrink-0">
                    Live Match 92%
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  {/* License Plate Pill */}
                  <div className="flex items-center bg-white text-black font-mono font-bold text-xs px-2 py-0.5 rounded-[3px] border border-gray-300 shrink-0">
                    <span className="bg-[#0E7FE0] text-white text-[8px] px-1 rounded-[1px] mr-1 font-bold">
                      IND
                    </span>
                    <span>UP32PQ6677</span>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-14 h-9 rounded overflow-hidden bg-black border border-[#233A52] ml-auto shrink-0">
                    <img
                      src="/images/cam_sardar_bridge_thumb.jpg"
                      alt="UP32PQ6677"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#E8EFF7] font-medium mt-1 leading-snug">
                  International Narcotics Trafficking Convoy
                  <span className="text-[10px] text-[#8FA8C0] block mt-0.5">
                    (Mewat-Udaipur Route - Task Force Watchlist)
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-[#8FA8C0] mt-1.5">
                  <MapPin className="w-3 h-3 text-[#FF3B3B]" />
                  <span>Sardar Bridge Entry, Ahmedabad</span>
                </div>
              </div>

              {/* Alert 2: GJ01AB1234 (CRITICAL Threat) */}
              <div
                onClick={() => navigate('/vehicles/details/GJ01AB1234')}
                className="group relative bg-[#0D1522] border border-[#FF8C00]/40 hover:border-[#FF8C00] rounded-lg p-3 transition-all cursor-pointer shadow-sm overflow-hidden"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#FF8C00]" />

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-1.5 py-0.2 rounded bg-[#FF8C00] text-white font-bold">
                      CRITICAL
                    </span>
                    <span className="text-[#8FA8C0]">CAM01</span>
                    <span className="text-[#4D6B85]">•</span>
                    <span className="text-[#8FA8C0]">14:16:03</span>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-[#FF3B3B] text-white text-[10px] font-mono font-bold shrink-0">
                    Live Match 98%
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  {/* License Plate Pill */}
                  <div className="flex items-center bg-white text-black font-mono font-bold text-xs px-2 py-0.5 rounded-[3px] border border-gray-300 shrink-0">
                    <span className="bg-[#0E7FE0] text-white text-[8px] px-1 rounded-[1px] mr-1 font-bold">
                      IND
                    </span>
                    <span>GJ01AB1234</span>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-14 h-9 rounded overflow-hidden bg-black border border-[#233A52] ml-auto shrink-0">
                    <img
                      src="/images/vehicle_scorpio_crop.jpg"
                      alt="GJ01AB1234"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#E8EFF7] font-medium mt-1 leading-snug">
                  Kidnapping & Extortion Syndicate Lead Vehicle
                  <span className="text-[10px] text-[#8FA8C0] block mt-0.5">
                    (MG Road Junction, Ahmedabad Crime Branch)
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-[#8FA8C0] mt-1.5">
                  <MapPin className="w-3 h-3 text-[#FF8C00]" />
                  <span>MG Road Junction, Ahmedabad</span>
                </div>
              </div>

              {/* Alert 3: DL10XY9090 (INFO Threat) */}
              <div
                onClick={() => navigate('/vehicles/details/DL10XY9090')}
                className="group relative bg-[#0D1522] border border-[#0E7FE0]/30 hover:border-[#0E7FE0] rounded-lg p-3 transition-all cursor-pointer shadow-sm overflow-hidden"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#0E7FE0]" />

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-1.5 py-0.2 rounded bg-[#0E7FE0] text-white font-bold">
                      INFO
                    </span>
                    <span className="text-[#8FA8C0]">CAM03</span>
                    <span className="text-[#4D6B85]">•</span>
                    <span className="text-[#8FA8C0]">14:02:14</span>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-[#0E7FE0]/30 text-[#0E7FE0] border border-[#0E7FE0]/40 text-[10px] font-mono font-bold shrink-0">
                    Conf. 76%
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  {/* License Plate Pill */}
                  <div className="flex items-center bg-white text-black font-mono font-bold text-xs px-2 py-0.5 rounded-[3px] border border-gray-300 shrink-0">
                    <span className="bg-[#0E7FE0] text-white text-[8px] px-1 rounded-[1px] mr-1 font-bold">
                      IND
                    </span>
                    <span>DL10XY9090</span>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-14 h-9 rounded overflow-hidden bg-black border border-[#233A52] ml-auto shrink-0">
                    <img
                      src="/images/cam_vastrapur_thumb.jpg"
                      alt="DL10XY9090"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#E8EFF7] font-medium mt-1 leading-snug">
                  Known Syndicate Convoy
                  <span className="text-[10px] text-[#8FA8C0] block mt-0.5">
                    (Under Continuous Surveillance)
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-[#8FA8C0] mt-1.5">
                  <MapPin className="w-3 h-3 text-[#0E7FE0]" />
                  <span>Vastrapur Lake Gate, Ahmedabad</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. BOTTOM SECTION: LIVE TACTICAL CAMERA FEEDS ─── */}
      <div className="bg-[#0A1017] border border-[#1F334D] rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-3">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1C2E42]">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-[#0E7FE0]" />
            <h3 className="text-sm font-mono font-bold text-white tracking-wide">
              Live Tactical Camera Feeds
            </h3>
            <span className="text-xs font-mono text-[#8FA8C0] hidden sm:inline">
              • High Priority Corridors
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#8FA8C0]">3 / 10 feeds</span>
            <span className="text-[#4D6B85]">|</span>
            <Link
              to="/live"
              className="text-[#0E7FE0] hover:text-[#118bf2] flex items-center gap-1 font-semibold"
            >
              <span>View Grid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3 Feeds Grid with Tactical ANPR Bounding Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Feed 1: CAM01 • MG Road Junction */}
          <div
            onClick={() => navigate('/live')}
            className="group relative rounded-lg overflow-hidden border border-[#1F334D] hover:border-[#0E7FE0] transition-colors cursor-pointer bg-black flex flex-col justify-between h-[180px]"
          >
            <img
              src="/images/cam_mg_road_thumb.jpg"
              alt="CAM01 MG Road Junction"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />

            {/* Top Bar Overlay */}
            <div className="relative z-10 p-2 flex items-center justify-between text-[10px] font-mono text-white">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#FF3B3B] animate-pulse" />
                <span>CAM01</span>
                <span className="text-[#C5D5E6] font-medium hidden sm:inline">MG Road Junction</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-[#00C875]/80 text-black font-bold text-[9px]">
                LIVE HD
              </span>
            </div>

            {/* Tactical ANPR Bounding Box Overlay */}
            <div className="relative z-10 mx-auto border border-[#FF3B3B] bg-[#FF3B3B]/10 px-2 py-0.5 rounded-[2px] shadow-[0_0_8px_#FF3B3B]">
              <div className="text-[8px] font-mono font-bold text-black bg-[#FF3B3B] px-1 rounded-[1px] inline-block mb-0.5">
                BCAR 981
              </div>
              <div className="text-[10px] font-mono font-bold text-white tracking-wider">
                GJ01AB1234
              </div>
            </div>

            {/* Bottom Bar Overlay */}
            <div className="relative z-10 p-2 flex items-center justify-between text-[10px] font-mono text-[#C5D5E6]">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#0E7FE0]" />
                <span>MG Road Junction, Ahmedabad</span>
              </div>
              <div className="text-[#8FA8C0] hidden sm:block">21 Sep 2025 | 14:26:17</div>
            </div>
          </div>

          {/* Feed 2: CAM02 • Sardar Bridge Entry */}
          <div
            onClick={() => navigate('/live')}
            className="group relative rounded-lg overflow-hidden border border-[#1F334D] hover:border-[#0E7FE0] transition-colors cursor-pointer bg-black flex flex-col justify-between h-[180px]"
          >
            <img
              src="/images/cam_sardar_bridge_thumb.jpg"
              alt="CAM02 Sardar Bridge Entry"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />

            {/* Top Bar Overlay */}
            <div className="relative z-10 p-2 flex items-center justify-between text-[10px] font-mono text-white">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#FF3B3B] animate-pulse" />
                <span>CAM02</span>
                <span className="text-[#C5D5E6] font-medium hidden sm:inline">Sardar Bridge Entry</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-[#00C875]/80 text-black font-bold text-[9px]">
                LIVE HD
              </span>
            </div>

            {/* Multi-Target Bounding Boxes */}
            <div className="relative z-10 flex items-center justify-center gap-6">
              <div className="border border-[#00C875] bg-[#00C875]/10 px-1.5 py-0.5 rounded-[2px]">
                <div className="text-[9px] font-mono font-bold text-white">MH12FR9822</div>
              </div>
              <div className="border border-[#FF3B3B] bg-[#FF3B3B]/10 px-2 py-0.5 rounded-[2px] shadow-[0_0_8px_#FF3B3B]">
                <div className="text-[9px] font-mono font-bold text-[#FF3B3B]">UP32PQ6677</div>
              </div>
            </div>

            {/* Bottom Bar Overlay */}
            <div className="relative z-10 p-2 flex items-center justify-between text-[10px] font-mono text-[#C5D5E6]">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#0E7FE0]" />
                <span>Sardar Bridge Entry, Ahmedabad</span>
              </div>
              <div className="text-[#8FA8C0] hidden sm:block">21 Sep 2025 | 14:26:17</div>
            </div>
          </div>

          {/* Feed 3: CAM03 • Vastrapur Lake Gate */}
          <div
            onClick={() => navigate('/live')}
            className="group relative rounded-lg overflow-hidden border border-[#1F334D] hover:border-[#0E7FE0] transition-colors cursor-pointer bg-black flex flex-col justify-between h-[180px]"
          >
            <img
              src="/images/cam_vastrapur_thumb.jpg"
              alt="CAM03 Vastrapur Lake Gate"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />

            {/* Top Bar Overlay */}
            <div className="relative z-10 p-2 flex items-center justify-between text-[10px] font-mono text-white">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#FF3B3B] animate-pulse" />
                <span>CAM03</span>
                <span className="text-[#C5D5E6] font-medium hidden sm:inline">Vastrapur Lake Gate</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-[#00C875]/80 text-black font-bold text-[9px]">
                LIVE HD
              </span>
            </div>

            {/* Multi-Target Bounding Boxes */}
            <div className="relative z-10 flex items-center justify-center gap-4">
              <div className="border border-[#00C875] bg-[#00C875]/10 px-1.5 py-0.5 rounded-[2px]">
                <div className="text-[9px] font-mono font-bold text-[#00C875]">GJ05CD5678</div>
              </div>
              <div className="border border-[#00C875] bg-[#00C875]/10 px-1.5 py-0.5 rounded-[2px]">
                <div className="text-[9px] font-mono font-bold text-[#00C875]">DL10XY9090</div>
              </div>
            </div>

            {/* Bottom Bar Overlay */}
            <div className="relative z-10 p-2 flex items-center justify-between text-[10px] font-mono text-[#C5D5E6]">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#0E7FE0]" />
                <span>Vastrapur Lake Gate, Ahmedabad</span>
              </div>
              <div className="text-[#8FA8C0] hidden sm:block">21 Sep 2025 | 14:26:17</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 6. FOOTER BAR ─── */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#4D6B85] border-t border-[#1C2E42]/60">
        <div>SENTRAX | Integrated Surveillance for a Safer Gujarat</div>
        <div>Intelligence Today. Safer Tomorrows.</div>
      </div>
    </div>
  );
};
export default Dashboard;
