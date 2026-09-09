import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Shield, Radio, Cctv, Eye, Archive, MapPin, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAlertStream } from '../context/WebSocketContext';
import { PageHeader } from '../components/common/PageHeader';
import { MetricStrip, MetricItem } from '../components/common/MetricStrip';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataTable, Column } from '../components/common/DataTable';

// Custom Map Marker pin
const cameraIcon = L.divIcon({
  className: 'custom-cam-pin',
  html: `<div style="background-color: #2563EB; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 0 6px rgba(37,99,235,0.8);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export const Overview: React.FC = () => {
  const { isConnected, recentAlerts } = useAlertStream();
  const [stats, setStats] = useState({
    totalCameras: 0,
    onlineCameras: 0,
    watchlistTargets: 0,
    activeStreams: 0,
    totalSightings: 0,
    evidenceItems: 0,
  });
  const [cameras, setCameras] = useState<any[]>([]);
  const [recentSightings, setRecentSightings] = useState<any[]>([]);
  const [dbAlerts, setDbAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [camsRes, watchRes, sightRes, alertRes, streamRes, evidRes] = await Promise.all([
          api.get('/cameras'),
          api.get('/watchlist'),
          api.get('/sightings?limit=8'),
          api.get('/alerts'),
          api.get('/video-sources').catch(() => ({ data: [] })),
          api.get('/evidence?limit=1'),
        ]);

        const allCams = camsRes.data || [];
        const onlineCount = allCams.filter((c: any) => c.status === 'ONLINE').length;
        const activeStreamsCount = (streamRes.data || []).filter((s: any) => s.status === 'RUNNING').length;

        setCameras(allCams);
        setRecentSightings(sightRes.data || []);
        setDbAlerts((alertRes.data || []).slice(0, 6));

        setStats({
          totalCameras: allCams.length,
          onlineCameras: onlineCount,
          watchlistTargets: (watchRes.data || []).length,
          activeStreams: activeStreamsCount,
          totalSightings: sightRes.data?.length || 0,
          evidenceItems: evidRes.data?.length || 0,
        });
      } catch (err) {
        console.error('Failed to load command center data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const metrics: MetricItem[] = [
    {
      label: 'Cameras Online',
      value: `${stats.onlineCameras} / ${stats.totalCameras}`,
      sublabel: stats.totalCameras > 0 ? `${Math.round((stats.onlineCameras / stats.totalCameras) * 100)}% active` : '0 registered',
      status: stats.onlineCameras > 0 ? 'operational' : 'warning',
    },
    {
      label: 'Active Ingestion Feeds',
      value: stats.activeStreams,
      sublabel: 'RTSP & HTTP streams',
      status: stats.activeStreams > 0 ? 'operational' : 'neutral',
    },
    {
      label: 'Watchlist Targets',
      value: stats.watchlistTargets,
      sublabel: 'Active hotlist plates',
      status: stats.watchlistTargets > 0 ? 'warning' : 'neutral',
    },
    {
      label: 'Intercept Alerts',
      value: dbAlerts.length + recentAlerts.length,
      sublabel: 'Realtime & logged',
      status: (dbAlerts.length + recentAlerts.length) > 0 ? 'critical' : 'neutral',
    },
    {
      label: 'Platform Core',
      value: isConnected ? 'HEALTHY' : 'DEGRADED',
      sublabel: 'PostgreSQL + PostGIS',
      status: isConnected ? 'operational' : 'critical',
    },
  ];

  const sightingColumns: Column<any>[] = [
    {
      header: 'Plate Number',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-100 bg-[#161F30] px-2 py-0.5 rounded border border-[#1F293D]">
          {row.plate_number}
        </span>
      ),
    },
    {
      header: 'Vehicle Type',
      accessor: (row) => (
        <span className="capitalize text-slate-300">
          {row.vehicle_type || 'Unknown'} {row.vehicle_color ? `(${row.vehicle_color})` : ''}
        </span>
      ),
    },
    {
      header: 'Camera Node',
      accessor: (row) => <span className="font-mono text-slate-300">{row.camera_id}</span>,
    },
    {
      header: 'Timestamp',
      accessor: (row) => (
        <span className="font-mono text-slate-400 text-[11px]">
          {new Date(row.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Confidence',
      accessor: (row) => (
        <span className="font-mono text-slate-300">
          {row.confidence ? `${(row.confidence * 100).toFixed(1)}%` : 'Verified'}
        </span>
      ),
    },
    {
      header: 'Watchlist Hit',
      accessor: (row) =>
        row.is_watchlist_hit ? (
          <StatusBadge status="critical" label="HOTLIST MATCH" size="sm" />
        ) : (
          <StatusBadge status="operational" label="CLEARED" size="sm" />
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="State Surveillance Command Center"
        category="OPERATIONS / REAL-TIME MONITORING"
        description="Unified live intelligence grid connecting district CCTV streams, automatic number plate recognition (ANPR), and digital evidence capture."
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/sources"
              className="px-3 py-1.5 rounded-sm-panel bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
            >
              Add Video Feed
            </Link>
            <Link
              to="/search"
              className="px-3 py-1.5 rounded-sm-panel bg-[#161F30] hover:bg-[#1F293D] border border-[#1F293D] text-slate-200 text-xs font-medium transition"
            >
              Vehicle Search
            </Link>
          </div>
        }
      />

      {/* Operational Metric Strip */}
      <MetricStrip metrics={metrics} />

      {/* Center Grid: GIS Intelligence Map (Dominant Left) & Critical Alerts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: GIS Map Panel */}
        <div className="lg:col-span-2 border border-[#1F293D] rounded-lg bg-[#111827] flex flex-col h-[400px]">
          <div className="px-4 py-2.5 border-b border-[#1F293D] bg-[#161F30] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-200 font-semibold">
                Surveillance Grid Topology
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>ACTIVE NODES: {cameras.length}</span>
              <Link to="/map" className="text-blue-400 hover:underline flex items-center gap-1">
                FULL MAP <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div className="flex-1 relative z-0">
            <MapContainer
              center={[23.1, 72.6]}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              {cameras.map((c) => (
                <Marker key={c.camera_id} position={[c.latitude, c.longitude]} icon={cameraIcon}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-slate-100">{c.name}</div>
                      <div className="font-mono text-slate-300 text-[10px]">{c.camera_id}</div>
                      <div className="text-slate-400 text-[10px]">{c.address}</div>
                      <div className="mt-1">
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Right: Critical Alerts Operations Panel */}
        <div className="border border-[#1F293D] rounded-lg bg-[#111827] flex flex-col h-[400px]">
          <div className="px-4 py-2.5 border-b border-[#1F293D] bg-[#161F30] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-200 font-semibold">
                Critical Intercept Alerts
              </span>
            </div>
            <Link to="/alerts" className="text-[11px] font-mono text-blue-400 hover:underline">
              VIEW ALL ({dbAlerts.length + recentAlerts.length})
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {recentAlerts.length === 0 && dbAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <Shield className="w-8 h-8 mb-2 text-slate-600" />
                <span className="text-xs font-mono font-semibold text-slate-400">NO ACTIVE ALERTS</span>
                <p className="text-[11px] mt-1 text-slate-500">
                  Surveillance grid clear. Live plate detections are continually scanned against the state watchlist.
                </p>
              </div>
            ) : (
              <>
                {/* Real-time WS Alerts */}
                {recentAlerts.map((a, idx) => (
                  <div
                    key={`live-${idx}`}
                    className="p-2.5 rounded border border-red-800/60 bg-red-950/20 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-red-400">{a.plate_number}</span>
                      <StatusBadge status="critical" label="LIVE INTERCEPT" size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-300">{a.reason || 'Watchlist Hit'}</div>
                    <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                      <span>CAM: {a.camera_id}</span>
                      <span>{new Date(a.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}

                {/* Logged DB Alerts */}
                {dbAlerts.map((a) => (
                  <div
                    key={`db-${a.id}`}
                    className="p-2.5 rounded border border-[#1F293D] bg-[#161F30]/60 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-200">{a.plate_number}</span>
                      <StatusBadge status={a.severity || 'high'} size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{a.notes || 'Automated watchlist hit'}</div>
                    <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                      <span>CAM: {a.camera_id}</span>
                      <span>{new Date(a.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Recent Vehicle Sightings Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Recent Vehicle Sightings &amp; Ingestion Log
          </div>
          <Link to="/search" className="text-xs text-blue-400 hover:underline font-mono">
            SEARCH REPOSITORY &rarr;
          </Link>
        </div>
        <DataTable
          columns={sightingColumns}
          data={recentSightings}
          keyField="id"
          loading={loading}
          emptyMessage="No vehicle sightings captured yet. Process a CCTV/MP4 stream or RTSP feed to log optical detections."
        />
      </div>
    </div>
  );
};
