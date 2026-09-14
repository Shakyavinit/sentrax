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
} from 'lucide-react';
import { camerasApi } from '../api/cameras';
import { vehiclesApi } from '../api/vehicles';
import { PageHeader } from '../components/layout/PageHeader';
import { Modal } from '../components/ui/Modal';
import { CctvLiveTile } from '../components/cameras/CctvLiveTile';
import { CctvOfflinePattern } from '../components/cameras/CctvOfflinePattern';
import { formatTimestamp } from '../utils/format';
import { SAMPLE_PLATES } from '../api/demoClient';
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

  // Modal player states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isModalMuted, setIsModalMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showModalAi, setShowModalAi] = useState(true);
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAiOverlays(!showAiOverlays)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
                showAiOverlays
                  ? 'bg-[#00C875]/20 text-[#00C875] border-[#00C875]/40'
                  : 'bg-[#121E2E] text-white/60 border-[#1C2E42]'
              }`}
            >
              <Layers size={14} />
              <span>AI ANPR {showAiOverlays ? 'ON' : 'OFF'}</span>
            </button>
            <Link to="/cameras" className="primary-action">
              <CameraIcon size={16} /> Manage registry
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
              <div className="relative aspect-[16/10] w-full bg-black overflow-hidden">
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
        title={selected ? `${selected.camera_id} — ${selected.name}` : 'Camera Inspection'}
        maxWidth="4xl"
      >
        {selected && (
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
                  className="px-2 py-1 bg-[#121E2E] hover:bg-[#1C2E42] text-white/80 hover:text-white rounded flex items-center gap-1 border border-[#1C2E42] transition-colors"
                  title="Previous Camera"
                >
                  <ChevronLeft size={14} />
                  <span>PREV</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectNext}
                  className="px-2 py-1 bg-[#121E2E] hover:bg-[#1C2E42] text-white/80 hover:text-white rounded flex items-center gap-1 border border-[#1C2E42] transition-colors"
                  title="Next Camera"
                >
                  <span>NEXT</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* ─── VIDEO PLAYER OR SMPTE PATTERN ─── */}
            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-black border border-[#1C2E42] shadow-2xl">
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
                    className="w-full h-full object-cover"
                  />

                  {/* High-tech ANPR Overlay */}
                  {showModalAi && (
                    <div
                      className="absolute z-20 pointer-events-none border-2 border-[#00C875] rounded-[3px] shadow-[0_0_16px_rgba(0,200,117,0.6)]"
                      style={{ top: '28%', left: '26%', width: '42%', height: '38%' }}
                    >
                      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white" />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white" />

                      <div className="absolute -top-6 left-0 bg-[#080C12]/95 border border-[#00C875] text-[#00C875] px-2 py-0.5 rounded font-mono text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shadow-xl">
                        <span className="w-2 h-2 rounded-full bg-[#00C875] animate-ping" />
                        <span>{SAMPLE_PLATES[selectedIndex % SAMPLE_PLATES.length]}</span>
                        <span className="text-white/60 font-normal">(97.8% ANPR CONFIDENCE)</span>
                      </div>
                    </div>
                  )}

                  {/* Player Overlay Controls */}
                  <div className="absolute bottom-3 left-3 right-3 z-30 p-2.5 rounded-lg bg-[#080C12]/90 border border-white/10 backdrop-blur flex items-center justify-between gap-3 text-xs font-mono text-white">
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
                        className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsModalMuted(!isModalMuted);
                          if (modalVideoRef.current) modalVideoRef.current.muted = !isModalMuted;
                        }}
                        className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        title={isModalMuted ? 'Unmute' : 'Mute'}
                      >
                        {isModalMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[#00C875]" />}
                      </button>

                      <div className="flex items-center gap-1 ml-1">
                        <span className="text-white/60">Speed:</span>
                        {[1, 2, 4].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => {
                              setPlaybackSpeed(spd);
                              if (modalVideoRef.current) modalVideoRef.current.playbackRate = spd;
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              playbackSpeed === spd ? 'bg-[#0E7FE0] text-white font-bold' : 'text-white/60'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowModalAi(!showModalAi)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                          showModalAi
                            ? 'bg-[#00C875]/20 text-[#00C875] border-[#00C875]/40'
                            : 'bg-white/5 text-white/50 border-white/10'
                        }`}
                      >
                        AI BOXES {showModalAi ? 'ON' : 'OFF'}
                      </button>

                      <button
                        type="button"
                        onClick={handleCaptureSnapshot}
                        className="px-2.5 py-1 bg-[#1C2E42] hover:bg-[#0E7FE0] text-white rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                      >
                        <Camera size={12} />
                        <span>CAPTURE SNAPSHOT</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* OFFLINE CAMERA DISPLAY: FULL SMPTE PATTERN */
                <CctvOfflinePattern
                  camera={selected}
                  showControls={true}
                  onRetry={() => handlePingRetry(selected.id)}
                  isRetrying={retryingCamId === selected.id}
                />
              )}
            </div>

            {/* ─── MANAGED TELEMETRY & SPECIFICATIONS CARDS ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#080C12] border border-[#1C2E42] rounded-lg">
                <div className="font-mono text-[#8FA8C0] text-[10px] uppercase font-bold mb-2">
                  HARDWARE & ENCODING
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-white/50">Resolution:</span>
                    <span className="text-white">{selected.resolution || '1920×1080 FHD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Framerate:</span>
                    <span className="text-white">{selected.fps || 25} FPS (Progressive)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Protocol:</span>
                    <span className="text-[#0E7FE0]">HLS / RTSP over TCP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Bitrate:</span>
                    <span className="text-white">4.2 Mbps CBR</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#080C12] border border-[#1C2E42] rounded-lg">
                <div className="font-mono text-[#8FA8C0] text-[10px] uppercase font-bold mb-2">
                  NETWORK TOPOLOGY
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-white/50">Coordinates:</span>
                    <span className="text-white font-mono">
                      {selected.latitude?.toFixed(4)}° N, {selected.longitude?.toFixed(4)}° E
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Stream URI:</span>
                    <span className="text-[#0E7FE0] truncate max-w-[170px]" title={selected.rtsp_url}>
                      {selected.rtsp_url}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Traffic Status:</span>
                    <span
                      className={`font-bold ${
                        selected.congestion === 'HIGH'
                          ? 'text-red-400'
                          : selected.congestion === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {selected.congestion || 'LOW'} DENSITY
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Packet Loss:</span>
                    <span className={selected.status === 'offline' ? 'text-red-400' : 'text-emerald-400'}>
                      {selected.metadata?.packet_loss || (selected.status === 'offline' ? '100%' : '0.01%')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#080C12] border border-[#1C2E42] rounded-lg">
                <div className="font-mono text-[#8FA8C0] text-[10px] uppercase font-bold mb-2">
                  SIMULATED PTZ CONTROLS
                </div>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => toast.info('PTZ: Panning Left 5°')}
                    className="p-1.5 bg-[#121E2E] hover:bg-[#1C2E42] text-white rounded text-center"
                  >
                    ◀ PAN L
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info('PTZ: Tilting Up 5°')}
                    className="p-1.5 bg-[#121E2E] hover:bg-[#1C2E42] text-white rounded text-center"
                  >
                    ▲ TILT U
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info('PTZ: Panning Right 5°')}
                    className="p-1.5 bg-[#121E2E] hover:bg-[#1C2E42] text-white rounded text-center"
                  >
                    PAN R ▶
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info('PTZ: Zooming In 1.5x')}
                    className="p-1.5 bg-[#121E2E] hover:bg-[#1C2E42] text-[#00C875] rounded text-center font-bold"
                  >
                    ZOOM +
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info('PTZ: Resetting to Preset 1')}
                    className="p-1.5 bg-[#121E2E] hover:bg-[#1C2E42] text-white rounded text-center"
                  >
                    RESET
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info('PTZ: Zooming Out')}
                    className="p-1.5 bg-[#121E2E] hover:bg-[#1C2E42] text-[#0E7FE0] rounded text-center font-bold"
                  >
                    ZOOM -
                  </button>
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
        )}
      </Modal>
    </div>
  );
};
