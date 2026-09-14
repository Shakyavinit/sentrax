import React, { useState } from 'react';
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
import { Plus, Camera as CameraIcon, Radio, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const CameraRegistry: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedCam, setSelectedCam] = useState<Camera | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [testingCamId, setTestingCamId] = useState<string | null>(null);

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

  const handleTestConnection = async (cam: Camera) => {
    setTestingCamId(cam.id);
    try {
      const res = await camerasApi.testStream(cam.id);
      if (res.reachable) {
        toast.success(`[${cam.camera_id}] Connection OK — Ping ${res.latency_ms}ms`);
      } else {
        toast.error(`[${cam.camera_id}] Stream Unreachable: ${res.detail}`);
      }
    } catch {
      toast.error('Stream probe failed');
    } finally {
      setTestingCamId(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      camera_id: cameraId.trim().toUpperCase(),
      name,
      location_name: locationName,
      rtsp_url: rtspUrl,
      hls_url: hlsUrl || undefined,
      protocol,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      status: 'online',
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Surveillance Camera Network Registry"
        description="Configure, test, and geolocate CCTV video feeds across urban sectors."
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Enroll New Camera Feed
          </Button>
        }
      />

      {/* Side-by-side: Left Table (60%) + Right Map (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[620px]">
        {/* Camera List Table (60%) */}
        <div className="lg:col-span-7 bg-[#0D1520] border border-[#1C2E42] rounded-[6px] overflow-hidden flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
          <div className="px-4 py-3 border-b border-[#1C2E42] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              Enrolled Camera Grid ({cameras.length})
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121E2E] text-[#8FA8C0] text-[11px] font-mono border-b border-[#1C2E42] uppercase">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Node ID</th>
                  <th className="py-2.5 px-3 font-medium">Camera Name</th>
                  <th className="py-2.5 px-3 font-medium">Congestion</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium">Activity</th>
                  <th className="py-2.5 px-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2E42]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#8FA8C0]">
                      Scanning camera network nodes...
                    </td>
                  </tr>
                ) : (
                  cameras.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCam(c)}
                      className={`hover:bg-[#121E2E] cursor-pointer transition-colors ${
                        selectedCam?.id === c.id ? 'bg-[#1F3050]/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-[#E8EFF7]">
                        {c.camera_id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white truncate max-w-[160px]">{c.name}</div>
                        <div className="text-[10px] text-[#8FA8C0] truncate max-w-[160px]">{c.location_name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          c.congestion === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          c.congestion === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {c.congestion || 'LOW'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <StatusDot status={c.status} showLabel />
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-[#0E7FE0]">
                        {c.recent_sightings_count || 0} scans
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Camera Map (40%) */}
        <div className="lg:col-span-5 bg-[#0D1520] border border-[#1C2E42] rounded-[6px] overflow-hidden flex flex-col h-[650px]">
          <div className="p-3 border-b border-[#1C2E42] flex items-center justify-between text-xs bg-[#0A101A]">
            <span className="font-mono text-[#8FA8C0]">GRID GEOLOCATION TOPOLOGY</span>
            <span className="font-mono text-[#00C875]">ACTIVE NODES</span>
          </div>

          <div className="flex-1 w-full h-full relative">
            <CameraMap
              cameras={cameras}
              selectedCameraId={selectedCam?.id}
              onCameraSelect={(cam) => setSelectedCam(cam)}
            />
          </div>
        </div>
      </div>

      {/* Add Camera Modal */}
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
              placeholder="e.g. CAM11"
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
            label="Location Name"
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
