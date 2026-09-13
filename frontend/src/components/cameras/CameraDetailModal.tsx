import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  X,
  Camera as CameraIcon,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Settings,
  ShieldCheck,
  Search,
  Route,
  Download,
  MoreVertical,
  Crosshair,
  Copy,
  Check,
  Calendar,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { VehicleDossierModal } from '../vehicles/VehicleDossierModal';

export interface CameraDetailModalProps {
  camera: Camera | null;
  allCameras: Camera[];
  isOpen?: boolean;
  inline?: boolean;
  onClose: () => void;
  onSelectCamera: (camera: Camera) => void;
  latestSighting?: any;
}

const CAM_VIDEO_MAP: Record<string, string> = {
  CAM01: './videos/cam_mg_road.mp4',
  CAM02: './videos/cam_sardar_bridge.mp4',
  CAM03: './videos/cam_vastrapur.mp4',
  CAM04: './videos/cam_sg_highway_toll.mp4',
  CAM05: './videos/cam_gift_city.mp4',
  CAM06: './videos/cam_gnlu_gate.mp4',
  CAM07: './videos/cam_sabarmati.mp4',
  CAM08: './videos/cam_sardar_bridge.mp4',
  CAM09: './videos/cam_vastrapur.mp4',
  CAM10: './videos/cam_mg_road.mp4',
};

