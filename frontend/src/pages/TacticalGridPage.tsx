import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid3X3,
  Maximize2,
  Minimize2,
  Radio,
  AlertTriangle,
  RefreshCw,
  Camera as CameraIcon,
  Car,
  Activity,
  Zap,
  MapPin,
  Volume2,
  VolumeX,
  Layers,
  ChevronDown,
  Eye,
  Flame,
  Moon,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { useCameras } from '../hooks/useCameras';
import { Camera } from '../types';
import { toast } from 'sonner';

export type VisionMode = 'standard' | 'night_vision' | 'flir_thermal' | 'edge_cv';

const VISION_MODES: { id: VisionMode; label: string; icon: any; color: string; desc: string }[] = [
  { id: 'standard', label: 'RAW RGB', icon: Eye, color: 'text-sky-400', desc: 'Standard true-color optical feed' },
  { id: 'night_vision', label: 'NIGHT VISION (IR)', icon: Moon, color: 'text-emerald-400', desc: '850nm Infrared military green phosphor' },
  { id: 'flir_thermal', label: 'FLIR THERMAL', icon: Flame, color: 'text-amber-400', desc: 'Long-Wave Infrared 8-14μm heat spectrogram' },
  { id: 'edge_cv', label: 'EDGE CV MATRIX', icon: Sparkles, color: 'text-cyan-400', desc: 'Sobel high-pass vehicle contour detection' },
];

const GRID_PRESETS = [
  { label: '2×2 (4 Feeds)', cols: 2, count: 4 },
  { label: '2×3 (6 Feeds)', cols: 3, count: 6 },
  { label: '3×3 (9 Feeds)', cols: 3, count: 9 },
];

const SPEED_DATA: Record<string, { speed: number; alert: boolean }> = {
  CAM01: { speed: 52, alert: false },
  CAM02: { speed: 48, alert: false },
  CAM03: { speed: 61, alert: false },
  CAM04: { speed: 88, alert: true },
  CAM05: { speed: 45, alert: false },
  CAM06: { speed: 74, alert: true },
  CAM07: { speed: 55, alert: false },
  CAM08: { speed: 42, alert: false },
  CAM09: { speed: 82, alert: true },
};

