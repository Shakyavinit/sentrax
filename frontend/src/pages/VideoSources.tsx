import React, { useState, useEffect } from 'react';
import { Play, Square, Video, HardDrive, Plus, RefreshCw, AlertCircle, Database } from 'lucide-react';
import api from '../api/client';
import { EmptyState } from '../components/EmptyState';

interface VideoSource {
  id: number;
  name: string;
  camera_id: string;
  source_type: 'LOCAL_MP4' | 'REMOTE_URL' | 'RTSP';
  url: string;
  status: 'STOPPED' | 'RUNNING' | 'ERROR' | 'COMPLETED';
  target_fps: number;
  current_fps: number;
  frames_processed: number;
  last_error?: string;
  created_at: string;
}

export const VideoSources: React.FC = () => {
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ temp_mb: 0, evid_mb: 0 });
  const [form, setForm] = useState({
    name: '',
    camera_id: '',
    source_type: 'REMOTE_URL',
    url: '',
    target_fps: 5.0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [srcRes, camRes] = await Promise.all([
        api.get('/video-sources'),
        api.get('/cameras'),
      ]);
      setSources(srcRes.data || []);
      setCameras(camRes.data || []);
      if (camRes.data?.length > 0 && !form.camera_id) {
        setForm((prev) => ({ ...prev, camera_id: camRes.data[0].camera_id }));
      }
    } catch (err) {
      console.error('Failed to load video sources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/video-sources');
        setSources(res.data || []);
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/video-sources', form);
      setShowModal(false);
      setForm({
        name: '',
        camera_id: cameras[0]?.camera_id || '',
        source_type: 'REMOTE_URL',
        url: '',
        target_fps: 5.0,
      });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create video source');
    }
  };

  const handleStart = async (id: number) => {
    try {
      await api.post(`/video-sources/${id}/start`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to start stream');
    }
  };

  const handleStop = async (id: number) => {
    try {
      await api.post(`/video-sources/${id}/stop`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to stop stream');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Video Source Stream Control</h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero-download incremental streaming with automatic 500 MB temp buffer management &amp; 1000 MB evidence cap.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow"
          >
            <Plus className="w-4 h-4" /> Add Video Feed
          </button>
        </div>
      </div>

      {/* Storage Limit Telemetry Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-[#080D1A] border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-300">Temporary In-Memory &amp; Buffer Limit</div>
              <div className="text-[11px] text-slate-500 font-mono">
                Auto-pruned FIFO at 500 MB quota
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-cyan-400">&lt; 500 MB</span>
            <div className="text-[10px] text-emerald-400 font-mono">ACTIVE FIFO</div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#080D1A] border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-300">Forensic Evidence Vault Limit</div>
              <div className="text-[11px] text-slate-500 font-mono">
                Hard cap: 1,000 MB • Active evidence never deleted
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-400">1,000 MB CAP</span>
            <div className="text-[10px] text-amber-400 font-mono">PROTECTED</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-400">Loading streaming feeds...</div>
      ) : sources.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No Video Sources Configured"
          description="Register a remote HTTP/HTTPS MP4 URL, local video, or RTSP stream. Video frames will stream incrementally without saving the entire video locally."
          actionText="Add Video Source"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#080D1A]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B1222] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Source Name</th>
                <th className="px-4 py-3">Camera Node</th>
                <th className="px-4 py-3">Source Type</th>
                <th className="px-4 py-3">Target URL / Stream</th>
                <th className="px-4 py-3">Processed Frames</th>
                <th className="px-4 py-3">Sampling Rate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3 font-sans font-semibold text-slate-100">{src.name}</td>
                  <td className="px-4 py-3 text-cyan-400">{src.camera_id}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px]">
                      {src.source_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-slate-400" title={src.url}>
                    {src.url}
                  </td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">{src.frames_processed}</td>
                  <td className="px-4 py-3 text-slate-400">{src.target_fps} FPS (max 720p)</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        src.status === 'RUNNING'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                          : src.status === 'ERROR'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {src.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    {src.status === 'RUNNING' ? (
                      <button
                        onClick={() => handleStop(src.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-600/20 border border-red-600/40 text-red-300 hover:bg-red-600/30 text-[11px]"
                      >
                        <Square className="w-3 h-3 fill-current" /> Stop
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStart(src.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600/20 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-600/30 text-[11px]"
                      >
                        <Play className="w-3 h-3 fill-current" /> Stream
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Video Source Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-lg bg-[#0A0F1E] border border-slate-700 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Add Incremental Video Ingestion Feed</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Source Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ring Road Junction Inflow"
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Associated Camera Node *</label>
                  <select
                    required
                    value={form.camera_id}
                    onChange={(e) => setForm({ ...form, camera_id: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono"
                  >
                    {cameras.length === 0 ? (
                      <option value="">No cameras registered</option>
                    ) : (
                      cameras.map((c) => (
                        <option key={c.camera_id} value={c.camera_id}>
                          {c.camera_id} ({c.name})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Source Type *</label>
                  <select
                    value={form.source_type}
                    onChange={(e) => setForm({ ...form, source_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    <option value="REMOTE_URL">Remote HTTP/HTTPS MP4 URL</option>
                    <option value="RTSP">RTSP Stream</option>
                    <option value="LOCAL_MP4">Local MP4 File</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Video URL / RTSP URL / Local Path *</label>
                <input
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://domain.com/feed.mp4 or rtsp://10.0.0.1:554/live or /app/data/videos/clip.mp4"
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Sampling Frame Rate (FPS)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="30"
                  value={form.target_fps}
                  onChange={(e) => setForm({ ...form, target_fps: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
                />
                <p className="mt-1 text-[10px] text-slate-500">
                  Default 5 FPS. Frames are automatically resized to max 1280x720. Zero full-file download.
                </p>
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
                  className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow"
                >
                  Create Ingestion Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
