import React, { useState, useEffect } from 'react';
import { Cctv, Plus, Radio, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { EmptyState } from '../components/EmptyState';

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

export const CameraNetwork: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    camera_id: '',
    name: '',
    department: 'Ahmedabad City Police',
    latitude: 23.030357,
    longitude: 72.517845,
    address: '',
    vendor: 'Hikvision',
    vms_type: 'Milestone',
    source_type: 'RTSP',
    stream_url: '',
    status: 'ONLINE',
  });

  const loadCameras = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cameras');
      setCameras(res.data || []);
    } catch (err) {
      console.error('Failed to load cameras', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCameras();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cameras', form);
      setShowModal(false);
      setForm({
        camera_id: '',
        name: '',
        department: 'Ahmedabad City Police',
        latitude: 23.030357,
        longitude: 72.517845,
        address: '',
        vendor: 'Hikvision',
        vms_type: 'Milestone',
        source_type: 'RTSP',
        stream_url: '',
        status: 'ONLINE',
      });
      loadCameras();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to register camera');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Camera Registry &amp; Network</h2>
          <p className="text-xs text-slate-400 mt-1">
            Registered Gujarat State CCTV nodes, RTSP/MP4 streams &amp; telemetry status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadCameras}
            className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" /> Register Camera Node
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-400">Querying database...</div>
      ) : cameras.length === 0 ? (
        <EmptyState
          icon={Cctv}
          title="No Cameras Registered"
          description="Register physical RTSP cameras, local MP4 feeds, or uploaded videos to initiate video ingestion."
          actionText="Register First Camera"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#080D1A]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B1222] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Camera ID</th>
                <th className="px-4 py-3">Name &amp; Location</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Coordinates</th>
                <th className="px-4 py-3">Source / Protocol</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {cameras.map((cam) => (
                <tr key={cam.camera_id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3 text-cyan-400 font-bold">{cam.camera_id}</td>
                  <td className="px-4 py-3 font-sans">
                    <div className="font-semibold text-slate-200">{cam.name}</div>
                    <div className="text-[11px] text-slate-400">{cam.address}</div>
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-300">{cam.department}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-400">
                    {cam.latitude.toFixed(4)}, {cam.longitude.toFixed(4)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
                      {cam.source_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cam.status === 'ONLINE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {cam.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-500">
                    {cam.last_seen ? new Date(cam.last_seen).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Register Camera Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg bg-[#0A0F1E] border border-slate-700 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Register New Surveillance Camera</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Camera ID *</label>
                  <input
                    required
                    value={form.camera_id}
                    onChange={(e) => setForm({ ...form, camera_id: e.target.value })}
                    placeholder="e.g. GJ-AHM-SG-01"
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Camera Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. SG Highway Junction 04"
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Physical Address *</label>
                <input
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. Pakwan Cross Road, Bodakdev, Ahmedabad"
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Source Type</label>
                  <select
                    value={form.source_type}
                    onChange={(e) => setForm({ ...form, source_type: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    <option value="RTSP">RTSP Live Stream</option>
                    <option value="MP4_LOCAL">Local MP4 File</option>
                    <option value="MP4_UPLOAD">Uploaded MP4 Clip</option>
                    <option value="HTTP_STREAM">HTTP / HLS Stream</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Stream URL / File Path *</label>
                <input
                  required
                  value={form.stream_url}
                  onChange={(e) => setForm({ ...form, stream_url: e.target.value })}
                  placeholder="rtsp://10.20.1.50:554/ch0 or /app/data/videos/junction1.mp4"
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Register Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
