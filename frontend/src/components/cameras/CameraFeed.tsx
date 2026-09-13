import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Radio, Maximize2, Camera as CameraIcon, Scan, ShieldAlert, Zap, ZoomIn, ZoomOut, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { getTrackedVehiclesAtTime, TrackedVehicle } from '../../utils/cameraTracks';

export interface CameraFeedProps {
  hlsUrl?: string;
  rtspUrl?: string;
  status: string;
  cameraName: string;
  lastPlate?: string;
  lastPlateTime?: string;
  latestSighting?: any;
  onExpand?: () => void;
  onSnapshot?: (dataUrl: string, frameData: { cameraName: string; timestamp: string; trackedVehicles: TrackedVehicle[] }) => void;
  onSelectVehicle?: (vehicle: TrackedVehicle) => void;
  selectedVehicleId?: string | null;
  enableControls?: boolean;
  zoomLevel?: number; // 1, 1.5, 2, 3
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  hlsUrl,
  status,
  cameraName,
  lastPlate,
  lastPlateTime,
  latestSighting,
  onExpand,
  onSnapshot,
  onSelectVehicle,
  selectedVehicleId,
  enableControls = true,
  zoomLevel = 1,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [trackedVehicles, setTrackedVehicles] = useState<TrackedVehicle[]>([]);
  const [flashAlert, setFlashAlert] = useState<string | null>(null);
  const [flashSighting, setFlashSighting] = useState<string | null>(null);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  // Extract camera identifier (e.g. CAM01, CAM02)
  const camMatch = cameraName.match(/CAM\d+/);
  const camKey = camMatch ? camMatch[0] : 'CAM01';

  // Video fallback source map
  const CAM_VIDEO_FALLBACKS: Record<string, string> = {
    CAM01: '/videos/cam_mg_road.mp4',
    CAM02: '/videos/cam_sardar_bridge.mp4',
    CAM03: '/videos/cam_vastrapur.mp4',
    CAM04: '/videos/cam_sg_highway_toll.mp4',
    CAM05: '/videos/cam_sector15.mp4',
    CAM06: '/videos/cam_gift_city.mp4',
    CAM07: '/videos/cam_sabarmati.mp4',
    CAM08: '/videos/cam_gnlu_gate.mp4',
    CAM09: '/videos/cam_chiloda_circle.mp4',
    CAM10: '/videos/cam_kudasan.mp4',
  };

  // 1. Initialize and play video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || status === 'offline') return;

    const chosenFallback = CAM_VIDEO_FALLBACKS[camKey] || '/videos/cam_mg_road.mp4';
    const targetSrc = hlsUrl && hlsUrl.endsWith('.mp4') ? hlsUrl : chosenFallback;

    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.crossOrigin = 'anonymous';

