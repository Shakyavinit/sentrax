import React, { useState, useEffect, useRef } from 'react';
import { Camera } from '../../types';
import { Maximize2, Volume2, VolumeX, ShieldCheck, Zap } from 'lucide-react';
import { SAMPLE_PLATES } from '../../api/demoClient';
import { assetUrl } from '../../utils/demo';
import { VideoTrackingOverlay } from './VideoTrackingOverlay';

interface CctvLiveTileProps {
  camera: Camera;
  index: number;
  onOpen: () => void;
  className?: string;
  showAiOverlay?: boolean;
  visionMode?: 'standard' | 'night_vision' | 'flir_thermal' | 'edge_cv';
}

export const CctvLiveTile: React.FC<CctvLiveTileProps> = ({
  camera,
  index,
  onOpen,
  className = '',
  showAiOverlay = true,
  visionMode = 'standard',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Live ticking CCTV timestamp
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');
      const time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${ms} IST`;
      setCurrentTimeStr(time);
    };
    updateTime();
    const interval = setInterval(updateTime, 200);
    return () => clearInterval(interval);
  }, []);

  // Ensure video auto-plays muted
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {
        // Autoplay may be deferred until user interaction in some browsers
      });
    }
  }, [camera.hls_url, isMuted]);

  const plate = SAMPLE_PLATES[index % SAMPLE_PLATES.length];
  const conf = 92 + ((index * 3) % 7);
  const congestion = camera.congestion || 'LOW';

  // Deterministic bounding box position based on index
  const boxTop = 22 + ((index * 9) % 28);
  const boxLeft = 18 + ((index * 13) % 40);

  const getVisionFilter = () => {
    switch (visionMode) {
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

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none bg-[#080C12] group ${className}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      aria-label={`Inspect ${camera.name} live feed`}
    >
      {/* ─── LIVE VIDEO FEED OR FALLBACK ─── */}
      {!hasError && camera.hls_url ? (
        <video
          ref={videoRef}
          src={camera.hls_url}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onError={() => setHasError(true)}
          style={{ filter: getVisionFilter() }}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <img
          src={assetUrl(`images/feed_cam${String((index % 3) + 1).padStart(2, '0')}.jpg`)}
          alt={camera.name}
          style={{ filter: getVisionFilter() }}
          className="w-full h-full object-cover"
        />
      )}

      {/* ─── SENSOR OVERLAYS ─── */}
      {visionMode === 'night_vision' && (
        <>
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,255,100,0.18)_50%)] bg-[length:100%_4px] opacity-70 mix-blend-screen z-10" />
          <div className="absolute top-8 right-2 pointer-events-none bg-black/85 border border-emerald-500/50 px-1.5 py-0.5 rounded text-[8px] font-mono text-emerald-300 font-bold z-20 flex items-center gap-1 shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>IR 850nm</span>
          </div>
        </>
      )}

      {visionMode === 'flir_thermal' && (
        <>
          <div className="absolute right-1 top-8 bottom-8 w-1.5 rounded bg-gradient-to-t from-indigo-900 via-blue-600 via-purple-600 via-rose-500 via-amber-400 to-white pointer-events-none opacity-85 z-20" />
          <div className="absolute top-8 right-2 pointer-events-none bg-black/85 border border-amber-500/50 px-1.5 py-0.5 rounded text-[8px] font-mono text-amber-300 font-bold z-20 shadow">
            <span>FLIR LWIR</span>
          </div>
        </>
      )}

      {visionMode === 'edge_cv' && (
        <div className="absolute top-8 right-2 pointer-events-none bg-black/85 border border-cyan-500/50 px-1.5 py-0.5 rounded text-[8px] font-mono text-cyan-300 font-bold z-20 shadow">
          <span>SOBEL CV</span>
        </div>
      )}

      {/* ─── CRT SCANLINE EFFECT (SUBTLE) ─── */}
      <div className="cctv-scanline-subtle pointer-events-none absolute inset-0 z-10" />

      {/* ─── HUD TOP BAR ─── */}
      <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#080C12]/85 border border-[#1C2E42] text-white font-mono text-[10px] font-bold shadow-md">
            <span className="text-[#0E7FE0]">{camera.camera_id}</span>
            <span className="text-white/40">·</span>
            <span className="text-white/90 truncate max-w-[120px] sm:max-w-[160px]">{camera.name}</span>
          </div>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/70 border border-white/10 text-[9px] font-mono text-white/60">
            {camera.resolution || '1080p'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Pulsing REC badge */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/60 text-red-400 font-mono text-[9px] font-bold shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>LIVE REC</span>
          </div>

          {/* Mute/Unmute quick button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="p-1 rounded bg-black/70 hover:bg-black/90 text-white/70 hover:text-white border border-white/10 transition-colors"
            title={isMuted ? 'Unmute feed' : 'Mute feed'}
            aria-label={isMuted ? 'Unmute feed' : 'Mute feed'}
          >
            {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} className="text-[#00C875]" />}
          </button>
        </div>
      </div>

      {/* ─── HUD TIMESTAMP (SUB-TOP) ─── */}
      <div className="absolute top-8 left-2 z-20 pointer-events-none">
        <span className="px-1.5 py-0.5 rounded bg-black/75 border border-white/10 font-mono text-[9px] text-emerald-400 tracking-tight shadow">
          {currentTimeStr || '2026-09-14 13:50:00 IST'}
        </span>
      </div>

      {/* ─── SIMULATED AI ANPR BOUNDING BOX ─── */}
      {/* ─── REAL-TIME MULTI-OBJECT VEHICLE TRACKING OVERLAY ─── */}
      <VideoTrackingOverlay
        videoRef={videoRef}
        cameraId={camera.camera_id}
        enabled={showAiOverlay}
      />

      {/* ─── HUD BOTTOM BAR ─── */}
      <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none font-mono text-[9px]">
        {/* Congestion & Telemetry */}
        <div className="flex items-center gap-1">
          <span
            className={`px-1.5 py-0.5 rounded font-bold border ${
              congestion === 'HIGH'
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : congestion === 'MEDIUM'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}
          >
            {congestion} TRAFFIC
          </span>
          <span className="px-1.5 py-0.5 rounded bg-black/75 border border-white/10 text-white/70">
            {camera.fps || 25} FPS · 4.2 Mbps
          </span>
        </div>

        {/* Hover Inspect Indicator */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0E7FE0] text-white font-mono text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <Maximize2 size={10} />
          <span>INSPECT</span>
        </div>
      </div>
    </div>
  );
};
