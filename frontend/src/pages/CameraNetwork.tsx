import React, { useState, useEffect } from 'react';
import { Cctv, Plus, Radio, RefreshCw, MapPin, Search } from 'lucide-react';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';

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
  const [searchTerm, setSearchTerm] = useState('');
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
      alert(err.response?.data?.detail || 'Failed to register camera node');
    }
  };

  const filtered = cameras.filter(
    (c) =>
      c.camera_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Camera>[] = [
    {
      header: 'Camera ID',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-100 bg-[#161F30] px-2 py-0.5 rounded border border-[#1F293D]">
          {row.camera_id}
        </span>
      ),
    },
    {
      header: 'Jurisdiction & Department',
      accessor: (row) => (
        <div>
          <span className="text-slate-200 font-medium block">{row.name}</span>
          <span className="text-slate-400 text-[11px]">{row.department}</span>
        </div>
      ),
    },
    {
      header: 'Location Address',
      accessor: (row) => <span className="text-slate-300 text-xs truncate max-w-xs block">{row.address}</span>,
    },
    {
      header: 'Vendor & VMS',
      accessor: (row) => (
        <span className="font-mono text-slate-400 text-xs">
          {row.vendor} / {row.vms_type}
        </span>
      ),
    },
    {
      header: 'Source Type',
      accessor: (row) => <span className="font-mono text-[11px] text-blue-400">{row.source_type}</span>,
    },
    {
      header: 'Node Status',
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'AI Pipeline Status',
      accessor: () => <StatusBadge status="operational" label="ACTIVE ANPR" size="sm" />,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Surveillance Camera Registry & Hardware Nodes"
        category="OPERATIONS / HARDWARE INFRASTRUCTURE"
        description="Catalog of state-deployed CCTV cameras, optical specifications, junction coordinates, and VMS stream bindings."
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500 w-44"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1.5 rounded-sm-panel bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Node</span>
            </button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        keyField="camera_id"
        loading={loading}
        emptyMessage="No cameras matching search criteria."
      />

      {/* Register Node Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F293D] rounded-lg max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
              <span className="text-xs font-mono font-bold text-slate-100 uppercase">
                REGISTER SURVEILLANCE NODE
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                DISMISS [ESC]
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Camera ID (Node Ref)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="GJ-AHM-SG-04"
                    value={form.camera_id}
                    onChange={(e) => setForm({ ...form, camera_id: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Junction / Node Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="SG Highway Circle"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Location Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="Pakwan Cross Road, SG Highway, Ahmedabad"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-sm-panel bg-[#0B0F17] border border-[#1F293D] text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                  Stream URL / RTSP Binding
                </label>
                <input
                  type="text"
                  required
                  placeholder="rtsp://10.0.0.1:554/live"
                  value={form.stream_url}
                  onChange={(e) => setForm({ ...form, stream_url: e.target.value })}
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
                  Commit Node to PostGIS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
