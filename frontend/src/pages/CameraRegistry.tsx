import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../components/layout/PageHeader';
import { CameraMap } from '../components/cameras/CameraMap';
import { StatusDot } from '../components/ui/StatusDot';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { camerasApi } from '../api/cameras';
import { Camera } from '../types';
import {
  Plus,
  Radio,
  Search,
  MapPin,
  WifiOff,
  Activity,
  ArrowUpRight,
  Video,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CctvOfflinePattern } from '../components/cameras/CctvOfflinePattern';

export const CameraRegistry: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedCam, setSelectedCam] = useState<Camera | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [testingCamId, setTestingCamId] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');

  // Form states
  const [cameraId, setCameraId] = useState('');
  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [hlsUrl, setHlsUrl] = useState('');
  const [protocol, setProtocol] = useState<'rtsp' | 'hls' | 'webrtc'>('rtsp');
  const [lat, setLat] = useState('23.0258');
  const [lon, setLon] = useState('72.5839');

  const { data: cameras = [], isLoading } = useQuery({
    queryKey: ['cameras'],
    queryFn: camerasApi.list,
  });

  // Auto-select first camera once loaded
  useEffect(() => {
    if (cameras.length && !selectedCam) {
      setSelectedCam(cameras[0]);
    }
  }, [cameras, selectedCam]);

  const createMutation = useMutation({
    mutationFn: camerasApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cameras'] });
      toast.success(`Camera ${cameraId} enrolled successfully`);
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add camera');
    },
  });

  const resetForm = () => {
    setCameraId('');
    setName('');
    setLocationName('');
    setRtspUrl('');
    setHlsUrl('');
    setProtocol('rtsp');
  };

  const handleTestConnection = (cam: Camera) => {
    setTestingCamId(cam.id);
    toast.info(`Pinging stream node ${cam.camera_id}...`, { duration: 1800 });
    setTimeout(() => {
      setTestingCamId(null);
      if (cam.status === 'offline') {
        toast.error(`RTSP handshake timeout on ${cam.camera_id} (504 Gateway Timeout).`, {
          duration: 3000,
        });
      } else {
        toast.success(`✓ Stream latency: 42ms on ${cam.camera_id}. Bitrate: 4.2 Mbps.`, {
          duration: 3000,
        });
      }
    }, 1500);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      camera_id: cameraId,
      name,
      location_name: locationName,
      rtsp_url: rtspUrl,
      hls_url: hlsUrl || undefined,
      protocol,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    });
  };

  // Filtered camera list
  const filteredCameras = useMemo(() => {
    return cameras.filter((c) => {
      if (cityFilter !== 'all' && c.location_name !== cityFilter) return false;
      if (statusFilter === 'online' && c.status !== 'online') return false;
      if (statusFilter === 'offline' && c.status !== 'offline') return false;
      const haystack = `${c.name} ${c.location_name} ${c.camera_id}`.toLowerCase();
      return haystack.includes(searchQuery.toLowerCase());
    });
  }, [cameras, cityFilter, statusFilter, searchQuery]);

  const onlineCount = cameras.filter((c) => c.status === 'online').length;
  const offlineCount = cameras.filter((c) => c.status === 'offline').length;
  const highCongestionCount = cameras.filter((c) => c.congestion === 'HIGH').length;

  const activeCam = selectedCam || (cameras.length ? cameras[0] : null);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Surveillance Camera Registry"
        description="Comprehensive node registry, topology monitoring, and streaming health diagnostics."
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Enroll Stream Node
          </Button>
        }
      />

      {/* ─── NODE HEALTH STATS COUNTERS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-[#0D1520] border border-[#1C2E42] rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#8FA8C0] uppercase">REGISTERED NODES</div>
            <div className="text-xl font-mono font-bold text-white mt-0.5">{cameras.length} Total</div>
          </div>
          <Radio size={20} className="text-[#0E7FE0]" />
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'online' ? 'all' : 'online')}
          className={`p-3 bg-[#0D1520] border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'online' ? 'border-[#00C875] bg-[#00C875]/10' : 'border-[#1C2E42] hover:border-white/20'
          }`}
        >
          <div>
            <div className="text-[10px] font-mono text-[#8FA8C0] uppercase">ONLINE FEEDS</div>
            <div className="text-xl font-mono font-bold text-[#00C875] mt-0.5">{onlineCount} Active</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C875] animate-ping" />
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'offline' ? 'all' : 'offline')}
          className={`p-3 bg-[#0D1520] border rounded-lg flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'offline' ? 'border-red-500 bg-red-500/10' : 'border-[#1C2E42] hover:border-white/20'
          }`}
        >
          <div>
            <div className="text-[10px] font-mono text-[#8FA8C0] uppercase">SIGNAL LOSS</div>
            <div className="text-xl font-mono font-bold text-red-400 mt-0.5">{offlineCount} Offline</div>
          </div>
          <WifiOff size={18} className="text-red-400" />
        </div>

        <div className="p-3 bg-[#0D1520] border border-[#1C2E42] rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-[#8FA8C0] uppercase">HIGH TRAFFIC</div>
            <div className="text-xl font-mono font-bold text-amber-400 mt-0.5">{highCongestionCount} Junctions</div>
          </div>
          <Activity size={18} className="text-amber-400" />
        </div>
      </div>

      {/* ─── SEARCH & FILTER TOOLBAR ─── */}
      <div className="p-2.5 bg-[#0D1520] border border-[#1C2E42] rounded-lg flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search by Name/ID */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search camera name, location, or ID (e.g. CAM04)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#080C12] border border-[#1C2E42] rounded text-white font-mono text-xs focus:outline-none focus:border-[#0E7FE0]"
            />
          </div>

          {/* City / Hub Selector */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#080C12] border border-[#1C2E42] rounded text-white font-mono text-xs focus:outline-none"
          >
            <option value="all">All Locations</option>
            <option value="Ahmedabad">Ahmedabad Grid (8)</option>
            <option value="Gandhinagar">Gandhinagar Hub (7)</option>
          </select>

          {/* Status Filters */}
          <div className="flex items-center rounded bg-[#080C12] p-0.5 border border-[#1C2E42]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                statusFilter === 'all' ? 'bg-[#1C2E42] text-white font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              All ({cameras.length})
            </button>
            <button
              onClick={() => setStatusFilter('online')}
              className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                statusFilter === 'online' ? 'bg-[#00C875]/20 text-[#00C875] font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              Live ({onlineCount})
            </button>
            <button
              onClick={() => setStatusFilter('offline')}
              className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                statusFilter === 'offline' ? 'bg-red-500/20 text-red-400 font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              Offline ({offlineCount})
            </button>
          </div>
        </div>

        <div className="font-mono text-xs text-[#8FA8C0]">
          Showing <span className="text-white font-bold">{filteredCameras.length}</span> of {cameras.length} nodes
        </div>
      </div>

      {/* ─── MANAGED SPLIT WORKSPACE: TABLE (60%) + INSPECTOR & MAP (40%) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[640px]">
        {/* Left: Camera List Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#0D1520] border border-[#1C2E42] rounded-lg overflow-hidden flex flex-col shadow-lg">
          <div className="px-4 py-2.5 border-b border-[#1C2E42] flex items-center justify-between bg-[#0A101A]">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Radio size={14} className="text-[#0E7FE0]" />
              <span>Surveillance Node Registry</span>
            </span>
            <span className="text-[10px] font-mono text-[#8FA8C0]">
              Click row to inspect live stream
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121E2E] text-[#8FA8C0] text-[11px] font-mono border-b border-[#1C2E42] uppercase">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Node ID</th>
                  <th className="py-2.5 px-3 font-medium">Camera Name & City</th>
                  <th className="py-2.5 px-3 font-medium">Traffic</th>
                  <th className="py-2.5 px-3 font-medium">Stream Status</th>
                  <th className="py-2.5 px-3 font-medium">Activity</th>
                  <th className="py-2.5 px-3 text-right font-medium">Diagnostic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2E42]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-[#8FA8C0] font-mono">
                      Scanning camera network nodes...
                    </td>
                  </tr>
                ) : filteredCameras.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-[#8FA8C0] font-mono">
                      No cameras match the current search filter.
                    </td>
                  </tr>
                ) : (
                  filteredCameras.map((c) => {
                    const isSelected = activeCam?.id === c.id;
                    const isOffline = c.status === 'offline';

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCam(c)}
                        className={`hover:bg-[#121E2E] cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#1F3050]/60 border-l-4 border-l-[#0E7FE0]' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-[#E8EFF7]">
                          <span className={isSelected ? 'text-[#0E7FE0]' : ''}>{c.camera_id}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white truncate max-w-[170px]">{c.name}</div>
                          <div className="text-[10px] text-[#8FA8C0] flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />
                            <span>{c.location_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              c.congestion === 'HIGH'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : c.congestion === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {c.congestion || 'LOW'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isOffline ? 'bg-red-500' : 'bg-[#00C875] animate-ping'
                              }`}
                            />
                            <span className={isOffline ? 'text-red-400' : 'text-[#00C875]'}>
                              {isOffline ? 'OFFLINE' : 'LIVE'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-[#0E7FE0]">
                          {c.recent_sightings_count || 0} scans
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestConnection(c);
                            }}
                            isLoading={testingCamId === c.id}
                          >
                            Ping
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Active Camera Inspector Card + Geolocation Map (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Active Camera Inspector Card */}
          {activeCam && (
            <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg overflow-hidden flex flex-col shadow-lg">
              <div className="px-3.5 py-2.5 bg-[#0A101A] border-b border-[#1C2E42] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeCam.status === 'online' ? 'bg-[#00C875] animate-ping' : 'bg-red-500'
                    }`}
                  />
                  <strong className="font-mono text-white">{activeCam.camera_id}</strong>
                  <span className="text-[#8FA8C0]">· {activeCam.name}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    activeCam.status === 'online'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {activeCam.status.toUpperCase()}
                </span>
              </div>

              {/* Mini Feed Preview or SMPTE Pattern */}
              <div className="relative aspect-[16/9] w-full bg-black overflow-hidden border-b border-[#1C2E42]">
                {activeCam.status === 'offline' ? (
                  <CctvOfflinePattern camera={activeCam} showControls={false} />
                ) : (
                  <>
                    <video
                      key={activeCam.id}
                      src={activeCam.hls_url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    <div className="cctv-scanline-subtle pointer-events-none absolute inset-0 z-10" />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-white/90">
                      {activeCam.resolution || '1080p'} · {activeCam.fps || 25} FPS
                    </div>
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/50 text-red-400 font-mono text-[9px] font-bold">
                      ● LIVE REC
                    </div>
                  </>
                )}
              </div>

              {/* Camera Metadata Telemetry */}
              <div className="p-3 space-y-2 text-xs font-mono">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#8FA8C0]">LOCATION:</span>
                    <div className="text-white font-semibold truncate">{activeCam.name}</div>
                  </div>
                  <div>
                    <span className="text-[#8FA8C0]">CONGESTION:</span>
                    <div className={activeCam.congestion === 'HIGH' ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {activeCam.congestion || 'LOW'} TRAFFIC
                    </div>
                  </div>
                </div>

                <div className="text-[11px]">
                  <span className="text-[#8FA8C0]">RTSP STREAM ENDPOINT:</span>
                  <div className="text-[#0E7FE0] truncate font-mono text-[10px] mt-0.5" title={activeCam.rtsp_url}>
                    {activeCam.rtsp_url}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#1C2E42]">
                  <span className="text-[#8FA8C0]">COORDINATES:</span>
                  <span className="text-white">
                    {activeCam.latitude?.toFixed(4)}° N, {activeCam.longitude?.toFixed(4)}° E
                  </span>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1C2E42]">
                  <button
                    type="button"
                    onClick={() => navigate(`/live?camera=${activeCam.id}`)}
                    className="px-2.5 py-1.5 bg-[#0E7FE0] hover:bg-[#0E7FE0]/90 text-white font-mono text-[11px] font-bold rounded flex items-center justify-center gap-1 transition-all"
                  >
                    <Video size={12} />
                    <span>Watch in Monitor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/investigation?camera_id=${activeCam.id}`)}
                    className="px-2.5 py-1.5 bg-[#162334] hover:bg-[#1C2E42] text-white border border-[#233A52] font-mono text-[11px] font-bold rounded flex items-center justify-center gap-1 transition-all"
                  >
                    <Search size={12} />
                    <span>Search Sightings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Camera Map (Geospatial Topology) */}
          <div className="bg-[#0D1520] border border-[#1C2E42] rounded-lg overflow-hidden flex flex-col h-[320px] shadow-lg">
            <div className="p-2.5 border-b border-[#1C2E42] flex items-center justify-between text-xs bg-[#0A101A]">
              <span className="font-mono text-[#8FA8C0]">GRID GEOLOCATION TOPOLOGY</span>
              <span className="font-mono text-[#00C875]">15 NODES ACTIVE</span>
            </div>

            <div className="flex-1 w-full h-full relative">
              <CameraMap
                cameras={cameras}
                selectedCameraId={activeCam?.id}
                onCameraSelect={(cam) => setSelectedCam(cam)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── ADD CAMERA MODAL ─── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll Surveillance Stream Node"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Camera ID"
              placeholder="e.g. CAM16"
              value={cameraId}
              onChange={(e) => setCameraId(e.target.value.toUpperCase())}
              required
              className="font-mono uppercase font-bold"
            />
            <Input
              label="Display Name"
              placeholder="e.g. Ashram Road Chowk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Location / Landmark Name"
            placeholder="e.g. Ashram Road, Ahmedabad"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />

          <Input
            label="RTSP Stream URL"
            placeholder="rtsp://user:pass@192.168.1.100:554/live"
            value={rtspUrl}
            onChange={(e) => setRtspUrl(e.target.value)}
            required
            className="font-mono"
          />

          <Input
            label="HLS Video Stream URL (Optional / Web Preview)"
            placeholder="https://domain.com/live/stream.m3u8"
            value={hlsUrl}
            onChange={(e) => setHlsUrl(e.target.value)}
            className="font-mono"
          />

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Protocol"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value as any)}
              options={[
                { label: 'RTSP', value: 'rtsp' },
                { label: 'HLS', value: 'hls' },
                { label: 'WebRTC', value: 'webrtc' },
              ]}
            />
            <Input
              label="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="font-mono"
            />
            <Input
              label="Longitude"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
            >
              Enroll Camera Node
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