export const TacticalGridPage: React.FC = () => {
  const { data: allCameras = [], isLoading } = useCameras();
  const [selectedGrid, setSelectedGrid] = useState(GRID_PRESETS[1]); // default 2x3
  const [assignedCamIds, setAssignedCamIds] = useState<string[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [mutedAll, setMutedAll] = useState(true);
  const [cityFilter, setCityFilter] = useState<'ALL' | 'Ahmedabad' | 'Gandhinagar'>('ALL');
  const [globalVisionMode, setGlobalVisionMode] = useState<VisionMode>('standard');
  const [slotVisionOverrides, setSlotVisionOverrides] = useState<Record<number, VisionMode>>({});

  // Play subtle tactical audio feedback on mode change
  const playTacticalModeSound = (mode: VisionMode) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      if (mode === 'night_vision') {
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + 0.15);
      } else if (mode === 'flir_thermal') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.15);
      } else if (mode === 'edge_cv') {
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12);
      } else {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
      }
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  const handleGlobalVisionChange = (mode: VisionMode) => {
    setGlobalVisionMode(mode);
    setSlotVisionOverrides({}); // reset slot overrides to sync with global
    playTacticalModeSound(mode);
    const modeObj = VISION_MODES.find((m) => m.id === mode);
    toast.info(`Tactical Matrix Sensor: ${modeObj?.label} Activated`);
  };

  const cycleSlotVision = (slotIdx: number) => {
    const currentMode = slotVisionOverrides[slotIdx] || globalVisionMode;
    const modeKeys: VisionMode[] = ['standard', 'night_vision', 'flir_thermal', 'edge_cv'];
    const nextIdx = (modeKeys.indexOf(currentMode) + 1) % modeKeys.length;
    const nextMode = modeKeys[nextIdx];
    setSlotVisionOverrides((prev) => ({ ...prev, [slotIdx]: nextMode }));
    playTacticalModeSound(nextMode);
    toast.success(`Slot ${slotIdx + 1} Sensor: ${VISION_MODES.find((m) => m.id === nextMode)?.label}`);
  };

  const getVisionFilter = (mode: VisionMode) => {
    switch (mode) {
      case 'night_vision':
        return 'contrast(1.45) brightness(1.22) saturate(2.6) hue-rotate(65deg) drop-shadow(0 0 2px #22c55e)';
      case 'flir_thermal':
        return 'contrast(1.9) saturate(2.8) hue-rotate(185deg) invert(0.88) brightness(1.15)';
      case 'edge_cv':
        return 'contrast(2.4) grayscale(1) invert(0.12) brightness(1.3) drop-shadow(0 0 1px #38bdf8)';
      default:
        return 'none';
    }
  };

  // Filter cameras
  const filteredCameras = useMemo(() => {
    if (cityFilter === 'ALL') return allCameras;
    return allCameras.filter((c) => c.location_name?.toLowerCase().includes(cityFilter.toLowerCase()));
  }, [allCameras, cityFilter]);

  // Initialize assigned cameras
  useEffect(() => {
    if (allCameras.length > 0 && assignedCamIds.length === 0) {
      const initial = allCameras.slice(0, 9).map((c) => c.camera_id);
      setAssignedCamIds(initial);
    }
  }, [allCameras, assignedCamIds.length]);

  const setCameraForSlot = (slotIdx: number, camId: string) => {
    setAssignedCamIds((prev) => {
      const copy = [...prev];
      copy[slotIdx] = camId;
      return copy;
    });
  };

  const getCameraBySlot = (idx: number): Camera | undefined => {
    const id = assignedCamIds[idx];
    return allCameras.find((c) => c.camera_id === id) || allCameras[idx];
  };

  const activeCount = allCameras.filter((c) => c.status === 'online').length;

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-3 font-sans">
      {/* Top Tactical Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0C121D] border-2 border-[#1A2638] rounded-2xl px-4 py-3 shadow-lg">
        {/* Left: Title & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.25)]">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold text-white font-mono tracking-wide">
                TACTICAL CAMERA MATRIX
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                {activeCount} NODES ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Multi-sensor tactical grid with real-time FLIR Thermal & Night-Vision IR filters
            </p>
          </div>
        </div>

        {/* Center: Global Sensor Vision Mode Switcher */}
        <div className="flex items-center bg-[#070B12] border-2 border-[#1A2638] rounded-xl p-1 gap-1 shadow-inner">
          <span className="text-[10px] font-mono text-slate-400 px-2 font-bold uppercase hidden xl:inline">
            SENSOR MODE:
          </span>
          {VISION_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSel = globalVisionMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleGlobalVisionChange(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSel
                    ? mode.id === 'night_vision'
                      ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)] border border-emerald-400'
                      : mode.id === 'flir_thermal'
                      ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-400'
                      : mode.id === 'edge_cv'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)] border border-cyan-400'
                      : 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)] border border-blue-400'
                    : 'text-slate-300 hover:text-white hover:bg-[#121B29]'
                }`}
                title={mode.desc}
              >
                <Icon size={14} className={isSel ? '' : mode.color} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Tactical Controls & Preset Selection */}
        <div className="flex items-center gap-2">
          {/* City Filter */}
          <div className="flex items-center bg-[#070B12] border border-[#1A2638] rounded-lg p-0.5 text-xs font-mono">
            {(['ALL', 'Ahmedabad', 'Gandhinagar'] as const).map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`px-2.5 py-1 rounded transition cursor-pointer font-semibold ${
                  cityFilter === city
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Grid Presets */}
          <div className="flex items-center bg-[#070B12] border border-[#1A2638] rounded-lg p-0.5 text-xs font-mono">
            {GRID_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setSelectedGrid(preset);
                  setExpandedIndex(null);
                }}
                className={`px-2.5 py-1 rounded transition cursor-pointer font-semibold ${
                  selectedGrid.label === preset.label
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset.label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Global Mute Toggle */}
          <button
            onClick={() => setMutedAll((m) => !m)}
            className="px-2.5 py-1.5 rounded-lg border border-[#1A2638] bg-[#070B12] hover:bg-[#121B29] text-slate-200 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer font-semibold"
            title={mutedAll ? 'Unmute video audio' : 'Mute all feeds'}
          >
            {mutedAll ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-blue-400" />}
            <span>{mutedAll ? 'MUTED' : 'AUDIO'}</span>
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div
        className="flex-1 bg-[#050811] rounded-2xl border-2 border-[#1A2638] overflow-hidden p-2 shadow-2xl"
        style={{
          display: 'grid',
          gridTemplateColumns: expandedIndex !== null ? '1fr' : `repeat(${selectedGrid.cols}, 1fr)`,
          gridTemplateRows: expandedIndex !== null ? '1fr' : `repeat(${Math.ceil(selectedGrid.count / selectedGrid.cols)}, 1fr)`,
          gap: '8px',
        }}
      >
        {Array.from({ length: selectedGrid.count }).map((_, slotIdx) => {
          if (expandedIndex !== null && expandedIndex !== slotIdx) return null;

          const cam = getCameraBySlot(slotIdx);
          const isExpanded = expandedIndex === slotIdx;
          const speedInfo = cam ? SPEED_DATA[cam.camera_id] : undefined;
          const isAlert = speedInfo?.alert || cam?.congestion === 'HIGH';
          const slotVision = slotVisionOverrides[slotIdx] || globalVisionMode;
          const activeModeObj = VISION_MODES.find((m) => m.id === slotVision);

          return (
            <div
              key={slotIdx}
              className={`relative flex flex-col bg-[#090E17] border-2 rounded-xl overflow-hidden transition-all group ${
                slotVision === 'night_vision'
                  ? 'border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : slotVision === 'flir_thermal'
                  ? 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : slotVision === 'edge_cv'
                  ? 'border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : isAlert
                  ? 'border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'border-[#1A2638] hover:border-blue-500/60'
              }`}
            >
              {/* Feed Header */}
              <div className="px-3 py-2 bg-[#0D1522] border-b border-[#1A2638] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      cam?.status === 'online' ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-slate-500'
                    }`}
                  />
                  <span className="font-mono text-xs font-bold text-white truncate">
                    {cam ? `${cam.camera_id} · ${cam.name}` : `SLOT ${slotIdx + 1}`}
                  </span>

                  {/* Congestion Badge */}
                  {cam?.congestion && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        cam.congestion === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : cam.congestion === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {cam.congestion}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Per-Slot Vision Mode Cycle Button */}
                  <button
                    onClick={() => cycleSlotVision(slotIdx)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition flex items-center gap-1 cursor-pointer ${
                      slotVision === 'night_vision'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : slotVision === 'flir_thermal'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : slotVision === 'edge_cv'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                    title="Click to cycle sensor mode for this feed"
                  >
                    <span>{slotVision === 'night_vision' ? '🟢 IR' : slotVision === 'flir_thermal' ? '🔥 FLIR' : slotVision === 'edge_cv' ? '⚡ EDGE' : '☀️ RGB'}</span>
                  </button>

                  {/* Slot Camera Picker */}
                  <select
                    value={cam?.camera_id || ''}
                    onChange={(e) => setCameraForSlot(slotIdx, e.target.value)}
                    className="bg-[#070B12] border border-[#1A2638] text-slate-200 text-[10px] font-mono rounded px-1.5 py-0.5 focus:outline-none focus:border-blue-500 max-w-[95px]"
                  >
                    {filteredCameras.map((c) => (
                      <option key={c.camera_id} value={c.camera_id}>
                        {c.camera_id}
                      </option>
                    ))}
                  </select>

                  {/* Expand / Minimize */}
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : slotIdx)}
                    className="p-1 text-slate-300 hover:text-white rounded hover:bg-[#1A2638] transition cursor-pointer"
                    title={isExpanded ? 'Restore Grid' : 'Maximize Video'}
                  >
                    {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Video Player Area with Active Vision Filter */}
              <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden select-none">
                {cam?.hls_url ? (
                  <video
                    key={cam.hls_url}
                    autoPlay
                    loop
                    muted={mutedAll}
                    playsInline
                    className="w-full h-full object-cover transition-all duration-300"
                    style={{ filter: getVisionFilter(slotVision) }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  >
                    <source src={cam.hls_url} type="video/mp4" />
                  </video>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <CameraIcon className="w-8 h-8 opacity-40" />
                    <span className="text-xs font-mono">FEED STANDBY</span>
                  </div>
                )}

                {/* Night-Vision Green CRT Scanlines & Vignette */}
                {slotVision === 'night_vision' && (
                  <>
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,255,100,0.18)_50%)] bg-[length:100%_4px] opacity-70 mix-blend-screen" />
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,40,15,0.7)_100%)]" />
                    <div className="absolute top-2 right-2 pointer-events-none bg-black/80 border border-emerald-500/50 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-300 font-bold flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>IR 850nm · 12.4x GAIN</span>
                    </div>
                  </>
                )}

                {/* FLIR Thermal Ironbow Temperature Color Scale & Overlay */}
                {slotVision === 'flir_thermal' && (
                  <>
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-blue-900/20 via-purple-900/10 to-amber-900/20 mix-blend-color-dodge" />
                    {/* Thermal Scale Bar */}
                    <div className="absolute right-2 top-8 bottom-8 w-2.5 rounded-md bg-gradient-to-t from-indigo-900 via-blue-600 via-purple-600 via-rose-500 via-amber-400 to-white pointer-events-none opacity-85 border border-white/30 shadow-md flex flex-col justify-between items-center text-[7px] font-mono text-white font-black py-0.5">
                      <span>85°</span>
                      <span>50°</span>
                      <span>15°</span>
                    </div>
                    <div className="absolute top-2 right-2 pointer-events-none bg-black/80 border border-amber-500/50 px-2 py-0.5 rounded text-[9px] font-mono text-amber-300 font-bold flex items-center gap-1 shadow-sm">
                      <Flame size={11} className="text-amber-400" />
                      <span>FLIR LWIR 8-14μm · CALIBRATED</span>
                    </div>
                  </>
                )}

                {/* Edge CV High-Pass Overlay */}
                {slotVision === 'edge_cv' && (
                  <>
                    <div className="absolute top-2 right-2 pointer-events-none bg-black/80 border border-cyan-500/50 px-2 py-0.5 rounded text-[9px] font-mono text-cyan-300 font-bold flex items-center gap-1 shadow-sm">
                      <Sparkles size={11} className="text-cyan-400" />
                      <span>SOBEL-CV · 99.2% CONTOUR</span>
                    </div>
                  </>
                )}

                {/* AI HUD Overlay Corner Brackets */}
                <div className="absolute top-2 left-2 pointer-events-none flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 text-[10px] font-mono text-emerald-300 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>AI MATRIX LOCK</span>
                  </div>
                  {speedInfo && (
                    <div
                      className={`flex items-center gap-1 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        speedInfo.alert
                          ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse shadow-md'
                          : 'bg-black/85 border-white/20 text-slate-200'
                      }`}
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>{speedInfo.speed} km/h</span>
                      {speedInfo.alert && <span className="text-rose-400 font-black">[OVERSPEED]</span>}
                    </div>
                  )}
                </div>

                {/* Bottom-right Ticker Badge */}
                <div className="absolute bottom-2 right-2 pointer-events-none flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-black/85 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/20 text-[10px] font-mono text-cyan-300 font-bold shadow-sm">
                    <Car className="w-3 h-3 text-cyan-400" />
                    <span>{cam?.recent_sightings_count ?? 12} VEHICLES</span>
                  </div>
                </div>

                {/* Corner Crosshairs */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none opacity-60" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none opacity-60" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none opacity-60" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none opacity-60" />
              </div>

              {/* Feed Footer Strip */}
              <div className="px-3 py-1.5 bg-[#0D1522] border-t border-[#1A2638] flex items-center justify-between text-xs font-mono text-slate-300 shrink-0">
                <span className="truncate flex items-center gap-1.5 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {cam?.location_name || 'Gujarat Sector'}
                </span>
                <span className="text-cyan-400 font-semibold">{slotVision === 'flir_thermal' ? 'THERMAL LWIR' : slotVision === 'night_vision' ? 'NIGHT IR 850nm' : '25 FPS · 1080p'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TacticalGridPage;
