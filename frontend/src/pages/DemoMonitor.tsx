import React, { useMemo, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Camera as CameraIcon,
  Search,
  LayoutGrid,
  List,
  MapPin,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Camera,
  Layers,
  Activity,
  Radio,
  WifiOff,
  Sliders,
  Maximize,
  Compass,
  Zap,
  ExternalLink,
  Eye,
  RefreshCw,
  FileText,
  ShieldAlert,
  Flame,
  Moon,
  Sparkles,
} from 'lucide-react';
import { camerasApi } from '../api/cameras';
import { vehiclesApi } from '../api/vehicles';
import { PageHeader } from '../components/layout/PageHeader';
import { Modal } from '../components/ui/Modal';
import { LicensePlate } from '../components/ui/LicensePlate';
import { CctvLiveTile } from '../components/cameras/CctvLiveTile';
import { CctvOfflinePattern } from '../components/cameras/CctvOfflinePattern';
import { formatTimestamp } from '../utils/format';
import { SAMPLE_PLATES } from '../api/demoClient';
import { assetUrl } from '../utils/demo';
import { toast } from 'sonner';

export const DemoMonitor: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'congestion'>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [columnCount, setColumnCount] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [visibleCount, setVisibleCount] = useState<number>(15);
  const [showAiOverlays, setShowAiOverlays] = useState(true);
  const [retryingCamId, setRetryingCamId] = useState<string | null>(null);
  const [monitorVisionMode, setMonitorVisionMode] = useState<'standard' | 'night_vision' | 'flir_thermal' | 'edge_cv'>('standard');

  // Modal player states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isModalMuted, setIsModalMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showModalAi, setShowModalAi] = useState(true);
  const [modalNightVision, setModalNightVision] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  const { data: cameras = [] } = useQuery({
    queryKey: ['cameras'],
    queryFn: camerasApi.list,
  });

  const selectedCamId = params.get('camera') || params.get('cam');
  const selectedIndex = cameras.findIndex((c) => c.id === selectedCamId || c.camera_id === selectedCamId);
  const selected = selectedIndex !== -1 ? cameras[selectedIndex] : null;

  const { data: sightings } = useQuery({
    queryKey: ['monitor-sightings', selected?.id],
    queryFn: () => vehiclesApi.search({ camera_id: selected!.id }),
    enabled: !!selected,
  });

  // Filtered cameras based on status, area, search query
  const filtered = useMemo(() => {
    return cameras.filter((c) => {
      if (statusFilter === 'online' && c.status !== 'online') return false;
      if (statusFilter === 'offline' && c.status !== 'offline') return false;
      if (statusFilter === 'congestion' && c.congestion !== 'HIGH') return false;
      if (areaFilter !== 'all' && c.location_name !== areaFilter) return false;
      const haystack = `${c.name} ${c.location_name} ${c.camera_id}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [cameras, statusFilter, areaFilter, query]);

  // Sliced according to user's selected visible camera count (1, 2, 3, 4, 5... 15)
  const displayedCameras = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  // Navigate through cameras within modal
  const handleSelectNext = () => {
    if (!cameras.length) return;
    const nextIdx = (selectedIndex + 1) % cameras.length;
    setParams({ camera: cameras[nextIdx].id });
  };

  const handleSelectPrev = () => {
    if (!cameras.length) return;
    const prevIdx = (selectedIndex - 1 + cameras.length) % cameras.length;
    setParams({ camera: cameras[prevIdx].id });
  };

  const handlePingRetry = (camId: string) => {
    setRetryingCamId(camId);
    toast.info(`Pinging RTSP stream node ${camId}...`, { duration: 2000 });
    setTimeout(() => {
      setRetryingCamId(null);
      toast.error(`RTSP handshake timed out on ${camId}. Node remains offline.`, { duration: 3000 });
    }, 2200);
  };

  const handleCaptureSnapshot = () => {
    toast.success(`📸 Snapshot frame captured from ${selected?.camera_id} at high resolution.`, {
      duration: 3500,
    });
  };

  // Online / offline count stats
  const onlineCount = cameras.filter((c) => c.status === 'online').length;
  const offlineCount = cameras.filter((c) => c.status === 'offline').length;
  const highCongestionCount = cameras.filter((c) => c.congestion === 'HIGH').length;

  return (
    <div className="overview space-y-4">
      <PageHeader
        title="Live Surveillance Monitor"
        description="Synchronized real-time CCTV monitoring wall across Gujarat intelligence grid."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Sensor Vision Mode Switcher */}
            <div className="flex items-center bg-[#070B12] border border-[#1C2E42] rounded-lg p-0.5 gap-1 font-mono text-xs">
              <button
                onClick={() => { setMonitorVisionMode('standard'); toast.info('Monitor Sensor: RAW RGB Optical'); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                  monitorVisionMode === 'standard' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Standard True Color Optical"
              >
                <Eye size={13} />
                <span className="hidden sm:inline">RGB</span>
              </button>
              <button
                onClick={() => { setMonitorVisionMode('night_vision'); toast.info('Monitor Sensor: NIGHT VISION IR (850nm)'); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                  monitorVisionMode === 'night_vision' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_#10b981]' : 'text-emerald-400 hover:text-emerald-300'
                }`}
                title="Night Vision Infrared 850nm"
              >
                <Moon size={13} />
                <span className="hidden sm:inline">NIGHT IR</span>
              </button>
              <button
                onClick={() => { setMonitorVisionMode('flir_thermal'); toast.info('Monitor Sensor: FLIR THERMAL HEATMAP'); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                  monitorVisionMode === 'flir_thermal' ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_#f59e0b]' : 'text-amber-400 hover:text-amber-300'
                }`}
                title="FLIR Thermal Heatmap LWIR"
              >
                <Flame size={13} />
                <span className="hidden sm:inline">FLIR</span>
              </button>
              <button
                onClick={() => { setMonitorVisionMode('edge_cv'); toast.info('Monitor Sensor: EDGE CV MATRIX'); }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
                  monitorVisionMode === 'edge_cv' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_#06b6d4]' : 'text-cyan-400 hover:text-cyan-300'
                }`}
                title="Edge CV Matrix Contour Detection"
              >
                <Sparkles size={13} />
                <span className="hidden sm:inline">EDGE CV</span>
              </button>
            </div>

            <button
              onClick={() => setShowAiOverlays(!showAiOverlays)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                showAiOverlays
                  ? 'bg-[#00C875]/20 text-[#00C875] border-[#00C875]/40'
                  : 'bg-[#121E2E] text-white/60 border-[#1C2E42]'
              }`}
            >
              <Layers size={14} />
              <span>AI {showAiOverlays ? 'ON' : 'OFF'}</span>
            </button>
            <Link to="/grid" className="px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 bg-[#0C1420] text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 transition-all shadow-[0_0_8px_rgba(6,182,212,0.25)]">
              <LayoutGrid size={14} className="text-cyan-400" />
              <span>Tactical Grid</span>
            </Link>
          </div>
        }
      />

      {/* ─── SURVEILLANCE KPI STATUS BAR ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-[#0D1520] border border-[#1C2E42] rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#8FA8C0] uppercase">SURVEILLANCE NODES</div>
            <div className="text-xl font-mono font-bold text-white mt-0.5">{cameras.length} Total</div>
          </div>
          <Radio size={22} className="text-[#0E7FE0]" />
        </div>

        <div
          onClick={() => setStatusFilter('online')}
          className={`p-3 bg-[#0D1520] border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'online' ? 'border-[#00C875] bg-[#00C875]/10' : 'border-[#1C2E42] hover:border-white/20'
          }`}
        >
          <div>
            <div className="text-[10px] font-mono text-[#8FA8C0] uppercase">ONLINE STREAMS</div>
            <div className="text-xl font-mono font-bold text-[#00C875] mt-0.5">{onlineCount} Feeds</div>
          </div>
          <span className="w-3 h-3 rounded-full bg-[#00C875] animate-ping" />
        </div>

        <div
          onClick={() => setStatusFilter('offline')}
          className={`p-3 bg-[#0D1520] border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'offline' ? 'border-red-500 bg-red-500/10' : 'border-[#1C2E42] hover:border-white/20'
          }`}
        >
          <div>
            <div className="text-[10px] font-mono text-[#8FA8C0] uppercase">SIGNAL LOSS</div>
            <div className="text-xl font-mono font-bold text-red-400 mt-0.5">{offlineCount} Offline</div>
          </div>
          <WifiOff size={20} className="text-red-400" />
        </div>

        <div
          onClick={() => setStatusFilter('congestion')}
          className={`p-3 bg-[#0D1520] border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'congestion' ? 'border-amber-500 bg-amber-500/10' : 'border-[#1C2E42] hover:border-white/20'
          }`}
        >
          <div>
            <div className="text-[10px] font-mono text-[#8FA8C0] uppercase">HIGH CONGESTION</div>
            <div className="text-xl font-mono font-bold text-amber-400 mt-0.5">{highCongestionCount} Junctions</div>
          </div>
          <Activity size={20} className="text-amber-400" />
        </div>
      </div>

      {/* ─── CCTV WALL CONTROLS TOOLBAR ─── */}
      <div className="p-3 bg-[#0D1520] border border-[#1C2E42] rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search & Area Filter */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search camera name, location, or ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#080C12] border border-[#1C2E42] rounded text-white font-mono text-xs focus:outline-none focus:border-[#0E7FE0]"
            />
          </div>

          {/* Area Selector */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#080C12] border border-[#1C2E42] rounded text-white font-mono text-xs focus:outline-none"
          >
            <option value="all">All Locations</option>
            <option value="Ahmedabad">Ahmedabad Grid</option>
            <option value="Gandhinagar">Gandhinagar Hub</option>
          </select>

          {/* Status Filter Tabs */}
          <div className="flex items-center rounded bg-[#080C12] p-0.5 border border-[#1C2E42]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                statusFilter === 'all' ? 'bg-[#1C2E42] text-white font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              All ({cameras.length})
            </button>
            <button
              onClick={() => setStatusFilter('online')}
              className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                statusFilter === 'online' ? 'bg-[#00C875]/20 text-[#00C875] font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              Live ({onlineCount})
            </button>
            <button
              onClick={() => setStatusFilter('offline')}
              className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                statusFilter === 'offline' ? 'bg-red-500/20 text-red-400 font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              Offline ({offlineCount})
            </button>
          </div>
        </div>

        {/* ─── GRID COLUMN CONTROLS (1, 2, 3, 4, 5) ─── */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[#8FA8C0] text-[11px]">GRID COLS:</span>
            <div className="flex items-center rounded bg-[#080C12] p-0.5 border border-[#1C2E42]">
              {([1, 2, 3, 4, 5] as const).map((cols) => (
                <button
                  key={cols}
                  onClick={() => setColumnCount(cols)}
                  className={`w-7 h-7 rounded font-mono text-xs font-bold transition-all ${
                    columnCount === cols
                      ? 'bg-[#0E7FE0] text-white shadow'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title={`${cols} Column Layout`}
                >
                  {cols}
                </button>
              ))}
            </div>
          </div>

          {/* ─── FEEDS LENGTH / COUNT STEFFER (1, 2, 3, 4, 5... 15) ─── */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[#8FA8C0] text-[11px]">FEEDS:</span>
            <div className="flex items-center rounded bg-[#080C12] p-0.5 border border-[#1C2E42]">
              <button
                type="button"
                onClick={() => setVisibleCount(Math.max(1, visibleCount - 1))}
                className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 font-bold"
                title="Decrease cameras"
              >
                -
              </button>
              <span className="px-2 font-mono text-xs font-bold text-[#00C875]">
                {visibleCount}
              </span>
              <button
                type="button"
                onClick={() => setVisibleCount(Math.min(cameras.length, visibleCount + 1))}
                className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 font-bold"
                title="Increase cameras"
              >
                +
              </button>
            </div>

            {/* Quick Presets */}
            <div className="hidden lg:flex items-center gap-1">
              {[2, 4, 8, 12, 15].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setVisibleCount(cnt)}
                  className={`px-1.5 py-0.5 rounded font-mono text-[10px] border transition-colors ${
                    visibleCount === cnt
                      ? 'bg-white/15 text-white border-white/30 font-bold'
                      : 'border-[#1C2E42] text-white/50 hover:text-white'
                  }`}
                >
                  {cnt === 15 ? 'All' : cnt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SURVEILLANCE CAMERA VIDEO WALL GRID ─── */}
      <div className={`monitor-grid cols-${columnCount} gap-4`}>
        {displayedCameras.map((c) => {
          const originalIndex = cameras.findIndex((camera) => camera.id === c.id);
          const isOffline = c.status === 'offline';

          return (
            <div
              key={c.id}
              className="bg-[#0D1520] border border-[#1C2E42] rounded-lg overflow-hidden flex flex-col shadow-lg transition-all hover:border-[#0E7FE0]/50"
            >
              {/* Camera Video or SMPTE Test Pattern Viewport */}
              <div
                className="relative aspect-[16/10] w-full bg-black overflow-hidden cursor-pointer group/tile"
                onClick={() => setParams({ camera: c.id })}
                title={`Click to inspect ${c.name} (${c.camera_id}) in Pop-up Box`}
              >
                {isOffline ? (
                  <CctvOfflinePattern
                    camera={c}
                    onRetry={() => handlePingRetry(c.id)}
                    isRetrying={retryingCamId === c.id}
                    showControls={false}
                  />
                ) : (
                  <CctvLiveTile
                    camera={c}
                    index={originalIndex}
                    onOpen={() => setParams({ camera: c.id })}
                    showAiOverlay={showAiOverlays}
                    visionMode={monitorVisionMode}
                  />
                )}
              </div>

              {/* Bottom Caption & Fast Open Bar */}
              <div className="px-3 py-2.5 bg-[#0A101A] border-t border-[#1C2E42] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-white truncate">{c.name}</span>
                    <span
                      className={`text-[9px] font-mono px-1 rounded font-bold ${
                        c.congestion === 'HIGH'
                          ? 'text-red-400 bg-red-500/10'
                          : c.congestion === 'MEDIUM'
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-emerald-400 bg-emerald-500/10'
                      }`}
                    >
                      {c.congestion || 'LOW'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#8FA8C0] mt-0.5">
                    <MapPin size={10} />
                    <span className="truncate">{c.location_name}</span>
                    <span>·</span>
                    <span className="font-mono">{c.camera_id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`/camera-stream/${c.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-[#162334] hover:bg-[#0E7FE0] text-white/80 hover:text-white rounded text-[11px] font-mono transition-all border border-[#233A52] flex-shrink-0 cursor-pointer"
                    title={`Open ${c.camera_id} in New Tab Fullscreen`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={12} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setParams({ camera: c.id })}
                    className="px-2.5 py-1 bg-[#162334] hover:bg-[#0E7FE0] text-white/80 hover:text-white rounded text-[11px] font-mono font-bold flex items-center gap-1 transition-all border border-[#233A52] flex-shrink-0 cursor-pointer"
                    title={`Inspect ${c.camera_id}`}
                  >
                    <span>OPEN</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!displayedCameras.length && (
        <div className="p-12 text-center bg-[#0D1520] border border-[#1C2E42] rounded-lg text-[#8FA8C0] font-mono">
          No surveillance nodes match the specified filters.
        </div>
      )}

      {/* ─── MANAGED CAMERA INSPECTION MODAL ─── */}
      <Modal
        isOpen={!!selected}
        onClose={() => setParams({})}
        title={selected ? `${selected.camera_id} · ${selected.name} — Live Surveillance Workstation` : 'Camera Inspection'}
        maxWidth="6xl"
      >
        {selected && (() => {
          const currentPlate = SAMPLE_PLATES[selectedIndex % SAMPLE_PLATES.length];
          const currentVehicles = [
            { model: 'Mahindra Scorpio-N Z8L', type: 'SUV (White)', speed: '58 km/h', conf: '98.6%', warrant: false, crop: assetUrl('images/vehicle_scorpio_crop.jpg') },
            { model: 'Toyota Fortuner 4x4', type: 'SUV (Black)', speed: '64 km/h', conf: '97.2%', warrant: true, crop: assetUrl('images/hit_fortuner_clean.jpg') },
            { model: 'Honda City ZX', type: 'Sedan (Red)', speed: '112 km/h (ANOMALY)', conf: '95.8%', warrant: false, crop: assetUrl('images/car_gj18ij7890.jpg') },
            { model: 'Maruti Suzuki Swift', type: 'Hatchback (Grey)', speed: '48 km/h', conf: '96.4%', warrant: false, crop: assetUrl('images/hit_swift_clean.jpg') },
            { model: 'Ashok Leyland 1618', type: 'Heavy Commercial', speed: '42 km/h', conf: '94.7%', warrant: false, crop: assetUrl('images/car_rj14gh3456.jpg') },
          ];
          const currentTarget = currentVehicles[selectedIndex % currentVehicles.length];

          return (
            <div className="space-y-4">
              {/* Modal Sub-Header with Navigation controls */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#080C12] border border-[#1C2E42] rounded-lg flex-wrap gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selected.status === 'online' ? 'bg-[#00C875] animate-ping' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-white font-bold">{selected.name}</span>
                  <span className="text-[#8FA8C0]">({selected.location_name})</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      selected.status === 'online'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {selected.status.toUpperCase()}
                  </span>
                </div>

                {/* Prev / Next camera buttons & New Tab Fullscreen */}
                <div className="flex items-center gap-1.5">
                  <a
                    href={`/camera-stream/${selected.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-[#0E7FE0] hover:bg-[#108BFA] text-white rounded flex items-center gap-1.5 font-bold transition-all shadow-md shadow-[#0E7FE0]/25 text-xs font-mono"
                    title="Open Dedicated Fullscreen Surveillance Workstation in New Tab"
                  >
                    <ExternalLink size={12} />
                    <span>OPEN IN NEW TAB</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleSelectPrev}
                    className="px-2 py-1 bg-[#121E2E] hover:bg-[#1C2E42] text-white/80 hover:text-white rounded flex items-center gap-1 border border-[#1C2E42] transition-colors cursor-pointer"
                    title="Previous Camera"
                  >
                    <ChevronLeft size={14} />
                    <span>PREV</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectNext}
                    className="px-2 py-1 bg-[#121E2E] hover:bg-[#1C2E42] text-white/80 hover:text-white rounded flex items-center gap-1 border border-[#1C2E42] transition-colors cursor-pointer"
                    title="Next Camera"
                  >
                    <span>NEXT</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* ─── 3-COLUMN WORKSTATION CONSOLE ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* ─── LEFT SIDE: CURRENT DETECTED PLATE (3 COLS ON LG) ─── */}
                <div className="lg:col-span-3 flex flex-col gap-3">
                  <div className="p-3.5 bg-[#080D14] border border-[#1C2E42] rounded-lg shadow-inner flex flex-col gap-2.5">
                    <div className="flex items-center justify-between border-b border-[#1C2E42] pb-2">
                      <span className="text-[10px] font-mono font-bold text-[#00C875] flex items-center gap-1.5 uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-[#00C875] animate-ping" />
                        TARGET DETECTED
                      </span>
                      <span className="text-[9px] font-mono text-[#8FA8C0] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                        {selected.camera_id}
                      </span>
                    </div>

                    {/* IND Plate Badge with Large Visual Display */}
                    <div className="p-2 rounded bg-[#0D1520] border border-[#1C2E42] flex flex-col items-center justify-center gap-1">
                      <span className="text-[9px] font-mono text-[#8FA8C0] uppercase">CURRENT PLATE SCAN</span>
                      <LicensePlate plate={currentPlate} size="md" />
                    </div>

                    {/* Target Status Tag */}
                    {currentTarget.warrant ? (
                      <div className="p-1.5 rounded bg-red-500/15 border border-red-500/40 text-red-400 font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 animate-pulse">
                        <ShieldAlert size={13} />
                        <span>CRITICAL: ACTIVE WARRANT</span>
                      </div>
                    ) : (
                      <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>MATCH CONFIRMED · VALID RC</span>
                      </div>
                    )}

                    {/* Telemetry Details */}
                    <div className="space-y-1.5 text-xs font-mono bg-[#0D1520] p-2.5 rounded border border-[#162436]">
                      <div className="flex justify-between items-center">
                        <span className="text-white/50 text-[10px]">AI OCR CONF:</span>
                        <span className="text-[#00C875] font-bold text-[11px]">{currentTarget.conf}</span>
                      </div>
                      <div className="w-full bg-[#121E2E] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#00C875] h-full rounded-full" style={{ width: currentTarget.conf }} />
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-white/5">
                        <span className="text-white/50 text-[10px]">VEHICLE:</span>
                        <span className="text-white font-bold truncate max-w-[130px]" title={currentTarget.model}>
                          {currentTarget.model}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-white/50 text-[10px]">TYPE:</span>
                        <span className="text-[#8FA8C0]">{currentTarget.type}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-white/50 text-[10px]">SPEED:</span>
                        <span className={`font-bold ${currentTarget.speed.includes('ANOMALY') ? 'text-red-400' : 'text-amber-400'}`}>
                          {currentTarget.speed}
                        </span>
                      </div>
                    </div>

                    {/* Plate / Vehicle Crop Preview */}
                    <div>
                      <span className="text-[9px] font-mono text-white/50 block mb-1 uppercase">DETECTED VEHICLE ROI</span>
                      <div className="aspect-[2/1] bg-black rounded border border-[#1C2E42] overflow-hidden relative group shadow-md">
                        <img src={currentTarget.crop} alt="Vehicle crop" className="w-full h-full object-cover" />
                        <div className="absolute inset-1 border border-[#00C875]/50 pointer-events-none rounded-[2px]" />
                        <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 font-mono text-[8px] text-[#00C875]">
                          YOLOv8 + LPRNet
                        </div>
                      </div>
                    </div>

                    {/* Direct Action Links */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <Link
                        to={`/vehicles/details/${encodeURIComponent(currentPlate)}`}
                        className="w-full py-2 px-2.5 bg-[#0E7FE0] hover:bg-[#108BFA] text-white rounded font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all text-center"
                      >
                        <FileText size={13} />
                        <span>Open Full Dossier</span>
                      </Link>
                      <Link
                        to={`/investigation?plate=${encodeURIComponent(currentPlate)}`}
                        className="w-full py-1.5 px-2.5 bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233B57] rounded font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
                      >
                        <Compass size={13} />
                        <span>Trace Trajectory</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* ─── CENTER: LIVE VIDEO VIEWPORT (6 COLS ON LG) ─── */}
                <div className="lg:col-span-6 flex flex-col gap-2">
                  <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-black border border-[#1C2E42] shadow-2xl flex items-center justify-center">
                    {selected.status === 'online' && selected.hls_url ? (
                      <>
                        <video
                          ref={modalVideoRef}
                          key={selected.id}
                          src={selected.hls_url}
                          autoPlay
                          loop
                          muted={isModalMuted}
                          playsInline
                          className="w-full h-full object-cover transition-all"
                          style={{
                            filter: modalNightVision ? 'invert(1) hue-rotate(90deg) contrast(1.4)' : 'none',
                          }}
                        />

                        {/* High-tech ANPR Overlay */}
                        {showModalAi && (
                          <div
                            className="absolute z-20 pointer-events-none border-2 border-[#00C875] rounded-[3px] shadow-[0_0_16px_rgba(0,200,117,0.6)] animate-pulse"
                            style={{ top: '28%', left: '26%', width: '42%', height: '38%' }}
                          >
                            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white" />
                            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white" />

                            <div className="absolute -top-6 left-0 bg-[#080C12]/95 border border-[#00C875] text-[#00C875] px-2 py-0.5 rounded font-mono text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shadow-xl">
                              <span className="w-2 h-2 rounded-full bg-[#00C875] animate-ping" />
                              <span>{currentPlate}</span>
                              <span className="text-white/60 font-normal">({currentTarget.conf} CONF)</span>
                            </div>
                          </div>
                        )}

                        {/* Top HUD */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none text-xs font-mono">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            <span className="text-red-400 font-bold">LIVE REC</span>
                            <span className="text-white/40">|</span>
                            <span>{selected.camera_id}</span>
                          </div>
                          <div className="px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[#00C875] font-bold">
                            25 FPS · 1080P
                          </div>
                        </div>

                        {/* Bottom HUD bar */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none text-[10px] font-mono text-white/80">
                          <div className="px-2 py-0.5 rounded bg-black/80 border border-white/10 flex items-center gap-1.5">
                            <MapPin size={11} className="text-[#0E7FE0]" />
                            <span>{selected.location_name}</span>
                          </div>
                          <div className="px-2 py-0.5 rounded bg-black/80 border border-white/10">
                            {selected.latitude?.toFixed(4)}° N, {selected.longitude?.toFixed(4)}° E
                          </div>
                        </div>
                      </>
                    ) : (
                      <CctvOfflinePattern
                        camera={selected}
                        showControls={true}
                        onRetry={() => handlePingRetry(selected.id)}
                        isRetrying={retryingCamId === selected.id}
                      />
                    )}
                  </div>

                  {/* Video Playback Bar */}
                  <div className="p-2.5 bg-[#080D14] border border-[#1C2E42] rounded-lg flex items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (modalVideoRef.current) {
                            if (isPlaying) modalVideoRef.current.pause();
                            else modalVideoRef.current.play();
                            setIsPlaying(!isPlaying);
                          }
                        }}
                        className="p-1.5 rounded bg-[#131F30] hover:bg-[#1C2E42] text-white border border-[#233B57] transition-colors cursor-pointer"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsModalMuted(!isModalMuted);
                          if (modalVideoRef.current) modalVideoRef.current.muted = !isModalMuted;
                        }}
                        className="p-1.5 rounded bg-[#131F30] hover:bg-[#1C2E42] text-white border border-[#233B57] transition-colors cursor-pointer"
                        title={isModalMuted ? 'Unmute' : 'Mute'}
                      >
                        {isModalMuted ? <VolumeX size={13} /> : <Volume2 size={13} className="text-[#00C875]" />}
                      </button>

                      <div className="flex items-center gap-1 ml-1 text-[11px]">
                        <span className="text-[#6F87A1]">Speed:</span>
                        {[0.5, 1, 2, 4].map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => {
                              setPlaybackSpeed(spd);
                              if (modalVideoRef.current) modalVideoRef.current.playbackRate = spd;
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                              playbackSpeed === spd ? 'bg-[#0E7FE0] text-white font-bold' : 'text-[#8FA8C0] hover:text-white'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#6F87A1]">LATENCY: 38ms</span>
                      <span className="text-[10px] text-[#00C875] font-bold">LOSS: 0.02%</span>
                    </div>
                  </div>
                </div>

                {/* ─── RIGHT SIDE: CONTROL BUTTONS (3 COLS ON LG) ─── */}
                <div className="lg:col-span-3 flex flex-col gap-2.5">
                  <div className="p-3.5 bg-[#080D14] border border-[#1C2E42] rounded-lg shadow-inner flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b border-[#1C2E42] pb-2">
                      <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                        COMMAND & CONTROLS
                      </span>
                      <span className="text-[9px] font-mono text-[#00C875] font-bold">NODE READY</span>
                    </div>

                    {/* Button 1: Open in New Tab (target="_blank") */}
                    <a
                      href={`/camera-stream/${selected.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 bg-[#0E7FE0] hover:bg-[#108BFA] text-white rounded font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#0E7FE0]/25"
                      title="Open Dedicated Fullscreen Surveillance Workstation in New Browser Tab"
                    >
                      <ExternalLink size={14} />
                      <span>OPEN IN NEW TAB</span>
                    </a>

                    {/* Button 2: Toggle AI Boxes */}
                    <button
                      type="button"
                      onClick={() => setShowModalAi(!showModalAi)}
                      className={`w-full py-2 px-3 rounded font-mono text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                        showModalAi
                          ? 'bg-[#00C875]/15 text-[#00C875] border-[#00C875]/40'
                          : 'bg-[#121E2E] text-white/60 border-[#1C2E42] hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Eye size={14} />
                        <span>AI OVERLAYS</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold">{showModalAi ? 'ON' : 'OFF'}</span>
                    </button>

                    {/* Button 3: Capture Snapshot */}
                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      className="w-full py-2 px-3 bg-[#121E2E] hover:bg-[#1C2E42] text-white border border-[#233B57] rounded font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Camera size={14} />
                      <span>CAPTURE SNAPSHOT</span>
                    </button>

                    {/* Button 4: Night Vision Filter Toggle */}
                    <button
                      type="button"
                      onClick={() => setModalNightVision(!modalNightVision)}
                      className={`w-full py-2 px-3 rounded font-mono text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                        modalNightVision
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                          : 'bg-[#121E2E] text-white/60 border-[#1C2E42] hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert size={14} />
                        <span>NIGHT VISION</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold">{modalNightVision ? 'ACTIVE' : 'OFF'}</span>
                    </button>

                    {/* Button 5: Ping Stream Node */}
                    <button
                      type="button"
                      onClick={() => handlePingRetry(selected.id)}
                      disabled={retryingCamId === selected.id}
                      className="w-full py-2 px-3 bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#1C2E42] rounded font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={retryingCamId === selected.id ? 'animate-spin' : ''} />
                      <span>{retryingCamId === selected.id ? 'Pinging Node...' : 'PING STREAM NODE'}</span>
                    </button>

                    {/* Simulated PTZ Directional Controls */}
                    <div className="pt-2 border-t border-[#1C2E42]">
                      <span className="text-[9px] font-mono text-[#8FA8C0] block mb-1.5 uppercase font-bold">
                        SIMULATED PTZ CONTROLS
                      </span>
                      <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
                        <div />
                        <button type="button" onClick={() => toast.info('PTZ: Tilt Up 5°')} className="p-1.5 bg-[#121E2E] hover:bg-[#1C2E42] text-white rounded text-center cursor-pointer">▲</button>
                        <div />
                        <button type="button" onClick={() => toast.info('PTZ: Pan Left 5°')} className="p-1.5 bg-[#121E2E] hover:bg-[#1C2E42] text-white rounded text-center cursor-pointer">◀</button>
                        <button type="button" onClick={() => toast.info('PTZ: Center Position')} className="p-1.5 bg-[#121E2E] hover:bg-[#1C2E42] text-white rounded text-center cursor-pointer font-bold">●</button>
                        <button type="button" onClick={() => toast.info('PTZ: Pan Right 5°')} className="p-1.5 bg-[#121E2E] hover:bg-[#1C2E42] text-white rounded text-center cursor-pointer">▶</button>
                        <div />
                        <button type="button" onClick={() => toast.info('PTZ: Tilt Down 5°')} className="p-1.5 bg-[#121E2E] hover:bg-[#1C2E42] text-white rounded text-center cursor-pointer">▼</button>
                        <div />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── CORRELATED SIGHTINGS AT THIS CAMERA ─── */}
            <div className="p-3 bg-[#080C12] border border-[#1C2E42] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Correlated Plate Detections at this Node
                </span>
                <span className="text-[10px] font-mono text-[#8FA8C0]">
                  {sightings?.items?.length || 0} Detections Recorded
                </span>
              </div>

              <div className="space-y-1.5">
                {sightings?.items.map((s) => (
                  <div
                    key={s.id}
                    className="p-2 bg-[#0D1520] hover:bg-[#121E2E] border border-[#1C2E42] rounded flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#00C875] px-2 py-0.5 rounded bg-[#00C875]/10 border border-[#00C875]/30">
                        {s.plate_text}
                      </span>
                      <span className="text-white/60 font-mono text-[11px]">
                        {formatTimestamp(s.frame_ts)}
                      </span>
                      <span className="text-[10px] font-mono text-white/50">
                        Score: {((s.plate_conf || 0) * 100).toFixed(0)}%
                      </span>
                    </div>

                    <Link
                      to={'/investigation?plate=' + s.plate_text}
                      className="px-2.5 py-1 bg-[#0E7FE0]/20 hover:bg-[#0E7FE0] text-[#0E7FE0] hover:text-white rounded font-mono text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <span>Investigate Plate</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                ))}

                {!sightings?.items.length && (
                  <div className="text-center py-6 text-white/40 font-mono text-xs">
                    No detections recorded at this camera location.
                  </div>
                )}
              </div>
            </div>
          </div>
          );
        })()}
      </Modal>
    </div>
  );
};
