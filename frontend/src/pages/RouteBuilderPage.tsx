import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Navigation,
  Search,
  Radio,
  MapPin,
  Camera as CameraIcon,
  ArrowRight,
  Route as RouteIcon,
  X,
  ExternalLink,
  Play,
  Layers,
  Shield,
  Clock,
  Car
} from 'lucide-react';
import { useCameras } from '../hooks/useCameras';
import { Camera } from '../types';

interface LocationPoint {
  label: string;
  lat: number;
  lng: number;
  area: string;
}

const CHECKPOINTS: LocationPoint[] = [
  { label: 'Sardar Bridge (Sabarmati)', lat: 23.0152, lng: 72.5794, area: 'Ahmedabad' },
  { label: 'MG Road Junction', lat: 23.0225, lng: 72.5714, area: 'Ahmedabad' },
  { label: 'Vastrapur Lake Gate', lat: 23.0436, lng: 72.5283, area: 'Ahmedabad' },
  { label: 'SG Highway Toll Plaza', lat: 23.0732, lng: 72.5038, area: 'Ahmedabad' },
  { label: 'Sabarmati Riverfront North', lat: 23.0395, lng: 72.5878, area: 'Ahmedabad' },
  { label: 'GIFT City Grand Entry', lat: 23.1573, lng: 72.6787, area: 'Gandhinagar' },
  { label: 'Gandhinagar Sector 15 Gate', lat: 23.2156, lng: 72.6394, area: 'Gandhinagar' },
  { label: 'GNLU Campus Circle', lat: 23.1891, lng: 72.6542, area: 'Gandhinagar' },
  { label: 'Chiloda Highway Junction', lat: 23.2743, lng: 72.6122, area: 'Gandhinagar' },
  { label: 'Kudasan Crossroad', lat: 23.2264, lng: 72.6511, area: 'Gandhinagar' },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distToSegmentKm(
  plat: number, plng: number,
  alat: number, alng: number,
  blat: number, blng: number
): number {
  const d1 = haversineKm(alat, alng, blat, blng);
  if (d1 === 0) return haversineKm(plat, plng, alat, alng);
  const t = Math.max(
    0,
    Math.min(1, ((plat - alat) * (blat - alat) + (plng - alng) * (blng - alng)) / (d1 * d1))
  );
  const projLat = alat + t * (blat - alat);
  const projLng = alng + t * (blng - alng);
  return haversineKm(plat, plng, projLat, projLng);
}

const pointIcon = (label: string, color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="background:${color};color:#fff;font-size:10px;font-family:monospace;font-weight:bold;padding:2px 7px;border-radius:4px;white-space:nowrap;box-shadow:0 0 10px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.4);">${label}</div>`,
    iconSize: [60, 20],
    iconAnchor: [30, 20],
  });

interface ValidCamera extends Camera {
  latitude: number;
  longitude: number;
}

const isValidCamera = (c: Camera): c is ValidCamera =>
  typeof c.latitude === 'number' && typeof c.longitude === 'number';

export const RouteBuilderPage: React.FC = () => {
  const { data: allCameras = [] } = useCameras();
  const [origin, setOrigin] = useState<LocationPoint>(CHECKPOINTS[0]);
  const [destination, setDestination] = useState<LocationPoint>(CHECKPOINTS[5]);
  const [radiusKm, setRadiusKm] = useState<number>(2.0);
  const [selectedCam, setSelectedCam] = useState<Camera | null>(null);

  // Calculate corridor cameras
  const corridorCameras = useMemo(() => {
    if (!origin || !destination) return [];
    const validCams = allCameras.filter(isValidCamera);

    const matched = validCams.filter((c) => {
      const d = distToSegmentKm(c.latitude, c.longitude, origin.lat, origin.lng, destination.lat, destination.lng);
      return d <= radiusKm;
    });

    // Sort by distance from origin
    matched.sort((a, b) => {
      const da = haversineKm(origin.lat, origin.lng, a.latitude, a.longitude);
      const db = haversineKm(origin.lat, origin.lng, b.latitude, b.longitude);
      return da - db;
    });

    return matched;
  }, [allCameras, origin, destination, radiusKm]);

  const totalDistance = useMemo(() => {
    return haversineKm(origin.lat, origin.lng, destination.lat, destination.lng);
  }, [origin, destination]);

  const estDurationMin = Math.round((totalDistance / 45) * 60);


  const routeCoordinates: [number, number][] = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-3">
      {/* Route Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0C121D] border border-[#1A2638] rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 font-mono tracking-tight">
              PATROL ROUTE & SURVEILLANCE CORRIDOR BUILDER
            </h1>
            <p className="text-xs text-slate-400">
              Corridor mapping inspired by TrafficVision · Auto-detects CCTV cameras along transit routes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1 rounded-lg bg-[#070B12] border border-[#1A2638] text-slate-300 flex items-center gap-2">
            <span className="text-slate-500">CORRIDOR DISTANCE:</span>
            <strong className="text-blue-400">{totalDistance.toFixed(1)} km</strong>
          </div>
          <div className="px-3 py-1 rounded-lg bg-[#070B12] border border-[#1A2638] text-slate-300 flex items-center gap-2">
            <span className="text-slate-500">EST. TRANSIT:</span>
            <strong className="text-emerald-400">~{estDurationMin} min</strong>
          </div>
          <div className="px-3 py-1 rounded-lg bg-blue-950/60 border border-blue-600/40 text-blue-300 font-bold flex items-center gap-1.5">
            <CameraIcon className="w-3.5 h-3.5" />
            <span>{corridorCameras.length} CAMERAS DETECTED</span>
          </div>
        </div>
      </div>

      {/* Control Pickers */}
      <div className="bg-[#0C121D] border border-[#1A2638] rounded-xl p-3 flex flex-wrap items-center gap-4 text-xs font-mono">
        {/* Origin */}
        <div className="flex items-center gap-2 min-w-[220px]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-400">ORIGIN:</span>
          <select
            value={origin.label}
            onChange={(e) => {
              const p = CHECKPOINTS.find((c) => c.label === e.target.value);
              if (p) setOrigin(p);
            }}
            className="flex-1 bg-[#070B12] border border-[#1A2638] text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500"
          >
            {CHECKPOINTS.map((c) => (
              <option key={c.label} value={c.label}>
                {c.area} - {c.label}
              </option>
            ))}
          </select>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

        {/* Destination */}
        <div className="flex items-center gap-2 min-w-[220px]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span className="text-slate-400">DESTINATION:</span>
          <select
            value={destination.label}
            onChange={(e) => {
              const p = CHECKPOINTS.find((c) => c.label === e.target.value);
              if (p) setDestination(p);
            }}
            className="flex-1 bg-[#070B12] border border-[#1A2638] text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500"
          >
            {CHECKPOINTS.map((c) => (
              <option key={c.label} value={c.label}>
                {c.area} - {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Radius */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">CORRIDOR RADIUS:</span>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="bg-[#070B12] border border-[#1A2638] text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-blue-500"
          >
            <option value={0.5}>0.5 km (Direct Road)</option>
            <option value={1.0}>1.0 km (Surrounding)</option>
            <option value={2.0}>2.0 km (Tactical Sector)</option>
            <option value={5.0}>5.0 km (Wide Perimeter)</option>
          </select>
        </div>
      </div>

      {/* Main Map + Waypoint Sidebar */}
      <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 rounded-xl border border-[#1A2638] overflow-hidden relative">
          <MapContainer
            center={[23.12, 72.59]}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap contributors &copy; CARTO"
              subdomains="abcd"
              maxZoom={19}
            />

            {/* Polyline Route */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#0E7FE0',
                weight: 4,
                opacity: 0.85,
                dashArray: '10 8',
              }}
            />

            {/* Origin Marker */}
            <Marker position={[origin.lat, origin.lng]} icon={pointIcon('ORIGIN', '#10B981')}>
              <Popup>
                <div className="font-mono text-xs font-bold text-slate-900">{origin.label}</div>
              </Popup>
            </Marker>

            {/* Destination Marker */}
            <Marker position={[destination.lat, destination.lng]} icon={pointIcon('DESTINATION', '#F59E0B')}>
              <Popup>
                <div className="font-mono text-xs font-bold text-slate-900">{destination.label}</div>
              </Popup>
            </Marker>

            {/* All Cameras with corridor highlight */}
            {allCameras
              .filter(isValidCamera)
              .map((cam) => {
                const isOnCorridor = corridorCameras.some((cc) => cc.camera_id === cam.camera_id);
                return (
                  <CircleMarker
                    key={cam.camera_id}
                    center={[cam.latitude, cam.longitude]}
                    radius={isOnCorridor ? 9 : 4}
                    pathOptions={{
                      fillColor: isOnCorridor ? '#0E7FE0' : '#475569',
                      fillOpacity: isOnCorridor ? 0.95 : 0.4,
                      color: isOnCorridor ? '#FFFFFF' : '#334155',
                      weight: isOnCorridor ? 2 : 1,
                    }}
                    eventHandlers={{ click: () => setSelectedCam(cam) }}
                  >
                    <Popup>
                      <div className="font-mono text-xs space-y-1">
                        <div className="font-bold text-blue-600">{cam.camera_id}</div>
                        <div className="text-slate-800">{cam.name}</div>
                        <div className="text-slate-500 text-[10px]">{cam.location_name}</div>
                        {isOnCorridor && (
                          <div className="text-emerald-600 font-bold text-[10px]">ON CORRIDOR</div>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

          </MapContainer>
        </div>

        {/* Corridor Cameras Waypoint List */}
        <div className="w-80 bg-[#0C121D] border border-[#1A2638] rounded-xl flex flex-col shrink-0 overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-[#1A2638] flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
              <RouteIcon className="w-4 h-4 text-blue-400" />
              <span>CORRIDOR NODES ({corridorCameras.length})</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">ORDERED</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {corridorCameras.length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-mono text-xs">
                No cameras within {radiusKm} km radius. Increase radius above to expand coverage.
              </div>
            ) : (
              corridorCameras.map((cam, idx) => {
                const distFromStart = haversineKm(origin.lat, origin.lng, cam.latitude, cam.longitude);
                const isSelected = selectedCam?.camera_id === cam.camera_id;

                return (
                  <div
                    key={cam.camera_id}
                    onClick={() => setSelectedCam(cam)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-950/50 border-blue-500/80 shadow-md'
                        : 'bg-[#070B12] border-[#1A2638] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 font-mono text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-100">
                          {cam.camera_id}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          cam.status === 'online'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {cam.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium mt-1 truncate">{cam.name}</div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5 pt-1.5 border-t border-[#141E2D]">
                      <span>+{distFromStart.toFixed(1)} km from start</span>
                      <span className="text-blue-400 font-bold">{cam.congestion || 'NORMAL'}</span>
                    </div>

                    {/* Preview video if selected */}
                    {isSelected && cam.hls_url && (
                      <div className="mt-2 rounded overflow-hidden border border-blue-500/40 bg-black">
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-28 object-cover"
                        >
                          <source src={cam.hls_url} type="video/mp4" />
                        </video>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
