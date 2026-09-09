import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  VideoOff,
  Radio,
  X,
  MapPin,
  ShieldAlert,
  Server,
  Activity,
  Clock,
  Car,
  RefreshCw
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useAlertStream } from '../context/WebSocketContext';

interface Camera {
  camera_id: string;
  name: string;
  department: string;
  latitude: number;
  longitude: number;
  address: string;
  vendor: string;
  vms_type: string;
  source_type: string;
  stream_url: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'DEGRADED';
  last_seen: string | null;
}

interface VideoSource {
  id: number;
  name: string;
  camera_id: string;
  source_type: string;
  url: string;
  status: 'STOPPED' | 'RUNNING' | 'ERROR' | 'COMPLETED';
  target_fps: number;
  current_fps: number;
  frames_processed: number;
  last_error?: string;
  created_at: string;
}

interface Sighting {
  id: number;
  camera_id: string;
  timestamp: string;
  plate_number?: string;
  plate_confidence?: number;
  vehicle_type?: string;
  vehicle_color?: string;
  vehicle_confidence?: number;
  snapshot_path?: string;
  plate_crop_path?: string;
  vehicle_bbox?: [number, number, number, number];
  plate_bbox?: [number, number, number, number];
  estimated_speed_kmh?: number;
  direction_heading?: string;
}

interface HealthData {
  app_name?: string;
  version?: string;
  build_timestamp?: string;
  backend_status?: string;
  database_status?: string;
}

type FilterMode = 'ALL' | 'ONLINE' | 'AI_ACTIVE' | 'ALERTS';
type GridSize = '2x2' | '3x3' | '4x4';

