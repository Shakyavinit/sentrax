import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraCard } from '../components/cameras/CameraCard';
import { CameraDetailModal } from '../components/cameras/CameraDetailModal';
import { AlertCard } from '../components/alerts/AlertCard';
import { AlertDrawer } from '../components/alerts/AlertDrawer';
import { useCameras } from '../hooks/useCameras';
import { useAlerts } from '../hooks/useAlerts';
import { useWebSocket } from '../hooks/useWebSocket';
import { useUiStore } from '../store/uiStore';
import { Alert, Camera } from '../types';
import {
  LayoutGrid,
  Grid3X3,
  Grid2X2,
  ShieldAlert,
  Radio,
  Square,
  Maximize2,
  Video,
  Car,
  Eye,
  Activity,
  Cpu,
  RefreshCw,
  Download,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Sparkles,
  Siren,
  Route
} from 'lucide-react';
import { toast } from 'sonner';

type CameraCategory = 'all' | 'highway' | 'city' | 'entry_exit' | 'sensitive';

export const LiveMonitor: React.FC = () => {
  const navigate = useNavigate();
  const { gridColumns, setGridColumns } = useUiStore();
  const { data: cameras = [], isLoading: camerasLoading, refetch: refetchCameras } = useCameras();
  const { data: alerts = [], refetch: refetchAlerts } = useAlerts('active');

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedCameraForModal, setSelectedCameraForModal] = useState<Camera | null>(null);
  const [liveEvents, setLiveEvents] = useState<Alert[]>([]);
  const [latestSightingsByCamera, setLatestSightingsByCamera] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState<CameraCategory>('all');
  const [rightPanelTab, setRightPanelTab] = useState<'matches' | 'detections'>('matches');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const { connected, on } = useWebSocket();

  const lastToastRef = React.useRef<{ [plate: string]: number }>({});

  useEffect(() => {
    // 1. Listen for live Watchlist Alerts
    on('alert', (payload: any) => {
      const now = Date.now();
      const last = lastToastRef.current[payload.plate_text] || 0;
      if (now - last > 30000) {
        lastToastRef.current[payload.plate_text] = now;
        toast.error(`TARGET MATCH: ${payload.plate_text} detected at ${payload.camera_name || 'Corridor Node'}`, {
          id: `alert-${payload.plate_text}`,
          duration: 5000,
        });
      }
      setLiveEvents((prev) => [payload, ...prev.filter((p) => p.id !== payload.id)].slice(0, 50));
    });

    // 2. Listen for live ANPR Sightings
    on('sighting', (payload: any) => {
      if (payload && (payload.camera_identifier || payload.camera_id)) {
        const key = payload.camera_identifier || payload.camera_id;
        setLatestSightingsByCamera((prev) => ({
          ...prev,
          [key]: payload,
        }));
      }
    });
  }, [on]);

  // Curated demo watchlist target hits matching Ahmedabad tactical scenario
  const mockWatchlistMatches = [
    {
      id: 'match-1',
      plate: 'GJ01AB1234',
      vehicle: 'Mahindra Scorpio-N (White)',
      reason: 'Kidnapping Case FIR #0418 • High Court NBW',
      camera: 'GNLU Main Gate (CAM08)',
      time: '14:45 IST (3m ago)',
      threat: 'CRITICAL',
      thumb: '/images/vehicle_scorpio_crop.jpg',
      speed: '42 km/h',
    },
    {
      id: 'match-2',
      plate: 'UP32PQ6677',
      vehicle: 'Toyota Fortuner (Black)',
      reason: 'Active Interpol Red Corner Notice / Inter-State Transit',
      camera: 'GIFT City Road (CAM06)',
      time: '14:15 IST (33m ago)',
      threat: 'HIGH',
      thumb: '/images/cam_gift_city_thumb.jpg',
      speed: '64 km/h',
    },
    {
      id: 'match-3',
      plate: 'DL10XY9090',
      vehicle: 'Maruti Suzuki Swift (Silver)',
      reason: 'Stolen Vehicle FIR / Toll Evasion',
      camera: 'SG Highway Toll (CAM04)',
      time: '13:50 IST (58m ago)',
      threat: 'MEDIUM',
      thumb: '/images/cam_sg_highway_thumb.jpg',
      speed: '58 km/h',
    },
  ];

  // Recent detections live stream
  const mockRecentDetections = [
    { plate: 'GJ01AB1234', cam: 'GNLU Main Gate', speed: '42 km/h', conf: '98.6%', time: '14:45:12' },
    { plate: 'GJ27AC9901', cam: 'Sabarmati Riverfront', speed: '51 km/h', conf: '97.4%', time: '14:44:50' },
    { plate: 'GJ05CD5678', cam: 'Kudasan Junction', speed: '38 km/h', conf: '99.0%', time: '14:43:22' },
    { plate: 'DL10XY9090', cam: 'SG Highway Toll', speed: '58 km/h', conf: '96.2%', time: '14:42:01' },
    { plate: 'MH02EK4412', cam: 'GIFT City Road', speed: '62 km/h', conf: '98.1%', time: '14:40:15' },
    { plate: 'RJ14GH3456', cam: 'Sector 15 Gandhinagar', speed: '34 km/h', conf: '95.8%', time: '14:38:40' },
  ];

  // Categorize cameras
  const categorizeCamera = (cam: Camera): CameraCategory => {
    const text = `${cam.name} ${cam.location_name || ''} ${cam.camera_id}`.toLowerCase();
    if (text.includes('highway') || text.includes('toll') || text.includes('express') || cam.camera_id === 'CAM04' || cam.camera_id === 'CAM01') {
      return 'highway';
    }
    if (text.includes('circle') || text.includes('junction') || text.includes('road') || text.includes('riverfront') || text.includes('vastrapur')) {
      return 'city';
    }
    if (text.includes('gate') || text.includes('entry') || text.includes('exit') || text.includes('chiloda') || cam.camera_id === 'CAM08') {
      return 'entry_exit';
    }
    if (text.includes('gift') || text.includes('secretariat') || text.includes('high court') || text.includes('sector15')) {
      return 'sensitive';
    }
    return 'city';
  };

  const categoryCounts = useMemo(() => {
    const counts = { all: cameras.length, highway: 0, city: 0, entry_exit: 0, sensitive: 0 };
    cameras.forEach((cam) => {
      const cat = categorizeCamera(cam);
      if (cat in counts) counts[cat]++;
    });
    // Fallback counts for preview
    if (counts.highway === 0) counts.highway = 4;
    if (counts.city === 0) counts.city = 3;
    if (counts.entry_exit === 0) counts.entry_exit = 3;
    if (counts.sensitive === 0) counts.sensitive = 2;
    return counts;
  }, [cameras]);

  const filteredCameras = useMemo(() => {
    if (activeCategory === 'all') return cameras;
    return cameras.filter((cam) => categorizeCamera(cam) === activeCategory);
  }, [cameras, activeCategory]);

  const getGridClass = () => {
    switch (gridColumns) {
      case 1:
        return 'grid-cols-1 max-w-4xl mx-auto';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    const matchedCam = cameras.find(
      (c) => c.id === alert.camera_id || c.camera_id === (alert as any).camera_identifier
    );
    if (matchedCam) {
      setSelectedCameraForModal(matchedCam);
      toast.info(`Focused on ${matchedCam.camera_id} (${matchedCam.name})`);
    }
  };

  const handleRefresh = () => {
    refetchCameras();
    refetchAlerts();
    toast.success('Camera matrix and detection feeds refreshed.');
  };

  const handleExportLog = () => {
    toast.success('Exporting today\'s 156 ANPR detections to CSV / JSON bundle.');
  };

  return (
    <div className="space-y-4 pb-14 text-white">
      {/* ─── 1. TOP STAT STRIP (5 CARDS) ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Cameras */}
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8C0] block">
              Total Cameras
            </span>
            <span className="text-2xl font-mono font-bold text-white tracking-tight">
              {cameras.length || 12}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0E7FE0]/15 text-[#0E7FE0] border border-[#0E7FE0]/30">
            <Video className="w-5 h-5" />
          </div>
        </div>

        {/* Active Cameras */}
        <div className="bg-[#0D1520] border border-[#1C2E42] hover:border-[#00C875]/40 rounded-lg p-3.5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8C0] block">
              Active Feeds
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono font-bold text-[#00C875] tracking-tight">
                8 Active
              </span>
              <span className="w-2 h-2 rounded-full bg-[#00C875] shadow-[0_0_8px_#00C875] animate-pulse" />
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#00C875]/15 text-[#00C875] border border-[#00C875]/30">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Vehicles Today */}
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8C0] block">
              Vehicles Today
            </span>
            <span className="text-2xl font-mono font-bold text-white tracking-tight">
              156
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0E7FE0]/15 text-[#0E7FE0] border border-[#0E7FE0]/30">
            <Car className="w-5 h-5" />
          </div>
        </div>

        {/* Plates Recognized */}
        <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8C0] block">
              Plates Decoded
            </span>
            <span className="text-2xl font-mono font-bold text-[#C5D5E6] tracking-tight">
              142 (91%)
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#8FA8C0]/15 text-[#8FA8C0] border border-[#8FA8C0]/30">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        {/* Watchlist Hits */}
        <div className="col-span-2 sm:col-span-1 bg-[#0D1520] border border-[#FF3B3B]/40 rounded-lg p-3.5 flex items-center justify-between shadow-[0_2px_15px_rgba(255,59,59,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF3B3B]" />
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF3B3B] font-bold block">
              Watchlist Hits
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono font-bold text-[#FF3B3B] tracking-tight">
                3 Targets
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FF3B3B]/20 text-[#FF3B3B] border border-[#FF3B3B]/40 animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── 2. FILTER & CONTROLS BAR ─── */}
      <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-2.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
        {/* Category Pills */}
        <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: `All Cameras (${categoryCounts.all || 12})` },
            { id: 'highway', label: `Highway (${categoryCounts.highway || 4})` },
            { id: 'city', label: `City (${categoryCounts.city || 3})` },
            { id: 'entry_exit', label: `Entry/Exit (${categoryCounts.entry_exit || 3})` },
            { id: 'sensitive', label: `Sensitive (${categoryCounts.sensitive || 2})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as CameraCategory)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-[#0E7FE0] text-white border-[#0E7FE0] shadow-[0_0_10px_rgba(14,127,224,0.4)]'
                  : 'bg-[#121E2E] text-[#8FA8C0] border-[#233A52] hover:text-white hover:bg-[#1C2E42]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right Controls: AI Engine, Socket, Grid Columns */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* AI Mode Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#070B10] border border-[#1F334D] text-[11px] font-mono text-[#00C875]">
            <Cpu className="w-3.5 h-3.5 text-[#0E7FE0]" />
            <span className="hidden sm:inline text-[#8FA8C0]">AI Engine:</span>
            <span className="font-bold">YOLOv8 + LPR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C875] animate-pulse" />
          </div>

          {/* Socket Live Status */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded bg-[#070B10] border border-[#1F334D]">
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-[#00C875] shadow-[0_0_6px_#00C875]' : 'bg-[#FF8C00] animate-pulse'
              }`}
            />
            <span className="text-[#8FA8C0]">
              {connected ? 'SOCKET LIVE' : 'SYNCING'}
            </span>
          </div>

          {/* Grid Layout Toggles */}
          <div className="flex items-center bg-[#070B10] border border-[#1F334D] rounded p-0.5">
            <button
              onClick={() => setGridColumns(1)}
              className={`p-1.5 rounded text-xs font-mono transition-colors ${
                gridColumns === 1 ? 'bg-[#0E7FE0] text-white' : 'text-[#8FA8C0] hover:text-white'
              }`}
              title="1x1 Spotlight View"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setGridColumns(2)}
              className={`p-1.5 rounded text-xs font-mono transition-colors ${
                gridColumns === 2 ? 'bg-[#0E7FE0] text-white' : 'text-[#8FA8C0] hover:text-white'
              }`}
              title="2x2 Grid View"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setGridColumns(3)}
              className={`p-1.5 rounded text-xs font-mono transition-colors ${
                gridColumns === 3 ? 'bg-[#0E7FE0] text-white' : 'text-[#8FA8C0] hover:text-white'
              }`}
              title="3x3 Tactical Matrix"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setGridColumns(4)}
              className={`p-1.5 rounded text-xs font-mono transition-colors ${
                gridColumns === 4 ? 'bg-[#0E7FE0] text-white' : 'text-[#8FA8C0] hover:text-white'
              }`}
              title="4x4 Multi-Cam Matrix"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3. MAIN WORKSPACE: CAMERA MATRIX (LEFT) + RIGHT INTELLIGENCE PANEL ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Camera Matrix */}
        <div className="xl:col-span-9 space-y-3">
          {camerasLoading ? (
            <div className="text-center py-24 text-xs font-mono text-[#8FA8C0] bg-[#0D1520] border border-[#1C2E42] rounded-lg">
              Connecting to Sentinel video multiplexer streams...
            </div>
          ) : filteredCameras.length === 0 ? (
            <div className="p-16 text-center border border-[#1C2E42] rounded-lg bg-[#0D1520]">
              <Radio className="w-10 h-10 mx-auto text-[#4D6B85] mb-2" />
              <h3 className="text-sm font-semibold text-white">No cameras in this category</h3>
              <p className="text-xs text-[#8FA8C0] mt-1">
                Select 'All Cameras' or configure cameras in Camera Registry.
              </p>
            </div>
          ) : (
            <div className={`grid gap-3.5 ${getGridClass()}`}>
              {filteredCameras.map((camera) => (
                <CameraCard
                  key={camera.id}
                  camera={camera}
                  onSelect={(cam) => setSelectedCameraForModal(cam)}
                  latestSighting={latestSightingsByCamera[camera.camera_id]}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Tactical Intelligence Panel */}
        <div className="xl:col-span-3">
          <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 flex flex-col h-[calc(100vh-140px)] min-h-[580px] sticky top-16 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            {/* Header Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1C2E42] mb-3">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setRightPanelTab('matches')}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                    rightPanelTab === 'matches'
                      ? 'bg-[#FF3B3B]/20 text-[#FF3B3B] border border-[#FF3B3B]/40'
                      : 'text-[#8FA8C0] hover:text-white'
                  }`}
                >
                  Watchlist Hits (3)
                </button>
                <button
                  onClick={() => setRightPanelTab('detections')}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                    rightPanelTab === 'detections'
                      ? 'bg-[#0E7FE0]/20 text-[#0E7FE0] border border-[#0E7FE0]/40'
                      : 'text-[#8FA8C0] hover:text-white'
                  }`}
                >
                  Live Feed
                </button>
              </div>

              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className="p-1.5 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] transition-colors"
                title={isAudioMuted ? 'Unmute Alarms' : 'Mute Alarms'}
              >
                {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {rightPanelTab === 'matches' ? (
                /* Watchlist Matches Cards */
                mockWatchlistMatches.map((m) => (
                  <div
                    key={m.id}
                    className="bg-[#080D14] border border-[#FF3B3B]/30 hover:border-[#FF3B3B] rounded-lg p-3 transition-colors shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#FF3B3B]" />

                    <div className="flex items-start gap-2.5">
                      {/* Vehicle Thumbnail */}
                      <div className="w-14 h-11 rounded overflow-hidden bg-black border border-[#233A52] shrink-0">
                        <img src={m.thumb} alt={m.vehicle} className="w-full h-full object-cover" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white tracking-wider">{m.plate}</span>
                          <span className="text-[10px] text-[#FF3B3B] font-bold px-1.5 py-0.2 rounded bg-[#FF3B3B]/15 border border-[#FF3B3B]/30">
                            {m.threat}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#C5D5E6] font-medium truncate mt-0.5">
                          {m.vehicle}
                        </div>
                        <div className="text-[10px] text-[#FF8C00] truncate mt-0.5">
                          {m.reason}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#1C2E42] flex items-center justify-between text-[10px] font-mono text-[#8FA8C0]">
                      <span className="truncate">{m.camera}</span>
                      <span className="text-[#00C875] font-semibold shrink-0">{m.time}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate(`/vehicles/details/${m.plate}`)}
                        className="py-1 rounded bg-[#0E7FE0]/15 hover:bg-[#0E7FE0]/25 text-[#0E7FE0] border border-[#0E7FE0]/30 text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Dossier</span>
                      </button>

                      <button
                        onClick={() => {
                          toast.success(`🚨 Intercept dispatched for ${m.plate} at ${m.camera}`);
                        }}
                        className="py-1 rounded bg-[#FF3B3B]/15 hover:bg-[#FF3B3B]/25 text-[#FF3B3B] border border-[#FF3B3B]/30 text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Siren className="w-3 h-3" />
                        <span>Dispatch</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                /* Live ANPR Feed */
                <div className="space-y-2">
                  {mockRecentDetections.map((d, idx) => (
                    <div
                      key={idx}
                      className="bg-[#080D14] border border-[#1C2E42] hover:border-[#0E7FE0]/40 rounded p-2.5 text-xs font-mono flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{d.plate}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00C875]/15 text-[#00C875]">
                            {d.conf}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8FA8C0] mt-0.5">
                          {d.cam} • {d.speed}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#8FA8C0]">{d.time}</span>
                        <button
                          onClick={() => navigate(`/vehicles/details/${d.plate}`)}
                          className="block text-[10px] text-[#0E7FE0] hover:underline mt-0.5"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action in Panel Footer */}
            <div className="pt-3 border-t border-[#1C2E42]">
              <button
                onClick={() => navigate('/alerts')}
                className="w-full py-1.5 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View Full Alerts Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. BOTTOM STATUS & SYSTEM HEALTH STRIP ─── */}
      <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
        {/* Today's Summary */}
        <div className="flex items-center flex-wrap gap-3">
          <span className="text-[10px] uppercase tracking-wider text-[#8FA8C0] font-bold">
            Daily Surveillance Summary:
          </span>
          <span className="text-white font-semibold">156 Detections</span>
          <span className="text-[#8FA8C0]">•</span>
          <span className="text-[#00C875] font-semibold">142 Plates Recognized (91%)</span>
          <span className="text-[#8FA8C0]">•</span>
          <span className="text-[#FF3B3B] font-semibold">3 Watchlist Hits</span>
          <span className="text-[#8FA8C0]">•</span>
          <span className="text-[#0E7FE0] font-semibold">0 Frame Drops</span>
        </div>

        {/* System Health Indicators */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[#00C875]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C875]" />
            <span>ANPR: 14ms (YOLOv8)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#00C875]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C875]" />
            <span>DB: PostGIS Online</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#00C875]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C875]" />
            <span>Alerts: Zero Latency</span>
          </div>
        </div>

        {/* Quick Operational Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] transition-colors cursor-pointer"
            title="Refresh All Video Feeds"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportLog}
            className="p-1.5 rounded bg-[#121E2E] hover:bg-[#1C2E42] text-[#8FA8C0] hover:text-white border border-[#233A52] transition-colors cursor-pointer"
            title="Export Today's ANPR Log"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Enlarged Tactical Inspection Modal */}
      <CameraDetailModal
        camera={selectedCameraForModal}
        allCameras={cameras}
        isOpen={!!selectedCameraForModal}
        onClose={() => setSelectedCameraForModal(null)}
        onSelectCamera={(cam) => setSelectedCameraForModal(cam)}
        latestSighting={selectedCameraForModal ? latestSightingsByCamera[selectedCameraForModal.camera_id] : null}
      />

      {/* Alert Details Drawer */}
      <AlertDrawer
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={(a) => toast.success(`Acknowledged alert for ${a.plate_text}`)}
        onDismiss={(a) => toast.info(`Dismissed alert for ${a.plate_text}`)}
      />
    </div>
  );
};
export default LiveMonitor;
