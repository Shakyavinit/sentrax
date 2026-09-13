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
  const color = status === 'online' ? '#00C875' : status === 'warning' ? '#FF8C00' : '#FF3B3B';
  const strokeColor = isSelected ? '#0E7FE0' : '#FFFFFF';
  const scale = isSelected ? 'scale-125' : '';

  return L.divIcon({
    className: 'custom-camera-marker',
    html: `<div style="
      background: #0D1520;
      border: 2px solid ${strokeColor};
      box-shadow: 0 0 10px ${color};
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    " class="${scale}">
      <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
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
        {/* Native Dark Surveillance Tiles (No API Key Required) */}
        <TileLayer
          attribution='&copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
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
                  <div className="text-[11px] text-[#8FA8C0] mb-2">{cam.location_name}</div>
                  <div className="text-[10px] font-mono text-[#0E7FE0]">
                    {cam.recent_sightings_count || 0} scans in past 24h
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
