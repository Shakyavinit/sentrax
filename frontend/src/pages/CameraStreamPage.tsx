import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Camera as CameraIcon,
  Radio,
  Wifi,
  WifiOff,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
  MapPin,
  Clock,
  Activity,
  Download,
  Share2,
  ChevronRight,
  Eye,
  Crosshair
} from 'lucide-react';
import { CctvOfflinePattern } from '../components/cameras/CctvOfflinePattern';
import { CAMERAS } from '../api/demoClient';
import { toast } from 'sonner';

export const CameraStreamPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryId = id || searchParams.get('id') || searchParams.get('camera') || 'cam-01';
  
  // Find selected camera (by id or camera_id)
  const selectedCam = CAMERAS.find(
    c => c.id.toLowerCase() === queryId.toLowerCase() || c.camera_id.toLowerCase() === queryId.toLowerCase()
  ) || CAMERAS[0];

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [nightVision, setNightVision] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hudTime, setHudTime] = useState('');

  // Ticking surveillance clock with ms
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      setHudTime(
        now.getFullYear() + '-' +
        pad(now.getMonth() + 1) + '-' +
        pad(now.getDate()) + ' ' +
        pad(now.getHours()) + ':' +
        pad(now.getMinutes()) + ':' +
        pad(now.getSeconds()) + '.' +
        ms + ' IST'
      );
    }, 45);
    return () => clearInterval(timer);
  }, []);

  const handleSpeed = (s: number) => {
    setPlaybackSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
    toast.info(`Playback rate: ${s}x`);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSnapshot = () => {
    toast.success(`📸 Frame captured from ${selectedCam.camera_id} · Saved to Evidence Vault`);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Stream URL copied to clipboard');
  };

  const isOffline = selectedCam.status === 'offline';

  // Sample detections for this camera
  const detections = [
    { plate: 'GJ01AB1234', conf: '98.6%', speed: '58 km/h', type: 'SUV (White Scorpio)', warrant: false, time: '14:26:17' },
    { plate: 'UP32PQ6677', conf: '97.2%', speed: '64 km/h', type: 'SUV (Fortuner)', warrant: true, time: '14:24:02' },
    { plate: 'GJ05CD5678', conf: '95.8%', speed: '112 km/h', type: 'Sedan (Honda City)', warrant: false, speedAnomaly: true, time: '14:21:49' },
    { plate: 'DL10XY9090', conf: '96.4%', speed: '48 km/h', type: 'Hatchback (Swift)', warrant: false, time: '14:18:33' },
  ];

  return (
    <div className="min-h-screen bg-[#070B10] text-[#E8EDF5] flex flex-col font-sans selection:bg-[#0E7FE0] selection:text-white">
      {/* TOP COMMAND BAR */}
      <header className="h-14 px-4 sm:px-6 bg-[#0B121C] border-b border-[#1C2E42] flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/live')}
            className="px-2.5 py-1.5 rounded bg-[#131F30] hover:bg-[#1C2E42] border border-[#233B57] text-xs font-mono text-[#8FA8C0] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Live Monitor</span>
          </button>
          
          <div className="h-4 w-px bg-[#1C2E42] hidden sm:block" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AHMEDABAD SOC
            </span>
            <span className="text-[#3A4D66] font-mono hidden sm:inline">/</span>
            <h1 className="font-bold text-sm sm:text-base text-white truncate flex items-center gap-2">
              <span className="font-mono text-[#0E7FE0]">{selectedCam.camera_id}</span>
              <span className="text-[#8FA8C0] font-normal">·</span>
              <span className="truncate">{selectedCam.name}</span>
            </h1>
          </div>
        </div>

        {/* Right side stream controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 font-mono text-xs text-[#00C875] bg-[#0A1A17] border border-[#00C875]/30 px-2.5 py-1 rounded">
            <Clock size={12} />
            <span>{hudTime || 'LIVE STREAM'}</span>
          </div>

          <button
            onClick={handleShare}
            className="p-2 rounded bg-[#131F30] hover:bg-[#1C2E42] border border-[#233B57] text-[#8FA8C0] hover:text-white transition-colors cursor-pointer"
            title="Share Stream URL"
          >
            <Share2 size={14} />
          </button>
          <button
            onClick={handleSnapshot}
            className="px-3 py-1.5 rounded bg-[#0E7FE0] hover:bg-[#108BFA] text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-[#0E7FE0]/20"
          >
            <CameraIcon size={14} />
            <span className="hidden sm:inline">Capture Frame</span>
          </button>
        </div>
      </header>

      {/* 15 CAMERAS HORIZONTAL SWITCHER BAR */}
      <div className="bg-[#090E17] border-b border-[#1C2E42] px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-mono text-[#5A738E] uppercase font-bold shrink-0 pr-1">
          SURVEILLANCE GRID:
        </span>
        {CAMERAS.map((cam) => {
          const active = cam.id === selectedCam.id;
          const camOff = cam.status === 'offline';
          return (
            <button
              key={cam.id}
              onClick={() => navigate(`/camera-stream/${cam.id}`)}
              className={`px-2.5 py-1 rounded text-xs font-mono shrink-0 flex items-center gap-1.5 border transition-all cursor-pointer ${
                active
                  ? 'bg-[#0E7FE0] text-white border-[#0E7FE0] font-bold shadow-md shadow-[#0E7FE0]/30'
                  : camOff
                  ? 'bg-[#150E12] border-red-900/40 text-red-400 hover:border-red-500/50'
                  : 'bg-[#0D1522] border-[#1C2E42] text-[#8FA8C0] hover:text-white hover:border-[#324B6B]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${camOff ? 'bg-red-500' : 'bg-emerald-400 animate-pulse'}`} />
              <span>{cam.camera_id}</span>
              <span className="text-[10px] opacity-75 hidden lg:inline">{cam.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN WORKSTATION VIEWPORT */}
      <div className="flex-1 p-3 sm:p-5 grid grid-cols-1 xl:grid-cols-12 gap-4 max-w-[1920px] mx-auto w-full">
        {/* PRIMARY VIDEO STAGE (8 COLS ON XL) */}
        <div className="xl:col-span-8 flex flex-col gap-3">
          {/* VIDEO FRAME CONTAINER */}
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-[#1F334D] shadow-2xl flex items-center justify-center group">
            {isOffline ? (
              <CctvOfflinePattern
                camera={selectedCam}
                className="w-full h-full"
              />
            ) : (
              <video
                ref={videoRef}
                src={selectedCam.hls_url}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-cover transition-all duration-300"
                style={{
                  filter: nightVision ? 'invert(1) hue-rotate(90deg) contrast(1.4)' : 'none',
                  transform: `scale(${zoomLevel})`
                }}
              />
            )}

            {/* LIVE SURVEILLANCE OVERLAY HUD */}
            {!isOffline && (
              <>
                {/* TOP HUD */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs font-mono">
                  <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-white">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-bold tracking-wider text-red-400">LIVE REC</span>
                    <span className="text-white/40">|</span>
                    <span>{selectedCam.camera_id}</span>
                    <span className="text-[#8FA8C0] hidden sm:inline">{selectedCam.name}</span>
                  </div>

                  <div className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-[#00C875] font-bold tracking-wider">
                    {hudTime}
                  </div>
                </div>

                {/* SIMULATED AI ANPR TARGET BOUNDING BOX */}
                <div className="absolute top-[35%] left-[42%] pointer-events-none animate-pulse border-2 border-[#00C875] bg-[#00C875]/10 px-2 py-1 rounded shadow-[0_0_12px_#00C875]">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-white">
                    <Crosshair size={12} className="text-[#00C875]" />
                    <span>GJ01AB1234 · 98.6%</span>
                  </div>
                </div>

                {/* BOTTOM HUD */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none text-[11px] font-mono text-[#C5D5E6]">
                  <div className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 flex items-center gap-2">
                    <MapPin size={12} className="text-[#0E7FE0]" />
                    <span>{selectedCam.location_name} · {selectedCam.latitude?.toFixed(4) || '23.0225'}° N, {selectedCam.longitude?.toFixed(4) || '72.5714'}° E</span>
                  </div>

                  <div className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 text-white/90 hidden sm:block">
                    25 FPS · 4.2 Mbps · 1080P · H.264
                  </div>
                </div>
              </>
            )}
          </div>

          {/* PLAYBACK & PTZ CONTROLS BAR */}
          <div className="p-3 bg-[#0D1520] border border-[#1C2E42] rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                disabled={isOffline}
                className="p-2 rounded bg-[#131F30] hover:bg-[#1C2E42] border border-[#233B57] text-white disabled:opacity-40 transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                disabled={isOffline}
                className="p-2 rounded bg-[#131F30] hover:bg-[#1C2E42] border border-[#233B57] text-white disabled:opacity-40 transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              <button
                onClick={() => setNightVision(!nightVision)}
                disabled={isOffline}
                className={`px-2.5 py-1.5 rounded border text-xs font-bold transition-all cursor-pointer ${
                  nightVision
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(0,200,117,0.3)]'
                    : 'bg-[#131F30] border-[#233B57] text-[#8FA8C0] hover:text-white'
                }`}
                title="Toggle Tactical Night Vision"
              >
                <Eye size={13} className="inline mr-1" />
                Night Vision
              </button>
            </div>

            {/* Speed & Zoom controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-[#6F87A1] text-[11px]">SPEED:</span>
                {[0.5, 1.0, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeed(s)}
                    disabled={isOffline}
                    className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                      playbackSpeed === s
                        ? 'bg-[#0E7FE0] border-[#0E7FE0] text-white font-bold'
                        : 'bg-[#131F30] border-[#233B57] text-[#8FA8C0] hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#6F87A1] text-[11px]">ZOOM:</span>
                <button
                  onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.25))}
                  className="px-2 py-0.5 rounded bg-[#131F30] border border-[#233B57] text-white cursor-pointer"
                >
                  -
                </button>
                <span className="text-white font-bold text-[11px] w-8 text-center">{zoomLevel}x</span>
                <button
                  onClick={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.25))}
                  className="px-2 py-0.5 rounded bg-[#131F30] border border-[#233B57] text-white cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR TELEMETRY & TARGET DETECTIONS (4 COLS ON XL) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* SECTION 1: HARDWARE TELEMETRY PANEL */}
          <div className="p-4 bg-[#0D1520] border border-[#1C2E42] rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[#1C2E42] pb-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} className="text-[#0E7FE0]" />
                Hardware & Telemetry
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                isOffline ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {selectedCam.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-[#090F17] border border-[#162436]">
                <span className="text-[#6F87A1] block text-[10px]">CAMERA CODE</span>
                <strong className="text-white font-bold">{selectedCam.camera_id}</strong>
              </div>
              <div className="p-2 rounded bg-[#090F17] border border-[#162436]">
                <span className="text-[#6F87A1] block text-[10px]">RESOLUTION</span>
                <strong className="text-white font-bold">{selectedCam.resolution}</strong>
              </div>
              <div className="p-2 rounded bg-[#090F17] border border-[#162436]">
                <span className="text-[#6F87A1] block text-[10px]">FRAME RATE</span>
                <strong className="text-[#00C875] font-bold">{selectedCam.fps} FPS</strong>
              </div>
              <div className="p-2 rounded bg-[#090F17] border border-[#162436]">
                <span className="text-[#6F87A1] block text-[10px]">CONGESTION</span>
                <strong className={`font-bold ${
                  selectedCam.congestion === 'HIGH' ? 'text-red-400' : selectedCam.congestion === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {selectedCam.congestion}
                </strong>
              </div>
              <div className="p-2 rounded bg-[#090F17] border border-[#162436]">
                <span className="text-[#6F87A1] block text-[10px]">LATENCY</span>
                <strong className="text-white font-bold">38 ms</strong>
              </div>
              <div className="p-2 rounded bg-[#090F17] border border-[#162436]">
                <span className="text-[#6F87A1] block text-[10px]">PACKET LOSS</span>
                <strong className="text-white font-bold">{selectedCam.metadata?.packet_loss || '0.02%'}</strong>
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#8FA8C0] pt-1">
              <span className="text-[#5A738E]">RTSP FEED: </span>
              <code className="text-amber-300 text-[10px] break-all">{selectedCam.rtsp_url}</code>
            </div>
          </div>

          {/* SECTION 2: REAL-TIME DETECTIONS ON THIS NODE */}
          <div className="p-4 bg-[#0D1520] border border-[#1C2E42] rounded-lg flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1C2E42] pb-2 mb-3">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Radio size={14} className="text-[#00C875]" />
                Target Detections (Node Stream)
              </span>
              <span className="text-[10px] font-mono text-[#8FA8C0]">4 RECENT</span>
            </div>

            <div className="space-y-2.5 flex-1">
              {detections.map((d) => (
                <div
                  key={d.plate}
                  className="p-2.5 rounded bg-[#090F17] border border-[#162436] hover:border-[#0E7FE0] transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {/* IND Plate Badge */}
                      <span className="inline-flex items-center bg-white text-black font-mono font-extrabold text-xs px-1.5 py-0.5 rounded border border-gray-400 tracking-wider">
                        <span className="text-[8px] mr-1 text-blue-800 font-bold">IND</span>
                        {d.plate}
                      </span>
                      {d.warrant && (
                        <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-mono text-[9px] font-bold border border-red-500/40 animate-pulse">
                          WARRANT
                        </span>
                      )}
                      {d.speedAnomaly && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono text-[9px] font-bold border border-amber-500/40">
                          {d.speed}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#8FA8C0] mt-1 font-mono">
                      {d.type} · Conf: <span className="text-[#00C875] font-bold">{d.conf}</span>
                    </div>
                  </div>

                  <Link
                    to={`/vehicles/details/${d.plate}`}
                    className="px-2 py-1 rounded bg-[#131F30] hover:bg-[#0E7FE0] text-[#8FA8C0] hover:text-white font-mono text-[10px] font-bold transition-colors flex items-center gap-1 shrink-0"
                    title="Open Full Vehicle & Owner Dossier"
                  >
                    <span>Dossier</span>
                    <ChevronRight size={12} />
                  </Link>
                </div>
              ))}
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-3 border-t border-[#1C2E42] mt-3 flex items-center gap-2">
              <Link
                to={`/investigation?plate=GJ01AB1234`}
                className="flex-1 text-center py-2 rounded bg-[#131F30] hover:bg-[#1C2E42] border border-[#233B57] text-white font-mono text-xs font-bold transition-colors"
              >
                Cross-Camera Search
              </Link>
              <Link
                to={`/journey?plate=GJ01AB1234`}
                className="flex-1 text-center py-2 rounded bg-[#0E7FE0] hover:bg-[#108BFA] text-white font-mono text-xs font-bold transition-colors"
              >
                Trace Journey
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CameraStreamPage;