    if (video.src !== targetSrc && !video.src.endsWith(targetSrc)) {
      video.src = targetSrc;
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          if (video.src !== chosenFallback) {
            video.src = chosenFallback;
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        });
    }
  }, [hlsUrl, status, camKey]);

  // 2. High-precision continuous tracking synced with video playback
  useEffect(() => {
    let animFrameId: number;
    let lastSecond = -1;

    const updateTracking = () => {
      const video = videoRef.current;
      if (video && !video.paused && status !== 'offline') {
        const currentTime = video.currentTime;
        // Update vehicle positions
        const vehicles = getTrackedVehiclesAtTime(camKey, currentTime);
        setTrackedVehicles(vehicles);

        // Check if any tracked vehicle in this frame is a critical watchlist match
        const currentSecInt = Math.floor(currentTime);
        if (currentSecInt !== lastSecond) {
          lastSecond = currentSecInt;
          const wl = vehicles.find((v) => v.isWatchlist && v.isScanned);
          if (wl) {
            setFlashAlert(`WATCHLIST HIT: ${wl.plate} (${wl.watchlistReason || 'Priority Target'})`);
            setTimeout(() => setFlashAlert(null), 3500);
          }
        }
      }
      animFrameId = requestAnimationFrame(updateTracking);
    };

    animFrameId = requestAnimationFrame(updateTracking);
    return () => cancelAnimationFrame(animFrameId);
  }, [camKey, status]);

  // 3. React to live WebSocket sightings for this camera
  useEffect(() => {
    if (latestSighting && (latestSighting.camera_identifier === camKey || latestSighting.camera_id === camKey)) {
      setFlashSighting(latestSighting.plate_text);
      const timer = setTimeout(() => setFlashSighting(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [latestSighting, camKey]);

  // 4. Capture exact frame snapshot for forensic evidence
  const handleCaptureSnapshot = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

        setSnapshotSuccess(true);
        setTimeout(() => setSnapshotSuccess(false), 2000);

        if (onSnapshot) {
          onSnapshot(dataUrl, {
            cameraName,
            timestamp: new Date().toISOString(),
            trackedVehicles,
          });
        }
      }
    } catch (err) {
      console.warn('Snapshot capture warning (CORS/tainted canvas):', err);
    }
  }, [videoRef, cameraName, trackedVehicles, onSnapshot]);

  const isOffline = status === 'offline';
  const isWarning = status === 'warning';
  const hasWatchlistActive = trackedVehicles.some((v) => v.isWatchlist);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video bg-[#050A10] rounded-[6px] overflow-hidden border transition-all duration-300 group ${
        flashAlert
          ? 'border-[#FF3B3B] shadow-[0_0_20px_rgba(255,59,59,0.5)] ring-1 ring-[#FF3B3B]'
          : flashSighting
          ? 'border-[#00C875] shadow-[0_0_15px_rgba(0,200,117,0.4)] ring-1 ring-[#00C875]'
          : isOffline
          ? 'border-[#FF3B3B]/50 shadow-[0_0_15px_rgba(255,59,59,0.2)]'
          : isWarning
          ? 'border-[#FF8C00]/60 shadow-[0_0_15px_rgba(255,140,0,0.2)]'
          : 'border-[#1C2E42] hover:border-[#0E7FE0]'
      }`}
    >
      {/* Video element with digital zoom capability */}
      {!isOffline ? (
        <div
          className={`w-full h-full transition-transform duration-200 ${isWarning ? 'filter contrast-125 brightness-90' : ''}`}
          style={{
            transform: zoomLevel > 1 ? `scale(${zoomLevel})` : 'none',
            transformOrigin: 'center center',
          }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            loop
          />
        </div>
      ) : (
        /* Tactical Camera Offline Screen with Scanlines */
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#070B10] text-[#4D6B85] relative overflow-hidden p-4">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.45)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative mb-2">
              <div className="w-10 h-10 rounded-full bg-[#FF3B3B]/10 border border-[#FF3B3B]/40 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-5 h-5 text-[#FF3B3B]" />
              </div>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#FF3B3B] animate-ping" />
            </div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#FF3B3B] uppercase">
              FEED INTERRUPTED · SIGNAL LOST
            </span>
            <span className="text-[9px] text-[#8FA8C0] font-mono mt-0.5">
              ERR_RTSP_CARRIER_DROP (0x54) · PACKET LOSS 100%
            </span>
            <div className="mt-2 flex items-center gap-1.5 bg-[#0D1520] border border-[#233A52] px-2 py-0.5 rounded text-[8px] font-mono text-[#8FA8C0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00] animate-pulse" />
              <span>HARDWARE PING RETRY IN 3.8s</span>
            </div>
          </div>
        </div>
      )}

      {/* Warning State Banner */}
      {!isOffline && isWarning && (
        <div className="absolute top-8 left-2 right-2 p-1.5 bg-[#FF8C00]/90 text-[#080C12] rounded-[3px] text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-lg z-20">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">SIGNAL DEGRADED · 48% PACKET LOSS · RTSP BUFFER JITTER</span>
        </div>
      )}

      {/* Synthetic Scanning Laser Bar */}
      {!isOffline && (
        <div className="absolute left-0 right-0 h-[1.5px] bg-[rgba(14,127,224,0.4)] shadow-[0_0_8px_#0E7FE0] animate-scan pointer-events-none" />
      )}

      {/* Dynamic Vehicle Tracking Overlays */}
      {!isOffline && showOverlays && trackedVehicles.map((veh) => {
        const isSelected = selectedVehicleId === veh.id;
        const isCritical = veh.isWatchlist;

        return (
          <div
            key={veh.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectVehicle?.(veh);
            }}
            className={`absolute pointer-events-auto cursor-pointer transition-all duration-150 rounded-[2px] ${
              isCritical
                ? 'border-2 border-[#FF3B3B] bg-[#FF3B3B]/10 shadow-[0_0_15px_rgba(255,59,59,0.6)]'
                : isSelected
                ? 'border-2 border-[#0E7FE0] bg-[#0E7FE0]/15 shadow-[0_0_15px_rgba(14,127,224,0.6)]'
                : 'border border-[#00C875]/80 hover:border-[#00C875] bg-[#00C875]/5'
            }`}
            style={{
              left: `${veh.x}%`,
              top: `${veh.y}%`,
              width: `${veh.w}%`,
              height: `${veh.h}%`,
            }}
          >
            {/* Tactical Corner Reticles */}
            <div className={`absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 ${isCritical ? 'border-[#FF3B3B]' : 'border-[#00C875]'}`} />
            <div className={`absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 ${isCritical ? 'border-[#FF3B3B]' : 'border-[#00C875]'}`} />
            <div className={`absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 ${isCritical ? 'border-[#FF3B3B]' : 'border-[#00C875]'}`} />
            <div className={`absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 ${isCritical ? 'border-[#FF3B3B]' : 'border-[#00C875]'}`} />

            {/* Top Tag: Classification, Confidence & Speed */}
            <div className="absolute -top-5 left-0 flex items-center gap-1 pointer-events-none whitespace-nowrap z-10">
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] shadow flex items-center gap-1 ${
                  isCritical
                    ? 'bg-[#FF3B3B] text-white animate-pulse'
                    : 'bg-[#00C875] text-[#080C12]'
                }`}
              >
                {isCritical && <ShieldAlert className="w-2.5 h-2.5" />}
                {veh.vclass} {Math.round(veh.conf * 100)}%
              </span>
              <span className="bg-[#0D1520]/90 border border-[#233A52] text-[#8FA8C0] text-[8px] font-mono px-1 py-0.5 rounded-[2px]">
                {veh.speedKmh} km/h
              </span>
            </div>

            {/* Bottom Plate Badge */}
            <div
              className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider shadow-lg whitespace-nowrap z-10 ${
                isCritical
                  ? 'bg-[#1C0505] border border-[#FF3B3B] text-white shadow-[0_0_8px_rgba(255,59,59,0.5)]'
                  : 'bg-[#080C12]/95 border border-[#00C875]/80 text-[#00C875]'
              }`}
            >
              <span className="text-[7px] bg-[#0E7FE0] text-white px-0.5 rounded-[1px] font-sans font-bold">IND</span>
              <span>{veh.plate}</span>
            </div>

            {/* Pulsing ANPR Lock indicator if vehicle is in the scan zone */}
            {veh.isScanned && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-3 h-3 rounded-full border border-dashed animate-spin ${isCritical ? 'border-[#FF3B3B]' : 'border-[#00C875]'}`} />
              </div>
            )}
          </div>
        );
      })}

      {/* Alert Banner for Watchlist Hit */}
      {flashAlert && (
        <div className="absolute top-10 left-2 right-2 p-2 bg-[#FF3B3B]/95 text-white rounded-[4px] text-xs font-mono font-bold flex items-center gap-2 shadow-2xl z-20 animate-bounce">
          <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
          <span className="truncate">{flashAlert}</span>
        </div>
      )}

      {/* Sighting Banner for Real WebSocket Hit */}
      {flashSighting && !flashAlert && (
        <div className="absolute top-10 left-2 right-2 p-1.5 bg-[#00C875]/95 text-[#080C12] rounded-[4px] text-xs font-mono font-bold flex items-center gap-2 shadow-xl z-20">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>ANPR CAPTURE: {flashSighting} · SIGHTING ARCHIVED</span>
        </div>
      )}

      {/* Top Header Overlay: Camera Name, REC, Status */}
      <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-[#080C12]/90 via-[#080C12]/60 to-transparent flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF3B3B] animate-pulse" />
          <span className="text-[10px] font-mono text-[#FF3B3B] font-bold tracking-wider">REC</span>
          <span className="text-xs font-mono font-medium text-[#E8EFF7] drop-shadow-md truncate max-w-[160px] sm:max-w-[220px]">
            {cameraName}
          </span>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Active vehicle count badge */}
          {trackedVehicles.length > 0 && (
            <span className="text-[9px] font-mono bg-[#0D1520]/90 border border-[#233A52] text-[#00C875] px-1.5 py-0.5 rounded-[3px] hidden sm:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] animate-ping" />
              {trackedVehicles.length} TRACKED
            </span>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 bg-[#080C12]/85 px-2 py-0.5 rounded border border-[#233A52]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === 'online'
                  ? 'bg-[#00C875] shadow-[0_0_6px_#00C875]'
                  : status === 'warning'
                  ? 'bg-[#FF8C00] shadow-[0_0_6px_#FF8C00]'
                  : 'bg-[#FF3B3B] shadow-[0_0_6px_#FF3B3B]'
              }`}
            />
            <span
              className={`text-[10px] font-mono font-medium uppercase ${
                status === 'online'
                  ? 'text-[#8FA8C0]'
                  : status === 'warning'
                  ? 'text-[#FF8C00]'
                  : 'text-[#FF3B3B]'
              }`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Action Ribbon (Expand, Snapshot, Overlays) */}
      {enableControls && (
        <div className="absolute top-10 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-auto">
          {onExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
              title="Expand / Full Inspection View"
              className="p-1.5 rounded bg-[#0D1520]/90 hover:bg-[#0E7FE0] text-[#E8EFF7] border border-[#233A52] hover:border-[#0E7FE0] transition-colors shadow-lg"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleCaptureSnapshot}
            title="Forensic Frame Snapshot"
            className={`p-1.5 rounded text-[#E8EFF7] border transition-colors shadow-lg ${
              snapshotSuccess
                ? 'bg-[#00C875] border-[#00C875]'
                : 'bg-[#0D1520]/90 hover:bg-[#00C875] border-[#233A52] hover:border-[#00C875]'
            }`}
          >
            <CameraIcon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOverlays(!showOverlays);
            }}
            title={showOverlays ? 'Hide AI Overlays' : 'Show AI Overlays'}
            className={`p-1.5 rounded text-[#E8EFF7] border transition-colors shadow-lg ${
              showOverlays
                ? 'bg-[#0D1520]/90 border-[#233A52] text-[#00C875]'
                : 'bg-[#0D1520]/90 border-[#233A52] text-[#4D6B85]'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Telemetry Bar: Plate, Class, Timestamp */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-[#080C12]/95 via-[#080C12]/70 to-transparent flex items-center justify-between pointer-events-none z-10">
        <div className="text-[10px] font-mono text-[#8FA8C0] flex items-center gap-2">
          {hasWatchlistActive ? (
            <span className="text-[#FF3B3B] font-bold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              WATCHLIST TARGET IN VIEW
            </span>
          ) : trackedVehicles.length > 0 ? (
            <span>
              ANPR LOCK: <strong className="text-white">{trackedVehicles[0].plate}</strong> ({trackedVehicles[0].speedKmh} km/h)
            </span>
          ) : lastPlate ? (
            <span>
              LAST DETECT: <strong className="text-white">{lastPlate}</strong>
            </span>
          ) : (
            <span className="text-[#4D6B85]">SCANNING OPTICAL FEED</span>
          )}
        </div>
        <div className="text-[10px] font-mono text-[#4D6B85] flex items-center gap-1.5">
          <span className="hidden sm:inline">1080p · 30 FPS</span>
          <span className="text-[#8FA8C0]">
            {lastPlateTime || new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};
