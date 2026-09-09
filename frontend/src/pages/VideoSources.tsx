import React, { useState, useEffect } from 'react';
import { Play, Square, Video, HardDrive, Plus, RefreshCw, AlertCircle, Database, Radio } from 'lucide-react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';

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
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
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
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async (id: number) => {
    try {
      setActionInProgress(id);
      await api.post(`/video-sources/${id}/start`);
      const res = await api.get('/video-sources');
      setSources(res.data || []);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to start video ingestion stream');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleStop = async (id: number) => {
    try {
      setActionInProgress(id);
      await api.post(`/video-sources/${id}/stop`);
      const res = await api.get('/video-sources');
      setSources(res.data || []);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to stop stream');
    } finally {
      setActionInProgress(null);
    }
  };

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
      alert(err.response?.data?.detail || 'Failed to bind video source');
    }
  };

  const columns: Column<VideoSource>[] = [
    {
      header: 'Stream Source Name',
      accessor: (row) => (
        <div>
          <span className="font-semibold text-slate-100 block">{row.name}</span>
          <span className="text-[10px] font-mono text-slate-400 truncate max-w-xs block">
            {row.url}
          </span>
        </div>
      ),
    },
    {
      header: 'Camera ID',
      accessor: (row) => (
        <span className="font-mono text-xs text-blue-400 font-semibold">
          {row.camera_id}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: (row) => <span className="font-mono text-xs text-slate-300">{row.source_type}</span>,
    },
    {
      header: 'Target / Live FPS',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-200">
          {row.current_fps || 0.0} / {row.target_fps} FPS
        </span>
      ),
    },
    {
      header: 'Frames Processed',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-100 font-bold">
          {row.frames_processed.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Ingestion State',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Stream Actions',
      accessor: (row) => (
        <div>
          {row.status === 'RUNNING' ? (
            <button
              onClick={() => handleStop(row.id)}
              disabled={actionInProgress === row.id}
              className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 text-red-400 font-mono text-[10px] transition flex items-center gap-1"
            >
              <Square className="w-3 h-3" />
              <span>{actionInProgress === row.id ? 'STOPPING...' : 'STOP STREAM'}</span>
            </button>
          ) : (
            <button
              onClick={() => handleStart(row.id)}
              disabled={actionInProgress === row.id}
              className="px-2.5 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-400 font-mono text-[10px] transition flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              <span>{actionInProgress === row.id ? 'STARTING...' : 'START STREAM'}</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Streaming Video Sources & Ingestion Workers"
        category="OPERATIONS / VIDEO INGESTION"
        description="Stream incremental frames directly from remote HTTP/HTTPS MP4 URLs, RTSP camera streams, or local files without storing full container videos locally."
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 rounded-sm-panel bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Bind Video Source</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={sources}
        keyField="id"
        loading={loading}
        emptyMessage="No streaming video sources configured. Bind a remote HTTP MP4 or RTSP stream to initiate incremental ANPR."
      />

      {/* Bind Source Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F293D] rounded-lg max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
              <span className="text-xs font-mono font-bold text-slate-100 uppercase">
                BIND VIDEO INGESTION SOURCE
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                DISMISS [ESC]
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Source Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Gandhinagar Highway Inbound Stream"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Camera ID Node
                  </label>
                  <select
                    value={form.camera_id}
                    onChange={(e) => setForm({ ...form, camera_id: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-200 font-mono"
                  >
                    {cameras.map((c) => (
                      <option key={c.camera_id} value={c.camera_id}>
                        {c.camera_id} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Source Protocol
                  </label>
                  <select
                    value={form.source_type}
                    onChange={(e) => setForm({ ...form, source_type: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-200"
                  >
                    <option value="REMOTE_URL">Remote HTTP / HTTPS MP4 URL</option>
                    <option value="RTSP">Live RTSP Stream</option>
                    <option value="LOCAL_MP4">Local Server MP4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Video URL / RTSP Path
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://commondatastorage.googleapis.com/.../feed.mp4"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Sampling FPS (Default: 5.0 FPS)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1.0"
                  max="30.0"
                  required
                  value={form.target_fps}
                  onChange={(e) => setForm({ ...form, target_fps: parseFloat(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded bg-[#161F30] text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Bind Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
