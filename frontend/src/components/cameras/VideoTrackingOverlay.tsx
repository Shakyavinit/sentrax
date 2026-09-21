import React, { useEffect, useState, useRef } from 'react';
import { videoTrackingEngine, TrackedObject } from '../../services/videoTrackingService';
import { ShieldAlert, Zap, Radio } from 'lucide-react';

interface VideoTrackingOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraId: string;
  enabled?: boolean;
  showTrails?: boolean;
  showPlates?: boolean;
  showSpeed?: boolean;
}

export const VideoTrackingOverlay: React.FC<VideoTrackingOverlayProps> = ({
  videoRef,
  cameraId,
  enabled = true,
  showTrails = true,
  showPlates = true,
  showSpeed = true,
}) => {
  const [tracks, setTracks] = useState<TrackedObject[]>([]);
  const isLiveBackend = videoTrackingEngine.isLiveBackendActive();
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setTracks([]);
      return;
    }

    // 1. Check if a live backend stream listener is active
    const unsubscribe = videoTrackingEngine.subscribeLiveFeed(cameraId, (liveTracks) => {
      setTracks(liveTracks);
    });

    // 2. High-performance requestAnimationFrame loop synced directly with the video's currentTime
    const updateLoop = () => {
      const video = videoRef.current;
      if (video && !video.paused && !video.ended && video.readyState >= 2) {
        const curTime = video.currentTime || 0;
        const duration = video.duration || 16;
        const currentTracks = videoTrackingEngine.getTracksAtTime(cameraId, curTime, duration);
        setTracks(currentTracks);
      }
      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      unsubscribe();
    };
  }, [enabled, cameraId, videoRef]);

  if (!enabled || tracks.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* ─── LIVE BACKEND / EDGE NEURAL SENSOR STATUS PILL ─── */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 text-[9px] font-mono shadow-md z-30">
        <span className={`w-1.5 h-1.5 rounded-full ${isLiveBackend ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
        <span className="text-white font-bold">
          {isLiveBackend ? 'LIVE BACKEND YOLOv8 + DEEPSORT' : 'OPTICAL YOLO TRACKER'}
        </span>
        <span className="text-white/40">·</span>
        <span className="text-cyan-300 font-bold">{tracks.length} OBJECTS</span>
      </div>

      {/* ─── MOVING BOUNDING BOXES FOR REAL OBJECT TRACKING ─── */}
      {tracks.map((trk) => {
        const isAlert = trk.is_watchlist || trk.speed_kmh > 75;
        const borderColor = trk.is_watchlist
          ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
          : trk.class_name === 'truck' || trk.class_name === 'bus'
          ? 'border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
          : 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]';

        return (
          <div
            key={trk.track_id}
            className={`absolute border-2 rounded-[3px] transition-all duration-75 select-none ${borderColor}`}
            style={{
              left: `${trk.x}%`,
              top: `${trk.y}%`,
              width: `${trk.w}%`,
              height: `${trk.h}%`,
            }}
          >
            {/* Tactical Corner Reticles */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />

            {/* Top Info Strip: Class, Track ID, Confidence */}
            <div className="absolute -top-6 left-0 flex items-center gap-1 whitespace-nowrap">
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight shadow-md flex items-center gap-1 ${
                  trk.is_watchlist
                    ? 'bg-rose-950/95 text-rose-300 border border-rose-600 animate-pulse'
                    : 'bg-black/90 text-emerald-300 border border-emerald-500/60'
                }`}
              >
                {trk.is_watchlist && <ShieldAlert size={10} className="text-rose-400 animate-spin" />}
                <span>
                  #{trk.track_id} · {trk.class_name.toUpperCase()} {Math.round(trk.confidence * 100)}%
                </span>
              </span>

              {/* Speed Telemetry Badge */}
              {showSpeed && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shadow-md flex items-center gap-0.5 ${
                    trk.speed_kmh > 75
                      ? 'bg-rose-950/90 text-rose-300 border border-rose-500'
                      : 'bg-black/85 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  <Zap size={9} className="text-amber-400" />
                  <span>{trk.speed_kmh} km/h</span>
                </span>
              )}
            </div>

            {/* Bottom Callout: Indian HSRP Number Plate Tag */}
            {showPlates && trk.plate && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded border shadow-lg font-mono text-[9px] font-bold ${
                    trk.is_watchlist
                      ? 'bg-rose-600 text-white border-rose-300 shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                      : 'bg-white text-black border-slate-400'
                  }`}
                >
                  <span className="text-[7px] font-black bg-blue-900 text-white px-0.5 rounded-sm">IND</span>
                  <span className="tracking-wider">{trk.plate}</span>
                  {trk.is_watchlist && <span className="text-[8px] font-black uppercase text-amber-200">[WANTED]</span>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