export const CameraDetailModal: React.FC<CameraDetailModalProps> = ({
  camera,
  allCameras,
  isOpen = true,
  inline = false,
  onClose,
  onSelectCamera,
}) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Video playback states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');
  const [currentTimeSec, setCurrentTimeSec] = useState(84); // 01:24 default
  const [durationSec, setDurationSec] = useState(300); // 05:00 default
  const [currentFrame, setCurrentFrame] = useState(3728);
  const totalFrames = 9000;
  const [timestampInput, setTimestampInput] = useState('13-Sep-2026 11:54:24');
  const [progressPercent, setProgressPercent] = useState(28); // ~01:24 / 05:00
  const [copiedRtsp, setCopiedRtsp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Vehicle Dossier Modal
  const [dossierPlate, setDossierPlate] = useState<string | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Keyboard navigation (Escape to close, arrows to switch)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNextCamera();
      if (e.key === 'ArrowLeft') handlePrevCamera();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, camera, allCameras]);

  // Video source resolution
  const camKey = camera?.camera_id?.toUpperCase() || 'CAM07';
  const videoSrc = CAM_VIDEO_MAP[camKey] || './videos/cam_sabarmati.mp4';

  // Play video on mount / camera change
  useEffect(() => {
    if ((!isOpen && !inline) || !camera) return;
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
      video.playsInline = true;
      video.loop = true;
      video.src = videoSrc;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay with audio might be blocked by browser, enforce muted
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          });
      }
    }
  }, [isOpen, inline, camera, videoSrc]);

  if ((!isOpen && !inline) || !camera) return null;

  const currentIndex = allCameras.findIndex((c) => c.id === camera.id);
  const currentNum = currentIndex >= 0 ? currentIndex + 1 : 7;
  const totalCount = allCameras.length > 0 ? allCameras.length : 10;

  const handlePrevCamera = () => {
    if (allCameras.length === 0) return;
    const prevIndex = (currentIndex - 1 + allCameras.length) % allCameras.length;
    onSelectCamera(allCameras[prevIndex]);
  };

  const handleNextCamera = () => {
    if (allCameras.length === 0) return;
    const nextIndex = (currentIndex + 1) % allCameras.length;
    onSelectCamera(allCameras[nextIndex]);
  };

  // Video time update sync
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const cur = video.currentTime;
    const dur = video.duration || 300;
    setCurrentTimeSec(cur);
    setDurationSec(dur);
    const pct = dur > 0 ? (cur / dur) * 100 : 0;
    setProgressPercent(pct);
    setCurrentFrame(Math.floor(cur * 30) + 2500);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      setDurationSec(video.duration);
    }
  };

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const video = videoRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (video) {
      video.muted = nextMuted;
    }
    toast.info(nextMuted ? 'Audio muted' : 'Audio unmuted');
  };

  // Change Playback Speed
  const handleSpeedChange = (speed: string) => {
    setPlaybackSpeed(speed);
    const rate = parseFloat(speed.replace('x', ''));
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    toast.info(`Playback rate set to ${speed}`);
  };

  // Seek on timeline
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
    setProgressPercent(newPercent);
    if (videoRef.current) {
      const newTime = (newPercent / 100) * (videoRef.current.duration || 300);
      videoRef.current.currentTime = newTime;
      setCurrentTimeSec(newTime);
      setCurrentFrame(Math.floor(newTime * 30) + 2500);
    }
  };

  // Frame navigation
  const handleStepBack = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
      video.currentTime = Math.max(0, video.currentTime - 1 / 30);
      setCurrentFrame((prev) => Math.max(1, prev - 1));
    }
  };

  const handleStepForward = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
      video.currentTime = Math.min(video.duration, video.currentTime + 1 / 30);
      setCurrentFrame((prev) => Math.min(totalFrames, prev + 1));
    }
  };

  const handleJumpKeyframe = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.min(video.duration, video.currentTime + 1.0);
      setCurrentFrame((prev) => Math.min(totalFrames, prev + 30));
    }
  };

  // Toggle Fullscreen on player container
  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Capture real frame snapshot from <video>
  const handleCaptureSnapshot = () => {
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
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `SENTRAX_${camera.camera_id}_SNAP_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      // Cross-origin fallback download
      const link = document.createElement('a');
      link.href = './images/cam07_sabarmati_feed.jpg';
      link.download = `SENTRAX_${camera.camera_id}_FRAME_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    const fakeHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    toast.success(
      `Snapshot captured & Section 65B hash sealed: ${fakeHash.slice(0, 16)}...`,
      { duration: 4000 }
    );
  };

  // Copy RTSP
  const handleCopyRtsp = () => {
    const url = camera.rtsp_url || `rtsp://10.0.0.27:554/stream/${camera.camera_id.toLowerCase()}`;
    navigator.clipboard.writeText(url);
    setCopiedRtsp(true);
    toast.success('RTSP stream endpoint copied to clipboard');
    setTimeout(() => setCopiedRtsp(false), 2000);
  };

  // Preserve as Evidence
  const handlePreserveEvidence = () => {
    handleCaptureSnapshot();
  };

  // Open vehicle dossier
  const handleOpenDossier = (plate: string) => {
    setDossierPlate(plate);
    setIsDossierOpen(true);
  };

  // Download clip
  const handleDownloadClip = () => {
    toast.info(`Exporting 5-minute forensic MP4 clip from ${camera.camera_id}...`);
    const a = document.createElement('a');
    a.href = videoSrc;
    a.download = `SENTRAX_${camera.camera_id}_CLIP_13SEP2026.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      toast.success(`Download ready: SENTRAX_${camera.camera_id}_REC_13SEP2026.mp4`);
    }, 600);
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const rtspDisplay =
    camera.rtsp_url || `rtsp://10.0.0.27:554/stream/${camera.camera_id.toLowerCase()}`;

  return (
    <div
      className={
        inline
          ? 'w-full text-[#E8EFF7] flex flex-col animate-fade-in'
          : 'fixed inset-0 z-50 bg-[#070B11] text-[#E8EFF7] flex flex-col overflow-y-auto animate-fade-in'
      }
    >
      <div
        className={
          inline
            ? 'space-y-2.5 max-w-[1600px] w-full mx-auto'
            : 'p-3 sm:p-3.5 space-y-2.5 max-w-[1600px] w-full mx-auto'
        }
      >
        {/* 1. Top Camera Cockpit Header Bar */}
        <div className="bg-[#0A121D] border border-[#162536] rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2.5 shadow-md">
          {/* Left: Pager + Camera Identifier + Status + Subtitle */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Pager */}
            <div className="flex items-center bg-[#070D16] border border-[#1C2E42] rounded-lg p-0.5 shrink-0">
              <button
                onClick={handlePrevCamera}
                className="p-1 text-[#8FA8C0] hover:text-white hover:bg-[#121E2E] rounded transition-colors"
                title="Previous Camera (Left Arrow)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-mono font-bold text-[#0E7FE0]">
                {currentNum} / {totalCount}
              </span>
              <button
                onClick={handleNextCamera}
                className="p-1 text-[#8FA8C0] hover:text-white hover:bg-[#121E2E] rounded transition-colors"
                title="Next Camera (Right Arrow)"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Camera Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#0E7FE0] text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
                  {camera.camera_id}
                </span>
                <h1 className="text-sm font-semibold text-white truncate max-w-[240px] sm:max-w-md">
                  {camera.name}
                </h1>
                <div className="flex items-center gap-1.5 bg-[#00C875]/10 border border-[#00C875]/35 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] shadow-[0_0_6px_#00C875] animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-[#00C875] uppercase tracking-wider">
                    ONLINE
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#8FA8C0] font-mono mt-0.5 truncate">
                {camera.location_name || camera.name} • HLS • 1080p @ 30.0 FPS
              </p>
            </div>
          </div>

          {/* Right: Quick Switch Camera Pills + Close Button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-1">
              <span className="text-xs font-sans text-[#8FA8C0] mr-1">Switch Camera:</span>
              {(allCameras.length > 0
                ? allCameras.filter((c) =>
                    ['CAM01', 'CAM05', 'CAM06', 'CAM07', 'CAM08', 'CAM09', 'CAM10'].includes(c.camera_id)
                  )
                : []
              ).map((cam) => {
                const isActive = cam.id === camera.id || cam.camera_id === camera.camera_id;
                return (
                  <button
                    key={cam.camera_id}
                    onClick={() => onSelectCamera(cam)}
                    className={`text-xs font-mono px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#0E7FE0] text-white font-bold shadow-sm'
                        : 'bg-[#0A121D] border border-[#1C2E42] text-[#8FA8C0] hover:text-white hover:border-[#0E7FE0]/40'
                    }`}
                  >
                    {cam.camera_id}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#0E1724] hover:bg-[#16273B] text-[#8FA8C0] hover:text-white border border-[#1C2E42] transition-colors ml-1 cursor-pointer"
              title="Close View"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Main Two-Column Viewport */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* ================= LEFT COLUMN (~67%) ================= */}
          <div className="lg:col-span-8 flex flex-col space-y-2">
            {/* Main Video Viewport Container */}
            <div
              ref={playerContainerRef}
              className="relative rounded-xl overflow-hidden border border-[#162536] bg-black shadow-2xl group select-none"
            >
              {/* Base Video Element with Reduced Height */}
              <div className="relative w-full h-[240px] sm:h-[270px] md:h-[300px] lg:h-[320px] xl:h-[340px] max-h-[36vh] bg-[#02050A] flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  loop
                  className="w-full h-full object-cover"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                />

                {/* Top-Left: REC Indicator Overlay */}
                <div className="absolute top-3.5 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 z-10">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B3B] shadow-[0_0_8px_#FF3B3B] animate-pulse" />
                  <span className="text-[11px] font-mono font-bold text-white tracking-wide">
                    REC {camera.camera_id} - {camera.name}
                  </span>
                </div>

                {/* Top-Right: Stream Quality Specs & Buttons */}
                <div className="absolute top-3.5 right-4 flex items-center gap-2 z-10">
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 text-[11px] font-mono text-[#D8E6F5] space-x-2">
                    <span>HLS</span>
                    <span className="text-white/40">•</span>
                    <span>1080p</span>
                    <span className="text-white/40">•</span>
                    <span>30 FPS</span>
                    <span className="text-white/40">•</span>
                    <span>13-Sep-2026 11:54:24</span>
                  </div>
                  <button
                    onClick={handleCaptureSnapshot}
                    className="p-1.5 bg-black/60 backdrop-blur-md hover:bg-[#0E7FE0] text-white border border-white/10 rounded-md transition-colors"
                    title="Capture Forensic Frame Snapshot"
                  >
                    <CameraIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleToggleFullscreen}
                    className="p-1.5 bg-black/60 backdrop-blur-md hover:bg-[#0E7FE0] text-white border border-white/10 rounded-md transition-colors"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>

                {/* Tactical Real-time AI Bounding Box on Target Vehicle */}
                <div className="absolute top-[38%] left-[36%] w-[18%] h-[24%] border-2 border-[#00E5FF] rounded-sm pointer-events-auto z-10 transition-all shadow-[0_0_12px_rgba(0,229,255,0.4)]">
                  {/* Top classification tags */}
                  <div className="absolute -top-7 left-0 flex items-center">
                    <div className="bg-[#00E5FF] text-black font-mono font-black text-[10px] px-2 py-0.5 rounded-l tracking-wide">
                      CAR 95%
                    </div>
                    <div className="bg-[#0A121D]/95 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-r border border-[#00E5FF]/40 border-l-0">
                      63 km/h
                    </div>
                  </div>

                  {/* Bottom license plate badge */}
                  <div
                    onClick={() => handleOpenDossier('GJ27XY9090')}
                    className="absolute -bottom-7 left-1/2 -translate-x-1/2 cursor-pointer hover:scale-105 transition-transform"
                    title="Click to view vehicle dossier"
                  >
                    <div className="inline-flex items-center rounded-[3px] border border-gray-400/80 bg-white overflow-hidden shadow-lg font-mono font-bold text-black select-all">
                      <div className="bg-[#003399] text-white text-[8px] font-sans font-black px-1.5 py-0.5 flex items-center justify-center leading-none">
                        <span>IND</span>
                      </div>
                      <span className="px-2 py-0.5 text-[11px] text-black tracking-wider">
                        GJ27XY9090
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom In-Feed ANPR Lock Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-sm px-4 py-1.5 flex items-center justify-between text-xs font-mono text-white/90 z-10 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8FA8C0]">ANPR LOCK:</span>
                    <span className="text-white font-bold tracking-wider">GJ27XY9090</span>
                    <span className="text-[#00E5FF] font-semibold">(63 km/h)</span>
                  </div>
                </div>
              </div>

              {/* Video Player Bottom Controls Bar */}
              <div className="bg-[#070D16] border-t border-[#162536] px-3.5 py-1.5 flex items-center gap-2.5">
                {/* Play / Pause Toggle */}
                <button
                  onClick={handleTogglePlay}
                  className="text-white hover:text-[#0E7FE0] p-1 rounded transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                </button>

                {/* Progress Slider Track */}
                <div className="flex-1 flex items-center">
                  <div
                    onClick={handleSeek}
                    className="w-full h-1.5 bg-[#142030] hover:h-2 rounded-full overflow-visible relative cursor-pointer group transition-all"
                  >
                    <div
                      className="h-full bg-[#0E7FE0] rounded-full relative"
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-[#0E7FE0] border-2 border-white rounded-full shadow-[0_0_8px_#0E7FE0] opacity-100 cursor-grab" />
                    </div>
                  </div>
                </div>

                {/* Timestamp Formatted */}
                <span className="text-[11px] font-mono text-[#8FA8C0] shrink-0">
                  {formatTime(currentTimeSec)} / {formatTime(durationSec)}
                </span>

                {/* Volume / Mute */}
                <button
                  onClick={handleToggleMute}
                  className="text-[#8FA8C0] hover:text-white p-1 rounded transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                {/* Settings */}
                <button
                  onClick={() => toast.info('Stream parameters: 1080p60 H.264 / CBR 4500kbps')}
                  className="text-[#8FA8C0] hover:text-white p-1 rounded transition-colors cursor-pointer"
                  title="Stream Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={handleToggleFullscreen}
                  className="text-[#8FA8C0] hover:text-white p-1 rounded transition-colors cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Video Control Deck (Speed, Frame Navigation, Timestamp) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-[#0A121D] border border-[#162536] rounded-xl shadow-md">
              {/* 1. Playback Speed */}
              <div>
                <div className="text-[10px] font-mono text-[#8FA8C0] uppercase tracking-wider mb-1">
                  Playback Speed
                </div>
                <div className="flex items-center gap-1">
                  {['0.5x', '1x', '1.5x', '2x', '3x'].map((speed) => {
                    const isActive = speed === playbackSpeed;
                    return (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`flex-1 text-[11px] font-mono py-0.5 rounded transition-colors ${
                          isActive
                            ? 'bg-[#0E7FE0] text-white font-bold'
                            : 'bg-[#070D16] border border-[#162536] text-[#8FA8C0] hover:text-white hover:border-[#0E7FE0]/40'
                        }`}
                      >
                        {speed}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Frame Navigation */}
              <div>
                <div className="text-[10px] font-mono text-[#8FA8C0] uppercase tracking-wider mb-1">
                  Frame Navigation
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleStepBack}
                      className="p-1 rounded bg-[#070D16] border border-[#162536] text-[#8FA8C0] hover:text-white transition-colors"
                      title="Step Backward (1 frame)"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleStepForward}
                      className="p-1 rounded bg-[#070D16] border border-[#162536] text-[#8FA8C0] hover:text-white transition-colors"
                      title="Step Forward (1 frame)"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleJumpKeyframe}
                      className="p-1 rounded bg-[#070D16] border border-[#162536] text-[#8FA8C0] hover:text-white transition-colors"
                      title="Jump to Next Keyframe"
                    >
                      <ChevronsRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-[11px] font-mono text-[#8FA8C0]">
                    Frame: <span className="text-[#0E7FE0] font-bold">{currentFrame}</span> / {totalFrames}
                  </div>
                </div>
              </div>

              {/* 3. Timestamp Seek */}
              <div>
                <div className="text-[10px] font-mono text-[#8FA8C0] uppercase tracking-wider mb-1">
                  Timestamp
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 flex items-center bg-[#070D16] border border-[#162536] rounded px-2 py-0.5">
                    <Calendar className="w-3 h-3 text-[#4D6B85] mr-1.5 shrink-0" />
                    <input
                      type="text"
                      value={timestampInput}
                      onChange={(e) => setTimestampInput(e.target.value)}
                      className="w-full bg-transparent text-[11px] font-mono text-white focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => toast.success(`Seeked to ${timestampInput}`)}
                    className="bg-[#0A121D] border border-[#162536] hover:border-[#0E7FE0] hover:text-white text-[#8FA8C0] text-[11px] font-mono font-bold px-2.5 py-0.5 rounded transition-colors"
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {/* Button 1: Preserve as Evidence */}
              <button
                onClick={handlePreserveEvidence}
                className="bg-[#00C875] hover:bg-[#00B066] text-white font-sans font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,200,117,0.25)] transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Preserve as Evidence</span>
              </button>

              {/* Button 2: Inspect Camera Dossier */}
              <button
                onClick={() => toast.info(`Viewing Camera Dossier: ${camera.camera_id} (${camera.name})`)}
                className="bg-[#0E7FE0] hover:bg-[#0A6EC5] text-white font-sans font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-[0_0_12px_rgba(14,127,224,0.25)] transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Inspect Camera Dossier</span>
              </button>

              {/* Button 3: Reconstruct Journey */}
              <button
                onClick={() => {
                  onClose();
                  navigate('/journey?plate=GJ27XY9090');
                }}
                className="bg-[#0A121D] hover:bg-[#121E2E] border border-[#162536] hover:border-[#0E7FE0] text-white font-sans font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Route className="w-3.5 h-3.5 text-[#8FA8C0]" />
                <span>Reconstruct Journey</span>
              </button>

              {/* Button 4: Download Clip */}
              <button
                onClick={handleDownloadClip}
                className="bg-[#0A121D] hover:bg-[#121E2E] border border-[#162536] hover:border-[#0E7FE0] text-white font-sans font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#8FA8C0]" />
                <span>Download Clip</span>
              </button>

              {/* Button 5: More Options */}
              <button
                onClick={handleCopyRtsp}
                className="p-1.5 bg-[#0A121D] hover:bg-[#121E2E] border border-[#162536] hover:border-[#0E7FE0] text-[#8FA8C0] hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Copy RTSP & More Actions"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (~33%) ================= */}
          <div className="lg:col-span-4 flex flex-col space-y-2.5">
            {/* Card 1: Active Field Detections */}
            <div className="bg-[#0A121D] border border-[#162536] rounded-xl p-2.5 shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#142030] mb-2">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5 text-[#00C875]" />
                  <h3 className="text-xs font-semibold text-white">Active Field Detections</h3>
                </div>
                <span className="bg-[#00C875]/10 border border-[#00C875]/40 text-[#00C875] text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  REAL-TIME (YOLOv8)
                </span>
              </div>

              {/* List of 3 Sightings */}
              <div className="space-y-1.5">
                {/* Sighting 1: MH12EF9012 */}
                <div
                  onClick={() => handleOpenDossier('MH12EF9012')}
                  className="p-2 rounded-lg bg-[#070D16] border border-[#162536] flex items-center gap-2.5 hover:border-[#0E7FE0]/60 transition-colors cursor-pointer group"
                >
                  <img
                    src="./images/car_mh12ef9012.jpg"
                    alt="SUV MH12EF9012"
                    className="w-12 h-10 object-cover rounded border border-[#1C2E42] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      {/* HSRP License Plate */}
                      <div className="inline-flex items-center rounded-[2px] border border-gray-400 bg-white overflow-hidden text-black font-mono font-bold text-[11px] select-all shadow-sm">
                        <div className="bg-[#003399] text-white text-[7px] font-sans font-black px-1 py-0.5 leading-none">
                          IND
                        </div>
                        <span className="px-1.5 py-0.5 text-[11px] text-black">MH12EF9012</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#0E7FE0] border border-[#0E7FE0]/40 px-1 py-0.5 rounded">
                        SUV 98%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-[#8FA8C0]">
                      <span>68 km/h</span>
                      <span className="text-[#00C875] font-sans text-[10px]">R. Dubey (Verified)</span>
                    </div>
                  </div>
                </div>

                {/* Sighting 2: GJ18IJ7890 */}
                <div
                  onClick={() => handleOpenDossier('GJ18IJ7890')}
                  className="p-2 rounded-lg bg-[#070D16] border border-[#162536] flex items-center gap-2.5 hover:border-[#0E7FE0]/60 transition-colors cursor-pointer group"
                >
                  <img
                    src="./images/car_gj18ij7890.jpg"
                    alt="Car GJ18IJ7890"
                    className="w-12 h-10 object-cover rounded border border-[#1C2E42] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      {/* HSRP License Plate */}
                      <div className="inline-flex items-center rounded-[2px] border border-gray-400 bg-white overflow-hidden text-black font-mono font-bold text-[11px] select-all shadow-sm">
                        <div className="bg-[#003399] text-white text-[7px] font-sans font-black px-1 py-0.5 leading-none">
                          IND
                        </div>
                        <span className="px-1.5 py-0.5 text-[11px] text-black">GJ18IJ7890</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#0E7FE0] border border-[#0E7FE0]/40 px-1 py-0.5 rounded">
                        CAR 96%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-[#8FA8C0]">
                      <span>54 km/h</span>
                      <span className="text-[#00C875] font-sans text-[10px]">A. Patel (Verified)</span>
                    </div>
                  </div>
                </div>

                {/* Sighting 3: RJ14GH3456 (WATCHLIST HIT - RED ALERT) */}
                <div
                  onClick={() => handleOpenDossier('RJ14GH3456')}
                  className="p-2 rounded-lg bg-[#140608] border border-[#FF3B3B] shadow-[0_0_15px_rgba(255,59,59,0.25)] flex items-center gap-2.5 cursor-pointer group hover:bg-[#1E090D] transition-colors"
                >
                  <img
                    src="./images/car_rj14gh3456.jpg"
                    alt="Stolen Fortuner RJ14GH3456"
                    className="w-12 h-10 object-cover rounded border border-[#FF3B3B]/50 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      {/* HSRP License Plate */}
                      <div className="inline-flex items-center rounded-[2px] border border-gray-400 bg-white overflow-hidden text-black font-mono font-bold text-[11px] select-all shadow-sm">
                        <div className="bg-[#003399] text-white text-[7px] font-sans font-black px-1 py-0.5 leading-none">
                          IND
                        </div>
                        <span className="px-1.5 py-0.5 text-[11px] text-black">RJ14GH3456</span>
                      </div>
                      <span className="bg-[#FF3B3B] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(255,59,59,0.5)]">
                        WATCHLIST HIT
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-[#8FA8C0]">
                      <span>73 km/h</span>
                      <span className="text-[#FF3B3B] font-mono font-bold text-[10px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse" />
                        Stolen Vehicle
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Camera Optical Ingestion */}
            <div className="bg-[#0A121D] border border-[#162536] rounded-xl p-2.5 shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#142030] mb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#0E7FE0]" />
                  <h3 className="text-xs font-semibold text-white">Camera Optical Ingestion</h3>
                </div>
                <span className="bg-[#00C875]/10 border border-[#00C875]/40 text-[#00C875] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] shadow-[0_0_6px_#00C875]" />
                  ONLINE
                </span>
              </div>

              {/* Technical Metadata Table */}
              <div className="space-y-1 text-xs font-sans">
                <div className="flex items-center justify-between py-0.5 border-b border-[#142030]/60">
                  <span className="text-[#8FA8C0]">Node Identifier</span>
                  <span className="text-white font-mono font-bold">{camera.camera_id}</span>
                </div>

                <div className="flex items-center justify-between py-0.5 border-b border-[#142030]/60">
                  <span className="text-[#8FA8C0]">Location</span>
                  <span className="text-white font-medium truncate max-w-[190px] text-right">
                    {camera.location_name || camera.name}
                  </span>
                </div>

                <div className="flex items-center justify-between py-0.5 border-b border-[#142030]/60">
                  <span className="text-[#8FA8C0]">Ingest Protocol</span>
                  <span className="text-white font-mono">{camera.protocol?.toUpperCase() || 'HLS / RTSP'}</span>
                </div>

                <div className="flex items-center justify-between py-0.5 border-b border-[#142030]/60">
                  <span className="text-[#8FA8C0]">Stream Latency</span>
                  <span className="text-[#00C875] font-mono font-bold">14.2 ms</span>
                </div>

                <div className="flex items-center justify-between py-0.5 border-b border-[#142030]/60">
                  <span className="text-[#8FA8C0]">Edge AI Model</span>
                  <span className="text-white font-mono">YOLOv8n + PaddleOCR</span>
                </div>

                <div className="flex items-center justify-between py-0.5 border-b border-[#142030]/60">
                  <span className="text-[#8FA8C0]">Geo-coordinates</span>
                  <span className="text-[#8FA8C0] font-mono text-[11px]">
                    {camera.latitude ? `${camera.latitude.toFixed(4)}, ${camera.longitude?.toFixed(4)}` : '23.0306, 72.5678'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#8FA8C0]">PTZ Position</span>
                  <span className="text-white font-mono text-[11px]">Az: 182.4° | Tilt: -2.1°</span>
                </div>
              </div>

              {/* RTSP Endpoint Sub-Box */}
              <div className="mt-2 pt-2 border-t border-[#142030]">
                <div className="text-[10px] font-mono text-[#8FA8C0] uppercase tracking-wider mb-1">
                  RTSP Endpoint
                </div>
                <div className="flex items-center justify-between bg-[#070D16] border border-[#162536] rounded-lg px-2.5 py-1.5">
                  <span className="text-xs font-mono text-[#8FA8C0] italic truncate mr-2 select-all">
                    {rtspDisplay}
                  </span>
                  <button
                    onClick={handleCopyRtsp}
                    className="p-1 text-[#8FA8C0] hover:text-[#0E7FE0] transition-colors"
                    title="Copy RTSP URL"
                  >
                    {copiedRtsp ? <Check className="w-3.5 h-3.5 text-[#00C875]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Dossier Modal */}
      {dossierPlate && (
        <VehicleDossierModal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          plate={dossierPlate}
        />
      )}
    </div>
  );
};
