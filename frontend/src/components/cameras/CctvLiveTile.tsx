import React, { useState, useEffect, useRef } from 'react';
import { Camera } from '../../types';
import { Maximize2, Volume2, VolumeX, ShieldCheck, Zap } from 'lucide-react';
import { SAMPLE_PLATES } from '../../api/demoClient';
import { assetUrl } from '../../utils/demo';

interface CctvLiveTileProps {
  camera: Camera;
  index: number;
  onOpen: () => void;
  className?: string;
  showAiOverlay?: boolean;
}

export const CctvLiveTile: React.FC<CctvLiveTileProps> = ({
  camera,
  index,
  onOpen,
  className = '',
  showAiOverlay = true,
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
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      ) : (
        <img
          src={assetUrl(`images/feed_cam${String((index % 3) + 1).padStart(2, '0')}.jpg`)}
          alt={camera.name}
          className="w-full h-full object-cover"
        />
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
      {showAiOverlay && (
        <div
          className="absolute z-20 pointer-events-none transition-all duration-700 border-2 border-[#00C875] rounded-[2px] shadow-[0_0_12px_rgba(0,200,117,0.45)]"
          style={{
            top: `${boxTop}%`,
            left: `${boxLeft}%`,
            width: '38%',
            height: '34%',
          }}
        >
          {/* Tactical Corner Brackets */}
          <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
          <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />

          {/* ANPR Plate Callout Tag */}
          <div className="absolute -top-5 left-0 bg-[#080C12]/95 border border-[#00C875] text-[#00C875] px-1.5 py-0.5 rounded font-mono text-[9px] font-bold whitespace-nowrap flex items-center gap-1 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] animate-ping" />
            <span>{plate}</span>
            <span className="text-white/60 text-[8px] font-normal">({conf}%)</span>
          </div>

          {/* Vehicle Class Badge (bottom) */}
          <div className="absolute -bottom-4 right-0 bg-[#080C12]/90 border border-white/20 text-white/80 px-1 py-0.2 rounded font-mono text-[8px] whitespace-nowrap">
            SEDAN · 42 km/h
          </div>
        </div>
      )}

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
