import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/client';
import { Cctv, MapPin } from 'lucide-react';

// Custom marker pin
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface CameraNode {
  camera_id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
}

export const GisMap: React.FC = () => {
  const [cameras, setCameras] = useState<CameraNode[]>([]);
  const [loading, setLoading] = useState(true);

  // Gujarat / Ahmedabad default coordinates
  const centerLat = 23.0225;
  const centerLng = 72.5714;

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
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">GIS Geo-Spatial Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic positioning of CCTV surveillance nodes and planned vehicle route tracking.
          </p>
        </div>
        <div className="text-xs font-mono text-cyan-400">
          Mapped Nodes: {cameras.length}
        </div>
      </div>

      <div className="flex-1 rounded-lg overflow-hidden border border-slate-800 bg-[#080D1A] relative z-0">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={12}
          style={{ height: '100%', width: '100%', background: '#090E1A' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {cameras.map((c) => (
            <Marker
              key={c.camera_id}
              position={[c.latitude, c.longitude]}
              icon={defaultIcon}
            >
              <Popup>
                <div className="text-xs text-slate-900 font-sans p-1">
                  <div className="font-bold text-cyan-800">{c.camera_id}</div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-slate-600 text-[11px]">{c.address}</div>
                  <div className="mt-1 text-[10px] font-mono font-semibold uppercase">
                    Status: {c.status}
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