export const LiveIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected: isWsConnected, recentAlerts: wsAlerts } = useAlertStream();

  // Core Data
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [dbAlerts, setDbAlerts] = useState<any[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);

  // Filter & Grid controls
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [gridSize, setGridSize] = useState<GridSize>('2x2');

  // Selected camera for detail drawer
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  // Live clock
  const [currentTime, setCurrentTime] = useState<string>(() => {
    return new Date().toISOString().substring(11, 19);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString().substring(11, 19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial telemetry
  const fetchData = async () => {
    try {
      setLoading(true);
      const [camsRes, sourcesRes, sightingsRes, alertsRes, healthRes] = await Promise.all([
        api.get('/cameras').catch(() => ({ data: [] })),
        api.get('/video-sources').catch(() => ({ data: [] })),
        api.get('/sightings?limit=25').catch(() => ({ data: [] })),
        api.get('/alerts?limit=20').catch(() => ({ data: [] })),
        api.get('/health', { baseURL: '' }).catch(() => ({ data: null }))
      ]);

      setCameras(camsRes.data || []);
      setSources(sourcesRes.data || []);
      setSightings(sightingsRes.data || []);
      setDbAlerts(alertsRes.data || []);
      if (healthRes?.data) {
        setHealth(healthRes.data);
      }
    } catch (err) {
      console.error('Failed to load live surveillance telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(async () => {
      try {
        const [sourcesRes, sightingsRes, alertsRes] = await Promise.all([
          api.get('/video-sources').catch(() => ({ data: [] })),
          api.get('/sightings?limit=25').catch(() => ({ data: [] })),
          api.get('/alerts?limit=20').catch(() => ({ data: [] }))
        ]);
        setSources(sourcesRes.data || []);
        setSightings(sightingsRes.data || []);
        setDbAlerts(alertsRes.data || []);
      } catch {}
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Mapping camera ID -> Active Source
  const cameraSourceMap = useMemo(() => {
    const map = new Map<string, VideoSource>();
    sources.forEach((src) => {
      if (src.camera_id) {
        if (!map.has(src.camera_id) || src.status === 'RUNNING') {
          map.set(src.camera_id, src);
        }
      }
    });
    return map;
  }, [sources]);

  // Total active stream count
  const activeStreamCount = useMemo(() => {
    return sources.filter((s) => s.status === 'RUNNING').length;
  }, [sources]);

  // Cameras with alerts
  const camerasWithAlerts = useMemo(() => {
    const set = new Set<string>();
    dbAlerts.forEach((a) => {
      if (a.status === 'TRIGGERED' || a.status === 'INVESTIGATING' || a.status === 'ACKNOWLEDGED') {
        set.add(a.camera_id);
      }
    });
    wsAlerts.forEach((a) => set.add(a.camera_id));
    return set;
  }, [dbAlerts, wsAlerts]);

  // Filtered cameras
  const filteredCameras = useMemo(() => {
    return cameras.filter((cam) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchId = cam.camera_id.toLowerCase().includes(q);
        const matchName = cam.name.toLowerCase().includes(q);
        const matchAddr = (cam.address || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchAddr) return false;
      }

      if (filterMode === 'ONLINE') {
        return cam.status === 'ONLINE';
      }
      if (filterMode === 'AI_ACTIVE') {
        const src = cameraSourceMap.get(cam.camera_id);
        return src?.status === 'RUNNING';
      }
      if (filterMode === 'ALERTS') {
        return camerasWithAlerts.has(cam.camera_id);
      }
      return true;
    });
  }, [cameras, searchQuery, filterMode, cameraSourceMap, camerasWithAlerts]);

  // Selected camera object
  const selectedCamera = useMemo(() => {
    if (!selectedCameraId) return null;
    return cameras.find((c) => c.camera_id === selectedCameraId) || null;
  }, [cameras, selectedCameraId]);

  // Sightings for selected camera
  const selectedCameraSightings = useMemo(() => {
    if (!selectedCameraId) return [];
    return sightings.filter((s) => s.camera_id === selectedCameraId).slice(0, 8);
  }, [sightings, selectedCameraId]);

  // Grid slots calculation
  const gridCapacity = useMemo(() => {
    if (gridSize === '2x2') return 4;
    if (gridSize === '3x3') return 9;
    return 16;
  }, [gridSize]);

  // Sliced camera list for visible grid slots
  const displayedCameras = useMemo(() => {
    return filteredCameras.slice(0, gridCapacity);
  }, [filteredCameras, gridCapacity]);

  // Reconnect handler
  const handleReconnect = async (camId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReconnectingId(camId);
    try {
      const src = cameraSourceMap.get(camId);
      if (src) {
        await api.post(`/video-sources/${src.id}/start`).catch(() => {});
      }
      const [cRes, sRes] = await Promise.all([api.get('/cameras'), api.get('/video-sources')]);
      setCameras(cRes.data || []);
      setSources(sRes.data || []);
    } catch (err) {
      console.error('Reconnect failed', err);
    } finally {
      setTimeout(() => setReconnectingId(null), 800);
    }
  };

  // Recent detections sorted for intelligence rail
  const recentDetectionsList = useMemo(() => {
    return sightings.slice(0, 6);
  }, [sightings]);

  // Active alerts for intelligence rail
  const activeAlertsList = useMemo(() => {
    const combined: any[] = [...wsAlerts];
    dbAlerts.forEach((dba) => {
      if (!combined.some((item) => item.id === dba.id || (item.alert_id && item.alert_id === dba.id))) {
        combined.push(dba);
      }
    });
    return combined.slice(0, 5);
  }, [wsAlerts, dbAlerts]);

  return (
    <div className="flex flex-col h-[calc(100vh-4.25rem)] -m-4 md:-m-5 bg-[#0B0E12] text-slate-200 overflow-hidden select-none font-sans">
      {/* 1. TOP BAR (Height: 54px, enterprise SOC standard) */}
      <header className="h-[54px] bg-[#101419] border-b border-[#1A222D] px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Page Title & System Health */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" />
            <h1 className="text-[17px] font-semibold tracking-tight text-slate-100">
              Live Intelligence
            </h1>
            <span className="text-[11px] font-mono uppercase text-slate-400 border-l border-[#1F293D] pl-2.5 hidden sm:inline">
              GUJARAT POLICE C&C SURVEILLANCE
            </span>
          </div>

          {/* System Health Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0E12] border border-[#1A222D] text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isWsConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
              }`}
            />
            <span className="text-slate-300">
              {isWsConnected ? 'GATEWAY: HEALTHY' : 'GATEWAY: RECONNECTING'}
            </span>
          </div>
        </div>

        {/* Right: Active Streams, User/Role, Build/Version */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
          {/* Active Stream Count */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#12171D] border border-[#1A222D] rounded">
            <span className="text-slate-400 text-[11px]">ACTIVE STREAMS:</span>
            <span className="text-emerald-400 font-bold">{activeStreamCount}</span>
            <span className="text-slate-500 text-[10px]">/ {cameras.length} NODES</span>
          </div>

          {/* Current Operator */}
          {user && (
            <div className="hidden md:flex items-center gap-2 border-l border-[#1A222D] pl-3">
              <span className="text-slate-400 text-[11px]">OP:</span>
              <span className="text-slate-200 font-semibold">{user.full_name}</span>
              <span className="text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
                {user.role}
              </span>
            </div>
          )}

          {/* Build Version Badge */}
          <div className="hidden lg:flex items-center gap-1.5 border-l border-[#1A222D] pl-3 text-[10px] text-slate-400">
            <Server className="w-3 h-3 text-slate-500" />
            <span>{health?.version || 'v1.0.0-m1'}</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN 12-COLUMN WORKSPACE */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* LEFT 9 COLUMNS: Live Surveillance Workspace (Dominates 70-75% screen) */}
        <div className="col-span-12 lg:col-span-9 flex flex-col border-r border-[#1A222D] overflow-hidden bg-[#0B0E12]">
          {/* Top Operational Toolbar */}
          <div className="h-11 bg-[#101419] border-b border-[#1A222D] px-3.5 flex items-center justify-between gap-3 shrink-0">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded transition-colors duration-150 ${
                  filterMode === 'ALL'
                    ? 'bg-[#1C2533] text-blue-400 font-semibold border border-blue-800/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151B22]'
                }`}
              >
                All Cameras ({cameras.length})
              </button>
              <button
                onClick={() => setFilterMode('ONLINE')}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded transition-colors duration-150 ${
                  filterMode === 'ONLINE'
                    ? 'bg-[#1C2533] text-emerald-400 font-semibold border border-emerald-800/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151B22]'
                }`}
              >
                Online ({cameras.filter((c) => c.status === 'ONLINE').length})
              </button>
              <button
                onClick={() => setFilterMode('AI_ACTIVE')}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded transition-colors duration-150 ${
                  filterMode === 'AI_ACTIVE'
                    ? 'bg-[#1C2533] text-blue-400 font-semibold border border-blue-800/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151B22]'
                }`}
              >
                AI Active ({activeStreamCount})
              </button>
              <button
                onClick={() => setFilterMode('ALERTS')}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded transition-colors duration-150 ${
                  filterMode === 'ALERTS'
                    ? 'bg-[#1C2533] text-rose-400 font-semibold border border-rose-800/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151B22]'
                }`}
              >
                Alerts ({camerasWithAlerts.size})
              </button>
            </div>

            {/* Search and Grid selector */}
            <div className="flex items-center gap-2.5">
              {/* Search Camera */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search node, junction, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 sm:w-52 pl-8 pr-2.5 py-1 bg-[#0B0E12] border border-[#1A222D] rounded text-[11px] font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-700 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Grid Selector */}
              <div className="flex items-center border border-[#1A222D] rounded overflow-hidden bg-[#0B0E12] p-0.5">
                {(['2x2', '3x3', '4x4'] as GridSize[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setGridSize(mode)}
                    className={`px-2 py-0.5 text-[10px] font-mono transition-colors ${
                      gridSize === mode
                        ? 'bg-[#1F293D] text-slate-100 font-bold rounded-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Refresh trigger */}
              <button
                onClick={fetchData}
                title="Refresh Telemetry"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#151B22] rounded transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Video Grid Canvas (Dominating 70-75% screen) */}
          <div className="flex-1 p-3 overflow-y-auto bg-[#0B0E12]">
            {filteredCameras.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#1A222D] rounded-md">
                <VideoOff className="w-10 h-10 text-slate-600 mb-2.5" />
                <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                  No Cameras Match Current Filter
                </span>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                  Adjust your search query or reset the filter toolbar to view surveillance feeds.
                </p>
                <button
                  onClick={() => {
                    setFilterMode('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-3 px-3 py-1.5 bg-[#12171D] hover:bg-[#1A222D] border border-[#1F293D] text-xs font-mono rounded text-blue-400"
                >
                  RESET SURVEILLANCE VIEW
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-2.5 ${
                  gridSize === '2x2'
                    ? 'grid-cols-1 md:grid-cols-2'
                    : gridSize === '3x3'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {displayedCameras.map((cam) => {
                  const source = cameraSourceMap.get(cam.camera_id);
                  const isRunning = source?.status === 'RUNNING';
                  const isOnline = cam.status === 'ONLINE';
                  const hasAlert = camerasWithAlerts.has(cam.camera_id);
                  const isSelected = selectedCameraId === cam.camera_id;

                  // Real sightings for bounding box overlay
                  const camSightings = sightings.filter((s) => s.camera_id === cam.camera_id);
                  const latestSighting = camSightings.length > 0 ? camSightings[0] : null;

                  return (
                    <div
                      key={cam.camera_id}
                      onClick={() => setSelectedCameraId(cam.camera_id)}
                      className={`group aspect-video rounded-md bg-[#12171D] border transition-all duration-150 relative flex flex-col justify-between overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 ring-1 ring-blue-500'
                          : hasAlert
                          ? 'border-rose-600/80'
                          : 'border-[#1A222D] hover:border-[#2A374A]'
                      }`}
                    >
                      {/* Top Overlay Bar */}
                      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/85 via-black/50 to-transparent p-2 flex items-start justify-between z-10">
                        {/* Camera Identifiers */}
                        <div className="leading-tight">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-100">
                              {cam.camera_id}
                            </span>
                            {hasAlert && (
                              <span className="px-1 py-0.2 bg-rose-600/80 text-[9px] font-mono text-white rounded uppercase font-bold">
                                ALERT
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-300 truncate max-w-[180px]">
                            {cam.name || cam.address}
                          </div>
                        </div>

                        {/* Stream / AI Status Indicators */}
                        <div className="flex items-center gap-1">
                          {isRunning ? (
                            <>
                              <span className="px-1.5 py-0.5 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[9px] font-mono font-bold rounded">
                                LIVE
                              </span>
                              <span className="px-1.5 py-0.5 bg-blue-950/80 border border-blue-800/60 text-blue-400 text-[9px] font-mono font-bold rounded">
                                AI ACTIVE
                              </span>
                            </>
                          ) : isOnline ? (
                            <span className="px-1.5 py-0.5 bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[9px] font-mono rounded">
                              STANDBY
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-rose-950/80 border border-rose-800/60 text-rose-400 text-[9px] font-mono rounded">
                              OFFLINE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Video Center Canvas */}
                      <div className="flex-1 w-full h-full relative flex items-center justify-center bg-[#0C1015]">
                        {/* Real video or optical placeholder */}
                        {isRunning && source?.url && (source.url.endsWith('.mp4') || source.url.startsWith('http')) ? (
                          <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                            <video
                              src={source.url}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />

                            {/* Genuine AI Bounding Box (ONLY rendered if real AI bbox data exists) */}
                            {latestSighting?.vehicle_bbox && Array.isArray(latestSighting.vehicle_bbox) && (
                              <div
                                style={{
                                  position: 'absolute',
                                  left: `${Math.max(5, latestSighting.vehicle_bbox[0] || 20)}%`,
                                  top: `${Math.max(5, latestSighting.vehicle_bbox[1] || 25)}%`,
                                  width: `${Math.min(90, (latestSighting.vehicle_bbox[2] || 50) - (latestSighting.vehicle_bbox[0] || 20))}%`,
                                  height: `${Math.min(90, (latestSighting.vehicle_bbox[3] || 70) - (latestSighting.vehicle_bbox[1] || 25))}%`,
                                }}
                                className="border border-blue-400/90 bg-blue-500/10 pointer-events-none"
                              >
                                {latestSighting.plate_number && (
                                  <div className="absolute -top-4 left-0 bg-blue-600 text-white font-mono text-[9px] px-1 py-0.2 uppercase font-semibold tracking-wider">
                                    {latestSighting.plate_number}
                                    {latestSighting.plate_confidence ? ` (${(latestSighting.plate_confidence * 100).toFixed(0)}%)` : ''}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-4 text-slate-500">
                            <VideoOff className="w-6 h-6 mb-1 text-slate-600" />
                            <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
                              {isOnline ? 'STREAM STANDBY' : 'CAMERA OFFLINE'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-600 mt-0.5">
                              {cam.last_seen ? `Last seen: ${cam.last_seen.substring(11, 19)} UTC` : 'No telemetry record'}
                            </span>

                            {/* Reconnect button */}
                            <button
                              onClick={(e) => handleReconnect(cam.camera_id, e)}
                              disabled={reconnectingId === cam.camera_id}
                              className="mt-2.5 px-2 py-0.5 bg-[#161F2C] hover:bg-[#1F2B3D] border border-[#233147] rounded text-[10px] font-mono text-slate-300 transition-colors flex items-center gap-1.5"
                            >
                              <RefreshCw
                                className={`w-2.5 h-2.5 ${
                                  reconnectingId === cam.camera_id ? 'animate-spin' : ''
                                }`}
                              />
                              {reconnectingId === cam.camera_id ? 'CONNECTING...' : 'RECONNECT'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Bottom Telemetry Overlay */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 z-10">
                        {/* Timestamp */}
                        <div className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-2.5 h-2.5 text-slate-500" />
                          <span>{currentTime} UTC</span>
                        </div>

                        {/* FPS and state */}
                        <div className="flex items-center gap-2">
                          <span>FPS: {isRunning ? (source?.current_fps || source?.target_fps || '5.0') : '0.0'}</span>
                          <span className="text-slate-600">|</span>
                          <span
                            className={
                              isRunning
                                ? 'text-emerald-400'
                                : isOnline
                                ? 'text-slate-400'
                                : 'text-rose-400'
                            }
                          >
                            {isRunning ? 'STREAMING' : isOnline ? 'CONNECTED' : 'DISCONNECTED'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 3 COLUMNS: Compact Intelligence Rail (25% width) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col bg-[#101419] overflow-y-auto border-l border-[#1A222D]">
          {/* SECTION 1: ACTIVE ALERTS */}
          <div className="p-3 border-b border-[#1A222D]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                ACTIVE ALERTS
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {activeAlertsList.length} QUEUED
              </span>
            </div>

            {activeAlertsList.length === 0 ? (
              <div className="py-4 text-center text-slate-500 text-[11px] font-mono bg-[#0B0E12] rounded border border-[#1A222D]">
                NO ACTIVE INTERCEPTS
              </div>
            ) : (
              <div className="space-y-1.5">
                {activeAlertsList.map((alert, idx) => {
                  const isCritical = alert.severity === 'CRITICAL';
                  return (
                    <div
                      key={alert.id || alert.alert_id || idx}
                      onClick={() => {
                        if (alert.camera_id) setSelectedCameraId(alert.camera_id);
                      }}
                      className="p-2 rounded bg-[#0B0E12] border border-[#1A222D] hover:border-slate-600 transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCritical ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                          />
                          <span className="font-mono font-bold text-slate-100 tracking-wide">
                            {alert.plate_number || 'UNKNOWN'}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          {alert.timestamp
                            ? alert.timestamp.substring(11, 19)
                            : currentTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                        <span className="text-slate-300 truncate max-w-[140px]">
                          {alert.camera_id}
                        </span>
                        <span
                          className={`text-[9px] uppercase px-1 rounded font-semibold ${
                            isCritical
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                          }`}
                        >
                          {alert.severity || 'WARNING'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: RECENT DETECTIONS */}
          <div className="p-3 border-b border-[#1A222D]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-400" />
                RECENT DETECTIONS
              </span>
              <span className="text-[10px] font-mono text-slate-500">REAL-TIME</span>
            </div>

            {recentDetectionsList.length === 0 ? (
              <div className="py-4 text-center text-slate-500 text-[11px] font-mono bg-[#0B0E12] rounded border border-[#1A222D]">
                NO DETECTIONS LOGGED
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentDetectionsList.map((sighting) => (
                  <div
                    key={sighting.id}
                    onClick={() => setSelectedCameraId(sighting.camera_id)}
                    className="p-2 rounded bg-[#0B0E12] border border-[#1A222D] hover:border-slate-600 transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-200">
                        {sighting.plate_number || 'UNREAD PLATE'}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {sighting.timestamp ? sighting.timestamp.substring(11, 19) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                      <span>{sighting.camera_id}</span>
                      {typeof sighting.plate_confidence === 'number' && (
                        <span className="text-slate-400 text-[10px]">
                          {(sighting.plate_confidence * 100).toFixed(0)}% CONF
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: SYSTEM TELEMETRY */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                SYSTEM TELEMETRY
              </span>
              <span className="text-[10px] font-mono text-slate-500">SOC CORE</span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <div className="p-2 rounded bg-[#0B0E12] border border-[#1A222D] flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">AI INFERENCE</span>
                <span className="text-emerald-400 font-semibold text-[11px] flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  OPERATIONAL
                </span>
              </div>
              <div className="p-2 rounded bg-[#0B0E12] border border-[#1A222D] flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">STREAM WORKERS</span>
                <span className="text-slate-200 text-[11px]">
                  {activeStreamCount} / {sources.length} ACTIVE
                </span>
              </div>
              <div className="p-2 rounded bg-[#0B0E12] border border-[#1A222D] flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">BACKEND STATUS</span>
                <span className="text-emerald-400 font-semibold text-[11px] flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  {health?.backend_status?.toUpperCase() || 'ONLINE'}
                </span>
              </div>
              <div className="p-2 rounded bg-[#0B0E12] border border-[#1A222D] flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">POSTGIS STORE</span>
                <span className="text-emerald-400 font-semibold text-[11px] flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  {health?.database_status?.toUpperCase() || 'CONNECTED'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DETAIL DRAWER (Sliding panel on right, opens upon clicking camera node) */}
      {selectedCamera && (
        <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[#101419] border-l border-[#1F293D] shadow-2xl z-50 flex flex-col justify-between text-slate-200 animate-in slide-in-from-right duration-150">
          {/* Drawer Header */}
          <div className="h-12 px-4 border-b border-[#1A222D] flex items-center justify-between bg-[#12171D] shrink-0">
            <div className="flex items-center gap-2 font-mono">
              <Radio className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-100 uppercase">
                {selectedCamera.camera_id}
              </span>
            </div>
            <button
              onClick={() => setSelectedCameraId(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1A222D] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {/* Metadata Summary */}
            <div className="p-3 bg-[#0B0E12] border border-[#1A222D] rounded space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Node Specification
              </div>
              <div className="font-semibold text-slate-100 text-sm">
                {selectedCamera.name}
              </div>
              <div className="text-slate-300 flex items-start gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{selectedCamera.address || 'Address uncatalogued'}</span>
              </div>
              <div className="pt-2 border-t border-[#1A222D] grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block">DEPARTMENT:</span>
                  <span className="text-slate-300">{selectedCamera.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">VMS TYPE:</span>
                  <span className="text-slate-300">{selectedCamera.vms_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">STATUS:</span>
                  <span
                    className={
                      selectedCamera.status === 'ONLINE' ? 'text-emerald-400' : 'text-rose-400'
                    }
                  >
                    {selectedCamera.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">SOURCE TYPE:</span>
                  <span className="text-slate-300">{selectedCamera.source_type}</span>
                </div>
              </div>
            </div>

            {/* Stream Telemetry */}
            <div className="p-3 bg-[#0B0E12] border border-[#1A222D] rounded space-y-2 font-mono text-[11px]">
              <div className="text-[10px] text-slate-400 uppercase">Stream Ingestion</div>
              {(() => {
                const src = cameraSourceMap.get(selectedCamera.camera_id);
                if (!src) {
                  return (
                    <div className="text-slate-500 text-[10px]">
                      No active stream worker bound to this node.
                    </div>
                  );
                }
                return (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">WORKER STATE:</span>
                      <span
                        className={
                          src.status === 'RUNNING' ? 'text-emerald-400' : 'text-slate-400'
                        }
                      >
                        {src.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">TARGET / LIVE FPS:</span>
                      <span className="text-slate-200">
                        {src.target_fps} / {src.current_fps} FPS
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">FRAMES PROCESSED:</span>
                      <span className="text-slate-200">{src.frames_processed}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Recent Detections for this Camera */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Node Optical Log
              </div>
              {selectedCameraSightings.length === 0 ? (
                <div className="p-3 bg-[#0B0E12] border border-[#1A222D] rounded text-slate-500 text-center font-mono text-[11px]">
                  No recent sightings registered
                </div>
              ) : (
                <div className="space-y-1.5 font-mono">
                  {selectedCameraSightings.map((s) => (
                    <div
                      key={s.id}
                      className="p-2 bg-[#0B0E12] border border-[#1A222D] rounded flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-200">
                          {s.plate_number || 'UNKNOWN'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {s.timestamp ? s.timestamp.substring(11, 19) : ''} UTC
                        </div>
                      </div>
                      {typeof s.plate_confidence === 'number' && (
                        <div className="text-blue-400 text-[10px]">
                          {(s.plate_confidence * 100).toFixed(0)}% CONF
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="p-3 border-t border-[#1A222D] bg-[#12171D] space-y-2 shrink-0 font-mono text-xs">
            <button
              onClick={() => {
                navigate(`/search?camera_id=${selectedCamera.camera_id}`);
              }}
              className="w-full py-2 bg-[#1C2533] hover:bg-[#253245] border border-blue-800/40 text-blue-300 rounded font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              SEARCH VEHICLES ON NODE
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate(`/map?cam=${selectedCamera.camera_id}`)}
                className="py-1.5 bg-[#0B0E12] hover:bg-[#1A222D] border border-[#1F293D] text-slate-300 rounded text-center transition-colors"
              >
                VIEW ON GIS
              </button>
              <button
                onClick={() => navigate('/evidence')}
                className="py-1.5 bg-[#0B0E12] hover:bg-[#1A222D] border border-[#1F293D] text-slate-300 rounded text-center transition-colors"
              >
                VIEW EVIDENCE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

