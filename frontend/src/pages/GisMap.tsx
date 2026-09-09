import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';

const defaultIcon = L.divIcon({
  className: 'gis-pin',
  html: `<div style="background-color: #2563EB; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 0 8px rgba(37,99,235,0.7);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

interface CameraNode {
  camera_id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
  department: string;
}

export const GisMap: React.FC = () => {
  const [cameras, setCameras] = useState<CameraNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCams = async () => {
      try {
        const res = await api.get('/cameras');
        setCameras(res.data || []);
      } catch (err) {
        console.error('Failed to load map cameras', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCams();
  }, []);

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col space-y-3">
      <PageHeader
        title="GIS Geo-Spatial Intelligence & Surveillance Grid"
        category="OPERATIONS / GEO-SPATIAL TOPOLOGY"
        description="State-wide spatial mapping of deployed optical sensors, traffic monitoring points, and district jurisdiction boundaries."
        actions={
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span>TOTAL NODES: <strong className="text-blue-400">{cameras.length}</strong></span>
          </div>
        }
      />

      <div className="flex-1 rounded-lg border border-[#1F293D] overflow-hidden relative z-0">
        <MapContainer
          center={[23.1, 72.6]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {cameras.map((c) => (
            <Marker key={c.camera_id} position={[c.latitude, c.longitude]} icon={defaultIcon}>
              <Popup>
                <div className="text-xs space-y-1 font-sans">
                  <div className="font-bold text-slate-100">{c.name}</div>
                  <div className="font-mono text-slate-400 text-[10px]">{c.camera_id}</div>
                  <div className="text-slate-300 text-[10px]">{c.address}</div>
                  <div className="text-slate-400 text-[9px]">{c.department}</div>
                  <div className="pt-1">
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
