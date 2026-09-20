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
  ChevronDown
} from 'lucide-react';
import { useCameras } from '../hooks/useCameras';
import { Camera } from '../types';

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
    <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-3">
      {/* Top Tactical Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0C121D] border border-[#1A2638] rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 font-mono tracking-tight">
                TACTICAL CAMERA MATRIX
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {activeCount} LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-sensor situational surveillance matrix inspired by TrafficVision · Real-time CCTV streams & anomaly tracking
            </p>
          </div>
        </div>

        {/* Tactical Controls */}
        <div className="flex items-center gap-2">
          {/* City Filter */}
          <div className="flex items-center bg-[#070B12] border border-[#1A2638] rounded-lg p-0.5 text-xs font-mono">
            {(['ALL', 'Ahmedabad', 'Gandhinagar'] as const).map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`px-2.5 py-1 rounded transition ${
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
                className={`px-2.5 py-1 rounded transition ${
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
            className="px-2.5 py-1.5 rounded-lg border border-[#1A2638] bg-[#070B12] hover:bg-[#121B29] text-slate-300 text-xs font-mono transition flex items-center gap-1.5"
            title={mutedAll ? 'Unmute video audio' : 'Mute all feeds'}
          >
            {mutedAll ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-blue-400" />}
            <span>{mutedAll ? 'MUTED' : 'AUDIO ON'}</span>
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div
        className="flex-1 bg-[#050811] rounded-xl border border-[#1A2638] overflow-hidden p-1.5"
        style={{
          display: 'grid',
          gridTemplateColumns: expandedIndex !== null ? '1fr' : `repeat(${selectedGrid.cols}, 1fr)`,
          gridTemplateRows: expandedIndex !== null ? '1fr' : `repeat(${Math.ceil(selectedGrid.count / selectedGrid.cols)}, 1fr)`,
          gap: '6px',
        }}
      >
        {Array.from({ length: selectedGrid.count }).map((_, slotIdx) => {
          if (expandedIndex !== null && expandedIndex !== slotIdx) return null;

          const cam = getCameraBySlot(slotIdx);
          const isExpanded = expandedIndex === slotIdx;
          const speedInfo = cam ? SPEED_DATA[cam.camera_id] : undefined;
          const isAlert = speedInfo?.alert || cam?.congestion === 'HIGH';

          return (
            <div
              key={slotIdx}
              className={`relative flex flex-col bg-[#090E17] border rounded-lg overflow-hidden transition-all group ${
                isAlert
                  ? 'border-red-600/70 shadow-[0_0_12px_rgba(220,38,38,0.25)]'
                  : 'border-[#1A2638] hover:border-blue-500/50'
              }`}
            >
              {/* Feed Header */}
              <div className="px-2.5 py-1.5 bg-[#0D1522] border-b border-[#1A2638] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      cam?.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  />
                  <span className="font-mono text-xs font-bold text-slate-200 truncate">
                    {cam ? `${cam.camera_id} · ${cam.name}` : `SLOT ${slotIdx + 1}`}
                  </span>

                  {/* Congestion Badge */}
                  {cam?.congestion && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        cam.congestion === 'HIGH'
                          ? 'bg-red-950/70 text-red-300 border border-red-700/50'
                          : cam.congestion === 'MEDIUM'
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-700/50'
                          : 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/50'
                      }`}
                    >
                      {cam.congestion}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Slot Camera Picker */}
                  <select
                    value={cam?.camera_id || ''}
                    onChange={(e) => setCameraForSlot(slotIdx, e.target.value)}
                    className="bg-[#070B12] border border-[#1A2638] text-slate-300 text-[10px] font-mono rounded px-1.5 py-0.5 focus:outline-none focus:border-blue-500 max-w-[95px]"
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
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#1A2638] transition"
                    title={isExpanded ? 'Restore Grid' : 'Maximize Video'}
                  >
                    {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Video Player Area */}
              <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                {cam?.hls_url ? (
                  <video
                    key={cam.hls_url}
                    autoPlay
                    loop
                    muted={mutedAll}
                    playsInline
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback placeholder if video file not available
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  >
                    <source src={cam.hls_url} type="video/mp4" />
                  </video>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <CameraIcon className="w-8 h-8 opacity-40" />
                    <span className="text-[10px] font-mono">FEED STANDBY</span>
                  </div>
                )}

                {/* AI HUD Overlay Corner Brackets */}
                <div className="absolute top-2 left-2 pointer-events-none flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10 text-[10px] font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>AI ACTIVE</span>
                  </div>
                  {speedInfo && (
                    <div
                      className={`flex items-center gap-1 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        speedInfo.alert
                          ? 'bg-red-950/80 border-red-700/60 text-red-300 animate-pulse'
                          : 'bg-black/70 border-white/10 text-slate-300'
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      <span>{speedInfo.speed} km/h</span>
                      {speedInfo.alert && <span>[OVERSPEED]</span>}
                    </div>
                  )}
                </div>

                {/* Bottom-right Ticker Badge */}
                <div className="absolute bottom-2 right-2 pointer-events-none flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10 text-[10px] font-mono text-blue-300 font-bold">
                    <Car className="w-3 h-3 text-blue-400" />
                    <span>{cam?.recent_sightings_count ?? 12} VEHICLES</span>
                  </div>
                </div>
              </div>

              {/* Feed Footer Strip */}
              <div className="px-2.5 py-1 bg-[#0D1522] border-t border-[#1A2638] flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
                <span className="truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {cam?.location_name || 'Gujarat Sector'}
                </span>
                <span className="text-slate-500">25 FPS · 1080p</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
