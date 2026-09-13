import React, { useState, useEffect } from 'react';
import { Camera } from '../../types';
import { CameraFeed } from './CameraFeed';
import { TrackedVehicle } from '../../utils/cameraTracks';
import {
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  ShieldAlert,
  Camera as CameraIcon,
  Play,
  Pause,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Radio,
  FileCheck,
  Crosshair,
  Download,
  AlertTriangle,
  AlertCircle,
  Wrench,
  RefreshCw,
  WifiOff,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { VehicleDossierModal } from '../vehicles/VehicleDossierModal';

interface CameraDetailModalProps {
  camera: Camera | null;
  allCameras: Camera[];
  isOpen: boolean;
  onClose: () => void;
  onSelectCamera: (camera: Camera) => void;
  latestSighting?: any;
}

export const CameraDetailModal: React.FC<CameraDetailModalProps> = ({
  camera,
  allCameras,
  isOpen,
  onClose,
  onSelectCamera,
  latestSighting,
}) => {
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedVehicle, setSelectedVehicle] = useState<TrackedVehicle | null>(null);
  const [activeVehicles, setActiveVehicles] = useState<TrackedVehicle[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<{
    dataUrl: string;
    hash: string;
    timestamp: string;
    cameraName: string;
    vehicles: TrackedVehicle[];
  } | null>(null);
  const [dossierPlate, setDossierPlate] = useState<string | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Close on Escape key
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

  if (!isOpen || !camera) return null;

  const currentIndex = allCameras.findIndex((c) => c.id === camera.id);

  const handlePrevCamera = () => {
    if (allCameras.length === 0) return;
    const prevIndex = (currentIndex - 1 + allCameras.length) % allCameras.length;
    onSelectCamera(allCameras[prevIndex]);
    setSelectedVehicle(null);
    setZoomLevel(1);
  };

  const handleNextCamera = () => {
    if (allCameras.length === 0) return;
    const nextIndex = (currentIndex + 1) % allCameras.length;
    onSelectCamera(allCameras[nextIndex]);
    setSelectedVehicle(null);
    setZoomLevel(1);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSnapshotCaptured = (
    dataUrl: string,
    frameData: { cameraName: string; timestamp: string; trackedVehicles: TrackedVehicle[] }
  ) => {
    // Generate synthetic SHA-256 hash
    const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setCapturedSnapshot({
      dataUrl,
      hash: fakeHash,
      timestamp: frameData.timestamp,
      cameraName: frameData.cameraName,
      vehicles: frameData.trackedVehicles,
    });
    toast.success('Section 65B Forensic Frame Preserved!');
  };

  const downloadSnapshot = () => {
    if (!capturedSnapshot) return;
    const a = document.createElement('a');
    a.href = capturedSnapshot.dataUrl;
    a.download = `SENTRAX_EVIDENCE_${camera.camera_id}_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Evidence frame downloaded');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        {/* Modal Window Container */}
      <div className="relative w-full max-w-7xl max-h-[96vh] flex flex-col bg-[#0A1017] border border-[#1C2E42] rounded-[8px] shadow-[0_10px_40px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Top Cockpit Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0D1520] border-b border-[#1C2E42] shrink-0">
          <div className="flex items-center gap-3">
            {/* Camera Switcher Buttons */}
            <div className="flex items-center bg-[#070B10] border border-[#1C2E42] rounded-[4px] p-0.5">
              <button
                onClick={handlePrevCamera}
                title="Previous Camera (Left Arrow)"
                className="p-1 text-[#8FA8C0] hover:text-white hover:bg-[#1C2E42] rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono font-bold text-[#0E7FE0]">
                {currentIndex + 1} / {allCameras.length}
              </span>
              <button
                onClick={handleNextCamera}
                title="Next Camera (Right Arrow)"
                className="p-1 text-[#8FA8C0] hover:text-white hover:bg-[#1C2E42] rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Camera Details */}
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#0E7FE0] text-white text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-[2px]">
                  {camera.camera_id}
                </span>
                <h2 className="text-sm font-semibold text-white truncate max-w-[280px] sm:max-w-md">
                  {camera.name}
                </h2>
                <div className="flex items-center gap-1.5 bg-[#080C12] border border-[#233A52] px-2 py-0.5 rounded-full">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      camera.status === 'online'
                        ? 'bg-[#00C875] shadow-[0_0_6px_#00C875]'
                        : camera.status === 'warning'
                        ? 'bg-[#FF8C00] shadow-[0_0_6px_#FF8C00]'
                        : 'bg-[#FF3B3B] shadow-[0_0_6px_#FF3B3B]'
                    }`}
                  />
                  <span className="text-[10px] font-mono font-bold text-[#8FA8C0] uppercase">
                    {camera.status}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#8FA8C0] font-mono mt-0.5">
                {camera.location_name || 'Corridor Junction Node'} · {camera.protocol.toUpperCase()} · 1080p @ 30.0 FPS
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Camera Switcher Pills (visible on medium+ screens) */}
            <div className="hidden lg:flex items-center gap-1 max-w-[340px] overflow-x-auto py-1">
              {allCameras.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCamera(c);
                    setSelectedVehicle(null);
                    setZoomLevel(1);
                  }}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                    c.id === camera.id
                      ? 'bg-[#0E7FE0] text-white font-bold'
                      : 'bg-[#0D1520] text-[#8FA8C0] hover:text-white border border-[#1C2E42]'
                  }`}
                >
                  {c.camera_id}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-[4px] bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body: Large Video Canvas + Inspection Panel */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Main Video Viewport (8 Columns on desktop) */}
          <div className="lg:col-span-8 p-3 sm:p-4 flex flex-col bg-[#05080E] border-r border-[#1C2E42] overflow-y-auto">
            {/* The Large Video Player Feed */}
            <div className="relative rounded-[6px] overflow-hidden border border-[#1C2E42] shadow-2xl bg-black">
              <CameraFeed
                key={camera.camera_id}
                hlsUrl={camera.hls_url}
                rtspUrl={camera.rtsp_url}
                status={camera.status}
                cameraName={`${camera.camera_id} — ${camera.name}`}
                latestSighting={latestSighting}
                zoomLevel={zoomLevel}
                onSelectVehicle={(veh) => setSelectedVehicle(veh)}
                selectedVehicleId={selectedVehicle?.id}
                onSnapshot={handleSnapshotCaptured}
                enableControls={true}
              />
            </div>

            {/* Video Control Bar & Digital PTZ HUD */}
            <div className="mt-3 p-2.5 bg-[#0D1520] border border-[#1C2E42] rounded-[6px] flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Digital Zoom Controls */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase text-[#8FA8C0] mr-1 flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5 text-[#0E7FE0]" />
                  PTZ ZOOM:
                </span>
                {[1, 1.5, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => setZoomLevel(level)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      zoomLevel === level
                        ? 'bg-[#0E7FE0] text-white font-bold shadow'
                        : 'bg-[#070B10] text-[#8FA8C0] hover:text-white border border-[#1C2E42]'
                    }`}
                  >
                    {level}x
                  </button>
                ))}
              </div>

              {/* Forensic Evidence Quick Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Trigger snapshot on the active camera feed
                    const btn = document.querySelector('button[title="Forensic Frame Snapshot"]') as HTMLButtonElement;
                    if (btn) btn.click();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#00C875]/15 hover:bg-[#00C875]/25 border border-[#00C875] text-[#00C875] rounded-[4px] text-[11px] font-mono font-bold transition-colors"
                >
                  <CameraIcon className="w-3.5 h-3.5" />
                  PRESERVE 65B EVIDENCE
                </button>

                <button
                  onClick={() => {
                    const target = selectedVehicle?.plate || (camera.camera_id === 'CAM02' ? 'GJ01AB1234' : camera.camera_id === 'CAM03' ? 'UP32PQ6677' : 'RJ14GH3456');
                    setDossierPlate(target);
                    setIsDossierOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#0E7FE0] hover:bg-[#0c6ec2] text-white rounded-[4px] text-[11px] font-mono font-bold transition-colors shadow cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  INSPECT OWNER DOSSIER
                </button>

                <button
                  onClick={() => {
                    if (camera.recent_sightings_count && camera.recent_sightings_count > 0) {
                      navigate(`/vehicles/journey/${camera.camera_id === 'CAM02' ? 'GJ01AB1234' : 'UP32PQ6677'}`);
                    } else {
                      navigate(`/vehicles/journey/GJ01AB1234`);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#0E7FE0]/15 hover:bg-[#0E7FE0]/25 border border-[#0E7FE0] text-[#0E7FE0] rounded-[4px] text-[11px] font-mono font-bold transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  RECONSTRUCT JOURNEY
                </button>
              </div>
            </div>

            {/* Preserved Evidence Card (appears when user takes snapshot) */}
            {capturedSnapshot && (
              <div className="mt-3 p-3 bg-[#0D1824] border border-[#00C875]/60 rounded-[6px] flex items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <img
                    src={capturedSnapshot.dataUrl}
                    alt="Captured Evidence"
                    className="w-20 h-12 object-cover rounded border border-[#1C2E42]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#00C875]">
                      <FileCheck className="w-3.5 h-3.5" />
                      SECTION 65B FORENSIC ATTESTATION RECORD
                    </div>
                    <div className="text-[10px] font-mono text-[#8FA8C0] mt-0.5">
                      SHA-256: <span className="text-white font-bold">{capturedSnapshot.hash.slice(0, 24)}...</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#4D6B85]">
                      TIMESTAMP: {new Date(capturedSnapshot.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadSnapshot}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#00C875] hover:bg-[#00b067] text-[#080C12] font-bold rounded text-[11px] font-mono shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    DOWNLOAD JPEG
                  </button>
                  <button
                    onClick={() => navigate('/evidence')}
                    className="px-2.5 py-1 bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] rounded text-[11px] font-mono"
                  >
                    VIEW IN VAULT
                  </button>
                  <button
                    onClick={() => setCapturedSnapshot(null)}
                    className="p-1 text-[#4D6B85] hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Inspection & Telemetry Column (4 Columns on desktop) */}
          <div className="lg:col-span-4 p-4 bg-[#0A1017] flex flex-col gap-4 overflow-y-auto max-h-[calc(96vh-65px)]">
            {/* 1. Tracked Vehicles in Current Field of View OR Outage Diagnostics */}
            {camera.status === 'offline' ? (
              <div className="bg-[#190808] border border-[#FF3B3B]/60 rounded-[6px] p-3.5 animate-fade-in shadow-[0_0_15px_rgba(255,59,59,0.15)]">
                <div className="flex items-center gap-2 pb-2 border-b border-[#FF3B3B]/30 mb-3">
                  <div className="p-1.5 rounded bg-[#FF3B3B]/20 text-[#FF3B3B]">
                    <WifiOff className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                      Critical Outage Diagnostics
                    </h3>
                    <p className="text-[10px] font-mono text-[#FF3B3B] font-bold">
                      OPTICAL FIBER LINK DISCONNECTED
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] font-mono mb-4">
                  <div className="flex justify-between py-1 border-b border-[#1C2E42]/60">
                    <span className="text-[#8FA8C0]">FAULT STATUS:</span>
                    <span className="text-[#FF3B3B] font-bold">ERR_RTSP_CARRIER_DROP (0x54)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1C2E42]/60">
                    <span className="text-[#8FA8C0]">PHYSICAL HOP:</span>
                    <span className="text-white">Chiloda Ring Junction Hub #4</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1C2E42]/60">
                    <span className="text-[#8FA8C0]">PACKET LOSS:</span>
                    <span className="text-[#FF3B3B] font-bold">100.0% (UNREACHABLE)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1C2E42]/60">
                    <span className="text-[#8FA8C0]">OUTAGE DURATION:</span>
                    <span className="text-[#FF8C00]">18m 42s</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toast.success(`Dispatched Field Unit #7 with optical splicer to ${camera.name}!`)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#FF3B3B] hover:bg-[#E02E2E] text-white rounded text-xs font-mono font-bold transition-colors shadow-[0_0_12px_rgba(255,59,59,0.4)]"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    DISPATCH FIELD TECHNICIAN
                  </button>

                  <button
                    onClick={() => toast.error('ICMP Echo Request timed out (0/4 packets received, 100% loss)')}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] rounded text-xs font-mono transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    RETRY HARDWARE PING
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#0D1520] border border-[#1C2E42] rounded-[6px] p-3.5">
                {camera.status === 'warning' && (
                  <div className="bg-[#1C1305] border border-[#FF8C00]/60 rounded-[4px] p-2.5 mb-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#FF8C00] shrink-0 mt-0.5 animate-pulse" />
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-[#FF8C00] font-mono">
                        SIGNAL DEGRADED (48% PACKET LOSS)
                      </div>
                      <div className="text-[10px] text-[#8FA8C0] font-mono mt-0.5">
                        High buffer jitter detected. Frame drops may impact OCR confidence.
                      </div>
                      <button
                        onClick={() => toast.success('RTSP stream buffer flushed and re-negotiated!')}
                        className="mt-1.5 px-2 py-0.5 bg-[#FF8C00]/20 hover:bg-[#FF8C00]/30 border border-[#FF8C00] text-[#FF8C00] rounded text-[10px] font-mono font-bold flex items-center gap-1"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        FLUSH RTSP BUFFER
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pb-2 border-b border-[#1C2E42] mb-3">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-[#00C875]" />
                    Active Field Detections
                  </h3>
                  <span className="text-[10px] font-mono text-[#00C875] bg-[#00C875]/10 px-1.5 py-0.5 rounded border border-[#00C875]/30">
                    REAL-TIME YOLOv8
                  </span>
                </div>

                {/* List of Vehicles on screen */}
                <div className="space-y-2">
                  {[
                    {
                      plate: camera.camera_id === 'CAM02' ? 'GJ01AB1234' : camera.camera_id === 'CAM03' ? 'UP32PQ6677' : 'MH12EF9012',
                      vclass: camera.camera_id === 'CAM03' ? 'CAR' : 'SUV',
                      speed: 68,
                      conf: 0.98,
                      isWatchlist: camera.camera_id === 'CAM02' || camera.camera_id === 'CAM03',
                      reason: camera.camera_id === 'CAM02' ? 'Kidnapping & Extortion Syndicate Lead' : 'Interstate Narcotics Conduit',
                    },
                    {
                      plate: 'GJ18IJ7890',
                      vclass: 'CAR',
                      speed: 54,
                      conf: 0.96,
                      isWatchlist: false,
                      reason: '',
                    },
                    {
                      plate: 'RJ14GH3456',
                      vclass: 'CAR',
                      speed: 72,
                      conf: 0.95,
                      isWatchlist: true,
                      reason: 'Reported Stolen Luxury Fortuner',
                    },
                  ].map((v, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-[4px] border transition-all cursor-pointer ${
                        v.isWatchlist
                          ? 'bg-[#1C0505]/70 border-[#FF3B3B]/80 hover:border-[#FF3B3B]'
                          : 'bg-[#070B10] border-[#1C2E42] hover:border-[#0E7FE0]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] bg-[#0E7FE0] text-white px-1 py-0.2 rounded font-mono font-bold">
                            IND
                          </span>
                          <span className="font-mono text-xs font-bold text-white tracking-wider">
                            {v.plate}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            v.isWatchlist
                              ? 'bg-[#FF3B3B] text-white animate-pulse'
                              : 'bg-[#1C2E42] text-[#8FA8C0]'
                          }`}
                        >
                          {v.isWatchlist ? 'WATCHLIST HIT' : `${v.vclass} ${Math.round(v.conf * 100)}%`}
                        </span>
                      </div>

                      {v.isWatchlist && (
                        <p className="text-[10px] text-[#FF8C00] font-mono mt-1 font-medium leading-tight">
                          ⚠ {v.reason}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#8FA8C0] pt-1.5 border-t border-[#1C2E42]/60">
                        <span>SPEED: <strong className="text-white">{v.speed} km/h</strong></span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDossierPlate(v.plate);
                              setIsDossierOpen(true);
                            }}
                            className="text-[#00C875] hover:text-white flex items-center gap-0.5 hover:underline font-bold"
                          >
                            <User className="w-2.5 h-2.5" />
                            OWNER RC
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/vehicles/journey/${v.plate}`);
                            }}
                            className="text-[#0E7FE0] hover:text-white flex items-center gap-0.5 hover:underline"
                          >
                            JOURNEY <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Stream & Hardware Telemetry */}
            <div className="bg-[#0D1520] border border-[#1C2E42] rounded-[6px] p-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#1C2E42] mb-3">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#0E7FE0]" />
                  Camera Optical Ingestion
                </h3>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    camera.status === 'online'
                      ? 'bg-[#00C875]/15 text-[#00C875] border border-[#00C875]/40'
                      : camera.status === 'warning'
                      ? 'bg-[#FF8C00]/15 text-[#FF8C00] border border-[#FF8C00]/40'
                      : 'bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/40'
                  }`}
                >
                  {camera.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-[11px] font-mono">
                <div className="flex justify-between py-1 border-b border-[#1C2E42]/60">
                  <span className="text-[#8FA8C0]">NODE IDENTIFIER</span>
                  <span className="text-white font-bold">{camera.camera_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1C2E42]/60">
                  <span className="text-[#8FA8C0]">INGEST PROTOCOL</span>
                  <span className={`font-bold ${camera.status === 'offline' ? 'text-[#FF3B3B]' : 'text-[#00C875]'}`}>
                    {camera.protocol.toUpperCase()} / TCP
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1C2E42]/60">
                  <span className="text-[#8FA8C0]">STREAM LATENCY</span>
                  <span className={`font-bold ${
                    camera.status === 'offline'
                      ? 'text-[#FF3B3B]'
                      : camera.status === 'warning'
                      ? 'text-[#FF8C00]'
                      : 'text-white'
                  }`}>
                    {camera.status === 'offline'
                      ? 'TIMEOUT (100% LOSS)'
                      : camera.status === 'warning'
                      ? '348.4 ms (HIGH JITTER)'
                      : '14.2 ms'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1C2E42]/60">
                  <span className="text-[#8FA8C0]">EDGE AI MODEL</span>
                  <span className={`font-bold ${camera.status === 'offline' ? 'text-[#4D6B85]' : 'text-[#0E7FE0]'}`}>
                    {camera.status === 'offline' ? 'SUSPENDED (NO CARRIER)' : 'YOLOv8n + PaddleOCR'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1C2E42]/60">
                  <span className="text-[#8FA8C0]">GEO-COORDINATES</span>
                  <span className="text-white">
                    {camera.latitude?.toFixed(4)}, {camera.longitude?.toFixed(4)}
                  </span>
                </div>

                {/* Stream RTSP URL copy */}
                <div className="pt-2">
                  <div className="text-[10px] text-[#8FA8C0] mb-1">RTSP INGESTION ENDPOINT:</div>
                  <div className="flex items-center gap-1 bg-[#070B10] p-1.5 rounded border border-[#1C2E42]">
                    <code className="text-[9px] text-[#8FA8C0] truncate flex-1">
                      {camera.rtsp_url || 'rtsp://node.cctv.sentinel.internal:554/live'}
                    </code>
                    <button
                      onClick={() => handleCopy(camera.rtsp_url || '', 'RTSP URL')}
                      className="p-1 text-[#8FA8C0] hover:text-white"
                    >
                      {copiedField === 'RTSP URL' ? (
                        <Check className="w-3 h-3 text-[#00C875]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Node Statistics */}
            <div className="bg-[#0D1520] border border-[#1C2E42] rounded-[6px] p-3.5">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                24-Hour Scan Performance
              </h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-[#070B10] rounded border border-[#1C2E42]">
                  <div className="text-sm font-mono font-bold text-[#0E7FE0]">
                    {camera.recent_sightings_count || 187}
                  </div>
                  <div className="text-[9px] font-mono text-[#8FA8C0]">ANPR SCANS</div>
                </div>
                <div className="p-2 bg-[#070B10] rounded border border-[#1C2E42]">
                  <div className="text-sm font-mono font-bold text-[#00C875]">98.4%</div>
                  <div className="text-[9px] font-mono text-[#8FA8C0]">AVG OCR CONF</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* VAHAN & CCTNS VEHICLE OWNER DOSSIER MODAL */}
    <VehicleDossierModal
      plate={dossierPlate}
      isOpen={isDossierOpen}
      onClose={() => setIsDossierOpen(false)}
    />
  </>
);
};
