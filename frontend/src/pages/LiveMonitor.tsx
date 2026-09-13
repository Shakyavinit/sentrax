import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CameraDetailModal } from '../components/cameras/CameraDetailModal';
import { VehicleDossierModal } from '../components/vehicles/VehicleDossierModal';
import { useCameras } from '../hooks/useCameras';
import { useWebSocket } from '../hooks/useWebSocket';
import { Camera } from '../types';
import {
  Video,
  Activity,
  Car,
  CreditCard,
  Shield,
  Cpu,
  LayoutGrid,
  List,
  MapPin,
  Clock,
  ExternalLink,
  Siren,
  ArrowRight,
  Maximize2,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

type CameraCategory = 'all' | 'highway' | 'city' | 'entry_exit' | 'sensitive';
type ViewMode = 'grid' | 'list' | 'map';

interface SentinelCamera {
  id: string;
  camera_id: string;
  name: string;
  location_name: string;
  badgeType: 'REC' | 'LIVE' | 'ONLINE';
  vehicleCount: number;
  activePlate: string;
  protocol: 'HLS' | 'RTSP';
  resolution: string;
  fps: number;
  feedImg: string;
  videoUrl: string;
  category: 'highway' | 'city' | 'entry_exit' | 'sensitive';
  status: 'online' | 'warning' | 'offline';
  lat: number;
  lon: number;
}

const CANONICAL_CAMERAS: SentinelCamera[] = [
  {
    id: 'cam-01',
    camera_id: 'CAM01',
    name: 'MG Road Junction',
    location_name: 'Ahmedabad',
    badgeType: 'REC',
    vehicleCount: 12,
    activePlate: 'GJ01AB1234',
    protocol: 'HLS',
    resolution: '1920×1080',
    fps: 30,
    feedImg: './images/feed_cam01.jpg',
    videoUrl: './videos/cam_mg_road.mp4',
    category: 'highway',
    status: 'online',
    lat: 23.0258,
    lon: 72.5839,
  },
  {
    id: 'cam-02',
    camera_id: 'CAM02',
    name: 'Sardar Bridge Entry',
    location_name: 'Ahmedabad',
    badgeType: 'LIVE',
    vehicleCount: 8,
    activePlate: 'RJ14CH3456',
    protocol: 'RTSP',
    resolution: '1920×1080',
    fps: 30,
    feedImg: './images/feed_cam02.jpg',
    videoUrl: './videos/cam_sardar_bridge.mp4',
    category: 'city',
    status: 'online',
    lat: 23.0152,
    lon: 72.5794,
  },
  {
    id: 'cam-03',
    camera_id: 'CAM03',
    name: 'Vastrapur Lake Gate',
    location_name: 'Ahmedabad',
    badgeType: 'REC',
    vehicleCount: 15,
    activePlate: 'GJ06TA7889',
    protocol: 'HLS',
    resolution: '1920×1080',
    fps: 30,
    feedImg: './images/feed_cam03.jpg',
    videoUrl: './videos/cam_vastrapur.mp4',
    category: 'city',
    status: 'online',
    lat: 23.0436,
    lon: 72.5283,
  },
  {
    id: 'cam-04',
    camera_id: 'CAM04',
    name: 'SG Highway Toll',
    location_name: 'Gandhinagar',
    badgeType: 'ONLINE',
    vehicleCount: 22,
    activePlate: 'GJ18ZZ3322',
    protocol: 'RTSP',
    resolution: '1920×1080',
    fps: 30,
    feedImg: './images/feed_cam04.jpg',
    videoUrl: './videos/cam_sg_highway_toll.mp4',
    category: 'highway',
    status: 'online',
    lat: 23.0732,
    lon: 72.5038,
  },
  {
    id: 'cam-05',
    camera_id: 'CAM05',
    name: 'Gandhinagar Sector 15',
    location_name: 'Gandhinagar',
    badgeType: 'REC',
    vehicleCount: 6,
    activePlate: 'GJ06ZA1010',
    protocol: 'HLS',
    resolution: '1920×1080',
    fps: 30,
    feedImg: './images/feed_cam05.jpg',
    videoUrl: './videos/cam_sector15.mp4',
    category: 'sensitive',
    status: 'online',
    lat: 23.2156,
    lon: 72.6394,
  },
  {
    id: 'cam-06',
    camera_id: 'CAM06',
    name: 'GIFT City Entry',
    location_name: 'Gandhinagar',
    badgeType: 'LIVE',
    vehicleCount: 11,
    activePlate: 'GJ27XY9900',
    protocol: 'RTSP',
    resolution: '1920×1080',
    fps: 30,
    feedImg: './images/feed_cam06.jpg',
    videoUrl: './videos/cam_gift_city.mp4',
    category: 'sensitive',
    status: 'online',
    lat: 23.1573,
    lon: 72.6787,
  },
  {
    id: 'cam-07',
    camera_id: 'CAM07',
    name: 'Sabarmati Riverfront',
    location_name: 'Ahmedabad',
    badgeType: 'REC',
    vehicleCount: 9,
    activePlate: 'GJ02AABB11',
    protocol: 'HLS',
    resolution: '1920×1080',
    fps: 30,
    feedImg: './images/feed_cam07.jpg',
    videoUrl: './videos/cam_sabarmati.mp4',
    category: 'city',
    status: 'online',
    lat: 23.0395,
    lon: 72.5878,
  },
  {
    id: 'cam-08',
    camera_id: 'CAM08',
    name: 'GNLU Gate',
    location_name: 'Gandhinagar',
    badgeType: 'ONLINE',
    vehicleCount: 14,
    activePlate: 'RJ31BB7766',
    protocol: 'RTSP',
    resolution: '1920×1080',
    fps: 30,
    feedImg: './images/feed_cam08.jpg',
    videoUrl: './videos/cam_gnlu_gate.mp4',
    category: 'entry_exit',
    status: 'online',
    lat: 23.1891,
    lon: 72.6542,
  },
  {
    id: 'cam-09',
    camera_id: 'CAM09',
    name: 'Chiloda Circle',
    location_name: 'Gandhinagar',
    badgeType: 'REC',
    vehicleCount: 7,
    activePlate: 'GJ09RS8899',
    protocol: 'HLS',
    resolution: '1920×1080',
    fps: 30,
    feedImg: './images/feed_cam09.jpg',
    videoUrl: './videos/cam_chiloda_circle.mp4',
    category: 'entry_exit',
    status: 'online',
    lat: 23.2743,
    lon: 72.6122,
  },
  {
    id: 'cam-10',
    camera_id: 'CAM10',
    name: 'Kudasan Junction',
    location_name: 'Gandhinagar',
    badgeType: 'LIVE',
    vehicleCount: 18,
    activePlate: 'GJ05CD5678',
    protocol: 'RTSP',
    resolution: '1920×1080',
    fps: 30,
    feedImg: './images/feed_cam06.jpg',
    videoUrl: './videos/cam_kudasan.mp4',
    category: 'city',
    status: 'online',
    lat: 23.178,
    lon: 72.632,
  },
];

export const LiveMonitor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: apiCameras = [] } = useCameras();
  const { connected, on } = useWebSocket();

  const [activeCategory, setActiveCategory] = useState<CameraCategory>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<'default' | 'name' | 'id'>('default');
  const [isLiveFeedOn, setIsLiveFeedOn] = useState(true);

  const [selectedCameraForModal, setSelectedCameraForModal] = useState<Camera | null>(null);
  const [selectedDossierPlate, setSelectedDossierPlate] = useState<string | null>(null);
  const [latestSightingsByCamera, setLatestSightingsByCamera] = useState<Record<string, any>>({});
  const lastToastRef = useRef<{ [plate: string]: number }>({});

  // Merge API cameras with canonical cameras
  const cameras = useMemo(() => {
    return CANONICAL_CAMERAS.map((canon) => {
      const matched = apiCameras.find((c) => c.camera_id === canon.camera_id || c.id === canon.id);
      if (matched) {
        return {
          ...canon,
          ...matched,
          badgeType: canon.badgeType,
          vehicleCount: canon.vehicleCount,
          activePlate: canon.activePlate,
          protocol: canon.protocol,
          resolution: canon.resolution,
          fps: canon.fps,
          feedImg: canon.feedImg,
          videoUrl: canon.videoUrl,
          category: canon.category,
          location_name: canon.location_name,
        } as SentinelCamera;
      }
      return canon;
    });
  }, [apiCameras]);

  // URL sync for camera focus
  useEffect(() => {
    const camCode = searchParams.get('cam') || searchParams.get('camera');
    if (camCode && cameras.length > 0) {
      const found = cameras.find(
        (c) =>
          c.camera_id.toUpperCase() === camCode.toUpperCase() ||
          c.id === camCode ||
          c.name.toLowerCase().includes(camCode.toLowerCase())
      );
      if (found) {
        setSelectedCameraForModal(found as any);
      }
    }
  }, [searchParams, cameras]);

  const handleSelectCamera = (cam: SentinelCamera | Camera) => {
    setSelectedCameraForModal(cam as Camera);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('cam', cam.camera_id);
    setSearchParams(newParams, { replace: true });
  };

  const handleCloseCameraModal = () => {
    setSelectedCameraForModal(null);
    if (searchParams.has('cam') || searchParams.has('camera')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('cam');
      newParams.delete('camera');
      setSearchParams(newParams, { replace: true });
    }
  };

  // WebSocket alerts
  useEffect(() => {
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
    });

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

  // Category counts matching exact design
  const categoryCounts = {
    all: 10,
    highway: 2,
    city: 5,
    entry_exit: 3,
    sensitive: 2,
  };

  // Filtered and sorted cameras
  const displayCameras = useMemo(() => {
    let list = [...cameras];
    if (activeCategory !== 'all') {
      list = list.filter((c) => c.category === activeCategory);
    }
    if (sortOption === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'id') {
      list.sort((a, b) => a.camera_id.localeCompare(b.camera_id));
    } else {
      const orderMap: Record<string, number> = {
        CAM01: 1,
        CAM02: 2,
        CAM03: 3,
        CAM04: 4,
        CAM05: 5,
        CAM06: 6,
        CAM07: 7,
        CAM08: 8,
        CAM09: 9,
        CAM10: 10,
      };
      list.sort((a, b) => (orderMap[a.camera_id] || 99) - (orderMap[b.camera_id] || 99));
    }
    return list;
  }, [cameras, activeCategory, sortOption]);

  const handleDispatch = (plate: string, location: string) => {
    toast.error(`🚨 TACTICAL DISPATCH: PCR Unit 07 alerted to intercept ${plate} at ${location}! High-speed intercept team en route.`, {
      duration: 6000,
    });
  };

  return (
    <div className="space-y-4 pb-4 text-white select-none">
      {/* ─── 1. TOP METRICS STRIP (5 CARDS) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: TOTAL CAMERAS */}
        <div className="bg-[#0A1320] border border-[#14263B] rounded-lg p-3.5 flex items-center gap-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          <div className="w-12 h-12 rounded-lg bg-[#0E7FE0]/15 border border-[#0E7FE0]/30 flex items-center justify-center text-[#0E7FE0] shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8C0] block">
              TOTAL CAMERAS
            </span>
            <div className="text-2xl font-mono font-bold text-white tracking-tight leading-none mt-0.5">
              10
            </div>
            <span className="text-[11px] text-[#627D98] block mt-1">
              Online across network
            </span>
          </div>
        </div>

        {/* Card 2: ACTIVE FEEDS */}
        <div className="bg-[#0A1320] border border-[#14263B] rounded-lg p-3.5 flex items-center gap-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          <div className="w-12 h-12 rounded-lg bg-[#00C875]/15 border border-[#00C875]/30 flex items-center justify-center text-[#00C875] shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8C0] block">
              ACTIVE FEEDS
            </span>
            <div className="flex items-center gap-2 mt-0.5 leading-none">
              <span className="text-2xl font-mono font-bold text-[#00C875] tracking-tight">
                8 Active
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C875] shadow-[0_0_10px_#00C875] animate-pulse" />
            </div>
            <span className="text-[11px] text-[#627D98] block mt-1">
              80% of network online
            </span>
          </div>
        </div>

        {/* Card 3: VEHICLES TODAY */}
        <div className="bg-[#0A1320] border border-[#14263B] rounded-lg p-3.5 flex items-center gap-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          <div className="w-12 h-12 rounded-lg bg-[#0E7FE0]/15 border border-[#0E7FE0]/30 flex items-center justify-center text-[#0E7FE0] shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8C0] block">
              VEHICLES TODAY
            </span>
            <div className="flex items-center gap-2 mt-0.5 leading-none">
              <span className="text-2xl font-mono font-bold text-white tracking-tight">
                156
              </span>
              <span className="text-xs font-mono font-semibold text-[#00C875]">
                ↑ +12%
              </span>
            </div>
            <span className="text-[11px] text-[#627D98] block mt-1">
              Total vehicles detected
            </span>
          </div>
        </div>

        {/* Card 4: PLATES DECODED */}
        <div className="bg-[#0A1320] border border-[#14263B] rounded-lg p-3.5 flex items-center gap-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          <div className="w-12 h-12 rounded-lg bg-[#0E7FE0]/15 border border-[#0E7FE0]/30 flex items-center justify-center text-[#0E7FE0] shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FA8C0] block">
              PLATES DECODED
            </span>
            <div className="flex items-center gap-2 mt-0.5 leading-none">
              <span className="text-2xl font-mono font-bold text-white tracking-tight">
                142 (91%)
              </span>
              <span className="text-xs font-mono font-semibold text-[#00C875]">
                ↓ +8%
              </span>
            </div>
            <span className="text-[11px] text-[#627D98] block mt-1">
              Recognition accuracy
            </span>
          </div>
        </div>

        {/* Card 5: WATCHLIST HITS (Red Card) */}
        <div className="bg-[#16070B] border border-[#FF3B3B]/60 rounded-lg p-3.5 flex items-center gap-3.5 shadow-[0_0_18px_rgba(255,59,59,0.2)]">
          <div className="w-12 h-12 rounded-lg bg-[#FF3B3B]/15 border border-[#FF3B3B]/40 flex items-center justify-center text-[#FF3B3B] shrink-0 animate-pulse">
            <Shield className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF3B3B] font-bold block">
              WATCHLIST HITS
            </span>
            <div className="text-2xl font-mono font-bold text-[#FF3B3B] tracking-tight leading-none mt-0.5">
              3 Targets
            </div>
            <span className="text-[11px] text-[#8FA8C0] block mt-1">
              Requires immediate attention
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2. SUB-BAR: FILTER PILLS, AI ENGINE & CONTROLS ─── */}
      <div className="bg-[#0A121E] border border-[#14263B] rounded-lg px-2 py-1.5 flex items-center justify-between gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.4)] flex-nowrap overflow-x-auto">
        {/* Left Category Filter Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: 'all', label: `All Cameras (${categoryCounts.all})` },
            { id: 'highway', label: `Highway (${categoryCounts.highway})` },
            { id: 'city', label: `City (${categoryCounts.city})` },
            { id: 'entry_exit', label: `Entry/Exit (${categoryCounts.entry_exit})` },
            { id: 'sensitive', label: `Sensitive (${categoryCounts.sensitive})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as CameraCategory)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#0E7FE0] text-white font-semibold shadow-[0_0_10px_rgba(14,127,224,0.4)]'
                  : 'bg-[#0B1320] border border-[#16273C] text-[#8FA8C0] hover:text-white hover:bg-[#121E2E]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right Status Indicators & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Engine Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0B1320] border border-[#16273C] text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-[#0E7FE0]" />
            <span className="text-[#8FA8C0]">AI Engine:</span>
            <span className="text-[#00C875] font-semibold">YOLOv8 + LPR</span>
            <span className="w-2 h-2 rounded-full bg-[#00C875] shadow-[0_0_6px_#00C875] animate-pulse ml-0.5" />
          </div>

          {/* Socket Live Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0B1320] border border-[#16273C] text-xs font-mono text-white">
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-[#00C875] shadow-[0_0_8px_#00C875]' : 'bg-[#FF8C00] animate-pulse'
              }`}
            />
            <span>{connected ? 'Socket Live' : 'Socket Syncing'}</span>
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#0E7FE0] text-white shadow'
                  : 'bg-[#0B1320] border border-[#16273C] text-[#8FA8C0] hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#0E7FE0] text-white shadow'
                  : 'bg-[#0B1320] border border-[#16273C] text-[#8FA8C0] hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-[#0E7FE0] text-white shadow'
                  : 'bg-[#0B1320] border border-[#16273C] text-[#8FA8C0] hover:text-white'
              }`}
              title="Map Pin View"
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="appearance-none bg-[#0B1320] border border-[#16273C] text-[#8FA8C0] hover:text-white text-xs font-mono rounded-md pl-2.5 pr-6 py-1.5 focus:outline-none focus:border-[#0E7FE0] cursor-pointer"
            >
              <option value="default">Sort: Location</option>
              <option value="name">Sort: Name</option>
              <option value="id">Sort: Camera ID</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#8FA8C0] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ─── 3. SECTION HEADER: CAMERA FEEDS ─── */}
      <div className="flex items-center gap-2 pt-1">
        <span className="w-1 h-4 bg-[#0E7FE0] rounded-full inline-block" />
        <h2 className="text-base font-bold text-white">Camera Feeds</h2>
        <span className="text-xs text-[#8FA8C0] ml-1">
          Live network of 10 cameras <span className="mx-1">•</span> Real-time vehicle detection and plate recognition
        </span>
      </div>

      {/* ─── 4. MAIN BODY: 3x3 CAMERA MATRIX (LEFT) + WATCHLIST HITS (RIGHT) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left: Camera Grid (9 Cameras in 3x3) */}
        <div className="xl:col-span-9">
          {viewMode === 'map' ? (
            <div className="bg-[#0A121E] border border-[#14263B] rounded-lg p-6 text-center">
              <MapPin className="w-10 h-10 text-[#0E7FE0] mx-auto mb-2 animate-bounce" />
              <h3 className="text-base font-bold text-white">Tactical GIS Map View</h3>
              <p className="text-xs text-[#8FA8C0] mt-1">
                Showing all 10 cameras across Ahmedabad & Gandhinagar network corridors.
              </p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs font-mono">
                {cameras.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCamera(c)}
                    className="p-2 rounded bg-[#0D1520] border border-[#1C2E42] hover:border-[#0E7FE0] cursor-pointer text-left"
                  >
                    <div className="font-bold text-[#0E7FE0]">{c.camera_id}</div>
                    <div className="text-white truncate">{c.name}</div>
                    <div className="text-[10px] text-[#8FA8C0]">{c.location_name}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : viewMode === 'list' ? (
            <div className="bg-[#0A121E] border border-[#14263B] rounded-lg overflow-hidden divide-y divide-[#14263B]">
              {displayCameras.map((cam) => (
                <div
                  key={cam.id}
                  onClick={() => handleSelectCamera(cam)}
                  className="p-3 flex items-center justify-between hover:bg-[#0E7FE0]/5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-10 rounded overflow-hidden bg-black border border-[#1C2E42]">
                      <img src={cam.feedImg} alt={cam.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-2">
                        <span>{cam.camera_id} – {cam.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            cam.badgeType === 'REC'
                              ? 'bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/30'
                              : 'bg-[#00C875]/15 text-[#00C875] border border-[#00C875]/30'
                          }`}
                        >
                          {cam.badgeType}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8FA8C0] font-mono flex items-center gap-2 mt-0.5">
                        <span>{cam.location_name}</span>
                        <span>•</span>
                        <span>{cam.protocol}</span>
                        <span>•</span>
                        <span>{cam.fps} FPS</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="px-2 py-1 rounded bg-[#070D16] border border-[#1C2E42] text-white font-bold">
                      {cam.activePlate}
                    </span>
                    <button className="p-1.5 rounded bg-[#121E2E] text-[#8FA8C0] hover:text-white border border-[#233A52]">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 3x3 Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayCameras.slice(0, 9).map((cam) => (
                <div
                  key={cam.id}
                  onClick={() => handleSelectCamera(cam)}
                  className="bg-[#09111C] border border-[#14263B] hover:border-[#0E7FE0] rounded-lg overflow-hidden transition-all duration-200 cursor-pointer group shadow-[0_2px_10px_rgba(0,0,0,0.5)] flex flex-col"
                >
                  {/* Feed Image Area with subtle laser scanline */}
                  <div className="relative aspect-[198/73] bg-black overflow-hidden">
                    <img
                      src={cam.feedImg}
                      alt={cam.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Subtle scanning laser line */}
                    <div className="absolute left-0 right-0 h-[1px] bg-[#0E7FE0]/40 shadow-[0_0_6px_#0E7FE0] animate-scan pointer-events-none opacity-30" />

                    {/* Hover Inspect Overlay */}
                    <div className="absolute inset-0 bg-[#0E7FE0]/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center justify-center">
                      <span className="bg-[#09111C]/90 border border-[#0E7FE0] text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded shadow-lg flex items-center gap-1.5">
                        <Maximize2 className="w-3 h-3 text-[#0E7FE0]" />
                        CLICK TO INSPECT
                      </span>
                    </div>
                  </div>

                  {/* Sub-Footer Details */}
                  <div className="p-2.5 bg-[#09111C] border-t border-[#14263B]">
                    {/* Line 1: Name + Expand Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                        {cam.camera_id} – {cam.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCamera(cam);
                        }}
                        className="p-1 rounded border border-[#1C2E42] hover:border-[#0E7FE0] text-[#8FA8C0] hover:text-white transition-colors cursor-pointer"
                        title="Expand Camera"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line 2: Location + Stream Info */}
                    <div className="flex items-center justify-between text-[11px] font-mono mt-1">
                      <div className="flex items-center gap-1 text-[#8FA8C0]">
                        <MapPin className="w-3 h-3 text-[#0E7FE0]" />
                        <span>{cam.location_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#0E7FE0] text-[10px]">
                        <Video className="w-3 h-3 text-[#0E7FE0]" />
                        <span>{cam.protocol} | {cam.resolution} | {cam.fps} FPS</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Watchlist Hits Column */}
        <div className="xl:col-span-3">
          <div className="bg-[#0A121E] border border-[#14263B] rounded-lg p-3.5 flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#14263B]">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#FF3B3B] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="8.5" stroke="#FF3B3B" strokeWidth="1.75" />
                  <circle cx="12" cy="12" r="4" stroke="#FF3B3B" strokeWidth="1.75" />
                  <circle cx="12" cy="12" r="1.5" fill="#FF3B3B" />
                  <line x1="12" y1="1" x2="12" y2="3.5" stroke="#FF3B3B" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="20.5" x2="12" y2="23" stroke="#FF3B3B" strokeWidth="2" strokeLinecap="round" />
                  <line x1="1" y1="12" x2="3.5" y2="12" stroke="#FF3B3B" strokeWidth="2" strokeLinecap="round" />
                  <line x1="20.5" y1="12" x2="23" y2="12" stroke="#FF3B3B" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-white leading-none">Watchlist Hits</h3>
                  <span className="text-[11px] text-[#8FA8C0]">3 Recent Detections</span>
                </div>
              </div>

              {/* Live Feed Toggle */}
              <div className="flex items-center gap-2 text-xs font-medium text-white">
                <span className="text-[11px] text-[#C5D5E6]">Live Feed</span>
                <button
                  type="button"
                  onClick={() => setIsLiveFeedOn(!isLiveFeedOn)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    isLiveFeedOn ? 'bg-[#FF3B3B]' : 'bg-[#1C2E42]'
                  }`}
                  aria-label="Toggle Live Feed"
                >
                  <span
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isLiveFeedOn ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 3 Hit Cards */}
            <div className="space-y-3 mt-3">
              {/* Card 1: CRITICAL */}
              <div className="bg-[#0B131F] border border-[#FF3B3B]/50 rounded-lg p-2.5 shadow relative overflow-hidden">
                <div className="flex items-start gap-2.5">
                  <img
                    src="./images/hit_scorpio_clean.jpg"
                    alt="Scorpio"
                    className="w-16 h-12 rounded object-cover border border-[#1C2E42] shrink-0"
                  />
                  <div className="flex-1 min-w-0 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs tracking-wider">GJ01AB1234</span>
                      <span className="text-[10px] font-bold text-[#FF3B3B] px-1.5 py-0.2 rounded border border-[#FF3B3B] bg-[#FF3B3B]/10 uppercase">
                        CRITICAL
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8FA8C0] truncate mt-0.5">
                      Mahindra Scorpio-N
                    </div>
                    <div className="text-[10px] text-[#FF3B3B] font-medium truncate mt-0.5">
                      Kidnapping Case FIR #4321
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#8FA8C0] mt-2 pt-1.5 border-t border-[#14263B]">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#0E7FE0] shrink-0" />
                    <span className="truncate">GNLU Main Gate, Gandhinagar</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-[#8FA8C0]" />
                    <span>14:45 IST (3m ago)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => setSelectedDossierPlate('GJ01AB1234')}
                    className="py-1 rounded bg-[#0E7FE0] hover:bg-[#0E7FE0]/85 text-white text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Dossier</span>
                  </button>
                  <button
                    onClick={() => handleDispatch('GJ01AB1234', 'GNLU Main Gate, Gandhinagar')}
                    className="py-1 rounded bg-[#240A10] hover:bg-[#380E18] text-[#FF3B3B] border border-[#FF3B3B]/60 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Siren className="w-3 h-3" />
                    <span>Dispatch</span>
                  </button>
                </div>
              </div>

              {/* Card 2: HIGH */}
              <div className="bg-[#0B131F] border border-[#FFB800]/50 rounded-lg p-2.5 shadow relative overflow-hidden">
                <div className="flex items-start gap-2.5">
                  <img
                    src="./images/hit_fortuner_clean.jpg"
                    alt="Fortuner"
                    className="w-16 h-12 rounded object-cover border border-[#1C2E42] shrink-0"
                  />
                  <div className="flex-1 min-w-0 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs tracking-wider">UP32PQ6677</span>
                      <span className="text-[10px] font-bold text-[#FFB800] px-1.5 py-0.2 rounded border border-[#FFB800] bg-[#FFB800]/10 uppercase">
                        HIGH
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8FA8C0] truncate mt-0.5">
                      Toyota Fortuner (Black)
                    </div>
                    <div className="text-[10px] text-[#FFB800] font-medium truncate mt-0.5">
                      Active Interpol Red Notice
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#8FA8C0] mt-2 pt-1.5 border-t border-[#14263B]">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#0E7FE0] shrink-0" />
                    <span className="truncate">GIFT City Road, Gandhinagar</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-[#8FA8C0]" />
                    <span>14:15 IST (33m ago)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => setSelectedDossierPlate('UP32PQ6677')}
                    className="py-1 rounded bg-[#0E7FE0] hover:bg-[#0E7FE0]/85 text-white text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Dossier</span>
                  </button>
                  <button
                    onClick={() => handleDispatch('UP32PQ6677', 'GIFT City Road, Gandhinagar')}
                    className="py-1 rounded bg-[#240A10] hover:bg-[#380E18] text-[#FF3B3B] border border-[#FF3B3B]/60 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Siren className="w-3 h-3" />
                    <span>Dispatch</span>
                  </button>
                </div>
              </div>

              {/* Card 3: MEDIUM */}
              <div className="bg-[#0B131F] border border-[#E5A800]/50 rounded-lg p-2.5 shadow relative overflow-hidden">
                <div className="flex items-start gap-2.5">
                  <img
                    src="./images/hit_swift_clean.jpg"
                    alt="Swift"
                    className="w-16 h-12 rounded object-cover border border-[#1C2E42] shrink-0"
                  />
                  <div className="flex-1 min-w-0 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs tracking-wider">DL10XY9090</span>
                      <span className="text-[10px] font-bold text-[#E5A800] px-1.5 py-0.2 rounded border border-[#E5A800] bg-[#E5A800]/10 uppercase">
                        MEDIUM
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8FA8C0] truncate mt-0.5">
                      Maruti Suzuki Swift (White)
                    </div>
                    <div className="text-[10px] text-[#E5A800] font-medium truncate mt-0.5">
                      Stolen Vehicle FIR #7789
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#8FA8C0] mt-2 pt-1.5 border-t border-[#14263B]">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#0E7FE0] shrink-0" />
                    <span className="truncate">SG Highway Toll, Gandhinagar</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-[#8FA8C0]" />
                    <span>13:50 IST (58m ago)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => setSelectedDossierPlate('DL10XY9090')}
                    className="py-1 rounded bg-[#0E7FE0] hover:bg-[#0E7FE0]/85 text-white text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Dossier</span>
                  </button>
                  <button
                    onClick={() => handleDispatch('DL10XY9090', 'SG Highway Toll, Gandhinagar')}
                    className="py-1 rounded bg-[#240A10] hover:bg-[#380E18] text-[#FF3B3B] border border-[#FF3B3B]/60 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Siren className="w-3 h-3" />
                    <span>Dispatch</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="mt-3.5 pt-2 border-t border-[#14263B]">
              <button
                onClick={() => navigate('/watchlist')}
                className="w-full py-2.5 rounded-lg border border-[#0E7FE0]/50 hover:bg-[#0E7FE0]/15 text-[#0E7FE0] text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Full Watchlist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. BOTTOM STATUS & SYSTEM STRIP ─── */}
      <div className="mt-4 -mx-6 -mb-6 px-6 py-2 bg-[#070B11] border-t border-[#142030] flex items-center justify-between text-[11px] font-mono text-[#8FA8C0]">
        {/* Left */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-wider">SENTRAX</span>
          <span className="text-[#627D98] text-[11px]">v2.4.0</span>
          <span className="text-[#1C2E42]">|</span>
          <span className="text-[#8FA8C0] text-[11px]">AI-Powered Traffic Intelligence Platform</span>
        </div>

        {/* Center */}
        <div className="flex items-center gap-3 text-[11px]">
          <span>10 Cameras</span>
          <span className="text-[#1C2E42]">|</span>
          <span className="text-[#00C875] font-semibold">8 Live</span>
          <span className="text-[#1C2E42]">|</span>
          <span className="text-white font-semibold">156 Vehicles Today</span>
          <span className="text-[#1C2E42]">|</span>
          <div className="flex items-center gap-1.5 text-[#00C875]">
            <span className="w-2 h-2 rounded-full bg-[#00C875] shadow-[0_0_8px_#00C875] animate-pulse" />
            <span className="font-medium">System Healthy</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#C5D5E6]">
          <span>🇮🇳</span>
          <span>Built for a Safer India</span>
        </div>
      </div>

      {/* Camera Detail Inspection Modal */}
      <CameraDetailModal
        camera={selectedCameraForModal}
        allCameras={cameras as any}
        isOpen={!!selectedCameraForModal}
        onClose={handleCloseCameraModal}
        onSelectCamera={(c) => handleSelectCamera(c as any)}
        latestSighting={selectedCameraForModal ? latestSightingsByCamera[selectedCameraForModal.camera_id] : null}
      />

      {/* Vehicle Tactical Dossier Modal */}
      <VehicleDossierModal
        plate={selectedDossierPlate}
        isOpen={!!selectedDossierPlate}
        onClose={() => setSelectedDossierPlate(null)}
      />
    </div>
  );
};

export default LiveMonitor;
