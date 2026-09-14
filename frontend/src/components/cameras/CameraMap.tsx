import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Camera } from '../../types';
import { StatusDot } from '../ui/StatusDot';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants';

interface CameraMapProps {
  cameras: Camera[];
  selectedCameraId?: string;
  onCameraSelect?: (camera: Camera) => void;
  className?: string;
}

const CameraMapController: React.FC<{ cameras: Camera[] }> = ({ cameras }) => {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    const t = setTimeout(handleResize, 150);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  useEffect(() => {
    const valid = cameras.filter((c) => c.latitude && c.longitude).map((c) => [c.latitude, c.longitude] as [number, number]);
    if (valid.length > 0) {
      map.fitBounds(L.latLngBounds(valid), { padding: [40, 40], maxZoom: 14 });
    }
  }, [cameras, map]);

  return null;
};

const createCameraIcon = (status: string, isSelected: boolean) => {
  const color = status === 'online' ? '#0E7FE0' : status === 'warning' ? '#FF8C00' : '#FF3B3B';
  const strokeColor = isSelected ? '#FFFFFF' : '#0D1520';
  const pulse = status === 'offline' ? 'animation: pulse-dot 1.2s infinite;' : '';

  return L.divIcon({
    className: 'custom-camera-marker',
    html: `<div style="
      width: ${isSelected ? '18px' : '14px'};
      height: ${isSelected ? '18px' : '14px'};
      border-radius: 50%;
      background: ${color};
      border: 2px solid ${strokeColor};
      box-shadow: 0 0 0 3px ${status === 'offline' ? 'rgba(255,59,59,0.35)' : 'rgba(14,127,224,0.35)'}, 0 0 14px ${color};
      cursor: pointer;
      ${pulse}
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

export const CameraMap: React.FC<CameraMapProps> = ({
  cameras,
  selectedCameraId,
  onCameraSelect,
  className = 'h-full w-full',
}) => {
  return (
    <div className={`relative rounded-[6px] overflow-hidden border border-[#1C2E42] ${className}`}>
      <MapContainer
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        className="w-full h-full min-h-[300px]"
        scrollWheelZoom={true}
      >
        {/* CartoDB Dark Matter Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        <CameraMapController cameras={cameras} />

        {cameras.map((cam) => {
          if (!cam.latitude || !cam.longitude) return null;
          const isSelected = cam.id === selectedCameraId;

          return (
            <Marker
              key={cam.id}
              position={[cam.latitude, cam.longitude]}
              icon={createCameraIcon(cam.status, isSelected)}
              eventHandlers={{
                click: () => onCameraSelect && onCameraSelect(cam),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px] text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-[#233A52] mb-2">
                    <span className="font-mono font-bold text-[#E8EFF7]">{cam.camera_id}</span>
                    <StatusDot status={cam.status} showLabel />
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">{cam.name}</div>
                  <div className="text-[11px] text-[#8FA8C0] mb-1.5">{cam.location_name}</div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#0E7FE0] mb-1">
                    <span>{cam.recent_sightings_count || 0} scans (24h)</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      cam.congestion === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                      cam.congestion === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {cam.congestion || 'LOW'} TRAFFIC
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
